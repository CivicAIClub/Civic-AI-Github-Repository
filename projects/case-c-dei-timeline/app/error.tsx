'use client';

// Global error boundary for app-router routes.
// Next.js requires this to be a client component and to accept `error` + `reset` props.

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: when a Sentry / logging provider is wired, send `error` here.
    // eslint-disable-next-line no-console
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <div className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-maroon mb-4">
          Something Went Wrong
        </div>
        <h1 className="font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] text-navy mb-6">
          <span className="font-bold">An unexpected</span>{' '}
          <span className="font-normal text-pomfret-gray">error occurred.</span>
        </h1>
        <p className="text-lg text-slate font-body leading-relaxed mb-4">
          We&apos;ve logged the problem. You can try loading this page again, or return home.
        </p>
        {error.digest && (
          <p className="text-xs text-slate/60 font-mono mb-8">
            Error reference: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-warm-white bg-maroon hover:bg-maroon-dark transition-colors rounded-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon border border-maroon hover:bg-maroon hover:text-warm-white transition-colors rounded-sm"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
