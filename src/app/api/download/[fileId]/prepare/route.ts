import { NextRequest, NextResponse } from 'next/server';
import {
  requestSignedDownloadUrl,
  safeDownloadErrorResponse,
} from '../../downloadProxyUtils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

/**
 * AJAX-only preparation endpoint used by the download button.
 * It validates the current user's ability to download and returns a temporary
 * frontend signed download URL. The browser never receives the backend API path.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { fileId } = await params;

  if (!fileId || !/^\d+$/.test(fileId)) {
    return NextResponse.json(
      {
        success: false,
        message: 'معرف الملف غير صحيح.',
        code: 'INVALID_FILE_ID',
      },
      { status: 400 }
    );
  }

  try {
    const result = await requestSignedDownloadUrl(request, fileId);

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          code: result.code,
          status: result.status,
        },
        { status: result.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'رابط التحميل جاهز.',
        download_url: result.downloadUrl,
        expires_in: 15 * 60,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('[Download Prepare Route] Internal error:', {
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
