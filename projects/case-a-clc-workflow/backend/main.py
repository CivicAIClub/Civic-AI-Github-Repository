"""
AutoPlanner — FastAPI application.

Routes:
  GET  /api/assignments     Fetch and return processed weekly schedule from Canvas
  POST /api/generate-doc    Call Apps Script to create/update a Google Doc (nested document tabs per week)
  GET  /health              Health check

Run locally:
  cd projects/case-a-clc-workflow
  uvicorn backend.main:app --reload
  Open http://127.0.0.1:8000/ — the UI is served from the same server as the API.

You can still open frontend/index.html directly; set “AutoPlanner backend URL” to http://127.0.0.1:8000 if fetch fails.

The Canvas API token, Canvas base URL, Apps Script URL, and timezone are all
read from a .env file in the backend/ directory. Copy .env.example to .env
and fill in the values before running.
"""

import asyncio
import os
from pathlib import Path
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import AliasChoices, BaseModel, ConfigDict, Field

from backend.canvas_api import get_all_assignments, get_self_profile
from backend.google_docs import send_to_apps_script
from backend.processor import build_weekly_schedule

# Load .env from the backend/ directory regardless of where uvicorn is invoked from.
# Running `uvicorn backend.main:app` from case-a-clc-workflow/ means the working
# directory is case-a-clc-workflow/, not backend/ — so we resolve the path explicitly.
load_dotenv(Path(__file__).parent / ".env", override=True)

app = FastAPI(title="AutoPlanner API", version="1.0.0")

# Allow all origins for local development.
# In production, restrict to your specific frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def _get_env(key: str) -> str:
    """Return a required environment variable or raise a clear HTTP 500."""
    value = os.getenv(key)
    if not value:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Server misconfiguration: environment variable '{key}' is not set. "
                f"Copy backend/.env.example to backend/.env and fill in all values."
            ),
        )
    return value


# ---------------------------------------------------------------------------
# GET /api/assignments
# ---------------------------------------------------------------------------

@app.get("/api/assignments", summary="Fetch and process Canvas assignments")
async def get_assignments(
    weeks_ahead: int = Query(2, ge=1, le=12, description="Calendar weeks from this Monday"),
    canvas_token: Optional[str] = None,
    canvas_base_url: Optional[str] = None,
) -> dict[str, Any]:
    """Fetch all upcoming assignments from Canvas, normalize them, and return
    a structured weekly schedule grouped Mon–Sun.

    Query params:
      weeks_ahead (int, default 2): how many weeks forward to include
      canvas_token (str, optional): Canvas API token — overrides CANVAS_API_TOKEN in .env
      canvas_base_url (str, optional): Canvas base URL — overrides CANVAS_BASE_URL in .env

    Credentials passed as query params take priority over .env so the frontend
    UI works without any .env Canvas config.
    """
    token = canvas_token or _get_env("CANVAS_API_TOKEN")
    base_url = canvas_base_url or _get_env("CANVAS_BASE_URL")
    timezone_name = os.getenv("TIMEZONE", "America/New_York")

    try:
        # canvas_api.py uses synchronous httpx to keep it simple and testable.
        # asyncio.to_thread offloads it to a thread pool so we never block
        # FastAPI's async event loop.
        def _fetch_canvas():
            pairs = get_all_assignments(token, base_url)
            profile = get_self_profile(token, base_url)
            return pairs, profile

        raw_pairs, profile = await asyncio.to_thread(_fetch_canvas)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                f"Canvas API returned an error: "
                f"HTTP {exc.response.status_code} — {exc.response.text[:200]}"
            ),
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Canvas at {base_url}: {exc}",
        )

    schedule = build_weekly_schedule(raw_pairs, timezone_name, weeks_ahead)
    display_name = (
        (profile.get("name") or profile.get("short_name") or "Student") or "Student"
    )
    schedule["student_full_name"] = str(display_name).strip() or "Student"
    # Stable id for the token holder — used by the frontend to reuse the same Google Doc
    # across roster edits and browsers (per Canvas user), not the ephemeral UI row id.
    cid = profile.get("id")
    if cid is not None:
        schedule["canvas_user_id"] = cid
    return schedule


# ---------------------------------------------------------------------------
# POST /api/generate-doc
# ---------------------------------------------------------------------------

class GenerateDocRequest(BaseModel):
    """Schedule payload plus optional existing Google Doc to update."""

    model_config = ConfigDict(populate_by_name=True)

    weeks: dict[str, Any]
    total_assignments: int
    generated_at: str
    student_full_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("student_full_name", "studentFullName"),
        serialization_alias="studentFullName",
        description="From Canvas profile; used for the Google Doc title.",
    )
    document_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("documentId", "spreadsheetId"),
        serialization_alias="documentId",
        description="If set, add/update week tabs inside this Doc instead of creating a new file.",
    )


@app.post("/api/generate-doc", summary="Create or update Google Doc via Apps Script")
async def generate_doc(body: GenerateDocRequest) -> dict[str, Optional[str]]:
    """Send the weekly schedule to Apps Script, which writes **Google Docs**
    with nested **document tabs** (one tab per calendar week under ``CLC Planner``).
    Pass ``documentId`` from a prior response to reuse the same file.

    Returns:
      ``docUrl``, ``documentId`` (for localStorage / next requests).
    """
    script_url = _get_env("APPS_SCRIPT_URL").strip()

    try:
        result = await send_to_apps_script(
            script_url, body.model_dump(by_alias=True, exclude_none=True)
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                f"Apps Script returned an error: "
                f"HTTP {exc.response.status_code} — {exc.response.text[:200]}"
            ),
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                f"Could not reach Apps Script Web App: {exc}. "
                "Check APPS_SCRIPT_URL in backend/.env matches Deploy → Manage deployments "
                "(ends with /exec), deployment access is “Anyone”, no VPN/firewall blocking "
                "script.google.com, then restart uvicorn."
            ),
        )
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return result


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

@app.get("/health", summary="Health check")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# Serve the static frontend from the same origin as the API (avoids file:// + fetch issues).
_FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if _FRONTEND_DIR.is_dir():
    app.mount(
        "/",
        StaticFiles(directory=str(_FRONTEND_DIR), html=True),
        name="frontend",
    )
