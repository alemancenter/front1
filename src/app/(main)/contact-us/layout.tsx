import type { Metadata } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getFrontSettings();
  const siteName = (settings.site_name || '').toString().trim() || 'منصة التعليم';
  const siteUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const title = `تواصل معنا | ${siteName}`;
  const description = `تواصل مع فريق ${siteName} لأي استفسار أو دعم. نحن هنا لمساعدتك في أي وقت.`;

  return {
    title,
    description,
    alternates: {
      canonical: '/contact-us',
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_JO',
      siteName,
      ...(siteUrl ? { url: `${siteUrl}/contact-us` } : {}),
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
