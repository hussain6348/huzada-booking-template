import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCw, Search, Clock, Phone, User, CheckCircle2,
  AlertCircle, Clock3, XCircle, ArrowLeft, FileText,
  Copy, Check, Plus, Minus, Trash2, X, LoaderCircle,
  Upload, LogOut, Calendar, Scissors
} from 'lucide-react';
import { clearAdminToken, getAuthHeaders } from '../lib/auth';

export interface BookingAppointment {
  id: string; customerName: string; customerPhone: string;
  serviceName: string; date: string; time: string; notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'; createdAt: string;
}

export interface ServiceItem {
  id: string; name: string; category: string; price: number;
  duration: number; description: string; image: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'srv-1', name: 'Teeth Whitening & Cleanse', category: 'Dental', price: 85, duration: 45, description: 'Complete ultrasonic plaque removal.', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80' }
];

export function Admin({ onLogout }: { onLogout?: () => void }) {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services'>('appointments');
  const [appointments, setAppointments] = useState<BookingAppointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try { const saved = localStorage.getItem('huzada_booking_services'); return saved ? JSON.parse(saved) : DEFAULT_SERVICES; } catch { return DEFAULT_SERVICES; }
  });

  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceItem>({
    id: '', name: '', category: 'Standard', price: 50, duration: 30, description: '',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAppointments = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/appointments', { headers: { ...getAuthHeaders() } });
      if (res.status === 401) { clearAdminToken(); if (onLogout) onLogout(); return; }
      const data = await res.json() as any;
      if (data?.appointments && Array.isArray(data.appointments)) {
        setAppointments(data.appointments);
        if (!selectedApptId && data.appointments[0]) setSelectedApptId(data.appointments[0].id);
      }
    } catch {} finally { setIsSyncing(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: BookingAppointment['status']) => {
    try { await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify({ id, status: newStatus }) }); } catch {}
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData(); formData.append('file', files[0]);
    try {
      const res = await fetch('/api/upload', { method: 'POST', headers: { ...getAuthHeaders() }, body: formData });
      const data = await res.json() as any;
      if (data?.imageUrl) setServiceForm(prev => ({ ...prev, image: data.imageUrl }));
    } catch {} finally { setIsUploading(false); }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    const newService = { ...serviceForm, id: serviceForm.id || `srv-${Date.now().toString().slice(-6)}` };
    const updated = [newService, ...services.filter(s => s.id !== newService.id)];
    setServices(updated); localStorage.setItem('huzada_booking_services', JSON.stringify(updated)); setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    setServices(updated); localStorage.setItem('huzada_booking_services', JSON.stringify(updated));
  };

  const filteredAppointments = useMemo(() => appointments.filter(a => (statusFilter === 'all' || a.status === statusFilter) && (a.id.toLowerCase().includes(searchQuery.toLowerCase()) || a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || a.customerPhone.includes(searchQuery))), [appointments, statusFilter, searchQuery]);
  const selectedAppt = useMemo(() => appointments.find(a => a.id === selectedApptId) || filteredAppointments[0] || null, [appointments, selectedApptId, filteredAppointments]);

  return (
    <div className="min-h-screen bg-zinc-100/60 font-sans text-zinc-900 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg border border-zinc-200 hover:text-zinc-900"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="font-bold text-sm sm:text-base">Operations Console</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={fetchAppointments} className="bg-zinc-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"><RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} /><span>Sync</span></button>
          <button onClick={() => { clearAdminToken(); if (onLogout) onLogout(); }} className="border bg-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"><LogOut className="w-3.5 h-3.5" /><span>Logout</span></button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[60%] flex flex-col space-y-4">
          <div className="bg-white rounded-xl border p-4 shadow-2xs space-y-3.5">
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('appointments')} className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${activeTab === 'appointments' ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}><Calendar className="w-3.5 h-3.5" />Appointments</button>
              <button onClick={() => setActiveTab('services')} className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${activeTab === 'services' ? 'bg-zinc-900 text-white' : 'bg-zinc-100'}`}><Scissors className="w-3.5 h-3.5" />Services</button>
            </div>
          </div>

          {activeTab === 'appointments' ? (
            <div className="space-y-3">
              {filteredAppointments.map(appt => (
                <div key={appt.id} onClick={() => setSelectedApptId(appt.id)} className={`bg-white rounded-xl border p-4 cursor-pointer ${selectedAppt?.id === appt.id ? 'border-zinc-900 ring-1' : ''}`}>
                  <div className="flex justify-between">
                    <div><div className="font-bold text-xs">{appt.id}</div><div className="text-xs">{appt.customerName}</div></div>
                    <div className="text-right text-xs font-semibold">{appt.serviceName}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border divide-y">
              <div className="p-4 flex justify-between"><span className="text-xs font-bold uppercase">Services</span><button onClick={() => setIsServiceModalOpen(true)} className="bg-black text-white text-xs px-3 py-1.5 rounded flex items-center gap-1"><Plus className="w-3 h-3"/>Add</button></div>
              {services.map(srv => (
                <div key={srv.id} className="p-4 flex justify-between items-center"><div className="flex gap-3"><img src={srv.image} className="w-10 h-10 rounded object-cover" /><div><div className="text-xs font-bold">{srv.name}</div><div className="text-[10px] text-zinc-500">${srv.price}</div></div></div><button onClick={() => handleDeleteService(srv.id)}><Trash2 className="w-4 h-4 text-red-500"/></button></div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[40%]">
          <div className="bg-white rounded-xl border p-5 shadow-2xs space-y-4">
            {selectedAppt ? (
              <>
                <div><h3 className="font-bold">{selectedAppt.id}</h3><span className="text-xs text-zinc-500">{selectedAppt.status}</span></div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button onClick={() => handleUpdateStatus(selectedAppt.id, 'confirmed')} className="border p-1.5 rounded">Confirmed</button>
                  <button onClick={() => handleUpdateStatus(selectedAppt.id, 'completed')} className="border p-1.5 rounded">Completed</button>
                </div>
                <div className="bg-zinc-50 p-3 rounded border text-xs space-y-1">
                  <div>Name: {selectedAppt.customerName}</div>
                  <div>Phone: {selectedAppt.customerPhone}</div>
                  <div>Service: {selectedAppt.serviceName}</div>
                  <div>Time: {selectedAppt.date} {selectedAppt.time}</div>
                </div>
              </>
            ) : <div className="text-center text-xs text-zinc-500">Select appointment</div>}
          </div>
        </div>
      </div>

      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-sm">Add Service</h3>
            <form onSubmit={handleSaveService} className="space-y-3">
              <input required type="text" value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} placeholder="Title" className="w-full border p-2 text-xs rounded" />
              <input required type="number" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: Number(e.target.value)})} placeholder="Price" className="w-full border p-2 text-xs rounded" />
              <input type="file" onChange={e => handleFileUpload(e.target.files)} className="w-full text-xs" />
              <div className="flex gap-2 justify-end"><button type="button" onClick={() => setIsServiceModalOpen(false)} className="text-xs border px-3 py-1.5 rounded">Cancel</button><button type="submit" className="text-xs bg-black text-white px-3 py-1.5 rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Admin;
