'use client';

import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const campusAerialImage =
  'https://cdn.prod.website-files.com/642ed84f45d23562b5bd2c48/659c1a3e6c745ef8d92134a7_Pomfret%20Hilltop.jpg';

const campusCommunityImage =
  'https://cdn.prod.website-files.com/642ed84f45d23562b5bd2c48/659c1d87ab83c55cd1bbb552_Pomfret%20Wellbeing.jpg';

const hilltopStats = [
  { value: '500', label: 'Acre Campus', detail: 'The Hilltop in its full landscape context.' },
  { value: '120', label: 'Manicured Acres', detail: 'The campus core where paths, quads, and gathering spaces connect.' },
  { value: '350', label: 'Acres of Woods', detail: 'Woods, forests, streams, meadows, and open space around campus.' },
  { value: '18', label: 'Miles of Trails', detail: 'A trail network for walking, running, and exploring the ecosystem.' },
];

const overviewRules = [
  {
    title: 'Use Wide Establishing Views',
    text:
      'Show the shape of the Hilltop from above: chapel, quad, fields, tree lines, paths, and the wider landscape.',
  },
  {
    title: 'Protect Private Spaces',
    text:
      'Avoid dorm interiors, classroom walkthroughs, security-sensitive routes, and any close-up view that identifies students.',
  },
  {
    title: 'Show Community at Scale',
    text:
      'Use distant, wide views of people gathering, moving, playing, or resting so the site communicates life without turning students into subjects.',
  },
  {
    title: 'Pair Past and Present',
    text:
      'Match archival campus photos with current wide shots to show how trees, paths, athletic spaces, and gathering areas have changed.',
  },
];

const thenNowSequence = [
  {
    label: 'Archive View',
    title: 'Then',
    text:
      'Use historic black-and-white campus photos from the archives: the quad, chapel approach, lodge view, rink area, and tree-lined paths.',
  },
  {
    label: 'Current View',
    title: 'Now',
    text:
      'Pair each archive view with a current aerial or wide campus frame, keeping the camera outside buildings and away from identifiable students.',
  },
  {
    label: 'Evolution Note',
    title: 'What Changed',
    text:
      'Add short captions about campus growth: older tree lines, new academic spaces, changing athletic facilities, trails, and future field work.',
  },
];

const mediaTargets = [
  'Aerial overview from above the campus core',
  'Quad and chapel approach from a wide distance',
  'Rink and athletic fields from outside the buildings',
  'Tree-lined paths, stone walls, woods, streams, and trail edges',
];

export default function TourPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="relative min-h-[720px] overflow-hidden bg-pomfret-navy text-warm-white">
        <Image
          src={campusAerialImage}
          alt="Aerial overview of Pomfret School's Hilltop campus"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/80 to-transparent" />

        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 pt-44 pb-20 lg:pt-56">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/tour', label: 'Campus Overview' },
            ]}
            className="mb-12 text-warm-white/70"
          />
          <div className="max-w-4xl">
            <div className="text-[11px] font-body font-bold tracking-[0.28em] uppercase text-maroon-light mb-5">
              The Hilltop From Above
            </div>
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.92] text-warm-white mb-6">
              <span className="font-bold">Campus</span>
              <br />
              <span className="font-normal italic">Overview</span>
            </h1>
            <p className="text-lg lg:text-xl text-warm-white/90 font-body leading-relaxed max-w-2xl">
              A wide-angle view of Pomfret&apos;s 500-acre Hilltop: the landscape,
              gathering places, paths, and changes over time without entering buildings
              or identifying individual students.
            </p>
          </div>
        </div>
      </section>

      <section id="campus-stats" className="scroll-mt-28 bg-cream py-16 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-px overflow-hidden rounded-sm border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
            {hilltopStats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.06}>
                <div className="h-full bg-cream p-6 lg:p-7">
                  <div className="font-display text-5xl text-navy leading-none">{stat.value}</div>
                  <div className="mt-3 text-[11px] font-body font-bold tracking-[0.18em] uppercase text-maroon">
                    {stat.label}
                  </div>
                  <p className="mt-4 text-sm text-slate font-body leading-relaxed">
                    {stat.detail}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="overview-guidelines" className="scroll-mt-28 bg-warm-white py-20 lg:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <ScrollReveal>
              <div>
                <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                  Overview, Not Walkthrough
                </div>
                <h2 className="font-display text-[clamp(2rem,4vw,3.75rem)] leading-[1.05] text-navy">
                  The campus story should feel expansive, not invasive.
                </h2>
                <p className="mt-5 text-base text-slate font-body leading-relaxed">
                  This section should sell the beauty and community of Pomfret without
                  creating a security-sensitive building tour. The camera stays outside,
                  high, and wide.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {overviewRules.map((rule, i) => (
                <ScrollReveal key={rule.title} delay={i * 0.07}>
                  <div className="h-full border-l-2 border-maroon bg-cream px-5 py-5">
                    <h3 className="font-display text-xl text-navy leading-tight">{rule.title}</h3>
                    <p className="mt-3 text-sm text-slate font-body leading-relaxed">
                      {rule.text}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="then-now" className="scroll-mt-28 bg-pomfret-navy py-20 lg:py-28 text-warm-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
            <ScrollReveal>
              <div className="relative min-h-[420px] overflow-hidden rounded-sm">
                <Image
                  src={campusCommunityImage}
                  alt="Wide aerial view of community activity on the Pomfret campus lawn"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="text-[11px] font-body font-bold tracking-[0.22em] uppercase text-maroon-light">
                    Community From a Distance
                  </div>
                  <p className="mt-3 max-w-lg text-sm text-warm-white/85 font-body leading-relaxed">
                    Wide views can show life on the Hilltop while keeping individual students
                    anonymous and the focus on shared space.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="flex h-full flex-col justify-center">
                <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon-light mb-4">
                  Then and Now
                </div>
                <h2 className="font-display text-[clamp(2rem,4vw,3.75rem)] leading-[1.05] text-warm-white">
                  Build the comparison around landscape change.
                </h2>
                <p className="mt-5 text-base text-warm-white/75 font-body leading-relaxed">
                  The strongest version pairs archival images with matched current views,
                  showing how the Hilltop has changed without turning the feature into a
                  route map or building directory.
                </p>
                <div className="mt-8 grid gap-3">
                  {thenNowSequence.map((item) => (
                    <div key={item.label} className="border-t border-warm-white/15 pt-4">
                      <div className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-maroon-light">
                        {item.label}
                      </div>
                      <h3 className="mt-1 font-display text-2xl text-warm-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-warm-white/70 font-body leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="aerial-shot-list" className="scroll-mt-28 bg-cream py-20 lg:py-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                Aerial Shot List
              </div>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy">
                What to request from communications or drone footage.
              </h2>
              <p className="mt-5 text-base text-slate font-body leading-relaxed">
                These are the highest-value shots for the final build. Each one keeps the
                camera outside, elevated, and focused on the campus as a shared landscape.
              </p>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-navy/10 bg-navy/10 md:grid-cols-2 lg:grid-cols-4">
            {mediaTargets.map((target, i) => (
              <ScrollReveal key={target} delay={i * 0.07}>
                <div className="flex h-full min-h-[160px] flex-col justify-between bg-warm-white p-6">
                  <div className="font-display text-sm text-navy/35 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <p className="mt-8 text-base text-navy font-body font-semibold leading-snug">
                    {target}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
