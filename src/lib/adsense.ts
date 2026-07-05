const SCRIPT_TAG_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

// ── Structured ad slot config (new format) ───────────────────────────────────

export interface AdSlotConfig {
  ad_slot: string;
  format: string;
  responsive: boolean;
  ad_layout?: string;
  ad_layout_key?: string;
  ad_type?: 'display' | 'in_article' | 'multiplex';
  matched_content_ui_type?: string;
  matched_content_rows_num?: string;
  matched_content_columns_num?: string;
}

const AD_ALLOWED_KEYS = new Set([
  'ad_slot',
  'format',
  'responsive',
  'ad_layout',
  'ad_layout_key',
  'ad_type',
  'matched_content_ui_type',
  'matched_content_rows_num',
  'matched_content_columns_num',
]);

const attrValue = (source: string, attr: string): string => {
  const match = source.match(new RegExp(`${attr}=["']([^"']+)["']`, 'i'));
  return match?.[1]?.trim() ?? '';
};

const inferAdType = (format: string, layout?: string, explicit?: unknown): AdSlotConfig['ad_type'] => {
  if (explicit === 'multiplex' || format === 'autorelaxed') return 'multiplex';
  if (explicit === 'in_article' || layout === 'in-article') return 'in_article';
  return 'display';
};

/**
 * Parse a stored ad setting value into a typed AdSlotConfig.
 * The stored format is JSON: {"ad_slot":"123","format":"auto","responsive":true}
 * Returns null for empty, invalid, or unsafe values.
 */
export function parseAdSlotConfig(raw: string): AdSlotConfig | null {
  const trimmed = (raw || '').trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    for (const key of Object.keys(parsed)) {
      if (!AD_ALLOWED_KEYS.has(key)) return null;
    }
    const slot = typeof parsed.ad_slot === 'string' ? parsed.ad_slot.trim() : '';
    if (!slot) return null;
    const format = typeof parsed.format === 'string' ? parsed.format.trim() : 'auto';
    const adLayout = typeof parsed.ad_layout === 'string' ? parsed.ad_layout.trim() : undefined;
    return {
      ad_slot: slot,
      format,
      responsive: typeof parsed.responsive === 'boolean' ? parsed.responsive : true,
      ad_layout: adLayout,
      ad_layout_key: typeof parsed.ad_layout_key === 'string' ? parsed.ad_layout_key.trim() : undefined,
      ad_type: inferAdType(format, adLayout, parsed.ad_type),
      matched_content_ui_type:
        typeof parsed.matched_content_ui_type === 'string' ? parsed.matched_content_ui_type.trim() : undefined,
      matched_content_rows_num:
        typeof parsed.matched_content_rows_num === 'string' ? parsed.matched_content_rows_num.trim() : undefined,
      matched_content_columns_num:
        typeof parsed.matched_content_columns_num === 'string' ? parsed.matched_content_columns_num.trim() : undefined,
    };
  } catch {
    return null;
  }
}

const compactAdConfig = (config: AdSlotConfig): AdSlotConfig => ({
  ...config,
  ad_layout: config.ad_layout || undefined,
  ad_layout_key: config.ad_layout_key || undefined,
  matched_content_ui_type: config.matched_content_ui_type || undefined,
  matched_content_rows_num: config.matched_content_rows_num || undefined,
  matched_content_columns_num: config.matched_content_columns_num || undefined,
});

/**
 * Serialize a slot ID into the stored JSON format. Returns '' for empty input.
 *
 * Root cause fix: this used to accept ONLY a bare numeric slot ID and always
 * force format:"auto" — but some AdSense ad units require a specific format
 * (e.g. "autorelaxed" for Multiplex/related-content units, or a custom
 * ad_layout_key for In-feed units). If an admin pasted a Multiplex unit's slot
 * number into one of the plain "Desktop/Mobile Ads" fields, the ad would be
 * requested with format:"auto" instead of "autorelaxed" and Google would
 * never fill it — no error, just permanently blank, in every country.
 *
 * Fix: if the input looks like a full pasted AdSense <ins> snippet (not just
 * a bare number), extract the real data-ad-format / data-ad-layout /
 * data-ad-layout-key / data-full-width-responsive attributes and preserve
 * them, instead of overwriting with hardcoded defaults. Bare numeric IDs
 * still default to format:"auto", responsive:true as before.
 */
