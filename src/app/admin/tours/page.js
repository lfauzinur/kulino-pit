'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Database, Edit2, Eye, EyeOff, ImagePlus, Map, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

const emptyTour = {
  name: '', slug: '', price: '', categoryId: '', duration: '', distance: '',
  difficultyId: 'Mudah', difficultyEn: 'Easy', descriptionId: '', descriptionEn: '',
  image: '/images/hero-banner.png', imagePublicId: '', includesIdText: '', includesEnText: '',
  meetingPoint: 'Kulino House, Banyuwangi', published: true,
};

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request gagal (HTTP ${response.status})`);
  return data;
}

const toForm = (tour) => ({
  name: tour.name?.id || tour.name || '', slug: tour.slug || '', price: tour.price,
  categoryId: tour.categoryId, duration: tour.duration || '', distance: tour.distance || '',
  difficultyId: tour.difficulty?.id || 'Mudah', difficultyEn: tour.difficulty?.en || 'Easy',
  descriptionId: tour.description?.id || '', descriptionEn: tour.description?.en || '',
  image: tour.image || '/images/hero-banner.png', imagePublicId: tour.imagePublicId || '',
  includesIdText: (tour.includes?.id || []).join('\n'), includesEnText: (tour.includes?.en || []).join('\n'),
  meetingPoint: tour.meetingPoint || 'Kulino House, Banyuwangi', published: tour.published !== false,
});

export default function AdminTours() {
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState(emptyTour);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await readResponse(await fetch('/api/admin/tours', { cache: 'no-store' }));
      setCategories(data.categories || []);
      setTours(data.tours || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { Promise.resolve().then(loadData); }, [loadData]);

  const notify = (type, text) => setMessage({ type, text });

  const addCategory = async (event) => {
    event.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      const created = await readResponse(await fetch('/api/admin/tours', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name: newCatName.trim() }),
      }));
      setCategories((items) => [...items, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName(''); notify('success', `Kategori “${created.name}” ditambahkan.`);
    } catch (error) { notify('error', error.message); } finally { setSaving(false); }
  };

  const removeItem = async (type, id) => {
    if (!confirm(`Hapus ${type === 'category' ? 'kategori' : 'paket tour'} ini?`)) return;
    setBusyId(`${type}-${id}`);
    try {
      await readResponse(await fetch(`/api/admin/tours/${id}?type=${type}`, { method: 'DELETE' }));
      if (type === 'category') setCategories((items) => items.filter((item) => item.id !== id));
      else setTours((items) => items.filter((item) => item.id !== id));
      notify('success', 'Data berhasil dihapus dari database.');
    } catch (error) { notify('error', error.message); } finally { setBusyId(''); }
  };

  const openAdd = () => {
    setEditingTour(null);
    setTourForm({ ...emptyTour, categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };
  const openEdit = (tour) => { setEditingTour(tour); setTourForm(toForm(tour)); setModalOpen(true); };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData(); formData.append('file', file); formData.append('folder', 'kulino-pit/tours');
      const uploaded = await readResponse(await fetch('/api/upload', { method: 'POST', body: formData }));
      setTourForm((form) => ({ ...form, image: uploaded.url, imagePublicId: uploaded.publicId }));
    } catch (error) { notify('error', error.message); } finally { setUploading(false); }
  };

  const saveTour = async (event) => {
    event.preventDefault(); setSaving(true);
    const payload = {
      type: 'tour', ...tourForm, price: Number(tourForm.price), categoryId: Number(tourForm.categoryId),
      includesId: tourForm.includesIdText.split('\n').map((v) => v.trim()).filter(Boolean),
      includesEn: tourForm.includesEnText.split('\n').map((v) => v.trim()).filter(Boolean),
    };
    try {
      const saved = await readResponse(await fetch(editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours', {
        method: editingTour ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      }));
      setTours((items) => editingTour ? items.map((item) => item.id === saved.id ? saved : item) : [saved, ...items]);
      setModalOpen(false); notify('success', `Paket “${saved.name.id}” berhasil disimpan dan tersambung ke halaman publik.`);
    } catch (error) { notify('error', error.message); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div><h1 className="font-display text-2xl font-black text-gray-900 sm:text-3xl">Tours & Trips CRUD</h1><p className="mt-1 flex items-center gap-2 text-sm text-gray-500"><Database size={14} className="text-green-500" /> Perubahan langsung tampil pada landing, daftar, dan detail tour.</p></div>
        <div className="flex gap-2"><button type="button" onClick={loadData} className="btn border border-gray-200 bg-white px-4"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={openAdd} disabled={!categories.length} className="btn btn-primary flex flex-1 items-center justify-center gap-2 px-5 sm:flex-none"><Plus size={17} /> Tambah Tour</button></div>
      </header>

      {message.text && <div className={`rounded-2xl border p-4 text-sm font-semibold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <section className="clean-card h-fit border border-gray-100 p-5">
          <h2 className="font-display mb-4 text-lg font-bold">Kategori Tour</h2>
          <form onSubmit={addCategory} className="mb-5 flex gap-2"><input className="clean-input min-w-0 flex-1" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Nama kategori" /><button disabled={saving || !newCatName.trim()} className="btn btn-primary px-4" aria-label="Tambah kategori"><Plus size={19} /></button></form>
          <div className="space-y-2">{categories.map((category) => <div key={category.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-sm font-bold text-gray-700">{category.name}</span><button type="button" disabled={busyId === `category-${category.id}`} onClick={() => removeItem('category', category.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button></div>)}</div>
        </section>

        <section className="clean-card border border-gray-100 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Paket Tour ({tours.length})</h2><Map className="text-[var(--color-primary)]" /></div>
          {loading ? <div className="py-14 text-center text-gray-400"><RefreshCw className="mx-auto mb-2 animate-spin" />Memuat…</div> : <div className="grid gap-4 lg:grid-cols-2">{tours.map((tour) => <article key={tour.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="relative h-44 bg-gray-100"><Image src={tour.image} alt={tour.name.id} fill className="object-cover" unoptimized /><span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold ${tour.published ? 'bg-green-100 text-green-700' : 'bg-gray-800 text-white'}`}>{tour.published ? 'Tayang' : 'Draft'}</span></div>
            <div className="p-4"><div className="mb-2 flex flex-wrap gap-2 text-[10px] font-bold text-gray-500"><span className="rounded bg-blue-50 px-2 py-1 text-blue-600">{tour.category}</span><span>{tour.duration}</span><span>{tour.distance}</span></div><h3 className="font-display text-lg font-black text-gray-900">{tour.name.id}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{tour.description.id || 'Deskripsi belum diisi.'}</p><div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3"><strong className="text-sm text-[var(--color-primary)]">{formatCurrency(tour.price)}</strong><div className="flex gap-1"><button type="button" onClick={() => openEdit(tour)} className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"><Edit2 size={16} /></button><button type="button" onClick={() => removeItem('tour', tour.id)} className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button></div></div></div>
          </article>)}</div>}
        </section>
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={() => setModalOpen(false)}>
        <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-7" onClick={(e) => e.stopPropagation()}>
          <div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-2xl font-black">{editingTour ? 'Edit Paket Tour' : 'Tambah Paket Tour'}</h2><p className="text-xs text-gray-500">Semua field ini digunakan halaman publik.</p></div><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl bg-gray-100 p-2"><X /></button></div>
          <form onSubmit={saveTour} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Nama Tour"><input required className="clean-input" value={tourForm.name} onChange={(e) => setTourForm({ ...tourForm, name: e.target.value })} /></Field><Field label="Slug URL"><input className="clean-input" value={tourForm.slug} onChange={(e) => setTourForm({ ...tourForm, slug: e.target.value })} placeholder="otomatis-dari-nama" /></Field><Field label="Kategori"><select required className="clean-input" value={tourForm.categoryId} onChange={(e) => setTourForm({ ...tourForm, categoryId: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Harga per orang"><input required min="0" type="number" className="clean-input" value={tourForm.price} onChange={(e) => setTourForm({ ...tourForm, price: e.target.value })} /></Field><Field label="Durasi"><input required className="clean-input" value={tourForm.duration} onChange={(e) => setTourForm({ ...tourForm, duration: e.target.value })} placeholder="4 jam" /></Field><Field label="Jarak"><input className="clean-input" value={tourForm.distance} onChange={(e) => setTourForm({ ...tourForm, distance: e.target.value })} placeholder="35 km" /></Field><Field label="Kesulitan (ID)"><input className="clean-input" value={tourForm.difficultyId} onChange={(e) => setTourForm({ ...tourForm, difficultyId: e.target.value })} /></Field><Field label="Difficulty (EN)"><input className="clean-input" value={tourForm.difficultyEn} onChange={(e) => setTourForm({ ...tourForm, difficultyEn: e.target.value })} /></Field></div>
            <Field label="Deskripsi Indonesia"><textarea required rows="3" className="clean-input resize-none" value={tourForm.descriptionId} onChange={(e) => setTourForm({ ...tourForm, descriptionId: e.target.value })} /></Field><Field label="Description English"><textarea rows="3" className="clean-input resize-none" value={tourForm.descriptionEn} onChange={(e) => setTourForm({ ...tourForm, descriptionEn: e.target.value })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Fasilitas ID (satu per baris)"><textarea rows="5" className="clean-input resize-none" value={tourForm.includesIdText} onChange={(e) => setTourForm({ ...tourForm, includesIdText: e.target.value })} /></Field><Field label="Facilities EN (one per line)"><textarea rows="5" className="clean-input resize-none" value={tourForm.includesEnText} onChange={(e) => setTourForm({ ...tourForm, includesEnText: e.target.value })} /></Field></div>
            <Field label="Titik Kumpul"><input className="clean-input" value={tourForm.meetingPoint} onChange={(e) => setTourForm({ ...tourForm, meetingPoint: e.target.value })} /></Field>
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><div className="relative h-32 overflow-hidden rounded-xl bg-white"><Image src={tourForm.image} alt="Preview tour" fill className="object-cover" unoptimized /></div><div><p className="mb-2 text-xs font-bold text-gray-600">Gambar Cover</p><label className="btn btn-primary inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-xs"><ImagePlus size={15} />{uploading ? 'Mengunggah…' : 'Upload Gambar'}<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} /></label><input className="clean-input mt-2 text-xs" value={tourForm.image} onChange={(e) => setTourForm({ ...tourForm, image: e.target.value, imagePublicId: '' })} placeholder="atau URL gambar" /></div></div></div>
            <button type="button" onClick={() => setTourForm({ ...tourForm, published: !tourForm.published })} className={`flex w-full items-center justify-between rounded-2xl border p-4 ${tourForm.published ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}><span className="font-bold">{tourForm.published ? 'Tayang di website' : 'Simpan sebagai draft'}</span>{tourForm.published ? <Eye size={18} /> : <EyeOff size={18} />}</button>
            <div className="flex gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn flex-1 border border-gray-200">Batal</button><button disabled={saving || uploading} className="btn btn-primary flex-1">{saving ? 'Menyimpan…' : 'Simpan Tour'}</button></div>
          </form>
        </div>
      </div>}
    </div>
  );
}

function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</span>{children}</label>; }
