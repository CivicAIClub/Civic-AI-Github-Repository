/**
 * Case B — Music Studio: Google Apps Script backend (Code.gs)
 *
 * This is the script bound to Mr. O'Neal's Google Sheet (Extensions →
 * Apps Script). It powers the React frontend in this folder by exposing
 * a single Web App URL that the frontend calls. Keep this file in sync
 * with whatever is actually deployed in the Apps Script editor — it is
 * the canonical source of truth.
 *
 * ───────────────────────────────────────────────────────────────────────
 * Spreadsheet layout this script expects
 * ───────────────────────────────────────────────────────────────────────
 *  - "Form Responses 1"   → master roster (every Google Form submission)
 *  - "Lesson Schedule"    → manually maintained by the teacher
 *      Headers (row 1, exact strings):
 *        Student Email | Student Name | Lesson Date | Lesson Block |
 *        Start Time    | End Time     | Status      | Lesson Focus |
 *        Note          (or "Notes")
 *  - One tab per student, named after their email — created automatically
 *    by `onFormSubmit` below. Old responses submitted *before* this
 *    trigger was installed will not have a per-email tab; run a one-time
 *    backfill (loop over Form Responses 1 and call the same logic) if
 *    you need history for older students.
 *
 * ───────────────────────────────────────────────────────────────────────
 * HTTP endpoints (one Web App, routed by query params or POST body)
 * ───────────────────────────────────────────────────────────────────────
 *  GET  ?email=foo@bar.com           → latest row from that student's tab
 *  GET  ?action=list                 → { students: [...] }  every roster row
 *  GET  ?action=schedule-list        → { rows: [...] }      all booked lessons
 *  GET  ?action=schedule&email=…     → { rows: [...] }      one student's lessons
 *
 *  POST body (Content-Type: text/plain — see CORS note below). Every
 *  POST must include a "secret" field whose value matches the
 *  SHARED_SECRET stored in Script Properties (Project Settings →
 *  Script Properties). Body shapes below show only the
 *  action-specific fields (secret is implicit on every request):
 *    {"action":"ping","secret":"…"} → { ok: true, pong: true, ts: <ms> }
 *
 *    Phase 2 — Calendar event creation. All three actions identify the
 *    target lesson row by composite key { studentEmail, lessonDate,
 *    startTime } against the "Lesson Schedule" tab.
 *      {"action":"preview-event", "secret":"…", studentEmail, lessonDate,
 *       startTime}
 *           → { ok, preview: { title, startISO, endISO, attendees,
 *                              description, calendarName,
 *                              alreadyScheduled, calendarEventId } }
 *      {"action":"create-event",  "secret":"…", studentEmail, lessonDate,
 *       startTime}
 *           → { ok, calendarEventId, eventLink }   // sends invites
 *      {"action":"cancel-event",  "secret":"…", studentEmail, lessonDate,
 *       startTime}
 *           → { ok, cancelled: true }
 *
 *    Phase 3 — Class Resources (shared Google Drive folder visible to
 *    every enrolled student). The folder ID is set once in Script
 *    Properties (CLASS_RESOURCES_FOLDER_ID = the folder portion of its
 *    Drive URL); the script grants viewer access, never owner.
 *      {"action":"list-class-resources", "secret":"…"}
 *           → { ok, folder: { id, name, webViewLink },
 *                files: [ { id, name, mimeType, modifiedTime,
 *                           webViewLink, iconLink, isFolder } ] }
 *      {"action":"sync-class-resources-access", "secret":"…"}
 *           → { ok, folder: { id, name }, granted: [...emails],
 *                alreadyHadAccess: [...], errors: [{email, message}] }
 *
 *    Phase 4 — Student Resources (one Drive folder per student, with
 *    student as editor). Folders are children of a parent folder set
 *    once in Script Properties (STUDENT_RESOURCES_PARENT_FOLDER_ID),
 *    auto-created on first use, and cached by email in Script
 *    Properties (STUDENT_FOLDER:<email>) for O(1) lookup.
 *      {"action":"list-student-folder", "secret":"…", studentEmail}
 *           → { ok, folder: { id, name, webViewLink, created },
 *                files: [...], student: { email, name } }
 *      {"action":"ensure-student-folder", "secret":"…", studentEmail}
 *           → { ok, folder: { id, name, webViewLink, created },
 *                student: { email, name } }
 *      {"action":"sync-student-folders", "secret":"…"}
 *           → { ok, parent: { id, name }, created: [...emails],
 *                existed: [...emails], errors: [{email, message}] }
 *
 *    Phase 5 — Teacher recaps. One structured recap per lesson row,
 *    keyed by composite (studentEmail, lessonDate, startTime). Stored
 *    in a "Lesson Recaps" tab auto-created on first save; upsert
 *    semantics (write twice = update). Read endpoints never touch
 *    the sheet schema (return [] when the tab doesn't exist yet).
 *      {"action":"get-lesson-recap", "secret":"…", studentEmail,
 *       lessonDate, startTime}
 *           → { ok, recap: { ...fields, updatedAt } | null }
 *      {"action":"save-lesson-recap", "secret":"…", studentEmail,
 *       lessonDate, startTime, fields: { greeting, todayWe,
 *       homework, nextClass } }
 *           → { ok, recap: { ...saved-fields, updatedAt } }
 *      {"action":"list-recaps-for-student", "secret":"…", studentEmail}
 *           → { ok, recaps: [...] }
 *      {"action":"list-recaps", "secret":"…"}
 *           → { ok, recaps: [...] }
 *
 *  Future POST actions (Phases 6+) will follow the same shape:
 *    { "action": "<name>", "secret": "…", ...payload }
 *
 * The frontend clients live in:
 *   src/api/appsScriptStudent.ts        (GET, roster + single student)
 *   src/api/appsScriptSchedule.ts       (GET, lesson schedule)
 *   src/api/appsScriptPost.ts           (POST, write actions — Phase 1+)
 *
 * ───────────────────────────────────────────────────────────────────────
 * Auth (shared secret)
 * ───────────────────────────────────────────────────────────────────────
 *  Every POST must include a "secret" field whose value matches the
 *  SHARED_SECRET stored in Script Properties (Project Settings →
 *  Script Properties → Add property: SHARED_SECRET = <random hex>).
 *  The frontend reads it from .env.local (VITE_APPS_SCRIPT_SHARED_SECRET).
 *
 *  IMPORTANT: this secret IS bundled into the JS the browser
 *  downloads — anyone who can open the deployed site in DevTools can
 *  read it. Treat the deployed URL as private (don't link it
 *  publicly, don't share with people you wouldn't trust with the
 *  backend). For a single-teacher tool this is acceptable; if the
 *  site ever needs to be linked publicly, swap to a server-side
 *  proxy that holds the secret.
 *
 * ───────────────────────────────────────────────────────────────────────
 * CORS note (why POSTs use Content-Type: text/plain)
 * ───────────────────────────────────────────────────────────────────────
 *  Apps Script web apps don't expose custom CORS headers, so any
 *  "non-simple" cross-origin request (e.g. Content-Type: application/json)
 *  triggers a preflight OPTIONS that fails. The frontend works around
 *  this by sending the JSON body as text/plain — `e.postData.contents`
 *  on this side is still the raw JSON string, parsed with JSON.parse.
 *
 * ───────────────────────────────────────────────────────────────────────
 * Triggers (set up once in the Apps Script editor)
 * ───────────────────────────────────────────────────────────────────────
 *  Triggers → Add Trigger:
 *    - Function:        onFormSubmit
 *    - Event source:    From spreadsheet
 *    - Event type:      On form submit
 *
 * ───────────────────────────────────────────────────────────────────────
 * Deployment (Apps Script editor → Deploy → New deployment)
 * ───────────────────────────────────────────────────────────────────────
 *    Type:           Web app
 *    Execute as:     Me
 *    Who has access: Anyone
 *  Copy the resulting `/exec` URL into APPS_SCRIPT_BASE_URL inside
 *  src/api/appsScriptStudent.ts. After ANY change to Code.gs, redeploy
 *  via Deploy → Manage deployments → ✏️ → "New version" so the live
 *  /exec URL serves the new code.
 */

// ──────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────

/** Property key under which the POST shared secret is stored. */
var SHARED_SECRET_PROPERTY_KEY = "SHARED_SECRET";

/** Tab containing the lesson schedule (column titles in row 1). */
var LESSON_SCHEDULE_SHEET_NAME = "Lesson Schedule";

/**
 * Column added by Phase 2 to the Lesson Schedule sheet. The backend
 * writes the Google Calendar event ID here after a successful create so
 * subsequent calls (cancel, future updates, recap-attach) can reference
 * the same event without scanning calendars by metadata. Auto-created
 * by `ensureCalendarEventIdColumn` if missing.
 */
var CALENDAR_EVENT_ID_COLUMN = "Calendar Event ID";

/**
 * Always invited to every auto-created lesson event. Mr. O'Neal owns
 * the calendar (the deployer of the web app), so he's already on every
 * event as the organizer — but he's listed here too so the dashboard's
 * "Attendees" preview shows him explicitly. Cayden's two emails are
 * here for ongoing maintenance visibility, and Dr. Burns is the
 * always-CC'd music department contact.
 */
var ALWAYS_INVITE_EMAILS = [
  "roneal@pomfret.org",
  "rburns@pomfret.org",
  "caydenauyang@gmail.com",
  "cauyang.27@pomfret.org"
];

/**
 * Phase 3 — Class Resources. Property key under which the Drive folder
 * ID for the shared "Class Resources" folder is stored. The folder
 * itself is a sub-folder of the studio's shared drive (kept separate
 * from per-student folders so its permissions can be managed in bulk).
 *
 * Set this once in Project Settings → Script Properties → Add property:
 *   CLASS_RESOURCES_FOLDER_ID = <the id portion of the folder URL>
 *
 * The id is the random-looking segment in
 * https://drive.google.com/drive/folders/<id>.
 */
var CLASS_RESOURCES_FOLDER_ID_PROPERTY_KEY = "CLASS_RESOURCES_FOLDER_ID";

/**
 * Additional emails (beyond the enrolled-student roster) that should
 * always have viewer access on the Class Resources folder. Mr. O'Neal
 * owns the folder so he doesn't need to be listed. This list is the
 * canonical "music department admins + dev maintenance" set.
 */
var CLASS_RESOURCES_EXTRA_VIEWERS = [
  "rburns@pomfret.org",
  "caydenauyang@gmail.com",
  "cauyang.27@pomfret.org"
];

