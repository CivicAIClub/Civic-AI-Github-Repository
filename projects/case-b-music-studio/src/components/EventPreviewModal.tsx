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

/**
 * Two-step modal for the Phase 2 calendar workflow:
 *   1. Open with `lessonKey` set → fetches preview from Apps Script.
 *   2. Teacher reviews title, time, attendees, description.
 *   3. "Create event" → POST `create-event` → invites go out.
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
  const abortRef = useRef<AbortController | null>(null);

  const loadPreview = useCallback(
    (key: LessonRowKey) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState({ kind: "loading" });
      previewCalendarEvent(key, { signal: ac.signal })
        .then((preview) => {
          setState({ kind: "ready", preview });
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

  const handleConfirm = () => {
    if (state.kind !== "ready") return;
    const preview = state.preview;
    setState({ kind: "creating", preview });

    const ac = new AbortController();
    abortRef.current = ac;

    createCalendarEvent(lessonKey, { signal: ac.signal })
      .then((res) => {
        setState({
          kind: "created",
          preview,
          eventLink: res.eventLink,
          alreadyScheduled: res.alreadyScheduled,
        });
        onCreated();
      })
      .catch((err: unknown) => {
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
          <PreviewBody preview={state.preview} />
        )}

        {state.kind === "ready" && state.preview.alreadyScheduled && (
          <p className="modal-card__notice">
            This lesson already has a calendar event. Creating again is a no-op
            — the existing event will be returned.
          </p>
        )}

        {state.kind === "ready" && (
          <div className="modal-card__actions">
            <button type="button" className="button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="button" onClick={handleConfirm}>
              {state.preview.alreadyScheduled
                ? "Confirm (no duplicate)"
                : "Create event & send invites"}
            </button>
          </div>
        )}

        {state.kind === "creating" && (
          <p className="muted modal-card__loading">
            Creating event and sending Google Calendar invites…
          </p>
        )}

        {state.kind === "created" && (
          <div className="modal-card__success">
            <p>
              {state.alreadyScheduled
                ? "This lesson was already on the calendar — no duplicate created."
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

function PreviewBody({ preview }: { preview: EventPreview }) {
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
          <ul className="modal-card__attendees">
            {preview.attendees.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
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
