'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, MessageCircle, Eye, Bike, Phone, MapPin, Hash, FileText, AlertCircle, RefreshCcw, Trash2 } from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState('All');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [deletingPartner, setDeletingPartner] = useState(null);

  const loadPartners = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/partners', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal memuat mitra.');
      setPartners(data);
      setSelectedPartner((current) => current
        ? data.find((partner) => partner.id === current.id) || null
        : null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadPartners());
  }, [loadPartners]);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/partners/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || 'Status gagal diperbarui.');
      setPartners((current) => current.map((partner) => partner.id === id ? updated : partner));
      if (selectedPartner?.id === id) setSelectedPartner(updated);
      setSuccess(`${updated.name} berhasil diubah menjadi ${newStatus}.`);
      await loadPartners({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId('');
    }
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;
    setUpdatingId(deletingPartner.id);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/partners/${encodeURIComponent(deletingPartner.id)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Partner gagal dihapus.');
      const deletedName = deletingPartner.name;
      setDeletingPartner(null);
      setSelectedPartner(null);
      setSuccess(`Pendaftaran ${deletedName} berhasil dihapus.`);
      await loadPartners({ silent: true });
    } catch (requestError) {
      setError(requestError.message);
      setDeletingPartner(null);
    } finally {
      setUpdatingId('');
    }
  };

  const statusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={12} />;
      case 'Approved': return <CheckCircle size={12} />;
      case 'Rejected': return <XCircle size={12} />;
      default: return null;
    }
  };

  const statusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Approved': return 'bg-green-50 text-green-600 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const conditionColor = (cond) => {
    switch(cond) {
      case 'Baru': return 'bg-green-50 text-green-600';
      case 'Baik': return 'bg-blue-50 text-blue-600';
      case 'Cukup': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const filters = ['All', 'Pending', 'Approved', 'Rejected'];
  const filtered = filter === 'All' ? partners : partners.filter(p => p.status === filter);
  const pendingCount = partners.filter(p => p.status === 'Pending').length;

  if (deletingPartner) return <AdminConfirmPage title="Hapus Pendaftaran Partner?" description={`Pendaftaran “${deletingPartner.name}” (${deletingPartner.id}) beserta foto sepedanya akan dihapus permanen.`} busy={updatingId === deletingPartner.id} onCancel={() => setDeletingPartner(null)} onConfirm={handleDelete} />;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {!selectedPartner && <>
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Partner Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage bike owner partnership requests.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => loadPartners()} disabled={loading} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-semibold">
              <Clock size={14} />
              {pendingCount} application{pendingCount > 1 ? 's' : ''} pending review
            </div>
          )}
        </div>
      </header>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">{success}</div>}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Applications', count: partners.length, color: 'bg-gray-50', icon: <Users size={18} className="text-gray-400" /> },
          { label: 'Pending', count: partners.filter(p => p.status === 'Pending').length, color: 'bg-amber-50', icon: <Clock size={18} className="text-amber-500" /> },
          { label: 'Approved', count: partners.filter(p => p.status === 'Approved').length, color: 'bg-green-50', icon: <CheckCircle size={18} className="text-green-500" /> },
          { label: 'Rejected', count: partners.filter(p => p.status === 'Rejected').length, color: 'bg-red-50', icon: <XCircle size={18} className="text-red-500" /> },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4 border border-gray-100 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              {stat.icon}
            </div>
            <div>
              <p className="font-display font-black text-xl text-gray-900">{stat.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {filters.map(f => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap
              ${filter === f 
                ? 'bg-[var(--color-primary)] text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Date / ID</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Applicant</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Bike Details</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <p className="text-xs font-bold text-gray-900">{p.date}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{p.id}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs">
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{p.name}</p>
                        <p className="text-[10px] text-gray-500">{p.phone} · {p.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-xs font-semibold text-gray-700">{p.bike} <span className="text-gray-400">({p.category})</span></p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-md text-[9px] font-bold ${conditionColor(p.condition)}`}>
                      Kondisi: {p.condition}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusColor(p.status)}`}>
                      {statusIcon(p.status)}
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'Pending' && (
                        <>
                          <button type="button" disabled={updatingId === p.id} onClick={() => handleUpdateStatus(p.id, 'Approved')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-all disabled:opacity-50">{updatingId === p.id ? 'Saving…' : 'Approve'}</button>
                          <button type="button" disabled={updatingId === p.id} onClick={() => handleUpdateStatus(p.id, 'Rejected')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50">Reject</button>
                        </>
                      )}
                      {/* View Detail */}
                      <button 
                        type="button"
                        onClick={() => setSelectedPartner(p)}
                        className="p-2 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-colors" 
                        title="Lihat Detail Partner"
                      >
                        <Eye size={16} />
                      </button>
                      <a 
                        href={`https://wa.me/${p.phone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" 
                        title="Contact via WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                      <button type="button" onClick={() => setDeletingPartner(p)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Hapus pendaftaran partner"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No partner applications found.</p>
          </div>
        )}
        {loading && <div className="py-12 text-center text-sm text-gray-500">Memuat pendaftaran dari database…</div>}
      </div>

      </>}

      {/* Full-page partner detail */}
      {selectedPartner && (
        <div className="space-y-6 animate-fade-in">
          <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => setSelectedPartner(null)} className="btn border px-3" aria-label="Kembali ke daftar partner"><ArrowLeft size={18} /></button>
              <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Detail Partner</p><h1 className="font-display text-3xl font-black text-gray-900">{selectedPartner.name}</h1><p className="mt-1 text-sm text-gray-500">{selectedPartner.id} · Daftar {selectedPartner.date}</p></div>
            </div>
            <span className={`inline-flex items-center gap-1 self-start rounded-full border px-3 py-1 text-xs font-bold sm:self-center ${statusColor(selectedPartner.status)}`}>{statusIcon(selectedPartner.status)} {selectedPartner.status}</span>
          </header>
          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-[var(--color-primary)] to-sky-500 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center font-black text-2xl text-white">
                  {selectedPartner.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h2 className="font-display font-black text-xl text-white">{selectedPartner.name}</h2>
                  <p className="text-white/70 text-sm">{selectedPartner.id} · Daftar {selectedPartner.date}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(selectedPartner.status)}`}>
                    {statusIcon(selectedPartner.status)} {selectedPartner.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {selectedPartner.photoUrl && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><Eye size={12} /> Foto Sepeda</h3>
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-gray-100"><Image src={selectedPartner.photoUrl} alt={`Sepeda ${selectedPartner.name}`} fill className="object-cover" unoptimized /></div>
                </div>
              )}
              {/* Profile Info */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><Users size={12} /> Profil Pendaftar</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Phone size={13} className="text-[var(--color-primary)]" />, label: 'No. HP', value: selectedPartner.phone },
                    { icon: <MessageCircle size={13} className="text-[var(--color-primary)]" />, label: 'Email', value: selectedPartner.email },
                    { icon: <MapPin size={13} className="text-[var(--color-primary)]" />, label: 'Kota', value: selectedPartner.city },
                    { icon: <Hash size={13} className="text-[var(--color-primary)]" />, label: 'No. KTP', value: selectedPartner.idCard },
                  ].map((item, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-3 flex items-start gap-2.5">
                      <div className="mt-0.5">{item.icon}</div>
                      <div>
                        <p className="text-[9px] font-bold uppercase text-gray-400">{item.label}</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="col-span-2 bg-gray-50 rounded-2xl p-3 flex items-start gap-2.5">
                    <MapPin size={13} className="text-[var(--color-primary)] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold uppercase text-gray-400">Alamat</p>
                      <p className="text-xs font-semibold text-gray-800 mt-0.5">{selectedPartner.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bike Info */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2"><Bike size={12} /> Detail Sepeda</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Nama Sepeda', value: selectedPartner.bike },
                    { label: 'Kategori', value: selectedPartner.category },
                    { label: 'Brand', value: selectedPartner.bikeBrand },
                    { label: 'Tahun', value: selectedPartner.bikeYear },
                    { label: 'Warna', value: selectedPartner.bikeColor },
                    { label: 'Ukuran Frame', value: selectedPartner.bikeFrame },
                    { label: 'Groupset', value: selectedPartner.bikeGroupset },
                    { label: 'Rem', value: selectedPartner.bikeBrake },
                    { label: 'Ukuran Roda', value: selectedPartner.bikeWheel },
                    { label: 'Kondisi', value: selectedPartner.condition },
                  ].map((item, i) => (
                    <div key={i} className={`bg-gray-50 rounded-2xl p-3 ${i === 0 ? 'col-span-2' : ''}`}>
                      <p className="text-[9px] font-bold uppercase text-gray-400">{item.label}</p>
                      <p className={`text-xs font-semibold text-gray-800 mt-0.5 ${item.label === 'Kondisi' ? `px-2 py-0.5 rounded-md inline-block ${conditionColor(item.value)}` : ''}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-2"><FileText size={12} /> Catatan Kondisi</h3>
                <p className="text-xs text-gray-700">{selectedPartner.notes}</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-2"><AlertCircle size={12} /> Alasan Bergabung</h3>
                <p className="text-xs text-gray-700">{selectedPartner.joinReason}</p>
              </div>

              {/* Revenue */}
              {selectedPartner.status === 'Approved' && (
                <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                  <p className="text-[9px] font-bold uppercase text-green-500 mb-1">Total Revenue Partner</p>
                  <p className="font-display font-black text-2xl text-green-700">Rp {selectedPartner.revenue?.toLocaleString('id-ID') || '0'}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedPartner.status === 'Pending' && (
                  <>
                    <button 
                      type="button"
                      disabled={updatingId === selectedPartner.id}
                      onClick={() => handleUpdateStatus(selectedPartner.id, 'Approved')}
                      className="btn btn-primary flex-1 py-3 disabled:opacity-50"
                    >✓ Approve Partner</button>
                    <button 
                      type="button"
                      disabled={updatingId === selectedPartner.id}
                      onClick={() => handleUpdateStatus(selectedPartner.id, 'Rejected')}
                      className="btn flex-1 py-3 border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >✕ Reject</button>
                  </>
                )}
                <a 
                  href={`https://wa.me/${selectedPartner.phone.replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn flex-1 py-3 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
                <button type="button" onClick={() => setDeletingPartner(selectedPartner)} className="btn flex items-center justify-center gap-2 border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50"><Trash2 size={15} /> Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
