# Case A: CLC Workflow Automation

## Client

Supported Study Hall staff at the Center for Learning and Collaboration (CLC).

## Quick Start

TODO: developers fill in once setup is defined.

## Project Structure

TODO: document the code layout as files are added.

## Environment Variables

This project will need secrets for the Canvas LMS API and Google Workspace APIs. Add a `.env.example` file to this folder listing the variable names (no real values). Copy it to `.env` locally and fill in real credentials. `.env` is git-ignored at the repo root — never commit it.

## Team

- Luke Ryan
- Jack Weinberg

## Links

- [Main repo README](../../README.md)
- [Developer onboarding guide](../../docs/developer-onboarding.md)

## Solution: AutoPlanner

**Stack:** Python (FastAPI) + Google Apps Script + Vanilla HTML/JS

**Architecture:**

```
Frontend (index.html, static — can be GitHub Pages)
  → GET /api/assignments?canvas_token=…  → Canvas (per-student token from the teacher’s UI)
  → POST /api/generate-doc              → Apps Script → Google Doc (per student)
```

Teachers collect **each student’s** Canvas API token, paste them into the UI (one row per student), fetch everyone in parallel, preview on **tabs**, and export a **separate Google Doc** per student (stored in the browser by student row).

**Folder structure:**

```
case-a-clc-workflow/
├── backend/
│   ├── main.py           FastAPI routes
│   ├── canvas_api.py     Canvas REST client (pagination handled)
│   ├── processor.py      Data normalization and grouping
│   ├── google_docs.py    Apps Script HTTP client
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html        Single-page UI (no build step)
│   └── .nojekyll         Present for GitHub Pages (static files)
└── apps_script/
    └── Code.gs           Google Apps Script (copy into script.google.com)
```

## Setup

### Prerequisites

- Python 3.11+
- A Canvas LMS student account with API token access
- A Google account to deploy the Apps Script

### Step 1 — Get your Canvas API Token

1. Log into Canvas at your school's URL
2. Click your profile picture (top-right) → **Settings**
3. Scroll to **Approved Integrations** → click **+ New Access Token**
4. Give it a purpose (e.g. "AutoPlanner") — leave expiration blank for dev use
5. Copy the token (you will not see it again)

### Step 2 — Deploy the Google Apps Script

1. Go to [script.google.com](https://script.google.com) → click **New project**
2. Delete the default `myFunction` and paste the entire contents of `apps_script/Code.gs`
3. Click **Deploy** → **New deployment**
4. Type: **Web app**
5. Execute as: **Me**
6. Who has access: **Anyone**
7. Click **Deploy** → authorize when prompted → copy the **Web App URL**

### Step 3 — Configure the backend

```bash
cd projects/case-a-clc-workflow/backend
cp .env.example .env
# Open .env and fill in values:
#   APPS_SCRIPT_URL    — required (Web App URL from Step 2)
#   TIMEZONE           — e.g. America/New_York
#   CANVAS_API_TOKEN   — optional if the UI always sends each student’s token on GET /api/assignments
#   CANVAS_BASE_URL    — optional for the same reason (UI sends canvas_base_url query param)
```

### Step 4 — Install dependencies and run the backend

```bash
cd projects/case-a-clc-workflow/backend
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`.
Check `http://localhost:8000/health` — should return `{"status":"ok"}`.

### Step 5 — Open the frontend (local)

With uvicorn running, open **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** so the UI and API share one origin (leave **AutoPlanner API URL** blank).

Add students with **+ Add student**, paste each **Canvas API token**, set the shared **Canvas base URL**, then **Fetch all students**. Use the tabs to review each schedule; **Create / Update Google Doc** is per student.

### Step 6 — Public site (GitHub Pages) + hosted API

The UI in `frontend/` is static only. GitHub Pages cannot run Python.

1. **Deploy the FastAPI app** somewhere with HTTPS (Render, Railway, Fly.io, your school server, etc.). Set `APPS_SCRIPT_URL` (and optional defaults) in that host’s environment. CORS is already open (`allow_origins=["*"]`) for browser access.
2. **GitHub Actions:** `.github/workflows/deploy-case-a-pages.yml` uploads `projects/case-a-clc-workflow/frontend` to the repo’s GitHub Pages environment on pushes to `main` (or run **workflow_dispatch** manually). After deploy, open your Pages URL, set **AutoPlanner API URL** to your FastAPI base (no trailing slash required), then use the app as usual.

**Note:** This repo may also deploy other projects to the same `github-pages` environment. Only the most recent Pages deploy wins; coordinate with the team or trigger the workflow you need.

## Status

🟢 Multi-student UI, per-student Docs, and optional GitHub Pages deploy