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

/**
 * Each week tab now contains TWO stacked tables:
 *   - "By Class": assignments grouped by course, with a Day column for context.
 *   - "By Day":   assignments grouped by day, with a Course column for context.
 * Both tables include Status (manually edited, default ⬜ Not started) and Notes.
 * Status + Notes are preserved across re-runs by Canvas assignment URL.
 */
var BY_CLASS_HEADERS = ['Assignment', 'Day', 'Due Time', 'Priority', 'Status', 'Notes'];
var BY_CLASS_WIDTHS  = [160, 50, 55, 65, 80, 100];

var BY_DAY_HEADERS   = ['Assignment', 'Course', 'Due Time', 'Priority', 'Status', 'Notes'];
var BY_DAY_WIDTHS    = [160, 95, 55, 65, 80, 100];

/* Default value for new Status cells. Teacher edits to "🟡 In progress" or "✅ Complete". */
var STATUS_DEFAULT = '⬜ Not started';

/* White background marks columns the teacher manually edits (Status, Notes). */
var EDITABLE_BG = '#FFFFFF';

var BATCH_CHUNK = 45;

/** Brief pause between chunked write RPCs to stay under per-minute write quota. */
var DOCS_CHUNK_GAP_MS = 450;

function sleepDocsChunkGap() {
  Utilities.sleep(DOCS_CHUNK_GAP_MS);
}

function docsApiIsQuotaError(err) {
  var s = String(err);
  return (
    s.indexOf('Quota exceeded') !== -1 ||
    s.indexOf('429') !== -1 ||
    s.indexOf('RESOURCE_EXHAUSTED') !== -1 ||
    s.indexOf('rateLimitExceeded') !== -1 ||
    s.indexOf('userRateLimitExceeded') !== -1
  );
}

