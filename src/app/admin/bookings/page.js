'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/data';
import { CalendarDays, Search, Filter, ChevronDown, Settings, X } from 'lucide-react';

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [summary, setSummary] = useState({ total: 0, pending: 0, active: 0, completed: 0, cancelled: 0, revenue: 0 });
  const filters = ['All', 'Pending', 'Active', 'Completed', 'Cancelled'];
  const [allBookings, setAllBookings] = useState([]);
  const filtered = allBookings.filter((booking) => {
    const matchesFilter = filter === 'All' || booking.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [booking.id, booking.user, booking.phone, booking.bike]
      .some((value) => String(value || '').toLowerCase().includes(needle));
    return matchesFilter && matchesQuery;
  });

  const loadBookings = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [bookingsResponse, summaryResponse] = await Promise.all([
        fetch('/api/bookings', { cache: 'no-store' }),
        fetch('/api/bookings/summary', { cache: 'no-store' }),
      ]);
      const [bookingsData, summaryData] = await Promise.all([bookingsResponse.json(), summaryResponse.json()]);
      if (!bookingsResponse.ok) throw new Error(bookingsData.error || 'Gagal memuat booking.');
      if (!summaryResponse.ok) throw new Error(summaryData.error || 'Gagal memuat ringkasan booking.');
      setAllBookings(bookingsData);
      setSummary(summaryData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadBookings());
  }, [loadBookings]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || 'Status gagal diperbarui.');
      setAllBookings((current) => current.map((booking) => booking.id === id ? updated : booking));
      if (selectedBooking?.id === id) setSelectedBooking(updated);
      setSuccess(`Booking ${id} berhasil diubah menjadi ${newStatus}.`);
      await loadBookings({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId('');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600';
      case 'Active': return 'bg-blue-50 text-blue-600';
      case 'Completed': return 'bg-green-50 text-green-600';
      case 'Cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Bookings Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all incoming and ongoing bike rentals.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/payments"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Settings size={16} /> Kelola Pembayaran
          </Link>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bookings..." 
              className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all w-48"
            />
          </div>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">{success}</div>}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap
              ${filter === f 
                ? 'bg-[var(--color-primary)] text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            {f}
            {f !== 'All' && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold
                ${filter === f ? 'bg-white/20' : 'bg-gray-100'}`}>
                {allBookings.filter(b => b.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', count: summary.total, color: 'bg-gray-50' },
          { label: 'Pending', count: summary.pending, color: 'bg-amber-50' },
          { label: 'Active', count: summary.active, color: 'bg-blue-50' },
          { label: 'Revenue', count: formatCurrency(summary.revenue), color: 'bg-green-50', sub: 'Active + Completed' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
            <p className="font-display font-black text-xl text-gray-900 mt-1">{stat.count}</p>
            {stat.sub && <p className="mt-1 text-[9px] font-semibold text-green-700">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Booking ID / Date</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Customer</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Bike & Duration</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold text-gray-900">{b.id}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{b.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-900">{b.user}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{b.phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-semibold text-gray-700">{b.bike}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{b.days} {b.days > 1 ? 'Days' : 'Day'}</p>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-900">
                    {formatCurrency(b.total)}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.status === 'Pending' && (
                        <>
                          <button type="button" disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Active')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-50">Approve</button>
                          <button type="button" disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Cancelled')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">Reject</button>
                        </>
                      )}
                      {b.status === 'Active' && (
                        <button type="button" disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Completed')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all disabled:opacity-50">Complete</button>
                      )}
                      <button type="button" onClick={() => setSelectedBooking(b)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="View Details">
                        👁️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No bookings found for this filter.</p>
          </div>
        )}
        {loading && <div className="py-12 text-center text-sm text-gray-500">Memuat booking dari database…</div>}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Booking Detail</p>
                <h2 className="font-display text-xl font-black text-gray-900">{selectedBooking.id}</h2>
              </div>
              <button type="button" onClick={() => setSelectedBooking(null)} className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200" aria-label="Tutup detail booking"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Customer', selectedBooking.user],
                ['Telepon', selectedBooking.phone || '-'],
                ['Email', selectedBooking.email || '-'],
                ['Sepeda', selectedBooking.bike],
                ['Tanggal', selectedBooking.date],
                ['Waktu', selectedBooking.time || '-'],
                ['Durasi', selectedBooking.duration || `${selectedBooking.days} hari`],
                ['Metode Ambil', selectedBooking.pickupMethod === 'delivery' ? 'Delivery' : 'Pickup'],
                ['Pembayaran', selectedBooking.paymentMethod || '-'],
                ['Total', formatCurrency(selectedBooking.total)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-gray-50 p-3">
                  <p className="text-[9px] font-bold uppercase text-gray-400">{label}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-gray-100 p-4">
              <span className="text-xs font-bold text-gray-500">Status saat ini</span>
              <span className={`rounded-lg px-3 py-1 text-xs font-bold ${statusColor(selectedBooking.status)}`}>{selectedBooking.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
