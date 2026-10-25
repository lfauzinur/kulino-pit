'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, KeyRound, Phone, User, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { syncMemberProfile } from '@/lib/member-sync';

export default function MemberRegister() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [wa, setWa] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Google Auth Name Modal
  const [showGoogleNameModal, setShowGoogleNameModal] = useState(false);
  const [googleName, setGoogleName] = useState('');
  const [googleWa, setGoogleWa] = useState('');

  // Read bookBike & redirect from URL search params
  const getMemberRedirect = () => {
    if (typeof window === 'undefined') return '/member';
    const params = new URLSearchParams(window.location.search);
    const bookBike = params.get('bookBike');
    const redirect = params.get('redirect');
    const base = redirect || '/member';
    return bookBike ? `${base}?bookBike=${bookBike}` : base;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || wa.replace(/\D/g, '').length < 9) {
      setError('Nama lengkap dan nomor WhatsApp yang valid wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const memberProfile = await syncMemberProfile({
        name: name.trim(),
        wa,
        address,
        provider: 'form',
        registeredAt: new Date().toISOString(),
      }, { required: true });
      localStorage.setItem('isMember', 'true');
      localStorage.setItem('memberProfile', JSON.stringify(memberProfile));
      router.push(getMemberRedirect());
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Tampilkan modal minta nama
    setShowGoogleNameModal(true);
  };

  const handleConfirmGoogleName = async () => {
    if (!googleName.trim() || googleWa.replace(/\D/g, '').length < 9) {
      setError('Nama lengkap dan nomor WhatsApp yang valid wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const googleUser = await syncMemberProfile({
        name: googleName.trim(),
        wa: googleWa,
        email: `${googleName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        photo: null,
        provider: 'google',
        registeredAt: new Date().toISOString(),
      }, { required: true });
      setShowGoogleNameModal(false);
      localStorage.setItem('isMember', 'true');
      localStorage.setItem('memberProfile', JSON.stringify(googleUser));
      router.push(getMemberRedirect());
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center w-20 h-20 mb-3 hover:scale-105 transition-transform">
          <Image src="/images/logo.png" alt="Kulino Ngepit Logo" width={80} height={80} className="object-contain" priority />
        </Link>
        <h2 className="text-3xl font-display font-black text-gray-900">
          {t('auth.registerTitle')}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      {/* Mascot */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mt-4 mb-2">
        <div className="relative w-36 h-36">
          <Image
            src="/images/mascot-go.png"
            alt="Maskot Kulino"
            fill
            className="object-contain drop-shadow-xl"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.fullName')}
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="clean-input pl-10"
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Alamat <span className="text-gray-400">(opsional)</span></label>
              <textarea className="clean-input mt-1 min-h-20" placeholder="Alamat domisili atau pengantaran" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('auth.whatsapp')}
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  required
                  className="clean-input pl-10"
                  placeholder="081234567890"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
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
                {loading ? t('auth.processing') : t('auth.registerBtn')}
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
                  {t('auth.orRegister')}
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
                {loading ? 'Memproses...' : t('auth.googleRegister')}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">
              {t('auth.haveAccount')}
            </span>
            <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
              {t('auth.loginHere')}
            </Link>
          </div>
        </div>
      </div>

      {/* Google Name Modal */}
      {showGoogleNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm border border-gray-100 shadow-xl relative">
            <button
              onClick={() => { setShowGoogleNameModal(false); setGoogleName(''); setGoogleWa(''); setError(''); }}
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
              <h3 className="font-display font-black text-xl text-gray-900 mb-1">Daftar dengan Google</h3>
              <p className="text-sm text-gray-500">
                Lengkapi nama dan nomor WhatsApp agar akun serta booking kamu dapat dihubungi.
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

            <div className="relative mb-4">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="tel"
                placeholder="Nomor WhatsApp aktif"
                value={googleWa}
                onChange={(e) => setGoogleWa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmGoogleName()}
                className="clean-input pl-10 w-full"
              />
            </div>

            {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}

            <button
              onClick={handleConfirmGoogleName}
              disabled={!googleName.trim() || googleWa.replace(/\D/g, '').length < 9 || loading}
              className="btn btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Daftar Sekarang 🚴
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
