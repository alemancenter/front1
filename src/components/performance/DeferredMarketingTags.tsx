'use client';

import { useEffect } from 'react';
import { getStoredConsent, type ConsentState } from '@/lib/cookie-consent';
import { loadScriptOnce, runAfterIdle } from '@/lib/performance/loadThirdParties';

type DeferredMarketingTagsProps = {
  enabled: boolean;
  adsenseClient?: string;
};

const hasConsent = (category: 'advertisement', state: ConsentState | null) =>
  Boolean(state?.categories?.includes(category));

export default function DeferredMarketingTags({ enabled, adsenseClient }: DeferredMarketingTagsProps) {
  useEffect(() => {
    if (!enabled) return;

    const loadAdsense = () => {
      const client = (adsenseClient || '').trim();
      if (!client) return;

      loadScriptOnce(
        'adsense',
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`,
        { crossorigin: 'anonymous' }
      );
    };

    const loadAllowedTags = (state: ConsentState | null) => {
      if (hasConsent('advertisement', state)) {
        loadAdsense();
      }
    };

    const stored = getStoredConsent();
    if (stored) {
      runAfterIdle(() => loadAllowedTags(stored), 1200);
      return;
    }

    const onConsentUpdate = () => {
      loadAllowedTags(getStoredConsent());
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('ckyConsentUpdate', onConsentUpdate);
    };

    window.addEventListener('ckyConsentUpdate', onConsentUpdate);

    return cleanup;
  }, [adsenseClient, enabled]);

  return null;
}
