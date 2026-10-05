'use client';
import { useI18n } from '@/lib/i18n';
import Link from 'next/link';
import { Camera, Truck, Users, Flag, ShieldCheck, Mic, Wrench, HeartPulse, Siren } from 'lucide-react';

export default function LayananPage() {
  const { t, locale } = useI18n();

  const mainServices = [
    {
      icon: <Camera size={28} />, title: t('services.documentation.title'), desc: t('services.documentation.desc'),
      features: t('services.documentation.features'),
      price: t('services.documentation.price'),
      color: '#3B82F6',
    },
    {
      icon: <Truck size={28} />, title: t('services.trucking.title'), desc: t('services.trucking.desc'),
      features: t('services.trucking.features'),
      price: t('services.trucking.price'),
      color: '#F59E0B',
    },
    {
      icon: <Users size={28} />, title: t('services.manpower.title'), desc: t('services.manpower.desc'),
      features: t('services.manpower.features'),
      price: t('services.manpower.price'),
      color: '#10B981',
    },
  ];

  const manpowerRoles = [
    { role: t('services.items.roadCaptain.name'), icon: <Flag size={22} />, desc: t('services.items.roadCaptain.desc'), color: '#F59E0B' },
    { role: t('services.items.marshal.name'), icon: <ShieldCheck size={22} />, desc: t('services.items.marshal.desc'), color: '#EF4444' },
    { role: t('services.items.mc.name'), icon: <Mic size={22} />, desc: t('services.items.mc.desc'), color: '#8B5CF6' },
    { role: t('services.items.mechanic.name'), icon: <Wrench size={22} />, desc: t('services.items.mechanic.desc'), color: '#3B82F6' },
    { role: t('services.items.medic.name'), icon: <HeartPulse size={22} />, desc: t('services.items.medic.desc'), color: '#10B981' },
    { role: t('services.items.escort.name'), icon: <Siren size={22} />, desc: t('services.items.escort.desc'), color: '#06B6D4' },
  ];

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="section-label justify-center before:hidden">{t('services.title')}</span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black">{t('services.subtitle')}</h1>
        </div>

        {/* Main Services */}
        <div className="grid gap-6 lg:grid-cols-3 mb-16">
          {mainServices.map((svc, i) => (
            <div key={i} className="brutal-card p-6 flex flex-col">
              <div className="w-16 h-16 border-3 border-black flex items-center justify-center mb-5 rounded-xl" style={{ backgroundColor: svc.color + '15', color: svc.color }}>
                {svc.icon}
              </div>
              <h2 className="font-display font-black text-lg">{svc.title}</h2>
              <p className="mt-2 text-xs text-[var(--color-gray-500)] leading-6">{svc.desc}</p>
              <ul className="mt-4 space-y-2 flex-1">
                {svc.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <span className="w-5 h-5 border-2 border-black bg-[var(--color-green-light)] text-[var(--color-green)] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t-2 border-dashed border-[var(--color-gray-300)] flex items-center justify-between">
                <p className="text-sm font-display font-black text-[var(--color-orange)]">{svc.price}</p>
                <a href="https://wa.me/6281234567890" className="brutal-btn brutal-btn-primary px-4 py-2 text-[9px] !shadow-[var(--shadow-brutal-sm)]">
                  WhatsApp →
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Manpower Roles */}
        <div className="brutal-card !bg-[var(--color-black)] text-white p-8 sm:p-10 !shadow-[var(--shadow-brutal-lg)]">
          <h2 className="font-display font-black text-2xl mb-8 text-center">{t('services.manpower.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manpowerRoles.map((role, i) => (
              <div key={i} className="border-2 border-[var(--color-gray-700)] p-5 rounded-xl hover:border-[var(--color-orange)] transition-colors group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: role.color + '20', color: role.color }}>
                    {role.icon}
                  </div>
                  <h3 className="font-display font-black text-sm group-hover:text-[var(--color-orange)] transition-colors">{role.role}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-5">{role.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="https://wa.me/6281234567890" className="brutal-btn brutal-btn-primary px-8 py-4 text-sm">
              {t('services.consultWhatsApp')} 💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
