# Cairo Font Implementation

## What changed

- The frontend now uses Cairo as the global Arabic/UI font.
- Cairo is loaded locally through `@font-face` from `/fonts/cairo/*.woff2`.
- `next/font/google` is not used, so the production build does not depend on Google Fonts network access.
- `font-display: swap` is enabled to avoid invisible text.
- Only three physical weights are required: 400, 600, 700. Weight 500 is synthesized by the browser from the available Cairo faces to avoid 404 errors when `Cairo-Medium.woff2` is not present.

## Files changed

```txt
src/app/globals.css
src/app/layout.tsx
public/fonts/README.md
public/fonts/cairo/README.md
scripts/verify-cairo-fonts.sh
package.json
```

## Required server action

Upload these files to:

```txt
public/fonts/cairo/
```

Required names:

```txt
Cairo-Regular.woff2
Cairo-SemiBold.woff2
Cairo-Bold.woff2
```

Optional: `Cairo-Medium.woff2` is no longer required. Then run:

```bash
npm run verify:fonts
npm run lint
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build
```
