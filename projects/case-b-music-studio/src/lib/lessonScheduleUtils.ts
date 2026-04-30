import type { ScheduledLesson } from "../types";
import { parseSheetDate } from "./dateUtils";

/** Trim; comparisons use lowercase where noted. */
export function normalizeStatus(status: string): string {
  return status.trim();
}

/**
 * Treat a blank status cell as "scheduled" so a teacher who forgets to fill
 * the Status column still sees the lesson on the dashboard.
 */
function statusLowerOrDefault(status: string): string {
  const s = normalizeStatus(status).toLowerCase();
  return s.length ? s : "scheduled";
}

/** Start of calendar day in local timezone (for school block scheduling). */
export function startOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Parse lesson date for comparisons. Handles "yyyy-MM-dd" (date-only sheet
 * cells) as a local date, and ISO/other strings via the standard Date
 * constructor. Invalid values return null.
 */
export function lessonDateTime(lesson: ScheduledLesson): Date | null {
  return parseSheetDate(lesson.lessonDate);
}

/**
 * Combine the lesson date with the parsed end-time for same-day comparisons.
 * Returns null when either side is unparseable.
 */
function lessonEndDateTime(lesson: ScheduledLesson): Date | null {
  const day = lessonDateTime(lesson);
  if (!day) return null;
  const t = lesson.endTime.trim();
  const m = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(t);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = Number(m[2]);
  const period = m[3]?.toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  else if (period === "AM" && hour === 12) hour = 0;
  const result = new Date(day);
  result.setHours(hour, minute, 0, 0);
  return result;
}

/**
 * Apps Script formats time-only cells as wall-clock strings ("h:mm a"), so the
 * common case is "11:30 AM" / "1:02 PM". Display those as-is — never round-trip
 * through `new Date()`, which can latch onto today's date and break formatting.
 *
 * The 1899-12-30 ISO branches stay for backward compatibility with older Apps
 * Script deployments that haven't been updated yet.
 */
export function formatSheetTimeForDisplay(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  if (/^\d{1,2}:\d{2}(\s*[AP]M)?$/i.test(t)) return t;

  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;

  const y = d.getFullYear();
  if (y < 1905 || /1899-12-3[01]/i.test(t)) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return null;
}

/** "2:30 PM – 3:00 PM" only when at least one side is safe; never raw serial strings. */
export function formatLessonTimeRangeForDisplay(
  lesson: ScheduledLesson
): string | null {
  const a = formatSheetTimeForDisplay(lesson.startTime);
  const b = formatSheetTimeForDisplay(lesson.endTime);
  if (a && b) return `${a}–${b}`;
  if (a) return a;
  if (b) return b;
  return null;
}

/** Lesson block only (no raw sheet time strings in UI). */
export function formatLessonBlockDisplay(lesson: ScheduledLesson): string {
  const block = lesson.lessonBlock.trim();
  return block.length ? block : "—";
}

/**
 * Upcoming = future date OR same day with end time still ahead, AND status is
 * Scheduled / Rescheduled (or blank, treated as Scheduled). Completed and
 * Cancelled are excluded so the dashboard stays forward-looking. A same-day
 * lesson rolls off "Upcoming" once its end time has passed.
 */
export function isUpcomingLesson(lesson: ScheduledLesson, now: Date = new Date()): boolean {
  const st = statusLowerOrDefault(lesson.status);
  if (st === "completed" || st === "cancelled") return false;
  if (st !== "scheduled" && st !== "rescheduled") return false;

  const dt = lessonDateTime(lesson);
  if (!dt) return false;
  const dayStart = startOfLocalDay(now);
  const lessonDay = startOfLocalDay(dt);
  if (lessonDay.getTime() < dayStart.getTime()) return false;
  if (lessonDay.getTime() > dayStart.getTime()) return true;

  const endDt = lessonEndDateTime(lesson);
  if (!endDt) return true;
  return endDt.getTime() >= now.getTime();
}

