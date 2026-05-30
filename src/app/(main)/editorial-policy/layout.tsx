import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `سياسة التحرير والمراجعة | ${siteName}`;
  const description = `تعرف على طريقة اختيار ومراجعة وتحديث المحتوى التعليمي المنشور على ${siteName}.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: '/editorial-policy',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/editorial-policy` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function EditorialPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
