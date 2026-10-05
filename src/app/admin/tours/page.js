'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Map } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

export default function AdminTours() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Group Tours' },
    { id: 2, name: 'Private Tours' }
  ]);
  const [tours, setTours] = useState([
    { id: 1, name: 'Banyuwangi City Tour', price: 150000, category: 'Group Tours', duration: '4 Hours' }
  ]);
  
  const [newCatName, setNewCatName] = useState('');
  const [showAddTour, setShowAddTour] = useState(false);
  const [newTour, setNewTour] = useState({ name: '', price: '', category: 'Group Tours', duration: '' });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCatName }]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id) => {
    if (confirm('Yakin ingin menghapus kategori ini?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleAddTour = (e) => {
    e.preventDefault();
    if (!newTour.name.trim()) return;
    setTours([...tours, { id: Date.now(), ...newTour }]);
    setNewTour({ name: '', price: '', category: 'Group Tours', duration: '' });
    setShowAddTour(false);
  };

  const handleDeleteTour = (id) => {
    if (confirm('Yakin ingin menghapus paket tour ini?')) {
      setTours(tours.filter(t => t.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Tours & Trips Management</h1>
          <p className="text-gray-500 mt-1">Kelola kategori dan paket Trip & Tour Kulino Pit.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Categories Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="clean-card p-6 border border-gray-100">
            <h2 className="font-display font-bold text-lg text-gray-900 mb-4">Kategori Tour</h2>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Nama kategori (e.g., VIP Tour)" 
                className="clean-input flex-1"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary px-4 shadow-sm">
                <Plus size={20} />
              </button>
            </form>

            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-semibold text-gray-700">{cat.name}</span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tours Panel */}
        <div className="lg:col-span-2">
          <div className="clean-card p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-gray-900">Daftar Paket Tour</h2>
              <button 
                onClick={() => setShowAddTour(true)}
                className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2"
              >
                <Plus size={16} /> Tambah Paket
              </button>
            </div>

            {tours.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Map size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Belum ada paket tour yang ditambahkan.</p>
                <p className="text-sm text-gray-400 mt-1">Gunakan tombol "Tambah Paket" untuk membuat tour baru.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tours.map(tour => (
                  <div key={tour.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600">{tour.category}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">⏱️ {tour.duration}</span>
                      </div>
                      <h3 className="font-bold text-gray-900">{tour.name}</h3>
                      <p className="text-sm font-semibold text-green-600 mt-1">{formatCurrency(tour.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteTour(tour.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Tour Modal */}
      {showAddTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-display font-black text-xl text-gray-900 mb-4">Tambah Paket Tour Baru</h3>
            <form onSubmit={handleAddTour} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Nama Paket</label>
                <input 
                  type="text" 
                  required
                  className="clean-input"
                  value={newTour.name}
                  onChange={e => setNewTour({...newTour, name: e.target.value})}
                  placeholder="e.g. Explore Ijen Crater"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kategori</label>
                <select 
                  className="clean-input"
                  value={newTour.category}
                  onChange={e => setNewTour({...newTour, category: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Harga (Rp)</label>
                  <input 
                    type="number" 
                    required
                    className="clean-input"
                    value={newTour.price}
                    onChange={e => setNewTour({...newTour, price: parseInt(e.target.value) || ''})}
                    placeholder="250000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Durasi</label>
                  <input 
                    type="text" 
                    required
                    className="clean-input"
                    value={newTour.duration}
                    onChange={e => setNewTour({...newTour, duration: e.target.value})}
                    placeholder="e.g. 6 Hours"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowAddTour(false)} className="btn flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50">Batal</button>
                <button type="submit" className="btn btn-primary flex-1">Simpan Paket</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
