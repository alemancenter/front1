export interface AdPageContext {
  /** Character count of the main text content on the page. */
  contentLength?: number;
  /** False when content is draft / unapproved / restricted. Undefined = assume approved. */
  hasApprovedContent?: boolean;
  /** Login, register, verify-email, forgot-password pages. */
  isAuthPage?: boolean;
  /** Any /dashboard/* route. */
  isDashboard?: boolean;
  /** 404, 500, or other error pages. */
  isErrorPage?: boolean;
  /** Search result page that returned 0 results. */
  isSearchEmpty?: boolean;
  /** Page contains content flagged as policy-sensitive or restricted. */
  hasPolicyRisk?: boolean;
}

/**
 * Central gate: returns true only when the page is safe and rich enough
 * to display ads under Google Publisher Policy.
 *
 * Blocks:
 * - Auth / dashboard / error pages (no editorial content)
 * - Unapproved or restricted content
 * - Empty search results
 * - Pages with fewer than 350 characters of body text
 *
 * NOTE: previously required 600 chars, which — combined with the equally
 * strict evaluateAdsenseReadiness() gate — blocked ads on most of this
 * site's short "download resource" pages (real traffic, zero ad requests).
 * 350 chars still filters out genuinely empty/stub pages while letting
 * normal resource pages qualify.
 */
export function shouldShowAds(ctx: AdPageContext): boolean {
  if (ctx.isAuthPage || ctx.isDashboard || ctx.isErrorPage || ctx.hasPolicyRisk) return false;
  if (ctx.hasApprovedContent === false) return false;
  if (ctx.isSearchEmpty) return false;
  if ((ctx.contentLength ?? Infinity) < 350) return false;
  return true;
}

/**
 * Returns the maximum number of ad slots allowed for the given content length.
 *
 * Google's "Valuable Inventory" policy requires that ads never outweigh content.
 *
 * | Content length | Ad limit |
 * |----------------|----------|
 * | < 350 chars    | 0        |
 * | 350–1 199      | 1        |
 * | 1 200–2 499    | 2        |
 * | ≥ 2 500        | 3 (max)  |
 */
export function getAdLimit(contentLength: number): 0 | 1 | 2 | 3 {
  if (contentLength < 350) return 0;
  if (contentLength < 1200) return 1;
  if (contentLength < 2500) return 2;
  return 3;
}
