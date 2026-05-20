import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `خدماتنا التعليمية | ${siteName}`;
  const description = `خدمات تعليمية متكاملة للطلاب والمعلمين: خطط دراسية، أوراق عمل، اختبارات، ملخصات، وملفات تعليمية حسب المنهاج والصف.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/services',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/services` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
