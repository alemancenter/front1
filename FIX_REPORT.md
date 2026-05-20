# Front10 Repair Report

## Applied fixes

- Fixed conditional React Hooks in dashboard post create/edit pages by moving the AI timer hook before conditional returns.
- Fixed `useEmailVerification` return typing and removed literal type assertions that triggered ESLint.
- Made the internal search API route use `API_CONFIG.INTERNAL_URL` explicitly for server-side backend requests.
- Removed legacy `localStorage` token fallbacks from DashboardHeader and NotificationsDropdown to avoid conflicts with HttpOnly/session restoration logic.
- Fixed DashboardHeader hook dependencies using `useCallback`.
- Hardened CSP so `unsafe-eval` is only emitted during development.
- Disabled `experimental.optimizeCss` to reduce production build instability on constrained Plesk/server environments.
- Replaced `next/font/google` Cairo loading with a deterministic CSS font-stack class to prevent production builds from depending on outbound access to `fonts.googleapis.com`.
- Removed unused imports/functions detected by ESLint.
- Added `type-check` and `check` scripts to `package.json`.
- Added `scripts/pre-deploy-check.sh` for repeatable deployment validation.

## Verified in this environment

```bash
npm run lint
# Passed with 0 errors and 0 warnings

./node_modules/.bin/tsc --noEmit --pretty false --incremental false
# Passed with 0 TypeScript errors
```

## Build note

A production build was started, but the sandbox command execution window terminated before Next.js finished the compile step. No build error was returned before timeout. Run this on the deployment server:

```bash
npm ci --no-audit --no-fund
npm run lint
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build
```

Or run:

```bash
./scripts/pre-deploy-check.sh
```

## Practical status

- Static code quality: 100% for lint/type-check in the available environment.
- Production build: must be confirmed on the real server because the sandbox timed out during Next.js compilation.
