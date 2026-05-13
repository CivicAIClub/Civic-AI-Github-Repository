import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getLessonRecap,
  saveLessonRecap,
  type LessonRecapFields,
  type LessonRecapKey,
} from "../api/appsScriptRecaps";
import type { LessonRecap } from "../types";
import { formatLessonDateLong } from "../lib/dateUtils";

/** Open target — null when the modal is closed. */
export type RecapEditorTarget = {
  key: LessonRecapKey;
  studentName: string;
  /** Optional context shown in the modal header. */
  lessonFocus?: string;
  endTime?: string;
};

type ModalState =
  | { kind: "loading" }
  | { kind: "ready"; existed: boolean; fields: LessonRecapFields }
  | { kind: "saving"; fields: LessonRecapFields }
  | {
      kind: "saved";
      saved: LessonRecap;
      fields: LessonRecapFields;
      mode: "created" | "updated";
    }
  | { kind: "error"; message: string; fields: LessonRecapFields };

const EMPTY_FIELDS: LessonRecapFields = {
  greeting: "",
  todayWe: "",
  homework: "",
  nextClass: "",
};

const STORAGE_PREFIX = "caseB.recapDraft.v1:";

/**
 * Two-step modal for composing or editing a lesson recap. On open:
 *   1. Fetch any existing recap for this lesson key.
 *   2. Pre-fill form from the recap (or from a local-storage draft if
 *      there's a never-saved one — typing then closing the tab won't
 *      lose the work).
 *   3. Save → POST → success state with a "View" button that closes
 *      and a "Done" button that returns the saved recap to the parent.
 *
 * The "Hi {Name}," opener is rendered as a non-editable header inside
 * the greeting field's label so the teacher knows the personalisation
 * is automatic.
 */
export function RecapEditorModal({
  target,
  onClose,
  onSaved,
}: {
  /** When non-null, the modal is open for this lesson recap. */
  target: RecapEditorTarget | null;
  onClose: () => void;
  /**
   * Fires after a successful save with the freshly-stored recap so the
   * parent can refresh its listing without a separate fetch.
   */
  onSaved: (recap: LessonRecap) => void;
}) {
  const [state, setState] = useState<ModalState>({ kind: "loading" });
  const abortRef = useRef<AbortController | null>(null);

  const targetStorageKey = useMemo(() => {
    if (!target) return null;
    return (
      STORAGE_PREFIX +
      `${target.key.studentEmail}|${target.key.lessonDate}|${target.key.startTime}`
    );
  }, [target]);

  const writeDraft = useCallback(
    (fields: LessonRecapFields) => {
      if (!targetStorageKey) return;
      try {
        if (
          !fields.greeting &&
          !fields.todayWe &&
          !fields.homework &&
          !fields.nextClass
        ) {
          window.localStorage.removeItem(targetStorageKey);
          return;
        }
        window.localStorage.setItem(
          targetStorageKey,
          JSON.stringify(fields)
        );
      } catch {
        // localStorage full / disabled — non-fatal, drafts just don't persist.
      }
    },
    [targetStorageKey]
  );

  const readDraft = useCallback((): LessonRecapFields | null => {
    if (!targetStorageKey) return null;
    try {
      const raw = window.localStorage.getItem(targetStorageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<LessonRecapFields>;
      return {
        greeting: typeof parsed.greeting === "string" ? parsed.greeting : "",
        todayWe: typeof parsed.todayWe === "string" ? parsed.todayWe : "",
        homework: typeof parsed.homework === "string" ? parsed.homework : "",
        nextClass: typeof parsed.nextClass === "string" ? parsed.nextClass : "",
      };
    } catch {
      return null;
    }
  }, [targetStorageKey]);

  const clearDraft = useCallback(() => {
    if (!targetStorageKey) return;
    try {
      window.localStorage.removeItem(targetStorageKey);
    } catch {
      // ignored
    }
  }, [targetStorageKey]);

  const load = useCallback(
    (key: LessonRecapKey) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState({ kind: "loading" });
      getLessonRecap(key, { signal: ac.signal })
        .then((existing) => {
          const draft = readDraft();
          if (existing) {
            const fields: LessonRecapFields = {
              greeting: existing.greeting,
              todayWe: existing.todayWe,
              homework: existing.homework,
              nextClass: existing.nextClass,
            };
            // If a local draft exists and differs from the saved recap,
            // prefer the draft — it's the teacher's in-progress edit.
            if (
              draft &&
              (draft.greeting !== fields.greeting ||
                draft.todayWe !== fields.todayWe ||
                draft.homework !== fields.homework ||
                draft.nextClass !== fields.nextClass)
            ) {
              setState({ kind: "ready", existed: true, fields: draft });
            } else {
              setState({ kind: "ready", existed: true, fields });
            }
          } else {
            setState({
              kind: "ready",
              existed: false,
              fields: draft ?? EMPTY_FIELDS,
            });
          }
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setState({
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Could not load recap.",
            fields: readDraft() ?? EMPTY_FIELDS,
          });
        });
    },
    [readDraft]
  );

  useEffect(() => {
    if (!target) return;
    load(target.key);
    return () => abortRef.current?.abort();
  }, [target, load]);

  // Esc to close
  useEffect(() => {
    if (!target) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!target) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [target]);

  const updateField = useCallback(
    (field: keyof LessonRecapFields, value: string) => {
      setState((s) => {
        if (s.kind !== "ready" && s.kind !== "error") return s;
        const fields = { ...s.fields, [field]: value };
        writeDraft(fields);
        if (s.kind === "error") {
          return { ...s, fields };
        }
        return { ...s, fields };
      });
    },
    [writeDraft]
  );

  const onSave = useCallback(() => {
    if (!target) return;
    setState((s) => {
      if (s.kind !== "ready" && s.kind !== "error") return s;
      const fields = s.fields;
      saveLessonRecap(target.key, fields)
        .then((saved) => {
          clearDraft();
          const mode: "created" | "updated" =
            s.kind === "ready" && s.existed ? "updated" : "created";
          setState({ kind: "saved", saved, fields, mode });
          onSaved(saved);
        })
        .catch((err: unknown) => {
          setState({
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Could not save recap.",
            fields,
          });
        });
      return { kind: "saving", fields };
    });
  }, [clearDraft, onSaved, target]);

  if (!target) return null;

  const headerSubtitle = `${formatLessonDateLong(target.key.lessonDate)} · ${target.key.startTime}${
    target.endTime ? `–${target.endTime}` : ""
  }${target.lessonFocus ? ` · ${target.lessonFocus}` : ""}`;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recap-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card recap-modal-card">
        <div className="modal-card__header">
          <div>
            <h2 id="recap-modal-title" className="modal-card__title">
              {state.kind === "saved"
                ? "Recap saved"
                : state.kind === "ready" && state.existed
                  ? "Edit recap"
                  : "Write recap"}
            </h2>
            <p className="muted modal-card__subtitle">
              {target.studentName || target.key.studentEmail}
            </p>
            <p className="muted modal-card__subtitle modal-card__subtitle--small">
              {headerSubtitle}
            </p>
          </div>
          <button
            type="button"
            className="button-ghost modal-card__close"
            onClick={onClose}
            aria-label="Close recap editor"
          >
            ✕
          </button>
        </div>

        <ModalBody
          state={state}
          target={target}
          onChange={updateField}
          onClose={onClose}
          onSave={onSave}
          onRetryLoad={() => load(target.key)}
        />
      </div>
    </div>
  );
}

