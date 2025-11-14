// api/logAssignment.js
import { google } from 'googleapis';

// Dedupe settings: 30 minutes (adjust if you want)
const DEDUPE_TTL_MS = 30 * 60 * 1000;
const recent = new Map(); // participantID -> { ts, condition }

/** Normalize private key if env var contains literal "\n" sequences */
function normalizePrivateKey(key) {
  if (!key) return key;
  return key.includes('\\n') ? key.replace(/\\n/g, '\n') : key;
}

async function appendRow(authClient, sheetId, rowArray) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'assignments!A1',           // expects a sheet/tab named "assignments"
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [rowArray]
    }
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    // Parse body (Vercel gives parsed body if content-type application/json)
    const data = req.body || {};
    const pid = String(data.participantID || '').trim();
    const cond = String(data.condition || '').trim();
    const clientId = String(data.clientId || data.clientID || '').trim();
    const ref = String(data.referrer || '').trim();
    const ua = String(data.userAgent || '').trim();
    const extra = data.extra || {};

    if (!pid) {
      return res.status(400).json({ status: 'error', message: 'missing participantID' });
    }

    // Dedupe (in-memory)
    const now = Date.now();
    // occasional cleanup to avoid memory growth
    if (Math.random() < 0.05) {
      const cutoff = now - DEDUPE_TTL_MS;
      for (const [k, v] of recent.entries()) {
        if (v.ts < cutoff) recent.delete(k);
      }
    }
    const existing = recent.get(pid);
    if (existing && (now - existing.ts) < DEDUPE_TTL_MS && existing.condition === cond) {
      console.log(`DUPLICATE_IGNORED: participant=${pid} condition=${cond}`);
      return res.status(200).json({ status: 'duplicate', participantID: pid, condition: cond });
    }
    // record/update
    recent.set(pid, { ts: now, condition: cond });

    // Read service account JSON from env (stringified JSON)
    const serviceKeyRaw = process.env.GOOGLE_SERVICE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID || process.env.SHEET_ID || process.env.GOOGLE_SHEET_ID;

    if (!serviceKeyRaw || !sheetId) {
      console.error('ENV_MISSING', { haveKey: !!serviceKeyRaw, haveSheet: !!sheetId });
      return res.status(500).json({ status: 'error', message: 'missing env vars' });
    }

    // Parse credentials
    let creds;
    try {
      // allow either already-JSON object or JSON string
      creds = typeof serviceKeyRaw === 'string' ? JSON.parse(serviceKeyRaw) : serviceKeyRaw;
    } catch (e) {
      console.error('SERVICE_KEY_PARSE_ERROR', e);
      return res.status(500).json({ status: 'error', message: 'invalid service key JSON' });
    }

    // Normalize private key
    if (creds.private_key) creds.private_key = normalizePrivateKey(creds.private_key);

    // Use JWT client
    const jwtClient = new google.auth.JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    await jwtClient.authorize();

    // Build row to append
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      pid,
      clientId || '',
      cond || '',
      ua || '',
      ref || '',
      JSON.stringify(extra || {})
    ];

    // Append to sheet (tab: assignments)
    await appendRow(jwtClient, sheetId, row);

    console.log('LOG_ENTRY:', JSON.stringify({ timestamp, participantID: pid, clientId, condition: cond }));
    return res.status(200).json({ status: 'ok' });

  } catch (err) {
    console.error('LOG_ERROR', err && err.stack ? err.stack : String(err));
    return res.status(500).json({ status: 'error', message: String(err) });
  }
}
