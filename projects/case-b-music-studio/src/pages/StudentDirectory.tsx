import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import { getStudentSchedule } from "../api/appsScriptSchedule";
import type { SheetStudentProfile } from "../api/mapSheetStudentResponse";
import { getAllStudents, getStudentByEmail } from "../api/appsScriptStudent";
import { FormSubmissionHistorySection } from "../components/FormSubmissionHistorySection";
import { sheetProfileToStudent } from "../api/studentFromSheet";
import {
  formatLessonBlockDisplay,
  formatLessonTimeRangeForDisplay,
  lessonStableKey,
  partitionStudentLessons,
} from "../lib/lessonScheduleUtils";
import {
  formatLessonDateLong,
  formatLessonDateShort,
} from "../lib/dateUtils";
import type { ScheduledLesson, Student } from "../types";

const RECENT_LESSONS_INITIAL_VISIBLE = 5;

type SheetFetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; profile: SheetStudentProfile }
  | { status: "error"; message: string };

type RosterFetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type ScheduleFetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; lessons: ScheduledLesson[] }
  | { status: "error"; message: string };

/**
 * Storage keys are namespaced under `caseB.` so other Civic AI Club projects
 * deployed under the same `civicaiclub.github.io` origin don't collide on
 * unprefixed keys like `student-notes-<email>`.
 */
const TEACHER_NOTES_STORAGE_PREFIX = "caseB.teacherNotes.v1:";
/** Read-only: keys written by older builds. New writes always use the prefixed key. */
const LEGACY_LOCAL_NOTES_PREFIX = "student-notes-";
const LEGACY_SESSION_NOTES_PREFIX = "musicStudio.caseB.teacherNotes.v1:";

const NOTES_AUTOSAVE_MS = 400;

function studentNotesStorageKey(studentId: string): string {
  return `${TEACHER_NOTES_STORAGE_PREFIX}${studentId}`;
}

function writeStudentNotesLocal(studentId: string, value: string): void {
  try {
    localStorage.setItem(studentNotesStorageKey(studentId), value);
  } catch {
    /* quota / private mode */
  }
}

function displayField(s: string | undefined): string {
  const t = (s ?? "").trim();
  return t.length ? t : "—";
}

function readStoredTeacherNotes(studentId: string, fallback: string): string {
  try {
    const fromLocal = localStorage.getItem(
      studentNotesStorageKey(studentId)
    );
    if (fromLocal !== null) return fromLocal;
    const legacyLocal = localStorage.getItem(
      `${LEGACY_LOCAL_NOTES_PREFIX}${studentId}`
    );
    if (legacyLocal !== null) return legacyLocal;
    const legacySession = sessionStorage.getItem(
      `${LEGACY_SESSION_NOTES_PREFIX}${studentId}`
    );
    if (legacySession !== null) return legacySession;
  } catch {
    /* private mode */
  }
  return fallback === "—" ? "" : fallback;
}

function BookedLessonSummary({ lesson }: { lesson: ScheduledLesson }) {
  const timeRange = formatLessonTimeRangeForDisplay(lesson);
  return (
    <p className="profile-booked__line">
      <span className="strong">{formatLessonDateLong(lesson.lessonDate)}</span>
      {" · "}
      {formatLessonBlockDisplay(lesson)}
      {" · "}
      <span className="muted">{lesson.status.trim() || "—"}</span>
      {timeRange ? (
        <>
          <br />
          <span className="muted">{timeRange}</span>
        </>
      ) : null}
      {lesson.lessonFocus.trim() ? (
        <>
          <br />
          <span className="muted">{lesson.lessonFocus.trim()}</span>
        </>
      ) : null}
      {lesson.note.trim() ? (
        <>
          <br />
          <span className="muted profile-booked__note">{lesson.note.trim()}</span>
        </>
      ) : null}
    </p>
  );
}