/** Docs.Documents.get with retries when Google returns quota / rate limit errors. */
function docsGet(docId, opts) {
  var options = opts || { includeTabsContent: true };
  var lastErr;
  for (var attempt = 0; attempt < 7; attempt++) {
    try {
      return Docs.Documents.get(docId, options);
    } catch (e) {
      lastErr = e;
      if (docsApiIsQuotaError(e) && attempt < 6) {
        Utilities.sleep(2000 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

/**
 * Single batchUpdate (≤50 requests per Google Docs API limit).
 * @returns {*} API reply (e.g. for addDocumentTab replies)
 */
function docsBatchUpdate(docId, requests) {
  if (!requests || !requests.length) return null;
  if (requests.length > 50) {
    throw new Error('docsBatchUpdate: chunk > 50 requests');
  }
  var lastErr;
  for (var attempt = 0; attempt < 7; attempt++) {
    try {
      return Docs.Documents.batchUpdate({ requests: requests }, docId);
    } catch (e) {
      lastErr = e;
      if (docsApiIsQuotaError(e) && attempt < 6) {
        Utilities.sleep(2500 * (attempt + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

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

    var resource = docsGet(docId);
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
    sleepDocsChunkGap();
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
  var resource = docsGet(docId);
  var tabs = resource.tabs || [];
  if (!tabs.length) {
    throw new Error('Document has no tabs (unexpected for this account).');
  }

  if (isNew) {
    var pid = tabs[0].tabProperties.tabId;
    docsBatchUpdate(docId, [
      {
        updateDocumentTabProperties: {
          tabProperties: { tabId: pid, title: PARENT_TAB_TITLE },
          fields: 'title',
        },
      },
    ]);
    return pid;
  }

  var named = findRootTabIdByTitle(resource, PARENT_TAB_TITLE);
  if (named) return named;

  if (tabs.length === 1 && tabs[0].tabProperties) {
    var onlyId = tabs[0].tabProperties.tabId;
    docsBatchUpdate(docId, [
      {
        updateDocumentTabProperties: {
          tabProperties: { tabId: onlyId, title: PARENT_TAB_TITLE },
          fields: 'title',
        },
      },
    ]);
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
  var resp = docsBatchUpdate(docId, [
    {
      addDocumentTab: {
        tabProperties: {
          title: title,
          parentTabId: parentTabId,
          index: idx,
        },
      },
    },
  ]);

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
    if (i > 0) sleepDocsChunkGap();
    docsBatchUpdate(docId, requests.slice(i, i + BATCH_CHUNK));
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
    var doc = docsGet(docId);
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

    docsBatchUpdate(docId, [req]);
    /* Spread writes so we do not burst past per-minute Docs write quota. */
    Utilities.sleep(100);
  }
  throw new Error('Timed out clearing tab body — try again.');
}

/** One-time helper text on the parent tab (Docs API only). */
function seedParentTabHomeDocsApi(docId, parentTabId) {
  var doc = docsGet(docId);
  var tab = findTabJsonById(doc, parentTabId);
  if (!tab || !tab.documentTab || !tab.documentTab.body) return;
  if (tabBodyPlainText(tab.documentTab.body).replace(/\s/g, '').length > 0) return;

  docsBatchUpdate(docId, [
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
  ]);

  doc = docsGet(docId);
  tab = findTabJsonById(doc, parentTabId);
  var bodyContent = tab.documentTab.body.content || [];
  var p0 = bodyContent[0];
  var h1bounds = p0 && p0.paragraph ? structuralContentBounds(p0) : null;
  if (h1bounds) {
    docsBatchUpdate(docId, [
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
    ]);
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

/** Find the paragraph in a tab body whose plain text matches `text` (newline-trimmed). */
function findParagraphByText(tabJson, text) {
  if (!tabJson || !tabJson.documentTab || !tabJson.documentTab.body) return null;
  var content = tabJson.documentTab.body.content || [];
  for (var i = 0; i < content.length; i++) {
    var p = content[i].paragraph;
    if (!p) continue;
    var t = '';
    (p.elements || []).forEach(function (el) {
      if (el.textRun && el.textRun.content) t += el.textRun.content;
    });
    if (t.replace(/\n+$/, '').trim() === text) return content[i];
  }
  return null;
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

/**
 * True if the week tab already has a table or substantial body — replace the tab
 * instead of clearing paragraph-by-paragraph (avoids hundreds of Docs writes / quota).
 */
function tabBodyHasHeavyContent(tabJson) {
  if (!tabJson || !tabJson.documentTab || !tabJson.documentTab.body) return false;
  var content = tabJson.documentTab.body.content || [];
  for (var i = 0; i < content.length; i++) {
    if (content[i].table) return true;
  }
  if (content.length > 3) return true;
  var plain = tabBodyPlainText(tabJson.documentTab.body).replace(/\s/g, '');
  return plain.length > 60;
}

function fillWeekTabDocsApi(docId, parentTabId, tabTitle, tabId, weekKey, weekData) {
  var docProbe = docsGet(docId);
  var tabProbe = findTabJsonById(docProbe, tabId);
  var savedData = readExistingDataFromTab(tabProbe);

  if (tabBodyHasHeavyContent(tabProbe)) {
    docsBatchUpdate(docId, [{ deleteTab: { tabId: tabId } }]);
    var docAfterHeavy = docsGet(docId);
    var pjHeavy = findTabJsonById(docAfterHeavy, parentTabId);
    tabId = addWeekChildTab(
      docId,
      parentTabId,
      tabTitle,
      nextChildTabInsertIndex(pjHeavy)
    );
    sleepDocsChunkGap();
  } else {
    var cleared = clearTabBodyDocsApi(docId, tabId);
    if (!cleared) {
      docsBatchUpdate(docId, [{ deleteTab: { tabId: tabId } }]);
      var docAfterDel = docsGet(docId);
      var pjAfterDel = findTabJsonById(docAfterDel, parentTabId);
      tabId = addWeekChildTab(
        docId,
        parentTabId,
        tabTitle,
        nextChildTabInsertIndex(pjAfterDel)
      );
      sleepDocsChunkGap();
    }
  }

  var days = weekData.days || [];
  var weekHeading = 'Week of ' + (weekData.week_label || weekKey);
  var subtitle = 'Assignments in this week: ' + countAssignmentsInWeek(days);

  docsBatchUpdate(docId, [
    { insertText: { text: weekHeading + '\n', endOfSegmentLocation: { tabId: tabId } } },
    { insertText: { text: subtitle + '\n',    endOfSegmentLocation: { tabId: tabId } } },
    { insertText: { text: '\n',                endOfSegmentLocation: { tabId: tabId } } },
  ]);

  // Style week heading + subtitle. The tab was just cleared/created, so the first two
  // paragraphs ARE the ones we just inserted.
  var doc = docsGet(docId);
  var tab = findTabJsonById(doc, tabId);
  var paras = tab.documentTab.body.content || [];
  var pTitle = paras[0];
  var pSub = paras[1];
  var styleReqs = [];
  var titleBounds = pTitle && pTitle.paragraph ? structuralContentBounds(pTitle) : null;
  var subBounds   = pSub   && pSub.paragraph   ? structuralContentBounds(pSub)   : null;
  if (titleBounds) {
    styleReqs.push({
      updateParagraphStyle: {
        range: { segmentId: '', tabId: tabId, startIndex: titleBounds.start, endIndex: titleBounds.end },
        paragraphStyle: { namedStyleType: 'HEADING_2' },
        fields: 'namedStyleType',
      },
    });
  }
  if (subBounds) {
    styleReqs.push({
      updateTextStyle: {
        range: { segmentId: '', tabId: tabId, startIndex: subBounds.start, endIndex: subBounds.end },
        textStyle: { italic: true, foregroundColor: optionalColorFromHex(DATA_FG) },
        fields: 'italic,foregroundColor',
      },
    });
  }
  if (styleReqs.length) docsBatchUpdate(docId, styleReqs);

  if (countAssignmentsInWeek(days) === 0) return;

  var courseColorMap = buildCourseColorMap(days);

  // Two stacked tables: By Class first, then By Day.
  // Both share courseColorMap so the same course is the same color in both views.
  writeTableSection(docId, tabId, 'By Class', 'class', days, courseColorMap, savedData);
  writeTableSection(docId, tabId, 'By Day',   'day',   days, courseColorMap, savedData);
}

/**
 * Append a section heading + table to a week tab.
 *
 * @param mode 'class' (group by course, Day in col 1) or 'day' (group by day, Course in col 1).
 * @param savedData {notes: {url:text}, status: {url:text}} preserved from previous run.
 *
 * Layout invariants for both modes:
 *   col 0: Assignment (link)
 *   col 1: Day (class mode) or Course (day mode)
 *   col 2: Due Time
 *   col 3: Priority
 *   col 4: Status (white bg, editable, defaults to STATUS_DEFAULT)
 *   col 5: Notes  (white bg, editable, blank by default)
 */
function writeTableSection(docId, tabId, sectionTitle, mode, days, courseColorMap, savedData) {
  var headers = (mode === 'class') ? BY_CLASS_HEADERS : BY_DAY_HEADERS;
  var widths  = (mode === 'class') ? BY_CLASS_WIDTHS  : BY_DAY_WIDTHS;
  var groups  = (mode === 'class') ? flattenAndGroupByCourse(days) : flattenAndGroupByDay(days);

  // 1. Insert section heading paragraph.
  docsBatchUpdate(docId, [
    { insertText: { text: sectionTitle + '\n', endOfSegmentLocation: { tabId: tabId } } },
  ]);

  // 2. Style the section heading as HEADING_3. Find by text since it's now embedded mid-tab.
  var doc = docsGet(docId);
  var tab = findTabJsonById(doc, tabId);
  var headingPara = findParagraphByText(tab, sectionTitle);
  var headBounds = headingPara && headingPara.paragraph ? structuralContentBounds(headingPara) : null;
  if (headBounds) {
    docsBatchUpdate(docId, [
      {
        updateParagraphStyle: {
          range: { segmentId: '', tabId: tabId, startIndex: headBounds.start, endIndex: headBounds.end },
          paragraphStyle: { namedStyleType: 'HEADING_3' },
          fields: 'namedStyleType',
        },
      },
    ]);
  }

  // 3. Calculate row count: 1 header + per group (1 group-header + N assignments).
  var numRows = 1;
  groups.forEach(function (g) { numRows += 1 + g.assignments.length; });
  if (numRows <= 1) return;

  // 4. Insert table at end of segment.
  docsBatchUpdate(docId, [
    {
      insertTable: {
        rows: numRows,
        columns: headers.length,
        endOfSegmentLocation: { tabId: tabId },
      },
    },
  ]);

  // 5. Re-fetch to find the new table (always the LAST table now since insertTable appended).
  doc = docsGet(docId);
  var tblWrap = findLastTableStructInTab(doc, tabId);
  if (!tblWrap || !tblWrap.table || !tblWrap.table.tableRows) {
    throw new Error('insertTable failed for ' + sectionTitle);
  }
  var tableJson = tblWrap.table;
  var tableStartIndex = tblWrap.startIndex;
  var tabIdForLoc = tabId;

  // 6. Build text inserts for every cell. Header row first, then groups.
  var inserts = [];
  var r = 0;

  headers.forEach(function (h, c) {
    var cell = tableJson.tableRows[r].tableCells[c];
    inserts.push({ idx: cellParagraphInsertIndex(cell), text: String(h) });
  });
  r++;

  groups.forEach(function (group) {
    var groupLabel = (mode === 'class') ? group.course : group.day;
    headers.forEach(function (_, c) {
      var cell = tableJson.tableRows[r].tableCells[c];
      inserts.push({ idx: cellParagraphInsertIndex(cell), text: c === 0 ? groupLabel : '' });
    });
    r++;

    group.assignments.forEach(function (a) {
      headers.forEach(function (_, c) {
        var cell = tableJson.tableRows[r].tableCells[c];
        var txt = '';
        if      (c === 0) txt = a.assignment || '';
        else if (c === 1) txt = (mode === 'class') ? (a.day || '') : (a.course || '');
        else if (c === 2) txt = a.due_time || '';
        else if (c === 3) txt = a.priority || '';
        else if (c === 4) txt = (a.url && savedData.status[a.url]) ? savedData.status[a.url] : STATUS_DEFAULT;
        else if (c === 5) txt = (a.url && savedData.notes[a.url])  ? savedData.notes[a.url]  : '';
        inserts.push({ idx: cellParagraphInsertIndex(cell), text: txt });
      });
      r++;
    });
  });

  // Sort descending so earlier inserts don't shift later indices.
  inserts.sort(function (a, b) { return b.idx - a.idx; });

  var insertReqs = inserts
    .filter(function (it) { return String(it.text || '').length > 0; })
    .map(function (it) {
      return {
        insertText: {
          text: String(it.text),
          location: { tabId: tabIdForLoc, index: it.idx },
        },
      };
    });
  batchUpdateChunked(docId, insertReqs);

  // 7. Re-fetch table for styling (text inserts shift cell ranges).
  doc = docsGet(docId);
  tblWrap = findLastTableStructInTab(doc, tabId);
  tableJson = tblWrap.table;

  var decorReqs = [];

  // Header row: dark bg + white bold text across all columns.
  decorReqs.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
          rowIndex: 0, columnIndex: 0,
        },
        rowSpan: 1, columnSpan: headers.length,
      },
      tableCellStyle: { backgroundColor: optionalColorFromHex(HEADER_BG) },
      fields: 'backgroundColor',
    },
  });
  for (var c = 0; c < headers.length; c++) {
    var hCell = tableJson.tableRows[0].tableCells[c];
    var hr = getCellTextRange(hCell);
    if (hr && hr.endIndex > hr.startIndex) {
      decorReqs.push({
        updateTextStyle: {
          range: { tabId: tabIdForLoc, startIndex: hr.startIndex, endIndex: hr.endIndex },
          textStyle: { bold: true, foregroundColor: optionalColorFromHex(HEADER_FG) },
          fields: 'bold,foregroundColor',
        },
      });
    }
  }

  // Group-header rows + assignment rows.
  var rowPtr = 1;
  groups.forEach(function (group) {
    // Group-header background: course color in class mode, gray in day mode.
    var groupBgHex = (mode === 'class')
      ? (courseColorMap[group.course] || '#EAEDED')
      : DAY_ROW_BG;

    decorReqs.push({
      updateTableCellStyle: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
            rowIndex: rowPtr, columnIndex: 0,
          },
          rowSpan: 1, columnSpan: headers.length,
        },
        tableCellStyle: { backgroundColor: optionalColorFromHex(groupBgHex) },
        fields: 'backgroundColor',
      },
    });
    var groupCell = tableJson.tableRows[rowPtr].tableCells[0];
    var cr = getCellTextRange(groupCell);
    if (cr && cr.endIndex > cr.startIndex) {
      decorReqs.push({
        updateTextStyle: {
          range: { tabId: tabIdForLoc, startIndex: cr.startIndex, endIndex: cr.endIndex },
          textStyle: { bold: true, foregroundColor: optionalColorFromHex(DATA_FG) },
          fields: 'bold,foregroundColor',
        },
      });
    }
    rowPtr++;

    group.assignments.forEach(function (a) {
      // Per-row colors: course color tints first 3 cols (regardless of mode), priority color
      // tints col 3, Status + Notes get white bg to signal "edit me".
      var rowBgHex   = courseColorMap[a.course] || '#EAEDED';
      var priorityBg = PRIORITY_COLORS[a.priority] || '#EEEEEE';

      decorReqs.push({
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
              rowIndex: rowPtr, columnIndex: 0,
            },
            rowSpan: 1, columnSpan: 3,
          },
          tableCellStyle: { backgroundColor: optionalColorFromHex(rowBgHex) },
          fields: 'backgroundColor',
        },
      });
      decorReqs.push({
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
              rowIndex: rowPtr, columnIndex: 3,
            },
            rowSpan: 1, columnSpan: 1,
          },
          tableCellStyle: { backgroundColor: optionalColorFromHex(priorityBg) },
          fields: 'backgroundColor',
        },
      });
      // Status + Notes (cols 4 and 5): white background, editable.
      decorReqs.push({
        updateTableCellStyle: {
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
              rowIndex: rowPtr, columnIndex: 4,
            },
            rowSpan: 1, columnSpan: 2,
          },
          tableCellStyle: { backgroundColor: optionalColorFromHex(EDITABLE_BG) },
          fields: 'backgroundColor',
        },
      });

      var cAssign = tableJson.tableRows[rowPtr].tableCells[0];
      var cMid    = tableJson.tableRows[rowPtr].tableCells[1]; // Day (class) or Course (day)
      var cTime   = tableJson.tableRows[rowPtr].tableCells[2];
      var cPri    = tableJson.tableRows[rowPtr].tableCells[3];
      var cStatus = tableJson.tableRows[rowPtr].tableCells[4];
      var cNotes  = tableJson.tableRows[rowPtr].tableCells[5];

      // Assignment cell: link styling if URL present, else dark text.
      var rAssign = getCellTextRange(cAssign);
      if (rAssign && rAssign.endIndex > rAssign.startIndex) {
        var tsAssign = { foregroundColor: optionalColorFromHex(DATA_FG) };
        var fieldsAssign = 'foregroundColor';
        if (a.url) {
          tsAssign.link = { url: a.url };
          tsAssign.foregroundColor = optionalColorFromHex(LINK_FG);
          fieldsAssign = 'foregroundColor,link';
        }
        decorReqs.push({
          updateTextStyle: {
            range: { tabId: tabIdForLoc, startIndex: rAssign.startIndex, endIndex: rAssign.endIndex },
            textStyle: tsAssign, fields: fieldsAssign,
          },
        });
      }

      // All other cells: dark text on whatever background was set above.
      [cMid, cTime, cPri, cStatus, cNotes].forEach(function (cell) {
        var rg = getCellTextRange(cell);
        if (rg && rg.endIndex > rg.startIndex) {
          decorReqs.push({
            updateTextStyle: {
              range: { tabId: tabIdForLoc, startIndex: rg.startIndex, endIndex: rg.endIndex },
              textStyle: { foregroundColor: optionalColorFromHex(DATA_FG) },
              fields: 'foregroundColor',
            },
          });
        }
      });

      rowPtr++;
    });
  });

  batchUpdateChunked(docId, decorReqs);

  // 8. Set fixed column widths so the table doesn't expand to page width.
  var widthReqs = [];
  for (var wi = 0; wi < widths.length; wi++) {
    widthReqs.push({
      updateTableColumnProperties: {
        tableStartLocation: { tabId: tabIdForLoc, index: tableStartIndex },
        columnIndices: [wi],
        tableColumnProperties: {
          widthType: 'FIXED_WIDTH',
          width: { magnitude: widths[wi], unit: 'PT' },
        },
        fields: 'widthType,width',
      },
    });
  }
  batchUpdateChunked(docId, widthReqs);

  // 9. Trailing blank paragraph for visual breathing room before next section.
  docsBatchUpdate(docId, [
    { insertText: { text: '\n', endOfSegmentLocation: { tabId: tabId } } },
  ]);

  sleepDocsChunkGap();
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

