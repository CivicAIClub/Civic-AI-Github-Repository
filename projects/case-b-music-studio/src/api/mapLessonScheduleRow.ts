import type { ScheduledLesson } from "../types";

/** Row 1 headers in the "Lesson Schedule" tab — must match the sheet exactly. */
const SCHEDULE_KEYS = {
  studentEmail: "Student Email",
  studentName: "Student Name",
  lessonDate: "Lesson Date",
  lessonBlock: "Lesson Block",
  startTime: "Start Time",
  endTime: "End Time",
  status: "Status",
  lessonFocus: "Lesson Focus",
  note: "Note",
  noteAlt: "Notes",
} as const;

function cell(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  if (v == null) return "";
  return String(v).trim();
}

function cellNote(raw: Record<string, unknown>): string {
  const primary = cell(raw, SCHEDULE_KEYS.note);
  if (primary) return primary;
  return cell(raw, SCHEDULE_KEYS.noteAlt);
}

/**
 * Maps one Apps Script row object (keys = column titles) to ScheduledLesson.
 * Returns null if Student Email is missing (server should already skip these).
 */
export function mapScheduleRowToLesson(
  raw: Record<string, unknown>
): ScheduledLesson | null {
  const studentEmail = cell(raw, SCHEDULE_KEYS.studentEmail);
  if (!studentEmail) return null;

  return {
    studentEmail,
    studentName: cell(raw, SCHEDULE_KEYS.studentName),
    lessonDate: cell(raw, SCHEDULE_KEYS.lessonDate),
    lessonBlock: cell(raw, SCHEDULE_KEYS.lessonBlock),
    startTime: cell(raw, SCHEDULE_KEYS.startTime),
    endTime: cell(raw, SCHEDULE_KEYS.endTime),
    status: cell(raw, SCHEDULE_KEYS.status),
    lessonFocus: cell(raw, SCHEDULE_KEYS.lessonFocus),
    note: cellNote(raw),
  };
}
