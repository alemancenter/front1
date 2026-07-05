'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdSlotConfig } from '@/lib/adsense';
import { initializeAdSlots, enableRestrictedDataProcessing } from '@/lib/adsense';
import { canLoadAdsense } from '@/lib/cookie-consent';

interface AdUnitProps {
  config: AdSlotConfig;
  adClient: string;
  className?: string;
}

export default function AdUnit({ config, adClient, className = '' }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [canRequestAds, setCanRequestAds] = useState(false);

  useEffect(() => {
    const syncAllowed = () => {
      const allowed = canLoadAdsense();
      setCanRequestAds(allowed);
      return allowed;
    };

    const tryInit = () => {
      if (!syncAllowed()) return;
      const container = containerRef.current;
      if (!container) return;
      if (cleanupRef.current) return; // already initialized
      // Idempotent — safe even if DeferredMarketingTags already queued this.
      // Ensures RDP is set even if an AdUnit mounts before that component's
      // effect runs, avoiding the GDPR-flagged-traffic 403 from Google.
      enableRestrictedDataProcessing(adClient);
      cleanupRef.current = initializeAdSlots(container) ?? null;
    };

    // Attempt immediately (returning visitors who already accepted)
    tryInit();

    // Re-attempt when our consent banner fires a consent update (first-time visitors)
    const onConsentUpdate = () => tryInit();
    window.addEventListener('ckyConsentUpdate', onConsentUpdate);

    return () => {
      window.removeEventListener('ckyConsentUpdate', onConsentUpdate);
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [config.ad_slot, adClient, canRequestAds]);

  if (!config.ad_slot || !adClient) return null;

  return (
    <div ref={containerRef} className={`ad-unit ${className}`}>
      {canRequestAds ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: config.ad_type === 'in_article' ? 'center' : undefined }}
          data-ad-client={adClient}
          data-ad-slot={config.ad_slot}
          data-ad-format={config.format}
          data-ad-layout={config.ad_layout || undefined}
          data-ad-layout-key={config.ad_layout_key || undefined}
          data-matched-content-ui-type={config.matched_content_ui_type || undefined}
          data-matched-content-rows-num={config.matched_content_rows_num || undefined}
          data-matched-content-columns-num={config.matched_content_columns_num || undefined}
          data-restrict-data-processing="1"
          data-full-width-responsive={String(config.responsive)}
        />
      ) : null}
    </div>
  );
}
