'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { bikes, accessories, formatCurrency } from '@/lib/data';

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-10 h-10 border-3 border-black flex items-center justify-center font-display font-black text-sm transition-all
            ${i < current ? 'bg-[var(--color-green)] text-white' : i === current ? 'bg-[var(--color-orange)] text-white shadow-[var(--shadow-brutal)]' : 'bg-white text-[var(--color-gray-500)]'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider ${i === current ? 'text-[var(--color-orange)]' : 'text-[var(--color-gray-500)]'}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-1 border border-black ${i < current ? 'bg-[var(--color-green)]' : 'bg-[var(--color-gray-300)]'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* Step 1: Bike Selection */
function Step1({ selected, onSelect, locale, t }) {
  const available = bikes.filter(b => b.available);
  return (
    <div>
      <h2 className="font-display font-black text-xl mb-6">{t('booking.selectBike')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {available.map(bike => (
          <button
            key={bike.id}
            onClick={() => onSelect(bike)}
            className={`brutal-card p-4 text-left flex gap-4 items-center transition-all
              ${selected?.id === bike.id ? '!border-[var(--color-orange)] !bg-[var(--color-orange)]/5 !shadow-[var(--shadow-brutal-orange)]' : ''}`}
          >
            <div className="relative w-20 h-20 border-2 border-black bg-[var(--color-cream-dark)] shrink-0 overflow-hidden">
              <Image src={bike.image} alt={bike.name} fill className="object-contain p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-sm">{bike.name}</p>
              <p className="text-[9px] text-[var(--color-gray-500)] mt-0.5">{bike.description[locale]}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="brutal-badge bg-[var(--color-orange)]/10 text-[var(--color-orange)] text-[8px] !border-[var(--color-orange)]/30">
                  {t(`bikes.categories.${bike.category}`)}
                </span>
                <span className="font-display font-black text-sm text-[var(--color-orange)]">{formatCurrency(bike.pricePerDay)}{t('bikes.perDay')}</span>
              </div>
            </div>
            {selected?.id === bike.id && (
              <span className="w-8 h-8 bg-[var(--color-orange)] text-white border-2 border-black flex items-center justify-center font-bold text-sm shrink-0">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* Step 2: Date & Duration */
function Step2({ dates, setDates, pickupMethod, setPickupMethod, t, locale }) {
  return (
    <div>
      <h2 className="font-display font-black text-xl mb-6">{t('booking.step2')}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">{t('booking.startDate')}</label>
          <input
            type="date"
            value={dates.start}
            onChange={e => setDates(d => ({ ...d, start: e.target.value }))}
            className="brutal-input"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider mb-2">{t('booking.endDate')}</label>
          <input
            type="date"
            value={dates.end}
            onChange={e => setDates(d => ({ ...d, end: e.target.value }))}
            className="brutal-input"
          />
        </div>
      </div>
      <div className="mt-6">
        <label className="block text-xs font-bold uppercase tracking-wider mb-3">{t('booking.pickupMethod')}</label>
        <div className="flex gap-3">
          {[
            { value: 'pickup', label: t('booking.pickup'), icon: '🏪' },
            { value: 'delivery', label: t('booking.delivery'), icon: '🚚' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPickupMethod(opt.value)}
              className={`brutal-btn flex-1 py-4 text-xs ${pickupMethod === opt.value ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
            >
              <span className="text-lg">{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>
      </div>
      {dates.start && dates.end && (
        <div className="mt-6 brutal-card p-4 !bg-[var(--color-blue-light)] !border-[var(--color-blue)]">
          <p className="text-xs font-bold">📅 {Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)))} {locale === 'id' ? 'hari rental' : 'days rental'}</p>
        </div>
      )}
    </div>
  );
}

/* Step 3: Accessories */
function Step3({ selectedAccessories, toggleAccessory, locale, t }) {
  return (
    <div>
      <h2 className="font-display font-black text-xl mb-6">{t('booking.accessories')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {accessories.map(acc => {
          const isSelected = selectedAccessories.includes(acc.id);
          return (
            <button
              key={acc.id}
              onClick={() => toggleAccessory(acc.id)}
              className={`brutal-card p-4 text-left flex items-center gap-4 transition-all
                ${isSelected ? '!border-[var(--color-orange)] !bg-[var(--color-orange)]/5 !shadow-[var(--shadow-brutal-orange)]' : ''}`}
            >
              <span className="w-12 h-12 border-2 border-black bg-[var(--color-cream-dark)] flex items-center justify-center text-2xl shrink-0">
                {acc.icon}
              </span>
              <div className="flex-1">
                <p className="font-display font-bold text-sm">{acc.name[locale]}</p>
                <p className="text-xs font-bold text-[var(--color-orange)] mt-0.5">+{formatCurrency(acc.price)}</p>
              </div>
              <div className={`w-6 h-6 border-2 border-black flex items-center justify-center text-sm font-bold shrink-0
                ${isSelected ? 'bg-[var(--color-orange)] text-white' : 'bg-white'}`}>
                {isSelected ? '✓' : ''}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Step 4: Summary & Payment */
function Step4({ selectedBike, dates, pickupMethod, selectedAccessories, customerInfo, setCustomerInfo, t, locale }) {
  const days = Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)));
  const bikeTotal = selectedBike ? selectedBike.pricePerDay * days : 0;
  const accTotal = accessories.filter(a => selectedAccessories.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const deliveryFee = pickupMethod === 'delivery' ? 50000 : 0;
  const deposit = 200000;
  const grandTotal = bikeTotal + accTotal + deliveryFee + deposit;

  return (
    <div>
      <h2 className="font-display font-black text-xl mb-6">{t('booking.summary')}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Form */}
        <div className="space-y-4">
          {[
            { key: 'fullName', type: 'text', label: t('booking.fullName') },
            { key: 'phone', type: 'tel', label: t('booking.phone') },
            { key: 'email', type: 'email', label: t('booking.email') },
            { key: 'idNumber', type: 'text', label: t('booking.idNumber') },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5">{field.label}</label>
              <input
                type={field.type}
                value={customerInfo[field.key] || ''}
                onChange={e => setCustomerInfo(p => ({ ...p, [field.key]: e.target.value }))}
                className="brutal-input"
                placeholder={field.label}
              />
            </div>
          ))}
          {pickupMethod === 'delivery' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5">{t('booking.address')}</label>
              <textarea
                value={customerInfo.address || ''}
                onChange={e => setCustomerInfo(p => ({ ...p, address: e.target.value }))}
                className="brutal-input min-h-[80px] resize-none"
                placeholder={t('booking.address')}
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-2">{t('booking.paymentMethod')}</label>
            <div className="grid grid-cols-2 gap-2">
              {['QRIS', 'Bank Transfer', 'E-Wallet', 'Credit Card'].map(method => (
                <button
                  key={method}
                  onClick={() => setCustomerInfo(p => ({ ...p, paymentMethod: method }))}
                  className={`brutal-btn py-2.5 text-[10px] ${customerInfo.paymentMethod === method ? 'brutal-btn-primary' : 'brutal-btn-secondary'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="brutal-card p-5 !shadow-[var(--shadow-brutal-lg)]">
            <h3 className="font-display font-black text-sm mb-4 pb-3 border-b-2 border-dashed border-[var(--color-gray-300)]">🧾 {t('booking.summary')}</h3>
            {selectedBike && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-[var(--color-gray-300)]">
                <div className="relative w-16 h-16 border-2 border-black bg-[var(--color-cream-dark)] overflow-hidden shrink-0">
                  <Image src={selectedBike.image} alt={selectedBike.name} fill className="object-contain p-1" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm">{selectedBike.name}</p>
                  <p className="text-[10px] text-[var(--color-gray-500)]">{days} {locale === 'id' ? 'hari' : 'days'} × {formatCurrency(selectedBike.pricePerDay)}</p>
                </div>
              </div>
            )}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>{t('booking.subtotal')}</span><span className="font-bold">{formatCurrency(bikeTotal)}</span></div>
              {selectedAccessories.length > 0 && (
                <div className="flex justify-between"><span>{t('booking.accessoryTotal')}</span><span className="font-bold">{formatCurrency(accTotal)}</span></div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between"><span>{t('booking.deliveryFee')}</span><span className="font-bold">{formatCurrency(deliveryFee)}</span></div>
              )}
              <div className="flex justify-between"><span>{t('booking.deposit')}</span><span className="font-bold">{formatCurrency(deposit)}</span></div>
              <div className="flex justify-between pt-3 border-t-3 border-black mt-3 text-base">
                <span className="font-display font-black">{t('booking.grandTotal')}</span>
                <span className="font-display font-black text-[var(--color-orange)]">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Booking Page ─── */
export default function BookingPage() {
  const { t, locale } = useI18n();
  const [step, setStep] = useState(0);
  const [selectedBike, setSelectedBike] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });
  const [pickupMethod, setPickupMethod] = useState('pickup');
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const steps = [t('booking.step1'), t('booking.step2'), t('booking.step3'), t('booking.step4')];

  const toggleAccessory = (id) => {
    setSelectedAccessories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canNext = () => {
    if (step === 0) return !!selectedBike;
    if (step === 1) return dates.start && dates.end;
    return true;
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  if (showConfirm) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-lg px-4">
          <div className="brutal-card p-8 text-center !shadow-[var(--shadow-brutal-xl)]">
            <div className="w-20 h-20 border-3 border-black bg-[var(--color-green)] text-white mx-auto flex items-center justify-center text-4xl mb-6">✓</div>
            <h2 className="font-display font-black text-2xl">{locale === 'id' ? 'Booking Berhasil!' : 'Booking Confirmed!'}</h2>
            <p className="mt-3 text-sm text-[var(--color-gray-500)]">
              {locale === 'id'
                ? 'Terima kasih! Kami akan menghubungi Anda melalui WhatsApp untuk konfirmasi pembayaran.'
                : 'Thank you! We will contact you via WhatsApp for payment confirmation.'}
            </p>
            <div className="brutal-card p-4 mt-6 !bg-[var(--color-cream)]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gray-500)]">Booking ID</p>
              <p className="font-display font-black text-xl mt-1">KP-{Date.now().toString().slice(-8)}</p>
            </div>
            <a href="/" className="brutal-btn brutal-btn-primary px-8 py-3 text-sm mt-6">{locale === 'id' ? 'Kembali ke Beranda' : 'Back to Home'} →</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-black">{t('booking.title')}</h1>
        </div>

        <StepIndicator current={step} steps={steps} />

        <div className="brutal-card p-6 sm:p-8 !shadow-[var(--shadow-brutal-lg)]">
          {step === 0 && <Step1 selected={selectedBike} onSelect={setSelectedBike} locale={locale} t={t} />}
          {step === 1 && <Step2 dates={dates} setDates={setDates} pickupMethod={pickupMethod} setPickupMethod={setPickupMethod} t={t} locale={locale} />}
          {step === 2 && <Step3 selectedAccessories={selectedAccessories} toggleAccessory={toggleAccessory} locale={locale} t={t} />}
          {step === 3 && <Step4 selectedBike={selectedBike} dates={dates} pickupMethod={pickupMethod} selectedAccessories={selectedAccessories} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} t={t} locale={locale} />}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-dashed border-[var(--color-gray-300)]">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="brutal-btn brutal-btn-secondary px-6 py-3 text-xs">← {t('booking.prev')}</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()} className={`brutal-btn brutal-btn-primary px-6 py-3 text-xs ${!canNext() ? 'opacity-40 cursor-not-allowed' : ''}`}>
                {t('booking.next')} →
              </button>
            ) : (
              <button onClick={handleSubmit} className="brutal-btn brutal-btn-primary px-8 py-3 text-xs animate-pulse-border">
                💳 {t('booking.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
