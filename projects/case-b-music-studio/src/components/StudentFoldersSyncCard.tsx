import { useCallback, useState } from "react";
import {
  syncStudentFolders,
  type SyncStudentFoldersReport,
} from "../api/appsScriptStudentResources";

type SyncState =
  | { kind: "idle" }
  | { kind: "syncing" }
  | { kind: "done"; report: SyncStudentFoldersReport }
  | { kind: "error"; message: string };

/**
 * Dashboard admin card for bulk-creating per-student folders. Each
 * folder is also created lazily when its student's profile panel is
 * opened — this card just lets the teacher pre-create them all in one
 * shot before classes start, or re-run after the form gets new
 * submissions.
 *
 * Idempotent — already-existing folders are reported under `existed`
 * and not re-created.
 */
export function StudentFoldersSyncCard() {
  const [state, setState] = useState<SyncState>({ kind: "idle" });

  const onSync = useCallback(() => {
    setState({ kind: "syncing" });
    syncStudentFolders()
      .then((report) => setState({ kind: "done", report }))
      .catch((err: unknown) => {
        setState({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Could not sync student folders.",
        });
      });
  }, []);

  return (
    <section
      className="card span-2 student-folders-sync-card"
      aria-labelledby="student-folders-sync-h"
    >
      <h2 id="student-folders-sync-h" className="card__title">
        Student folders
      </h2>
      <p className="muted profile-updates-intro">
        Each student gets their own Drive folder with{" "}
        <strong>editor</strong> access — auto-created the first time you
        open their profile. Run a bulk sync here to pre-create all of
        them in one click (handy before a new term starts).
      </p>

      <div className="student-folders-sync-card__actions">
        <button
          type="button"
          className="button"
          onClick={onSync}
          disabled={state.kind === "syncing"}
        >
          {state.kind === "syncing"
            ? "Syncing…"
            : "Sync all student folders"}
        </button>
      </div>

      <SyncReportBlock state={state} />
    </section>
  );
}

function SyncReportBlock({ state }: { state: SyncState }) {
  if (state.kind === "idle") return null;

  if (state.kind === "syncing") {
    return (
      <p className="muted student-folders-sync-card__sync-status">
        Creating folders for any student missing one…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <p
        className="status-error student-folders-sync-card__sync-status"
        role="alert"
      >
        {state.message}
      </p>
    );
  }

  const { created, existed, errors } = state.report;
  return (
    <div
      className="class-resources-card__sync-report"
      role="status"
      aria-live="polite"
    >
      <p className="class-resources-card__sync-summary">
        <strong>{created.length}</strong> created ·{" "}
        <strong>{existed.length}</strong> already existed
        {errors.length > 0 && (
          <>
            {" · "}
            <strong className="status-error-inline">{errors.length}</strong>{" "}
            error{errors.length === 1 ? "" : "s"}
          </>
        )}
      </p>

      {created.length > 0 && (
        <details className="class-resources-card__sync-details">
          <summary>Created ({created.length})</summary>
          <ul className="class-resources-card__email-list">
            {created.map((email) => (
              <li key={email}>{email}</li>
            ))}
          </ul>
        </details>
      )}

      {errors.length > 0 && (
        <details
          className="class-resources-card__sync-details"
          open={errors.length <= 3}
        >
          <summary>Errors ({errors.length})</summary>
          <ul className="class-resources-card__email-list">
            {errors.map((err) => (
              <li key={err.email}>
                <code>{err.email}</code> — {err.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
