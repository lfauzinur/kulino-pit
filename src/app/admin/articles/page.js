'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye, Type, Image as ImageIcon, Bold, Italic, List, Grid, Link as LinkIcon,
  Code, Trash2, ArrowDown, ArrowUp, Plus, Save, X, Pencil, FileText, RefreshCw,
} from 'lucide-react';

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

  const deleteArticle = async (article) => {
    if (!window.confirm(`Hapus artikel “${article.title?.id || article.slug}”?`)) return;
    try {
      const response = await fetch(`/api/articles/${encodeURIComponent(article.slug)}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Artikel gagal dihapus.');
      if (editingSlug === article.slug) resetEditor();
      setMessage('Artikel berhasil dihapus.');
      await loadArticles();
    } catch (error) {
      setMessage(error.message);
    }
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 p-4 sm:p-6">
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-black text-gray-900"><FileText size={19} className="text-blue-600" /> Artikel Tersimpan</h2>
            <p className="mt-1 text-xs text-gray-500">Pilih artikel lama untuk mengeditnya, atau buat artikel baru.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadArticles} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"><RefreshCw size={14} /> Muat ulang</button>
            <button onClick={resetEditor} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Plus size={14} /> Artikel baru</button>
          </div>
        </div>
        {loadingArticles ? (
          <div className="rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-400">Memuat artikel…</div>
        ) : savedArticles.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-5 text-center text-xs text-gray-400">Belum ada artikel di database.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedArticles.map((article) => (
              <article key={article.slug} className={`rounded-xl border p-3 transition-colors ${editingSlug === article.slug ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100 bg-gray-50/70'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-gray-900">{article.title?.id || article.title?.en || article.slug}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{article.status} · {article.date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[9px] font-black ${article.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{article.status === 'published' ? 'TAYANG' : 'DRAFT'}</span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3">
                  <button onClick={() => editArticle(article)} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-600 shadow-sm hover:bg-blue-50"><Pencil size={13} /> Edit</button>
                  <button onClick={() => deleteArticle(article)} className="flex items-center justify-center rounded-lg bg-white px-3 py-2 text-red-500 shadow-sm hover:bg-red-50" title="Hapus artikel"><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={currentTitle}
          onChange={(event) => setTitle((current) => ({ ...current, [language]: event.target.value }))}
          className="w-full flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:max-w-2xl"
          placeholder={language === 'id' ? 'Judul artikel…' : 'Article title…'}
        />
        <div className="flex items-center gap-2">
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <option value="en">English</option>
            <option value="id">Indonesia</option>
          </select>
          <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"><Eye size={16} /> Preview</button>
          <div className="relative flex">
            <button disabled={saving} onClick={() => saveArticle('published')} className="rounded-l-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"><Save size={15} className="mr-1 inline" />{saving ? 'Saving…' : editingSlug ? 'Update' : 'Publish'}</button>
            <button onClick={() => setShowSaveMenu((value) => !value)} className="rounded-r-lg border-l border-blue-700 bg-blue-600 px-3 text-white">▾</button>
            {showSaveMenu && <div className="absolute right-0 top-11 z-20 w-40 rounded-xl border bg-white p-1 shadow-lg"><button onClick={() => saveArticle('draft')} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">Save as draft</button></div>}
          </div>
        </div>
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
                    {block.url && <img src={block.url} alt={block.caption || 'Preview'} className="max-h-64 rounded-xl object-cover" />}
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

      {showPreview && <div onClick={() => setShowPreview(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><article onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"><button onClick={() => setShowPreview(false)} className="float-right rounded-full bg-gray-100 p-2"><X size={18} /></button><p className="text-xs font-bold uppercase text-blue-600">{category}</p><h1 className="mt-2 text-4xl font-black">{previewTitle}</h1><p className="mt-2 text-sm text-gray-500">{author} · {publishedAt.replace('T', ' ')}</p>{firstImage && <img src={firstImage} alt="Article preview" className="mt-6 max-h-96 w-full rounded-2xl object-cover" />}<div className="mt-6 space-y-5">{blocks.filter((block) => block.type === 'text').map((block) => <section key={block.id}>{block.title && <h2 className="text-2xl font-bold">{block.title}</h2>}<p className="mt-2 whitespace-pre-wrap leading-7 text-gray-700">{block.content}</p></section>)}</div></article></div>}
    </div>
  );
}
