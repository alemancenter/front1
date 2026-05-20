import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { COUNTRIES } from '@/lib/api/config';
import HomeContent from '@/components/home/HomeContent';
import { getHomeData } from '@/lib/home-data';
import { getFrontSettings } from '@/lib/front-settings';

// Use ISR with revalidation for better performance
export const revalidate = 60;

type SettingsMap = Record<string, string | null>;

const settingValue = (settings: SettingsMap, ...keys: string[]): string => {
  for (const key of keys) {
    const value = settings[key];
    if (value == null) continue;
    const trimmed = value.toString().trim();
    if (trimmed) return trimmed;
  }
  return '';
};

const parseKeywords = (value: string | null | undefined): string[] | undefined => {
  const raw = (value || '').toString().trim();
  if (!raw) return undefined;
  const items = raw
    .split(/[,،\n\r]+/g)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>;
}): Promise<Metadata> {
  const { countryCode } = await params;
  const country = COUNTRIES.find((c) => c.code === countryCode);

  if (!country) {
    return {
      title: 'Page Not Found',
    };
  }

  const settings = await getFrontSettings(country.id, { cache: 'no-store' });
  const siteName = settingValue(settings, 'site_name', 'siteName');
  const resolvedSiteName = siteName || 'منصة التعليم';
  const siteUrl = settingValue(settings, 'canonical_url', 'canonicalUrl', 'site_url', 'siteUrl');
  const metaTitle = settingValue(settings, 'meta_title', 'metaTitle');
  const metaDescription = settingValue(
    settings,
    'meta_description',
    'metaDescription',
    'site_description',
    'siteDescription'
  );
  const metaKeywords = parseKeywords(settings.meta_keywords);
  const title = metaTitle || `مناهج ${country.name} | ملفات تعليمية، اختبارات وملخصات دراسية - ${resolvedSiteName}`;
  const description =
    metaDescription ||
    `تصفح ملفات تعليمية ومناهج ${country.name}، اختبارات، ملخصات، أوراق عمل ودروس حسب الصف، المادة والفصل الدراسي عبر ${resolvedSiteName}.`;

  const localeMap: Record<string, string> = {
    jo: 'ar_JO',
    sa: 'ar_SA',
    eg: 'ar_EG',
    ps: 'ar_PS',
  };

  return {
    title,
    description,
    keywords: metaKeywords || [`منهاج ${country.name}`, 'تعليم', 'دروس', 'امتحانات', resolvedSiteName],
    alternates: {
      canonical: `/${countryCode}/`,
      languages: {
        'ar-JO': `${siteUrl}/jo/`,
        'ar-SA': `${siteUrl}/sa/`,
        'ar-EG': `${siteUrl}/eg/`,
        'ar-PS': `${siteUrl}/ps/`,
        'x-default': `${siteUrl}/jo/`,
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: localeMap[countryCode] || 'ar_JO',
      siteName: resolvedSiteName,
      ...(siteUrl ? { url: `${siteUrl}/${countryCode}/` } : {}),
    },
  };
}

export default async function CountryHomePage({
  params,
}: {
  params: Promise<{ countryCode: string }>;
}) {
  const { countryCode } = await params;
  const country = COUNTRIES.find((c) => c.code === countryCode);

  if (!country) {
    notFound();
  }

  const { classes, categories, articles, posts, featured_posts, settings } = await getHomeData(country.id);
  const initialSiteName = (settings.site_name || settings.siteName || '').toString().trim();
  const adSettings = {
    googleAdsDesktop: settings.google_ads_desktop_home || '',
    googleAdsMobile: settings.google_ads_mobile_home || '',
    googleAdsDesktop2: settings.google_ads_desktop_home_2 || '',
    googleAdsMobile2: settings.google_ads_mobile_home_2 || '',
  };

  return (
    <HomeContent
      country={country}
      classes={classes}
      categories={categories}
      articles={articles}
      posts={posts}
      featuredPosts={featured_posts}
      initialSiteName={initialSiteName}
      adSettings={adSettings}
    />
  );
}
