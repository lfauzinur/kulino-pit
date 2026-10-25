'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { X, Bike, Flame, ArrowRight } from 'lucide-react';
import { formatCurrency, getLowestPrice } from '@/lib/data';

export default function InAppBikeCatalogModal({ isOpen, onClose, onSelectBike }) {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    Promise.resolve().then(() => { setLoading(true); setError(''); });
    fetch('/api/bikes', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gagal memuat armada.');
        setBikes(data.filter((bike) => bike.available));
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Bike size={20} className="text-[var(--color-primary)]" />
            <div>
              <h3 className="font-display font-black text-sm tracking-wide">
                Pilih Armada Sepeda Kulino Pit
              </h3>
              <p className="text-[10px] text-white/60">
                Klik unit untuk langsung memilih durasi sewa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bike List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 scrollbar-hide flex-1">
          {loading && <p className="py-12 text-center text-sm text-gray-500">Memuat armada dari database…</p>}
          {error && <p className="py-12 text-center text-sm font-semibold text-red-600">{error}</p>}
          {!loading && !error && bikes.length === 0 && <p className="py-12 text-center text-sm text-gray-500">Belum ada unit yang tersedia.</p>}
          {bikes.map((bike) => {
            const minPrice = getLowestPrice(bike);
            return (
              <button
                key={bike.id}
                onClick={() => {
                  onSelectBike(bike);
                  onClose();
                }}
                className="w-full bg-white hover:bg-sky-50/50 rounded-2xl p-3.5 border border-gray-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all flex items-center gap-3.5 text-left group cursor-pointer"
              >
                <div className="relative w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <Image
                    src={bike.image}
                    alt={bike.name}
                    fill
                    className="object-contain p-1 group-hover:scale-105 transition-transform"
                    sizes="80px"
                  />
                  {bike.popular && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-amber-400 text-stone-900 text-[8px] font-black flex items-center gap-0.5">
                      <Flame size={8} /> HOT
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[9px] font-black uppercase tracking-wider">
                    {bike.category}
                  </span>
                  <h4 className="font-display font-bold text-sm text-gray-900 leading-tight truncate mt-1">
                    {bike.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    {bike.specs?.groupset || 'Shimano'} • {bike.specs?.weight || 'Lightweight'}
                  </p>
                  <p className="text-xs font-black text-[var(--color-primary)] mt-1.5">
                    Mulai {formatCurrency(minPrice)} <span className="text-[10px] text-gray-400 font-normal">/ 2 jam</span>
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-sky-50 text-[var(--color-primary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                  <ArrowRight size={15} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
