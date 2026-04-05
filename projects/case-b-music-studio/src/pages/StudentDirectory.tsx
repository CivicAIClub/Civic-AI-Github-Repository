import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getDistinctInstruments,
  getDistinctLevels,
  getStudentById,
  mockStudents,
} from "../data/mockStudents";
import type { Student } from "../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StudentDetailPanel({
  student,
  onClose,
}: {
  student: Student;
  onClose: () => void;
}) {
  return (
    <div className="card student-detail-panel">
      <div className="student-detail-panel__header">
        <div>
          <h2 className="student-detail-panel__title">{student.name}</h2>
          <p className="muted student-detail-panel__meta">
            {student.instrument} · {student.currentLevel}
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
      <p className="profile-updated muted">
        Last updated {formatDateLong(student.lastUpdated)}
      </p>

      <dl className="dl student-detail-dl">
        <div>
          <dt>Goals</dt>
          <dd>{student.goals}</dd>
        </div>
        <div>
          <dt>Music experience</dt>
          <dd>{student.musicExperience}</dd>
        </div>
        <div>
          <dt>Past instruments</dt>
          <dd>
            {student.pastInstruments.length
              ? student.pastInstruments.join(", ")
              : "—"}
          </dd>
        </div>
        <div>
          <dt>Playlist / interests</dt>
          <dd>
            <ul className="inline-list">
              {student.musicInterests.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="notes-block">
        <h3 className="notes-block__title">Teacher notes</h3>
        <p className="notes-block__body">{student.teacherNotes}</p>
      </div>
    </div>
  );
}

export function StudentDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState("");
  const [level, setLevel] = useState("");

  const instruments = useMemo(() => getDistinctInstruments(), []);
  const levels = useMemo(() => getDistinctLevels(), []);

  const syncSelectionFromUrl = useCallback(() => {
    const fromUrl = searchParams.get("student");
    if (!fromUrl) {
      setSelectedId(null);
      return;
    }
    if (getStudentById(fromUrl)) setSelectedId(fromUrl);
    else setSelectedId(null);
  }, [searchParams]);

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
    return mockStudents.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (instrument && s.instrument !== instrument) return false;
      if (level && s.currentLevel !== level) return false;
      return true;
    });
  }, [query, instrument, level]);

  const selectedStudent =
    selectedId != null ? getStudentById(selectedId) : undefined;

  useEffect(() => {
    if (
      selectedId != null &&
      !filtered.some((s) => s.id === selectedId)
    ) {
      setSelection(null);
    }
  }, [filtered, selectedId, setSelection]);

  const handleCardClick = (id: string) => {
    if (selectedId === id) setSelection(null);
    else setSelection(id);
  };

  return (
    <div className="page page--wide">
      <header className="page-header">
        <h1>Students</h1>
        <p className="page-header__lede">
          Choose a student to view their profile here — no separate page.
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
          Showing {filtered.length} of {mockStudents.length}
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
                  Updated {formatDate(s.lastUpdated)}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="empty-state">
              No students match these filters. Clear search or set filters to
              &ldquo;All.&rdquo;
            </p>
          )}
        </div>

        <div className="students-detail-column">
          {selectedStudent ? (
            <StudentDetailPanel
              student={selectedStudent}
              onClose={() => setSelection(null)}
            />
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
