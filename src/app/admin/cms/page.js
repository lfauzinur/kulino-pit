'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity, Bike, CalendarDays, CheckCircle2, CircleDollarSign, Database,
  ExternalLink, FileText, Globe, History, RefreshCcw, Search, Shield,
  Users, XCircle, Zap,
} from 'lucide-react';
import { formatCurrency } from '@/lib/data';

const adminLinks = [
  { label: 'Kelola Booking', href: '/admin/bookings', icon: CalendarDays, description: 'Transaksi dan status penyewaan' },
  { label: 'Fleet & Sepeda', href: '/admin/fleet', icon: Bike, description: 'Unit, harga, dan ketersediaan' },
  { label: 'Pendaftaran Mitra', href: '/admin/partners', icon: Users, description: 'Review pengajuan partner' },
  { label: 'Artikel', href: '/admin/articles', icon: FileText, description: 'Konten artikel database' },
  { label: 'Spin Prizes', href: '/admin/spin-prizes', icon: Zap, description: 'Hadiah dan probabilitas' },
];

function CheckMark({ passed }) {
  return passed
    ? <CheckCircle2 size={15} className="mx-auto text-green-500" aria-label="Lulus" />
    : <XCircle size={15} className="mx-auto text-red-400" aria-label="Belum lulus" />;
}

