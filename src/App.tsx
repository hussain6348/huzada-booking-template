import React, { useState, useEffect } from "react";
import BookingForm from "./components/BookingForm";
import { Clock, ArrowRight } from "lucide-react";

const defaultServices = [
  { id: 1, name: "Standard Consultation", description: "A comprehensive 30-minute session with our lead specialists.", price: 50, duration_minutes: 30 },
  { id: 2, name: "Premium Service", description: "Extended 1-hour professional service for detailed requirements.", price: 100, duration_minutes: 60 }
];

export default function App() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    fetch("/api/services").then(res => res.json()).then(data => {
      if (data.services && data.services.length > 0) setServices(data.services);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg"></div>
            Huzada Booking
          </div>
        </div>
      </header>

      <section className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Professional Services, <span className="text-blue-600">Booked Instantly.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto">
            Browse our available services below and secure your appointment in seconds using our seamless checkout system.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(srv => (
            <div key={srv.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-lg hover:border-gray-300 transition-all flex flex-col group relative overflow-hidden">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{srv.name}</h3>
                  <span className="bg-gray-100 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">${srv.price}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{srv.description}</p>
                <div className="flex items-center gap-2 mt-6 text-sm font-medium text-gray-600 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                  <Clock size={16} className="text-gray-400"/> {srv.duration_minutes} Minutes
                </div>
              </div>
              <button onClick={() => setSelectedService(srv)} className="mt-8 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-semibold transition-colors shadow-sm">
                Book Appointment <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </main>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedService(null)}></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
             <BookingForm service={selectedService} onClose={() => setSelectedService(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
