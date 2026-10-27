'use client';

import { useCallback, useEffect, useState } from 'react';
import { BellRing, CheckCircle2, CircleAlert, Mail, MessageCircle, Plus, RefreshCw, Save, Send, Trash2 } from 'lucide-react';

const eventOptions = [
  { id: 'booking', label: 'Booking baru' },
  { id: 'customer', label: 'Customer baru' },
  { id: 'partner', label: 'Partner baru' },
];
const blank = { channel: 'telegram', destination: '', label: '', events: ['booking', 'customer', 'partner'], enabled: true };

async function json(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function Notice({ value }) {
  if (!value.text) return null;
  return <div className={`rounded-2xl border px-4 py-3 text-sm font-bold ${value.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{value.text}</div>;
}

function EventChecks({ value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  return <div className="grid gap-2 sm:grid-cols-3">{eventOptions.map((event) => <label key={event.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={value.includes(event.id)} onChange={() => toggle(event.id)} className="h-4 w-4 accent-blue-500" />{event.label}</label>)}</div>;
}

export default function NotificationsAdminPage() {
  const [data, setData] = useState({ recipients: [], deliveries: [], providers: { telegramConfigured: false, emailConfigured: false } });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await json(await fetch('/api/notifications', { cache: 'no-store' }))); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const reset = () => { setForm(blank); setEditing(null); };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const endpoint = editing ? `/api/notifications/${editing.id}` : '/api/notifications';
      await json(await fetch(endpoint, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }));
      setMessage({ type: 'success', text: `Penerima notifikasi berhasil ${editing ? 'diperbarui' : 'ditambahkan'}.` });
      reset(); await load();
    } catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setSaving(false); }
  };
  const edit = (recipient) => { setEditing(recipient); setForm({ channel: recipient.channel, destination: recipient.destination, label: recipient.label, events: recipient.events, enabled: recipient.enabled }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (recipient) => {
    if (!window.confirm(`Hapus penerima ${recipient.destination}?`)) return;
    try { await json(await fetch(`/api/notifications/${recipient.id}`, { method: 'DELETE' })); setMessage({ type: 'success', text: 'Penerima notifikasi dihapus.' }); await load(); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
  };
  const toggleEnabled = async (recipient) => {
    try { await json(await fetch(`/api/notifications/${recipient.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !recipient.enabled, events: recipient.events, label: recipient.label }) })); await load(); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
  };
  const test = async () => {
    setTesting(true);
    try { const result = await json(await fetch('/api/notifications/test', { method: 'POST' })); const sent = result.results.filter((item) => item.status === 'sent').length; setMessage({ type: 'success', text: `Uji notifikasi selesai: ${sent} pesan berhasil dikirim.` }); await load(); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setTesting(false); }
  };

  return <div className="space-y-6 pb-12">
    <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Otomasi Admin</p><h1 className="font-display text-3xl font-black text-gray-900">Notifikasi Real-time</h1><p className="mt-1 text-sm text-gray-500">Kirim pemberitahuan otomatis ketika ada booking, customer, atau pendaftar partner baru.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="btn border px-4" aria-label="Muat ulang"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={test} disabled={testing || !data.recipients.some((item) => item.enabled)} className="btn btn-primary flex items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"><Send size={17} />{testing ? 'Mengirim…' : 'Kirim Uji'}</button></div></header>

    <Notice value={message} />
    <section className="grid gap-4 md:grid-cols-2"><ProviderCard icon={<MessageCircle />} title="Telegram Bot" ready={data.providers.telegramConfigured} env="TELEGRAM_BOT_TOKEN" description="Daftarkan Chat ID pribadi, grup, atau channel. Pastikan bot sudah menjadi anggota chat." /><ProviderCard icon={<Mail />} title="Email" ready={data.providers.emailConfigured} env="RESEND_API_KEY + NOTIFICATION_FROM_EMAIL" description="Alamat pengirim dan API email disimpan aman di Environment Variables, bukan di dashboard." /></section>

    <form onSubmit={save} className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-display text-xl font-black">{editing ? 'Ubah Penerima' : 'Tambah Penerima'}</h2><p className="text-xs text-gray-500">Pilih kanal dan jenis kejadian yang ingin diterima.</p></div>{editing && <button type="button" onClick={reset} className="text-sm font-bold text-gray-500 hover:text-gray-900">Batal edit</button>}</div><div className="grid gap-4 md:grid-cols-2"><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Kanal</span><select disabled={Boolean(editing)} className="clean-input" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}><option value="telegram">Telegram</option><option value="email">Email</option></select></label><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">{form.channel === 'telegram' ? 'Chat ID Telegram / @channel' : 'Alamat Email'}</span><input disabled={Boolean(editing)} required className="clean-input" value={form.destination} placeholder={form.channel === 'telegram' ? 'Contoh: 123456789 atau -100…' : 'admin@contoh.com'} onChange={(event) => setForm({ ...form, destination: event.target.value })} /></label><label className="block md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Nama Penerima (opsional)</span><input className="clean-input" value={form.label} placeholder="Contoh: Admin Operasional" onChange={(event) => setForm({ ...form, label: event.target.value })} /></label><div className="md:col-span-2"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">Notifikasi yang diterima</span><EventChecks value={form.events} onChange={(events) => setForm({ ...form, events })} /></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setForm({ ...form, enabled: !form.enabled })} className={`rounded-xl border px-4 py-2 text-sm font-bold ${form.enabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{form.enabled ? 'Penerima aktif' : 'Penerima nonaktif'}</button><button disabled={saving} className="btn btn-primary flex items-center gap-2 px-6"><Save size={17} />{saving ? 'Menyimpan…' : editing ? 'Simpan Perubahan' : 'Tambah Penerima'}</button></div></form>

    <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-4"><h2 className="font-display text-xl font-black">Penerima Terdaftar</h2><p className="text-xs text-gray-500">Matikan sementara penerima tanpa menghapus konfigurasinya.</p></div>{loading ? <p className="py-8 text-center text-sm text-gray-400">Memuat penerima…</p> : data.recipients.length ? <div className="divide-y">{data.recipients.map((recipient) => <div key={recipient.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${recipient.channel === 'telegram' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'}`}>{recipient.channel === 'telegram' ? <MessageCircle size={21} /> : <Mail size={21} />}</div><div className="min-w-0 flex-1"><p className="font-bold text-gray-900">{recipient.label || (recipient.channel === 'telegram' ? 'Telegram' : 'Email')}</p><p className="truncate text-sm text-gray-500">{recipient.destination}</p><p className="mt-1 text-xs text-gray-400">{recipient.events.map((event) => eventOptions.find((item) => item.id === event)?.label).filter(Boolean).join(' · ')}</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => toggleEnabled(recipient)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${recipient.enabled ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>{recipient.enabled ? 'Aktif' : 'Nonaktif'}</button><button type="button" onClick={() => edit(recipient)} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600">Ubah</button><button type="button" onClick={() => remove(recipient)} className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-600" aria-label="Hapus penerima"><Trash2 size={16} /></button></div></div>)}</div> : <p className="py-8 text-center text-sm text-gray-400">Belum ada penerima. Tambahkan Telegram atau email di atas.</p>}</section>

    <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="mb-4"><h2 className="font-display text-xl font-black">Riwayat Pengiriman</h2><p className="text-xs text-gray-500">30 aktivitas terbaru; pesan gagal dapat ditinjau di sini.</p></div>{data.deliveries.length ? <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b text-[10px] font-black uppercase tracking-wider text-gray-400"><tr><th className="px-3 py-3">Waktu</th><th className="px-3 py-3">Kejadian</th><th className="px-3 py-3">Tujuan</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{data.deliveries.map((delivery) => <tr key={delivery.id} className="border-b last:border-0"><td className="px-3 py-3 text-gray-500">{new Date(delivery.createdAt).toLocaleString('id-ID')}</td><td className="px-3 py-3 font-semibold text-gray-800">{eventOptions.find((item) => item.id === delivery.eventType)?.label || 'Uji notifikasi'}</td><td className="px-3 py-3 text-gray-600">{delivery.channel === 'telegram' ? 'Telegram' : 'Email'} · {delivery.destination}</td><td className="px-3 py-3"><span title={delivery.error || undefined} className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${delivery.status === 'sent' ? 'bg-green-50 text-green-700' : delivery.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{delivery.status === 'sent' ? 'Terkirim' : delivery.status === 'failed' ? 'Gagal' : delivery.status === 'skipped' ? 'Belum siap' : 'Diproses'}</span></td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-sm text-gray-400">Belum ada riwayat pengiriman.</p>}</section>
  </div>;
}

function ProviderCard({ icon, title, ready, env, description }) {
  return <article className={`rounded-3xl border p-5 shadow-sm ${ready ? 'border-green-100 bg-green-50/40' : 'border-amber-100 bg-amber-50/40'}`}><div className="flex items-start gap-3"><div className={`grid h-11 w-11 place-items-center rounded-2xl ${ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{icon}</div><div><div className="flex items-center gap-2"><h2 className="font-display text-lg font-black">{title}</h2>{ready ? <CheckCircle2 size={17} className="text-green-600" /> : <CircleAlert size={17} className="text-amber-600" />}</div><p className={`mt-1 text-sm font-bold ${ready ? 'text-green-700' : 'text-amber-700'}`}>{ready ? 'Siap mengirim' : 'Belum dikonfigurasi'}</p></div></div><p className="mt-3 text-xs leading-5 text-gray-600">{description}</p>{!ready && <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 font-mono text-[11px] text-gray-600">Vercel Environment: {env}</p>}</article>;
}
