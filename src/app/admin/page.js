'use client';
import { formatCurrency, bikes, calendarBookings } from '@/lib/data';
import Link from 'next/link';

export default function AdminOverviewPage() {
  const stats = [
    { label: 'Total Revenue (Oct)', value: formatCurrency(12500000), trend: '+15%', isPositive: true },
    { label: 'Active Bookings', value: '24', trend: '+4', isPositive: true },
    { label: 'Available Fleet', value: `${bikes.filter(b => b.available).length}/${bikes.length}`, trend: '-2', isPositive: false },
    { label: 'Pending Partners', value: '5', trend: 'Requires Review', isPositive: false },
  ];

  const recentBookings = [
    { id: 'KP-827361', user: 'Budi Santoso', bike: 'Polygon Helios C8', status: 'Pending', total: 450000 },
    { id: 'KP-827360', user: 'Andi Wijaya', bike: 'Giant Defy Advanced', status: 'Active', total: 600000 },
    { id: 'KP-827359', user: 'Siti Nurhaliza', bike: 'Brompton M6L', status: 'Completed', total: 350000 },
    { id: 'KP-827358', user: 'Reza Rahadian', bike: 'Trek Marlin 7', status: 'Completed', total: 200000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Dashboard Overview</h1>
          <p className="text-sm text-[var(--color-gray-500)] mt-1">Welcome back, here is what is happening today.</p>
        </div>
        <div className="flex gap-2">
          <button className="brutal-btn brutal-btn-secondary px-4 py-2 text-xs">Generate Report</button>
          <Link href="/admin/bookings" className="brutal-btn brutal-btn-primary px-4 py-2 text-xs">+ New Booking</Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="brutal-card p-5 bg-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gray-500)]">{stat.label}</p>
            <p className="font-display font-black text-2xl mt-2">{stat.value}</p>
            <div className={`inline-block mt-2 px-2 py-0.5 border-2 border-black text-[9px] font-bold ${stat.isPositive ? 'bg-[var(--color-green-light)] text-[var(--color-green)]' : 'bg-[var(--color-yellow-light)] text-[var(--color-yellow)]'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 brutal-card overflow-hidden bg-white">
          <div className="p-4 border-b-3 border-black flex justify-between items-center bg-[var(--color-cream-dark)]">
            <h2 className="font-display font-black text-sm">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-[10px] font-bold underline hover:text-[var(--color-orange)]">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-[var(--color-cream)]">
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">ID</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Bike</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  <th className="p-3 text-[10px] font-bold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--color-gray-100)]">
                {recentBookings.map((b, i) => (
                  <tr key={i} className="hover:bg-[var(--color-cream)] transition-colors">
                    <td className="p-3 text-xs font-bold font-mono">{b.id}</td>
                    <td className="p-3 text-xs font-medium">{b.user}</td>
                    <td className="p-3 text-xs text-[var(--color-gray-500)]">{b.bike}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 border-2 border-black text-[9px] font-bold
                        ${b.status === 'Pending' ? 'bg-[var(--color-yellow)] text-black' : 
                          b.status === 'Active' ? 'bg-[var(--color-blue-light)] text-[var(--color-blue)]' : 
                          'bg-[var(--color-green-light)] text-[var(--color-green)]'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs font-bold">{formatCurrency(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Alerts */}
        <div className="space-y-6">
          <div className="brutal-card p-5 bg-[var(--color-orange)] text-white">
            <h2 className="font-display font-black text-sm mb-4">Action Required</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-xs bg-white/10 p-2 border border-white/30">
                <span className="text-[var(--color-yellow)]">⚠️</span>
                <div>
                  <p className="font-bold">5 Partner applications pending</p>
                  <Link href="/admin/partners" className="text-[10px] underline mt-1 block opacity-80 hover:opacity-100">Review now</Link>
                </div>
              </li>
              <li className="flex items-start gap-2 text-xs bg-white/10 p-2 border border-white/30">
                <span className="text-[var(--color-red-light)]">🔧</span>
                <div>
                  <p className="font-bold">2 Bikes need maintenance</p>
                  <Link href="/admin/fleet" className="text-[10px] underline mt-1 block opacity-80 hover:opacity-100">View Fleet</Link>
                </div>
              </li>
            </ul>
          </div>

          <div className="brutal-card p-5 bg-white">
            <h2 className="font-display font-black text-sm mb-4">Today's Pickups</h2>
            <div className="space-y-3">
              {calendarBookings.slice(0,3).map((cb, i) => (
                <div key={i} className="flex gap-3 items-center p-2 border-2 border-dashed border-[var(--color-gray-300)]">
                  <div className="w-8 h-8 bg-[var(--color-cream-dark)] border border-black flex items-center justify-center text-xs">📦</div>
                  <div>
                    <p className="text-xs font-bold">{cb.bikeName}</p>
                    <p className="text-[9px] text-[var(--color-gray-500)]">User: {cb.userId} • 09:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
