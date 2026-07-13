import DOMPurify from 'isomorphic-dompurify';

// --- External link processing ---

const BLOCKED_HOST_KEYWORDS = [
  // Gambling
  'bet365', 'betway', '888casino', 'pokerstars', 'bovada', 'betsafe',
  'unibet', 'williamhill', 'ladbrokes', 'paddypower', 'skybet', 'betfair',
  'draftkings', 'fanduel', 'betmgm', 'betonline', 'mybookie', 'bwin', 'partypoker',
  'caesarssports', 'pointsbet',
  // Adult
  'pornhub', 'xvideos', 'xnxx', 'redtube', 'youporn', 'tube8', 'brazzers',
  'bangbros', 'xhamster', 'spankbang', 'eporner', 'tnaflix', 'sunporno',
  // Warez / piracy
  'thepiratebay', 'piratebay', '1337x', 'rarbg', 'rutracker', 'torrentz2',
  'eztv', 'zooqle', 'cpasbien', '0daydown',
  // Suspicious monetising shorteners (redirect abuse / malware gateways)
  'adf.ly', 'bc.vc', 'sh.st', 'shorte.st', 'viralurl.com', '5z8.info', 'zzb.bz',
];

const blockedHostRe = new RegExp(
  '(' + BLOCKED_HOST_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
  'i',
);

function isExternalHref(href: string): boolean {
  if (
    !href || href === '#' ||
    href.startsWith('#') || href.startsWith('/') ||
    href.startsWith('mailto:') || href.startsWith('tel:')
  ) return false;
  try {
    const { protocol } = new URL(href);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function isBlockedHref(href: string): boolean {
  try {
    return blockedHostRe.test(new URL(href).hostname);
  } catch {
    return false;
  }
}

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'span', 'div', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'a', 'img', 'figure', 'figcaption',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption',
  'iframe',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'style',
  'target', 'rel', 'colspan', 'rowspan', 'width', 'height',
  'frameborder', 'allow', 'allowfullscreen', 'loading', 'sandbox',
];

/**
 * Sanitizes rich-text HTML content before it is rendered via
 * dangerouslySetInnerHTML. Uses DOMPurify (a real HTML parser) rather than
 * regex matching so it cannot be bypassed by attribute-boundary tricks
 * (e.g. `<svg/onload=...>`), unclosed/unknown tags (e.g. `<base href=...>`),
 * or control-character obfuscated URL schemes.
 *
 * `trustedIframeHosts` is an allow-list of hostnames permitted in <iframe src>;
 * any iframe pointing elsewhere is stripped entirely.
 */
export function sanitizeRichHtml(input: string, trustedIframeHosts: string[] = []) {
  const html = String(input || '');

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return;
    const el = node as unknown as Element;
    const src = el.getAttribute?.('src') || '';
    let host = '';
    try {
      host = new URL(src).hostname;
    } catch {
      el.remove?.();
      return;
    }
    if (!trustedIframeHosts.includes(host)) {
      el.remove?.();
      return;
    }
    el.setAttribute?.('sandbox', 'allow-scripts allow-same-origin allow-presentation');
  });

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const el = node as unknown as Element;
    if (el.tagName !== 'A') return;
    const href = el.getAttribute?.('href') || '';
    if (!isExternalHref(href)) return;
    if (isBlockedHref(href)) {
      el.setAttribute?.('href', '#');
      return;
    }
    el.setAttribute?.('target', '_blank');
    el.setAttribute?.('rel', 'noopener noreferrer');
  });

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ADD_TAGS: [],
    });
  } finally {
    DOMPurify.removeHook('uponSanitizeElement');
    DOMPurify.removeHook('afterSanitizeAttributes');
  }
}
