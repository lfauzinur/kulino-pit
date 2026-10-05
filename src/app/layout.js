import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'Kulino Pit — Sewa Sepeda Premium | Kulino House',
  description: 'Kulino Pit menyediakan layanan penyewaan sepeda premium, paket trip & tour, dan layanan ekosistem bersepeda. Bagian dari Kulino House.',
  keywords: 'sewa sepeda, bike rental, Banyuwangi, Kulino Pit, Kulino House, cycling, road bike, MTB',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kulino Pit',
  },
  openGraph: {
    title: 'Kulino Pit — Sewa Sepeda Premium',
    description: 'Jelajahi keindahan dengan sepeda terbaik. Sewa sepeda premium untuk petualangan Anda.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#E05A2B" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800;900&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
