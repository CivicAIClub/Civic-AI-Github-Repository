import { useCallback, useEffect, useRef, useState } from "react";
import {
  listStudentFolder,
  type StudentFolder,
  type StudentFolderFile,
} from "../api/appsScriptStudentResources";
import { formatTimestampLong } from "../lib/dateUtils";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | {
      kind: "ready";
      folder: StudentFolder;
      files: StudentFolderFile[];
      justCreated: boolean;
    }
  | { kind: "error"; message: string };

/**
 * Per-student Drive folder section, rendered inside the student
 * profile panel. The very first time the section is opened for a
 * given student the backend lazily creates the folder (granting the
 * student editor access); subsequent opens just refresh the listing.
 *
 * Self-contained — the parent only passes `studentEmail` (and
 * optionally `studentName` for the empty-state copy).
 */
export function StudentResourcesSection({
  studentEmail,
  studentName,
}: {
  studentEmail: string;
  studentName?: string;
}) {
  const [state, setState] = useState<LoadState>({ kind: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(
    (email: string) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState({ kind: "loading" });
      listStudentFolder(email, { signal: ac.signal })
        .then((listing) => {
          setState({
            kind: "ready",
            folder: listing.folder,
            files: listing.files,
            justCreated: listing.folder.created,
          });
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setState({
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Could not load this student's folder.",
          });
        });
    },
    []
  );

  useEffect(() => {
    if (!studentEmail) {
      setState({ kind: "idle" });
      return;
    }
    load(studentEmail);
    return () => abortRef.current?.abort();
  }, [studentEmail, load]);

  return (
    <section
      className="profile-section student-resources-section"
      aria-labelledby="profile-resources-h"
    >
      <div className="student-resources-section__header">
        <h3
          id="profile-resources-h"
          className="profile-section__heading"
        >
          Student Resources
        </h3>
        {state.kind === "ready" && (
          <a
            className="button button--ghost student-resources-section__open"
            href={state.folder.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Drive ↗
          </a>
        )}
      </div>

      <p className="muted student-resources-section__lede">
        A private Drive folder shared with{" "}
        {studentName?.trim() || studentEmail}, you, and Dr. Burns. Drop sheet
        music, recordings, or annotated PDFs here. The student has{" "}
        <strong>editor</strong> access and can upload too. The folder is
        created automatically the first time you open this section (or when
        the student fills out the form).
      </p>

      <Body
        state={state}
        onRefresh={() => studentEmail && load(studentEmail)}
      />
    </section>
  );
}

function Body({
  state,
  onRefresh,
}: {
  state: LoadState;
  onRefresh: () => void;
}) {
  if (state.kind === "idle") return null;

  if (state.kind === "loading") {
    return (
      <p className="muted student-resources-section__status">
        Opening folder…
      </p>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="student-resources-section__error-wrap">
        <p className="status-error" role="alert">
          {state.message}
        </p>
        <button
          type="button"
          className="button button--ghost"
          onClick={onRefresh}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      {state.justCreated && (
        <p
          className="student-resources-section__created"
          role="status"
          aria-live="polite"
        >
          New folder created. Student now has editor access.
        </p>
      )}

      {state.files.length === 0 ? (
        <p className="muted student-resources-section__status">
          Folder is empty. Drop a file in Drive and click{" "}
          <strong>Refresh</strong>.
        </p>
      ) : (
        <ul className="resource-list">
          {state.files.map((file) => (
            <ResourceItem key={file.id} file={file} />
          ))}
        </ul>
      )}

      <div className="student-resources-section__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>
    </>
  );
}

function ResourceItem({ file }: { file: StudentFolderFile }) {
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
