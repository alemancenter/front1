module.exports = {
  apps: [
    {
      name: 'alemancenter-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/vhosts/alemancenter.com/httpdocs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,

        // ── Public (browser) — must match build-time values ───────────────
        NEXT_PUBLIC_API_URL: 'https://api.alemancenter.com/api',
        NEXT_PUBLIC_APP_URL: 'https://alemancenter.com',
        NEXT_PUBLIC_DEFAULT_COUNTRY_ID: '1',
        NEXT_PUBLIC_FRONTEND_API_KEY: process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '',

        // ── Server-only (SSR) — read at request time ──────────────────────
        // Direct HTTP to Go Fiber on port 8082, bypasses Nginx
        API_INTERNAL_URL: 'http://127.0.0.1:8082/api',
        API_HOSTNAME: 'api.alemancenter.com',
        FRONTEND_API_KEY: process.env.FRONTEND_API_KEY || '',

        // ── Maintenance ───────────────────────────────────────────────────
        MAINTENANCE_MODE: 'false',
        MAINTENANCE_BYPASS_KEY: process.env.MAINTENANCE_BYPASS_KEY || '',
      },
      error_file: '/var/www/vhosts/alemancenter.com/logs/pm2-error.log',
      out_file: '/var/www/vhosts/alemancenter.com/logs/pm2-out.log',
      time: true
    }
  ]
};
