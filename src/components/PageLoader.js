'use client';
import { useState, useEffect } from 'react';

export default function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menyiapkan armada sepeda premium...');

  useEffect(() => {
    // Check if user already saw the loader in this session
    const hasSeen = sessionStorage.getItem('kp_loader_seen');
    if (hasSeen) {
      setIsVisible(false);
      return;
    }

    const duration = 1900; // 1.9 seconds for a crisp, engaging intro
    const intervalTime = 30;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress < 35) {
        setStatusText('Menyiapkan armada sepeda premium...');
      } else if (currentProgress < 70) {
        setStatusText('Menghubungkan rute & navigasi GPS...');
      } else if (currentProgress < 95) {
        setStatusText('Menyiapkan pengalaman gowes terbaik...');
      } else {
        setStatusText('Siap mengayuh petualangan Anda! 🚴');
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
        sessionStorage.setItem('kp_loader_seen', 'true');
        setTimeout(() => {
          setIsFading(true);
          setTimeout(() => {
            setIsVisible(false);
          }, 650);
        }, 200);
      }
    }, intervalTime);

    // Support replay for testing
    const handleReplay = () => {
      sessionStorage.removeItem('kp_loader_seen');
      setIsVisible(true);
      setIsFading(false);
      setProgress(0);
    };
    window.addEventListener('replay-page-loader', handleReplay);

    return () => {
      clearInterval(timer);
      window.removeEventListener('replay-page-loader', handleReplay);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-label="Loading Kulino Pit"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FCF9F2] transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-sky-200/40 via-amber-100/50 to-orange-200/30 blur-3xl pointer-events-none" />

      {/* Main Loader Content */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Animated Cyclist Illustration (Bespoke SVG) */}
        <div className="relative w-72 h-44 sm:w-80 sm:h-48 flex items-center justify-center">
          <svg
            viewBox="0 0 320 190"
            className="w-full h-full overflow-visible drop-shadow-md"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Bike frame linear gradient */}
              <linearGradient id="frameGrad" x1="80" y1="90" x2="210" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4BA3E3" />
                <stop offset="1" stopColor="#1E293B" />
              </linearGradient>

              {/* Jersey gradient */}
              <linearGradient id="jerseyGrad" x1="120" y1="55" x2="165" y2="75" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E05A2B" />
                <stop offset="1" stopColor="#F97316" />
              </linearGradient>

              {/* Helmet gradient */}
              <linearGradient id="helmetGrad" x1="155" y1="35" x2="185" y2="50" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0F172A" />
                <stop offset="1" stopColor="#334155" />
              </linearGradient>

              {/* Road line dash pattern */}
              <linearGradient id="roadGrad" x1="20" y1="168" x2="300" y2="168" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E2E8F0" stopOpacity="0" />
                <stop offset="0.2" stopColor="#94A3B8" />
                <stop offset="0.8" stopColor="#94A3B8" />
                <stop offset="1" stopColor="#E2E8F0" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* ── Wind Flow / Speed Streaks ── */}
            <g className="opacity-80">
              <line x1="60" y1="75" x2="15" y2="75" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" className="animate-kp-wind-1" />
              <line x1="80" y1="50" x2="30" y2="50" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" className="animate-kp-wind-2" />
              <line x1="50" y1="110" x2="10" y2="110" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" className="animate-kp-wind-3" />
            </g>

            {/* ── Road / Ground moving dashes ── */}
            <line
              x1="20"
              y1="168"
              x2="300"
              y2="168"
              stroke="url(#roadGrad)"
              strokeWidth="3.5"
              strokeDasharray="18 12"
              strokeLinecap="round"
              className="animate-kp-road"
            />
            {/* Base asphalt ground line */}
            <line x1="10" y1="169" x2="310" y2="169" stroke="#E2E8F0" strokeWidth="1.5" strokeOpacity="0.6" />

            {/* ── BICYCLE WHEELS ── */}
            {/* Rear Wheel (Center 85, 140) */}
            <g transform="translate(85, 140)">
              {/* Outer tire */}
              <circle r="27" stroke="#1E293B" strokeWidth="4.5" fill="none" />
              {/* Inner rim */}
              <circle r="23" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
              {/* Hub */}
              <circle r="4.5" fill="#4BA3E3" />
              {/* Spinning Spokes */}
              <g className="animate-kp-spin" style={{ transformOrigin: '0px 0px' }}>
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="-15.5" y1="-15.5" x2="15.5" y2="15.5" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="-15.5" y1="15.5" x2="15.5" y2="-15.5" stroke="#CBD5E1" strokeWidth="1.5" />
              </g>
            </g>

            {/* Front Wheel (Center 215, 140) */}
            <g transform="translate(215, 140)">
              {/* Outer tire */}
              <circle r="27" stroke="#1E293B" strokeWidth="4.5" fill="none" />
              {/* Inner rim */}
              <circle r="23" stroke="#94A3B8" strokeWidth="1.5" fill="none" />
              {/* Hub */}
              <circle r="4.5" fill="#4BA3E3" />
              {/* Spinning Spokes */}
              <g className="animate-kp-spin" style={{ transformOrigin: '0px 0px' }}>
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="-15.5" y1="-15.5" x2="15.5" y2="15.5" stroke="#CBD5E1" strokeWidth="1.5" />
                <line x1="-15.5" y1="15.5" x2="15.5" y2="-15.5" stroke="#CBD5E1" strokeWidth="1.5" />
              </g>
            </g>

            {/* ── BICYCLE FRAMEWORK ── */}
            {/* Rear Chainstay & Seatstay */}
            <line x1="85" y1="140" x2="145" y2="140" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            <line x1="85" y1="140" x2="128" y2="92" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />

            {/* Main Diamond Frame (Cyan / Dark sporty finish) */}
            {/* Seat tube */}
            <line x1="145" y1="140" x2="128" y2="92" stroke="url(#frameGrad)" strokeWidth="4.5" strokeLinecap="round" />
            {/* Down tube */}
            <line x1="145" y1="140" x2="195" y2="86" stroke="url(#frameGrad)" strokeWidth="5.5" strokeLinecap="round" />
            {/* Top tube */}
            <line x1="128" y1="92" x2="195" y2="86" stroke="url(#frameGrad)" strokeWidth="4.5" strokeLinecap="round" />

            {/* Front Fork & Headtube */}
            <line x1="195" y1="86" x2="215" y2="140" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
            {/* Handlebar stem & Drop bar */}
            <path d="M195 86 L202 78 L212 80 C216 82 216 90 210 92" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Seatpost & Saddle */}
            <line x1="128" y1="92" x2="123" y2="80" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M112 80 C114 77 124 76 135 80 C132 82 120 83 112 80 Z" fill="#0F172A" />

            {/* Bottom Bracket & Chainring */}
            <circle cx="145" cy="140" r="9" fill="#1E293B" stroke="#4BA3E3" strokeWidth="2" />
            <circle cx="145" cy="140" r="4" fill="#E2E8F0" />

            {/* ── CYCLIST RIDER & PEDALING LEGS ── */}
            <g className="animate-kp-rider">
              {/* Back Leg (far side, lower opacity for depth) */}
              <g className="opacity-60">
                <path d="M129 82 L137 106 L154 130" stroke="#334155" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                {/* Back Foot / Shoe */}
                <ellipse cx="157" cy="132" rx="6" ry="3" fill="#1E293B" />
              </g>

              {/* Rider Torso & Jersey */}
              <path
                d="M127 80 C128 73 144 60 168 62 C172 63 174 68 170 74 C160 84 140 88 127 80 Z"
                fill="url(#jerseyGrad)"
                stroke="#C2410C"
                strokeWidth="1"
              />
              {/* Kulino Pit Emblem on Jersey */}
              <circle cx="152" cy="71" r="3.5" fill="#FFFFFF" />
              <text x="150" y="73" fill="#E05A2B" fontSize="4" fontWeight="bold">K</text>

              {/* Cyclist Arms holding Drop Handlebar */}
              <path
                d="M165 65 L186 76 L208 84"
                stroke="#E2E8F0"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              {/* Gloves */}
              <circle cx="208" cy="84" r="3" fill="#0F172A" />

              {/* Rider Neck & Head */}
              <circle cx="174" cy="52" r="7" fill="#F8C79D" />

              {/* Sunglasses / Visor */}
              <path d="M176 50 Q183 51 184 54 Q179 56 175 53 Z" fill="#0284C7" />

              {/* Aerodynamic Helmet */}
              <path
                d="M165 49 C163 41 174 36 186 38 C192 40 190 46 185 49 C177 49 170 51 165 49 Z"
                fill="url(#helmetGrad)"
                stroke="#475569"
                strokeWidth="1"
              />
              {/* Helmet vent detail */}
              <path d="M172 41 L178 44" stroke="#4BA3E3" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M176 39 L182 42" stroke="#4BA3E3" strokeWidth="1.5" strokeLinecap="round" />

              {/* Front Leg (Pedaling Crank Movement) */}
              <g>
                {/* Thigh (Pelvis to Knee) & Shin (Knee to Ankle) */}
                <path
                  d="M129 80 L146 102 L137 148"
                  stroke="#1E293B"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Cycling Shoe & Cleat */}
                <path d="M133 148 L145 150 L144 153 L132 152 Z" fill="#E05A2B" stroke="#0F172A" strokeWidth="1" />
              </g>
            </g>

            {/* Rotating Pedal Crank Arm */}
            <g transform="translate(145, 140)">
              <g className="animate-kp-pedal" style={{ transformOrigin: '0px 0px' }}>
                <line x1="0" y1="0" x2="-8" y2="10" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                <rect x="-12" y="9" width="8" height="3" rx="1.5" fill="#475569" />
              </g>
            </g>
          </svg>
        </div>

        {/* Brand Header */}
        <div className="mt-3 flex items-center justify-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-display font-black text-base shadow-md">
            K
          </span>
          <div className="text-left">
            <h1 className="font-display font-black text-xl tracking-tight text-gray-900 leading-none">
              Kulino Pit
            </h1>
            <p className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-primary)] mt-0.5">
              Premium Bike Rental & Tours
            </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full mt-6">
          <div className="relative w-full h-2.5 bg-gray-200/80 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] via-sky-500 to-orange-500 rounded-full transition-all duration-100 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage & Status */}
          <div className="flex justify-between items-center mt-2.5 px-0.5">
            <p className="text-xs font-semibold text-gray-600 truncate max-w-[220px]">
              {statusText}
            </p>
            <span className="font-display font-black text-xs text-[var(--color-primary)] tabular-nums">
              {progress}%
            </span>
          </div>
        </div>

        {/* Subtle Destination Tag */}
        <p className="text-[10px] text-gray-400 mt-5 font-medium tracking-wide">
          Banyuwangi, Jawa Timur • Indonesia
        </p>
      </div>
    </div>
  );
}
