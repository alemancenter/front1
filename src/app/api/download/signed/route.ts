import { NextRequest } from 'next/server';
import {
  safeDownloadErrorResponse,
  streamSignedDownload,
} from '../downloadProxyUtils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Streams the real file using a short-lived signed token.
 * This route is the only URL opened by the browser for an actual download.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';

  if (!token) {
    return safeDownloadErrorResponse(
      request,
      400,
      'رمز التحميل مطلوب.',
      'DOWNLOAD_TOKEN_REQUIRED'
    );
  }

  try {
    return await streamSignedDownload(request, token);
  } catch (error) {
    console.error('[Signed Download Route] Internal error:', { error });

    return safeDownloadErrorResponse(
      request,
      500,
      'حدث خطأ أثناء تحميل الملف.',
      'SIGNED_DOWNLOAD_INTERNAL_ERROR'
    );
  }
}
