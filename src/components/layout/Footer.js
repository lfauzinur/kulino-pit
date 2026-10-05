'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-50 pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top CTA Banner */}
        <div className="bg-[var(--color-primary)] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-[var(--shadow-soft)] mb-16 transform transition-transform hover:-translate-y-1">
          <div className="mb-6 md:mb-0 max-w-lg">
            <h2 className="font-display font-black text-3xl md:text-4xl mb-2">{t('footer.ctaTitle')}</h2>
            <p className="text-white/90 text-sm md:text-base">{t('footer.ctaDesc')}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/unit-sepeda" className="bg-white text-[var(--color-primary)] px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-50 transition-colors whitespace-nowrap">
              {t('footer.ctaBtn')}
            </Link>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-display font-black text-xl">
                K
              </span>
              <div>
                <strong className="block font-display text-lg font-black leading-none text-gray-900">Kulino Pit</strong>
                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">By Kulino House</span>
              </div>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors font-bold text-xs">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors font-bold text-xs">
                WA
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-6">{t('footer.navTitle')}</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.home')}</Link></li>
              <li><Link href="/unit-sepeda" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.bikes')}</Link></li>
              <li><Link href="/layanan" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.services')}</Link></li>
              <li><Link href="/trip-tour" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.tripTour')}</Link></li>
              <li><Link href="/routes" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.routes')}</Link></li>
              <li><Link href="/artikel" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('nav.articles')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-6">{t('footer.helpTitle')}</h3>
            <ul className="space-y-3">
              <li><Link href="/tentang" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('footer.links.about')}</Link></li>
              <li><Link href="/lokasi" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('footer.links.location')}</Link></li>
              <li><Link href="/syarat-ketentuan" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('footer.links.terms')}</Link></li>
              <li><Link href="/kebijakan-privasi" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('footer.links.privacy')}</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">{t('footer.links.faq')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-gray-900 mb-6">{t('footer.contactTitle')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="mt-0.5 text-gray-400 shrink-0" size={18} />
                <span>Jl Kapten Waroka No 08 Tukangkayu Banyuwangi, Jawa Timur</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="text-gray-400 shrink-0" size={18} />
                <span>0811-3000-000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="text-gray-400 shrink-0" size={18} />
                <span>{t('footer.openHours')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} Kulino Pit by Kulino House. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-400">{t('footer.madeWith')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
