/**
 * Initials for the student avatar. Uses the first letter of the first two
 * whitespace-delimited tokens — falls back to the first two characters of
 * the email local-part if the name is empty.
 */
export function studentInitials(name: string, fallback: string = ""): string {
  const tokens = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (tokens.length > 0) {
    return tokens.map((t) => t[0]!.toUpperCase()).join("");
  }
  const local = (fallback.split("@")[0] ?? "").trim();
  if (local.length === 0) return "—";
  if (local.length === 1) return local[0]!.toUpperCase();
  return (local[0]! + local[1]!).toUpperCase();
}

/** Map raw Status cell value to a known variant or "neutral" fallback. */
export type StatusVariant =
  | "scheduled"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "neutral";

export function statusVariant(status: string): StatusVariant {
  const normalized = status.trim().toLowerCase();
  if (!normalized || normalized === "scheduled") return "scheduled";
  if (normalized === "rescheduled") return "rescheduled";
  if (normalized === "completed") return "completed";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return "neutral";
}

/** Display label preserves whatever the teacher typed but defaults to Scheduled. */
export function statusDisplayLabel(status: string): string {
  const trimmed = status.trim();
  return trimmed.length ? trimmed : "Scheduled";
}

/**
 * Calendar-tab parts for the lesson date column (Day-of-week / day-of-month /
 * month). Pulls the parts from the same parsed Date that the rest of the app
 * uses, so YYYY-MM-DD vs ISO behave identically.
 */
export type LessonCalendarTab = {
  weekday: string;
  day: string;
  month: string;
};

export function lessonCalendarTab(
  parsedDate: Date | null
): LessonCalendarTab | null {
  if (!parsedDate) return null;
  return {
    weekday: parsedDate.toLocaleDateString(undefined, { weekday: "short" }),
    day: parsedDate.toLocaleDateString(undefined, { day: "numeric" }),
    month: parsedDate.toLocaleDateString(undefined, { month: "short" }),
  };
}
