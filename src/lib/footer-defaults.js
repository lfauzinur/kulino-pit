export const footerDefaults = {
  brandName: 'Kulino Pit',
  tagline: 'Ora Usah Spanneng',
  description: {
    id: 'Layanan penyewaan sepeda premium dan dukungan logistik terbaik di Banyuwangi.',
    en: 'Premium bicycle rental and the best logistics support in Banyuwangi.',
  },
  showCta: true,
  ctaTitle: { id: 'Siap untuk Bersepeda?', en: 'Ready to Ride?' },
  ctaDescription: { id: 'Mulai petualangan Anda dengan sepeda premium dari Kulino Pit hari ini.', en: 'Start your adventure with premium bikes from Kulino Pit today.' },
  ctaButton: { id: 'Pilih Sepeda', en: 'Choose a Bike' },
  ctaUrl: '/unit-sepeda',
  sectionTitles: {
    navigation: { id: 'Navigasi', en: 'Navigation' },
    help: { id: 'Bantuan', en: 'Support' },
    contact: { id: 'Kontak & Lokasi', en: 'Contact & Location' },
  },
  copyright: 'Kulino Pit by Kulino House. All rights reserved.',
  madeWith: { id: 'Dibuat dengan ❤️ di Banyuwangi', en: 'Made with ❤️ in Banyuwangi' },
};

export const footerDefaultItems = [
  ['navigation', 'Beranda', 'Home', '/', 'link', 10],
  ['navigation', 'Unit Sepeda', 'Bikes', '/unit-sepeda', 'link', 20],
  ['navigation', 'Layanan', 'Services', '/layanan', 'link', 30],
  ['navigation', 'Trip & Tour', 'Trip & Tour', '/trip-tour', 'link', 40],
  ['navigation', 'Routes', 'Routes', '/routes', 'link', 50],
  ['navigation', 'Artikel', 'Articles', '/artikel', 'link', 60],
  ['help', 'Tentang Kami', 'About Us', '/tentang', 'link', 10],
  ['help', 'Lokasi', 'Location', '/lokasi', 'link', 20],
  ['help', 'Syarat & Ketentuan', 'Terms & Conditions', '/syarat-ketentuan', 'link', 30],
  ['help', 'Kebijakan Privasi', 'Privacy Policy', '/kebijakan-privasi', 'link', 40],
  ['help', 'FAQ', 'FAQ', '/faq', 'link', 50],
  ['contact', 'Jl Kapten Waroka No 08 Tukangkayu Banyuwangi, Jawa Timur', 'Jl Kapten Waroka No 08 Tukangkayu Banyuwangi, East Java', '', 'map-pin', 10],
  ['contact', '0811-3000-000', '0811-3000-000', 'tel:08113000000', 'phone', 20],
  ['contact', 'Setiap Hari (06:00 - 20:00)', 'Every Day (06:00 - 20:00)', '', 'clock', 30],
  ['social', 'IG', 'Instagram', '#', 'instagram', 10],
  ['social', 'WA', 'WhatsApp', '#', 'message-circle', 20],
];

export function mergeFooterSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    ...footerDefaults,
    ...source,
    description: { ...footerDefaults.description, ...(source.description || {}) },
    ctaTitle: { ...footerDefaults.ctaTitle, ...(source.ctaTitle || {}) },
    ctaDescription: { ...footerDefaults.ctaDescription, ...(source.ctaDescription || {}) },
    ctaButton: { ...footerDefaults.ctaButton, ...(source.ctaButton || {}) },
    sectionTitles: {
      navigation: { ...footerDefaults.sectionTitles.navigation, ...(source.sectionTitles?.navigation || {}) },
      help: { ...footerDefaults.sectionTitles.help, ...(source.sectionTitles?.help || {}) },
      contact: { ...footerDefaults.sectionTitles.contact, ...(source.sectionTitles?.contact || {}) },
    },
    madeWith: { ...footerDefaults.madeWith, ...(source.madeWith || {}) },
  };
}

