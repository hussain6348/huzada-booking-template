import { createClient } from '@libsql/client/web';

const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export async function onRequestPut(context: any) {
  try {
    const env = context?.env || {};
    const tursoUrl = env.TURSO_DATABASE_URL;
    const tursoToken = env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken || typeof tursoUrl !== 'string' || typeof tursoToken !== 'string' || !tursoUrl.trim() || !tursoToken.trim()) {
      return jsonResponse({ success: false, error: 'Database pending' }, 400);
    }

    const id = context.params.id;
    let body: any = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }

    const { name, price, description, image_path } = body;
    const client = createClient({ url: tursoUrl.trim(), authToken: tursoToken.trim() });
    
    await client.execute({
      sql: 'UPDATE products SET name = ?, price = ?, description = ?, image_path = ? WHERE id = ?',
      args: [name, price, description || '', image_path, id]
    });
    return jsonResponse({ success: true });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Server error' }, 500);
  }
}

export async function onRequestDelete(context: any) {
  try {
    const env = context?.env || {};
    const tursoUrl = env.TURSO_DATABASE_URL;
    const tursoToken = env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken || typeof tursoUrl !== 'string' || typeof tursoToken !== 'string' || !tursoUrl.trim() || !tursoToken.trim()) {
      return jsonResponse({ success: false, error: 'Database pending' }, 400);
    }

    const id = context.params.id;
    const client = createClient({ url: tursoUrl.trim(), authToken: tursoToken.trim() });
    
    await client.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id]
    });
    return jsonResponse({ success: true });
  } catch (error: any) {
    return jsonResponse({ error: error?.message || 'Server error' }, 500);
  }
}
