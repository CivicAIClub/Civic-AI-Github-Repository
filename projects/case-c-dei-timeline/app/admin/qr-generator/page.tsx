import type { Metadata } from 'next';
import QRGeneratorView from './QRGeneratorView';
import { logoutAction } from '@/app/admin/logout/actions';

// Admin tool: not indexed by search engines. Auth is enforced in middleware.ts
// via session cookie; the form below provides an explicit sign-out path so
// admins aren't stuck waiting for the 8-hour session TTL to expire.
export const metadata: Metadata = {
  title: 'QR Generator · Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function QRGeneratorPage() {
  return (
    <>
      {/* Sign-out strip — small, top-right, never shown to public visitors
          because middleware blocks them upstream. */}
      <div className="bg-navy/5 border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
          <span className="text-[11px] font-body font-semibold tracking-[0.2em] uppercase text-slate">
            Admin Session
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-body text-slate hover:text-maroon transition-colors"
            >
              Sign out →
            </button>
          </form>
        </div>
      </div>
      <QRGeneratorView />
    </>
  );
}
