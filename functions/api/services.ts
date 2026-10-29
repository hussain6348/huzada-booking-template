// @ts-nocheck
import { createClient } from '@libsql/client/web';

interface Env {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const client = createClient({ url: context.env.TURSO_DATABASE_URL, authToken: context.env.TURSO_AUTH_TOKEN });
    
    await client.execute(`
      CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY, name TEXT, category TEXT, price INTEGER, 
        duration INTEGER, description TEXT, images TEXT, badge TEXT
      )
    `);

    const result = await client.execute('SELECT * FROM services');
    const services = result.rows.map((row: any) => ({
      id: row.id, name: row.name, category: row.category, price: row.price,
      duration: row.duration, description: row.description, badge: row.badge,
      images: JSON.parse(row.images || '[]')
    }));

    return new Response(JSON.stringify(services), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const client = createClient({ url: context.env.TURSO_DATABASE_URL, authToken: context.env.TURSO_AUTH_TOKEN });
    const body: any = await context.request.json();
    const id = body.id || `SRV-${Math.floor(Math.random() * 10000)}`;

    await client.execute({
      sql: `INSERT INTO services (id, name, category, price, duration, description, images, badge) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON CONFLICT(id) DO UPDATE SET 
            name=excluded.name, category=excluded.category, price=excluded.price, 
            duration=excluded.duration, description=excluded.description, images=excluded.images, badge=excluded.badge`,
      args: [id, body.name, body.category, body.price, body.duration, body.description, JSON.stringify(body.images || []), body.badge || '']
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

