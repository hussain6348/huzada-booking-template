import React, { useState } from "react";
import { Calendar, Clock, User, Phone } from "lucide-react";

export default function BookingForm({ service }: { service: any }) {
  const [formData, setFormData] = useState({ name: "", phone: "", date: "", time: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service.id,
          service_name: service.name,
          client_name: formData.name,
          client_phone: formData.phone,
          date: formData.date,
          time: formData.time
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to book appointment");

      const message = `Hello! I would like to book an appointment.\n\n*Service:* ${service.name}\n*Date:* ${formData.date}\n*Time:* ${formData.time}\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}`;
      window.location.href = `https://wa.me/${data.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50/50 p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Schedule {service.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Fill out your details below to secure your time slot.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User size={16} className="text-gray-400"/> Full Name</label>
            <input required type="text" placeholder="John Doe" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Phone size={16} className="text-gray-400"/> Phone Number</label>
            <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> Date</label>
            <input required type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Clock size={16} className="text-gray-400"/> Time</label>
            <input required type="time" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all" onChange={e => setFormData({...formData, time: e.target.value})} />
          </div>
        </div>

        <div className="pt-2">
          <button disabled={loading} type="submit" className="w-full bg-gray-900 text-white font-semibold py-3.5 rounded-lg hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 shadow-sm">
            {loading ? "Confirming Slot..." : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
