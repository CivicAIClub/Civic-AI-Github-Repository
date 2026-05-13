import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <div className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-maroon mb-4">
          Error 404
        </div>
        <h1 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-navy mb-6">
          <span className="font-bold">Page</span>{' '}
          <span className="font-normal text-pomfret-gray">Not Found</span>
        </h1>
        <p className="text-lg text-slate font-body leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist in this archive. Maybe it was moved,
          maybe the link is stale, or maybe we haven&apos;t written that chapter yet.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-warm-white bg-maroon hover:bg-maroon-dark transition-colors rounded-sm"
          >
            Return Home
          </Link>
          <Link
            href="/timeline"
            className="inline-flex items-center gap-2 px-6 py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon border border-maroon hover:bg-maroon hover:text-warm-white transition-colors rounded-sm"
          >
            Browse the Timeline
          </Link>
        </div>
      </div>
    </div>
  );
}
