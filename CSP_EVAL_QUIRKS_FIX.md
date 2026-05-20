# CSP eval and Google Ads Quirks Mode fix

## What changed

`next.config.ts` now allows `'unsafe-eval'` in `script-src` for the current production bundle.

This removes Chrome's CSP issue:

```txt
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

The rest of the CSP remains restrictive: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, and explicit Google/CMP/AdSense allowlists.

## Why this was changed

Chrome reported the eval attempt from a compiled frontend chunk on public pages. The source is not a handwritten `eval()` in the application source, but a compiled/bundled dependency or framework output.

The stricter long-term solution is to identify and replace the dependency that calls `eval` / `new Function`. Until then, allowing `'unsafe-eval'` removes the browser issue and prevents a blocked runtime path.

## Google Ads Quirks Mode warning

The Quirks Mode warning points to this external iframe/document:

```txt
https://googleads.g.doubleclick.net/pagead/ads...
```

That document is served by Google Ads/DoubleClick, not by the website. It cannot be fixed from the project code. It does not mean the main Next.js document is in Quirks Mode.

To verify your own page mode, run this in the browser console on the main page frame:

```js
document.compatMode
```

Expected result:

```txt
CSS1Compat
```

If it returns `BackCompat`, then the main document is in Quirks Mode and the layout root must be checked. For a standard Next.js app it should return `CSS1Compat`.
