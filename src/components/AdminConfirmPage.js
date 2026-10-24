'use client';

import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AdminConfirmPage({ eyebrow = 'Konfirmasi penghapusan', title, description, busy = false, onCancel, onConfirm }) {
  return <div className="space-y-6 pb-12 animate-fade-in">
    <header className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <button type="button" onClick={onCancel} className="btn border px-3" aria-label="Kembali"><ArrowLeft size={18} /></button>
      <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500">{eyebrow}</p><h1 className="font-display text-3xl font-black text-gray-900">{title}</h1><p className="mt-1 text-sm text-gray-500">Tindakan ini dilakukan pada halaman penuh, bukan popup.</p></div>
    </header>
    <section className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50"><Trash2 size={24} className="text-red-500" /></div>
      <h2 className="font-display text-xl font-black text-gray-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-500">{description}</p>
      <div className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row"><button type="button" disabled={busy} onClick={onCancel} className="btn flex-1 border border-gray-200 text-gray-600 disabled:opacity-50">Kembali</button><button type="button" disabled={busy} onClick={() => onConfirm()} className="btn flex-1 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">{busy ? 'Memproses…' : 'Hapus Permanen'}</button></div>
    </section>
  </div>;
}
