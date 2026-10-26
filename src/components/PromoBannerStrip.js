'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

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

function CarouselControls({ locale, onPrevious, onNext, compact = false }) {
  const buttonClassName = `inline-flex items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 ${compact ? 'h-9 w-9' : 'h-11 w-11'}`;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="hidden text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 sm:inline">
        {locale === 'id' ? 'Geser' : 'Slide'}
      </span>
      <button type="button" onClick={onPrevious} className={buttonClassName} aria-label={locale === 'id' ? 'Banner sebelumnya' : 'Previous banner'}>
        <ChevronLeft size={compact ? 17 : 20} aria-hidden="true" />
      </button>
      <button type="button" onClick={onNext} className={buttonClassName} aria-label={locale === 'id' ? 'Banner berikutnya' : 'Next banner'}>
        <ChevronRight size={compact ? 17 : 20} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function PromoBannerStrip({ locale = 'id', compact = false }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const suppressClickRef = useRef(false);

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

  const scrollCarousel = (direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.querySelector('[data-promo-card]');
    const gap = Number.parseFloat(window.getComputedStyle(carousel).columnGap) || 16;
    const distance = (card?.getBoundingClientRect().width || carousel.clientWidth * 0.82) + gap;
    carousel.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    const carousel = carouselRef.current;
    if (!carousel) return;
    dragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: carousel.scrollLeft,
      moved: false,
    };
    carousel.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    const carousel = carouselRef.current;
    if (!drag.active || !carousel) return;
    const delta = event.clientX - drag.startX;
    if (Math.abs(delta) > 5) drag.moved = true;
    carousel.scrollLeft = drag.scrollLeft - delta;
  };

  const finishDrag = (event) => {
    const drag = dragRef.current;
    const carousel = carouselRef.current;
    if (!drag.active) return;
    drag.active = false;
    suppressClickRef.current = drag.moved;
    carousel?.releasePointerCapture?.(event.pointerId);
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
  };

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const carouselEvents = {
    ref: carouselRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
    onClickCapture: handleClickCapture,
    onDragStart: (event) => event.preventDefault(),
  };

  if (!loading && banners.length === 0) return null;

  if (compact) {
    return (
      <section aria-label={locale === 'id' ? 'Program dan promo' : 'Programs and promotions'}>
        <div className="mb-3.5 flex items-end justify-between px-1">
          <div>
            <p className="mb-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)]">{locale === 'id' ? 'PILIHAN HARI INI' : 'TODAY\'S PICKS'}</p>
            <h2 className="font-display text-lg font-black text-gray-900">{locale === 'id' ? 'Program & Promo Terbaru' : 'Latest Programs & Promos'}</h2>
          </div>
          <CarouselControls locale={locale} compact onPrevious={() => scrollCarousel(-1)} onNext={() => scrollCarousel(1)} />
        </div>
        <div
          {...carouselEvents}
          className="scrollbar-hide -mx-4 flex cursor-grab snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain px-4 pb-2 scroll-smooth active:cursor-grabbing sm:mx-0 sm:px-0"
        >
          {loading && [1, 2, 3].map((item) => <div key={item} className="h-[190px] basis-[82vw] shrink-0 animate-pulse snap-center rounded-[24px] bg-gray-200 sm:basis-[310px]" />)}
          {banners.map((banner) => <BannerCard key={banner.id} banner={banner} locale={locale} compact />)}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16 sm:py-20" aria-label={locale === 'id' ? 'Program dan promo Kulino Pit' : 'Kulino Pit programs and promotions'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_0.75fr] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-[var(--color-primary)]">{locale === 'id' ? 'PROGRAM & PROMO KULINO PIT' : 'KULINO PIT PROGRAMS & PROMOS'}</p>
            <h2 className="font-display text-3xl font-black leading-tight text-gray-900 sm:text-5xl">{locale === 'id' ? 'Temukan agenda gowes terbaikmu.' : 'Find your best cycling experience.'}</h2>
          </div>
          <div className="flex items-end justify-between gap-4 lg:block">
            <p className="max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">{locale === 'id' ? 'Promo, program komunitas, dan penawaran terbaru dapat diakses langsung dari halaman utama.' : 'Promotions, community programs, and the latest offers are available right from the home page.'}</p>
            <div className="lg:mt-5 lg:flex lg:justify-end">
              <CarouselControls locale={locale} onPrevious={() => scrollCarousel(-1)} onNext={() => scrollCarousel(1)} />
            </div>
          </div>
        </div>
        <div
          {...carouselEvents}
          className="scrollbar-hide -mx-4 flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-5 scroll-smooth active:cursor-grabbing sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:px-0"
        >
          {loading && [1, 2, 3].map((item) => <div key={item} className="min-h-[400px] basis-[86%] shrink-0 animate-pulse snap-center rounded-[32px] bg-gray-200 sm:basis-[68%] md:basis-[48%] xl:basis-[40%]" />)}
          {banners.map((banner) => <BannerCard key={banner.id} banner={banner} locale={locale} />)}
        </div>
      </div>
    </section>
  );
}

function BannerCard({ banner, locale, compact = false }) {
  const title = localized(banner.title, locale);
  const description = localized(banner.description, locale);
  const badge = localized(banner.badge, locale);
  const cta = localized(banner.ctaLabel, locale);

  return (
    <article
      data-promo-card
      className={`relative isolate shrink-0 snap-center select-none overflow-hidden border border-black/5 shadow-[0_16px_50px_rgba(15,23,42,0.08)] ${compact ? 'h-[190px] basis-[82vw] rounded-[24px] p-5 sm:basis-[310px]' : 'min-h-[400px] basis-[86%] rounded-[28px] p-6 sm:basis-[68%] sm:rounded-[32px] sm:p-8 md:basis-[48%] xl:basis-[40%]'}`}
      style={{ backgroundColor: banner.backgroundColor, color: banner.textColor }}
    >
      <div className={`relative z-10 flex h-full flex-col ${banner.imageUrl ? (compact ? 'max-w-[64%]' : 'max-w-[88%] sm:max-w-[64%]') : 'max-w-full'} ${compact ? 'justify-between' : 'justify-start'}`}>
        <div>
          <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} mb-3 font-black uppercase tracking-[0.2em] opacity-75`}>{badge || (banner.kind === 'program' ? 'PROGRAM' : 'PROMO')}</p>
          <h3 className={`font-display font-black leading-[1.08] ${compact ? 'text-xl' : 'text-2xl sm:text-3xl xl:text-[2rem]'}`}>{title}</h3>
          {description && <p className={`mt-3 font-semibold leading-relaxed opacity-80 ${compact ? 'line-clamp-2 text-[10px]' : 'text-sm'}`}>{description}</p>}
        </div>
        {cta && <div className={compact ? '' : 'mt-6'}><BannerAction href={banner.ctaUrl}>{cta}<ArrowRight size={13} /></BannerAction></div>}
      </div>
      {banner.imageUrl && (
        <div className={`pointer-events-none absolute bottom-0 right-0 z-0 ${compact ? 'h-[76%] w-[42%]' : 'h-[45%] w-[72%] sm:h-[60%] sm:w-[56%]'}`}>
          <Image src={banner.imageUrl} alt="" fill unoptimized sizes={compact ? '140px' : '(max-width: 640px) 72vw, (max-width: 1280px) 34vw, 300px'} className="object-contain object-right-bottom drop-shadow-2xl" />
        </div>
      )}
      <div className="pointer-events-none absolute -bottom-16 -right-14 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
    </article>
  );
}
