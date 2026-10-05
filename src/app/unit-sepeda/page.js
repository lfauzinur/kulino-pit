'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { bikes, formatCurrency } from '@/lib/data';

export default function UnitSepedaPage() {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', 'roadbike', 'mtb', 'folding', 'ebike'];
  const filtered = activeCategory === 'all' ? bikes : bikes.filter(b => b.category === activeCategory);

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-label justify-center before:hidden">{t('bikes.title')}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black tracking-tight">{t('bikes.subtitle')}</h1>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`brutal-btn px-5 py-2.5 text-xs ${activeCategory === cat ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              {t(`bikes.categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* Bike Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(bike => (
            <article key={bike.id} className="brutal-card overflow-hidden">
              <div className="relative aspect-square bg-[var(--color-cream-dark)] border-b-3 border-black overflow-hidden group">
                <Image src={bike.image} alt={bike.name} fill className="object-contain p-6 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute top-3 left-3 brutal-badge bg-[var(--color-orange)] text-white text-[8px]">
                  {t(`bikes.categories.${bike.category}`)}
                </span>
                <span className={`absolute top-3 right-3 brutal-badge text-[8px] ${bike.available ? 'bg-[var(--color-green-light)] text-[var(--color-green)]' : 'bg-[var(--color-red-light)] text-[var(--color-red)]'}`}>
                  ● {bike.available ? t('bikes.available') : t('bikes.booked')}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-black text-base">{bike.name}</h3>
                <p className="text-xs text-[var(--color-gray-500)] mt-1">{bike.description[locale]}</p>

                {/* Specs */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(bike.specs).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="bg-[var(--color-cream)] border border-[var(--color-gray-300)] p-2">
                      <p className="text-[8px] uppercase font-bold text-[var(--color-gray-500)] tracking-wider">{key}</p>
                      <p className="text-[10px] font-bold mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>

                {/* Frame Sizes */}
                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase text-[var(--color-gray-500)] mb-1">{t('bikes.frame')}</p>
                  <div className="flex gap-1">
                    {bike.frameSize.map(size => (
                      <span key={size} className="w-8 h-8 border-2 border-black flex items-center justify-center text-[10px] font-bold bg-white hover:bg-[var(--color-orange)] hover:text-white transition-colors cursor-pointer">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-4 flex items-end justify-between border-t-2 border-dashed border-[var(--color-gray-300)] pt-4">
                  <div>
                    <p className="font-display font-black text-xl text-[var(--color-orange)]">{formatCurrency(bike.pricePerDay)}</p>
                    <p className="text-[9px] text-[var(--color-gray-500)]">{t('bikes.perDay')} | {formatCurrency(bike.pricePerHour)} {t('bikes.perHour')}</p>
                  </div>
                  <Link
                    href={bike.available ? '/booking' : '#'}
                    className={`brutal-btn px-4 py-2.5 text-[10px] ${bike.available ? 'brutal-btn-primary' : 'brutal-btn-secondary opacity-50 cursor-not-allowed'}`}
                  >
                    {t('bikes.checkAvail')}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
