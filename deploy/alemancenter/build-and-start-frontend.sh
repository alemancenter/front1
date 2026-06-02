#!/usr/bin/env bash
set -euo pipefail

cd /var/www/vhosts/alemancenter.com/httpdocs

cp deploy/alemancenter/frontend.env.production .env.production.local

npm ci --no-audit --no-fund
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build

# Restart the app BEFORE clearing Nginx cache so new chunks are live first
# pm2:
pm2 restart ecosystem.config.js --update-env && pm2 save

# Clear Nginx proxy cache so stale HTML referencing old CSS hashes is evicted
# (prevents "MIME type text/html" errors after deployment)
if [ -d /var/cache/nginx ]; then
  find /var/cache/nginx -type f -delete 2>/dev/null || true
fi

# Reload Nginx to apply any updated directives (no downtime)
nginx -t && nginx -s reload
