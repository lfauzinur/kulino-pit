'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { I18nProvider } from '@/lib/i18n';
import { LayoutDashboard, CalendarDays, Bike, Users, FileText, LogOut, ShieldAlert, RotateCcw, Map, Shield } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Basic auth check
    const auth = localStorage.getItem('isAdmin');
    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin/login');
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
    { href: '/admin/spin-prizes', label: 'Spin Prizes', icon: <RotateCcw size={20} /> },
  ];

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-100 flex-shrink-0 z-10 sticky top-0 md:h-screen overflow-y-auto">
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white font-display font-black text-xl shadow-md">
                K
              </span>
              <div>
                <strong className="block font-display text-base font-black leading-none text-gray-900">Kulino Pit CMS</strong>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">Admin Portal</span>
              </div>
            </Link>
          </div>
          
          <nav className="p-4 space-y-2">
            {menu.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
              onClick={handleLogout}
              className="flex items-center gap-2 justify-center w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <LogOut size={16} /> Logout
            </button>
            <Link href="/" className="mt-2 flex items-center gap-2 justify-center w-full py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
              ← Back to Main Site
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </I18nProvider>
  );
}
