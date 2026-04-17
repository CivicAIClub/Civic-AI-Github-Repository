/**
 * Lesson Schedule — Google Apps Script client (same BASE_URL as roster).
 *
 * Your script must read the tab named "Lesson Schedule" and expose:
 *   GET ?action=schedule-list          → JSON array of row objects
 *   GET ?action=schedule&email=…       → JSON array for that student only
 *
 * Merge instructions: see apps-script/lesson-schedule-doGet-snippet.js
 */
import { APPS_SCRIPT_BASE_URL } from "./appsScriptStudent";
import { mapScheduleRowToLesson } from "./mapLessonScheduleRow";
import type { ScheduledLesson } from "../types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function extractScheduleRowArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (isRecord(json)) {
    if (Array.isArray(json.rows)) return json.rows;
    if (Array.isArray(json.students)) return json.students;
    if (Array.isArray(json.data)) return json.data;
  }
  throw new Error(
    'Schedule response must be a JSON array, or an object with "rows", "students", or "data" array.'
  );
}

function mapScheduleResponse(json: unknown): ScheduledLesson[] {
  if (isRecord(json) && typeof json.error === "string") {
    throw new Error(json.error);
  }
  const rows = extractScheduleRowArray(json);
  const out: ScheduledLesson[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const lesson = mapScheduleRowToLesson(row);
    if (lesson) out.push(lesson);
  }
  return out;
}

export async function getScheduleList(
  init?: RequestInit
): Promise<ScheduledLesson[]> {
  const url = `${APPS_SCRIPT_BASE_URL}?action=schedule-list`;

  const res = await fetch(url, {
    method: "GET",
    ...init,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Could not read schedule (HTTP ${res.status}). Is the web app URL correct?`
    );
  }

  if (isRecord(json) && typeof json.error === "string") {
    throw new Error(json.error);
  }

  if (!res.ok) {
    throw new Error(
      typeof json === "object" && json !== null && "error" in json
        ? String((json as { error: unknown }).error)
        : `Schedule request failed (HTTP ${res.status}).`
    );
  }

  return mapScheduleResponse(json);
}

export async function getStudentSchedule(
  email: string,
  init?: RequestInit
): Promise<ScheduledLesson[]> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("Email is required to load a student schedule.");
  }

  const url = `${APPS_SCRIPT_BASE_URL}?action=schedule&email=${encodeURIComponent(trimmed)}`;

  const res = await fetch(url, {
    method: "GET",
    ...init,
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `Could not read student schedule (HTTP ${res.status}). Is the web app URL correct?`
    );
  }

  if (isRecord(json) && typeof json.error === "string") {
    throw new Error(json.error);
  }

  if (!res.ok) {
    throw new Error(
      typeof json === "object" && json !== null && "error" in json
        ? String((json as { error: unknown }).error)
        : `Student schedule request failed (HTTP ${res.status}).`
    );
  }

  return mapScheduleResponse(json);
}
