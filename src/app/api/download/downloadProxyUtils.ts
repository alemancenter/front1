import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_ENDPOINTS } from '@/lib/api/config';

export const COUNTRY_ID_BY_CODE: Record<string, string> = {
  jo: '1',
  sa: '2',
  eg: '3',
  ps: '4',
};

const VALID_COUNTRIES = new Set(['jo', 'sa', 'eg', 'ps']);

export const resolveCountryCode = (
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

export const getInternalApiBaseUrl = (): string => {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.INTERNAL_API_URL ||
    process.env.SERVER_API_URL ||
    'http://127.0.0.1:8082/api'
  ).replace(/\/+$/, '');
};

export const getClientIp = (request: NextRequest): string => {
  const forwardedFor = request.headers.get('x-forwarded-for');

  return (
    forwardedFor?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('true-client-ip') ||
    '127.0.0.1'
  );
};

export const isJsonRequest = (request: NextRequest): boolean => {
  const accept = request.headers.get('accept') || '';
  const requestedWith = request.headers.get('x-requested-with') || '';

  return (
    requestedWith.toLowerCase() === 'xmlhttprequest' ||
    accept.includes('application/json')
  );
};

const htmlEscape = (value: string): string => {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
};

export const safeDownloadErrorResponse = (
  request: NextRequest,
  status: number,
  message: string,
  code?: string
) => {
  if (isJsonRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        message,
        code,
        status,
      },
      { status }
    );
  }

  const safeMessage = htmlEscape(message || 'تعذر تجهيز رابط التحميل.');
  const safeCode = code ? htmlEscape(code) : '';

  return new NextResponse(
    `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>تعذر تحميل الملف</title>
  <style>
    body{margin:0;font-family:Cairo,Tahoma,Arial,sans-serif;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{width:min(520px,100%);background:white;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 24px 80px rgba(15,23,42,.12);padding:32px;text-align:center}
    .icon{width:64px;height:64px;margin:0 auto 18px;border-radius:999px;background:#fff7ed;color:#c2410c;display:flex;align-items:center;justify-content:center;font-size:30px}
    h1{font-size:24px;margin:0 0 12px;font-weight:800}
    p{font-size:15px;line-height:1.9;color:#475569;margin:0 0 22px}
    .code{font-size:12px;color:#94a3b8;margin-bottom:20px}
    button,a{appearance:none;border:0;border-radius:14px;padding:12px 20px;background:#0f766e;color:white;text-decoration:none;font-weight:800;cursor:pointer;display:inline-flex}
  </style>
</head>
<body>
  <main class="card">
    <div class="icon">!</div>
    <h1>تعذر تحميل الملف</h1>
    <p>${safeMessage}</p>
    ${safeCode ? `<div class="code">${safeCode}</div>` : ''}
    <button onclick="history.length > 1 ? history.back() : location.assign('/')">العودة للموقع</button>
  </main>
</body>
</html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export type DownloadRequestContext = {
  countryCode: string;
  countryId: string;
  token?: string;
  apiBaseUrl: string;
  clientIp: string;
};

export const getDownloadRequestContext = async (
  request: NextRequest
): Promise<DownloadRequestContext> => {
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

  return {
    countryCode,
    countryId,
    token: cookieStore.get('token')?.value,
    apiBaseUrl: getInternalApiBaseUrl(),
    clientIp: getClientIp(request),
  };
};

export const buildBackendHeaders = (
  request: NextRequest,
  ctx: DownloadRequestContext,
  accept = 'application/json'
): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: accept,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Forwarded-For': ctx.clientIp,
    'X-Real-IP': ctx.clientIp,
    'X-Country-Code': ctx.countryCode,
    'X-Country-Id': ctx.countryId,
    'Accept-Encoding': 'identity',
    Host: 'api.alemancenter.com',
    Origin: 'https://alemancenter.com',
    Referer: request.headers.get('referer') || 'https://alemancenter.com/',
    'User-Agent': request.headers.get('user-agent') || 'Next.js Download Proxy',
  };

  const apiKey = process.env.FRONTEND_API_KEY;
  if (apiKey) {
    headers['X-Frontend-Key'] = apiKey;
  }

  if (ctx.token) {
    headers.Authorization = `Bearer ${ctx.token}`;
  }

  return headers;
};

const normalizeBackendError = (
  status: number,
  backendError: any
): { message: string; code: string } => {
  const backendCode = backendError?.code || backendError?.data?.code;
  const backendMessage = backendError?.message || backendError?.data?.message;

  if (status === 401) {
    return {
      code: backendCode || 'AUTH_REQUIRED',
      message: backendMessage || 'يرجى تسجيل الدخول أولًا لتحميل الملف.',
    };
  }

  if (status === 403) {
    const lowerCode = String(backendCode || '').toLowerCase();

    if (lowerCode.includes('email')) {
      return {
        code: 'EMAIL_NOT_VERIFIED',
        message: backendMessage || 'يرجى تأكيد البريد الإلكتروني قبل تحميل الملفات.',
      };
    }

    return {
      code: backendCode || 'DOWNLOAD_PERMISSION_REQUIRED',
      message: backendMessage || 'حسابك لا يملك صلاحية تحميل هذا الملف.',
    };
  }

  if (status === 404) {
    return {
      code: backendCode || 'FILE_NOT_FOUND',
      message: backendMessage || 'الملف غير موجود أو لم يعد متاحًا.',
    };
  }

  return {
    code: backendCode || 'DOWNLOAD_PREPARE_FAILED',
    message: backendMessage || 'تعذر تجهيز رابط التحميل حاليًا.',
  };
};

export const requestSignedDownloadUrl = async (
  request: NextRequest,
  fileId: string
): Promise<
  | { ok: true; status: number; token: string; downloadUrl: string }
  | { ok: false; status: number; message: string; code: string }
> => {
  const ctx = await getDownloadRequestContext(request);

  if (!ctx.token) {
    return {
      ok: false,
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'يرجى تسجيل الدخول أولًا لتحميل الملف.',
    };
  }

  const backendUrl = new URL(`${ctx.apiBaseUrl}${API_ENDPOINTS.ARTICLES.DOWNLOAD_URL(fileId)}`);
  backendUrl.searchParams.set('database', ctx.countryCode);
  backendUrl.searchParams.set('countryCode', ctx.countryCode);
  backendUrl.searchParams.set('country_id', ctx.countryId);

  const response = await fetch(backendUrl.toString(), {
    method: 'GET',
    headers: buildBackendHeaders(request, ctx, 'application/json'),
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') || '';
  let backendError: any = null;
  let payload: any = null;

  if (contentType.includes('application/json')) {
    payload = await response.json().catch(() => null);
    if (!response.ok) backendError = payload;
  } else if (!response.ok) {
    const text = await response.text().catch(() => '');
    backendError = { message: text.slice(0, 300) };
  }

  if (!response.ok) {
    const normalized = normalizeBackendError(response.status, backendError);

    console.error('[Download Prepare] Backend refused download token:', {
      status: response.status,
      fileId,
      code: normalized.code,
    });

    return {
      ok: false,
      status: response.status,
      ...normalized,
    };
  }

  const token =
    payload?.data?.token ||
    payload?.token ||
    payload?.data?.download_token ||
    payload?.download_token;

  if (!token || typeof token !== 'string') {
    return {
      ok: false,
      status: 502,
      code: 'INVALID_DOWNLOAD_TOKEN_RESPONSE',
      message: 'استجابة الخادم غير صالحة أثناء تجهيز رابط التحميل.',
    };
  }

  return {
    ok: true,
    status: 200,
    token,
    downloadUrl: `/api/download/signed?token=${encodeURIComponent(token)}`,
  };
};

export const streamSignedDownload = async (
  request: NextRequest,
  token: string
): Promise<NextResponse> => {
  if (!token) {
    return safeDownloadErrorResponse(
      request,
      400,
      'رمز التحميل مطلوب.',
      'DOWNLOAD_TOKEN_REQUIRED'
    );
  }

  const ctx = await getDownloadRequestContext(request);
  const backendUrl = new URL(`${ctx.apiBaseUrl}${API_ENDPOINTS.ARTICLES.SIGNED_DOWNLOAD}`);
  backendUrl.searchParams.set('token', token);

  const requestHeaders = buildBackendHeaders(request, ctx, '*/*');
  delete requestHeaders.Authorization;

  const incomingRange = request.headers.get('range');
  if (incomingRange) {
    requestHeaders.Range = incomingRange;
  }

  const response = await fetch(backendUrl.toString(), {
    method: 'GET',
    headers: requestHeaders,
    cache: 'no-store',
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let backendError: any = null;

    if (contentType.includes('application/json')) {
      backendError = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      backendError = { message: text.slice(0, 300) };
    }

    const normalized = normalizeBackendError(response.status, backendError);

    console.error('[Signed Download Proxy] Backend error:', {
      status: response.status,
      code: normalized.code,
    });

    return safeDownloadErrorResponse(
      request,
      response.status,
      normalized.message,
      normalized.code
    );
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    return safeDownloadErrorResponse(
      request,
      502,
      'الخادم أعاد صفحة HTML بدل الملف المطلوب.',
      'BACKEND_RETURNED_HTML'
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
    responseHeaders.set('Content-Disposition', 'attachment; filename="file"');
  }

  responseHeaders.set('X-Content-Type-Options', 'nosniff');
  responseHeaders.set('Cache-Control', 'private, no-store');

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
};
