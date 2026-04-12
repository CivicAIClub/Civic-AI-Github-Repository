import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllStudents, getStudentByEmail } from "../api/appsScriptStudent";
import type { SheetStudentProfile } from "../api/mapSheetStudentResponse";
import { sheetProfileToStudent } from "../api/studentFromSheet";
import type { Student } from "../types";

function formatDateShort(value: string) {
  if (!value.trim()) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Handles ISO from the API and raw Timestamp strings from the sheet */
function formatDateLong(value: string) {
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const t = value.trim();
  return t.length ? t : "—";
}

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

/** sessionStorage key; swap for API save when backend exists */
const TEACHER_NOTES_STORAGE_PREFIX = "musicStudio.caseB.teacherNotes.v1:";

function displayField(s: string | undefined): string {
  const t = (s ?? "").trim();
  return t.length ? t : "—";
}

function readStoredTeacherNotes(studentId: string, fallback: string): string {
  try {
    const stored = sessionStorage.getItem(
      `${TEACHER_NOTES_STORAGE_PREFIX}${studentId}`
    );
    if (stored !== null) return stored;
  } catch {
    /* private mode */
  }
  return fallback === "—" ? "" : fallback;
}

function StudentDetailPanel({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  const [teacherNotesDraft, setTeacherNotesDraft] = useState(() =>
    readStoredTeacherNotes(student.id, student.teacherNotes)
  );

  useEffect(() => {
    setTeacherNotesDraft(
      readStoredTeacherNotes(student.id, student.teacherNotes)
    );
  }, [student.id, student.teacherNotes]);

  const persistTeacherNotes = () => {
    try {
      sessionStorage.setItem(
        `${TEACHER_NOTES_STORAGE_PREFIX}${student.id}`,
        teacherNotesDraft
      );
    } catch {
      /* quota / private mode */
    }
  };

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
            <dd>{formatDateLong(student.formDate)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatDateLong(student.lastUpdated)}</dd>
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

      <section className="profile-section profile-section--notes" aria-labelledby="profile-teacher-h">
        <h3 id="profile-teacher-h" className="profile-section__heading">
          Teacher notes
        </h3>
        <p className="muted profile-teacher-notes-lead">
          Saved in this browser until a server endpoint exists.
        </p>
        <textarea
          className="input profile-teacher-notes"
          rows={6}
          value={teacherNotesDraft}
          onChange={(e) => setTeacherNotesDraft(e.target.value)}
          onBlur={persistTeacherNotes}
          aria-label="Teacher notes for this student"
          placeholder="Lesson prep, follow-ups, private reminders…"
        />
      </section>
    </div>
  );
}

export function StudentDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [rosterState, setRosterState] = useState<RosterFetchState>({
    status: "idle",
  });
  const [rosterRetry, setRosterRetry] = useState(0);

  const [sheetFetchState, setSheetFetchState] = useState<SheetFetchState>({
    status: "idle",
  });
  const [sheetRetryToken, setSheetRetryToken] = useState(0);

  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");

  // Roster: once when the page opens (or when you click "Try again" after an error).
  useEffect(() => {
    const ac = new AbortController();
    setRosterState({ status: "loading" });
    getAllStudents({ signal: ac.signal })
      .then((profiles) => {
        const list: Student[] = [];
        for (const p of profiles) {
          const s = sheetProfileToStudent(p);
          if (s) list.push(s);
        }
        list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        setStudents(list);
        setRosterState({ status: "success" });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Could not load roster.";
        setStudents([]);
        setRosterState({ status: "error", message });
      });
    return () => ac.abort();
  }, [rosterRetry]);

  const instruments = useMemo(() => {
    return [...new Set(students.map((s) => s.instrument))].sort();
  }, [students]);

  const levels = useMemo(() => {
    return [...new Set(students.map((s) => s.currentLevel))].sort();
  }, [students]);

  const syncSelectionFromUrl = useCallback(() => {
    const fromUrl = searchParams.get("student");
    if (!fromUrl) {
      setSelectedId(null);
      return;
    }
    if (students.some((s) => s.id === fromUrl)) setSelectedId(fromUrl);
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

  const detailStudent = useMemo(() => {
    if (sheetFetchState.status !== "success") return undefined;
    return sheetProfileToStudent(sheetFetchState.profile) ?? undefined;
  }, [sheetFetchState]);

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
                  Updated {formatDateShort(s.lastUpdated)}
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
                student={detailStudent}
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
