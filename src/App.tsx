import { useEffect, useState } from 'react';

export default function App() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data.results?.[0]?.response?.result?.rows) {
          setAppointments(data.results[0].response.result.rows);
        }
      });
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments found.</p>
        ) : (
          appointments.map((app) => (
            <div key={app.id} className="border-b last:border-0 py-3">
              <p className="font-semibold text-lg">{app.date} at {app.time}</p>
              <p className="text-gray-700">{app.client_name} - {app.client_phone}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
