/**
 * Google Apps Script “web app” client for your music studio.
 *
 * There are only two HTTP GET shapes your script should support:
 *
 * 1) Roster (directory / dashboard list)
 *    URL:  BASE_URL?action=list
 *    Body: JSON array of row objects, OR wrap the array in any of:
 *          { "students": [...] }  { "rows": [...] }  { "data": [...] }
 *    Each object should use the same column titles as your Google Form / Sheet
 *    (see mapSheetRowToProfile in mapSheetStudentResponse.ts).
 *    Multiple rows with the same Email Address are treated as separate form
 *    submissions; the app keeps the latest row for the roster and shows history
 *    on the student profile.
 *
 * 2) One student (profile panel — freshest row for that email)
 *    URL:  BASE_URL?email=student@example.com
 *    Body: one JSON object (same columns as above).
 *
 * Paste your deployed URL below (Publish → Deploy as web app → copy /exec).
 * Do not add ?query here — this file appends ?action=list or ?email=...
 */
import {
  mapSheetRowToProfile,
  type SheetStudentProfile,
} from "./mapSheetStudentResponse";
import { pickLatestProfileFromSubmissions } from "../lib/formSubmissionHistory";

export const APPS_SCRIPT_BASE_URL =
  "https://script.google.com/macros/s/AKfycbwQnBSy26Wo54JwOIMAbaCJf37qAPF_kHpBxIJrm8AanfmxRSmGJIBKjYdHuaU2yxpN9g/exec";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Some doGet handlers return { row: { ...sheet columns } } instead of a flat row.
 * If we map the wrapper, every column lookup misses and the profile looks empty.
 */
function extractSingleStudentRow(json: Record<string, unknown>): Record<string, unknown> {
  const wrapperCandidates = [
    "row",
    "student",
    "record",
    "data",
    "profile",
  ] as const;
  let best: Record<string, unknown> | null = null;
  let bestKeyCount = 0;
  for (const k of wrapperCandidates) {
    const inner = json[k];
    if (!isRecord(inner) || Array.isArray(inner)) continue;
    const n = Object.keys(inner).length;
    if (n > bestKeyCount) {
      bestKeyCount = n;
      best = inner;
    }
  }
  const outerKeys = Object.keys(json).length;
  if (best && bestKeyCount > outerKeys) return best;
  return json;
}

function extractRowArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (isRecord(json)) {
    if (Array.isArray(json.rows)) return json.rows;
    if (Array.isArray(json.students)) return json.students;
    if (Array.isArray(json.data)) return json.data;
  }
  throw new Error(
    'Roster response must be a JSON array, or an object with "rows", "students", or "data" array.'
  );
}

export type AllStudentsRosterResult = {
  /** Latest row per email (by form Timestamp / Date when present). */
  students: SheetStudentProfile[];
  /** All list rows grouped by lowercase email (sheet order preserved per key). */
  submissionsByEmail: Record<string, SheetStudentProfile[]>;
};

/**
 * Fetches everyone for the student list (Students page + Dashboard count/search).
 * Your Apps Script doGet should handle e.parameter.action === "list".
 */
export async function getAllStudents(
  init?: RequestInit
): Promise<AllStudentsRosterResult> {
  const url = `${APPS_SCRIPT_BASE_URL}?action=list`;

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
      `Could not read roster (HTTP ${res.status}). Is the web app URL correct?`
    );
  }

  if (isRecord(json) && typeof json.error === "string") {
    throw new Error(json.error);
  }

  if (!res.ok) {
    throw new Error(
      typeof json === "object" && json !== null && "error" in json
        ? String((json as { error: unknown }).error)
        : `Roster request failed (HTTP ${res.status}).`
    );
  }

  const rows = extractRowArray(json);
  const submissionsByEmail: Record<string, SheetStudentProfile[]> = {};

  for (const row of rows) {
    if (!isRecord(row)) continue;
    const profile = mapSheetRowToProfile(extractSingleStudentRow(row));
    const emailKey = profile.email.trim().toLowerCase();
    if (!emailKey) continue;
    if (!submissionsByEmail[emailKey]) submissionsByEmail[emailKey] = [];
    submissionsByEmail[emailKey].push(profile);
  }

  const students: SheetStudentProfile[] = [];
  for (const list of Object.values(submissionsByEmail)) {
    const latest = pickLatestProfileFromSubmissions(list);
    if (latest) students.push(latest);
  }

  return { students, submissionsByEmail };
}

/**
 * Fetches the latest saved row for one email (right-hand profile panel).
 * Uses encodeURIComponent so characters like + and @ are safe in the query string.
 * Pass AbortController.signal from React when the user switches students quickly.
 */
export async function getStudentByEmail(
  email: string,
  init?: RequestInit
): Promise<SheetStudentProfile> {
  const trimmed = email.trim();
  if (!trimmed) {
    throw new Error("Email is required to load a student from the sheet.");
  }

  const url = `${APPS_SCRIPT_BASE_URL}?email=${encodeURIComponent(trimmed)}`;

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
      `Could not read response (HTTP ${res.status}). Is the web app URL correct?`
    );
  }

  if (isRecord(json) && typeof json.error === "string") {
    throw new Error(json.error);
  }

  if (!res.ok) {
    throw new Error(
      typeof json === "object" && json !== null && "error" in json
        ? String((json as { error: unknown }).error)
        : `Request failed (HTTP ${res.status}).`
    );
  }

  if (!isRecord(json)) {
    throw new Error("Unexpected response: expected a JSON object (one row).");
  }

  return mapSheetRowToProfile(extractSingleStudentRow(json));
}
