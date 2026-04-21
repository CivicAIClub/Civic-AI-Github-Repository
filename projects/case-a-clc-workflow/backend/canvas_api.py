"""
Canvas LMS REST API client.

Canvas API Reference: https://canvas.instructure.com/doc/api/

Example course object (abbreviated):
{
  "id": 12345,
  "name": "AP English Literature",
  "course_code": "ENG-AP",
  "enrollment_term_id": 7,
  "workflow_state": "available"
}

Example assignment object (abbreviated):
{
  "id": 98765,
  "name": "Hamlet Essay Draft",
  "due_at": "2026-04-10T23:59:00Z",
  "points_possible": 100,
  "submission_types": ["online_upload"],
  "html_url": "https://school.instructure.com/courses/12345/assignments/98765",
  "course_id": 12345
}
"""

import re
from typing import Any

import httpx


def _build_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _paginate(token: str, url: str, params: dict | None = None) -> list[dict]:
    """Follow Canvas Link-header pagination and return all results.

    Canvas signals the next page via a Link header:
      Link: <https://...?page=2&per_page=100>; rel="next", ...

    We follow every "next" link until there are no more pages.
    """
    headers = _build_headers(token)
    results: list[dict] = []
    next_url: str | None = url

    with httpx.Client(timeout=30.0) as client:
        while next_url:
            response = client.get(next_url, headers=headers, params=params)
            response.raise_for_status()
            results.extend(response.json())

            # params are already encoded in next_url after the first request
            params = None

            link_header = response.headers.get("Link", "")
            match = re.search(r'<([^>]+)>;\s*rel="next"', link_header)
            next_url = match.group(1) if match else None

    return results


def get_active_courses(token: str, base_url: str) -> list[dict[str, Any]]:
    """Return all courses where the caller is an active student.

    Filters out concluded, deleted, and non-student enrollments so we never
    surface assignments from courses the student already finished.
    """
    url = f"{base_url.rstrip('/')}/api/v1/courses"
    params = {
        "enrollment_type": "student",
        "enrollment_state": "active",
        "state[]": "available",
        "per_page": 100,
    }
    courses = _paginate(token, url, params)
    return [c for c in courses if c.get("workflow_state") == "available"]


def get_assignments_for_course(
    token: str, base_url: str, course_id: int
) -> list[dict[str, Any]]:
    """Return upcoming assignments for a single course.

    Uses bucket=upcoming so Canvas pre-filters to assignments with
    due_at >= now, reducing payload for students with many past submissions.
    Assignments without due dates are excluded server-side by this filter.
    """
    url = f"{base_url.rstrip('/')}/api/v1/courses/{course_id}/assignments"
    params = {
        "bucket": "upcoming",
        "order_by": "due_at",
        "per_page": 100,
    }
    assignments = _paginate(token, url, params)

    # Inject course_id so processor.py can correlate without extra lookups
    for a in assignments:
        a["_course_id"] = course_id

    return assignments


def get_all_assignments(
    token: str, base_url: str
) -> list[tuple[dict[str, Any], str]]:
    """Aggregate upcoming assignments from all active courses.

    Returns a list of (assignment_dict, course_name) tuples so the processor
    does not need to re-join on course ID.
    """
    courses = get_active_courses(token, base_url)
    all_assignments: list[tuple[dict[str, Any], str]] = []

    for course in courses:
        course_id = course["id"]
        course_name = course.get("name", f"Course {course_id}")
        assignments = get_assignments_for_course(token, base_url, course_id)
        for assignment in assignments:
            all_assignments.append((assignment, course_name))

    return all_assignments
