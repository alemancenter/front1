'use client';

import { useEffect } from 'react';
import { loadScriptOnce, runAfterIdle } from '@/lib/performance/loadThirdParties';
import { getStoredConsent } from '@/lib/cookie-consent';

type DeferredMarketingTagsProps = {
  enabled: boolean;
  gtmId?: string;
  adsenseClient?: string;
};

export default function DeferredMarketingTags({ enabled, gtmId, adsenseClient }: DeferredMarketingTagsProps) {
  useEffect(() => {
    if (!enabled) return;

    const loadGtm = () => {
      const id = (gtmId || '').trim();
      if (!id) return;
      const win = window as Window & { dataLayer?: Array<Record<string, unknown>> };
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      loadScriptOnce(
        'google-tag-manager',
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`
      );
    };

    const loadAdsense = () => {
      const client = (adsenseClient || '').trim();
      if (!client) return;
      loadScriptOnce(
        'adsense',
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`,
        { crossorigin: 'anonymous' }
      );
    };

    // Returning visitor who already made a consent decision — load immediately
    const stored = getStoredConsent();
    if (stored) {
      runAfterIdle(loadGtm, 1200);
      runAfterIdle(loadAdsense, 1500);
      return;
    }

    // First-time visitor: wait for the consent banner decision before loading GTM.
    // The banner fires 'ckyConsentUpdate' via applyConsent() → dispatchConsentEvent().
    const onConsentUpdate = () => {
      loadGtm();
      // AdSense deferred a little longer so GTM has time to push consent signals first
      window.setTimeout(loadAdsense, 800);
      cleanup();
    };

    // Fallback: if the user ignores the banner for 60 s, load GTM anyway.
    // Google Consent Mode v2 default signals are already 'denied', so no personal
    // data is collected — this just ensures analytics eventually initialise.
    const fallbackTimer = window.setTimeout(() => {
      loadGtm();
      cleanup();
    }, 60_000);

    const cleanup = () => {
      window.removeEventListener('ckyConsentUpdate', onConsentUpdate);
      window.clearTimeout(fallbackTimer);
    };

    window.addEventListener('ckyConsentUpdate', onConsentUpdate);

    return cleanup;
  }, [adsenseClient, enabled, gtmId]);

  return null;
}
