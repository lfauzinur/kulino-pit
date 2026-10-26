'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Edit2, Eye, EyeOff, ImagePlus, Plus, RefreshCw, Save, Trash2, Upload } from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

const blank = () => ({
  kind: 'promo',
  badge: { id: '', en: '' },
  title: { id: '', en: '' },
  description: { id: '', en: '' },
  ctaLabel: { id: 'Lihat Selengkapnya', en: 'Learn More' },
  ctaUrl: '',
  backgroundColor: '#2693D8',
  textColor: '#FFFFFF',
  imageUrl: '',
  imagePublicId: '',
  sortOrder: 0,
  published: true,
});

async function json(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

export default function BannerAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank());
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await json(await fetch('/api/banners?all=1', { cache: 'no-store' })));
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);

  const openEditor = (item) => {
    setEditing(item || null);
    setForm(item ? { ...item } : blank());
    setMessage({ type: '', text: '' });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditing(null);
    setForm(blank());
  };

  const setLocalized = (field, locale, value) => {
    setForm((current) => ({ ...current, [field]: { ...current[field], [locale]: value } }));
  };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', 'kulino-pit/banners');
      const result = await json(await fetch('/api/upload', { method: 'POST', body }));
      setForm((current) => ({ ...current, imageUrl: result.url, imagePublicId: result.publicId }));
      setMessage({ type: 'success', text: 'Gambar banner berhasil diunggah.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await json(await fetch(editing ? `/api/banners/${editing.id}` : '/api/banners', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }));
      closeEditor();
      setMessage({ type: 'success', text: 'Banner tersimpan dan otomatis terintegrasi ke Landing Page serta Dashboard Customer.' });
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
      await json(await fetch(`/api/banners/${deleting.id}`, { method: 'DELETE' }));
      if (deleting.imagePublicId) {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: deleting.imagePublicId, resourceType: 'image' }),
        }).catch(() => {});
      }
      setDeleting(null);
      setMessage({ type: 'success', text: 'Banner berhasil dihapus.' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  if (deleting) return <AdminConfirmPage title="Hapus Banner?" description={`Banner “${deleting.title.id}” akan dihapus permanen dari Landing Page dan Dashboard Customer.`} onCancel={() => setDeleting(null)} onConfirm={remove} />;

  if (editorOpen) {
    return (
      <div className="space-y-6 pb-12">
        <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><button type="button" onClick={closeEditor} className="btn border px-3" aria-label="Kembali ke daftar banner"><ArrowLeft size={18} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Editor Program & Promo</p><h1 className="font-display text-3xl font-black">{editing ? 'Edit' : 'Tambah'} Banner</h1><p className="text-sm text-gray-500">Halaman editor penuh tanpa popup. Preview mengikuti kartu di website.</p></div></div>
          <button type="submit" form="banner-form" disabled={saving || uploading} className="btn btn-primary flex items-center justify-center gap-2 px-6"><Save size={17} />{saving ? 'Menyimpan…' : 'Simpan Banner'}</button>
        </header>
        {message.text && <Notice message={message} />}
        <form id="banner-form" onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="space-y-6 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jenis"><select className="clean-input" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}><option value="promo">Promo</option><option value="program">Program</option></select></Field>
              <Field label="Urutan Admin"><input type="number" className="clean-input" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} /></Field>
            </div>
            <BilingualFields label="Label Kecil" field="badge" form={form} setLocalized={setLocalized} placeholderId="PROMO KULINO PIT" placeholderEn="KULINO PIT PROMO" />
            <BilingualFields label="Judul" field="title" form={form} setLocalized={setLocalized} required placeholderId="Gowes seru bersama Kulino Pit." placeholderEn="Ride with Kulino Pit." />
            <BilingualFields label="Deskripsi" field="description" form={form} setLocalized={setLocalized} textarea placeholderId="Jelaskan program atau promo secara singkat." placeholderEn="Briefly describe the program or promotion." />
            <BilingualFields label="Teks Tombol" field="ctaLabel" form={form} setLocalized={setLocalized} placeholderId="Lihat Selengkapnya" placeholderEn="Learn More" />
            <Field label="Tautan Tombol"><input className="clean-input" value={form.ctaUrl} onChange={(event) => setForm({ ...form, ctaUrl: event.target.value })} placeholder="/unit-sepeda atau https://..." /></Field>
            <div className="border-t pt-6">
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-black"><ImagePlus size={19} className="text-blue-500" /> Visual Banner</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Warna Latar"><div className="flex gap-2"><input type="color" className="h-12 w-16 rounded-xl border bg-white p-1" value={form.backgroundColor} onChange={(event) => setForm({ ...form, backgroundColor: event.target.value })} /><input className="clean-input" value={form.backgroundColor} onChange={(event) => setForm({ ...form, backgroundColor: event.target.value })} /></div></Field>
                <Field label="Warna Teks"><div className="flex gap-2"><input type="color" className="h-12 w-16 rounded-xl border bg-white p-1" value={form.textColor} onChange={(event) => setForm({ ...form, textColor: event.target.value })} /><input className="clean-input" value={form.textColor} onChange={(event) => setForm({ ...form, textColor: event.target.value })} /></div></Field>
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4">
                <label className="btn btn-primary inline-flex cursor-pointer items-center gap-2 px-5"><Upload size={17} />{uploading ? 'Mengunggah…' : 'Upload Gambar'}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label>
                <p className="mt-2 text-xs text-gray-500">Gunakan PNG transparan atau gambar rasio lebar agar hasil terbaik.</p>
              </div>
              <Field label="URL Gambar"><input className="clean-input" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value, imagePublicId: '' })} placeholder="/images/banner.png atau URL Cloudinary" /></Field>
            </div>
          </section>
          <aside className="space-y-5 xl:sticky xl:top-6">
            <BannerPreview form={form} />
            <section className="rounded-3xl border bg-white p-5 shadow-sm"><Toggle value={form.published} onChange={() => setForm({ ...form, published: !form.published })} /></section>
          </aside>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Landing & Customer Dashboard</p><h1 className="font-display text-3xl font-black">Program & Promo</h1><p className="text-sm text-gray-500">Kelola banner bersama. Posisi kartu diacak setiap halaman dimuat ulang.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="btn border px-4" aria-label="Muat ulang"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={() => openEditor()} className="btn btn-primary flex items-center gap-2 px-5"><Plus size={17} /> Tambah Banner</button></div></header>
      {message.text && <Notice message={message} />}
      {!loading && items.length === 0 && <div className="rounded-3xl border border-dashed bg-white p-12 text-center text-sm text-gray-500">Belum ada banner. Tambahkan program atau promo pertama.</div>}
      <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border bg-white shadow-sm"><div className="relative h-52 p-6" style={{ backgroundColor: item.backgroundColor, color: item.textColor }}><div className="relative z-10 max-w-[68%]"><p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-75">{item.badge.id || item.kind}</p><h2 className="mt-3 font-display text-2xl font-black leading-tight">{item.title.id}</h2><p className="mt-2 line-clamp-2 text-xs font-semibold opacity-75">{item.description.id}</p></div>{item.imageUrl && <div className="absolute bottom-0 right-0 h-[80%] w-[45%]"><Image src={item.imageUrl} alt="" fill unoptimized className="object-contain object-right-bottom" /></div>}</div><div className="flex items-center justify-between gap-3 p-4"><div><p className="text-xs font-bold text-gray-700">Urutan {item.sortOrder}</p><p className={`text-[10px] font-bold ${item.published ? 'text-green-600' : 'text-gray-400'}`}>{item.published ? 'Tayang' : 'Draft'}</p></div><div className="flex gap-1"><button type="button" onClick={() => openEditor(item)} className="p-2 text-gray-500 hover:text-blue-600" aria-label={`Edit ${item.title.id}`}><Edit2 size={18} /></button><button type="button" onClick={() => setDeleting(item)} className="p-2 text-gray-500 hover:text-red-500" aria-label={`Hapus ${item.title.id}`}><Trash2 size={18} /></button></div></div></article>)}
      </div>
    </div>
  );
}

