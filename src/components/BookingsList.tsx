import React, { useState, useEffect } from 'react';

export default function BookingsList() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?page=${page}&limit=50&date=${date}`);
      const data = await res.json();
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [page, date]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl font-bold text-gray-800">Booking Management</h2>
        
        <div className="flex space-x-2">
          <input 
            type="date" 
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1); 
            }}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {date && (
            <button 
              onClick={() => { setDate(''); setPage(1); }}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading appointments...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Time</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Contact</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? bookings.map((b, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-3 text-sm">{b.date}</td>
                  <td className="p-3 text-sm">{b.time}</td>
                  <td className="p-3 text-sm font-medium">{b.customer_name}</td>
                  <td className="p-3 text-sm text-gray-500">{b.phone || b.email}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 bg-white border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
        >
          &larr; Previous
        </button>
        <span className="text-sm font-medium text-gray-600">Page {page}</span>
        <button 
          disabled={bookings.length < 50} 
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
