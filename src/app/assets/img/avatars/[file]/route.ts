import { NextResponse } from 'next/server';

const fallbackAvatar = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="User avatar">
  <rect width="128" height="128" rx="64" fill="#e2e8f0"/>
  <circle cx="64" cy="48" r="24" fill="#64748b"/>
  <path d="M24 112c6.4-23.5 21.3-36 40-36s33.6 12.5 40 36" fill="#64748b"/>
</svg>
`.trim();

export const dynamic = 'force-static';

export function GET() {
  return new NextResponse(fallbackAvatar, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
