'use client';
import { useState } from 'react';
import { formatCurrency } from '@/lib/data';
import { LayoutDashboard, Bike, Wallet, User, Plus, TrendingUp, Download, CheckCircle, Clock } from 'lucide-react';

export default function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dummy State Data
  const [timeFilter, setTimeFilter] = useState('monthly'); // daily, weekly, monthly
  const [balance, setBalance] = useState(1250000);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawHistory, setWithdrawHistory] = useState([
    { id: 'WD01', date: '2026-09-01', amount: 500000, status: 'Success' }
  ]);

  const [partnerBikes, setPartnerBikes] = useState([
    { id: 1, name: 'Polygon Strattos S5', type: 'Roadbike', rentals: 12, earnings: 1800000, status: 'Active' },
    { id: 2, name: 'Brompton M6L', type: 'Folding', rentals: 5, earnings: 750000, status: 'Active' }
  ]);
  const [showAddBike, setShowAddBike] = useState(false);
  const [newBike, setNewBike] = useState({ name: '', type: 'roadbike', description: '' });

  const [profile, setProfile] = useState({
    name: 'Budi Santoso',
    wa: '081234567890',
    address: 'Jl. Melati No 10, Banyuwangi',
    username: 'budipartner',
    password: 'password123',
    bank: 'BCA 0987654321 a/n Budi Santoso'
  });

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 100000) {
      alert('Minimal penarikan adalah Rp 100.000');
      return;
    }
    if (amount > balance) {
      alert('Saldo tidak mencukupi!');
      return;
    }
    setBalance(prev => prev - amount);
    setWithdrawHistory([{ id: 'WD' + Date.now().toString().slice(-4), date: new Date().toISOString().split('T')[0], amount, status: 'Pending' }, ...withdrawHistory]);
    setWithdrawAmount('');
    alert('Permintaan penarikan berhasil diajukan!');
  };

  const handleAddBike = (e) => {
    e.preventDefault();
    setPartnerBikes([...partnerBikes, { id: Date.now(), name: newBike.name, type: newBike.type, rentals: 0, earnings: 0, status: 'Pending Review' }]);
    setShowAddBike(false);
    setNewBike({ name: '', type: 'roadbike', description: '' });
    alert('Sepeda berhasil diajukan untuk disewakan!');
  };

  const chartData = {
    daily: [150000, 200000, 50000, 300000, 100000, 250000, 400000],
    weekly: [1200000, 950000, 1500000, 1800000],
    monthly: [4500000, 3200000, 5100000, 6000000, 4800000, 7200000]
  };

  const currentChart = chartData[timeFilter];
  const maxVal = Math.max(...currentChart);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Kelola aset sepeda dan pantau pendapatan Anda.</p>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 flex flex-wrap gap-2 mb-8 shadow-sm border border-gray-100">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'bikes', label: 'Unit Sepeda', icon: <Bike size={18} /> },
            { id: 'withdraw', label: 'Tarik Dana', icon: <Wallet size={18} /> },
            { id: 'profile', label: 'Profil Saya', icon: <User size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-xl transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-gray-50 text-gray-900 shadow-sm border border-gray-200' 
                  : 'bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              {tab.icon} <span className={activeTab === tab.id ? 'text-gray-900' : ''}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── TAB: DASHBOARD ─── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Metric Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Saldo Aktif</p>
                <p className="font-display font-black text-3xl text-gray-900">{formatCurrency(balance)}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Total Pendapatan</p>
                <p className="font-display font-black text-3xl text-gray-900">{formatCurrency(partnerBikes.reduce((acc, b) => acc + b.earnings, 0) + balance)}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Total Unit Disewa</p>
                <p className="font-display font-black text-3xl text-gray-900">{partnerBikes.reduce((acc, b) => acc + b.rentals, 0)}x</p>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
                <h3 className="font-display font-black text-xl flex items-center gap-2 text-gray-900">
                  <TrendingUp className="text-[var(--color-primary)]" /> Grafik Pendapatan
                </h3>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 mt-4 sm:mt-0">
                  {['daily', 'weekly', 'monthly'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setTimeFilter(f)}
                      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-64 flex items-end gap-2 sm:gap-6 border-b border-gray-200 pb-4 pt-8">
                {currentChart.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end">
                    <div className="relative w-full max-w-[48px] bg-blue-100 rounded-t-lg transition-all duration-300 group-hover:bg-[var(--color-primary)]" 
                         style={{ height: `${(val / maxVal) * 100}%`, minHeight: '4px' }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-10">
                        {formatCurrency(val)}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {timeFilter === 'monthly' ? `Bln ${i+1}` : timeFilter === 'weekly' ? `Mg ${i+1}` : `Hr ${i+1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: UNIT SEPEDA ─── */}
        {activeTab === 'bikes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="font-display font-black text-2xl text-gray-900">Unit Sepeda Saya</h2>
              <button onClick={() => setShowAddBike(!showAddBike)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] transition-all flex items-center gap-2">
                <Plus size={16} /> Sewakan Unit Baru
              </button>
            </div>

            {showAddBike && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--color-primary)] mb-8 animate-fade-in">
                <h3 className="font-display font-black text-xl text-gray-900 mb-6">Form Pengajuan Sepeda Baru</h3>
                <form onSubmit={handleAddBike} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Nama Sepeda</label>
                      <input type="text" required value={newBike.name} onChange={e => setNewBike({...newBike, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: Polygon Strattos S5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Kategori</label>
                      <select value={newBike.type} onChange={e => setNewBike({...newBike, type: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]">
                        <option value="roadbike">Roadbike</option>
                        <option value="mtb">MTB</option>
                        <option value="folding">Folding</option>
                        <option value="ebike">E-Bike</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Kondisi & Deskripsi Singkat</label>
                    <textarea required value={newBike.description} onChange={e => setNewBike({...newBike, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none" rows="3" placeholder="Deskripsikan spesifikasi dan kondisi sepeda..."></textarea>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => setShowAddBike(false)} className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Batal</button>
                    <button type="submit" className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] transition-all">Ajukan Sepeda</button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              {partnerBikes.map(bike => (
                <div key={bike.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-blue-50 px-2.5 py-1 rounded-lg">{bike.type}</span>
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${bike.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {bike.status === 'Active' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {bike.status}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-xl text-gray-900 mb-6">{bike.name}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-200 pt-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Total Disewa</p>
                      <p className="text-sm font-black text-gray-900 mt-1">{bike.rentals} Kali</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Menghasilkan</p>
                      <p className="text-sm font-black text-[var(--color-primary)] mt-1">{formatCurrency(bike.earnings)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB: TARIK DANA ─── */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6 animate-fade-in grid md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-[var(--color-primary)] text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet size={120} /></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/80 mb-2">Saldo Bisa Ditarik</p>
                  <p className="font-display font-black text-4xl mb-4">{formatCurrency(balance)}</p>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                    <p className="text-xs text-white leading-relaxed">
                      Pencairan diproses dalam 1x24 Jam Kerja ke Rekening yang terdaftar di Profil Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-display font-black text-lg text-gray-900 mb-5">Ajukan Penarikan</h3>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Nominal (Min. Rp 100.000)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                      <input 
                        type="number" 
                        required 
                        min="100000"
                        value={withdrawAmount} 
                        onChange={e => setWithdrawAmount(e.target.value)} 
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" 
                        placeholder="100.000" 
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full px-5 py-3.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] transition-all flex justify-center items-center gap-2">
                    <Download size={16} /> Tarik Dana Sekarang
                  </button>
                </form>
              </div>
            </div>

            <div className="md:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-display font-black text-lg text-gray-900 mb-6">Riwayat Penarikan</h3>
              <div className="space-y-3">
                {withdrawHistory.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${h.status === 'Success' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{formatCurrency(h.amount)}</p>
                        <p className="text-[10px] font-medium text-gray-500 mt-0.5">{h.date} • {h.id}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg
                      ${h.status === 'Success' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {h.status}
                    </span>
                  </div>
                ))}
                
                {withdrawHistory.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-500">Belum ada riwayat penarikan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PROFIL ─── */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 animate-fade-in max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-black">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-display font-black text-2xl text-gray-900">Profil Mitra</h2>
                <p className="text-sm text-gray-500 mt-1">Perbarui informasi data diri dan rekening pencairan Anda.</p>
              </div>
            </div>
            
            <form className="space-y-6" onSubmit={e => { e.preventDefault(); alert('Profil berhasil disimpan!'); }}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Nama Lengkap</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">No WhatsApp</label>
                  <input type="text" value={profile.wa} onChange={e => setProfile({...profile, wa: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Alamat Lengkap</label>
                <textarea value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none" rows="2"></textarea>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Username Login</label>
                  <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Password</label>
                  <input type="password" value={profile.password} onChange={e => setProfile({...profile, password: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Data Rekening (Untuk Pencairan)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <Wallet size={20} className="text-gray-400" />
                  </div>
                  <input type="text" value={profile.bank} onChange={e => setProfile({...profile, bank: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="Cth: BCA 123456789 a/n Nama" />
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button type="submit" className="px-6 py-3 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] transition-all">
                  Simpan Perubahan Profil
                </button>
              </div>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}
