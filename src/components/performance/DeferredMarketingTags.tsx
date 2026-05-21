'use client';

import { useEffect } from 'react';
import { loadScriptOnce, runAfterIdle, runOnFirstInteraction } from '@/lib/performance/loadThirdParties';

type DeferredMarketingTagsProps = {
  enabled: boolean;
  gtmId?: string;
  adsenseClient?: string;
};

const normalizeFlag = (value?: string) => (value || '').toLowerCase().trim();

export default function DeferredMarketingTags({ enabled, gtmId, adsenseClient }: DeferredMarketingTagsProps) {
  useEffect(() => {
    if (!enabled) return;

    const deferMode = normalizeFlag(process.env.NEXT_PUBLIC_DEFER_MARKETING_TAGS);
    const shouldDefer = deferMode !== 'false';

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

    if (!shouldDefer) {
      runAfterIdle(loadGtm, 1200);
      runAfterIdle(loadAdsense, 1500);
      return;
    }

    // Keep Google Consent Mode default in <head>, then delay heavy marketing tags
    // until the main content has painted or the user interacts. This preserves
    // compliance while reducing mobile TBT/TTI pressure from GTM and AdSense.
    runAfterIdle(loadGtm, 2500);
    runOnFirstInteraction(loadAdsense, 4200);
  }, [adsenseClient, enabled, gtmId]);

  return null;
}
