'use client';
import { useEffect, useState } from 'react';

export default function VisitorTracker() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Record real visit and retrieve aggregated visitor stats
    fetch('/api/visitors', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (typeof data.total === 'number') {
          setStats(data);
        }
      })
      .catch(err => {
        console.error('Visitor tracker error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const todayCount = stats ? stats.today.toLocaleString() : '0';
  const totalCount = stats ? stats.total.toLocaleString() : '0';

  return (
    <section className="py-12 bg-[#F6FAFE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-xl">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Jejak Kunjungan</p>
          <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 mb-4">Terima kasih sudah berkunjung.</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Satu alamat IP hanya dihitung satu kali per hari. Informasi yang ditampilkan berupa statistik 
            agregat tanpa menyimpan alamat IP asli.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {/* Card Hari Ini */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 md:w-48 transition-all">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Hari Ini</p>
            {loading ? (
              <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg" />
            ) : (
              <p className="font-display font-black text-3xl text-[#2B639B]">{todayCount}</p>
            )}
          </div>

          {/* Card Total Pengunjung */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 md:w-48 transition-all">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Total Pengunjung</p>
            {loading ? (
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-lg" />
            ) : (
              <p className="font-display font-black text-3xl text-[#2B639B]">{totalCount}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
