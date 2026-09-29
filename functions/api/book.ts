import { createClient } from '@libsql/client/web';

export const onRequestPost = async (context: any) => {
  const { request, env } = context;
  const body = await request.json();
  const aptId = `APT-${Date.now()}`;
  
  if (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN) {
    const db = createClient({ url: env.TURSO_DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
    try {
      await db.execute({
        sql: `INSERT INTO appointments (id, patient_name, patient_phone, service_type, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [aptId, body.patientName, body.patientPhone, body.serviceType, body.appointmentDate, body.appointmentTime, 'pending'],
      });
    } catch (e) { console.error(e); }
  }
  
  return new Response(JSON.stringify({ success: true, aptId }), { headers: { 'Content-Type': 'application/json' } });
};
