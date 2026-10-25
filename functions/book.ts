// @ts-nocheck
import { createClient } from "@libsql/client/web";

export const onRequestPost = async (context) => {
  try {
    const db = createClient({
      url: context.env.TURSO_DATABASE_URL,
      authToken: context.env.TURSO_AUTH_TOKEN,
    });

    const body = await context.request.json();

    // WaaS Auto-Migration: Automatically build the table for brand new clients
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

    // Save the booking securely
    await db.execute({
      sql: 'INSERT INTO bookings (client_id, customer_name, customer_phone, service_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?)',
      args: [body.client_id || 'unknown', body.customer_name || '', body.customer_phone || '', body.service_name || '', body.booking_date || '', body.booking_time || '']
    });

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
