import React from 'react';
import BookingsList from '../components/BookingsList';

// Added 'props: any' to accept onLogout and satisfy TypeScript
export function Admin(props: any) {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your schedule, appointments, and services.</p>
        </div>
        
        {/* Wire up the onLogout function passed from App.tsx */}
        {props.onLogout && (
          <button 
            onClick={props.onLogout}
            className="bg-red-50 text-red-600 px-4 py-2 rounded font-medium hover:bg-red-100 transition"
          >
            Log Out
          </button>
        )}
      </header>
      
      <main className="max-w-6xl mx-auto">
        <BookingsList />
      </main>
    </div>
  );
}

export default Admin;
