import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  ChevronRight,
  User,
  FileText,
  Check,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export interface AdminAppointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  email?: string;
  special_requests?: string;
  created_at?: string;
  deposit_amount?: number;
}

export interface AdminService {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  active: boolean;
}

const INITIAL_SERVICES: AdminService[] = [
  {
    id: 'bespoke-tailoring',
    name: 'The Grand Bespoke Consultation',
    category: 'Bespoke Tailoring',
    duration: '90 Min',
    price: 450,
    description: 'One-on-one anatomical assessment across our 1,400-cloth archive.',
    active: true
  },
  {
    id: 'haute-horology',
    name: 'Private Horology Restoration Session',
    category: 'Haute Horology',
    duration: '120 Min',
    price: 620,
    description: 'Movement diagnostics and historical provenance verification.',
    active: true
  },
  {
    id: 'private-aromatics',
    name: 'Sensory Atelier & Olfactory Creation',
    category: 'Private Aromatics',
    duration: '60 Min',
    price: 380,
    description: 'Personalized nose formulation extracted from certified Grasse absolutes.',
    active: true
  }
];

const MOCK_APPOINTMENTS: AdminAppointment[] = [
  {
    id: 'APT-1791297667417',
    patient_name: 'Julian Vance',
    patient_phone: '+1 (555) 019-2834',
    service_type: 'Private Horology Restoration Session',
    appointment_date: '2026-10-14',
    appointment_time: '01:30 PM',
    status: 'confirmed',
    email: 'julian.vance@residence.com',
    special_requests: '1968 Patek Philippe Calatrava reference 3520 provenance documentation review.',
    created_at: '2026-10-06T14:41:00Z',
    deposit_amount: 620
  },
  {
    id: 'APT-1791298451020',
    patient_name: 'Elena Rostova',
    patient_phone: '+1 (555) 024-8891',
    service_type: 'The Grand Bespoke Consultation',
    appointment_date: '2026-10-15',
    appointment_time: '11:00 AM',
    status: 'pending',
    email: 'e.rostova@ateliervip.com',
    special_requests: 'Dormeuil Vanquish II superfine cloth swatches required in private suite.',
    created_at: '2026-10-07T08:15:00Z',
    deposit_amount: 450
  },
  {
    id: 'APT-1791299104523',
    patient_name: 'Marcus Sterling',
    patient_phone: '+1 (555) 039-1122',
    service_type: 'Sensory Atelier & Olfactory Creation',
    appointment_date: '2026-10-16',
    appointment_time: '04:30 PM',
    status: 'confirmed',
    email: 'm.sterling@capitalholdings.com',
    special_requests: 'Focus on vetiver and rare orris butter tinctures.',
    created_at: '2026-10-07T09:30:00Z',
    deposit_amount: 380
  },
  {
    id: 'APT-1791299982144',
    patient_name: 'Claire Dupont',
    patient_phone: '+1 (555) 041-9933',
    service_type: 'The Grand Bespoke Consultation',
    appointment_date: '2026-10-18',
    appointment_time: '09:30 AM',
    status: 'pending',
    email: 'claire.dupont@parisienne.fr',
    special_requests: 'Double-breasted smoking jacket pattern draughting.',
    created_at: '2026-10-07T10:10:00Z',
    deposit_amount: 450
  },
  {
    id: 'APT-1791296541209',
    patient_name: 'David Chen',
    patient_phone: '+1 (555) 088-7744',
    service_type: 'Private Horology Restoration Session',
    appointment_date: '2026-10-10',
    appointment_time: '06:00 PM',
    status: 'cancelled',
    email: 'd.chen@apextechnologies.io',
    special_requests: 'Client requested reschedule due to international travel.',
    created_at: '2026-10-05T12:00:00Z',
    deposit_amount: 620
  }
];

