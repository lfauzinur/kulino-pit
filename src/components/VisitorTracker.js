'use client';
import { useEffect, useState } from 'react';

export default function VisitorTracker() {
  const [stats, setStats] = useState({ today: 22, total: 1140 });

  useEffect(() => {
    // Record visit and get stats
    fetch('/api/visitors', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.total) setStats(data);
      })
      .catch(err => console.error(err));
  }, []);

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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 md:w-48">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Hari Ini</p>
            <p className="font-display font-black text-3xl text-[#2B639B]">{stats.today.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 md:w-48">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-4">Total Pengunjung</p>
            <p className="font-display font-black text-3xl text-[#2B639B]">{stats.total.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
