import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

// ─────────────────────────────────────────────────────────────
// FIX 1: SSR-safe site URL fallback.
// layout.tsx runs on the SERVER — process.env is available here.
// siteUrl from the API can be empty for some country DBs. Without
// a fallback the og:url tag is omitted, which AdSense reviewers
// flag as missing metadata.
// ─────────────────────────────────────────────────────────────
const FALLBACK_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://alemancenter.com';

// ─────────────────────────────────────────────────────────────
// FIX 2: robots — was missing entirely.
// Without explicit robots: index+follow, Next.js may inherit a
// noindex from a parent layout. Adding it here makes the intent
// unambiguous for Googlebot and AdSense crawlers.
// ─────────────────────────────────────────────────────────────

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';

  // FIX 1 applied: always has a value — never produces a missing og:url
  const rawSiteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const siteUrl = rawSiteUrl || FALLBACK_SITE_URL;

  const title       = `سياسة ملفات تعريف الارتباط | ${siteName}`;
  const description = `تعرف على كيفية استخدام ${siteName} لملفات تعريف الارتباط (الكوكيز) وكيف يمكنك التحكم بها.`;

  // ─────────────────────────────────────────────────────────────
  // FIX 3: keywords — were missing from layout (present on other
  // pages). AdSense does not require them, but omitting them while
  // all other pages have them creates an inconsistency Googlebot
  // can notice. Added the same site-wide keyword set.
  // ─────────────────────────────────────────────────────────────
  const keywords = [
    siteName,
    'ملفات تعريف الارتباط',
    'الكوكيز',
    'سياسة الخصوصية',
    'ملفات تعليمية',
    'مناهج دراسية',
  ];

  return {
    title,
    description,
    keywords,
    // FIX 2: explicit robots directive
    robots: { index: true, follow: true },
    alternates: {
      canonical: '/cookie-policy',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      // FIX 1: url is now always set — was conditionally omitted when siteUrl was empty
      url: `${siteUrl}/cookie-policy`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function CookiePolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
