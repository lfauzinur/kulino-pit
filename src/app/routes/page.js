'use client';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { cyclingRoutes } from '@/lib/routes-data';
import { MapPin, Mountain, ArrowUpRight, Download, Route, TrendingUp, TrendingDown } from 'lucide-react';

const difficultyColor = {
  'Mudah': 'bg-green-100 text-green-700 border-green-200',
  'Easy': 'bg-green-100 text-green-700 border-green-200',
  'Sedang': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Moderate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Sulit': 'bg-red-100 text-red-700 border-red-200',
  'Hard': 'bg-red-100 text-red-700 border-red-200',
};

export default function RoutesPage() {
  const { t, locale } = useI18n();

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold tracking-widest uppercase mb-4">
            {t('routes.badge')}
          </span>
          <h1 className="font-display font-black text-4xl lg:text-5xl text-gray-900 mb-4">
            {t('routes.title')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('routes.desc')}
          </p>
        </div>

        {/* Routes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cyclingRoutes.map(route => (
            <Link 
              key={route.id} 
              href={`/routes/${route.slug}`}
              className="group clean-card overflow-hidden bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Mini Map Preview */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/20 z-10" />
                {/* SVG route preview */}
                <svg 
                  viewBox="0 0 400 200" 
                  className="w-full h-full"
                  style={{ background: '#e8f4e8' }}
                >
                  {/* Simple grid pattern */}
                  <defs>
                    <pattern id={`grid-${route.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cde4cd" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="400" height="200" fill={`url(#grid-${route.id})`} />
                  
                  {/* Route polyline scaled to SVG viewbox */}
                  <polyline
                    points={route.coordinates.map((c, i) => {
                      const minLat = Math.min(...route.coordinates.map(p => p[0]));
                      const maxLat = Math.max(...route.coordinates.map(p => p[0]));
                      const minLng = Math.min(...route.coordinates.map(p => p[1]));
                      const maxLng = Math.max(...route.coordinates.map(p => p[1]));
                      const padX = 40, padY = 30;
                      const x = padX + ((c[1] - minLng) / (maxLng - minLng || 1)) * (400 - padX * 2);
                      const y = padY + ((c[0] - minLat) / (maxLat - minLat || 1)) * (200 - padY * 2);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={route.color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                  />
                  {/* Start marker */}
                  {(() => {
                    const c = route.coordinates[0];
                    const minLat = Math.min(...route.coordinates.map(p => p[0]));
                    const maxLat = Math.max(...route.coordinates.map(p => p[0]));
                    const minLng = Math.min(...route.coordinates.map(p => p[1]));
                    const maxLng = Math.max(...route.coordinates.map(p => p[1]));
                    const x = 40 + ((c[1] - minLng) / (maxLng - minLng || 1)) * 320;
                    const y = 30 + ((c[0] - minLat) / (maxLat - minLat || 1)) * 140;
                    return <circle cx={x} cy={y} r="6" fill={route.color} stroke="white" strokeWidth="2.5" />;
                  })()}
                </svg>
                
                {/* Difficulty badge */}
                <div className={`absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${difficultyColor[route.difficulty[locale]]}`}>
                  {route.difficulty[locale]}
                </div>
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-600">
                  <Download size={10} /> {route.downloads}
                </div>
              </div>
              
              {/* Route Info */}
              <div className="p-6">
                <h3 className="font-display font-black text-xl text-gray-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {route.name[locale]}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {t('routes.by')} {route.author}
                </p>
                
                {/* Stats Row */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <Route size={14} className="text-[var(--color-primary)]" />
                    {route.distance}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <TrendingUp size={14} className="text-green-500" />
                    {route.elevationGain}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                    <TrendingDown size={14} className="text-red-400" />
                    {route.elevationLoss}
                  </span>
                </div>
                
                {/* Surface */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {route.surface[locale]}
                  </span>
                </div>
              </div>
              
              {/* View CTA */}
              <div className="px-6 pb-5">
                <div className="flex items-center justify-between text-sm font-bold text-[var(--color-primary)] group-hover:gap-2 transition-all">
                  <span>{t('routes.viewRoute')}</span>
                  <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
