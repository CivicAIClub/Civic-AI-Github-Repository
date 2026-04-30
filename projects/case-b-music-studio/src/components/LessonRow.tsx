import { Link } from "react-router-dom";
import {
  formatLessonBlockDisplay,
  formatLessonTimeRangeForDisplay,
  lessonDateTime,
} from "../lib/lessonScheduleUtils";
import {
  lessonCalendarTab,
  statusDisplayLabel,
  statusVariant,
} from "../lib/displayUtils";
import type { ScheduledLesson } from "../types";

type Variant = "link" | "static";

/**
 * Calendar-style lesson row. The left "tab" shows the lesson date as a
 * stacked DOW / day / month block; the centre column carries the student
 * name (linked to /students?student=…) plus block / focus / notes; the
 * right column shows the status pill and time range.
 */
export function LessonRow({
  lesson,
  variant = "link",
}: {
  lesson: ScheduledLesson;
  variant?: Variant;
}) {
  const parsedDate = lessonDateTime(lesson);
  const tab = lessonCalendarTab(parsedDate);
  const block = formatLessonBlockDisplay(lesson);
  const timeRange = formatLessonTimeRangeForDisplay(lesson);
  const statusKey = statusVariant(lesson.status);
  const statusLabel = statusDisplayLabel(lesson.status);
  const focus = lesson.lessonFocus.trim();
  const note = lesson.note.trim();
  const studentLabel = lesson.studentName.trim() || lesson.studentEmail;

  return (
    <div className="lesson-row">
      <div className="lesson-row__date" aria-hidden={tab ? undefined : true}>
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

      <div className="lesson-row__main">
        {variant === "link" ? (
          <Link
            to={`/students?student=${encodeURIComponent(lesson.studentEmail)}`}
            className="lesson-row__name"
          >
            {studentLabel}
          </Link>
        ) : (
          <span className="lesson-row__name">{studentLabel}</span>
        )}
        <span className="lesson-row__meta">
          <span>{block}</span>
          {focus ? (
            <>
              <span
                className="lesson-row__meta-divider"
                aria-hidden="true"
              >
                ·
              </span>
              <span className="lesson-row__focus">{focus}</span>
            </>
          ) : null}
        </span>
        {note ? <span className="lesson-row__meta">{note}</span> : null}
      </div>

      <div className="lesson-row__side">
        <span className={`status-pill status-pill--${statusKey}`}>
          {statusLabel}
        </span>
        {timeRange ? (
          <span className="lesson-row__time">{timeRange}</span>
        ) : null}
      </div>
    </div>
  );
}
