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
  /** ISO when parsable; otherwise raw Timestamp cell */
  lastUpdated: string;
};

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
  timestamp: "Timestamp",
} as const;

function cell(raw: Record<string, unknown>, key: string): string {
  const v = raw[key];
  if (v == null) return "";
  return String(v).trim();
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
    lastUpdated: normalizeDateLike(cell(raw, SHEET_KEYS.timestamp)),
  };
}
