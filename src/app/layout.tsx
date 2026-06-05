import type { Metadata } from 'next';
import './globals.css';
import ToastProvider from '@/components/ui/ToastProvider';
import ThemeInitializer from '@/components/ThemeInitializer';
// import ResourcePreloader from '@/components/common/ResourcePreloader';
import { getStorageUrl } from '@/lib/utils';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import DeferredMarketingTags from '@/components/performance/DeferredMarketingTags';
import { getFrontSettings } from '@/lib/front-settings';
import { FrontSettingsProvider } from '@/components/front-settings/FrontSettingsProvider';
import StoreHydration from '@/components/StoreHydration';
import CookieConsentBanner from '@/components/CookieConsentBanner';

// Cairo is self-hosted through @font-face in globals.css.
// No next/font/google dependency is used, so builds remain deterministic on locked-down servers.

async function getPublicSettings(): Promise<Record<string, string | null>> {
  return getFrontSettings();
}

const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d+$/;

const resolveAdsenseClient = (settings: Record<string, string | null>): string => {
  // PRIORITY ORDER (AdSense policy: only ONE ca-pub-* per domain):
  // 1. NEXT_PUBLIC_ADSENSE_CLIENT env var  — set in frontend.env.production, overrides DB
  // 2. settings.adsense_client             — value from backend API / database
  // Using the env var as the primary source guarantees the same ID on every page,
  // even if the database returns a stale or incorrect value on specific routes.
  const envValue = (process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '').toString().trim();
  const dbValue  = (settings.adsense_client || '').toString().trim();
  const value    = ADSENSE_CLIENT_PATTERN.test(envValue) ? envValue : dbValue;
  return ADSENSE_CLIENT_PATTERN.test(value) ? value : '';
};

const toPublicStorageUrl = (value?: string | null): string | undefined => {
  const raw = (value || '').toString().trim();
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      // Normalize backend storage absolute URLs to relative /storage/... paths
      // so the Next.js rewrite proxies them via the internal URL (survives domain renames).
      if (url.pathname.startsWith('/storage/')) return url.pathname;
    } catch {
      // fall through
    }
    return raw;
  }
  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return normalized.startsWith('/storage/') ? normalized : `/storage${normalized}`;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = (settings.site_name || (settings as any).siteName || '').toString().trim();

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

  const metaTitle = (settings.meta_title || '').toString().trim();
  const metaDescription = (settings.meta_description || settings.site_description || '').toString().trim();
  const metaKeywords = parseKeywords(settings.meta_keywords);
  const canonicalUrl = (settings.canonical_url || settings.site_url || '').toString().trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const metadataBase = normalizeBaseUrl(canonicalUrl) || new URL(appUrl);
  const ogImage = getStorageUrl(settings.site_logo || settings.site_favicon);
  const faviconUrl = toPublicStorageUrl(settings.site_favicon);
  const faviconFallback = '/favicon.ico';
  const iconList = [
    { url: faviconFallback },
    ...(faviconUrl && faviconUrl !== faviconFallback ? [{ url: faviconUrl }] : []),
  ];

  return {
    metadataBase,
    title: metaTitle || siteName || 'منصة التعليم - أخبار ومناهج ونتائج الامتحانات',
    description:
      metaDescription ||
      'المنصة التعليمية الرائدة للأخبار التربوية، المناهج الدراسية، نتائج الامتحانات، والملفات التعليمية للمعلمين والطلاب في الأردن والدول العربية.',
    keywords:
      metaKeywords || ['تعليم', 'أخبار التعليم', 'نتائج الامتحانات', 'مناهج', 'دروس', 'ملفات تعليمية', 'الأردن', 'طلاب', 'معلمين', 'وزارة التربية والتعليم'],
    icons: {
      icon: iconList,
      shortcut: faviconFallback,
      apple: faviconUrl || faviconFallback,
    },
    openGraph: {
      title: metaTitle || siteName || 'منصة التعليم - أخبار ومناهج ونتائج الامتحانات',
      description:
        metaDescription ||
        'المنصة التعليمية الرائدة للأخبار التربوية، المناهج الدراسية، نتائج الامتحانات، والملفات التعليمية للمعلمين والطلاب في الأردن والدول العربية.',
      type: 'website',
      locale: 'ar_JO',
      siteName: siteName || undefined,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const gaId =
    (settings.google_analytics_id || settings.google_analytics || '').toString().trim() ||
    (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || '').toString().trim() ||
    (process.env.NEXT_PUBLIC_GA_ID || '').toString().trim();
  const normalizedAdsenseClient = resolveAdsenseClient(settings);
  const marketingFlag = process.env.NEXT_PUBLIC_ENABLE_MARKETING_TAGS;
  const marketingEnabled =
    marketingFlag === 'true' ||
    (marketingFlag !== 'false' && process.env.NODE_ENV === 'production');
  const shouldLoadStandaloneGa = Boolean(gaId);
  const apiOrigin = (() => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL;
      return url ? new URL(url).origin : null;
    } catch { return null; }
  })();

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>

        {/* Preload the three weights used above the fold across the public
            site. Bold = article H1 (font-black), SemiBold = navbar/badges,
            Regular = post body text. Lighthouse flagged all three on the
            critical path on different routes (articles + posts). */}
        <link
          rel="preload"
          href="/fonts/cairo/Cairo-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/cairo/Cairo-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/cairo/Cairo-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        {/* Preconnect to the API — starts TCP+TLS handshake before first client fetch */}
        {apiOrigin && <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />}
        {apiOrigin && <link rel="dns-prefetch" href={apiOrigin} />}
        {/*
          Google Consent Mode v2 — inline <script> guarantees this is the
          very first script in the SSR HTML, before any Google tag can load.
          All signals default to "denied". Our banner fires gtag('consent','update',{...})
          after the user makes a choice. wait_for_update:3000 gives slow connections
          enough time for hydration + banner render before tags act on defaults.
        */}
        {marketingEnabled && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'ad_storage':'denied','analytics_storage':'denied','ad_user_data':'denied','ad_personalization':'denied','wait_for_update':3000});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);`,
            }}
          />
        )}
        {/* AdSense ownership verification */}
        {normalizedAdsenseClient && (
          <meta name="google-adsense-account" content={normalizedAdsenseClient} />
        )}
        {marketingEnabled && normalizedAdsenseClient && (
          // DNS-prefetch only. The actual <script> is loaded via
          // DeferredMarketingTags after consent + 1.2s idle, so a full
          // `preconnect` here is wasted before LCP (Lighthouse flagged the
          // socket as "unused" in the critical path).
          <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        )}
      </head>
      <body className="antialiased min-h-screen">
        <FrontSettingsProvider settings={settings}>
          <StoreHydration />
          <DeferredMarketingTags
            enabled={marketingEnabled}
            adsenseClient={normalizedAdsenseClient}
          />
          <GoogleAnalytics gaId={marketingEnabled && shouldLoadStandaloneGa ? gaId : ''} />
          <ThemeInitializer />
          <ToastProvider />
          <CookieConsentBanner />
         {/* <ResourcePreloader /> */}
          {children}
        </FrontSettingsProvider>
      </body>
    </html>
  );
}
