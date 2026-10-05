/**
 * CMS Store - Centralized content management state for admin audit
 * Tracks all editable content across the website pages
 */

// ─── Page Registry: Maps all public pages and their CMS-editable sections ───
export const pageRegistry = [
  {
    id: 'homepage',
    path: '/',
    name: 'Beranda (Homepage)',
    category: 'Halaman Utama',
    sections: [
      { id: 'hero', name: 'Hero Section', fields: ['title', 'description', 'cta_text'], type: 'content' },
      { id: 'about', name: 'Tentang Kami', fields: ['title', 'desc1', 'desc2', 'quote'], type: 'content' },
      { id: 'howItWorks', name: 'Cara Kerja', fields: ['title', 'subtitle', 'steps'], type: 'content' },
      { id: 'rentalOptions', name: 'Opsi Sewa', fields: ['title', 'subtitle', 'options'], type: 'content' },
      { id: 'featuredBikes', name: 'Sepeda Unggulan', fields: ['title', 'subtitle'], type: 'data' },
      { id: 'popularTours', name: 'Tour Populer', fields: ['title', 'subtitle'], type: 'data' },
      { id: 'testimonials', name: 'Testimoni', fields: ['title', 'subtitle'], type: 'data' },
    ],
    status: 'published',
    lastModified: '2026-10-04T10:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'tentang',
    path: '/tentang',
    name: 'Tentang Kami',
    category: 'Halaman Info',
    sections: [
      { id: 'hero', name: 'Hero Section', fields: ['badge', 'title', 'description', 'cta'], type: 'content' },
      { id: 'philosophy', name: 'Filosofi & Kenapa Gowes', fields: ['title', 'paragraph1', 'paragraph2', 'quote', 'cta'], type: 'content' },
      { id: 'location', name: 'Lokasi Basecamp', fields: ['title', 'description', 'maps_link'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-10-03T14:30:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'unit-sepeda',
    path: '/unit-sepeda',
    name: 'Katalog Unit Sepeda',
    category: 'Katalog',
    sections: [
      { id: 'header', name: 'Header & Filter', fields: ['title', 'subtitle', 'categories'], type: 'content' },
      { id: 'bikes', name: 'Data Sepeda', fields: ['name', 'category', 'price', 'specs', 'availability'], type: 'data', count: 6 },
    ],
    status: 'published',
    lastModified: '2026-10-02T09:15:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'layanan',
    path: '/layanan',
    name: 'Layanan Kami',
    category: 'Halaman Info',
    sections: [
      { id: 'header', name: 'Header Layanan', fields: ['title', 'subtitle'], type: 'content' },
      { id: 'mainServices', name: 'Layanan Utama (3)', fields: ['title', 'desc', 'features', 'price'], type: 'content' },
      { id: 'manpower', name: 'Manpower Roles (6)', fields: ['role', 'description'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-10-01T16:45:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'trip-tour',
    path: '/trip-tour',
    name: 'Trip & Tour',
    category: 'Katalog',
    sections: [
      { id: 'tours', name: 'Paket Tour', fields: ['name', 'description', 'price', 'distance', 'duration', 'includes'], type: 'data', count: 3 },
      { id: 'detail', name: 'Detail Page (per tour)', fields: ['gallery', 'meeting_point', 'booking_cta'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-10-03T11:20:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'artikel',
    path: '/artikel',
    name: 'Artikel & Blog',
    category: 'Konten',
    sections: [
      { id: 'header', name: 'Header Artikel', fields: ['title', 'description'], type: 'content' },
      { id: 'articles', name: 'Daftar Artikel', fields: ['title', 'excerpt', 'category', 'date', 'image'], type: 'data', count: 3 },
    ],
    status: 'published',
    lastModified: '2026-09-28T08:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'faq',
    path: '/faq',
    name: 'FAQ (Tanya Jawab)',
    category: 'Halaman Info',
    sections: [
      { id: 'header', name: 'Header FAQ', fields: ['title', 'description'], type: 'content' },
      { id: 'items', name: 'Daftar Pertanyaan', fields: ['question', 'answer'], type: 'data', count: 6 },
      { id: 'contact', name: 'Kontak CTA', fields: ['title', 'desc', 'whatsapp_link'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-09-30T13:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'jadi-mitra',
    path: '/jadi-mitra',
    name: 'Jadi Mitra (Partnership)',
    category: 'Formulir',
    sections: [
      { id: 'header', name: 'Header & CTA', fields: ['title', 'subtitle'], type: 'content' },
      { id: 'benefits', name: 'Benefits (6)', fields: ['title', 'description'], type: 'content' },
      { id: 'form', name: 'Form Pendaftaran', fields: ['fields', 'conditions'], type: 'form' },
    ],
    status: 'published',
    lastModified: '2026-10-01T10:30:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'routes',
    path: '/routes',
    name: 'Rute Gowes',
    category: 'Katalog',
    sections: [
      { id: 'header', name: 'Header Rute', fields: ['badge', 'title', 'description'], type: 'content' },
      { id: 'routes', name: 'Daftar Rute', fields: ['name', 'distance', 'elevation', 'difficulty', 'coordinates'], type: 'data', count: 6 },
    ],
    status: 'published',
    lastModified: '2026-10-04T15:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'booking',
    path: '/booking',
    name: 'Booking / Reservasi',
    category: 'Formulir',
    sections: [
      { id: 'form', name: 'Form Booking', fields: ['bike_selection', 'date', 'accessories', 'payment'], type: 'form' },
    ],
    status: 'published',
    lastModified: '2026-10-03T09:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'member',
    path: '/member',
    name: 'Member Portal',
    category: 'Portal',
    sections: [
      { id: 'dashboard', name: 'Dashboard Member', fields: ['stats', 'history'], type: 'data' },
      { id: 'tracker', name: 'Ride Tracker', fields: ['gps', 'stats', 'share'], type: 'feature' },
      { id: 'calendar', name: 'Kalender Booking', fields: ['events'], type: 'data' },
      { id: 'points', name: 'Poin & Rewards', fields: ['rewards_list', 'redeem'], type: 'data' },
      { id: 'spin', name: 'Spin & Win', fields: ['prizes', 'wheel'], type: 'feature' },
      { id: 'referral', name: 'Referral Program', fields: ['link', 'stats', 'payout'], type: 'feature' },
    ],
    status: 'published',
    lastModified: '2026-10-05T07:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'kebijakan-privasi',
    path: '/kebijakan-privasi',
    name: 'Kebijakan Privasi',
    category: 'Legal',
    sections: [
      { id: 'content', name: 'Konten Kebijakan', fields: ['full_text'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-09-15T10:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'syarat-ketentuan',
    path: '/syarat-ketentuan',
    name: 'Syarat & Ketentuan',
    category: 'Legal',
    sections: [
      { id: 'content', name: 'Konten S&K', fields: ['full_text'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-09-15T10:00:00',
    modifiedBy: 'Admin',
  },
  {
    id: 'lokasi',
    path: '/lokasi',
    name: 'Lokasi',
    category: 'Halaman Info',
    sections: [
      { id: 'map', name: 'Peta Lokasi', fields: ['address', 'coordinates', 'hours'], type: 'content' },
    ],
    status: 'published',
    lastModified: '2026-09-20T12:00:00',
    modifiedBy: 'Admin',
  },
];

// ─── Audit Log Data ───
export const auditLogs = [
  { id: 1, action: 'update', page: 'Beranda', section: 'Hero Section', user: 'Admin', timestamp: '2026-10-05T08:30:00', detail: 'Mengubah judul hero dan deskripsi' },
  { id: 2, action: 'update', page: 'Unit Sepeda', section: 'Data Sepeda', user: 'Admin', timestamp: '2026-10-04T15:20:00', detail: 'Menambah sepeda baru: Polygon Xtrada 7' },
  { id: 3, action: 'update', page: 'Trip & Tour', section: 'Paket Tour', user: 'Admin', timestamp: '2026-10-04T14:00:00', detail: 'Update harga Coastal Explorer Full Day' },
  { id: 4, action: 'create', page: 'Rute Gowes', section: 'Daftar Rute', user: 'Admin', timestamp: '2026-10-04T12:45:00', detail: 'Menambah rute baru: Pesisir Pantai Timur' },
  { id: 5, action: 'update', page: 'FAQ', section: 'Daftar Pertanyaan', user: 'Admin', timestamp: '2026-10-03T16:30:00', detail: 'Menambah 2 pertanyaan baru tentang pengiriman' },
  { id: 6, action: 'update', page: 'Artikel', section: 'Daftar Artikel', user: 'Admin', timestamp: '2026-09-28T08:00:00', detail: 'Publish artikel baru: 5 Rute Gowes Terbaik' },
  { id: 7, action: 'update', page: 'Layanan', section: 'Layanan Utama', user: 'Admin', timestamp: '2026-10-01T16:45:00', detail: 'Update harga layanan dokumentasi' },
  { id: 8, action: 'update', page: 'Member Portal', section: 'Spin & Win', user: 'Admin', timestamp: '2026-10-05T07:00:00', detail: 'Konfigurasi hadiah spin wheel baru' },
  { id: 9, action: 'update', page: 'Jadi Mitra', section: 'Benefits', user: 'Admin', timestamp: '2026-10-01T10:30:00', detail: 'Menambah benefit: Laporan Transparan' },
  { id: 10, action: 'create', page: 'Beranda', section: 'Testimoni', user: 'Admin', timestamp: '2026-10-02T11:00:00', detail: 'Menambah testimoni baru dari Dewi Anggraini' },
  { id: 11, action: 'delete', page: 'Unit Sepeda', section: 'Data Sepeda', user: 'Admin', timestamp: '2026-09-25T09:00:00', detail: 'Menghapus sepeda: Dahon Mu SL (sold)' },
  { id: 12, action: 'update', page: 'Lokasi', section: 'Peta Lokasi', user: 'Admin', timestamp: '2026-09-20T12:00:00', detail: 'Update jam operasional' },
];

// ─── Content Health Metrics ───
export function getContentHealthScore(page) {
  // Simple scoring based on last modified date
  const now = new Date('2026-10-05T12:00:00');
  const modified = new Date(page.lastModified);
  const daysSince = Math.floor((now - modified) / (1000 * 60 * 60 * 24));
  
  if (daysSince <= 3) return { score: 100, label: 'Segar', color: 'green' };
  if (daysSince <= 7) return { score: 80, label: 'Baik', color: 'blue' };
  if (daysSince <= 14) return { score: 60, label: 'Perlu Review', color: 'yellow' };
  if (daysSince <= 30) return { score: 40, label: 'Perlu Update', color: 'orange' };
  return { score: 20, label: 'Kadaluarsa', color: 'red' };
}

// ─── SEO Audit checks ───
export function getSEOStatus(pageId) {
  const seoData = {
    'homepage': { title: true, meta: true, h1: true, og: true, schema: false, score: 80 },
    'tentang': { title: true, meta: true, h1: true, og: false, schema: false, score: 60 },
    'unit-sepeda': { title: true, meta: true, h1: true, og: false, schema: true, score: 80 },
    'layanan': { title: true, meta: true, h1: true, og: false, schema: false, score: 60 },
    'trip-tour': { title: true, meta: true, h1: true, og: true, schema: true, score: 100 },
    'artikel': { title: true, meta: true, h1: true, og: true, schema: true, score: 100 },
    'faq': { title: true, meta: false, h1: true, og: false, schema: true, score: 60 },
    'jadi-mitra': { title: true, meta: true, h1: true, og: false, schema: false, score: 60 },
    'routes': { title: true, meta: true, h1: true, og: false, schema: false, score: 60 },
    'booking': { title: true, meta: false, h1: true, og: false, schema: false, score: 40 },
    'member': { title: true, meta: false, h1: true, og: false, schema: false, score: 40 },
    'kebijakan-privasi': { title: true, meta: false, h1: true, og: false, schema: false, score: 40 },
    'syarat-ketentuan': { title: true, meta: false, h1: true, og: false, schema: false, score: 40 },
    'lokasi': { title: true, meta: true, h1: true, og: false, schema: true, score: 80 },
  };
  return seoData[pageId] || { title: false, meta: false, h1: false, og: false, schema: false, score: 0 };
}

// ─── i18n Coverage ───
export function getI18nCoverage(pageId) {
  const i18nData = {
    'homepage': { id: 100, en: 100 },
    'tentang': { id: 90, en: 70 },
    'unit-sepeda': { id: 100, en: 100 },
    'layanan': { id: 100, en: 100 },
    'trip-tour': { id: 100, en: 100 },
    'artikel': { id: 100, en: 100 },
    'faq': { id: 100, en: 20 },
    'jadi-mitra': { id: 100, en: 100 },
    'routes': { id: 100, en: 100 },
    'booking': { id: 95, en: 95 },
    'member': { id: 100, en: 100 },
    'kebijakan-privasi': { id: 100, en: 30 },
    'syarat-ketentuan': { id: 100, en: 30 },
    'lokasi': { id: 80, en: 60 },
  };
  return i18nData[pageId] || { id: 0, en: 0 };
}
