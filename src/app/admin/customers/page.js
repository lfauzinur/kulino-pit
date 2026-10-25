'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bike, CalendarDays, MapPin, Phone, ReceiptText, RefreshCw, Search, Trash2, UserRound, Users, WalletCards } from 'lucide-react';
import { formatCurrency } from '@/lib/data';
import AdminConfirmPage from '@/components/AdminConfirmPage';

function formatDate(value, withTime = false) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(value));
}

function statusClass(status) {
  return {
    Pending: 'bg-amber-50 text-amber-700',
    Active: 'bg-blue-50 text-blue-700',
    Completed: 'bg-green-50 text-green-700',
    Returned: 'bg-emerald-50 text-emerald-700',
    Cancelled: 'bg-red-50 text-red-700',
  }[status] || 'bg-gray-100 text-gray-600';
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkedIds, setCheckedIds] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/customers', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memuat customer.');
      setCustomers(data);
      setCheckedIds((current) => current.filter((id) => data.some((item) => item.id === id)));
      setSelected((current) => current ? data.find((item) => item.id === current.id) || null : null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(loadCustomers); }, [loadCustomers]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) => [customer.name, customer.phone, customer.email, customer.address]
      .some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [customers, query]);

  const allFilteredChecked = filtered.length > 0 && filtered.every((customer) => checkedIds.includes(customer.id));
  const toggleAllFiltered = () => {
    const visibleIds = filtered.map((customer) => customer.id);
    setCheckedIds((current) => allFilteredChecked
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])]);
  };
  const toggleCustomer = (id) => setCheckedIds((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const deleteCustomers = async () => {
    if (!deleting?.length) return;
    setDeletingBusy(true); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/admin/customers', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: deleting.map(({ memberIds, bookingIds }) => ({ memberIds, bookingIds })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Customer gagal dihapus.');
      setCheckedIds([]); setSelected(null); setDeleting(null);
      setSuccess(`${data.deletedCustomers} customer dan ${data.deletedBookings} riwayat booking berhasil dihapus.`);
      await loadCustomers();
    } catch (requestError) { setError(requestError.message); }
    finally { setDeletingBusy(false); }
  };

  const now = new Date();
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter((customer) => {
      const date = new Date(customer.registeredAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    booked: customers.filter((customer) => customer.bookingCount > 0).length,
    transaction: customers.reduce((sum, customer) => sum + Number(customer.totalTransaction || 0), 0),
  };

  if (deleting) return <AdminConfirmPage title={deleting.length === 1 ? 'Hapus Customer?' : `Hapus ${deleting.length} Customer?`} description={`Profil customer yang dipilih beserta seluruh riwayat booking dan transaksinya akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.${error ? ` Gagal: ${error}` : ''}`} busy={deletingBusy} onCancel={() => { setDeleting(null); setError(''); }} onConfirm={deleteCustomers} />;

  if (selected) {
    return <div className="space-y-6 pb-12 animate-fade-in">
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => setSelected(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Detail Customer</p><h1 className="font-display text-2xl font-black text-gray-900 sm:text-3xl">{selected.name}</h1><p className="mt-1 text-sm text-gray-500">Terdaftar {formatDate(selected.registeredAt, true)}</p></div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">{selected.phone && <a href={`https://wa.me/${selected.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="btn btn-primary flex items-center justify-center gap-2 px-5 py-3"><Phone size={16} /> Hubungi WhatsApp</a>}<button type="button" onClick={() => setDeleting([selected])} className="btn flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-5 py-3 text-red-600 hover:bg-red-100"><Trash2 size={16} /> Hapus Customer</button></div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Tanggal Daftar', formatDate(selected.registeredAt, true), <CalendarDays key="date" size={19} />],
          ['No. WhatsApp', selected.phone || 'Belum tersedia', <Phone key="phone" size={19} />],
          ['Alamat', selected.address || 'Belum tersedia', <MapPin key="address" size={19} />],
          ['Total Transaksi', formatCurrency(selected.totalTransaction), <WalletCards key="total" size={19} />],
        ].map(([label, value, icon]) => <div key={label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"><div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">{icon}</div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-bold text-gray-800">{value}</p></div>)}
      </section>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-6"><div className="flex items-center gap-3"><ReceiptText className="text-blue-500" size={22} /><div><h2 className="font-display text-xl font-black text-gray-900">Riwayat Booking & Transaksi</h2><p className="text-sm text-gray-500">{selected.bookingCount} booking atas customer ini.</p></div></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-gray-50"><tr>{['Booking', 'Tanggal Sewa', 'Unit', 'Metode', 'Total', 'Status'].map((label) => <th key={label} className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">{selected.bookings.map((booking) => <tr key={booking.id} className="hover:bg-gray-50"><td className="p-4"><p className="text-xs font-black text-gray-800">{booking.id}</p><p className="mt-1 text-[10px] text-gray-400">Dibuat {formatDate(booking.createdAt, true)}</p></td><td className="p-4 text-xs font-semibold text-gray-700">{formatDate(booking.date)}</td><td className="p-4"><p className="text-xs font-bold text-gray-800">{booking.bike}</p><p className="text-[10px] text-gray-500">{booking.duration || `${booking.days} hari`}</p></td><td className="p-4 text-xs text-gray-600">{booking.paymentMethod || '-'}</td><td className="p-4 text-xs font-black text-gray-900">{formatCurrency(booking.total)}</td><td className="p-4"><span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${statusClass(booking.status)}`}>{booking.status}</span></td></tr>)}</tbody>
          </table>
        </div>
        {!selected.bookings.length && <div className="p-12 text-center"><Bike size={42} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-semibold text-gray-500">Customer belum pernah booking.</p></div>}
      </section>
    </div>;
  }

  return <div className="space-y-7 pb-12 animate-fade-in">
    <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Customer Database</p><h1 className="font-display text-3xl font-black text-gray-900">Data Customer</h1><p className="mt-1 text-sm text-gray-500">Profil, kontak, alamat, dan seluruh riwayat transaksi booking.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, WA, email…" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white sm:w-64" /></div><button type="button" onClick={loadCustomers} disabled={loading} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh</button></div>
    </header>

    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">{success}</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
      ['Total Customer', stats.total, <Users key="users" size={20} />, 'bg-blue-50 text-blue-600'],
      ['Member Baru Bulan Ini', stats.newThisMonth, <UserRound key="new" size={20} />, 'bg-violet-50 text-violet-600'],
      ['Pernah Booking', stats.booked, <Bike key="bike" size={20} />, 'bg-emerald-50 text-emerald-600'],
      ['Nilai Booking', formatCurrency(stats.transaction), <WalletCards key="wallet" size={20} />, 'bg-amber-50 text-amber-600'],
    ].map(([label, value, icon, color]) => <div key={label} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"><div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>{icon}</div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p><p className="mt-1 font-display text-xl font-black text-gray-900">{value}</p></div>)}</section>

    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between"><label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-gray-600"><input type="checkbox" checked={allFilteredChecked} onChange={toggleAllFiltered} className="h-4 w-4 rounded border-gray-300 accent-blue-500" /> Pilih semua hasil ({filtered.length})</label>{checkedIds.length > 0 && <button type="button" onClick={() => setDeleting(customers.filter((customer) => checkedIds.includes(customer.id)))} className="btn flex items-center justify-center gap-2 border border-red-200 bg-red-50 px-4 text-red-600 hover:bg-red-100"><Trash2 size={16} /> Hapus Terpilih ({checkedIds.length})</button>}</div>
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="bg-gray-50"><tr><th className="w-12 p-4"><input type="checkbox" checked={allFilteredChecked} onChange={toggleAllFiltered} aria-label="Pilih semua customer yang tampil" className="h-4 w-4 rounded border-gray-300 accent-blue-500" /></th>{['Customer', 'Terdaftar', 'WhatsApp', 'Alamat', 'Booking', 'Transaksi', 'Aksi'].map((label) => <th key={label} className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((customer) => <tr key={customer.id} className={`hover:bg-gray-50 ${checkedIds.includes(customer.id) ? 'bg-blue-50/40' : ''}`}><td className="p-4"><input type="checkbox" checked={checkedIds.includes(customer.id)} onChange={() => toggleCustomer(customer.id)} aria-label={`Pilih ${customer.name}`} className="h-4 w-4 rounded border-gray-300 accent-blue-500" /></td><td className="p-4"><p className="text-sm font-black text-gray-900">{customer.name}</p><p className="mt-0.5 text-[10px] text-gray-500">{customer.email || customer.id}</p></td><td className="p-4 text-xs font-semibold text-gray-600">{formatDate(customer.registeredAt)}</td><td className="p-4">{customer.phone ? <a href={`https://wa.me/${customer.phone.replace(/\D/g, '').replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-green-600 hover:underline">{customer.phone}</a> : <span className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600">Belum tersedia</span>}</td><td className="max-w-52 p-4 text-xs text-gray-600"><span className="line-clamp-2">{customer.address || 'Belum tersedia'}</span></td><td className="p-4 text-xs font-black text-gray-800">{customer.bookingCount}</td><td className="p-4 text-xs font-black text-gray-900">{formatCurrency(customer.totalTransaction)}</td><td className="p-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected(customer)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100">Lihat Detail</button><button type="button" onClick={() => setDeleting([customer])} className="rounded-xl bg-red-50 p-2.5 text-red-600 hover:bg-red-100" aria-label={`Hapus ${customer.name}`} title="Hapus customer"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
      {loading && <div className="p-12 text-center text-sm font-semibold text-gray-500">Memuat data customer…</div>}
      {!loading && !filtered.length && <div className="p-12 text-center"><Users size={44} className="mx-auto mb-3 text-gray-300" /><p className="text-sm font-semibold text-gray-500">Customer tidak ditemukan.</p></div>}
    </section>
  </div>;
}
