import React, { useState } from "react";

export default function BookingForm({ service = { id: 1, name: "General Appointment" } }: { service?: any }) {
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      const message = `Hello! I would like to book an appointment.\n\n*Service:* ${service.name}\n*Date:* ${formData.date}\n*Time:* ${formData.time}\n*Name:* ${formData.name}\n*Phone:* ${formData.phone}`;
      window.location.href = `https://wa.me/${data.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Book {service.name}</h2>
      
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <div><label className="block text-sm text-gray-600">Name</label><input required type="text" className="w-full border p-2 rounded mt-1" onChange={e => setFormData({...formData, name: e.target.value})} /></div>
      <div><label className="block text-sm text-gray-600">Phone</label><input required type="tel" className="w-full border p-2 rounded mt-1" onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
      <div><label className="block text-sm text-gray-600">Date</label><input required type="date" className="w-full border p-2 rounded mt-1" onChange={e => setFormData({...formData, date: e.target.value})} /></div>
      <div><label className="block text-sm text-gray-600">Time</label><input required type="time" className="w-full border p-2 rounded mt-1" onChange={e => setFormData({...formData, time: e.target.value})} /></div>
      
      <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded mt-4 hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Confirming..." : "Confirm Booking"}
      </button>
    </form>
  );
}
