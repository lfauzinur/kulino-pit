'use client';
import { useState, useEffect } from 'react';
import { Sun, Wind, Droplets, Compass, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CyclingWeatherCard() {
  const [lastUpdated, setLastUpdated] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/40 to-blue-50/60 rounded-[24px] p-5 border border-sky-100 shadow-[0_4px_20px_rgba(75,163,227,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-[var(--color-primary)] flex items-center justify-center font-bold">
            <Sun size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs text-gray-900 leading-tight">
              Kondisi Cuaca Gowes
            </h3>
            <p className="text-[10px] text-gray-500">
              Banyuwangi • Update {lastUpdated || 'Hari ini'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="text-gray-400 hover:text-[var(--color-primary)] p-1.5 rounded-full hover:bg-white/80 transition-colors"
          title="Refresh Cuaca"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[var(--color-primary)]' : ''} />
        </button>
      </div>

      {/* Main Metric Row */}
      <div className="grid grid-cols-4 gap-2 py-2 mb-3 bg-white/90 backdrop-blur-sm rounded-2xl p-3 border border-sky-50 shadow-xs">
        <div className="text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Suhu</p>
          <p className="font-display font-black text-base text-gray-900">28°<span className="text-[10px] font-bold text-gray-500">C</span></p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5 flex items-center justify-center gap-0.5">
            <Wind size={9} /> Angin
          </p>
          <p className="font-display font-black text-base text-sky-600">11 <span className="text-[10px] font-bold text-gray-500">km/h</span></p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5 flex items-center justify-center gap-0.5">
            <Droplets size={9} /> Lembab
          </p>
          <p className="font-display font-black text-base text-gray-900">65<span className="text-[10px] font-bold text-gray-500">%</span></p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5 flex items-center justify-center gap-0.5">
            <Compass size={9} /> Jalur
          </p>
          <p className="font-display font-black text-xs text-emerald-600 mt-1">Kering</p>
        </div>
      </div>

      {/* Cycling Advisory */}
      <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-100 rounded-xl px-3 py-2 text-emerald-800 text-[11px] font-medium">
        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
        <span className="leading-tight">
          <strong>Kondisi Prima:</strong> Aspal kering & angin sejuk. Sangat nyaman untuk rute Ijen Trail maupun City Sunrise!
        </span>
      </div>
    </div>
  );
}
