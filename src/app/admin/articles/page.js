'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, Eye, Save, X, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import { articles as initialArticles } from '@/lib/data';

export default function AdminArticlesPage() {
  const [articlesList, setArticlesList] = useState(initialArticles);
  const [editingArticle, setEditingArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: { id: '', en: '' },
    excerpt: { id: '', en: '' },
    category: { id: '', en: '' },
    date: new Date().toISOString().split('T')[0],
    image: '/images/hero-banner.png',
    status: 'draft',
  });

  const handleEdit = (article) => {
    setEditingArticle(article.id);
    setForm({
      title: { ...article.title },
      excerpt: { ...article.excerpt },
      category: { ...article.category },
      date: article.date,
      image: article.image,
      status: article.status || 'published',
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingArticle(null);
    setForm({
      title: { id: '', en: '' },
      excerpt: { id: '', en: '' },
      category: { id: '', en: '' },
      date: new Date().toISOString().split('T')[0],
      image: '/images/hero-banner.png',
      status: 'draft',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingArticle) {
      setArticlesList(prev => prev.map(a =>
        a.id === editingArticle ? { ...a, ...form } : a
      ));
    } else {
      setArticlesList(prev => [
        ...prev,
        { id: Date.now(), ...form },
      ]);
    }
    setShowForm(false);
    setEditingArticle(null);
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus artikel ini?')) {
      setArticlesList(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-gray-900 flex items-center gap-3">
            <FileText size={28} className="text-[var(--color-primary)]" /> Articles Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kelola konten artikel dan blog untuk halaman /artikel.</p>
        </div>
        <button onClick={handleNew} className="btn btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus size={16} /> Tulis Artikel Baru
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="clean-card p-4 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileText size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{articlesList.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Artikel</p>
          </div>
        </div>
        <div className="clean-card p-4 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Eye size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{articlesList.filter(a => (a.status || 'published') === 'published').length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Published</p>
          </div>
        </div>
        <div className="clean-card p-4 flex items-center gap-3 hover:translate-y-0">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center"><Edit2 size={20} /></div>
          <div>
            <p className="font-display font-black text-xl text-gray-900">{articlesList.filter(a => a.status === 'draft').length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Draft</p>
          </div>
        </div>
      </div>

      {/* Article Form Modal */}
      {showForm && (
        <div className="clean-card p-6 border-2 border-[var(--color-primary)] hover:translate-y-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-gray-900">
              {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
            </h2>
            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Judul (ID)</label>
              <input
                type="text"
                className="clean-input"
                value={form.title.id}
                onChange={e => setForm(p => ({ ...p, title: { ...p.title, id: e.target.value } }))}
                placeholder="Judul artikel dalam Bahasa Indonesia..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Title (EN)</label>
              <input
                type="text"
                className="clean-input"
                value={form.title.en}
                onChange={e => setForm(p => ({ ...p, title: { ...p.title, en: e.target.value } }))}
                placeholder="Article title in English..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Ringkasan (ID)</label>
              <textarea
                className="clean-input min-h-[80px]"
                value={form.excerpt.id}
                onChange={e => setForm(p => ({ ...p, excerpt: { ...p.excerpt, id: e.target.value } }))}
                placeholder="Ringkasan artikel..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Excerpt (EN)</label>
              <textarea
                className="clean-input min-h-[80px]"
                value={form.excerpt.en}
                onChange={e => setForm(p => ({ ...p, excerpt: { ...p.excerpt, en: e.target.value } }))}
                placeholder="Article excerpt..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Kategori (ID)</label>
              <input
                type="text"
                className="clean-input"
                value={form.category.id}
                onChange={e => setForm(p => ({ ...p, category: { ...p.category, id: e.target.value } }))}
                placeholder="e.g. Tips & Trik"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Category (EN)</label>
              <input
                type="text"
                className="clean-input"
                value={form.category.en}
                onChange={e => setForm(p => ({ ...p, category: { ...p.category, en: e.target.value } }))}
                placeholder="e.g. Tips & Tricks"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Tanggal</label>
              <input
                type="date"
                className="clean-input"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Status</label>
              <div className="flex gap-2">
                {['draft', 'published'].map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(p => ({ ...p, status: s }))}
                    className={`btn flex-1 py-2.5 text-xs ${form.status === s ? 'btn-primary' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                  >
                    {s === 'draft' ? '📝 Draft' : '✅ Published'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <button onClick={handleSave} className="btn btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
              <Save size={14} /> Simpan
            </button>
            <button onClick={() => setShowForm(false)} className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2.5 text-sm">
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="clean-card overflow-hidden hover:translate-y-0">
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <h2 className="font-display font-bold text-sm text-gray-900">Daftar Artikel</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {articlesList.map(article => (
            <div key={article.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={24} className="text-gray-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{article.title.id}</h4>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{article.excerpt.id}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[9px] text-gray-400 flex items-center gap-1"><Clock size={9} /> {article.date}</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-50 text-blue-600 flex items-center gap-1">
                    <Tag size={8} /> {article.category.id}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${(article.status || 'published') === 'published' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                    {(article.status || 'published') === 'published' ? '✅ Published' : '📝 Draft'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => handleEdit(article)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(article.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
