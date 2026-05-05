'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { tourStops, TOUR_LAUNCHED } from './tour-stops';

export default function TourPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-xs font-body tracking-wider uppercase text-maroon mb-4">
                Campus Experience
              </div>
              <h1 className="font-display text-section text-navy mb-4">Campus Tour</h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Scan QR codes around campus to unlock the hidden stories behind our buildings and
                monuments. Each stop connects you to the voices and history that make Pomfret unique.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {!TOUR_LAUNCHED ? (
        <ComingSoonNotice />
      ) : (
        <>
          {/* Tour Stops Grid */}
          <section className="py-12 lg:py-20">
            <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl text-navy mb-8">Tour Stops</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tourStops.map((stop, i) => (
                  <ScrollReveal key={stop._id} delay={i * 0.08}>
                    <Link
                      href={`/tour/${stop.slug}`}
                      className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-lg transition-all duration-300"
                    >
                      <div className="aspect-[16/10] bg-navy/5 flex items-center justify-center relative">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-navy/15" aria-hidden="true">
                          <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
                          <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                          <path d="M4 28L14 20L24 28L32 22L36 26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                        </svg>
                        <div className="absolute top-3 right-3 w-8 h-8 bg-warm-white/90 rounded-lg flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-navy" aria-hidden="true">
                            <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="10" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="1" y="10" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg text-navy mb-2 group-hover:text-maroon transition-colors">
                          {stop.locationName}
                        </h3>
                        <p className="text-sm text-slate font-body leading-relaxed line-clamp-3">
                          {stop.quickSummary.en}
                        </p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ComingSoonNotice() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream rounded-2xl p-10 lg:p-12 museum-frame text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-maroon/10 mb-6">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-maroon" aria-hidden="true">
              <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
              <path d="M14 8V14L18 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-xs font-body tracking-wider uppercase text-maroon mb-3">
            Coming Soon
          </div>
          <h2 className="font-display text-3xl text-navy mb-4">
            Campus Tour is in final review
          </h2>
          <p className="text-slate font-body leading-relaxed mb-6">
            The bilingual self-guided tour is currently undergoing a privacy and security review with
            the school before its public release. QR codes and walking routes will go live across
            campus once that review is complete.
          </p>
          <p className="text-sm text-slate/80 font-body italic">
            Questions about the tour?{' '}
            <a href="mailto:dei@pomfret.org" className="text-maroon hover:text-maroon-dark underline underline-offset-2">
              Reach out to the DEI Office
            </a>
            .
          </p>
          <div className="mt-8 pt-6 border-t border-mist text-left">
            <div className="text-xs font-body tracking-wider uppercase text-pomfret-gray mb-3">
              Preview the planned stops
            </div>
            <ul className="space-y-2">
              {tourStops.map((stop) => (
                <li key={stop._id} className="text-sm text-slate font-body">
                  · {stop.locationName}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