/**
 * Phase 4 — Student Resources. Property key under which the parent
 * Drive folder ID is stored. Per-student folders live as direct
 * children of this parent and are auto-created on first use.
 *
 * Set this once in Project Settings → Script Properties → Add property:
 *   STUDENT_RESOURCES_PARENT_FOLDER_ID = <folder id from its Drive URL>
 *
 * The parent folder is intentionally separate from the Class Resources
 * folder so the two can have different sharing scopes (Class = viewer
 * for everyone; per-student = editor for one student). Both can sit
 * inside the same shared drive.
 */
var STUDENT_RESOURCES_PARENT_FOLDER_ID_PROPERTY_KEY = "STUDENT_RESOURCES_PARENT_FOLDER_ID";

/**
 * Per-student folder ID cache. Keys are
 * "STUDENT_FOLDER:<email>" → folder id. Populated lazily by
 * ensureStudentFolder, never edited by hand.
 */
var STUDENT_FOLDER_PROPERTY_PREFIX = "STUDENT_FOLDER:";

/**
 * Always invited as editors on every per-student folder. Dr. Burns
 * (music dept) needs to drop annotated PDFs into any student's folder;
 * Cayden's two emails are for ongoing dev maintenance. Mr. O'Neal owns
 * the parent so he doesn't need to be listed.
 */
var STUDENT_RESOURCES_EXTRA_EDITORS = [
  "rburns@pomfret.org",
  "caydenauyang@gmail.com",
  "cauyang.27@pomfret.org"
];

/**
 * Phase 5 — Teacher recaps. Tab name + canonical header order. Auto-
 * created on first save; never auto-deleted. Mirrors the
 * "Lesson Schedule" composite key (studentEmail, lessonDate,
 * startTime) so a recap binds permanently to the lesson instance it
 * was written for, even if the lesson is later rescheduled.
 */
var LESSON_RECAPS_SHEET_NAME = "Lesson Recaps";

/**
 * Headers in the order they should appear when the tab is auto-
 * created. The script reads by header name, so re-ordering the
 * columns by hand later is safe; the script will still find them.
 * Adding new columns to the right (e.g. for a future "delivered
 * to student" timestamp) is also safe.
 */
var LESSON_RECAPS_HEADERS = [
  "Student Email",
  "Student Name",
  "Lesson Date",
  "Start Time",
  "Greeting",
  "Today We",
  "Homework",
  "Next Class",
  "Updated At"
];

/**
 * Phase 5 — Teacher recaps. Tab name + canonical header order. Auto-
 * created on first save; never auto-deleted. Mirrors the
 * "Lesson Schedule" composite key (studentEmail, lessonDate,
 * startTime) so a recap binds permanently to the lesson instance it
 * was written for, even if the lesson is later rescheduled.
 */
var LESSON_RECAPS_SHEET_NAME = "Lesson Recaps";

/**
 * Headers in the order they should appear when the tab is auto-
 * created. The script reads by header name, so re-ordering the
 * columns by hand later is safe; the script will still find them.
 * Adding new columns to the right (e.g. for a future "delivered
 * to student" timestamp) is also safe.
 */
var LESSON_RECAPS_HEADERS = [
  "Student Email",
  "Student Name",
  "Lesson Date",
  "Start Time",
  "Greeting",
  "Today We",
  "Homework",
  "Next Class",
  "Updated At"
];

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = String(e.parameter.action || "").trim().toLowerCase();
  const email = String(e.parameter.email || "").trim().toLowerCase();

  // 1) One student by email — latest row from that student's per-email tab.
  // Falls back to scanning Form Responses 1 when no per-email tab exists,
  // which happens for submissions that pre-date the onFormSubmit trigger
  // (or when a tab gets manually deleted). Without the fallback those
  // students show on the roster but error out when clicked.
  if (email && !action) {
    const sheet = ss.getSheetByName(email);
    if (sheet) {
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) {
        return jsonResponse({ error: "No data found for this student" });
      }

      const headers = data[0];
      const lastRow = data[data.length - 1];
      return jsonResponse(rowToObject(headers, lastRow));
    }

    const formSheet = ss.getSheetByName("Form Responses 1");
    if (!formSheet) {
      return jsonResponse({ error: "Student not found" });
    }
    const formData = formSheet.getDataRange().getValues();
    if (formData.length < 2) {
      return jsonResponse({ error: "Student not found" });
    }
    const formHeaders = formData[0];
    const emailColIndex = formHeaders
      .map((h) => String(h).trim().toLowerCase())
      .indexOf("email address");
    if (emailColIndex === -1) {
      return jsonResponse({ error: "Student not found" });
    }
    let latestRow = null;
    for (let r = 1; r < formData.length; r++) {
      const rowEmail = String(formData[r][emailColIndex] || "")
        .trim()
        .toLowerCase();
      if (rowEmail === email) latestRow = formData[r];
    }
    if (!latestRow) {
      return jsonResponse({ error: "Student not found" });
    }
    return jsonResponse(rowToObject(formHeaders, latestRow));
  }

  // 2) Student roster list — every row from "Form Responses 1".
  if (action === "list") {
    const formSheet = ss.getSheetByName("Form Responses 1");
    if (!formSheet) {
      return jsonResponse({ error: 'Sheet "Form Responses 1" not found' });
    }

    const data = formSheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ students: [] });
    }

    const headers = data[0];
    const rows = data.slice(1);

    const students = rows
      .map((row) => rowToObject(headers, row))
      .filter((student) => String(student["Email Address"] || "").trim() !== "");

    return jsonResponse({ students });
  }

  // 3) All scheduled lessons.
  if (action === "schedule-list") {
    const sheet = ss.getSheetByName("Lesson Schedule");
    if (!sheet) {
      return jsonResponse({ error: "Lesson Schedule sheet not found" });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ rows: [] });
    }

    const headers = data[0];
    const rows = data.slice(1)
      .map((row) => rowToObject(headers, row))
      .filter((lesson) => String(lesson["Student Email"] || "").trim() !== "");

    return jsonResponse({ rows });
  }

  // 4) One student's scheduled lessons.
  if (action === "schedule" && email) {
    const sheet = ss.getSheetByName("Lesson Schedule");
    if (!sheet) {
      return jsonResponse({ error: "Lesson Schedule sheet not found" });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ rows: [] });
    }

    const headers = data[0];
    const rows = data.slice(1)
      .map((row) => rowToObject(headers, row))
      .filter((lesson) =>
        String(lesson["Student Email"] || "").trim().toLowerCase() === email
      );

    return jsonResponse({ rows });
  }

  return jsonResponse({
    error: "Missing email or invalid action. Use ?email=student@example.com, ?action=list, ?action=schedule-list, or ?action=schedule&email=student@example.com"
  });
}

/**
 * Sheets stores time-only cells as fractional days from 1899-12-30. When those
 * Date objects are serialized to UTC ISO and parsed by the browser, JavaScript
 * applies 1899's local-mean-time offset, which produces nonsense like "12:02
 * PM" for a cell the teacher typed as "11:30". Format time-only cells as
 * wall-clock strings on this side so the frontend can display them as-is.
 *
 * Date-only cells (year >= 1900, midnight in the spreadsheet's timezone) are
 * sent as plain "yyyy-MM-dd" so the frontend can render the same calendar
 * date for any viewer regardless of timezone. Anything else (timestamps with
 * a real time component) keeps full ISO so the frontend can parse it as a
 * Date and format it with the viewer's locale.
 */
function rowToObject(headers, row) {
  const ssTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const key = String(headers[i] || "").trim();
    const val = row[i];
    if (val instanceof Date) {
      if (val.getFullYear() < 1900) {
        obj[key] = Utilities.formatDate(val, ssTz, "h:mm a");
      } else {
        const wallClock = Utilities.formatDate(val, ssTz, "HH:mm:ss");
        if (wallClock === "00:00:00") {
          obj[key] = Utilities.formatDate(val, ssTz, "yyyy-MM-dd");
        } else {
          obj[key] = val;
        }
      }
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ──────────────────────────────────────────────────────────────────────
// POST endpoint (write actions, secret-gated)
// ──────────────────────────────────────────────────────────────────────

/**
 * Routes POST actions. The body must be a JSON string sent with
 * Content-Type: text/plain (see CORS note in the file header).
 *
 * Every action is gated by a shared secret stored in Script Properties.
 * Adding a new action: add a `case` below and implement a small
 * `handle<Action>(payload)` function returning a plain object. Throw
 * an Error to return a 200 with `{ ok: false, error: <message> }`.
 */
function doPost(e) {
  var payload;
  try {
    payload = parsePostPayload(e);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Invalid request body: " + err.message });
  }

  if (!isValidSecret(payload && payload.secret)) {
    return jsonResponse({ ok: false, error: "Unauthorized" });
  }

  var action = String((payload && payload.action) || "").trim().toLowerCase();
  if (!action) {
    return jsonResponse({ ok: false, error: "Missing 'action' in request body" });
  }

  try {
    switch (action) {
      case "ping":
        return jsonResponse(handlePing(payload));
      case "preview-event":
        return jsonResponse(handlePreviewEvent(payload));
      case "create-event":
        return jsonResponse(handleCreateEvent(payload));
      case "cancel-event":
        return jsonResponse(handleCancelEvent(payload));
      case "list-class-resources":
        return jsonResponse(handleListClassResources(payload));
      case "sync-class-resources-access":
        return jsonResponse(handleSyncClassResourcesAccess(payload));
      case "list-student-folder":
        return jsonResponse(handleListStudentFolder(payload));
      case "ensure-student-folder":
        return jsonResponse(handleEnsureStudentFolder(payload));
      case "sync-student-folders":
        return jsonResponse(handleSyncStudentFolders(payload));
      case "get-lesson-recap":
        return jsonResponse(handleGetLessonRecap(payload));
      case "save-lesson-recap":
        return jsonResponse(handleSaveLessonRecap(payload));
      case "list-recaps-for-student":
        return jsonResponse(handleListRecapsForStudent(payload));
      case "list-recaps":
        return jsonResponse(handleListRecaps(payload));
      default:
        return jsonResponse({ ok: false, error: "Unknown action: " + action });
    }
  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err && err.message ? err.message : "Action handler threw an unexpected error"
    });
  }
}

/**
 * Parses the POST body as JSON. Apps Script gives us the raw string at
 * `e.postData.contents` regardless of the Content-Type the client sent,
 * so we tolerate text/plain (preferred, no CORS preflight) and
 * application/json equally.
 */
function parsePostPayload(e) {
  if (!e || !e.postData || typeof e.postData.contents !== "string") {
    throw new Error("Empty body");
  }
  var raw = e.postData.contents;
  if (!raw.trim()) {
    throw new Error("Empty body");
  }
  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error("Body is not valid JSON");
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Body must be a JSON object");
  }
  return parsed;
}

