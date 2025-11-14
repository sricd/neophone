// netlify/functions/logAssignment.js
const { google } = require('googleapis');

// Dedupe settings: 30 minutes default
const DEDUPE_TTL_MS = 30 * 60 * 1000;
const recent = new Map(); // participantID -> { ts, condition }

// Helper to normalize private key newlines (Netlify env can contain literal \n)
function normalizePrivateKey(key) {
  if (!key) return key;
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
}

async function appendRowToSheet(authClient, sheetId, rowArray) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  // Append row at the bottom, userEntered to allow timestamps formatting if needed
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'assignments!A1', // sheet name "assignments" - will append to sheet
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [rowArray]
    }
  });
}

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // parse payload
    let payload = {};
    try {
      payload = event.body ? JSON.parse(event.body) : {};
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'invalid json' }) };
    }

    const pid = String(payload.participantID || '').trim();
    const cond = String(payload.condition || '').trim();
    const clientId = String(payload.clientId || '').trim();
    const ref = String(payload.referrer || '').trim();
    const ua = String(payload.userAgent || '').trim();
    const extra = payload.extra || {};

    if (!pid) {
      return { statusCode: 400, body: JSON.stringify({ status: 'error', message: 'missing participantID' }) };
    }

    // Dedupe check (in-memory, short-lived)
    const now = Date.now();
    // occasional cleanup
    if (Math.random() < 0.05) {
      const cutoff = now - DEDUPE_TTL_MS;
      for (const [k, v] of recent.entries()) {
        if (v.ts < cutoff) recent.delete(k);
      }
    }
    const existing = recent.get(pid);
    if (existing && (now - existing.ts) < DEDUPE_TTL_MS && existing.condition === cond) {
      console.log(`DUPLICATE_IGNORED: ${pid} cond=${cond}`);
      return { statusCode: 200, body: JSON.stringify({ status: 'duplicate', participantID: pid, condition: cond }) };
    }
    // record / update
    recent.set(pid, { ts: now, condition: cond });

    // Prepare authentication using service account
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !rawPrivateKey || !sheetId) {
      console.log('ENV_MISSING', { clientEmail: !!clientEmail, privateKey: !!rawPrivateKey, sheetId: !!sheetId });
      return { statusCode: 500, body: JSON.stringify({ status: 'error', message: 'missing env vars' }) };
    }

    const privateKey = normalizePrivateKey(rawPrivateKey);

    const jwtClient = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    await jwtClient.authorize();

    // Build the row
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      pid,
      clientId,
      cond,
      ua,
      ref,
      JSON.stringify(extra || {})
    ];

    // Append to the sheet (sheet name 'assignments' expected)
    await appendRowToSheet(jwtClient, sheetId, row);

    console.log('LOG_ENTRY:', JSON.stringify({ timestamp, participantID: pid, clientId, condition: cond }));

    return { statusCode: 200, body: JSON.stringify({ status: 'ok' }) };

  } catch (err) {
    console.error('LOG_ERROR', err && err.stack ? err.stack : String(err));
    return { statusCode: 500, body: JSON.stringify({ status: 'error', message: String(err) }) };
  }
};
