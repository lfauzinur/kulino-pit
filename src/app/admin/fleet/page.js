'use client';
import { useState, useEffect } from 'react';
import { bikes as initialBikes, formatCurrency, rentalDurations, getLowestPrice } from '@/lib/data';
import Image from 'next/image';
import { Bike, Search, Settings, CheckCircle, XCircle, Star, Flame } from 'lucide-react';

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState(initialBikes);
  const [customBikes, setCustomBikes] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('customBikes');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomBikes(parsed);
      const merged = initialBikes.map(b => parsed.find(p => p.id === b.id) || b);
      const newlyAdded = parsed.filter(p => !initialBikes.some(b => b.id === p.id));
      setFleet([...newlyAdded, ...merged]);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [editingBike, setEditingBike] = useState(null);

  const persistFleet = (newFleet) => {
    setFleet(newFleet);
    const newCustom = newFleet.map(b => b);
    setCustomBikes(newCustom);
    localStorage.setItem('customBikes', JSON.stringify(newCustom));
  };

  const toggleAvailability = (id) => {
    const newFleet = fleet.map(b => b.id === id ? { ...b, available: !b.available } : b);
    persistFleet(newFleet);
  };

  const togglePopular = (id) => {
    const newFleet = fleet.map(b => b.id === id ? { ...b, popular: !b.popular } : b);
    persistFleet(newFleet);
  };

  const handleAddNewBike = () => {
    setEditingBike({
      id: '',
      name: '',
      category: 'roadbike',
      pricePerDay: 100000,
      price2h: 25000,
      price3h: 30000,
      price4h: 40000,
      price6h: 50000,
      popular: false,
      available: true,
      image: '/images/bikes/roadbike.png',
      frameSize: ['M'],
      description: { id: 'Sepeda baru ditambahkan ke armada.', en: 'New bike added to the fleet.' },
      specs: { weight: '10kg', groupset: 'Shimano', brake: 'Disc Brake', wheel: '700c' }
    });
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    let newCustomBikes;
    
    if (editingBike.id) {
      setFleet(prev => prev.map(b => b.id === editingBike.id ? editingBike : b));
      newCustomBikes = customBikes.map(b => b.id === editingBike.id ? editingBike : b);
      if (!newCustomBikes.some(b => b.id === editingBike.id)) {
        newCustomBikes.push(editingBike);
      }
    } else {
      const newBike = { ...editingBike, id: 'bike-' + Date.now() };
      setFleet(prev => [newBike, ...prev]);
      newCustomBikes = [newBike, ...customBikes];
    }
    
    setCustomBikes(newCustomBikes);
    localStorage.setItem('customBikes', JSON.stringify(newCustomBikes));
    setEditingBike(null);
  };

  const filteredFleet = fleet.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterAvail === 'all' || (filterAvail === 'available' && b.available) || (filterAvail === 'rented' && !b.available);
    return matchSearch && matchFilter;
  });

  const availCount = fleet.filter(b => b.available).length;
  const rentedCount = fleet.filter(b => !b.available).length;
  const popularCount = fleet.filter(b => b.popular).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage bikes, pricing tiers, availability, and popularity.</p>
        </div>
        <button 
          onClick={handleAddNewBike}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] hover:shadow-lg transition-all"
        >
          + Add New Bike
        </button>
      </header>

      {/* Stats + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'All', value: 'all', count: fleet.length },
            { label: 'Available', value: 'available', count: availCount },
            { label: 'Rented', value: 'rented', count: rentedCount },
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

      {/* Fleet Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFleet.map(bike => (
          <div key={bike.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
            <div className="relative aspect-video bg-gray-50 border-b border-gray-100 p-4">
              <Image src={bike.image} alt={bike.name} fill className="object-contain p-2" />
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
                  {bike.available ? 'Available' : 'Rented'}
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)]">{bike.category}</span>
                  <h3 className="font-display font-black text-sm text-gray-900 mt-0.5">{bike.name}</h3>
                </div>
                <button onClick={() => setEditingBike(bike)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Edit Bike">
                  <Settings size={16} />
                </button>
              </div>
              
              {/* Multi-tier pricing display */}
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
              
              <div className="mt-auto pt-3 border-t border-dashed border-gray-200 flex justify-between items-center gap-2 flex-wrap">
                <button 
                  onClick={() => togglePopular(bike.id)} 
                  className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1
                    ${bike.popular 
                      ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                      : 'text-gray-400 hover:bg-gray-50 hover:text-amber-500'}`}
                >
                  <Flame size={12} /> {bike.popular ? 'Popular ✓' : 'Set Popular'}
                </button>
                <button 
                  onClick={() => toggleAvailability(bike.id)} 
                  className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all
                    ${bike.available 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-green-600 hover:bg-green-50'}`}
                >
                  {bike.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFleet.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <Bike size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No bikes found matching your criteria.</p>
        </div>
      )}

      {/* Edit / Add Bike Modal */}
      {editingBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-black text-xl text-gray-900 mb-4">{editingBike.id ? 'Edit Bike Details' : 'Add New Bike'}</h3>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Bike Name</label>
                <input 
                  type="text" 
                  required
                  className="clean-input"
                  value={editingBike.name}
                  onChange={e => setEditingBike({...editingBike, name: e.target.value})}
                />
              </div>

              {/* Multi-tier pricing */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">Harga Sewa (Pricing Tiers)</label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sewa 2 Jam</label>
                    <input 
                      type="number" 
                      required
                      className="clean-input text-xs"
                      value={editingBike.price2h || 0}
                      onChange={e => setEditingBike({...editingBike, price2h: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sewa 3 Jam</label>
                    <input 
                      type="number" 
                      required
                      className="clean-input text-xs"
                      value={editingBike.price3h || 0}
                      onChange={e => setEditingBike({...editingBike, price3h: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sewa 4 Jam</label>
                    <input 
                      type="number" 
                      required
                      className="clean-input text-xs"
                      value={editingBike.price4h || 0}
                      onChange={e => setEditingBike({...editingBike, price4h: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Sewa 6 Jam</label>
                    <input 
                      type="number" 
                      required
                      className="clean-input text-xs"
                      value={editingBike.price6h || 0}
                      onChange={e => setEditingBike({...editingBike, price6h: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-blue-500 uppercase mb-1">Sewa Sehari (Full Day)</label>
                    <input 
                      type="number" 
                      required
                      className="clean-input text-xs !border-blue-200 focus:!border-blue-400"
                      value={editingBike.pricePerDay}
                      onChange={e => setEditingBike({...editingBike, pricePerDay: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Category</label>
                  <select 
                    className="clean-input"
                    value={editingBike.category}
                    onChange={e => setEditingBike({...editingBike, category: e.target.value})}
                  >
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
                        <input 
                          type="checkbox" 
                          checked={editingBike.frameSize?.includes(sz)}
                          onChange={(e) => {
                            const newSizes = e.target.checked 
                              ? [...(editingBike.frameSize || []), sz]
                              : (editingBike.frameSize || []).filter(s => s !== sz);
                            setEditingBike({...editingBike, frameSize: newSizes});
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
                  <input 
                    type="checkbox" 
                    checked={editingBike.popular || false}
                    onChange={e => setEditingBike({...editingBike, popular: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Flame size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-700">Tandai sebagai Popular (muncul badge di etalase)</span>
                </label>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Deskripsi (ID)</label>
                  <textarea 
                    className="clean-input text-xs" rows="2"
                    value={editingBike.description?.id || ''}
                    onChange={e => setEditingBike({...editingBike, description: {...editingBike.description, id: e.target.value}})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Description (EN)</label>
                  <textarea 
                    className="clean-input text-xs" rows="2"
                    value={editingBike.description?.en || ''}
                    onChange={e => setEditingBike({...editingBike, description: {...editingBike.description, en: e.target.value}})}
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Weight</label>
                  <input type="text" className="clean-input text-xs" value={editingBike.specs?.weight || ''} onChange={e => setEditingBike({...editingBike, specs: {...editingBike.specs, weight: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Groupset</label>
                  <input type="text" className="clean-input text-xs" value={editingBike.specs?.groupset || ''} onChange={e => setEditingBike({...editingBike, specs: {...editingBike.specs, groupset: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Brake</label>
                  <input type="text" className="clean-input text-xs" value={editingBike.specs?.brake || ''} onChange={e => setEditingBike({...editingBike, specs: {...editingBike.specs, brake: e.target.value}})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-1">Wheel Size</label>
                  <input type="text" className="clean-input text-xs" value={editingBike.specs?.wheel || ''} onChange={e => setEditingBike({...editingBike, specs: {...editingBike.specs, wheel: e.target.value}})} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setEditingBike(null)} className="btn flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
