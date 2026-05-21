# CSP / AdSense Compatibility Fix

## Summary
This patch adjusts the Content Security Policy to avoid Chrome DevTools CSP issues caused by Google Ads, Google Tag Manager, CookieYes, and Google ad-quality frames/workers, while keeping the existing Consent Mode and deferred loading behavior.

## What changed
- Added explicit `script-src-elem` for external Google/CookieYes scripts.
- Added broader Google ad domains used by AdSense and DoubleClick.
- Added `child-src` in addition to `frame-src` for ad iframes.
- Added `worker-src 'self' blob:` for browser/vendor workers.
- Made production `unsafe-eval` controllable by environment variable:
  - Default: enabled for ad/vendor compatibility.
  - Set `NEXT_PUBLIC_ALLOW_UNSAFE_EVAL_FOR_ADS=false` to disable it later after confirming no CSP eval issue appears.

## Why
The performance report showed heavy third-party usage from Google Ads/GTM and Chrome Best Practices reported unresolved Content Security Policy issues. Google ad scripts can use additional subdomains/frames/workers beyond the minimal CSP list.

## AdSense safety
This does not remove AdSense, does not hide ads, and does not change ad placement. It only allows legitimate Google/CookieYes resources required for consent, measurement, and ad rendering.
