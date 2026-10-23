'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n';
import { LayoutDashboard, CalendarDays, Bike, Users, FileText, LogOut, ShieldAlert, RotateCcw, Map, Shield, Navigation2, Menu, X, BriefcaseBusiness, Images, PanelsTopLeft } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    let cancelled = false;
    const verifySession = async () => {
      try {
        const response = await fetch('/api/admin/session', {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('Unauthorized');
        if (!cancelled) setIsAuthenticated(true);
      } catch {
        if (!cancelled) router.replace('/admin/login');
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    verifySession();
    return () => { cancelled = true; };
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/session', {
      method: 'DELETE',
      credentials: 'same-origin',
    }).catch(() => {});
    localStorage.removeItem('isAdmin');
    router.replace('/admin/login');
    router.refresh();
  };

  // If we are on the login page, don't render the sidebar, just the content
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent flash of content while checking auth
  if (isChecking || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const menu = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/admin/cms', label: 'CMS Audit', icon: <Shield size={20} /> },
    { href: '/admin/bookings', label: 'Bookings', icon: <CalendarDays size={20} /> },
    { href: '/admin/fleet', label: 'Fleet & Bikes', icon: <Bike size={20} /> },
    { href: '/admin/partners', label: 'Partners', icon: <Users size={20} /> },
    { href: '/admin/articles', label: 'Articles', icon: <FileText size={20} /> },
    { href: '/admin/tours', label: 'Tours & Trips', icon: <Map size={20} /> },
    { href: '/admin/services', label: 'Layanan', icon: <BriefcaseBusiness size={20} /> },
    { href: '/admin/content-cards', label: 'Paket & Manpower', icon: <PanelsTopLeft size={20} /> },
    { href: '/admin/gallery', label: 'Galeri', icon: <Images size={20} /> },
    { href: '/admin/routes', label: 'Rute Gowes', icon: <Navigation2 size={20} /> },
    { href: '/admin/spin-prizes', label: 'Spin Prizes', icon: <RotateCcw size={20} /> },
  ];

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="relative h-9 w-9"><Image src="/images/logo.png" alt="Kulino Ngepit Logo" fill className="object-contain" /></div>
            <div><strong className="font-display block text-sm font-black leading-none text-gray-900">Kulino Pit CMS</strong><span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Admin Portal</span></div>
          </Link>
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-700" aria-label="Buka menu admin"><Menu size={21} /></button>
        </header>

        {isSidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-gray-900/45 backdrop-blur-sm md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Tutup menu admin" />}

        <div className="flex min-h-[calc(100vh-4rem)] md:min-h-screen">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-[min(19rem,86vw)] flex-shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white shadow-2xl transition-transform duration-300 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between p-6">
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-105">
                <Image 
                  src="/images/logo.png" 
                  alt="Kulino Ngepit Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div>
                <strong className="block font-display text-base font-black leading-none text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">Kulino Pit CMS</strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Admin Portal</span>
              </div>
            </Link>
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 md:hidden" aria-label="Tutup menu admin"><X size={18} /></button>
          </div>
          
          <nav className="p-4 space-y-2">
            {menu.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all
                    ${isActive 
                      ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-gray-900">Admin System</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Superadmin</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 justify-center w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
            <Link href="/" onClick={() => setIsSidebarOpen(false)} className="mt-2 flex items-center gap-2 justify-center w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Main Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 md:p-8">
          {children}
        </main>
        </div>
      </div>
    </I18nProvider>
  );
}
