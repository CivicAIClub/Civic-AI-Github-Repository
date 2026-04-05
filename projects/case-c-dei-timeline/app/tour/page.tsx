'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

const demoStops = [
  { _id: '1', locationName: 'Clark Memorial Chapel', slug: 'clark-memorial-chapel', quickSummary: 'The heart of community life at Pomfret since 1910. This is where generations of students have shared their stories through the chapel talk tradition.' },
  { _id: '2', locationName: 'School House', slug: 'school-house', quickSummary: 'The original academic building, now housing the humanities department. Its walls have witnessed over a century of learning and growth.' },
  { _id: '3', locationName: 'Centennial Garden', slug: 'centennial-garden', quickSummary: 'Created in 1994 to celebrate Pomfret\'s 100th anniversary. A gathering space designed to reflect the school\'s evolving identity.' },
  { _id: '4', locationName: 'Jahn Rink', slug: 'jahn-rink', quickSummary: 'More than an athletic facility — a place where teamwork transcends differences and community is forged through shared effort.' },
  { _id: '5', locationName: 'Olmsted Observatory', slug: 'olmsted-observatory', quickSummary: 'Connects students to the cosmos and to the universal human experience of wonder, reminding us we all share the same sky.' },
  { _id: '6', locationName: 'Hard Auditorium', slug: 'hard-auditorium', quickSummary: 'The stage where student performances celebrate diverse cultures, traditions, and artistic expressions from around the world.' },
];

export default function TourPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-4">
                Campus Experience
              </div>
              <h1 className="font-display text-section text-navy mb-4">
                Campus Tour
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Scan QR codes around campus to unlock the hidden stories behind our buildings and monuments.
                Each stop connects you to the voices and history that make Pomfret unique.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stylized Campus Map Placeholder */}
      <section className="py-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-cream rounded-2xl p-8 lg:p-12 museum-frame text-center">
            <div className="text-sm text-slate font-body mb-4">
              Interactive Campus Map
            </div>
            <div className="aspect-[16/9] bg-navy/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-4 text-navy/20" aria-hidden="true">
                  <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="24" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
                  <circle cx="40" cy="24" r="3" stroke="currentColor" strokeWidth="2" />
                  <circle cx="32" cy="38" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M24 28L32 38M32 38L40 24" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
                <p className="text-slate/60 font-body text-sm">
                  Illustrated campus map — coming with full content launch
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Stops Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-navy mb-8">Tour Stops</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoStops.map((stop, i) => (
              <ScrollReveal key={stop._id} delay={i * 0.08}>
                <Link
                  href={`/tour/${stop.slug}`}
                  className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-lg transition-all duration-300"
                >
                  {/* Photo placeholder */}
                  <div className="aspect-[16/10] bg-navy/5 flex items-center justify-center relative">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-navy/15" aria-hidden="true">
                      <rect x="4" y="8" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M4 28L14 20L24 28L32 22L36 26" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    </svg>
                    {/* QR icon */}
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
                      {stop.quickSummary}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
