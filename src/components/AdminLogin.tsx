import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, LoaderCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '../lib/auth';

export function AdminLogin({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return setErrorMessage('Enter password');
    setLoading(true); setErrorMessage(null);
    const res = await loginAdmin(password.trim());
    setLoading(false);
    if (res.success) { if (onSuccess) onSuccess(); } else { setErrorMessage(res.error || 'Access denied'); }
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 mb-6"><ArrowLeft className="w-3.5 h-3.5" /><span>Return</span></Link>
        <div className="bg-white rounded-2xl border p-8 space-y-6 shadow-xl">
          <div className="text-center"><ShieldCheck className="w-8 h-8 mx-auto mb-2" /><h1 className="font-bold text-lg">Admin Login</h1></div>
          {errorMessage && <div className="text-red-600 text-xs text-center">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Password" />
            <button type="submit" disabled={loading} className="w-full bg-black text-white p-2 rounded text-sm font-semibold">{loading ? 'Verifying...' : 'Login'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AdminLogin;