/**
 * Constant-time-ish comparison against the shared secret in Script
 * Properties. Returns false (not throws) on any mismatch so the response
 * shape stays uniform.
 */
function isValidSecret(candidate) {
  if (typeof candidate !== "string" || !candidate) return false;
  var expected = getSharedSecret();
  if (!expected) return false;
  if (candidate.length !== expected.length) return false;
  var diff = 0;
  for (var i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ candidate.charCodeAt(i);
  }
  return diff === 0;
}

function getSharedSecret() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty(SHARED_SECRET_PROPERTY_KEY) || "";
}

/**
 * Smoke-test action. Confirms the round trip works end-to-end:
 * frontend → POST with secret → routed → back to frontend.
 *
 * Safe to invoke directly from the Apps Script editor's Run button
 * (no arguments) — the payload is treated as optional.
 */
function handlePing(payload) {
  var message = payload && typeof payload.message === "string"
    ? payload.message
    : null;
  return {
    ok: true,
    pong: true,
    ts: Date.now(),
    echo: message,
    spreadsheet: SpreadsheetApp.getActiveSpreadsheet().getName()
  };
}

// ──────────────────────────────────────────────────────────────────────
// Phase 2 — Calendar event creation
// ──────────────────────────────────────────────────────────────────────

/**
 * Returns the lesson row plus the proposed event details — does NOT
 * touch the calendar. Used to populate the "preview before create"
 * modal on the Dashboard.
 */
function handlePreviewEvent(payload) {
  var found = findLessonRowFromPayload(payload);
  return { ok: true, preview: buildEventPreview(found.row) };
}

/**
 * Idempotently creates a Google Calendar event for the lesson row,
 * sends invites to the student + ALWAYS_INVITE_EMAILS, and writes the
 * event ID + status back to the sheet.
 *
 * Idempotent: if the row already has a Calendar Event ID, returns the
 * existing event details instead of creating a duplicate. The frontend
 * disables the "Create event" button when `alreadyScheduled` is true,
 * but a stale UI tab could still POST again — this guard catches that.
 */
function handleCreateEvent(payload) {
  // Serialize concurrent creates against the same script. Without this, a
  // double-click on the modal Confirm button (or two browser tabs open on
  // the same lesson) both pass the existingId guard below and end up
  // creating two calendar events with two invite emails to the student.
  // Script-level lock is sufficient — Apps Script web app concurrency is
  // already script-scoped — and 30s is well above any normal create path.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    throw new Error(
      "Another schedule is in progress for this studio. Please try again in a moment."
    );
  }
  try {
    return createEventLocked(payload);
  } finally {
    lock.releaseLock();
  }
}

function createEventLocked(payload) {
  var found = findLessonRowFromPayload(payload);
  var sheet = found.sheet;
  var rowIndex = found.rowIndex;
  var row = found.row;
  var eventIdCol = found.calendarEventIdCol; // 1-indexed
  var statusCol = found.statusCol;            // 1-indexed or null

  // Idempotency guard. Re-reads the row inside the lock so a concurrent
  // create that finished between findLessonRowFromPayload and here is
  // observed. Without this re-read, a double-click could still create
  // two events if the second request's snapshot is older than the
  // first request's commit.
  var freshRow = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var freshRowObj = rowToObject(headers, freshRow);
  var existingId = String(freshRowObj[CALENDAR_EVENT_ID_COLUMN] || "").trim();
  if (existingId) {
    var existingEvent = safeGetEvent(existingId);
    return {
      ok: true,
      alreadyScheduled: true,
      calendarEventId: existingId,
      eventLink: existingEvent ? eventEditUrl(existingEvent) : null,
      preview: buildEventPreview(freshRowObj)
    };
  }

  var preview = buildEventPreview(row);
  var attendeesOverride = normalizeAttendeesOverride(payload);
  var guestsList = attendeesOverride || preview.attendees;
  var calendar = CalendarApp.getDefaultCalendar();

  var event = calendar.createEvent(
    preview.title,
    new Date(preview.startISO),
    new Date(preview.endISO),
    {
      description: preview.description,
      guests: guestsList.join(","),
      sendInvites: true
    }
  );

  var eventId = event.getId();
  sheet.getRange(rowIndex, eventIdCol).setValue(eventId);
  if (statusCol) {
    sheet.getRange(rowIndex, statusCol).setValue("Scheduled");
  }
  SpreadsheetApp.flush();

  return {
    ok: true,
    alreadyScheduled: false,
    calendarEventId: eventId,
    eventLink: eventEditUrl(event)
  };
}

/**
 * Deletes the calendar event (if any) and clears the row's Calendar
 * Event ID. Sets Status to "Cancelled" only when an event was actually
 * cancelled — calling cancel on a row that was never scheduled is a
 * clean no-op and leaves Status untouched. Does not delete the sheet row.
 */
function handleCancelEvent(payload) {
  var found = findLessonRowFromPayload(payload);
  var sheet = found.sheet;
  var rowIndex = found.rowIndex;
  var row = found.row;
  var eventIdCol = found.calendarEventIdCol;
  var statusCol = found.statusCol;

  var existingId = String(row[CALENDAR_EVENT_ID_COLUMN] || "").trim();
  if (!existingId) {
    return { ok: true, cancelled: false, reason: "No event to cancel for this lesson row." };
  }

  var existing = safeGetEvent(existingId);
  if (existing) existing.deleteEvent();

  sheet.getRange(rowIndex, eventIdCol).setValue("");
  if (statusCol) {
    sheet.getRange(rowIndex, statusCol).setValue("Cancelled");
  }
  SpreadsheetApp.flush();

  return { ok: true, cancelled: true };
}

/**
 * One-time authorization helper. Run this from the Apps Script editor
 * after adding any new Google service (Calendar, Drive, Gmail, etc.)
 * to surface the consent dialog without needing a real POST request.
 *
 * Touch every service the deployed code uses so the prompt covers
 * everything in one go. Safe to re-run — purely read-only.
 */
function authorize() {
  // Touch each service so Apps Script knows it must request the
  // corresponding OAuth scope. Logger output is purely informational.
  var ssName = SpreadsheetApp.getActiveSpreadsheet().getName();
  var calName = CalendarApp.getDefaultCalendar().getName();

  // Drive scope (Phase 3+). Touching the root folder is the cheapest
  // way to surface the consent prompt; if the configured folder IDs
  // are set, also resolve them so we get clear errors here (instead
  // of from the live web app) when an ID is wrong.
  var rootName = DriveApp.getRootFolder().getName();
  var props = PropertiesService.getScriptProperties();

  var classResourcesName = resolveFolderNameForAuthorize(
    props.getProperty(CLASS_RESOURCES_FOLDER_ID_PROPERTY_KEY)
  );
  var studentResourcesParentName = resolveFolderNameForAuthorize(
    props.getProperty(STUDENT_RESOURCES_PARENT_FOLDER_ID_PROPERTY_KEY)
  );

  Logger.log("Spreadsheet:              " + ssName);
  Logger.log("Calendar:                 " + calName);
  Logger.log("Drive root:               " + rootName);
  Logger.log("Class Resources:          " + classResourcesName);
  Logger.log("Student Resources parent: " + studentResourcesParentName);
  Logger.log(
    "Authorization complete. Re-deploy (Manage deployments → ✏️ → New version) " +
    "if you haven't already."
  );
  return {
    ok: true,
    spreadsheet: ssName,
    calendar: calName,
    driveRoot: rootName,
    classResources: classResourcesName,
    studentResourcesParent: studentResourcesParentName
  };
}

/**
 * Helper for authorize() — turns a (possibly-missing) folder id into a
 * human-readable name for the execution log. Never throws; surfaces
 * any Drive error inline so the teacher sees what to fix.
 */
function resolveFolderNameForAuthorize(folderId) {
  if (!folderId) return "(not configured)";
  try {
    return DriveApp.getFolderById(folderId).getName();
  } catch (err) {
    return "(error: " + (err && err.message ? err.message : err) + ")";
  }
}

// ──────────────────────────────────────────────────────────────────────
// Phase 2 — helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Looks up a Lesson Schedule row by composite key. Returns sheet
 * handle, 1-indexed rowIndex, the row as a header→value object, and
 * 1-indexed column numbers for the columns we'll write back to.
 *
 * Throws (the message bubbles back to the frontend as `ok:false`)
 * when the sheet is missing, the row isn't found, or the key is bad.
 */
function findLessonRowFromPayload(payload) {
  var studentEmail = String((payload && payload.studentEmail) || "")
    .trim()
    .toLowerCase();
  var lessonDate = String((payload && payload.lessonDate) || "").trim();
  var startTime = String((payload && payload.startTime) || "").trim();

  if (!studentEmail) throw new Error("Missing studentEmail");
  if (!lessonDate) throw new Error("Missing lessonDate");
  if (!startTime) throw new Error("Missing startTime");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LESSON_SCHEDULE_SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet "' + LESSON_SCHEDULE_SHEET_NAME + '" not found');
  }

  ensureCalendarEventIdColumn(sheet);

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) throw new Error("Lesson Schedule sheet has no rows");
  var headers = data[0];

  var emailCol = headerIndex(headers, "Student Email");
  var dateCol = headerIndex(headers, "Lesson Date");
  var startCol = headerIndex(headers, "Start Time");
  var statusCol = headerIndex(headers, "Status");
  var eventIdCol = headerIndex(headers, CALENDAR_EVENT_ID_COLUMN);

  if (emailCol === -1) throw new Error('Column "Student Email" not found');
  if (dateCol === -1) throw new Error('Column "Lesson Date" not found');
  if (startCol === -1) throw new Error('Column "Start Time" not found');
  if (eventIdCol === -1) throw new Error(
    'Column "' + CALENDAR_EVENT_ID_COLUMN + '" not found (auto-init failed?)'
  );

  var ssTz = ss.getSpreadsheetTimeZone();
  var matchRowIndex = -1;

  for (var r = 1; r < data.length; r++) {
    var rowEmail = String(data[r][emailCol] || "").trim().toLowerCase();
    if (rowEmail !== studentEmail) continue;

    var rowDate = normalizeSheetDate(data[r][dateCol], ssTz);
    if (rowDate !== lessonDate) continue;

    var rowStart = normalizeSheetTime(data[r][startCol], ssTz);
    if (rowStart !== startTime) continue;

    matchRowIndex = r + 1; // sheet rows are 1-indexed
    break;
  }

  if (matchRowIndex === -1) {
    throw new Error(
      "No matching row in Lesson Schedule for " + studentEmail +
      " on " + lessonDate + " at " + startTime
    );
  }

  var rowObj = rowToObject(headers, data[matchRowIndex - 1]);
  return {
    sheet: sheet,
    rowIndex: matchRowIndex,
    row: rowObj,
    calendarEventIdCol: eventIdCol + 1,
    statusCol: statusCol === -1 ? null : statusCol + 1
  };
}

