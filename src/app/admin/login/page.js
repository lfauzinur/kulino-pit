'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, Mail, X, CheckCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Simulate successful login
      localStorage.setItem('isAdmin', 'true');
      router.push('/admin');
    }, 1000);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setResetSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)] text-white mb-4 shadow-lg">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-3xl font-display font-black text-white">Admin CMS</h2>
        <p className="mt-2 text-sm text-gray-400">Login khusus pengelola sistem</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:px-10 border border-gray-700">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Admin Email</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  className="w-full px-5 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="admin@kulinopit.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="mt-1 relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-5 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? 'Authenticating...' : 'Secure Login'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-800 rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-gray-700 shadow-xl relative">
            <button 
              onClick={() => {
                setShowForgotModal(false);
                setResetSuccess(false);
                setResetEmail('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            {resetSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-display font-black text-xl text-white mb-2">Tautan Terkirim!</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Silakan periksa kotak masuk email <strong>{resetEmail}</strong> untuk instruksi reset password.
                </p>
                <button 
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 w-full py-3"
                >
                  Kembali ke Login
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-display font-black text-xl text-white mb-2">Lupa Password?</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Masukkan email admin Anda, dan kami akan mengirimkan tautan untuk mengatur ulang password.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      required
                      placeholder="Email Admin..."
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-5 py-3 rounded-xl border border-gray-600 bg-gray-700 text-white focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={resetLoading || !resetEmail}
                    className="btn btn-primary w-full py-3"
                  >
                    {resetLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
