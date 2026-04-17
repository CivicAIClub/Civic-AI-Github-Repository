import {
  parseAvailabilityBlocks,
  type SheetStudentProfile,
} from "./mapSheetStudentResponse";
import type { Student } from "../types";

function dash(s: string): string {
  const t = s.trim();
  return t.length ? t : "—";
}

/**
 * One row from the sheet → full Student for the UI (fields the sheet does not
 * send get safe defaults).
 */
export function sheetProfileToStudent(profile: SheetStudentProfile): Student | null {
  const email = profile.email.trim();
  if (!email) return null;

  return {
    id: email,
    sheetEmail: email,
    name: profile.name.trim() || email,
    formDate: profile.date,
    instrument: dash(profile.instrument),
    currentLevel: dash(profile.level),
    lastUpdated: profile.lastUpdated || "",
    goals: dash(profile.goals),
    musicExperience: dash(profile.experience),
    genre: dash(profile.genre),
    specificSong: dash(profile.specificSong),
    studentUpdates: dash(profile.studentUpdates),
    availabilityBlocks: parseAvailabilityBlocks(profile.availabilityRaw),
    theory: profile.theory.trim() || undefined,
    contactEmail: profile.email.trim() || undefined,
    teacherNotes: "—",
  };
}
