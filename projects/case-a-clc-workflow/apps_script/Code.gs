/**
 * AutoPlanner — Google Apps Script Web App (Google Docs + Document tabs)
 *
 * SETUP (required once):
 *   1. In the Apps Script editor: Services (+) → add “Google Docs API”.
 *   2. If you use clasp / copied appsscript.json, ensure `enabledAdvancedServices`
 *      includes Docs API v1 (this repo ships `appsscript.json` for that).
 *   3. Deploy as Web app (Execute as: Me, Anyone).
 *
 * Week tabs are created with Docs API `addDocumentTab` (appended under CLC Planner so
 * calendar weeks appear **earliest at the top**, latest at the bottom). Tab bodies use
 * **only** Docs API `batchUpdate` (DocumentApp cannot reliably resolve nested tabs by ID).
 *
 * POST JSON: `weeks`, `total_assignments`, `generated_at`, optional `studentFullName`
 * (Canvas display name; falls back to "Student"), optional `documentId` (reuse file).
 * Legacy key `spreadsheetId` is still accepted as an alias.
 *
 * Response: { docUrl, documentId }
 */

var PARENT_TAB_TITLE = 'CLC Planner';

/** Drive title: First Last - CLC Assignments */
function buildDocumentTitle(data) {
  var raw = String(
    (data.studentFullName || data.student_full_name || '').trim() || 'Student'
  );
  var title = raw + ' - CLC Assignments';
  if (title.length > 255) {
    title = title.substring(0, 252) + '\u2026';
  }
  return title;
}
var DATA_FG = '#212121';
var LINK_FG = '#1a73e8';

// Pastels; uniqueness within a week is enforced in buildCourseColorMap (not hash-only).
var COURSE_COLORS = [
  '#D9EAD3',
  '#CFE2F3',
  '#FCE5CD',
  '#EAD1DC',
  '#D9D2E9',
  '#FFF2CC',
  '#D0E4F7',
  '#F4CCCC',
  '#B6D7A8',
  '#EA9999',
  '#FFD966',
  '#C9DAF8',
  '#E6B8AF',
  '#D5A6BD',
  '#FFE599',
  '#B4A7D6',
  '#C6E0B4',
  '#F9CB9C',
  '#A4C2F4',
  '#EAEDED',
  '#D7CCC8',
  '#FFCCBC',
  '#C5E1A5',
  '#CE93D8',
  '#80DEEA',
  '#FFF59D',
  '#FFAB91',
  '#A5D6A7',
  '#B39DDB',
  '#90CAF9',
  '#FFCDD2',
];

var PRIORITY_COLORS = {
  Today: '#FF9999',
  Tomorrow: '#FFB347',
  'Due Soon': '#FFD966',
  'This Week': '#93C47D',
  Upcoming: '#A4C2F4',
};

var HEADER_BG = '#434343';
var HEADER_FG = '#FFFFFF';
var DAY_ROW_BG = '#B7B7B7';

var TABLE_HEADERS = ['Day', 'Assignment', 'Course', 'Due Time', 'Priority'];
var COL_WIDTHS = [55, 175, 100, 65, 73];

var BATCH_CHUNK = 45;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result = upsertPlannerDocument(data);
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: String(err) })).setMimeType(
      ContentService.MimeType.JSON
    );
  }
}

/**
 * @param {Object} data
 * @returns {{ docUrl: string, documentId: string }}
 */
function upsertPlannerDocument(data) {
  var docId = data.documentId || data.spreadsheetId;
  var isNew = !docId;
  var desiredTitle = buildDocumentTitle(data);
  var doc;

  if (docId) {
    doc = DocumentApp.openById(docId);
    try {
      doc.setName(desiredTitle);
    } catch (renameErr) {
      /* ignore — e.g. insufficient permission on shared drives */
    }
  } else {
    doc = DocumentApp.create(desiredTitle);
    docId = doc.getId();
  }

  var parentTabId = prepareParentTab(docId, isNew);
  seedParentTabHomeDocsApi(docId, parentTabId);

  var weeks = data.weeks || {};
  var weekKeys = Object.keys(weeks).sort();

  if (weekKeys.length === 0) {
    return { docUrl: doc.getUrl(), documentId: docId };
  }

  weekKeys.forEach(function (weekKey) {
    var weekData = weeks[weekKey];
    var tabTitle = buildWeekTabTitle(weekKey, weekData.week_label);

    var resource = Docs.Documents.get(docId, { includeTabsContent: true });
    var parentJson = findTabJsonById(resource, parentTabId);
    var existingWeekTabId =
      parentJson && findChildTabIdByTitle(parentJson, tabTitle);

    var tabId;
    if (existingWeekTabId) {
      tabId = existingWeekTabId;
    } else {
      tabId = addWeekChildTab(
        docId,
        parentTabId,
        tabTitle,
        nextChildTabInsertIndex(parentJson)
      );
    }

    fillWeekTabDocsApi(docId, parentTabId, tabTitle, tabId, weekKey, weekData);
  });

  return { docUrl: DocumentApp.openById(docId).getUrl(), documentId: docId };
}

