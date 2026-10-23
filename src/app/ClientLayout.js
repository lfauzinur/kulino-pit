'use client';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageLoader from '@/components/PageLoader';
import MascotWidget from '@/components/MascotWidget';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isMember = pathname?.startsWith('/member');

  return (
    <I18nProvider>
      <PageLoader />
      {!isAdmin && !isMember && <Navbar />}
      <main className={!isAdmin && !isMember ? "min-h-screen overflow-x-hidden pt-16 sm:pt-20" : "min-h-screen"}>
        {children}
      </main>
      {!isAdmin && !isMember && <Footer />}
      <MascotWidget />
    </I18nProvider>
  );
}
