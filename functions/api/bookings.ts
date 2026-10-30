import { createClient } from '@libsql/client/web';

export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const searchDate = url.searchParams.get('date');
  
  const offset = (page - 1) * limit;

  const client = createClient({
    url: context.env.TURSO_DATABASE_URL as string,
    authToken: context.env.TURSO_AUTH_TOKEN as string,
  });

  try {
    let sql = '';
    let args: any[] = [];

    if (searchDate) {
      sql = 'SELECT * FROM bookings WHERE date = ? ORDER BY time ASC LIMIT ? OFFSET ?';
      args = [searchDate, limit, offset];
    } else {
      sql = 'SELECT * FROM bookings WHERE date >= date("now") ORDER BY date ASC LIMIT ? OFFSET ?';
      args = [limit, offset];
    }

    const result = await client.execute({ sql, args });

    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
