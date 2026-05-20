#!/bin/sh
# Creates .htaccess in .next/static/ for Apache MIME type handling

STATIC_DIR=".next/static"

if [ -d "$STATIC_DIR" ]; then
  cat > "$STATIC_DIR/.htaccess" << 'HTACCESS'
# MIME Types for Next.js static files
<IfModule mod_mime.c>
    AddType text/css .css
    AddType application/javascript .js
    AddType application/json .json
    AddType font/woff .woff
    AddType font/woff2 .woff2
    AddType image/svg+xml .svg
    AddType image/webp .webp
    AddType image/avif .avif
</IfModule>

# Cache Control
<IfModule mod_headers.c>
    Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/css application/javascript application/json
</IfModule>
HTACCESS
  echo "Created .htaccess in .next/static/"
else
  echo ".next/static/ not found. Run next build first."
fi
