/**
 * Turns one row of Google Sheet / Form column headers into stable field names
 * the React app can use everywhere else.
 *
 * Header strings must match your Google Form / Sheet columns exactly.
 */
export type SheetStudentProfile = {
  name: string;
  /** Form "Date" column (submission or lesson date, depending on your form) */
  date: string;
  instrument: string;
  genre: string;
  specificSong: string;
  experience: string;
  level: string;
  goals: string;
  theory: string;
  email: string;
  studentUpdates: string;
  /** Raw cell from "Lesson Availability/ Preferable Time" (often comma-separated) */
  availabilityRaw: string;
  /** ISO when parsable; otherwise raw Timestamp cell */
  lastUpdated: string;
};

/** Canonical Apps Script / Sheet column title for lesson availability (exact string). */
export const LESSON_AVAILABILITY_SHEET_KEY =
  "Lesson Availability/ Preferable Time" as const;

const LESSON_AVAILABILITY_KEY_CANDIDATES: readonly string[] = [
  LESSON_AVAILABILITY_SHEET_KEY,
  "Lesson Availability / Preferable Time",
  "Lesson Availability/Preferable Time",
  "Lesson Availability/ Preferred Time",
  "Lesson Availability / Preferred Time",
  // Historical typo from the original Google Form ("Availablity" — missing
  // the second "i"). Existing form-response rows still carry it; keep the
  // exact-match fast path so we don't fall through to the heuristic.
  "Lesson Availablity/ Preferable Time",
  "Lesson Availablity / Preferable Time",
  "Lesson Availablity/Preferable Time",
];

/** Exact Google Form / Sheet column titles */
const SHEET_KEYS = {
  name: "Name",
  date: "Date",
  instrument: "What instrument do you want to play?",
  genre: "What genre of music do you want to learn?",
  specificSong: "Any specific song you want to learn?",
  experience: "How long have you been playing?",
  level: "What would you rate your skill level?",
  goals: "Goal of the Private Lesson",
  theory: "How much do you know about Music Theory?",
  email: "Email Address",
  studentUpdates: "Any updates? Questions?",
  availability: LESSON_AVAILABILITY_SHEET_KEY,
  timestamp: "Timestamp",
} as const;

function cell(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  if (v == null) return "";
  return String(v).trim();
}

/**
 * Sheet / Apps Script cells are sometimes arrays (checkbox columns) instead of
 * a single comma-separated string.
 */
function coerceSheetTextValue(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v
      .map((x) => (x == null ? "" : String(x).trim()))
      .filter(Boolean)
      .join(", ");
  }
  return String(v).trim();
}

/** Normalize header text so spacing around "/" and between words still matches. */
function normalizeSheetHeaderKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/\uFF0F/g, "/") // fullwidth solidus (common in pasted headers)
    .replace(/\u2044/g, "/") // fraction slash
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ");
}

/** Last-resort: column title clearly about lesson scheduling / availability. */
function lessonAvailabilityColumnKeyHeuristic(key: string): boolean {
  const n = normalizeSheetHeaderKey(key);
  if (!n.includes("lesson")) return false;
  if (n.includes("preferable") || n.includes("preferred")) return true;
  if (n.includes("avail") && (n.includes("time") || n.includes("block")))
    return true;
  return false;
}

/**
 * Reads the lesson availability cell even if the sheet header differs slightly
 * (spaces around "/", "Preferred" vs "Preferable", etc.).
 */
function readLessonAvailabilityFromRow(raw: Record<string, unknown>): string {
  for (const key of LESSON_AVAILABILITY_KEY_CANDIDATES) {
    const v = coerceSheetTextValue(raw[key]);
    if (v !== "") return v;
  }

  const accepted = new Set([
    "lesson availability/preferable time",
    "lesson availability/preferred time",
  ]);

  for (const key of Object.keys(raw)) {
    if (accepted.has(normalizeSheetHeaderKey(key))) {
      const v = coerceSheetTextValue(raw[key]);
      if (v !== "") return v;
    }
  }

  for (const key of Object.keys(raw)) {
    if (!lessonAvailabilityColumnKeyHeuristic(key)) continue;
    const v = coerceSheetTextValue(raw[key]);
    if (v !== "") return v;
  }

  return "";
}

/**
 * If Google returns a recognizable date/time, store ISO; otherwise raw text.
 */
function normalizeDateLike(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return trimmed;
}

/** Form checkbox column often arrives as "A Block, D Block, F Block". */
export function parseAvailabilityBlocks(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[,;\n|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mapSheetRowToProfile(
  raw: Record<string, unknown>
): SheetStudentProfile {
  return {
    name: cell(raw, SHEET_KEYS.name),
    date: normalizeDateLike(cell(raw, SHEET_KEYS.date)),
    instrument: cell(raw, SHEET_KEYS.instrument),
    genre: cell(raw, SHEET_KEYS.genre),
    specificSong: cell(raw, SHEET_KEYS.specificSong),
    experience: cell(raw, SHEET_KEYS.experience),
    level: cell(raw, SHEET_KEYS.level),
    goals: cell(raw, SHEET_KEYS.goals),
    theory: cell(raw, SHEET_KEYS.theory),
    email: cell(raw, SHEET_KEYS.email),
    studentUpdates: cell(raw, SHEET_KEYS.studentUpdates),
    availabilityRaw: readLessonAvailabilityFromRow(raw),
    lastUpdated: normalizeDateLike(cell(raw, SHEET_KEYS.timestamp)),
  };
}
