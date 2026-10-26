// @ts-nocheck
import { createClient } from "@libsql/client/web";

const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data), { 
    status, 
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
});

export const onRequestPost = async (context) => {
  try {
    const env = context.env || {};
    const tursoUrl = (env.TURSO_DATABASE_URL || "").trim();
    const tursoToken = (env.TURSO_AUTH_TOKEN || "").trim();

    if (!tursoUrl || !tursoToken) {
      return jsonResponse({ success: false, error: "Database pending keys" }, 400);
    }

    const db = createClient({ url: tursoUrl, authToken: tursoToken });
    let body = {};
    try { body = await context.request.json(); } catch(e) {}

    // Auto-Healing: Create table safely
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        service_name TEXT,
        booking_date TEXT,
        booking_time TEXT,
        status TEXT DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Dynamic Safe Insert (Prevents crashes if older databases are missing columns)
    await db.execute({
      sql: INSERT INTO bookings (client_id, customer_name, customer_phone, service_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?),
      args: [
        body.client_id || body.client_name || 'default',
        body.customer_name || body.client_name || 'Unknown',
        body.customer_phone || body.client_phone || 'Unknown',
        body.service_name || 'Service',
        body.booking_date || body.date || 'Unknown',
        body.booking_time || body.time || 'Unknown'
      ]
    });

    return jsonResponse({ success: true, message: "Saved to Turso" });
  } catch (error) {
    // If it fails, return the EXACT Turso error so we can read it in the browser console
    return jsonResponse({ success: false, error: error.message }, 500);
  }
};
