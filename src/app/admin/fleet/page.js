'use client';
import { useState } from 'react';
import { bikes as initialBikes, formatCurrency } from '@/lib/data';
import Image from 'next/image';

export default function AdminFleetPage() {
  const [fleet, setFleet] = useState(initialBikes);

  const toggleAvailability = (id) => {
    setFleet(prev => prev.map(b => b.id === id ? { ...b, available: !b.available } : b));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl">Fleet Management</h1>
          <p className="text-sm text-[var(--color-gray-500)] mt-1">Manage bikes, availability, and pricing.</p>
        </div>
        <button className="brutal-btn brutal-btn-primary px-4 py-2 text-xs">+ Add New Bike</button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fleet.map(bike => (
          <div key={bike.id} className="brutal-card overflow-hidden bg-white flex flex-col">
            <div className="relative aspect-video bg-[var(--color-cream-dark)] border-b-3 border-black p-4">
              <Image src={bike.image} alt={bike.name} fill className="object-contain p-2" />
              <div className="absolute top-2 right-2 flex gap-1">
                <span className={`px-2 py-1 border-2 border-black text-[8px] font-bold ${bike.available ? 'bg-[var(--color-green-light)] text-[var(--color-green)]' : 'bg-[var(--color-red-light)] text-[var(--color-red)]'}`}>
                  {bike.available ? 'Available' : 'Rented'}
                </span>
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--color-orange)]">{bike.category}</span>
                  <h3 className="font-display font-black text-sm">{bike.name}</h3>
                </div>
                <button className="p-1.5 border-2 border-transparent hover:border-black transition-colors" title="Edit Bike">
                  ✏️
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                <div className="bg-[var(--color-cream)] border border-black/10 p-2 text-center">
                  <p className="text-[8px] font-bold text-[var(--color-gray-500)]">Per Day</p>
                  <p className="text-[10px] font-bold">{formatCurrency(bike.pricePerDay)}</p>
                </div>
                <div className="bg-[var(--color-cream)] border border-black/10 p-2 text-center">
                  <p className="text-[8px] font-bold text-[var(--color-gray-500)]">Per Hour</p>
                  <p className="text-[10px] font-bold">{formatCurrency(bike.pricePerHour)}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t-2 border-dashed border-[var(--color-gray-300)] flex justify-between items-center">
                <p className="text-[9px] text-[var(--color-gray-500)] font-bold">Sizes: {bike.frameSize.join(', ')}</p>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvailability(bike.id)} className={`text-[10px] font-bold underline ${bike.available ? 'text-[var(--color-red)]' : 'text-[var(--color-green)]'}`}>
                    {bike.available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
