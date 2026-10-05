'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { tours, formatCurrency } from '@/lib/data';
import { useI18n } from '@/lib/i18n';
import { MapPin, Calendar, Clock, Map, CheckCircle2, Navigation, ShieldCheck, Camera, ChevronLeft } from 'lucide-react';

export default function TourDetail({ params }) {
  const unwrappedParams = use(params);
  const { locale } = useI18n();
  // Handle Next.js cache where the param might still be named 'id' after folder rename
  const slugParam = unwrappedParams.slug || unwrappedParams.id;
  const tour = tours.find(t => t.slug === slugParam);
  
  if (!tour) {
    notFound();
  }

  // Placeholder gallery images
  const gallery = [
    tour.image,
    '/images/tour_gallery_1.png',
    '/images/hero-banner.png'
  ];

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-semibold text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> {locale === 'id' ? 'Kembali' : 'Back'}
        </Link>

        {/* Header Title & Badges */}
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">
            {tour.name[locale] || tour.name.en}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-600">
            <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <Map size={16} className="text-[var(--color-primary)]" /> {tour.distance}
            </span>
            <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <Clock size={16} className="text-[var(--color-primary)]" /> {tour.duration}
            </span>
            <span className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <ShieldCheck size={16} className="text-[var(--color-primary)]" /> {tour.difficulty[locale] || tour.difficulty.en}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Gallery & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Gallery */}
            <div className="clean-card p-2 bg-white border border-gray-100">
              <div className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-2">
                <Image 
                  src={gallery[0]} 
                  alt={tour.name[locale] || tour.name.en} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <Image src={gallery[1]} alt="Gallery 1" fill className="object-cover" />
                </div>
                <div className="relative h-48 w-full rounded-2xl overflow-hidden">
                  <Image src={gallery[2]} alt="Gallery 2" fill className="object-cover" />
                </div>
              </div>
            </div>

            {/* Tour Description */}
            <div className="clean-card p-8 bg-white border border-gray-100">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">
                {locale === 'id' ? 'Detail Tour' : 'Tour Details'}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {tour.description[locale] || tour.description.en}
              </p>
            </div>

            {/* Meeting Point */}
            <div className="clean-card p-8 bg-white border border-gray-100">
              <h2 className="font-display font-bold text-2xl text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-[var(--color-primary)]" /> Meeting Point
              </h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  <Navigation size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Kulino House, Banyuwangi</h3>
                  <p className="text-gray-500 mt-1">
                    {locale === 'id' 
                      ? 'Harap berkumpul 30 menit sebelum jadwal keberangkatan untuk briefing dan fitting sepeda.' 
                      : 'Please gather 30 minutes before departure for briefing and bike fitting.'}
                  </p>
                  <a href="#" className="inline-block mt-3 text-[var(--color-primary)] font-semibold hover:underline text-sm">
                    {locale === 'id' ? 'Lihat di Google Maps' : 'View on Google Maps'} →
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Pricing & Includes */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Booking Card */}
            <div className="clean-card p-6 bg-white border border-gray-100 sticky top-24 shadow-lg shadow-[var(--color-primary-soft)]">
              <div className="mb-6 pb-6 border-b border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                  {locale === 'id' ? 'Mulai Dari' : 'Starts From'}
                </p>
                <div className="font-display font-black text-4xl text-[var(--color-primary)]">
                  {formatCurrency(tour.price)}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {locale === 'id' ? '*Harga per pax / orang' : '*Price per pax / person'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-display font-bold text-lg text-gray-900">
                  {locale === 'id' ? 'Fasilitas Termasuk:' : 'Tour Includes:'}
                </h3>
                <ul className="space-y-3">
                  {tour.includes[locale] ? tour.includes[locale].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </li>
                  )) : tour.includes.en.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/booking" className="btn btn-primary w-full py-4 text-lg shadow-md">
                {locale === 'id' ? 'Booking Sekarang' : 'Book Now'}
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
