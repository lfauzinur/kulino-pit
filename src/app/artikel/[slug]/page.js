'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, User, Share2, Link2, MessageCircle } from 'lucide-react';
import { articles } from '@/lib/data';
import { useI18n } from '@/lib/i18n';

export default function ArticleDetail({ params }) {
  const { locale } = useI18n();
  const [allArticles, setAllArticles] = useState(articles);
  const [article, setArticle] = useState(null);

  useEffect(() => {
    try {
      const custom = JSON.parse(localStorage.getItem('customArticles') || '[]');
      const merged = [...custom, ...articles];
      setAllArticles(merged);
      
      const found = merged.find(a => a.id.toString() === params.slug);
      if (found) {
        setArticle(found);
      } else {
        setArticle(merged[0]);
      }
    } catch(e) {
      console.error(e);
      setArticle(articles[0]);
    }
  }, [params.slug]);

  if (!article) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

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
            <p className="first-letter:text-7xl first-letter:font-black first-letter:text-[var(--color-primary)] first-letter:mr-3 first-letter:float-left">
              {locale === 'id' 
                ? 'Banyuwangi selalu menyimpan pesona alam yang tak pernah ada habisnya untuk dieksplorasi. Bagi para pecinta olahraga bersepeda, wilayah ini adalah surga dunia yang menawarkan perpaduan sempurna antara kontur pegunungan yang menantang dan garis pantai yang eksotis.' 
                : 'Banyuwangi always holds natural charms that are never-ending to explore. For cycling enthusiasts, this region is a paradise that offers a perfect blend of challenging mountain contours and exotic coastlines.'}
            </p>
            <p>
              {locale === 'id' 
                ? 'Dalam artikel ini, kita akan membedah secara mendalam mengapa rute-rute di Banyuwangi sangat direkomendasikan baik untuk pemula maupun pesepeda profesional. Mulai dari tanjakan legendaris Ijen hingga jalan santai melintasi hutan de Djawatan.' 
                : 'In this article, we will deeply dissect why the routes in Banyuwangi are highly recommended for both beginners and professional cyclists. From the legendary Ijen climb to a relaxing ride through the de Djawatan forest.'}
            </p>

            <h3 className="font-display font-black text-2xl text-gray-900 mt-10 mb-4">
              {locale === 'id' ? 'Mempersiapkan Fisik dan Sepeda' : 'Preparing Physically and Your Bike'}
            </h3>
            <p>
              {locale === 'id' 
                ? 'Sebelum menaklukkan rute-rute ini, ada beberapa persiapan esensial yang pantang untuk dilewatkan. Kondisi fisik harus prima, mengingat beberapa rute memiliki elevasi yang tidak main-main. Pastikan Anda telah melakukan pemanasan yang cukup dan sarapan dengan gizi seimbang.' 
                : 'Before conquering these routes, there are some essential preparations that must not be missed. Your physical condition must be prime, considering some routes have serious elevations. Ensure you have warmed up enough and had a balanced breakfast.'}
            </p>
            <div className="my-8 p-6 bg-blue-50 border-l-4 border-[var(--color-primary)] rounded-r-xl">
              <p className="font-bold text-[var(--color-primary-dark)] m-0 flex items-center gap-2">
                <span className="text-xl">💡</span> {locale === 'id' ? 'Tips Pro dari Kulino Pit:' : 'Pro Tip from Kulino Pit:'}
              </p>
              <p className="text-[var(--color-primary-dark)] m-0 mt-2 text-sm leading-relaxed">
                {locale === 'id' 
                  ? 'Selalu bawa cadangan ban dalam dan pompa mini. Jangan ragu menyewa unit sepeda Gravel atau MTB di Kulino Pit jika Anda berniat masuk ke rute off-road. Sepeda kami selalu dalam kondisi prima dan siap tempur.' 
                  : 'Always carry a spare inner tube and mini pump. Don\'t hesitate to rent a Gravel or MTB bike at Kulino Pit if you plan to hit the off-road routes. Our bikes are always in prime condition and ready for battle.'}
              </p>
            </div>

            <p>
              {locale === 'id' 
                ? 'Selain fisik, perlengkapan safety seperti helm, kacamata UV, dan lampu sepeda wajib terpasang. Banyuwangi terkadang memiliki cuaca yang mudah berubah di daerah dataran tinggi.' 
                : 'Besides physical readiness, safety gear like helmets, UV glasses, and bike lights must be installed. Banyuwangi sometimes has unpredictable weather in highland areas.'}
            </p>

            <h3 className="font-display font-black text-2xl text-gray-900 mt-10 mb-4">
              {locale === 'id' ? 'Menikmati Setiap Kayuhan' : 'Enjoying Every Pedal'}
            </h3>
            <p>
              {locale === 'id' 
                ? 'Perjalanan bukanlah tentang seberapa cepat Anda sampai di garis akhir, melainkan tentang pengalaman di sepanjang jalan. Nikmati udaranya, sapalah warga lokal yang ramah, dan jangan lupa berhenti sejenak untuk mengabadikan momen di titik-titik pemandangan terbaik.' 
                : 'The journey is not about how fast you reach the finish line, but the experience along the way. Enjoy the air, greet the friendly locals, and don\'t forget to pause to capture moments at the best scenic spots.'}
            </p>
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
                {allArticles.filter(a => a.id.toString() !== params.slug).slice(0, 2).map((rel) => (
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
