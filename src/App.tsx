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
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2
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
  const [detailsService, setDetailsService] = useState<any>(null);
  const [lightboxItem, setLightboxItem] = useState<any | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

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
        if (Array.isArray(data) && data.length > 0) {
          setServices(
            data.map((s: any) => ({
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

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      } else if (e.key === 'ArrowLeft' && lightboxItem.images?.length > 1) {
        setCurrentImageIndex(prev =>
          prev === 0 ? lightboxItem.images.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight' && lightboxItem.images?.length > 1) {
        setCurrentImageIndex(prev =>
          prev === lightboxItem.images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem]);

  const handleOpenLightbox = (srv: any) => {
    const imgs = Array.isArray(srv.images) && srv.images.length > 0
      ? srv.images
      : (srv.image ? [srv.image] : [FALLBACK_SERVICES[0].images[0]]);
    setLightboxItem({ ...srv, images: imgs });
    setCurrentImageIndex(0);
  };

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
                {/* Image Banner - Click to trigger Lightbox */}
                <div
                  onClick={() => handleOpenLightbox(srv)}
                  className="relative aspect-video bg-zinc-100 overflow-hidden cursor-pointer"
                  title="Click to view photos in full-screen gallery"
                >
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
                    <span className="absolute top-3 right-3 bg-zinc-900/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 shadow-xs z-10">
                      {srv.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-zinc-800 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border border-zinc-200 z-10">
                    {srv.category}
                  </span>

                  {/* Multi-image indicator overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950/80 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-xs">
                      <Maximize2 className="w-3 h-3" />
                      <span>View Gallery {srv.images && srv.images.length > 1 ? `(${srv.images.length})` : ''}</span>
                    </span>
                  </div>

                  {srv.images && srv.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-zinc-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md border border-white/20 z-10 shadow-xs">
                      +{srv.images.length - 1} photos
                    </span>
                  )}
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

                    {srv.description && srv.description.length > 5 && (
                      <div className="pt-2 pb-1">
                        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDetailsService({...srv, image: srv.image || srv.images?.[0]}); }} className="text-blue-600 text-[11px] font-bold tracking-wider uppercase hover:text-blue-800 transition-colors cursor-pointer inline-flex items-center bg-blue-50 hover:bg-blue-100 py-1 px-2.5 rounded-md border border-blue-100">
                          Read Full Details
                        </button>
                      </div>
                    )}
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

      {/* High-Fidelity Interactive Lightbox Overlay */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxItem(null)}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between text-white z-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-white truncate">
                  {lightboxItem.name}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  {lightboxItem.category} Â· ${lightboxItem.price} Â· {lightboxItem.duration_minutes || lightboxItem.duration || 30} mins
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxItem(null)}
              className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Image Stage */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-2 sm:my-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Left navigation arrow */}
            {lightboxItem.images && lightboxItem.images.length > 1 && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev =>
                    prev === 0 ? lightboxItem.images.length - 1 : prev - 1
                  );
                }}
                className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
                title="Previous image (Left Arrow)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Scaled Image */}
            <div className="relative max-h-[72vh] max-w-full flex items-center justify-center overflow-hidden rounded-2xl border border-zinc-800/80 bg-black/40 shadow-2xl">
              <img
                src={lightboxItem.images[currentImageIndex] || lightboxItem.images[0]}
                alt={`${lightboxItem.name} photo ${currentImageIndex + 1}`}
                className="max-h-[72vh] max-w-[85vw] sm:max-w-4xl object-contain rounded-xl select-none"
              />
            </div>

            {/* Right navigation arrow */}
            {lightboxItem.images && lightboxItem.images.length > 1 && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setCurrentImageIndex(prev =>
                    prev === lightboxItem.images.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center transition-all cursor-pointer shadow-xl hover:scale-105"
                title="Next image (Right Arrow)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Bar: Thumbnails & Counter */}
          <div
            className="w-full max-w-6xl flex flex-col items-center gap-2.5 z-10"
            onClick={e => e.stopPropagation()}
          >
            {lightboxItem.images && lightboxItem.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto max-w-md py-1 px-2 no-scrollbar">
                {lightboxItem.images.map((img: string, i: number) => (
                  <button
                    key={`${img}-${i}`}
                    type="button"
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      i === currentImageIndex
                        ? 'border-white scale-105 ring-2 ring-white/30'
                        : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-zinc-900/90 border border-white/10 px-3.5 py-1 rounded-full text-xs font-mono text-zinc-300">
              {currentImageIndex + 1} / {lightboxItem.images?.length || 1}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal Overlay */}
      {detailsService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDetailsService(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] relative border border-gray-100" onClick={(e) => e.stopPropagation()}>
            {/* Clean Header Bar */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider rounded-full border border-blue-100">
                  {detailsService.category || "Service Details"}
                </span>
              </div>
              <button onClick={() => setDetailsService(null)} className="bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 p-2 rounded-full transition-all cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            {/* Scrollable Reading Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-white">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{detailsService.name}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-1.5 font-mono font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    <Clock size={16} /> {detailsService.duration_minutes || detailsService.duration || 30} Minutes
                  </div>
                  <div className="font-mono font-bold text-xl text-gray-900">
                    ${detailsService.price}
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Complete Description & Details</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base bg-gray-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
                  {detailsService.description || "Professional appointment session tailored to your schedule."}
                </div>
              </div>
            </div>
            {/* Footer Action */}
            <div className="p-5 sm:p-6 bg-white border-t border-gray-100 shrink-0 flex gap-3">
              <button onClick={() => setDetailsService(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all cursor-pointer">
                Close
              </button>
              <button onClick={() => { setSelectedService(detailsService); setDetailsService(null); }} className="flex-[2] bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl cursor-pointer flex justify-center items-center gap-2">
                Book This Service (${detailsService.price})
              </button>
            </div>
          </div>
        </div>
      )}

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
        Huzada Operations System Â· Protected Platform
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


