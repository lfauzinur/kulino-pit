'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Apa saja syarat untuk menyewa sepeda di Kulino Pit?',
      a: 'Anda hanya perlu membawa dan menitipkan kartu identitas asli (KTP/SIM/Paspor) sebagai jaminan selama masa penyewaan. Anda juga diwajibkan untuk mengisi form persetujuan penyewaan.'
    },
    {
      q: 'Apakah harga sewa sudah termasuk perlengkapan keselamatan?',
      a: 'Ya, setiap penyewaan sepeda sudah termasuk 1 buah helm standar keselamatan. Kami juga menyediakan gembok sepeda jika Anda membutuhkannya.'
    },
    {
      q: 'Bisakah saya menyewa sepeda untuk beberapa hari?',
      a: 'Sangat bisa! Kami menawarkan harga spesial untuk penyewaan jangka panjang (mingguan atau bulanan). Silakan hubungi admin kami melalui WhatsApp untuk mendapatkan penawaran terbaik.'
    },
    {
      q: 'Apakah sepeda bisa diantar ke hotel/penginapan?',
      a: 'Tentu. Kami melayani antar-jemput sepeda ke hotel, stasiun, atau titik lain di area Kota Banyuwangi dengan sedikit tambahan biaya operasional pengiriman.'
    },
    {
      q: 'Bagaimana jika sepeda mengalami kendala atau bocor ban di jalan?',
      a: 'Setiap sepeda sudah dibekali ban berkualitas baik. Namun jika terjadi kendala teknis (rantai putus, ban bocor) di area Banyuwangi, Anda dapat menghubungi tim support kami (Mekanik) untuk bantuan penanganan darurat.'
    },
    {
      q: 'Apakah Kulino Pit menyediakan guide atau Road Captain?',
      a: 'Ya! Kami memiliki layanan ekosistem bersepeda yang lengkap, termasuk penyediaan Road Captain, Marshal, Tim Medis, hingga dokumentasi profesional untuk mendampingi grup gowes Anda.'
    }
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 mb-4">
            Tanya Jawab (FAQ)
          </h1>
          <p className="text-gray-600 text-lg">
            Pertanyaan yang sering diajukan seputar layanan Kulino Pit
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-200 ${
                openIndex === index ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-200 shadow-sm'
              }`}
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-semibold text-gray-900 text-lg pr-8">{faq.q}</span>
                {openIndex === index ? (
                  <ChevronUp className="text-[var(--color-primary)] shrink-0" />
                ) : (
                  <ChevronDown className="text-gray-400 shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center bg-[var(--color-primary-soft)] rounded-3xl p-8 border border-blue-100">
          <h3 className="font-display font-bold text-xl mb-2 text-gray-900">Masih punya pertanyaan?</h3>
          <p className="text-gray-600 mb-6">Tim support kami siap membantu merencanakan petualangan Anda.</p>
          <a href="https://wa.me/628113000000" target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex px-8 py-3">
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
