'use client';
import { useState } from 'react';
import { formatCurrency } from '@/lib/data';

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Pending', 'Active', 'Completed', 'Cancelled'];

  const initialBookings = [
    { id: 'KP-827361', date: '2026-10-04', user: 'Budi Santoso', phone: '081234567890', bike: 'Polygon Helios C8', days: 2, status: 'Pending', total: 450000 },
    { id: 'KP-827360', date: '2026-10-03', user: 'Andi Wijaya', phone: '081298765432', bike: 'Giant Defy Advanced', days: 1, status: 'Active', total: 600000 },
    { id: 'KP-827359', date: '2026-10-01', user: 'Siti Nurhaliza', phone: '081311223344', bike: 'Brompton M6L', days: 1, status: 'Completed', total: 350000 },
    { id: 'KP-827358', date: '2026-09-28', user: 'Reza Rahadian', phone: '085699887766', bike: 'Trek Marlin 7', days: 3, status: 'Completed', total: 600000 },
    { id: 'KP-827357', date: '2026-09-25', user: 'Ayu Lestari', phone: '081122334455', bike: 'Specialized Tarmac', days: 1, status: 'Cancelled', total: 800000 },
  ];

  const [allBookings, setAllBookings] = useState(initialBookings);
  const filtered = filter === 'All' ? allBookings : allBookings.filter(b => b.status === filter);

  const handleUpdateStatus = (id, newStatus) => {
    setAllBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Bookings Management</h1>
          <p className="text-sm text-[var(--color-gray-500)] mt-1">Manage all incoming and ongoing bike rentals.</p>
        </div>
        <div className="flex bg-white border-3 border-black p-1 shadow-[var(--shadow-brutal-sm)] overflow-x-auto">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold transition-colors whitespace-nowrap ${filter === f ? 'bg-[var(--color-black)] text-white' : 'hover:bg-[var(--color-cream)]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="brutal-card overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-3 border-black bg-[var(--color-cream-dark)]">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Booking ID / Date</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Bike & Duration</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Total</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-gray-100)]">
              {filtered.map((b, i) => (
                <tr key={i} className="hover:bg-[var(--color-cream)] transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-xs font-black">{b.id}</p>
                    <p className="text-[10px] text-[var(--color-gray-500)]">{b.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold">{b.user}</p>
                    <p className="text-[10px] text-[var(--color-gray-500)]">{b.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-bold">{b.bike}</p>
                    <p className="text-[10px] text-[var(--color-gray-500)]">{b.days} Days</p>
                  </td>
                  <td className="p-4 text-xs font-bold text-[var(--color-orange)]">
                    {formatCurrency(b.total)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 border-2 border-black text-[9px] font-bold inline-block min-w-[80px] text-center
                      ${b.status === 'Pending' ? 'bg-[var(--color-yellow)] text-black' : 
                        b.status === 'Active' ? 'bg-[var(--color-blue-light)] text-[var(--color-blue)]' : 
                        b.status === 'Completed' ? 'bg-[var(--color-green-light)] text-[var(--color-green)]' :
                        'bg-[var(--color-red-light)] text-[var(--color-red)]'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'Pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(b.id, 'Active')} className="brutal-btn brutal-btn-primary px-3 py-1.5 text-[9px]">Approve</button>
                          <button onClick={() => handleUpdateStatus(b.id, 'Cancelled')} className="brutal-btn brutal-btn-secondary px-3 py-1.5 text-[9px]">Reject</button>
                        </>
                      )}
                      {b.status === 'Active' && (
                        <button onClick={() => handleUpdateStatus(b.id, 'Completed')} className="brutal-btn brutal-btn-secondary px-3 py-1.5 text-[9px] !bg-[var(--color-green-light)] !border-[var(--color-green)] text-[var(--color-green)]">Complete</button>
                      )}
                      <button className="p-1.5 border-2 border-transparent hover:border-black transition-colors" title="View Details">
                        👁️
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
