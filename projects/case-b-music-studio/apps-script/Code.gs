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
 *  POST body (Content-Type: text/plain — see CORS note below):
 *    {"action":"ping","secret":"…"}  → { ok: true, pong: true, ts: <ms> }
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
 *  Future POST actions (Phases 3+) will follow the same shape:
 *    { "action": "<name>", "secret": "…", ...payload }
 *
 * The frontend clients live in:
 *   src/api/appsScriptStudent.ts        (GET, roster + single student)
 *   src/api/appsScriptSchedule.ts       (GET, lesson schedule)
 *   src/api/appsScriptPost.ts           (POST, write actions — Phase 1+)
 *
 * ───────────────────────────────────────────────────────────────────────
 * Auth (shared secret, v1)
 * ───────────────────────────────────────────────────────────────────────
 *  Every POST must include a "secret" field whose value matches the
 *  SHARED_SECRET stored in Script Properties (Project Settings → Script
 *  Properties → Add property: SHARED_SECRET = <random 64-char hex>).
 *  The secret is NEVER committed to git: Code.gs reads it at runtime,
 *  the frontend reads it from .env.local (VITE_APPS_SCRIPT_SHARED_SECRET).
 *
 *  TODO(security): Migrate to Google Sign-In ("Execute as user accessing
 *  the web app" + allowlist) before linking the deployed site publicly.
 *  A leaked shared secret here would let anyone create calendar events
 *  on the teacher's calendar.
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
 * Always invited to every auto-created lesson event. Use the teacher's
 * own email (the script owner) is implicit because they own the
 * calendar; this list is for additional always-on guests.
 *
 * TODO(launch): replace caydenauyang@gmail.com with Dr. Burns' real
 * email before linking the deployed site publicly.
 */
var ALWAYS_INVITE_EMAILS = ["caydenauyang@gmail.com"];

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
  // Apps Script doesn't ship a constant-time comparator, but mismatching
  // the length first eliminates the easiest timing leak. Iterate the
  // full string regardless of early differences.
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
  var found = findLessonRowFromPayload(payload);
  var sheet = found.sheet;
  var rowIndex = found.rowIndex;
  var row = found.row;
  var eventIdCol = found.calendarEventIdCol; // 1-indexed
  var statusCol = found.statusCol;            // 1-indexed or null

  // Idempotency guard.
  var existingId = String(row[CALENDAR_EVENT_ID_COLUMN] || "").trim();
  if (existingId) {
    var existingEvent = safeGetEvent(existingId);
    return {
      ok: true,
      alreadyScheduled: true,
      calendarEventId: existingId,
      eventLink: existingEvent ? eventEditUrl(existingEvent) : null,
      preview: buildEventPreview(row)
    };
  }

  var preview = buildEventPreview(row);
  var calendar = CalendarApp.getDefaultCalendar();

  var event = calendar.createEvent(
    preview.title,
    new Date(preview.startISO),
    new Date(preview.endISO),
    {
      description: preview.description,
      guests: preview.attendees.join(","),
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
  Logger.log("Spreadsheet: " + ssName);
  Logger.log("Calendar:    " + calName);
  Logger.log(
    "Authorization complete. Re-deploy (Manage deployments → ✏️ → New version) " +
    "if you haven't already."
  );
  return { ok: true, spreadsheet: ssName, calendar: calName };
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
  sheet.getRange(1, lastCol + 1).setValue(CALENDAR_EVENT_ID_COLUMN);
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
  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error("End time must be after start time");
  }

  var displayName = studentName || studentEmail;
  var title = lessonFocus
    ? displayName + " — " + lessonFocus
    : displayName + " — Music Lesson";

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

  var attendeeSet = {};
  attendeeSet[studentEmail.toLowerCase()] = studentEmail;
  for (var i = 0; i < ALWAYS_INVITE_EMAILS.length; i++) {
    var e = ALWAYS_INVITE_EMAILS[i];
    if (e) attendeeSet[e.toLowerCase()] = e;
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

  let sheet = ss.getSheetByName(email);

  if (!sheet) {
    sheet = ss.insertSheet(email);
    sheet.appendRow(headers);
  }

  sheet.appendRow(responses);
}
