'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Banknote, CheckCircle2, CreditCard, ImagePlus, Pencil, Plus, Power, QrCode, Trash2, X } from 'lucide-react';

const blankMethod = {
  type: 'bank',
  name: 'Transfer Bank',
  provider: '',
  accountNumber: '',
  accountHolder: '',
  instructions: 'Transfer tepat sesuai total pembayaran hingga digit terakhir.',
  imageUrl: '',
  imagePublicId: '',
  active: true,
  sortOrder: 10,
};

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Permintaan gagal diproses.');
  return data;
}

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankMethod);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadMethods = useCallback(async () => {
    setLoading(true);
    try {
      setMethods(await readJson(await fetch('/api/payment-methods?all=1', { cache: 'no-store' })));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(loadMethods); }, [loadMethods]);

  useEffect(() => {
    if (!editing) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setEditing(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [editing]);

  const openCreate = () => {
    setEditing('new');
    setForm({ ...blankMethod, sortOrder: (methods.length + 1) * 10 });
    setMessage({ type: '', text: '' });
  };

  const openEdit = (method) => {
    setEditing(method.id);
    setForm({ ...method });
    setMessage({ type: '', text: '' });
  };

  const uploadQris = async (file) => {
    if (!file) return;
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'kulino-pit/payments');
      const uploaded = await readJson(await fetch('/api/upload', { method: 'POST', body }));
      setForm((current) => ({ ...current, imageUrl: uploaded.url, imagePublicId: uploaded.publicId }));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const saveMethod = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const isNew = editing === 'new';
      const endpoint = isNew ? '/api/payment-methods' : `/api/payment-methods/${encodeURIComponent(editing)}`;
      const saved = await readJson(await fetch(endpoint, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }));
      setMethods((current) => {
        const next = isNew ? [...current, saved] : current.map((item) => item.id === saved.id ? saved : item);
        return next.sort((a, b) => a.sortOrder - b.sortOrder);
      });
      setEditing(null);
      setMessage({ type: 'success', text: `Metode “${saved.name}” berhasil disimpan dan tersambung ke booking.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (method) => {
    setMessage({ type: '', text: '' });
    try {
      const saved = await readJson(await fetch(`/api/payment-methods/${encodeURIComponent(method.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !method.active }),
      }));
      setMethods((current) => current.map((item) => item.id === saved.id ? saved : item));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const deleteMethod = async (method) => {
    if (!window.confirm(`Hapus metode pembayaran “${method.name}”?`)) return;
    setMessage({ type: '', text: '' });
    try {
      await readJson(await fetch(`/api/payment-methods/${encodeURIComponent(method.id)}`, { method: 'DELETE' }));
      setMethods((current) => current.filter((item) => item.id !== method.id));
      setMessage({ type: 'success', text: `Metode “${method.name}” berhasil dihapus.` });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Booking & pembayaran</p>
          <h1 className="mt-1 font-display text-3xl font-black text-gray-900">Metode Pembayaran</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Kelola rekening bank dan QRIS yang tampil pada pilihan booking serta tiket pembayaran member.</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold">
          <Plus size={17} /> Tambah Metode
        </button>
      </header>

      {message.text && <div className={`rounded-2xl border p-4 text-sm font-semibold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>}

      {loading ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">Memuat metode pembayaran…</div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {methods.map((method) => (
            <article key={method.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${method.type === 'qris' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'}`}>
                  {method.type === 'qris' ? <QrCode size={23} /> : <Banknote size={23} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-black text-gray-900">{method.name}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${method.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{method.active ? 'Aktif' : 'Nonaktif'}</span>
                  </div>
                  {method.type === 'bank' ? (
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p><strong className="text-gray-900">{method.provider}</strong> · {method.accountNumber}</p>
                      <p>a/n {method.accountHolder}</p>
                    </div>
                  ) : method.imageUrl ? (
                    <div className="relative mt-3 h-36 w-36 overflow-hidden rounded-2xl border border-gray-100 bg-white"><Image src={method.imageUrl} alt={`QRIS ${method.name}`} fill className="object-contain p-2" unoptimized /></div>
                  ) : (
                    <p className="mt-3 text-sm font-semibold text-amber-600">Gambar QRIS belum diunggah.</p>
                  )}
                  {method.instructions && <p className="mt-3 text-xs leading-5 text-gray-500">{method.instructions}</p>}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
                <button onClick={() => toggleMethod(method)} className="btn flex items-center gap-2 border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600"><Power size={14} /> {method.active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                <button onClick={() => openEdit(method)} className="btn flex items-center gap-2 border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700"><Pencil size={14} /> Edit</button>
                <button onClick={() => deleteMethod(method)} className="btn flex items-center gap-2 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"><Trash2 size={14} /> Hapus</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && methods.length === 0 && <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center"><CreditCard className="mx-auto text-gray-300" size={40} /><p className="mt-3 font-bold text-gray-700">Belum ada metode pembayaran.</p></div>}

      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gray-950/55 p-3 backdrop-blur-[2px] sm:p-5" onClick={() => setEditing(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="payment-modal-title" className="flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:max-w-xl" onClick={(event) => event.stopPropagation()}>
            <div className="z-10 flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-[var(--color-primary)]">CRUD Pembayaran</p><h2 id="payment-modal-title" className="truncate font-display text-xl font-black text-gray-900 sm:text-2xl">{editing === 'new' ? 'Tambah' : 'Edit'} Metode</h2></div>
              <button type="button" onClick={() => setEditing(null)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900" aria-label="Tutup modal pembayaran"><X size={20} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <form id="payment-method-form" onSubmit={saveMethod} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[['bank', 'Transfer Bank', Banknote], ['qris', 'QRIS', QrCode]].map(([type, label, Icon]) => <button key={type} type="button" onClick={() => setForm((current) => ({ ...current, type, name: current.name || label }))} className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-sm font-bold ${form.type === type ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}><Icon size={17} /> {label}</button>)}
              </div>
              <Field label="Nama Tampilan"><input required className="clean-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Transfer BCA" /></Field>
              {form.type === 'bank' ? <>
                <Field label="Nama Bank / Provider"><input required className="clean-input" value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} placeholder="BCA" /></Field>
                <Field label="Nomor Rekening"><input required inputMode="numeric" className="clean-input" value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} placeholder="Nomor rekening" /></Field>
                <Field label="Nama Pemilik Rekening"><input required className="clean-input" value={form.accountHolder} onChange={(event) => setForm({ ...form, accountHolder: event.target.value })} placeholder="Nama sesuai rekening" /></Field>
              </> : <Field label="Gambar QRIS">
                <label className="btn btn-primary flex cursor-pointer items-center justify-center gap-2 py-3"><ImagePlus size={17} /> {uploading ? 'Mengunggah…' : 'Upload QRIS'}<input type="file" accept="image/*" className="hidden" onChange={(event) => uploadQris(event.target.files?.[0])} /></label>
                {form.imageUrl && <div className="relative mx-auto mt-3 h-48 w-48 overflow-hidden rounded-2xl border border-gray-100"><Image src={form.imageUrl} alt="Preview QRIS" fill className="object-contain p-2" unoptimized /></div>}
              </Field>}
              <Field label="Instruksi Pembayaran"><textarea rows="3" className="clean-input" value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} placeholder="Instruksi yang tampil di tiket pembayaran" /></Field>
              <Field label="Urutan"><input type="number" className="clean-input" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} /></Field>
              <button type="button" onClick={() => setForm({ ...form, active: !form.active })} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-sm font-bold ${form.active ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}><span>{form.active ? 'Aktif untuk booking' : 'Tidak ditampilkan saat booking'}</span>{form.active ? <CheckCircle2 size={20} /> : <Power size={20} />}</button>
            </form>
            </div>
            <div className="flex shrink-0 gap-3 border-t border-gray-100 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
              <button type="button" onClick={() => setEditing(null)} className="btn flex-1 border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50">Batal</button>
              <button form="payment-method-form" type="submit" disabled={saving || uploading} className="btn btn-primary flex-[1.5] py-3 text-sm font-bold disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan Pembayaran'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-500">{label}</span>{children}</label>;
}
