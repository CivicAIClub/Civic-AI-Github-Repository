import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginAction } from './actions';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: { index: false, follow: false },
};

// Render-side error mapping. The Server Action only returns generic codes;
// the page maps them to user-visible copy here so we can change the wording
// without re-shipping the action.
const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'Invalid username or password.',
  'rate-limit':
    'Too many sign-in attempts. Please wait 15 minutes and try again.',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // If the operator is already signed in, skip the form and send them along.
  // This makes the URL `/admin/login` safe to bookmark — it just bounces.
  const existing = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(existing);
  if (session) redirect('/admin/qr-generator');

  const errorMessage = searchParams.error
    ? ERROR_MESSAGES[searchParams.error] ?? 'Sign-in failed. Please try again.'
    : null;

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-cream rounded-2xl border border-mist p-8 lg:p-10">
          <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-3">
            Admin Sign In
          </div>
          <h1 className="font-display text-2xl lg:text-3xl text-navy leading-tight mb-2">
            <span className="font-bold">Pomfret</span>{' '}
            <span className="text-pomfret-gray">Admin</span>
          </h1>
          <p className="text-sm text-slate font-body mb-6">
            Restricted to the Pomfret DEI Department. If you reached this page
            by accident, return to{' '}
            <a href="/" className="text-maroon hover:underline">
              the public site
            </a>
            .
          </p>

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-maroon/30 bg-maroon/5 px-4 py-3 text-sm text-maroon-dark font-body"
            >
              {errorMessage}
            </div>
          )}

          <form action={loginAction} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-body font-semibold tracking-wider uppercase text-slate mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                spellCheck={false}
                className="w-full px-3 py-2.5 rounded-lg border border-mist bg-warm-white text-navy font-body focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-body font-semibold tracking-wider uppercase text-slate mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-mist bg-warm-white text-navy font-body focus:outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              />
            </div>
            <button
              type="submit"
              className="w-full min-h-[44px] px-5 py-2.5 rounded-lg bg-maroon text-warm-white font-body font-semibold tracking-wider uppercase text-sm hover:bg-maroon-dark transition-colors"
            >
              Sign In
            </button>
          </form>

          <p className="text-[11px] text-slate/70 font-body mt-6 leading-relaxed">
            Sessions expire after 8 hours. After five failed attempts your IP
            is rate-limited for 15 minutes.
          </p>
        </div>
      </div>
    </div>
  );
}
