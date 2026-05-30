import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `حقوق الملكية وطلبات الإزالة | ${siteName}`;
  const description = `سياسة حقوق الملكية الفكرية وآلية طلب تعديل أو إزالة أي محتوى أو ملف تعليمي من ${siteName}.`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: '/copyright',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/copyright` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function CopyrightLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
