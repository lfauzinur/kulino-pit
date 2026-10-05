'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { memberData, calendarBookings, formatCurrency } from '@/lib/data';
import { 
  LayoutDashboard, MapPin, CalendarDays, Award, Link as LinkIcon, 
  Trophy, Bike, DollarSign, Star, CheckCircle, Clock, Info, 
  Map as MapIcon, MousePointerClick, Users, CreditCard, LogOut,
  Share2, Link2, RotateCcw, Gift
} from 'lucide-react';

/* ─── Dashboard Tab ─── */
function DashboardTab({ t, locale }) {
  const d = memberData;
  return (
    <div>
      {/* Welcome */}
      <div className="clean-card p-6 bg-[var(--color-primary)] text-white mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-white/70 font-bold uppercase tracking-wider">{t('member.welcomeBack')}</p>
            <h2 className="font-display font-black text-2xl mt-1">{d.name} 👋</h2>
            <p className="text-xs text-white/70 mt-1">Member ID: {d.memberId}</p>
          </div>
          <div className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 border border-white/40 text-white flex items-center gap-1">
            <Star size={12} /> {d.level} Member
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { label: t('member.totalPoints'), value: d.points.toLocaleString(), icon: <Trophy size={20} className="text-yellow-500" />, bg: 'bg-yellow-50' },
          { label: t('member.totalBookings'), value: d.totalBookings, icon: <Bike size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: t('member.totalEarnings'), value: formatCurrency(d.referralStats.earnings), icon: <DollarSign size={20} className="text-green-500" />, bg: 'bg-green-50' },
          { label: d.level + ' Member', value: '⭐⭐⭐', icon: <Star size={20} className="text-[var(--color-primary)]" />, bg: 'bg-[var(--color-primary-soft)]' },
        ].map((stat, i) => (
          <div key={i} className={`clean-card p-4 ${stat.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span>{stat.icon}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</span>
            </div>
            <p className="font-display font-black text-xl text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Booking History */}
      <div className="clean-card overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-display font-black text-sm text-gray-900">{t('member.history')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {d.bookingHistory.map(b => (
            <div key={b.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Bike size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm text-gray-900 truncate">{b.bike}</p>
                  <p className="text-[9px] text-gray-500">{b.date} · {b.duration} · {b.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-[9px] font-bold flex items-center gap-1 ${b.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {b.status === 'completed' ? <CheckCircle size={10} /> : <Clock size={10} />}
                  {b.status === 'completed' ? 'Completed' : 'Upcoming'}
                </span>
                <p className="font-display font-bold text-sm text-gray-900">{formatCurrency(b.total)}</p>
                {b.points > 0 && <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 text-[9px] font-bold">+{b.points} pts</span>}
              </div>
            </div>
          ))}
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
    <div>
      <div className="clean-card p-4 bg-blue-50 border border-blue-100 mb-6 flex gap-3 items-center">
        <Info className="text-blue-500 shrink-0" size={18} />
        <p className="text-xs font-medium text-blue-800">{t('member.calendarInfo')}</p>
      </div>

      <div className="clean-card overflow-hidden">
        <div className="p-4 bg-[var(--color-primary)] text-white text-center">
          <h3 className="font-display font-black text-xl">{monthName}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {(locale === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(d => (
              <div key={d} className="text-center text-[9px] font-bold uppercase tracking-wider text-gray-500 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const bookings = getBookingsForDay(day);
              const isToday = day === today.getDate();
              return (
                <div key={day} className={`relative min-h-[70px] rounded-lg border p-1 text-[10px] transition-colors
                  ${isToday ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-gray-100 hover:border-gray-300'}
                  ${bookings.length > 0 ? 'bg-red-50' : ''}`}>
                  <span className={`font-bold ${isToday ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>{day}</span>
                  <div className="space-y-0.5 mt-1">
                    {bookings.map((b, j) => (
                      <div key={j} className="bg-red-100 text-red-700 rounded px-1 py-0.5 text-[7px] truncate font-bold">
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

/* ─── Points Tab ─── */
function PointsTab({ t, locale }) {
  const d = memberData;
  return (
    <div>
      <div className="clean-card p-6 bg-yellow-50 border border-yellow-100 text-center mb-8">
        <Award className="mx-auto text-yellow-500 mb-2" size={32} />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{t('member.totalPoints')}</p>
        <p className="font-display font-black text-5xl mt-2 text-gray-900">{d.points.toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-1">{t('member.pointsDesc')}</p>
      </div>

      <h3 className="font-display font-black text-lg mb-4 text-gray-900">{t('member.redeemPoints')}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {d.rewards.map(reward => (
          <div key={reward.id} className="clean-card p-5 flex items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shrink-0 text-gray-600">
              {reward.icon === '👕' ? <Bike /> : reward.icon === '🎟️' ? <CreditCard /> : <Award />}
            </span>
            <div className="flex-1">
              <p className="font-display font-bold text-sm text-gray-900">{reward.name[locale]}</p>
              <p className="text-xs text-[var(--color-primary)] font-bold mt-0.5">{reward.cost} {locale === 'id' ? 'Poin' : 'Points'}</p>
            </div>
            <button
              className={`btn px-4 py-2 text-[10px] ${d.points >= reward.cost ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              disabled={d.points < reward.cost}
            >
              {t('member.redeemPoints')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Referral Tab ─── */
function ReferralTab({ t, locale }) {
  const d = memberData;
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(d.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Referral Link */}
      <div className="clean-card p-6 bg-[var(--color-primary)] text-white mb-8">
        <p className="text-xs text-white/80 font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><LinkIcon size={14} /> {t('member.referralLink')}</p>
        <div className="flex gap-2">
          <div className="clean-input !bg-white/10 !text-white !border-white/30 flex-1 truncate text-xs flex items-center">
            {d.referralLink}
          </div>
          <button onClick={copyLink} className="btn bg-white text-[var(--color-primary)] px-6 py-2 text-xs whitespace-nowrap hover:bg-gray-50">
            {copied ? '✓ Copied!' : t('member.copyLink')}
          </button>
        </div>
        <p className="text-[10px] text-white/70 mt-3">
          {t('member.referralDesc')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-3 mb-8">
        <div className="clean-card p-4 text-center">
          <MousePointerClick className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="font-display font-black text-2xl text-gray-900">{d.referralStats.clicks}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{t('member.totalClicks')}</p>
        </div>
        <div className="clean-card p-4 text-center">
          <Users className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="font-display font-black text-2xl text-gray-900">{d.referralStats.signups}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{t('member.totalSignups')}</p>
        </div>
        <div className="clean-card p-4 text-center">
          <DollarSign className="mx-auto text-green-500 mb-2" size={24} />
          <p className="font-display font-black text-lg text-gray-900">{formatCurrency(d.referralStats.earnings)}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{t('member.commission')}</p>
        </div>
      </div>

      {/* Payout Button */}
      <div className="clean-card p-6 text-center border border-gray-100">
        <p className="text-sm text-gray-500 mb-4">
          {t('member.payoutDesc')}
        </p>
        <button className="btn btn-primary px-8 py-3 text-sm flex items-center justify-center gap-2 mx-auto">
          <CreditCard size={16} /> {t('member.requestPayout')}
        </button>
      </div>
    </div>
  );
}

/* ─── Ride Tracker Tab (Prototype) ─── */
function RideTrackerTab({ t, locale }) {
  const [isTracking, setIsTracking] = useState(false);
  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleToggleTrack = () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      setIsTracking(true);
      const interval = setInterval(() => {
        setTime(prev => prev + 1);
        setDistance(prev => prev + 0.005);
      }, 1000);
      setTimeout(() => clearInterval(interval), 10000);
    }
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const shareText = `🚴 Ride completed with Kulino Pit!\n⏱ ${formatTime(time)}\n📏 ${distance.toFixed(2)} km\n🔥 ${Math.floor(distance * 35)} kcal\n\n#KulinoPit #GowesanBanyuwangi`;
  const shareUrl = 'https://kulinopit.id';

  const shareActions = [
    {
      name: 'WhatsApp Story',
      color: 'bg-green-500 hover:bg-green-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      ),
      onClick: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank'),
    },
    {
      name: 'Instagram',
      color: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
      ),
      onClick: () => {
        navigator.clipboard?.writeText(shareText + '\n' + shareUrl);
        alert(t('member.textCopied'));
      },
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      ),
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank'),
    },
    {
      name: 'X (Twitter)',
      color: 'bg-gray-900 hover:bg-black',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      ),
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank'),
    },
    {
      name: 'Telegram',
      color: 'bg-sky-500 hover:bg-sky-600',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
      ),
      onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank'),
    },
    {
      name: t('member.copyText'),
      color: 'bg-gray-200 hover:bg-gray-300 !text-gray-700',
      icon: <Link2 size={20} />,
      onClick: () => {
        navigator.clipboard?.writeText(shareText + '\n' + shareUrl);
        alert(t('member.textCopied'));
      },
    },
  ];

  return (
    <div>
      <div className="clean-card overflow-hidden bg-white mb-6">
        <div className="h-64 bg-gray-100 relative flex flex-col items-center justify-center overflow-hidden border-b border-gray-100">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-black)_1px,_transparent_1px)] bg-[size:10px_10px]"></div>
          <svg className="absolute w-full h-full stroke-[var(--color-primary)] stroke-[4px] fill-transparent stroke-dasharray-[10_10] animate-[dash_20s_linear_infinite]" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 90 Q 30 10 50 50 T 90 10" />
          </svg>
          <div className="z-10 bg-white/90 backdrop-blur rounded-2xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-center gap-1"><MapIcon size={12}/> GPS Status</p>
            <p className="font-display font-black text-lg text-green-600">SIGNAL ACQUIRED</p>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase text-gray-500 mb-1">{t('member.time')}</p>
              <p className="font-display font-black text-2xl text-gray-900">{formatTime(time)}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase text-gray-500 mb-1">{t('member.distance')}</p>
              <p className="font-display font-black text-2xl text-gray-900">{distance.toFixed(2)}<span className="text-xs text-gray-400">km</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase text-gray-500 mb-1">{t('member.avgSpeed')}</p>
              <p className="font-display font-black text-2xl text-gray-900">{isTracking ? '18.0' : '0.0'}<span className="text-xs text-gray-400">km/h</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 text-center border border-gray-100">
              <p className="text-[9px] font-bold uppercase text-gray-500 mb-1">{t('member.calories')}</p>
              <p className="font-display font-black text-2xl text-gray-900">{Math.floor(distance * 35)}<span className="text-xs text-gray-400">kcal</span></p>
            </div>
          </div>

          {/* Start / Stop + Share buttons */}
          <div className="flex gap-3">
            <button 
              onClick={handleToggleTrack}
              className={`btn flex-1 py-4 font-display font-black text-xl tracking-wider ${isTracking ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'}`}
            >
              {isTracking ? t('member.stopRide') : t('member.startRide')}
            </button>
            <button 
              onClick={() => setShowShareModal(!showShareModal)}
              className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-5 py-4 flex items-center gap-2 font-semibold"
              title="Share Ride"
            >
              <Share2 size={20} />
              <span className="hidden sm:inline text-sm">{t('member.share')}</span>
            </button>
          </div>

          {/* Share Modal / Dropdown */}
          {showShareModal && (
            <div className="mt-4 p-6 rounded-2xl bg-gray-50 border border-gray-100 animate-fade-in">
              <h4 className="font-display font-bold text-sm text-gray-900 mb-1 flex items-center gap-2">
                <Share2 size={16} /> {t('member.shareTitle')}
              </h4>
              <p className="text-[10px] text-gray-500 mb-4">{t('member.shareDesc')}</p>
              
              {/* Preview Card */}
              <div className="mb-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-black text-xs">K</div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Kulino Pit Ride</p>
                    <p className="text-[9px] text-gray-400">just now</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-[8px] text-gray-400 uppercase font-bold">{t('member.time')}</p>
                    <p className="font-display font-black text-sm text-gray-900">{formatTime(time)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 uppercase font-bold">{t('member.distance')}</p>
                    <p className="font-display font-black text-sm text-gray-900">{distance.toFixed(2)}km</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 uppercase font-bold">{t('member.avgSpeed')}</p>
                    <p className="font-display font-black text-sm text-gray-900">{isTracking ? '18.0' : '0.0'}km/h</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 uppercase font-bold">{t('member.calories')}</p>
                    <p className="font-display font-black text-sm text-gray-900">{Math.floor(distance * 35)}</p>
                  </div>
                </div>
              </div>

              {/* Share Buttons Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {shareActions.map((action, i) => (
                  <button 
                    key={i}
                    onClick={action.onClick}
                    className={`${action.color} text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95`}
                    title={action.name}
                  >
                    {action.icon}
                    <span className="text-[8px] font-bold leading-tight text-center">{action.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-display font-black text-lg mb-4 text-gray-900 flex items-center gap-2"><Trophy size={20} className="text-yellow-500" /> {t('member.monthlyChallenges')}</h3>
      <div className="space-y-4">
        <div className="clean-card p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-[var(--color-primary-soft)] border-none">
          <div className="w-16 h-16 rounded-2xl shrink-0 bg-white text-[var(--color-primary)] flex items-center justify-center">
            <Trophy size={28} />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-black text-sm text-gray-900">{t('member.challengeTitle')}</h4>
            <p className="text-xs text-gray-600 mt-1">{t('member.challengeDesc')}</p>
            <div className="mt-3 bg-white h-2 w-full relative rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-[var(--color-primary)]" style={{ width: '45%' }}></div>
            </div>
            <p className="text-[9px] font-bold text-right mt-1 text-gray-500">45 / 100 km</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Spin Wheel Tab ─── */
function SpinWheelTab({ t, locale }) {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [spinHistory, setSpinHistory] = useState([]);
  const userPoints = memberData.points;

  // Load prizes from localStorage (Admin can configure these)
  const defaultPrizes = [
    { label: 'Diskon 10%', color: '#3B82F6', chance: 25 },
    { label: 'Gratis Helm', color: '#10B981', chance: 15 },
    { label: 'Voucher 50K', color: '#F59E0B', chance: 20 },
    { label: 'Coba Lagi', color: '#EF4444', chance: 25 },
    { label: 'Gratis 1 Jam', color: '#8B5CF6', chance: 10 },
    { label: 'Merchandise', color: '#EC4899', chance: 5 },
  ];

  const [prizes, setPrizes] = useState(defaultPrizes);

  useEffect(() => {
    const stored = localStorage.getItem('spinPrizes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setPrizes(parsed);
        }
      } catch (e) { /* use defaults */ }
    }
  }, []);

  const SPIN_COST = 100; // points per spin

  // Draw the wheel on canvas
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
      
      // Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px system-ui';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 3;
      ctx.fillText(prize.label, r - 20, 5);
      ctx.restore();
    });

    ctx.restore();

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer triangle at top
    ctx.beginPath();
    ctx.moveTo(cx - 14, 6);
    ctx.lineTo(cx + 14, 6);
    ctx.lineTo(cx, 30);
    ctx.closePath();
    ctx.fillStyle = '#1F2937';
    ctx.fill();
  }, [prizes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 320 * dpr;
    ctx.scale(dpr, dpr);
    drawWheel(ctx, 320, 320, rotation);
  }, [rotation, drawWheel]);

  const handleSpin = () => {
    if (isSpinning || userPoints < SPIN_COST) return;
    setIsSpinning(true);
    setResult(null);

    // Weighted random prize selection
    const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);
    let rand = Math.random() * totalChance;
    let winIndex = 0;
    for (let i = 0; i < prizes.length; i++) {
      rand -= prizes[i].chance;
      if (rand <= 0) { winIndex = i; break; }
    }

    const sliceAngle = 360 / prizes.length;
    // Calculate target angle so the winning slice stops at the pointer (top)
    const targetSlice = 360 - (winIndex * sliceAngle + sliceAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const targetRotation = rotation + spins * 360 + targetSlice - (rotation % 360);

    // Animate with CSS-like easing via requestAnimationFrame
    const duration = 4000;
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
    <div>
      {/* Header */}
      <div className="clean-card p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-display font-black text-2xl flex items-center gap-2">
              <RotateCcw size={24} /> {t('member.spinAndWin')}
            </h2>
            <p className="text-sm text-white/80 mt-1">
              {t('member.spinCost').replace('{cost}', SPIN_COST).replace('{points}', userPoints.toLocaleString())}
            </p>
          </div>
          <div className="px-4 py-2 rounded-full bg-white/20 border border-white/30 text-sm font-bold flex items-center gap-2">
            <Trophy size={16} /> {userPoints.toLocaleString()} pts
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Wheel */}
        <div className="lg:col-span-3">
          <div className="clean-card p-6 flex flex-col items-center">
            <div className="relative w-[320px] h-[320px] mb-6">
              <canvas
                ref={canvasRef}
                style={{ width: 320, height: 320 }}
                className={`${isSpinning ? '' : ''}`}
              />
              {/* Center button */}
              <button
                onClick={handleSpin}
                disabled={isSpinning || userPoints < SPIN_COST}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full font-black text-xs z-10 transition-all
                  ${isSpinning
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
              className={`btn w-full py-4 font-display font-black text-lg tracking-wider flex items-center justify-center gap-2
                ${isSpinning 
                  ? 'bg-gray-300 text-gray-500 cursor-wait' 
                  : userPoints < SPIN_COST 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg'
                }`}
            >
              <RotateCcw size={20} className={isSpinning ? 'animate-spin' : ''} />
              {isSpinning 
                ? t('member.spinning') 
                : t('member.spinBtn').replace('{cost}', SPIN_COST)}
            </button>

            {/* Result */}
            {result && (
              <div className="mt-6 w-full p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 text-center animate-fade-in">
                <Gift className="mx-auto text-yellow-500 mb-3" size={36} />
                <p className="text-sm text-gray-500 font-semibold">{t('member.congrats')}</p>
                <p className="font-display font-black text-3xl text-gray-900 mt-2">{result.label}</p>
                <p className="text-xs text-gray-500 mt-2">{t('member.prizeInfo')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Prize List & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prize List */}
          <div className="clean-card p-6">
            <h3 className="font-display font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Gift size={16} /> {t('member.prizeList')}
            </h3>
            <div className="space-y-2">
              {prizes.map((prize, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: prize.color }} />
                  <span className="text-sm font-semibold text-gray-900 flex-1">{prize.label}</span>
                  <span className="text-[10px] font-bold text-gray-400">{prize.chance}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spin History */}
          <div className="clean-card p-6">
            <h3 className="font-display font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={16} /> {t('member.spinHistory')}
            </h3>
            {spinHistory.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">{t('member.noHistory')}</p>
            ) : (
              <div className="space-y-2">
                {spinHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900">{item.prize}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Member Page ─── */
export default function MemberPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem('isMember');
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isMember');
    router.push('/login');
  };

  if (isChecking) return <div className="min-h-screen bg-gray-50"></div>;
  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', label: t('member.dashboard'), icon: <LayoutDashboard size={16} /> },
    { id: 'tracker', label: 'Ride Tracker', icon: <MapPin size={16} /> },
    { id: 'calendar', label: t('member.calendar'), icon: <CalendarDays size={16} /> },
    { id: 'points', label: t('member.points'), icon: <Award size={16} /> },
    { id: 'referral', label: t('member.referral'), icon: <LinkIcon size={16} /> },
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display font-black text-2xl text-gray-900">Member Portal</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 px-4 py-2 rounded-full hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} /> {t('member.logout')}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn px-5 py-2.5 text-xs whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'btn-primary' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in" key={activeTab}>
          {activeTab === 'dashboard' && <DashboardTab t={t} locale={locale} />}
          {activeTab === 'tracker' && <RideTrackerTab t={t} locale={locale} />}
          {activeTab === 'calendar' && <CalendarTab t={t} locale={locale} />}
          {activeTab === 'points' && (
            <div className="space-y-16">
              <SpinWheelTab t={t} locale={locale} />
              <PointsTab t={t} locale={locale} />
            </div>
          )}
          {activeTab === 'referral' && <ReferralTab t={t} locale={locale} />}
        </div>
      </div>
    </div>
  );
}

