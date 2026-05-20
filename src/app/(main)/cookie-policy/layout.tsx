import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `سياسة ملفات تعريف الارتباط | ${siteName}`;
  const description = `تعرف على كيفية استخدام ${siteName} لملفات تعريف الارتباط (الكوكيز) وكيف يمكنك التحكم بها.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/cookie-policy',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/cookie-policy` } : {}),
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
