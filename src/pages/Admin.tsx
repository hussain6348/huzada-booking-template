import React, { useState, useEffect } from 'react';
import BookingsList from '../components/BookingsList';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Terminal,
  X,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Scissors,
  LoaderCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number; // in minutes
  description: string;
  images: string[];
  badge?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Teeth Whitening & Ultrasonic Cleanse',
    category: 'Dental Care',
    price: 85,
    duration: 45,
    description: 'Complete ultrasonic plaque removal, enamel polish, and brightening procedure.',
    images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80'],
    badge: 'Popular',
  },
  {
    id: 'srv-2',
    name: 'Comprehensive Health Consultation',
    category: 'Consultation',
    price: 60,
    duration: 30,
    description: 'In-depth one-on-one session with our senior clinical specialist.',
    images: ['https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80'],
    badge: 'Essential',
  },
  {
    id: 'srv-3',
    name: 'Executive Wellness & Therapy',
    category: 'Wellness',
    price: 120,
    duration: 60,
    description: 'Deep therapeutic revitalization and stress-relief treatment session.',
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'],
    badge: 'Premium',
  },
  {
    id: 'srv-4',
    name: 'Specialist Dermatology Checkup',
    category: 'Clinical',
    price: 95,
    duration: 40,
    description: 'Advanced diagnostic screening and personalized dermatological care plan.',
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80'],
    badge: '',
  },
];

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

  // Tab & Service Registry State
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('huzada_booking_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          images: Array.isArray(item.images) && item.images.length > 0
            ? item.images
            : (item.image ? [item.image] : [DEFAULT_SERVICES[0].images[0]]),
        }));
      }
      return DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const [serviceForm, setServiceForm] = useState<{
    name: string;
    category: string;
    customCategory: string;
    price: number;
    duration: number;
    description: string;
    images: string[];
    badge: string;
  }>({
    name: '',
    category: 'Consultation',
    customCategory: '',
    price: 60,
    duration: 30,
    description: '',
    images: [],
    badge: '',
  });

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

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      name: '',
      category: 'Consultation',
      customCategory: '',
      price: 60,
      duration: 30,
      description: '',
      images: [],
      badge: '',
    });
    setServiceError(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    const standardCategories = ['Consultation', 'Dental Care', 'Wellness', 'Clinical', 'Grooming'];
    const isCustom = !standardCategories.includes(service.category);

    const initialImages = Array.isArray(service.images) && service.images.length > 0
      ? service.images
      : ((service as any).image ? [(service as any).image] : []);

    setServiceForm({
      name: service.name,
      category: isCustom ? 'Custom' : service.category,
      customCategory: isCustom ? service.category : '',
      price: service.price,
      duration: service.duration,
      description: service.description,
      images: initialImages,
      badge: service.badge || '',
    });
    setServiceError(null);
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    const updated = services.filter(s => s.id !== serviceId);
    setServices(updated);
    localStorage.setItem('huzada_booking_services', JSON.stringify(updated));
    setDeleteConfirmId(null);
  };

    const handleR2CoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const currentCount = serviceForm.images?.length || 0;
    if (currentCount + files.length > 5) {
      alert("Maximum of 5 images allowed per service.");
      return;
    }

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append('file', file));

      const res = await fetch('/api/upload', { 
        method: 'POST', 
         
        body: formData 
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      if (data?.imageUrls && Array.isArray(data.imageUrls)) {
        setServiceForm(prev => ({ ...prev, images: [...(prev.images || []), ...data.imageUrls] }));
      } else if (data?.imageUrl) {
        setServiceForm(prev => ({ ...prev, images: [...(prev.images || []), data.imageUrl] }));
      }
    } catch (err) {
      console.error('R2 Upload error:', err);
    }
  };
  // Fetch services from Turso on load
  useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setServices(data);
    }).catch(console.error);
  }, []);

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      setServiceError('Service title is required.');
      return;
    }
    
    const serviceData = {
      id: editingService?.id || `SRV-${Math.floor(Math.random() * 10000)}`,
      name: serviceForm.name,
      category: serviceForm.category === 'Custom' ? serviceForm.customCategory : serviceForm.category,
      price: Number(serviceForm.price),
      duration: Number(serviceForm.duration),
      description: serviceForm.description,
      images: serviceForm.images,
      badge: serviceForm.badge
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      });
      
      if (res.ok) {
        // Refresh from database so UI updates instantly
        const updated = await fetch('/api/services').then(r => r.json());
        if (Array.isArray(updated)) setServices(updated);
        setIsServiceModalOpen(false);
      }
    } catch (err) {
      setServiceError('Failed to save to database.');
    }
  };

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
            Real-time synchronization between Serverless Environment and Secure Database
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
                {health?.databaseUrl || 'Database Driver'}
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
              <p className="font-semibold">Database Connection Issue Detected:</p>
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
                  ? 'The auth token provided in TURSO_AUTH_TOKEN is invalid or has expired. Generate a new token using `your database provider console`.'
                  : health.code === 'DB_PENDING'
                  ? 'Server Environment Variables are missing or the active deployment needs to be retried.'
                  : health.code === 'DB_INVALID_URL'
                  ? 'The TURSO_DATABASE_URL is incomplete or malformed. Ensure n8n passes the full complete database hostname.'
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
                <span className="text-emerald-400 font-bold">200 OK (Saved to Database)</span>
              ) : (
                <span className="text-red-400 font-bold">
                  HTTP {lastClientStatus.status} - {lastClientStatus.error} ({lastClientStatus.code})
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Dual-Tab Navigation Controls */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'bg-zinc-900 text-white shadow-2xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Client Appointments</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === 'appointments'
                ? 'bg-zinc-700 text-zinc-200'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {bookings?.length ?? 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-zinc-900 text-white shadow-2xs'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Services Registry</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
              activeTab === 'services'
                ? 'bg-zinc-700 text-zinc-200'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {services.length}
          </span>
        </button>
      </div>

      {/* TAB 1: CLIENT APPOINTMENTS LIST (Secure Database) */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
        <BookingsList />
      {/* TAB 2: SERVICES REGISTRY */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-2xl border border-zinc-200/90 shadow-xs overflow-hidden divide-y divide-zinc-100">
          {/* Header with primary action: + Add Service */}
          <div className="p-5 sm:p-6 bg-zinc-50/70 border-b border-zinc-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-zinc-900">Services Registry</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {services.length} active booking {services.length === 1 ? 'service' : 'services'} available for clients
              </p>
            </div>

            <button
              onClick={handleOpenAddService}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>

          {/* Quick Upload Service Card */}
          <div className="p-4 bg-zinc-50/40 border-b border-zinc-200">
            <div
              onClick={handleOpenAddService}
              className="border-2 border-dashed border-zinc-200 hover:border-zinc-800 rounded-xl p-4 transition-all cursor-pointer bg-white hover:bg-zinc-50/80 group flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center text-zinc-700 transition-colors shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">Add Service to Booking Portal</h4>
                  <p className="text-[11px] text-zinc-500">
                    Upload media assets, configure service duration & fees, and publish live to clients.
                  </p>
                </div>
              </div>

              <span className="bg-zinc-900 group-hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Service</span>
              </span>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-500">No services found in registry.</p>
              <button
                onClick={handleOpenAddService}
                className="bg-zinc-900 text-white text-xs font-medium px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload First Service</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {services.map(item => {
                const primaryImg = (item.images && item.images[0]) || (item as any).image || DEFAULT_SERVICES[0].images[0];
                return (
                  <div
                    key={item.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={primaryImg}
                          alt={item.name}
                          loading="lazy"
                          className="w-14 h-14 aspect-square rounded-xl object-cover border border-zinc-200 bg-zinc-100"
                          onError={(e: any) => {
                            e.target.src = DEFAULT_SERVICES[0].images[0];
                          }}
                        />
                        {item.images && item.images.length > 1 && (
                          <span
                            title={`${item.images.length} photos`}
                            className="absolute -bottom-1 -right-1 bg-zinc-900 text-white font-mono text-[9px] font-semibold px-1.5 py-0.2 rounded-full border border-white shadow-xs"
                          >
                            +{item.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-zinc-900 truncate">{item.name}</h4>
                          {item.badge && (
                            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                          <span>{item.category}</span>
                          <span>Â·</span>
                          <span className="font-semibold text-zinc-900">${item.price}</span>
                          <span>Â·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            {item.duration} mins
                          </span>
                        </p>
                        {item.description && (
                          <p className="text-xs text-zinc-400 line-clamp-1 max-w-md mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenEditService(item)}
                        className="px-3 py-1.5 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="Edit Service"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200">
                          <button
                            onClick={() => handleDeleteService(item.id)}
                            className="text-red-700 font-bold text-xs px-2 py-0.5 hover:underline cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-zinc-500 text-xs px-1 hover:text-zinc-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Details Modal (Secure Database) */}
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

      {/* Service Modal (Add / Edit) with Secure Media Upload */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-zinc-900">
                  {editingService ? 'Edit Booking Service' : 'Add New Service to Catalog'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Configure service details, pricing, duration, and cover media assets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1.5 hover:bg-zinc-200 rounded-full transition-colors text-zinc-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {serviceError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{serviceError}</span>
                </div>
              )}

              <form onSubmit={handleSaveService} className="space-y-4">
                {/* CLOUDFLARE R2 UPLOAD INJECTION START */}
                <div className="space-y-1.5 pb-4 border-b border-zinc-100 mb-4 pt-2">
                  <label className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wider">
                    Secure Media Upload
                  </label>
                  <div 
                    className="flex items-center gap-3 p-3 border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-xl bg-zinc-50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('r2-file-upload')?.click()}
                  >
                    <span className="text-xs font-semibold text-zinc-800">Click to upload cover image</span>
                    <input id="r2-file-upload" type="file" multiple onChange={handleR2CoverUpload} accept="image/*" className="hidden" />
                  </div>
                  {serviceForm.images && serviceForm.images.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {serviceForm.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Upload preview" className="w-14 h-14 rounded-lg object-cover border border-zinc-200 shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
                {/* CLOUDFLARE R2 UPLOAD INJECTION END */}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Ultrasonic Dental Cleanse"
                    value={serviceForm.name}
                    onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['Consultation', 'Dental Care', 'Wellness', 'Clinical', 'Grooming', 'Custom'].map(cat => {
                      const active = serviceForm.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setServiceForm({ ...serviceForm, category: cat })}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                            active
                              ? 'bg-zinc-900 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {serviceForm.category === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom category name..."
                      value={serviceForm.customCategory}
                      onChange={e =>
                        setServiceForm({ ...serviceForm, customCategory: e.target.value })
                      }
                      className="mt-2 w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Price ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 75"
                      value={serviceForm.price === 0 ? '' : serviceForm.price}
                      onChange={e => {
                        const val = e.target.value;
                        setServiceForm({
                          ...serviceForm,
                          price: val === '' ? 0 : Number(val),
                        });
                      }}
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Duration (Minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      min="5"
                      step="5"
                      placeholder="e.g. 30"
                      value={serviceForm.duration}
                      onChange={e =>
                        setServiceForm({
                          ...serviceForm,
                          duration: Math.max(5, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Highlight Badge <span className="text-zinc-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, Premium, Essential"
                    value={serviceForm.badge}
                    onChange={e => setServiceForm({ ...serviceForm, badge: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Service Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key deliverables, preparation notes..."
                    value={serviceForm.description}
                    onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsServiceModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={serviceSaving}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    {serviceSaving ? (
                      <>
                        <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingService ? 'Update Service' : 'Publish Service'}</span>
                    )}
                  </button>
                </div>
              </form>
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




