/**
 * AutoPlanner — Google Apps Script Web App
 *
 * HOW TO DEPLOY:
 *   1. Go to script.google.com → click "New project"
 *   2. Delete the default myFunction() and paste this entire file
 *   3. Click Deploy → New deployment
 *   4. Type: Web app
 *   5. Execute as: Me
 *   6. Who has access: Anyone
 *   7. Click Deploy → Authorize → copy the Web App URL
 *   8. Paste that URL into backend/.env as APPS_SCRIPT_URL
 *
 * This script receives a POST request from the FastAPI backend containing
 * the processed weekly assignment schedule, creates a new Google Doc with
 * a formatted table, and returns the document URL.
 *
 * Expected POST body (JSON):
 * {
 *   "weeks": {
 *     "2026-04-06": {
 *       "week_label": "Apr 6 – Apr 12",
 *       "days": [
 *         {
 *           "day": "Monday",
 *           "assignments": [
 *             {
 *               "assignment": "Hamlet Essay",
 *               "course": "AP English",
 *               "due_time": "11:59 PM",
 *               "priority": "Due Soon",
 *               "days_until_due": 2,
 *               "url": "https://..."
 *             }
 *           ]
 *         },
 *         ...7 days total...
 *       ]
 *     }
 *   },
 *   "total_assignments": 12,
 *   "generated_at": "2026-04-06T10:30:00"
 * }
 *
 * Returns JSON: { "docUrl": "https://docs.google.com/document/d/..." }
 */


// ============================================================
// COLOR CONSTANTS
// ============================================================

// 8 soft pastel background colors for course row highlighting.
// The same course name always maps to the same color (deterministic hash).
var COURSE_COLORS = [
  "#D9EAD3", // soft green
  "#CFE2F3", // soft blue
  "#FCE5CD", // soft orange
  "#EAD1DC", // soft pink
  "#D9D2E9", // soft lavender
  "#FFF2CC", // soft yellow
  "#D0E4F7", // sky blue
  "#F4CCCC", // soft red
];

// Priority badge colors (applied to the Priority column cell only)
var PRIORITY_COLORS = {
  "Today":     "#FF9999", // red
  "Tomorrow":  "#FFB347", // orange
  "Due Soon":  "#FFD966", // yellow
  "This Week": "#93C47D", // green
  "Upcoming":  "#A4C2F4", // blue
};

var HEADER_BG  = "#434343"; // dark gray header row background
var HEADER_FG  = "#FFFFFF"; // white header text
var DAY_ROW_BG = "#B7B7B7"; // medium gray for day banner rows

var TABLE_HEADERS = ["Day", "Assignment", "Course", "Due Time", "Priority"];

// Column widths in points (Google Doc portrait page ≈ 468 pts usable width)
var COL_WIDTHS = [55, 175, 100, 65, 73];


// ============================================================
// ENTRY POINT
// ============================================================

/**
 * HTTP POST entry point.
 * Apps Script routes all POST requests here.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var docUrl = createWeeklyPlannerDoc(data);
    return ContentService
      .createTextOutput(JSON.stringify({ docUrl: docUrl }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ============================================================
// DOCUMENT CREATION
// ============================================================

/**
 * Create a new Google Doc for the weekly planner and return its URL.
 *
 * @param {Object} data  The parsed POST body from the FastAPI backend.
 * @returns {string}     The URL of the newly created Google Doc.
 */
function createWeeklyPlannerDoc(data) {
  // Include the generation timestamp in the title so multiple runs
  // create distinct documents rather than silently overwriting.
  var generatedAt = data.generated_at || new Date().toISOString();
  var dateLabel = generatedAt.replace("T", " ").slice(0, 16); // "2026-04-06 10:30"
  var title = "Weekly Planner — Generated " + dateLabel;

  var doc = DocumentApp.create(title);
  var body = doc.getBody();

  // Document title
  var titlePara = body.insertParagraph(0, title);
  titlePara.setHeading(DocumentApp.ParagraphHeading.TITLE);

  // Subtitle showing total assignment count
  var subtitle = body.appendParagraph(
    "Total upcoming assignments: " + (data.total_assignments || 0)
  );
  subtitle.setHeading(DocumentApp.ParagraphHeading.SUBTITLE);

  body.appendParagraph(""); // visual spacer

  // Sort week keys chronologically (ISO date strings sort lexicographically)
  var weeks = data.weeks || {};
  var weekKeys = Object.keys(weeks).sort();

  if (weekKeys.length === 0) {
    var emptyPara = body.appendParagraph("No upcoming assignments found.");
    emptyPara.setItalic(true);
    doc.saveAndClose();
    return doc.getUrl();
  }

  // Render one section per week
  weekKeys.forEach(function(weekKey) {
    var weekData = weeks[weekKey];
    var weekLabel = weekData.week_label || weekKey;
    var days = weekData.days || [];

    // Week section heading
    var weekHeading = body.appendParagraph("Week of " + weekLabel);
    weekHeading.setHeading(DocumentApp.ParagraphHeading.HEADING1);

    var hasAnyAssignment = days.some(function(d) {
      return d.assignments && d.assignments.length > 0;
    });

    if (!hasAnyAssignment) {
      var noAssignPara = body.appendParagraph("No assignments this week.");
      noAssignPara.setItalic(true);
    } else {
      buildTable(body, days);
    }

    body.appendParagraph(""); // spacer between weeks
  });

  doc.saveAndClose();
  return doc.getUrl();
}