export function buildAdSlotValue(slotId: string): string {
  const raw = (slotId || '').trim();
  if (!raw) return '';

  const existing = parseAdSlotConfig(raw);
  if (existing) return JSON.stringify(compactAdConfig(existing));

  const pastedSlot = attrValue(raw, 'data-ad-slot');
  if (pastedSlot) {
    const format = attrValue(raw, 'data-ad-format') || 'auto';
    const adLayout = attrValue(raw, 'data-ad-layout') || undefined;
    return JSON.stringify({
      ad_slot: pastedSlot,
      format,
      responsive: attrValue(raw, 'data-full-width-responsive') !== 'false',
      ad_layout: adLayout,
      ad_layout_key: attrValue(raw, 'data-ad-layout-key') || undefined,
      ad_type: inferAdType(format, adLayout),
      matched_content_ui_type: attrValue(raw, 'data-matched-content-ui-type') || undefined,
      matched_content_rows_num: attrValue(raw, 'data-matched-content-rows-num') || undefined,
      matched_content_columns_num: attrValue(raw, 'data-matched-content-columns-num') || undefined,
    });
  }

  const id = /^\d+$/.test(raw) ? raw : '';
  if (!id) return '';
  return JSON.stringify({ ad_slot: id, format: 'auto', responsive: true });
}

/** Extract an In-Article slot from pasted AdSense code and store it safely. */
export function buildInArticleAdValue(rawCode: string): string {
  const raw = (rawCode || '').trim();
  if (!raw) return '';

  const existing = parseAdSlotConfig(raw);
  if (existing) {
    return JSON.stringify({
      ...existing,
      format: existing.format || 'fluid',
      responsive: true,
      ad_layout: existing.ad_layout || 'in-article',
      ad_type: 'in_article',
    });
  }

  const slot = attrValue(raw, 'data-ad-slot') || (/^\d+$/.test(raw) ? raw : '');
  if (!slot) return '';

  return JSON.stringify({
    ad_slot: slot,
    format: attrValue(raw, 'data-ad-format') || 'fluid',
    responsive: attrValue(raw, 'data-full-width-responsive') !== 'false',
    ad_layout: attrValue(raw, 'data-ad-layout') || 'in-article',
    ad_layout_key: attrValue(raw, 'data-ad-layout-key') || undefined,
    ad_type: 'in_article',
  });
}

/** Extract just the slot ID from a stored JSON value, for dashboard inputs. */
export function extractSlotId(raw: string): string {
  return parseAdSlotConfig(raw)?.ad_slot ?? '';
}

const BLOCK_CLOSE_TAG_PATTERN = /<\/(p|div|h[1-6]|ul|ol|table|blockquote|figure|section)>/gi;

/**
 * Find a safe offset inside a content HTML string to insert an in-article ad
 * (roughly after the 2nd paragraph).
 *
 * Falls back through three tiers so a configured ad code is never silently
 * dropped just because the split heuristic didn't match:
 *  1. After the 2nd (or 1st) <p> tag — the common case.
 *  2. After the 2nd (or 1st) closing block-level tag (</div>, </h2>, </ul>...)
 *     — covers editors/imported HTML that don't wrap text in <p>.
 *  3. End of the content — still shows the ad (after all the text) rather
 *     than never rendering it at all.
 */
export function findContentSplitIndex(html: string): number {
  if (!html) return -1;

  const paragraphMatches = Array.from(html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi));
  const secondParagraph = paragraphMatches[1] ?? paragraphMatches[0];
  if (secondParagraph) {
    return secondParagraph.index! + secondParagraph[0].length;
  }

  const blockMatches = Array.from(html.matchAll(BLOCK_CLOSE_TAG_PATTERN));
  const secondBlock = blockMatches[1] ?? blockMatches[0];
  if (secondBlock) {
    return secondBlock.index! + secondBlock[0].length;
  }

  return html.length > 0 ? html.length : -1;
}

