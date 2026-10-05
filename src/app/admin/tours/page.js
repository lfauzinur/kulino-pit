'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Map } from 'lucide-react';
import { formatCurrency } from '@/lib/data';

export default function AdminTours() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Group Tours' },
    { id: 2, name: 'Private Tours' }
  ]);
  const [tours, setTours] = useState([]);
  
  const [newCatName, setNewCatName] = useState('');

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

        {/* Tours Panel (Placeholder for future development) */}
        <div className="lg:col-span-2">
          <div className="clean-card p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg text-gray-900">Daftar Paket Tour</h2>
              <button className="btn btn-primary py-2 px-4 text-sm flex items-center gap-2">
                <Plus size={16} /> Tambah Paket
              </button>
            </div>

            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Map size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Belum ada paket tour yang ditambahkan.</p>
              <p className="text-sm text-gray-400 mt-1">Gunakan tombol "Tambah Paket" untuk membuat tour baru.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
