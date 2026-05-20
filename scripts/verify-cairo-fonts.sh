#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FONT_DIR="$ROOT_DIR/public/fonts/cairo"
REQUIRED=(
  "Cairo-Regular.woff2"
  "Cairo-Medium.woff2"
  "Cairo-SemiBold.woff2"
  "Cairo-Bold.woff2"
)

missing=0
for file in "${REQUIRED[@]}"; do
  if [[ ! -s "$FONT_DIR/$file" ]]; then
    echo "Missing: $FONT_DIR/$file"
    missing=1
  else
    echo "OK: $FONT_DIR/$file"
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo "
Upload the required Cairo WOFF2 files before production build/deploy."
  exit 1
fi

echo "
Cairo font files are ready."
