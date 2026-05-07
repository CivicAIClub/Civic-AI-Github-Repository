/**
 * Admin auth — session-cookie utilities.
 *
 * Two pieces:
 *   1. Password verification (bcrypt, constant-time). Used by the login
 *      Server Action; runs in the Node runtime where bcryptjs is fine.
 *   2. Session signing / verification (HMAC-SHA256 over a tiny payload).
 *      Used by both the Server Action (sign in → set cookie) and the
 *      edge middleware (read cookie → verify on every admin request).
 *      Uses Web Crypto so it works in both runtimes.
 *
 * Sessions are stateless: the cookie itself carries `username|expires|sig`.
 * No DB lookups, no KV reads — middleware verifies the HMAC on the edge.
 * Tradeoff: revoking a session requires rotating SESSION_SECRET. For an
 * admin tool with one or two users, that's an acceptable cost.
 */

const SESSION_TTL_HOURS = 8;
export const SESSION_COOKIE_NAME = 'pomfret_admin_session';

// ────────────────────────────────────────────────────────────────────
// Env access — fail closed if anything required is missing.
// ────────────────────────────────────────────────────────────────────

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is not set or is shorter than 32 characters. ' +
        'Generate one with: openssl rand -base64 48'
    );
  }
  return secret;
}

// ────────────────────────────────────────────────────────────────────
// Web Crypto helpers (work in both edge middleware and Node runtime).
// ────────────────────────────────────────────────────────────────────

const encoder = new TextEncoder();

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.byteLength; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(b64: string): Uint8Array {
  // Restore padding stripped by base64url encoding.
  const pad = b64.length % 4 === 0 ? 0 : 4 - (b64.length % 4);
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const bin = atob(normalized);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Constant-time comparison — bytes-equal without short-circuiting.
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ────────────────────────────────────────────────────────────────────
// Session token: `username|expiresAtIso|HMAC(username|expiresAtIso)`
// All three pieces are URL-safe base64 of UTF-8 / signature bytes.
// ────────────────────────────────────────────────────────────────────

export type SessionPayload = { username: string; expiresAt: number };

export async function createSessionToken(username: string): Promise<string> {
  const secret = getSessionSecret();
  const expiresAt = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;

  const usernameB64 = bytesToBase64Url(encoder.encode(username));
  const expiryB64 = bytesToBase64Url(encoder.encode(String(expiresAt)));
  const payload = `${usernameB64}.${expiryB64}`;

  const key = await getKey(secret);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const sigB64 = bytesToBase64Url(sigBuf);

  return `${payload}.${sigB64}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [usernameB64, expiryB64, sigB64] = parts;

  const secret = getSessionSecret();
  const key = await getKey(secret);

  // Re-sign the payload under our key, then constant-time compare against
  // the signature in the cookie. Anything else is a forgery / wrong secret.
  const expected = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, encoder.encode(`${usernameB64}.${expiryB64}`))
  );
  const provided = base64UrlToBytes(sigB64);
  if (!timingSafeEqual(expected, provided)) return null;

  // Signature OK → trust the payload. Decode and check expiry.
  const username = new TextDecoder().decode(base64UrlToBytes(usernameB64));
  const expiresAt = Number(new TextDecoder().decode(base64UrlToBytes(expiryB64)));
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  return { username, expiresAt };
}

// ────────────────────────────────────────────────────────────────────
// Cookie attributes.
//
// We set Secure only in production so local `npm run dev` over http://
// can still authenticate; in production HSTS + Secure prevent any HTTP
// transmission of the session cookie.
// ────────────────────────────────────────────────────────────────────

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_HOURS * 60 * 60, // seconds
  };
}