/** Show saved structured config as a pasteable AdSense-like snippet in dashboard textareas. */
export function formatAdSnippetForInput(raw: string, adClient = 'ca-pub-xxxxxxxxxxxxxxxx'): string {
  const config = parseAdSlotConfig(raw);
  if (!config) return '';

  const layout = config.ad_layout ? `\n     data-ad-layout="${config.ad_layout}"` : '';
  const layoutKey = config.ad_layout_key ? `\n     data-ad-layout-key="${config.ad_layout_key}"` : '';
  const matchedUi = config.matched_content_ui_type
    ? `\n     data-matched-content-ui-type="${config.matched_content_ui_type}"`
    : '';
  const matchedRows = config.matched_content_rows_num
    ? `\n     data-matched-content-rows-num="${config.matched_content_rows_num}"`
    : '';
  const matchedColumns = config.matched_content_columns_num
    ? `\n     data-matched-content-columns-num="${config.matched_content_columns_num}"`
    : '';
  const format = config.format || (config.ad_type === 'in_article' ? 'fluid' : 'auto');
  return `<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-client="${adClient}"
     data-ad-slot="${config.ad_slot}"${layout}
     data-ad-format="${format}"${layoutKey}${matchedUi}${matchedRows}${matchedColumns}
     data-full-width-responsive="${String(config.responsive)}"></ins>`;
}

// ── Legacy helpers (kept for backward compatibility) ─────────────────────────

export type AdType = 'adsense' | 'script' | 'empty';

export interface ScriptInfo {
  src: string | null;
  async: boolean;
  referrerPolicy: string;
  crossOrigin: string | null;
  content: string;
}

/** Detect whether ad code is AdSense (<ins>), plain script injection, or empty */
export function detectAdType(rawCode: string): AdType {
  const decoded = decodeAdSnippet(rawCode);
  if (!decoded) return 'empty';
  if (/<ins\b[^>]*class="adsbygoogle"/i.test(decoded)) return 'adsense';
  if (/<script\b/i.test(decoded)) return 'script';
  return 'empty';
}

/** Extract all <script> tags from ad code into structured objects */
export function extractScripts(rawCode: string): ScriptInfo[] {
  const decoded = decodeAdSnippet(rawCode);
  if (!decoded) return [];

  const results: ScriptInfo[] = [];
  const pattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(decoded)) !== null) {
    const attrs = match[1];
    const content = match[2].trim();
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    results.push({
      src: srcMatch ? srcMatch[1] : null,
      async: /\basync\b/i.test(attrs),
      referrerPolicy: (attrs.match(/referrerpolicy=["']([^"']*)["']/i) || [])[1] || '',
      crossOrigin: (attrs.match(/crossorigin=["']([^"']*)["']/i) || [])[1] || null,
      content,
    });
  }

  return results;
}

/**
 * Get or create the adsbygoogle queue.
 *
 * CRITICAL: After Google's adsbygoogle.js loads, it replaces window.adsbygoogle
 * with a custom proxy object that has a push() method but is NOT a native Array.
 * Using Array.isArray() would return false and cause us to overwrite Google's
 * object with a plain [], destroying the entire ad processing system.
 *
 * We follow Google's exact recommended pattern:
 *   (window.adsbygoogle = window.adsbygoogle || [])
 */
const getAdsQueue = (): { push: (obj: Record<string, unknown>) => void } | null => {
  if (typeof window === 'undefined') return null;

  const win = window as Window & { adsbygoogle?: any };
  win.adsbygoogle = win.adsbygoogle || [];
  return win.adsbygoogle;
};

let privacyOptionsApplied = false;

/**
 * Applies AdSense privacy options without calling adsbygoogle.push().
 *
 * This sets requestNonPersonalizedAds=1 so AdSense requests include npa=1.
 * The separate RDP signal is rendered on each <ins> by AdUnit.
 *
 * Do not push this privacy setup into the adsbygoogle queue. Google treats
 * extra queue pushes as ad requests once adsbygoogle.js is active, which can
 * throw when every <ins> on the page has already been processed.
 */
