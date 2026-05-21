import { CheckCircle2, Clock3, Loader2, Square, XCircle } from 'lucide-react';
import type { ContentQualityBatchItem } from '@/lib/api/services/content-audit';

const countryCodeToDashboardId: Record<string, string> = { jo: '1', sa: '2', eg: '3', ps: '4' };

function normalizeContentEditIdentity(contentId: number | string, countryCode?: string | null) {
  const raw = String(contentId || '').trim();
  const match = raw.match(/^([a-z]{2}|[1-4]):(\d+)$/i);
  if (match) {
    const country = match[1].toLowerCase();
    return {
      id: match[2],
      country: countryCodeToDashboardId[country] || country,
    };
  }
  const country = String(countryCode || '').trim().toLowerCase();
  return {
    id: raw,
    country: countryCodeToDashboardId[country] || country || '',
  };
}

function withCountryQuery(path: string, country?: string) {
  return country ? `${path}?country=${encodeURIComponent(country)}` : path;
}

export function contentQualityStatusMeta(status: string) {
  switch (status) {
    case 'queued':
      return { label: 'بالانتظار', variant: 'info' as const, icon: Clock3 };
    case 'running':
      return { label: 'قيد المعالجة', variant: 'warning' as const, icon: Loader2 };
    case 'cancelling':
      return { label: 'جارٍ الإلغاء', variant: 'warning' as const, icon: Square };
    case 'completed':
      return { label: 'مكتمل', variant: 'success' as const, icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'ملغى', variant: 'warning' as const, icon: Square };
    case 'failed':
      return { label: 'فشل', variant: 'error' as const, icon: XCircle };
    default:
      return { label: status || '-', variant: 'info' as const, icon: Clock3 };
  }
}

export function htmlToPlainText(value?: string | null) {
  if (!value) return '';
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function editPathForContentQualityItem(item: ContentQualityBatchItem) {
  const identity = normalizeContentEditIdentity(item.content_id, item.country_code);
  return item.content_type === 'article'
    ? withCountryQuery(`/dashboard/lesson/articles/edit/${identity.id}`, identity.country)
    : withCountryQuery(`/dashboard/posts/edit/${identity.id}`, identity.country);
}

export function formatContentQualityDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getEditPathForContent(contentType: string, contentId: number | string, countryCode?: string | null) {
  const identity = normalizeContentEditIdentity(contentId, countryCode);
  return contentType === 'article'
    ? withCountryQuery(`/dashboard/lesson/articles/edit/${identity.id}`, identity.country)
    : withCountryQuery(`/dashboard/posts/edit/${identity.id}`, identity.country);
}
