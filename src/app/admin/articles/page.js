'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Eye, Type, Image as ImageIcon, Bold, Italic, List, Grid, Link as LinkIcon,
  Code, Trash2, ArrowDown, ArrowUp, Plus, Save, Pencil, FileText, RefreshCw, Search, ArrowLeft,
} from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

const newTextBlock = () => ({ id: crypto.randomUUID(), type: 'text', title: '', content: '' });
const newImageBlock = () => ({ id: crypto.randomUUID(), type: 'image', url: '', publicId: '', caption: '' });

export default function AdminArticlesPage() {
  const [language, setLanguage] = useState('en');
  const [title, setTitle] = useState({ id: '', en: '' });
  const [activeTab, setActiveTab] = useState('Content');
  const [publishedGlobally, setPublishedGlobally] = useState(true);
  const [publishedEnglish, setPublishedEnglish] = useState(true);
  const [metaForm, setMetaForm] = useState({ metaTitle: '', metaDescription: '', keywords: '' });
  const [seoForm, setSeoForm] = useState({ slug: '', canonical: '' });
  const [author, setAuthor] = useState('Kulino Team');
  const [category, setCategory] = useState('Berita');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [blocks, setBlocks] = useState([
    { id: 'initial-text', type: 'text', title: '', content: '' },
    { id: 'initial-image', type: 'image', url: '', publicId: '', caption: '' },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savedArticles, setSavedArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [editingSlug, setEditingSlug] = useState(null);
  const [deletingArticle, setDeletingArticle] = useState(null);
  const [view, setView] = useState('list');
  const [articleQuery, setArticleQuery] = useState('');
  const [articleStatus, setArticleStatus] = useState('all');
  const [articleCategory, setArticleCategory] = useState('all');
  const fileInputs = useRef({});

  const currentTitle = title[language];
  const previewTitle = title[language] || title.id || title.en || 'Untitled article';
  const firstImage = useMemo(() => blocks.find((block) => block.type === 'image' && block.url)?.url, [blocks]);

  const loadArticles = useCallback(async () => {
    setLoadingArticles(true);
    try {
      const response = await fetch('/api/articles?admin=1', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Daftar artikel gagal dimuat.');
      setSavedArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoadingArticles(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadArticles, 0);
    return () => window.clearTimeout(timer);
  }, [loadArticles]);

  const resetEditor = () => {
    setView('editor');
    setEditingSlug(null);
    setTitle({ id: '', en: '' });
    setPublishedGlobally(true);
    setPublishedEnglish(true);
    setMetaForm({ metaTitle: '', metaDescription: '', keywords: '' });
    setSeoForm({ slug: '', canonical: '' });
    setAuthor('Kulino Team');
    setCategory('Berita');
    setTags([]);
    setTagInput('');
    setPublishedAt(new Date().toISOString().slice(0, 16));
    setBlocks([newTextBlock(), newImageBlock()]);
    setActiveTab('Content');
    setMessage('Editor siap untuk artikel baru.');
  };

  const editArticle = (article) => {
    setView('editor');
    setEditingSlug(article.slug);
    setTitle({ id: article.title?.id || '', en: article.title?.en || '' });
    setPublishedGlobally(Boolean(article.publishedGlobally));
    setPublishedEnglish(Boolean(article.publishedEnglish));
    setMetaForm({
      metaTitle: article.meta?.title || '',
      metaDescription: article.meta?.description || '',
      keywords: article.meta?.keywords || '',
    });
    setSeoForm({ slug: article.slug || '', canonical: article.meta?.canonical || '' });
    setAuthor(article.author || 'Kulino Team');
    setCategory(article.category?.id || 'Berita');
    setTags(Array.isArray(article.tags) ? article.tags : []);
    setPublishedAt(`${article.date || new Date().toISOString().slice(0, 10)}T09:00`);
    const content = Array.isArray(article.content) ? article.content : [];
    setBlocks(content.length
      ? content.map((block) => ({ ...block, id: block.id || crypto.randomUUID() }))
      : [newTextBlock(), { ...newImageBlock(), url: article.image || '', publicId: article.imagePublicId || '' }]);
    setActiveTab('Content');
    setMessage(`Mengedit artikel: ${article.title?.id || article.title?.en || article.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteArticle = async (articleToDelete) => {
    if (articleToDelete) { setDeletingArticle(articleToDelete); return; }
    const article = deletingArticle; if (!article) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Artikel gagal dihapus.');
      if (editingSlug === article.slug) resetEditor();
      setDeletingArticle(null);
      setMessage('Artikel berhasil dihapus.');
      await loadArticles();
    } catch (error) {
      setMessage(error.message);
    } finally { setSaving(false); }
  };

  const updateBlock = (id, field, value) => {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, [field]: value } : block));
  };

  const removeBlock = (id) => setBlocks((current) => current.filter((block) => block.id !== id));

  const moveBlock = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const appendFormatting = (id, text) => {
    setBlocks((current) => current.map((block) => block.id === id
      ? { ...block, content: `${block.content || ''}${block.content ? '\n' : ''}${text}` }
      : block));
  };

  const uploadImage = async (blockId, file) => {
    if (!file) return;
    setMessage('Mengunggah gambar…');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'kulino-pit/articles');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload gagal.');
      setBlocks((current) => current.map((block) => block.id === blockId
        ? { ...block, url: data.url, publicId: data.publicId }
        : block));
      setMessage('Gambar berhasil diunggah.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) setTags((current) => [...current, value]);
    setTagInput('');
  };

  const saveArticle = async (status) => {
    if (!title.id.trim() && !title.en.trim()) {
      setMessage('Isi judul artikel terlebih dahulu.');
      return;
    }
    setSaving(true);
    setShowSaveMenu(false);
    setMessage('');
    try {
      const response = await fetch(editingSlug ? `/api/articles/${encodeURIComponent(editingSlug)}` : '/api/articles', {
        method: editingSlug ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titleId: title.id || title.en,
          titleEn: title.en || title.id,
          slug: seoForm.slug,
          canonical: seoForm.canonical,
          blocks,
          image: firstImage,
          author,
          categoryId: category,
          categoryEn: category,
          tags,
          metaTitle: metaForm.metaTitle,
          metaDescription: metaForm.metaDescription,
          keywords: metaForm.keywords,
          publishedGlobally,
          publishedEnglish,
          publishedAt,
          status,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Artikel gagal disimpan.');
      setEditingSlug(data.slug);
      setSeoForm((current) => ({ ...current, slug: data.slug }));
      setMessage(status === 'published' ? `Artikel berhasil disimpan: /artikel/${data.slug}` : 'Draft berhasil disimpan.');
      await loadArticles();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const articleCategories = [...new Set(savedArticles.map((article) => article.category?.id).filter(Boolean))].sort();
  const filteredArticles = savedArticles.filter((article) => {
    const query = articleQuery.toLowerCase().trim();
    const searchable = `${article.title?.id || ''} ${article.title?.en || ''} ${article.author || ''} ${(article.tags || []).join(' ')}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (articleStatus === 'all' || article.status === articleStatus)
      && (articleCategory === 'all' || article.category?.id === articleCategory);
  });

  if (deletingArticle) return <AdminConfirmPage title="Hapus Artikel?" description={`Artikel “${deletingArticle.title?.id || deletingArticle.slug}” akan dihapus permanen.`} busy={saving} onCancel={() => setDeletingArticle(null)} onConfirm={deleteArticle} />;

  if (showPreview) {
    return (
      <div className="space-y-6 pb-12 animate-fade-in">
        <header className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><button onClick={() => setShowPreview(false)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100" aria-label="Kembali ke editor"><ArrowLeft size={20} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Preview Artikel</p><h1 className="font-display text-2xl font-black text-gray-900">Pratinjau halaman publik</h1><p className="mt-1 text-sm text-gray-500">Preview dibuka sebagai halaman, bukan popup.</p></div></div><button onClick={() => setShowPreview(false)} className="btn border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700">Kembali ke Editor</button></header>
        <article className="mx-auto w-full max-w-4xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"><p className="text-xs font-bold uppercase text-blue-600">{category}</p><h1 className="mt-2 font-display text-3xl font-black sm:text-5xl">{previewTitle}</h1><p className="mt-3 text-sm text-gray-500">{author} · {publishedAt.replace('T', ' ')}</p>{firstImage && <Image src={firstImage} alt="Article preview" width={1200} height={720} className="mt-7 max-h-[32rem] w-full rounded-2xl object-cover" unoptimized />}<div className="mt-8 space-y-7">{blocks.filter((block) => block.type === 'text').map((block) => <section key={block.id}>{block.title && <h2 className="font-display text-2xl font-bold">{block.title}</h2>}<p className="mt-2 whitespace-pre-wrap leading-8 text-gray-700">{block.content}</p></section>)}</div></article>
      </div>
    );
  }

  if (view === 'list') {
    const publishedCount = savedArticles.filter((article) => article.status === 'published').length;
    const draftCount = savedArticles.filter((article) => article.status === 'draft').length;
    return (
      <div className="space-y-6 pb-12 animate-fade-in">
        <header className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Content Management</p><h1 className="mt-1 flex items-center gap-2 font-display text-3xl font-black text-gray-900"><FileText className="text-blue-600" /> Artikel</h1><p className="mt-1 text-sm text-gray-500">Kelola artikel lama, draft, dan artikel terbit dari satu daftar.</p></div><button onClick={resetEditor} className="btn btn-primary flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold"><Plus size={17} /> Tambah Artikel</button></header>

        {message && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-700">{message}</div>}

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 sm:p-6">
            <div className="flex flex-wrap gap-4 border-b border-gray-100 pb-4 text-sm font-bold">{[['all', `Semua (${savedArticles.length})`], ['published', `Terbit (${publishedCount})`], ['draft', `Draft (${draftCount})`]].map(([status, label]) => <button key={status} onClick={() => setArticleStatus(status)} className={articleStatus === status ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}>{label}</button>)}</div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto]"><label className="relative"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={articleQuery} onChange={(event) => setArticleQuery(event.target.value)} className="clean-input pl-10" placeholder="Cari judul, penulis, atau tag…" /></label><select value={articleCategory} onChange={(event) => setArticleCategory(event.target.value)} className="clean-input"><option value="all">Semua kategori</option>{articleCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select><select value={articleStatus} onChange={(event) => setArticleStatus(event.target.value)} className="clean-input"><option value="all">Semua status</option><option value="published">Terbit</option><option value="draft">Draft</option></select><button onClick={loadArticles} className="btn flex items-center justify-center gap-2 border border-gray-200 px-4 text-sm font-bold text-gray-600"><RefreshCw size={15} className={loadingArticles ? 'animate-spin' : ''} /> Muat ulang</button></div>
          </div>

          {loadingArticles ? <div className="p-12 text-center text-sm text-gray-400">Memuat artikel…</div> : filteredArticles.length === 0 ? <div className="p-12 text-center"><FileText className="mx-auto text-gray-300" size={38} /><p className="mt-3 text-sm font-bold text-gray-600">Artikel tidak ditemukan.</p></div> : <>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-gray-50 text-[11px] font-black uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-4">Judul</th><th className="px-5 py-4">Penulis</th><th className="px-5 py-4">Kategori</th><th className="px-5 py-4">Tag</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Tanggal</th><th className="px-5 py-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredArticles.map((article) => <tr key={article.slug} className="hover:bg-blue-50/30"><td className="px-5 py-4"><button onClick={() => editArticle(article)} className="max-w-xs text-left font-black text-blue-700 hover:underline">{article.title?.id || article.title?.en || article.slug}</button><p className="mt-1 max-w-xs truncate text-xs text-gray-400">/{article.slug}</p></td><td className="px-5 py-4 text-gray-600">{article.author || '—'}</td><td className="px-5 py-4 font-semibold text-gray-700">{article.category?.id || '—'}</td><td className="px-5 py-4"><div className="flex max-w-48 flex-wrap gap-1">{(article.tags || []).slice(0, 3).map((tag) => <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-[10px] text-gray-600">{tag}</span>)}</div></td><td className="px-5 py-4"><StatusBadge status={article.status} /></td><td className="px-5 py-4 text-gray-500">{article.date}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => editArticle(article)} className="rounded-lg bg-blue-50 p-2 text-blue-600" title="Edit"><Pencil size={15} /></button><button onClick={() => deleteArticle(article)} className="rounded-lg bg-red-50 p-2 text-red-600" title="Hapus"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
            <div className="divide-y divide-gray-100 md:hidden">{filteredArticles.map((article) => <article key={article.slug} className="p-5"><div className="flex items-start justify-between gap-3"><div><button onClick={() => editArticle(article)} className="text-left font-black text-blue-700">{article.title?.id || article.title?.en || article.slug}</button><p className="mt-1 text-xs text-gray-400">{article.author || '—'} · {article.date}</p></div><StatusBadge status={article.status} /></div><p className="mt-3 text-xs font-semibold text-gray-500">{article.category?.id || 'Tanpa kategori'}</p><div className="mt-4 flex gap-2"><button onClick={() => editArticle(article)} className="btn flex flex-1 items-center justify-center gap-2 border border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700"><Pencil size={14} /> Edit</button><button onClick={() => deleteArticle(article)} className="btn border border-red-200 bg-red-50 px-4 text-red-600"><Trash2 size={14} /></button></div></article>)}</div>
          </>}
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6">
      <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3"><button onClick={() => setView('list')} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100" aria-label="Kembali ke daftar artikel"><ArrowLeft size={20} /></button><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Editor Artikel</p><h1 className="truncate font-display text-2xl font-black text-gray-900">{editingSlug ? 'Edit Artikel' : 'Tambah Artikel'}</h1><p className="mt-1 text-sm text-gray-500">Editor halaman penuh, tanpa popup.</p></div></div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm"><option value="en">English</option><option value="id">Indonesia</option></select>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50"><Eye size={16} /> Preview</button>
          <div className="relative flex"><button disabled={saving} onClick={() => saveArticle('published')} className="rounded-l-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Save size={15} className="mr-1 inline" />{saving ? 'Saving…' : editingSlug ? 'Update' : 'Publish'}</button><button onClick={() => setShowSaveMenu((value) => !value)} className="rounded-r-xl border-l border-blue-700 bg-blue-600 px-3 text-white">▾</button>{showSaveMenu && <div className="absolute right-0 top-12 z-20 w-40 rounded-xl border bg-white p-1 shadow-lg"><button onClick={() => saveArticle('draft')} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">Save as draft</button></div>}</div>
        </div>
      </header>

      <div className="mb-6">
        <input
          value={currentTitle}
          onChange={(event) => setTitle((current) => ({ ...current, [language]: event.target.value }))}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={language === 'id' ? 'Judul artikel…' : 'Article title…'}
        />
      </div>

      {message && <div className={`mb-4 rounded-xl border p-3 text-sm font-semibold ${message.includes('gagal') || message.includes('Isi ') ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>{message}</div>}

      <div className="flex flex-col gap-6 lg:flex-row">
        <main className="flex-1">
          <div className="flex gap-1 rounded-t-xl border border-gray-200 bg-white p-1">
            {['Content', 'Meta', 'SEO'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-6 py-2.5 text-sm font-semibold ${activeTab === tab ? 'border bg-gray-50 text-blue-600 shadow-sm' : 'text-gray-500'}`}>{tab}</button>)}
          </div>
          <div className="min-h-[600px] rounded-b-xl border border-t-0 border-gray-200 bg-white p-6 shadow-sm">
            {activeTab === 'Content' && <div className="space-y-5">
              {blocks.map((block, index) => <section key={block.id} className="overflow-hidden rounded-xl border border-gray-100">
                <header className="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
                  <span className="text-sm font-semibold text-blue-600">{block.type === 'text' ? 'Text' : 'Image'}</span>
                  <div className="flex gap-1 text-gray-500">
                    <button title="Hapus blok" onClick={() => removeBlock(block.id)} className="rounded p-1.5 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                    <button title="Pindah ke bawah" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)} className="rounded p-1.5 hover:bg-white disabled:opacity-30"><ArrowDown size={14} /></button>
                    <button title="Pindah ke atas" disabled={index === 0} onClick={() => moveBlock(index, -1)} className="rounded p-1.5 hover:bg-white disabled:opacity-30"><ArrowUp size={14} /></button>
                  </div>
                </header>
                <div className="p-4">
                  {block.type === 'text' ? <>
                    <div className="mb-4 flex w-max items-center gap-1 rounded-lg border p-1 text-gray-500">
                      <button title="Heading" onClick={() => appendFormatting(block.id, '## Judul bagian')} className="rounded p-1.5 hover:bg-gray-100"><Type size={16} /></button>
                      <button title="Bold" onClick={() => appendFormatting(block.id, '**teks tebal**')} className="rounded p-1.5 hover:bg-gray-100"><Bold size={16} /></button>
                      <button title="Italic" onClick={() => appendFormatting(block.id, '*teks miring*')} className="rounded p-1.5 hover:bg-gray-100"><Italic size={16} /></button>
                      <button title="List" onClick={() => appendFormatting(block.id, '- Item 1\n- Item 2')} className="rounded p-1.5 hover:bg-gray-100"><List size={16} /></button>
                      <button title="Table" onClick={() => appendFormatting(block.id, '| Kolom 1 | Kolom 2 |\n| --- | --- |\n| Isi | Isi |')} className="rounded p-1.5 hover:bg-gray-100"><Grid size={16} /></button>
                      <button title="Link" onClick={() => appendFormatting(block.id, '[Teks tautan](https://example.com)')} className="rounded p-1.5 hover:bg-gray-100"><LinkIcon size={16} /></button>
                      <button title="Code" onClick={() => appendFormatting(block.id, '`kode`')} className="rounded p-1.5 hover:bg-gray-100"><Code size={16} /></button>
                    </div>
                    <input value={block.title || ''} onChange={(event) => updateBlock(block.id, 'title', event.target.value)} className="mb-3 w-full text-xl font-bold focus:outline-none" placeholder="Heading…" />
                    <textarea value={block.content || ''} onChange={(event) => updateBlock(block.id, 'content', event.target.value)} className="min-h-36 w-full resize-y text-gray-600 focus:outline-none" placeholder="Start typing…" />
                  </> : <div className="space-y-3">
                    <input ref={(node) => { fileInputs.current[block.id] = node; }} type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(block.id, event.target.files?.[0])} />
                    <button onClick={() => fileInputs.current[block.id]?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-blue-50/30 p-6 text-sm font-medium text-blue-600"><ImageIcon size={20} /> {block.url ? 'Ganti gambar' : 'Upload a file'}</button>
                    {block.url && <Image src={block.url} alt={block.caption || 'Preview'} width={900} height={540} className="max-h-64 w-auto rounded-xl object-cover" unoptimized />}
                    <input value={block.caption || ''} onChange={(event) => updateBlock(block.id, 'caption', event.target.value)} className="w-full rounded-lg border px-4 py-2" placeholder="Caption" />
                  </div>}
                </div>
              </section>)}
              <div className="flex gap-2"><button onClick={() => setBlocks((current) => [...current, newTextBlock()])} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"><Plus size={16} /> Text block</button><button onClick={() => setBlocks((current) => [...current, newImageBlock()])} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"><Plus size={16} /> Image block</button></div>
            </div>}
            {activeTab === 'Meta' && <div className="max-w-2xl space-y-5">{[['Meta Title', 'metaTitle'], ['Keywords', 'keywords']].map(([label, key]) => <label key={key} className="block text-sm font-bold text-gray-700">{label}<input value={metaForm[key]} onChange={(event) => setMetaForm((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 w-full rounded-lg border px-4 py-2 font-normal" /></label>)}<label className="block text-sm font-bold text-gray-700">Meta Description<textarea value={metaForm.metaDescription} onChange={(event) => setMetaForm((current) => ({ ...current, metaDescription: event.target.value }))} className="mt-2 h-28 w-full rounded-lg border px-4 py-2 font-normal" /></label></div>}
            {activeTab === 'SEO' && <div className="max-w-2xl space-y-5"><label className="block text-sm font-bold">URL Slug<input value={seoForm.slug} onChange={(event) => setSeoForm((current) => ({ ...current, slug: event.target.value }))} className="mt-2 w-full rounded-lg border px-4 py-2 font-normal" placeholder="judul-artikel" /></label><label className="block text-sm font-bold">Canonical URL<input value={seoForm.canonical} onChange={(event) => setSeoForm((current) => ({ ...current, canonical: event.target.value }))} className="mt-2 w-full rounded-lg border px-4 py-2 font-normal" placeholder="https://" /></label></div>}
          </div>
        </main>

        <aside className="w-full space-y-5 lg:w-80">
          <label className="block text-sm font-medium text-gray-600">Author<input value={author} onChange={(event) => setAuthor(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-3 py-2 shadow-sm" /></label>
          <label className="block text-sm font-medium text-gray-600">Post date<input type="datetime-local" value={publishedAt} onChange={(event) => setPublishedAt(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-3 py-2 shadow-sm" /></label>
          <label className="block text-sm font-medium text-gray-600">Category<input value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-3 py-2 shadow-sm" /></label>
          <div><label className="text-sm font-medium text-gray-600">Tags</label><div className="mt-2 flex gap-2"><input value={tagInput} onChange={(event) => setTagInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} className="min-w-0 flex-1 rounded-lg border px-3 py-2" /><button onClick={addTag} className="rounded-lg border bg-white px-3"><Plus size={16} /></button></div><div className="mt-2 flex flex-wrap gap-2">{tags.map((tag) => <button key={tag} onClick={() => setTags((current) => current.filter((item) => item !== tag))} className="rounded-full bg-gray-100 px-2 py-1 text-xs">{tag} ×</button>)}</div></div>
          {[['Published globally', publishedGlobally, setPublishedGlobally], ['Published in English', publishedEnglish, setPublishedEnglish]].map(([label, value, setter]) => <div key={label} className="flex items-center justify-between"><span className="text-sm font-medium">{label}</span><button onClick={() => setter(!value)} className={`flex h-6 w-10 items-center rounded-full px-1 ${value ? 'bg-green-400' : 'bg-gray-300'}`}><span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : ''}`} /></button></div>)}
        </aside>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{status === 'published' ? 'Terbit' : 'Draft'}</span>;
}
