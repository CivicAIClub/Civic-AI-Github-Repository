import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getScheduleList } from "../api/appsScriptSchedule";
import { getAllStudents } from "../api/appsScriptStudent";
import { sheetProfileToStudent } from "../api/studentFromSheet";
import {
  formatLessonBlockDisplay,
  formatLessonTimeRangeForDisplay,
  lessonStableKey,
  upcomingLessonsSorted,
} from "../lib/lessonScheduleUtils";
import {
  computeProfileUpdatesSinceLastVisit,
  loadProfileSnapshots,
  saveProfileSnapshots,
  type DashboardProfileUpdate,
} from "../lib/studentProfileSnapshots";
import { formatLessonDateLong } from "../lib/dateUtils";
import type { ScheduledLesson, Student } from "../types";

function clipText(s: string, max = 160): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<{
    isBaselineVisit: boolean;
    updates: DashboardProfileUpdate[];
  } | null>(null);
  const [rosterLoadStatus, setRosterLoadStatus] = useState<
    "idle" | "ok" | "error"
  >("idle");

  const [scheduleLoadStatus, setScheduleLoadStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("loading");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleLessons, setScheduleLessons] = useState<ScheduledLesson[]>([]);

  const upcomingForDashboard = useMemo(() => {
    return upcomingLessonsSorted(scheduleLessons).slice(0, 20);
  }, [scheduleLessons]);

  useEffect(() => {
    const ac = new AbortController();
    setScheduleLoadStatus("loading");
    setScheduleError(null);
    getScheduleList({ signal: ac.signal })
      .then((list) => {
        setScheduleLessons(list);
        setScheduleLoadStatus("ok");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setScheduleLessons([]);
        setScheduleError(
          err instanceof Error ? err.message : "Could not load schedule."
        );
        setScheduleLoadStatus("error");
      });
    return () => ac.abort();
  }, []);

  // Same roster as the Students page (Apps Script ?action=list) for count + quick search.
  // Snapshots are saved here only so “what changed” means since your last Dashboard visit.
  useEffect(() => {
    const ac = new AbortController();
    getAllStudents({ signal: ac.signal })
      .then(({ students: profiles }) => {
        const previous = loadProfileSnapshots();
        const { isBaselineVisit, updates } =
          computeProfileUpdatesSinceLastVisit(previous, profiles);

        setRecentUpdates({
          isBaselineVisit,
          updates: updates.slice(0, 12),
        });

        saveProfileSnapshots(profiles);

        const list: Student[] = [];
        for (const p of profiles) {
          const s = sheetProfileToStudent(p);
          if (s) list.push(s);
        }
        list.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );
        setStudents(list);
        setLoadError(null);
        setRosterLoadStatus("ok");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStudents([]);
        setRecentUpdates(null);
        setLoadError(
          err instanceof Error ? err.message : "Could not load roster."
        );
        setRosterLoadStatus("error");
      });
    return () => ac.abort();
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter((s) => {
        if (s.name.toLowerCase().includes(q)) return true;
        const email = (s.contactEmail ?? s.id).toLowerCase();
        return email.includes(q);
      })
      .slice(0, 8);
  }, [query, students]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="page-header__lede">
          Quick overview for lessons — roster comes from your Google Sheet.
        </p>
      </header>

      <div className="grid-dashboard">
        <section className="card card--stat">
          <h2 className="card__title">Total students</h2>
          <p className="stat-value">{loadError ? "—" : students.length}</p>
          <p className="muted">
            {loadError ? loadError : "Loaded from your Google Sheet (roster)"}
          </p>
        </section>

        <section className="card">
          <h2 className="card__title">Find a student</h2>
          <label className="label" htmlFor="dash-search">
            Search by name or email
          </label>
          <input
            id="dash-search"
            type="search"
            className="input"
            placeholder="Type a name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          {loadError && (
            <p className="muted empty-state">
              Open the Students page for details, or add <code>?action=list</code>{" "}
              to your Apps Script (see <code>src/api/appsScriptStudent.ts</code>).
            </p>
          )}
          {query.trim() && !loadError && (
            <ul className="search-results">
              {searchResults.length === 0 && (
                <li className="muted">No matches</li>
              )}
              {searchResults.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/students?student=${encodeURIComponent(s.id)}`}
                    className="link-block"
                  >
                    <span className="strong">{s.name}</span>
                    <span className="muted">
                      {s.instrument} · {s.currentLevel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card span-2">
          <h2 className="card__title">Recent student updates</h2>
          <p className="muted profile-updates-intro">
            Compared to the last time you opened this dashboard (saved in this
            browser). Edit the Sheet or form, refresh the dashboard, and changes
            appear here.
          </p>
          {rosterLoadStatus === "idle" && !loadError && (
            <p className="muted">Loading roster and update summary…</p>
          )}
          {loadError && (
            <p className="placeholder-text">Load the roster to see updates.</p>
          )}
          {rosterLoadStatus === "ok" &&
            recentUpdates?.isBaselineVisit && (
            <p className="placeholder-text">
              Baseline saved for each student. Open the dashboard again after your
              students submit new form responses (or you edit the Sheet) to see
              what changed.
            </p>
          )}
          {rosterLoadStatus === "ok" &&
            recentUpdates &&
            !recentUpdates.isBaselineVisit &&
            recentUpdates.updates.length === 0 && (
              <p className="placeholder-text">
                No profile fields changed since your last visit.
              </p>
            )}
          {rosterLoadStatus === "ok" &&
            recentUpdates &&
            !recentUpdates.isBaselineVisit &&
            recentUpdates.updates.length > 0 && (
              <ul className="profile-updates-list">
                {recentUpdates.updates.map((item) => (
                  <li key={item.profile.email} className="profile-updates-list__item">
                    {item.kind === "new_on_roster" ? (
                      <>
                        <p className="profile-updates-list__title">
                          <Link
                            to={`/students?student=${encodeURIComponent(item.profile.email)}`}
                            className="link-block"
                          >
                            <span className="strong">New on roster</span>
                            <span className="muted">
                              {" "}
                              — {item.profile.name || item.profile.email}
                            </span>
                          </Link>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="profile-updates-list__title">
                          <Link
                            to={`/students?student=${encodeURIComponent(item.profile.email)}`}
                            className="link-block"
                          >
                            <span className="strong">
                              {item.profile.name || item.profile.email}
                            </span>
                            <span className="muted"> · profile changes</span>
                          </Link>
                        </p>
                        <ul className="profile-updates-list__changes">
                          {item.changes.map((c) => (
                            <li key={c.label}>
                              <span className="profile-updates-list__field">
                                {c.label}
                              </span>
                              <span className="muted profile-updates-list__delta">
                                <span className="profile-updates-list__before">
                                  {clipText(c.before)}
                                </span>
                                {" → "}
                                <span className="profile-updates-list__after">
                                  {clipText(c.after)}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className="card span-2">
          <h2 className="card__title">Upcoming lessons</h2>
          <p className="muted profile-updates-intro">
            Booked lessons from your{" "}
            <strong>Lesson Schedule</strong> sheet (Scheduled / Rescheduled,
            today onward). Preferred blocks from the form are not shown here.
          </p>
          {scheduleLoadStatus === "loading" && (
            <p className="muted">Loading schedule…</p>
          )}
          {scheduleLoadStatus === "error" && scheduleError && (
            <div role="alert">
              <p className="empty-state">{scheduleError}</p>
              <p className="muted empty-state">
                Add <code>?action=schedule-list</code> to your Apps Script and a
                tab named <code>Lesson Schedule</code> (see{" "}
                <code>apps-script/lesson-schedule-doGet-snippet.js</code> and{" "}
                <code>src/api/appsScriptSchedule.ts</code>).
              </p>
            </div>
          )}
          {scheduleLoadStatus === "ok" && upcomingForDashboard.length === 0 && (
            <p className="placeholder-text">No upcoming scheduled lessons.</p>
          )}
          {scheduleLoadStatus === "ok" && upcomingForDashboard.length > 0 && (
            <ul className="lesson-schedule-list">
              {upcomingForDashboard.map((lesson, i) => {
                const timeRange = formatLessonTimeRangeForDisplay(lesson);
                return (
                <li
                  key={lessonStableKey(lesson, i)}
                  className="lesson-schedule-list__row"
                >
                  <div className="lesson-schedule-list__main">
                    <Link
                      to={`/students?student=${encodeURIComponent(lesson.studentEmail)}`}
                      className="link-block lesson-schedule-list__link"
                    >
                      <span className="strong lesson-schedule-list__name">
                        {lesson.studentName.trim() || lesson.studentEmail}
                      </span>
                      <span className="muted lesson-schedule-list__meta">
                        {formatLessonDateLong(lesson.lessonDate)}
                      </span>
                      <span className="lesson-schedule-list__block">
                        {formatLessonBlockDisplay(lesson)}
                      </span>
                      {timeRange ? (
                        <span className="muted lesson-schedule-list__time">
                          {timeRange}
                        </span>
                      ) : null}
                    </Link>
                  </div>
                  <div className="lesson-schedule-list__side">
                    <span className="lesson-schedule-list__status">
                      {lesson.status.trim() || "—"}
                    </span>
                    <span className="muted lesson-schedule-list__focus">
                      {lesson.lessonFocus.trim()
                        ? clipText(lesson.lessonFocus, 120)
                        : "—"}
                    </span>
                  </div>
                </li>
              );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
