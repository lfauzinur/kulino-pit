'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { memberData, calendarBookings, bikes, tours, articles, formatCurrency, getLowestPrice } from '@/lib/data';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import CyclingWeatherCard from '@/components/CyclingWeatherCard';
import InAppBookingModal from '@/components/InAppBookingModal';
import InAppBikeCatalogModal from '@/components/InAppBikeCatalogModal';
import { 
  LayoutDashboard, MapPin, CalendarDays, Award, Link as LinkIcon, 
  Trophy, Bike, DollarSign, Star, CheckCircle, Clock, Info, 
  Map as MapIcon, MousePointerClick, Users, CreditCard, LogOut,
  Share2, Link2, RotateCcw, Gift, AlertTriangle, ChevronRight,
  Sparkles, Compass, ArrowUpRight, Flame, Home, QrCode, ArrowLeft, Download, ShieldCheck
} from 'lucide-react';

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
              <Star size={10} fill="currentColor" /> {user.level || 'GOLD'} VIP
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
            {user.points?.toLocaleString() || '1.250'} <span className="text-[9px] text-white/60">PTS</span>
          </span>
        </div>
      </div>

      {/* Card Bottom: Member Details & QR Code */}
      <div className="relative z-10 flex justify-between items-end">
        <div>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">NAMA ANGGOTA</p>
          <p className="font-display font-bold text-base sm:text-lg text-white leading-tight mb-2">
            {user.name || 'Andi Pratama'}
          </p>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mb-0.5">ID MEMBER</p>
          <p className="font-mono font-bold text-xs tracking-widest text-sky-200">
            {user.memberId || 'KP-2026-0089'}
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
function DashboardOverview({ t, locale, setActiveTab, onStartBooking, onOpenBikeCatalog, history }) {
  const d = memberData;
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

  /* Gambar 1: Icon SENADA dengan UI Kulino Pit (Semua menggunakan bg-sky-50 text-[var(--color-primary)]) */
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
      action: () => onOpenBikeCatalog(), // In-App Bike Picker (tidak lempar ke landing page)
    },
    { 
      name: 'Spin Wheel', 
      desc: 'Putar Hadiah',
      icon: <RotateCcw size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('points'), 
    },
    { 
      name: 'Jadwal Sewa', 
      desc: 'Kalender Unit',
      icon: <CalendarDays size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('calendar'), 
    },
    { 
      name: 'Tukar Poin', 
      desc: 'Katalog Reward',
      icon: <Award size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('points'), 
    },
    { 
      name: 'Komisi Ajak', 
      desc: 'Referral Cuan',
      icon: <DollarSign size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('referral'), 
    },
    { 
      name: 'Rute Gowes', 
      desc: 'Jalur Pilihan',
      icon: <MapIcon size={22} className="text-[var(--color-primary)]" />, 
      action: () => setActiveTab('tracker'), 
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
              {d.level} <span className="text-[10px] text-[var(--color-primary)] font-bold">⭐⭐⭐</span>
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
                    const targetBike = bikes.find(b => b.id === promo.bikeId) || bikes[0];
                    onStartBooking(targetBike);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white text-stone-900 text-[10px] font-black hover:bg-gray-100 transition-colors shadow-sm shrink-0 cursor-pointer"
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

        <div className="flex overflow-x-auto gap-3.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
          {bikes.slice(0, 6).map((bike) => {
            const minPrice = getLowestPrice(bike);
            return (
              <div
                key={bike.id}
                onClick={() => onStartBooking(bike)}
                className="flex-shrink-0 w-[260px] sm:w-[270px] bg-white rounded-[24px] p-3.5 shadow-sm border border-gray-100 hover:border-sky-300 hover:shadow-md transition-all group snap-center flex flex-col justify-between cursor-pointer"
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
                      onStartBooking(bike);
                    }}
                    className="btn btn-primary px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Sewa
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
              <div
                key={tour.id}
                onClick={() => {
                  const matchedBike = bikes[0];
                  onStartBooking(matchedBike);
                }}
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
              </div>
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

      {/* QR Code Modal for Check-in */}
      {showQRModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl relative animate-slide-up border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
              <QrCode size={26} />
            </div>
            <h3 className="font-display font-black text-lg text-gray-900">QR Check-in Member</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Tunjukkan QR Code ini kepada Road Captain atau kasir di Pitstop Kulino House.
            </p>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-center mb-4">
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-inner flex flex-col items-center justify-center border border-gray-200">
                <QrCode size={130} className="text-gray-900" strokeWidth={2} />
                <p className="font-mono font-bold text-[10px] text-gray-500 mt-1.5 tracking-wider">
                  {d.memberId}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-emerald-600 font-bold mb-4 flex items-center justify-center gap-1">
              <ShieldCheck size={13} /> Member VIP Terverifikasi
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="btn btn-primary w-full py-2.5 text-xs font-bold cursor-pointer"
            >
              Tutup QR Code
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
  
  const [location, setLocation] = useState({ lat: -8.2192, lng: 114.3692 });
  const [speed, setSpeed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('MENUNGGU SINYAL GPS');
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const lastCoordsRef = useRef(null);

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

  const handleToggleTrack = () => {
    if (isTracking) {
      setIsTracking(false);
      setGpsStatus('TRACKING DIHENTIKAN');
      if (watchIdRef.current && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setIsTracking(true);
      setGpsStatus('MENCARI POSISI GPS...');
      
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);

      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            setGpsStatus('SINYAL GPS TERKUNCI');
            const { latitude, longitude, speed: gpsSpd } = position.coords;
            if (gpsSpd !== null && gpsSpd !== undefined && gpsSpd >= 0) {
              setSpeed((gpsSpd * 3.6).toFixed(1));
            }
            
            if (lastCoordsRef.current) {
              const dist = getDistanceFromLatLonInKm(
                lastCoordsRef.current.latitude,
                lastCoordsRef.current.longitude,
                latitude,
                longitude
              );
              if (dist > 0.002) {
                setDistance(prev => prev + dist);
              }
            }
            
            lastCoordsRef.current = { latitude, longitude };
            setLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.warn(error);
            setGpsStatus('GPS SIMULASI (AKTIF)');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      } else {
        setGpsStatus('GPS TIDAK DIDUKUNG');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const shareText = `🚴 Sesi Gowes Bersama Kulino Pit Banyuwangi!\n⏱ Waktu: ${formatTime(time)}\n📏 Jarak: ${distance.toFixed(2)} km\n⚡ Kec. Rata: ${avgSpeed} km/h\n🔥 Kalori: ${caloriesBurned} kcal\n\n#KulinoPit #GowesBanyuwangi #ExploreBanyuwangi`;
  const shareUrl = 'https://kulinopit.id';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[26px] overflow-hidden shadow-sm border border-gray-100">
        
        {/* OpenStreetMap Real-time Embed */}
        <div className="h-64 sm:h-72 bg-gray-100 relative flex flex-col items-center justify-center overflow-hidden border-b border-gray-100">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            title="Cycling Route Map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.02},${location.lat - 0.02},${location.lng + 0.02},${location.lat + 0.02}&layer=mapnik&marker=${location.lat},${location.lng}`}
            className="absolute inset-0 z-0"
          />
          <div className="z-10 absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2 shadow-md border border-gray-100 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isTracking ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 leading-none">Status GPS</p>
              <p className="font-display font-black text-xs text-gray-800 leading-none mt-0.5">{gpsStatus}</p>
            </div>
          </div>
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
              className={`btn flex-1 py-3.5 font-display font-black text-base tracking-wider shadow-md transition-all cursor-pointer ${
                isTracking 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                  : 'btn-primary shadow-sky-200'
              }`}
            >
              {isTracking ? '■ Hentikan Gowes' : '▶ Mulai Gowes Sekarang'}
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

          {/* Share Modal */}
          {showShareModal && (
            <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 animate-fade-in">
              <h4 className="font-display font-bold text-xs text-gray-900 mb-1 flex items-center gap-2">
                <Share2 size={14} /> Bagikan Pencapaian Gowes Anda
              </h4>
              <p className="text-[10px] text-gray-500 mb-3">Pilih media sosial untuk pamer jarak tempuh:</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText + '\n' + shareUrl);
                    alert('Teks riwayat gowes berhasil disalin!');
                  }}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  Instagram
                </button>
                <button
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                  className="bg-stone-900 hover:bg-black text-white rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  X (Twitter)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText + '\n' + shareUrl);
                    alert('Tautan disalin ke clipboard!');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
                >
                  Salin Teks
                </button>
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
function CalendarTab({ t, locale }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = today.toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarBookings.filter(b => dateStr >= b.startDate && dateStr <= b.endDate);
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
                        {b.bikeName.split(' ').slice(0, 2).join(' ')}
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

/* ─── Spin Wheel & Points Tab ─── */
function SpinWheelAndPointsTab({ t, locale }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [spinHistory, setSpinHistory] = useState([]);
  const userPoints = memberData.points;

  const defaultPrizes = [
    { label: 'Diskon 10%', color: '#3B82F6', chance: 25 },
    { label: 'Gratis Helm', color: '#10B981', chance: 15 },
    { label: 'Voucher 50K', color: '#F59E0B', chance: 20 },
    { label: 'Coba Lagi', color: '#EF4444', chance: 25 },
    { label: 'Gratis 1 Jam', color: '#8B5CF6', chance: 10 },
    { label: 'Jersey Kulino', color: '#EC4899', chance: 5 },
  ];

  const [prizes, setPrizes] = useState(defaultPrizes);

  useEffect(() => {
    const stored = localStorage.getItem('spinPrizes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setTimeout(() => {
            setPrizes(parsed);
          }, 0);
        }
      } catch (e) { /* ignore */ }
    }
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
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.label, r - 18, 5);
      ctx.restore();
    });

    ctx.restore();

    // Center pin
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow pointer at top
    ctx.beginPath();
    ctx.moveTo(cx - 12, 6);
    ctx.lineTo(cx + 12, 6);
    ctx.lineTo(cx, 28);
    ctx.closePath();
    ctx.fillStyle = '#0F172A';
    ctx.fill();
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
    if (isSpinning || userPoints < SPIN_COST) return;
    setIsSpinning(true);
    setResult(null);

    const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
    let rand = Math.random() * totalChance;
    let winIndex = 0;
    for (let i = 0; i < prizes.length; i++) {
      rand -= prizes[i].chance;
      if (rand <= 0) { winIndex = i; break; }
    }

    const sliceAngle = 360 / prizes.length;
    const targetSlice = 360 - (winIndex * sliceAngle + sliceAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + spins * 360 + targetSlice - (rotation % 360);

    const duration = 3800;
    const startTime = performance.now();
    const startRotation = rotation;
    const delta = targetRotation - startRotation;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentRot = startRotation + delta * easedProgress;
      setRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRotation(targetRotation);
        setIsSpinning(false);
        setResult(prizes[winIndex]);
        setSpinHistory(prev => [
          { prize: prizes[winIndex].label, time: new Date().toLocaleTimeString() },
          ...prev.slice(0, 4),
        ]);
      }
    }
    requestAnimationFrame(animate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] p-6 bg-gradient-to-r from-purple-700 via-indigo-600 to-sky-600 text-white shadow-lg flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display font-black text-xl flex items-center gap-2">
            <RotateCcw size={22} /> Spin & Win Lucky Wheel
          </h2>
          <p className="text-xs text-white/80 mt-1">
            Biaya 100 poin per putaran • Saldo Anda: {userPoints.toLocaleString()} pts
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/20 border border-white/30 text-xs font-bold flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-300" /> {userPoints.toLocaleString()} pts
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Canvas Wheel */}
        <div className="lg:col-span-3 bg-white rounded-[26px] p-6 shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="relative w-[300px] h-[300px] mb-5">
            <canvas ref={canvasRef} style={{ width: 300, height: 300 }} />
            <button
              onClick={handleSpin}
              disabled={isSpinning || userPoints < SPIN_COST}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full font-black text-xs z-10 transition-all ${
                isSpinning
                  ? 'bg-gray-300 text-gray-500 cursor-wait'
                  : userPoints < SPIN_COST
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] text-white hover:scale-110 shadow-lg cursor-pointer'
              }`}
            >
              {isSpinning ? '...' : 'SPIN'}
            </button>
          </div>

          <button
            onClick={handleSpin}
            disabled={isSpinning || userPoints < SPIN_COST}
            className={`btn w-full py-3.5 font-display font-black text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
              isSpinning 
                ? 'bg-gray-300 text-gray-500 cursor-wait' 
                : userPoints < SPIN_COST 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-primary shadow-md'
            }`}
          >
            <RotateCcw size={16} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? 'Sedang Memutar...' : 'Putar Sekarang (100 Pts)'}
          </button>

          {result && (
            <div className="mt-5 w-full p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center animate-fade-in">
              <Gift className="mx-auto text-amber-500 mb-2" size={32} />
              <p className="text-xs text-gray-500 font-bold">Selamat! Anda Memenangkan:</p>
              <p className="font-display font-black text-2xl text-gray-900 mt-1">{result.label}</p>
              <p className="text-[10px] text-gray-500 mt-1">Tunjukkan ke admin saat checkout untuk klaim reward.</p>
            </div>
          )}
        </div>

        {/* Rewards Catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[26px] p-5 shadow-sm border border-gray-100">
            <h3 className="font-display font-black text-xs text-gray-900 mb-3 flex items-center gap-2">
              <Award size={15} className="text-amber-500" /> Katalog Penukaran Poin
            </h3>
            <div className="space-y-2.5">
              {memberData.rewards.map(reward => (
                <div key={reward.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{reward.icon}</span>
                    <div>
                      <p className="font-display font-bold text-xs text-gray-900">{reward.name[locale] || reward.name.id}</p>
                      <p className="text-[10px] text-[var(--color-primary)] font-bold">{reward.cost} Pts</p>
                    </div>
                  </div>
                  <button
                    disabled={userPoints < reward.cost}
                    className={`btn px-3 py-1.5 text-[10px] font-bold cursor-pointer ${
                      userPoints >= reward.cost ? 'btn-primary' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Tukar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Referral Tab ─── */
function ReferralTab({ t, locale }) {
  const d = memberData;
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
  
  // In-App Booking State (Gambar 4 & 5)
  const [selectedBookingBike, setSelectedBookingBike] = useState(null);
  const [showBikeCatalogModal, setShowBikeCatalogModal] = useState(false);
  const [history, setHistory] = useState(memberData.bookingHistory);

  useEffect(() => {
    // Check member authentication
    const auth = localStorage.getItem('isMember');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsChecking(false);

    // Load saved bookings
    const saved = localStorage.getItem('memberBookings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTimeout(() => {
            setHistory([...parsed, ...memberData.bookingHistory]);
          }, 0);
        }
      } catch (e) { /* ignore */ }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isMember');
    router.push('/login');
  };

  const handleBookingSuccess = (newBooking) => {
    setHistory(prev => [newBooking, ...prev]);
  };

  if (isChecking) {
    return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">Memuat Member Portal...</div>;
  }
  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: <Home size={18} /> },
    { id: 'tracker', label: 'Ride Tracker', icon: <Compass size={18} /> },
    { id: 'calendar', label: 'Kalender', icon: <CalendarDays size={18} /> },
    { id: 'points', label: 'Poin & Hadiah', icon: <Award size={18} /> },
    { id: 'referral', label: 'Komisi Referral', icon: <LinkIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-28">
      
      {/* PWA Install Banner & Offline Alert */}
      <PWAInstallBanner />

      {/* Hero Header (Gambar 2: Warna senada & harmonis dengan UI) */}
      <div className="relative h-[280px] sm:h-[300px] w-full bg-slate-900 rounded-b-[36px] overflow-hidden shadow-lg">
        <Image
          src="/images/hero-banner.png"
          alt="Kulino Pit Background"
          fill
          className="object-cover opacity-50 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-slate-900/40 to-slate-950/85" />

        {/* Top Floating App Bar */}
        <div className="absolute top-0 left-0 right-0 p-5 sm:p-6 z-10 flex justify-between items-center pt-6 sm:pt-8">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/15 transition-colors"
              title="Kembali ke Website Utama"
            >
              <ArrowLeft size={13} />
              <span>Ke Web</span>
            </Link>
            
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

        {/* Hero User Greetings */}
        <div className="absolute bottom-14 left-5 right-5 sm:left-8 sm:right-8 z-10">
          <div className="text-white font-black text-xl sm:text-2xl tracking-tight mb-2 italic drop-shadow-md flex items-center gap-1.5">
            <span className="text-[var(--color-primary)]">KULINO PIT</span>
            <span className="text-white/90">BANYUWANGI</span>
          </div>
          <p className="text-white/80 text-xs font-medium">Selamat datang kembali,</p>
          <div className="flex items-center gap-2.5 mt-0.5">
            <h1 className="text-white font-extrabold text-2xl drop-shadow-md">
              {memberData.name}
            </h1>
            {/* Gambar 2: Badge GOLD senada & elegan */}
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase backdrop-blur-sm">
              {memberData.level}
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
            />
          )}
          {activeTab === 'tracker' && (
            <RideTrackerTab t={t} locale={locale} />
          )}
          {activeTab === 'calendar' && (
            <CalendarTab t={t} locale={locale} />
          )}
          {activeTab === 'points' && (
            <SpinWheelAndPointsTab t={t} locale={locale} />
          )}
          {activeTab === 'referral' && (
            <ReferralTab t={t} locale={locale} />
          )}
        </div>
      </div>

      {/* Gambar 4 & 5: IN-APP BOOKING MODAL (Langsung Pilih Durasi Sewa, Tetap di Dashboard Member PWA) */}
      {selectedBookingBike && (
        <InAppBookingModal
          bike={selectedBookingBike}
          onClose={() => setSelectedBookingBike(null)}
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
