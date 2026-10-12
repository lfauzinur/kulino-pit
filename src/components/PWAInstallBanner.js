'use client';
import { useState, useEffect } from 'react';
import { Download, Smartphone, X, Check, Wifi, WifiOff, Share, PlusSquare } from 'lucide-react';

export default function PWAInstallBanner({ showTriggerOnly = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope);
        },
        (err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        }
      );
    }

    // 2. Check standalone display mode (already installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsInstalled(isStandalone);
    };
    checkStandalone();

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Listen for appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 6. Online / Offline status tracking
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 7. Custom event to trigger modal from anywhere
    const handleOpenPrompt = () => {
      setShowModal(true);
    };
    window.addEventListener('open-pwa-install', handleOpenPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('open-pwa-install', handleOpenPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setShowModal(false);
    } else if (isIOS) {
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 flex items-center justify-center gap-2 shadow-sm font-semibold sticky top-0 z-50 animate-fade-in">
          <WifiOff size={14} /> Mode Offline Aktif — Anda tetap dapat mengakses data yang tersimpan di cache.
        </div>
      )}

      {/* Reconnected Toast */}
      {showOnlineToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg z-50 animate-bounce-slow font-semibold">
          <Wifi size={14} /> Terhubung kembali ke internet!
        </div>
      )}

      {/* PWA Floating Mini Bar on Dashboard if not installed */}
      {!isInstalled && !showTriggerOnly && (
        <div className="mb-5 mx-4 sm:mx-0 bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-100 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 shadow-sm font-black text-sm">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0">
              <p className="font-display font-black text-xs text-gray-900 truncate">
                Pasang Aplikasi Kulino Pit
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                Akses cepat GPS tracker & booking langsung dari Home Screen
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 btn btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
          >
            <Download size={13} />
            <span>Pasang</span>
          </button>
        </div>
      )}

      {/* Full Installation Modal / Instructions */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-gray-100 relative animate-slide-up">
            
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center font-display font-black text-2xl shadow-md">
                K
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-gray-900">
                  Kulino Pit App
                </h3>
                <p className="text-xs text-gray-500">
                  PWA (Progressive Web Application)
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="space-y-2.5 mb-6 bg-gray-50 p-4 rounded-2xl">
              {[
                'Akses 1-ketukan cepat langsung dari layar utama HP',
                'Peta rute gowes & GPS tracking responsif dan hemat kuota',
                'Notifikasi status sewa & countdown waktu sewa aktif',
                'Tampilan bersih layar penuh tanpa toolbar browser',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-gray-700">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* Action / iOS Guide */}
            {isIOS ? (
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-xs text-sky-900 space-y-2 mb-4">
                <p className="font-bold flex items-center gap-1.5 text-sky-800">
                  <Share size={15} /> Cara Pasang di iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sky-700 pl-1">
                  <li>Ketuk tombol <strong className="font-semibold">Share</strong> (ikon kotak panah ke atas) di menu Safari bawah.</li>
                  <li>Gulir ke bawah dan pilih <strong className="font-semibold flex items-center gap-1 inline-flex"><PlusSquare size={12}/> Tambahkan ke Layar Utama</strong>.</li>
                  <li>Ketuk <strong className="font-semibold">Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full btn btn-primary py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-lg mb-2"
              >
                <Download size={18} /> Pasang ke Layar Utama
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 mb-4">
                <p className="font-bold mb-1">Panduan Browser:</p>
                <p>Klik menu titik tiga di browser Anda (Chrome / Edge / Samsung Internet), lalu pilih <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> atau <strong>&quot;Instal Aplikasi&quot;</strong>.</p>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 text-xs font-semibold text-gray-500 hover:text-gray-700 text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