/**
 * Adds the Calendar Event ID column to the right of the existing
 * headers if it doesn't already exist. Idempotent. Run on every
 * lookup so the column appears the first time the teacher uses Phase 2,
 * without requiring a manual sheet edit.
 */
function ensureCalendarEventIdColumn(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return;
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === CALENDAR_EVENT_ID_COLUMN) return;
  }
  var newCol = lastCol + 1;
  sheet.getRange(1, newCol)
    .setValue(CALENDAR_EVENT_ID_COLUMN)
    .setFontWeight("bold")
    .setFontColor(FMT_HEADER_TEXT)
    .setBackground(FMT_HEADER_BG);
  // Newly added — apply the auto-managed treatment so it's clearly
  // off-limits from the moment the column appears, even before the
  // teacher runs setupSheetFormatting().
  try {
    highlightAutoManagedColumn(sheet, newCol, CALENDAR_EVENT_ID_COLUMN);
    protectAutoManagedColumn(sheet, newCol);
  } catch (err) {
    Logger.log("ensureCalendarEventIdColumn: highlight/protect failed: " + err);
  }
}

/**
 * Validates an optional `attendees` array on the create-event payload.
 * Returns null when the field is absent so the caller falls back to the
 * auto-built preview list. Throws (bubbles to the frontend as `ok:false`)
 * on any malformed entry or an empty list — the frontend already enforces
 * "at least one attendee", so an empty array hitting this side is a bug
 * worth surfacing rather than silently falling back.
 */
function normalizeAttendeesOverride(payload) {
  if (!payload || !("attendees" in payload)) return null;
  if (!Array.isArray(payload.attendees)) {
    throw new Error("attendees must be an array of email strings");
  }
  var seen = {};
  var out = [];
  for (var i = 0; i < payload.attendees.length; i++) {
    var raw = payload.attendees[i];
    if (typeof raw !== "string") {
      throw new Error("Invalid attendee entry (not a string)");
    }
    var v = raw.trim();
    if (!v) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      throw new Error("Invalid attendee email: " + v);
    }
    var k = v.toLowerCase();
    if (seen[k]) continue;
    seen[k] = true;
    out.push(v);
  }
  if (out.length === 0) {
    throw new Error("At least one attendee is required.");
  }
  return out;
}

/** Builds the calendar event metadata for one row (preview + create share this). */
function buildEventPreview(row) {
  var studentName = String(row["Student Name"] || "").trim();
  var studentEmail = String(row["Student Email"] || "").trim();
  var lessonFocus = String(row["Lesson Focus"] || "").trim();
  var lessonBlock = String(row["Lesson Block"] || "").trim();
  var note = String(row["Note"] || row["Notes"] || "").trim();
  var lessonDate = String(row["Lesson Date"] || "").trim();
  var startTime = String(row["Start Time"] || "").trim();
  var endTime = String(row["End Time"] || "").trim();
  var existingEventId = String(row[CALENDAR_EVENT_ID_COLUMN] || "").trim();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var startDate = parseLessonDateTime(lessonDate, startTime, tz);
  var endDate = parseLessonDateTime(lessonDate, endTime, tz);

  if (!startDate || !endDate) {
    throw new Error(
      "Could not parse lesson date/time: date='" + lessonDate +
      "', start='" + startTime + "', end='" + endTime + "'"
    );
  }
  // Cross-midnight: a lesson typed as 11:30 PM → 12:30 AM produces an
  // end that's 23 hours BEFORE the start when both share the same
  // calendar date. Roll the end forward by one day so the duration is
  // positive and the calendar event spans correctly. Anything still
  // ≤ start after that roll is genuinely invalid (same wall-clock).
  if (endDate.getTime() <= startDate.getTime()) {
    var rolled = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    if (rolled.getTime() > startDate.getTime()) {
      endDate = rolled;
    } else {
      throw new Error("End time must be after start time");
    }
  }

  var displayName = studentName || studentEmail;
  var title = lessonFocus
    ? displayName + " - " + lessonFocus
    : displayName + " - Music Lesson";

  var descriptionParts = [];
  descriptionParts.push("Student: " + displayName + " <" + studentEmail + ">");
  if (lessonBlock) descriptionParts.push("Block: " + lessonBlock);
  if (lessonFocus) descriptionParts.push("Focus: " + lessonFocus);
  if (note) descriptionParts.push("Notes: " + note);
  descriptionParts.push("");
  descriptionParts.push(
    "Auto-created by the Music Studio dashboard. Edit the lesson row in " +
    'the "Lesson Schedule" tab and re-run if you need to change times.'
  );
  var description = descriptionParts.join("\n");

  // Dedupe attendees case-insensitively, normalizing the stored value to
  // lowercase too — otherwise `Foo@Bar.com` from the form and
  // `foo@bar.com` from ALWAYS_INVITE_EMAILS produce two attendees on
  // the calendar event.
  var attendeeSet = {};
  if (studentEmail) attendeeSet[studentEmail.toLowerCase()] = studentEmail.toLowerCase();
  for (var i = 0; i < ALWAYS_INVITE_EMAILS.length; i++) {
    var e = ALWAYS_INVITE_EMAILS[i];
    if (e) attendeeSet[e.toLowerCase()] = e.toLowerCase();
  }
  var attendees = [];
  Object.keys(attendeeSet).forEach(function (k) {
    attendees.push(attendeeSet[k]);
  });

  return {
    title: title,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
    attendees: attendees,
    description: description,
    calendarName: CalendarApp.getDefaultCalendar().getName(),
    alreadyScheduled: existingEventId !== "",
    calendarEventId: existingEventId || null,
    studentEmail: studentEmail,
    studentName: studentName,
    lessonDate: lessonDate,
    startTime: startTime,
    endTime: endTime
  };
}

/**
 * Combines a date string ("yyyy-MM-dd") and a wall-clock time string
 * ("h:mm AM/PM" or "HH:mm") into a Date interpreted in the given
 * timezone. Returns null on parse failure.
 */
function parseLessonDateTime(dateStr, timeStr, tz) {
  var dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!dateMatch) return null;
  var hm = parseWallClockTime(timeStr);
  if (!hm) return null;
  var hh = hm.h < 10 ? "0" + hm.h : "" + hm.h;
  var mm = hm.m < 10 ? "0" + hm.m : "" + hm.m;
  var iso = dateStr + " " + hh + ":" + mm + ":00";
  try {
    return Utilities.parseDate(iso, tz, "yyyy-MM-dd HH:mm:ss");
  } catch (err) {
    return null;
  }
}

function parseWallClockTime(timeStr) {
  var m = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/.exec(String(timeStr).trim());
  if (!m) return null;
  var h = parseInt(m[1], 10);
  var min = parseInt(m[2], 10);
  var ampm = m[3] ? m[3].toUpperCase() : "";
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h: h, m: min };
}

/** "yyyy-MM-dd" string from a value that may already be a Date or a string. */
function normalizeSheetDate(val, tz) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, tz, "yyyy-MM-dd");
  }
  return String(val || "").trim();
}

/**
 * Wall-clock string ("h:mm a") from a sheet value. Sheets stores
 * time-only cells as Dates from 1899-12-30; the existing rowToObject
 * already formats those correctly. We mirror that logic here so a row
 * lookup matches what the frontend received and is sending back.
 */
function normalizeSheetTime(val, tz) {
  if (val instanceof Date) {
    if (val.getFullYear() < 1900) {
      return Utilities.formatDate(val, tz, "h:mm a");
    }
    return Utilities.formatDate(val, tz, "h:mm a");
  }
  return String(val || "").trim();
}

function headerIndex(headers, name) {
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === name) return i;
  }
  return -1;
}

/** Returns the calendar event or null if it's been deleted out of band. */
function safeGetEvent(eventId) {
  try {
    return CalendarApp.getDefaultCalendar().getEventById(eventId);
  } catch (err) {
    return null;
  }
}

/** Best-effort link to the event in Google Calendar. */
function eventEditUrl(event) {
  // event.getId() is "<id>@google.com"; the editor expects just the id part
  var raw = event.getId();
  var atIdx = raw.indexOf("@");
  var id = atIdx > 0 ? raw.substring(0, atIdx) : raw;
  return "https://calendar.google.com/calendar/u/0/r/eventedit/" +
    Utilities.base64Encode(id + " " + CalendarApp.getDefaultCalendar().getId());
}

// ──────────────────────────────────────────────────────────────────────
// Phase 3 — Class Resources (shared Drive folder)
// ──────────────────────────────────────────────────────────────────────

/**
 * Returns a snapshot of the Class Resources folder for the Dashboard:
 * folder metadata + a list of its top-level children. Read-only — does
 * not touch permissions. Sub-folders are returned alongside files (the
 * UI treats them as "open in Drive" items, same as files).
 *
 * Returns up to CLASS_RESOURCES_LIST_CAP entries, sorted by modified
 * time descending, so the most recently touched material surfaces first
 * even if the folder grows.
 */
function handleListClassResources(payload) {
  var folder = getClassResourcesFolder();
  var files = listFolderFiles(folder);
  return {
    ok: true,
    folder: {
      id: folder.getId(),
      name: folder.getName(),
      webViewLink: folder.getUrl()
    },
    files: files
  };
}

/**
 * Grants viewer access on the Class Resources folder to every email in
 * the student roster (Form Responses 1) plus CLASS_RESOURCES_EXTRA_VIEWERS.
 *
 * Idempotent: emails that already have access are reported under
 * `alreadyHadAccess` and not re-added. Per-email errors (invalid email,
 * Drive rejection, etc.) are collected into `errors` so a single bad
 * row doesn't poison the whole sync.
 *
 * The script owner is intentionally excluded from the grant loop — they
 * own the folder and addViewer would error.
 */
