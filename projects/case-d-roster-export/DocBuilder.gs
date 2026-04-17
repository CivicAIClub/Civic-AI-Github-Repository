/**
 * Creates one Google Doc per class, with a tab for each student.
 * All docs are placed in a shared Google Drive folder.
 *
 * Structure:
 *   Drive Folder: "Comments — Fall Midterm"
 *     ├── Doc: "Hum 2 — Fall Midterm"
 *     │     ├── Tab: "Adams, John"      → blank comment area
 *     │     ├── Tab: "Baker, Sarah"     → blank comment area
 *     │     └── Tab: "Chen, Michael"    → blank comment area
 *     └── Doc: "Adv Writing — Fall Midterm"
 *           ├── Tab: "Garcia, Ana"      → blank comment area
 *           └── Tab: "Kim, David"       → blank comment area
 *
 * @param {Array} coursesData - [{name: "Course Name", students: [{name, id}]}]
 * @param {string} gradingPeriod - e.g., "Fall Midterm", "Winter Term"
 * @returns {Object} {folderUrl, docs: [{name, url, studentCount}]}
 */
function createAllCommentsDocs(coursesData, gradingPeriod) {
  var folderName = 'Comments — ' + gradingPeriod;
  var folder = DriveApp.createFolder(folderName);

  var docs = [];
  for (var i = 0; i < coursesData.length; i++) {
    var result = createClassDoc_(coursesData[i], gradingPeriod, folder);
    docs.push(result);
  }

  return {
    folderUrl: folder.getUrl(),
    docs: docs
  };
}

/**
 * Creates a single Google Doc for one class, with a tab per student.
 * Uses the advanced Google Docs API for tab creation.
 *
 * @param {Object} course - {name, students: [{name, id}]}
 * @param {string} gradingPeriod
 * @param {Folder} folder - Google Drive folder to place the doc in
 * @returns {Object} {name, url, studentCount}
 */
function createClassDoc_(course, gradingPeriod, folder) {
  var docTitle = course.name + ' — ' + gradingPeriod;

  // Create doc via advanced Docs API (gives us access to tab IDs)
  var doc = Docs.Documents.create({ title: docTitle });
  var docId = doc.documentId;

  // Move to the shared folder
  var file = DriveApp.getFileById(docId);
  file.moveTo(folder);

  if (course.students.length === 0) {
    return {
      name: course.name,
      url: 'https://docs.google.com/document/d/' + docId + '/edit',
      studentCount: 0
    };
  }

  // Try tab-based approach first, fall back to page-based if tabs aren't supported
  try {
    buildDocWithTabs_(docId, doc, course.students);
  } catch (tabError) {
    Logger.log('Tab creation not supported, falling back to pages: ' + tabError.message);
    buildDocWithPages_(docId, course, gradingPeriod);
  }

  return {
    name: course.name,
    url: 'https://docs.google.com/document/d/' + docId + '/edit',
    studentCount: course.students.length
  };
}

// ─────────────────────────────────────────────
// Primary: Tabs per student (Advanced Docs API)
// ─────────────────────────────────────────────

/**
 * Populates a doc with one tab per student using the advanced Docs API.
 * Each tab is titled with the student's name and contains a comment area.
 */
function buildDocWithTabs_(docId, doc, students) {
  var defaultTabId = doc.tabs[0].tabProperties.tabId;

  // Step 1: Rename default tab to first student, create tabs for the rest
  var tabRequests = [];

  tabRequests.push({
    updateTabProperties: {
      tabProperties: { tabId: defaultTabId, title: students[0].name },
      fields: 'title'
    }
  });

  for (var i = 1; i < students.length; i++) {
    tabRequests.push({
      createTab: {
        tab: {
          tabProperties: {
            title: students[i].name,
            index: i
          }
        }
      }
    });
  }

  Docs.Documents.batchUpdate({ requests: tabRequests }, docId);

  // Step 2: Re-read doc to get all tab IDs (new tabs have server-assigned IDs)
  var updatedDoc = Docs.Documents.get(docId);

  // Step 3: Insert content into each tab
  for (var j = 0; j < updatedDoc.tabs.length; j++) {
    var tab = updatedDoc.tabs[j];
    var tabId = tab.tabProperties.tabId;
    var studentName = tab.tabProperties.title;

    var contentRequests = [
      // Insert the text (inserted in reverse order since index stays at 1)
      {
        insertText: {
          text: '\n\nComment:\n\n\n',
          location: { index: 1, tabId: tabId }
        }
      },
      {
        insertText: {
          text: studentName,
          location: { index: 1, tabId: tabId }
        }
      },
      // Style the student name as a heading
      {
        updateTextStyle: {
          textStyle: {
            bold: true,
            fontSize: { magnitude: 16, unit: 'PT' }
          },
          range: {
            startIndex: 1,
            endIndex: 1 + studentName.length,
            tabId: tabId
          },
          fields: 'bold,fontSize'
        }
      },
      // Style "Comment:" label
      {
        updateTextStyle: {
          textStyle: {
            bold: true,
            fontSize: { magnitude: 11, unit: 'PT' },
            foregroundColor: {
              color: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } }
            }
          },
          range: {
            startIndex: 1 + studentName.length + 2,
            endIndex: 1 + studentName.length + 2 + 8,
            tabId: tabId
          },
          fields: 'bold,fontSize,foregroundColor'
        }
      }
    ];

    Docs.Documents.batchUpdate({ requests: contentRequests }, docId);
  }
}

// ─────────────────────────────────────────────
// Fallback: Page breaks per student (DocumentApp)
// ─────────────────────────────────────────────

/**
 * Fallback if the Docs API doesn't support tab creation.
 * Uses page breaks to give each student their own page within a single doc.
 */
function buildDocWithPages_(docId, course, gradingPeriod) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  body.setFontFamily('Arial');

  // Doc title
  var title = body.appendParagraph(course.name + ' — ' + gradingPeriod);
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.setFontSize(14);
  title.setBold(true);
  title.setForegroundColor('#888888');

  for (var i = 0; i < course.students.length; i++) {
    var student = course.students[i];

    // Page break between students (not before the first)
    if (i > 0) {
      body.appendPageBreak();
    } else {
      body.appendParagraph('');
    }

    // Student name heading
    var nameHeading = body.appendParagraph(student.name);
    nameHeading.setHeading(DocumentApp.ParagraphHeading.HEADING2);
    nameHeading.setFontSize(16);
    nameHeading.setBold(true);

    // Comment label
    body.appendParagraph('');
    var label = body.appendParagraph('Comment:');
    label.setBold(true);
    label.setForegroundColor('#666666');
    label.setFontSize(11);

    // Blank space for writing
    body.appendParagraph('');
    body.appendParagraph('');
    body.appendParagraph('');
  }

  doc.saveAndClose();
}
