'use client';
import { use, useState, useCallback, useRef, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { cyclingRoutes, generateGPX } from '@/lib/routes-data';
import { 
  ChevronLeft, Download, Share2, MapPin, TrendingUp, TrendingDown, 
  Route, Mountain, Clock, Copy, Check, Mail,
  X
} from 'lucide-react';

// Social icons not in lucide-react
const FacebookIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const TwitterIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

// Dynamically import Leaflet map (no SSR)
const RouteMap = dynamic(() => import('@/components/RouteMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm font-medium">Loading map...</div>
    </div>
  ),
});

const difficultyColor = {
  'Mudah': 'bg-green-100 text-green-700 border-green-200',
  'Easy': 'bg-green-100 text-green-700 border-green-200',
  'Sedang': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Moderate': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Sulit': 'bg-red-100 text-red-700 border-red-200',
  'Hard': 'bg-red-100 text-red-700 border-red-200',
};

function CustomTooltip({ active, payload, locale }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 shadow-lg border border-gray-100">
        <p className="text-xs font-bold text-gray-900">{payload[0].payload.elev} m</p>
        <p className="text-[10px] text-gray-500">
          {locale === 'id' ? 'Jarak:' : 'Distance:'} {payload[0].payload.dist} km
        </p>
      </div>
    );
  }
  return null;
}

export default function RouteDetailPage({ params }) {
  const unwrappedParams = use(params);
  const { locale } = useI18n();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const slugParam = unwrappedParams.slug;
  const route = cyclingRoutes.find(r => r.slug === slugParam);

  if (!route) {
    notFound();
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `${route.name[locale]} — Kulino Pit Cycling Routes`;

  const handleDownloadGPX = useCallback(() => {
    const gpxContent = generateGPX(route);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${route.slug}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [route]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {}
    } else {
      setShowShareModal(true);
    }
  }, [shareTitle, shareUrl]);

  const maxElev = Math.max(...route.elevationProfile.map(p => p.elev));
  const minElev = Math.min(...route.elevationProfile.map(p => p.elev));

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back + Actions */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <Link href="/routes" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] font-semibold text-sm transition-colors">
            <ChevronLeft size={16} /> {locale === 'id' ? 'Semua Rute' : 'All Routes'}
          </Link>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadGPX}
              className="btn btn-primary px-5 py-2.5 text-sm flex items-center gap-2 shadow-md"
            >
              <Download size={16} /> Download GPX
            </button>
            <button 
              onClick={handleNativeShare}
              className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>

        {/* Route Title */}
        <div className="mb-6">
          <h1 className="font-display font-black text-3xl lg:text-4xl text-gray-900 mb-2">
            {route.name[locale]}
          </h1>
          <p className="text-sm text-gray-400">
            {locale === 'id' ? 'oleh' : 'by'} {route.author} · <Download size={12} className="inline" /> {route.downloads} downloads
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700">
            <Route size={16} className="text-[var(--color-primary)]" /> {route.distance}
          </span>
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700">
            <TrendingUp size={16} className="text-green-500" /> ↑{route.elevationGain}
          </span>
          <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-700">
            <TrendingDown size={16} className="text-red-400" /> ↓{route.elevationLoss}
          </span>
          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${difficultyColor[route.difficulty[locale]]}`}>
            {route.difficulty[locale]}
          </span>
          <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider">
            {route.surface[locale]}
          </span>
        </div>

        {/* Map */}
        <div className="clean-card overflow-hidden bg-white border border-gray-100 mb-2" style={{ height: '480px' }}>
          <RouteMap route={route} hoveredPoint={hoveredPoint} />
        </div>

        {/* Elevation Profile */}
        <div className="clean-card p-6 bg-white border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-gray-900 flex items-center gap-2">
              <Mountain size={20} className="text-[var(--color-primary)]" />
              {locale === 'id' ? 'Profil Elevasi' : 'Elevation Profile'}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Min: {minElev}m</span>
              <span>Max: {maxElev}m</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <AreaChart
                data={route.elevationProfile}
                onMouseMove={(e) => {
                  if (e?.activePayload?.[0]) {
                    const pt = e.activePayload[0].payload;
                    // Find closest coordinate
                    const ratio = pt.dist / parseFloat(route.distance);
                    const idx = Math.min(
                      Math.round(ratio * (route.coordinates.length - 1)),
                      route.coordinates.length - 1
                    );
                    setHoveredPoint(route.coordinates[idx]);
                  }
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <defs>
                  <linearGradient id={`elevGrad-${route.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={route.color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={route.color} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="dist" 
                  tickFormatter={(v) => `${v} km`}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  tickFormatter={(v) => `${v}m`}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip locale={locale} />} />
                <Area
                  type="monotone"
                  dataKey="elev"
                  stroke={route.color}
                  strokeWidth={2.5}
                  fill={`url(#elevGrad-${route.id})`}
                  dot={false}
                  activeDot={{ r: 5, stroke: route.color, strokeWidth: 2, fill: 'white' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            {locale === 'id' ? '🚴 Arahkan kursor ke grafik — posisi ditampilkan di peta' : '🚴 Hover the chart — the position shows on the map'}
          </p>
        </div>

        {/* Description & Details */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="clean-card p-8 bg-white border border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
                {locale === 'id' ? 'Tentang Rute' : 'About This Route'}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {route.description[locale]}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Point */}
            <div className="clean-card p-6 bg-white border border-gray-100">
              <h3 className="font-display font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[var(--color-primary)]" /> Meeting Point
              </h3>
              <p className="text-gray-700 font-semibold">{route.meetingPoint}</p>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${route.center[0]},${route.center[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-[var(--color-primary)] font-semibold hover:underline text-sm"
              >
                {locale === 'id' ? 'Buka di Google Maps' : 'Open in Google Maps'} →
              </a>
            </div>

            {/* Quick Share */}
            <div className="clean-card p-6 bg-white border border-gray-100">
              <h3 className="font-display font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Share2 size={16} className="text-[var(--color-primary)]" /> {locale === 'id' ? 'Bagikan Rute' : 'Share Route'}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  {copied ? (locale === 'id' ? 'Tersalin!' : 'Copied!') : (locale === 'id' ? 'Salin Link' : 'Copy Link')}
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition-colors"
                >
                  <FacebookIcon size={14} /> Facebook
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-bold transition-colors"
                >
                  <TwitterIcon size={14} /> Twitter
                </a>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold transition-colors"
                >
                  <Mail size={14} /> WA
                </a>
              </div>
            </div>

            {/* Download GPX */}
            <button 
              onClick={handleDownloadGPX}
              className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-md"
            >
              <Download size={20} /> Download GPX
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal (fallback for browsers without Web Share API) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{locale === 'id' ? 'Bagikan Rute' : 'Share Route'}</h3>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl mb-4">
              <input 
                readOnly 
                value={shareUrl} 
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button 
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-bold"
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors">
                <FacebookIcon size={24} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-600">Facebook</span>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-sky-50 transition-colors">
                <TwitterIcon size={24} className="text-sky-500" />
                <span className="text-xs font-bold text-gray-600">Twitter</span>
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-green-50 transition-colors">
                <Mail size={24} className="text-green-600" />
                <span className="text-xs font-bold text-gray-600">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
