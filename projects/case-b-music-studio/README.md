# Case B: Music Studio Infrastructure

## Client
Mr. O'Neal (Music Teacher)

## Problem
Lesson materials are scattered. Scheduling requires manual back-and-forth. No centralized system to track individual student progress.

## Goal
Build a **Music Student Profile** experience (roster, inline profiles, schedules from Sheets) with room to grow into scheduling and lesson workflows.

## Planned Features
- Music Student Profile database (instruments, genres, current songs, theory level) backed by Google Forms / Sheets
- Automated scheduling reminders/bookings (future)
- AI auto-tagging for sheet music and materials (e.g., "Intermediate / Jazz / Saxophone") (future)
- AI voice transcription for post-lesson summaries that auto-update student profiles (future)

## Team
| Role | Name |
|------|------|
| Developer | Serena Zhang |
| Developer | JT Gannon |

## Setup

From this folder (`projects/case-b-music-studio/`):

```bash
npm install
cp .env.example .env.local   # then paste the shared secret (see below)
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). To build a production bundle:

```bash
npm run build
npm run preview   # optional local preview of the build
```

**Data:** The app loads **students and schedules from your Google Apps Script** (see API client comments). Mock data is not used for the live roster.

### Shared secret (POST endpoints)

Phase 1+ adds write actions to the Apps Script web app (calendar events, recaps, Drive folders). These are gated by a shared secret that must match in two places:

1. **Apps Script side:** Project Settings → Script Properties → Add property
   - Property: `SHARED_SECRET`
   - Value: a random ≥32-char string
2. **Frontend side:** `projects/case-b-music-studio/.env.local`
   - `VITE_APPS_SCRIPT_SHARED_SECRET=<same value>`

`.env.local` is gitignored at the repo root and never committed. Generate a fresh value with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After changing `apps-script/Code.gs`, redeploy via Apps Script editor → Deploy → Manage deployments → ✏️ → New version. The `/exec` URL stays the same; only the served code changes.

> **Note (security TODO):** the shared-secret model is fine for development and unlinked previews. Migrate to Google Sign-In ("Execute as user accessing the web app" + allowlist) before publishing the deployed site anywhere indexable. See the comment block in `apps-script/Code.gs`.

### Phase 2 — Calendar event creation

The Dashboard now shows a **Pending lessons** card for any row in the `Lesson Schedule` tab whose Status is blank (or `Draft`) **and** has no Calendar Event ID. Each row gets a **Preview & schedule** button that opens a modal showing the proposed event (title, time, attendees, description, target calendar). Confirming creates the event on the teacher's primary Google Calendar via `CalendarApp` and sends invites to:

- the student's email (from the row),
- everyone listed in `ALWAYS_INVITE_EMAILS` (currently the placeholder Dr. Burns address — see `apps-script/Code.gs`).

The Apps Script side writes the resulting event ID into a new `Calendar Event ID` column on the sheet (auto-added on first use) and flips Status to `Scheduled`, which moves the row out of Pending and into Upcoming on the next refresh.

**No additional setup required** beyond the shared-secret config above and a redeploy of `apps-script/Code.gs`. Three new POST actions are exposed:

| Action | Body fields | Effect |
|---|---|---|
| `preview-event` | `studentEmail`, `lessonDate`, `startTime` | Returns event metadata without touching the calendar. |
| `create-event`  | same | Creates the event, writes back the ID, sends invites. Idempotent. |
| `cancel-event`  | same | Deletes the event and clears the row's ID. |

To add a test row from the dashboard's perspective, type a new row in the `Lesson Schedule` tab with **Status left blank** (or set to `Draft`). Refresh the Dashboard — it should appear in Pending.

## App structure (prototype)

- **Dashboard** — roster count, student name search (links to Students with profile open), recent updates and upcoming lessons when APIs succeed.
- **Students** — directory with filters; clicking a student opens an **inline profile panel** (no separate profile URL).

## Status
🟢 Frontend MVP — dashboard, inline student profiles, Pomfret-styled shell
