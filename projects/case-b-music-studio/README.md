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

### Phase 3 — Class Resources (shared Drive folder)

The Dashboard renders a **Class Resources** card backed by a single Google Drive folder. Files dropped into that folder show up on the page; the **Sync student access** button grants viewer permission to every email in `Form Responses 1` so students can open the folder without an extra share request.

**One-time setup (in the Apps Script editor):**

1. Create a folder in Drive (a sub-folder of the studio's shared drive is recommended) and copy the id from its URL — the chunk after `https://drive.google.com/drive/folders/`.
2. Project Settings → Script Properties → Add property
   - Property: `CLASS_RESOURCES_FOLDER_ID`
   - Value: the folder id from step 1.
3. Run the `authorize()` function once from the editor (it now also touches `DriveApp` so Drive's consent dialog appears alongside Calendar's).
4. Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy. The `/exec` URL stays the same.

Two new POST actions are exposed:

| Action | Body fields | Effect |
|---|---|---|
| `list-class-resources` | (none beyond `secret`) | Returns folder metadata and its most-recently-modified children for the dashboard card. |
| `sync-class-resources-access` | (none beyond `secret`) | Grants viewer access on the folder to every roster email + `CLASS_RESOURCES_EXTRA_VIEWERS`. Idempotent — already-authorized emails are skipped, malformed addresses are reported under `errors`. |

**Permission scope:** the script grants **viewer** access only; ownership and edit rights stay with you. Removing a student from the roster does **not** revoke their access — that's a manual step in Drive (intentionally, so the script can never accidentally lock people out of in-progress work). Per-student folders with editor access are coming in Phase 4.

### Phase 4 — Student Resources (per-student Drive folders)

Every enrolled student gets their **own** Drive folder where they have **editor** access (so they can upload recordings, annotated PDFs, etc.) — separate from the read-only Class Resources folder. The folder is rendered inside the student's profile panel on the Students page and is auto-created the first time you open that panel for a given student.

**One-time setup (in the Apps Script editor):**

1. Inside the studio's shared drive (or anywhere else you can manage permissions), create a parent folder that will hold every student's sub-folder — e.g. `Student Resources`. Copy its id from the URL.
2. Project Settings → Script Properties → Add property
   - Property: `STUDENT_RESOURCES_PARENT_FOLDER_ID`
   - Value: the folder id from step 1.
3. Re-run `authorize()` from the editor — already-authorized scopes are reused, but the helper will dereference the new parent id and surface any "wrong folder id" errors right in the execution log.
4. Deploy → Manage deployments → ✏️ → Version: **New version** → Deploy.

Three new POST actions are exposed:

| Action | Body fields | Effect |
|---|---|---|
| `list-student-folder` | `studentEmail` | Ensures the per-student folder exists (creates if missing, grants student editor access), returns folder metadata + immediate children. |
| `ensure-student-folder` | `studentEmail` | Same as above without the file listing — used by the bulk sync. |
| `sync-student-folders` | (none beyond `secret`) | Runs `ensure-student-folder` for every roster email. Reports `created` / `existed` / `errors`. Idempotent. |

**Naming convention:** `{Name} — {email}` if the form has a name, otherwise just `{email}`. Folders auto-rename if a student's display name changes via a re-submission. Folder ids are cached in Script Properties under `STUDENT_FOLDER:<email>` so per-student lookups are O(1) — never edit those by hand.

**Permission scope:** student gets **editor**; you stay owner; `STUDENT_RESOURCES_EXTRA_EDITORS` (empty by default) lets you always-add Dr. Burns / a co-teacher. The script never **lowers** a permission and never deletes a folder, so removing a student from the roster leaves their work intact. Bulk sync is exposed on the Dashboard via a "Sync all student folders" admin card.

### Phase 5 — Teacher recaps

Structured per-lesson recap that the teacher writes after each lesson, displayed both inline under the lesson row on the student's profile **and** on a new top-level **Recaps** tab. Format mirrors the structure Mr. O'Neal asked for:

```
Hi {Name}, {greeting body}

Today we:
{multiline list of what was covered}

HOMEWORK:
{multiline list}

Next Class:
{multiline list}
```

The "Hi {Name}," opener is rendered automatically using the student's roster name; the teacher only types the rest of the greeting.

**Storage:** a new `Lesson Recaps` tab in the same Google Sheet, **auto-created on first save** — no manual setup. Schema:

| Student Email | Student Name | Lesson Date | Start Time | Greeting | Today We | Homework | Next Class | Updated At |
|---|---|---|---|---|---|---|---|---|

Composite key `(Student Email, Lesson Date, Start Time)` — same as Phase 2's calendar key, so a recap binds permanently to a specific lesson instance. Upsert semantics: writing twice updates the same row. Drafts in progress are saved to localStorage so closing the tab mid-compose doesn't lose work.

**No new Script Property required** for Phase 5 — the only deploy step is redeploying `Code.gs` so the four new POST actions are exposed.

| Action | Body fields | Effect |
|---|---|---|
| `get-lesson-recap` | `studentEmail`, `lessonDate`, `startTime` | Returns the recap or `null`. Read-only. |
| `save-lesson-recap` | same + `fields: { greeting, todayWe, homework, nextClass }` | Upserts. Auto-creates the tab on first call. |
| `list-recaps-for-student` | `studentEmail` | All recaps for one student, newest first. |
| `list-recaps` | (none beyond `secret`) | Every recap in the system, newest first. |

**Where to compose / view:**
- **Compose / edit:** Students page → click a student → in their **Recent** lessons list, each row gets a `Write recap` button (or `View recap` / `Edit` if one exists). Compose modal pre-fills `Hi {Name},` automatically and persists drafts to localStorage.
- **Browse all:** new **Recaps** tab in the top nav (`/recaps`) — read-only listing grouped by student, with a name/email filter.

## App structure (prototype)

- **Dashboard** — roster count, student name search (links to Students with profile open), recent updates and upcoming lessons when APIs succeed.
- **Students** — directory with filters; clicking a student opens an **inline profile panel** (no separate profile URL).

## Status
🟢 Frontend MVP — dashboard, inline student profiles, Pomfret-styled shell
