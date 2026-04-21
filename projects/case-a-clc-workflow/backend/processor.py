"""
Transforms raw Canvas assignment data into a normalized, grouped schedule.

This module contains only pure functions — no I/O, no side effects.
All date/time conversion happens here using python-dateutil.

Output shape per normalized assignment:
{
  "day":            "Monday",
  "assignment":     "Hamlet Essay Draft",
  "course":         "AP English Literature",
  "due_time":       "11:59 PM",
  "priority":       "Due Soon",
  "days_until_due": 2,
  "due_date":       "2026-04-10",
  "week_start":     "2026-04-06",
  "url":            "https://school.instructure.com/courses/.../assignments/..."
}
"""

from datetime import date, datetime, timedelta
from typing import Any

from dateutil import tz


WEEKDAY_NAMES = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday",
]


def _compute_priority(days: int) -> str:
    """Map days-until-due to a human-readable priority label."""
    if days == 0:
        return "Today"
    if days == 1:
        return "Tomorrow"
    if days <= 3:
        return "Due Soon"
    if days <= 7:
        return "This Week"
    return "Upcoming"


def _week_start(d: date) -> date:
    """Return the Monday of the week containing date d."""
    return d - timedelta(days=d.weekday())


def normalize_assignment(
    raw: dict[str, Any],
    course_name: str,
    timezone_name: str = "America/New_York",
) -> dict[str, Any] | None:
    """Convert a raw Canvas assignment dict into a normalized shape.

    Returns None if:
    - The assignment has no due_at (no due date set in Canvas)
    - The assignment is already past due

    Canvas always returns due_at in UTC ISO-8601 format.
    We convert to the configured local timezone for display.
    """
    due_at_str: str | None = raw.get("due_at")
    if not due_at_str:
        return None

    local_tz = tz.gettz(timezone_name)
    due_utc = datetime.fromisoformat(due_at_str.replace("Z", "+00:00"))
    due_local = due_utc.astimezone(local_tz)

    today = datetime.now(local_tz).date()
    days_until = (due_local.date() - today).days

    # Skip assignments already past due
    if days_until < 0:
        return None

    # strftime("%-I") strips the leading zero on macOS/Linux (e.g. "9:00 PM" not "09:00 PM")
    # Cross-platform alternative: strftime("%I:%M %p").lstrip("0")
    due_time_str = due_local.strftime("%-I:%M %p")

    return {
        "day": WEEKDAY_NAMES[due_local.weekday()],
        "assignment": raw.get("name", "Untitled Assignment"),
        "course": course_name,
        "due_time": due_time_str,
        "priority": _compute_priority(days_until),
        "days_until_due": days_until,
        "due_date": due_local.date().isoformat(),
        "week_start": _week_start(due_local.date()).isoformat(),
        "url": raw.get("html_url", ""),
    }


def filter_upcoming(
    assignments: list[dict[str, Any]], weeks_ahead: int = 2
) -> list[dict[str, Any]]:
    """Keep only assignments due within the next `weeks_ahead` weeks."""
    cutoff_days = weeks_ahead * 7
    return [a for a in assignments if 0 <= a["days_until_due"] <= cutoff_days]


def group_by_week(
    assignments: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    """Group assignments by week, keyed by the Monday ISO date string.

    Example key: "2026-04-06"
    Assignments within each week are sorted by due_date ascending.
    """
    grouped: dict[str, list] = {}
    for a in sorted(assignments, key=lambda x: x["due_date"]):
        grouped.setdefault(a["week_start"], []).append(a)
    return grouped


def group_by_weekday(
    assignments: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return a Mon–Sun list with assignments grouped under each day.

    Each entry: {"day": "Monday", "assignments": [...sorted by due time...]}
    Days with no assignments still appear with an empty list so the
    Apps Script always renders a complete Mon–Sun week.
    """
    buckets: dict[str, list] = {day: [] for day in WEEKDAY_NAMES}

    for a in assignments:
        if a["day"] in buckets:
            buckets[a["day"]].append(a)

    # Sort each day's assignments: earliest due first, then alphabetically
    for day in WEEKDAY_NAMES:
        buckets[day].sort(key=lambda x: (x["days_until_due"], x["assignment"]))

    return [{"day": day, "assignments": buckets[day]} for day in WEEKDAY_NAMES]


def build_weekly_schedule(
    raw_pairs: list[tuple[dict[str, Any], str]],
    timezone_name: str = "America/New_York",
    weeks_ahead: int = 2,
) -> dict[str, Any]:
    """Full pipeline: raw Canvas tuples → structured weekly schedule.

    Args:
        raw_pairs:      list of (canvas_assignment_dict, course_name)
        timezone_name:  IANA timezone string (from .env TIMEZONE)
        weeks_ahead:    how many weeks forward to include

    Returns:
    {
      "weeks": {
        "2026-04-06": {
          "week_label": "Apr 6 – Apr 12",
          "days": [
            {"day": "Monday", "assignments": [...]},
            ...
          ]
        }
      },
      "total_assignments": 14,
      "generated_at": "2026-04-06T12:00:00"
    }
    """
    # Step 1: Normalize all raw Canvas assignments
    normalized = []
    for raw, course_name in raw_pairs:
        result = normalize_assignment(raw, course_name, timezone_name)
        if result is not None:
            normalized.append(result)

    # Step 2: Filter to the requested window
    upcoming = filter_upcoming(normalized, weeks_ahead)

    # Step 3: Group by week
    by_week = group_by_week(upcoming)

    # Step 4: Build the output structure
    weeks_output: dict[str, Any] = {}
    for week_start_str, week_assignments in by_week.items():
        week_start_date = date.fromisoformat(week_start_str)
        week_end_date = week_start_date + timedelta(days=6)

        # Human-readable label: "Apr 6 – Apr 12"
        label = (
            f"{week_start_date.strftime('%b %-d')} – "
            f"{week_end_date.strftime('%b %-d')}"
        )

        weeks_output[week_start_str] = {
            "week_label": label,
            "days": group_by_weekday(week_assignments),
        }

    return {
        "weeks": weeks_output,
        "total_assignments": len(upcoming),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
    }
