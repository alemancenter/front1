import { NextRequest, NextResponse } from 'next/server';

const ACCESS_COOKIE = 'token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE = 60 * 60 * 24;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7;

// All parameter names the backend might use for the JWT token
const TOKEN_PARAM_NAMES = ['token', 'access_token', 'auth_token', 'bearer'];
const REFRESH_PARAM_NAMES = ['refresh_token', 'refreshToken', 'refresh'];

function isValidToken(val: string | null | undefined): val is string {
  return typeof val === 'string' && val.length >= 20 && val.length <= 4096;
}

function isSecureRequest(request: NextRequest): boolean {
  const proto = request.headers.get('x-forwarded-proto');
  return request.nextUrl.protocol === 'https:' || proto === 'https' || process.env.NODE_ENV === 'production';
}

/**
 * GET /api/auth/oauth/google
 *
 * This route is the recommended OAuth redirect target for the Go backend.
 * Configure the backend's "after OAuth" redirect to:
 *   https://alemancenter.com/api/auth/oauth/google?token=JWT&refresh_token=RT
 *
 * The route stores the tokens in HttpOnly cookies (server-side, never exposed to JS)
 * and then redirects the user to /auth/google/callback for the normal session flow.
 *
 * The frontend callback page calls restoreFromSession() which reads the cookie
 * stored here, loads user data, and completes the login.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const errorParam = searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(
      new URL('/login?error=google_auth_failed', request.url)
    );
  }

  // Find token among all possible param names
  let token: string | null = null;
  for (const name of TOKEN_PARAM_NAMES) {
    const val = searchParams.get(name);
    if (isValidToken(val)) {
      token = val;
      break;
    }
  }

  // Find refresh token
  let refreshToken: string | null = null;
  for (const name of REFRESH_PARAM_NAMES) {
    const val = searchParams.get(name);
    if (isValidToken(val)) {
      refreshToken = val;
      break;
    }
  }

  // No token found — fall back to the callback page which will try restoreFromSession()
  if (!token) {
    return NextResponse.redirect(new URL('/auth/google/callback', request.url));
  }

  const isSecure = isSecureRequest(request);
  const cookieBase = {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax' as const,
    path: '/',
  };

  // Redirect to the frontend callback page AFTER setting the cookies.
  // The callback page will call restoreFromSession() → read the cookie → complete login.
  const redirectUrl = new URL('/auth/google/callback', request.url);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set({ name: ACCESS_COOKIE, value: token, ...cookieBase, maxAge: ACCESS_MAX_AGE });

  if (refreshToken) {
    response.cookies.set({ name: REFRESH_COOKIE, value: refreshToken, ...cookieBase, maxAge: REFRESH_MAX_AGE });
  }

  return response;
}
