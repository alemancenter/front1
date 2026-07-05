'use client';

import { useEffect, useRef } from 'react';
import type { AdSlotConfig } from '@/lib/adsense';
import { initializeAdSlots, enableRestrictedDataProcessing } from '@/lib/adsense';
import { hasAdvertisementConsent } from '@/lib/cookie-consent';

interface AdUnitProps {
  config: AdSlotConfig;
  adClient: string;
  className?: string;
}

export default function AdUnit({ config, adClient, className = '' }: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tryInit = () => {
      if (!hasAdvertisementConsent()) return;
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
  }, [config.ad_slot, adClient]);

  if (!config.ad_slot || !adClient) return null;

  return (
    <div ref={containerRef} className={`ad-unit ${className}`}>
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
    </div>
  );
}
