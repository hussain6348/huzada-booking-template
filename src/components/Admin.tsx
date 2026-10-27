import { useEffect, useState } from 'react';

// Define the exact shape of the appointment data for TypeScript
interface Appointment {
  name: string;
  service: string;
  date: string;
  time: string;
  phone: string;
  email: string;
}

export default function Admin() {
  // Tell TypeScript this array will hold Appointment objects
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data.results || []));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#003366', marginBottom: '20px' }}>CRM Admin Panel</h1>
      <div style={{ display: 'grid', gap: '20px' }}>
        {appointments.map((appt, i) => (
          <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{appt.name}</h3>
            <p style={{ margin: '5px 0' }}><strong>Service:</strong> {appt.service}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {appt.date} at {appt.time}</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <a href={'tel:' + (appt.phone ? appt.phone.replace(/[^0-9+]/g, '') : '')} style={{ padding: '8px 12px', backgroundColor: '#28A745', color: '#fff', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>?? Call</a>
              <a href={'mailto:' + appt.email} style={{ padding: '8px 12px', backgroundColor: '#007BFF', color: '#fff', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>?? Email</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
