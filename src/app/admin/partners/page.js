'use client';
import { useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, MessageCircle, ChevronRight } from 'lucide-react';

export default function AdminPartnersPage() {
  const initialPartners = [
    { id: 'PR-101', name: 'Joko Widodo', phone: '08122334455', city: 'Banyuwangi', bike: 'Trek Emonda SL6 (Roadbike)', condition: 'Baik', status: 'Pending', date: '2026-10-03' },
    { id: 'PR-100', name: 'Ahmad Dhani', phone: '08199887766', city: 'Banyuwangi', bike: 'Polygon Siskiu T8 (MTB)', condition: 'Baru', status: 'Approved', date: '2026-10-01' },
    { id: 'PR-099', name: 'Raisa Andriana', phone: '085544332211', city: 'Jember', bike: 'Brompton Explore (Folding)', condition: 'Baik', status: 'Approved', date: '2026-09-25' },
    { id: 'PR-098', name: 'Deddy Corbuzier', phone: '081122112211', city: 'Banyuwangi', bike: 'Pacific Noris 2.0 (Folding)', condition: 'Cukup', status: 'Rejected', date: '2026-09-20' },
  ];

  const [partners, setPartners] = useState(initialPartners);
  const [filter, setFilter] = useState('All');

  const handleUpdateStatus = (id, newStatus) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
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

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Partner Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage bike owner partnership requests.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-xs font-semibold">
            <Clock size={14} />
            {pendingCount} application{pendingCount > 1 ? 's' : ''} pending review
          </div>
        )}
      </header>

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
                    <p className="text-xs font-semibold text-gray-700">{p.bike}</p>
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
                          <button onClick={() => handleUpdateStatus(p.id, 'Approved')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-all">Approve</button>
                          <button onClick={() => handleUpdateStatus(p.id, 'Rejected')} className="px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">Reject</button>
                        </>
                      )}
                      <a 
                        href={`https://wa.me/${p.phone.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors" 
                        title="Contact via WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No partner applications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
