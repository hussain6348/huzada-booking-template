import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import Admin from './pages/Admin';

export default function App() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Book Appointment' },
    { path: '/admin', label: 'Admin Dashboard' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-xl text-gray-800">Booking Engine</span>
          <div className="flex gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <div className="p-8 flex items-center justify-center min-h-[80vh]">
                <BookingForm />
              </div>
            }
          />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}