export function enableRestrictedDataProcessing(adClient: string): void {
  if (process.env.NEXT_PUBLIC_ADSENSE_FORCE_NPA !== 'true') return;
  if (privacyOptionsApplied) return;
  const client = (adClient || '').trim();
  if (!client) return;
  const queue = getAdsQueue();
  if (!queue) return;

  privacyOptionsApplied = true;
  (queue as typeof queue & { requestNonPersonalizedAds?: number }).requestNonPersonalizedAds = 1;
}

const isSlotInitialized = (slot: HTMLElement): boolean =>
  slot.dataset.adUnitInitialized === '1' || slot.hasAttribute('data-adsbygoogle-status');

/**
 * Check if an ad slot is visible to the user.
 * Uses offsetParent to detect ancestors with display:none — this is the
 * standard DOM way to determine effective visibility without walking the tree.
 *
 * Note: offsetParent is null for position:fixed elements too, but ad slots
 * should never be position:fixed so this is safe.
 */
const isSlotVisible = (slot: HTMLElement): boolean => {
  if (typeof window === 'undefined') return false;
  if (!slot.isConnected) return false;

  // offsetParent is null when the element or any ancestor has display:none.
  // This correctly handles the mobile/desktop hidden pattern where a parent
  // div uses Tailwind's "hidden md:block" or "block md:hidden".
  if (slot.offsetParent === null) {
    // Exception: the <body> or <html> element has offsetParent === null,
    // and position:fixed elements do too. Check the slot's own style.
    const style = window.getComputedStyle(slot);
    if (style.position === 'fixed') return true;
    return false;
  }

  const style = window.getComputedStyle(slot);
  if (style.visibility === 'hidden') return false;

  return true;
};

export function decodeAdSnippet(rawCode: string): string {
  const trimmed = rawCode.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('__B64__')) return trimmed;

  const encoded = trimmed.slice(7);
  if (!encoded) return '';

  try {
    if (typeof atob === 'function') return atob(encoded).trim();
  } catch {
    return '';
  }

  return '';
}

export function normalizeAdSnippet(rawCode: string): string {
  const decoded = decodeAdSnippet(rawCode);
  if (!decoded) return '';

  // The snippet scripts are loaded globally from RootLayout and pushed manually per <ins>.
  const withoutScripts = decoded.replace(SCRIPT_TAG_PATTERN, '').trim();
  // Strip event handler attributes (on* = "...") to prevent XSS via database-supplied ad code.
  const withoutHandlers = withoutScripts.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
  return withoutHandlers;
}

export function initializeAdSlots(
  container: HTMLElement,
  options?: { maxAttempts?: number; intervalMs?: number }
): () => void {
  const adSlots = Array.from(container.querySelectorAll<HTMLElement>('ins.adsbygoogle'));
  if (!adSlots.length) return () => {};

  const maxAttempts = options?.maxAttempts ?? 25;
  const intervalMs = options?.intervalMs ?? 300;

  let attempts = 0;
  let disposed = false;
  let timer: number | null = null;

  const tryInitialize = (): boolean => {
    attempts += 1;
    const queue = getAdsQueue();

    if (!queue) return attempts >= maxAttempts;

    const pendingSlots = adSlots.filter((slot) => !isSlotInitialized(slot) && isSlotVisible(slot));
    if (!pendingSlots.length) return true;

    for (const slot of pendingSlots) {
      try {
        slot.dataset.adUnitInitializing = '1';
        queue.push({});
        slot.dataset.adUnitInitialized = '1';
        delete slot.dataset.adUnitInitializing;
      } catch (error) {
        delete slot.dataset.adUnitInitializing;
        const message = error instanceof Error ? error.message : '';
        if (message.includes('already have ads')) {
          slot.dataset.adUnitInitialized = '1';
        }
      }
    }

    const allInitialized = adSlots.every((slot) => !isSlotVisible(slot) || isSlotInitialized(slot));
    return allInitialized || attempts >= maxAttempts;
  };

  if (!tryInitialize()) {
    timer = window.setInterval(() => {
      if (disposed) return;
      if (tryInitialize() && timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    }, intervalMs);
  }

  return () => {
    disposed = true;
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}
