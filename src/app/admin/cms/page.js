'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Shield, FileText, Globe, Search, CheckCircle2, AlertTriangle, XCircle, 
  Clock, Eye, Edit3, BarChart3, TrendingUp, ChevronDown, ChevronRight,
  ExternalLink, RefreshCcw, Filter, History, Zap, Languages, Lock, 
  Image as ImageIcon, Smartphone, Monitor, FileCheck, AlertCircle,
  ArrowUpRight, Layers, PieChart, Activity
} from 'lucide-react';
import { pageRegistry, auditLogs, getContentHealthScore, getSEOStatus, getI18nCoverage } from '@/lib/cms-store';

/* ─── Overview Tab ─── */
function OverviewTab() {
  const totalSections = pageRegistry.reduce((sum, p) => sum + p.sections.length, 0);
  const totalFields = pageRegistry.reduce((sum, p) => sum + p.sections.reduce((s, sec) => s + sec.fields.length, 0), 0);
  const avgSEO = Math.round(pageRegistry.reduce((sum, p) => sum + getSEOStatus(p.id).score, 0) / pageRegistry.length);
  const avgHealth = Math.round(pageRegistry.reduce((sum, p) => sum + getContentHealthScore(p).score, 0) / pageRegistry.length);

  const categoryGroups = useMemo(() => {
    const groups = {};
    pageRegistry.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, []);

  const categoryColors = {
    'Halaman Utama': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    'Halaman Info': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    'Katalog': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    'Konten': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    'Formulir': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    'Portal': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
    'Legal': { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Halaman', value: pageRegistry.length, icon: <FileText size={20} />, color: 'blue', sub: 'Public pages' },
          { label: 'Total Seksi', value: totalSections, icon: <Layers size={20} />, color: 'purple', sub: `${totalFields} fields` },
          { label: 'SEO Score', value: `${avgSEO}%`, icon: <TrendingUp size={20} />, color: 'green', sub: avgSEO >= 70 ? 'Baik' : 'Perlu perbaikan' },
          { label: 'Content Health', value: `${avgHealth}%`, icon: <Activity size={20} />, color: 'amber', sub: avgHealth >= 70 ? 'Sehat' : 'Perlu update' },
        ].map((stat, i) => (
          <div key={i} className="clean-card p-5 hover:translate-y-0">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">{stat.sub}</span>
            </div>
            <p className="font-display font-black text-2xl text-gray-900">{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Page Map by Category */}
      <div className="clean-card overflow-hidden hover:translate-y-0">
        <div className="p-5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
            <PieChart size={16} className="text-[var(--color-primary)]" /> Peta Konten Website
          </h2>
          <span className="text-[10px] font-bold text-gray-400">{pageRegistry.length} halaman terdaftar</span>
        </div>

        <div className="p-5 space-y-6">
          {Object.entries(categoryGroups).map(([cat, pages]) => {
            const colors = categoryColors[cat] || categoryColors['Legal'];
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {cat}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{pages.length} halaman</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pages.map(page => {
                    const health = getContentHealthScore(page);
                    const seo = getSEOStatus(page.id);
                    return (
                      <div key={page.id} className="p-4 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-all group cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-display font-bold text-sm text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{page.name}</h4>
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${health.color === 'green' ? 'bg-green-400' : health.color === 'blue' ? 'bg-blue-400' : health.color === 'yellow' ? 'bg-yellow-400' : health.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'}`} title={health.label} />
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mb-2">{page.path}</p>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500">
                          <span>{page.sections.length} seksi</span>
                          <span>•</span>
                          <span>SEO: {seo.score}%</span>
                          <span>•</span>
                          <span className={health.color === 'green' ? 'text-green-600' : health.color === 'red' ? 'text-red-500' : ''}>{health.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Content Health Tab ─── */
function ContentHealthTab() {
  const [expandedPage, setExpandedPage] = useState(null);

  return (
    <div className="space-y-6">
      {/* Health Summary Bar */}
      <div className="clean-card p-5 hover:translate-y-0">
        <h3 className="font-display font-bold text-sm text-gray-900 mb-4">Content Freshness Overview</h3>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
          {(() => {
            const fresh = pageRegistry.filter(p => getContentHealthScore(p).color === 'green').length;
            const good = pageRegistry.filter(p => getContentHealthScore(p).color === 'blue').length;
            const review = pageRegistry.filter(p => getContentHealthScore(p).color === 'yellow').length;
            const update = pageRegistry.filter(p => getContentHealthScore(p).color === 'orange').length;
            const stale = pageRegistry.filter(p => getContentHealthScore(p).color === 'red').length;
            const total = pageRegistry.length;
            return (
              <>
                {fresh > 0 && <div className="bg-green-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: `${(fresh/total)*100}%` }}>{fresh}</div>}
                {good > 0 && <div className="bg-blue-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: `${(good/total)*100}%` }}>{good}</div>}
                {review > 0 && <div className="bg-yellow-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: `${(review/total)*100}%` }}>{review}</div>}
                {update > 0 && <div className="bg-orange-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: `${(update/total)*100}%` }}>{update}</div>}
                {stale > 0 && <div className="bg-red-400 flex items-center justify-center text-white text-[9px] font-bold" style={{ width: `${(stale/total)*100}%` }}>{stale}</div>}
              </>
            );
          })()}
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {[
            { label: 'Segar (≤3 hari)', color: 'bg-green-400' },
            { label: 'Baik (≤7 hari)', color: 'bg-blue-400' },
            { label: 'Perlu Review (≤14 hari)', color: 'bg-yellow-400' },
            { label: 'Perlu Update (≤30 hari)', color: 'bg-orange-400' },
            { label: 'Kadaluarsa (>30 hari)', color: 'bg-red-400' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[9px] font-bold text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Page by Page Health */}
      <div className="space-y-3">
        {pageRegistry.map(page => {
          const health = getContentHealthScore(page);
          const isExpanded = expandedPage === page.id;
          const modified = new Date(page.lastModified);
          const timeAgo = Math.floor((new Date('2026-10-05T12:00:00') - modified) / (1000 * 60 * 60 * 24));

          return (
            <div key={page.id} className="clean-card overflow-hidden hover:translate-y-0">
              <button 
                onClick={() => setExpandedPage(isExpanded ? null : page.id)}
                className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
              >
                {/* Health Indicator */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-display font-black text-sm
                  ${health.color === 'green' ? 'bg-green-50 text-green-600' :
                    health.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    health.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                    health.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                    'bg-red-50 text-red-600'}`}
                >
                  {health.score}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display font-bold text-sm text-gray-900">{page.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                    <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo === 0 ? 'Hari ini' : `${timeAgo} hari lalu`}</span>
                    <span>•</span>
                    <span>{page.sections.length} seksi</span>
                    <span>•</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold
                      ${health.color === 'green' ? 'bg-green-50 text-green-600' :
                        health.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                        health.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                        health.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                        'bg-red-50 text-red-600'}`}
                    >{health.label}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={page.path} target="_blank" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[var(--color-primary)] transition-colors" onClick={e => e.stopPropagation()}>
                    <ExternalLink size={14} />
                  </Link>
                  {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
                  <div className="space-y-2">
                    {page.sections.map(section => (
                      <div key={section.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0
                          ${section.type === 'content' ? 'bg-blue-100 text-blue-600' :
                            section.type === 'data' ? 'bg-emerald-100 text-emerald-600' :
                            section.type === 'form' ? 'bg-pink-100 text-pink-600' :
                            'bg-purple-100 text-purple-600'}`}
                        >
                          {section.type === 'content' ? <FileText size={14} /> :
                           section.type === 'data' ? <BarChart3 size={14} /> :
                           section.type === 'form' ? <FileCheck size={14} /> :
                           <Zap size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">{section.name}</p>
                          <p className="text-[9px] text-gray-400">
                            {section.fields.join(', ')}
                            {section.count && ` • ${section.count} items`}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold
                          ${section.type === 'content' ? 'bg-blue-50 text-blue-600' :
                            section.type === 'data' ? 'bg-emerald-50 text-emerald-600' :
                            section.type === 'form' ? 'bg-pink-50 text-pink-600' :
                            'bg-purple-50 text-purple-600'}`}
                        >{section.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SEO Audit Tab ─── */
function SEOAuditTab() {
  const avgSEO = Math.round(pageRegistry.reduce((sum, p) => sum + getSEOStatus(p.id).score, 0) / pageRegistry.length);
  const passCount = pageRegistry.filter(p => getSEOStatus(p.id).score >= 80).length;
  const warnCount = pageRegistry.filter(p => { const s = getSEOStatus(p.id).score; return s >= 50 && s < 80; }).length;
  const failCount = pageRegistry.filter(p => getSEOStatus(p.id).score < 50).length;

  return (
    <div className="space-y-6">
      {/* SEO Score Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="clean-card p-5 text-center hover:translate-y-0">
          <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center font-display font-black text-2xl mb-3
            ${avgSEO >= 70 ? 'bg-green-50 text-green-600' : avgSEO >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
            {avgSEO}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rata-rata SEO Score</p>
        </div>
        <div className="clean-card p-5 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{passCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pass (≥80)</p>
          </div>
        </div>
        <div className="clean-card p-5 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center"><AlertTriangle size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{warnCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Warning (50-79)</p>
          </div>
        </div>
        <div className="clean-card p-5 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><XCircle size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{failCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Fail (&lt;50)</p>
          </div>
        </div>
      </div>

      {/* SEO Detail Per Page */}
      <div className="clean-card overflow-hidden hover:translate-y-0">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
            <Search size={16} className="text-[var(--color-primary)]" /> SEO Audit Per Halaman
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500">Halaman</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">Title Tag</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">Meta Desc</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">H1</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">OG Tags</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">Schema</th>
                <th className="p-3 text-[9px] font-bold uppercase tracking-wider text-gray-500 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRegistry.map(page => {
                const seo = getSEOStatus(page.id);
                const Check = () => <CheckCircle2 size={14} className="text-green-500 mx-auto" />;
                const Fail = () => <XCircle size={14} className="text-red-400 mx-auto" />;
                return (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-900">{page.name}</p>
                      </div>
                      <p className="text-[9px] text-gray-400 font-mono">{page.path}</p>
                    </td>
                    <td className="p-3 text-center">{seo.title ? <Check /> : <Fail />}</td>
                    <td className="p-3 text-center">{seo.meta ? <Check /> : <Fail />}</td>
                    <td className="p-3 text-center">{seo.h1 ? <Check /> : <Fail />}</td>
                    <td className="p-3 text-center">{seo.og ? <Check /> : <Fail />}</td>
                    <td className="p-3 text-center">{seo.schema ? <Check /> : <Fail />}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${seo.score >= 80 ? 'bg-green-50 text-green-600' : seo.score >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                        {seo.score}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── i18n Tab ─── */
function I18nTab() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="clean-card p-5 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg">🇮🇩</div>
            <div>
              <p className="font-display font-bold text-sm text-gray-900">Bahasa Indonesia</p>
              <p className="text-[10px] text-gray-500 font-semibold">Bahasa utama</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.round(pageRegistry.reduce((sum, p) => sum + getI18nCoverage(p.id).id, 0) / pageRegistry.length)}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-900">{Math.round(pageRegistry.reduce((sum, p) => sum + getI18nCoverage(p.id).id, 0) / pageRegistry.length)}%</span>
          </div>
        </div>
        <div className="clean-card p-5 hover:translate-y-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">🇬🇧</div>
            <div>
              <p className="font-display font-bold text-sm text-gray-900">English</p>
              <p className="text-[10px] text-gray-500 font-semibold">Secondary language</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.round(pageRegistry.reduce((sum, p) => sum + getI18nCoverage(p.id).en, 0) / pageRegistry.length)}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-900">{Math.round(pageRegistry.reduce((sum, p) => sum + getI18nCoverage(p.id).en, 0) / pageRegistry.length)}%</span>
          </div>
        </div>
      </div>

      {/* Per Page Breakdown */}
      <div className="clean-card overflow-hidden hover:translate-y-0">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
            <Languages size={16} className="text-[var(--color-primary)]" /> Cakupan Terjemahan Per Halaman
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {pageRegistry.map(page => {
            const i18n = getI18nCoverage(page.id);
            return (
              <div key={page.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{page.name}</h4>
                    <p className="text-[9px] text-gray-400 font-mono">{page.path}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {i18n.id < 100 && <span className="text-[9px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">ID: {i18n.id}%</span>}
                    {i18n.en < 100 && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">EN: {i18n.en}%</span>}
                    {i18n.id === 100 && i18n.en === 100 && (
                      <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 size={10} /> Lengkap
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-gray-500 w-5">🇮🇩</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i18n.id === 100 ? 'bg-green-400' : i18n.id >= 80 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${i18n.id}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 w-8 text-right">{i18n.id}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-bold text-gray-500 w-5">🇬🇧</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i18n.en === 100 ? 'bg-green-400' : i18n.en >= 80 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${i18n.en}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-gray-600 w-8 text-right">{i18n.en}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Audit Log Tab ─── */
function AuditLogTab() {
  const [filterAction, setFilterAction] = useState('all');
  const filtered = filterAction === 'all' ? auditLogs : auditLogs.filter(l => l.action === filterAction);

  const actionColors = {
    create: { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={14} /> },
    update: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Edit3 size={14} /> },
    delete: { bg: 'bg-red-50', text: 'text-red-600', icon: <XCircle size={14} /> },
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400" />
        {['all', 'create', 'update', 'delete'].map(f => (
          <button
            key={f}
            onClick={() => setFilterAction(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-colors
              ${filterAction === f 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {f === 'all' ? 'Semua' : f === 'create' ? 'Buat' : f === 'update' ? 'Update' : 'Hapus'}
          </button>
        ))}
      </div>

      {/* Log Timeline */}
      <div className="clean-card overflow-hidden hover:translate-y-0">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-gray-900 flex items-center gap-2">
            <History size={16} className="text-[var(--color-primary)]" /> Riwayat Perubahan Konten
          </h2>
          <span className="text-[10px] font-bold text-gray-400">{filtered.length} entries</span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map(log => {
            const ac = actionColors[log.action];
            const time = new Date(log.timestamp);
            return (
              <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg ${ac.bg} ${ac.text} flex items-center justify-center shrink-0 mt-0.5`}>
                  {ac.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${ac.bg} ${ac.text}`}>{log.action}</span>
                    <span className="text-xs font-bold text-gray-900">{log.page}</span>
                    <span className="text-[10px] text-gray-400">› {log.section}</span>
                  </div>
                  <p className="text-xs text-gray-600">{log.detail}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] text-gray-400 flex items-center gap-1">
                      <Clock size={9} /> {time.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[9px] text-gray-400">oleh {log.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Quick Actions Tab ─── */
function QuickActionsTab() {
  const adminPages = [
    { label: 'Kelola Bookings', desc: 'Review & manage incoming rentals', href: '/admin/bookings', icon: <FileCheck size={20} />, color: 'blue' },
    { label: 'Kelola Fleet & Sepeda', desc: 'Add, edit bike inventory & pricing', href: '/admin/fleet', icon: <RefreshCcw size={20} />, color: 'emerald' },
    { label: 'Kelola Partners', desc: 'Review partner applications', href: '/admin/partners', icon: <Shield size={20} />, color: 'purple' },
    { label: 'Kelola Artikel', desc: 'Create & manage blog articles', href: '/admin/articles', icon: <FileText size={20} />, color: 'amber' },
    { label: 'Kelola Tours & Trips', desc: 'Manage tour categories & packages', href: '/admin/tours', icon: <Globe size={20} />, color: 'pink' },
    { label: 'Spin & Win Prizes', desc: 'Configure spin wheel prizes', href: '/admin/spin-prizes', icon: <Zap size={20} />, color: 'indigo' },
  ];

  const publicPages = pageRegistry.map(p => ({
    name: p.name,
    path: p.path,
    sections: p.sections.length,
    health: getContentHealthScore(p),
    seo: getSEOStatus(p.id),
  }));

  return (
    <div className="space-y-8">
      {/* Admin CMS Pages */}
      <div>
        <h3 className="font-display font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-gray-400" /> Admin CMS Pages
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminPages.map((page, i) => (
            <Link key={i} href={page.href} className={`clean-card p-5 group hover:bg-${page.color}-50 transition-all hover:translate-y-0 block`}>
              <div className={`w-12 h-12 rounded-xl bg-${page.color}-50 text-${page.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {page.icon}
              </div>
              <h4 className="font-display font-bold text-sm text-gray-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors">{page.label}</h4>
              <p className="text-[10px] text-gray-500">{page.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                Buka <ArrowUpRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Public Pages Quick Access */}
      <div>
        <h3 className="font-display font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
          <Globe size={16} className="text-gray-400" /> Public Pages (Preview)
        </h3>
        <div className="clean-card overflow-hidden hover:translate-y-0">
          <div className="divide-y divide-gray-50">
            {publicPages.map((page, i) => (
              <Link key={i} href={page.path} target="_blank" className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group">
                <div className={`w-2 h-2 rounded-full shrink-0
                  ${page.health.color === 'green' ? 'bg-green-400' :
                    page.health.color === 'blue' ? 'bg-blue-400' :
                    page.health.color === 'yellow' ? 'bg-yellow-400' :
                    page.health.color === 'orange' ? 'bg-orange-400' :
                    'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{page.name}</p>
                  <p className="text-[9px] text-gray-400 font-mono">{page.path}</p>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400">
                  <span>{page.sections} seksi</span>
                  <span className={`px-1.5 py-0.5 rounded
                    ${page.seo.score >= 80 ? 'bg-green-50 text-green-600' : page.seo.score >= 50 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>
                    SEO {page.seo.score}%
                  </span>
                </div>
                <ExternalLink size={12} className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main CMS Audit Page ─── */
export default function CMSAuditPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <PieChart size={16} /> },
    { id: 'health', label: 'Content Health', icon: <Activity size={16} /> },
    { id: 'seo', label: 'SEO Audit', icon: <Search size={16} /> },
    { id: 'i18n', label: 'i18n / Bahasa', icon: <Languages size={16} /> },
    { id: 'logs', label: 'Audit Log', icon: <History size={16} /> },
    { id: 'actions', label: 'Quick Actions', icon: <Zap size={16} /> },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 flex items-center gap-3">
            <Shield size={28} className="text-[var(--color-primary)]" /> CMS Audit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau, audit, dan kelola seluruh konten website Kulino Pit dari satu dashboard.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <RefreshCcw size={14} /> Refresh
          </button>
          <Link href="/" target="_blank" className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Eye size={14} /> Preview Site
          </Link>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn px-5 py-2.5 text-xs whitespace-nowrap flex items-center gap-2 shrink-0
              ${activeTab === tab.id 
                ? 'btn-primary shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'health' && <ContentHealthTab />}
        {activeTab === 'seo' && <SEOAuditTab />}
        {activeTab === 'i18n' && <I18nTab />}
        {activeTab === 'logs' && <AuditLogTab />}
        {activeTab === 'actions' && <QuickActionsTab />}
      </div>
    </div>
  );
}
