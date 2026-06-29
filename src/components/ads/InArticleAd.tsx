'use client';

import AdUnit from './AdUnit';
import { parseAdSlotConfig } from '@/lib/adsense';
import { useFrontSettings } from '@/components/front-settings/FrontSettingsProvider';

type InArticleAdProps = {
  code?: string | null;
  className?: string;
};

export default function InArticleAd({ code, className = '' }: InArticleAdProps) {
  const settings = useFrontSettings();
  const adClient = (settings?.adsense_client || '').toString();
  const config = code ? parseAdSlotConfig(code) : null;

  if (!config || !adClient) return null;

  return (
    <div
      className={`ad-wrapper not-prose my-8 rounded-2xl border border-slate-200 bg-white p-4 ${className}`}
      role="complementary"
      aria-label="Advertisement"
    >
      <span className="ad-label mb-2 block select-none text-center text-xs font-bold text-slate-600">
        إعلان
      </span>
      <div className="min-h-[120px]">
        <AdUnit
          adClient={adClient}
          config={{
            ...config,
            format: config.format || 'fluid',
            responsive: config.responsive ?? true,
            ad_layout: config.ad_layout || 'in-article',
            ad_type: 'in_article',
          }}
        />
      </div>
    </div>
  );
}
