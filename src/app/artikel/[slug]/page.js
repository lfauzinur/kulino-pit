'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Share2, Link2, MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function ArticleDetail() {
  const { locale } = useI18n();
  const { slug } = useParams();
  const [allArticles, setAllArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : [])
      .then((custom) => {
        const databaseArticles = Array.isArray(custom) ? custom : [];
        setAllArticles(databaseArticles);
        setArticle(databaseArticles.find((item) => String(item.id) === String(slug)) || null);
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!article) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><p className="font-bold text-gray-700">Artikel tidak ditemukan.</p><Link href="/artikel" className="text-[var(--color-primary)] font-semibold">Kembali ke daftar artikel</Link></div>;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-16">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Navigation */}
        <div className="mb-8">
          <Link href="/artikel" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[var(--color-primary)] transition-colors">
            <ArrowLeft size={16} /> {locale === 'id' ? 'Kembali ke Artikel' : 'Back to Articles'}
          </Link>
        </div>

        {/* Header */}
        <header className="mb-10 text-center md:text-left animate-fade-in">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-full">
              {article.category[locale] || article.category['id']}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} /> {article.date}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <User size={14} /> Kulino Team
            </span>
          </div>
          
          <h1 className="font-display font-black text-4xl md:text-5xl text-gray-900 leading-tight mb-6">
            {article.title[locale] || article.title['id']}
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            {article.excerpt[locale] || article.excerpt['id']}
          </p>
        </header>

        {/* Featured Image */}
        <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-[var(--shadow-medium)] animate-fade-in">
          <Image 
            src={article.image || '/images/bikes/roadbike.png'} 
            alt={article.title[locale] || article.title['id']}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="md:col-span-8 prose prose-lg max-w-none text-gray-700 leading-loose">
            {article.content?.length > 0 ? article.content.map((block) => block.type === 'text' ? (
              <section key={block.id} className="mb-8">
                {block.title && <h3 className="font-display font-black text-2xl text-gray-900 mb-4">{block.title}</h3>}
                <p className="whitespace-pre-wrap">{block.content}</p>
              </section>
            ) : block.url ? (
              <figure key={block.id} className="my-8">
                <img src={block.url} alt={block.caption || article.title[locale] || article.title.id} className="w-full rounded-2xl" />
                {block.caption && <figcaption className="mt-2 text-center text-sm text-gray-500">{block.caption}</figcaption>}
              </figure>
            ) : null) : (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
                {locale === 'id' ? 'Konten lengkap artikel belum ditambahkan.' : 'The full article content has not been added yet.'}
              </div>
            )}
          </div>

          {/* Sidebar / Share */}
          <div className="md:col-span-4">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-gray-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Share2 size={18} /> {locale === 'id' ? 'Bagikan Artikel' : 'Share Article'}
              </h4>
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-semibold text-sm">
                  {/* SVG for Facebook */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  FB
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors font-semibold text-sm">
                  {/* SVG for X / Twitter */}
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
                  X
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-sm">
                  <Link2 size={16} /> Link
                </button>
              </div>

              <hr className="my-6 border-gray-100" />
              
              <h4 className="font-bold text-gray-900 mb-4">{locale === 'id' ? 'Artikel Terkait' : 'Related Articles'}</h4>
              <div className="space-y-4">
                {allArticles.filter(a => a.id.toString() !== String(slug)).slice(0, 2).map((rel) => (
                  <Link key={rel.id} href={`/artikel/${rel.id}`} className="group flex gap-3 items-center">
                    <div className="w-20 h-20 relative rounded-xl overflow-hidden shrink-0">
                      <Image src={rel.image || '/images/bikes/roadbike.png'} alt={rel.title[locale] || rel.title['id']} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">{rel.title[locale] || rel.title['id']}</h5>
                      <p className="text-[10px] text-gray-500 mt-1">{rel.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </article>
    </div>
  );
}
