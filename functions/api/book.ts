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
    const tursoUrl = (env.TURSO_DATABASE_URL || "").trim();
    const tursoToken = (env.TURSO_AUTH_TOKEN || "").trim();

    // 1. Guard against unconfigured or lagging environment variables
    if (!tursoUrl || !tursoToken) {
      return jsonResponse(
        {
          success: false,
          error: "Database pending keys: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not set",
          code: "DB_PENDING",
        },
        400
      );
    }

    if (
      tursoUrl === "libsql://" ||
      tursoUrl === "https://" ||
      tursoUrl === "http://" ||
      tursoUrl.endsWith("://")
    ) {
      return jsonResponse(
        {
          success: false,
          error: `Database URL is incomplete ('${tursoUrl}'). Missing database hostname.`,
          code: "DB_INVALID_URL",
        },
        400
      );
    }

    // 2. Validate URL protocol to prevent libSQL URL_INVALID crashes
    if (
      !tursoUrl.startsWith("libsql://") &&
      !tursoUrl.startsWith("https://") &&
      !tursoUrl.startsWith("http://") &&
      !tursoUrl.startsWith("wss://")
    ) {
      return jsonResponse(
        {
          success: false,
          error: "Invalid database URL protocol. Expected libsql:// or https://",
          code: "DB_INVALID_URL",
        },
        400
      );
    }

    // 3. Safely parse JSON request body
    let body: any = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }

    // 4. Initialize Turso libSQL client
    const db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // 5. Auto-Migration: Ensure bookings table exists
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

    // 6. Safe parameterized insertion with fallback aliases
    const clientId = body.client_id || body.client_name || "default";
    const customerName = body.customer_name || body.client_name || "Unknown";
    const customerPhone = body.customer_phone || body.client_phone || "Unknown";
    const serviceName = body.service_name || "Service";
    const bookingDate = body.booking_date || body.date || "Unknown";
    const bookingTime = body.booking_time || body.time || "Unknown";

    const insertResult = await db.execute({
      sql: "INSERT INTO bookings (client_id, customer_name, customer_phone, service_name, booking_date, booking_time) VALUES (?, ?, ?, ?, ?, ?)",
      args: [
        clientId,
        customerName,
        customerPhone,
        serviceName,
        bookingDate,
        bookingTime,
      ],
    });

    const bookingId = insertResult?.lastInsertRowid
      ? String(insertResult.lastInsertRowid)
      : undefined;

    return jsonResponse({
      success: true,
      message: "Booking saved to Turso database",
      bookingId,
      whatsapp: env.WHATSAPP_NUMBER || undefined,
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Internal server error";
    const isAuthError =
      errorMessage.includes("401") ||
      errorMessage.includes("400") ||
      errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("jwt");

    console.error("[API/BOOK ERROR]", {
      message: errorMessage,
      code: isAuthError ? "TURSO_AUTH_ERROR" : "TURSO_EXEC_ERROR",
    });

    return jsonResponse(
      {
        success: false,
        error: errorMessage,
        code: isAuthError ? "TURSO_AUTH_ERROR" : "TURSO_EXEC_ERROR",
      },
      500
    );
  }
};
