# Frontend warnings fix report

## Fixed warnings

### 1. Form field without id/name
Added a `name` attribute to every native `input`, `select`, and `textarea` element that previously had neither `id` nor `name`.

This resolves Chrome/DevTools warnings such as:

> A form field element should have an id or name attribute

The change improves browser autofill/accessibility diagnostics and does not change the application logic.

### 2. CSP blocks eval in dashboard scripts
Kept the public website CSP strict, but added a dashboard-only CSP relaxation for `/dashboard/:path*`:

```txt
script-src 'self' 'unsafe-inline' 'unsafe-eval' ...
```

Reason: the dashboard rich-text editor stack currently uses Summernote/jQuery, and this can trigger dynamic JavaScript evaluation in production chunks. Public pages remain strict and do not receive `unsafe-eval`, which is better for AdSense and visitor-facing security.

## Important

This is a tactical compatibility fix. The long-term best fix is replacing Summernote/jQuery with a modern React editor that does not require `unsafe-eval`.

Suggested future editors:

- TipTap
- Lexical
- Plate

## Files changed

- `next.config.ts`
- Multiple React files under `src/` where native form controls were missing `id/name`.
