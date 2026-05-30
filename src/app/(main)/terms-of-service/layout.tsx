import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d+$/;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `شروط الاستخدام | ${siteName}`;
  const description = `اقرأ شروط وأحكام استخدام ${siteName} قبل البدء في استخدام الموقع والخدمات المقدمة.`;

  // توحيد معرّف AdSense مع root layout لمنع ظهور قيمة مختلفة في هذه الصفحة
  const rawAdsense = (settings.adsense_client || process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '')
    .toString()
    .trim();
  const adsenseClient = ADSENSE_CLIENT_PATTERN.test(rawAdsense) ? rawAdsense : '';

  return {
    title,
    description,
    alternates: {
      canonical: '/terms-of-service',
    },
    ...(adsenseClient
      ? { other: { 'google-adsense-account': adsenseClient } }
      : {}),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/terms-of-service` } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
