'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, Clock, Link2, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { footerDefaultItems, footerDefaults } from '@/lib/footer-defaults';

const initialItems = footerDefaultItems.map(([group, id, en, url, icon, sortOrder], index) => ({ id: `default-${index}`, group, label: { id, en }, url, icon, sortOrder, published: true }));
const iconMap = { 'map-pin': MapPin, phone: Phone, clock: Clock, instagram: Camera, 'message-circle': MessageCircle, link: Link2 };

function FooterLink({ href, children, className }) {
  if (!href) return <span className={className}>{children}</span>;
  if (href.startsWith('/')) return <Link href={href} className={className}>{children}</Link>;
  return <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{children}</a>;
}

export default function Footer() {
  const { locale } = useI18n();
  const [data, setData] = useState({ settings: footerDefaults, items: initialItems });
  useEffect(() => {
    let active = true;
    fetch('/api/footer', { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject()).then((value) => { if (active) setData(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const s = data.settings || footerDefaults;
  const label = (value) => value?.[locale] || value?.id || '';
  const grouped = (group) => data.items.filter((item) => item.group === group && item.published !== false);

  return <footer className="border-t border-gray-100 bg-gray-50 pb-8 pt-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {s.showCta !== false && <div className="mb-16 flex flex-col items-center justify-between rounded-3xl bg-[var(--color-primary)] p-8 text-white shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-1 md:flex-row md:p-12">
        <div className="mb-6 max-w-lg md:mb-0"><h2 className="mb-2 font-display text-3xl font-black md:text-4xl">{label(s.ctaTitle)}</h2><p className="text-sm text-white/90 md:text-base">{label(s.ctaDescription)}</p></div>
        <FooterLink href={s.ctaUrl} className="whitespace-nowrap rounded-full bg-white px-8 py-3 font-bold text-[var(--color-primary)] shadow-md transition-colors hover:bg-gray-50">{label(s.ctaButton)}</FooterLink>
      </div>}

      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="group flex items-center gap-3"><div className="relative h-12 w-12 transition-transform group-hover:scale-105"><Image src="/images/logo.png" alt="Kulino Ngepit Logo" fill className="object-contain" /></div><div><strong className="block font-display text-lg font-black leading-none text-gray-900 transition-colors group-hover:text-[var(--color-primary)]">{s.brandName}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.tagline}</span></div></Link>
          <p className="text-sm leading-relaxed text-gray-600">{label(s.description)}</p>
          <div className="flex flex-wrap gap-3 pt-2">{grouped('social').map((item) => <FooterLink key={item.id} href={item.url} className="flex h-10 min-w-10 items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-xs font-bold text-gray-600 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">{item.label.id}</FooterLink>)}</div>
        </div>
        {['navigation', 'help'].map((group) => <div key={group}><h3 className="mb-6 font-display font-bold text-gray-900">{label(s.sectionTitles?.[group])}</h3><ul className="space-y-3">{grouped(group).map((item) => <li key={item.id}><FooterLink href={item.url} className="text-sm text-gray-600 transition-colors hover:text-[var(--color-primary)]">{label(item.label)}</FooterLink></li>)}</ul></div>)}
        <div><h3 className="mb-6 font-display font-bold text-gray-900">{label(s.sectionTitles?.contact)}</h3><ul className="space-y-4">{grouped('contact').map((item) => { const Icon = iconMap[item.icon] || Link2; return <li key={item.id}><FooterLink href={item.url} className="flex items-start gap-3 text-sm text-gray-600 transition-colors hover:text-[var(--color-primary)]"><Icon className="mt-0.5 shrink-0 text-gray-400" size={18} /><span>{label(item.label)}</span></FooterLink></li>; })}</ul></div>
      </div>
      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 md:flex-row"><p className="text-xs font-medium text-gray-500">&copy; {new Date().getFullYear()} {s.copyright}</p><span className="text-xs text-gray-400">{label(s.madeWith)}</span></div>
    </div>
  </footer>;
}
