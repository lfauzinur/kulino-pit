'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Camera, Truck, Users, Flag, ShieldCheck, Mic, Wrench, HeartPulse, Siren } from 'lucide-react';

export default function LayananPage() {
  const { t, locale } = useI18n();
  const [mainServices, setMainServices] = useState([]);
  const [manpowerRoles, setManpowerRoles] = useState([]);

  useEffect(() => {
    fetch('/api/services', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then(setMainServices)
      .catch(() => setMainServices([]));
    fetch('/api/content-cards?section=manpower_roles', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`)))
      .then(setManpowerRoles)
      .catch(() => setManpowerRoles([]));
  }, []);

  const serviceIcons = { camera: Camera, truck: Truck, users: Users };
  const roleIcons = { flag: Flag, 'shield-check': ShieldCheck, mic: Mic, wrench: Wrench, 'heart-pulse': HeartPulse, siren: Siren, users: Users };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label justify-center before:hidden">{t('services.title')}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black">{t('services.subtitle')}</h1>
        </div>

        {/* Main Services */}
        <div className="grid gap-6 lg:grid-cols-3 mb-16">
          {mainServices.map((svc) => {
            const ServiceIcon = serviceIcons[svc.icon] || Camera;
            return (
            <div key={svc.id} className="brutal-card p-6 flex flex-col">
              <div className="w-16 h-16 border border-gray-200 flex items-center justify-center mb-5 rounded-xl" style={{ backgroundColor: svc.accentColor + '15', color: svc.accentColor }}>
                <ServiceIcon size={28} />
              </div>
              <h2 className="font-display font-black text-lg">{svc.title[locale] || svc.title.id}</h2>
              <p className="mt-2 text-xs text-[var(--color-gray-500)] leading-6">{svc.description[locale] || svc.description.id}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {(svc.features[locale] || svc.features.id).map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 border-2 border-black bg-[var(--color-green-light)] text-[var(--color-green)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--color-gray-300)] flex items-center justify-between">
                <p className="text-sm font-display font-black text-[var(--color-primary)]">{svc.priceLabel}</p>
                <a href="https://wa.me/6281234567890" className="brutal-btn brutal-btn-primary px-4 py-2 text-[9px] !shadow-[var(--shadow-brutal-sm)]">
                  WhatsApp →
                </a>
              </div>
            </div>
          );})}
        </div>

        {/* Manpower Roles */}
        <div className="brutal-card bg-[var(--color-primary-soft)] border-[var(--color-primary)]/20 p-8 sm:p-10 !shadow-[var(--shadow-brutal-lg)]">
          <div className="text-center mb-8">
            <h2 className="font-display font-black text-2xl text-gray-900">{t('services.manpower.title')}</h2>
            <p className="text-sm text-gray-500 mt-2">Tim profesional kami siap mendukung setiap event bersepeda Anda</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manpowerRoles.map((role) => { const RoleIcon = roleIcons[role.icon] || Users; return (
              <div key={role.id} className="bg-white rounded-2xl p-5 border border-[var(--color-primary)]/10 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: role.accentColor + '15', color: role.accentColor }}>
                    <RoleIcon size={22} />
                  </div>
                  <h3 className="font-display font-black text-sm text-gray-900">{role.title[locale] || role.title.id}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-5">{role.description[locale] || role.description.id}</p>
              </div>
            );})}
          </div>
          <div className="text-center mt-8">
            <a href="https://wa.me/6281234567890" className="btn btn-primary px-8 py-4 text-sm inline-flex items-center gap-2 shadow-md">
              {t('services.consultWhatsApp')} 💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
