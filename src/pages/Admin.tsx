import React from 'react';
import BookingsList from '../components/BookingsList';

export function Admin() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your schedule, appointments, and services.</p>
      </header>
      
      <main className="max-w-6xl mx-auto">
        <BookingsList />
      </main>
    </div>
  );
}

export default Admin;