function buildWeekTabTitle(weekKey, weekLabel) {
  var y = String(weekKey).split('-')[0] || '';
  var label = weekLabel || weekKey;
  var t = 'Week of ' + label + ', ' + y;
  if (t.length > 95) {
    t = t.substring(0, 92) + '…';
  }
  return t;
}

function countAssignmentsInWeek(days) {
  var n = 0;
  days.forEach(function (d) {
    n += (d.assignments || []).length;
  });
  return n;
}

/** Rename default root tab on first create; otherwise locate CLC Planner or first root tab. */
function prepareParentTab(docId, isNew) {
  var resource = Docs.Documents.get(docId, { includeTabsContent: true });
  var tabs = resource.tabs || [];
  if (!tabs.length) {
    throw new Error('Document has no tabs (unexpected for this account).');
  }

  if (isNew) {
    var pid = tabs[0].tabProperties.tabId;
    Docs.Documents.batchUpdate(
      {
        requests: [
          {
            updateDocumentTabProperties: {
              tabProperties: { tabId: pid, title: PARENT_TAB_TITLE },
              fields: 'title',
            },
          },
        ],
      },
      docId
    );
    return pid;
  }

  var named = findRootTabIdByTitle(resource, PARENT_TAB_TITLE);
  if (named) return named;

  if (tabs.length === 1 && tabs[0].tabProperties) {
    var onlyId = tabs[0].tabProperties.tabId;
    Docs.Documents.batchUpdate(
      {
        requests: [
          {
            updateDocumentTabProperties: {
              tabProperties: { tabId: onlyId, title: PARENT_TAB_TITLE },
              fields: 'title',
            },
          },
        ],
      },
      docId
    );
    return onlyId;
  }

  if (!tabs[0].tabProperties) {
    throw new Error('Could not read root tab metadata.');
  }
  return tabs[0].tabProperties.tabId;
}

function findRootTabIdByTitle(docJson, title) {
  var tabs = docJson.tabs || [];
  for (var i = 0; i < tabs.length; i++) {
    var tp = tabs[i].tabProperties || {};
    if (tp.title === title) return tp.tabId;
  }
  return null;
}

function findTabJsonById(docJson, tabId) {
  function walk(tab) {
    if (!tab || !tab.tabProperties) return null;
    if (tab.tabProperties.tabId === tabId) return tab;
    var kids = tab.childTabs || [];
    for (var i = 0; i < kids.length; i++) {
      var f = walk(kids[i]);
      if (f) return f;
    }
    return null;
  }
  var roots = docJson.tabs || [];
  for (var j = 0; j < roots.length; j++) {
    var found = walk(roots[j]);
    if (found) return found;
  }
  return null;
}

function findChildTabIdByTitle(parentTabJson, title) {
  var kids = parentTabJson.childTabs || [];
  for (var i = 0; i < kids.length; i++) {
    var tp = kids[i].tabProperties || {};
    if (tp.title === title) return tp.tabId;
  }
  return null;
}

/** Next sibling index under the parent tab (append = chronological order top → bottom). */
function nextChildTabInsertIndex(parentTabJson) {
  return (parentTabJson && parentTabJson.childTabs
    ? parentTabJson.childTabs.length
    : 0);
}

