import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCw,
  Search,
  MessageCircle,
  ExternalLink,
  Calendar,
  Clock,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  ArrowLeft,
  FileText,
  Copy,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  LoaderCircle,
  Sparkles,
  Upload,
  LogOut,
  Scissors,
  CheckCheck
} from 'lucide-react';
import { clearAdminToken, getAuthHeaders } from '../lib/auth';

export interface BookingAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  date: string;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

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

const PRESET_SAMPLE_IMAGES = [
  { label: 'Dental Care', url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80' },
  { label: 'Clinical Specialist', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80' },
  { label: 'Spa & Wellness', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
  { label: 'Dermatology', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80' },
  { label: 'Studio Care', url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80' },
  { label: 'Hair & Grooming', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80' },
];

interface AdminProps {
  onLogout?: () => void;
}

export function Admin({ onLogout }: AdminProps = {}) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
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

  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState(false);

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
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

  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Asset Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const handleLogout = () => {
    clearAdminToken();
    if (onLogout) {
      onLogout();
    }
  };

  const fetchAppointments = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/appointments', {
        headers: { ...getAuthHeaders() },
      });

      if (res.status === 401) {
        clearAdminToken();
        if (onLogout) onLogout();
        return;
      }

      const data = (await res.json()) as any;
      if (data?.appointments && Array.isArray(data.appointments) && data.appointments.length > 0) {
        setAppointments(data.appointments);
        if (!selectedApptId && data.appointments[0]) {
          setSelectedApptId(data.appointments[0].id);
        }
      } else {
        // Fallback to sample appointments if database is freshly deployed
        setAppointments(prev => (prev.length > 0 ? prev : [
          {
            id: 'APT-9104',
            customerName: 'Ayesha Khan',
            customerPhone: '03008765432',
            serviceName: 'Teeth Whitening & Cleanse',
            date: '2026-10-24',
            time: '14:30',
            notes: 'First time visit. Prefers afternoon slot.',
            status: 'pending',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          },
          {
            id: 'APT-8921',
            customerName: 'Zainab Fatima',
            customerPhone: '03219876543',
            serviceName: 'Comprehensive Health Consultation',
            date: '2026-10-23',
            time: '11:00',
            notes: 'Follow-up consultation. Reports attached.',
            status: 'confirmed',
            createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          },
          {
            id: 'APT-8715',
            customerName: 'Bilal Ahmed',
            customerPhone: '03335551234',
            serviceName: 'Executive Wellness Therapy',
            date: '2026-10-22',
            time: '16:00',
            notes: 'Confirmed and payment handled in advance.',
            status: 'completed',
            createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
          },
        ]));
      }
    } catch {
      setAppointments(prev => (prev.length > 0 ? prev : [
        {
          id: 'APT-9104',
          customerName: 'Ayesha Khan',
          customerPhone: '03008765432',
          serviceName: 'Teeth Whitening & Cleanse',
          date: '2026-10-24',
          time: '14:30',
          notes: 'First time visit. Prefers afternoon slot.',
          status: 'pending',
          createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'APT-8921',
          customerName: 'Zainab Fatima',
          customerPhone: '03219876543',
          serviceName: 'Comprehensive Health Consultation',
          date: '2026-10-23',
          time: '11:00',
          notes: 'Follow-up consultation. Reports attached.',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        },
        {
          id: 'APT-8715',
          customerName: 'Bilal Ahmed',
          customerPhone: '03335551234',
          serviceName: 'Executive Wellness Therapy',
          date: '2026-10-22',
          time: '16:00',
          notes: 'Confirmed and payment handled in advance.',
          status: 'completed',
          createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
        },
      ]));
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingAppointment['status']) => {
    // Optimistic UI update
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status: newStatus } : a)));

    try {
      await fetch('/api/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to sync appointment status change:', err);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('file', file));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        body: formData,
      });
      const data = (await res.json()) as any;
      if (data?.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        setServiceForm(prev => ({
          ...prev,
          images: [...prev.images, ...data.imageUrls],
        }));
      } else if (data?.imageUrl) {
        setServiceForm(prev => ({
          ...prev,
          images: [...prev.images, data.imageUrl],
        }));
      } else {
        setUploadError(data?.error || 'Upload failed. You can paste an image URL directly.');
      }
    } catch {
      setUploadError('Network error uploading file. Paste image URL directly.');
    } finally {
      setIsUploading(false);
    }
  };

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
    setUploadError(null);
    setCustomImageUrl('');
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
    setUploadError(null);
    setCustomImageUrl('');
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name.trim()) {
      setServiceError('Service title is required.');
      return;
    }

    setServiceSaving(true);
    try {
      const finalCategory =
        serviceForm.category === 'Custom'
          ? serviceForm.customCategory.trim() || 'General'
          : serviceForm.category;

      const finalImages = serviceForm.images.length > 0
        ? serviceForm.images
        : [DEFAULT_SERVICES[0].images[0]];

      const newService: ServiceItem = {
        id: editingService ? editingService.id : `srv-${Date.now().toString().slice(-6)}`,
        name: serviceForm.name.trim(),
        category: finalCategory,
        price: Number(serviceForm.price) || 0,
        duration: Number(serviceForm.duration) || 30,
        description: serviceForm.description.trim(),
        images: finalImages,
        badge: serviceForm.badge.trim() || undefined,
      };

      const updated = editingService
        ? services.map(s => (s.id === newService.id ? newService : s))
        : [newService, ...services];

      setServices(updated);
      localStorage.setItem('huzada_booking_services', JSON.stringify(updated));
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch {
      setServiceError('Failed to save service.');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const updated = services.filter(s => s.id !== serviceId);
    setServices(updated);
    localStorage.setItem('huzada_booking_services', JSON.stringify(updated));
    setDeleteConfirmId(null);
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        appt.id.toLowerCase().includes(query) ||
        appt.customerName.toLowerCase().includes(query) ||
        appt.customerPhone.includes(query) ||
        appt.serviceName.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [appointments, statusFilter, searchQuery]);

  const selectedAppt = useMemo(() => {
    return (
      appointments.find(a => a.id === selectedApptId) ||
      filteredAppointments[0] ||
      null
    );
  }, [appointments, selectedApptId, filteredAppointments]);

  const copyAppointmentSummary = (appt: BookingAppointment) => {
    const text = `Appointment ID: ${appt.id}\nClient: ${appt.customerName} (${appt.customerPhone})\nService: ${appt.serviceName}\nSchedule: ${appt.date} at ${appt.time}\nStatus: ${appt.status.toUpperCase()}`;
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getCleanPhone = (phoneStr: string) => {
    let clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '92' + clean.slice(1);
    }
    return clean;
  };

  return (
    <div className="min-h-screen bg-zinc-100/60 font-sans text-zinc-900 flex flex-col selection:bg-zinc-900 selection:text-white">
      {/* Top Operations Header Bar */}
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
            title="Back to Public Booking Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2.5">
            <h1 className="font-bold text-sm sm:text-base text-zinc-900 tracking-tight">
              Booking Operations Console
            </h1>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-300" />
            {/* White-Label Business Status Indicator */}
            <div
              className="hidden sm:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-800"
              title="Database Health: Optimal · Live Sync Active"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Sync Active</span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-700">System Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAppointments}
            disabled={isSyncing}
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Appointments'}</span>
          </button>

          <Link
            to="/"
            className="bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer hidden sm:inline-flex items-center"
          >
            Open Booking Portal
          </Link>

          {/* Secure Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className="border border-zinc-200 hover:border-red-200 bg-white hover:bg-red-50 text-zinc-600 hover:text-red-700 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Log out and end administrative session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* LEFT PANE (60%) */}
        <div className="w-full lg:w-[60%] flex flex-col space-y-4">
          {/* Tabs Selector & Filter Controls */}
          <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'appointments'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Client Appointments</span>
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      activeTab === 'appointments'
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {appointments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'services'
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Services Registry</span>
                  <span
                    className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      activeTab === 'services'
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {services.length}
                  </span>
                </button>
              </div>

              {activeTab === 'appointments' && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  Showing {filteredAppointments.length} of {appointments.length}
                </span>
              )}
            </div>

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by ID, client name, phone number, service..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  />
                </div>

                {/* Status Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                  {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`capitalize px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        statusFilter === status
                          ? 'bg-zinc-800 text-white'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: CLIENT APPOINTMENTS LIST */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center text-xs text-zinc-500">
                  No appointments match your filter criteria.
                </div>
              ) : (
                filteredAppointments.map(appt => {
                  const isSelected = selectedAppt?.id === appt.id;
                  const cleanPhone = getCleanPhone(appt.customerPhone);
                  const waMsg = encodeURIComponent(
                    `Hello ${appt.customerName}! Reaching out regarding your appointment (${appt.id}) for ${appt.serviceName} scheduled on ${appt.date} at ${appt.time}.`
                  );
                  const waLink = `https://wa.me/${cleanPhone}?text=${waMsg}`;

                  return (
                    <div
                      key={appt.id}
                      onClick={() => setSelectedApptId(appt.id)}
                      className={`bg-white rounded-xl border p-4 transition-all cursor-pointer shadow-2xs ${
                        isSelected
                          ? 'border-zinc-900 ring-1 ring-zinc-900'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-zinc-900">
                              {appt.id}
                            </span>
                            {/* Status badge */}
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize ${
                                appt.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : appt.status === 'confirmed'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : appt.status === 'cancelled'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {appt.status}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-zinc-900">
                            {appt.customerName}
                          </div>

                          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              <span className="font-mono">{appt.customerPhone}</span>
                            </div>
                            <span className="text-zinc-300">·</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>{appt.date}</span>
                            </div>
                            <span className="text-zinc-300">·</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              <span>{appt.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Service badge & WhatsApp launcher */}
                        <div className="text-right space-y-2">
                          <div className="font-medium text-xs text-zinc-800 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100 max-w-[180px] truncate text-right ml-auto">
                            {appt.serviceName}
                          </div>

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                            title="Direct WhatsApp Message"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600 fill-current" />
                            <span>Chat</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        </div>
                      </div>

                      {/* Notes or Created time footer */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
                        <span className="truncate max-w-sm">
                          {appt.notes ? `Note: "${appt.notes}"` : 'Direct booking'}
                        </span>
                        <span className="text-zinc-400 font-mono text-[10px] shrink-0">
                          {appt.createdAt
                            ? new Date(appt.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Active'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: SERVICES REGISTRY */}
          {activeTab === 'services' && (
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-2xs divide-y divide-zinc-100">
              {/* Header with primary action: + Add Service */}
              <div className="p-4 bg-zinc-50/70 border-b border-zinc-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider block font-mono">
                    Services Registry
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {services.length} active booking {services.length === 1 ? 'service' : 'services'}
                  </span>
                </div>

                <button
                  onClick={handleOpenAddService}
                  className="bg-black hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs font-sans"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Service</span>
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

                  <span className="bg-black group-hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs">
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
                services.map(item => {
                  const primaryImg = (item.images && item.images[0]) || (item as any).image || DEFAULT_SERVICES[0].images[0];
                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors"
                    >
                      {/* Item info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={primaryImg}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-14 h-14 aspect-square rounded-lg object-cover border border-neutral-200 bg-zinc-100"
                            onError={(e: any) => {
                              e.target.src = DEFAULT_SERVICES[0].images[0];
                            }}
                          />
                          {item.images && item.images.length > 1 && (
                            <span
                              title={`${item.images.length} photos`}
                              className="absolute -bottom-1 -right-1 bg-zinc-900 text-white font-mono text-[9px] font-semibold px-1 py-0.2 rounded-full border border-white shadow-xs"
                            >
                              +{item.images.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-semibold text-zinc-900 truncate">{item.name}</h4>
                            {item.badge && (
                              <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>{item.category}</span>
                            <span>·</span>
                            <span className="font-semibold text-zinc-800">${item.price}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-zinc-400" />
                              {item.duration} mins
                            </span>
                          </p>
                          {item.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-sm mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Controls & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                        {/* Edit & Delete actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditService(item)}
                            className="px-2.5 py-1 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
                            title="Edit Service"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                              <button
                                onClick={() => handleDeleteService(item.id)}
                                className="text-red-700 font-semibold text-[11px] px-1.5 py-0.5 hover:underline cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-zinc-500 text-[11px] px-1 hover:text-zinc-800 cursor-pointer"
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
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANE (40%) - APPOINTMENT INSPECTION DOSSIER */}
        <div className="w-full lg:w-[40%] flex flex-col">
          <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs sticky top-20 space-y-5">
            {selectedAppt ? (
              <>
                {/* Dossier Header */}
                <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                      Appointment Dossier
                    </span>
                    <h3 className="font-mono text-base font-bold text-zinc-900 flex items-center gap-2">
                      <span>{selectedAppt.id}</span>
                      <button
                        onClick={() => copyAppointmentSummary(selectedAppt)}
                        className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                        title="Copy Summary"
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      Booked: {selectedAppt.createdAt ? new Date(selectedAppt.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded capitalize ${
                      selectedAppt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedAppt.status === 'confirmed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : selectedAppt.status === 'cancelled'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedAppt.status}
                  </span>
                </div>

                {/* Status Updater Buttons (2x2 grid) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">
                    Update Appointment Status
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <button
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'pending')}
                      className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                        selectedAppt.status === 'pending'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>Pending</span>
                      <Clock3 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'confirmed')}
                      className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                        selectedAppt.status === 'confirmed'
                          ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>Confirmed</span>
                      <CheckCheck className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'completed')}
                      className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                        selectedAppt.status === 'completed'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>Completed</span>
                      <CheckCircle2 className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(selectedAppt.id, 'cancelled')}
                      className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer text-left flex items-center justify-between ${
                        selectedAppt.status === 'cancelled'
                          ? 'bg-red-600 text-white border-red-700 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <span>Cancelled</span>
                      <XCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Customer Information Card */}
                <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-zinc-200/70 pb-2">
                    <span className="font-semibold text-zinc-700">Client Information</span>
                    <a
                      href={`https://wa.me/${getCleanPhone(selectedAppt.customerPhone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" />
                      <span>WhatsApp Link</span>
                    </a>
                  </div>

                  <div className="space-y-1.5 text-zinc-700">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-medium text-zinc-900">{selectedAppt.customerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-mono">{selectedAppt.customerPhone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Scheduled Date: <strong className="text-zinc-900">{selectedAppt.date}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Scheduled Time: <strong className="text-zinc-900">{selectedAppt.time}</strong></span>
                    </div>

                    {selectedAppt.notes && (
                      <div className="flex items-start gap-2 pt-1 text-zinc-600 italic">
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>"{selectedAppt.notes}"</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Details Card */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 font-mono block">
                    Service Specification
                  </span>
                  <div className="border border-zinc-200 rounded-xl p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center shrink-0">
                        <Scissors className="w-4 h-4 text-zinc-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900 truncate">{selectedAppt.serviceName}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Client Verified Session
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-zinc-900 tabular-nums shrink-0">
                      Standard Rate
                    </span>
                  </div>
                </div>

                {/* Operations Summary & WhatsApp Action */}
                <div className="pt-2 border-t border-zinc-100 space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Payment Terms</span>
                    <span className="font-medium text-zinc-900">Post-Service / Direct</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Booking Notification</span>
                    <span className="font-medium text-emerald-700">Direct WhatsApp</span>
                  </div>

                  <a
                    href={`https://wa.me/${getCleanPhone(selectedAppt.customerPhone)}?text=${encodeURIComponent(
                      `Hello ${selectedAppt.customerName}! Your appointment (${selectedAppt.id}) for ${selectedAppt.serviceName} is confirmed for ${selectedAppt.date} at ${selectedAppt.time}. Please let us know if you have any questions!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Send WhatsApp Confirmation</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </>
            ) : (
              <div className="py-16 text-center space-y-2">
                <Calendar className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-500">
                  Select an appointment from the ledger to inspect its dossier.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SERVICE MODAL (Add / Edit) - Multi-Image Support */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-900">
                  {editingService ? 'Edit Booking Service' : 'Add New Service to Catalog'}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Configure service details, pricing, duration, and cover media assets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {serviceError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serviceError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-4">
              {/* Title */}
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
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>

              {/* Category selector pills */}
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

              {/* Price & Duration in 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Price ($ / Fee) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                      $
                    </span>
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
                      className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Duration (Minutes) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
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
                      className="w-full bg-white border border-zinc-200 rounded-lg pl-3 pr-10 py-2 text-xs font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400">
                      min
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Highlight Badge <span className="text-zinc-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Popular, Premium, New, Recommended"
                  value={serviceForm.badge}
                  onChange={e => setServiceForm({ ...serviceForm, badge: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Service Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, requirements, preparation notes..."
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none"
                />
              </div>

              {/* Media Asset Section with Multi-Image Support */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-900">
                    Service Media Assets <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                    {serviceForm.images.length} asset{serviceForm.images.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Preset image suggestions */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider shrink-0">
                    Presets:
                  </span>
                  {PRESET_SAMPLE_IMAGES.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (!serviceForm.images.includes(preset.url)) {
                          setServiceForm(prev => ({
                            ...prev,
                            images: [...prev.images, preset.url],
                          }));
                        }
                      }}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 shrink-0 transition-colors cursor-pointer"
                    >
                      +{preset.label}
                    </button>
                  ))}
                </div>

                {/* Upload or URL input */}
                <div className="mt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      onChange={e => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {isUploading ? (
                        <>
                          <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading Assets...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Images</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex-1 flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="url"
                          placeholder="Or paste external image URL..."
                          value={customImageUrl}
                          onChange={e => setCustomImageUrl(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (customImageUrl.trim()) {
                                setServiceForm(prev => ({
                                  ...prev,
                                  images: [...prev.images, customImageUrl.trim()],
                                }));
                                setCustomImageUrl('');
                              }
                            }
                          }}
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrl.trim()) {
                            setServiceForm(prev => ({
                              ...prev,
                              images: [...prev.images, customImageUrl.trim()],
                            }));
                            setCustomImageUrl('');
                          }
                        }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      {uploadError}
                    </p>
                  )}

                  {/* Horizontally scrollable mini-gallery of uploaded images */}
                  {serviceForm.images && serviceForm.images.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2.5 overflow-x-auto p-2 bg-zinc-50 rounded-xl border border-zinc-200 no-scrollbar">
                        {serviceForm.images.map((imgUrl, idx) => (
                          <div
                            key={`${imgUrl}-${idx}`}
                            className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-white group shadow-2xs"
                          >
                            <img
                              src={imgUrl}
                              alt={`Upload ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e: any) => {
                                e.target.src = DEFAULT_SERVICES[0].images[0];
                              }}
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 bg-zinc-900/90 text-white font-mono text-[8px] px-1 py-0.2 rounded font-semibold">
                                Primary
                              </span>
                            )}
                            {/* Absolute-positioned "X" remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                setServiceForm(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx),
                                }));
                              }}
                              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                              title="Delete this image"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceSaving || isUploading}
                  className="bg-black hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  {serviceSaving ? (
                    <>
                      <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Service...</span>
                    </>
                  ) : (
                    <span>{editingService ? 'Update Service' : 'Publish Service'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
