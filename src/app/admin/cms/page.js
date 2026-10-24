'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Bike, CalendarDays, CheckCircle2, Clock3, Map, RefreshCw, TrendingUp, Users, WalletCards } from 'lucide-react';

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const periods = [
  { id: 'day', label: 'Per Hari', points: 14 },
  { id: 'week', label: 'Per Minggu', points: 12 },
  { id: 'month', label: 'Per Bulan', points: 12 },
];

function shiftDay(day, amount) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function startOfWeek(day) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

function monthShift(month, amount) {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year, index - 1 + amount, 1)).toISOString().slice(0, 7);
}

function pointLabel(key, period) {
  const date = new Date(`${period === 'month' ? `${key}-01` : key}T00:00:00Z`);
  if (period === 'day') return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
  if (period === 'week') return `Mulai ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date)}`;
  return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date);
}

function buildSeries(data, period) {
  if (!data?.generatedAt) return [];
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date(data.generatedAt));
  const points = periods.find((item) => item.id === period)?.points || 14;
  let keys = [];
  if (period === 'day') keys = Array.from({ length: points }, (_, index) => shiftDay(today, index - points + 1));
  if (period === 'week') {
    const current = startOfWeek(today);
    keys = Array.from({ length: points }, (_, index) => shiftDay(current, (index - points + 1) * 7));
  }
  if (period === 'month') keys = Array.from({ length: points }, (_, index) => monthShift(today.slice(0, 7), index - points + 1));
  const bookings = new Map(keys.map((key) => [key, { count: 0, value: 0 }]));
  const members = new Map(keys.map((key) => [key, 0]));
  const bucket = (day) => period === 'day' ? day : period === 'week' ? startOfWeek(day) : day.slice(0, 7);
  (data.bookingDaily || []).forEach((item) => {
    const key = bucket(item.day);
    if (!bookings.has(key)) return;
    const current = bookings.get(key);
    bookings.set(key, { count: current.count + item.count, value: current.value + item.value });
  });
  (data.memberDaily || []).forEach((item) => {
    const key = bucket(item.day);
    if (members.has(key)) members.set(key, members.get(key) + item.count);
  });
  return keys.map((key) => ({ key, label: pointLabel(key, period), bookings: bookings.get(key).count, revenue: bookings.get(key).value, members: members.get(key) }));
}

