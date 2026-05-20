import type { MetadataRoute } from 'next';
import { getFrontSettings } from '@/lib/front-settings';

// Revalidate every hour so the sitemap stays fresh without rebuilding.
export const revalidate = 3600;

const COUNTRIES = ['jo', 'sa', 'eg', 'ps'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getFrontSettings();
  const rawBase = (settings.canonical_url || settings.site_url || '').toString().trim();
  const base = rawBase.replace(/\/$/, '') || 'https://alemancenter.com';

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/about-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/contact-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/classes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/cookie-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/disclaimer`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/copyright`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/editorial-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Country home pages
  const countryPages: MetadataRoute.Sitemap = COUNTRIES.map((code) => ({
    url: `${base}/${code}/`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Country lesson/posts index pages
  const countryIndexPages: MetadataRoute.Sitemap = COUNTRIES.flatMap((code) => [
    {
      url: `${base}/${code}/lesson/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${base}/${code}/posts/`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ]);

  return [...staticPages, ...countryPages, ...countryIndexPages];
}
