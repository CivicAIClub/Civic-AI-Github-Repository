import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listRecaps } from "../api/appsScriptRecaps";
import { LessonRecapBlock } from "../components/LessonRecapBlock";
import type { LessonRecap } from "../types";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; recaps: LessonRecap[] }
  | { kind: "error"; message: string };

/**
 * Standalone "Recaps" tab. Renders every recap in the system, grouped
 * by student, sorted newest first. Read-only — composing happens
 * inside the student profile panel where each recap is naturally
 * tied to one specific past lesson row.
 *
 * Empty state renders a friendly explanation pointing the teacher
 * back to the Students page so they know how to author the first
 * recap.
 */
export function RecapsPage() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [studentFilter, setStudentFilter] = useState<string>("");

  useEffect(() => {
    const ac = new AbortController();
    setState({ kind: "loading" });
    listRecaps({ signal: ac.signal })
      .then((recaps) => {
        setState({ kind: "ready", recaps });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          kind: "error",
          message:
            err instanceof Error ? err.message : "Could not load recaps.",
        });
      });
    return () => ac.abort();
  }, []);

  const groups = useMemo(() => {
    if (state.kind !== "ready") return [];
    const filter = studentFilter.trim().toLowerCase();
    const filtered = filter
      ? state.recaps.filter((r) => {
          const name = r.studentName.toLowerCase();
          const email = r.studentEmail.toLowerCase();
          return name.includes(filter) || email.includes(filter);
        })
      : state.recaps;

    // Group by email; preserve newest-first order within each group
    // since the backend already sorted the array that way.
    const map = new Map<
      string,
      { name: string; email: string; recaps: LessonRecap[] }
    >();
    for (const r of filtered) {
      const key = r.studentEmail.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.recaps.push(r);
      } else {
        map.set(key, {
          name: r.studentName,
          email: r.studentEmail,
          recaps: [r],
        });
      }
    }
    // Sort groups by most-recent recap date desc.
    return Array.from(map.values()).sort((a, b) => {
      const ad = a.recaps[0]?.lessonDate ?? "";
      const bd = b.recaps[0]?.lessonDate ?? "";
      return bd.localeCompare(ad);
    });
  }, [state, studentFilter]);

  return (
    <div className="page recaps-page">
      <header className="page-header">
        <h1>Recaps</h1>
        <p className="page-header__lede">
          Every recap you've saved, grouped by student. Write new ones from
          a student's profile.
        </p>
      </header>

      {state.kind === "loading" && (
        <p className="muted">Loading recaps…</p>
      )}

      {state.kind === "error" && (
        <p className="status-error" role="alert">
          {state.message}
        </p>
      )}

      {state.kind === "ready" && state.recaps.length === 0 && (
        <section className="card">
          <h2 className="card__title">No recaps yet</h2>
          <p className="muted">
            When you save your first recap from a student's profile, the{" "}
            <strong>Lesson Recaps</strong> tab will be auto-created in
            your Google Sheet and the recap will appear here.
          </p>
          <p className="muted">
            <Link to="/students" className="link">
              Go to Students →
            </Link>
          </p>
        </section>
      )}

      {state.kind === "ready" && state.recaps.length > 0 && (
        <>
          <section className="card recaps-page__filter">
            <label className="label" htmlFor="recaps-filter">
              Filter by student
            </label>
            <input
              id="recaps-filter"
              type="search"
              className="input"
              placeholder="Type a name or email…"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              autoComplete="off"
            />
            <p className="muted recaps-page__filter-meta">
              {studentFilter
                ? `${groups.length} student${groups.length === 1 ? "" : "s"} matching`
                : `${groups.length} student${groups.length === 1 ? "" : "s"} · ${state.recaps.length} recap${state.recaps.length === 1 ? "" : "s"} total`}
            </p>
          </section>

          {groups.length === 0 && (
            <p className="muted recaps-page__empty">No matches.</p>
          )}

          <div className="recaps-page__groups">
            {groups.map((group) => (
              <section
                key={group.email}
                className="card recaps-page__group"
                aria-labelledby={`recaps-group-${group.email}`}
              >
                <header className="recaps-page__group-header">
                  <h2
                    id={`recaps-group-${group.email}`}
                    className="card__title"
                  >
                    {group.name || group.email}
                  </h2>
                  <p className="muted">
                    {group.email} · {group.recaps.length} recap
                    {group.recaps.length === 1 ? "" : "s"} ·{" "}
                    <Link
                      to={`/students?student=${encodeURIComponent(group.email)}`}
                      className="link"
                    >
                      Open profile →
                    </Link>
                  </p>
                </header>
                <ul className="recaps-page__recaps">
                  {group.recaps.map((recap) => (
                    <li
                      key={`${recap.studentEmail}|${recap.lessonDate}|${recap.startTime}`}
                    >
                      <LessonRecapBlock recap={recap} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
