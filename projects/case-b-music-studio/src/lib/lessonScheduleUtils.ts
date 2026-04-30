import type { ScheduledLesson } from "../types";

/** Trim; comparisons use lowercase where noted. */
export function normalizeStatus(status: string): string {
  return status.trim();
}

function statusLower(status: string): string {
  return normalizeStatus(status).toLowerCase();
}

/** Start of calendar day in local timezone (for school block scheduling). */
export function startOfLocalDay(d: Date): Date {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Parse lesson date for comparisons. Uses `lesson.lessonDate` (ISO or sheet string)
 * and ignores invalid values.
 */
export function lessonDateTime(lesson: ScheduledLesson): Date | null {
  const raw = lesson.lessonDate.trim();
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
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
 * Upcoming = lesson on/after local today AND status is Scheduled or Rescheduled.
 * Completed / Cancelled are excluded so the dashboard stays forward-looking.
 * (Tweak here when adding a calendar view.)
 */
export function isUpcomingLesson(lesson: ScheduledLesson, now: Date = new Date()): boolean {
  const st = statusLower(lesson.status);
  if (st === "completed" || st === "cancelled") return false;
  if (st !== "scheduled" && st !== "rescheduled") return false;

  const dt = lessonDateTime(lesson);
  if (!dt) return false;
  const dayStart = startOfLocalDay(now);
  const lessonDay = startOfLocalDay(dt);
  return lessonDay.getTime() >= dayStart.getTime();
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
 * History: completed, or lesson date before today. Cancelled rows are omitted.
 */
export function isPastOrCompletedRecent(lesson: ScheduledLesson, now: Date = new Date()): boolean {
  const st = statusLower(lesson.status);
  if (st === "cancelled") return false;
  if (st === "completed") return true;

  const dt = lessonDateTime(lesson);
  if (!dt) return false;
  const dayStart = startOfLocalDay(now);
  const lessonDay = startOfLocalDay(dt);
  return lessonDay.getTime() < dayStart.getTime();
}

export function compareLessonsByDateTimeDesc(a: ScheduledLesson, b: ScheduledLesson): number {
  return compareLessonsByDateTime(b, a);
}

export type StudentLessonPartition = {
  nextLesson: ScheduledLesson | null;
  upcomingLessons: ScheduledLesson[];
  recentLessons: ScheduledLesson[];
};

/**
 * Filter by student email, then split into next / rest of upcoming / recent history.
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
    .sort(compareLessonsByDateTimeDesc)
    .slice(0, 5);

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
