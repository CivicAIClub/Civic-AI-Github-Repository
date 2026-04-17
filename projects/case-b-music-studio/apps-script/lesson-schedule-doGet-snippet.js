/**
 * Google Apps Script — merge these pieces into your existing Code.gs `doGet`.
 *
 * Tab name (must match your spreadsheet): "Lesson Schedule"
 * Expected row 1 headers (exact strings):
 *   Student Email, Student Name, Lesson Date, Lesson Block, Start Time, End Time,
 *   Status, Lesson Focus, Note (or Notes)
 *
 * Endpoints (same web app URL as roster):
 *   ?action=schedule-list     → JSON array of row objects (header keys)
 *   ?action=schedule&email=…  → JSON array of rows for that student email only
 *
 * Rows with a blank Student Email are skipped. Date cells become ISO strings in JSON.
 */

var LESSON_SCHEDULE_TAB_NAME = "Lesson Schedule";
var SCHEDULE_EMAIL_HEADER = "Student Email";

function lessonScheduleRowsToObjects_(filterEmailLower) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LESSON_SCHEDULE_TAB_NAME);
  if (!sh) {
    return { error: "Lesson Schedule tab not found" };
  }
  var range = sh.getDataRange();
  var values = range.getValues();
  if (!values || values.length < 2) {
    return [];
  }
  var headers = values[0].map(function (h) {
    return String(h).trim();
  });
  var out = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;
      var cell = row[c];
      if (cell instanceof Date) {
        obj[key] = cell.toISOString();
      } else if (cell == null || cell === "") {
        obj[key] = "";
      } else {
        obj[key] = cell;
      }
    }
    var em = String(obj[SCHEDULE_EMAIL_HEADER] || "").trim();
    if (!em) continue;
    if (filterEmailLower) {
      if (em.toLowerCase() !== filterEmailLower) continue;
    }
    out.push(obj);
  }
  return out;
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * In your existing doGet(e), add branches before or after your roster logic, e.g.:
 *
 *   var action = (e.parameter.action || "").toLowerCase();
 *   if (action === "schedule-list") {
 *     var rows = lessonScheduleRowsToObjects_(null);
 *     if (rows && rows.error) return jsonOutput_(rows);
 *     return jsonOutput_(rows);
 *   }
 *   if (action === "schedule") {
 *     var email = (e.parameter.email || "").trim();
 *     if (!email) return jsonOutput_({ error: "Missing email parameter" });
 *     var rows2 = lessonScheduleRowsToObjects_(email.toLowerCase());
 *     if (rows2 && rows2.error) return jsonOutput_(rows2);
 *     return jsonOutput_(rows2);
 *   }
 */
