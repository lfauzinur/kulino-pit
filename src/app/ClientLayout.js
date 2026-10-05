'use client';
import { I18nProvider } from '@/lib/i18n';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <I18nProvider>
      {!isAdmin && <Navbar />}
      <main className={!isAdmin ? "pt-[72px] min-h-screen" : "min-h-screen"}>{children}</main>
      {!isAdmin && <Footer />}
    </I18nProvider>
  );
}
