'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Building2, Phone, Calendar, Camera, CheckCircle, ChevronLeft, Leaf, Star, Users, Bike } from 'lucide-react';

const benefitIcons = { users: Users, camera: Camera, award: Award, leaf: Leaf };

function whatsappUrl(pkg, fallbackMessage) {
  const number = String(pkg?.whatsappNumber || '').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(pkg?.whatsappMessage || fallbackMessage)}`;
}

export default function CorporateBookingPage() {
  const [benefits, setBenefits] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([
      fetch('/api/content-cards?section=corporate_benefits', { cache: 'no-store' }).then((response) => response.ok ? response.json() : []),
      fetch('/api/rental-packages?type=corporate', { cache: 'no-store' }).then((response) => response.ok ? response.json() : []),
    ]).then(([nextBenefits, nextPackages]) => {
      setBenefits(nextBenefits);
      setPackages(nextPackages);
    }).catch(() => {
      setBenefits([]);
      setPackages([]);
    }).finally(() => setLoading(false));
  }, []);
  const contactPackage = packages.find((item) => item.popular) || packages[0];
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-semibold text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Building2 size={14} /> Corporate / Group Rent
          </div>
          <h1 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">
            Sewa Grup & Corporate 🏢
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Solusi sewa sepeda massal untuk team building, event perusahaan, atau gathering komunitas besar.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {benefits.map((b) => { const Icon = benefitIcons[b.icon] || Users; return (
            <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 text-center shadow-sm">
              <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl" style={{ backgroundColor: `${b.accentColor}18`, color: b.accentColor }}><Icon size={24} /></span>
              <h3 className="font-bold text-sm text-gray-900 mb-1">{b.title.id}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{b.description.id}</p>
            </div>
          );})}
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {loading && <div className="md:col-span-3 rounded-3xl border bg-white p-10 text-center text-sm text-gray-500">Memuat paket…</div>}
          {!loading && packages.length === 0 && <div className="md:col-span-3 rounded-3xl border border-dashed bg-white p-10 text-center text-sm text-gray-500">Belum ada paket Corporate yang ditayangkan.</div>}
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white rounded-3xl p-6 shadow-sm border flex flex-col relative ${pkg.popular ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100'}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Star size={10} fill="white" /> Paling Dicimati
                </div>
              )}
              <h3 className="font-display font-black text-xl text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-xs text-gray-400 mb-1"><Users size={11} className="inline mr-1" />{pkg.persons}</p>
              <p className="text-xs text-gray-400 mb-1"><Bike size={11} className="inline mr-1" />{pkg.bikes}</p>
              <p className="text-xs text-gray-400 mb-4">⏱️ {pkg.duration}</p>

              <p className="font-display font-black text-xl text-[var(--color-primary)] mb-4">{pkg.price}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <a
                href={whatsappUrl(pkg, `Halo Kulino Pit! Kami tertarik dengan paket Corporate Rent: ${pkg.name} untuk perusahaan kami. Bisa minta penawaran harga?`)}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn w-full py-3 text-center flex items-center justify-center gap-2 ${pkg.popular ? 'btn-primary' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Phone size={15} /> {pkg.whatsappLabel || 'Minta Penawaran'}
              </a>
            </div>
          ))}
        </div>

        {/* Process */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <h2 className="font-display font-black text-2xl text-gray-900 mb-6 text-center">Cara Pemesanan Corporate</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Konsultasi', desc: 'Hubungi kami via WhatsApp untuk konsultasi kebutuhan' },
              { num: '02', title: 'Survey Lokasi', desc: 'Tim kami survei venue dan rute yang sesuai' },
              { num: '03', title: 'Penawaran', desc: 'Kami kirimkan quotation detail dalam 24 jam' },
              { num: '04', title: 'Eksekusi', desc: 'Hari H, tim kami siap dengan semua perlengkapan' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <span className="text-4xl font-display font-black text-blue-100 block mb-2">{step.num}</span>
                <h3 className="font-bold text-sm text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[var(--color-primary)] rounded-3xl p-8 text-white text-center">
          <Calendar size={32} className="mx-auto mb-4 opacity-80" />
          <h2 className="font-display font-black text-2xl mb-2">Siap Rencanakan Event Anda?</h2>
          <p className="text-blue-100 mb-6 text-sm">Hubungi kami sekarang dan dapatkan penawaran terbaik untuk tim Anda.</p>
          <a
            href={whatsappUrl(contactPackage, 'Halo Kulino Pit! Kami ingin konsultasi paket Corporate Rent untuk perusahaan kami.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold px-8 py-3 rounded-2xl hover:bg-blue-50 transition-colors"
          >
            <Phone size={16} /> Hubungi Kami Sekarang
          </a>
        </div>

      </div>
    </div>
  );
}
