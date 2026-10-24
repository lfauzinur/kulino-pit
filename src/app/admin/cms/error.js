'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ReportsError({ error, reset }) {
  return <div className="grid min-h-[65vh] place-items-center p-4">
    <section className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-500"><AlertTriangle size={26} /></div>
      <h1 className="mt-4 font-display text-2xl font-black text-gray-900">Laporan belum dapat ditampilkan</h1>
      <p className="mt-2 text-sm leading-6 text-gray-500">{error?.message || 'Terjadi gangguan ketika memuat laporan.'}</p>
      <button type="button" onClick={reset} className="btn btn-primary mx-auto mt-6 flex items-center justify-center gap-2 px-5 py-3"><RefreshCw size={16} /> Muat Ulang Laporan</button>
    </section>
  </div>;
}
