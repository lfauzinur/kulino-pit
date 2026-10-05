'use client';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function LokasiPage() {
  const { t } = useI18n();
  
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 mb-6">
            Lokasi <span className="text-[var(--color-primary)]">Kami</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Kunjungi basecamp Kulino Pit di jantung kota Banyuwangi. Tempat terbaik untuk memulai petualangan bersepeda Anda.
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Info Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[var(--shadow-card)] border border-gray-100">
            <h2 className="font-display font-bold text-2xl mb-8">Informasi Basecamp</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-soft)] rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="text-[var(--color-primary)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Alamat Lengkap</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Jl Kapten Waroka No 08<br/>
                    Tukangkayu, Kec. Banyuwangi<br/>
                    Kabupaten Banyuwangi, Jawa Timur 68416
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-soft)] rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="text-[var(--color-primary)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                  <p className="text-gray-600">
                    Senin - Minggu<br/>
                    06:00 - 20:00 WIB
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[var(--color-primary-soft)] rounded-2xl flex items-center justify-center shrink-0">
                  <Phone className="text-[var(--color-primary)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Kontak</h3>
                  <p className="text-gray-600">
                    0811-3000-000<br/>
                    halo@kulinopit.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <a 
                href="https://maps.app.goo.gl/3Q8x9vCqLgX2F" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary w-full flex justify-center py-4"
              >
                <Navigation className="mr-2" size={20} />
                Buka di Google Maps
              </a>
            </div>
          </div>

          {/* Map Embed Placeholder */}
          <div className="h-[600px] bg-gray-100 rounded-3xl overflow-hidden shadow-[var(--shadow-card)] border border-gray-200 relative group">
            {/* We use a simple iframe for google maps embed */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3948.88998896001!2d114.368564!3d-8.21386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd1452df3e2b175%3A0x6b4313f8b8e8f855!2sKulino%20House!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>

      </div>
    </div>
  );
}
