import { NextResponse } from 'next/server';

/**
 * Compatibility guard for old cached frontend bundles that used to poll
 * /api/dashboard/notifications/* from public pages.
 *
 * The real dashboard notifications API must be accessed through /backend-api
 * and only from authenticated /dashboard pages. Returning 204 here prevents
 * repeated 401 noise in Nginx logs for anonymous visitors with stale assets.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function GET() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export function POST() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
