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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const onRequestGet = async (context: any) => {
  const env = context?.env || {};
  const tursoUrl = (env.TURSO_DATABASE_URL || "").trim();
  const tursoToken = (env.TURSO_AUTH_TOKEN || "").trim();

  // 1. Check environment variable presence
  if (!tursoUrl || !tursoToken) {
    return jsonResponse({
      connected: false,
      error: "TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is not defined in Cloudflare environment",
      code: "DB_PENDING",
      timestamp: new Date().toISOString(),
    });
  }

  // 2. Validate URL protocol
  if (
    !tursoUrl.startsWith("libsql://") &&
    !tursoUrl.startsWith("https://") &&
    !tursoUrl.startsWith("http://") &&
    !tursoUrl.startsWith("wss://")
  ) {
    return jsonResponse({
      connected: false,
      error: `Invalid database URL protocol: ${tursoUrl.substring(0, 15)}... Expected libsql:// or https://`,
      code: "DB_INVALID_URL",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    // 3. Ping database with basic query
    await db.execute("SELECT 1 as ping");

    // 4. Ensure bookings table exists (self-healing migration)
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

    // 5. Inspect existing tables and count rows
    const tablesResult = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream_%'"
    );
    const tables = (tablesResult.rows || []).map((r: any) => String(r.name || r[0]));

    let bookingsCount = 0;
    try {
      const countResult = await db.execute("SELECT count(*) as total FROM bookings");
      bookingsCount = Number(countResult.rows?.[0]?.total ?? countResult.rows?.[0]?.[0] ?? 0);
    } catch {}

    // Mask URL for safe display
    const maskedUrl = tursoUrl.replace(/(libsql:\/\/|https:\/\/)([^.]+)\./, "$1***.");

    return jsonResponse({
      connected: true,
      databaseUrl: maskedUrl,
      tables,
      bookingsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const errorMessage = error?.message || "Connection failed";
    const isAuthError =
      errorMessage.includes("401") ||
      errorMessage.includes("400") ||
      errorMessage.toLowerCase().includes("unauthorized") ||
      errorMessage.toLowerCase().includes("jwt");

    return jsonResponse({
      connected: false,
      error: errorMessage,
      code: isAuthError ? "TURSO_AUTH_ERROR" : "TURSO_CONN_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};
