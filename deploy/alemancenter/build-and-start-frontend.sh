#!/usr/bin/env bash
set -euo pipefail

cd /var/www/vhosts/alemancenter.com/httpdocs

cp deploy/alemancenter/frontend.env.production .env.production.local

npm ci --no-audit --no-fund
npm run lint
npm run type-check
NEXT_TELEMETRY_DISABLED=1 npm run build

# systemd example:
# systemctl restart alemancenter-frontend

# pm2 example:
# pm2 start ecosystem.config.js --update-env
# pm2 save