function ModalBody({
  state,
  target,
  onChange,
  onClose,
  onSave,
  onRetryLoad,
}: {
  state: ModalState;
  target: RecapEditorTarget;
  onChange: (field: keyof LessonRecapFields, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onRetryLoad: () => void;
}) {
  if (state.kind === "loading") {
    return (
      <div className="modal-card__body">
        <p className="muted">Loading recap…</p>
      </div>
    );
  }

  if (state.kind === "saved") {
    return (
      <div className="modal-card__body">
        <p
          className="modal-card__notice modal-card__notice--ok"
          role="status"
          aria-live="polite"
        >
          {state.mode === "created"
            ? "Recap saved. The student profile now has it under this lesson."
            : "Recap updated."}
        </p>
        <div className="modal-card__actions">
          <button
            type="button"
            className="button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const fields = state.fields;
  const isSaving = state.kind === "saving";
  const isError = state.kind === "error";

  const greetingName =
    target.studentName.trim().split(/\s+/)[0] || "there";

  return (
    <form
      className="modal-card__body recap-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isSaving) onSave();
      }}
    >
      {isError && (
        <div className="modal-card__error" role="alert">
          <p className="status-error">{state.message}</p>
          <button
            type="button"
            className="button button--ghost"
            onClick={onRetryLoad}
          >
            Reload from server
          </button>
        </div>
      )}

      <label className="recap-editor__field">
        <span className="recap-editor__label">
          Greeting{" "}
          <span className="muted recap-editor__hint">
            (rendered as <em>“Hi {greetingName},”</em> + your text)
          </span>
        </span>
        <textarea
          className="recap-editor__textarea recap-editor__textarea--short"
          rows={2}
          value={fields.greeting}
          onChange={(e) => onChange("greeting", e.target.value)}
          placeholder="excellent lesson, ventured into &ldquo;Meaning of You&rdquo;"
          disabled={isSaving}
        />
      </label>

      <label className="recap-editor__field">
        <span className="recap-editor__label">Today we</span>
        <textarea
          className="recap-editor__textarea"
          rows={6}
          value={fields.todayWe}
          onChange={(e) => onChange("todayWe", e.target.value)}
          placeholder={`Went through Chromatic Exercise #2\nReviewed Exercise 10 P. 16\nStarted "Meaning of You"`}
          disabled={isSaving}
        />
      </label>

      <label className="recap-editor__field">
        <span className="recap-editor__label">HOMEWORK</span>
        <textarea
          className="recap-editor__textarea"
          rows={5}
          value={fields.homework}
          onChange={(e) => onChange("homework", e.target.value)}
          placeholder={`Review Exercise 10 P. 16 (DUE 5/4)\nSubmit a video on "Bye Love"`}
          disabled={isSaving}
        />
      </label>

      <label className="recap-editor__field">
        <span className="recap-editor__label">Next Class</span>
        <textarea
          className="recap-editor__textarea"
          rows={4}
          value={fields.nextClass}
          onChange={(e) => onChange("nextClass", e.target.value)}
          placeholder={`Review P. 16 "Bye Love"\nContinue "Meaning of You"`}
          disabled={isSaving}
        />
      </label>

      <div className="modal-card__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="button" disabled={isSaving}>
          {isSaving
            ? "Saving…"
            : state.kind === "ready" && state.existed
              ? "Save changes"
              : "Save recap"}
        </button>
      </div>
    </form>
  );
}
