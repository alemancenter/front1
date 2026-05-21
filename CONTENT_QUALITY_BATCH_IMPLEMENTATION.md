# Content Quality Batch Processing - Frontend

This build adds a professional human-review quality improvement layer to `/dashboard/content-audit`.

## Added

- New dashboard panel: `ContentQualityBatchPanel`.
- Batch filters by country, content type, readiness level, search query, limit, and concurrency.
- Modes:
  - `analyze_only`: creates AI decisions only.
  - `fix_preview`: creates AI decisions and fix previews.
  - `full_review`: runs the same preview-first pipeline for a complete review workflow.
- Progress polling and safe cancellation.
- Item-level details with decision and preview IDs.

## Safety

The system does not publish or apply generated text automatically. It only creates saved decisions and fix previews. A human reviewer must approve or reject every preview.
