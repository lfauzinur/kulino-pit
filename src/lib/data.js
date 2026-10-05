export const bikes = [
  {
    id: 1,
    name: 'Polygon Helios C8',
    category: 'roadbike',
    image: '/images/bikes/roadbike.png',
    frameSize: ['S', 'M', 'L', 'XL'],
    pricePerDay: 250000,
    pricePerHour: 50000,
    available: true,
    description: { id: 'Road bike karbon premium untuk performa optimal di jalan raya.', en: 'Premium carbon road bike for optimal road performance.' },
    specs: { weight: '7.8kg', groupset: 'Shimano Ultegra R8000', brake: 'Disc Brake', wheel: '700c' },
  },
  {
    id: 2,
    name: 'Polygon Siskiu T8',
    category: 'mtb',
    image: '/images/bikes/mtb.png',
    frameSize: ['S', 'M', 'L'],
    pricePerDay: 200000,
    pricePerHour: 45000,
    available: true,
    description: { id: 'Full suspension MTB tangguh untuk medan off-road yang menantang.', en: 'Tough full suspension MTB for challenging off-road terrain.' },
    specs: { weight: '13.2kg', groupset: 'Shimano Deore XT', brake: 'Hydraulic Disc', wheel: '29"' },
  },
  {
    id: 3,
    name: 'Brompton C Line Explore',
    category: 'folding',
    image: '/images/bikes/folding.png',
    frameSize: ['One Size'],
    pricePerDay: 300000,
    pricePerHour: 60000,
    available: true,
    description: { id: 'Sepeda lipat premium klasik Inggris, kompak dan stylish.', en: 'Classic premium British folding bike, compact and stylish.' },
    specs: { weight: '12.3kg', groupset: '6-speed', brake: 'Rim Brake', wheel: '16"' },
  },
  {
    id: 4,
    name: 'Specialized Turbo Vado SL',
    category: 'ebike',
    image: '/images/bikes/ebike.png',
    frameSize: ['S', 'M', 'L'],
    pricePerDay: 350000,
    pricePerHour: 70000,
    available: true,
    description: { id: 'E-bike ringan dengan motor SL 1.1 untuk komuter urban modern.', en: 'Lightweight e-bike with SL 1.1 motor for modern urban commuting.' },
    specs: { weight: '15.0kg', motor: 'SL 1.1 (240W)', battery: '320Wh', range: '130km' },
  },
  {
    id: 5,
    name: 'Polygon Strattos S5',
    category: 'roadbike',
    image: '/images/bikes/roadbike.png',
    frameSize: ['S', 'M', 'L', 'XL'],
    pricePerDay: 180000,
    pricePerHour: 40000,
    available: false,
    description: { id: 'Road bike alloy terjangkau dengan performa luar biasa.', en: 'Affordable alloy road bike with outstanding performance.' },
    specs: { weight: '8.9kg', groupset: 'Shimano 105', brake: 'Disc Brake', wheel: '700c' },
  },
  {
    id: 6,
    name: 'Polygon Xtrada 7',
    category: 'mtb',
    image: '/images/bikes/mtb.png',
    frameSize: ['S', 'M', 'L'],
    pricePerDay: 150000,
    pricePerHour: 35000,
    available: true,
    description: { id: 'Hardtail MTB serbaguna untuk trail ringan hingga sedang.', en: 'Versatile hardtail MTB for light to moderate trails.' },
    specs: { weight: '11.5kg', groupset: 'Shimano Deore', brake: 'Hydraulic Disc', wheel: '27.5"' },
  },
];

export const accessories = [
  { id: 'helmet', name: { id: 'Helm MTB (MET Echo)', en: 'MTB Helmet (MET Echo)' }, price: 25000, icon: '🪖' },
  { id: 'lights', name: { id: 'Lampu Set (Front 1000lm + Rear)', en: 'Light Set (Front 1000lm + Rear)' }, price: 35000, icon: '💡' },
  { id: 'saddlebag', name: { id: 'Saddle Bag (Topeak Aero Wedge)', en: 'Saddle Bag (Topeak Aero Wedge)' }, price: 20000, icon: '👜' },
  { id: 'gps', name: { id: 'GPS Garmin Edge 530 + Rute', en: 'GPS Garmin Edge 530 + Routes' }, price: 75000, icon: '📍' },
  { id: 'jersey', name: { id: 'Jersey / Apparel Cyclist', en: 'Cycling Jersey / Apparel' }, price: 95000, icon: '👕' },
  { id: 'repairkit', name: { id: 'Repair Kit (Tools + Ban + Pompa)', en: 'Repair Kit (Tools + Tube + Pump)' }, price: 30000, icon: '🔧' },
];

