import { useState } from 'react';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    serviceType: 'Routine Checkup',
    appointmentDate: '',
    appointmentTime: 'Morning (9AM - 12PM)'
  });

  const CLINIC_WHATSAPP_NUMBER = "923000000000"; 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
    } catch (error) {
      console.error("Database logging failed:", error);
    }

    const message = `*New Appointment Request*%0a` +
      `-----------------------%0a` +
      `*Patient:* ${formData.patientName}%0a` +
      `*Phone:* ${formData.patientPhone}%0a` +
      `*Service:* ${formData.serviceType}%0a` +
      `*Requested Date:* ${formData.appointmentDate}%0a` +
      `*Preferred Time:* ${formData.appointmentTime}%0a` +
      `-----------------------%0a` +
      `Hi, is this slot available?`;

    window.location.href = `https://wa.me/${CLINIC_WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Book an Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
        <input type="text" placeholder="Your Name" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, patientName: e.target.value})} />
        <input type="tel" placeholder="Your Phone Number" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, patientPhone: e.target.value})} />
        <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, serviceType: e.target.value})}>
          <option>Routine Checkup</option>
          <option>Teeth Whitening</option>
          <option>Root Canal Consultation</option>
          <option>Orthodontic Evaluation</option>
        </select>
        <input type="date" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
        <select className="w-full p-3 border rounded-lg bg-white" onChange={e => setFormData({...formData, appointmentTime: e.target.value})}>
          <option>Morning (9AM - 12PM)</option>
          <option>Afternoon (12PM - 4PM)</option>
          <option>Evening (4PM - 8PM)</option>
        </select>
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
          Request via WhatsApp
        </button>
      </form>
    </div>
  );
}
