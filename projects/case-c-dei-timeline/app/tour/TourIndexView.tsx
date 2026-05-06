'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { tourStops } from '@/lib/data/tour-stops';

export default function TourPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header — bold editorial hero matching the timeline / archive pages.
          Layered cream + linen texture base, an architectural compass-rose
          motif at the right edge as a subtle "campus tour" visual hook. */}
      <section className="relative overflow-hidden py-20 lg:py-32 bg-cream texture-linen">
        {/* Decorative compass / map-style motif on the right side. SVG so it
            scales cleanly and stays on-brand (maroon ink at 8% opacity). */}
        <svg
          className="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 w-[480px] h-[480px] text-maroon/[0.08] pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="74" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="56" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="38" stroke="currentColor" strokeWidth="0.5" />
          <line x1="100" y1="8" x2="100" y2="192" stroke="currentColor" strokeWidth="0.5" />
          <line x1="8" y1="100" x2="192" y2="100" stroke="currentColor" strokeWidth="0.5" />
          {/* Cardinal points — N E S W as small ticks */}
          <text x="100" y="6" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="serif">N</text>
          <text x="194" y="103" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="serif">E</text>
          <text x="100" y="200" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="serif">S</text>
          <text x="6" y="103" textAnchor="middle" fontSize="6" fill="currentColor" fontFamily="serif">W</text>
          {/* Compass needle pointing northeast — subtle pop of brand red */}
          <path d="M100 100 L130 70 L100 80 Z" fill="currentColor" />
          <path d="M100 100 L70 130 L100 120 Z" stroke="currentColor" strokeWidth="0.5" />
          {/* Small dotted location markers across the rose */}
          <circle cx="65" cy="60" r="2.5" fill="currentColor" />
          <circle cx="140" cy="55" r="2.5" fill="currentColor" />
          <circle cx="135" cy="140" r="2.5" fill="currentColor" />
          <circle cx="55" cy="135" r="2.5" fill="currentColor" />
        </svg>

        <div className="relative max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/tour', label: 'Campus Tour' },
            ]}
            className="mb-8"
          />
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                Walk the Hilltop
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-6">
                <span className="font-bold">Campus</span>{' '}
                <span className="text-pomfret-gray">Tour</span>
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed mb-6 max-w-2xl">
                Scan QR codes posted at {tourStops.length} locations on campus to unlock the
                hidden stories behind our buildings and monuments &mdash; the names, the
                decisions, the voices that built the Pomfret you walk through today.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-body text-slate/80">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="8" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="1" y="8" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>{tourStops.length} stops</span>
                </div>
                <span className="text-mist">&middot;</span>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M7 1V7L11 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                  <span>~25 min walk</span>
                </div>
                <span className="text-mist">&middot;</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold tracking-wider">EN</span>
                  <span className="text-mist">/</span>
                  <span className="font-semibold tracking-wider">ES</span>
                  <span>&middot; bilingual</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tour Stops Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-navy mb-8">Tour Stops</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourStops.map((stop, i) => (
              <ScrollReveal key={stop._id} delay={i * 0.08}>
                <Link
                  href={`/tour/${stop.slug}`}
                  className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-lg transition-all duration-300 p-6 relative"
                >
                  {/* QR icon — stays as a tour-stop indicator, not a photo placeholder */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-warm-white rounded-lg flex items-center justify-center border border-mist">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-navy" aria-hidden="true">
                      <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="10" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="1" y="10" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
                    </svg>
                  </div>

                  <h3 className="font-display text-lg text-navy mb-2 group-hover:text-maroon transition-colors pr-10">
                    {stop.locationName}
                  </h3>
                  <p className="text-sm text-slate font-body leading-relaxed line-clamp-3">
                    {stop.quickSummary.en}
                  </p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
