// @ts-nocheck
import { createClient } from "@libsql/client/web";

export interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = createClient({
      url: context.env.TURSO_DATABASE_URL,
      authToken: context.env.TURSO_AUTH_TOKEN,
    });
    const result = await db.execute('SELECT * FROM bookings ORDER BY created_at DESC');
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

