# Lint / TypeScript Fix Report

Fixed the errors reported by `npm run lint` and `npm run type-check`:

## Duplicate JSX props
Removed the automatically generated duplicate `name` props and kept the semantic `name="search"` in:

- `src/app/dashboard/roles/page.tsx`
- `src/app/dashboard/semesters/page.tsx`
- `src/app/dashboard/subjects/page.tsx`

## Missing Content Audit imports
Updated `src/components/dashboard/content-audit/ContentQualityBatchPanel.tsx`:

- Removed unused `Loader2` import.
- Added missing icons: `CheckCircle2`, `XCircle`, `Square`.
- Added missing type import: `ContentQualityBatchItem`.

## Verification note
This package does not include `node_modules`, so run the checks in the project environment:

```bash
npm run lint
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build
```