function handleSyncClassResourcesAccess(payload) {
  var folder = getClassResourcesFolder();

  var rosterEmails = getStudentEmails();
  var extraEmails = (CLASS_RESOURCES_EXTRA_VIEWERS || []).map(function (e) {
    return String(e || "").trim().toLowerCase();
  }).filter(function (e) { return e !== ""; });

  // Build the "skip self" set. The folder's `getOwner()` is unreliable
  // for shared-drive sub-folders (it can return the shared drive
  // entity, null, or throw), so also skip the email of the user the
  // web app runs as — that's the canonical "the script owner already
  // has access" check, and it works in both My Drive and shared drives.
  var skip = {};
  try {
    var ownerEmail = String(folder.getOwner().getEmail() || "").toLowerCase();
    if (ownerEmail) skip[ownerEmail] = true;
  } catch (err) {
    // Shared-drive folders without a single owner — fall through.
  }
  try {
    var selfEmail = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
    if (selfEmail) skip[selfEmail] = true;
  } catch (err) {
    // Session.getEffectiveUser is gated by scope on some accounts; safe to ignore.
  }

  var seen = {};
  var targets = [];
  rosterEmails.concat(extraEmails).forEach(function (email) {
    if (!email) return;
    if (skip[email]) return;
    if (seen[email]) return;
    seen[email] = true;
    targets.push(email);
  });

  var existingViewers = {};
  try {
    folder.getViewers().forEach(function (user) {
      var em = String(user.getEmail() || "").toLowerCase();
      if (em) existingViewers[em] = true;
    });
    folder.getEditors().forEach(function (user) {
      var em = String(user.getEmail() || "").toLowerCase();
      if (em) existingViewers[em] = true;
    });
  } catch (err) {
    // Some shared-drive configs throw on getViewers/getEditors enumeration.
    // Treat as "no prior access known" and let addViewer be the source of truth.
  }

  var granted = [];
  var alreadyHadAccess = [];
  var errors = [];

  targets.forEach(function (email) {
    if (existingViewers[email]) {
      alreadyHadAccess.push(email);
      return;
    }
    try {
      folder.addViewer(email);
      granted.push(email);
    } catch (err) {
      errors.push({
        email: email,
        message: err && err.message ? err.message : String(err)
      });
    }
  });

  return {
    ok: true,
    folder: { id: folder.getId(), name: folder.getName() },
    granted: granted,
    alreadyHadAccess: alreadyHadAccess,
    errors: errors
  };
}

// ──────────────────────────────────────────────────────────────────────
// Phase 3 — helpers
// ──────────────────────────────────────────────────────────────────────

/** Maximum number of children returned by handleListClassResources. */
var CLASS_RESOURCES_LIST_CAP = 100;

/**
 * Resolves the Class Resources folder via its Script Property ID.
 * Throws (with a teacher-friendly message) when the property is unset
 * or the ID points at something Drive can't open — both of these
 * messages bubble back to the dashboard as the action's error so the
 * teacher sees what to fix.
 */
function getClassResourcesFolder() {
  var folderId = PropertiesService.getScriptProperties()
    .getProperty(CLASS_RESOURCES_FOLDER_ID_PROPERTY_KEY);
  if (!folderId) {
    throw new Error(
      'Class Resources folder is not configured. Set the "' +
      CLASS_RESOURCES_FOLDER_ID_PROPERTY_KEY +
      '" Script Property to the folder id from its Drive URL.'
    );
  }
  try {
    return DriveApp.getFolderById(folderId);
  } catch (err) {
    throw new Error(
      'Could not open Class Resources folder (id "' + folderId + '"): ' +
      (err && err.message ? err.message : String(err))
    );
  }
}

/**
 * Lists immediate children of a folder (files + sub-folders), sorted
 * by modified time descending. Capped at CLASS_RESOURCES_LIST_CAP.
 *
 * webViewLink is taken from `getUrl()` for both files and folders;
 * iconLink falls back to a Drive-hosted generic icon when Apps Script
 * doesn't expose one for the mime type.
 */
function listFolderFiles(folder) {
  var entries = [];

  var fileIter = folder.getFiles();
  while (fileIter.hasNext()) {
    var f = fileIter.next();
    entries.push({
      id: f.getId(),
      name: f.getName(),
      mimeType: f.getMimeType(),
      modifiedTime: f.getLastUpdated().toISOString(),
      webViewLink: f.getUrl(),
      iconLink: iconLinkForMimeType(f.getMimeType()),
      isFolder: false
    });
  }

  var subIter = folder.getFolders();
  while (subIter.hasNext()) {
    var sf = subIter.next();
    entries.push({
      id: sf.getId(),
      name: sf.getName(),
      mimeType: "application/vnd.google-apps.folder",
      modifiedTime: sf.getLastUpdated().toISOString(),
      webViewLink: sf.getUrl(),
      iconLink: iconLinkForMimeType("application/vnd.google-apps.folder"),
      isFolder: true
    });
  }

  entries.sort(function (a, b) {
    return (b.modifiedTime || "").localeCompare(a.modifiedTime || "");
  });

  if (entries.length > CLASS_RESOURCES_LIST_CAP) {
    entries = entries.slice(0, CLASS_RESOURCES_LIST_CAP);
  }
  return entries;
}

/**
 * Stable Drive icon URL for a given mime type. Drive's CDN serves
 * 16-px icons keyed by mime type; falling back to the generic file
 * icon when the type isn't recognized keeps the UI tidy.
 */
function iconLinkForMimeType(mimeType) {
  var base = "https://drive-thirdparty.googleusercontent.com/16/type/";
  if (!mimeType) return base + "application/octet-stream";
  return base + mimeType;
}

/**
 * Reads "Form Responses 1" and returns the deduped, lowercased list of
 * student email addresses. Skips blanks. Does NOT validate format —
 * Drive will reject genuinely malformed addresses on addViewer, and
 * the sync handler reports those as per-email errors.
 */
function getStudentEmails() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Form Responses 1");
  if (!sheet) {
    throw new Error('Sheet "Form Responses 1" not found');
  }
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0].map(function (h) {
    return String(h || "").trim().toLowerCase();
  });
  var emailCol = headers.indexOf("email address");
  if (emailCol === -1) {
    throw new Error('Could not find "Email Address" column in Form Responses 1');
  }

  var seen = {};
  var emails = [];
  for (var r = 1; r < data.length; r++) {
    var raw = String(data[r][emailCol] || "").trim().toLowerCase();
    if (!raw) continue;
    if (seen[raw]) continue;
    seen[raw] = true;
    emails.push(raw);
  }
  return emails;
}

// ──────────────────────────────────────────────────────────────────────
// Phase 4 — Student Resources (per-student Drive folders, editor access)
// ──────────────────────────────────────────────────────────────────────

/**
 * Returns the per-student folder for one student plus its top-level
 * children. Auto-creates the folder on first call (idempotent, with the
 * student granted editor access) so the dashboard never has to know
 * whether the folder exists yet.
 */
function handleListStudentFolder(payload) {
  var resolved = resolveStudentFromPayload(payload);
  var ensured = ensureStudentFolder(resolved.email, resolved.name);
  var files = listFolderFiles(ensured.folder);
  return {
    ok: true,
    folder: {
      id: ensured.folder.getId(),
      name: ensured.folder.getName(),
      webViewLink: ensured.folder.getUrl(),
      created: ensured.created
    },
    student: { email: resolved.email, name: resolved.name },
    files: files
  };
}

/**
 * Same as list-student-folder but without the file listing — useful
 * when the caller only needs to know the folder exists / get its URL.
 * Used internally by sync-student-folders so the bulk sync doesn't pay
 * the per-student `listFolderFiles` cost for every row.
 */
function handleEnsureStudentFolder(payload) {
  var resolved = resolveStudentFromPayload(payload);
  var ensured = ensureStudentFolder(resolved.email, resolved.name);
  return {
    ok: true,
    folder: {
      id: ensured.folder.getId(),
      name: ensured.folder.getName(),
      webViewLink: ensured.folder.getUrl(),
      created: ensured.created
    },
    student: { email: resolved.email, name: resolved.name }
  };
}

/**
 * Bulk-creates per-student folders for every email in Form Responses 1
 * that doesn't already have one. Reports `created` (newly made),
 * `existed` (already had a folder), and `errors` (per-email failures —
 * e.g. invalid email rejected by Drive's permission API).
 *
 * Idempotent. Safe to re-run after adding new students to the form.
 */
function handleSyncStudentFolders(payload) {
  var parent = getStudentResourcesParentFolder();
  var students = getStudentRoster(); // [{ email, name }, ...]

  var created = [];
  var existed = [];
  var errors = [];

  students.forEach(function (s) {
    try {
      var ensured = ensureStudentFolder(s.email, s.name);
      if (ensured.created) {
        created.push(s.email);
      } else {
        existed.push(s.email);
      }
    } catch (err) {
      errors.push({
        email: s.email,
        message: err && err.message ? err.message : String(err)
      });
    }
  });

  return {
    ok: true,
    parent: { id: parent.getId(), name: parent.getName() },
    created: created,
    existed: existed,
    errors: errors
  };
}

// ──────────────────────────────────────────────────────────────────────
// Phase 4 — helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Resolves an email payload field plus the student's display name from
 * Form Responses 1. The name is best-effort — if the roster doesn't
 * have a row for this email yet, we fall back to the email itself for
 * the folder name.
 */
function resolveStudentFromPayload(payload) {
  var email = String((payload && payload.studentEmail) || "")
    .trim()
    .toLowerCase();
  if (!email) throw new Error("Missing studentEmail");

  var nameByEmail = getStudentNameMap();
  var name = nameByEmail[email] || "";
  return { email: email, name: name };
}

/**
 * Returns the parent folder that holds every per-student sub-folder.
 * Same shape as getClassResourcesFolder — throws a teacher-friendly
 * message when the property is unset or the ID is bad.
 */
function getStudentResourcesParentFolder() {
  var folderId = PropertiesService.getScriptProperties()
    .getProperty(STUDENT_RESOURCES_PARENT_FOLDER_ID_PROPERTY_KEY);
  if (!folderId) {
    throw new Error(
      'Student Resources parent folder is not configured. Set the "' +
      STUDENT_RESOURCES_PARENT_FOLDER_ID_PROPERTY_KEY +
      '" Script Property to the folder id from its Drive URL.'
    );
  }
  try {
    return DriveApp.getFolderById(folderId);
  } catch (err) {
    throw new Error(
      'Could not open Student Resources parent (id "' + folderId + '"): ' +
      (err && err.message ? err.message : String(err))
    );
  }
}

/**
 * Idempotent "make sure this student has a folder, with editor access".
 * Behaviour:
 *   1. If the email maps to a cached folder id (Script Properties) and
 *      that folder is still valid, reuse it — but rename it if the
 *      student's display name changed and re-grant editor access if
 *      needed.
 *   2. Otherwise create a fresh folder under the parent, grant editor
 *      access, cache the id, return.
 *
 * Returns { folder: <Folder>, created: <bool> }.
 *
 * Edits-in-place are intentionally minimal — we never touch existing
 * file contents, never lower a permission, and never delete a stale
 * folder (in case the teacher has work-in-progress in it).
 */
