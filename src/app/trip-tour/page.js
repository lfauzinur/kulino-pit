'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { tours, formatCurrency } from '@/lib/data';

export default function TripTourPage() {
  const { t, locale } = useI18n();

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label justify-center before:hidden">{t('tours.title')}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black">{t('tours.subtitle')}</h1>
        </div>

        <div className="grid gap-8">
          {tours.map((tour, i) => (
            <article key={tour.id} className={`brutal-card overflow-hidden !shadow-[var(--shadow-brutal-lg)] grid lg:grid-cols-2 ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className="relative aspect-video lg:aspect-auto bg-[var(--color-cream-dark)] border-b-3 lg:border-b-0 lg:border-r-3 border-black overflow-hidden group">
                <Image src={tour.image} alt={tour.name[locale]} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2 flex-wrap">
                    <span className="brutal-badge !bg-white/90 text-[var(--color-black)] text-[8px]">⏱ {tour.duration}</span>
                    <span className="brutal-badge !bg-white/90 text-[var(--color-black)] text-[8px]">📏 {tour.distance}</span>
                    <span className="brutal-badge !bg-[var(--color-orange)] text-white text-[8px]">💪 {tour.difficulty[locale]}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8 flex flex-col" style={{ direction: 'ltr' }}>
                <h2 className="font-display font-black text-2xl">{tour.name[locale]}</h2>
                <p className="mt-3 text-sm text-[var(--color-gray-500)] leading-7">{tour.description[locale]}</p>

                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-orange)] mb-3">{t('tours.includes')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tour.includes[locale].map((item, j) => (
                      <div key={j} className="flex items-center gap-2 bg-[var(--color-green-light)] border border-[var(--color-green)]/20 p-2">
                        <span className="text-[var(--color-green)] text-sm font-bold">✓</span>
                        <span className="text-[10px] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between border-t-2 border-dashed border-[var(--color-gray-300)] mt-6 gap-4">
                  <div>
                    <p className="text-[10px] text-[var(--color-gray-500)] uppercase font-bold">{locale === 'id' ? 'Mulai dari' : 'Starting from'}</p>
                    <p className="font-display font-black text-2xl text-[var(--color-orange)]">{formatCurrency(tour.price)}</p>
                    <p className="text-[9px] text-[var(--color-gray-500)]">/{locale === 'id' ? 'orang' : 'person'}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link href={`/trip-tour/${tour.slug}`} className="brutal-btn bg-white border-2 border-black hover:bg-gray-50 text-black px-6 py-3 text-xs w-full sm:w-auto text-center">
                      {locale === 'id' ? 'Detail Tour' : 'Tour Detail'}
                    </Link>
                    <Link href="/booking" className="brutal-btn brutal-btn-primary px-6 py-3 text-xs w-full sm:w-auto text-center">
                      {t('tours.bookTour')} →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
