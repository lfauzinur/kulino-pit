'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { formatCurrency, getLowestPrice } from '@/lib/data';
import { Flame } from 'lucide-react';

export default function UnitSepedaPage() {
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState('all');
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const categories = ['all', 'roadbike', 'mtb', 'folding', 'ebike', 'city'];

  useEffect(() => {
    fetch('/api/bikes', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => { setBikes(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

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
              {cat === 'all' ? t('bikes.categories.all') : (t(`bikes.categories.${cat}`) || cat)}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="brutal-card overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bike Grid */}
        {!loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(bike => {
              const lowestPrice = getLowestPrice(bike);
              return (
                <article key={bike.id} className="brutal-card overflow-hidden">
                  <div className="relative aspect-square bg-[var(--color-cream-dark)] border-b-3 border-black overflow-hidden group">
                    {bike.image ? (
                      <Image
                        src={bike.image}
                        alt={bike.name}
                        fill
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🚲</div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="brutal-badge bg-[var(--color-orange)] text-white text-[8px]">
                        {t(`bikes.categories.${bike.category}`) || bike.category}
                      </span>
                      {bike.popular && (
                        <span className="brutal-badge bg-amber-400 text-amber-900 text-[8px] flex items-center gap-1 !border-amber-500">
                          <Flame size={10} /> POPULAR
                        </span>
                      )}
                    </div>
                    {/* Unavailable overlay */}
                    {!bike.available && (
                      <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center z-10">
                        <div className="bg-red-600 text-white font-display font-black text-lg px-6 py-2 rounded-full shadow-lg flex items-center gap-2 rotate-[-5deg]">
                          🔒 TERPESAN
                        </div>
                        <p className="text-white text-xs font-semibold mt-3 bg-black/50 px-3 py-1 rounded-full">Tidak tersedia saat ini</p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-black text-base">{bike.name}</h3>
                    <p className="text-xs text-[var(--color-gray-500)] mt-1">{bike.description?.[locale] || bike.description?.id}</p>

                    {/* Specs */}
                    {bike.specs && Object.keys(bike.specs).filter(k => bike.specs[k]).length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(bike.specs).filter(([, val]) => val).slice(0, 4).map(([key, val]) => (
                          <div key={key} className="bg-[var(--color-cream)] border border-[var(--color-gray-300)] p-2">
                            <p className="text-[8px] uppercase font-bold text-[var(--color-gray-500)] tracking-wider">{key}</p>
                            <p className="text-[10px] font-bold mt-0.5">{val}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Frame Sizes */}
                    {bike.frameSize?.length > 0 && (
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
                    )}

                    {/* Pricing & CTA */}
                    <div className="mt-4 flex items-end justify-between border-t-2 border-dashed border-[var(--color-gray-300)] pt-4">
                      <div>
                        <p className="text-[9px] text-[var(--color-gray-500)] mb-0.5">{locale === 'id' ? 'Mulai dari' : 'Starting from'}</p>
                        <p className="font-display font-black text-xl text-[var(--color-orange)]">{formatCurrency(lowestPrice)}</p>
                      </div>
                      <Link
                        href={`/booking?bikeId=${bike.id}`}
                        className={`brutal-btn px-4 py-2.5 text-[10px] ${bike.available ? 'brutal-btn-primary' : 'border border-red-200 bg-red-50 text-red-600'}`}
                      >
                        {bike.available ? t('bikes.checkAvail') : 'Cek Alternatif'}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 font-medium">Tidak ada sepeda di kategori ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
