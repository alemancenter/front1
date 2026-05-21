# Fonts Directory

The project is configured to use the Arabic **Cairo** font as a self-hosted local font.

Required font files must be uploaded to:

```txt
public/fonts/cairo/
```

Required filenames:

```txt
Cairo-Regular.woff2
Cairo-SemiBold.woff2
Cairo-Bold.woff2
```

The font is declared in:

```txt
src/app/globals.css
```

Fonts are loaded on demand via @font-face in:

```txt
src/app/layout.tsx
```

This avoids relying on `next/font/google` or loading fonts from Google at runtime, which is better for locked-down servers and improves privacy/performance consistency.
