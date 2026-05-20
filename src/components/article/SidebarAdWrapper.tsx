'use client';

import ArticleAds from '@/components/ads/ArticleAds';

interface SidebarAdWrapperProps {
  adSettings?: {
    googleAdsDesktop: string;
    googleAdsMobile: string;
    googleAdsDesktop2: string;
    googleAdsMobile2: string;
  };
  children?: React.ReactNode;
}

/**
 * Sidebar Ad Wrapper
 * - Shows one ad at the bottom of sidebar
 */
export default function SidebarAdWrapper({ adSettings, children }: SidebarAdWrapperProps) {
  const hasBottomAd = !!(adSettings?.googleAdsDesktop2 || adSettings?.googleAdsMobile2);

  return (
    <aside className="space-y-5 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
      {/* Sidebar content (Related Articles, etc.) */}
      {children}

      {/* Bottom Sidebar Ad */}
      {hasBottomAd && adSettings && (
        <div>
          <ArticleAds adSettings={adSettings} position="sidebar-bottom" />
        </div>
      )}
    </aside>
  );
}
