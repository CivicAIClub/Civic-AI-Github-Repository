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
 * If anything in the tab path fails (unsupported API, partial batch failure),
 * the partially-built doc is trashed and a fresh doc is created for the
 * page-based fallback. This guarantees the fallback always operates on a
 * clean doc.
 *
 * @param {Object} course - {name, students: [{name, id}]}
 * @param {string} gradingPeriod
 * @param {Folder} folder - Google Drive folder to place the doc in
 * @returns {Object} {name, url, studentCount}
 */
function createClassDoc_(course, gradingPeriod, folder) {
  var docTitle = course.name + ' — ' + gradingPeriod;
  var docId = null;

  try {
    // Try the tab-based approach first
    var doc = Docs.Documents.create({ title: docTitle });
    docId = doc.documentId;
    DriveApp.getFileById(docId).moveTo(folder);

    if (course.students.length > 0) {
      buildDocWithTabs_(docId, doc, course.students);
    }

    return {
      name: course.name,
      url: docUrlFromId_(docId),
      studentCount: course.students.length
    };
  } catch (tabError) {
    Logger.log('Tab approach failed, using page-based fallback: ' + tabError.message);

    // Trash the partially-built doc so the fallback gets a clean slate
    if (docId) {
      try {
        DriveApp.getFileById(docId).setTrashed(true);
      } catch (cleanupError) {
        Logger.log('Failed to trash partial doc: ' + cleanupError.message);
      }
    }

    // Create a fresh doc using DocumentApp for the fallback
    var fallbackDoc = DocumentApp.create(docTitle);
    var fallbackId = fallbackDoc.getId();
    DriveApp.getFileById(fallbackId).moveTo(folder);

    if (course.students.length > 0) {
      buildDocWithPages_(fallbackId, course, gradingPeriod);
    }

    return {
      name: course.name,
      url: docUrlFromId_(fallbackId),
      studentCount: course.students.length
    };
  }
}

function docUrlFromId_(docId) {
  return 'https://docs.google.com/document/d/' + docId + '/edit';
}

// ─────────────────────────────────────────────
// Primary: Tabs per student (Advanced Docs API)
// ─────────────────────────────────────────────

/**
 * Populates a doc with one tab per student using the advanced Docs API.
 * Each tab is titled with the student's name and contains a comment area.
 *
 * Uses two atomic batchUpdate calls:
 *   1. Create/rename all tabs (atomic — Docs API rolls back the whole batch on any failure)
 *   2. Insert all content into all tabs (also atomic)
 *
 * If either batch fails, the caller (createClassDoc_) trashes the doc and
 * falls back to the page-based approach on a fresh doc.
 */
function buildDocWithTabs_(docId, doc, students) {
  var COMMENT_LABEL = 'Comment:';
  var defaultTabId = doc.tabs[0].tabProperties.tabId;

  // ── Step 1: Atomically create/rename all tabs ──
  var tabRequests = [
    {
      updateTabProperties: {
        tabProperties: { tabId: defaultTabId, title: students[0].name },
        fields: 'title'
      }
    }
  ];

  for (var i = 1; i < students.length; i++) {
    tabRequests.push({
      createTab: {
        tab: {
          tabProperties: { title: students[i].name, index: i }
        }
      }
    });
  }

  Docs.Documents.batchUpdate({ requests: tabRequests }, docId);

  // ── Step 2: Re-read doc with tabs content to discover server-assigned tab IDs ──
  // CRITICAL: includeTabsContent=true is required, otherwise tabs may be
  // missing or returned without their full structure.
  var updatedDoc = Docs.Documents.get(docId, { includeTabsContent: true });

  if (!updatedDoc.tabs || updatedDoc.tabs.length === 0) {
    throw new Error('Docs API returned no tabs after creation. Tab creation may not be supported on this Apps Script runtime.');
  }

  // ── Step 3: Build ONE atomic batch of all content inserts + styling ──
  // Text is inserted in reverse order (label first, then name) because each
  // insertText at index 1 pushes existing content forward.
  var contentRequests = [];

  for (var j = 0; j < updatedDoc.tabs.length; j++) {
    var tab = updatedDoc.tabs[j];
    var tabId = tab.tabProperties.tabId;
    var studentName = tab.tabProperties.title;

    // Insert label first (so it ends up after the name once name is inserted at index 1)
    contentRequests.push({
      insertText: {
        text: '\n\n' + COMMENT_LABEL + '\n\n\n',
        location: { index: 1, tabId: tabId }
      }
    });
    contentRequests.push({
      insertText: {
        text: studentName,
        location: { index: 1, tabId: tabId }
      }
    });

    // Final layout: "<studentName>\n\n<COMMENT_LABEL>\n\n\n" starting at index 1
    var nameStart = 1;
    var nameEnd = nameStart + studentName.length;
    var labelStart = nameEnd + 2; // for the "\n\n" separator
    var labelEnd = labelStart + COMMENT_LABEL.length;

    contentRequests.push({
      updateTextStyle: {
        textStyle: {
          bold: true,
          fontSize: { magnitude: 16, unit: 'PT' }
        },
        range: { startIndex: nameStart, endIndex: nameEnd, tabId: tabId },
        fields: 'bold,fontSize'
      }
    });
    contentRequests.push({
      updateTextStyle: {
        textStyle: {
          bold: true,
          fontSize: { magnitude: 11, unit: 'PT' },
          foregroundColor: {
            color: { rgbColor: { red: 0.4, green: 0.4, blue: 0.4 } }
          }
        },
        range: { startIndex: labelStart, endIndex: labelEnd, tabId: tabId },
        fields: 'bold,fontSize,foregroundColor'
      }
    });
  }

  if (contentRequests.length > 0) {
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
