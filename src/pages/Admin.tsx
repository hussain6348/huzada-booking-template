import React from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const fetchBookings = async () => {
  const res = await fetch('/bookings');
  if (!res.ok) throw new Error('Network error');
  return res.json();
};

function AdminDashboard() {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="p-12 text-center font-mono">Loading Vault...</div>;
  if (error) return <div className="p-12 text-center text-red-500 font-mono">Database Error</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h2 className="text-3xl font-extrabold text-zinc-900 mb-8 flex items-center gap-3">
        Live Orders
        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">Live Sync</span>
      </h2>
      
      <div className="grid gap-4">
        {!bookings || bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">No bookings yet.</div>
        ) : (
          bookings.map((b: any) => (
            <div key={b.id} className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{b.customer_name}</h3>
                <p className="text-sm text-zinc-600">{b.service_name}</p>
                <div className="text-xs text-zinc-500 font-mono mt-2">{b.booking_date} @ {b.booking_time}</div>
              </div>
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase">{b.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Admin({ onLogout }: { onLogout?: () => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-50"><AdminDashboard /></div>
    </QueryClientProvider>
  );
}