export const tours = [
  {
    id: 1,
    slug: 'city-tour-sunrise-ride',
    name: { id: 'City Tour Sunrise Ride', en: 'City Tour Sunrise Ride' },
    duration: '4 jam',
    distance: '35 km',
    difficulty: { id: 'Mudah', en: 'Easy' },
    price: 450000,
    image: '/images/hero-banner.png',
    includes: {
      id: ['Sepeda & Helm', 'Road Captain', 'Snack & Air Mineral', 'Dokumentasi Foto'],
      en: ['Bike & Helmet', 'Road Captain', 'Snack & Water', 'Photo Documentation'],
    },
    description: {
      id: 'Nikmati sunrise spektakuler sambil bersepeda menyusuri jalanan kota yang masih sepi di pagi hari.',
      en: 'Enjoy a spectacular sunrise while cycling through the quiet city streets in the early morning.',
    },
  },
  {
    id: 2,
    slug: 'mountain-scenic-trail',
    name: { id: 'Mountain Scenic Trail', en: 'Mountain Scenic Trail' },
    duration: '6 jam',
    distance: '45 km',
    difficulty: { id: 'Sedang', en: 'Medium' },
    price: 750000,
    image: '/images/hero-banner.png',
    includes: {
      id: ['MTB & Helm', 'Road Captain + Sweeper', 'Makan Siang Lokal', 'Dokumentasi Drone', 'Tim Medis'],
      en: ['MTB & Helmet', 'Road Captain + Sweeper', 'Local Lunch', 'Drone Documentation', 'Medical Team'],
    },
    description: {
      id: 'Petualangan off-road menyusuri jalur pegunungan dengan pemandangan alam yang memukau.',
      en: 'Off-road adventure through mountain trails with breathtaking natural views.',
    },
  },
  {
    id: 3,
    slug: 'coastal-explorer-full-day',
    name: { id: 'Coastal Explorer Full Day', en: 'Coastal Explorer Full Day' },
    duration: '8 jam',
    distance: '65 km',
    difficulty: { id: 'Sulit', en: 'Hard' },
    price: 1200000,
    image: '/images/hero-banner.png',
    includes: {
      id: ['Sepeda Premium', 'Full Support Team', 'Makan Siang + Snack', 'Dokumentasi Full', 'Jersey Eksklusif', 'Medali Finisher'],
      en: ['Premium Bike', 'Full Support Team', 'Lunch + Snacks', 'Full Documentation', 'Exclusive Jersey', 'Finisher Medal'],
    },
    description: {
      id: 'Tour sehari penuh menyusuri pesisir pantai dengan dukungan tim lengkap dan pengalaman tak terlupakan.',
      en: 'Full day tour along the coast with complete team support and an unforgettable experience.',
    },
  },
];

export const testimonials = [
  { id: 1, name: 'Andi Pratama', avatar: '🧑', role: 'Cyclist Enthusiast', rating: 5, text: { id: 'Sepedanya premium banget dan pelayanannya luar biasa. Road Captain-nya sangat profesional dan ramah!', en: 'The bikes are super premium and the service is outstanding. The Road Captain is very professional and friendly!' } },
  { id: 2, name: 'Sarah W.', avatar: '👩', role: 'Tourist', rating: 5, text: { id: 'Pengalaman tour-nya luar biasa! Pemandangan indah, dokumentasi keren, dan sepedanya nyaman banget.', en: 'Amazing tour experience! Beautiful views, great documentation, and very comfortable bikes.' } },
  { id: 3, name: 'Budi Santoso', avatar: '👨', role: 'Event Organizer', rating: 5, text: { id: 'Manpower dari Kulino Pit sangat terlatih. Marshal dan mekaniknya sigap. Pasti pakai lagi di event berikutnya!', en: 'Kulino Pit manpower is very well-trained. Marshals and mechanics are responsive. Will definitely use again!' } },
  { id: 4, name: 'Dewi Anggraini', avatar: '👩‍🦱', role: 'Mitra Partner', rating: 5, text: { id: 'Sepeda saya yang nganggur sekarang jadi sumber income. Prosesnya mudah dan transparan.', en: 'My idle bike is now a source of income. The process is easy and transparent.' } },
];

