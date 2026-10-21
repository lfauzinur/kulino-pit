'use client';
import Link from 'next/link';
import { Users, Phone, Calendar, CheckCircle, ChevronLeft, Star } from 'lucide-react';

const packages = [
  {
    id: 'family-basic',
    name: 'Family Basic',
    persons: '2–4 orang',
    bikes: '2–4 sepeda city/folding',
    duration: '½ hari (4 jam)',
    price: 'Mulai Rp 180.000',
    features: ['Helm untuk semua peserta', 'Panduan rute rekomendasi', 'Lokasi pengambilan: Kulino House', 'Cocok untuk area kota'],
    popular: false,
  },
  {
    id: 'family-plus',
    name: 'Family Plus',
    persons: '2–6 orang',
    bikes: '2–6 sepeda pilihan',
    duration: 'Sehari penuh (8 jam)',
    price: 'Mulai Rp 350.000',
    features: ['Helm & lampu untuk semua', 'Road Captain pendamping', 'Snack & air mineral', 'Dokumentasi foto keluarga', 'Rute wisata Banyuwangi'],
    popular: true,
  },
  {
    id: 'family-premium',
    name: 'Family Premium',
    persons: '4–10 orang',
    bikes: '4–10 sepeda premium',
    duration: '2 hari',
    price: 'Mulai Rp 800.000',
    features: ['Semua fasilitas Family Plus', 'Pengiriman ke lokasi hotel', 'Tim mekanik standby', 'Asuransi perjalanan', 'Jersey keluarga eksklusif'],
    popular: false,
  },
];

export default function FamilyBookingPage() {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-semibold text-sm mb-8 transition-colors">
          <ChevronLeft size={16} /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Users size={14} /> Family Rent
          </div>
          <h1 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">
            Paket Sewa Keluarga 🚲
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Nikmati petualangan bersepeda bersama keluarga. Pilih paket yang sesuai dengan kebutuhan Anda.
          </p>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white rounded-3xl p-6 shadow-sm border flex flex-col relative ${pkg.popular ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100'}`}>
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Star size={10} fill="white" /> Paling Populer
                </div>
              )}
              <h3 className="font-display font-black text-xl text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-xs text-gray-400 mb-1">👥 {pkg.persons}</p>
              <p className="text-xs text-gray-400 mb-1">🚲 {pkg.bikes}</p>
              <p className="text-xs text-gray-400 mb-4">⏱️ {pkg.duration}</p>

              <p className="font-display font-black text-2xl text-[var(--color-primary)] mb-4">{pkg.price}</p>

              <ul className="space-y-2 mb-6 flex-1">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo Kulino Pit! Saya tertarik dengan paket Family Rent: ${pkg.name}. Bisa info lebih lanjut?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn w-full py-3 text-center flex items-center justify-center gap-2 ${pkg.popular ? 'btn-primary' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Phone size={15} /> Pesan via WhatsApp
              </a>
            </div>
          ))}
        </div>

        {/* CTA Box */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <Calendar size={32} className="mx-auto text-[var(--color-primary)] mb-4" />
          <h2 className="font-display font-black text-2xl text-gray-900 mb-2">Butuh paket khusus?</h2>
          <p className="text-gray-500 mb-6 text-sm">Kami bisa menyesuaikan paket untuk kebutuhan keluarga Anda yang unik.</p>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Kulino%20Pit!%20Saya%20ingin%20tanya%20paket%20Family%20Rent%20khusus."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-8 py-3 inline-flex items-center gap-2"
          >
            <Phone size={16} /> Konsultasi via WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