function StatusPill({ status, count }) {
  const color = status === 'Completed' || status === 'Approved' || status === 'Active'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : status === 'Rejected' || status === 'Cancelled'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';
  return <div className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${color}`}><span className="text-xs font-black uppercase tracking-wide">{status}</span><strong className="text-lg">{count}</strong></div>;
}

function SeriesBars({ series, dataKey, color = 'bg-blue-500' }) {
  const maximum = Math.max(1, ...series.map((item) => Number(item[dataKey] || 0)));
  return <div className="flex h-72 min-w-[620px] items-end gap-2 border-b border-gray-200 px-1 pt-8">
    {series.map((item) => {
      const value = Number(item[dataKey] || 0);
      const height = value ? Math.max(8, Math.round((value / maximum) * 220)) : 3;
      return <div key={item.key} className="flex h-full min-w-10 flex-1 flex-col items-center justify-end gap-2">
        <span className="text-[10px] font-black text-gray-600">{value}</span>
        <div className={`w-full max-w-11 rounded-t-lg transition-all ${value ? color : 'bg-gray-100'}`} style={{ height }} title={`${item.label}: ${value}`} />
        <span className="h-8 text-center text-[9px] font-semibold leading-3 text-gray-400">{item.label}</span>
      </div>;
    })}
  </div>;
}

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/reports', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Laporan gagal dimuat.');
      setData(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadReports());
  }, [loadReports]);
  const series = useMemo(() => buildSeries(data, period), [data, period]);
  const periodBookings = series.reduce((sum, item) => sum + item.bookings, 0);
  const periodRevenue = series.reduce((sum, item) => sum + item.revenue, 0);
  const periodMembers = series.reduce((sum, item) => sum + item.members, 0);

  if (loading && !data) return <div className="grid min-h-[60vh] place-items-center"><div className="text-center"><RefreshCw className="mx-auto animate-spin text-blue-500" /><p className="mt-3 text-sm font-semibold text-gray-500">Menyusun laporan dari database…</p></div></div>;

  return <div className="space-y-6 pb-12 animate-fade-in">
    <header className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-600">Data Operasional</p><h1 className="mt-1 flex items-center gap-3 font-display text-3xl font-black text-gray-900 sm:text-4xl"><BarChart3 className="text-blue-500" /> Laporan Bisnis</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">Pantau booking, member baru, partner, unit sepeda, serta Trip & Tour berdasarkan data nyata.</p></div>
        <button type="button" onClick={loadReports} disabled={loading} className="btn flex items-center justify-center gap-2 border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Perbarui Laporan</button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">{periods.map((item) => <button key={item.id} type="button" onClick={() => setPeriod(item.id)} className={`rounded-full px-5 py-2.5 text-xs font-black transition ${period === item.id ? 'bg-blue-500 text-white shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>{item.label}</button>)}</div>
    </header>

    {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

    {data && <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Booking periode ini', value: periodBookings, sub: `${data.summary.bookings} sepanjang waktu`, icon: CalendarDays, tone: 'blue' },
          { label: 'Nilai booking', value: rupiah.format(periodRevenue), sub: `${rupiah.format(data.summary.revenue)} terbayar`, icon: WalletCards, tone: 'emerald' },
          { label: 'Member baru', value: periodMembers, sub: `${data.summary.members} member tersimpan`, icon: Users, tone: 'violet' },
          { label: 'Partner', value: data.summary.partners, sub: `${data.summary.approvedPartners} disetujui`, icon: CheckCircle2, tone: 'amber' },
          { label: 'Unit sepeda', value: data.summary.bikeUnits, sub: `${data.summary.bikeModels} model`, icon: Bike, tone: 'cyan' },
        ].map((item) => {
          const Icon = item.icon;
          const tones = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', violet: 'bg-violet-50 text-violet-600', amber: 'bg-amber-50 text-amber-600', cyan: 'bg-cyan-50 text-cyan-600' };
          return <article key={item.label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[item.tone]}`}><Icon size={20} /></div><p className="mt-4 text-[10px] font-black uppercase tracking-wide text-gray-400">{item.label}</p><p className="mt-1 font-display text-2xl font-black text-gray-900">{item.value}</p><p className="mt-1 text-xs text-gray-500">{item.sub}</p></article>;
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Laporan Booking</p><h2 className="font-display text-2xl font-black text-gray-900">Booking {periods.find((item) => item.id === period)?.label.toLowerCase()}</h2></div><div className="overflow-x-auto"><SeriesBars series={series} dataKey="bookings" /></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{data.bookingStatuses.map((item) => <StatusPill key={item.status} {...item} />)}</div></article>
        <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="mb-5"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-500">Laporan Member</p><h2 className="font-display text-2xl font-black text-gray-900">Member baru</h2><p className="mt-1 text-sm text-gray-500">Pendaftaran member yang tersimpan di database.</p></div><div className="overflow-x-auto"><SeriesBars series={series} dataKey="members" color="bg-violet-500" /></div></article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Users size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-wide text-amber-600">Laporan Partner</p><h2 className="font-display text-xl font-black text-gray-900">Status pendaftaran partner</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{data.partnerStatuses.map((item) => <StatusPill key={item.status} {...item} />)}</div></article>
        <article className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Map size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-wide text-emerald-600">Laporan Trip & Tour</p><h2 className="font-display text-xl font-black text-gray-900">{data.summary.publishedTours} dari {data.summary.tours} paket tayang</h2></div></div><div className="mt-5 space-y-3">{data.tours.map((item) => <div key={item.category} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"><div><p className="text-sm font-black text-gray-800">{item.category}</p><p className="text-xs text-gray-500">{item.published} tayang</p></div><strong className="text-xl text-gray-900">{item.total}</strong></div>)}</div></article>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-cyan-600"><Bike size={20} /></div><div><p className="text-[10px] font-black uppercase tracking-wide text-cyan-600">Laporan Unit Sepeda</p><h2 className="font-display text-xl font-black text-gray-900">Stok dan unit yang sedang digunakan</h2></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{data.fleet.map((bike) => <article key={bike.id} className="rounded-2xl border border-gray-100 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-gray-900">{bike.name}</h3><p className="mt-1 text-xs uppercase text-gray-400">{bike.category}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${bike.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{bike.active ? 'AKTIF' : 'NONAKTIF'}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-gray-50 p-2"><strong className="block text-lg">{bike.stock}</strong><span className="text-[9px] uppercase text-gray-400">Total</span></div><div className="rounded-xl bg-blue-50 p-2 text-blue-700"><strong className="block text-lg">{bike.rented}</strong><span className="text-[9px] uppercase">Disewa</span></div><div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><strong className="block text-lg">{bike.available}</strong><span className="text-[9px] uppercase">Tersedia</span></div></div></article>)}</div></section>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-gray-100 p-5 sm:p-6"><Clock3 className="text-blue-500" /><div><p className="text-[10px] font-black uppercase tracking-wide text-blue-500">Aktivitas Terbaru</p><h2 className="font-display text-xl font-black text-gray-900">Booking terbaru</h2></div></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-gray-50 text-[10px] font-black uppercase tracking-wide text-gray-400"><tr><th className="px-5 py-4">Kode</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Sepeda</th><th className="px-5 py-4">Nilai</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Dibuat</th></tr></thead><tbody className="divide-y divide-gray-100">{data.recentBookings.map((booking) => <tr key={booking.code}><td className="px-5 py-4 font-black text-blue-700">{booking.code}</td><td className="px-5 py-4 font-semibold text-gray-800">{booking.customer}</td><td className="px-5 py-4 text-gray-600">{booking.bike}</td><td className="px-5 py-4 font-bold">{rupiah.format(booking.total)}</td><td className="px-5 py-4"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase text-gray-600">{booking.status}</span></td><td className="px-5 py-4 text-gray-500">{booking.createdAt}</td></tr>)}</tbody></table></div>{data.recentBookings.length === 0 && <div className="p-10 text-center text-sm text-gray-500">Belum ada booking.</div>}</section>

      <p className="flex items-center justify-center gap-2 text-xs text-gray-400"><TrendingUp size={14} /> Diperbarui {new Date(data.generatedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
    </>}
  </div>;
}
