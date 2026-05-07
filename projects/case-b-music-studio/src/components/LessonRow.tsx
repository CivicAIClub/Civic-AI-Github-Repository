import { useState } from "react";
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
 *
 * `onCancel` is optional. When passed, the row renders a small Cancel
 * button on the right-hand side for any lesson that currently has a
 * Calendar Event ID (i.e. is actually on the calendar). Clicking it
 * pops a confirm dialog, then calls the parent's handler. The parent
 * is responsible for actually deleting the calendar event and
 * refetching the schedule afterwards.
 */
export function LessonRow({
  lesson,
  variant = "link",
  onCancel,
}: {
  lesson: ScheduledLesson;
  variant?: Variant;
  onCancel?: (lesson: ScheduledLesson) => Promise<void> | void;
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

  const [cancelling, setCancelling] = useState(false);
  const canCancel =
    !!onCancel &&
    lesson.calendarEventId.trim() !== "" &&
    statusKey !== "cancelled" &&
    statusKey !== "completed";

  const handleCancelClick = async () => {
    if (!onCancel) return;
    const dateStr = tab
      ? `${tab.weekday} ${tab.day} ${tab.month}`
      : lesson.lessonDate;
    const confirmed = window.confirm(
      `Cancel ${studentLabel}'s lesson on ${dateStr} at ${timeRange || lesson.startTime}?\n\nThis will delete the Google Calendar event and notify everyone invited.`
    );
    if (!confirmed) return;
    setCancelling(true);
    try {
      await onCancel(lesson);
    } finally {
      setCancelling(false);
    }
  };

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
          <span className="lesson-row__date-num">?</span>
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
        {canCancel && (
          <button
            type="button"
            className="lesson-row__cancel"
            onClick={handleCancelClick}
            disabled={cancelling}
            title="Cancel this lesson and delete the calendar event"
          >
            {cancelling ? "Cancelling…" : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}
