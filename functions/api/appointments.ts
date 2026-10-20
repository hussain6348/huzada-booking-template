import { createClient } from "@libsql/client/web";
import { requireAdmin, json } from "../_lib/guard";

async function initDB(db: any) {
  await db.execute(`CREATE TABLE IF NOT EXISTS services (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, price REAL, duration_minutes INTEGER DEFAULT 30)`);
  await db.execute(`CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, service_id INTEGER, client_name TEXT, client_phone TEXT, date TEXT, time TEXT, status TEXT DEFAULT 'pending', created_at TEXT)`);
}

export const onRequestGet = async (context: any) => {
  const { request, env } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  if (env?.TURSO_DATABASE_URL && env?.TURSO_AUTH_TOKEN) {
    try {
      const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
      await initDB(db);
      const result = await db.execute("SELECT * FROM appointments ORDER BY date DESC, time DESC");
      return json({ success: true, appointments: result.rows });
    } catch (e: any) { return json({ success: false, error: "Database error" }, 500); }
  }
  return json({ success: true, appointments: [], source: "fallback" });
};

export const onRequestDelete = async (context: any) => {
  const { request, env } = context;
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id && env?.TURSO_DATABASE_URL && env?.TURSO_AUTH_TOKEN) {
    try {
      const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
      await db.execute({ sql: "DELETE FROM appointments WHERE id = ?", args: [id] });
      return json({ success: true, id });
    } catch (e: any) { return json({ success: false, error: "Failed to delete" }, 500); }
  }
  return json({ success: false, error: "Missing DB credentials" }, 500);
};
