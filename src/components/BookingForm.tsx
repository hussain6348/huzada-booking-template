import React, { useState } from "react";
import { Calendar, Clock, User, Phone, Mail, X } from "lucide-react";
import { clientConfig } from "../config/client";

export default function BookingForm({
  service,
  onClose,
}: {
  service: any;
  onClose?: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fallbackWhatsApp = clientConfig?.whatsappNumber || "923001234567";
    let targetWhatsApp = fallbackWhatsApp;

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: service?.client_id || "default",
          service_id: service?.id || "",
          service_name: service?.name || "",
          customer_name: formData.name,
          client_name: formData.name,
          customer_phone: formData.phone,
          client_phone: formData.phone,
          customer_email: formData.email,
          email: formData.email,
          booking_date: formData.date,
          date: formData.date,
          booking_time: formData.time,
          time: formData.time,
        }),
      });

      let responseData: any = null;
      try {
        const text = await response.text();
        if (text) {
          responseData = JSON.parse(text);
        }
      } catch {
        responseData = null;
      }

      if (response.ok) {
        if (responseData?.whatsapp) {
          targetWhatsApp = responseData.whatsapp;
        }

        try {
          sessionStorage.setItem(
            "huzada_last_booking_status",
            JSON.stringify({
              timestamp: new Date().toISOString(),
              ok: true,
              status: response.status,
              data: responseData,
            })
          );
        } catch {}
      } else {
        console.error("[BOOKING API FAILED]", {
          status: response.status,
          response: responseData,
        });

        try {
          sessionStorage.setItem(
            "huzada_last_booking_status",
            JSON.stringify({
              timestamp: new Date().toISOString(),
              ok: false,
              status: response.status,
              error: responseData?.error || "Unknown server response",
              code: responseData?.code || "HTTP_" + response.status,
            })
          );
        } catch {}
      }
    } catch (err: any) {
      console.warn("Booking backend offline or pending, proceeding to WhatsApp bridge:", err);

      try {
        sessionStorage.setItem(
          "huzada_last_booking_status",
          JSON.stringify({
            timestamp: new Date().toISOString(),
            ok: false,
            status: 0,
            error: err?.message || "Network request failed",
            code: "NETWORK_ERROR",
          })
        );
      } catch {}
    } finally {
      const message = `Hello! I would like to book an appointment.\n\n*Service:* ${service?.name || "Service"}\n*Date:* ${formData.date}\n*Time:* ${formData.time}\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}\n*Email:* ${formData.email}`;
      const cleanPhone = (targetWhatsApp || fallbackWhatsApp).replace(/[^0-9]/g, "");

      window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden w-full flex flex-col">
      <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Checkout: {service?.name}</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Total: ${service?.price} • {service?.duration_minutes || service?.duration || 30} min
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
          >
            <X size={24} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-gray-400" /> Full Name
            </label>
            <input
              required
              type="text"
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone size={16} className="text-gray-400" /> Phone Number
            </label>
            <input
              required
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" /> Email Address
            </label>
            <input
              required
              type="email"
              placeholder="john@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" /> Date
            </label>
            <input
              required
              type="date"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" /> Time
            </label>
            <input
              required
              type="time"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            {loading ? "Processing..." : `Confirm & Pay Later`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
            <span className="block w-2 h-2 rounded-full bg-green-500"></span> Details routed to WhatsApp
          </p>
        </div>
      </form>
    </div>
  );
}