export const articles = [
  { id: 1, title: { id: '5 Rute Gowes Terbaik di Banyuwangi', en: '5 Best Cycling Routes in Banyuwangi' }, excerpt: { id: 'Temukan rute-rute indah yang wajib dicoba untuk penggemar bersepeda di Banyuwangi.', en: 'Discover beautiful must-try routes for cycling enthusiasts in Banyuwangi.' }, date: '2026-09-28', category: { id: 'Rute Gowes', en: 'Cycling Routes' }, image: '/images/hero-banner.png' },
  { id: 2, title: { id: 'Panduan Perawatan Sepeda Road Bike', en: 'Road Bike Maintenance Guide' }, excerpt: { id: 'Tips dan trik merawat road bike agar tetap optimal dan awet digunakan.', en: 'Tips and tricks to maintain your road bike for optimal and lasting use.' }, date: '2026-09-20', category: { id: 'Tips & Trik', en: 'Tips & Tricks' }, image: '/images/bikes/roadbike.png' },
  { id: 3, title: { id: 'Event Cycling Banyuwangi Festival 2026', en: 'Banyuwangi Cycling Festival 2026' }, excerpt: { id: 'Laporan lengkap event cycling terbesar di Banyuwangi yang diselenggarakan bulan lalu.', en: 'Complete report on the biggest cycling event in Banyuwangi held last month.' }, date: '2026-09-15', category: { id: 'Event', en: 'Events' }, image: '/images/hero-banner.png' },
];

export const memberData = {
  name: 'Andi Pratama',
  email: 'andi@email.com',
  memberId: 'KP-2026-0089',
  points: 1250,
  level: 'Gold',
  totalBookings: 12,
  referralCode: 'ANDI2026',
  referralLink: 'https://kulinopit.id/ref/ANDI2026',
  referralStats: { clicks: 245, signups: 18, earnings: 540000 },
  bookingHistory: [
    { id: 'BK001', bike: 'Polygon Helios C8', date: '2026-09-25', duration: '2 hari', total: 500000, status: 'completed', points: 50 },
    { id: 'BK002', bike: 'Brompton C Line', date: '2026-09-18', duration: '1 hari', total: 300000, status: 'completed', points: 30 },
    { id: 'BK003', bike: 'Specialized Vado SL', date: '2026-10-05', duration: '3 hari', total: 1050000, status: 'upcoming', points: 0 },
  ],
  rewards: [
    { id: 1, name: { id: 'Diskon 10% Booking', en: '10% Booking Discount' }, cost: 100, icon: '🏷️' },
    { id: 2, name: { id: 'Free Helm MTB', en: 'Free MTB Helmet' }, cost: 200, icon: '🪖' },
    { id: 3, name: { id: 'Kaos Kulino Pit', en: 'Kulino Pit T-Shirt' }, cost: 500, icon: '👕' },
    { id: 4, name: { id: 'Free Half-Day Tour', en: 'Free Half-Day Tour' }, cost: 1000, icon: '🚴' },
  ],
};

export const calendarBookings = [
  { bikeId: 1, bikeName: 'Polygon Helios C8', userId: 'User 89', startDate: '2026-10-12', endDate: '2026-10-14' },
  { bikeId: 2, bikeName: 'Polygon Siskiu T8', userId: 'User 23', startDate: '2026-10-08', endDate: '2026-10-10' },
  { bikeId: 3, bikeName: 'Brompton C Line', userId: 'User 45', startDate: '2026-10-15', endDate: '2026-10-16' },
  { bikeId: 4, bikeName: 'Specialized Vado SL', userId: 'User 12', startDate: '2026-10-05', endDate: '2026-10-07' },
  { bikeId: 1, bikeName: 'Polygon Helios C8', userId: 'User 67', startDate: '2026-10-20', endDate: '2026-10-22' },
];

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}
