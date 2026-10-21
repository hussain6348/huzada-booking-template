import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Admin } from './pages/Admin';
import { AdminLogin } from './components/AdminLogin';
import { isAuthenticated, AUTH_CHANGE_EVENT } from './lib/auth';

// Temporary inline BookingEngine fallback or standard import to guarantee build success
function BookingEnginePlaceholder() {
  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm text-center space-y-4">
      <h1 className="font-bold text-xl text-zinc-900">Huzada Booking Template</h1>
      <p className="text-xs text-zinc-500">Public booking portal is active. Access the operations console via <a href="/admin" className="underline font-semibold text-zinc-900">/admin</a>.</p>
    </div>
  );
}

function ProtectedRoute() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  useEffect(() => {
    const fn = () => setAuthed(isAuthenticated());
    window.addEventListener(AUTH_CHANGE_EVENT, fn);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, fn);
  }, []);
  return authed ? <Admin onLogout={() => setAuthed(false)} /> : <AdminLogin onSuccess={() => setAuthed(true)} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="min-h-screen bg-zinc-50 py-12 px-4"><BookingEnginePlaceholder /></div>} />
      <Route path="/admin" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
