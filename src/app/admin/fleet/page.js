'use client';
import { useState, useEffect, useRef } from 'react';
import { formatCurrency } from '@/lib/data';
import Image from 'next/image';
import { ArrowLeft, Bike, Search, Settings, CheckCircle, XCircle, Flame, Trash2, Upload, ImageIcon, RefreshCw, Database, ArrowUpFromLine, Boxes } from 'lucide-react';

async function readApiResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request gagal (HTTP ${response.status})`);
  }
  return data;
}

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [operationError, setOperationError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const imgInputRef = useRef(null);

  // ─── Ambil semua sepeda dari database ───
  const fetchBikes = async () => {
    setLoading(true);
    setOperationError('');
    try {
      const res = await fetch('/api/bikes', { cache: 'no-store' });
      const data = await readApiResponse(res);
      if (!Array.isArray(data)) {
        throw new Error('Format data sepeda dari server tidak valid.');
      }
      setFleet(data);
    } catch (err) {
      console.error('Gagal fetch bikes:', err);
      setOperationError(`Gagal memuat data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { Promise.resolve().then(() => fetchBikes()); }, []);

  // ─── Migrate dari localStorage ke database ───
  const handleMigrateFromLocalStorage = async () => {
    const saved = localStorage.getItem('customBikes');
    if (!saved) {
      setOperationError('Tidak ada data sepeda lama di browser ini.');
      return;
    }
    const bikes = JSON.parse(saved);
    if (!bikes.length) {
      setOperationError('Data sepeda lama kosong.');
      return;
    }
    
    setMigrating(true);
    try {
      const res = await fetch('/api/bikes/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bikes }),
      });
      await readApiResponse(res);
      setOperationError('');
      await fetchBikes();
      localStorage.removeItem('customBikes'); // bersihkan localStorage lama
    } catch (err) {
      setOperationError(`Migrasi gagal: ${err.message}`);
    } finally {
      setMigrating(false);
    }
  };

  // ─── Toggle availability (langsung ke DB) ───
  const toggleAvailability = async (bike) => {
    const manualAvailable = !bike.manualAvailable;
    const updated = { ...bike, manualAvailable, available: manualAvailable && bike.availableStock > 0 };
    setOperationError('');
    setFleet(prev => prev.map(b => b.id === bike.id ? updated : b));
    try {
      const res = await fetch(`/api/bikes/${bike.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: manualAvailable }),
      });
      const saved = await readApiResponse(res);
      setFleet(prev => prev.map(b => b.id === saved.id ? saved : b));
    } catch (err) {
      setFleet(prev => prev.map(b => b.id === bike.id ? bike : b));
      setOperationError(`Status tidak tersimpan: ${err.message}`);
    }
  };

  // ─── Toggle popular (langsung ke DB) ───
  const togglePopular = async (bike) => {
    const updated = { ...bike, popular: !bike.popular };
    setOperationError('');
    setFleet(prev => prev.map(b => b.id === bike.id ? updated : b));
    try {
      const res = await fetch(`/api/bikes/${bike.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ popular: updated.popular }),
      });
      const saved = await readApiResponse(res);
      setFleet(prev => prev.map(b => b.id === saved.id ? saved : b));
    } catch (err) {
      setFleet(prev => prev.map(b => b.id === bike.id ? bike : b));
      setOperationError(`Status popular tidak tersimpan: ${err.message}`);
    }
  };

  // ─── Hapus sepeda ───
  const handleDeleteBike = async (id) => {
    setDeleting(true);
    setOperationError('');
    try {
      const res = await fetch(`/api/bikes/${id}`, { method: 'DELETE' });
      await readApiResponse(res);
      setFleet(prev => prev.filter(b => b.id !== id));
      setDeletingId(null);
    } catch (err) {
      setOperationError(`Sepeda gagal dihapus: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Tambah sepeda baru (state awal) ───
  const handleAddNewBike = () => {
    setOperationError('');
    setEditingBike({
      id: null,
      name: '',
      category: 'city',
      pricePerDay: 100000,
      price2h: 25000,
      price3h: 30000,
      price4h: 40000,
      price6h: 50000,
      popular: false,
      available: true,
      manualAvailable: true,
      stockCount: 1,
      rentedCount: 0,
      availableStock: 1,
      image: '',
      imagePublicId: null,
      frameSize: ['M'],
      description: { id: '', en: '' },
      specs: { weight: '', groupset: '', brake: '', wheel: '' }
    });
  };

  // ─── Upload foto ke Cloudinary ───
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousImage = editingBike.image;
    const previousImagePublicId = editingBike.imagePublicId;
    setOperationError('');

    // Preview lokal dulu
    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditingBike(prev => ({ ...prev, image: ev.target.result }));
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'kulino-pit/bikes');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await readApiResponse(res);
      if (!data.url) {
        throw new Error('Server tidak mengembalikan URL gambar.');
      }
      setEditingBike(prev => ({ ...prev, image: data.url, imagePublicId: data.publicId }));
    } catch (err) {
      console.warn('Cloudinary upload failed:', err);
      setEditingBike(prev => ({
        ...prev,
        image: previousImage,
        imagePublicId: previousImagePublicId,
      }));
      setOperationError(`Gambar gagal diunggah: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // ─── Simpan (create/update) ke Database ───
  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setOperationError('');
    try {
      const isNew = !editingBike.id;
      const url = isNew ? '/api/bikes' : `/api/bikes/${editingBike.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBike),
      });

      const saved = await readApiResponse(res);
      if (isNew) {
        setFleet(prev => [saved, ...prev]);
      } else {
        setFleet(prev => prev.map(b => b.id === saved.id ? saved : b));
      }
      setEditingBike(null);
    } catch (err) {
      console.error('Save failed:', err);
      setOperationError(`Perubahan gagal disimpan: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filteredFleet = fleet.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterAvail === 'all' ||
      (filterAvail === 'available' && b.available) ||
      (filterAvail === 'rented' && !b.available);
    return matchSearch && matchFilter;
  });

  const totalStock = fleet.reduce((sum, bike) => sum + (bike.stockCount || 0), 0);
  const availCount = fleet.reduce((sum, bike) => sum + (bike.availableStock || 0), 0);
  const rentedCount = fleet.reduce((sum, bike) => sum + (bike.rentedCount || 0), 0);
  const popularCount = fleet.filter(b => b.popular).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {!deletingId && !editingBike && <>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Database size={13} className="text-green-500" />
            <span>Data tersimpan di database — otomatis sinkron ke semua device</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleMigrateFromLocalStorage}
            disabled={migrating}
            title="Pindahkan data sepeda dari browser lama ke database"
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100 flex items-center gap-2 transition-all"
          >
            <ArrowUpFromLine size={15} className={migrating ? 'animate-bounce' : ''} />
            {migrating ? 'Migrating...' : 'Migrate Data Lama'}
          </button>
          <button
            onClick={fetchBikes}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleAddNewBike}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] hover:shadow-lg transition-all"
          >
            + Add New Bike
          </button>
        </div>
      </header>

      {operationError && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {operationError}
        </div>
      )}

      {/* Stats + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'All Units', value: 'all', count: totalStock },
            { label: 'Available Units', value: 'available', count: availCount },
            { label: 'Rented Units', value: 'rented', count: rentedCount },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilterAvail(f.value)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all
                ${filterAvail === f.value
                  ? 'bg-[var(--color-primary)] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {f.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                ${filterAvail === f.value ? 'bg-white/20' : 'bg-gray-100'}`}>
                {f.count}
              </span>
            </button>
          ))}
          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full border border-amber-100">
            <Flame size={12} /> {popularCount} Popular
          </span>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bikes..."
            className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all w-48"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <RefreshCw size={36} className="mx-auto text-gray-300 mb-4 animate-spin" />
          <p className="text-gray-400 text-sm">Memuat data dari database...</p>
        </div>
      )}

      {/* Fleet Grid */}
      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFleet.map(bike => (
            <div key={bike.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="relative aspect-video bg-gray-50 border-b border-gray-100 p-4">
                {bike.image ? (
                  <Image
                    src={bike.image}
                    alt={bike.name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                    onError={(e) => { e.target.src = '/images/bikes/roadbike.png'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {bike.popular && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm bg-amber-50 text-amber-600 border border-amber-200">
                      <Flame size={10} /> Popular
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm
                    ${bike.available
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {bike.available ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {bike.available ? 'Available' : bike.availableStock === 0 ? 'Stok Habis' : 'Nonaktif'}
                  </span>
                </div>
                {/* Cloudinary badge */}
                {bike.image?.includes('cloudinary') && (
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle size={8} /> Cloud
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)]">{bike.category}</span>
                    <h3 className="font-display font-black text-sm text-gray-900 mt-0.5">{bike.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setOperationError(''); setEditingBike(bike); }} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit Bike">
                      <Settings size={15} />
                    </button>
                    <button onClick={() => { setOperationError(''); setDeletingId(bike.id); }} className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus Sepeda">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">2 Jam</p>
                    <p className="text-[10px] font-bold text-gray-900">{formatCurrency(bike.price2h || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">3 Jam</p>
                    <p className="text-[10px] font-bold text-gray-900">{formatCurrency(bike.price3h || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">4 Jam</p>
                    <p className="text-[10px] font-bold text-gray-900">{formatCurrency(bike.price4h || 0)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">6 Jam</p>
                    <p className="text-[10px] font-bold text-gray-900">{formatCurrency(bike.price6h || 0)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100 col-span-2">
                    <p className="text-[8px] font-bold text-blue-400 uppercase">Sehari</p>
                    <p className="text-[10px] font-bold text-blue-700">{formatCurrency(bike.pricePerDay)}</p>
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                  <div className="text-center"><p className="text-[8px] font-bold uppercase text-blue-400">Total Unit</p><p className="font-display text-lg font-black text-blue-900">{bike.stockCount}</p></div>
                  <div className="border-x border-blue-100 text-center"><p className="text-[8px] font-bold uppercase text-green-500">Tersedia</p><p className="font-display text-lg font-black text-green-700">{bike.availableStock}</p></div>
                  <div className="text-center"><p className="text-[8px] font-bold uppercase text-amber-500">Disewa</p><p className="font-display text-lg font-black text-amber-700">{bike.rentedCount}</p></div>
                </div>

                <div className="mt-auto pt-3 border-t border-dashed border-gray-200 flex justify-between items-center gap-2 flex-wrap">
                  <button
                    onClick={() => togglePopular(bike)}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1
                      ${bike.popular
                        ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                        : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500'}`}
                  >
                    <Flame size={12} /> {bike.popular ? 'Popular ✓' : 'Set Popular'}
                  </button>
                  <button
                    onClick={() => toggleAvailability(bike)}
                    className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all
                      ${bike.manualAvailable
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'}`}
                  >
                    {bike.manualAvailable ? 'Nonaktifkan Unit' : 'Aktifkan Unit'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredFleet.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Bike size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No bikes found.</p>
        </div>
      )}

      </>}

      {/* Delete confirmation page */}
      {deletingId && (
        <div className="space-y-6 animate-fade-in">
          <header className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <button type="button" onClick={() => setDeletingId(null)} className="btn border px-3" aria-label="Kembali ke daftar sepeda"><ArrowLeft size={18} /></button>
            <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500">Konfirmasi penghapusan</p><h1 className="font-display text-3xl font-black text-gray-900">Hapus Sepeda</h1><p className="mt-1 text-sm text-gray-500">Periksa unit sebelum menghapusnya permanen dari database.</p></div>
          </header>
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display font-black text-lg text-gray-900 mb-2">Hapus Sepeda?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Sepeda <strong>{fleet.find(b => b.id === deletingId)?.name}</strong> akan dihapus permanen dari database.
            </p>
            {operationError && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-left text-xs font-semibold text-red-700">
                {operationError}
              </div>
            )}
            <div className="mx-auto flex max-w-xl gap-3">
              <button disabled={deleting} onClick={() => setDeletingId(null)} className="btn flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">Kembali</button>
              <button disabled={deleting} onClick={() => handleDeleteBike(deletingId)} className="btn flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-page bike editor */}
      {editingBike && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setEditingBike(null)} className="btn border px-3" aria-label="Kembali ke daftar sepeda"><ArrowLeft size={18} /></button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Editor Fleet</p>
                <h3 className="font-display font-black text-3xl text-gray-900">{editingBike.id ? 'Edit Bike' : 'Add New Bike'}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Database size={11} /> Tersimpan otomatis ke database
                </p>
              </div>
            </div>
            <button type="submit" form="fleet-editor-form" disabled={saving || uploading} className="btn btn-primary flex items-center justify-center gap-2 px-6"><Database size={15} />{saving ? 'Menyimpan…' : 'Simpan ke Database'}</button>
          </div>
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <form id="fleet-editor-form" onSubmit={handleEditSave} className="mx-auto max-w-5xl space-y-4">

              {operationError && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {operationError}
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Foto Sepeda</label>
                <div
                  onClick={() => !uploading && imgInputRef.current?.click()}
                  className={`relative w-full h-44 rounded-2xl border-2 border-dashed overflow-hidden transition-all group ${uploading ? 'border-blue-300 bg-blue-50/30 cursor-wait' : 'border-gray-200 bg-gray-50 cursor-pointer hover:border-[var(--color-primary)] hover:bg-blue-50/30'}`}
                >
                  {editingBike.image ? (
                    <>
                      <Image src={editingBike.image} alt="Preview" fill className="object-contain p-2" unoptimized />
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                          <div className="w-8 h-8 border-[3px] border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-bold text-[var(--color-primary)]">Mengupload ke Cloud...</span>
                        </div>
                      )}
                      {!uploading && editingBike.image?.includes('cloudinary') && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Tersimpan di Cloud
                        </div>
                      )}
                      {!uploading && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <Upload size={24} className="text-white" />
                          <span className="text-white text-xs font-bold">Ganti Foto</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-xs font-semibold">Klik untuk upload foto sepeda</span>
                      <span className="text-[10px]">JPG, PNG, WEBP · Otomatis tersimpan ke semua device</span>
                    </div>
                  )}
                </div>
                <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nama Sepeda</label>
                <input
                  type="text"
                  required
                  className="clean-input"
                  value={editingBike.name}
                  onChange={e => setEditingBike({ ...editingBike, name: e.target.value })}
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <label className="mb-1 flex items-center gap-2 text-xs font-bold text-blue-800"><Boxes size={15} /> Jumlah Stok / Unit</label>
                <input type="number" min="0" step="1" required className="clean-input !border-blue-200 bg-white" value={editingBike.stockCount ?? 1} onChange={(event) => setEditingBike({ ...editingBike, stockCount: Math.max(0, Number.parseInt(event.target.value, 10) || 0) })} />
                <p className="mt-2 text-[10px] leading-4 text-blue-600">Unit tersedia dihitung otomatis dari stok total dikurangi booking berstatus Active. Stok kembali setelah Admin mengonfirmasi pengembalian.</p>
              </div>

              {/* Pricing Tiers */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Harga Sewa</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'price2h', label: '2 Jam' },
                    { key: 'price3h', label: '3 Jam' },
                    { key: 'price4h', label: '4 Jam' },
                    { key: 'price6h', label: '6 Jam' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">{label}</label>
                      <input type="number" className="clean-input text-xs" value={editingBike[key] || 0}
                        onChange={e => setEditingBike({ ...editingBike, [key]: parseInt(e.target.value) || 0 })} />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-blue-500 uppercase mb-1">Sehari</label>
                    <input type="number" className="clean-input text-xs !border-blue-200 focus:!border-blue-400" value={editingBike.pricePerDay || 0}
                      onChange={e => setEditingBike({ ...editingBike, pricePerDay: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                  <select className="clean-input" value={editingBike.category}
                    onChange={e => setEditingBike({ ...editingBike, category: e.target.value })}>
                    <option value="roadbike">Roadbike</option>
                    <option value="mtb">MTB</option>
                    <option value="folding">Folding</option>
                    <option value="gravel">Gravel</option>
                    <option value="ebike">E-Bike</option>
                    <option value="city">City</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Frame Sizes</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['S', 'M', 'L', 'XL', 'One Size'].map(sz => (
                      <label key={sz} className="flex items-center gap-1 text-[10px] font-bold">
                        <input type="checkbox"
                          checked={editingBike.frameSize?.includes(sz)}
                          onChange={(e) => {
                            const newSizes = e.target.checked
                              ? [...(editingBike.frameSize || []), sz]
                              : (editingBike.frameSize || []).filter(s => s !== sz);
                            setEditingBike({ ...editingBike, frameSize: newSizes });
                          }}
                        />
                        {sz}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Popular toggle */}
              <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingBike.popular || false}
                    onChange={e => setEditingBike({ ...editingBike, popular: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300" />
                  <Flame size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">Tandai sebagai Popular</span>
                </label>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Deskripsi (ID)</label>
                  <textarea className="clean-input text-xs" rows="2" value={editingBike.description?.id || ''}
                    onChange={e => setEditingBike({ ...editingBike, description: { ...editingBike.description, id: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Description (EN)</label>
                  <textarea className="clean-input text-xs" rows="2" value={editingBike.description?.en || ''}
                    onChange={e => setEditingBike({ ...editingBike, description: { ...editingBike.description, en: e.target.value } })} />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'weight', label: 'Weight' },
                  { key: 'groupset', label: 'Groupset' },
                  { key: 'brake', label: 'Brake' },
                  { key: 'wheel', label: 'Wheel Size' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">{label}</label>
                    <input type="text" className="clean-input text-xs" value={editingBike.specs?.[key] || ''}
                      onChange={e => setEditingBike({ ...editingBike, specs: { ...editingBike.specs, [key]: e.target.value } })} />
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setEditingBike(null)} className="btn flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={saving || uploading} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><RefreshCw size={14} className="animate-spin" /> Menyimpan...</> : <><Database size={14} /> Simpan ke Database</>}
                </button>
              </div>
            </form>
            </div>
          </div>
      )}
    </div>
  );
}
