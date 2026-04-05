'use client';

import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

const demoHeads = [
  { name: 'William E. Peck', years: '1894-1910', bio: 'Founded Pomfret School with a vision of education rooted in character, community, and the belief that every young person deserves the chance to grow.' },
  { name: 'Rev. William L. Breed', years: '1910-1928', bio: 'Expanded the school\'s academic programs and deepened its spiritual foundation during a period of significant national change.' },
  { name: 'Hallam L. Movius', years: '1928-1950', bio: 'Guided Pomfret through the Great Depression and World War II, maintaining the school\'s commitment to developing well-rounded citizens.' },
  { name: 'Dexter K. Strong', years: '1950-1968', bio: 'Modernized the campus and curriculum during the post-war era, laying groundwork for the school\'s evolution.' },
  { name: 'S. Gerard Dunning', years: '1968-1985', bio: 'Oversaw the transition to coeducation and the beginning of intentional diversity recruitment efforts.' },
  { name: 'Robert Brace', years: '1985-2000', bio: 'Championed financial aid expansion and international programs, broadening the school\'s demographic reach significantly.' },
  { name: 'Bradford P. Hastings', years: '2000-2015', bio: 'Established the formal DEI infrastructure and made diversity a strategic institutional priority.' },
  { name: 'Timothy Richards', years: '2015-present', bio: 'Continues to advance Pomfret\'s commitment to inclusion, equity, and authentic representation in all aspects of school life.' },
];

export default function HeadsOfSchoolPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-navy texture-grain">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/humans-of-pomfret"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm font-body mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back to Humans of Pomfret
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-gold/60" />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-gold/80">
              Leadership Archive
            </span>
          </div>
          <h1 className="font-display text-section text-cream mb-4">
            Heads of School
          </h1>
          <p className="text-lg text-cream/70 max-w-2xl font-body">
            The leaders who shaped Pomfret School across 130 years of history.
          </p>
        </div>
      </section>

      {/* Timeline of Heads */}
      <section className="py-12 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold via-navy/20 to-maroon/30" />
            <div className="space-y-12">
              {demoHeads.map((head, i) => (
                <ScrollReveal key={head.name} delay={i * 0.08}>
                  <div className="relative pl-16">
                    <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-gold border-2 border-warm-white" />
                    <div className="bg-cream rounded-2xl p-6 museum-frame">
                      <div className="text-sm font-body text-gold-dark mb-1">{head.years}</div>
                      <h2 className="font-display text-2xl text-navy mb-2">{head.name}</h2>
                      <p className="text-slate font-body leading-relaxed">{head.bio}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