function getCellText(cell) {
  var text = '';
  (cell.content || []).forEach(function (se) {
    if (!se.paragraph) return;
    (se.paragraph.elements || []).forEach(function (pe) {
      if (pe.textRun) text += (pe.textRun.content || '');
    });
  });
  return text.replace(/\n$/, '').trim();
}

function getCellLinkUrl(cell) {
  var url = null;
  (cell.content || []).forEach(function (se) {
    if (!se.paragraph || url) return;
    (se.paragraph.elements || []).forEach(function (pe) {
      if (!url && pe.textRun && pe.textRun.textStyle && pe.textRun.textStyle.link) {
        url = pe.textRun.textStyle.link.url || null;
      }
    });
  });
  return url;
}

/**
 * Read all editable data (Notes, Status) from EVERY table in the tab, keyed by Canvas URL.
 * Walks every table because the new layout has two (By Class + By Day) and old single-table tabs still need to be read for migration.
 *
 * Column conventions (Notes = last column, Status = second-to-last):
 *   - Old 5-col table (Notes only): notes col = 4, no status
 *   - New 6-col table (Status + Notes): status col = 4, notes col = 5
 * Tables with < 5 columns are ignored.
 */
function readExistingDataFromTab(tabJson) {
  var result = { notes: {}, status: {} };
  try {
    if (!tabJson || !tabJson.documentTab) return result;
    var content = tabJson.documentTab.body.content || [];
    content.forEach(function (el) {
      if (!el.table) return;
      var tableStruct = el.table;
      var numCols = tableStruct.columns;
      if (numCols < 5) return;
      var notesColIdx = numCols - 1;
      var statusColIdx = numCols >= 6 ? numCols - 2 : -1;
      (tableStruct.tableRows || []).forEach(function (row) {
        var cells = row.tableCells || [];
        if (cells.length < numCols) return;
        var url = getCellLinkUrl(cells[0]);
        if (!url) return; // header / group-header row — no Canvas link
        var note = getCellText(cells[notesColIdx]);
        if (note) result.notes[url] = note;
        if (statusColIdx >= 0) {
          var status = getCellText(cells[statusColIdx]);
          if (status) result.status[url] = status;
        }
      });
    });
  } catch (e) {}
  return result;
}

