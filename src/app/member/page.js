'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, getLowestPrice } from '@/lib/data';
import { memberRewards, normalizeMemberProfile } from '@/lib/member-profile';
import { syncMemberProfile } from '@/lib/member-sync';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import CyclingWeatherCard from '@/components/CyclingWeatherCard';
import InAppBookingModal from '@/components/InAppBookingModal';
import InAppBikeCatalogModal from '@/components/InAppBikeCatalogModal';

const LiveRouteNavMap = dynamic(() => import('@/components/LiveRouteNavMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] sm:h-[400px] rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold animate-pulse">
      Memuat Peta Navigasi Google Maps & GPS...
    </div>
  ),
});
import { 
  LayoutDashboard, MapPin, CalendarDays, Award, Link as LinkIcon, 
  Trophy, Bike, DollarSign, Star, CheckCircle, Clock, Info, 
  Map as MapIcon, MousePointerClick, Users, CreditCard, LogOut,
  Share2, Link2, RotateCcw, Gift, AlertTriangle, ChevronRight,
  Sparkles, Compass, ArrowUpRight, Flame, Home, QrCode, ArrowLeft, Download, ShieldCheck,
  Navigation2, Route, History, Play, Square, Timer, Tag, HardHat, Shirt, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

/* ─── Real QR Code Component ─── */
function MemberQRCode({ memberId }) {
  const qrValue = `kulino-pit://member/${memberId}`;
  return (
    <QRCodeSVG
      value={qrValue}
      size={140}
      bgColor="#ffffff"
      fgColor="#0f172a"
      level="M"
      includeMargin={false}
    />
  );
}

/* ─── Active Booking Countdown Timer ─── */
function ActiveBookingTimer({ booking, locale, t }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (booking.status !== 'active' || !booking.activeSince || !booking.durationMinutes) return;

    const calculateTimeLeft = () => {
      const endTime = booking.activeSince + (booking.durationMinutes * 60 * 1000);
      const now = Date.now();
      return endTime - now;
    };

    const initialDiff = calculateTimeLeft();
    const timer = setTimeout(() => {
      setTimeLeft(initialDiff);
    }, 0);

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [booking]);

  if (booking.status !== 'active' || timeLeft === null) return null;

  const isExpired = timeLeft <= 0;
  const isWarning = !isExpired && timeLeft <= 10 * 60 * 1000;

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`rounded-2xl p-4 mb-5 border ${isExpired ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-sky-50 border-sky-200'} flex items-center justify-between gap-4 flex-wrap shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isExpired ? 'bg-red-100 text-red-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-[var(--color-primary)]'}`}>
          {isWarning || isExpired ? <AlertTriangle size={22} /> : <Clock size={22} />}
        </div>
        <div>
          <h3 className={`font-display font-black text-sm ${isExpired ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-sky-900'}`}>
            {isExpired ? (locale === 'id' ? 'Waktu Sewa Habis!' : 'Rental Time Expired!') : (locale === 'id' ? 'Sepeda Sedang Disewa' : 'Bike is Currently Rented')}
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            {booking.bike} • {booking.id}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">{locale === 'id' ? 'Sisa Waktu' : 'Time Left'}</p>
        <p className={`font-display font-black text-2xl tabular-nums ${isExpired ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-[var(--color-primary)]'}`}>
          {formatTime(timeLeft)}
        </p>
        {isWarning && (
          <p className="text-[10px] font-bold text-amber-600 mt-0.5 animate-pulse">
            {locale === 'id' ? '⚠️ Kurang dari 10 menit' : '⚠️ Less than 10 mins'}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Digital VIP Member Card ─── */
function DigitalMemberCard({ user, onShowQR }) {
  return (
    <div className="relative h-44 sm:h-48 rounded-[28px] overflow-hidden bg-gradient-to-tr from-stone-950 via-slate-900 to-sky-950 text-white shadow-xl border border-white/10 p-5 sm:p-6 flex flex-col justify-between">
      {/* Decorative Blur Circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[var(--color-primary)]/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />
      
      {/* Card Top */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-sm backdrop-blur-sm">
              <Star size={10} fill="currentColor" /> {user.level || 'Member'}
            </span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
              KULINO PIT CLUB
            </span>
          </div>
          <h3 className="font-display font-black text-lg sm:text-xl text-white tracking-wide">
            Kartu Member Digital
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15">
          <Sparkles size={13} className="text-amber-300" />
          <span className="font-mono text-xs font-bold text-white tracking-wider">
            {(user.points || 0).toLocaleString()} <span className="text-[9px] text-white/60">PTS</span>
          </span>
        </div>
      </div>

      {/* Card Bottom: Member Details & QR Code */}
      <div className="relative z-10 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">NAMA ANGGOTA</p>
          <p className="font-display font-bold text-base sm:text-lg text-white leading-tight mb-2">
            {user.name || 'Member Kulino Pit'}
          </p>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">ID MEMBER</p>
          <p className="font-mono font-bold text-xs tracking-widest text-sky-200">
            {user.memberId || '-'}
          </p>
        </div>

        <button 
          onClick={onShowQR}
          className="bg-white p-2 rounded-2xl shadow-lg hover:scale-105 transition-transform flex flex-col items-center shrink-0 cursor-pointer group"
          title="Tampilkan QR Code"
        >
          <div className="w-12 h-12 relative flex items-center justify-center text-stone-900 group-hover:text-[var(--color-primary)]">
            <QrCode size={42} strokeWidth={2.2} />
          </div>
          <span className="text-[8px] font-bold text-stone-600 mt-0.5 uppercase tracking-tight">Scan Check-in</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Dashboard Overview Tab (Harmonious Theme & In-App Booking) ─── */
function DashboardOverview({ t, locale, setActiveTab, onStartBooking, onOpenBikeCatalog, history, member, bikes, tours, catalogLoading, catalogError }) {
  const d = member;
  const [showQRModal, setShowQRModal] = useState(false);

  const promos = [
    {
      id: 1,
      badge: 'PROMO SPESIAL',
      title: 'DISKON 20%\nWEEKEND RIDE',
      subtitle: 'Semua Road Bike & MTB',
      desc: 'Berlaku setiap Sabtu & Minggu untuk booking minimal 4 jam.',
      bg: 'bg-gradient-to-br from-blue-600 to-sky-700 text-white',
      bikeId: 1,
    },
    {
      id: 2,
      badge: 'EKSKLUSIF MEMBER',
      title: 'GRATIS 1 JAM\nSEWA SEPEDA',
      subtitle: 'Klaim Poin Member',
      desc: 'Tukarkan 100 poin member untuk 1 jam gowes gratis kapan saja.',
      bg: 'bg-gradient-to-br from-sky-600 to-blue-800 text-white',
      bikeId: 3,
    },
    {
      id: 3,
      badge: 'TOUR POPULER',
      title: 'SUNRISE TRIP\nIJEN VIBES',
      subtitle: 'Paket Tour Pagi',
      desc: 'Termasuk Road Captain, helm premium, foto drone, dan snack.',
      bg: 'bg-gradient-to-br from-slate-800 to-slate-900 text-white',
      bikeId: 2,
    },
  ];

  /* Icon SENADA dengan UI Kulino Pit — Spin Wheel & Tukar Poin digabung jadi "Poin & Hadiah" */
  const quickFeatures = [
    { 
      name: 'Ride Tracker', 
      desc: 'GPS & Kalori',
      icon: <Compass size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('tracker'), 
    },
    { 
      name: 'Sewa Sepeda', 
      desc: 'Armada Unit',
      icon: <Bike size={22} className="text-[var(--color-primary)]" />, 
      action: () => onOpenBikeCatalog(),
    },
    { 
      name: 'Poin & Hadiah', 
      desc: 'Spin & Reward',
      icon: <Award size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('points'), 
    },
    { 
      name: 'Jadwal Sewa', 
      desc: 'Kalender Unit',
      icon: <CalendarDays size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('calendar'), 
    },
    { 
      name: 'Rute Gowes', 
      desc: 'Navigasi GPS',
      icon: <Navigation2 size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('routes'), 
    },
    { 
      name: 'Komisi Ajak', 
      desc: 'Referral Cuan',
      icon: <DollarSign size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('referral'), 
    },
    { 
      name: 'Riwayat Sewa', 
      desc: 'Log Booking',
      icon: <History size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('calendar'), 
    },
    { 
      name: 'Pasang PWA', 
      desc: 'Aplikasi HP',
      icon: <Download size={22} className="text-[var(--color-primary)]" />, 
      action: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-pwa-install'));
        }
      }, 
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Active Booking Countdown (if any) */}
      {history.filter(b => b.status === 'active').map(booking => (
        <ActiveBookingTimer key={booking.id} booking={booking} locale={locale} t={t} />
      ))}

      {/* Gambar 3: Floating Stats Card SENADA dengan UI (Semua card senada biru-lembut Kulino Pit) */}
      <div className="bg-white rounded-[26px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          
          {/* Stat 1: Total Pemesanan */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 hover:bg-sky-50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t('member.totalBookings')}</span>
              <Bike size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="font-display font-black text-xl text-gray-900 leading-none">
              {d.totalBookings} <span className="text-[10px] font-bold text-gray-400">trip</span>
            </p>
          </div>

          {/* Stat 2: Total Poin */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 hover:bg-sky-50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t('member.totalPoints')}</span>
              <Trophy size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="font-display font-black text-xl text-gray-900 leading-none">
              {d.points.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">pts</span>
            </p>
          </div>

          {/* Stat 3: Komisi Teman */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 hover:bg-sky-50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Komisi Teman</span>
              <DollarSign size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="font-display font-black text-lg text-gray-900 leading-none truncate">
              {formatCurrency(d.referralStats.earnings)}
            </p>
          </div>

          {/* Stat 4: Level Member */}
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80 hover:bg-sky-50 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Level Member</span>
              <Star size={18} className="text-[var(--color-primary)]" />
            </div>
            <p className="font-display font-black text-base text-gray-900 leading-none flex items-center gap-1">
              {d.level}
            </p>
          </div>
        </div>

        {/* Quick Link to Bookings or Schedule */}
        <button
          onClick={() => setActiveTab('calendar')}
          className="w-full bg-[#F8FAFC] hover:bg-sky-50 rounded-2xl p-3.5 flex justify-between items-center transition-colors group border border-gray-100 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-[var(--color-primary)]">
              <CalendarDays size={16} />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-gray-800 leading-tight">Lihat Tiket & Jadwal Booking Anda</p>
              <p className="text-[10px] text-gray-400">Cek ketersediaan armada sepeda dan kalender sewa</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
        </button>
      </div>

      {/* Live Cycling Weather Widget */}
      <CyclingWeatherCard />

      {/* Digital Member Card */}
      <DigitalMemberCard user={d} onShowQR={() => setShowQRModal(true)} />

      {/* Gambar 1: JELAJAHI 8 Menu Cepat (Semua icon senada & harmonis dengan UI) */}
      <div>
        <div className="flex justify-between items-end mb-3.5 px-1">
          <div>
            <p className="text-[var(--color-primary)] font-black text-[10px] tracking-widest uppercase mb-0.5">JELAJAHI</p>
            <h2 className="font-display font-black text-lg text-gray-900">Fitur Spesial Member</h2>
          </div>
          <span className="text-[10px] font-bold text-gray-400">8 Menu Cepat</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {quickFeatures.map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action} 
              className="flex flex-col items-center p-3 rounded-2xl bg-white border border-gray-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group cursor-pointer text-center h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50/80 group-hover:bg-sky-100 border border-sky-100/60 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-all shrink-0">
                {item.icon}
              </div>
              <p className="text-xs font-extrabold text-gray-800 leading-tight truncate w-full mb-0.5 group-hover:text-[var(--color-primary)] transition-colors">
                {item.name}
              </p>
              <p className="text-[9px] font-medium text-gray-400 truncate w-full">
                {item.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* PILIHAN HARI INI: Promo Spesial */}
      <div>
        <div className="flex justify-between items-end mb-3.5 px-1">
          <div>
            <p className="text-[var(--color-primary)] font-black text-[10px] tracking-widest uppercase mb-0.5">PILIHAN HARI INI</p>
            <h2 className="font-display font-black text-lg text-gray-900">Promo & Voucher Eksklusif</h2>
          </div>
          <button onClick={() => setActiveTab('points')} className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer">
            Lihat Reward <ChevronRight size={13} />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className={`flex-shrink-0 w-[280px] sm:w-[300px] h-[168px] rounded-[24px] ${promo.bg} p-5 relative overflow-hidden shadow-lg snap-center flex flex-col justify-between`}
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                    {promo.badge}
                  </span>
                  <span className="text-[9px] text-white/80 font-bold uppercase">{promo.subtitle}</span>
                </div>
                <h3 className="text-white text-lg font-black leading-tight drop-shadow-sm whitespace-pre-line">
                  {promo.title}
                </h3>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-white/90 text-[10px] font-medium max-w-[170px] leading-tight">
                  {promo.desc}
                </p>
                <button
                  onClick={() => {
                    const targetBike = bikes[promo.id - 1] || bikes[0];
                    if (targetBike?.available) onStartBooking(targetBike);
                  }}
                  disabled={!bikes.length}
                  className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-[10px] font-black hover:bg-gray-100 transition-colors shadow-sm shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Klaim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gambar 4 & 5: ARMADA SEPEDA SIAP GOWES — KLIK LANGSUNG KE DURASI SEWA (TETAP DI PWA MEMBER) */}
      <div>
        <div className="flex justify-between items-end mb-3.5 px-1">
          <div>
            <p className="text-[var(--color-primary)] font-black text-[10px] tracking-widest uppercase mb-0.5">ARMADA SEPEDA</p>
            <h2 className="font-display font-black text-lg text-gray-900">Pilih Unit Favorit Anda</h2>
          </div>
          <button 
            onClick={onOpenBikeCatalog}
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua <ChevronRight size={13} />
          </button>
        </div>

        {catalogLoading && <div className="rounded-2xl border border-gray-100 bg-white px-5 py-10 text-center text-xs font-semibold text-gray-400">Memuat armada dari database…</div>}
        {!catalogLoading && catalogError && <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-center text-xs font-semibold text-red-600">{catalogError}</div>}
        {!catalogLoading && !catalogError && bikes.length === 0 && <div className="rounded-2xl border border-gray-100 bg-white px-5 py-10 text-center text-xs font-semibold text-gray-400">Belum ada armada yang ditayangkan Admin.</div>}
        <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
          {bikes.slice(0, 6).map((bike) => {
            const minPrice = getLowestPrice(bike);
            return (
              <div
                key={bike.id}
                onClick={() => bike.available && onStartBooking(bike)}
                className={`flex-shrink-0 w-[260px] sm:w-[270px] bg-white rounded-[24px] p-3.5 shadow-sm border border-gray-100 transition-all group snap-center flex flex-col justify-between ${bike.available ? 'hover:border-sky-300 hover:shadow-md cursor-pointer' : 'opacity-70 cursor-not-allowed'}`}
              >
                <div>
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center p-2">
                    <Image
                      src={bike.image}
                      alt={bike.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                      sizes="260px"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[9px] font-bold text-[var(--color-primary)] uppercase shadow-xs">
                      {bike.category}
                    </span>
                    <span className={`absolute bottom-2 right-2 rounded-md px-2 py-0.5 text-[9px] font-black ${bike.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {bike.available ? `${bike.availableStock} tersedia` : 'Stok habis'}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-sm text-gray-900 leading-tight truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {bike.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {bike.specs?.groupset || 'Premium components'} • {bike.specs?.weight || 'Lightweight'}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-gray-400 block font-semibold">Mulai</span>
                    <span className="font-display font-black text-sm text-[var(--color-primary)]">
                      {formatCurrency(minPrice)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (bike.available) onStartBooking(bike);
                    }}
                    disabled={!bike.available}
                    className="btn btn-primary px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {bike.available ? 'Sewa' : 'Habis'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAKET TRIP & TOUR: Horizontal Carousel */}
      {tours.length > 0 && (
        <div>
          <div className="flex justify-between items-end mb-3.5 px-1">
            <div>
              <p className="text-[var(--color-primary)] font-black text-[10px] tracking-widest uppercase mb-0.5">PETUALANGAN</p>
              <h2 className="font-display font-black text-lg text-gray-900">Paket Trip & Tour Terpilih</h2>
            </div>
            <Link href="/trip-tour" className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={13} />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
            {tours.map((tour) => (
              <Link
                key={tour.id}
                href={`/trip-tour/${tour.slug}`}
                className="flex-shrink-0 w-[260px] bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group snap-center cursor-pointer"
              >
                <div className="relative h-28 w-full">
                  <Image
                    src={tour.image}
                    alt={tour.name[locale] || tour.name.id}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="260px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-[9px] font-bold text-gray-800">
                    {tour.duration} • {tour.distance}
                  </span>
                </div>
                <div className="p-3.5">
                  <h3 className="font-display font-bold text-xs text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 mb-1">
                    {tour.name[locale] || tour.name.id}
                  </h3>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mb-2">
                    {tour.description[locale] || tour.description.id}
                  </p>
                  <p className="font-display font-black text-xs text-[var(--color-primary)]">
                    {formatCurrency(tour.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* RIWAYAT GOWES TERAKHIR */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-sm text-gray-900 flex items-center gap-2">
            <Clock size={16} className="text-[var(--color-primary)]" /> Riwayat Booking Terakhir
          </h3>
          <span className="text-[10px] text-gray-400 font-bold">{history.length} Transaksi</span>
        </div>

        <div className="divide-y divide-gray-100">
          {history.length === 0 && (
            <div className="py-8 text-center text-xs font-medium text-gray-400">
              Belum ada transaksi booking pada akun ini.
            </div>
          )}
          {history.slice(0, 4).map((b) => (
            <div key={b.id} className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 rounded-xl px-2 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Bike size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-xs text-gray-900 truncate">{b.bike}</p>
                  <p className="text-[10px] text-gray-400">{b.date} • {b.duration} • {b.id}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-1 ${
                  b.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  b.status === 'active' ? 'bg-amber-50 text-amber-600 animate-pulse' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {b.status === 'completed' ? 'Selesai' : b.status === 'active' ? 'Aktif' : 'Akan Datang'}
                </span>
                <p className="font-display font-bold text-xs text-gray-900 mt-1">{formatCurrency(b.total)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Code Modal for Check-in — Real QR, centered, close on backdrop */}
      {showQRModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-[320px] w-full text-center shadow-2xl relative animate-slide-up border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X size={14} />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-2">
              <QrCode size={22} />
            </div>
            <h3 className="font-display font-black text-base text-gray-900">QR Check-in Member</h3>
            <p className="text-[11px] text-gray-500 mt-1 mb-4">
              Tunjukkan ke kasir atau Road Captain Kulino House.
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center mb-3">
              <MemberQRCode memberId={d.memberId} />
              <p className="font-mono font-bold text-[10px] text-gray-400 mt-2 tracking-wider">
                {d.memberId}
              </p>
            </div>

            <p className="text-[10px] text-emerald-600 font-bold mb-3 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Member VIP Terverifikasi
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="btn btn-primary w-full py-2 text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─── Real GPS Ride Tracker Tab ─── */
function RideTrackerTab({ t, locale }) {
  const [isTracking, setIsTracking] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [location, setLocation] = useState({ lat: -8.2192, lng: 114.3692 });
  const [speed, setSpeed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState(() => typeof navigator !== 'undefined' && 'geolocation' in navigator ? 'MENDETEKSI LOKASI ANDA...' : 'GPS TIDAK TERSEDIA');
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const lastCoordsRef = useRef(null);
  const lastTimeRef = useRef(null); // untuk hitung kecepatan manual
  const simulationRef = useRef(null);
  const simAngleRef = useRef(0);
  const simRadiusRef = useRef(0);
  const simCenterRef = useRef({ lat: -8.2192, lng: 114.3692 });
  const realUserLocationRef = useRef(null);

  // Leaflet map refs
  const mapRef = useRef(null);       // Leaflet map instance
  const markerRef = useRef(null);    // Leaflet marker instance
  const mapContainerRef = useRef(null); // DOM div

  // ── Init Leaflet map saat komponen mount ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Inject Leaflet CSS + JS jika belum ada
    const initLeaflet = () => {
      const L = window.L;
      if (!L || !mapContainerRef.current || mapRef.current) return;
      mapRef.current = L.map(mapContainerRef.current, {
        center: [-8.2192, 114.3692],
        zoom: 16,
        zoomControl: true,
        attributionControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);
      // Custom marker icon
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:22px;height:22px;background:#4BA3E3;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(75,163,227,0.7);position:relative">
          <div style="width:8px;height:8px;background:white;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"></div>
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      markerRef.current = L.marker([-8.2192, 114.3692], { icon }).addTo(mapRef.current);
    };

    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css';
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initLeaflet;
      document.head.appendChild(script);
    } else if (window.L) {
      initLeaflet();
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // ── Update marker posisi saat location berubah ──
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([location.lat, location.lng]);
      mapRef.current.panTo([location.lat, location.lng], { animate: true, duration: 1 });
    }
  }, [location]);

  // ── Ambil lokasi real user saat komponen mount ──
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          realUserLocationRef.current = { lat: latitude, lng: longitude };
          setLocation({ lat: latitude, lng: longitude });
          simCenterRef.current = { lat: latitude, lng: longitude };
          setGpsStatus('LOKASI DITEMUKAN');
        },
        (err) => {
          console.warn('Gagal mendapatkan lokasi awal:', err);
          setGpsStatus('GPS TIDAK TERSEDIA');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const avgSpeed = time > 0 ? (distance / (time / 3600)).toFixed(1) : '0.0';

  const calculateCalories = () => {
    const speedKmh = parseFloat(avgSpeed);
    let kcalPerKm = 30;
    if (speedKmh > 20) kcalPerKm = 40;
    else if (speedKmh > 15) kcalPerKm = 35;
    return Math.floor(distance * kcalPerKm);
  };
  
  const caloriesBurned = calculateCalories();

  const startSimulation = (centerLat, centerLng) => {
    simCenterRef.current = { lat: centerLat, lng: centerLng };
    simAngleRef.current = Math.random() * 360;
    simRadiusRef.current = 0;
    lastCoordsRef.current = { lat: centerLat, lng: centerLng };
    setGpsStatus('GPS SIMULASI (AKTIF)');

    simulationRef.current = setInterval(() => {
      // Simulasi pergerakan bersepeda
      simAngleRef.current += 0.8;
      simRadiusRef.current = Math.min(simRadiusRef.current + 0.00003, 0.008);
      const rad = simAngleRef.current * (Math.PI / 180);
      const newLat = simCenterRef.current.lat + simRadiusRef.current * Math.sin(rad);
      const newLng = simCenterRef.current.lng + simRadiusRef.current * Math.cos(rad);

      if (lastCoordsRef.current) {
        const dist = getDistanceFromLatLonInKm(
          lastCoordsRef.current.lat,
          lastCoordsRef.current.lng,
          newLat,
          newLng
        );
        setDistance(prev => prev + dist);
      }

      const simSpeed = (15 + Math.sin(simAngleRef.current * 0.05) * 5).toFixed(1);
      setSpeed(simSpeed);
      lastCoordsRef.current = { lat: newLat, lng: newLng };
      setLocation({ lat: newLat, lng: newLng });
    }, 1500);
  };

  const handleToggleTrack = () => {
    if (isTracking) {
      // ── STOP TRACKING ──
      setIsTracking(false);
      setGpsStatus('TRACKING DIHENTIKAN');
      if (watchIdRef.current && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (simulationRef.current) { clearInterval(simulationRef.current); simulationRef.current = null; }
    } else {
      // ── START TRACKING — reset semua data dulu ──
      setTime(0);
      setDistance(0);
      setSpeed(0);
      lastCoordsRef.current = null;
      setIsTracking(true);
      setIsLocating(true);
      setGpsStatus('MENCARI POSISI GPS...');

      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        // Ambil posisi awal yang presisi sebelum mulai watch
        navigator.geolocation.getCurrentPosition(
          (initPos) => {
            const { latitude, longitude } = initPos.coords;
            realUserLocationRef.current = { lat: latitude, lng: longitude };
            lastCoordsRef.current = { lat: latitude, lng: longitude };
            setLocation({ lat: latitude, lng: longitude });
            setIsLocating(false);
            setGpsStatus('SINYAL GPS TERKUNCI');

            // Mulai watch setelah dapat posisi awal
            watchIdRef.current = navigator.geolocation.watchPosition(
              (position) => {
                setGpsStatus('SINYAL GPS TERKUNCI');
                const { latitude: lat, longitude: lng, speed: gpsSpd, accuracy } = position.coords;
                const now = Date.now();

                // Gunakan GPS speed jika tersedia, jika tidak hitung manual
                if (gpsSpd !== null && gpsSpd !== undefined && gpsSpd >= 0) {
                  setSpeed((gpsSpd * 3.6).toFixed(1));
                }

                if (lastCoordsRef.current) {
                  const dist = getDistanceFromLatLonInKm(
                    lastCoordsRef.current.lat,
                    lastCoordsRef.current.lng,
                    lat,
                    lng
                  );
                  // Filter noise GPS (minimal 3 meter pergerakan, accuracy < 30m)
                  if (dist > 0.003 && (accuracy == null || accuracy < 30)) {
                    setDistance(prev => prev + dist);
                    // Hitung kecepatan dari jarak & waktu jika GPS tidak kasih speed
                    if ((gpsSpd === null || gpsSpd === undefined) && lastTimeRef.current) {
                      const dtSeconds = (now - lastTimeRef.current) / 1000;
                      if (dtSeconds > 0) {
                        const calculatedSpeed = (dist * 1000) / dtSeconds * 3.6; // km/h
                        setSpeed(Math.min(calculatedSpeed, 60).toFixed(1)); // cap 60 km/h
                      }
                    }
                    lastCoordsRef.current = { lat, lng };
                    lastTimeRef.current = now;
                  }
                } else {
                  lastCoordsRef.current = { lat, lng };
                  lastTimeRef.current = now;
                }

                setLocation({ lat, lng });
              },
              (error) => {
                console.warn('GPS watch error, beralih ke simulasi:', error);
                setIsLocating(false);
                const center = realUserLocationRef.current || { lat: -8.2192, lng: 114.3692 };
                startSimulation(center.lat, center.lng);
              },
              { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
            );
          },
          (initError) => {
            console.warn('Tidak bisa ambil posisi awal, beralih ke simulasi:', initError);
            setIsLocating(false);
            const center = realUserLocationRef.current || { lat: -8.2192, lng: 114.3692 };
            startSimulation(center.lat, center.lng);
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
      } else {
        setIsLocating(false);
        const center = realUserLocationRef.current || { lat: -8.2192, lng: 114.3692 };
        startSimulation(center.lat, center.lng);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (simulationRef.current) clearInterval(simulationRef.current);
    };
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const shareText = `🚴 Sesi Gowes Bersama Kulino Pit Banyuwangi!\n⏱ Waktu: ${formatTime(time)}\n📏 Jarak: ${distance.toFixed(2)} km\n⚡ Kec. Rata: ${avgSpeed} km/h\n🔥 Kalori: ${caloriesBurned} kcal\n\n#KulinoPit #GowesBanyuwangi #ExploreBanyuwangi`;
  const shareUrl = 'https://kulino-pit.vercel.app';
  const [shareCardBg, setShareCardBg] = useState(null); // custom background image
  const shareCanvasRef = useRef(null);
  const bgInputRef = useRef(null);

  const generateShareImage = () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return null;
    const W = 540, H = 960;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background
    if (shareCardBg) {
      ctx.drawImage(shareCardBg, 0, 0, W, H);
      // Dark overlay
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, W, H);
    } else {
      // Gradient dark background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Accent line top
    ctx.fillStyle = '#E05A2B';
    ctx.fillRect(0, 0, W, 5);

    // Brand tag top
    ctx.font = 'bold 22px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'center';
    ctx.fillText('KULINO PIT', W/2, 60);
    ctx.font = '14px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('Banyuwangi Cycling', W/2, 84);

    // Divider
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(W/2 - 80, 100, 160, 1);

    // Stats
    const stats = [
      { label: 'Jarak', value: `${distance.toFixed(2)} km` },
      { label: 'Waktu', value: formatTime(time) },
      { label: 'Kec. Rata-rata', value: `${avgSpeed} km/h` },
      { label: 'Kalori', value: `${caloriesBurned} kcal` },
    ];

    const startY = 180;
    const gap = 170;
    stats.forEach((s, i) => {
      const y = startY + i * gap;
      ctx.font = 'bold 18px Inter, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(s.label.toUpperCase(), W/2, y);
      ctx.font = `bold ${i === 0 ? 96 : 80}px Inter, Arial, sans-serif`;
      ctx.fillStyle = i === 0 ? '#E05A2B' : '#ffffff';
      ctx.fillText(s.value, W/2, y + (i === 0 ? 100 : 88));
    });

    // Bottom divider
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(W/2 - 80, H - 100, 160, 1);

    // Bottom branding
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.textAlign = 'center';
    ctx.fillText('kulino-pit.vercel.app', W/2, H - 60);

    // Accent line bottom
    ctx.fillStyle = '#E05A2B';
    ctx.fillRect(0, H - 5, W, 5);

    return canvas;
  };

  const handleDownloadCard = () => {
    const canvas = generateShareImage();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `kulino-pit-gowes-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShareWhatsApp = () => {
    const canvas = generateShareImage();
    if (!canvas) {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
      return;
    }
    // Try Web Share API first (mobile)
    canvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'kulino-pit-gowes.png', { type: 'image/png' });
        try {
          await navigator.share({ files: [file], text: shareText, url: shareUrl });
          return;
        } catch(e) {}
      }
      // Fallback: download + open WA
      handleDownloadCard();
      setTimeout(() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank'), 500);
    }, 'image/png');
  };

  const handleBgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setShareCardBg(img);
      generateShareImage();
    };
    img.src = URL.createObjectURL(file);
  };

  // Re-render canvas preview when modal opens or bg changes
  useEffect(() => {
    if (showShareModal) {
      setTimeout(() => generateShareImage(), 100);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShareModal, shareCardBg, time, distance, speed, caloriesBurned]);


  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[26px] overflow-hidden shadow-sm border border-gray-100">
        
        {/* Leaflet Real-time Map */}
        <div className="h-64 sm:h-72 bg-gray-100 relative overflow-hidden border-b border-gray-100">
          {/* Map Container */}
          <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ background: '#e8f0f7' }} />

          {/* GPS Status Badge */}
          <div className="z-10 absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-gray-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              isTracking ? 'bg-emerald-500 animate-ping' : 
              isLocating ? 'bg-amber-400 animate-pulse' : 
              'bg-gray-400'
            }`} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-none">Status GPS</p>
              <p className="font-display font-black text-xs text-gray-800 leading-none mt-0.5">{gpsStatus}</p>
            </div>
          </div>

          {/* Speed overlay saat tracking */}
          {isTracking && (
            <div className="z-10 absolute bottom-4 right-4 bg-[var(--color-primary)] text-white rounded-2xl px-3 py-2 shadow-md text-center">
              <p className="font-display font-black text-lg leading-none">{speed || '0.0'}</p>
              <p className="text-[9px] font-bold opacity-80">km/h</p>
            </div>
          )}
        </div>

        {/* Live Metrics Grid */}
        <div className="p-5 sm:p-6 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="p-3.5 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-center gap-1">
                <Clock size={11} /> Waktu
              </p>
              <p className="font-display font-black text-xl text-gray-900 tabular-nums">{formatTime(time)}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-center gap-1">
                <Compass size={11} /> Jarak
              </p>
              <p className="font-display font-black text-xl text-gray-900 tabular-nums">
                {distance.toFixed(2)} <span className="text-xs text-gray-400">km</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-center gap-1">
                <MapPin size={11} /> Kecepatan
              </p>
              <p className="font-display font-black text-xl text-[var(--color-primary)] tabular-nums">
                {isTracking ? speed || avgSpeed : '0.0'} <span className="text-xs text-gray-400">km/h</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 flex items-center justify-center gap-1">
                <Flame size={11} className="text-orange-500" /> Kalori
              </p>
              <p className="font-display font-black text-xl text-orange-600 tabular-nums">
                {caloriesBurned} <span className="text-xs text-gray-400">kcal</span>
              </p>
            </div>
          </div>

          {/* Start/Stop Track + Share */}
          <div className="flex gap-3">
            <button
              onClick={handleToggleTrack}
              disabled={isLocating}
              className={`btn flex-1 py-3.5 font-display font-black text-base tracking-wider shadow-md transition-all cursor-pointer ${
                isLocating
                  ? 'bg-amber-400 text-white shadow-amber-200 animate-pulse cursor-not-allowed'
                  : isTracking 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                  : 'btn-primary shadow-sky-200'
              }`}
            >
              {isLocating ? '📍 Mendapatkan Lokasi...' : isTracking ? '■ Hentikan Gowes' : '▶ Mulai Gowes Sekarang'}
            </button>
            <button
              onClick={() => setShowShareModal(!showShareModal)}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3.5 flex items-center gap-2 font-bold text-xs cursor-pointer"
              title="Bagikan Sesi Gowes"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Bagikan</span>
            </button>
          </div>

          {/* Share Modal — Strava Style */}
          {showShareModal && (
            <div className="mt-4 rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden animate-fade-in">
              {/* Card preview */}
              <div className="relative flex items-center justify-center bg-gray-950 p-4 pb-2">
                <canvas
                  ref={shareCanvasRef}
                  style={{ width: '100%', maxWidth: 270, borderRadius: 12, display: 'block' }}
                />
              </div>

              {/* Actions */}
              <div className="p-4 space-y-3">
                {/* Change background */}
                <button
                  onClick={() => bgInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-600 text-gray-300 text-xs font-bold hover:border-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span>🖼️</span>
                  {shareCardBg ? 'Ganti Foto Background' : 'Tambah Foto Background'}
                </button>
                <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgChange} />

                {/* Share buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                  <button
                    onClick={handleDownloadCard}
                    className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>📥</span> Simpan & Instagram
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                    className="bg-stone-800 hover:bg-stone-700 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>𝕏</span> Twitter
                  </button>
                  <button
                    onClick={handleDownloadCard}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>⬇️</span> Download
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 text-center">Gambar diunduh → buka Instagram → pilih dari galeri</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Challenge */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-[26px] p-5 sm:p-6 shadow-md flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Trophy size={28} className="text-amber-300" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-display font-black text-sm">Tantangan Bulanan: 100 KM Banyuwangi</h4>
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">45% Finis</span>
          </div>
          <p className="text-xs text-white/80 mb-2">Gowes minimal 100 km bulan ini untuk medali digital & 200 poin bonus!</p>
          <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-300 h-full rounded-full" style={{ width: '45%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Calendar Tab ─── */
function CalendarTab({ t, locale, history }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return history.filter((booking) => String(booking.date || '').slice(0, 10) === dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex gap-3 items-center">
        <Info className="text-sky-600 shrink-0" size={18} />
        <p className="text-xs font-medium text-sky-900">{t('member.calendarInfo')}</p>
      </div>

      <div className="bg-white rounded-[26px] overflow-hidden shadow-sm border border-gray-100">
        <div className="p-4 bg-[var(--color-primary)] text-white text-center">
          <h3 className="font-display font-black text-lg">{monthName}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(locale === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(d => (
              <div key={d} className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const bookings = getBookingsForDay(day);
              const isToday = day === today.getDate();
              return (
                <div key={day} className={`relative min-h-[64px] rounded-xl border p-1 text-[10px] transition-colors
                  ${isToday ? 'border-[var(--color-primary)] bg-sky-50/60' : 'border-gray-100 hover:border-gray-200'}
                  ${bookings.length > 0 ? 'bg-orange-50/40' : ''}`}>
                  <span className={`font-bold ${isToday ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {bookings.map((b, j) => (
                      <div key={j} className="bg-orange-100 text-orange-800 rounded px-1 py-0.5 text-[7px] truncate font-bold">
                        {(b.bike || b.bikeName || 'Sepeda').split(' ').slice(0, 2).join(' ')}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Rute Gowes Tab (Cycling Route Navigation - Inspired by Sewa Jetski Banyuwangi) ─── */
function RuteGowesTab({ t, locale }) {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [userPosition, setUserPosition] = useState(null);
  const [reachedCheckpoints, setReachedCheckpoints] = useState(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const simCheckpointIdxRef = useRef(0);
  const simProgressRef = useRef(0);

  const [cyclingRoutes, setCyclingRoutes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/routes', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => {
        if (cancelled) return;
        setCyclingRoutes(items.map((route) => ({
          ...route,
          name: route.name?.[locale] || route.name?.id || route.name || '',
          description: route.description?.[locale] || route.description?.id || route.description || '',
          difficulty: route.difficulty?.[locale] || route.difficulty?.id || route.difficulty || 'Pemula',
        })));
      })
      .catch(() => { if (!cancelled) setCyclingRoutes([]); });
    return () => { cancelled = true; };
  }, [locale]);

  const startRouteSimulation = (route) => {
    const cps = route?.checkpoints;
    if (!cps || cps.length < 2) {
      // Free-ride simulation from Banyuwangi center
      const center = { lat: -8.2192, lng: 114.3692 };
      let angle = 0;
      let radius = 0;
      let prevPos = null;
      simIntervalRef.current = setInterval(() => {
        angle += 1;
        radius = Math.min(radius + 0.00004, 0.01);
        const rad = angle * (Math.PI / 180);
        const newLat = center.lat + radius * Math.sin(rad);
        const newLng = center.lng + radius * Math.cos(rad);
        const newPos = { lat: newLat, lng: newLng };
        if (prevPos) {
          const R = 6371;
          const dLat = (newLat - prevPos.lat) * Math.PI / 180;
          const dLon = (newLng - prevPos.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(prevPos.lat*Math.PI/180)*Math.cos(newLat*Math.PI/180)*Math.sin(dLon/2)**2;
          const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          setDistanceTraveled(prev => prev + distKm);
        }
        const simSpeed = Math.round(14 + Math.sin(angle * 0.04) * 5);
        setCurrentSpeed(simSpeed);
        setUserPosition(newPos);
        prevPos = newPos;
      }, 2000);
      return;
    }

    simCheckpointIdxRef.current = 0;
    simProgressRef.current = 0;

    simIntervalRef.current = setInterval(() => {
      const idx = simCheckpointIdxRef.current;
      const nextIdx = (idx + 1) % cps.length;
      const from = cps[idx];
      const to = cps[nextIdx];

      simProgressRef.current += 0.05;
      if (simProgressRef.current >= 1) {
        simProgressRef.current = 0;
        simCheckpointIdxRef.current = nextIdx;
      }

      const t = simProgressRef.current;
      const newLat = from.lat + (to.lat - from.lat) * t;
      const newLng = from.lng + (to.lng - from.lng) * t;
      const newPos = { lat: newLat, lng: newLng };

      const R = 6371;
      const dLat = (to.lat - from.lat) * Math.PI / 180;
      const dLon = (to.lng - from.lng) * Math.PI / 180;
      const segDistKm = R * 2 * Math.atan2(
        Math.sqrt(Math.sin(dLat/2)**2 + Math.cos(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.sin(dLon/2)**2),
        Math.sqrt(1 - (Math.sin(dLat/2)**2 + Math.cos(from.lat*Math.PI/180)*Math.cos(to.lat*Math.PI/180)*Math.sin(dLon/2)**2))
      );
      setDistanceTraveled(prev => prev + segDistKm * 0.05);

      const simSpeed = Math.round(16 + Math.sin(Date.now() / 3000) * 6);
      setCurrentSpeed(simSpeed);
      setUserPosition(newPos);
    }, 1500);
  };

  // GPS Watcher
  useEffect(() => {
    if (!isNavigating || isPaused) return;
    let prevPos = null;
    let prevTime = Date.now();
    let watchId = null;

    const setupSimulation = () => {
      if (!simIntervalRef.current) {
        startRouteSimulation(selectedRoute);
      }
    };

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          // Stop any simulation if real GPS kicks in
          if (simIntervalRef.current) {
            clearInterval(simIntervalRef.current);
            simIntervalRef.current = null;
          }
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newPos = { lat, lng };
          setUserPosition(newPos);

          let speed = pos.coords.speed ? pos.coords.speed * 3.6 : 0;
          if (!pos.coords.speed && prevPos) {
            const timeDiff = (Date.now() - prevTime) / 1000;
            if (timeDiff > 1) {
              const R = 6371;
              const dLat = (lat - prevPos.lat) * Math.PI / 180;
              const dLon = (lng - prevPos.lng) * Math.PI / 180;
              const a = Math.sin(dLat/2)**2 + Math.cos(prevPos.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLon/2)**2;
              const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              speed = distKm / (timeDiff / 3600);
              setDistanceTraveled(prev => prev + distKm);
            }
          } else if (pos.coords.speed && prevPos) {
            const timeDiff = (Date.now() - prevTime) / 1000;
            setDistanceTraveled(prev => prev + (speed / 3600) * timeDiff);
          }

          prevPos = newPos;
          prevTime = Date.now();
          setCurrentSpeed(Math.min(60, Math.round(speed)));

          // Checkpoint detection (within 80m)
          if (selectedRoute?.checkpoints) {
            selectedRoute.checkpoints.forEach((cp, idx) => {
              const cpId = cp.id || `cp-${idx}`;
              if (reachedCheckpoints.has(cpId)) return;
              const R2 = 6371;
              const dLat2 = (cp.lat - lat) * Math.PI / 180;
              const dLon2 = (cp.lng - lng) * Math.PI / 180;
              const a2 = Math.sin(dLat2/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(cp.lat*Math.PI/180)*Math.sin(dLon2/2)**2;
              const distKm2 = R2 * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1-a2));
              if (distKm2 <= 0.08) {
                setReachedCheckpoints(prev => new Set(prev).add(cpId));
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
              }
            });
          }
        },
        () => {
          // GPS failed — start simulation
          setupSimulation();
        },
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 6000 }
      );
    } else {
      // No geolocation support
      setupSimulation();
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating, isPaused, selectedRoute]);

  // Timer
  useEffect(() => {
    if (isNavigating && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isNavigating, isPaused]);

  const formatTimer = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
  };

  const startNavigation = (route) => {
    setSelectedRoute(route);
    setIsNavigating(true);
    setElapsedTime(0);
    setDistanceTraveled(0);
    setCurrentSpeed(0);
    setReachedCheckpoints(new Set());
    setIsPaused(false);
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
    setElapsedTime(0);
    setDistanceTraveled(0);
    setCurrentSpeed(0);
    setReachedCheckpoints(new Set());
    clearInterval(timerRef.current);
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  // NAVIGASI AKTIF VIEW
  if (isNavigating && selectedRoute) {
    const checkpoints = selectedRoute.checkpoints || [];
    const totalCheckpoints = checkpoints.length;
    const completedCheckpoints = reachedCheckpoints.size;
    const progressPct = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 0;

    return (
      <div className="space-y-5">
        {/* Active Route Header */}
        <div className="bg-gradient-to-br from-slate-900 to-sky-950 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-primary)]/20 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedRoute.color || '#0EA5E9'}25` }}>
                  <Navigation2 size={20} style={{ color: selectedRoute.color || '#0EA5E9' }} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">Navigasi Aktif</p>
                  <h3 className="font-display font-black text-sm text-white leading-tight">{selectedRoute.name}</h3>
                </div>
              </div>
              <button onClick={stopNavigation} className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/30 transition-colors cursor-pointer">
                Berhenti
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-sky-200 font-bold mb-1">
                <span>Progress Checkpoint</span>
                <span>{completedCheckpoints}/{totalCheckpoints} ({progressPct}%)</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Live Telemetry HUD */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Waktu</p>
                <p className="font-mono font-black text-lg text-sky-300">{formatTimer(elapsedTime)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Jarak</p>
                <p className="font-mono font-black text-lg text-emerald-300">{distanceTraveled.toFixed(1)} <span className="text-[10px] text-slate-400">km</span></p>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Kecepatan</p>
                <p className="font-mono font-black text-lg text-amber-300">{currentSpeed} <span className="text-[10px] text-slate-400">km/h</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Google Maps + GPS Navigation Map */}
        <LiveRouteNavMap
          route={selectedRoute}
          userPosition={userPosition}
          reachedCheckpoints={reachedCheckpoints}
        />

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors ${
              isPaused 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
            }`}
          >
            {isPaused ? <><Play size={16} /> Lanjutkan</> : <><Square size={14} /> Jeda</>}
          </button>
          <button
            onClick={stopNavigation}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-md cursor-pointer transition-colors"
          >
            <Square size={14} /> Selesai Gowes
          </button>
        </div>

        {/* Checkpoint List */}
        <div className="bg-white rounded-[26px] p-5 shadow-sm border border-gray-100">
          <h3 className="font-display font-black text-sm text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-[var(--color-primary)]" /> Checkpoint Rute ({completedCheckpoints}/{totalCheckpoints})
          </h3>
          <div className="space-y-2">
            {checkpoints.map((cp, idx) => {
              const cpId = cp.id || `cp-${idx}`;
              const isReached = reachedCheckpoints.has(cpId);
              return (
                <div key={cpId} className={`p-3 rounded-xl flex items-center gap-3 transition-all ${
                  isReached ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50 border border-gray-100'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isReached ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {isReached ? '✓' : idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={`font-bold text-xs ${isReached ? 'text-emerald-800' : 'text-gray-900'}`}>{cp.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{cp.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ROUTE SELECTION VIEW
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-[26px] p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center">
            <Navigation2 size={22} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="font-display font-black text-base text-gray-900">Rute Gowes Banyuwangi</h2>
            <p className="text-[10px] text-gray-500 font-medium">Panduan jalur bersepeda interaktif dengan GPS tracking.</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed bg-sky-50 p-3 rounded-xl border border-sky-100">
          Pilih rute gowes di bawah ini untuk memulai navigasi. GPS akan otomatis melacak posisi, kecepatan, dan jarak tempuh Anda secara real-time.
        </p>
      </div>

      {/* Route Cards */}
      {cyclingRoutes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-[26px] border border-gray-100 shadow-sm">
          <Navigation2 size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500 font-medium">Belum ada rute aktif yang tersedia.</p>
          <p className="text-xs text-gray-400 mt-1">Admin dapat membuat rute baru di halaman Admin → Rute Gowes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cyclingRoutes.map((route) => {
            const checkpointsCount = route.checkpoints?.length || 0;
            const isPro = route.difficulty === 'Mahir';
            const isMedium = route.difficulty === 'Menengah';

            return (
              <div
                key={route.id}
                onClick={() => startNavigation(route)}
                className="bg-white hover:bg-sky-50/30 rounded-[24px] p-5 border border-gray-100 hover:border-sky-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform" 
                      style={{ backgroundColor: `${route.color || '#0EA5E9'}15`, color: route.color || '#0EA5E9' }}
                    >
                      <Navigation2 size={24} style={{ color: route.color || '#0EA5E9' }} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base text-gray-900 group-hover:text-[var(--color-primary)] transition-colors leading-snug truncate">
                        {route.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          isPro ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          isMedium ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {route.difficulty || 'Pemula'}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {route.duration_min ? `${route.duration_min} mnt` : '45 mnt'}
                        </span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-gray-500 font-semibold">
                          {route.distance_km ? `${route.distance_km} km` : '~5 km'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors shrink-0 mt-1">
                    <ChevronRight size={18} />
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-2 mb-3">
                  {route.description}
                </p>

                {/* Checkpoints & CTA Strip */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-gray-600 font-bold">
                    <MapPin size={13} className="text-[var(--color-primary)]" />
                    <span>{checkpointsCount} Titik Checkpoint</span>
                  </div>
                  <span className="text-xs font-black text-[var(--color-primary)] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Mulai Navigasi</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Free Ride Option */}
      <button 
        onClick={() => startNavigation({ 
          id: 'free-ride', 
          name: 'Jelajah Bebas', 
          description: 'Bersepeda bebas tanpa rute panduan, GPS tetap aktif.',
          color: '#64748B',
          checkpoints: [],
          difficulty: 'Bebas',
          distance_km: '-',
          duration_min: '-'
        })}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold p-4 rounded-[22px] border-2 border-dashed border-gray-200 text-center text-xs tracking-wider uppercase transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
      >
        <Compass size={16} />
        <span>Jelajah Bebas (Tanpa Jalur Panduan)</span>
      </button>
    </div>
  );
}

function getRewardIcon(reward) {
  switch (reward.id) {
    case 1:
      return (
        <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 text-sky-600 shadow-sm">
          <Tag size={19} />
        </div>
      );
    case 2:
      return (
        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 text-teal-600 shadow-sm">
          <HardHat size={19} />
        </div>
      );
    case 3:
      return (
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-sm">
          <Shirt size={19} />
        </div>
      );
    case 4:
    default:
      return (
        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-sm">
          <Bike size={19} />
        </div>
      );
  }
}

/* ─── Spin Wheel & Points Tab ─── */
function SpinWheelAndPointsTab({ t, locale, startingPoints = 0, onPointsChange }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [spinHistory, setSpinHistory] = useState([]);
  const [currentPoints, setCurrentPoints] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('memberPoints') || String(startingPoints || 0));
    }
    return startingPoints || 0;
  });

  // Prize claim modal
  const [claimModal, setClaimModal] = useState(null); // { type: 'spin'|'exchange', prize, code }
  
  // Exchange confirm modal
  const [exchangeModal, setExchangeModal] = useState(null); // reward object

  const defaultPrizes = [
    { label: 'Diskon 10%', color: '#0284C7', chance: 25 },
    { label: 'Gratis Helm', color: '#0D9488', chance: 15 },
    { label: 'Voucher 50K', color: '#D97706', chance: 20 },
    { label: 'Coba Lagi', color: '#475569', chance: 25 },
    { label: 'Gratis 1 Jam', color: '#2563EB', chance: 10 },
    { label: 'Jersey Kulino', color: '#059669', chance: 5 },
  ];

  const [prizes, setPrizes] = useState(defaultPrizes);

  useEffect(() => {
    fetch('/api/spin-prizes', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Failed to load prizes')))
      .then((data) => {
        if (Array.isArray(data) && data.length >= 2) setPrizes(data);
      })
      .catch(console.error);
  }, []);

  const SPIN_COST = 100;

  const drawWheel = useCallback((ctx, w, h, currentRotation) => {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 10;
    const sliceAngle = (2 * Math.PI) / prizes.length;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((currentRotation * Math.PI) / 180);

    prizes.forEach((prize, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 4;
      ctx.fillText(prize.label, r - 18, 4);
      ctx.restore();
    });

    ctx.restore();

    // Outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center pin
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#0284C7';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', cx, cy);

    // Arrow pointer at top
    ctx.beginPath();
    ctx.moveTo(cx - 11, 7);
    ctx.lineTo(cx + 11, 7);
    ctx.lineTo(cx, 27);
    ctx.closePath();
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [prizes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);
    drawWheel(ctx, 300, 300, rotation);
  }, [rotation, drawWheel]);

  const handleSpin = () => {
    if (isSpinning || currentPoints < SPIN_COST) return;
    setIsSpinning(true);
    setResult(null);

    // Pick winner by chance
    const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
    let rand = Math.random() * totalChance;
    let winIndex = 0;
    for (let i = 0; i < prizes.length; i++) {
      rand -= prizes[i].chance;
      if (rand <= 0) { winIndex = i; break; }
    }

    // FIX: Always land exactly at CENTER of winning segment (not on border)
    // The pointer is at top (270°). Wheel rotates clockwise. Segment i starts at i*sliceDeg.
    // To land segment winIndex under top pointer, we need to rotate so that
    // the CENTER of that segment is at 270° (= -90°).
    const sliceDeg = 360 / prizes.length;
    // Center of winning segment in wheel coords
    const segmentCenter = winIndex * sliceDeg + sliceDeg / 2;
    // We need: (rotation + segmentCenter) mod 360 == 270 (pointer at top = -90 = 270)
    // Additional small random jitter within ±30% of half-slice so it clearly lands IN the segment
    const maxJitter = (sliceDeg * 0.28);
    const jitter = (Math.random() * 2 - 1) * maxJitter;
    // How much the wheel needs to be at
    const neededBase = (270 - segmentCenter - jitter + 3600) % 360;
    // Add multiple full rotations so it spins 5-8 times
    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const currentNorm = ((rotation % 360) + 360) % 360;
    const diff = (neededBase - currentNorm + 360) % 360;
    const targetRotation = rotation + extraSpins * 360 + diff;

    const duration = 4000;
    const startTime = performance.now();
    const startRotation = rotation;
    const delta = targetRotation - startRotation;

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentRot = startRotation + delta * easedProgress;
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        setIsSpinning(false);
        const won = prizes[winIndex];
        setResult(won);

        // Deduct spin cost and save
        const newPoints = currentPoints - SPIN_COST;
        setCurrentPoints(newPoints);
        localStorage.setItem('memberPoints', String(newPoints));
        onPointsChange?.(newPoints);

        // Save spin history
        setSpinHistory(prev => [
          { prize: won.label, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 4),
        ]);

        // Show claim modal (not for "Coba Lagi")
        if (won.label !== 'Coba Lagi') {
          const claimCode = `KP-SPIN-${Date.now().toString(36).toUpperCase()}`;
          setTimeout(() => {
            setClaimModal({ type: 'spin', prize: won.label, code: claimCode });
          }, 600);
        }
      }
    }
    requestAnimationFrame(animate);
  };

  const handleExchange = (reward) => {
    if (currentPoints < reward.cost) return;
    setExchangeModal(reward);
  };

  const confirmExchange = () => {
    if (!exchangeModal) return;
    const newPoints = currentPoints - exchangeModal.cost;
    setCurrentPoints(newPoints);
    localStorage.setItem('memberPoints', String(newPoints));
    onPointsChange?.(newPoints);
    const claimCode = `KP-XCH-${Date.now().toString(36).toUpperCase()}`;
    setClaimModal({ type: 'exchange', prize: exchangeModal.name[locale] || exchangeModal.name.id, code: claimCode });
    setExchangeModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header — lighter gradient so text is clearly visible */}
      <div className="rounded-[28px] p-5 bg-gradient-to-r from-sky-700 via-sky-600 to-blue-700 text-white shadow-lg border border-sky-400/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-xl flex items-center gap-2">
            <RotateCcw size={22} className="text-white" /> Spin &amp; Win Lucky Wheel
          </h2>
          <p className="text-xs text-white/90 mt-1">
            Biaya 100 poin per putaran • Saldo Anda: {currentPoints.toLocaleString()} pts
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-300" /> {currentPoints.toLocaleString()} pts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Canvas Wheel */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-6 shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="relative w-[300px] h-[300px] mb-5">
            <canvas ref={canvasRef} style={{ width: 300, height: 300 }} />
            <button
              onClick={handleSpin}
              disabled={isSpinning || currentPoints < SPIN_COST}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full font-black text-xs z-10 transition-all flex items-center justify-center border-2 border-white shadow-xl ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-wait'
                  : currentPoints < SPIN_COST
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-sky-500 to-sky-600 text-white hover:scale-110 cursor-pointer shadow-sky-500/30'
              }`}
            >
              {isSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || currentPoints < SPIN_COST}
            className={`btn w-full py-3.5 font-display font-black text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              isSpinning 
                ? 'bg-gray-300 text-gray-500 cursor-wait' 
                : currentPoints < SPIN_COST 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'btn-primary shadow-md'
            }`}
          >
            <RotateCcw size={16} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Sedang Memutar...' : `Putar Sekarang (${SPIN_COST} Pts)`}
          </button>

          {result && (
            <div className={`mt-5 w-full p-5 rounded-2xl border text-center animate-fade-in ${
              result.label === 'Coba Lagi' ? 'bg-gray-50 border-gray-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <Gift className={`mx-auto mb-2 ${result.label === 'Coba Lagi' ? 'text-gray-400' : 'text-amber-500'}`} size={32} />
              <p className="text-xs text-gray-500 font-bold">
                {result.label === 'Coba Lagi' ? 'Sayang sekali...' : 'Selamat! Anda Memenangkan:'}
              </p>
              <p className="font-display font-black text-2xl text-gray-900 mt-1">{result.label}</p>
              {result.label !== 'Coba Lagi' && (
                <p className="text-[10px] text-amber-700 mt-2 font-semibold">
                  🎉 Kode klaim sudah tersimpan. Tunjukkan ke admin saat checkout.
                </p>
              )}
            </div>
          )}

          {/* Spin history */}
          {spinHistory.length > 0 && (
            <div className="mt-4 w-full">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Riwayat Spin</p>
              {spinHistory.map((s, i) => (
                <div key={i} className="flex justify-between text-[11px] py-1 border-b border-gray-50">
                  <span className="font-semibold text-gray-700">{s.prize}</span>
                  <span className="text-gray-400">{s.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rewards Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[26px] p-5 shadow-sm border border-slate-100">
            <h3 className="font-display font-black text-xs text-slate-900 mb-3 flex items-center gap-2">
              <Award size={15} className="text-amber-500" /> Katalog Penukaran Poin
            </h3>
            <div className="space-y-2.5">
              {memberRewards.map(reward => (
                <div key={reward.id} className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 transition-colors">
                  <div className="flex items-center gap-3">
                    {getRewardIcon(reward)}
                    <div>
                      <p className="font-display font-bold text-xs text-slate-900">{reward.name[locale] || reward.name.id}</p>
                      <p className="text-[11px] text-[var(--color-primary)] font-black mt-0.5">{reward.cost.toLocaleString()} Pts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleExchange(reward)}
                    disabled={currentPoints < reward.cost}
                    className={`btn px-3.5 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                      currentPoints >= reward.cost 
                        ? 'btn-primary shadow-sm hover:shadow cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Tukar
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current points display */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100 text-center">
            <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">Saldo Poin Anda</p>
            <p className="font-display font-black text-3xl text-sky-700">{currentPoints.toLocaleString()}</p>
            <p className="text-[10px] text-sky-500 mt-0.5">pts</p>
          </div>
        </div>
      </div>

      {/* === EXCHANGE CONFIRM MODAL === */}
      {exchangeModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExchangeModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <Gift size={28} />
            </div>
            <h3 className="font-display font-black text-lg text-gray-900 mb-1">Konfirmasi Penukaran</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{exchangeModal.name[locale] || exchangeModal.name.id}</strong>
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Akan dikurangi <strong className="text-red-500">{exchangeModal.cost.toLocaleString()} poin</strong> dari saldo Anda.<br/>
              Sisa: <strong>{(currentPoints - exchangeModal.cost).toLocaleString()} pts</strong>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setExchangeModal(null)}
                className="btn flex-1 bg-gray-100 text-gray-700 py-2.5 text-sm font-bold hover:bg-gray-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={confirmExchange}
                className="btn btn-primary flex-1 py-2.5 text-sm font-bold cursor-pointer"
              >
                Ya, Tukar!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === PRIZE / CLAIM SUCCESS MODAL === */}
      {claimModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setClaimModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={36} />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              {claimModal.type === 'spin' ? 'Hadiah Spin!' : 'Penukaran Berhasil!'}
            </span>
            <h3 className="font-display font-black text-xl text-gray-900 mt-3 mb-1">{claimModal.prize}</h3>
            <p className="text-xs text-gray-500 mb-4">
              {claimModal.type === 'spin'
                ? 'Selamat! Tunjukkan kode di bawah kepada admin saat checkout untuk klaim hadiah.'
                : 'Penukaran berhasil! Tunjukkan kode ini ke admin untuk mendapatkan reward Anda.'}
            </p>

            {/* Claim code box */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kode Klaim</p>
              <p className="font-mono font-black text-lg text-gray-900 tracking-widest">{claimModal.code}</p>
            </div>

            <p className="text-[10px] text-gray-400 mb-4">
              Berlaku 30 hari • Tidak dapat digabungkan dengan promo lain
            </p>
            <button
              onClick={() => setClaimModal(null)}
              className="btn btn-primary w-full py-3 text-sm font-bold cursor-pointer"
            >
              Mengerti, Simpan Kode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Referral Tab ─── */
function ReferralTab({ t, locale, member }) {
  const d = member;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(d.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Referral Banner */}
      <div className="rounded-[28px] p-6 bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white shadow-lg border border-sky-500/20">
        <p className="text-xs text-sky-200 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <LinkIcon size={14} /> Link Referral Pribadi Anda
        </p>
        <div className="flex gap-2 mb-3">
          <div className="clean-input !bg-white/10 !text-white !border-white/20 flex-1 truncate text-xs flex items-center">
            {d.referralLink}
          </div>
          <button onClick={copyLink} className="btn bg-white text-gray-900 px-5 py-2 text-xs font-bold whitespace-nowrap hover:bg-gray-100 cursor-pointer">
            {copied ? '✓ Tersalin!' : 'Salin Link'}
          </button>
        </div>
        <p className="text-[11px] text-white/80">
          Ajak teman Anda bersepeda! Dapatkan komisi 10% dari setiap sewa sepeda yang berhasil diselesaikan melalui tautan Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-3">
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
          <MousePointerClick className="mx-auto text-[var(--color-primary)] mb-1" size={20} />
          <p className="font-display font-black text-xl text-gray-900">{d.referralStats.clicks}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total Klik</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
          <Users className="mx-auto text-[var(--color-primary)] mb-1" size={20} />
          <p className="font-display font-black text-xl text-gray-900">{d.referralStats.signups}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Pendaftar</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
          <DollarSign className="mx-auto text-[var(--color-primary)] mb-1" size={20} />
          <p className="font-display font-black text-lg text-gray-900 truncate">{formatCurrency(d.referralStats.earnings)}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total Komisi</p>
        </div>
      </div>

      {/* Payout */}
      <div className="bg-white rounded-[26px] p-6 text-center border border-gray-100 shadow-sm">
        <h4 className="font-display font-bold text-sm text-gray-900 mb-1">Cairkan Saldo Komisi</h4>
        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
          Komisi dapat dicairkan langsung ke rekening BCA/Mandiri atau e-wallet (GoPay, OVO, ShopeePay) dengan minimal Rp 50.000.
        </p>
        <button className="btn btn-primary px-8 py-3 text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-md cursor-pointer">
          <CreditCard size={15} /> Ajukan Penarikan Komisi
        </button>
      </div>
    </div>
  );
}

/* ─── Main Member Page Component ─── */
export default function MemberPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [memberProfile, setMemberProfile] = useState(null);
  
  // In-App Booking State (Gambar 4 & 5)
  const [selectedBookingBike, setSelectedBookingBike] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);
  const [showBikeCatalogModal, setShowBikeCatalogModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [catalogBikes, setCatalogBikes] = useState([]);
  const [catalogTours, setCatalogTours] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');

  const refreshMemberData = useCallback(async () => {
    const response = await fetch('/api/members/dashboard', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Data dashboard member gagal dimuat.');
    setMemberProfile((current) => {
      const updated = { ...(current || {}), ...data.member };
      localStorage.setItem('memberProfile', JSON.stringify(updated));
      return updated;
    });
    setHistory(Array.isArray(data.bookings) ? data.bookings : []);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const auth = localStorage.getItem('isMember');
      if (!auth) {
        router.push('/login');
        return;
      }
      const savedProfile = localStorage.getItem('memberProfile');
      let parsedProfile = {};
      if (savedProfile) {
        try {
          parsedProfile = JSON.parse(savedProfile);
        } catch (e) { /* use defaults */ }
      }

      if (!parsedProfile.name || String(parsedProfile.wa || parsedProfile.phone || '').replace(/\D/g, '').length < 9) {
        localStorage.removeItem('isMember');
        localStorage.removeItem('memberProfile');
        localStorage.removeItem('memberBookings');
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
      localStorage.removeItem('memberBookings');
      localStorage.removeItem('memberPoints');
      setMemberProfile(normalizeMemberProfile(parsedProfile, [], parsedProfile.points || 0));

      try {
        const syncedProfile = await syncMemberProfile(parsedProfile, { required: true });
        if (cancelled) return;
        localStorage.setItem('memberProfile', JSON.stringify(syncedProfile));
        const [bikeResponse, tourResponse] = await Promise.all([
          fetch('/api/bikes', { cache: 'no-store' }),
          fetch('/api/tours', { cache: 'no-store' }),
        ]);
        const [bikeData, tourData] = await Promise.all([bikeResponse.json(), tourResponse.json()]);
        if (!bikeResponse.ok) throw new Error(bikeData.error || 'Armada gagal dimuat.');
        if (!tourResponse.ok) throw new Error(tourData.error || 'Tour gagal dimuat.');
        if (cancelled) return;
        setCatalogBikes(Array.isArray(bikeData) ? bikeData : []);
        setCatalogTours(Array.isArray(tourData) ? tourData : []);
        await refreshMemberData();

        // Auto-open booking dari Landing Page setelah katalog database selesai dimuat.
        const params = new URLSearchParams(window.location.search);
        const bookBikeId = params.get('bookBike');
        if (bookBikeId) {
          let savedDraft = null;
          try { savedDraft = JSON.parse(sessionStorage.getItem('kulinoBookingDraft') || 'null'); } catch { savedDraft = null; }
          setBookingDraft(savedDraft);
          const targetBike = bikeData.find((bike) => String(bike.id) === String(bookBikeId));
          if (targetBike?.available) setSelectedBookingBike(targetBike);
          window.history.replaceState({}, '', '/member');
        }
      } catch (requestError) {
        if (!cancelled) setCatalogError(requestError.message);
      } finally {
        if (!cancelled) { setCatalogLoading(false); setIsChecking(false); }
      }
    };
    initialize();
    return () => { cancelled = true; };
  }, [refreshMemberData, router]);

  const handleLogout = () => {
    fetch('/api/members/session', { method: 'DELETE' }).catch(() => {});
    localStorage.removeItem('isMember');
    localStorage.removeItem('memberProfile');
    localStorage.removeItem('memberBookings');
    router.push('/login');
  };

  const handleBookingSuccess = (newBooking) => {
    setHistory(prev => [newBooking, ...prev]);
    refreshMemberData().catch(() => {});
  };

  const handlePointsChange = useCallback((points) => {
    setMemberProfile((current) => {
      const updated = { ...(current || {}), points };
      localStorage.setItem('memberProfile', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const member = useMemo(
    () => normalizeMemberProfile(memberProfile || {}, history, memberProfile?.points || 0),
    [memberProfile, history],
  );

  if (isChecking) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Memuat Member Portal...</div>;
  }
  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: <Home size={18} /> },
    { id: 'tracker', label: 'Ride Tracker', icon: <Compass size={18} /> },
    { id: 'routes', label: 'Rute Gowes', icon: <Navigation2 size={18} /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarDays size={18} /> },
    { id: 'points', label: 'Poin & Hadiah', icon: <Award size={18} /> },
    { id: 'referral', label: 'Komisi Referral', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-28">
      
      {/* PWA Install Banner & Offline Alert */}
      <PWAInstallBanner />

      {/* Hero Header (Gambar 2: Warna senada & harmonis dengan UI) */}
      <div className="relative w-full bg-slate-900 rounded-b-[32px] overflow-hidden shadow-lg" style={{ minHeight: 'clamp(155px, 26vh, 230px)' }}>
        <Image
          src="/images/hero-banner.png"
          alt="Kulino Pit Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-slate-900/60 to-slate-950/95" />

        {/* Top Floating App Bar */}
        <div className="absolute top-0 left-0 right-0 px-4 pt-4 sm:px-6 sm:pt-5 z-10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/15 transition-colors cursor-pointer"
              title="Dashboard Member"
            >
              <Home size={13} className="text-sky-400" />
              <span>Dashboard Member</span>
            </button>
            
            {/* Gambar 2: Badge MEMBER PWA senada tema */}
            <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 backdrop-blur-sm text-[10px] font-black tracking-wider uppercase">
              MEMBER PWA
            </span>
          </div>

          {/* Gambar 2: Tombol Download & Logout Senada (bukan merah kontras menyala) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-pwa-install'));
                }
              }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-sky-200 hover:text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
              title="Pasang Aplikasi PWA"
            >
              <Download size={15} />
            </button>
            <button
              onClick={handleLogout}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/20 backdrop-blur-md text-white/80 hover:text-red-300 border border-white/15 hover:border-red-400/30 flex items-center justify-center transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Hero User Greetings — compact, always visible */}
        <div className="relative z-10 px-4 sm:px-8 pt-12 pb-6 sm:pt-14 sm:pb-8">
          <div className="text-white font-black text-lg sm:text-xl tracking-tight mb-1 italic drop-shadow-lg flex items-center gap-1.5">
            <span className="text-sky-300">KULINO PIT</span>
            <span className="text-white">BANYUWANGI</span>
          </div>
          <p className="text-white text-xs font-semibold mb-1 opacity-90">Selamat datang kembali,</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-white font-extrabold text-xl sm:text-2xl drop-shadow-lg leading-none">
              {member.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-400/50 text-[10px] font-black uppercase backdrop-blur-sm">
              {member.level}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        
        {/* Navigation Pills (Desktop & Tablet) */}
        <div className="hidden sm:flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn px-4 py-2 text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'btn-primary shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'dashboard' && (
            <DashboardOverview 
              t={t} 
              locale={locale} 
              setActiveTab={setActiveTab}
              onStartBooking={(bike) => setSelectedBookingBike(bike)}
              onOpenBikeCatalog={() => setShowBikeCatalogModal(true)}
              history={history}
              member={member}
              bikes={catalogBikes}
              tours={catalogTours}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
            />
          )}
          {activeTab === 'tracker' && (
            <RideTrackerTab t={t} locale={locale} />
          )}
          {activeTab === 'routes' && (
            <RuteGowesTab t={t} locale={locale} />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab t={t} locale={locale} history={history} />
          )}
          {activeTab === 'points' && (
            <SpinWheelAndPointsTab t={t} locale={locale} startingPoints={member.points} onPointsChange={handlePointsChange} />
          )}
          {activeTab === 'referral' && (
            <ReferralTab t={t} locale={locale} member={member} />
          )}
        </div>
      </div>

      {/* Gambar 4 & 5: IN-APP BOOKING MODAL (Langsung Pilih Durasi Sewa, Tetap di Dashboard Member PWA) */}
      {selectedBookingBike && (
        <InAppBookingModal
          bike={selectedBookingBike}
          member={member}
          initialDraft={bookingDraft}
          onClose={() => setSelectedBookingBike(null)}
          onChangeBike={() => { setSelectedBookingBike(null); setShowBikeCatalogModal(true); }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* In-App Bike Catalog Modal (Jika klik "Sewa Sepeda" di 8 Menu Cepat) */}
      <InAppBikeCatalogModal
        isOpen={showBikeCatalogModal}
        onClose={() => setShowBikeCatalogModal(false)}
        onSelectBike={(bike) => setSelectedBookingBike(bike)}
      />

      {/* Floating Bottom App Navigation (Sewa Jetski Banyuwangi PWA Style) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-gray-100/80 px-4 py-2.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 relative cursor-pointer ${
                  isActive
                    ? 'text-[var(--color-primary)] font-bold scale-105'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={tab.label}
              >
                {tab.icon}
                <span className="text-[9px] font-bold mt-0.5 leading-none">
                  {tab.label.split(' ')[0]}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] absolute -bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
