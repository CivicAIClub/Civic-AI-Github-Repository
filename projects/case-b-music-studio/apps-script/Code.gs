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
 * HTTP endpoints (one Web App, routed by query params)
 * ───────────────────────────────────────────────────────────────────────
 *  GET ?email=foo@bar.com           → latest row from that student's tab
 *  GET ?action=list                 → { students: [...] }  every roster row
 *  GET ?action=schedule-list        → { rows: [...] }      all booked lessons
 *  GET ?action=schedule&email=…     → { rows: [...] }      one student's lessons
 *
 * The frontend client lives in:
 *   src/api/appsScriptStudent.ts
 *   src/api/appsScriptSchedule.ts
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
 *  src/api/appsScriptStudent.ts (line 30 at the time of writing).
 */

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = String(e.parameter.action || "").trim().toLowerCase();
  const email = String(e.parameter.email || "").trim().toLowerCase();

  // 1) One student by email — latest row from that student's per-email tab.
  if (email && !action) {
    const sheet = ss.getSheetByName(email);
    if (!sheet) {
      return jsonResponse({ error: "Student not found" });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ error: "No data found for this student" });
    }

    const headers = data[0];
    const lastRow = data[data.length - 1];
    return jsonResponse(rowToObject(headers, lastRow));
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
 */
function rowToObject(headers, row) {
  const ssTz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    const key = String(headers[i] || "").trim();
    const val = row[i];
    if (val instanceof Date && val.getFullYear() < 1900) {
      obj[key] = Utilities.formatDate(val, ssTz, "h:mm a");
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
