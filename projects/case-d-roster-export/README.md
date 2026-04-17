# Case D: Roster Export Automation

## Client
Mr. Ring

## Problem
Canvas lacks a clean, one-click export for class rosters. Every midterm and finals, teachers manually copy rosters out of Canvas, paste-special them into Google Sheets to strip hyperlinks, move names into a Google Doc to write comments, then copy those comments into Sundial (Blackbaud MySchoolApp), export a PDF, and email it to their department head.

## Goal
A frictionless tool to:
1. Pull the roster from Canvas automatically
2. Generate a clean Google Doc per class for writing comments
3. (Phase 2) Push finished comments back into Sundial via API

## Solution Architecture
- **Platform**: Google Apps Script (lives inside a Google Sheet — no server)
- **Data source**: Canvas REST API (personal bearer token per teacher)
- **Output**: Drive folder with one Google Doc per class, one tab per student

```
Drive Folder: "Comments — Fall Midterm"
├── Doc: "Hum 2 — Fall Midterm"
│     ├── Tab: "Adams, John"       → comment area
│     ├── Tab: "Baker, Sarah"      → comment area
│     └── Tab: "Chen, Michael"     → comment area
└── Doc: "Adv Writing — Fall Midterm"
      ├── Tab: "Garcia, Ana"       → comment area
      └── Tab: "Kim, David"        → comment area
```

## Files
| File | Purpose |
|------|---------|
| `Code.gs` | Menu setup, orchestration, main flow |
| `CanvasAPI.gs` | Canvas REST API wrapper (courses + rosters, paginated) |
| `DocBuilder.gs` | Creates Drive folder, one doc per class, tabs per student |
| `DocReader.gs` | Reads completed docs back (for Sundial export) |
| `SundialAPI.gs` | Blackbaud SKY API placeholder (Phase 2) |
| `TokenDialog.html` | Canvas API token setup UI |
| `CourseSelector.html` | Course picker + results display |
| `SundialSetup.html` | Sundial credentials UI |
| `ExportDialog.html` | Export to Sundial UI with per-class preview |
| `appsscript.json` | Apps Script manifest + OAuth scopes |

## Setup (Teacher Instructions)
1. Open a Google Sheet → **Extensions → Apps Script**
2. Copy each `.gs` and `.html` file into the Apps Script editor
3. Paste `appsscript.json` into the manifest (View → Show manifest file)
4. Save, reload the Google Sheet — the **"Canvas Tools"** menu will appear
5. **Canvas Tools → Set Canvas API Token**
   - Canvas URL (e.g., `https://pomfret.instructure.com`)
   - Token from Canvas → Account → Settings → New Access Token
6. **Canvas Tools → Generate Comments Template** — pick grading period + classes → get a Drive folder with one doc per class

## Technical Challenges
- **Google Docs tabs via API**: tab support is new (2024) and the REST API's `createTab` request isn't fully documented. Built a fallback to page breaks per student if tabs fail.
- **Sundial API access is blocked**: Blackbaud SKY API requires school admin to register the app + grant OAuth permissions. Phase 2 is stubbed with clear TODOs until IT enables access.
- **Comment write endpoint unconfirmed**: read endpoints exist (`Get-SchoolRoster`, `Get-SchoolSectionByTeacher`), but no public docs confirm a POST endpoint for student progress-report comments.
- **Name matching for Sundial export**: Canvas uses `sortable_name` ("Last, First"), Sundial format TBD. Built a `normalizeName_()` helper for fuzzy matching.

## Status
🟢 **Phase 1 built** — Canvas → Google Docs generation complete
🟡 **Phase 2 blocked** — Sundial push waiting on school IT to enable SKY API

## Next Steps
1. Test Phase 1 with Mr. Ring's actual Canvas account
2. Reach out to school IT re: enabling Blackbaud SKY API
3. Confirm whether a comments write endpoint exists in SKY API
4. Survey other departments (science, math) to see if format differs
5. Deploy as a shared template for all ~90 teachers

## Team
| Role | Name |
|------|------|
| Developer | James Lake |
| Developer | Magnus Songhurst |
