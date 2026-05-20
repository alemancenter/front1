import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `الصفوف الدراسية | ${siteName}`;
  const description = `اختر صفك الدراسي وتصفح جميع المواد والمحتوى التعليمي المتاح على ${siteName} لكل المراحل الدراسية.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/classes',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/classes` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function ClassesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
