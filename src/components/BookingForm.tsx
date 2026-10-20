import React, { useState } from 'react';

export default function BookingForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', service: 'General Checkup', date: '', time: '' });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', service: 'General Checkup', date: '', time: '' });
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-6 bg-green-50 text-green-700 rounded-lg text-center">
        <h3 className="font-bold text-xl mb-2">Booking Confirmed!</h3>
        <p>Your appointment request has been securely sent to the clinic.</p>
        <button onClick={() => setStatus('idle')} className="mt-4 underline">Book another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 text-left">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Book an Appointment</h2>
      
      {status === 'error' && (
        <div className="p-3 bg-red-100 text-red-700 rounded">Something went wrong. Please try again.</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input required type="text" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
          value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input required type="tel" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
          value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Service Needed</label>
        <select className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
          <option>General Checkup</option>
          <option>Teeth Cleaning</option>
          <option>Whitening</option>
          <option>Root Canal</option>
          <option>Consultation</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input required type="date" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Time</label>
          <input required type="time" className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
            value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
        </div>
      </div>

      <button disabled={status === 'submitting'} type="submit" 
        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 mt-4">
        {status === 'submitting' ? 'Sending...' : 'Confirm Booking'}
      </button>
    </form>
  );
}
