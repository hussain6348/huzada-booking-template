import React, { useState, useEffect } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, LogOut, ExternalLink, Terminal, X, Mail, Phone, Calendar as CalendarIcon, Clock } from 'lucide-react';

const queryClient = new QueryClient();

const fetchBookings = async () => {
  const res = await fetch('/bookings');
  if (!res.ok) throw new Error('Failed to load bookings');
  return res.json();
};

const fetchHealth = async () => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      return { connected: false, error: `Health check failed with status ${res.status}` };
    }
    return res.json();
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Failed to reach /api/health' };
  }
};

function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [lastClientStatus, setLastClientStatus] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('huzada_last_booking_status');
      if (stored) {
        setLastClientStatus(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const {
    data: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings,
    isFetching: bookingsFetching,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: fetchBookings,
    refetchInterval: 10000,
  });

  const {
    data: health,
    isLoading: healthLoading,
    refetch: refetchHealth,
    isFetching: healthFetching,
  } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: 15000,
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Booking Operations Console
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
              WaaS v2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time synchronization between Cloudflare Serverless and Turso libSQL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchBookings();
              refetchHealth();
            }}
            disabled={bookingsFetching || healthFetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${bookingsFetching || healthFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>

      {/* Live System Health Monitor Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              health?.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              <Database className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-zinc-900">Database Connection Status</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {health?.databaseUrl || 'Turso libSQL Driver'}
              </p>
            </div>
          </div>

          <div>
            {healthLoading ? (
              <span className="text-xs text-zinc-400 font-mono">Pinging database...</span>
            ) : health?.connected ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Connected & Verified</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Action Required: {health?.code || 'DISCONNECTED'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Database Diagnostic Details */}
        {!health?.connected && health?.error && (
          <div className="bg-amber-50/70 p-4 sm:p-5 border-t border-amber-100 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Turso Connection Issue Detected:</p>
              <p className="font-mono bg-white/70 px-2 py-1 rounded border border-amber-200/60 inline-block">
                {health.error}
              </p>
              {health.detail && (
                <p className="text-zinc-700 bg-amber-100/60 p-2 rounded border border-amber-200/60 font-mono text-[11px] leading-relaxed">
                  ?? {health.detail}
                </p>
              )}
              <p className="text-zinc-600 pt-1">
                {health.code === 'TURSO_AUTH_401' || health.code === 'TURSO_AUTH_ERROR'
                  ? 'The auth token provided in TURSO_AUTH_TOKEN is invalid or has expired. Generate a new token using `turso db tokens create <db-name>`.'
                  : health.code === 'DB_PENDING'
                  ? 'Cloudflare Pages Environment Variables are missing or the active deployment needs to be retried.'
                  : health.code === 'DB_INVALID_URL'
                  ? 'The TURSO_DATABASE_URL is incomplete or malformed. Ensure n8n passes the full libsql://<db>-<org>.turso.io hostname.'
                  : 'Check your database connection and network firewall settings.'}
              </p>
            </div>
          </div>
        )}

        {health?.connected && (
          <div className="bg-zinc-50/60 px-6 py-3.5 border-t border-zinc-100 flex flex-wrap items-center gap-6 text-xs text-zinc-600 font-mono">
            <span>Verified Tables: <strong>{health.tables?.join(', ') || 'bookings'}</strong></span>
            <span>Recorded Bookings: <strong>{health.bookingsCount ?? 0}</strong></span>
          </div>
        )}
      </div>

      {/* Developer Diagnostic Console (Recent Booking Event) */}
      {lastClientStatus && (
        <div className="bg-zinc-900 text-zinc-200 rounded-2xl p-4 sm:p-5 text-xs font-mono border border-zinc-800 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Last Checkout Submission Diagnostic</span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('huzada_last_booking_status');
                setLastClientStatus(null);
              }}
              className="text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
            >
              Clear Log
            </button>
          </div>
          <div className="space-y-1">
            <p>
              <span className="text-zinc-500">Timestamp:</span> {lastClientStatus.timestamp}
            </p>
            <p>
              <span className="text-zinc-500">Result:</span>{' '}
              {lastClientStatus.ok ? (
                <span className="text-emerald-400 font-bold">200 OK (Saved to Turso)</span>
              ) : (
                <span className="text-red-400 font-bold">
                  HTTP {lastClientStatus.status} - {lastClientStatus.error} ({lastClientStatus.code})
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Live Bookings Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
            <span>Live Bookings Ledger</span>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full font-mono">
              {Array.isArray(bookings) ? bookings.length : 0} Total
            </span>
          </h2>
        </div>

        {bookingsLoading ? (
          <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-xs font-mono text-zinc-500">
            Synchronizing bookings with Turso vault...
          </div>
        ) : bookingsError ? (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 text-center text-xs font-mono text-red-700">
            Failed to query bookings table. Database might be initializing.
          </div>
        ) : !bookings || bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-12 text-center space-y-2">
            <p className="font-semibold text-sm text-zinc-700">No bookings recorded yet.</p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Once customers submit the checkout form on the storefront, their details will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-3.5">
            {bookings.map((b: any) => (
              <button
                key={b.id || Math.random()}
                onClick={() => setSelectedBooking(b)}
                className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-base text-zinc-900">
                      {b.customer_name || b.client_name || 'Anonymous Client'}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      (b.status || 'Pending').toLowerCase() === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {b.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-zinc-600">
                    {b.service_name || 'Custom Service'} •{' '}
                    <span className="font-mono text-zinc-500">
                      {b.customer_phone || b.client_phone || 'No Phone'}
                    </span>
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Scheduled: {b.booking_date || 'TBD'} @ {b.booking_time || 'TBD'}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                    Recorded {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                  <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 sm:justify-end">
                    View Details <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-zinc-900">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col gap-1">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Service Requested</span>
                <span className="text-lg font-bold text-zinc-900">{selectedBooking.service_name || 'Service not specified'}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500">Date</span>
                    <span className="text-sm font-medium text-zinc-900">{selectedBooking.booking_date || 'Not set'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-zinc-500">Time</span>
                    <span className="text-sm font-medium text-zinc-900">{selectedBooking.booking_time || 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Customer Information</h4>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-xs text-zinc-500 font-medium">Full Name</span>
                    <span className="text-sm font-semibold text-zinc-900">{selectedBooking.customer_name || selectedBooking.client_name || 'Anonymous'}</span>
                  </div>
                  
                  <div>
                    <span className="block text-xs text-zinc-500 font-medium mb-1">Phone Number</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-medium text-zinc-900">{selectedBooking.customer_phone || selectedBooking.client_phone || 'None'}</span>
                      {(selectedBooking.customer_phone || selectedBooking.client_phone) && (
                        <a href={`tel:${selectedBooking.customer_phone || selectedBooking.client_phone}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs text-zinc-500 font-medium mb-1">Email Address</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-900">{selectedBooking.customer_email || 'Not provided'}</span>
                      {selectedBooking.customer_email && (
                        <a href={`mailto:${selectedBooking.customer_email}?subject=Regarding your booking for ${selectedBooking.service_name}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-50 px-6 py-4 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Admin({ onLogout }: { onLogout?: () => void }) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-100/60 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
        <AdminDashboard onLogout={onLogout} />
      </div>
    </QueryClientProvider>
  );
}

export default Admin;
