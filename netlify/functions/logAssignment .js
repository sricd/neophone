// Netlify Serverless Function - logAssignment.js

const fs = require('fs');

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method not allowed" }),
      };
    }

    const data = JSON.parse(event.body || '{}');

    const now = new Date().toISOString();

    // Log format
    const row = {
      timestamp: now,
      participantID: data.participantID || "",
      clientId: data.clientId || "",
      condition: data.condition || "",
      referrer: data.referrer || "",
      userAgent: data.userAgent || "",
      extra: data.extra || {}
    };

    // Print to Netlify logs
    console.log("LOG_ENTRY:", JSON.stringify(row));

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "ok" }),
    };
  } catch (err) {
    console.log("LOG_ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: "error", message: err.message }),
    };
  }
};