function ensureStudentFolder(email, name) {
  if (!email) throw new Error("ensureStudentFolder requires an email");

  // Serialize concurrent calls for the same student. Without this, two
  // POSTs (e.g. dashboard auto-load + bulk sync) racing for the same
  // never-seen-before email both miss the cache and call createFolder,
  // ending up with two duplicate per-student folders. 30s lock is well
  // above any normal create + permission grant.
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30 * 1000)) {
    throw new Error(
      "Another folder operation is in progress. Please retry in a moment."
    );
  }
  try {
    return ensureStudentFolderLocked(email, name);
  } finally {
    lock.releaseLock();
  }
}

function ensureStudentFolderLocked(email, name) {
  var parent = getStudentResourcesParentFolder();
  var props = PropertiesService.getScriptProperties();
  var cacheKey = STUDENT_FOLDER_PROPERTY_PREFIX + email;
  var cachedId = props.getProperty(cacheKey);

  var folder = null;
  if (cachedId) {
    try {
      folder = DriveApp.getFolderById(cachedId);
    } catch (err) {
      folder = null;
      props.deleteProperty(cacheKey);
    }
  }

  var created = false;
  if (!folder) {
    folder = parent.createFolder(studentFolderName(name, email));
    props.setProperty(cacheKey, folder.getId());
    created = true;
  } else {
    var desiredName = studentFolderName(name, email);
    if (folder.getName() !== desiredName && name) {
      folder.setName(desiredName);
    }
  }

  applyStudentFolderPermissions(folder, email);
  return { folder: folder, created: created };
}

/**
 * Grants editor access to the student + every email in
 * STUDENT_RESOURCES_EXTRA_EDITORS, idempotently. Skips emails that
 * already have access at editor-or-above OR match the folder owner /
 * deployer. Per-email errors (invalid address, account not in
 * Google's directory yet, Drive transient) are LOGGED but do not
 * throw — otherwise one bad address would break the entire folder
 * listing for the teacher. The dashboard's "Sync student folders"
 * backfill button can re-try later.
 */
function applyStudentFolderPermissions(folder, studentEmail) {
  var normalizedStudent = String(studentEmail || "").trim().toLowerCase();

  var existing = {};
  try {
    folder.getEditors().forEach(function (u) {
      var em = String(u.getEmail() || "").toLowerCase();
      if (em) existing[em] = true;
    });
  } catch (err) {
    // Some shared-drive edge cases — fall through to addEditor as source of truth.
  }

  var skip = {};
  try {
    var ownerEmail = String(folder.getOwner().getEmail() || "").toLowerCase();
    if (ownerEmail) skip[ownerEmail] = true;
  } catch (err) {
    // Shared-drive sub-folders may have no single owner. Falls through.
  }
  try {
    var selfEmail = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
    if (selfEmail) skip[selfEmail] = true;
  } catch (err) {
    // Session.getEffectiveUser is gated by scope on some accounts; safe to ignore.
  }

  var targets = [];
  if (normalizedStudent) targets.push(normalizedStudent);
  (STUDENT_RESOURCES_EXTRA_EDITORS || []).forEach(function (e) {
    var trimmed = String(e || "").trim().toLowerCase();
    if (trimmed) targets.push(trimmed);
  });

  targets.forEach(function (em) {
    if (!em) return;
    if (skip[em]) return;
    if (existing[em]) return;
    try {
      folder.addEditor(em);
    } catch (err) {
      // Don't let one bad address take down the whole folder listing.
      // Most common cause is the email not being in Google's directory
      // yet (new student account, typo on the form, or a personal
      // Gmail with restricted sharing). Teacher can re-share manually
      // from Drive if needed.
      Logger.log(
        "applyStudentFolderPermissions: addEditor(" + em + ") on folder " +
        folder.getId() + " failed: " + (err && err.message ? err.message : err)
      );
    }
  });
}

/**
 * "First Last — student@example.com" if both sides are non-empty;
 * "student@example.com" otherwise. Keeping the email visible in the
 * folder name makes it easy for the teacher to find a folder in Drive
 * directly when the cache is empty / mid-debugging.
 */
function studentFolderName(name, email) {
  var trimmed = String(name || "").trim();
  if (!trimmed) return String(email).trim();
  return trimmed + " - " + String(email).trim();
}

/**
 * Reads "Form Responses 1" and returns a map of email → name (the
 * latest non-empty name wins for a given email). Used by
 * `resolveStudentFromPayload` for per-student lookups.
 */
function getStudentNameMap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Form Responses 1");
  if (!sheet) return {};
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return {};
  var headers = data[0].map(function (h) {
    return String(h || "").trim().toLowerCase();
  });
  var emailCol = headers.indexOf("email address");
  var nameCol = headers.indexOf("first and last name");
  if (nameCol === -1) nameCol = headers.indexOf("name");
  if (emailCol === -1) return {};

  var out = {};
  for (var r = 1; r < data.length; r++) {
    var em = String(data[r][emailCol] || "").trim().toLowerCase();
    if (!em) continue;
    var nm = nameCol === -1 ? "" : String(data[r][nameCol] || "").trim();
    if (nm) out[em] = nm; // later submissions overwrite earlier ones
    else if (!(em in out)) out[em] = "";
  }
  return out;
}

/**
 * Deduped roster as `[{ email, name }, ...]`. Used by the bulk
 * sync handler. Same source of truth as `getStudentEmails` (Form
 * Responses 1); the name is best-effort and may be empty.
 */
function getStudentRoster() {
  var emails = getStudentEmails();
  var nameByEmail = getStudentNameMap();
  return emails.map(function (em) {
    return { email: em, name: nameByEmail[em] || "" };
  });
}

// ──────────────────────────────────────────────────────────────────────
// Phase 5 — Teacher recaps
// ──────────────────────────────────────────────────────────────────────

/**
 * Returns the recap for one specific lesson, or `null` if none exists.
 * Read-only — never touches the schema. Lesson Recaps tab missing is
 * a clean null return rather than an error so the UI can render an
 * empty state without a server roundtrip first.
 */
function handleGetLessonRecap(payload) {
  var key = parseRecapKey(payload);
  var existing = findRecapRow(key);
  return {
    ok: true,
    recap: existing ? existing.recap : null
  };
}

/**
 * Upserts the recap for one lesson. Auto-creates the Lesson Recaps
 * tab + headers on first call so the teacher never has to set up the
 * sheet manually. `fields` is an object with up to four string keys:
 * greeting, todayWe, homework, nextClass. Missing fields default to
 * empty string. Updated At is set server-side (current time in the
 * spreadsheet's TZ).
 */
function handleSaveLessonRecap(payload) {
  var key = parseRecapKey(payload);
  var fields = (payload && payload.fields) || {};

  var greeting = String(fields.greeting || "");
  var todayWe = String(fields.todayWe || "");
  var homework = String(fields.homework || "");
  var nextClass = String(fields.nextClass || "");

  // Pull the student's display name from the roster when available so
  // recaps stay readable even if the original lesson row only had an
  // email. We take "best name we know now"; if the form hasn't been
  // submitted yet the column stays blank, which is fine.
  var nameByEmail = getStudentNameMap();
  var studentName = nameByEmail[key.studentEmail] || "";

  var sheet = ensureRecapsSheet();
  var headers = recapHeaders(sheet);
  var emailCol = headerIndex(headers, "Student Email") + 1;
  var nameCol = headerIndex(headers, "Student Name") + 1;
  var dateCol = headerIndex(headers, "Lesson Date") + 1;
  var startCol = headerIndex(headers, "Start Time") + 1;
  var greetingCol = headerIndex(headers, "Greeting") + 1;
  var todayCol = headerIndex(headers, "Today We") + 1;
  var homeworkCol = headerIndex(headers, "Homework") + 1;
  var nextCol = headerIndex(headers, "Next Class") + 1;
  var updatedCol = headerIndex(headers, "Updated At") + 1;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tz = ss.getSpreadsheetTimeZone();
  var now = new Date();
  var nowIso = Utilities.formatDate(now, tz, "yyyy-MM-dd'T'HH:mm:ssXXX");

  var existing = findRecapRow(key);
  var rowIndex;
  if (existing) {
    rowIndex = existing.rowIndex;
  } else {
    rowIndex = sheet.getLastRow() + 1;
    sheet.getRange(rowIndex, emailCol).setValue(key.studentEmail);
    sheet.getRange(rowIndex, dateCol).setValue(key.lessonDate);
    sheet.getRange(rowIndex, startCol).setValue(key.startTime);
  }

  // Always refresh the display name from the roster on save — keeps it
  // consistent if a student renamed themselves on the form.
  if (studentName) sheet.getRange(rowIndex, nameCol).setValue(studentName);
  sheet.getRange(rowIndex, greetingCol).setValue(greeting);
  sheet.getRange(rowIndex, todayCol).setValue(todayWe);
  sheet.getRange(rowIndex, homeworkCol).setValue(homework);
  sheet.getRange(rowIndex, nextCol).setValue(nextClass);
  sheet.getRange(rowIndex, updatedCol).setValue(nowIso);
  SpreadsheetApp.flush();

  return {
    ok: true,
    recap: {
      studentEmail: key.studentEmail,
      studentName: studentName,
      lessonDate: key.lessonDate,
      startTime: key.startTime,
      greeting: greeting,
      todayWe: todayWe,
      homework: homework,
      nextClass: nextClass,
      updatedAt: nowIso
    }
  };
}

/**
 * Returns every recap for one student, sorted by lesson date desc
 * then start time desc (newest first). `[]` when the tab is missing
 * or the student has no recaps yet.
 */
function handleListRecapsForStudent(payload) {
  var email = String((payload && payload.studentEmail) || "")
    .trim()
    .toLowerCase();
  if (!email) throw new Error("Missing studentEmail");

  var recaps = readAllRecaps().filter(function (r) {
    return String(r.studentEmail).toLowerCase() === email;
  });
  recaps.sort(compareRecapsNewestFirst);
  return { ok: true, recaps: recaps };
}

/**
 * Returns every recap in the system, sorted newest first. Used by
 * the Recaps tab page on the website.
 */
function handleListRecaps(payload) {
  var recaps = readAllRecaps();
  recaps.sort(compareRecapsNewestFirst);
  return { ok: true, recaps: recaps };
}

// ──────────────────────────────────────────────────────────────────────
// Phase 5 — helpers
// ──────────────────────────────────────────────────────────────────────

function parseRecapKey(payload) {
  var studentEmail = String((payload && payload.studentEmail) || "")
    .trim()
    .toLowerCase();
  var lessonDate = String((payload && payload.lessonDate) || "").trim();
  var startTime = String((payload && payload.startTime) || "").trim();
  if (!studentEmail) throw new Error("Missing studentEmail");
  if (!lessonDate) throw new Error("Missing lessonDate");
  if (!startTime) throw new Error("Missing startTime");
  return { studentEmail: studentEmail, lessonDate: lessonDate, startTime: startTime };
}

