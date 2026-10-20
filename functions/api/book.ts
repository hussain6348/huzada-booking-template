import { createClient } from "@libsql/client/web";

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  if (!env?.TURSO_DATABASE_URL || !env?.TURSO_AUTH_TOKEN) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), { status: 500 });
  }

  try {
    const body = await request.json();
    const { service_id, service_name, client_name, client_phone, date, time } = body;

    const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

    // 1. Double-Booking Lock
    const check = await db.execute({
      sql: "SELECT id FROM appointments WHERE date = ? AND time = ?",
      args: [date, time]
    });

    if (check.rows.length > 0) {
      return new Response(JSON.stringify({ success: false, error: "Time slot unavailable. Please select a different time." }), { status: 409 });
    }

    // 2. Insert Appointment
    await db.execute({
      sql: "INSERT INTO appointments (service_id, client_name, client_phone, date, time, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      args: [service_id, client_name, client_phone, date, time, new Date().toISOString()]
    });

    // 3. Return Success and WhatsApp Number
    return new Response(JSON.stringify({ success: true, whatsapp: env.WHATSAPP_NUMBER }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: "Failed to process booking" }), { status: 500 });
  }
};
