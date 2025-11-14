// netlify/functions/logAssignment.js
const ttlMs = 30 * 60 * 1000; // 30 minutes dedupe window
// simple in-memory map: participantID -> { ts, condition }
const recent = new Map();

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const data = JSON.parse(event.body || '{}');
    const pid = (data.participantID || '').toString();
    const cond = (data.condition || '').toString();

    const now = Date.now();

    // Basic validation
    if (!pid) {
      console.log('LOG_ERROR: missing participantID');
      return { statusCode: 400, body: JSON.stringify({ status:'error', message:'missing participantID' }) };
    }

    // Cleanup expired keys occasionally to avoid memory growth
    if (Math.random() < 0.05) { // ~5% chance per invocation
      const cutoff = now - ttlMs;
      for (const [k, v] of recent.entries()) {
        if (v.ts < cutoff) recent.delete(k);
      }
    }

    // Check for duplicate within ttl
    const existing = recent.get(pid);
    if (existing && (now - existing.ts) < ttlMs) {
      // If same condition - treat as duplicate and skip; if different condition, we may log (rare)
      if (existing.condition === cond) {
        console.log(`DUPLICATE_IGNORED: participant=${pid} condition=${cond}`);
        return { statusCode: 200, body: JSON.stringify({ status:'duplicate', participantID: pid, condition: cond }) };
      } else {
        // Participant returned but got a different condition — update record and continue logging
        recent.set(pid, { ts: now, condition: cond });
      }
    } else {
      // record new participant or expired older record
      recent.set(pid, { ts: now, condition: cond });
    }

    // Log the row to Netlify logs (console)
    const row = {
      timestamp: new Date().toISOString(),
      participantID: pid,
      clientId: data.clientId || '',
      condition: cond,
      referrer: data.referrer || '',
      userAgent: data.userAgent || '',
      extra: data.extra || {}
    };
    console.log('LOG_ENTRY:', JSON.stringify(row));

    // Successful response
    return { statusCode: 200, body: JSON.stringify({ status:'ok' }) };

  } catch (err) {
    console.log('LOG_ERROR:', err && err.stack ? err.stack : String(err));
    return { statusCode: 500, body: JSON.stringify({ status:'error', message: String(err) }) };
  }
};
