'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Edit2, Eye, EyeOff, Plus, RefreshCw, Save, Trash2, Truck, Users } from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

const blank = { titleId: '', titleEn: '', descriptionId: '', descriptionEn: '', featuresIdText: '', featuresEnText: '', priceLabel: '', icon: 'camera', accentColor: '#3B82F6', sortOrder: 0, published: true };
const icons = { camera: Camera, truck: Truck, users: Users };
async function json(response) { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`); return data; }
const formOf = (item) => ({ titleId: item.title.id, titleEn: item.title.en, descriptionId: item.description.id, descriptionEn: item.description.en, featuresIdText: item.features.id.join('\n'), featuresEnText: item.features.en.join('\n'), priceLabel: item.priceLabel, icon: item.icon, accentColor: item.accentColor, sortOrder: item.sortOrder, published: item.published });

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await json(await fetch('/api/services?all=1', { cache: 'no-store' }))); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { Promise.resolve().then(load); }, [load]);
  const show = (item) => { setEditing(item || null); setForm(item ? formOf(item) : { ...blank }); setOpen(true); };
  const closeEditor = () => { setOpen(false); setEditing(null); };
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder), featuresId: form.featuresIdText.split('\n').filter(Boolean), featuresEn: form.featuresEnText.split('\n').filter(Boolean) };
      const saved = await json(await fetch(editing ? `/api/services/${editing.id}` : '/api/services', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
      setItems((list) => editing ? list.map((item) => item.id === saved.id ? saved : item) : [...list, saved]);
      closeEditor(); setMessage({ type: 'success', text: 'Layanan tersimpan dan halaman publik telah diperbarui.' });
    } catch (error) { setMessage({ type: 'error', text: error.message }); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    const item = deleting; if (!item) return;
    try { await json(await fetch(`/api/services/${item.id}`, { method: 'DELETE' })); setItems((list) => list.filter((entry) => entry.id !== item.id)); setDeleting(null); }
    catch (error) { setMessage({ type: 'error', text: error.message }); }
  };

  if (deleting) return <AdminConfirmPage title="Hapus Layanan?" description={`Layanan “${deleting.title.id}” akan dihapus permanen dari database.`} onCancel={() => setDeleting(null)} onConfirm={remove} />;

  if (open) {
    const PreviewIcon = icons[form.icon] || Camera;
    return <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><button type="button" onClick={closeEditor} className="btn border px-3" aria-label="Kembali ke daftar layanan"><ArrowLeft size={18} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Editor Layanan</p><h1 className="font-display text-3xl font-black">{editing ? 'Edit' : 'Tambah'} Layanan</h1><p className="text-sm text-gray-500">Isi data layanan pada halaman penuh, lalu simpan perubahan.</p></div></div>
        <button type="submit" form="service-form" disabled={saving} className="btn btn-primary flex items-center justify-center gap-2 px-6"><Save size={17} />{saving ? 'Menyimpan…' : 'Simpan Layanan'}</button>
      </header>
      {message.text && <Notice message={message} />}
      <form id="service-form" onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Judul Indonesia"><input required className="clean-input" value={form.titleId} onChange={(e) => setForm({ ...form, titleId: e.target.value })} /></Field><Field label="Title English"><input className="clean-input" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} /></Field></div>
          <Field label="Deskripsi Indonesia"><textarea required rows="4" className="clean-input" value={form.descriptionId} onChange={(e) => setForm({ ...form, descriptionId: e.target.value })} /></Field>
          <Field label="Description English"><textarea rows="4" className="clean-input" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Fitur ID (satu/baris)"><textarea rows="7" className="clean-input" value={form.featuresIdText} onChange={(e) => setForm({ ...form, featuresIdText: e.target.value })} /></Field><Field label="Features EN (one/line)"><textarea rows="7" className="clean-input" value={form.featuresEnText} onChange={(e) => setForm({ ...form, featuresEnText: e.target.value })} /></Field></div>
        </section>
        <aside className="space-y-5 xl:sticky xl:top-6">
          <section className="rounded-3xl border bg-white p-5 shadow-sm"><p className="mb-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Tampilan kartu</p><span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ color: form.accentColor, backgroundColor: `${form.accentColor}18` }}><PreviewIcon /></span><h2 className="mt-4 font-display text-xl font-black">{form.titleId || 'Judul layanan'}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{form.descriptionId || 'Deskripsi layanan akan tampil di sini.'}</p><p className="mt-4 font-bold text-[var(--color-primary)]">{form.priceLabel || 'Label harga'}</p></section>
          <section className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm"><Field label="Label Harga"><input className="clean-input" value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })} /></Field><Field label="Ikon"><select className="clean-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}><option value="camera">Kamera</option><option value="truck">Truk</option><option value="users">Tim</option></select></Field><Field label="Warna"><input type="color" className="h-12 w-full rounded-xl border p-1" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} /></Field><Field label="Urutan"><input type="number" className="clean-input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} /></Field><PublishToggle value={form.published} onChange={() => setForm({ ...form, published: !form.published })} /></section>
        </aside>
      </form>
    </div>;
  }

  return <div className="space-y-6 pb-12">
    <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-3xl font-black">Layanan CRUD</h1><p className="text-sm text-gray-500">Kelola kartu layanan yang tampil pada halaman Layanan.</p></div><div className="flex gap-2"><button onClick={load} className="btn border px-4"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button><button onClick={() => show()} className="btn btn-primary flex items-center gap-2 px-5"><Plus size={17} /> Tambah Layanan</button></div></header>
    {message.text && <Notice message={message} />}
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const Icon = icons[item.icon] || Camera; return <article key={item.id} className="clean-card flex flex-col border p-5"><div className="mb-4 flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-xl" style={{ color: item.accentColor, backgroundColor: `${item.accentColor}18` }}><Icon /></span><span className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.published ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.published ? 'Tayang' : 'Draft'}</span></div><h2 className="font-display text-lg font-black">{item.title.id}</h2><p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">{item.description.id}</p><p className="mt-4 font-bold text-[var(--color-primary)]">{item.priceLabel}</p><div className="mt-5 flex justify-end gap-2 border-t pt-3"><button onClick={() => show(item)} className="p-2 text-gray-500 hover:text-blue-600"><Edit2 size={17} /></button><button onClick={() => setDeleting(item)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={17} /></button></div></article>; })}</div>
  </div>;
}

function Notice({ message }) { return <div className={`rounded-2xl border p-4 text-sm font-bold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>; }
function PublishToggle({ value, onChange }) { return <button type="button" onClick={onChange} className={`flex w-full justify-between rounded-2xl border p-4 font-bold ${value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>{value ? 'Tayang' : 'Draft'}{value ? <Eye /> : <EyeOff />}</button>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">{label}</span>{children}</label>; }
