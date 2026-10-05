'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

export default function Navbar() {
  const { t, locale, toggleLocale } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/', label: t('nav.home') },
    { href: '/unit-sepeda', label: t('nav.bikes') },
    { href: '/layanan', label: t('nav.services') },
    { href: '/trip-tour', label: t('nav.tripTour') },
    { href: '/routes', label: t('nav.routes') },
    { href: '/artikel', label: t('nav.articles') },
    { href: '/tentang', label: t('nav.about') },
  ];

  const isActive = (path) => path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-display font-black text-xl shadow-md">
                  K
                </span>
                <div className="hidden sm:block">
                  <strong className="block font-display text-lg font-black leading-none text-gray-900">Kulino Pit</strong>
                  <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Premium Bike Rental</span>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden xl:flex items-center space-x-1 2xl:space-x-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive(link.href) 
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary-soft)]' 
                      : 'text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions (Lang & Auth) */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              <button 
                onClick={toggleLocale}
                className="whitespace-nowrap flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
              </button>
              
              <Link href="/jadi-mitra" className="whitespace-nowrap px-3 xl:px-4 py-2 text-sm font-semibold text-[var(--color-primary)] bg-transparent hover:bg-[var(--color-primary-soft)] rounded-full transition-colors">
                {t('nav.partner')}
              </Link>
              
              <Link href="/member" className="whitespace-nowrap btn btn-primary px-4 xl:px-6 py-2.5 text-sm">
                {t('nav.memberLogin')}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex xl:hidden items-center gap-2">
              <button onClick={toggleLocale} className="text-xs font-medium border px-2 py-1 rounded-md text-gray-600">
                {locale === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <div className="w-6 h-5 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-current transform transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                  <span className={`w-full h-0.5 bg-current transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
                  <span className={`w-full h-0.5 bg-current transform transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        <div className={`xl:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg transition-all duration-300 ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
          <div className="px-4 pt-2 pb-6 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-medium ${
                  isActive(link.href)
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-3">
              <Link href="/jadi-mitra" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 rounded-xl font-semibold text-[var(--color-primary)] bg-[var(--color-primary-soft)]">
                {t('nav.partner')}
              </Link>
              <Link href="/member" onClick={() => setMobileOpen(false)} className="btn btn-primary w-full py-3">
                {t('nav.memberLogin')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
