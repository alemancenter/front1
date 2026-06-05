import type { Metadata } from 'next';

type SettingsLike = Record<string, string | null | undefined>;

const ensureProtocol = (value: string): string =>
  /^https?:\/\//i.test(value) ? value : `https://${value}`;

export function resolveSiteOrigin(settings?: SettingsLike): string {
  const configuredUrl =
    settings?.canonical_url ||
    settings?.canonicalUrl ||
    settings?.site_url ||
    settings?.siteUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'https://alemancenter.com';

  try {
    const url = new URL(ensureProtocol(configuredUrl.toString().trim()));
    return url.origin;
  } catch {
    return 'https://alemancenter.com';
  }
}

export function buildCanonicalUrl(settings: SettingsLike | undefined, pathname: string): string {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${resolveSiteOrigin(settings)}${cleanPath}`;
}

export function canonicalMetadata(
  settings: SettingsLike | undefined,
  pathname: string
): Pick<Metadata, 'alternates'> & { openGraph: NonNullable<Metadata['openGraph']> } {
  const url = buildCanonicalUrl(settings, pathname);

  return {
    alternates: {
      canonical: url,
    },
    openGraph: {
      url,
    },
  };
}