function BookedLessonListItem({ lesson }: { lesson: ScheduledLesson }) {
  const timeRange = formatLessonTimeRangeForDisplay(lesson);
  return (
    <div>
      <span className="strong">{formatLessonDateLong(lesson.lessonDate)}</span>
      <span className="muted">
        {" "}
        · {formatLessonBlockDisplay(lesson)} · {lesson.status.trim() || "—"}
      </span>
      {timeRange ? (
        <span className="muted">
          <br />
          {timeRange}
        </span>
      ) : null}
      {lesson.lessonFocus.trim() ? (
        <span className="muted">
          <br />
          {lesson.lessonFocus.trim()}
        </span>
      ) : null}
      {lesson.note.trim() ? (
        <span className="muted profile-booked__note">
          <br />
          {lesson.note.trim()}
        </span>
      ) : null}
    </div>
  );
}

function StudentDetailPanel({
  student,
  formSubmissions,
  scheduleFetchState,
  onScheduleRetry,
  onClose,
}: {
  student: Student;
  formSubmissions: SheetStudentProfile[];
  scheduleFetchState: ScheduleFetchState;
  onScheduleRetry: () => void;
  onClose: () => void;
}) {
  const [teacherNotesDraft, setTeacherNotesDraft] = useState(() =>
    readStoredTeacherNotes(student.id, student.teacherNotes)
  );
  const [notesSaveStatus, setNotesSaveStatus] = useState<
    "idle" | "pending" | "saved"
  >("idle");
  const [showAllRecent, setShowAllRecent] = useState(false);

  const teacherNotesDraftRef = useRef(teacherNotesDraft);
  teacherNotesDraftRef.current = teacherNotesDraft;

  const notesSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    const next = readStoredTeacherNotes(student.id, student.teacherNotes);
    setTeacherNotesDraft(next);
    teacherNotesDraftRef.current = next;
    setNotesSaveStatus("idle");
    setShowAllRecent(false);
  }, [student.id, student.teacherNotes]);

  const clearNotesSaveTimeout = useCallback(() => {
    if (notesSaveTimeoutRef.current !== null) {
      clearTimeout(notesSaveTimeoutRef.current);
      notesSaveTimeoutRef.current = null;
    }
  }, []);

  const flushNotesToLocalStorage = useCallback(() => {
    clearNotesSaveTimeout();
    writeStudentNotesLocal(student.id, teacherNotesDraftRef.current);
    setNotesSaveStatus("saved");
  }, [clearNotesSaveTimeout, student.id]);

  useEffect(() => {
    return () => {
      clearNotesSaveTimeout();
      writeStudentNotesLocal(student.id, teacherNotesDraftRef.current);
    };
  }, [clearNotesSaveTimeout, student.id]);

  const handleTeacherNotesChange = useCallback(
    (value: string) => {
      setTeacherNotesDraft(value);
      teacherNotesDraftRef.current = value;
      setNotesSaveStatus("pending");
      clearNotesSaveTimeout();
      notesSaveTimeoutRef.current = setTimeout(() => {
        notesSaveTimeoutRef.current = null;
        writeStudentNotesLocal(student.id, teacherNotesDraftRef.current);
        setNotesSaveStatus("saved");
      }, NOTES_AUTOSAVE_MS);
    },
    [clearNotesSaveTimeout, student.id]
  );

  const schedulePartition = useMemo(() => {
    if (scheduleFetchState.status !== "success") return null;
    const email = student.sheetEmail ?? student.id;
    return partitionStudentLessons(scheduleFetchState.lessons, email);
  }, [scheduleFetchState, student.id, student.sheetEmail]);

  return (
    <div className="card student-detail-panel">
      <div className="student-detail-panel__header">
        <div>
          <h2 className="student-detail-panel__title">{student.name}</h2>
          <p className="muted student-detail-panel__meta">
            {displayField(student.instrument)} ·{" "}
            {displayField(student.currentLevel)}
          </p>
        </div>
        <button
          type="button"
          className="button-ghost"
          onClick={onClose}
          aria-label="Close profile"
        >
          Close
        </button>
      </div>

      <section className="profile-section" aria-labelledby="profile-core-h">
        <h3 id="profile-core-h" className="profile-section__heading">
          Profile
        </h3>
        <dl className="dl student-detail-dl">
          <div>
            <dt>Name</dt>
            <dd>{displayField(student.name)}</dd>
          </div>
          <div>
            <dt>Instrument</dt>
            <dd>{displayField(student.instrument)}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>{displayField(student.currentLevel)}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatLessonDateLong(student.formDate)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatLessonDateLong(student.lastUpdated)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section" aria-labelledby="profile-goals-h">
        <h3 id="profile-goals-h" className="profile-section__heading">
          Goals / learning
        </h3>
        <dl className="dl student-detail-dl">
          <div>
            <dt>Goal of the private lesson</dt>
            <dd>{displayField(student.goals)}</dd>
          </div>
          <div>
            <dt>How long have you been playing?</dt>
            <dd>{displayField(student.musicExperience)}</dd>
          </div>
          <div>
            <dt>Music theory</dt>
            <dd>{displayField(student.theory)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section" aria-labelledby="profile-rep-h">
        <h3 id="profile-rep-h" className="profile-section__heading">
          Interests / repertoire
        </h3>
        <dl className="dl student-detail-dl">
          <div>
            <dt>Genre</dt>
            <dd>{displayField(student.genre)}</dd>
          </div>
          <div>
            <dt>Specific song they want to learn</dt>
            <dd>{displayField(student.specificSong)}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section" aria-labelledby="profile-contact-h">
        <h3 id="profile-contact-h" className="profile-section__heading">
          Contact / student notes
        </h3>
        <dl className="dl student-detail-dl">
          <div>
            <dt>Email</dt>
            <dd>{displayField(student.contactEmail ?? student.id)}</dd>
          </div>
          <div>
            <dt>Any updates? Questions?</dt>
            <dd>{displayField(student.studentUpdates)}</dd>
          </div>
        </dl>
      </section>

      <FormSubmissionHistorySection submissions={formSubmissions} />

      <section className="profile-section" aria-labelledby="profile-scheduling-h">
        <h3 id="profile-scheduling-h" className="profile-section__heading">
          Scheduling
        </h3>
        <dl className="dl student-detail-dl">
          <div>
            <dt>Preferred lesson availability</dt>
            <dd>
              {student.availabilityBlocks.length === 0 ? (
                "—"
              ) : (
                <ul className="availability-badges" aria-label="Preferred lesson availability">
                  {student.availabilityBlocks.map((block, i) => (
                    <li
                      key={`${block}:${i}`}
                      className="availability-badges__item"
                    >
                      {block}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
        </dl>

        <div className="profile-booked">
          <h4 className="profile-booked__heading">Booked lessons</h4>
          <p className="muted profile-booked__source">
            From the <strong>Lesson Schedule</strong> sheet (actual lessons —
            not form preferences).
          </p>
          {(scheduleFetchState.status === "loading" ||
            scheduleFetchState.status === "idle") && (
            <p className="muted">Loading schedule…</p>
          )}
          {scheduleFetchState.status === "error" && (
            <>
              <p className="empty-state" role="alert">
                {scheduleFetchState.message}
              </p>
              <button
                type="button"
                className="button-ghost"
                onClick={onScheduleRetry}
              >
                Retry schedule
              </button>
            </>
          )}
          {scheduleFetchState.status === "success" && schedulePartition && (
            <>
              <p className="profile-booked__sub">Next lesson</p>
              {schedulePartition.nextLesson ? (
                <BookedLessonSummary lesson={schedulePartition.nextLesson} />
              ) : (
                <p className="muted profile-booked__line">—</p>
              )}

              <p className="profile-booked__sub">Upcoming</p>
              {schedulePartition.upcomingLessons.length === 0 ? (
                <p className="muted profile-booked__line">—</p>
              ) : (
                <ul className="lesson-schedule-list lesson-schedule-list--compact">
                  {schedulePartition.upcomingLessons.map((lesson, i) => (
                    <li
                      key={lessonStableKey(lesson, i)}
                      className="lesson-schedule-list__row"
                    >
                      <BookedLessonListItem lesson={lesson} />
                    </li>
                  ))}
                </ul>
              )}

              <p className="profile-booked__sub">
                Recent
                {schedulePartition.recentLessons.length > 0 && (
                  <span className="muted">
                    {" "}
                    ·{" "}
                    {showAllRecent ||
                    schedulePartition.recentLessons.length <=
                      RECENT_LESSONS_INITIAL_VISIBLE
                      ? `${schedulePartition.recentLessons.length} total`
                      : `showing ${RECENT_LESSONS_INITIAL_VISIBLE} of ${schedulePartition.recentLessons.length}`}
                  </span>
                )}
              </p>
              {schedulePartition.recentLessons.length === 0 ? (
                <p className="muted profile-booked__line">—</p>
              ) : (
                <>
                  <ul className="lesson-schedule-list lesson-schedule-list--compact">
                    {(showAllRecent
                      ? schedulePartition.recentLessons
                      : schedulePartition.recentLessons.slice(
                          0,
                          RECENT_LESSONS_INITIAL_VISIBLE
                        )
                    ).map((lesson, i) => (
                      <li
                        key={lessonStableKey(lesson, i)}
                        className="lesson-schedule-list__row"
                      >
                        <BookedLessonListItem lesson={lesson} />
                      </li>
                    ))}
                  </ul>
                  {schedulePartition.recentLessons.length >
                    RECENT_LESSONS_INITIAL_VISIBLE && (
                    <button
                      type="button"
                      className="button-ghost"
                      onClick={() => setShowAllRecent((prev) => !prev)}
                      aria-expanded={showAllRecent}
                    >
                      {showAllRecent
                        ? "Show fewer"
                        : `Show all ${schedulePartition.recentLessons.length}`}
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>

      <section className="profile-section profile-section--notes" aria-labelledby="profile-teacher-h">
        <div className="notes-card">
          <div className="notes-card__header">
            <h3 id="profile-teacher-h" className="profile-section__heading">
              Teacher notes
            </h3>
            <p className="muted profile-teacher-notes-lead">
              Saved in this browser until a server endpoint exists.
            </p>
          </div>
          <textarea
            className="profile-teacher-notes"
            rows={6}
            value={teacherNotesDraft}
            onChange={(e) => handleTeacherNotesChange(e.target.value)}
            onBlur={flushNotesToLocalStorage}
            aria-label="Teacher notes for this student"
            placeholder="Lesson prep, follow-ups, private reminders…"
          />
          {(notesSaveStatus === "pending" || notesSaveStatus === "saved") && (
            <p
              className="profile-teacher-notes-status"
              role="status"
              aria-live="polite"
            >
              {notesSaveStatus === "pending" ? "Saving…" : "Saved"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function StudentDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissionsByEmail, setSubmissionsByEmail] = useState<
    Record<string, SheetStudentProfile[]>
  >({});
  const [rosterState, setRosterState] = useState<RosterFetchState>({
    status: "idle",
  });
  const [rosterRetry, setRosterRetry] = useState(0);

  const [sheetFetchState, setSheetFetchState] = useState<SheetFetchState>({
    status: "idle",
  });
  const [sheetRetryToken, setSheetRetryToken] = useState(0);
  const [scheduleFetchState, setScheduleFetchState] =
    useState<ScheduleFetchState>({ status: "idle" });
  const [scheduleRetryToken, setScheduleRetryToken] = useState(0);

  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");

  // Roster: once when the page opens (or when you click "Try again" after an error).
  useEffect(() => {
    const ac = new AbortController();
    setRosterState({ status: "loading" });
    getAllStudents({ signal: ac.signal })
      .then(({ students: profiles, submissionsByEmail: byEmail }) => {
        const list: Student[] = [];
        for (const p of profiles) {
          const s = sheetProfileToStudent(p);
          if (s) list.push(s);
        }
        list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setStudents(list);
        setSubmissionsByEmail(byEmail);
        setRosterState({ status: "success" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Could not load roster.";
        setStudents([]);
        setSubmissionsByEmail({});
        setRosterState({ status: "error", message });
      });
    return () => ac.abort();
  }, [rosterRetry]);

  const instruments = useMemo(() => {
    return [...new Set(students.map((s) => s.instrument))]
      .filter((v) => v && v !== "—")
      .sort();
  }, [students]);

  const levels = useMemo(() => {
    return [...new Set(students.map((s) => s.currentLevel))]
      .filter((v) => v && v !== "—")
      .sort();
  }, [students]);

  /**
   * Match the URL's `?student=` value to a roster student by lowercased
   * email. Email casing can drift between Form Responses 1 and Lesson
   * Schedule (the dashboard's "Upcoming lessons" link uses whatever the
   * Lesson Schedule sheet has), so a case-sensitive lookup would silently
   * leave the panel empty.
   */
  const syncSelectionFromUrl = useCallback(() => {
    const fromUrl = searchParams.get("student");
    if (!fromUrl) {
      setSelectedId(null);
      return;
    }
    const target = fromUrl.trim().toLowerCase();
    const match = students.find((s) => s.id.toLowerCase() === target);
    if (match) setSelectedId(match.id);
    else setSelectedId(null);
  }, [searchParams, students]);

  useEffect(() => {
    syncSelectionFromUrl();
  }, [syncSelectionFromUrl]);

  const setSelection = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (id) {
        setSearchParams({ student: id }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [setSearchParams]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (instrument && s.instrument !== instrument) return false;
      if (level && s.currentLevel !== level) return false;
      return true;
    });
  }, [query, instrument, level, students]);

  const selectedStudent =
    selectedId != null
      ? students.find((s) => s.id === selectedId)
      : undefined;

  // Detail: whenever a student is selected, refetch their row by email (latest sheet data).
  useEffect(() => {
    if (!selectedStudent?.sheetEmail) {
      setSheetFetchState({ status: "idle" });
      return;
    }

    const ac = new AbortController();
    const email = selectedStudent.sheetEmail;
    setSheetFetchState({ status: "loading" });

    getStudentByEmail(email, { signal: ac.signal })
      .then((profile) => {
        setSheetFetchState({ status: "success", profile });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Could not load student.";
        setSheetFetchState({ status: "error", message });
      });

    return () => ac.abort();
  }, [selectedStudent?.sheetEmail, sheetRetryToken]);

  useEffect(() => {
    if (!selectedStudent?.sheetEmail) {
      setScheduleFetchState({ status: "idle" });
      return;
    }

    const ac = new AbortController();
    const email = selectedStudent.sheetEmail;
    setScheduleFetchState({ status: "loading" });

    getStudentSchedule(email, { signal: ac.signal })
      .then((lessons) => {
        setScheduleFetchState({ status: "success", lessons });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Could not load schedule.";
        setScheduleFetchState({ status: "error", message });
      });

    return () => ac.abort();
  }, [selectedStudent?.sheetEmail, sheetRetryToken, scheduleRetryToken]);

  const detailStudent = useMemo(() => {
    if (sheetFetchState.status !== "success") return undefined;
    return sheetProfileToStudent(sheetFetchState.profile) ?? undefined;
  }, [sheetFetchState]);

  const profileFormSubmissions = useMemo(() => {
    const email = selectedStudent?.sheetEmail?.trim().toLowerCase();
    if (!email) return [];
    return submissionsByEmail[email] ?? [];
  }, [selectedStudent?.sheetEmail, submissionsByEmail]);

  useEffect(() => {
    if (
      selectedId != null &&
      rosterState.status === "success" &&
      !filtered.some((s) => s.id === selectedId)
    ) {
      setSelection(null);
    }
  }, [filtered, rosterState.status, selectedId, setSelection]);

  const handleCardClick = (id: string) => {
    if (selectedId === id) setSelection(null);
    else setSelection(id);
  };

  if (rosterState.status === "loading" || rosterState.status === "idle") {
    return (
      <div className="page page--wide">
        <header className="page-header">
          <h1>Students</h1>
          <p className="page-header__lede">
            Loading your roster from Google Sheets…
          </p>
        </header>
        <div className="card student-detail-empty">
          <p className="muted">Please wait.</p>
        </div>
      </div>
    );
  }

  if (rosterState.status === "error") {
    return (
      <div className="page page--wide">
        <header className="page-header">
          <h1>Students</h1>
          <p className="page-header__lede">
            Could not load the student list from your web app.
          </p>
        </header>
        <div className="card student-detail-panel" role="alert">
          <p className="empty-state">{rosterState.message}</p>
          <p className="muted empty-state">
            Your Apps Script must handle <code>?action=list</code> and return a
            JSON array of rows (see the comment on{" "}
            <code>APPS_SCRIPT_BASE_URL</code> in{" "}
            <code>src/api/appsScriptStudent.ts</code>).
          </p>
          <button
            type="button"
            className="button-ghost"
            onClick={() => setRosterRetry((n) => n + 1)}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--wide">
      <header className="page-header">
        <h1>Students</h1>
        <p className="page-header__lede">
          Choose a student to view their profile here — no separate page. Data
          comes from your Google Sheet via Apps Script.
        </p>
      </header>

      <div className="filters card">
        <div className="filters__row">
          <div className="field grow">
            <label className="label" htmlFor="dir-search">
              Search
            </label>
            <input
              id="dir-search"
              type="search"
              className="input"
              placeholder="Name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="dir-instrument">
              Instrument
            </label>
            <select
              id="dir-instrument"
              className="select"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
            >
              <option value="">All</option>
              {instruments.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="dir-level">
              Level
            </label>
            <select
              id="dir-level"
              className="select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">All</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="muted filters__count">
          Showing {filtered.length} of {students.length}
        </p>
      </div>

      <div className="students-split">
        <div>
          <div className="student-grid student-grid--compact">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                className={
                  selectedId === s.id
                    ? "student-card student-card--selected"
                    : "student-card"
                }
                onClick={() => handleCardClick(s.id)}
                aria-expanded={selectedId === s.id}
              >
                <span className="student-card__name">{s.name}</span>
                <span className="student-card__meta">
                  <span>{s.instrument}</span>
                  <span className="dot" aria-hidden />
                  <span>{s.currentLevel}</span>
                </span>
                <span className="student-card__updated muted">
                  Updated {formatLessonDateShort(s.lastUpdated)}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="empty-state">
              {students.length === 0
                ? "No students returned. Check that ?action=list in your Apps Script returns rows with an Email Address column."
                : "No students match these filters. Clear search or set filters to “All.”"}
            </p>
          )}
        </div>

        <div className="students-detail-column">
          {selectedStudent ? (
            sheetFetchState.status === "error" ? (
              <div className="card student-detail-panel">
                <div className="student-detail-panel__header">
                  <div>
                    <h2 className="student-detail-panel__title">
                      Could not load sheet data
                    </h2>
                    <p className="muted student-detail-panel__meta">
                      {selectedStudent.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={() => setSelection(null)}
                    aria-label="Close profile"
                  >
                    Close
                  </button>
                </div>
                <p className="empty-state" role="alert">
                  {sheetFetchState.message}
                </p>
                <button
                  type="button"
                  className="button-ghost"
                  onClick={() => setSheetRetryToken((n) => n + 1)}
                >
                  Try again
                </button>
              </div>
            ) : detailStudent ? (
              <StudentDetailPanel
                key={detailStudent.id}
                student={detailStudent}
                formSubmissions={profileFormSubmissions}
                scheduleFetchState={scheduleFetchState}
                onScheduleRetry={() => setScheduleRetryToken((n) => n + 1)}
                onClose={() => setSelection(null)}
              />
            ) : (
              <div className="card student-detail-empty">
                <h2 className="card__title">Student profile</h2>
                <p className="muted">Loading profile from Google Sheets…</p>
              </div>
            )
          ) : (
            <div className="card student-detail-empty">
              <h2 className="card__title">Student profile</h2>
              <p className="muted">
                Select a student from the list to see goals, experience,
                interests, and teacher notes. Click again to collapse.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
