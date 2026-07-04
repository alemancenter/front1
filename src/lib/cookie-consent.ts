'use client';

const STORAGE_KEY = 'site-cookie-consent';
const STORAGE_VERSION = '1';

export type ConsentCategory = 'necessary' | 'analytics' | 'advertisement' | 'functional' | 'performance';

export interface ConsentState {
  decision: 'accepted' | 'rejected' | 'custom';
  categories: ConsentCategory[];
  version: string;
  timestamp: number;
}

const ALL_CATEGORIES: ConsentCategory[] = ['necessary', 'analytics', 'advertisement', 'functional', 'performance'];
const NECESSARY_ONLY: ConsentCategory[] = ['necessary'];

export function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: ConsentState = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * AdSense/Google only *require* explicit opt-in consent before serving ads for
 * visitors in the EEA/UK/Switzerland (GDPR + PECR). Outside those regions, ads
 * (non-personalized at minimum) may be served by default; the cookie banner
 * still lets the visitor opt out at any time, which we always honor.
 *
 * This site's audience is entirely non-GDPR (Jordan/Saudi/Egypt/Palestine —
 * see country routing in /jo,/sa,/eg,/ps), so gating 100% of ad requests
 * behind an explicit "Accept" click was losing nearly all ad revenue for no
 * legal reason. We now default advertisement consent to GRANTED until the
 * visitor explicitly rejects it, instead of defaulting to DENIED until they
 * explicitly accept.
 */
export function hasAdvertisementConsent(): boolean {
  const stored = getStoredConsent();
  if (!stored) return true; // no decision yet → serve ads by default (opt-out model)
  return stored.categories.includes('advertisement');
}

function storeConsent(state: ConsentState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function updateGtagConsent(categories: ConsentCategory[]): void {
  if (typeof window === 'undefined') return;
  const win = window as any;
  if (typeof win.gtag !== 'function') return;
  const hasAnalytics = categories.includes('analytics');
  const hasAds = categories.includes('advertisement');
  win.gtag('consent', 'update', {
    analytics_storage: hasAnalytics ? 'granted' : 'denied',
    ad_storage: hasAds ? 'granted' : 'denied',
    ad_user_data: hasAds ? 'granted' : 'denied',
    ad_personalization: hasAds ? 'granted' : 'denied',
  });
}

// Implements window.getCkyConsent so AdUnit.tsx hasCkyConsent() works with our custom banner
function installConsentShim(categories: ConsentCategory[]): void {
  if (typeof window === 'undefined') return;
  const win = window as any;
  win.getCkyConsent = () => ({ categories: { accepted: categories } });
}

function dispatchConsentEvent(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('ckyConsentUpdate'));
}

export function applyConsent(decision: 'accepted' | 'rejected' | 'custom', custom?: ConsentCategory[]): void {
  const categories: ConsentCategory[] =
    decision === 'accepted' ? ALL_CATEGORIES :
    decision === 'rejected' ? NECESSARY_ONLY :
    (custom ?? NECESSARY_ONLY);

  const state: ConsentState = {
    decision,
    categories,
    version: STORAGE_VERSION,
    timestamp: Date.now(),
  };

  storeConsent(state);
  updateGtagConsent(categories);
  installConsentShim(categories);
  dispatchConsentEvent();
}

// Called on every page load to restore previous consent
export function rehydrateConsent(): boolean {
  const stored = getStoredConsent();
  if (!stored) return false;
  updateGtagConsent(stored.categories);
  installConsentShim(stored.categories);
  return true;
}
