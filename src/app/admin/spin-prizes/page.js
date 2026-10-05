'use client';
import { useState, useEffect } from 'react';
import { RotateCcw, Gift, Plus, Trash2, Save, Palette } from 'lucide-react';

const DEFAULT_PRIZES = [
  { label: 'Diskon 10%', color: '#3B82F6', chance: 25 },
  { label: 'Gratis Helm', color: '#10B981', chance: 15 },
  { label: 'Voucher 50K', color: '#F59E0B', chance: 20 },
  { label: 'Coba Lagi', color: '#EF4444', chance: 25 },
  { label: 'Gratis 1 Jam', color: '#8B5CF6', chance: 10 },
  { label: 'Merchandise', color: '#EC4899', chance: 5 },
];

const COLOR_PRESETS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

export default function AdminSpinPrizesPage() {
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('spinPrizes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          setPrizes(parsed);
        }
      } catch (e) { /* use defaults */ }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('spinPrizes', JSON.stringify(prizes));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPrizes(DEFAULT_PRIZES);
    localStorage.setItem('spinPrizes', JSON.stringify(DEFAULT_PRIZES));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addPrize = () => {
    setPrizes([...prizes, { label: 'Hadiah Baru', color: COLOR_PRESETS[prizes.length % COLOR_PRESETS.length], chance: 10 }]);
  };

  const removePrize = (index) => {
    if (prizes.length <= 2) return; // minimum 2 slices
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index, field, value) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: field === 'chance' ? Number(value) : value };
    setPrizes(updated);
  };

  const totalChance = prizes.reduce((sum, p) => sum + p.chance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 flex items-center gap-3">
            <RotateCcw size={28} className="text-purple-600" /> Spin & Win Prizes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Atur daftar hadiah untuk permainan Spin Wheel member.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <RotateCcw size={14} /> Reset Default
          </button>
          <button 
            onClick={handleSave} 
            className={`btn px-6 py-2 text-sm font-semibold flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'btn-primary'}`}
          >
            <Save size={14} /> {saved ? 'Tersimpan ✓' : 'Simpan'}
          </button>
        </div>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="clean-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Gift size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Hadiah</p>
            <p className="font-display font-black text-xl text-gray-900">{prizes.length}</p>
          </div>
        </div>
        <div className="clean-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Palette size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Probabilitas</p>
            <p className={`font-display font-black text-xl ${totalChance === 100 ? 'text-green-600' : 'text-red-500'}`}>{totalChance}%</p>
          </div>
        </div>
        <div className="clean-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <RotateCcw size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Biaya Spin</p>
            <p className="font-display font-black text-xl text-gray-900">100 Poin</p>
          </div>
        </div>
      </div>

      {totalChance !== 100 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-semibold">
          ⚠️ Total probabilitas harus 100%. Saat ini: {totalChance}%. Sesuaikan nilai persentase di bawah.
        </div>
      )}

      {/* Prize List Editor */}
      <div className="clean-card overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-gray-900">Daftar Hadiah</h2>
          <button onClick={addPrize} className="btn btn-primary px-4 py-2 text-xs flex items-center gap-1">
            <Plus size={14} /> Tambah Hadiah
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50/50">
            <div className="col-span-1">Warna</div>
            <div className="col-span-5">Nama Hadiah</div>
            <div className="col-span-3">Probabilitas (%)</div>
            <div className="col-span-2">Preview</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {prizes.map((prize, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
              {/* Color Picker */}
              <div className="col-span-1">
                <input
                  type="color"
                  value={prize.color}
                  onChange={(e) => updatePrize(i, 'color', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-2 border-gray-200"
                />
              </div>

              {/* Label */}
              <div className="col-span-5">
                <input
                  type="text"
                  value={prize.label}
                  onChange={(e) => updatePrize(i, 'label', e.target.value)}
                  className="clean-input text-sm"
                  placeholder="Nama hadiah..."
                />
              </div>

              {/* Chance */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={prize.chance}
                    onChange={(e) => updatePrize(i, 'chance', e.target.value)}
                    className="clean-input text-sm w-20"
                  />
                  <span className="text-sm font-bold text-gray-400">%</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${prize.chance}%`, backgroundColor: prize.color }} />
                  </div>
                </div>
              </div>

              {/* Preview Badge */}
              <div className="col-span-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-bold" style={{ backgroundColor: prize.color }}>
                  <Gift size={10} /> {prize.label}
                </span>
              </div>

              {/* Delete */}
              <div className="col-span-1 text-right">
                <button
                  onClick={() => removePrize(i)}
                  disabled={prizes.length <= 2}
                  className={`p-2 rounded-lg transition-colors ${prizes.length <= 2 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div className="clean-card p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Preset Warna Cepat</p>
        <div className="flex gap-2 flex-wrap">
          {COLOR_PRESETS.map((c, i) => (
            <button 
              key={i}
              className="w-8 h-8 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              title={c}
              onClick={() => navigator.clipboard?.writeText(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
