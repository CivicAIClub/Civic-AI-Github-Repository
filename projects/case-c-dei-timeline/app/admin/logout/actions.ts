'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

/**
 * Server Action: clear the admin session cookie and bounce back to the
 * login page. Intentionally does NOT confirm anything — basic auth has
 * no native logout, and we don't want a "logged out!" toast that an
 * attacker could use to verify a session was active.
 */
export async function logoutAction(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/admin/login');
}
