/**
 * Google Apps Script (Web App) for Shipping Exam App
 *
 * Sheet schema:
 *  Sheet name: records
 *  Header (row 1): backendId | json | createdAt | updatedAt
 *
 * POST body (text) JSON:
 *  { action: 'list' }
 *  { action: 'create', record: {...} }
 *  { action: 'update', record: {..., __backendId: '...'} }
 */

const SHEET_NAME = 'records';

function doPost(e) {
  try {
    const body = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const req = JSON.parse(body);

    const action = req.action;
    if (!action) return jsonOut({ isOk: false, error: 'Missing action' });

    if (action === 'list') {
      return jsonOut({ isOk: true, data: listRecords_() });
    }

    if (action === 'create') {
      const rec = req.record;
      if (!rec) return jsonOut({ isOk: false, error: 'Missing record' });
      const created = createRecord_(rec);
      return jsonOut({ isOk: true, data: created });
    }

    if (action === 'update') {
      const rec = req.record;
      if (!rec) return jsonOut({ isOk: false, error: 'Missing record' });
      if (!rec.__backendId) return jsonOut({ isOk: false, error: 'Missing __backendId' });
      const updated = updateRecord_(rec);
      return jsonOut({ isOk: true, data: updated });
    }

    return jsonOut({ isOk: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ isOk: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['backendId', 'json', 'createdAt', 'updatedAt']);
  }
  return sh;
}

function listRecords_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length <= 1) return [];

  const out = [];
  for (let i = 1; i < values.length; i++) {
    const backendId = values[i][0];
    const jsonStr = values[i][1];
    if (!backendId || !jsonStr) continue;
    try {
      const rec = JSON.parse(jsonStr);
      rec.__backendId = backendId;
      out.push(rec);
    } catch (e) {
      // skip broken row
    }
  }
  return out;
}

function createRecord_(rec) {
  const sh = getSheet_();
  const backendId = Utilities.getUuid();
  const now = new Date().toISOString();

  const stored = Object.assign({}, rec);
  // ไม่ยัด __backendId ลง JSON เพื่อกันซ้ำซ้อน แต่จะส่งกลับให้ client
  delete stored.__backendId;

  sh.appendRow([backendId, JSON.stringify(stored), now, now]);

  const out = Object.assign({}, rec);
  out.__backendId = backendId;
  return out;
}

function updateRecord_(rec) {
  const sh = getSheet_();
  const backendId = rec.__backendId;
  const values = sh.getDataRange().getValues();
  const now = new Date().toISOString();

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === backendId) {
      rowIndex = i + 1; // 1-based
      break;
    }
  }
  if (rowIndex === -1) throw new Error('Record not found: ' + backendId);

  const stored = Object.assign({}, rec);
  delete stored.__backendId;

  sh.getRange(rowIndex, 2).setValue(JSON.stringify(stored));
  sh.getRange(rowIndex, 4).setValue(now);

  return rec;
}
