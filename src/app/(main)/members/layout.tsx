import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `فريقنا | ${siteName}`;
  const description = `تعرف على أعضاء الفريق والمشرفين في ${siteName}. ابحث عن الأعضاء وتواصل مع الإدارة.`;

  return {
    title,
    description,
    // NOTE: members page loads content client-side via API (team list).
    // Googlebot may see an empty page on first render. noindex prevents
    // an empty page from lowering the site quality score for AdSense.
    // Remove noindex once SSR/SSG is implemented for this page.
    robots: { index: false, follow: false },
    alternates: {
      canonical: '/members',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/members` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
