'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function MascotWidget() {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Hanya tampilkan di halaman publik, bukan di /member, /admin, /partner
  const hiddenPaths = ['/member', '/admin', '/partner'];
  const shouldHide = hiddenPaths.some(p => pathname?.startsWith(p));

  const greetings = [
    'Hei Goweser! 🚴 Mau sewa sepeda hari ini?',
    'Yuk gowes keliling Banyuwangi! 🌴',
    'Ada promo spesial weekend nih! 🎉',
    'Daftar member & kumpulkan poin! ⭐',
    'Trip ke Ijen? Ayo bareng Kulino! ⛰️',
    'Sepeda santai atau road bike? Pilih dulu! 🚲',
  ];

  useEffect(() => {
    setIsMounted(true);
    // Tampilkan bubble setelah 2 detik
    const timer = setTimeout(() => {
      const idx = Math.floor(Math.random() * greetings.length);
      setBubbleText(greetings[idx]);
      setShowBubble(true);
      // Sembunyikan bubble setelah 5 detik
      setTimeout(() => setShowBubble(false), 5000);
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleMascotClick = () => {
    const idx = Math.floor(Math.random() * greetings.length);
    setBubbleText(greetings[idx]);
    setShowBubble(true);
    setTimeout(() => setShowBubble(false), 4000);
  };

  if (!isMounted || shouldHide) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">
      {/* Speech Bubble */}
      {showBubble && (
        <div
          className="relative bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 max-w-[200px] animate-fade-in"
          style={{ animationDuration: '0.3s' }}
        >
          <p className="text-xs font-semibold text-gray-800 leading-snug">{bubbleText}</p>
          {/* Tail */}
          <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          <div className="absolute -bottom-[10px] right-[30px] w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[9px] border-t-gray-100" style={{ zIndex: -1 }} />
        </div>
      )}

      {/* Mascot Button */}
      <button
        onClick={handleMascotClick}
        className="mascot-float-btn relative"
        title="Klik untuk sapa maskot!"
        aria-label="Maskot Kulino Pit"
      >
        <Image
          src="/images/mascot-wave.png"
          alt="Maskot Kulino Pit"
          fill
          className="object-contain"
          sizes="80px"
        />
      </button>
    </div>
  );
}
