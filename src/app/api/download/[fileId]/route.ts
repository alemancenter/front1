import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_ENDPOINTS } from '@/lib/api/config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COUNTRY_ID_BY_CODE: Record<string, string> = {
  jo: '1',
  sa: '2',
  eg: '3',
  ps: '4',
};

const VALID_COUNTRIES = new Set(['jo', 'sa', 'eg', 'ps']);

const resolveCountryCode = (
  codeCookie?: string | null,
  idCookie?: string | null
): string => {
  if (codeCookie && typeof codeCookie === 'string') {
    const normalized = codeCookie.trim().toLowerCase();
    if (VALID_COUNTRIES.has(normalized)) return normalized;
  }

  const id = (idCookie || '').toString().trim();

  if (id === '2') return 'sa';
  if (id === '3') return 'eg';
  if (id === '4') return 'ps';

  return 'jo';
};

const getInternalApiBaseUrl = (): string => {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.SERVER_API_URL ||
    'http://127.0.0.1:8081/api'
  ).replace(/\/+$/, '');
};

type RouteParams = {
  params: Promise<{ fileId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { fileId } = await params;

  if (!fileId || !/^\d+$/.test(fileId)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid or missing fileId',
      },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const countryCodeParam =
    searchParams.get('countryCode') ||
    searchParams.get('database') ||
    searchParams.get('country');

  const cookieStore = await cookies();

  const inferredCountryCode = resolveCountryCode(
    cookieStore.get('country_code')?.value,
    cookieStore.get('country_id')?.value
  );

  const rawCountryCode = (countryCodeParam || inferredCountryCode || 'jo')
    .trim()
    .toLowerCase();

  const countryCode = VALID_COUNTRIES.has(rawCountryCode)
    ? rawCountryCode
    : 'jo';

  const countryId =
    searchParams.get('country_id') ||
    COUNTRY_ID_BY_CODE[countryCode] ||
    '1';

  const token = cookieStore.get('token')?.value;

  const apiBaseUrl = getInternalApiBaseUrl();

  /*
   * Important:
   * This route runs on the Next.js server.
   * Therefore it must call the Go Fiber backend internally:
   *   http://127.0.0.1:8081/api/articles/file/{id}/download
   *
   * Do NOT use NEXT_PUBLIC_API_URL here because it may be /backend-api.
   */
  const endpoint = API_ENDPOINTS.ARTICLES.DOWNLOAD(fileId);
  const backendUrl = new URL(`${apiBaseUrl}${endpoint}`);

  backendUrl.searchParams.set('database', countryCode);
  backendUrl.searchParams.set('countryCode', countryCode);
  backendUrl.searchParams.set('country_id', countryId);

  try {
    const forwardedFor = request.headers.get('x-forwarded-for');

    const clientIp =
      forwardedFor?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('true-client-ip') ||
      '127.0.0.1';

    const requestHeaders: Record<string, string> = {
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Forwarded-For': clientIp,
      'X-Real-IP': clientIp,
      'X-Country-Code': countryCode,
      'X-Country-Id': countryId,

      /*
       * Important:
       * Prevent compressed binary/body problems through the proxy route.
       */
      'Accept-Encoding': 'identity',

      /*
       * Internal identity expected by backend/proxy/security middleware.
       */
      Host: 'api.alemancenter.com',
      Origin: 'https://alemancenter.com',
      Referer: request.headers.get('referer') || 'https://alemancenter.com/',
      'User-Agent': request.headers.get('user-agent') || 'Next.js Download Proxy',
    };

    const incomingRange = request.headers.get('range');
    if (incomingRange) {
      requestHeaders.Range = incomingRange;
    }

    const apiKey = process.env.FRONTEND_API_KEY;
    if (apiKey) {
      requestHeaders['X-Frontend-Key'] = apiKey;
    }

    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: requestHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorPreview = '';
      let backendError: any = null;

      if (contentType.includes('application/json')) {
        const json = await response.json().catch(() => null);
        backendError = json;
        errorPreview = json ? JSON.stringify(json).slice(0, 500) : '';
      } else {
        const text = await response.text().catch(() => '');
        errorPreview = text.slice(0, 500);
      }

      console.error('[Download Proxy] Backend download error:', {
        status: response.status,
        fileId,
        backendUrl: backendUrl.toString(),
        errorPreview,
      });

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: 'File not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: backendError?.message || 'Error fetching file from backend',
          code: backendError?.code,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      const text = await response.text().catch(() => '');

      console.error('[Download Proxy] Received HTML instead of file:', {
        fileId,
        backendUrl: backendUrl.toString(),
        preview: text.slice(0, 500),
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Backend returned HTML instead of file',
        },
        { status: 502 }
      );
    }

    const responseHeaders = new Headers();

    const passthroughHeaders = [
      'content-type',
      'content-length',
      'content-disposition',
      'accept-ranges',
      'content-range',
      'etag',
      'last-modified',
      'cache-control',
    ] as const;

    for (const header of passthroughHeaders) {
      const value = response.headers.get(header);
      if (value) {
        responseHeaders.set(header, value);
      }
    }

    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('Content-Type', 'application/octet-stream');
    }

    if (!responseHeaders.has('content-disposition')) {
      responseHeaders.set(
        'Content-Disposition',
        `attachment; filename="file-${fileId}"`
      );
    }

    responseHeaders.set('X-Content-Type-Options', 'nosniff');

    if (!response.body) {
      const buffer = await response.arrayBuffer();

      return new NextResponse(buffer, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Download Proxy] Internal Server Error:', {
      fileId,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Internal download proxy error',
      },
      { status: 500 }
    );
  }
}
