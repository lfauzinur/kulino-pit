'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Navigation2, Plus, Trash2, Edit3, Save, X, MapPin, 
  Clock, Mountain, ChevronRight, ToggleLeft, ToggleRight, Bike
} from 'lucide-react';

const DIFFICULTY_OPTIONS = ['Pemula', 'Menengah', 'Mahir'];
const COLOR_OPTIONS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9', '#64748B'];

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [editingRoute, setEditingRoute] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load routes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('kulinoPitRoutes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setRoutes(parsed);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Save routes to localStorage
  const saveRoutes = (newRoutes) => {
    setRoutes(newRoutes);
    localStorage.setItem('kulinoPitRoutes', JSON.stringify(newRoutes));
  };

  const deleteRoute = (id) => {
    if (confirm('Hapus rute ini?')) {
      saveRoutes(routes.filter(r => r.id !== id));
    }
  };

  const toggleActive = (id) => {
    saveRoutes(routes.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  const emptyRoute = () => ({
    id: `route-${Date.now()}`,
    name: '',
    description: '',
    color: '#3B82F6',
    difficulty: 'Pemula',
    distance_km: '',
    duration_min: '',
    elevation_m: '',
    active: true,
    checkpoints: [
      { id: `cp-${Date.now()}-1`, name: '', description: '', lat: '', lng: '' },
    ],
  });

  const startCreate = () => {
    setEditingRoute(emptyRoute());
    setIsCreating(true);
  };

  const startEdit = (route) => {
    setEditingRoute({ ...route, checkpoints: route.checkpoints?.map(c => ({ ...c })) || [] });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingRoute(null);
    setIsCreating(false);
  };

  const saveEdit = () => {
    if (!editingRoute.name.trim()) {
      alert('Nama rute wajib diisi!');
      return;
    }
    
    const cleaned = {
      ...editingRoute,
      distance_km: parseFloat(editingRoute.distance_km) || 0,
      duration_min: parseInt(editingRoute.duration_min) || 0,
      elevation_m: parseInt(editingRoute.elevation_m) || 0,
      checkpoints: editingRoute.checkpoints
        .filter(cp => cp.name.trim())
        .map(cp => ({
          ...cp,
          lat: parseFloat(cp.lat) || 0,
          lng: parseFloat(cp.lng) || 0,
        })),
    };

    if (isCreating) {
      saveRoutes([...routes, cleaned]);
    } else {
      saveRoutes(routes.map(r => r.id === cleaned.id ? cleaned : r));
    }
    setEditingRoute(null);
    setIsCreating(false);
  };

  const addCheckpoint = () => {
    setEditingRoute({
      ...editingRoute,
      checkpoints: [
        ...editingRoute.checkpoints,
        { id: `cp-${Date.now()}`, name: '', description: '', lat: '', lng: '' },
      ],
    });
  };

  const removeCheckpoint = (idx) => {
    setEditingRoute({
      ...editingRoute,
      checkpoints: editingRoute.checkpoints.filter((_, i) => i !== idx),
    });
  };

  const updateCheckpoint = (idx, field, value) => {
    const updated = [...editingRoute.checkpoints];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditingRoute({ ...editingRoute, checkpoints: updated });
  };

  // EDITOR VIEW
  if (editingRoute) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-black text-gray-900">
              {isCreating ? 'Buat Rute Baru' : 'Edit Rute'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Rute akan tersedia di Dashboard Member → Rute Gowes.
            </p>
          </div>
          <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Navigation2 size={16} className="text-[var(--color-primary)]" /> Informasi Rute
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama Rute *</label>
                <input
                  type="text"
                  value={editingRoute.name}
                  onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                  placeholder="Rute Sunrise Pantai Boom"
                  className="clean-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tingkat Kesulitan</label>
                <select
                  value={editingRoute.difficulty}
                  onChange={(e) => setEditingRoute({ ...editingRoute, difficulty: e.target.value })}
                  className="clean-input text-sm"
                >
                  {DIFFICULTY_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Rute</label>
              <textarea
                value={editingRoute.description}
                onChange={(e) => setEditingRoute({ ...editingRoute, description: e.target.value })}
                placeholder="Deskripsi singkat tentang rute ini..."
                rows={3}
                className="clean-input text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Jarak (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingRoute.distance_km}
                  onChange={(e) => setEditingRoute({ ...editingRoute, distance_km: e.target.value })}
                  placeholder="5.2"
                  className="clean-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Durasi (menit)</label>
                <input
                  type="number"
                  value={editingRoute.duration_min}
                  onChange={(e) => setEditingRoute({ ...editingRoute, duration_min: e.target.value })}
                  placeholder="30"
                  className="clean-input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Elevasi (m)</label>
                <input
                  type="number"
                  value={editingRoute.elevation_m}
                  onChange={(e) => setEditingRoute({ ...editingRoute, elevation_m: e.target.value })}
                  placeholder="50"
                  className="clean-input text-sm"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Warna Rute</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setEditingRoute({ ...editingRoute, color: c })}
                    className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                      editingRoute.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Checkpoints */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-[var(--color-primary)]" /> Checkpoint ({editingRoute.checkpoints.length})
              </h3>
              <button
                onClick={addCheckpoint}
                className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Tambah
              </button>
            </div>

            <div className="space-y-3">
              {editingRoute.checkpoints.map((cp, idx) => (
                <div key={cp.id || idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Checkpoint #{idx + 1}</span>
                    {editingRoute.checkpoints.length > 1 && (
                      <button onClick={() => removeCheckpoint(idx)} className="text-red-400 hover:text-red-600 cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cp.name}
                      onChange={(e) => updateCheckpoint(idx, 'name', e.target.value)}
                      placeholder="Nama checkpoint"
                      className="clean-input text-xs"
                    />
                    <input
                      type="text"
                      value={cp.description}
                      onChange={(e) => updateCheckpoint(idx, 'description', e.target.value)}
                      placeholder="Deskripsi singkat"
                      className="clean-input text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <input
                      type="number"
                      step="0.0001"
                      value={cp.lat}
                      onChange={(e) => updateCheckpoint(idx, 'lat', e.target.value)}
                      placeholder="Latitude (-8.2192)"
                      className="clean-input text-xs font-mono"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={cp.lng}
                      onChange={(e) => updateCheckpoint(idx, 'lng', e.target.value)}
                      placeholder="Longitude (114.3692)"
                      className="clean-input text-xs font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex gap-3">
            <button onClick={cancelEdit} className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer">
              Batal
            </button>
            <button onClick={saveEdit} className="flex-1 py-3 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md">
              <Save size={16} /> {isCreating ? 'Simpan Rute Baru' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ROUTE LIST VIEW
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-black text-gray-900">Manajemen Rute Gowes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Buat dan kelola rute bersepeda yang dapat diikuti oleh member.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="btn btn-primary px-4 py-2.5 text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus size={16} /> Buat Rute
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Navigation2 size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="font-display font-bold text-lg text-gray-900 mb-2">Belum Ada Rute</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Buat rute gowes pertama untuk member. Rute yang dibuat akan tampil di Dashboard Member → Tab Rute Gowes.
          </p>
          <button
            onClick={startCreate}
            className="btn btn-primary px-6 py-2.5 text-sm font-bold cursor-pointer shadow-md"
          >
            Buat Rute Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${route.color || '#3B82F6'}15` }}
                >
                  <Navigation2 size={22} style={{ color: route.color || '#3B82F6' }} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{route.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      route.difficulty === 'Mahir' ? 'bg-amber-50 text-amber-700' :
                      route.difficulty === 'Menengah' ? 'bg-blue-50 text-blue-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {route.difficulty}
                    </span>
                    <span>{route.distance_km || '?'} km</span>
                    <span>•</span>
                    <span>{route.duration_min || '?'} mnt</span>
                    <span>•</span>
                    <span>{route.checkpoints?.length || 0} checkpoints</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Active Toggle */}
                <button
                  onClick={() => toggleActive(route.id)}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    route.active !== false ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                  }`}
                  title={route.active !== false ? 'Aktif' : 'Nonaktif'}
                >
                  {route.active !== false ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                
                <button
                  onClick={() => startEdit(route)}
                  className="p-2 rounded-xl text-gray-500 hover:text-[var(--color-primary)] hover:bg-sky-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => deleteRoute(route.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
