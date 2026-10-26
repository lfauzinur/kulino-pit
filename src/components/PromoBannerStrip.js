'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Megaphone } from 'lucide-react';

const orderKey = 'kulino-promo-banner-order-v1';

function shuffledForRefresh(items) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [next[index], next[target]] = [next[target], next[index]];
  }

  try {
    const previous = window.sessionStorage.getItem(orderKey);
    const current = next.map((item) => item.id).join(',');
    if (next.length > 1 && previous === current) next.push(next.shift());
    window.sessionStorage.setItem(orderKey, next.map((item) => item.id).join(','));
  } catch {
    // The random order still works when session storage is unavailable.
  }
  return next;
}

function localized(value, locale) {
  return value?.[locale] || value?.id || value?.en || '';
}

function BannerAction({ href, children }) {
  const className = 'inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-gray-900 shadow-sm transition-transform hover:-translate-y-0.5';
  if (/^https?:\/\//i.test(href)) return <a href={href} target="_blank" rel="noreferrer" className={className}>{children}</a>;
  return <Link href={href || '#'} className={className}>{children}</Link>;
}

export default function PromoBannerStrip({ locale = 'id', compact = false }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/banners', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then((items) => {
        if (active) setBanners(shuffledForRefresh(Array.isArray(items) ? items : []));
      })
      .catch(() => { if (active) setBanners([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (!loading && banners.length === 0) return null;

  if (compact) {
    return (
      <section aria-label={locale === 'id' ? 'Program dan promo' : 'Programs and promotions'}>
        <div className="mb-3.5 flex items-end justify-between px-1">
          <div>
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">{locale === 'id' ? 'PILIHAN HARI INI' : 'TODAY\'S PICKS'}</p>
            <h2 className="font-display text-lg font-black text-gray-900">{locale === 'id' ? 'Program & Promo Terbaru' : 'Latest Programs & Promos'}</h2>
          </div>
          <Megaphone size={19} className="text-[var(--color-primary)]" />
        </div>
        <div className="scrollbar-hide -mx-4 flex snap-x gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {loading && [1, 2, 3].map((item) => <div key={item} className="h-[180px] w-[285px] shrink-0 animate-pulse rounded-[24px] bg-gray-200" />)}
          {banners.map((banner) => <BannerCard key={banner.id} banner={banner} locale={locale} compact />)}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-20" aria-label={locale === 'id' ? 'Program dan promo Kulino Pit' : 'Kulino Pit programs and promotions'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[var(--color-primary)]">{locale === 'id' ? 'PROGRAM & PROMO KULINO PIT' : 'KULINO PIT PROGRAMS & PROMOS'}</p>
            <h2 className="font-display text-3xl font-black leading-tight text-gray-900 sm:text-5xl">{locale === 'id' ? 'Temukan agenda gowes terbaikmu.' : 'Find your best cycling experience.'}</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-500 sm:text-base">{locale === 'id' ? 'Promo, program komunitas, dan penawaran terbaru dapat diakses langsung dari halaman utama.' : 'Promotions, community programs, and the latest offers are available right from the home page.'}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          {loading && ['lg:col-span-4', 'lg:col-span-5', 'lg:col-span-3'].map((span, index) => <div key={index} className={`h-[310px] animate-pulse rounded-[32px] bg-gray-200 ${span}`} />)}
          {banners.map((banner, index) => <BannerCard key={banner.id} banner={banner} locale={locale} index={index} />)}
        </div>
      </div>
    </section>
  );
}

function BannerCard({ banner, locale, compact = false, index = 0 }) {
  const spanClass = ['lg:col-span-4', 'lg:col-span-5', 'lg:col-span-3'][index % 3];
  const title = localized(banner.title, locale);
  const description = localized(banner.description, locale);
  const badge = localized(banner.badge, locale);
  const cta = localized(banner.ctaLabel, locale);

  return (
    <article
      className={`relative isolate shrink-0 snap-center overflow-hidden border border-black/5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ${compact ? 'h-[180px] w-[285px] rounded-[24px] p-5' : `min-h-[310px] rounded-[32px] p-7 sm:p-8 ${spanClass}`}`}
      style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
    >
      <div className={`relative z-10 flex h-full flex-col ${banner.imageUrl ? (compact ? 'max-w-[64%]' : 'max-w-[60%]') : 'max-w-full'} ${compact ? 'justify-between' : 'justify-start'}`}>
        <div>
          <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} mb-3 font-black uppercase tracking-[0.2em] opacity-75`}>{badge || (banner.kind === 'program' ? 'PROGRAM' : 'PROMO')}</p>
          <h3 className={`font-display font-black leading-[1.08] ${compact ? 'text-xl' : 'text-3xl sm:text-[2.15rem]'}`}>{title}</h3>
          {description && <p className={`mt-3 font-semibold leading-relaxed opacity-80 ${compact ? 'line-clamp-2 text-[10px]' : 'text-sm'}`}>{description}</p>}
        </div>
        {cta && <div className={compact ? '' : 'mt-6'}><BannerAction href={banner.ctaUrl}>{cta}<ArrowRight size={13} /></BannerAction></div>}
      </div>
      {banner.imageUrl && (
        <div className={`pointer-events-none absolute bottom-0 right-0 z-0 ${compact ? 'h-[76%] w-[42%]' : 'h-[69%] w-[49%]'}`}>
          <Image src={banner.imageUrl} alt="" fill unoptimized sizes={compact ? '140px' : '(max-width: 1024px) 50vw, 360px'} className="object-contain object-right-bottom drop-shadow-2xl" />
        </div>
      )}
      <div className="pointer-events-none absolute -bottom-16 -right-14 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
    </article>
  );
}
