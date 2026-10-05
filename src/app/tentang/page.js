'use client';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { MapPin, Globe, Bike, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TentangPage() {
  const { locale } = useI18n();

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen overflow-hidden">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-sm mb-6 border border-[var(--color-primary)]/20">
              {locale === 'id' ? 'Tentang Kami' : 'About Us'}
            </span>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-gray-900 leading-[1.1] mb-6">
              Kulino Nge Pit:<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[#2563eb]">
                Keliling Banyuwangi, Kulino Punya Cerita! 🚲✨
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 font-medium leading-relaxed">
              {locale === 'id' 
                ? 'Siapa bilang nikmatin indahnya Banyuwangi cuma bisa dari balik kaca mobil? Kenalin, kami Kulino Nge Pit—salah satu unit usaha seru yang lahir dari ekosistem Kulino House di bawah naungan PT Kulino Karya Indonesia.'
                : 'Who says you can only enjoy the beauty of Banyuwangi from behind a car window? Meet Kulino Nge Pit—an exciting business unit born from the Kulino House ecosystem under PT Kulino Karya Indonesia.'}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/unit-sepeda" className="btn btn-primary px-8 py-4 text-base shadow-lg shadow-blue-500/30 flex items-center gap-2 group">
                <Bike size={20} />
                {locale === 'id' ? 'Sewa Sepeda Sekarang' : 'Rent a Bike Now'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://www.kulinohouse.id" target="_blank" rel="noopener noreferrer" className="btn bg-white border-2 border-gray-200 text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] px-8 py-4 text-base flex items-center gap-2">
                <Globe size={20} />
                Kunjungi Kulino House
              </a>
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end h-[400px] lg:h-[500px]">
            {/* Kulino House Building Image */}
            <div className="relative w-full max-w-lg h-full z-10 animate-fade-in-up">
              <Image
                src="/images/kulino-house.png"
                alt="Kulino House"
                fill
                className="object-contain object-center drop-shadow-2xl"
                priority
              />
            </div>
            
            {/* Mascot Go (Popping out from behind) */}
            <div className="absolute top-10 lg:-left-10 -left-4 w-48 h-48 z-20 animate-bounce-slow" style={{ animationDuration: '4s' }}>
              <Image
                src="/images/mascot-go.png"
                alt="Kulino Mascot Let's Go"
                fill
                className="object-contain"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="bg-white border-y border-gray-200 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Mascot Wave Image */}
            <div className="lg:col-span-5 relative h-[400px] flex justify-center items-center">
              <div className="absolute inset-0 bg-yellow-100 rounded-[3rem] rotate-3 scale-95 transition-transform hover:rotate-6"></div>
              <div className="absolute inset-0 bg-[var(--color-primary)] rounded-[3rem] -rotate-3 scale-95 opacity-10"></div>
              <div className="relative w-full h-[110%] -mt-10 z-10 hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/mascot-wave.png"
                  alt="Kulino Mascot Waving"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            
            {/* Text Content */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-gray-900 mb-6">
                {locale === 'id' ? 'Kenapa Harus Gowes?' : 'Why Cycle with Us?'}
              </h2>
              
              <div className="prose prose-lg text-gray-600">
                <p className="leading-relaxed">
                  Sesuai namanya, "Kulino Nge Pit" hadir buat ngajakin kamu membiasakan diri menikmati setiap sudut jalanan dengan roda dua. Kami menyediakan layanan sewa sepeda yang nyaman, plus paket Trip & Tour bersepeda yang siap nemenin kamu jalan-jalan seru di Banyuwangi.
                </p>
                <p className="leading-relaxed">
                  Mulai dari gowes santai menyusuri pesisir pantai, menikmati semilir angin di pedesaan yang asri, sampai menjelajahi spot-spot hits lokal yang tersembunyi—semuanya terasa lebih hidup saat dikayuh bareng!
                </p>
                
                <blockquote className="border-l-4 border-[var(--color-primary)] pl-6 py-2 my-8 bg-blue-50/50 rounded-r-2xl italic font-medium text-gray-800">
                  "Di Kulino Nge Pit, sepeda bukan cuma sekadar alat transportasi, tapi juga cara terbaik buat 'pelan sebentar', meresapi keindahan alam Banyuwangi, dan ngumpulin momen berkesan."
                </blockquote>
                
                <p className="font-bold text-xl text-gray-900 mt-8 flex items-center gap-3">
                  Yuk, siapin outfit terbaikmu, sewa sepedamu, dan mari gowes bareng kami! <span className="text-2xl">😎🚴‍♂️</span>
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="clean-card bg-gray-900 text-white p-10 overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-display font-black text-2xl mb-2 flex items-center gap-3">
                <MapPin className="text-[var(--color-primary)]" />
                Basecamp Kulino House
              </h3>
              <p className="text-gray-400 max-w-md">
                Kunjungi markas kami untuk melihat langsung koleksi sepeda, berdiskusi tentang rute, atau sekadar ngopi santai sebelum gowes!
              </p>
            </div>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn bg-[var(--color-primary)] text-white hover:bg-blue-700 px-6 py-3 shrink-0 shadow-[4px_4px_0px_white] hover:shadow-[2px_2px_0px_white] hover:translate-y-[2px] hover:translate-x-[2px] transition-all font-bold"
            >
              Lihat di Google Maps
            </a>
          </div>
        </div>
      </div>
      
    </div>
  );
}