function BilingualFields({ label, field, form, setLocalized, textarea = false, required = false, placeholderId, placeholderEn }) {
  const Element = textarea ? 'textarea' : 'input';
  return <div><p className="mb-2 text-xs font-black text-gray-800">{label}</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Indonesia"><Element required={required} rows={textarea ? 4 : undefined} className="clean-input" value={form[field].id} onChange={(event) => setLocalized(field, 'id', event.target.value)} placeholder={placeholderId} /></Field><Field label="English"><Element rows={textarea ? 4 : undefined} className="clean-input" value={form[field].en} onChange={(event) => setLocalized(field, 'en', event.target.value)} placeholder={placeholderEn} /></Field></div></div>;
}

function BannerPreview({ form }) {
  return <section><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-gray-500">Preview Indonesia</p><article className="relative isolate min-h-[330px] overflow-hidden rounded-[30px] border p-7 shadow-lg" style={{ backgroundColor: form.backgroundColor, color: form.textColor }}><div className="relative z-10 flex min-h-[274px] max-w-[70%] flex-col justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-75">{form.badge.id || (form.kind === 'program' ? 'PROGRAM' : 'PROMO')}</p><h2 className="mt-3 font-display text-3xl font-black leading-tight">{form.title.id || 'Judul banner'}</h2><p className="mt-3 text-xs font-semibold leading-relaxed opacity-80">{form.description.id || 'Deskripsi program atau promo.'}</p></div>{form.ctaLabel.id && <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-900">{form.ctaLabel.id}<ArrowRight size={13} /></span>}</div>{form.imageUrl && <div className="absolute bottom-0 right-0 h-[70%] w-[52%]"><Image src={form.imageUrl} alt="" fill unoptimized className="object-contain object-right-bottom drop-shadow-xl" /></div>}</article></section>;
}

function Toggle({ value, onChange }) { return <button type="button" onClick={onChange} className={`flex w-full items-center justify-between rounded-2xl border p-4 font-bold ${value ? 'border-green-200 bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}><span>{value ? 'Tayang di Website' : 'Draft / Disembunyikan'}</span>{value ? <Eye size={18} /> : <EyeOff size={18} />}</button>; }
function Notice({ message }) { return <div className={`rounded-2xl border p-4 text-sm font-bold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">{label}</span>{children}</label>; }
