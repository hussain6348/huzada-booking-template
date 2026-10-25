// @ts-nocheck
import { createClient } from "@libsql/client/web";

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const onRequestPost = async (context: any) => {
  try {
    const env = context?.env || {};
    const tursoUrl = env.TURSO_DATABASE_URL;
    const tursoToken = env.TURSO_AUTH_TOKEN;

    // Check if Turso credentials exist and are non-empty strings
    if (
      !tursoUrl ||
      !tursoToken ||
      typeof tursoUrl !== "string" ||
      typeof tursoToken !== "string" ||
      tursoUrl.trim() === "" ||
      tursoToken.trim() === ""
    ) {
      return jsonResponse({ success: false, error: "Database pending" }, 400);
    }

    const cleanUrl = tursoUrl.trim();
    // Validate protocol to prevent libSQL URL_INVALID crashes
    if (
      !cleanUrl.startsWith("libsql://") &&
      !cleanUrl.startsWith("https://") &&
      !cleanUrl.startsWith("http://") &&
      !cleanUrl.startsWith("wss://")
    ) {
      return jsonResponse({ success: false, error: "Database pending" }, 400);
    }

    // Safely parse JSON request body
    let body: any = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }

    // Initialize Turso libSQL client
    const db = createClient({
      url: cleanUrl,
      authToken: tursoToken.trim(),
    });

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

    // Extract booking data supporting multiple naming conventions
    const clientId = body.client_id || "unknown";
    const customerName = body.customer_name || body.client_name || "";
    const customerPhone = body.customer_phone || body.client_phone || "";
    const serviceName = body.service_name || "";
    const bookingDate = body.booking_date || body.date || "";
    const bookingTime = body.booking_time || body.time || "";

    // Save the booking securely
    await db.execute({
      sql: `INSERT INTO bookings (client_id, customer_name, customer_phone, service_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        clientId,
        customerName,
        customerPhone,
        serviceName,
        bookingDate,
        bookingTime,
      ],
    });

    return jsonResponse({
      success: true,
      whatsapp: env.WHATSAPP_NUMBER || undefined,
    });
  } catch (error: any) {
    return jsonResponse(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      500
    );
  }
};
