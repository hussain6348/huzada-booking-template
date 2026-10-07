import { Routes, Route } from 'react-router-dom';
import { BookingEngine } from './components/BookingEngine';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-zinc-100/50 py-12 px-4 flex items-center justify-center">
            <BookingEngine />
          </div>
        }
      />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