/**
 * Returns the Lesson Recaps sheet, creating it (with the canonical
 * header row) if it doesn't exist. Idempotent. Existing tabs with
 * a different column order are left alone — we look up columns by
 * header name, not position.
 */
function ensureRecapsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LESSON_RECAPS_SHEET_NAME);
  var freshlyCreated = false;
  if (!sheet) {
    sheet = ss.insertSheet(LESSON_RECAPS_SHEET_NAME);
    sheet.getRange(1, 1, 1, LESSON_RECAPS_HEADERS.length)
      .setValues([LESSON_RECAPS_HEADERS])
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
    freshlyCreated = true;
  } else if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, LESSON_RECAPS_HEADERS.length)
      .setValues([LESSON_RECAPS_HEADERS])
      .setFontWeight("bold");
    sheet.setFrozenRows(1);
    freshlyCreated = true;
  }
  if (freshlyCreated) {
    try {
      formatLessonRecapsSheet(sheet);
    } catch (err) {
      Logger.log("formatLessonRecapsSheet failed: " + err);
    }
  }
  return sheet;
}

/**
 * Returns the header row of the Lesson Recaps tab. Auto-appends any
 * headers from LESSON_RECAPS_HEADERS that are missing (so older
 * sheets created before a new column was added still work).
 */
function recapHeaders(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var existing = {};
  headers.forEach(function (h) { existing[String(h).trim()] = true; });
  var missing = LESSON_RECAPS_HEADERS.filter(function (h) { return !existing[h]; });
  if (missing.length > 0) {
    var startCol = lastCol + 1;
    sheet.getRange(1, startCol, 1, missing.length)
      .setValues([missing])
      .setFontWeight("bold");
    headers = headers.concat(missing);
  }
  return headers;
}

/**
 * Looks up one recap row by composite key. Returns
 * `{ rowIndex, recap }` (1-indexed) or `null` when no match. Returns
 * `null` (not throws) when the tab doesn't exist, which is the
 * pre-first-save state.
 */
function findRecapRow(key) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LESSON_RECAPS_SHEET_NAME);
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;

  var headers = data[0];
  var emailCol = headerIndex(headers, "Student Email");
  var dateCol = headerIndex(headers, "Lesson Date");
  var startCol = headerIndex(headers, "Start Time");
  if (emailCol === -1 || dateCol === -1 || startCol === -1) return null;

  var ssTz = ss.getSpreadsheetTimeZone();
  for (var r = 1; r < data.length; r++) {
    var rowEmail = String(data[r][emailCol] || "").trim().toLowerCase();
    if (rowEmail !== key.studentEmail) continue;
    var rowDate = normalizeSheetDate(data[r][dateCol], ssTz);
    if (rowDate !== key.lessonDate) continue;
    var rowStart = normalizeSheetTime(data[r][startCol], ssTz);
    if (rowStart !== key.startTime) continue;
    return {
      rowIndex: r + 1,
      recap: recapRowToObject(headers, data[r], ssTz)
    };
  }
  return null;
}

/**
 * Reads every recap from the Lesson Recaps tab into a plain JS array.
 * Returns `[]` when the tab is missing — which is normal until the
 * teacher saves their first recap.
 */
function readAllRecaps() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LESSON_RECAPS_SHEET_NAME);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var ssTz = ss.getSpreadsheetTimeZone();
  var out = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var email = String(row[headerIndex(headers, "Student Email")] || "").trim();
    if (!email) continue; // skip blank rows
    out.push(recapRowToObject(headers, row, ssTz));
  }
  return out;
}

function recapRowToObject(headers, row, ssTz) {
  function pick(name) {
    var idx = headerIndex(headers, name);
    return idx === -1 ? "" : row[idx];
  }
  var dateRaw = pick("Lesson Date");
  var startRaw = pick("Start Time");
  var updatedRaw = pick("Updated At");

  var lessonDate = normalizeSheetDate(dateRaw, ssTz);
  var startTime = normalizeSheetTime(startRaw, ssTz);
  var updatedAt;
  if (updatedRaw instanceof Date) {
    updatedAt = updatedRaw.toISOString();
  } else {
    updatedAt = String(updatedRaw || "").trim();
  }

  return {
    studentEmail: String(pick("Student Email") || "").trim().toLowerCase(),
    studentName: String(pick("Student Name") || "").trim(),
    lessonDate: lessonDate,
    startTime: startTime,
    greeting: String(pick("Greeting") || ""),
    todayWe: String(pick("Today We") || ""),
    homework: String(pick("Homework") || ""),
    nextClass: String(pick("Next Class") || ""),
    updatedAt: updatedAt
  };
}

/** Sort comparator: newer lesson first; if same date, later start first. */
function compareRecapsNewestFirst(a, b) {
  if (a.lessonDate < b.lessonDate) return 1;
  if (a.lessonDate > b.lessonDate) return -1;
  // Same date — compare start times. Wall-clock strings sort poorly;
  // compare via Date objects parsed with parseWallClockTime.
  var ah = parseWallClockTime(a.startTime) || { h: 0, m: 0 };
  var bh = parseWallClockTime(b.startTime) || { h: 0, m: 0 };
  var aMin = ah.h * 60 + ah.m;
  var bMin = bh.h * 60 + bh.m;
  return bMin - aMin;
}

/**
 * Form-submit trigger. Buckets every new submission into a tab named
 * after the submitter's email so `?email=…` lookups are O(1).
 *
 * Install: Triggers → Add Trigger → onFormSubmit / From spreadsheet /
 * On form submit.
 */
function onFormSubmit(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const formSheet = ss.getSheetByName("Form Responses 1");

  const headers = formSheet.getRange(1, 1, 1, formSheet.getLastColumn()).getValues()[0];
  const responses = e.values;

  const normalizedHeaders = headers.map(h => String(h).trim().toLowerCase());
  const emailIndex = normalizedHeaders.indexOf("email address");

  if (emailIndex === -1) {
    throw new Error('Could not find "Email Address" column. Found headers: ' + headers.join(" | "));
  }

  const email = String(responses[emailIndex] || "").trim().toLowerCase();

  if (!email) {
    throw new Error("Email is blank. Response row: " + JSON.stringify(responses));
  }

  // Pull the student's name from the same row when available — used as
  // the per-student folder name. Tries common header variants so a
  // future form rename doesn't silently fall back to email-only.
  var nameIndex = normalizedHeaders.indexOf("first and last name");
  if (nameIndex === -1) nameIndex = normalizedHeaders.indexOf("name");
  var studentName = nameIndex === -1
    ? ""
    : String(responses[nameIndex] || "").trim();

  let sheet = ss.getSheetByName(email);
  var createdNewTab = false;

  if (!sheet) {
    sheet = ss.insertSheet(email);
    sheet.appendRow(headers);
    createdNewTab = true;
  }

  sheet.appendRow(responses);

  if (createdNewTab) {
    try {
      formatStudentTab(sheet);
    } catch (err) {
      // Formatting is cosmetic — never let a styling failure block the
      // submission from being recorded.
      Logger.log("formatStudentTab failed for " + email + ": " + err);
    }
  }

  // Auto-onboard the student into Drive: their personal folder (with
  // editor access) plus viewer access on the shared Class Resources
  // folder. Each step is wrapped so a configuration miss (folder ID
  // not set, Drive quota, etc.) never blocks the submission from being
  // recorded — the bulk Sync handlers can backfill any failures.
  try {
    ensureStudentFolder(email, studentName);
  } catch (err) {
    Logger.log("ensureStudentFolder failed for " + email + ": " + err);
  }

  try {
    grantClassResourcesViewerForStudent(email);
  } catch (err) {
    Logger.log("grantClassResourcesViewerForStudent failed for " + email + ": " + err);
  }
}

/**
 * Best-effort: grant viewer access on the Class Resources folder to a
 * single newly-onboarded student. No-op when the folder isn't
 * configured (e.g. fresh deployment), when the email already has
 * access at viewer-or-above, or when Drive rejects the email — all
 * three are conditions the bulk `sync-class-resources-access` handler
 * also tolerates, so this stays consistent with that flow.
 */
function grantClassResourcesViewerForStudent(studentEmail) {
  var normalized = String(studentEmail || "").trim().toLowerCase();
  if (!normalized) return;
  var folderId = PropertiesService.getScriptProperties()
    .getProperty(CLASS_RESOURCES_FOLDER_ID_PROPERTY_KEY);
  if (!folderId) return; // not configured yet — skip silently
  var folder;
  try {
    folder = DriveApp.getFolderById(folderId);
  } catch (err) {
    Logger.log("Class Resources folder unreachable: " + err);
    return;
  }
  // Skip if already has access at any level.
  try {
    var viewers = folder.getViewers();
    for (var i = 0; i < viewers.length; i++) {
      if (String(viewers[i].getEmail() || "").toLowerCase() === normalized) return;
    }
    var editors = folder.getEditors();
    for (var j = 0; j < editors.length; j++) {
      if (String(editors[j].getEmail() || "").toLowerCase() === normalized) return;
    }
  } catch (err) {
    // Some shared-drive configs throw; fall through and let addViewer be
    // the source of truth.
  }
  // Skip if it's the folder owner or current deployer — addViewer
  // would error in those cases.
  try {
    var ownerEmail = String(folder.getOwner().getEmail() || "").toLowerCase();
    if (ownerEmail === normalized) return;
  } catch (err) {
    // Shared-drive folders without a single owner — fall through.
  }
  try {
    var selfEmail = String(Session.getEffectiveUser().getEmail() || "").toLowerCase();
    if (selfEmail === normalized) return;
  } catch (err) {
    // Session.getEffectiveUser is gated by scope on some accounts; safe to ignore.
  }
  try {
    folder.addViewer(normalized);
  } catch (err) {
    // Same reasoning as applyStudentFolderPermissions: a single bad
    // address shouldn't break the form-submit handler. Log and let
    // the bulk Sync handler retry later.
    Logger.log(
      "grantClassResourcesViewerForStudent: addViewer(" + normalized +
      ") failed: " + (err && err.message ? err.message : err)
    );
  }
}

