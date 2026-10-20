import React, { useState, useEffect } from "react";
import BookingForm from "./components/BookingForm";
import { Clock, ArrowRight } from "lucide-react";

// Fallback mock services while the database populates
const defaultServices = [
  { id: 1, name: "Standard Consultation", description: "A comprehensive 30-minute session.", price: 50, duration_minutes: 30 },
  { id: 2, name: "Premium Service", description: "Extended 1-hour professional service.", price: 100, duration_minutes: 60 }
];

export default function App() {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    // Attempt to fetch live services if endpoint exists
    fetch("/api/services").then(res => res.json()).then(data => {
      if (data.services && data.services.length > 0) setServices(data.services);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Booking Portal</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {!selectedService ? (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
              <p className="mt-2 text-gray-500">Select a service below to schedule your appointment.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(srv => (
                <div key={srv.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col group">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{srv.name}</h3>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">{srv.description}</p>
                    <div className="flex items-center gap-4 mt-5 text-sm font-medium text-gray-700">
                      <div className="flex items-center gap-1.5"><Clock size={16} className="text-gray-400"/> {srv.duration_minutes} min</div>
                      <div className="flex items-center gap-1.5 text-gray-900">${srv.price}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedService(srv)} className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg font-medium transition-colors">
                    Book Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
             <button onClick={() => setSelectedService(null)} className="text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
               &larr; Back to services
             </button>
             <BookingForm service={selectedService} />
          </div>
        )}
      </main>
    </div>
  );
}
