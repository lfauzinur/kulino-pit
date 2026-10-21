'use client';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/data';
import { CalendarDays, Search, Filter, ChevronDown, Settings, X, Save } from 'lucide-react';

export default function AdminBookingsPage() {
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const filters = ['All', 'Pending', 'Active', 'Completed', 'Cancelled'];
  const [allBookings, setAllBookings] = useState([]);
  const filtered = allBookings.filter((booking) => {
    const matchesFilter = filter === 'All' || booking.status === filter;
    const needle = query.trim().toLowerCase();
    const matchesQuery = !needle || [booking.id, booking.user, booking.phone, booking.bike]
      .some((value) => String(value || '').toLowerCase().includes(needle));
    return matchesFilter && matchesQuery;
  });

  useEffect(() => {
    fetch('/api/bookings', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Gagal memuat booking.');
        setAllBookings(data);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  // Payment Settings Modal
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    bankAccount: 'BCA 1234567890 a/n Kulino Pit',
    qrisUrl: 'QRIS - scan from any app',
    qrisImage: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('paymentSettings');
    if (saved) Promise.resolve().then(() => setPaymentSettings(JSON.parse(saved)));
  }, []);

  const handleSavePaymentSettings = () => {
    localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
    alert('Payment settings saved successfully!');
    setShowPaymentSettings(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentSettings(prev => ({ ...prev, qrisImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError('');
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || 'Status gagal diperbarui.');
      setAllBookings((current) => current.map((booking) => booking.id === id ? updated : booking));
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
          <button 
            onClick={() => setShowPaymentSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Settings size={16} /> Setup Payment
          </button>
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

      {/* Payment Settings Modal */}
      {showPaymentSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-black text-xl text-gray-900">Payment Methods Setup</h3>
              <button onClick={() => setShowPaymentSettings(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Bank Account (e.g. BCA 1234567890 a/n Name)</label>
                <input 
                  type="text" 
                  value={paymentSettings.bankAccount}
                  onChange={e => setPaymentSettings({...paymentSettings, bankAccount: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">QRIS Instructions / Link</label>
                <input 
                  type="text" 
                  value={paymentSettings.qrisUrl}
                  onChange={e => setPaymentSettings({...paymentSettings, qrisUrl: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] mb-3"
                />
                
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Upload QRIS Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {paymentSettings.qrisImage && (
                  <div className="mt-4 p-2 border border-gray-200 rounded-xl bg-gray-50 text-center">
                    <img src={paymentSettings.qrisImage} alt="QRIS Preview" className="mx-auto max-h-40 rounded-lg shadow-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowPaymentSettings(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">
                Cancel
              </button>
              <button onClick={handleSavePaymentSettings} className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-xl flex items-center gap-2">
                <Save size={16} /> Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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
          { label: 'Total', count: allBookings.length, color: 'bg-gray-50' },
          { label: 'Pending', count: allBookings.filter(b => b.status === 'Pending').length, color: 'bg-amber-50' },
          { label: 'Active', count: allBookings.filter(b => b.status === 'Active').length, color: 'bg-blue-50' },
          { label: 'Revenue', count: formatCurrency(allBookings.filter(b => b.status === 'Completed').reduce((a, b) => a + b.total, 0)), color: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
            <p className="font-display font-black text-xl text-gray-900 mt-1">{stat.count}</p>
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
                          <button disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Active')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-50">Approve</button>
                          <button disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Cancelled')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">Reject</button>
                        </>
                      )}
                      {b.status === 'Active' && (
                        <button disabled={updatingId === b.id} onClick={() => handleUpdateStatus(b.id, 'Completed')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 transition-all disabled:opacity-50">Complete</button>
                      )}
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="View Details">
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
    </div>
  );
}
