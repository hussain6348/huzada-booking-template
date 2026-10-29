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
      id: row.id, 
      name: row.name, 
      category: row.category, 
      price: row.price,
      duration: row.duration, 
      description: row.description, 
      badge: row.badge,
      images: (() => {
        try {
          return typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []);
        } catch {
          return [row.images].filter(Boolean);
        }
      })()
    }));

    return new Response(JSON.stringify(services), { status: 200 });
  } catch (err: any) {
    console.error("GET Services Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const client = createClient({ url: context.env.TURSO_DATABASE_URL, authToken: context.env.TURSO_AUTH_TOKEN });
    const body: any = await context.request.json();
    
    const id = body.id || `SRV-${Math.floor(Math.random() * 10000)}`;
    const name = body.name || 'Untitled Service';
    const category = body.category || 'General';
    const price = Number(body.price) || 0;
    const duration = Number(body.duration || body.duration_minutes) || 30;
    const description = body.description || '';
    const badge = body.badge || '';
    
    let imagesJson = '[]';
    try {
      imagesJson = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images].filter(Boolean));
    } catch {
      imagesJson = '[]';
    }

    await client.execute({
      sql: `INSERT INTO services (id, name, category, price, duration, description, images, badge)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
            name=excluded.name, category=excluded.category, price=excluded.price,
            duration=excluded.duration, description=excluded.description, images=excluded.images, badge=excluded.badge`,
      args: [id, name, category, price, duration, description, imagesJson, badge]
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (err: any) {
    console.error("POST Services Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
