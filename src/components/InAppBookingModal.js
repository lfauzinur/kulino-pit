'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  X, Clock, Calendar, Store, Truck, CheckCircle2, CreditCard, 
  Sparkles, ShieldCheck, Copy, ArrowRight, Check, HardHat, Lightbulb, 
  Briefcase, Map, Shirt, Wrench 
} from 'lucide-react';
import { rentalDurations, accessories, formatCurrency, getPriceByDuration } from '@/lib/data';

const accIcons = {
  helmet: <HardHat size={18} className="text-[var(--color-primary)]" />,
  lights: <Lightbulb size={18} className="text-[var(--color-primary)]" />,
  saddlebag: <Briefcase size={18} className="text-[var(--color-primary)]" />,
  gps: <Map size={18} className="text-[var(--color-primary)]" />,
  jersey: <Shirt size={18} className="text-[var(--color-primary)]" />,
  repairkit: <Wrench size={18} className="text-[var(--color-primary)]" />
};

export default function InAppBookingModal({ bike, onClose, onSuccess }) {
  const [rentalType, setRentalType] = useState('2h');
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('06:30');
  const [pickupMethod, setPickupMethod] = useState('pickup');
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Set default date to today in YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  if (!bike) return null;

  const toggleAccessory = (id) => {
    setSelectedAccessories(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Calculations
  const durationPrice = getPriceByDuration(bike, rentalType);
  const durationObj = rentalDurations.find(d => d.key === rentalType);
  const durationLabel = durationObj?.label?.id || durationObj?.shortLabel || '2 Jam';
  
  const accessoryTotal = accessories
    .filter(a => selectedAccessories.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const deliveryFee = pickupMethod === 'delivery' ? 50000 : 0;
  const subtotal = durationPrice + accessoryTotal + deliveryFee;
  const uniqueCode = Math.floor(Math.random() * 90) + 10;
  const grandTotal = subtotal + uniqueCode;

  const handleConfirmBooking = () => {
    const bookingId = `KP-${Date.now().toString().slice(-7)}`;
    
    let durationMinutes = 120;
    if (rentalType === 'day') {
      durationMinutes = 24 * 60;
    } else {
      durationMinutes = parseInt(rentalType.replace('h', '')) * 60;
    }

    const newBooking = {
      id: bookingId,
      bike: bike.name,
      date: selectedDate,
      time: startTime,
      duration: durationLabel,
      durationMinutes,
      activeSince: Date.now(), // starts right now for instant live timer demo
      status: 'active', // active rental so user immediately sees live countdown
      total: grandTotal,
      points: 50,
      pickupMethod,
      paymentMethod,
    };

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('memberBookings') || '[]');
      localStorage.setItem('memberBookings', JSON.stringify([newBooking, ...existing]));
    } catch (e) {
      console.warn('Failed saving booking:', e);
    }

    setBookingResult({
      ...newBooking,
      uniqueCode,
      subtotal,
    });
    setIsSubmitted(true);

    if (onSuccess) {
      onSuccess(newBooking);
    }
  };

  const handleCopyText = (text) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <h3 className="font-display font-black text-sm tracking-wide">
              {isSubmitted ? 'Konfirmasi Booking Selesai' : 'Pemesanan Sewa Sepeda Member PWA'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-hide flex-1">
          
          {/* SUCCESS SCREEN */}
          {isSubmitted && bookingResult ? (
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                  SEWA BERHASIL DIAKTIFKAN
                </span>
                <h4 className="font-display font-black text-2xl text-gray-900 mt-2">
                  Siap Bersepeda! 🚴
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Sepeda <strong className="text-gray-800">{bookingResult.bike}</strong> kini aktif di Dashboard Member Anda. Timer sewa langsung berjalan.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 text-left space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-gray-200 text-xs">
                  <span className="text-gray-400 font-semibold">Nomor Booking</span>
                  <span className="font-mono font-bold text-gray-800">{bookingResult.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Unit Sepeda</span>
                  <span className="font-bold text-gray-900">{bookingResult.bike}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Durasi Sewa</span>
                  <span className="font-bold text-[var(--color-primary)]">{bookingResult.duration}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Metode Bayar</span>
                  <span className="font-bold text-gray-800">{bookingResult.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-gray-200 text-sm">
                  <span className="font-bold text-gray-700">Total Pembayaran</span>
                  <span className="font-display font-black text-base text-[var(--color-primary)]">
                    {formatCurrency(bookingResult.total)}
                  </span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 mb-1">
                  Info Pembayaran ({bookingResult.paymentMethod})
                </p>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-sky-200">
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      {bookingResult.paymentMethod === 'QRIS' ? 'QRIS Kulino Pit ID' : 'BCA 1800-8899-22 a/n Kulino House'}
                    </p>
                    <p className="text-[10px] text-gray-400">Transfer tepat hingga digit terakhir</p>
                  </div>
                  <button
                    onClick={() => handleCopyText(bookingResult.total.toString())}
                    className="btn px-3 py-1.5 text-[10px] font-bold bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center gap-1"
                  >
                    <Copy size={12} /> {copied ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn btn-primary w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
              >
                Kembali ke Dashboard Member <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <>
              {/* CHOSEN BIKE PREVIEW HEADER */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                <div className="relative w-16 h-16 rounded-xl bg-white border border-sky-100 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs">
                  <Image
                    src={bike.image}
                    alt={bike.name}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--color-primary)] text-white text-[9px] font-black uppercase tracking-wider">
                      {bike.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold truncate">
                      {bike.specs?.groupset || 'Shimano'}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-base text-gray-900 leading-tight truncate mt-0.5">
                    {bike.name}
                  </h4>
                  <p className="text-[10px] text-gray-500">
                    Mulai {formatCurrency(getPriceByDuration(bike, '2h'))} / 2 jam
                  </p>
                </div>
              </div>

              {/* STEP 1: LANGSUNG PILIH DURASI SEWA (Permintaan User: Tidak Perlu Pilih Sepeda Lagi) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  1. PILIH DURASI SEWA SEPEDA
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {rentalDurations.map((dur) => {
                    const price = getPriceByDuration(bike, dur.key);
                    const isSelected = rentalType === dur.key;
                    return (
                      <button
                        key={dur.key}
                        onClick={() => setRentalType(dur.key)}
                        type="button"
                        className={`rounded-2xl p-3 text-left transition-all border relative cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 border-[var(--color-primary)] shadow-sm ring-2 ring-[var(--color-primary)]/20'
                            : 'bg-white border-gray-200 hover:border-sky-200 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                            {dur.label?.id || dur.shortLabel}
                          </span>
                          {isSelected && <CheckCircle2 size={14} className="text-[var(--color-primary)] shrink-0" />}
                        </div>
                        <p className={`font-display font-black text-sm ${isSelected ? 'text-[var(--color-primary)]' : 'text-gray-900'}`}>
                          {formatCurrency(price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: TANGGAL & WAKTU SEWA */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  2. JADWAL GOWES & METODE PENGAMBILAN
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-400 mb-1">Tanggal Sewa</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--color-primary)] font-semibold text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-semibold text-gray-400 mb-1">Jam Mulai</label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[var(--color-primary)] font-semibold text-gray-800"
                    >
                      <option value="06:00">06:00 (Sunrise Ride)</option>
                      <option value="07:00">07:00 (Morning Ride)</option>
                      <option value="08:30">08:30 (Day Tour)</option>
                      <option value="15:30">15:30 (Afternoon Ride)</option>
                      <option value="16:30">16:30 (Sunset Ride)</option>
                    </select>
                  </div>
                </div>

                {/* Pickup Options */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPickupMethod('pickup')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      pickupMethod === 'pickup'
                        ? 'bg-sky-50 border-[var(--color-primary)] text-[var(--color-primary)] font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Store size={18} className="shrink-0" />
                    <div>
                      <p className="text-xs leading-none">Ambil di Pitstop</p>
                      <p className="text-[9px] text-gray-400 font-normal mt-0.5">Gratis (Kulino House)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupMethod('delivery')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      pickupMethod === 'delivery'
                        ? 'bg-sky-50 border-[var(--color-primary)] text-[var(--color-primary)] font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Truck size={18} className="shrink-0" />
                    <div>
                      <p className="text-xs leading-none">Antar ke Hotel</p>
                      <p className="text-[9px] text-gray-400 font-normal mt-0.5">+Rp 50.000</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* STEP 3: AKSESORIS TAMBAHAN (OPSIONAL) */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    3. AKSESORIS TAMBAHAN (OPSIONAL)
                  </label>
                  <span className="text-[9px] text-gray-400">Pilih jika butuh</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {accessories.map((acc) => {
                    const isSelected = selectedAccessories.includes(acc.id);
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => toggleAccessory(acc.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-[var(--color-primary)] shadow-xs'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0">{accIcons[acc.id] || '⚙️'}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-gray-800 truncate leading-tight">
                              {acc.name?.id || acc.name}
                            </p>
                            <p className="text-[9px] text-[var(--color-primary)] font-bold">
                              +{formatCurrency(acc.price)}
                            </p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: METODE PEMBAYARAN */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                  4. METODE PEMBAYARAN
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['QRIS', 'Bank Transfer', 'E-Wallet'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                        paymentMethod === method
                          ? 'bg-sky-50 border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* TOTAL RINGKASAN & SUBMIT BUTTON */}
              <div className="pt-4 border-t border-gray-100 bg-gray-50/60 -mx-5 -mb-5 p-5 rounded-b-3xl">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-semibold uppercase">Total Pembayaran</span>
                    <span className="font-display font-black text-xl text-[var(--color-primary)]">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-gray-400">
                    <span>{durationLabel} • {pickupMethod === 'delivery' ? 'Antar Hotel' : 'Ambil Pitstop'}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmBooking}
                  className="btn btn-primary w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={16} /> Konfirmasi & Sewa Sekarang
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