function scoreClass(score) {
  if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
  if (score >= 60) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export default function CMSAuditPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/cms-audit', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Audit tidak dapat dimuat.');
      setAudit(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadAudit());
  }, [loadAudit]);

  const categories = useMemo(() => {
    return (audit?.pages || []).reduce((groups, page) => {
      groups[page.category] = [...(groups[page.category] || []), page];
      return groups;
    }, {});
  }, [audit]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'pages', label: 'Page & SEO Audit', icon: Search },
    { id: 'activity', label: 'Aktivitas Database', icon: History },
    { id: 'actions', label: 'Quick Actions', icon: Zap },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display flex items-center gap-3 text-3xl font-black text-gray-900">
            <Shield size={28} className="text-[var(--color-primary)]" /> CMS Audit
          </h1>
          <p className="mt-1 text-sm text-gray-500">Data database dan pemeriksaan halaman secara langsung.</p>
          {audit?.scannedAt && (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
              <Database size={11} /> Dipindai {new Date(audit.scannedAt).toLocaleString('id-ID')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={loadAudit} disabled={loading} className="btn flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Memindai…' : 'Refresh Audit'}
          </button>
          <Link href="/" target="_blank" className="btn btn-primary flex items-center gap-2 px-4 py-2 text-sm">
            <Globe size={14} /> Preview Site
          </Link>
        </div>
      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <span>{error}</span>
          <button type="button" onClick={loadAudit} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm">Coba Lagi</button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`btn flex shrink-0 items-center gap-2 px-5 py-2.5 text-xs ${activeTab === tab.id ? 'btn-primary shadow-md' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}>
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading && !audit && (
        <div className="clean-card p-12 text-center hover:translate-y-0">
          <RefreshCcw size={30} className="mx-auto mb-4 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-semibold text-gray-600">Memeriksa halaman dan membaca database…</p>
        </div>
      )}

      {audit && activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Halaman Online', value: `${audit.stats.reachable}/${audit.stats.pages}`, icon: Globe, color: 'text-blue-600 bg-blue-50' },
              { label: 'SEO Rata-rata', value: `${audit.stats.averageSeo}%`, icon: Search, color: 'text-purple-600 bg-purple-50' },
              { label: 'Unit Sepeda', value: audit.stats.bikes, icon: Bike, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Booking', value: audit.stats.bookings, icon: CalendarDays, color: 'text-amber-600 bg-amber-50' },
              { label: 'Mitra', value: audit.stats.partners, icon: Users, color: 'text-pink-600 bg-pink-50' },
              { label: 'Artikel', value: audit.stats.articles, icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Transaksi Revenue', value: audit.stats.paidBookings, icon: CheckCircle2, color: 'text-cyan-600 bg-cyan-50' },
              { label: 'Revenue', value: formatCurrency(audit.stats.revenue), icon: CircleDollarSign, color: 'text-green-700 bg-green-50' },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="clean-card p-5 hover:translate-y-0">
                  <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}><Icon size={19} /></div>
                  <p className="font-display text-2xl font-black text-gray-900">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="clean-card overflow-hidden hover:translate-y-0">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-5">
              <h2 className="font-display flex items-center gap-2 text-sm font-bold text-gray-900"><Database size={16} className="text-[var(--color-primary)]" /> Kondisi Website Saat Ini</h2>
              <span className="text-[10px] font-bold text-green-600">LIVE DATA</span>
            </div>
            <div className="space-y-6 p-5">
              {Object.entries(categories).map(([category, pages]) => (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{category}</span>
                    <span className="text-[10px] font-semibold text-gray-400">{pages.length} halaman</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pages.map((page) => (
                      <button key={page.id} type="button" onClick={() => setActiveTab('pages')} className="rounded-xl border border-gray-100 p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-blue-50/30">
                        <div className="flex items-start justify-between gap-3">
                          <div><p className="text-sm font-bold text-gray-900">{page.name}</p><p className="mt-1 font-mono text-[10px] text-gray-400">{page.path}</p></div>
                          <span className={`rounded-lg border px-2 py-1 text-[9px] font-bold ${scoreClass(page.score)}`}>{page.score}%</span>
                        </div>
                        <p className={`mt-3 text-[10px] font-bold ${page.reachable ? 'text-green-600' : 'text-red-600'}`}>{page.reachable ? `Online · HTTP ${page.statusCode}` : 'Tidak dapat dijangkau'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {audit && activeTab === 'pages' && (
        <div className="clean-card overflow-hidden hover:translate-y-0">
          <div className="border-b border-gray-100 bg-gray-50 p-5">
            <h2 className="font-display text-sm font-bold text-gray-900">Hasil Audit HTML & SEO</h2>
            <p className="mt-1 text-[10px] text-gray-500">Nilai dihitung dari title, meta description, H1, Open Graph, dan structured data pada HTML aktual.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead><tr className="border-b border-gray-100 text-[9px] font-bold uppercase tracking-wider text-gray-400">
                <th className="p-4">Halaman</th><th className="p-4 text-center">Online</th><th className="p-4 text-center">Title</th><th className="p-4 text-center">Meta</th><th className="p-4 text-center">H1</th><th className="p-4 text-center">OG</th><th className="p-4 text-center">Schema</th><th className="p-4 text-center">Score</th><th className="p-4 text-right">Buka</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {audit.pages.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="p-4"><p className="text-xs font-bold text-gray-900">{page.name}</p><p className="font-mono text-[9px] text-gray-400">{page.path} · {page.sections} section · {page.headings} heading</p></td>
                    <td className="p-4 text-center"><CheckMark passed={page.reachable} /></td>
                    <td className="p-4 text-center"><CheckMark passed={page.checks.title} /></td>
                    <td className="p-4 text-center"><CheckMark passed={page.checks.meta} /></td>
                    <td className="p-4 text-center"><CheckMark passed={page.checks.h1} /></td>
                    <td className="p-4 text-center"><CheckMark passed={page.checks.og} /></td>
                    <td className="p-4 text-center"><CheckMark passed={page.checks.schema} /></td>
                    <td className="p-4 text-center"><span className={`inline-block rounded-lg border px-2 py-1 text-[10px] font-bold ${scoreClass(page.score)}`}>{page.score}%</span></td>
                    <td className="p-4 text-right"><Link href={page.path} target="_blank" className="inline-flex rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-[var(--color-primary)]" aria-label={`Buka ${page.name}`}><ExternalLink size={14} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {audit && activeTab === 'activity' && (
        <div className="clean-card overflow-hidden hover:translate-y-0">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-5">
            <h2 className="font-display flex items-center gap-2 text-sm font-bold text-gray-900"><History size={16} className="text-[var(--color-primary)]" /> Aktivitas Database Terbaru</h2>
            <span className="text-[10px] font-bold text-gray-400">{audit.logs.length} records</span>
          </div>
          <div className="divide-y divide-gray-50">
            {audit.logs.map((event) => (
              <div key={event.id} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]"><Database size={15} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-gray-900">{event.title}</p><span className="rounded bg-gray-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-gray-500">{event.type}</span></div>
                  <p className="mt-1 text-xs text-gray-600">{event.detail}</p>
                  <p className="mt-1 text-[9px] text-gray-400">{new Date(event.timestamp).toLocaleString('id-ID')}</p>
                </div>
              </div>
            ))}
            {!audit.logs.length && <p className="p-10 text-center text-sm text-gray-500">Belum ada aktivitas database.</p>}
          </div>
        </div>
      )}

      {audit && activeTab === 'actions' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="clean-card group block p-5 hover:translate-y-0 hover:border-blue-200 hover:bg-blue-50/40">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]"><Icon size={20} /></div>
                <h3 className="font-display text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)]">{item.label}</h3>
                <p className="mt-1 text-[10px] text-gray-500">{item.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)]">Buka <ExternalLink size={11} /></span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
