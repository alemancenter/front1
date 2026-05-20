#!/usr/bin/env bash
set -euo pipefail

export NEXT_TELEMETRY_DISABLED=1

echo "[1/4] Installing dependencies from package-lock.json..."
npm ci --no-audit --no-fund

echo "[2/4] Running ESLint..."
npm run lint

echo "[3/4] Running TypeScript type-check..."
npm run type-check

echo "[4/4] Building production bundle..."
npm run build

echo "Production checks completed successfully."