// ============================================================
// TABLE BUILDING
// ============================================================

/**
 * Append a formatted assignment table to `body` for one week's days.
 *
 * Table structure:
 *   Row 0:        Header row (dark background, white bold text)
 *   For each day with assignments:
 *     Row N:      Day banner (gray, bold, spans all columns visually)
 *     Rows N+1…:  One row per assignment (course color + priority color)
 *
 * @param {GoogleAppsScript.Document.Body} body
 * @param {Array} days  Array of {day, assignments[]} objects (Mon–Sun)
 */
function buildTable(body, days) {
  // Build the course→color map once for this week so colors are consistent
  var courseColorMap = buildCourseColorMap(days);

  var table = body.appendTable();

  // --- Header row ---
  var headerRow = table.appendTableRow();
  TABLE_HEADERS.forEach(function(headerText) {
    var cell = headerRow.appendTableCell(headerText);
    cell.setBackgroundColor(HEADER_BG);
    cell.getChild(0).asParagraph().editAsText()
      .setForegroundColor(HEADER_FG)
      .setBold(true);
  });

  // --- Data rows ---
  days.forEach(function(dayObj) {
    var assignments = dayObj.assignments || [];
    if (assignments.length === 0) return; // skip empty days

    // Day banner row — gray background, bold day name in first cell
    var dayRow = table.appendTableRow();
    TABLE_HEADERS.forEach(function(_, colIndex) {
      var cellText = colIndex === 0 ? dayObj.day : "";
      var cell = dayRow.appendTableCell(cellText);
      cell.setBackgroundColor(DAY_ROW_BG);
      if (colIndex === 0) {
        cell.getChild(0).asParagraph().editAsText().setBold(true);
      }
    });

    // One row per assignment
    assignments.forEach(function(a) {
      var row = table.appendTableRow();
      var courseBg = courseColorMap[a.course] || "#FFFFFF";
      var priorityBg = PRIORITY_COLORS[a.priority] || "#FFFFFF";

      var values = [
        "",                  // Day column is blank (day banner above groups them)
        a.assignment || "",
        a.course || "",
        a.due_time || "",
        a.priority || "",
      ];

      values.forEach(function(val, colIndex) {
        var cell = row.appendTableCell(val);

        // Priority column gets its own color; all others use course color
        if (colIndex === 4) {
          cell.setBackgroundColor(priorityBg);
        } else {
          cell.setBackgroundColor(courseBg);
        }

        // Make the assignment name a clickable hyperlink to Canvas
        if (colIndex === 1 && a.url) {
          var para = cell.getChild(0).asParagraph();
          para.clear();
          para.appendText(val).setLinkUrl(a.url);
        }
      });
    });
  });

  // Set column widths (in points)
  for (var r = 0; r < table.getNumRows(); r++) {
    var tRow = table.getRow(r);
    for (var c = 0; c < COL_WIDTHS.length && c < tRow.getNumCells(); c++) {
      tRow.getCell(c).setWidth(COL_WIDTHS[c]);
    }
  }
}


// ============================================================
// HELPERS
// ============================================================

/**
 * Build a course-name → hex-color mapping for all courses in this week.
 * The same course name always maps to the same color (deterministic hash),
 * so color assignments are stable across document regenerations.
 *
 * @param {Array} days
 * @returns {Object}  e.g. {"AP English": "#D9EAD3", "Calculus": "#CFE2F3"}
 */
function buildCourseColorMap(days) {
  var courseNames = [];
  days.forEach(function(dayObj) {
    (dayObj.assignments || []).forEach(function(a) {
      if (a.course && courseNames.indexOf(a.course) === -1) {
        courseNames.push(a.course);
      }
    });
  });

  var map = {};
  courseNames.forEach(function(name) {
    map[name] = COURSE_COLORS[hashString(name) % COURSE_COLORS.length];
  });
  return map;
}

/**
 * Deterministic polynomial hash of a string.
 * Returns a non-negative 31-bit integer.
 *
 * @param {string} str
 * @returns {number}
 */
function hashString(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return hash;
}