// ──────────────────────────────────────────────────────────────────────
// Sheet formatting + auto-column protection
//
// One-time setup: open the Apps Script editor, select setupSheetFormatting,
// and click Run. It styles every known tab (Form Responses 1, Lesson
// Schedule, Lesson Recaps, every per-student tab) and applies warning-only
// protection to the auto-managed columns ("Status", "Calendar Event ID")
// on the Lesson Schedule tab.
//
// New per-student tabs created by `onFormSubmit` are styled at creation,
// so the teacher only ever needs to run setupSheetFormatting() once after
// pulling new code (and again if a tab gets manually renamed or rebuilt).
// ──────────────────────────────────────────────────────────────────────

/** Pomfret crimson palette — mirrors the dashboard's --accent / surfaces. */
var FMT_HEADER_BG = "#7a142f";
var FMT_HEADER_TEXT = "#ffffff";
var FMT_BAND_FIRST = "#fffdfb";
var FMT_BAND_SECOND = "#f6f1ec";
var FMT_AUTO_COLUMN_BG = "#ece4dd";
var FMT_AUTO_COLUMN_TEXT = "#574d44";

/**
 * Columns the dashboard writes to automatically. Listed by exact header
 * string; warning-only protection + visual highlight is applied to each.
 * Anything edited in these columns by hand will be overwritten on the
 * next create-event / cancel-event call, hence the warning.
 */
var AUTO_MANAGED_LESSON_COLUMNS = ["Status", CALENDAR_EVENT_ID_COLUMN];

/** Note shown when the teacher hovers a header cell of an auto column. */
var AUTO_MANAGED_HEADER_NOTE =
  "Auto-managed by the dashboard. Don't edit by hand: your changes will " +
  "be overwritten the next time the dashboard updates this lesson.";

/** Description used on the warning-only protection (also shown in the dialog). */
var AUTO_MANAGED_PROTECTION_DESCRIPTION =
  "Auto-managed by the Music Studio dashboard. Please don't edit.";

/**
 * Property key for an explicit fallback spreadsheet ID. Only consulted
 * when `SpreadsheetApp.getActiveSpreadsheet()` returns null — which
 * happens for standalone scripts (not container-bound) or when the
 * editor is opened from `script.google.com` without an associated
 * sheet. Set it once in Project Settings → Script Properties:
 *   MUSIC_STUDIO_SPREADSHEET_ID = <id portion of the sheet URL>
 * The id is the segment between `/d/` and `/edit` in the sheet URL.
 */
var MUSIC_STUDIO_SPREADSHEET_ID_PROPERTY_KEY = "MUSIC_STUDIO_SPREADSHEET_ID";

/**
 * Returns the music studio spreadsheet, tolerant of how the script was
 * launched. Used by setup-time helpers that may run from the editor
 * before the runtime has an active-spreadsheet context.
 */
function resolveMusicStudioSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  var fallbackId = PropertiesService.getScriptProperties()
    .getProperty(MUSIC_STUDIO_SPREADSHEET_ID_PROPERTY_KEY);
  if (!fallbackId) {
    throw new Error(
      "No active spreadsheet and no fallback ID configured. Either open " +
      "the editor via Sheet → Extensions → Apps Script, or set the " +
      MUSIC_STUDIO_SPREADSHEET_ID_PROPERTY_KEY +
      " Script Property to the spreadsheet ID (the segment between /d/ " +
      "and /edit in the sheet URL)."
    );
  }
  try {
    return SpreadsheetApp.openById(fallbackId);
  } catch (err) {
    throw new Error(
      "Could not open spreadsheet by id '" + fallbackId + "': " +
      (err && err.message ? err.message : String(err))
    );
  }
}

/**
 * Manual entry point. Run once from the Apps Script editor after deploying
 * a new version. Formats every known tab and (re-)applies warning-only
 * protection to the auto-managed columns on the Lesson Schedule tab.
 *
 * Idempotent — safe to run repeatedly.
 */
function setupSheetFormatting() {
  var ss = resolveMusicStudioSpreadsheet();
  var summary = { formatted: [], skipped: [] };

  var roster = ss.getSheetByName("Form Responses 1");
  if (roster) {
    formatRosterSheet(roster);
    summary.formatted.push("Form Responses 1");
  } else {
    summary.skipped.push("Form Responses 1 (not found)");
  }

  var schedule = ss.getSheetByName(LESSON_SCHEDULE_SHEET_NAME);
  if (schedule) {
    formatLessonScheduleSheet(schedule);
    summary.formatted.push(LESSON_SCHEDULE_SHEET_NAME);
  } else {
    summary.skipped.push(LESSON_SCHEDULE_SHEET_NAME + " (not found)");
  }

  var recaps = ss.getSheetByName(LESSON_RECAPS_SHEET_NAME);
  if (recaps) {
    formatLessonRecapsSheet(recaps);
    summary.formatted.push(LESSON_RECAPS_SHEET_NAME);
  } else {
    summary.skipped.push(LESSON_RECAPS_SHEET_NAME + " (not created yet)");
  }

  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var s = sheets[i];
    var name = s.getName();
    if (name === "Form Responses 1") continue;
    if (name === LESSON_SCHEDULE_SHEET_NAME) continue;
    if (name === LESSON_RECAPS_SHEET_NAME) continue;
    // Per-student tabs are named after the student's email.
    if (!/.+@.+\..+/.test(name)) continue;
    formatStudentTab(s);
    summary.formatted.push(name);
  }

  Logger.log("setupSheetFormatting complete.");
  Logger.log("Formatted: " + summary.formatted.join(", "));
  if (summary.skipped.length > 0) {
    Logger.log("Skipped:   " + summary.skipped.join(", "));
  }
  return { ok: true, formatted: summary.formatted, skipped: summary.skipped };
}

/**
 * Common base format applied to every tab: bold/colored header row,
 * frozen first row, alternating row banding in the Pomfret palette,
 * and a thin border under the header.
 */
function applyBaseTableFormat(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var maxRows = Math.max(sheet.getMaxRows(), 2);

  // Header row.
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange
    .setFontWeight("bold")
    .setFontColor(FMT_HEADER_TEXT)
    .setBackground(FMT_HEADER_BG)
    .setVerticalAlignment("middle")
    .setWrap(true);

  sheet.setFrozenRows(1);

  // Body — neutral defaults so banding shows through cleanly.
  var bodyRange = sheet.getRange(2, 1, maxRows - 1, lastCol);
  bodyRange
    .setFontColor("#1a1411")
    .setFontStyle("normal")
    .setVerticalAlignment("top");

  // Replace any existing banding on this sheet so we own the colors.
  var existingBandings = sheet.getBandings();
  for (var i = 0; i < existingBandings.length; i++) {
    existingBandings[i].remove();
  }

  // Apply a wide banding so future rows pick up the alternating colors
  // without the teacher needing to re-run formatting.
  var bandingRange = sheet.getRange(1, 1, maxRows, lastCol);
  var banding = bandingRange.applyRowBanding(
    SpreadsheetApp.BandingTheme.LIGHT_GREY,
    /* showHeader */ true,
    /* showFooter */ false
  );
  banding.setHeaderRowColor(FMT_HEADER_BG);
  banding.setFirstRowColor(FMT_BAND_FIRST);
  banding.setSecondRowColor(FMT_BAND_SECOND);

  // Resize columns to fit headers + content (capped so a stray long cell
  // doesn't blow the layout out).
  for (var c = 1; c <= lastCol; c++) {
    try {
      sheet.autoResizeColumn(c);
      var w = sheet.getColumnWidth(c);
      if (w < 110) sheet.setColumnWidth(c, 110);
      if (w > 320) sheet.setColumnWidth(c, 320);
    } catch (err) {
      // Some sheets reject autoResize on hidden columns — ignore.
    }
  }
}

/** Format the master roster (Form Responses 1) — base format only. */
function formatRosterSheet(sheet) {
  applyBaseTableFormat(sheet);
}

/** Format a per-student tab — base format only. */
function formatStudentTab(sheet) {
  applyBaseTableFormat(sheet);
}

/** Format the Lesson Recaps tab — base format only. */
function formatLessonRecapsSheet(sheet) {
  applyBaseTableFormat(sheet);
}

/**
 * Format the Lesson Schedule tab. Base format + visual highlight + warning
 * protection on every column listed in AUTO_MANAGED_LESSON_COLUMNS.
 *
 * Requires the Calendar Event ID column to exist (we ensure it on every
 * lookup, but if no preview/create has run yet this function will still
 * try). If a column is missing it is silently skipped — the formatting
 * is cosmetic and shouldn't block setup.
 */
function formatLessonScheduleSheet(sheet) {
  ensureCalendarEventIdColumn(sheet);
  applyBaseTableFormat(sheet);

  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  for (var i = 0; i < AUTO_MANAGED_LESSON_COLUMNS.length; i++) {
    var name = AUTO_MANAGED_LESSON_COLUMNS[i];
    var idx = headerIndex(headers, name);
    if (idx === -1) continue;
    highlightAutoManagedColumn(sheet, idx + 1, name);
    protectAutoManagedColumn(sheet, idx + 1);
  }
}

/**
 * Visual treatment for an auto-managed column: header gets a hover note,
 * data cells get a muted background + italic font so the teacher
 * immediately sees the column is "different".
 */
function highlightAutoManagedColumn(sheet, columnIndex, columnName) {
  var maxRows = Math.max(sheet.getMaxRows(), 2);

  sheet.getRange(1, columnIndex)
    .setNote(AUTO_MANAGED_HEADER_NOTE);

  // Append "(auto)" marker to the visible header without changing the
  // canonical column name (header lookups use the raw value, so we keep
  // the original text and use a note instead — no value rewrite).

  sheet.getRange(2, columnIndex, maxRows - 1, 1)
    .setBackground(FMT_AUTO_COLUMN_BG)
    .setFontColor(FMT_AUTO_COLUMN_TEXT)
    .setFontStyle("italic");
}

/**
 * Warning-only protection on an auto-managed column. Anyone editing the
 * cells gets a confirm dialog explaining that the dashboard owns this
 * data — they can override, but the next create/cancel will rewrite it.
 *
 * Idempotent: removes any prior protection with the same description
 * before adding a fresh one, so re-running setup never stacks up
 * duplicate protections on the same range.
 */
function protectAutoManagedColumn(sheet, columnIndex) {
  var maxRows = Math.max(sheet.getMaxRows(), 2);
  var range = sheet.getRange(2, columnIndex, maxRows - 1, 1);

  var existing = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  for (var i = 0; i < existing.length; i++) {
    var p = existing[i];
    if (p.getDescription() === AUTO_MANAGED_PROTECTION_DESCRIPTION) {
      var r = p.getRange();
      if (r.getColumn() === columnIndex && r.getNumColumns() === 1) {
        p.remove();
      }
    }
  }

  range.protect()
    .setDescription(AUTO_MANAGED_PROTECTION_DESCRIPTION)
    .setWarningOnly(true);
}
