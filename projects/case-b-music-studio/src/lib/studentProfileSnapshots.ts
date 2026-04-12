import type { SheetStudentProfile } from "../api/mapSheetStudentResponse";

const STORAGE_KEY = "musicStudio.caseB.studentProfileSnapshots.v1";

type StoredMap = Record<string, SheetStudentProfile>;

function emailKey(email: string): string {
  return email.trim().toLowerCase();
}

/** Rehydrate profile from localStorage (supports older snapshots missing newer keys). */
function profileFromStoredRow(row: Record<string, unknown>): SheetStudentProfile {
  return {
    name: String(row.name ?? ""),
    date: String(row.date ?? ""),
    instrument: String(row.instrument ?? ""),
    genre: String(row.genre ?? ""),
    specificSong: String(row.specificSong ?? ""),
    experience: String(row.experience ?? ""),
    level: String(row.level ?? ""),
    goals: String(row.goals ?? ""),
    theory: String(row.theory ?? ""),
    email: String(row.email ?? ""),
    studentUpdates: String(row.studentUpdates ?? ""),
    lastUpdated: String(row.lastUpdated ?? ""),
  };
}

/** Last roster row we saw per student (used next visit to compute “what changed”). */
export function loadProfileSnapshots(): StoredMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: StoredMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (!v || typeof v !== "object" || Array.isArray(v)) continue;
      out[k] = profileFromStoredRow(v as Record<string, unknown>);
    }
    return out;
  } catch {
    return {};
  }
}

/** Call after a successful roster fetch so the next visit can diff against this. */
export function saveProfileSnapshots(profiles: SheetStudentProfile[]): void {
  try {
    const next: StoredMap = {};
    for (const p of profiles) {
      const k = emailKey(p.email);
      if (!k) continue;
      next[k] = { ...p };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}

const TRACKED_FIELDS: { key: keyof SheetStudentProfile; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "date", label: "Date" },
  { key: "instrument", label: "Instrument" },
  { key: "genre", label: "Genre" },
  { key: "specificSong", label: "Specific song" },
  { key: "experience", label: "Experience" },
  { key: "level", label: "Level" },
  { key: "goals", label: "Goals" },
  { key: "theory", label: "Music theory" },
  { key: "email", label: "Email" },
  { key: "studentUpdates", label: "Updates / questions" },
  { key: "lastUpdated", label: "Last updated" },
];

export type ProfileFieldChange = {
  label: string;
  before: string;
  after: string;
};

/** Compare two sheet-backed profiles; empty if identical. */
export function diffSheetProfiles(
  previous: SheetStudentProfile,
  current: SheetStudentProfile
): ProfileFieldChange[] {
  const changes: ProfileFieldChange[] = [];
  for (const { key, label } of TRACKED_FIELDS) {
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

function profileTimeMs(p: SheetStudentProfile): number {
  const t = Date.parse(p.lastUpdated);
  return Number.isNaN(t) ? 0 : t;
}

export type DashboardProfileUpdate =
  | {
      kind: "new_on_roster";
      profile: SheetStudentProfile;
    }
  | {
      kind: "fields_changed";
      profile: SheetStudentProfile;
      changes: ProfileFieldChange[];
    };

/**
 * Builds what to show under “Recent student updates” since the last time
 * snapshots were saved (previous dashboard or Students roster load — same key).
 */
export function computeProfileUpdatesSinceLastVisit(
  previousByEmail: StoredMap,
  currentProfiles: SheetStudentProfile[]
): {
  isBaselineVisit: boolean;
  updates: DashboardProfileUpdate[];
} {
  const isBaselineVisit = Object.keys(previousByEmail).length === 0;

  const updates: DashboardProfileUpdate[] = [];

  if (isBaselineVisit) {
    return { isBaselineVisit: true, updates: [] };
  }

  for (const profile of currentProfiles) {
    const k = emailKey(profile.email);
    if (!k) continue;
    const prev = previousByEmail[k];
    if (!prev) {
      updates.push({ kind: "new_on_roster", profile });
      continue;
    }
    const changes = diffSheetProfiles(prev, profile);
    if (changes.length > 0) {
      updates.push({ kind: "fields_changed", profile, changes });
    }
  }

  updates.sort(
    (a, b) => profileTimeMs(b.profile) - profileTimeMs(a.profile)
  );

  return { isBaselineVisit: false, updates };
}
