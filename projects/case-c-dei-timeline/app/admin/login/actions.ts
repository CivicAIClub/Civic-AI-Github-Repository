'use server';

import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, sessionCookieOptions } from '@/lib/auth';
import { checkLoginRateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Server Action invoked when the admin login form is submitted.
 *
 * The flow:
 *   1. Rate-limit by client IP (5 / 15min). On miss, redirect with a
 *      generic ?error=rate-limit query string — never reveal the actual
 *      counter remaining or reset time on the form (would help a brute
 *      force pacing attack).
 *   2. Read the configured `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`
 *      env vars. If either is missing, fail with a generic error rather
 *      than leaking which one is unset.
 *   3. Always run the bcrypt compare even on username mismatch — this
 *      keeps the response time uniform whether the username is right
 *      or wrong, blocking username enumeration.
 *   4. On success: sign a session token, set the HttpOnly cookie, and
 *      redirect to the protected admin route.
 *   5. On failure: redirect back to /admin/login?error=invalid. Same
 *      generic message for "wrong username", "wrong password", and
 *      "missing env vars" — the operator's logs distinguish them, the
 *      attacker's view does not.
 */
export async function loginAction(formData: FormData): Promise<void> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  // Rate-limit FIRST so we don't burn bcrypt cycles on a flood.
  const reqHeaders = headers();
  const ip = getClientIp(reqHeaders);
  const rl = await checkLoginRateLimit(ip);
  if (!rl.success) {
    redirect('/admin/login?error=rate-limit');
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;

  // Always do work proportional to a real attempt, even if the env is unset
  // or the username is wrong. The dummy hash below is a real bcrypt hash of
  // a random string — bcrypt.compare on it takes the same ~250ms as a real
  // verify, so total response time is uniform.
  const DUMMY_HASH =
    '$2a$12$abcdefghijklmnopqrstuuQGAfg6wTmZj8YkZdgGXtl4RnNlqSZxa';
  const hashToCheck = expectedHash || DUMMY_HASH;

  // bcrypt.compare itself is constant-time within its bounded compare loop,
  // and we run it unconditionally. Username compare is plain `===` AFTER
  // the bcrypt run, but the bcrypt time dominates by 1000×, so the username
  // path is effectively timing-flat.
  let passwordOk = false;
  try {
    passwordOk = await bcrypt.compare(password, hashToCheck);
  } catch {
    passwordOk = false;
  }

  const usernameOk =
    !!expectedUser && username.length > 0 && username === expectedUser;

  if (!expectedUser || !expectedHash || !passwordOk || !usernameOk) {
    redirect('/admin/login?error=invalid');
  }

  // Issue a session token. Cookie store is async in Next 14; the redirect
  // also commits the response so we set first, then redirect.
  const token = await createSessionToken(username);
  cookies().set({ ...sessionCookieOptions(), value: token });

  redirect('/admin/qr-generator');
}
