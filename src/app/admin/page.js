'use client';
import { useState, useEffect } from 'react';
import { formatCurrency, bikes, calendarBookings } from '@/lib/data';
import Link from 'next/link';
import { Activity, MapPin, AlertCircle, Wrench, ChevronRight } from 'lucide-react';

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

  // Dummy active riders for the map
  const activeRiders = [
    { id: 'User 89', bike: 'Polygon Helios C8', lat: -8.2192, lng: 114.3692, speed: 18.5 },
    { id: 'User 23', bike: 'Polygon Siskiu T8', lat: -8.2115, lng: 114.3750, speed: 22.1 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, here is what is happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
            Generate Report
          </button>
          <Link href="/admin/bookings" className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-dark)] hover:shadow-lg transition-all">
            + New Booking
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{stat.label}</p>
              <p className="font-display font-black text-2xl text-gray-900">{stat.value}</p>
            </div>
            <div className={`mt-4 inline-flex w-max items-center px-2.5 py-1 rounded-lg text-[10px] font-bold ${stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Live GPS Tracker */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h2 className="font-display font-black text-lg text-gray-900">Active Riders GPS Tracking</h2>
              </div>
              <span className="text-xs font-semibold text-gray-500">{activeRiders.length} riders on route</span>
            </div>
            <div className="p-1 bg-gray-100">
              <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-gray-200">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=114.35,-8.24,114.39,-8.20&layer=mapnik&marker=${activeRiders[0].lat},${activeRiders[0].lng}`}
                  className="grayscale-[0.3] contrast-125 opacity-90"
                ></iframe>
                
                {/* Floating Tracker Info */}
                <div className="absolute top-4 left-4 right-4 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {activeRiders.map((rider, i) => (
                    <div key={i} className="bg-white/95 backdrop-blur shadow-lg rounded-xl p-3 min-w-[200px] border border-gray-100 flex items-center gap-3 animate-fade-in">
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Activity size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{rider.id}</p>
                        <p className="text-[10px] text-gray-500">{rider.bike}</p>
                        <p className="text-[10px] font-semibold text-[var(--color-primary)] mt-0.5">{rider.speed} km/h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-display font-black text-lg text-gray-900">Recent Bookings</h2>
              <Link href="/admin/bookings" className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">ID</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Customer</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Bike</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentBookings.map((b, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 text-xs font-semibold text-gray-600">{b.id}</td>
                      <td className="p-4 text-sm font-bold text-gray-900">{b.user}</td>
                      <td className="p-4 text-xs text-gray-500">{b.bike}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold
                          ${b.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                            b.status === 'Active' ? 'bg-blue-50 text-blue-600' : 
                            'bg-green-50 text-green-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">{formatCurrency(b.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border border-red-100">
            <h2 className="font-display font-black text-lg text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> Action Required
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-red-100/50">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">5 Partner Applications</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pending review and approval.</p>
                  <Link href="/admin/partners" className="text-[11px] font-bold text-[var(--color-primary)] mt-2 inline-block hover:underline">Review Now →</Link>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white p-4 rounded-2xl shadow-sm border border-red-100/50">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Wrench size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">2 Bikes Maintenance</p>
                  <p className="text-xs text-gray-500 mt-0.5">Scheduled for routine check.</p>
                  <Link href="/admin/fleet" className="text-[11px] font-bold text-[var(--color-primary)] mt-2 inline-block hover:underline">View Fleet →</Link>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-display font-black text-lg text-gray-900 mb-4">Today's Pickups</h2>
            <div className="space-y-3">
              {calendarBookings.slice(0,3).map((cb, i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                    📦
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{cb.bikeName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      User: {cb.userId} <span className="w-1 h-1 rounded-full bg-gray-300"></span> 09:00 AM
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
              View Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
