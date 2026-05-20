import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `من نحن | ${siteName}`;
  const description = `تعرف على رسالتنا ورؤيتنا وفريق ${siteName} المتخصص في تقديم أفضل المحتوى التعليمي للطلاب والمعلمين.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/about-us',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/about-us` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
