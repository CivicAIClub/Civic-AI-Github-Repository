import { useMemo, useState } from "react";
import { LessonRow } from "./LessonRow";
import { LessonRecapBlock } from "./LessonRecapBlock";
import { lessonRecapKey } from "../api/appsScriptRecaps";
import { lessonStableKey } from "../lib/lessonScheduleUtils";
import type { LessonRecap, ScheduledLesson } from "../types";

/**
 * Per-student timeline of past lessons with their teacher recaps.
 *
 * Renders inside the profile panel, replacing the plain "Recent
 * lessons" list. For each lesson:
 *   - The existing `<LessonRow>` is rendered as the row header.
 *   - Below it, either a "Write recap" button (if no recap yet) or a
 *     "View recap" toggle that expands the formatted recap inline.
 *   - When expanded, an "Edit" link opens the same modal in edit mode.
 *
 * The parent owns the modal state and passes `onWriteRecap` /
 * `onEditRecap` callbacks. We deliberately don't auto-expand any
 * recap — the teacher might be scanning a lot of past lessons and
 * doesn't want a wall of text by default.
 */
export function RecapsTimeline({
  lessons,
  recaps,
  initialVisible,
  onWriteRecap,
  onEditRecap,
}: {
  /** Already-sorted past lessons (newest first works best). */
  lessons: ScheduledLesson[];
  /** Newest-first list of recaps for this student (any subset). */
  recaps: LessonRecap[];
  /**
   * If set, only the first N rows are shown until the user clicks
   * "Show all". Mirrors the pre-existing recent-lessons cap so we
   * don't visually regress for students with long histories.
   */
  initialVisible?: number;
  onWriteRecap: (lesson: ScheduledLesson) => void;
  onEditRecap: (lesson: ScheduledLesson, recap: LessonRecap) => void;
}) {
  const recapsByKey = useMemo(() => {
    const map = new Map<string, LessonRecap>();
    for (const r of recaps) map.set(lessonRecapKey(r), r);
    return map;
  }, [recaps]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  if (lessons.length === 0) {
    return <p className="muted profile-booked__line">—</p>;
  }

  const visibleLessons =
    initialVisible == null || showAll
      ? lessons
      : lessons.slice(0, initialVisible);

  return (
    <div className="recaps-timeline">
      <ul className="recaps-timeline__list">
        {visibleLessons.map((lesson, i) => {
          const lessonKey = lessonRecapKey({
            studentEmail: lesson.studentEmail,
            lessonDate: lesson.lessonDate,
            startTime: lesson.startTime,
          });
          const recap = recapsByKey.get(lessonKey) ?? null;
          const isOpen = !!expanded[lessonKey];

          return (
            <li
              key={lessonStableKey(lesson, i)}
              className={
                recap
                  ? "recaps-timeline__item recaps-timeline__item--has-recap"
                  : "recaps-timeline__item"
              }
            >
              <LessonRow lesson={lesson} variant="static" />

              <div className="recaps-timeline__row">
                {recap ? (
                  <>
                    <button
                      type="button"
                      className="button button--ghost recaps-timeline__toggle"
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [lessonKey]: !prev[lessonKey],
                        }))
                      }
                      aria-expanded={isOpen}
                    >
                      {isOpen ? "Hide recap" : "View recap"}
                    </button>
                    <button
                      type="button"
                      className="button-ghost recaps-timeline__edit"
                      onClick={() => onEditRecap(lesson, recap)}
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button recaps-timeline__write"
                    onClick={() => onWriteRecap(lesson)}
                  >
                    Write recap
                  </button>
                )}
              </div>

              {isOpen && recap && (
                <div className="recaps-timeline__expanded">
                  <LessonRecapBlock recap={recap} variant="compact" />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {initialVisible != null &&
        lessons.length > initialVisible && (
          <button
            type="button"
            className="button-ghost profile-booked__show-all"
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
          >
            {showAll
              ? "Show fewer"
              : `Show all ${lessons.length}`}
          </button>
        )}
    </div>
  );
}
