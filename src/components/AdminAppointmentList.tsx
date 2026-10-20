import React, { useEffect, useState } from 'react';

export default function AdminAppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        setAppointments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch appointments:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading appointments...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-6xl mx-auto my-8">
      <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Appointments Ledger</h2>
        <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">{appointments.length} Total</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wider border-b">
              <th className="p-4 font-semibold">Patient</th>
              <th className="p-4 font-semibold">Contact</th>
              <th className="p-4 font-semibold">Service</th>
              <th className="p-4 font-semibold">Date & Time</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No appointments booked yet.</td>
              </tr>
            ) : (
              appointments.map((apt: any) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">{apt.name}</td>
                  <td className="p-4 text-gray-600">{apt.phone}</td>
                  <td className="p-4 text-gray-600">{apt.service}</td>
                  <td className="p-4 text-gray-600 font-medium">
                    {apt.date} <span className="text-gray-400 ml-2">{apt.time}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
