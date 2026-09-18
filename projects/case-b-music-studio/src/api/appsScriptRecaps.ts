/**
 * Phase 5 — Teacher recap client.
 *
 * One recap per lesson row, keyed by the same composite used by the
 * Phase 2 calendar actions: { studentEmail, lessonDate, startTime }.
 * The Apps Script side owns the schema (auto-creating the
 * "Lesson Recaps" tab on first save) — the frontend just composes,
 * reads, and lists.
 *
 * Flow:
 *   1. Profile panel opens → `listRecapsForStudent(email)` returns
 *      all of that student's recaps so each past lesson row can show
 *      "Recap" or "Write recap" without one extra round trip.
 *   2. Teacher clicks a lesson row → modal opens; if a recap exists
 *      `getLessonRecap(key)` pre-fills it, otherwise the modal is blank.
 *   3. Save → `saveLessonRecap(key, fields)` upserts and returns the
 *      saved recap; the parent re-fetches the student's recaps so
 *      the row updates.
 *   4. Recaps page → `listRecaps()` returns every recap, newest first.
 */
import { postToAppsScript, type AppsScriptPostInit } from "./appsScriptPost";
import type { LessonRecap } from "../types";

/** Composite key — must match a row in the Lesson Schedule tab. */
export type LessonRecapKey = {
  studentEmail: string;
  lessonDate: string;
  startTime: string;
};

/** Editable fields on the recap. The opener "Hi {Name}," is implicit. */
export type LessonRecapFields = {
  greeting: string;
  todayWe: string;
  homework: string;
  nextClass: string;
};

type GetResponse = {
  ok: true;
  recap: LessonRecap | null;
};

type SaveResponse = {
  ok: true;
  recap: LessonRecap;
};

type ListResponse = {
  ok: true;
  recaps: LessonRecap[];
};

/** Fetches one recap by lesson key. Returns null when none exists yet. */
export async function getLessonRecap(
  key: LessonRecapKey,
  init?: AppsScriptPostInit
): Promise<LessonRecap | null> {
  const result = await postToAppsScript<GetResponse>(
    "get-lesson-recap",
    keyAsPayload(key),
    init
  );
  return result.recap;
}

/**
 * Upserts the recap. Auto-creates the "Lesson Recaps" tab on first
 * save. Returns the saved recap exactly as stored (with server-assigned
 * `updatedAt` and roster-derived `studentName`).
 */
export async function saveLessonRecap(
  key: LessonRecapKey,
  fields: LessonRecapFields,
  init?: AppsScriptPostInit
): Promise<LessonRecap> {
  const payload = {
    ...keyAsPayload(key),
    fields: {
      greeting: fields.greeting ?? "",
      todayWe: fields.todayWe ?? "",
      homework: fields.homework ?? "",
      nextClass: fields.nextClass ?? "",
    },
  };
  const result = await postToAppsScript<SaveResponse>(
    "save-lesson-recap",
    payload,
    init
  );
  return result.recap;
}

/** All recaps for one student, sorted newest-first by the backend. */
export async function listRecapsForStudent(
  studentEmail: string,
  init?: AppsScriptPostInit
): Promise<LessonRecap[]> {
  const result = await postToAppsScript<ListResponse>(
    "list-recaps-for-student",
    { studentEmail: studentEmail.trim().toLowerCase() },
    init
  );
  return result.recaps;
}

/** Every recap in the system, sorted newest-first. */
export async function listRecaps(
  init?: AppsScriptPostInit
): Promise<LessonRecap[]> {
  const result = await postToAppsScript<ListResponse>(
    "list-recaps",
    {},
    init
  );
  return result.recaps;
}

function keyAsPayload(key: LessonRecapKey): Record<string, unknown> {
  return {
    studentEmail: key.studentEmail.trim().toLowerCase(),
    lessonDate: key.lessonDate.trim(),
    startTime: key.startTime.trim(),
  };
}

/** Stable string key for React lists / map lookups against a recap. */
export function lessonRecapKey(
  key: LessonRecapKey | LessonRecap
): string {
  return `${key.studentEmail.toLowerCase()}|${key.lessonDate}|${key.startTime}`;
}
