import 'server-only';

import { cache } from 'react';
import { ssrFetch, getSSRHeaders } from '@/lib/api/ssr-fetch';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api/config';

export type FrontSettings = Record<string, string | null>;
type FrontSettingsFetchOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
};

const parseSettings = (json: any): FrontSettings => {
  const body = json?.data ?? json;
  const settings = body?.settings ?? body?.data ?? body;
  if (settings && typeof settings === 'object') return settings as FrontSettings;
  return {};
};

/**
 * Public settings (logo, site config, ads flags...).
 * Uses the internal API URL for SSR. Callers can opt into no-store when
 * dashboard changes need to be reflected immediately.
 */
export const getFrontSettings = cache(async (
  countryId = '1',
  options: FrontSettingsFetchOptions = {}
): Promise<FrontSettings> => {
  const baseUrl = API_CONFIG.INTERNAL_URL.replace(/\/+$/, '');
  const cacheControl = options.cache === 'no-store' ? 'no-cache' : undefined;

  try {
    const fetchOptions: RequestInit & { next?: { revalidate?: number | false } } = {
      ...(options.cache ? { cache: options.cache } : {}),
      ...(options.cache === 'no-store' ? {} : { next: { revalidate: options.revalidate ?? 3600 } }),
      headers: {
        ...getSSRHeaders(countryId),
        ...(cacheControl ? { 'Cache-Control': cacheControl } : {}),
      },
    };

    const res = await ssrFetch(`${baseUrl}${API_ENDPOINTS.FRONT.SETTINGS}`, fetchOptions);

    if (!res.ok) return {};

    const json = await res.json().catch(() => null);
    return parseSettings(json);
  } catch {
    return {};
  }
});
