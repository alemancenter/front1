import { NextRequest } from 'next/server';
import {
  requestSignedDownloadUrl,
  safeDownloadErrorResponse,
} from '../downloadProxyUtils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

/**
 * Backward-compatible direct download route.
 *
 * Older UI code used this URL as a direct <a href>. It now no longer exposes
 * backend JSON errors to the browser. It first prepares a short-lived signed
 * download URL; if the user is not allowed, it returns a safe Arabic HTML page
 * for normal browser navigation, or JSON only for AJAX callers.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { fileId } = await params;

  if (!fileId || !/^\d+$/.test(fileId)) {
    return safeDownloadErrorResponse(
      request,
      400,
      'معرف الملف غير صحيح.',
      'INVALID_FILE_ID'
    );
  }

  try {
    const result = await requestSignedDownloadUrl(request, fileId);

    if (!result.ok) {
      return safeDownloadErrorResponse(
        request,
        result.status,
        result.message,
        result.code
      );
    }

    return Response.redirect(new URL(result.downloadUrl, request.url), 302);
  } catch (error) {
    console.error('[Download Route] Failed to prepare signed download:', {
      fileId,
      error,
    });

    return safeDownloadErrorResponse(
      request,
      500,
      'حدث خطأ أثناء تجهيز رابط التحميل.',
      'DOWNLOAD_PREPARE_INTERNAL_ERROR'
    );
  }
}
