/**
 * Phase 2 — Calendar event creation client.
 *
 * Each action targets one row in the "Lesson Schedule" sheet, identified
 * by the composite key { studentEmail, lessonDate, startTime }. The Apps
 * Script side (`apps-script/Code.gs`) does the row lookup and writes
 * back the resulting Calendar Event ID + Status.
 *
 * Flow:
 *   1. Dashboard renders pending lessons (no Calendar Event ID yet).
 *   2. Teacher clicks Preview → frontend calls `previewCalendarEvent`
 *      to fetch event details *without* touching the calendar.
 *   3. Modal renders preview → teacher confirms → frontend calls
 *      `createCalendarEvent` which actually creates the event and
 *      sends Google Calendar invites to all attendees.
 *   4. Frontend re-fetches the schedule; the row now has a Calendar
 *      Event ID and Status="Scheduled" so it moves out of Pending and
 *      into Upcoming.
 */
import { postToAppsScript, type AppsScriptPostInit } from "./appsScriptPost";

/** Composite key — must match a row in the Lesson Schedule sheet. */
export type LessonRowKey = {
  studentEmail: string;
  lessonDate: string;
  startTime: string;
};

/**
 * Calendar event metadata as the frontend renders it. The backend builds
 * this for both preview (no side effects) and create (returns the same
 * shape under `preview` when the row was already scheduled).
 */
export type EventPreview = {
  title: string;
  /** ISO timestamp the calendar event will start at (in the spreadsheet's TZ). */
  startISO: string;
  /** ISO timestamp the calendar event will end at. */
  endISO: string;
  /** Email addresses that will receive Google Calendar invites. */
  attendees: string[];
  /** Plain-text body of the event description. */
  description: string;
  /** Display name of the calendar the event will land on. */
  calendarName: string;
  /** True if a Calendar Event ID is already on the sheet row. */
  alreadyScheduled: boolean;
  /** Existing event ID when alreadyScheduled is true. */
  calendarEventId: string | null;
  studentEmail: string;
  studentName: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
};

type PreviewResponse = {
  ok: true;
  preview: EventPreview;
};

type CreateResponse = {
  ok: true;
  alreadyScheduled: boolean;
  calendarEventId: string;
  eventLink: string | null;
  /** Present when the event already existed; the backend returns its preview shape. */
  preview?: EventPreview;
};

type CancelResponse = {
  ok: true;
  cancelled: true;
};

/** Reads the lesson row and returns the proposed calendar event details. */
export async function previewCalendarEvent(
  key: LessonRowKey,
  init?: AppsScriptPostInit
): Promise<EventPreview> {
  const result = await postToAppsScript<PreviewResponse>(
    "preview-event",
    keyAsPayload(key),
    init
  );
  return result.preview;
}

/**
 * Creates the calendar event, sends invites, writes the Event ID back
 * to the sheet row. Idempotent: returns `alreadyScheduled: true` plus
 * the existing event ID without creating a duplicate.
 */
export async function createCalendarEvent(
  key: LessonRowKey,
  init?: AppsScriptPostInit
): Promise<{ calendarEventId: string; alreadyScheduled: boolean; eventLink: string | null }> {
  const result = await postToAppsScript<CreateResponse>(
    "create-event",
    keyAsPayload(key),
    init
  );
  return {
    calendarEventId: result.calendarEventId,
    alreadyScheduled: result.alreadyScheduled,
    eventLink: result.eventLink,
  };
}

/**
 * Cancels and clears the calendar event for this lesson. Sets the
 * row's Status to "Cancelled" so it drops out of Pending and Upcoming.
 */
export async function cancelCalendarEvent(
  key: LessonRowKey,
  init?: AppsScriptPostInit
): Promise<void> {
  await postToAppsScript<CancelResponse>(
    "cancel-event",
    keyAsPayload(key),
    init
  );
}

function keyAsPayload(key: LessonRowKey): Record<string, unknown> {
  return {
    studentEmail: key.studentEmail.trim(),
    lessonDate: key.lessonDate.trim(),
    startTime: key.startTime.trim(),
  };
}
