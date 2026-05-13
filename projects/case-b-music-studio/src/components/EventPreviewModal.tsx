import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCalendarEvent,
  previewCalendarEvent,
  type EventPreview,
  type LessonRowKey,
} from "../api/appsScriptCalendar";

type ModalState =
  | { kind: "loading" }
  | { kind: "ready"; preview: EventPreview }
  | { kind: "creating"; preview: EventPreview }
  | { kind: "created"; preview: EventPreview; eventLink: string | null; alreadyScheduled: boolean }
  | { kind: "error"; message: string; preview?: EventPreview };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Two-step modal for the Phase 2 calendar workflow:
 *   1. Open with `lessonKey` set → fetches preview from Apps Script.
 *   2. Teacher reviews title, time, attendees, description. Attendees can
 *      be edited inline (add new, remove existing — at least one required).
 *   3. "Create event" → POST `create-event` with the (possibly-edited)
 *      attendee list → invites go out.
 *   4. Success state shows the calendar link + a "Done" button.
 *
 * The modal handles its own loading/error states. The parent only needs
 * to track which lesson is open and call `onCreated` after a successful
 * create so the schedule list can refetch.
 */
export function EventPreviewModal({
  lessonKey,
  onClose,
  onCreated,
}: {
  /** When non-null, the modal is open for this lesson. Null closes it. */
  lessonKey: LessonRowKey | null;
  onClose: () => void;
  /** Fires after a successful create so the parent can refetch the schedule. */
  onCreated: () => void;
}) {
  const [state, setState] = useState<ModalState>({ kind: "loading" });
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendeeError, setAttendeeError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadPreview = useCallback(
    (key: LessonRowKey) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState({ kind: "loading" });
      setAttendeeError(null);
      previewCalendarEvent(key, { signal: ac.signal })
        .then((preview) => {
          setState({ kind: "ready", preview });
          setAttendees(preview.attendees);
          setAttendeeInput("");
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setState({
            kind: "error",
            message:
              err instanceof Error ? err.message : "Could not load preview.",
          });
        });
    },
    []
  );

  useEffect(() => {
    if (!lessonKey) return;
    loadPreview(lessonKey);
    return () => abortRef.current?.abort();
  }, [lessonKey, loadPreview]);

  // Esc to close (any state).
  useEffect(() => {
    if (!lessonKey) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lessonKey, onClose]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!lessonKey) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lessonKey]);

  if (!lessonKey) return null;

  const isEditable = state.kind === "ready";

  const handleAddAttendee = () => {
    const raw = attendeeInput.trim();
    if (!raw) {
      setAttendeeError("Enter an email to add.");
      return;
    }
    // Tolerate pasted lists like "a@x.com, b@y.com; c@z.com\nd@w.com" —
    // teachers will paste from emails / course rosters more often than
    // they type one at a time. Split on common delimiters, then validate
    // each piece independently so one bad address doesn't drop the
    // others.
    const candidates = raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (candidates.length === 0) {
      setAttendeeError("Enter an email to add.");
      return;
    }

    const existingLower = new Set(attendees.map((a) => a.toLowerCase()));
    const additions: string[] = [];
    const invalid: string[] = [];
    const duplicates: string[] = [];
    for (const v of candidates) {
      const lower = v.toLowerCase();
      if (!EMAIL_RE.test(v)) {
        invalid.push(v);
        continue;
      }
      if (existingLower.has(lower) || additions.some((a) => a.toLowerCase() === lower)) {
        duplicates.push(v);
        continue;
      }
      additions.push(v);
    }

    if (additions.length > 0) {
      setAttendees([...attendees, ...additions]);
      setAttendeeInput("");
    }
    if (invalid.length > 0) {
      setAttendeeError(
        invalid.length === 1
          ? `"${invalid[0]}" doesn't look like a valid email.`
          : `These don't look like valid emails: ${invalid.join(", ")}`
      );
    } else if (additions.length === 0 && duplicates.length > 0) {
      setAttendeeError(
        duplicates.length === 1
          ? "That email is already on the list."
          : "Those emails are already on the list."
      );
    } else {
      setAttendeeError(null);
    }
  };

  const handleRemoveAttendee = (email: string) => {
    if (attendees.length <= 1) {
      setAttendeeError("At least one attendee is required.");
      return;
    }
    setAttendees(attendees.filter((a) => a !== email));
    setAttendeeError(null);
  };

  const handleConfirm = () => {
    if (state.kind !== "ready") return;
    if (attendees.length === 0) {
      setAttendeeError("At least one attendee is required.");
      return;
    }
    const preview = state.preview;
    setState({ kind: "creating", preview });

    const ac = new AbortController();
    abortRef.current = ac;

    // Hard cap on how long the modal sits in "Creating event…". Apps
    // Script's web app typically responds in 2-4s, but cold starts and
    // transient Google network blips can stretch to 20s+. Past 30s,
    // surface a "took too long" error so the teacher can retry instead
    // of staring at a spinner. The aborted fetch will reject with
    // AbortError, which the catch below ignores; we set the error
    // state explicitly here.
    const timeoutId = window.setTimeout(() => {
      ac.abort();
      setState({
        kind: "error",
        message:
          "Creating the event took too long. The lesson may or may not have been scheduled. Refresh and check before retrying.",
        preview,
      });
    }, 30 * 1000);

    createCalendarEvent(lessonKey, { attendees }, { signal: ac.signal })
      .then((res) => {
        window.clearTimeout(timeoutId);
        setState({
          kind: "created",
          preview,
          eventLink: res.eventLink,
          alreadyScheduled: res.alreadyScheduled,
        });
        onCreated();
      })
      .catch((err: unknown) => {
        window.clearTimeout(timeoutId);
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Could not create the event. Try again.",
          preview,
        });
      });
  };

  const handleCancelCreating = () => {
    if (state.kind !== "creating") return;
    abortRef.current?.abort();
    setState({ kind: "ready", preview: state.preview });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-preview-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card">
        <div className="modal-card__header">
          <h2 id="event-preview-title" className="modal-card__title">
            {state.kind === "created"
              ? state.alreadyScheduled
                ? "Already scheduled"
                : "Event created"
              : "Preview lesson event"}
          </h2>
          <button
            type="button"
            className="button-ghost"
            onClick={onClose}
            aria-label="Close preview"
          >
            Close
          </button>
        </div>

        {state.kind === "loading" && (
          <p className="muted modal-card__loading">Loading preview…</p>
        )}

        {state.kind === "error" && (
          <div role="alert" className="modal-card__error">
            <p className="empty-state">{state.message}</p>
            <div className="modal-card__actions">
              <button
                type="button"
                className="button-ghost"
                onClick={() => loadPreview(lessonKey)}
              >
                Try again
              </button>
              <button type="button" className="button" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}

        {(state.kind === "ready" ||
          state.kind === "creating" ||
          state.kind === "created") && (
          <PreviewBody
            preview={state.preview}
            attendees={attendees}
            editable={isEditable}
            attendeeInput={attendeeInput}
            attendeeError={attendeeError}
            onAttendeeInputChange={(v) => {
              setAttendeeInput(v);
              if (attendeeError) setAttendeeError(null);
            }}
            onAddAttendee={handleAddAttendee}
            onRemoveAttendee={handleRemoveAttendee}
          />
        )}

        {state.kind === "ready" && state.preview.alreadyScheduled && (
          <p className="modal-card__notice">
            This lesson already has a calendar event. Creating again is a no-op:
            the existing event will be returned.
          </p>
        )}

        {state.kind === "ready" && (
          <div className="modal-card__actions">
            <button type="button" className="button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="button"
              onClick={handleConfirm}
              disabled={attendees.length === 0}
            >
              {state.preview.alreadyScheduled
                ? "Confirm (no duplicate)"
                : "Create event & send invites"}
            </button>
          </div>
        )}

        {state.kind === "creating" && (
          <>
            <p className="muted modal-card__loading">
              Creating event and sending Google Calendar invites…
            </p>
            <div className="modal-card__actions">
              <button
                type="button"
                className="button-ghost"
                onClick={handleCancelCreating}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {state.kind === "created" && (
          <div className="modal-card__success">
            <p>
              {state.alreadyScheduled
                ? "This lesson was already on the calendar. No duplicate created."
                : "Invites have been sent to all attendees."}
            </p>
            {state.eventLink && (
              <p>
                <a
                  href={state.eventLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  Open in Google Calendar ↗
                </a>
              </p>
            )}
            <div className="modal-card__actions">
              <button type="button" className="button" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewBody({
  preview,
  attendees,
  editable,
  attendeeInput,
  attendeeError,
  onAttendeeInputChange,
  onAddAttendee,
  onRemoveAttendee,
}: {
  preview: EventPreview;
  attendees: string[];
  editable: boolean;
  attendeeInput: string;
  attendeeError: string | null;
  onAttendeeInputChange: (v: string) => void;
  onAddAttendee: () => void;
  onRemoveAttendee: (email: string) => void;
}) {
  const start = new Date(preview.startISO);
  const end = new Date(preview.endISO);
  const isSameDay =
    start.toDateString() === end.toDateString();

  const dateLabel = start.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const startLabel = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const endLabel = isSameDay
    ? end.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : end.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

  return (
    <dl className="dl modal-card__body">
      <div>
        <dt>Title</dt>
        <dd className="strong">{preview.title}</dd>
      </div>
      <div>
        <dt>When</dt>
        <dd>
          {dateLabel}
          <br />
          {startLabel} – {endLabel}
        </dd>
      </div>
      <div>
        <dt>Calendar</dt>
        <dd>{preview.calendarName}</dd>
      </div>
      <div>
        <dt>Attendees</dt>
        <dd>
          <AttendeesField
            attendees={attendees}
            editable={editable}
            input={attendeeInput}
            error={attendeeError}
            onInputChange={onAttendeeInputChange}
            onAdd={onAddAttendee}
            onRemove={onRemoveAttendee}
          />
          {editable && (
            <p className="muted attendees-field__hint">
              Pre-filled with the student plus your default invitees. Add or
              remove emails for this lesson only. The defaults stay the same
              next time.
            </p>
          )}
        </dd>
      </div>
      <div>
        <dt>Description</dt>
        <dd>
          <pre className="modal-card__description">{preview.description}</pre>
        </dd>
      </div>
    </dl>
  );
}

function AttendeesField({
  attendees,
  editable,
  input,
  error,
  onInputChange,
  onAdd,
  onRemove,
}: {
  attendees: string[];
  editable: boolean;
  input: string;
  error: string | null;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (email: string) => void;
}) {
  const canRemove = editable && attendees.length > 1;
  return (
    <div className="attendees-field">
      {attendees.length === 0 ? (
        <p className="muted">No attendees yet. Add at least one below.</p>
      ) : (
        <ul className="attendees-field__list">
          {attendees.map((email) => (
            <li key={email} className="attendees-field__chip">
              <span className="attendees-field__email">{email}</span>
              {editable && (
                <button
                  type="button"
                  className="attendees-field__remove"
                  onClick={() => onRemove(email)}
                  aria-label={`Remove ${email}`}
                  title={
                    canRemove
                      ? `Remove ${email}`
                      : "At least one attendee is required"
                  }
                  disabled={!canRemove}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <div className="attendees-field__add">
          <input
            type="email"
            className="attendees-field__input"
            placeholder="Add another email…"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd();
              }
            }}
            aria-label="Add attendee email"
          />
          <button
            type="button"
            className="button-ghost attendees-field__add-btn"
            onClick={onAdd}
            disabled={input.trim() === ""}
          >
            Add
          </button>
        </div>
      )}

      {error && (
        <p className="attendees-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
