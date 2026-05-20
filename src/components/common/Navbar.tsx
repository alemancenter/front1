'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from '@/components/common/AppImage';
import { AnimatePresence, motion } from '@/lib/motion-lite';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Phone,
  Settings,
  Sun,
  User,
  X,
} from 'lucide-react';
import { useThemeStore, useAuthStore, useSettingsStore } from '@/store/useStore';
import { cn, getStorageUrl } from '@/lib/utils';
import CountrySelector from './CountrySelector';
import NotificationsDropdown from '@/components/layout/NotificationsDropdown';
import { authService } from '@/lib/api/services/auth';
import { useUserRefresh } from '@/hooks/useUserRefresh';

type InitialSettings = Record<string, string | null> & {
  siteName?: string | null;
  siteLogo?: string | null;
};

const topLinks = [
  { title: 'من نحن', href: '/about-us' },
  { title: 'الخدمات', href: '/services' },
  { title: 'سياسة الخصوصية', href: '/privacy-policy' },
  { title: 'شروط الاستخدام', href: '/terms-of-service' },
  { title: 'الأسئلة الشائعة', href: '/faq' },
];

export default function Navbar({ initialSettings }: { initialSettings?: InitialSettings }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { siteName, siteLogo } = useSettingsStore();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [avatarError, setAvatarError] = useState(false);
  const avatarSrc = getStorageUrl(user?.profile_photo_url || user?.profile_photo_path);

  useUserRefresh();

  const initialSiteName = (initialSettings?.site_name || initialSettings?.siteName || '').toString().trim();
  const displaySiteName = initialSiteName || (siteName || '').toString().trim() || 'موقع الألمان';
  const initialSiteLogo = initialSettings?.site_logo ?? initialSettings?.siteLogo ?? null;
  const displaySiteLogo = initialSiteLogo ?? siteLogo;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      setIsUserMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!isUserMenuOpen) return;
      const target = event.target as Node | null;
      if (target && userMenuRef.current && !userMenuRef.current.contains(target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isUserMenuOpen]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  useEffect(() => setAvatarError(false), [avatarSrc]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    finally {
      logout();
      router.push('/');
      router.refresh();
      setIsUserMenuOpen(false);
    }
  };

  return (
    <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="fixed inset-x-0 top-0 z-50">
      <div className="hidden bg-[#061a3a] text-white lg:block">
        <div className="mx-auto flex h-10 max-w-[1500px] items-center justify-between px-6 text-sm font-semibold">
          <div className="flex items-center gap-4">
            <Link href="/contact-us" className="inline-flex items-center gap-2 text-white/90 transition hover:text-white">
              <Phone className="h-4 w-4" />
              تواصل معنا
            </Link>
            <span className="h-5 w-px bg-white/25" />
            <CountrySelector />
            <button onClick={toggleDarkMode} className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="تبديل الوضع الليلي">
              {mounted && isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            {topLinks.map((item, index) => (
              <Link key={`${item.href}-${item.title}-${index}`} href={item.href} className="flex items-center gap-4 text-white/85 transition hover:text-white">
                <span>{item.title}</span>
                {index !== topLinks.length - 1 && <span className="h-4 w-px bg-white/25" />}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <nav className={cn('border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-all', isScrolled ? 'shadow-lg shadow-slate-200/60' : 'shadow-sm')} aria-label="التنقل الرئيسي">
  <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 sm:px-6">
    <Link href="/" className="flex items-center gap-3 group">
      {displaySiteLogo ? (
        <div className="relative flex h-14 w-14 items-center justify-center">
          <Image
            src={`/storage/${displaySiteLogo}`}
            alt={displaySiteName}
            width={56}
            height={56}
            sizes="56px"
            className="h-full w-auto object-contain drop-shadow-sm"
            style={{ width: 'auto', height: '100%' }}
          />
        </div>
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-xl font-black text-white shadow-lg">
          أ
        </div>
      )}

      <div className="hidden flex-col justify-center sm:flex">
        <div className="text-2xl font-black leading-none tracking-tight text-slate-950 transition group-hover:text-blue-700">
          {displaySiteName}
        </div>
        <span className="mt-1 text-sm font-semibold text-slate-400">
          بوابة المستقبل التعليمية
        </span>
      </div>
    </Link>

    <div className="hidden flex-1 lg:block" />
          <div className="flex items-center gap-2">
            {mounted && isAuthenticated && <NotificationsDropdown />}
            {mounted && isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  <div className={cn('flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-black text-white', avatarSrc && !avatarError ? 'bg-slate-100' : 'bg-blue-700')}>
                    {avatarSrc && !avatarError ? <Image src={avatarSrc} alt={user.name || 'User'} width={36} height={36} className="h-9 w-9 object-cover" onError={() => setAvatarError(true)} unoptimized={avatarSrc.includes('127.0.0.1') || avatarSrc.includes('localhost')} /> : <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>}
                  </div>
                  <span className="hidden md:inline">{user.name || 'مستخدم'}</span>
                  <ChevronDown className={cn('hidden h-4 w-4 transition md:block', isUserMenuOpen && 'rotate-180')} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><LayoutDashboard className="h-4 w-4" /> لوحة التحكم</Link>
                    <Link href="/dashboard/profile" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><User className="h-4 w-4" /> الملف الشخصي</Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><Settings className="h-4 w-4" /> الإعدادات</Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> تسجيل الخروج</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-black text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800">
                <User className="h-4 w-4" />
                دخول / تسجيل
              </Link>
            )}

            <button onClick={() => setIsOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50 lg:hidden" aria-label="فتح القائمة">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 260 }} className="fixed bottom-0 right-0 top-0 z-50 w-[86vw] max-w-sm overflow-y-auto bg-white p-5 shadow-2xl lg:hidden">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {displaySiteLogo ? <Image src={`/storage/${displaySiteLogo}`} alt={displaySiteName} width={46} height={46} className="h-12 w-auto object-contain" /> : <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">أ</div>}
                  <div>
                    <div className="text-xl font-black text-slate-950">{displaySiteName}</div>
                    <div className="text-xs font-semibold text-slate-400">بوابة المستقبل التعليمية</div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="rounded-xl bg-slate-100 p-2 text-slate-700"><X className="h-5 w-5" /></button>
              </div>

              <div className="mb-5 rounded-2xl bg-[#061a3a] p-4 text-white">
                <div className="mb-3 grid grid-cols-[minmax(0,1fr)_44px] items-start gap-2">
                  <CountrySelector variant="panel" dropdownMode="inline" />
                  <button onClick={toggleDarkMode} className="flex h-12 items-center justify-center rounded-xl bg-white/10 p-2">{mounted && isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
                </div>
                <Link href="/contact-us" className="flex items-center gap-2 text-sm font-bold"><Phone className="h-4 w-4" /> تواصل معنا</Link>
              </div>

              <div className="mt-6 grid gap-2 border-t border-slate-100 pt-4">
                {topLinks.map((item, index) => <Link key={`${item.href}-${item.title}-${index}`} href={item.href} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">{item.title}</Link>)}
              </div>

              {mounted && !isAuthenticated && (
                <Link href="/login" className="mt-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-black text-white">
                  <User className="h-4 w-4" /> دخول / تسجيل
                </Link>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
