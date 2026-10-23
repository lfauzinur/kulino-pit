'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { bikes as initialBikes, accessories, formatCurrency, rentalDurations, getLowestPrice, getPriceByDuration } from '@/lib/data';
import { Store, Truck, HardHat, Lightbulb, Briefcase, Map, Shirt, Wrench, CheckCircle, CreditCard, Clock, Flame } from 'lucide-react';

const accIcons = {
  helmet: <HardHat size={24} className="text-[var(--color-primary)]" />,
  lights: <Lightbulb size={24} className="text-[var(--color-primary)]" />,
  saddlebag: <Briefcase size={24} className="text-[var(--color-primary)]" />,
  gps: <Map size={24} className="text-[var(--color-primary)]" />,
  jersey: <Shirt size={24} className="text-[var(--color-primary)]" />,
  repairkit: <Wrench size={24} className="text-[var(--color-primary)]" />
};

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-10 max-w-2xl mx-auto">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-display font-bold text-sm transition-all
            ${i < current ? 'bg-green-50 text-green-600 border border-green-200' : i === current ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
            {i < current ? <CheckCircle size={18} /> : i + 1}
          </div>
          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider ${i === current ? 'text-gray-900' : 'text-gray-400'}`}>
            {label}
          </span>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-16 h-1 rounded-full ${i < current ? 'bg-green-400' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* Step 1: Bike Selection */
function Step1({ bikesList, selected, onSelect, locale, t, requestedBike }) {
  const available = bikesList.filter(b => b.available);
  return (
    <div className="animate-fade-in">
      <h2 className="font-display font-black text-2xl mb-3 text-gray-900">Ketersediaan Unit</h2>
      {requestedBike && <div className={`mb-6 rounded-2xl border p-4 ${requestedBike.available ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className={`text-sm font-black ${requestedBike.available ? 'text-green-800' : 'text-red-700'}`}>{requestedBike.name}</p><p className="mt-1 text-xs text-gray-600">{requestedBike.available ? `${requestedBike.availableStock} dari ${requestedBike.stockCount} unit tersedia dan siap dipesan.` : `Stok sedang kosong (${requestedBike.rentedCount}/${requestedBike.stockCount} unit dipakai atau unit dinonaktifkan). Silakan pilih unit lain di bawah.`}</p></div><span className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ${requestedBike.available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{requestedBike.available ? 'TERSEDIA' : 'KOSONG'}</span></div>
      </div>}
      <p className="mb-4 text-sm font-semibold text-gray-500">{requestedBike?.available ? 'Unit pilihan Anda sudah tersedia. Anda dapat lanjut atau memilih model lain.' : 'Pilih sepeda yang tersedia:'}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {available.map(bike => {
          const lowestPrice = getLowestPrice(bike);
          return (
            <button
              key={bike.id}
              onClick={() => onSelect(bike)}
              className={`relative grid min-w-0 grid-cols-[84px_minmax(0,1fr)] items-center gap-3 rounded-3xl border bg-white p-4 text-left transition-all sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-5 sm:p-5
                ${selected?.id === bike.id ? 'border-[var(--color-primary)] shadow-md bg-blue-50/30' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
            >
              {bike.popular && (
                <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[9px] font-bold border border-amber-200">
                  <Flame size={10} /> Popular
                </span>
              )}
              <div className="relative h-[84px] w-[84px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 sm:h-24 sm:w-24">
                <Image src={bike.image} alt={bike.name} fill className="object-contain p-2 drop-shadow-md" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-display text-base font-black leading-tight text-gray-900 sm:text-lg ${bike.popular ? 'pr-16 sm:pr-20' : ''}`}>{bike.name}</p>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{bike.description[locale]}</p>
                <div className="mt-3 flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <span className="max-w-full truncate rounded-lg bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                    {t(`bikes.categories.${bike.category}`)}
                  </span>
                  <div className="text-left sm:text-right">
                    <span className="mb-0.5 block text-[9px] font-bold text-green-600">{bike.availableStock} unit tersedia</span>
                    <span className="text-[9px] text-gray-400 block">{locale === 'id' ? 'Mulai' : 'From'}</span>
                    <span className="font-display font-black text-sm text-[var(--color-primary)]">{formatCurrency(lowestPrice)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Step 2: Duration & Pickup */
function Step2({ selectedBike, rentalType, setRentalType, dates, setDates, pickupMethod, setPickupMethod, t, locale }) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-display font-black text-2xl mb-6 text-gray-900">Pilih Durasi Sewa</h2>
      
      {/* Duration Selection */}
      <div className="mb-8">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">PAKET DURASI</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {rentalDurations.map(dur => {
            const price = selectedBike ? getPriceByDuration(selectedBike, dur.key) : 0;
            const isActive = rentalType === dur.key;
            return (
              <button
                key={dur.key}
                onClick={() => setRentalType(dur.key)}
                className={`rounded-2xl p-4 text-left transition-all border
                  ${isActive 
                    ? 'bg-blue-50 border-[var(--color-primary)] shadow-md' 
                    : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={14} className={isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'} />
                  <span className={`text-sm font-bold ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                    {dur.label[locale]}
                  </span>
                </div>
                <p className={`font-display font-black text-lg ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                  {formatCurrency(price)}
                </p>
                {isActive && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-primary)]">
                    <CheckCircle size={12} /> Dipilih
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date (only for daily) */}
      {rentalType === 'day' && (
        <div className="mb-8 pt-6 border-t border-gray-100">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">TANGGAL SEWA</label>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{t('booking.startDate')}</label>
              <input
                type="date"
                value={dates.start}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, start: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{t('booking.endDate')}</label>
              <input
                type="date"
                value={dates.end}
                min={dates.start || new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, end: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
          </div>
          {dates.start && dates.end && (
            <div className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><CheckCircle size={16} /></div>
              <p className="text-sm font-medium text-blue-900">
                Total durasi sewa: <strong className="font-black">{Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)))} hari</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Hourly — just pick a date */}
      {rentalType !== 'day' && (
        <div className="mb-8 pt-6 border-t border-gray-100">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">TANGGAL SEWA</label>
          <input
            type="date"
            value={dates.start}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => setDates(d => ({ ...d, start: e.target.value, end: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 hover:bg-white transition-colors max-w-xs"
          />
        </div>
      )}
      
      <div className="pt-6 border-t border-gray-100">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-4">{t('booking.pickupMethod')}</label>
        <div className="flex gap-4">
          {[
            { value: 'pickup', label: t('booking.pickup'), icon: <Store size={20} /> },
            { value: 'delivery', label: t('booking.delivery'), icon: <Truck size={20} /> },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPickupMethod(opt.value)}
              className={`flex-1 py-4 px-4 text-sm font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all border
                ${pickupMethod === opt.value 
                  ? 'bg-blue-50 text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Step 3: Accessories */
function Step3({ selectedAccessories, toggleAccessory, setSelectedAccessories, locale, t }) {
  const allSelected = selectedAccessories.length === accessories.length;
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-black text-2xl text-gray-900">Pilih Aksesoris Tambahan</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedAccessories(allSelected ? [] : accessories.map(a => a.id))}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              allSelected
                ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                : 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50 hover:bg-blue-100'
            }`}
          >
            {allSelected ? '✕ Kosongkan Semua' : '✓ Pilih Semua'}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {accessories.map(acc => {
          const isSelected = selectedAccessories.includes(acc.id);
          return (
            <button
              key={acc.id}
              onClick={() => toggleAccessory(acc.id)}
              className={`bg-white rounded-3xl p-4 text-left flex items-center gap-4 transition-all border
                ${isSelected ? 'border-[var(--color-primary)] shadow-md bg-blue-50/30' : 'border-gray-100 shadow-sm hover:shadow-md'}`}
            >
              <span className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                {accIcons[acc.id] || acc.icon}
              </span>
              <div className="flex-1">
                <p className="font-display font-bold text-sm text-gray-900">{acc.name[locale]}</p>
                <p className="text-xs font-bold text-[var(--color-primary)] mt-1">+{formatCurrency(acc.price)}</p>
              </div>
              <div className={`w-6 h-6 rounded border flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                ${isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-gray-50 border-gray-300'}`}>
                {isSelected && <CheckCircle size={14} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Step 4: Summary & Payment */
function Step4({ selectedBike, rentalType, dates, pickupMethod, selectedAccessories, customerInfo, setCustomerInfo, t, locale }) {
  const durationLabel = rentalDurations.find(d => d.key === rentalType)?.label[locale] || 'Sehari';
  const unitPrice = selectedBike ? getPriceByDuration(selectedBike, rentalType) : 0;
  
  let quantity = 1;
  if (rentalType === 'day' && dates.start && dates.end) {
    quantity = Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)));
  }
  
  const bikeTotal = unitPrice * quantity;
  const accTotal = accessories.filter(a => selectedAccessories.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const deliveryFee = pickupMethod === 'delivery' ? 50000 : 0;
  const grandTotal = bikeTotal + accTotal + deliveryFee;

  return (
    <div className="animate-fade-in">
      <h2 className="font-display font-black text-2xl mb-6 text-gray-900">{t('booking.summary')}</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Customer Form */}
        <div className="space-y-5">
          {[
            { key: 'fullName', type: 'text', label: t('booking.fullName') },
            { key: 'phone', type: 'tel', label: t('booking.phone') },
            { key: 'email', type: 'email', label: t('booking.email') },
            { key: 'idNumber', type: 'text', label: t('booking.idNumber') },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{field.label}</label>
              <input
                type={field.type}
                value={customerInfo[field.key] || ''}
                onChange={e => setCustomerInfo(p => ({ ...p, [field.key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 focus:bg-white transition-colors"
                placeholder={field.label}
              />
            </div>
          ))}
          {pickupMethod === 'delivery' && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">{t('booking.address')}</label>
              <textarea
                value={customerInfo.address || ''}
                onChange={e => setCustomerInfo(p => ({ ...p, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-primary)] bg-gray-50 focus:bg-white min-h-[80px] resize-none transition-colors"
                placeholder={t('booking.address')}
              />
            </div>
          )}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">{t('booking.paymentMethod')}</label>
            <div className="grid grid-cols-2 gap-3">
              {['QRIS', 'Bank Transfer', 'E-Wallet', 'Credit Card'].map(method => (
                <button
                  key={method}
                  onClick={() => setCustomerInfo(p => ({ ...p, paymentMethod: method }))}
                  className={`py-3 px-2 text-[11px] font-bold uppercase tracking-wider rounded-xl border transition-all
                    ${customerInfo.paymentMethod === method 
                      ? 'bg-blue-50 text-[var(--color-primary)] border-[var(--color-primary)] shadow-sm' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <h3 className="font-display font-black text-base text-gray-900 mb-4 pb-4 border-b border-gray-200 flex items-center gap-2">
              <CreditCard size={18} /> {t('booking.summary')}
            </h3>
            {selectedBike && (
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="relative w-20 h-20 rounded-2xl bg-white border border-gray-100 overflow-hidden shrink-0 shadow-sm">
                  <Image src={selectedBike.image} alt={selectedBike.name} fill className="object-contain p-2" unoptimized />
                </div>
                <div>
                  <p className="font-display font-black text-base text-gray-900">{selectedBike.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{durationLabel} — {formatCurrency(unitPrice)}{rentalType === 'day' && quantity > 1 ? ` × ${quantity} hari` : ''}</p>
                </div>
              </div>
            )}
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between"><span>{t('booking.subtotal')}</span><span className="font-bold text-gray-900">{formatCurrency(bikeTotal)}</span></div>
              {selectedAccessories.length > 0 && (
                <div className="flex justify-between"><span>{t('booking.accessoryTotal')}</span><span className="font-bold text-gray-900">{formatCurrency(accTotal)}</span></div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between"><span>{t('booking.deliveryFee')}</span><span className="font-bold text-gray-900">{formatCurrency(deliveryFee)}</span></div>
              )}
              <div className="flex justify-between pt-4 border-t border-gray-200 mt-4 text-lg">
                <span className="font-display font-black text-gray-900">{t('booking.grandTotal')}</span>
                <span className="font-display font-black text-[var(--color-primary)]">{formatCurrency(grandTotal)}</span>
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
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedBike, setSelectedBike] = useState(null);
  const [rentalType, setRentalType] = useState('2h');
  const [dates, setDates] = useState({ start: '', end: '' });
  const [pickupMethod, setPickupMethod] = useState('pickup');
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ paymentMethod: 'Bank Transfer' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bikesList, setBikesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [requestedBike, setRequestedBike] = useState(null);

  useEffect(() => {
    fetch('/api/bikes', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setBikesList(list);
        const requestedId = Number(new URLSearchParams(window.location.search).get('bikeId'));
        const requested = list.find((bike) => bike.id === requestedId) || null;
        setRequestedBike(requested);
        if (requested?.available) setSelectedBike(requested);
      })
      .catch(console.error);
  }, []);

  const steps = [t('booking.step1'), t('booking.step2'), t('booking.step3'), t('booking.step4')];

  const toggleAccessory = (id) => {
    setSelectedAccessories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const chooseBike = (bike) => {
    setSelectedBike(bike);
    setRequestedBike(bike);
    const url = new URL(window.location.href);
    url.searchParams.set('bikeId', bike.id);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  const handleNext = () => {
    if (!canNext()) return;
    if (step !== 1) { setStep((current) => current + 1); return; }
    const draft = { bikeId: selectedBike.id, rentalType, dates, pickupMethod };
    sessionStorage.setItem('kulinoBookingDraft', JSON.stringify(draft));
    const memberTarget = `/member?bookBike=${selectedBike.id}&resume=1`;
    if (localStorage.getItem('isMember') === 'true') {
      router.push(memberTarget);
    } else {
      router.push(`/register?bookBike=${selectedBike.id}&redirect=${encodeURIComponent('/member')}`);
    }
  };

  const canNext = () => {
    if (step === 0) return !!selectedBike;
    if (step === 1) {
      if (rentalType === 'day') return dates.start && dates.end;
      return !!dates.start;
    }
    if (step === 3) return Boolean(customerInfo.fullName?.trim() && customerInfo.phone?.trim() && customerInfo.email?.trim());
    return true;
  };

  const handleSubmit = async () => {
    const unitPrice = selectedBike ? getPriceByDuration(selectedBike, rentalType) : 0;
    let quantity = 1;
    if (rentalType === 'day' && dates.start && dates.end) {
      quantity = Math.max(1, Math.ceil((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)));
    }
    const bikeTotal = unitPrice * quantity;
    const accTotal = accessories.filter(a => selectedAccessories.includes(a.id)).reduce((s, a) => s + a.price, 0);
    const deliveryFee = pickupMethod === 'delivery' ? 50000 : 0;
    const grandTotal = bikeTotal + accTotal + deliveryFee;
    
    const uniqueCode = Math.floor(Math.random() * 9) + 1;
    const finalTotal = grandTotal + uniqueCode;
    
    const paymentSettings = JSON.parse(localStorage.getItem('paymentSettings')) || {
      bankAccount: 'BCA 1234567890 a/n Kulino Pit',
      qrisUrl: 'QRIS - scan from any app',
      qrisImage: ''
    };

    const durationLabel = rentalDurations.find(d => d.key === rentalType)?.shortLabel || 'Sehari';

    let durationMinutes = 0;
    if (rentalType === 'day') {
      durationMinutes = quantity * 24 * 60;
    } else {
      durationMinutes = parseInt(rentalType.replace('h', '')) * 60;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerInfo.fullName,
          customerPhone: customerInfo.phone,
          customerEmail: customerInfo.email,
          customerIdNumber: customerInfo.idNumber,
          bikeId: selectedBike.id,
          bikeName: selectedBike.name,
          rentalDate: dates.start,
          durationKey: rentalType,
          durationLabel: durationLabel + (rentalType === 'day' && quantity > 1 ? ` (${quantity} hari)` : ''),
          durationMinutes,
          pickupMethod,
          deliveryAddress: customerInfo.address,
          accessories: selectedAccessories,
          paymentMethod: customerInfo.paymentMethod || 'Bank Transfer',
          uniqueCode,
        }),
      });
      const newBooking = await response.json();
      if (!response.ok) throw new Error(newBooking.error || 'Booking gagal disimpan.');
      const memberBooking = { ...newBooking, status: newBooking.status.toLowerCase(), points: 0 };
      const existingHistory = JSON.parse(localStorage.getItem('memberBookings') || '[]');
      localStorage.setItem('memberBookings', JSON.stringify([memberBooking, ...existingHistory]));
      setPaymentDetails({
        id: newBooking.id,
        finalTotal,
        uniqueCode,
        method: customerInfo.paymentMethod || 'Bank Transfer',
        settings: paymentSettings
      });
      setShowConfirm(true);
    } catch (requestError) {
      setSubmitError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(locale === 'id' ? 'Tersalin!' : 'Copied!');
  };

  if (showConfirm) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen">
        <div className="mx-auto max-w-lg px-4">
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-500 mx-auto flex items-center justify-center text-4xl mb-6 shadow-sm"><CheckCircle size={40} /></div>
            <h2 className="font-display font-black text-2xl text-gray-900">{locale === 'id' ? 'Booking Berhasil!' : 'Booking Confirmed!'}</h2>
            <p className="mt-3 text-sm text-gray-500">
              {locale === 'id'
                ? 'Terima kasih! Silakan lakukan pembayaran untuk menyelesaikan booking.'
                : 'Thank you! Please complete your payment to finalize booking.'}
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mt-8 text-left border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                {locale === 'id' ? 'Total Pembayaran (Termasuk Kode Unik)' : 'Total Payment (Incl. Unique Code)'}
              </p>
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <span className="font-display font-black text-2xl text-[var(--color-primary)]">
                  {formatCurrency(paymentDetails.finalTotal)}
                </span>
                <button onClick={() => handleCopy(paymentDetails.finalTotal.toString())} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  Copy
                </button>
              </div>
              <p className="text-[10px] text-amber-600 font-medium mt-2 flex items-center gap-1">
                <Lightbulb size={12} /> {locale === 'id' ? '*Transfer tepat sesuai nominal hingga digit terakhir' : '*Transfer exactly up to the last digit'}
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                  {locale === 'id' ? 'Metode Pembayaran' : 'Payment Method'}
                </p>
                
                {paymentDetails.method.includes('QRIS') ? (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 text-center shadow-sm">
                    <p className="font-bold text-sm text-gray-900 mb-4">{paymentDetails.method}</p>
                    {paymentDetails.settings.qrisImage ? (
                      <div className="bg-white p-2 border border-gray-100 inline-block rounded-xl shadow-sm mb-4">
                        <img src={paymentDetails.settings.qrisImage} alt="QRIS Code" className="w-48 h-48 object-cover rounded-lg" />
                      </div>
                    ) : (
                      <div className="bg-gray-50 w-48 h-48 mx-auto mb-4 flex items-center justify-center border border-dashed border-gray-300 rounded-xl text-gray-400 text-xs">
                        QRIS Image Not Set
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-600">{paymentDetails.settings.qrisUrl}</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{paymentDetails.method}</p>
                      <p className="text-sm font-medium text-gray-600 mt-1">{paymentDetails.settings.bankAccount}</p>
                    </div>
                    <button onClick={() => handleCopy(paymentDetails.settings.bankAccount.replace(/[^0-9]/g, ''))} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                      Copy No. Rek
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Booking ID</p>
                <p className="font-display font-black text-xl mt-1 text-gray-900">{paymentDetails.id}</p>
                <p className="text-xs text-green-600 mt-2 font-medium">Order ini telah masuk ke Dashboard Member Anda.</p>
              </div>
            </div>
            <a href="/member" className="block w-full text-center px-6 py-4 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm mt-8 shadow-sm hover:bg-[var(--color-primary-light)] transition-colors">Lihat di Dashboard Member →</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900">{t('booking.title')}</h1>
        </div>

        <StepIndicator current={step} steps={steps} />

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 relative">
          {step === 0 && <Step1 bikesList={bikesList} selected={selectedBike} onSelect={chooseBike} locale={locale} t={t} requestedBike={requestedBike} />}
          {step === 1 && <Step2 selectedBike={selectedBike} rentalType={rentalType} setRentalType={setRentalType} dates={dates} setDates={setDates} pickupMethod={pickupMethod} setPickupMethod={setPickupMethod} t={t} locale={locale} />}
          {step === 2 && <Step3 selectedAccessories={selectedAccessories} toggleAccessory={toggleAccessory} setSelectedAccessories={setSelectedAccessories} locale={locale} t={t} />}
          {step === 3 && <Step4 selectedBike={selectedBike} rentalType={rentalType} dates={dates} pickupMethod={pickupMethod} selectedAccessories={selectedAccessories} customerInfo={customerInfo} setCustomerInfo={setCustomerInfo} t={t} locale={locale} />}
          {submitError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</p>}

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl font-semibold text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">← {t('booking.prev')}</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={handleNext} disabled={!canNext()} className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm
                ${canNext() ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {step === 1 ? 'Selesaikan di Dashboard Member →' : `${t('booking.next')} →`}
              </button>
            ) : (
              <button disabled={submitting || !canNext()} onClick={handleSubmit} className="px-8 py-3 rounded-xl font-semibold text-sm bg-[var(--color-primary)] text-white shadow-md hover:bg-[var(--color-primary-light)] transition-all flex items-center gap-2 disabled:opacity-50">
                <CreditCard size={18} /> {submitting ? 'Menyimpan…' : t('booking.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
