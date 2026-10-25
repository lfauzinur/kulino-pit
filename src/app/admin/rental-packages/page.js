'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Edit2, Eye, EyeOff, MessageCircle, Plus, RefreshCw, Save, Star, Trash2, Users } from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

const types = [
  { id: 'family', label: 'Family Rent' },
  { id: 'corporate', label: 'Corporate / Group' },
];

const blank = (type) => ({
  type,
  name: '',
  persons: '',
  bikes: '',
  duration: '',
  price: '',
  features: [],
  popular: false,
  whatsappNumber: '628113000000',
  whatsappLabel: type === 'corporate' ? 'Minta Penawaran' : 'Pesan via WhatsApp',
  whatsappMessage: '',
  sortOrder: 0,
  published: true,
});

async function json(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export default function RentalPackagesAdmin() {
  const [type, setType] = useState('family');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank('family'));
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await json(await fetch(`/api/rental-packages?type=${type}&all=1`, { cache: 'no-store' })));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const showEditor = (item) => {
    setEditing(item || null);
    setForm(item ? { ...item } : blank(type));
    setMessage({ type: '', text: '' });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await json(await fetch(editing ? `/api/rental-packages/${editing.id}` : '/api/rental-packages', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }));
      closeEditor();
      setMessage({ type: 'success', text: 'Paket dan aksi WhatsApp berhasil disimpan.' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await json(await fetch(`/api/rental-packages/${deleting.id}`, { method: 'DELETE' }));
      setDeleting(null);
      setMessage({ type: 'success', text: 'Paket berhasil dihapus.' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (deleting) return <AdminConfirmPage title="Hapus Paket?" description={`Paket “${deleting.name}” akan dihapus permanen dari website.`} onCancel={() => setDeleting(null)} onConfirm={remove} />;

  if (editorOpen) {
    return (
      <div className="space-y-6 pb-12">
        <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <button type="button" onClick={closeEditor} className="btn border px-3" aria-label="Kembali ke daftar paket"><ArrowLeft size={18} /></button>
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Editor Paket Rental</p><h1 className="font-display text-3xl font-black">{editing ? 'Edit' : 'Tambah'} Paket</h1><p className="text-sm text-gray-500">Halaman penuh tanpa popup. Semua perubahan langsung dipakai kartu website.</p></div>
          </div>
          <button type="submit" form="rental-package-form" disabled={saving} className="btn btn-primary flex items-center justify-center gap-2 px-6"><Save size={17} />{saving ? 'Menyimpan…' : 'Simpan Paket'}</button>
        </header>
        {message.text && <Notice message={message} />}
        <form id="rental-package-form" onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jenis Paket"><select className="clean-input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{types.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}</select></Field>
              <Field label="Nama Paket"><input required className="clean-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Family Plus" /></Field>
              <Field label="Jumlah Peserta"><input className="clean-input" value={form.persons} onChange={(event) => setForm({ ...form, persons: event.target.value })} placeholder="2–6 orang" /></Field>
              <Field label="Jumlah / Jenis Sepeda"><input className="clean-input" value={form.bikes} onChange={(event) => setForm({ ...form, bikes: event.target.value })} placeholder="2–6 sepeda pilihan" /></Field>
              <Field label="Durasi"><input className="clean-input" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Sehari penuh (8 jam)" /></Field>
              <Field label="Label Harga"><input className="clean-input" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Mulai Rp 350.000" /></Field>
            </div>
            <Field label="Fasilitas (satu per baris)"><textarea rows="8" className="clean-input" value={form.features.join('\n')} onChange={(event) => setForm({ ...form, features: event.target.value.split('\n') })} placeholder={'Helm untuk semua peserta\nRoad Captain pendamping'} /></Field>
            <div className="border-t pt-5"><h2 className="mb-4 flex items-center gap-2 font-display text-xl font-black"><MessageCircle size={19} className="text-green-600" /> Aksi WhatsApp</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Nomor WhatsApp"><input required inputMode="tel" className="clean-input" value={form.whatsappNumber} onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })} placeholder="628113000000" /></Field><Field label="Teks Tombol"><input required className="clean-input" value={form.whatsappLabel} onChange={(event) => setForm({ ...form, whatsappLabel: event.target.value })} placeholder="Pesan via WhatsApp" /></Field></div><Field label="Pesan Awal WhatsApp"><textarea rows="4" className="clean-input" value={form.whatsappMessage} onChange={(event) => setForm({ ...form, whatsappMessage: event.target.value })} placeholder="Halo Kulino Pit! Saya tertarik dengan paket ini." /></Field></div>
          </section>
          <aside className="space-y-5 xl:sticky xl:top-6">
            <section className={`relative rounded-3xl border bg-white p-6 shadow-sm ${form.popular ? 'border-blue-500' : ''}`}>
              {form.popular && <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-500 px-4 py-1 text-[10px] font-bold uppercase text-white"><Star size={10} fill="white" /> Populer</span>}
              <h2 className="font-display text-xl font-black">{form.name || 'Nama paket'}</h2><p className="mt-2 text-xs text-gray-400">👥 {form.persons || 'Jumlah peserta'}</p><p className="mt-1 text-xs text-gray-400">🚲 {form.bikes || 'Jumlah sepeda'}</p><p className="mt-1 text-xs text-gray-400">⏱️ {form.duration || 'Durasi'}</p><p className="mt-4 font-display text-xl font-black text-blue-500">{form.price || 'Label harga'}</p><div className="mt-4 space-y-2">{form.features.filter(Boolean).slice(0, 4).map((feature, index) => <p key={`${feature}-${index}`} className="flex gap-2 text-xs text-gray-600"><CheckCircle2 size={14} className="shrink-0 text-green-500" />{feature}</p>)}</div><div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white"><MessageCircle size={16} />{form.whatsappLabel || 'Pesan via WhatsApp'}</div>
            </section>
            <section className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm"><Field label="Urutan"><input type="number" className="clean-input" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></Field><Toggle value={form.popular} onChange={() => setForm({ ...form, popular: !form.popular })} icon={<Star size={18} />} active="Paket Populer" inactive="Paket Reguler" /><Toggle value={form.published} onChange={() => setForm({ ...form, published: !form.published })} icon={form.published ? <Eye size={18} /> : <EyeOff size={18} />} active="Tayang" inactive="Draft" /></section>
          </aside>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Booking & Penawaran</p><h1 className="font-display text-3xl font-black">Paket Rental</h1><p className="text-sm text-gray-500">CRUD kartu paket dan aksi “Pesan via WhatsApp” di halaman Family serta Corporate.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="btn border px-4" aria-label="Muat ulang"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={() => showEditor()} className="btn btn-primary flex items-center gap-2 px-5"><Plus size={17} /> Tambah Paket</button></div></header>
      <div className="flex flex-wrap gap-2">{types.map((entry) => <button key={entry.id} type="button" onClick={() => setType(entry.id)} className={`rounded-full px-5 py-2 text-xs font-bold ${type === entry.id ? 'bg-blue-500 text-white' : 'border bg-white text-gray-600'}`}>{entry.label}</button>)}</div>
      {message.text && <Notice message={message} />}
      {!loading && items.length === 0 && <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">Belum ada paket pada bagian ini.</div>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className={`relative flex flex-col rounded-3xl border bg-white p-6 shadow-sm ${item.popular ? 'border-blue-500' : ''}`}>{item.popular && <span className="absolute -top-3 left-6 flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase text-amber-600"><Star size={11} /> Populer</span>}<div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-xl font-black">{item.name}</h2><p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><Users size={13} />{item.persons}</p></div>{item.published ? <Eye size={17} className="text-green-500" /> : <EyeOff size={17} className="text-gray-400" />}</div><p className="mt-4 font-display text-xl font-black text-blue-500">{item.price}</p><p className="mt-2 text-xs text-gray-500">{item.duration} · {item.bikes}</p><div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-xs font-bold text-green-700"><MessageCircle size={15} /> {item.whatsappLabel}</div><div className="mt-5 flex justify-end gap-1 border-t pt-3"><button type="button" onClick={() => showEditor(item)} className="p-2 text-gray-500 hover:text-blue-600" aria-label={`Edit ${item.name}`}><Edit2 size={17} /></button><button type="button" onClick={() => setDeleting(item)} className="p-2 text-gray-500 hover:text-red-500" aria-label={`Hapus ${item.name}`}><Trash2 size={17} /></button></div></article>)}</div>
    </div>
  );
}

function Notice({ message }) { return <div className={`rounded-2xl border p-4 text-sm font-bold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">{label}</span>{children}</label>; }
function Toggle({ value, onChange, icon, active, inactive }) { return <button type="button" onClick={onChange} className={`flex w-full items-center justify-between rounded-2xl border p-4 font-bold ${value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}><span>{value ? active : inactive}</span>{icon}</button>; }
