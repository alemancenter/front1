'use client';

import { useEffect } from 'react';
import { getStoredConsent, type ConsentState } from '@/lib/cookie-consent';
import { loadScriptOnce, runAfterIdle } from '@/lib/performance/loadThirdParties';

type Props = {
  gaId?: string | null;
};

const hasAnalyticsConsent = (state: ConsentState | null) =>
  Boolean(state?.categories?.includes('analytics'));

const configureAnalytics = (gaId: string) => {
  const win = window as Window & {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  };

  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || ((...args: unknown[]) => { win.dataLayer?.push(args); });
  win.gtag('js', new Date());
  win.gtag('config', gaId);
};

export default function GoogleAnalytics({ gaId }: Props) {
  useEffect(() => {
    const id = (gaId || '').trim();
    if (!id) return;

    const loadAnalytics = () => {
      loadScriptOnce('google-analytics', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
      configureAnalytics(id);
    };

    const stored = getStoredConsent();
    if (stored) {
      if (hasAnalyticsConsent(stored)) {
        runAfterIdle(loadAnalytics, 1200);
      }
      return;
    }

    const onConsentUpdate = () => {
      if (hasAnalyticsConsent(getStoredConsent())) {
        loadAnalytics();
      }
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('ckyConsentUpdate', onConsentUpdate);
    };

    window.addEventListener('ckyConsentUpdate', onConsentUpdate);

    return cleanup;
  }, [gaId]);

  return null;
}
