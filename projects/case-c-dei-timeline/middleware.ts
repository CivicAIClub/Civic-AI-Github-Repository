import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

/**
 * Admin auth middleware.
 *
 * Replaces the previous HTTP basic-auth scheme (which had three audited
 * vulnerabilities: timing-attackable string equality on plaintext creds,
 * plaintext password storage, and no rate limiting / lockout).
 *
 * The new design splits auth into two layers:
 *
 *   - **This middleware (edge runtime)**: cheap, cookie-based session check
 *     on every `/admin/*` request that isn't itself the login form. The
 *     session token is HMAC-SHA256-signed by `lib/auth.ts`, so verification
 *     is a single Web Crypto operation — no DB lookup, no bcrypt.
 *
 *   - **Login Server Action (`app/admin/login/actions.ts`, Node runtime)**:
 *     bcrypt-verifies the password against `ADMIN_PASSWORD_HASH`, rate-limits
 *     by client IP via `lib/rate-limit.ts` (Vercel KV when configured;
 *     in-memory fallback otherwise), then issues a session cookie.
 *
 * Public surface from the middleware's perspective:
 *   - `/admin/login`   → ALWAYS allowed (the form lives here)
 *   - `/admin/logout`  → ALWAYS allowed (the action clears the cookie)
 *   - `/admin/*` (other) → require a valid session cookie, else redirect
 *     to `/admin/login`
 *
 * Fail-closed posture: if `SESSION_SECRET` is missing or the verifier
 * throws, return 503. Better to break the admin tool than to silently
 * accept an unverifiable cookie.
 */

// Paths under /admin that don't require a session (login form + logout).
const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/admin/logout']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Login + logout pages must be reachable without a session cookie.
  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Read the session cookie and verify its HMAC signature.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let session: Awaited<ReturnType<typeof verifySessionToken>> = null;
  try {
    session = await verifySessionToken(token);
  } catch (err) {
    // SESSION_SECRET unset, or verifier blew up. Fail closed — never want
    // a missing-secret path to default to "allow." 503 makes the operator
    // fix the env var rather than ship a footgun.
    return new NextResponse(
      'Admin auth is not configured. Set SESSION_SECRET, ADMIN_USERNAME, ' +
        'and ADMIN_PASSWORD_HASH in env (see .env.example).',
      { status: 503 }
    );
  }

  if (!session) {
    // Bounce to login. Preserve the originally-requested path so we could
    // round-trip back after success (currently the login action always
    // sends to /admin/qr-generator, but the query param is ready when we
    // expand the admin surface).
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only intercept admin paths; let everything else through with no overhead.
export const config = {
  matcher: ['/admin/:path*'],
};
