import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

// ─────────────────────────────────────────────────────────────
// FIX 1: SSR-safe site URL fallback.
// siteUrl from the API can be empty for some country DBs.
// Without a fallback og:url is conditionally omitted, which
// AdSense reviewers flag as incomplete metadata.
// ─────────────────────────────────────────────────────────────
const FALLBACK_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://alemancenter.com';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';

  // FIX 1 applied: always resolves to a non-empty URL
  const rawSiteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const siteUrl    = rawSiteUrl || FALLBACK_SITE_URL;

  const title       = `تواصل معنا | ${siteName}`;
  const description = `تواصل مع فريق ${siteName} لأي استفسار أو دعم. نحن هنا لمساعدتك في أي وقت.`;

  // ─────────────────────────────────────────────────────────────
  // FIX 2: robots directive — was missing entirely.
  // Explicit index+follow prevents any parent-layout noindex from
  // being inherited and ensures Googlebot can crawl the contact page.
  // AdSense requires that the contact page be publicly accessible.
  // ─────────────────────────────────────────────────────────────

  // ─────────────────────────────────────────────────────────────
  // FIX 3: keywords — were missing. Added the same site-wide set
  // used on every other page for consistency.
  // ─────────────────────────────────────────────────────────────
  const keywords = [
    siteName,
    'تواصل معنا',
    'اتصل بنا',
    'دعم',
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
      canonical: '/contact-us',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      // FIX 1: url is now always set — was conditionally omitted when siteUrl was ''
      url: `${siteUrl}/contact-us`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
