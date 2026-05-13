import { useCallback, useEffect, useRef, useState } from "react";
import {
  listClassResources,
  syncClassResourcesAccess,
  type ClassResourcesFile,
  type ClassResourcesListing,
  type SyncAccessReport,
} from "../api/appsScriptResources";
import { formatTimestampLong } from "../lib/dateUtils";

type ListState =
  | { kind: "loading" }
  | { kind: "ready"; listing: ClassResourcesListing }
  | { kind: "error"; message: string };

type SyncState =
  | { kind: "idle" }
  | { kind: "syncing" }
  | { kind: "done"; report: SyncAccessReport }
  | { kind: "error"; message: string };

/**
 * Dashboard card for the shared "Class Resources" Drive folder.
 *
 * - Loads on mount via `list-class-resources` and renders folder name +
 *   most-recently-modified children.
 * - "Refresh" re-fetches the listing without touching permissions.
 * - "Sync student access" runs the roster against the folder, granting
 *   viewer access to anyone missing it; the result is rendered inline
 *   so the teacher can see exactly which emails were touched.
 *
 * Self-contained — the parent doesn't have to manage any state for it.
 */
export function ClassResourcesSection() {
  const [listState, setListState] = useState<ListState>({ kind: "loading" });
  const [syncState, setSyncState] = useState<SyncState>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setListState({ kind: "loading" });
    listClassResources({ signal: ac.signal })
      .then((listing) => {
        setListState({ kind: "ready", listing });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setListState({
          kind: "error",
          message:
            err instanceof Error
              ? err.message
              : "Could not load Class Resources.",
        });
      });
  }, []);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  const onSync = useCallback(() => {
    setSyncState({ kind: "syncing" });
    syncClassResourcesAccess()
      .then((report) => {
        setSyncState({ kind: "done", report });
      })
      .catch((err: unknown) => {
        setSyncState({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Could not sync access.",
        });
      });
  }, []);

  return (
    <section
      className="card span-2 class-resources-card"
      aria-labelledby="class-resources-h"
    >
      <div className="class-resources-card__header">
        <div>
          <h2 id="class-resources-h" className="card__title">
            Class Resources
          </h2>
          <p className="muted profile-updates-intro">
            Shared folder visible to every enrolled student. New students get
            viewer access automatically on form submission.
          </p>
        </div>
        {listState.kind === "ready" && (
          <a
            className="button button--ghost class-resources-card__open"
            href={listState.listing.folder.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open “{listState.listing.folder.name}” in Drive ↗
          </a>
        )}
      </div>

      <ListBody state={listState} />

      <div className="class-resources-card__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={load}
          disabled={listState.kind === "loading"}
        >
          {listState.kind === "loading" ? "Refreshing…" : "Refresh"}
        </button>
        <button
          type="button"
          className="button button--ghost"
          onClick={onSync}
          disabled={syncState.kind === "syncing" || listState.kind !== "ready"}
          title="Backfill viewer access for any roster student who's missing it."
        >
          {syncState.kind === "syncing"
            ? "Syncing…"
            : "Re-sync student access"}
        </button>
      </div>

      <SyncReportBlock state={syncState} />
    </section>
  );
}

function ListBody({ state }: { state: ListState }) {
  if (state.kind === "loading") {
    return <p className="muted">Loading folder contents…</p>;
  }

  if (state.kind === "error") {
    return (
      <p className="status-error" role="alert">
        {state.message}
      </p>
    );
  }

  const files = state.listing.files;
  if (files.length === 0) {
    return (
      <p className="muted">
        Folder is empty. Add a file in Drive and click <strong>Refresh</strong>.
      </p>
    );
  }

  return (
    <ul className="resource-list">
      {files.map((file) => (
        <ResourceItem key={file.id} file={file} />
      ))}
    </ul>
  );
}

function ResourceItem({ file }: { file: ClassResourcesFile }) {
  const modified = formatTimestampLong(file.modifiedTime);
  return (
    <li className="resource-list__item">
      <img
        className="resource-list__icon"
        src={file.iconLink}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        loading="lazy"
      />
      <div className="resource-list__main">
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="resource-list__name"
        >
          {file.name}
          {file.isFolder && (
            <span className="resource-list__badge" aria-label="Folder">
              Folder
            </span>
          )}
        </a>
        {modified && (
          <span className="resource-list__meta muted">
            Updated {modified}
          </span>
        )}
      </div>
      <a
        className="button button--ghost resource-list__open"
        href={file.webViewLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Open ↗
      </a>
    </li>
  );
}

function SyncReportBlock({ state }: { state: SyncState }) {
  if (state.kind === "idle") return null;

  if (state.kind === "syncing") {
    return (
      <p className="muted class-resources-card__sync-status">
        Granting viewer access to roster…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <p className="status-error class-resources-card__sync-status" role="alert">
        {state.message}
      </p>
    );
  }

  const { granted, alreadyHadAccess, errors } = state.report;
  return (
    <div
      className="class-resources-card__sync-report"
      role="status"
      aria-live="polite"
    >
      <p className="class-resources-card__sync-summary">
        <strong>{granted.length}</strong> newly granted ·{" "}
        <strong>{alreadyHadAccess.length}</strong> already had access
        {errors.length > 0 && (
          <>
            {" · "}
            <strong className="status-error-inline">{errors.length}</strong>{" "}
            error{errors.length === 1 ? "" : "s"}
          </>
        )}
      </p>

      {granted.length > 0 && (
        <details className="class-resources-card__sync-details">
          <summary>Newly granted ({granted.length})</summary>
          <ul className="class-resources-card__email-list">
            {granted.map((email) => (
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
                <code>{err.email}</code>: {err.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
