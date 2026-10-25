'use client';

import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';

export default function AdminConfirmPage({ eyebrow = 'Konfirmasi penghapusan', title, description, busy = false, onCancel, onConfirm, confirmLabel = 'Hapus Permanen', tone = 'danger' }) {
  const isReturn = tone === 'return';
  const Icon = isReturn ? RotateCcw : Trash2;
  return <div className="space-y-6 pb-12 animate-fade-in">
    <header className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <button type="button" onClick={onCancel} className="btn border px-3" aria-label="Kembali"><ArrowLeft size={18} /></button>
      <div><p className={`text-[10px] font-black uppercase tracking-[0.22em] ${isReturn ? 'text-green-600' : 'text-red-500'}`}>{eyebrow}</p><h1 className="font-display text-3xl font-black text-gray-900">{title}</h1><p className="mt-1 text-sm text-gray-500">Konfirmasi ditampilkan pada halaman penuh, bukan popup.</p></div>
    </header>
    <section className={`rounded-3xl border bg-white p-8 text-center shadow-sm ${isReturn ? 'border-green-100' : 'border-red-100'}`}>
      <div className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl ${isReturn ? 'bg-green-50' : 'bg-red-50'}`}><Icon size={24} className={isReturn ? 'text-green-600' : 'text-red-500'} /></div>
      <h2 className="font-display text-xl font-black text-gray-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
      <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"><button type="button" disabled={busy} onClick={onCancel} className="btn flex-1 border border-gray-200 text-gray-600 disabled:opacity-50">Kembali</button><button type="button" disabled={busy} onClick={() => onConfirm()} className={`btn flex-1 text-white disabled:opacity-50 ${isReturn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>{busy ? 'Memproses…' : confirmLabel}</button></div>
    </section>
  </div>;
}
