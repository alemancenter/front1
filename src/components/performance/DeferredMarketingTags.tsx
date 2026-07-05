'use client';

import { useEffect } from 'react';
import { canLoadAdsense } from '@/lib/cookie-consent';
import { enableRestrictedDataProcessing } from '@/lib/adsense';
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

      // No certified IAB TCF CMP runs on this site, so Google's ad server
      // rejects (403) any request it geo-flags as GDPR/EEA traffic once it
      // can't validate a real consent string. Requesting Restricted Data
      // Processing tells Google to serve non-personalized ads under a
      // lighter compliance bar instead of rejecting the request outright.
      // Must be queued before/alongside the per-slot push({}) calls, and
      // queuing works even while adsbygoogle.js is still loading.
      enableRestrictedDataProcessing(client);

      loadScriptOnce(
        'adsense',
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`,
        { crossorigin: 'anonymous' }
      );
    };

    const loadIfAllowed = () => {
      // Default-allow model: ads load unless the visitor explicitly opted
      // out via the cookie banner. See hasAdvertisementConsent() for why.
      if (canLoadAdsense()) {
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
