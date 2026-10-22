'use client';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { 
  Wallet, ShieldCheck, Wrench, BarChart3, Handshake, TrendingUp, 
  ClipboardCheck, Clock, CheckCircle, Camera, ArrowRight, X
} from 'lucide-react';
import Link from 'next/link';

const benefitIcons = [
  <Wallet size={24} key="w" />,
  <ShieldCheck size={24} key="s" />,
  <Wrench size={24} key="wr" />,
  <BarChart3 size={24} key="b" />,
  <Handshake size={24} key="h" />,
  <TrendingUp size={24} key="t" />,
];

export default function JadiMitraPage() {
  const { t, locale } = useI18n();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [form, setForm] = useState({ name: '', whatsapp: '', location: '', bikeBrand: '', bikeType: '', bikeSize: '', condition: 'Baik' });

  const benefits = t('partner.benefits');

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Foto harus berformat JPG, PNG, atau WebP.');
      event.target.value = '';
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('Ukuran foto maksimal 4 MB.');
      event.target.value = '';
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!photo) throw new Error('Foto sepeda wajib diunggah.');
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      payload.append('photo', photo);
      const response = await fetch('/api/partners', {
        method: 'POST',
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pendaftaran gagal dikirim.');
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-20 mt-16">
        <div className="mx-auto max-w-lg px-4">
          <div className="clean-card p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-yellow-50 text-yellow-500 mx-auto flex items-center justify-center mb-6">
              <ClipboardCheck size={36} />
            </div>
            <h2 className="font-display font-black text-2xl text-gray-900">{t('partner.statusPending')}</h2>
            <p className="mt-3 text-sm text-gray-500">
              {t('partner.reviewDesc')}
            </p>
            <div className="flex gap-2 justify-center mt-6 flex-wrap">
              <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-yellow-50 text-yellow-600 flex items-center gap-1">
                <Clock size={10} /> {t('partner.statusPending')}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-400">
                → {t('partner.statusApproved')}
              </span>
              <span className="px-3 py-1 text-[10px] font-bold rounded-full bg-gray-100 text-gray-400">
                → {t('partner.statusListed')}
              </span>
            </div>
            <Link href="/" className="btn btn-primary px-8 py-3 text-sm mt-8 inline-flex items-center gap-2">
              {t('partner.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 mt-16 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]">
            <Handshake size={14} /> Partnership
          </span>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black text-gray-900">{t('partner.title')}</h1>
          <p className="mt-3 text-sm text-gray-500 max-w-lg mx-auto">{t('partner.subtitle')}</p>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="font-display font-black text-xl mb-6 text-center text-gray-900">{t('partner.benefitsTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b, i) => (
              <div key={i} className="clean-card p-6 group hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-4 group-hover:bg-white/20 group-hover:text-white transition-colors">
                  {benefitIcons[i]}
                </div>
                <h3 className="font-display font-black text-sm text-gray-900 group-hover:text-white transition-colors">{b.title}</h3>
                <p className="mt-1 text-xs text-gray-500 group-hover:text-white/80 leading-5 transition-colors">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <div className="clean-card p-6 sm:p-8">
            <h2 className="font-display font-black text-xl mb-6 text-gray-900">{t('partner.formTitle')}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {[
                { key: 'name', label: t('partner.name'), type: 'text', placeholder: t('partner.placeholderName') },
                { key: 'whatsapp', label: t('partner.whatsapp'), type: 'tel', placeholder: '08xxxxxxxxxx' },
                { key: 'location', label: t('partner.location'), type: 'text', placeholder: t('partner.placeholderLocation') },
                { key: 'bikeBrand', label: t('partner.bikeBrand'), type: 'text', placeholder: 'e.g. Polygon, Giant, Trek' },
                { key: 'bikeType', label: t('partner.bikeType'), type: 'text', placeholder: 'e.g. Helios C8, Defy Advanced' },
                { key: 'bikeSize', label: t('partner.bikeSize'), type: 'text', placeholder: 'S / M / L / XL' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-600">{field.label}</label>
                  <input
                    type={field.type}
                    required={['name', 'whatsapp', 'location', 'bikeType'].includes(field.key)}
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className="clean-input"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-600">{t('partner.condition')}</label>
                <div className="flex gap-2">
                  {[
                    { value: 'Baru', label: t('partner.condNew') },
                    { value: 'Baik', label: t('partner.condGood') },
                    { value: 'Cukup', label: t('partner.condFair') },
                  ].map(opt => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setForm(p => ({ ...p, condition: opt.value }))}
                      className={`btn flex-1 py-2.5 text-[10px] ${form.condition === opt.value ? 'btn-primary' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      {form.condition === opt.value && <CheckCircle size={12} className="inline mr-1" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-600">{t('partner.photo')}</label>
                <input id="partner-bike-photo" type="file" accept="image/jpeg,image/png,image/webp" onClick={(event) => { event.currentTarget.value = ''; }} onChange={handlePhotoChange} className="sr-only" />
                {photoPreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    <img src={photoPreview} alt="Preview foto sepeda" className="h-56 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                      className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-gray-700 shadow hover:bg-white"
                      aria-label="Hapus foto terpilih"
                    >
                      <X size={16} />
                    </button>
                    <label htmlFor="partner-bike-photo" className="absolute bottom-3 left-3 cursor-pointer rounded-xl bg-white/90 px-3 py-2 text-xs font-bold text-gray-700 shadow hover:bg-white">
                      Ganti foto
                    </label>
                    <p className="truncate px-4 py-3 text-xs text-gray-500">{photo?.name}</p>
                  </div>
                ) : (
                  <label htmlFor="partner-bike-photo" className="clean-input !p-6 border-dashed text-center cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center gap-2">
                    <Camera size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{t('partner.clickUpload')}</span>
                    <span className="text-[10px] text-gray-400">JPG, PNG, atau WebP · maks. 4 MB</span>
                  </label>
                )}
              </div>
              {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
              <button type="submit" disabled={submitting} className="btn btn-primary w-full py-4 text-sm mt-4 flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? 'Mengirim…' : t('partner.submit')} <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