function addWeekChildTab(docId, parentTabId, title, insertIndex) {
  var idx =
    typeof insertIndex === 'number' && insertIndex >= 0 ? insertIndex : 0;
  var resp = Docs.Documents.batchUpdate(
    {
      requests: [
        {
          addDocumentTab: {
            tabProperties: {
              title: title,
              parentTabId: parentTabId,
              index: idx,
            },
          },
        },
      ],
    },
    docId
  );

  var reply = resp.replies && resp.replies[0];
  var inner = reply && reply.addDocumentTab;
  if (!inner || !inner.tabProperties || !inner.tabProperties.tabId) {
    throw new Error(
      'addDocumentTab failed — check Docs API service is enabled. Raw: ' +
        JSON.stringify(resp).substring(0, 400)
    );
  }
  return inner.tabProperties.tabId;
}

// --- Docs API helpers (tabs / colors / tables) ---------------------------------

function hexToRgbColor(hex) {
  var h = String(hex || '').replace(/^#/, '');
  if (h.length !== 6) {
    return { red: 0, green: 0, blue: 0 };
  }
  return {
    red: parseInt(h.substring(0, 2), 16) / 255,
    green: parseInt(h.substring(2, 4), 16) / 255,
    blue: parseInt(h.substring(4, 6), 16) / 255,
  };
}

/** Docs API OptionalColor: `{ color: { rgbColor: RgbColor } }` — not bare `rgbColor`. */
function optionalColorFromHex(hex) {
  return {
    color: {
      rgbColor: hexToRgbColor(hex),
    },
  };
}

function batchUpdateChunked(docId, requests) {
  if (!requests || !requests.length) return;
  for (var i = 0; i < requests.length; i += BATCH_CHUNK) {
    Docs.Documents.batchUpdate(
      { requests: requests.slice(i, i + BATCH_CHUNK) },
      docId
    );
  }
}

function paragraphIsEffectivelyEmpty(paragraph) {
  var text = '';
  (paragraph.elements || []).forEach(function (el) {
    if (el.textRun && el.textRun.content) text += el.textRun.content;
  });
  return text.replace(/\s/g, '').length === 0;
}

function tabBodyPlainText(body) {
  var t = '';
  (body.content || []).forEach(function (el) {
    if (el.paragraph) {
      (el.paragraph.elements || []).forEach(function (pe) {
        if (pe.textRun && pe.textRun.content) t += pe.textRun.content;
      });
    }
  });
  return t;
}

function isFiniteNumber(n) {
  return typeof n === 'number' && !isNaN(n) && isFinite(n);
}

/** Structural indices sometimes deserialize as strings from the advanced service. */
function toDocIndex(v) {
  if (typeof v === 'number' && isFinite(v)) return Math.floor(v);
  if (typeof v === 'string' && /^-?\d+$/.test(String(v).trim())) {
    return parseInt(v, 10);
  }
  return NaN;
}

/** Bounds from paragraph.TextRuns when the StructuralElement omits start/end (nested tabs). */
function spanFromParagraphElements(paragraph) {
  var minS = null;
  var maxE = null;
  (paragraph.elements || []).forEach(function (pe) {
    var ps = toDocIndex(pe.startIndex);
    var pe_ = toDocIndex(pe.endIndex);
    if (!isFiniteNumber(ps) || !isFiniteNumber(pe_)) return;
    if (minS === null || ps < minS) minS = ps;
    if (maxE === null || pe_ > maxE) maxE = pe_;
  });
  if (minS === null || maxE === null || maxE <= minS) return null;
  return { start: minS, end: maxE };
}

function structuralContentBounds(el) {
  var s = toDocIndex(el.startIndex);
  var e = toDocIndex(el.endIndex);
  if (isFiniteNumber(s) && isFiniteNumber(e) && e > s) {
    return { start: s, end: e };
  }
  if (el.paragraph) {
    var sp = spanFromParagraphElements(el.paragraph);
    if (sp) return sp;
  }
  return null;
}

/**
 * Find one valid deleteContentRange for tab body (walk backward).
 * Skips paragraphs that only contain whitespace/newline — those cannot be removed without
 * violating segment newline rules, so earlier blocks are deleted first.
 */
function pickNextTabBodyDeletionRequest(content, tabId) {
  if (!content || !content.length) return null;
  var i = content.length - 1;
  while (i >= 0) {
    var el = content[i];
    var bounds = structuralContentBounds(el);
    if (!bounds) {
      i--;
      continue;
    }
    var s = bounds.start;
    var e = bounds.end;

    if (el.paragraph && paragraphIsEffectivelyEmpty(el.paragraph)) {
      i--;
      continue;
    }

    if (el.paragraph) {
      var exclusiveEnd = e - 1;
      if (exclusiveEnd <= s) {
        i--;
        continue;
      }
      return {
        deleteContentRange: {
          range: {
            segmentId: '',
            tabId: tabId,
            startIndex: s,
            endIndex: exclusiveEnd,
          },
        },
      };
    }

    var ws = toDocIndex(el.startIndex);
    var we = toDocIndex(el.endIndex);
    if (!isFiniteNumber(ws) || !isFiniteNumber(we) || we <= ws) {
      i--;
      continue;
    }
    return {
      deleteContentRange: {
        range: {
          segmentId: '',
          tabId: tabId,
          startIndex: ws,
          endIndex: we,
        },
      },
    };
  }
  return null;
}

function tabBodyStillNeedsClearing(body) {
  var content = body.content || [];
  for (var j = 0; j < content.length; j++) {
    var el = content[j];
    if (!el.paragraph) return true;
    if (!paragraphIsEffectivelyEmpty(el.paragraph)) return true;
  }
  return false;
}

/**
 * Remove tab body content without deleting the mandatory trailing newline of the segment.
 * Full paragraph deletes [startIndex, endIndex) hit "cannot include the newline at end of segment".
 * @returns {boolean} false if the tab still has content but no safe delete range (caller should deleteTab + recreate).
 */
function clearTabBodyDocsApi(docId, tabId) {
  var iterations = 0;
  while (iterations++ < 80) {
    var doc = Docs.Documents.get(docId, { includeTabsContent: true });
    var tab = findTabJsonById(doc, tabId);
    if (!tab || !tab.documentTab || !tab.documentTab.body) return true;
    var content = tab.documentTab.body.content || [];

    if (content.length === 0) return true;
    if (
      content.length === 1 &&
      content[0].paragraph &&
      paragraphIsEffectivelyEmpty(content[0].paragraph)
    ) {
      return true;
    }

    var req = pickNextTabBodyDeletionRequest(content, tabId);
    if (!req) {
      if (!tabBodyStillNeedsClearing(tab.documentTab.body)) return true;
      return false;
    }

    Docs.Documents.batchUpdate({ requests: [req] }, docId);
  }
  throw new Error('Timed out clearing tab body — try again.');
}

/** One-time helper text on the parent tab (Docs API only). */
function seedParentTabHomeDocsApi(docId, parentTabId) {
  var doc = Docs.Documents.get(docId, { includeTabsContent: true });
  var tab = findTabJsonById(doc, parentTabId);
  if (!tab || !tab.documentTab || !tab.documentTab.body) return;
  if (tabBodyPlainText(tab.documentTab.body).replace(/\s/g, '').length > 0) return;

  Docs.Documents.batchUpdate(
    {
      requests: [
        {
          insertText: {
            text: PARENT_TAB_TITLE + '\n',
            endOfSegmentLocation: { tabId: parentTabId },
          },
        },
        {
          insertText: {
            text:
              'Open nested tabs under this document tab for each week (Document tabs sidebar). ' +
              'Re-running AutoPlanner refreshes an existing week tab or adds a new one.\n',
            endOfSegmentLocation: { tabId: parentTabId },
          },
        },
        {
          insertText: {
            text: '\n',
            endOfSegmentLocation: { tabId: parentTabId },
          },
        },
      ],
    },
    docId
  );

  doc = Docs.Documents.get(docId, { includeTabsContent: true });
  tab = findTabJsonById(doc, parentTabId);
  var bodyContent = tab.documentTab.body.content || [];
  var p0 = bodyContent[0];
  var h1bounds = p0 && p0.paragraph ? structuralContentBounds(p0) : null;
  if (h1bounds) {
    Docs.Documents.batchUpdate(
      {
        requests: [
          {
            updateParagraphStyle: {
              range: {
                segmentId: '',
                tabId: parentTabId,
                startIndex: h1bounds.start,
                endIndex: h1bounds.end,
              },
              paragraphStyle: { namedStyleType: 'HEADING_1' },
              fields: 'namedStyleType',
            },
          },
        ],
      },
      docId
    );
  }
}

function findLastTableStructInTab(docJson, tabId) {
  var tab = findTabJsonById(docJson, tabId);
  if (!tab || !tab.documentTab || !tab.documentTab.body) return null;
  var content = tab.documentTab.body.content || [];
  for (var i = content.length - 1; i >= 0; i--) {
    if (content[i].table) {
      var si = toDocIndex(content[i].startIndex);
      if (!isFiniteNumber(si)) return null;
      return { startIndex: si, table: content[i].table };
    }
  }
  return null;
}

function cellParagraphInsertIndex(cell) {
  var content = cell.content || [];
  for (var i = 0; i < content.length; i++) {
    if (content[i].paragraph) {
      var s = toDocIndex(content[i].startIndex);
      if (isFiniteNumber(s)) return s;
      var inner = spanFromParagraphElements(content[i].paragraph);
      if (inner) return inner.start;
    }
  }
  throw new Error('Table cell has no paragraph (unexpected).');
}

function countPlannerTableRows(days) {
  var rows = 1;
  (days || []).forEach(function (dayObj) {
    var assignments = dayObj.assignments || [];
    if (!assignments.length) return;
    rows += 1 + assignments.length;
  });
  return rows;
}

function getCellTextRange(cell) {
  var minS = null;
  var maxE = null;
  (cell.content || []).forEach(function (se) {
    if (!se.paragraph) return;
    (se.paragraph.elements || []).forEach(function (pe) {
      if (!pe.textRun || pe.endIndex === undefined) return;
      if (minS === null || pe.startIndex < minS) minS = pe.startIndex;
      if (maxE === null || pe.endIndex > maxE) maxE = pe.endIndex;
    });
  });
  if (minS === null) return null;
  return { startIndex: minS, endIndex: maxE };
}

function fillWeekTabDocsApi(docId, parentTabId, tabTitle, tabId, weekKey, weekData) {
  var cleared = clearTabBodyDocsApi(docId, tabId);
  if (!cleared) {
    Docs.Documents.batchUpdate(
      {
        requests: [{ deleteTab: { tabId: tabId } }],
      },
      docId
    );
    var docAfterDel = Docs.Documents.get(docId, { includeTabsContent: true });
    var pjAfterDel = findTabJsonById(docAfterDel, parentTabId);
    tabId = addWeekChildTab(
      docId,
      parentTabId,
      tabTitle,
      nextChildTabInsertIndex(pjAfterDel)
    );
  }

  var days = weekData.days || [];
  var weekHeading = 'Week of ' + (weekData.week_label || weekKey);
  var subtitle =
    'Assignments in this week: ' + countAssignmentsInWeek(days);

  Docs.Documents.batchUpdate(
    {
      requests: [
        {
          insertText: {
            text: weekHeading + '\n',
            endOfSegmentLocation: { tabId: tabId },
          },
        },
        {
          insertText: {
            text: subtitle + '\n',
            endOfSegmentLocation: { tabId: tabId },
          },
        },
        {
          insertText: {
            text: '\n',
            endOfSegmentLocation: { tabId: tabId },
          },
        },
      ],
    },
    docId
  );

  var doc = Docs.Documents.get(docId, { includeTabsContent: true });
  var tab = findTabJsonById(doc, tabId);
  var paras = tab.documentTab.body.content || [];
  var pTitle = paras[0];
  var pSub = paras[1];
  var styleReqs = [];
  var titleBounds = pTitle && pTitle.paragraph ? structuralContentBounds(pTitle) : null;
  var subBounds = pSub && pSub.paragraph ? structuralContentBounds(pSub) : null;
  if (titleBounds) {
    styleReqs.push({
      updateParagraphStyle: {
        range: {
          segmentId: '',
          tabId: tabId,
          startIndex: titleBounds.start,
          endIndex: titleBounds.end,
        },
        paragraphStyle: { namedStyleType: 'HEADING_2' },
        fields: 'namedStyleType',
      },
    });
  }
  if (subBounds) {
    styleReqs.push({
      updateTextStyle: {
        range: {
          segmentId: '',
          tabId: tabId,
          startIndex: subBounds.start,
          endIndex: subBounds.end,
        },
        textStyle: { italic: true, foregroundColor: optionalColorFromHex(DATA_FG) },
        fields: 'italic,foregroundColor',
      },
    });
  }
  if (styleReqs.length) {
    Docs.Documents.batchUpdate({ requests: styleReqs }, docId);
  }

  var numRows = countPlannerTableRows(days);
  if (numRows <= 1) {
    return;
  }

  Docs.Documents.batchUpdate(
    {
      requests: [
        {
          insertTable: {
            rows: numRows,
            columns: TABLE_HEADERS.length,
            endOfSegmentLocation: { tabId: tabId },
          },
        },
      ],
    },
    docId
  );

  doc = Docs.Documents.get(docId, { includeTabsContent: true });
  var tblWrap = findLastTableStructInTab(doc, tabId);
  if (!tblWrap || !tblWrap.table || !tblWrap.table.tableRows) {
    throw new Error('insertTable failed — table not found after insert.');
  }
  var tableJson = tblWrap.table;
  var tableStartIndex = tblWrap.startIndex;
  var tabIdForLoc = tabId;

  var inserts = [];
  var r = 0;

  TABLE_HEADERS.forEach(function (h, c) {
    var cell = tableJson.tableRows[r].tableCells[c];
    inserts.push({ idx: cellParagraphInsertIndex(cell), text: String(h) });
  });
  r++;

  days.forEach(function (dayObj) {
    var assignments = dayObj.assignments || [];
    if (!assignments.length) return;

    TABLE_HEADERS.forEach(function (_, c) {
      var cell = tableJson.tableRows[r].tableCells[c];
      var txt = c === 0 ? dayObj.day || '' : '';
      inserts.push({ idx: cellParagraphInsertIndex(cell), text: txt });
    });
    r++;

    assignments.forEach(function (a) {
      TABLE_HEADERS.forEach(function (_, c) {
        var cell = tableJson.tableRows[r].tableCells[c];
        var txt = '';
        if (c === 1) txt = a.assignment || '';
        else if (c === 2) txt = a.course || '';
        else if (c === 3) txt = a.due_time || '';
        else if (c === 4) txt = a.priority || '';
        inserts.push({ idx: cellParagraphInsertIndex(cell), text: txt });
      });
      r++;
    });
  });

  inserts.sort(function (a, b) {
    return b.idx - a.idx;
  });

  var insertReqs = inserts
    .filter(function (it) {
      return String(it.text || '').length > 0;
    })
    .map(function (it) {
      return {
        insertText: {
          text: String(it.text),
          location: { tabId: tabIdForLoc, index: it.idx },
        },
      };
    });
  batchUpdateChunked(docId, insertReqs);

  doc = Docs.Documents.get(docId, { includeTabsContent: true });
  tblWrap = findLastTableStructInTab(doc, tabId);
  tableJson = tblWrap.table;

  var courseColorMap = buildCourseColorMap(days);
  var decorReqs = [];

  decorReqs.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
          rowIndex: 0,
          columnIndex: 0,
        },
        rowSpan: 1,
        columnSpan: TABLE_HEADERS.length,
      },
      tableCellStyle: { backgroundColor: optionalColorFromHex(HEADER_BG) },
      fields: 'backgroundColor',
    },
  });

  for (var c = 0; c < TABLE_HEADERS.length; c++) {
    var hCell = tableJson.tableRows[0].tableCells[c];
    var hr = getCellTextRange(hCell);
    if (hr && hr.endIndex > hr.startIndex) {
      decorReqs.push({
        updateTextStyle: {
          range: {
            tabId: tabIdForLoc,
            startIndex: hr.startIndex,
            endIndex: hr.endIndex,
          },
          textStyle: {
            bold: true,
            foregroundColor: optionalColorFromHex(HEADER_FG),
          },
          fields: 'bold,foregroundColor',
        },
      });
    }
  }

  var rowPtr = 1;
  days.forEach(function (dayObj) {
    var assignments = dayObj.assignments || [];
    if (!assignments.length) return;

    decorReqs.push({
      updateTableCellStyle: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
            rowIndex: rowPtr,
            columnIndex: 0,
          },
          rowSpan: 1,
          columnSpan: TABLE_HEADERS.length,
        },
        tableCellStyle: { backgroundColor: optionalColorFromHex(DAY_ROW_BG) },
        fields: 'backgroundColor',
      },
    });

    var dayCell = tableJson.tableRows[rowPtr].tableCells[0];
    var dr = getCellTextRange(dayCell);
    if (dr && dr.endIndex > dr.startIndex) {
      decorReqs.push({
        updateTextStyle: {
          range: {
            tabId: tabIdForLoc,
            startIndex: dr.startIndex,
            endIndex: dr.endIndex,
          },
          textStyle: {
            bold: true,
            foregroundColor: optionalColorFromHex(DATA_FG),
          },
          fields: 'bold,foregroundColor',
        },
      });
    }

    rowPtr++;

    assignments.forEach(function (a) {
      var courseBg = courseColorMap[a.course] || '#FFFFFF';
      var priorityBg = PRIORITY_COLORS[a.priority] || '#EEEEEE';

      decorReqs.push({
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
              rowIndex: rowPtr,
              columnIndex: 0,
            },
            rowSpan: 1,
            columnSpan: 4,
          },
          tableCellStyle: { backgroundColor: optionalColorFromHex(courseBg) },
          fields: 'backgroundColor',
        },
      });
      decorReqs.push({
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
              rowIndex: rowPtr,
              columnIndex: 4,
            },
            rowSpan: 1,
            columnSpan: 1,
          },
          tableCellStyle: { backgroundColor: optionalColorFromHex(priorityBg) },
          fields: 'backgroundColor',
        },
      });

      var cAssign = tableJson.tableRows[rowPtr].tableCells[1];
      var cCourse = tableJson.tableRows[rowPtr].tableCells[2];
      var cTime = tableJson.tableRows[rowPtr].tableCells[3];
      var cPri = tableJson.tableRows[rowPtr].tableCells[4];

      ;[cAssign, cCourse, cTime].forEach(function (cell) {
        var rg = getCellTextRange(cell);
        if (rg && rg.endIndex > rg.startIndex) {
          var ts = {
            foregroundColor: optionalColorFromHex(DATA_FG),
          };
          var fields = 'foregroundColor';
          if (cell === cCourse) {
            ts.bold = true;
            fields = 'foregroundColor,bold';
          }
          if (cell === cAssign && a.url) {
            ts.link = { url: a.url };
            ts.foregroundColor = optionalColorFromHex(LINK_FG);
            fields = 'foregroundColor,link';
          }
          decorReqs.push({
            updateTextStyle: {
              range: {
                tabId: tabIdForLoc,
                startIndex: rg.startIndex,
                endIndex: rg.endIndex,
              },
              textStyle: ts,
              fields: fields,
            },
          });
        }
      });

      var pr = getCellTextRange(cPri);
      if (pr && pr.endIndex > pr.startIndex) {
        decorReqs.push({
          updateTextStyle: {
            range: {
              tabId: tabIdForLoc,
              startIndex: pr.startIndex,
              endIndex: pr.endIndex,
            },
            textStyle: { foregroundColor: optionalColorFromHex(DATA_FG) },
            fields: 'foregroundColor',
          },
        });
      }

      rowPtr++;
    });
  });

  batchUpdateChunked(docId, decorReqs);

  var widthReqs = [];
  for (var wi = 0; wi < COL_WIDTHS.length; wi++) {
    widthReqs.push({
      updateTableColumnProperties: {
        tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
        columnIndices: [wi],
        tableColumnProperties: {
          widthType: 'FIXED_WIDTH',
          width: { magnitude: COL_WIDTHS[wi], unit: 'PT' },
        },
        fields: 'widthType,width',
      },
    });
  }
  batchUpdateChunked(docId, widthReqs);
}

function buildCourseColorMap(days) {
  var names = collectCourseNames(days);
  names.sort(function (a, b) {
    return a.localeCompare(b);
  });

  var map = {};
  var usedIndex = {};

  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    var preferred = hashString(name) % COURSE_COLORS.length;
    var idx = preferred;
    var guard = 0;
    while (usedIndex[idx] && guard < COURSE_COLORS.length) {
      idx = (idx + 1) % COURSE_COLORS.length;
      guard++;
    }
    if (guard >= COURSE_COLORS.length) {
      idx = i % COURSE_COLORS.length;
      while (usedIndex[idx]) {
        idx = (idx + 1) % COURSE_COLORS.length;
      }
    }
    usedIndex[idx] = true;
    map[name] = COURSE_COLORS[idx];
  }
  return map;
}

function collectCourseNames(days) {
  var names = [];
  (days || []).forEach(function (dayObj) {
    (dayObj.assignments || []).forEach(function (a) {
      var c = a.course;
      if (c && names.indexOf(c) === -1) names.push(c);
    });
  });
  return names;
}

function hashString(str) {
  var hash = 0;
  var s = String(str || '');
  for (var i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}
