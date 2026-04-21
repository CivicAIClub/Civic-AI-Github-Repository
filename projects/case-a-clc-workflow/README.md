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
Frontend (index.html)
  → GET /api/assignments  → Canvas LMS REST API (paginated)
                          → Normalize + group by week (processor.py)
  → POST /api/generate-doc → Google Apps Script Web App
                           → Google Doc with formatted table
                           ← Returns Google Doc URL
```

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
│   └── index.html        Single-page UI (no build step)
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
# Open .env and fill in all four values:
#   CANVAS_API_TOKEN   — the token from Step 1
#   CANVAS_BASE_URL    — e.g. https://pomfret.instructure.com
#   APPS_SCRIPT_URL    — the Web App URL from Step 2
#   TIMEZONE           — e.g. America/New_York
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

### Step 5 — Open the frontend
Open `frontend/index.html` directly in your browser (no server needed — just double-click the file).

Enter your Canvas Base URL and API Token, select how many weeks to fetch, and click **Fetch Assignments**. Once the preview renders, click **Generate Google Doc** to create the document.

## Status
🟢 Initial build complete — ready for local testing