export function Admin() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<AdminAppointment[]>(MOCK_APPOINTMENTS);
  const [selectedAppointment, setSelectedAppointment] = useState<AdminAppointment | null>(MOCK_APPOINTMENTS[0]);
  const [services, setServices] = useState<AdminService[]>(INITIAL_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const newServiceNameId = useId();
  const newServiceCategoryId = useId();
  const newServicePriceId = useId();
  const newServiceDurationId = useId();
  const newServiceDescriptionId = useId();

  // New Service form state
  const [newService, setNewService] = useState({
    name: '',
    category: 'Bespoke Tailoring',
    duration: '60 Min',
    price: 350,
    description: ''
  });

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data: any = await res.json();
        // Support Turso pipeline format data.results[0].response.result.rows or direct array
        const rows = data?.results?.[0]?.response?.result?.rows || data?.rows || data?.appointments;
        if (Array.isArray(rows) && rows.length > 0) {
          const parsed: AdminAppointment[] = rows.map((r: any, idx: number) => ({
            id: r.id || `APT-${idx + 1}`,
            patient_name: r.patient_name || r.client_name || 'Private Client',
            patient_phone: r.patient_phone || r.client_phone || '+1 555-0100',
            service_type: r.service_type || 'Bespoke Consultation',
            appointment_date: r.appointment_date || r.date || '2026-10-14',
            appointment_time: r.appointment_time || r.time || '11:00 AM',
            status: (r.status as any) || 'pending',
            email: r.email || '',
            special_requests: r.special_requests || r.notes || '',
            created_at: r.created_at || new Date().toISOString(),
            deposit_amount: r.deposit_amount || 450
          }));
          setAppointments(parsed);
          setSelectedAppointment(parsed[0]);
        }
      }
    } catch {
      // Fallback cleanly to mock appointments
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: 'confirmed' | 'pending' | 'cancelled') => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
    );
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleToggleService = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim()) return;

    const created: AdminService = {
      id: `svc-${Date.now()}`,
      name: newService.name.trim(),
      category: newService.category,
      duration: newService.duration,
      price: Number(newService.price) || 350,
      description: newService.description.trim(),
      active: true
    };

    setServices((prev) => [created, ...prev]);
    setIsAddServiceOpen(false);
    setNewService({
      name: '',
      category: 'Bespoke Tailoring',
      duration: '60 Min',
      price: 350,
      description: ''
    });
  };

  const filteredAppointments = appointments.filter((app) => {
    const matchesSearch =
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      app.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Operational Metrics
  const totalBookings = appointments.length;
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const totalEstimatedRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.deposit_amount || 450), 0);

  return (
    <div className="min-h-screen bg-zinc-100/50 flex flex-col font-sans text-zinc-900 selection:bg-black selection:text-white">
      {/* ======================================================== */}
      {/* 1. HEADER BAR                                            */}
      {/* ======================================================== */}
      <header className="bg-white border-b border-zinc-200/90 px-6 py-4 sticky top-0 z-30 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-black bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Booking Engine</span>
            </Link>

            <div className="h-4 w-px bg-zinc-200" />

            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-zinc-950 tracking-tight">
                Operations Console
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloudflare Pages + Turso
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAppointments}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Syncing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. SPLIT-SCREEN MAIN CONTAINER                           */}
      {/* ======================================================== */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-zinc-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col lg:flex-row min-h-[750px]">
          {/* ==================================================== */}
          {/* LEFT PANE: 60% WIDTH (TABS, LISTS, CONTROLS)        */}
          {/* ==================================================== */}
          <div className="lg:w-[60%] flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-200/80 bg-white">
            {/* Tab Controls Bar */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 px-6 py-3.5 bg-zinc-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'appointments'
                      ? 'bg-black text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Appointments</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === 'appointments'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {appointments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'services'
                      ? 'bg-black text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Service Offerings</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      activeTab === 'services'
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {services.length}
                  </span>
                </button>
              </div>

              {activeTab === 'services' && (
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Service</span>
                </button>
              )}
            </div>

            {/* TAB 1: APPOINTMENTS VIEW */}
            {activeTab === 'appointments' ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Search & Status Filters */}
                <div className="p-4 sm:p-5 border-b border-zinc-100 space-y-3 bg-white shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search client, phone, or service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((st) => {
                      const isActive = statusFilter === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatusFilter(st)}
                          className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                            isActive
                              ? 'bg-zinc-900 text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          {st === 'all' ? 'All Status' : st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Appointments List */}
                <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
                  {filteredAppointments.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 space-y-2">
                      <p className="text-sm font-semibold text-zinc-800">
                        No appointments found
                      </p>
                      <p className="text-xs">
                        Try adjusting your search criteria or status filter.
                      </p>
                    </div>
                  ) : (
                    filteredAppointments.map((app) => {
                      const isSelected = selectedAppointment?.id === app.id;
                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedAppointment(app)}
                          className={`p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isSelected
                              ? 'bg-zinc-100/70 border-l-4 border-l-black'
                              : 'hover:bg-zinc-50/70 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-zinc-950">
                                {app.patient_name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                  app.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                                    : app.status === 'pending'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                    : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                                }`}
                              >
                                {app.status}
                              </span>
                              <span className="text-[11px] font-mono text-zinc-400">
                                {app.id}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-600 truncate font-medium">
                              {app.service_type}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                {app.appointment_date}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-semibold text-zinc-700">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                {app.appointment_time}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions Row */}
                          <div
                            className="flex items-center gap-1.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.status !== 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                                className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200/70 transition-colors"
                                title="Mark Confirmed"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {app.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                                className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200/70 transition-colors"
                                title="Mark Cancelled"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <a
                              href={`https://wa.me/${app.patient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${app.patient_name}, this is Atelier Concierge regarding your reservation ${app.id} on ${app.appointment_date} at ${app.appointment_time}.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-2xs"
                              title="Chat on WhatsApp"
                            >
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: SERVICE OFFERINGS VIEW */
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-950">Active Service Catalog</h3>
                    <p className="text-xs text-zinc-500">
                      Enable or disable services from the public client booking flow.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {services.map((svc) => (
                    <div
                      key={svc.id}
                      className="p-4 sm:p-5 rounded-xl border border-zinc-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-zinc-950">{svc.name}</h4>
                          <span className="text-[11px] font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                            {svc.duration}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
                          {svc.description}
                        </p>
                        <p className="text-xs font-bold text-zinc-900">${svc.price}</p>
                      </div>

                      {/* Active Toggle Switch */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-zinc-500 font-medium">
                          {svc.active ? 'Available' : 'Disabled'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleService(svc.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            svc.active ? 'bg-black' : 'bg-zinc-200'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              svc.active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* RIGHT PANE: 40% WIDTH (DETAILED INSPECTION FOLIO)   */}
          {/* ==================================================== */}
          <div className="lg:w-[40%] bg-zinc-50/70 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shrink-0">
            {selectedAppointment ? (
              <div className="space-y-6">
                {/* Dossier Header */}
                <div className="border-b border-zinc-200/80 pb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded">
                      {selectedAppointment.id}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-zinc-950 mt-1.5">
                      {selectedAppointment.patient_name}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Private Appointment Dossier
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                      selectedAppointment.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedAppointment.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>

                {/* Service Details Card */}
                <div className="bg-white border border-zinc-200/90 rounded-xl p-4.5 space-y-3 shadow-2xs text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                    Session &amp; Schedule
                  </span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Service Offering</span>
                      <span className="font-semibold text-zinc-950 text-right">
                        {selectedAppointment.service_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date</span>
                      <span className="font-medium text-zinc-900">
                        {selectedAppointment.appointment_date}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Time Window</span>
                      <span className="font-bold text-zinc-950">
                        {selectedAppointment.appointment_time} EST
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Suite</span>
                      <span className="font-medium text-zinc-900">
                        Private Suite 401 (Madison Ave)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Contact Info */}
                <div className="bg-white border border-zinc-200/90 rounded-xl p-4.5 space-y-3 shadow-2xs text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                    Contact Credentials
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-400" />
                        Phone
                      </span>
                      <span className="font-mono font-medium text-zinc-900">
                        {selectedAppointment.patient_phone}
                      </span>
                    </div>
                    {selectedAppointment.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          Email
                        </span>
                        <a
                          href={`mailto:${selectedAppointment.email}`}
                          className="text-zinc-900 underline underline-offset-2 hover:text-black"
                        >
                          {selectedAppointment.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requests / Provenance Notes */}
                <div className="bg-white border border-zinc-200/90 rounded-xl p-4.5 space-y-2 shadow-2xs text-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                    Special Requests &amp; Notes
                  </span>
                  <p className="text-zinc-700 leading-relaxed italic bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                    "{selectedAppointment.special_requests || 'No specific requests recorded.'}"
                  </p>
                </div>

                {/* Pricing & Deposit */}
                <div className="bg-white border border-zinc-200/90 rounded-xl p-4.5 flex items-baseline justify-between shadow-2xs text-xs">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
                      Total Deposit
                    </span>
                    <span className="text-zinc-400 text-[11px]">Logged at booking</span>
                  </div>
                  <span className="text-2xl font-extrabold text-zinc-950">
                    ${selectedAppointment.deposit_amount || 450}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={`https://wa.me/${selectedAppointment.patient_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${selectedAppointment.patient_name}, confirming your appointment ${selectedAppointment.id} with Atelier Concierge for ${selectedAppointment.appointment_date} at ${selectedAppointment.appointment_time}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-black hover:bg-zinc-800 text-white py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Open WhatsApp Folio</span>
                    <ExternalLink className="w-3 h-3 ml-1 text-zinc-400" />
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                      disabled={selectedAppointment.status === 'confirmed'}
                      className="w-full bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                      disabled={selectedAppointment.status === 'cancelled'}
                      className="w-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* EMPTY SELECTION STATE (OPERATIONAL METRICS) */
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    System Overview
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-zinc-950 mt-1">
                    Operational Metrics
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Select an appointment from the left pane to inspect its complete dossier.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white border border-zinc-200/90 rounded-xl p-4 space-y-1 shadow-2xs">
                    <span className="text-zinc-500 block font-medium">Total Bookings</span>
                    <span className="text-2xl font-bold text-zinc-950">{totalBookings}</span>
                  </div>
                  <div className="bg-white border border-zinc-200/90 rounded-xl p-4 space-y-1 shadow-2xs">
                    <span className="text-zinc-500 block font-medium">Confirmed</span>
                    <span className="text-2xl font-bold text-emerald-600">{confirmedCount}</span>
                  </div>
                  <div className="bg-white border border-zinc-200/90 rounded-xl p-4 space-y-1 shadow-2xs">
                    <span className="text-zinc-500 block font-medium">Pending Review</span>
                    <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
                  </div>
                  <div className="bg-white border border-zinc-200/90 rounded-xl p-4 space-y-1 shadow-2xs">
                    <span className="text-zinc-500 block font-medium">Est. Revenue</span>
                    <span className="text-2xl font-bold text-zinc-950">${totalEstimatedRevenue}</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/90 rounded-xl p-5 space-y-2 text-xs text-zinc-600 shadow-2xs">
                  <span className="font-semibold text-zinc-900 block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Cloudflare Edge Health: Optimal
                  </span>
                  <p className="leading-relaxed">
                    Serverless API endpoints are responding normally. New appointments logged in the public flow will appear dynamically.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. ADD SERVICE MODAL                                     */}
      {/* ======================================================== */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl border border-zinc-200 relative">
            <button
              type="button"
              onClick={() => setIsAddServiceOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-black rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-zinc-950">Add Service Offering</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Configure a new consultation option for the booking engine.
              </p>
            </div>

            <form onSubmit={handleAddService} className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor={newServiceNameId}
                  className="block font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                >
                  Service Name *
                </label>
                <input
                  id={newServiceNameId}
                  type="text"
                  required
                  placeholder="e.g. VIP Leather Restoration"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor={newServiceCategoryId}
                    className="block font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    id={newServiceCategoryId}
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black"
                  >
                    <option>Bespoke Tailoring</option>
                    <option>Haute Horology</option>
                    <option>Private Aromatics</option>
                    <option>Leather Restoration</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={newServicePriceId}
                    className="block font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Deposit Price ($)
                  </label>
                  <input
                    id={newServicePriceId}
                    type="number"
                    required
                    min={0}
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor={newServiceDurationId}
                  className="block font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                >
                  Duration Window
                </label>
                <input
                  id={newServiceDurationId}
                  type="text"
                  placeholder="e.g. 90 Min"
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label
                  htmlFor={newServiceDescriptionId}
                  className="block font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id={newServiceDescriptionId}
                  rows={2}
                  placeholder="Summary of what the client receives..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-black resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddServiceOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-zinc-800 transition-colors shadow-2xs"
                >
                  Add Offering
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
