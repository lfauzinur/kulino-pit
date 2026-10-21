'use client';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { tours, formatCurrency } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { ChevronLeft, Users, Calendar, MapPin, CheckCircle, Phone, CreditCard, Clock } from 'lucide-react';

export default function TourBookingPage({ params }) {
  const unwrappedParams = use(params);
  const { locale } = useI18n();
  const tour = tours.find(t => t.slug === unwrappedParams.slug);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    pax: 1,
    date: '',
    note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  if (!tour) notFound();

  const today = new Date().toISOString().split('T')[0];
  const totalPrice = tour.price * form.pax;

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Halo Kulino Pit! Saya ingin booking tour:

🚴 Tour: ${tour.name[locale] || tour.name.id}
📅 Tanggal: ${form.date}
👥 Jumlah peserta: ${form.pax} orang
💰 Total: ${formatCurrency(totalPrice)}

Nama: ${form.name}
Telepon: ${form.phone}
Email: ${form.email}
${form.note ? `Catatan: ${form.note}` : ''}`;

    window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`, '_blank');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-display font-black text-3xl text-gray-900 mb-3">Pesanan Dikirim! 🎉</h1>
          <p className="text-gray-500 mb-8">Tim kami akan segera menghubungi Anda via WhatsApp untuk konfirmasi booking.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/trip-tour" className="btn border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3">
              Lihat Tour Lain
            </Link>
            <Link href="/" className="btn btn-primary px-6 py-3">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link
          href={`/trip-tour/${tour.slug}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-semibold text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} /> Kembali ke Detail Tour
        </Link>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* Left: Form */}
          <div className="lg:col-span-3">
            <h1 className="font-display font-black text-3xl text-gray-900 mb-2">Booking Tour</h1>
            <p className="text-gray-500 mb-8 text-sm">Isi form di bawah dan kami akan konfirmasi via WhatsApp.</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="08xx xxxx xxxx"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50"
                />
              </div>

              {/* Date + Pax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    <Calendar size={11} className="inline mr-1" />Tanggal Tour *
                  </label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    <Users size={11} className="inline mr-1" />Jumlah Peserta *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={form.pax}
                    onChange={e => setForm(f => ({ ...f, pax: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Catatan Tambahan</label>
                <textarea
                  rows={3}
                  placeholder="Permintaan khusus, ukuran sepeda, dll..."
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 resize-none"
                />
              </div>

              {/* Total */}
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">{formatCurrency(tour.price)} × {form.pax} orang</span>
                  <span className="font-display font-black text-xl text-[var(--color-primary)]">{formatCurrency(totalPrice)}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">*Pembayaran dikonfirmasi via WhatsApp</p>
              </div>

              <button type="submit" className="btn btn-primary w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-md">
                <Phone size={18} /> Konfirmasi Booking via WhatsApp
              </button>
            </form>
          </div>

          {/* Right: Tour Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="relative h-48 w-full">
                <Image src={tour.image} alt={tour.name[locale]} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-full text-gray-700">
                    💪 {tour.difficulty[locale]}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="font-display font-black text-xl text-gray-900 mb-4">{tour.name[locale]}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Clock size={15} className="text-[var(--color-primary)] shrink-0" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={15} className="text-[var(--color-primary)] shrink-0" />
                    <span>Kulino House, Banyuwangi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CreditCard size={15} className="text-[var(--color-primary)] shrink-0" />
                    <span className="font-bold text-[var(--color-primary)]">{formatCurrency(tour.price)}/orang</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Termasuk:</h3>
                  <ul className="space-y-2">
                    {(tour.includes[locale] || tour.includes.id).map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle size={12} className="text-green-500 shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
