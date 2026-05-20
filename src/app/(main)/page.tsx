import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { COUNTRIES } from '@/lib/api/config';
import HomeContent from '@/components/home/HomeContent';
import { getStorageUrl, safeJsonLd } from '@/lib/utils';
import { getHomeData } from '@/lib/home-data';
import { getFrontSettings } from '@/lib/front-settings';

// Force dynamic rendering since we rely on cookies
export const dynamic = 'force-dynamic';

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

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const countryId = cookieStore.get('country_id')?.value || '1';
  const country = COUNTRIES.find(c => c.id === countryId) || COUNTRIES[0];
  const settings = await getFrontSettings(countryId, { cache: 'no-store' });
  const siteName = settingValue(settings, 'site_name', 'siteName');
  const resolvedSiteName = siteName || 'منصة التعليم';

  const normalizeBaseUrl = (value: string | null | undefined): URL | undefined => {
    const trimmed = (value || '').toString().trim();
    if (!trimmed) return undefined;
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      return new URL(withProtocol);
    } catch {
      return undefined;
    }
  };

  const parseKeywords = (value: string | null | undefined): string[] | undefined => {
    const raw = (value || '').toString().trim();
    if (!raw) return undefined;
    const items = raw
      .split(/[,،\n\r]+/g)
      .map((k) => k.trim())
      .filter(Boolean);
    return items.length ? items : undefined;
  };

  const metaTitle = settingValue(settings, 'meta_title', 'metaTitle');
  const metaDescription = settingValue(
    settings,
    'meta_description',
    'metaDescription',
    'site_description',
    'siteDescription'
  );
  const metaKeywords = parseKeywords(settings.meta_keywords);
  const canonicalUrl = settingValue(settings, 'canonical_url', 'canonicalUrl', 'site_url', 'siteUrl');
  const metadataBase = normalizeBaseUrl(canonicalUrl);
  const ogImage = getStorageUrl(settings.site_logo);

  const title =
    metaTitle ||
    `${resolvedSiteName} | ملفات تعليمية، مناهج، اختبارات وملخصات دراسية`;
  const description =
    metaDescription ||
    `تصفح جميع الصفوف والمواد الدراسية للمنهاج ${country.name} على منصة ${resolvedSiteName} التعليمية.`;

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title,
    description,
    keywords: metaKeywords || [`منهاج ${country.name}`, 'تعليم', 'دروس', 'امتحانات', resolvedSiteName],
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: resolvedSiteName,
      locale: 'ar_JO',
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    }
  };
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const countryId = cookieStore.get('country_id')?.value || '1';
  const token = cookieStore.get('token')?.value;
  const country = COUNTRIES.find(c => c.id === countryId) || COUNTRIES[0];
  
  const { classes, categories, articles, posts, featured_posts, settings } = await getHomeData(countryId);

  const initialSiteName = settingValue(settings, 'site_name', 'siteName');

  const resolvedSiteName = initialSiteName || 'منصة التعليم';

  const rawCanonical = settingValue(settings, 'canonical_url', 'canonicalUrl', 'site_url', 'siteUrl');
  const canonicalUrl = rawCanonical || undefined;
  const logoUrl = getStorageUrl((settings as any).site_logo);

  const jsonLdDescription = (settingValue(settings, 'meta_description', 'metaDescription', 'site_description', 'siteDescription') || '')
    .toString()
    .trim() || `${resolvedSiteName} يوفر ملفات تعليمية، مناهج دراسية، اختبارات، ملخصات، أوراق عمل ودروس منظمة حسب الصف والمادة والفصل الدراسي في ${country.name}.`;

  const schemaGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        ...(canonicalUrl ? { '@id': `${canonicalUrl.replace(/\/$/, '')}#organization`, url: canonicalUrl } : {}),
        name: resolvedSiteName,
        description: jsonLdDescription,
        ...(logoUrl ? { logo: logoUrl } : {}),
        address: {
          '@type': 'PostalAddress',
          addressCountry: country.name,
        },
        areaServed: {
          '@type': 'Country',
          name: country.name,
        },
      },
      {
        '@type': 'WebSite',
        ...(canonicalUrl ? { '@id': `${canonicalUrl.replace(/\/$/, '')}#website`, url: canonicalUrl } : {}),
        name: resolvedSiteName,
        description: jsonLdDescription,
        inLanguage: 'ar',
        ...(canonicalUrl ? { publisher: { '@id': `${canonicalUrl.replace(/\/$/, '')}#organization` } } : {}),
      }
    ]
  };

  // Extract ad settings for home page
  const adSettings = {
    // First ad position (below classes)
    googleAdsDesktop: settings.google_ads_desktop_home || '',
    googleAdsMobile: settings.google_ads_mobile_home || '',
    // Second ad position (between sections)
    googleAdsDesktop2: settings.google_ads_desktop_home_2 || '',
    googleAdsMobile2: settings.google_ads_mobile_home_2 || '',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schemaGraph) }}
      />
      <HomeContent
        country={country}
        classes={classes}
        categories={categories}
        articles={articles}
        posts={posts}
        featuredPosts={featured_posts}
        initialSiteName={initialSiteName}
        isLoggedIn={!!token}
        adSettings={adSettings}
      />
    </>
  );
}
