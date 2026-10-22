import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Phone,
  CheckCircle2,
  X
} from 'lucide-react';
import { Admin } from './pages/Admin';
import { AdminLogin } from './components/AdminLogin';
import BookingForm from './components/BookingForm';
import { isAuthenticated, AUTH_CHANGE_EVENT } from './lib/auth';

const FALLBACK_SERVICES = [
  {
    id: 'srv-1',
    name: 'Teeth Whitening & Ultrasonic Cleanse',
    category: 'Dental Care',
    price: 85,
    duration: 45,
    duration_minutes: 45,
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
    duration_minutes: 30,
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
    duration_minutes: 60,
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
    duration_minutes: 40,
    description: 'Advanced diagnostic screening and personalized dermatological care plan.',
    images: ['https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80'],
    badge: 'Specialist',
  },
];

function PublicBookingPortal() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('huzada_booking_services');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          images: Array.isArray(s.images) && s.images.length > 0
            ? s.images
            : (s.image ? [s.image] : [FALLBACK_SERVICES[0].images[0]]),
          duration_minutes: s.duration || s.duration_minutes || 30,
        }));
      }
      return FALLBACK_SERVICES;
    } catch {
      return FALLBACK_SERVICES;
    }
  });

  useEffect(() => {
    // Also attempt fetching from API if configured
    fetch('/api/services')
      .then(res => res.json())
      .then((data: any) => {
        if (data?.services && Array.isArray(data.services) && data.services.length > 0) {
          setServices(
            data.services.map((s: any) => ({
              ...s,
              images: Array.isArray(s.images) && s.images.length > 0
                ? s.images
                : (s.image ? [s.image] : [FALLBACK_SERVICES[0].images[0]]),
              duration_minutes: s.duration || s.duration_minutes || 30,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100/60 font-sans text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Navigation */}
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              HB
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base text-zinc-900 tracking-tight flex items-center gap-2">
                Huzada Booking
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded text-[10px] font-medium font-mono">
                  Online
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/admin"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-zinc-200 py-12 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-full text-xs font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
            <span>Instant Direct Booking & Confirmation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Professional Services, <span className="underline decoration-zinc-300">Booked Instantly.</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Choose a service from our registry below, pick your preferred appointment time, and receive instant verification on WhatsApp.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base text-zinc-900">Available Services</h3>
            <p className="text-xs text-zinc-500">Select an offering to begin booking</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {services.length} {services.length === 1 ? 'service' : 'services'} available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(srv => {
            const primaryThumbnail = (srv.images && srv.images[0]) || srv.image || FALLBACK_SERVICES[0].images[0];
            return (
              <div
                key={srv.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                  <img
                    src={primaryThumbnail}
                    alt={srv.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => {
                      e.target.src = FALLBACK_SERVICES[0].images[0];
                    }}
                  />
                  {srv.badge && (
                    <span className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                      {srv.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-zinc-800 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-zinc-200">
                    {srv.category}
                  </span>
                </div>

                {/* Service Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-zinc-900 group-hover:text-black transition-colors leading-snug">
                        {srv.name}
                      </h4>
                      <span className="font-mono font-bold text-sm text-zinc-900 shrink-0">
                        ${srv.price}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {srv.description || 'Professional appointment session tailored to your schedule.'}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono pt-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{srv.duration_minutes || srv.duration || 30} Minutes Session</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedService({
                        ...srv,
                        image: primaryThumbnail,
                      })
                    }
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs font-sans"
                  >
                    <span>Book Appointment</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Booking Form Modal Overlay */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl my-8">
            <BookingForm
              service={selectedService}
              onClose={() => setSelectedService(null)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-4 text-center text-xs text-zinc-400 font-mono">
        Huzada Operations System · Protected Platform
      </footer>
    </div>
  );
}

function ProtectedAdminRoute() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthed(isAuthenticated());
    };
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  }, []);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return <Admin onLogout={() => setAuthed(false)} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicBookingPortal />} />
      <Route path="/admin" element={<ProtectedAdminRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
