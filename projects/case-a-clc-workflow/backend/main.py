"""
AutoPlanner — FastAPI application.

Routes:
  GET  /api/assignments     Fetch and return processed weekly schedule from Canvas
  POST /api/generate-doc    Call Apps Script Web App to create a Google Doc
  GET  /health              Health check

Run locally:
  uvicorn backend.main:app --reload

The Canvas API token, Canvas base URL, Apps Script URL, and timezone are all
read from a .env file in the backend/ directory. Copy .env.example to .env
and fill in the values before running.
"""

import asyncio
import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.canvas_api import get_all_assignments
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
    weeks_ahead: int = 2,
    canvas_token: str | None = None,
    canvas_base_url: str | None = None,
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
        raw_pairs = await asyncio.to_thread(get_all_assignments, token, base_url)
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
    return schedule


# ---------------------------------------------------------------------------
# POST /api/generate-doc
# ---------------------------------------------------------------------------

class GenerateDocRequest(BaseModel):
    """Mirrors the output shape of build_weekly_schedule()."""
    weeks: dict[str, Any]
    total_assignments: int
    generated_at: str


@app.post("/api/generate-doc", summary="Create a Google Doc via Apps Script")
async def generate_doc(body: GenerateDocRequest) -> dict[str, str]:
    """Send the weekly schedule to the Google Apps Script Web App, which
    creates a formatted Google Doc and returns its URL.

    Returns:
      {"docUrl": "https://docs.google.com/document/d/..."}
    """
    script_url = _get_env("APPS_SCRIPT_URL")

    try:
        doc_url = await send_to_apps_script(script_url, body.model_dump())
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
            detail=f"Could not reach Apps Script Web App: {exc}",
        )
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return {"docUrl": doc_url}


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------

@app.get("/health", summary="Health check")
async def health() -> dict[str, str]:
    return {"status": "ok"}
