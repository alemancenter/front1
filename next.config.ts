import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));

// ==============================================
// Dynamic Domain Configuration from Environment
// ==============================================

const getHostFromUrl = (url: string | undefined): string | null => {
  if (!url) return null;

  // NEXT_PUBLIC_API_URL may be relative, e.g. /backend-api
  if (url.startsWith('/')) return null;

  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

const getPortFromUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;

  // Relative URLs do not have ports
  if (url.startsWith('/')) return undefined;

  try {
    const port = new URL(url).port;
    return port || undefined;
  } catch {
    return undefined;
  }
};

const apiHost = getHostFromUrl(process.env.NEXT_PUBLIC_API_URL);
const appHost =
  getHostFromUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  getHostFromUrl(process.env.NEXT_PUBLIC_SITE_URL);

const apiPort = getPortFromUrl(process.env.NEXT_PUBLIC_API_URL);

const buildRemotePatterns = () => {
  const patterns: Array<{
    protocol: 'http' | 'https';
    hostname: string;
    port?: string;
    pathname?: string;
  }> = [
    { protocol: 'https', hostname: 'api.dicebear.com' },
    { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    { protocol: 'https', hostname: '*.googleusercontent.com', pathname: '/**' },

    // Local development
    { protocol: 'http', hostname: 'localhost', port: apiPort, pathname: '/**' },
    { protocol: 'http', hostname: '127.0.0.1', port: apiPort, pathname: '/**' },

    // Production direct API images if needed
    { protocol: 'https', hostname: 'api.alemancenter.com', pathname: '/**' },
    { protocol: 'https', hostname: 'alemancenter.com', pathname: '/**' },
  ];

  if (apiHost && apiHost !== 'alemancenter.com') {
    patterns.push({ protocol: 'https', hostname: apiHost, pathname: '/**' });
  }

  if (appHost && appHost !== apiHost) {
    patterns.push({ protocol: 'https', hostname: appHost, pathname: '/**' });
  }

  return patterns;
};

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  /*
   * Important:
   * Strict-Transport-Security is intentionally NOT set here.
   * Plesk/Nginx already sends it:
   * strict-transport-security: max-age=31536000; includeSubDomains; preload
   *
   * Setting it in Next.js too causes duplicate HSTS warnings.
   */
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",

      /*
       * unsafe-inline is still needed by many Next.js/CMP/Ads setups.
       * unsafe-eval is usually needed in development and sometimes by Turbopack/dev.
       * In production you can later remove unsafe-eval after testing.
       */
      [
        "script-src 'self' 'unsafe-inline'",
        process.env.NODE_ENV === 'development' ? "'unsafe-eval'" : '',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://pagead2.googlesyndication.com',
        'https://googleads.g.doubleclick.net',
        'https://cdn-cookieyes.com',
        'https://www.gstatic.com',
        'https://accounts.google.com',
        'https://*.adtrafficquality.google',
        'https://fundingchoicesmessages.google.com',
        'https://www.google.com',
        'https://www.recaptcha.net',
      ].join(' '),

      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",

      [
        "connect-src 'self'",
        /*
         * Browser now uses same-origin /backend-api.
         * api.alemancenter.com remains allowed for Google OAuth/fallback/old clients.
         */
        'https://api.alemancenter.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://analytics.google.com',
        'https://stats.g.doubleclick.net',
        'https://pagead2.googlesyndication.com',
        'https://region1.google-analytics.com',
        'https://region1.analytics.google.com',
        'https://cdn-cookieyes.com',
        'https://log.cookieyes.com',
        'https://accounts.google.com',
        'https://*.adtrafficquality.google',
        'https://fundingchoicesmessages.google.com',
        'https://www.google.com',
        'https://www.recaptcha.net',
        'https://csi.gstatic.com',
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:* http://127.0.0.1:*'
          : '',
      ]
        .filter(Boolean)
        .join(' '),

      [
        'frame-src',
        'https://googleads.g.doubleclick.net',
        'https://tpc.googlesyndication.com',
        'https://accounts.google.com',
        'https://*.adtrafficquality.google',
        'https://fundingchoicesmessages.google.com',
        'https://www.google.com',
        'https://www.recaptcha.net',
      ].join(' '),

      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com",
      'upgrade-insecure-requests',
    ].join('; '),
  },
];

const publicPageCacheHeaders = [
  /*
   * Suitable for public visitor pages.
   * Browser can revalidate, while shared/server caches can keep short-lived copies.
   */
  {
    key: 'Cache-Control',
    value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
  },
];

const noStoreHeaders = [
  {
    key: 'Cache-Control',
    value: 'private, no-cache, no-store, max-age=0, must-revalidate',
  },
  {
    key: 'Pragma',
    value: 'no-cache',
  },
  {
    key: 'Expires',
    value: '0',
  },
];

const longStaticCacheHeaders = [
  {
    key: 'Cache-Control',
    value: 'public, max-age=31536000, immutable',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [72, 75],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: buildRemotePatterns(),
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@headlessui/react',
      'recharts',
    ],
    scrollRestoration: true,
    optimizeCss: false,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  transpilePackages: [],

  turbopack: {
    root: currentDir,
  },

  async redirects() {
    return [
      {
        source: '/about',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/about-us',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      // =========================================================
      // No cache for sensitive / dynamic internal areas
      // =========================================================
      {
        source: '/api/:path*',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/backend-api/:path*',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/dashboard/:path*',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/login',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/register',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/forgot-password',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/reset-password/:path*',
        headers: [...securityHeaders, ...noStoreHeaders],
      },
      {
        source: '/verify-email/:path*',
        headers: [...securityHeaders, ...noStoreHeaders],
      },

      // Download landing page should not be aggressively cached
      // because it may update views/download counters.
      {
        source: '/download/:path*',
        headers: [
          ...securityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },

      // =========================================================
      // Public visitor pages cache
      // =========================================================
      {
        source: '/',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/:countryCode(jo|sa|eg|ps)',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/:countryCode(jo|sa|eg|ps)/lesson/:path*',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/:countryCode(jo|sa|eg|ps)/posts/:path*',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/:countryCode(jo|sa|eg|ps)/categories/:path*',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/:countryCode(jo|sa|eg|ps)/search/:path*',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },

      // General informational pages
      {
        source: '/about-us',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/contact',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/contact-us',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/faq',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/services',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/classes',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/privacy-policy',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/terms',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/terms-of-service',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/cookie-policy',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/disclaimer',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/members',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },
      {
        source: '/search',
        headers: [...securityHeaders, ...publicPageCacheHeaders],
      },

      // =========================================================
      // Static assets
      // =========================================================
      {
        source: '/assets/:path*',
        headers: longStaticCacheHeaders,
      },
      {
        source: '/storage/:path*',
        headers: longStaticCacheHeaders,
      },
      {
        source: '/api/storage/:path*',
        headers: longStaticCacheHeaders,
      },

      // =========================================================
      // Fallback security headers only
      // Do NOT add Cache-Control here to avoid forcing no-store
      // on every page.
      // =========================================================
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    const rawBase =
      process.env.API_INTERNAL_URL ||
      process.env.INTERNAL_API_URL ||
      process.env.SERVER_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8081/api';

    const apiUrl = rawBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');

    return [
      {
        source: '/storage/:path*',
        destination: `${apiUrl}/storage/:path*`,
      },
      {
        source: '/assets/:path*',
        destination: `${apiUrl}/assets/:path*`,
      },
    ];
  },
};

export default nextConfig;
