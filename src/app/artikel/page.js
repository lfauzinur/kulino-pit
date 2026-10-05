'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { articles } from '@/lib/data';
import { Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';

export default function ArtikelPage() {
  const { locale } = useI18n();
  const [allArticles, setAllArticles] = useState(articles);

  useEffect(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('customArticles') || '[]');
      if (custom.length > 0) {
        setAllArticles([...custom, ...articles]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider mb-4">
            <Sparkles size={12} /> {locale === 'id' ? 'Artikel' : 'Articles'}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-gray-900">
            {locale === 'id' ? 'Cerita & Panduan Bersepeda' : 'Cycling Stories & Guides'}
          </h1>
          <p className="mt-4 text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            {locale === 'id' 
              ? 'Temukan inspirasi rute terbaik, tips perawatan sepeda, dan berita terkini dari dunia cycling.' 
              : 'Discover best route inspirations, bike maintenance tips, and latest news from the cycling world.'}
          </p>
        </div>

        {/* Featured Article */}
        {allArticles.length > 0 && (
          <article className="clean-card overflow-hidden mb-12 grid lg:grid-cols-2 group hover:shadow-[var(--shadow-medium)] transition-shadow">
            <div className="relative aspect-video lg:aspect-auto overflow-hidden">
              <Image 
                src={allArticles[0].image} 
                alt={allArticles[0].title[locale] || allArticles[0].title['id']} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold shadow-lg">
                ✦ Featured
              </span>
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-blue-50 px-2 py-1 rounded-md">
                  <Tag size={12} /> {allArticles[0].category[locale] || allArticles[0].category['id']}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400">
                  <Clock size={12} /> {allArticles[0].date}
                </span>
              </div>
              <h2 className="font-display font-black text-3xl leading-tight text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                {allArticles[0].title[locale] || allArticles[0].title['id']}
              </h2>
              <p className="mt-4 text-sm text-gray-500 leading-relaxed line-clamp-3">
                {allArticles[0].excerpt[locale] || allArticles[0].excerpt['id']}
              </p>
              <Link 
                href={`/artikel/${allArticles[0].id}`}
                className="mt-8 inline-flex items-center gap-2 btn btn-primary self-start px-6 py-3"
              >
                {locale === 'id' ? 'Baca Selengkapnya' : 'Read More'} <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        )}

        {/* Article Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {allArticles.map((article, idx) => {
            // Skip the first article as it is featured above
            if (idx === 0) return null;
            return (
              <Link href={`/artikel/${article.id}`} key={article.id} className="block group">
                <article className="clean-card h-full flex flex-col overflow-hidden hover:shadow-[var(--shadow-medium)] transition-all hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <Image 
                      src={article.image || '/images/bikes/roadbike.png'} 
                      alt={article.title[locale] || article.title['id']} 
                      fill 
                      className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 text-[9px] font-bold shadow-sm">
                      <Tag size={10} className="text-[var(--color-primary)]" /> {article.category[locale] || article.category['id']}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 mb-3">
                      <Clock size={12} /> {article.date}
                    </div>
                    <h3 className="font-display font-black text-lg leading-snug text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                      {article.title[locale] || article.title['id']}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                      {article.excerpt[locale] || article.excerpt['id']}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[var(--color-primary)] group-hover:gap-2 transition-all">
                      {locale === 'id' ? 'Baca Artikel' : 'Read Article'} <ArrowRight size={12} />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
