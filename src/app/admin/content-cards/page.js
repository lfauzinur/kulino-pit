'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Award, Camera, Edit2, Eye, EyeOff, Flag, HeartPulse, Leaf, Mic, Plus, RefreshCw, Save, ShieldCheck, Siren, Trash2, Users, Wrench } from 'lucide-react';
import AdminConfirmPage from '@/components/AdminConfirmPage';

const sections = [{ id: 'corporate_benefits', label: 'Corporate Benefits' }, { id: 'manpower_roles', label: 'Manpower Event' }];
const iconMap = { users: Users, camera: Camera, award: Award, leaf: Leaf, flag: Flag, 'shield-check': ShieldCheck, mic: Mic, wrench: Wrench, 'heart-pulse': HeartPulse, siren: Siren };
const blank = (section) => ({ section, title: { id: '', en: '' }, description: { id: '', en: '' }, icon: 'users', accentColor: '#3B82F6', sortOrder: 0, published: true });
async function json(response) { const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`); return data; }

export default function ContentCardsAdmin() {
  const [section, setSection] = useState(sections[0].id);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank(sections[0].id));
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const load = useCallback(async () => { setLoading(true); try { setItems(await json(await fetch(`/api/content-cards?section=${section}&all=1`, { cache: 'no-store' }))); } catch (error) { setMessage({ type: 'error', text: error.message }); } finally { setLoading(false); } }, [section]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);
  const show = (item) => { setEditing(item || null); setForm(item ? { ...item } : blank(section)); setOpen(true); };
  const closeEditor = () => { setOpen(false); setEditing(null); };
  const save = async (event) => { event.preventDefault(); setSaving(true); try { await json(await fetch(editing ? `/api/content-cards/${editing.id}` : '/api/content-cards', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })); closeEditor(); setMessage({ type: 'success', text: 'Konten tersimpan ke database.' }); await load(); } catch (error) { setMessage({ type: 'error', text: error.message }); } finally { setSaving(false); } };
  const remove = async () => { const item = deleting; if (!item) return; try { await json(await fetch(`/api/content-cards/${item.id}`, { method: 'DELETE' })); setDeleting(null); await load(); } catch (error) { setMessage({ type: 'error', text: error.message }); } };

  if (deleting) return <AdminConfirmPage title="Hapus Konten?" description={`Konten “${deleting.title.id}” akan dihapus permanen dari database.`} onCancel={() => setDeleting(null)} onConfirm={remove} />;

  if (open) {
    const PreviewIcon = iconMap[form.icon] || Users;
    return <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><button type="button" onClick={closeEditor} className="btn border px-3" aria-label="Kembali ke daftar konten"><ArrowLeft size={18} /></button><div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-blue-500">Editor Paket & Manpower</p><h1 className="font-display text-3xl font-black">{editing ? 'Edit' : 'Tambah'} Konten</h1><p className="text-sm text-gray-500">Form tampil penuh tanpa dialog dan tanpa scroll bertumpuk.</p></div></div><button type="submit" form="content-card-form" disabled={saving} className="btn btn-primary flex items-center justify-center gap-2 px-6"><Save size={17} />{saving ? 'Menyimpan…' : 'Simpan Konten'}</button></header>
      {message.text && <Notice message={message} />}
      <form id="content-card-form" onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5 rounded-3xl border bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><Field label="Judul Indonesia"><input required className="clean-input" value={form.title.id} onChange={(e) => setForm({ ...form, title: { ...form.title, id: e.target.value } })} /></Field><Field label="Judul English"><input className="clean-input" value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} /></Field></div><Field label="Deskripsi Indonesia"><textarea required rows="6" className="clean-input" value={form.description.id} onChange={(e) => setForm({ ...form, description: { ...form.description, id: e.target.value } })} /></Field><Field label="Deskripsi English"><textarea rows="6" className="clean-input" value={form.description.en} onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })} /></Field></section>
        <aside className="space-y-5 xl:sticky xl:top-6"><section className="rounded-3xl border bg-white p-5 shadow-sm"><p className="mb-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Pratinjau kartu</p><div className="grid h-14 w-14 place-items-center rounded-2xl" style={{ backgroundColor: `${form.accentColor}18`, color: form.accentColor }}><PreviewIcon size={25} /></div><h2 className="mt-4 font-display text-xl font-black">{form.title.id || 'Judul konten'}</h2><p className="mt-2 text-sm leading-6 text-gray-500">{form.description.id || 'Deskripsi konten akan tampil di sini.'}</p></section><section className="space-y-4 rounded-3xl border bg-white p-5 shadow-sm"><Field label="Ikon"><select className="clean-input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>{Object.keys(iconMap).map((icon) => <option key={icon} value={icon}>{icon}</option>)}</select></Field><Field label="Warna"><input type="color" className="h-12 w-full rounded-xl border p-1" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} /></Field><Field label="Urutan"><input type="number" className="clean-input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></Field><PublishToggle value={form.published} onChange={() => setForm({ ...form, published: !form.published })} /></section></aside>
      </form>
    </div>;
  }

  return <div className="space-y-6 pb-12"><header className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-3xl font-black">Paket & Manpower</h1><p className="text-sm text-gray-500">CRUD ikon, warna, judul, deskripsi, urutan, dan status tayang.</p></div><div className="flex gap-2"><button type="button" onClick={load} className="btn border px-4" aria-label="Refresh"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button><button type="button" onClick={() => show()} className="btn btn-primary flex items-center gap-2 px-5"><Plus size={17} /> Tambah</button></div></header><div className="flex flex-wrap gap-2">{sections.map((entry) => <button key={entry.id} type="button" onClick={() => setSection(entry.id)} className={`rounded-full px-5 py-2 text-xs font-bold ${section === entry.id ? 'bg-blue-500 text-white' : 'border bg-white text-gray-600'}`}>{entry.label}</button>)}</div>{message.text && <Notice message={message} />}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => { const Icon = iconMap[item.icon] || Users; return <article key={item.id} className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ backgroundColor: `${item.accentColor}18`, color: item.accentColor }}><Icon size={23} /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="font-display font-black">{item.title.id}</h2>{item.published ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-gray-400" />}</div><p className="mt-1 text-xs leading-5 text-gray-500">{item.description.id}</p></div></div><div className="mt-4 flex justify-end gap-1 border-t pt-3"><button type="button" onClick={() => show(item)} className="p-2 text-gray-500 hover:text-blue-600"><Edit2 size={17} /></button><button type="button" onClick={() => setDeleting(item)} className="p-2 text-gray-500 hover:text-red-500"><Trash2 size={17} /></button></div></article>; })}</div></div>;
}

function Notice({ message }) { return <div className={`rounded-2xl border p-4 text-sm font-bold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>{message.text}</div>; }
function PublishToggle({ value, onChange }) { return <button type="button" onClick={onChange} className={`flex w-full justify-between rounded-2xl border p-4 font-bold ${value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>{value ? 'Tayang' : 'Draft'}{value ? <Eye /> : <EyeOff />}</button>; }
function Field({ label, children }) { return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase text-gray-500">{label}</span>{children}</label>; }
