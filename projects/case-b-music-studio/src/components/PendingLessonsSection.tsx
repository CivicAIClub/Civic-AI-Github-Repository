import { useMemo } from "react";
import {
  formatLessonBlockDisplay,
  formatLessonTimeRangeForDisplay,
  lessonDateTime,
  pendingLessonsSorted,
} from "../lib/lessonScheduleUtils";
import { lessonCalendarTab } from "../lib/displayUtils";
import type { ScheduledLesson } from "../types";

/**
 * Dashboard section listing lessons the teacher has typed into the
 * "Lesson Schedule" sheet but hasn't auto-scheduled yet (no Calendar
 * Event ID, blank/Draft status, today or future).
 *
 * Each row gets a "Preview & schedule" button; the parent owns the
 * modal state and passes `onPreview(lesson)` to open it.
 */
export function PendingLessonsSection({
  lessons,
  onPreview,
}: {
  lessons: ScheduledLesson[];
  onPreview: (lesson: ScheduledLesson) => void;
}) {
  const pending = useMemo(() => pendingLessonsSorted(lessons), [lessons]);

  if (pending.length === 0) return null;

  return (
    <section className="card span-2 pending-lessons-card" aria-labelledby="pending-h">
      <h2 id="pending-h" className="card__title">
        Pending lessons
      </h2>
      <p className="muted profile-updates-intro">
        Rows in <strong>Lesson Schedule</strong> with no Calendar Event ID yet.
        Click <strong>Preview &amp; schedule</strong> to review the invite,
        then create it on the calendar — Google sends invites to the student
        and Dr. Burns automatically.
      </p>

      <ul className="pending-list">
        {pending.map((lesson, i) => (
          <PendingLessonItem
            key={pendingItemKey(lesson, i)}
            lesson={lesson}
            onPreview={() => onPreview(lesson)}
          />
        ))}
      </ul>
    </section>
  );
}

function pendingItemKey(lesson: ScheduledLesson, i: number): string {
  return `${lesson.studentEmail}|${lesson.lessonDate}|${lesson.startTime}|${i}`;
}

function PendingLessonItem({
  lesson,
  onPreview,
}: {
  lesson: ScheduledLesson;
  onPreview: () => void;
}) {
  const tab = lessonCalendarTab(lessonDateTime(lesson));
  const block = formatLessonBlockDisplay(lesson);
  const timeRange = formatLessonTimeRangeForDisplay(lesson);
  const focus = lesson.lessonFocus.trim();
  const studentLabel = lesson.studentName.trim() || lesson.studentEmail;

  return (
    <li className="pending-list__item">
      <div className="pending-list__date" aria-hidden={tab ? undefined : true}>
        {tab ? (
          <>
            <span className="lesson-row__date-day">{tab.weekday}</span>
            <span className="lesson-row__date-num">{tab.day}</span>
            <span className="lesson-row__date-month">{tab.month}</span>
          </>
        ) : (
          <span className="lesson-row__date-num">—</span>
        )}
      </div>

      <div className="pending-list__main">
        <span className="pending-list__name strong">{studentLabel}</span>
        <span className="pending-list__meta muted">
          <span>{block}</span>
          {focus && (
            <>
              <span aria-hidden="true">·</span>
              <span>{focus}</span>
            </>
          )}
          {timeRange && (
            <>
              <span aria-hidden="true">·</span>
              <span>{timeRange}</span>
            </>
          )}
        </span>
      </div>

      <button
        type="button"
        className="button pending-list__action"
        onClick={onPreview}
      >
        Preview &amp; schedule
      </button>
    </li>
  );
}
