/**
 * Adds the "Canvas Tools" menu when the spreadsheet opens.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Canvas Tools')
    .addItem('Set Canvas API Token', 'showTokenDialog')
    .addSeparator()
    .addItem('Generate Comments Template', 'showCourseSelector')
    .addToUi();

  ui.createMenu('Sundial Export')
    .addItem('Connect to Sundial', 'showSundialSetup')
    .addSeparator()
    .addItem('Export Comments to Sundial', 'showExportDialog')
    .addToUi();
}

/**
 * Opens the token setup dialog.
 */
function showTokenDialog() {
  var html = HtmlService.createHtmlOutputFromFile('TokenDialog')
    .setWidth(450)
    .setHeight(280);
  SpreadsheetApp.getUi().showModalDialog(html, 'Canvas API Setup');
}

/**
 * Saves the Canvas API token and base URL to user properties.
 */
function saveToken(token, baseUrl) {
  var props = PropertiesService.getUserProperties();
  props.setProperty('CANVAS_TOKEN', token);
  props.setProperty('CANVAS_BASE_URL', baseUrl.replace(/\/+$/, ''));
}

/**
 * Fetches courses from Canvas and opens the course selector dialog.
 */
function showCourseSelector() {
  var props = PropertiesService.getUserProperties();
  var token = props.getProperty('CANVAS_TOKEN');
  var baseUrl = props.getProperty('CANVAS_BASE_URL');

  if (!token || !baseUrl) {
    SpreadsheetApp.getUi().alert(
      'Please set your Canvas API token first.\n\nGo to: Canvas Tools → Set Canvas API Token'
    );
    return;
  }

  try {
    var courses = getCourses(baseUrl, token);
    if (courses.length === 0) {
      SpreadsheetApp.getUi().alert(
        'No active courses found.\n\nMake sure you are enrolled as a teacher in at least one Canvas course.'
      );
      return;
    }

    // Store courses temporarily for the dialog to read
    props.setProperty('TEMP_COURSES', JSON.stringify(courses));

    var html = HtmlService.createHtmlOutputFromFile('CourseSelector')
      .setWidth(500)
      .setHeight(520);
    SpreadsheetApp.getUi().showModalDialog(html, 'Generate Comments Template');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error fetching courses from Canvas:\n\n' + e.message);
  }
}

/**
 * Returns the temporarily stored courses list (called from CourseSelector dialog).
 */
function getStoredCourses() {
  var json = PropertiesService.getUserProperties().getProperty('TEMP_COURSES');
  return json ? JSON.parse(json) : [];
}

/**
 * Main function: fetches rosters and creates the Google Doc template.
 * Called from the CourseSelector dialog.
 */
function generateTemplate(selectedCourseIds, gradingPeriod) {
  var props = PropertiesService.getUserProperties();
  var token = props.getProperty('CANVAS_TOKEN');
  var baseUrl = props.getProperty('CANVAS_BASE_URL');
  var courses = JSON.parse(props.getProperty('TEMP_COURSES'));

  // Filter to only selected courses
  var selectedCourses = courses.filter(function (c) {
    return selectedCourseIds.indexOf(String(c.id)) > -1;
  });

  // Fetch roster for each selected course
  var coursesData = [];
  for (var i = 0; i < selectedCourses.length; i++) {
    var course = selectedCourses[i];
    var students = getRoster(baseUrl, token, course.id);
    coursesData.push({
      name: course.name,
      students: students
    });
  }

  // Create one Google Doc per class (tabs per student), all in a Drive folder
  var result = createAllCommentsDocs(coursesData, gradingPeriod);

  // Store the folder URL for the Sundial export dialog
  props.setProperty('LAST_COMMENTS_FOLDER', result.folderUrl);

  // Clean up temp data
  props.deleteProperty('TEMP_COURSES');

  return result;
}

/**
 * Returns the last generated comments folder URL (for export dialog).
 */
function getLastCommentsFolder() {
  return PropertiesService.getUserProperties().getProperty('LAST_COMMENTS_FOLDER') || '';
}

// ─────────────────────────────────────────────
// Sundial Export Functions
// ─────────────────────────────────────────────

/**
 * Opens the Sundial connection/setup dialog.
 */
function showSundialSetup() {
  var html = HtmlService.createHtmlOutputFromFile('SundialSetup')
    .setWidth(480)
    .setHeight(450);
  SpreadsheetApp.getUi().showModalDialog(html, 'Connect to Sundial');
}

/**
 * Opens the export dialog for pushing comments to Sundial.
 */
function showExportDialog() {
  var status = checkSundialConnection();
  if (!status.connected) {
    SpreadsheetApp.getUi().alert(
      'Not connected to Sundial.\n\n' + status.message +
      '\n\nGo to: Sundial Export → Connect to Sundial'
    );
    return;
  }

  var html = HtmlService.createHtmlOutputFromFile('ExportDialog')
    .setWidth(500)
    .setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(html, 'Export Comments to Sundial');
}

/**
 * Main export function: reads comments from Google Doc and pushes to Sundial.
 * Called from ExportDialog.html.
 *
 * TODO: Implement once Sundial API endpoints are confirmed.
 *
 * @param {string} docUrl - URL of the completed comments Google Doc
 * @returns {Object} {success: number, failed: number, errors: []}
 */
function exportCommentsToSundial(folderUrl) {
  // Step 1: Read comments from all docs in the folder
  var allSections = readCommentsFromFolder(folderUrl);

  // Step 2: For each class/section, match students to Sundial and push comments
  // TODO: Implement once Sundial API is available
  //
  // var allResults = { success: 0, failed: 0, errors: [] };
  // for (var i = 0; i < allSections.length; i++) {
  //   var section = allSections[i];
  //   var sundialSections = getSundialSections();
  //   var matched = sundialSections.find(s => s.course_name === section.courseName);
  //   if (!matched) {
  //     allResults.errors.push('Could not find Sundial section for: ' + section.courseName);
  //     continue;
  //   }
  //   var sundialRoster = getSundialRoster(matched.section_id);
  //   var matchedStudents = matchStudentsToSundial(section.students, sundialRoster);
  //   var result = pushAllCommentsForSection(matched.section_id, matchedStudents, matched.term);
  //   allResults.success += result.success;
  //   allResults.failed += result.failed;
  //   allResults.errors = allResults.errors.concat(result.errors);
  // }
  // return allResults;

  var totalStudents = allSections.reduce(function (sum, s) { return sum + s.students.length; }, 0);
  throw new Error(
    'Sundial export is not yet implemented.\n\n' +
    'Successfully read ' + allSections.length + ' class docs (' + totalStudents + ' students total).\n' +
    'Waiting for school admin to enable SKY API access.'
  );
}
