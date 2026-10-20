import React from 'react';
import AdminAppointmentList from '../components/AdminAppointmentList';

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-gray-300 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Clinic Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your patient appointments and clinic schedule securely.</p>
        </div>
        
        {/* This loads the Turso database table we just built */}
        <AdminAppointmentList />
      </div>
    </div>
  );
}