function flattenAndGroupByCourse(days) {
  var all = [];
  (days || []).forEach(function (dayObj) {
    (dayObj.assignments || []).forEach(function (a) { all.push(a); });
  });

  var courseOrder = [];
  var groups = {};
  all.forEach(function (a) {
    var course = a.course || '(No Course)';
    if (!groups[course]) { groups[course] = []; courseOrder.push(course); }
    groups[course].push(a);
  });

  courseOrder.forEach(function (course) {
    groups[course].sort(function (a, b) {
      var da = String(a.due_date || ''), db = String(b.due_date || '');
      if (da !== db) return da < db ? -1 : 1;
      return String(a.assignment || '').toLowerCase() < String(b.assignment || '').toLowerCase() ? -1 : 1;
    });
  });

  courseOrder.sort(function (cA, cB) {
    var minA = groups[cA][0] ? String(groups[cA][0].due_date || '') : '';
    var minB = groups[cB][0] ? String(groups[cB][0].due_date || '') : '';
    if (minA !== minB) return minA < minB ? -1 : 1;
    return cA.localeCompare(cB);
  });

  return courseOrder.map(function (course) {
    return { course: course, assignments: groups[course] };
  });
}

/**
 * Group assignments by day. Preserves the input day order (already chronological from the backend).
 * Within each day, sorts by due_time then assignment title.
 * Skips days with zero assignments to keep the table tight.
 */
function flattenAndGroupByDay(days) {
  var groups = [];
  (days || []).forEach(function (dayObj) {
    var assignments = (dayObj.assignments || []).slice();
    if (!assignments.length) return;
    assignments.sort(function (a, b) {
      var ta = String(a.due_time || ''), tb = String(b.due_time || '');
      if (ta !== tb) return ta < tb ? -1 : 1;
      return String(a.assignment || '').toLowerCase() < String(b.assignment || '').toLowerCase() ? -1 : 1;
    });
    groups.push({ day: dayObj.day || '', assignments: assignments });
  });
  return groups;
}