function sortTimeKey(lesson: ScheduledLesson): string {
  const range = formatLessonTimeRangeForDisplay(lesson);
  if (range) return range;
  return lesson.lessonBlock.trim();
}

export function compareLessonsByDateTime(a: ScheduledLesson, b: ScheduledLesson): number {
  const da = lessonDateTime(a)?.getTime() ?? 0;
  const db = lessonDateTime(b)?.getTime() ?? 0;
  if (da !== db) return da - db;
  const ta = sortTimeKey(a);
  const tb = sortTimeKey(b);
  if (ta !== tb) return ta.localeCompare(tb, undefined, { sensitivity: "base" });
  return a.studentEmail.localeCompare(b.studentEmail, undefined, {
    sensitivity: "base",
  });
}

function emailKey(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * History: completed, lesson date before today, or same-day lesson whose end
 * time has passed. Cancelled rows are omitted.
 */
export function isPastOrCompletedRecent(lesson: ScheduledLesson, now: Date = new Date()): boolean {
  const st = statusLowerOrDefault(lesson.status);
  if (st === "cancelled") return false;
  if (st === "completed") return true;

  const dt = lessonDateTime(lesson);
  if (!dt) return false;
  const dayStart = startOfLocalDay(now);
  const lessonDay = startOfLocalDay(dt);
  if (lessonDay.getTime() < dayStart.getTime()) return true;
  if (lessonDay.getTime() > dayStart.getTime()) return false;

  const endDt = lessonEndDateTime(lesson);
  if (!endDt) return false;
  return endDt.getTime() < now.getTime();
}

export function compareLessonsByDateTimeDesc(a: ScheduledLesson, b: ScheduledLesson): number {
  return compareLessonsByDateTime(b, a);
}

export type StudentLessonPartition = {
  nextLesson: ScheduledLesson | null;
  upcomingLessons: ScheduledLesson[];
  /** All historical lessons newest-first; UI may cap how many it renders. */
  recentLessons: ScheduledLesson[];
};

/**
 * Filter by student email, then split into next / rest of upcoming / recent
 * history. The recent list is no longer pre-truncated so the UI can show a
 * count + "Show all" affordance instead of silently dropping rows.
 */
export function partitionStudentLessons(
  lessons: ScheduledLesson[],
  studentEmail: string
): StudentLessonPartition {
  const key = emailKey(studentEmail);
  const mine = lessons.filter((l) => emailKey(l.studentEmail) === key);

  const upcomingSorted = mine
    .filter((l) => isUpcomingLesson(l))
    .sort(compareLessonsByDateTime);

  const nextLesson = upcomingSorted[0] ?? null;
  const upcomingLessons = upcomingSorted.slice(1);

  const recentLessons = mine
    .filter((l) => isPastOrCompletedRecent(l))
    .sort(compareLessonsByDateTimeDesc);

  return { nextLesson, upcomingLessons, recentLessons };
}

/** Dashboard: all upcoming lessons, soonest first (cap optional in UI). */
export function upcomingLessonsSorted(lessons: ScheduledLesson[], now?: Date): ScheduledLesson[] {
  return lessons
    .filter((l) => isUpcomingLesson(l, now))
    .sort(compareLessonsByDateTime);
}

/** Stable-enough key for list items when the sheet has no row id. */
export function lessonStableKey(lesson: ScheduledLesson, index: number): string {
  return `${lesson.studentEmail}|${lesson.lessonDate}|${lesson.startTime}|${lesson.lessonBlock}|${index}`;
}

/**
 * Prefer block; only show times when safely formatted (never raw 1899-… strings).
 */
export function formatLessonBlockOrTime(lesson: ScheduledLesson): string {
  const block = lesson.lessonBlock.trim();
  if (block) return block;
  const range = formatLessonTimeRangeForDisplay(lesson);
  if (range) return range;
  return "—";
}
