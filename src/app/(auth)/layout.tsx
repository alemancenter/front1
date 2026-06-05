import type { Metadata } from 'next';
import AuthLayoutClient from './AuthLayoutClient';
import { getFrontSettings } from '@/lib/front-settings';

// /login, /register, /forgot-password, /reset-password, /verify-email are
// user-state pages. They generate thousands of `/login?return=...` permutations
// from internal links — Search Console flagged them as "Blocked by robots.txt".
// Keep robots.txt blocking them AND emit a noindex meta tag in case Google ever
// fetches them via an external link.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || (settings as any).siteName || '').toString();
  return <AuthLayoutClient siteName={siteName}>{children}</AuthLayoutClient>;
}
