'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Map, RefreshCw, Database } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

const emptyTour = { name: '', price: '', categoryId: '', duration: '' };

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request gagal (HTTP ${response.status})`);
  return data;
}

export default function AdminTours() {
  const [categories, setCategories] = useState([]);
  const [tours, setTours] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState(emptyTour);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/tours', { cache: 'no-store' });
      const data = await readResponse(response);
      setCategories(data.categories);
      setTours(data.tours);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadData());
  }, [loadData]);

  const handleAddCategory = async (event) => {
    event.preventDefault();
    const name = newCatName.trim();
    if (!name) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/admin/tours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name }),
      });
      const created = await readResponse(response);
      setCategories((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCatName('');
      setSuccess(`Kategori “${created.name}” berhasil ditambahkan.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Yakin ingin menghapus ${type === 'category' ? 'kategori' : 'paket tour'} ini?`)) return;
    setBusyId(`${type}-${id}`);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/admin/tours/${id}?type=${type}`, { method: 'DELETE' });
      await readResponse(response);
      if (type === 'category') setCategories((current) => current.filter((item) => item.id !== id));
      else setTours((current) => current.filter((item) => item.id !== id));
      setSuccess('Data berhasil dihapus dari database.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  };

  const openAddTour = () => {
    setEditingTour(null);
    setTourForm({ ...emptyTour, categoryId: categories[0]?.id || '' });
  };

  const openEditTour = (tour) => {
    setEditingTour(tour);
    setTourForm({ name: tour.name, price: tour.price, categoryId: tour.categoryId, duration: tour.duration });
  };

  const closeTourModal = () => {
    setEditingTour(null);
    setTourForm(emptyTour);
  };

  const handleSaveTour = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(editingTour ? `/api/admin/tours/${editingTour.id}` : '/api/admin/tours', {
        method: editingTour ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tour', ...tourForm, price: Number(tourForm.price), categoryId: Number(tourForm.categoryId) }),
      });
      const saved = await readResponse(response);
      setTours((current) => editingTour
        ? current.map((tour) => tour.id === saved.id ? saved : tour)
        : [saved, ...current]);
      closeTourModal();
      setSuccess(`Paket “${saved.name}” berhasil disimpan.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const modalOpen = editingTour !== null || tourForm.categoryId !== '';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <h1 className="font-display text-2xl font-black text-gray-900 sm:text-3xl">Tours & Trips Management</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500"><Database size={13} className="text-green-500" /> Kategori dan paket tersimpan di database.</p>
        </div>
        <button type="button" onClick={loadData} disabled={loading} className="btn flex w-full items-center justify-center gap-2 border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-600 sm:w-auto">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </header>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-1">
          <div className="clean-card border border-gray-100 p-5 sm:p-6">
            <h2 className="font-display mb-4 text-lg font-bold text-gray-900">Kategori Tour</h2>
            <form onSubmit={handleAddCategory} className="mb-6 flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
              <input type="text" required placeholder="Nama kategori (e.g., VIP Tour)" className="clean-input min-w-0 flex-1" value={newCatName} onChange={(event) => setNewCatName(event.target.value)} />
              <button type="submit" disabled={saving || !newCatName.trim()} className="btn btn-primary flex min-h-12 items-center justify-center px-5 shadow-sm disabled:opacity-50" aria-label="Tambah kategori tour">
                {saving ? <RefreshCw size={20} className="animate-spin" /> : <Plus size={20} />}
                <span className="ml-2 sm:hidden lg:inline xl:hidden">Tambah Kategori</span>
              </button>
            </form>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <span className="min-w-0 break-words font-semibold text-gray-700">{category.name}</span>
                  <button type="button" disabled={busyId === `category-${category.id}`} onClick={() => handleDelete('category', category.id)} className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50" aria-label={`Hapus kategori ${category.name}`}><Trash2 size={16} /></button>
                </li>
              ))}
              {!loading && !categories.length && <li className="py-6 text-center text-sm text-gray-400">Belum ada kategori.</li>}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="clean-card border border-gray-100 p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-bold text-gray-900">Daftar Paket Tour</h2>
              <button type="button" onClick={openAddTour} disabled={!categories.length} className="btn btn-primary flex w-full items-center justify-center gap-2 px-4 py-2 text-sm disabled:opacity-50 sm:w-auto"><Plus size={16} /> Tambah Paket</button>
            </div>
            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400"><RefreshCw size={28} className="mx-auto mb-3 animate-spin" />Memuat data…</div>
            ) : tours.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center"><Map size={48} className="mx-auto mb-4 text-gray-300" /><p className="font-medium text-gray-500">Belum ada paket tour.</p></div>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2"><span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">{tour.category}</span><span className="text-xs text-gray-500">⏱️ {tour.duration}</span></div>
                      <h3 className="break-words font-bold text-gray-900">{tour.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-green-600">{formatCurrency(tour.price)}</p>
                    </div>
                    <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                      <button type="button" onClick={() => openEditTour(tour)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-[var(--color-primary)]" aria-label={`Edit ${tour.name}`}><Edit2 size={16} /></button>
                      <button type="button" disabled={busyId === `tour-${tour.id}`} onClick={() => handleDelete('tour', tour.id)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50" aria-label={`Hapus ${tour.name}`}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={closeTourModal}>
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-display mb-4 text-xl font-black text-gray-900">{editingTour ? 'Edit Paket Tour' : 'Tambah Paket Tour Baru'}</h3>
            <form onSubmit={handleSaveTour} className="space-y-4">
              <div><label className="mb-1 block text-xs font-bold text-gray-600">Nama Paket</label><input type="text" required className="clean-input" value={tourForm.name} onChange={(event) => setTourForm({ ...tourForm, name: event.target.value })} /></div>
              <div><label className="mb-1 block text-xs font-bold text-gray-600">Kategori</label><select required className="clean-input" value={tourForm.categoryId} onChange={(event) => setTourForm({ ...tourForm, categoryId: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="mb-1 block text-xs font-bold text-gray-600">Harga (Rp)</label><input type="number" min="0" required className="clean-input" value={tourForm.price} onChange={(event) => setTourForm({ ...tourForm, price: event.target.value })} /></div>
                <div><label className="mb-1 block text-xs font-bold text-gray-600">Durasi</label><input type="text" required className="clean-input" value={tourForm.duration} onChange={(event) => setTourForm({ ...tourForm, duration: event.target.value })} placeholder="e.g. 6 Hours" /></div>
              </div>
              <div className="flex gap-2 pt-4"><button type="button" onClick={closeTourModal} className="btn flex-1 border border-gray-200 text-gray-600">Batal</button><button type="submit" disabled={saving} className="btn btn-primary flex-1 disabled:opacity-50">{saving ? 'Menyimpan…' : 'Simpan Paket'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
