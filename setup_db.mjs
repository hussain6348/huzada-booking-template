import fs from 'fs';

try {
  const env = fs.readFileSync('.dev.vars', 'utf8');
  let url = env.match(/TURSO_DATABASE_URL=(.+)/)[1].trim().replace(/['"]/g, '');
  let token = env.match(/TURSO_AUTH_TOKEN=(.+)/)[1].trim().replace(/['"]/g, '');

  url = url.replace('libsql://', 'https://') + '/v2/pipeline';

  const sqlCreate = "CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, email TEXT, service TEXT, date TEXT, time TEXT, status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP);";
  const sqlAlter = "ALTER TABLE appointments ADD COLUMN email TEXT;";

  console.log("Sending command to Turso database...");

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql: sqlCreate } },
        { type: "execute", stmt: { sql: sqlAlter } },
        { type: "close" }
      ]
    })
  });

  if (res.ok) {
    console.log("SUCCESS: Appointments table is ready!");
  } else {
    console.log("Database error:", await res.text());
  }
} catch (e) {
  console.log("Script error:", e.message);
}
