'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { bikes, testimonials, tours, formatCurrency } from '@/lib/data';
import { MapPin, Calendar, Search, Map, CreditCard, Briefcase, Plus, Users, User, Star } from 'lucide-react';

/* ─── Hero Section ─── */
function HeroSection({ t, locale }) {
  return (
    <section className="relative pt-28 pb-32 lg:pt-40 lg:pb-48 overflow-hidden bg-white">
      {/* Decorative Blob */}
      <div className="absolute top-0 left-0 w-2/3 h-full bg-[var(--color-primary-soft)] rounded-br-[150px] -z-10 opacity-70 hidden md:block"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="max-w-2xl animate-fade-in">
            <h1 className="font-display font-black text-5xl lg:text-7xl leading-tight mb-6 text-gray-900">
              {t('hero.heroTitleLine1')} <br />
              <span className="text-[var(--color-primary)]">{t('hero.heroTitleLine2')}</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {t('hero.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/unit-sepeda" className="btn btn-primary px-8 py-3 rounded-full text-base">
                {t('hero.exploreBikes')}
              </Link>
              <Link href="/layanan" className="px-8 py-3 rounded-full text-base font-semibold text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                {t('hero.viewDetails')}
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {/* The main featured bike */}
            <Image 
              src={bikes[0].image} 
              alt="Premium Bike" 
              fill 
              className="object-contain filter drop-shadow-2xl z-10"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Circle Accent Behind Bike */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white rounded-full shadow-[var(--shadow-soft)] -z-0"></div>
          </div>
        </div>

        {/* Floating Search Widget */}
        <div className="absolute left-4 right-4 lg:left-8 lg:right-8 -bottom-24 lg:-bottom-16 bg-white rounded-2xl shadow-[var(--shadow-soft)] p-6 lg:p-8 border border-gray-100 z-20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('hero.pickup')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" size={18} />
                <input type="text" placeholder={t('hero.placeholderLocation')} className="clean-input pl-10 text-sm" readOnly />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('hero.dropoff')}</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" size={18} />
                <input type="text" placeholder={t('hero.placeholderLocation')} className="clean-input pl-10 text-sm" readOnly />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('hero.journeyDate')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" className="clean-input pl-10 text-sm text-gray-600" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('hero.returnDate')}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="date" className="clean-input pl-10 text-sm text-gray-600" />
              </div>
            </div>

            <Link href="/booking" className="btn btn-primary w-full h-11 lg:h-12 text-sm shadow-md gap-2 flex items-center justify-center">
              <Search size={18} /> {t('hero.search')}
            </Link>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ─── About Section ─── */
function AboutSection({ t }) {
  return (
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="relative bg-[var(--color-primary-soft)] rounded-[3rem] p-8 lg:p-12 h-[300px] sm:h-[400px]">
            {/* Kulino House Building Image */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] z-10 animate-fade-in-up">
              <Image
                src="/images/kulino-house.png"
                alt="Kulino House"
                fill
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </div>
          
          <div>
            <h2 className="font-display font-black text-3xl lg:text-4xl mb-6 text-gray-900">
              {t('about.whyUs')}
            </h2>
            <div className="prose prose-lg text-gray-600">
              <p className="leading-relaxed">
                {t('about.desc1')}
              </p>
              <p className="leading-relaxed">
                {t('about.desc2')}
              </p>
              
              <blockquote className="border-l-4 border-[var(--color-primary)] pl-6 py-2 my-8 bg-blue-50/50 rounded-r-2xl italic font-medium text-gray-800">
                {t('about.quote')}
              </blockquote>
              
              <p className="font-bold text-xl text-gray-900 mt-8 flex items-center gap-3">
                {t('about.cta')}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ─── */
function HowItWorks({ t }) {
  const steps = [
    { num: '01', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
    { num: '02', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
    { num: '03', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
    { num: '04', title: t('howItWorks.step4Title'), desc: t('howItWorks.step4Desc') },
  ];

  return (
    <section className="pt-32 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1">
            <h2 className="font-display font-black text-3xl lg:text-4xl mb-6 text-gray-900">
              {t('howItWorks.title')}
            </h2>
            <p className="text-gray-500 mb-10 max-w-md">
              {t('howItWorks.subtitle')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <span className="block text-4xl lg:text-5xl font-display font-black text-[var(--color-primary-soft)] mb-2">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative bg-white p-8 rounded-3xl shadow-[var(--shadow-soft)]">
            <h3 className="font-display font-bold text-xl mb-6">{t('howItWorks.sideTitle')}</h3>
            <p className="text-sm text-gray-500 mb-6">{t('howItWorks.sideDesc')}</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                <MapPin className="text-[var(--color-primary)]" size={24} />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{t('hero.pickup')}</p>
                  <p className="text-sm font-semibold text-gray-900">{t('hero.placeholderLocation')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-primary)] bg-[var(--color-primary-soft)]">
                <MapPin className="text-[var(--color-primary)]" size={24} />
                <div>
                  <p className="text-[10px] text-[var(--color-primary)] font-bold uppercase">{t('howItWorks.destLocation')}</p>
                  <p className="text-sm font-semibold text-[var(--color-primary)]">{t('howItWorks.destExample')}</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button className="btn btn-primary w-full py-3">Search Route</button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ─── Featured Bikes (Clean Cards) ─── */
function FeaturedBikes({ t }) {
  const featured = bikes.slice(0, 3);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-black text-3xl lg:text-4xl text-gray-900 mb-4">{t('featuredBikes.title')}</h2>
          <p className="text-gray-500">{t('featuredBikes.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map(bike => (
            <div key={bike.id} className="clean-card group cursor-pointer flex flex-col">
              <div className="relative h-48 bg-gray-50 p-6 flex items-center justify-center">
                <Image 
                  src={bike.image} 
                  alt={bike.name} 
                  fill 
                  className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 block">{bike.category}</span>
                <h3 className="font-display font-bold text-lg text-gray-900 mb-4">{bike.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-gray-900">Rp {(bike.pricePerDay / 1000).toFixed(0)}k</span>
                    <span className="text-xs text-gray-500 font-medium"> / day</span>
                  </div>
                  <Link href="/unit-sepeda" className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                    <Plus size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/unit-sepeda" className="btn btn-outline px-8 py-3 text-sm">
            {t('featuredBikes.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Rental Options ─── */
function RentalOptions({ t, locale }) {
  const options = [
    {
      id: 'reguler',
      title: t('rentalOptions.reguler.title'),
      desc: t('rentalOptions.reguler.desc'),
      image: '/images/regular_rent.png'
    },
    {
      id: 'family',
      title: t('rentalOptions.family.title'),
      desc: t('rentalOptions.family.desc'),
      image: '/images/family_rent.png'
    },
    {
      id: 'corporate',
      title: t('rentalOptions.corporate.title'),
      desc: t('rentalOptions.corporate.desc'),
      image: '/images/corporate_rent.png'
    }
  ];

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-black text-3xl lg:text-4xl text-gray-900 mb-4">
            {t('rentalOptions.title')}
          </h2>
          <p className="text-gray-500">
            {t('rentalOptions.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {options.map(opt => (
            <div key={opt.id} className="clean-card group flex flex-col overflow-hidden bg-white">
              <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                <Image 
                  src={opt.image} 
                  alt={opt.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col text-center">
                <h3 className="font-display font-black text-xl text-gray-900 mb-3">{opt.title}</h3>
                <p className="text-sm text-gray-500 mb-8 flex-1">{opt.desc}</p>
                <Link href="/booking" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                  {t('rentalOptions.rentNow')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Popular Tours ─── */
function PopularTours({ t, locale }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-black text-3xl lg:text-4xl text-gray-900 mb-4">
            {t('tours.popularTitle')}
          </h2>
          <p className="text-gray-500">
            {t('tours.popularSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tours.map(tour => (
            <div key={tour.id} className="clean-card group flex flex-col overflow-hidden bg-gray-50 border border-gray-100">
              <div className="relative h-56 w-full overflow-hidden">
                <Image 
                  src={tour.image} 
                  alt={tour.name[locale] || tour.name.en} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--color-primary)]">
                  {tour.difficulty[locale] || tour.difficulty.en}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display font-black text-xl text-gray-900 mb-2">
                  {tour.name[locale] || tour.name.en}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                  {tour.description[locale] || tour.description.en}
                </p>
                
                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Map size={16} /> {t('tours.distance')}</span>
                    <span className="font-semibold text-gray-900">{tour.distance}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><Calendar size={16} /> {t('tours.startTour')}</span>
                    <span className="font-semibold text-gray-900">{tour.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><MapPin size={16} /> {t('tours.meetingPoint')}</span>
                    <span className="font-semibold text-gray-900">Kulino House</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mb-6">
                  <span className="text-xs text-gray-500 block mb-1">{t('tours.startFrom')}</span>
                  <span className="text-2xl font-black text-gray-900">{formatCurrency(tour.price)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <Link href={`/trip-tour/${tour.slug}`} className="btn btn-outline text-center py-2.5 text-sm">
                    {t('tours.readMore')}
                  </Link>
                  <Link href="/booking" className="btn btn-primary text-center py-2.5 text-sm shadow-md">
                    {t('tours.booking')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials Section ─── */
function TestimonialSection({ t, locale }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display font-black text-3xl lg:text-4xl text-gray-900 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-gray-500">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(testi => (
            <div key={testi.id} className="clean-card p-6 bg-gray-50 border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-1 mb-4 text-yellow-400">
                {[...Array(testi.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-6 flex-1 leading-relaxed">
                "{testi.text[locale] || testi.text.en}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm">
                  {testi.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{testi.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  const { t, locale } = useI18n();

  return (
    <div className="min-h-screen">
      <HeroSection t={t} locale={locale} />
      <AboutSection t={t} />
      <HowItWorks t={t} />
      <RentalOptions t={t} locale={locale} />
      <FeaturedBikes t={t} />
      <PopularTours t={t} locale={locale} />
      <TestimonialSection t={t} locale={locale} />
    </div>
  );
}
