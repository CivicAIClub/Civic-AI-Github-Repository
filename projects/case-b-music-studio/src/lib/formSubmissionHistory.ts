import type { SheetStudentProfile } from "../api/mapSheetStudentResponse";
import type { ProfileFieldChange } from "./studentProfileSnapshots";

const FORM_HISTORY_FIELDS: {
  key: keyof SheetStudentProfile;
  label: string;
}[] = [
  { key: "name", label: "Name" },
  { key: "date", label: "Date" },
  { key: "instrument", label: "Instrument" },
  { key: "genre", label: "Genre" },
  { key: "specificSong", label: "Specific song" },
  { key: "experience", label: "How long playing" },
  { key: "level", label: "Skill level" },
  { key: "goals", label: "Lesson goals" },
  { key: "theory", label: "Music theory" },
  { key: "studentUpdates", label: "Updates / questions" },
  { key: "availabilityRaw", label: "Lesson availability" },
];

export function submissionSortTimeMs(p: SheetStudentProfile): number {
  const t = Date.parse(p.lastUpdated);
  if (!Number.isNaN(t)) return t;
  const d = Date.parse(p.date);
  if (!Number.isNaN(d)) return d;
  return 0;
}

/** Oldest → newest (timeline order). */
export function sortSubmissionsOldestFirst(
  list: SheetStudentProfile[]
): SheetStudentProfile[] {
  return [...list].sort(
    (a, b) => submissionSortTimeMs(a) - submissionSortTimeMs(b)
  );
}

export function pickLatestProfileFromSubmissions(
  list: SheetStudentProfile[]
): SheetStudentProfile | undefined {
  if (!list.length) return undefined;
  return [...list].sort(
    (a, b) => submissionSortTimeMs(b) - submissionSortTimeMs(a)
  )[0];
}

/** Compare two sheet rows (same student); ignores email & form Timestamp. */
export function diffFormSubmissions(
  previous: SheetStudentProfile,
  current: SheetStudentProfile
): ProfileFieldChange[] {
  const changes: ProfileFieldChange[] = [];
  for (const { key, label } of FORM_HISTORY_FIELDS) {
    const before = String(previous[key] ?? "").trim();
    const after = String(current[key] ?? "").trim();
    if (before !== after) {
      changes.push({
        label,
        before: before.length ? before : "—",
        after: after.length ? after : "—",
      });
    }
  }
  return changes;
}
