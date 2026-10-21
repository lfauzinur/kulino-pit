'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, KeyRound, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Login gagal. Silakan coba lagi.');
      }

      localStorage.removeItem('isAdmin');
      router.replace('/admin');
      router.refresh();
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white mb-4 shadow-lg">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-3xl font-display font-black text-white">Admin CMS</h2>
        <p className="mt-2 text-sm text-gray-400">Login aman khusus pengelola sistem</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-300">Admin Email</label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                className="mt-1 w-full px-5 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="admin@kulinopit.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-5 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 disabled:opacity-60">
              {loading ? 'Memverifikasi...' : 'Secure Login'}
            </button>

            <p className="text-center text-xs text-gray-500">
              Password dikelola melalui environment server. Hubungi pengelola deployment untuk melakukan reset.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
