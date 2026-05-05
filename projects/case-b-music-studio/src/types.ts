export type Student = {
  id: string;
  name: string;
  /** Google Form "Date" when present */
  formDate: string;
  instrument: string;
  currentLevel: string;
  lastUpdated: string;
  goals: string;
  musicExperience: string;
  /** "What genre of music do you want to learn?" */
  genre: string;
  /** "Any specific song you want to learn?" */
  specificSong: string;
  /** "Any updates? Questions?" */
  studentUpdates: string;
  /** Parsed from "Lesson Availability/ Preferable Time" (e.g. block labels) */
  availabilityBlocks: string[];
  /** Local / session edits until a backend exists */
  teacherNotes: string;
  /** When set, the profile panel loads this row from Google Apps Script by email */
  sheetEmail?: string;
  theory?: string;
  /** From sheet column "Email Address" when loaded via Apps Script */
  contactEmail?: string;
};

/** One booked lesson row from the "Lesson Schedule" sheet (via Apps Script). */
export type ScheduledLesson = {
  studentEmail: string;
  studentName: string;
  lessonDate: string;
  lessonBlock: string;
  startTime: string;
  endTime: string;
  status: string;
  lessonFocus: string;
  /** From sheet column "Note" or "Notes" */
  note: string;
  /**
   * Phase 2: Google Calendar event ID once the lesson has been
   * auto-scheduled. Empty string when the lesson is still pending.
   * Auto-populated by the `create-event` Apps Script action.
   */
  calendarEventId: string;
};

/**
 * Phase 5: structured teacher recap for one lesson row. Keyed by the
 * same composite (studentEmail, lessonDate, startTime) used by
 * Phase 2's calendar actions, so a recap binds permanently to the
 * lesson instance it was written for.
 *
 * The four body fields are plain multiline text — line breaks are
 * preserved by the renderer (CSS `white-space: pre-wrap`). The
 * "Hi {Name}," opener is rendered automatically from the student
 * roster name; the teacher only types the rest of the greeting.
 */
export type LessonRecap = {
  studentEmail: string;
  studentName: string;
  lessonDate: string;
  startTime: string;
  greeting: string;
  todayWe: string;
  homework: string;
  nextClass: string;
  /** ISO timestamp from the spreadsheet's TZ (set server-side on save). */
  updatedAt: string;
};
