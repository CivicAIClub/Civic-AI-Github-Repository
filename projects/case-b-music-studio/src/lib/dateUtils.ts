/**
 * Apps Script sends date-only sheet cells as "yyyy-MM-dd" strings. JavaScript's
 * `new Date("2026-04-30")` interprets that as UTC midnight, which can roll
 * back to the previous day for viewers west of UTC. Parse those as local
 * dates so the calendar day matches what the teacher typed.
 *
 * ISO timestamps (with a time component) and other date-like strings fall
 * through to the standard Date constructor.
 */
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseSheetDate(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  const m = DATE_ONLY_RE.exec(t);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export function formatLessonDateLong(raw: string): string {
  const d = parseSheetDate(raw);
  if (!d) return raw.trim() || "—";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLessonDateShort(raw: string): string {
  const d = parseSheetDate(raw);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimestampLong(raw: string): string {
  const d = parseSheetDate(raw);
  if (!d) return raw.trim() || "—";
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
