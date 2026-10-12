'use client';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageLoader from '@/components/PageLoader';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isMember = pathname?.startsWith('/member');

  return (
    <I18nProvider>
      <PageLoader />
      {!isAdmin && !isMember && <Navbar />}
      <main className={!isAdmin && !isMember ? "pt-[72px] min-h-screen" : "min-h-screen"}>
        {children}
      </main>
      {!isAdmin && !isMember && <Footer />}
    </I18nProvider>
  );
}

