'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, KeyRound, Phone, X, CheckCircle, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

export default function UnifiedLogin() {
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Google Auth Name Modal
  const [showGoogleNameModal, setShowGoogleNameModal] = useState(false);
  const [googleName, setGoogleName] = useState('');

  // Read bookBike & redirect from URL search params
  const getRedirectUrl = (role) => {
    if (typeof window === 'undefined') return `/${role}`;
    const params = new URLSearchParams(window.location.search);
    const bookBike = params.get('bookBike');
    const redirect = params.get('redirect');
    if (role === 'member' || role === 'default') {
      const base = redirect || '/member';
      return bookBike ? `${base}?bookBike=${bookBike}` : base;
    }
    return `/${role}`;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const idStr = identifier.toLowerCase();
      if (idStr === 'admin') {
        localStorage.removeItem('isAdmin');
        router.push('/admin/login');
      } else if (idStr === 'partner') {
        localStorage.setItem('isPartner', 'true');
        router.push(getRedirectUrl('partner'));
      } else {
        localStorage.setItem('isMember', 'true');
        router.push(getRedirectUrl('default'));
      }
    }, 1000);
  };

  const handleGoogleAuth = () => {
    // Cek apakah sudah ada profil tersimpan
    const existingProfile = localStorage.getItem('memberProfile');
    if (existingProfile) {
      // Sudah pernah login — langsung masuk
      setLoading(true);
      setTimeout(() => {
        localStorage.setItem('isMember', 'true');
        router.push(getRedirectUrl('default'));
      }, 800);
    } else {
      // Pengguna baru — minta nama lengkap
      setShowGoogleNameModal(true);
    }
  };

  const handleConfirmGoogleName = () => {
    if (!googleName.trim()) return;
    setShowGoogleNameModal(false);
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        name: googleName.trim(),
        email: `${googleName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        photo: null,
        provider: 'google',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('memberProfile', JSON.stringify(googleUser));
      localStorage.setItem('isMember', 'true');
      router.push(getRedirectUrl('default'));
    }, 800);
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center w-20 h-20 mb-3 hover:scale-105 transition-transform">
          <Image src="/images/logo.png" alt="Kulino Ngepit Logo" width={80} height={80} className="object-contain" priority />
        </Link>
        <h2 className="text-3xl font-display font-black text-gray-900">Portal Masuk</h2>
        <p className="mt-2 text-sm text-gray-600">
          Masuk ke Dashboard Member, Mitra Partner, atau Super Admin.
        </p>
      </div>

      {/* Mascot */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mt-4 mb-2">
        <div className="relative w-36 h-36 animate-bounce-slow">
          <Image
            src="/images/mascot-wave.png"
            alt="Maskot Kulino"
            fill
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                No WhatsApp / Username / Email
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="clean-input pl-10"
                  placeholder="0812... / Budi / admin"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button 
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-light)]"
                >
                  {t('auth.forgotBtn')}
                </button>
              </div>
              <div className="mt-1 relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="clean-input pl-10"
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
                {loading ? t('auth.processing') : t('auth.loginBtn')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {t('auth.orLogin')}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {loading ? 'Memproses...' : t('auth.googleLogin')}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {t('auth.noAccount')}
            </span>
            <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
              {t('auth.registerHere')}
            </Link>
          </div>
        </div>
      </div>

      {/* Google Name Modal */}
      {showGoogleNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-gray-100 shadow-xl relative">
            <button 
              onClick={() => { setShowGoogleNameModal(false); setGoogleName(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 relative mb-3">
                <Image src="/images/mascot-wave.png" alt="Maskot" fill className="object-contain" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <h3 className="font-display font-black text-xl text-gray-900 mb-1">Masuk dengan Google</h3>
              <p className="text-sm text-gray-500">
                Hei Goweser! Siapa nama kamu? Kami akan tampilkan ini di profil member kamu 🚴
              </p>
            </div>

            <div className="relative mb-4">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Nama Lengkap kamu..."
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmGoogleName()}
                className="clean-input pl-10 w-full"
              />
            </div>

            <button
              onClick={handleConfirmGoogleName}
              disabled={!googleName.trim()}
              className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjut Masuk 🚴
            </button>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-gray-100 shadow-xl relative">
            <button 
              onClick={() => {
                setShowForgotModal(false);
                setResetSuccess(false);
                setResetIdentifier('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {resetSuccess ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-display font-black text-xl text-gray-900 mb-2">
                  {t('auth.linkSent')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('auth.linkSentDesc1')}<strong>{resetIdentifier}</strong>{t('auth.linkSentDesc2')}
                </p>
                <button 
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetSuccess(false);
                  }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full py-3"
                >
                  {t('auth.backLogin')}
                </button>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="font-display font-black text-xl text-gray-900 mb-2">
                  {t('auth.forgotBtn')}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {t('auth.forgotDesc')}
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="No WA / Username / Email"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                      className="clean-input"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={resetLoading || !resetIdentifier}
                    className="btn btn-primary w-full py-3"
                  >
                    {resetLoading ? t('auth.sending') : t('auth.sendReset')}
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
