'use client';
import { useState } from 'react';

export default function AdminPartnersPage() {
  const initialPartners = [
    { id: 'PR-101', name: 'Joko Widodo', phone: '08122334455', city: 'Banyuwangi', bike: 'Trek Emonda SL6 (Roadbike)', condition: 'Baik', status: 'Pending', date: '2026-10-03' },
    { id: 'PR-100', name: 'Ahmad Dhani', phone: '08199887766', city: 'Banyuwangi', bike: 'Polygon Siskiu T8 (MTB)', condition: 'Baru', status: 'Approved', date: '2026-10-01' },
    { id: 'PR-099', name: 'Raisa Andriana', phone: '085544332211', city: 'Jember', bike: 'Brompton Explore (Folding)', condition: 'Baik', status: 'Approved', date: '2026-09-25' },
    { id: 'PR-098', name: 'Deddy Corbuzier', phone: '081122112211', city: 'Banyuwangi', bike: 'Pacific Noris 2.0 (Folding)', condition: 'Cukup', status: 'Rejected', date: '2026-09-20' },
  ];

  const [partners, setPartners] = useState(initialPartners);

  const handleUpdateStatus = (id, newStatus) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Partner Applications</h1>
          <p className="text-sm text-[var(--color-gray-500)] mt-1">Review and manage bike owner partnership requests.</p>
        </div>
      </header>

      <div className="brutal-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-3 border-black bg-[var(--color-cream-dark)]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Date / ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Applicant</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Bike Details</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-gray-100)]">
              {partners.map((p, i) => (
                <tr key={i} className="hover:bg-[var(--color-cream)] transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold">{p.date}</p>
                    <p className="font-mono text-[10px] text-[var(--color-gray-500)]">{p.id}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-gray-500)]">{p.phone} · {p.city}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold">{p.bike}</p>
                    <p className="text-[10px] text-[var(--color-gray-500)]">Kondisi: {p.condition}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 border-2 border-black text-[9px] font-bold inline-block min-w-[70px] text-center
                      ${p.status === 'Pending' ? 'bg-[var(--color-yellow)] text-black' : 
                        p.status === 'Approved' ? 'bg-[var(--color-green-light)] text-[var(--color-green)]' : 
                        'bg-[var(--color-gray-300)] text-[var(--color-gray-600)]'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(p.id, 'Approved')} className="brutal-btn brutal-btn-primary px-3 py-1.5 text-[9px]">Approve</button>
                          <button onClick={() => handleUpdateStatus(p.id, 'Rejected')} className="brutal-btn brutal-btn-secondary px-3 py-1.5 text-[9px]">Reject</button>
                        </>
                      )}
                      <button className="p-1.5 border-2 border-transparent hover:border-black transition-colors" title="Contact via WhatsApp">
                        💬
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
