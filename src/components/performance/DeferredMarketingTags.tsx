'use client';

import { useEffect } from 'react';
import { hasAdvertisementConsent } from '@/lib/cookie-consent';
import { loadScriptOnce, runAfterIdle } from '@/lib/performance/loadThirdParties';

type DeferredMarketingTagsProps = {
  enabled: boolean;
  adsenseClient?: string;
};

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

    const loadIfAllowed = () => {
      // Default-allow model: ads load unless the visitor explicitly opted
      // out via the cookie banner. See hasAdvertisementConsent() for why.
      if (hasAdvertisementConsent()) {
        loadAdsense();
      }
    };

    // Fire on first idle moment regardless of whether the banner has been
    // answered yet — covers the "no decision stored" default-allow case.
    runAfterIdle(loadIfAllowed, 1200);

    // Also re-check when the banner fires an update (covers the case where
    // the visitor initially rejected, then later accepted via settings).
    const onConsentUpdate = () => loadIfAllowed();
    window.addEventListener('ckyConsentUpdate', onConsentUpdate);

    return () => {
      window.removeEventListener('ckyConsentUpdate', onConsentUpdate);
    };
  }, [adsenseClient, enabled]);

  return null;
}
