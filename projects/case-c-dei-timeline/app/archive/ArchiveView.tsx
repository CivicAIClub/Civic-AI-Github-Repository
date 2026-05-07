'use client';

import Link from 'next/link';
import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const magazines = [
  {
    slug: 'civil-rights-era',
    title: 'Pomfret in the Civil Rights Era',
    subtitle: 'More Than Four Decades of Diversity',
    date: 'Fall 2005',
    cover: '/archive/portraits/john-irick-2005.jpg',
    pageCount: 14,
    editor: 'By Elizabeth Lake',
    summary:
      'The Fall 2005 Pomfret Bulletin/Magazine issue, featuring John Irick \'65 on the front, is a wonderful tribute and record of diversity at Pomfret. The issue traces the arrival of the "first four" African Americans in 1964, the founding of the Afro-Latin Society in 1968, the story of Ugandan Frank Mwine \'61, the SPHERE program, and the founding of VOICE in 1984.',
  },
  {
    slug: 'mission-accomplished',
    title: 'Mission Accomplished',
    subtitle: 'Pomfret School Celebrates 35 Years of Coeducation',
    date: 'September 2003',
    cover: '/archive/portraits/mission-accomplished-cover.jpg',
    pageCount: 27,
    editor: 'Edited by Sharon Gaudreau · Research/Text by Linda J. Colangelo · Design by Good Design',
    summary:
      'A commemorative issue marking 35 years since Pomfret admitted its first female day students in 1968. The magazine profiles the trailblazers who as girls arrived at Pomfret with some curiosity, a few curlers, and a lot of courage — from first faculty daughter Joan Strong Buell \'50 to first female graduate Naomi Vega \'69, the Original Six of \'68, and first female recipient of the Pomfret Bowl Jessica Birdsall \'77.',
  },
];

export default function ArchivePage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/archive', label: 'Magazine Archive' },
            ]}
            className="mb-8"
          />
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                The Archive
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
                <span className="font-bold">Magazine</span>{' '}
                <span className="text-pomfret-gray">Archive</span>
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Original archival issues of <em>Pomfret Magazine</em> preserving the school&apos;s
                diversity, equity, and inclusion history in the voices of the people who lived it.
                Click any issue to browse its pages in full.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Magazine list */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {magazines.map((mag, i) => (
              <ScrollReveal key={mag.slug} delay={i * 0.1}>
                <Link
                  href={`/archive/${mag.slug}`}
                  className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-navy/5">
                    <Image
                      src={mag.cover}
                      alt={`Cover of ${mag.title} (${mag.date})`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-warm-white/95 text-xs font-body tracking-wider uppercase text-maroon font-semibold">
                      {mag.date}
                    </div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="text-xs font-body tracking-wider uppercase text-maroon mb-2">
                      Pomfret Magazine &middot; {mag.pageCount} pages
                    </div>
                    <h2 className="font-display text-2xl lg:text-3xl text-navy mb-2 group-hover:text-maroon transition-colors leading-tight">
                      {mag.title}
                    </h2>
                    <div className="font-display text-lg text-slate italic mb-4">
                      {mag.subtitle}
                    </div>
                    <p className="text-sm text-slate font-body leading-relaxed mb-4">
                      {mag.summary}
                    </p>
                    <div className="text-xs text-slate/70 font-body italic mb-4">
                      {mag.editor}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-maroon group-hover:gap-3 transition-all">
                      Browse the issue
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Credits */}
      <section className="py-16 border-t border-mist bg-cream">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-xs font-body tracking-[0.3em] uppercase text-maroon mb-4">
            About the Archive
          </div>
          <p className="text-sm text-slate font-body leading-relaxed">
            These issues of <em>Pomfret Magazine</em> were preserved and shared by the Pomfret
            School Fact Archive department. Every page is reproduced here in its original form
            for research and public access.
          </p>
        </div>
      </section>
    </div>
  );
}
