import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BookingEngine from './components/BookingEngine';
import { Admin } from './pages/Admin';
import { AdminLogin } from './components/AdminLogin';
import { isAuthenticated, AUTH_CHANGE_EVENT } from './lib/auth';

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
      <Route path="/" element={<div className="min-h-screen bg-zinc-50 py-12 px-4"><BookingEngine /></div>} />
      <Route path="/admin" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
