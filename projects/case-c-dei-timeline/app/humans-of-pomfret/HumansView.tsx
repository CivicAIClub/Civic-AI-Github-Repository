'use client';

import { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { profiles } from '@/lib/data/profiles';

const roles = ['All', 'Alum', 'Faculty'];

export default function HumansOfPomfretPage() {
  const [activeRole, setActiveRole] = useState('All');

  const filtered = profiles.filter(
    (p) => activeRole === 'All' || p.role === activeRole
  );

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="pt-10 lg:pt-14 pb-16 lg:pb-24 bg-cream">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
            ]}
            className="mb-8"
          />
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                Portraits &amp; Stories
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
                <span className="font-bold">Humans</span>{' '}
                <span className="text-pomfret-gray">of Pomfret</span>
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Real people from Pomfret&apos;s history — trailblazers, pioneers, and quiet
                agents of change drawn directly from the pages of{' '}
                <em>Pomfret in the Civil Rights Era</em> (Fall 2005) and{' '}
                <em>Mission Accomplished: 35 Years of Coeducation</em> (September 2003).
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
            {roles.map((role) => (
              <button
                key={role}
                role="tab"
                aria-selected={activeRole === role}
                onClick={() => setActiveRole(role)}
                className={`min-h-[44px] px-4 py-2.5 rounded-full text-sm font-body transition-all ${
                  activeRole === role ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Cross-links */}
          <div className="flex flex-wrap gap-4 mt-3">
            <Link
              href="/humans-of-pomfret/heads-of-school"
              className="inline-flex items-center gap-2 text-sm text-maroon hover:text-maroon-dark font-body transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L13 5V13H1V5L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Heads of School Archive
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-sm text-maroon hover:text-maroon-dark font-body transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1.5" y="2" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 5H10M4 7H10M4 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Magazine Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((profile, i) => (
                <m.div
                  key={profile._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: (i % 9) * 0.05 }}
                  className="break-inside-avoid"
                >
                  <Link
                    href={`/humans-of-pomfret/${profile.slug}`}
                    className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-xl transition-all duration-500"
                  >
                    {/* Portrait */}
                    {profile.image ? (
                      <div className="relative aspect-[3/4] bg-navy/5 overflow-hidden">
                        <Image
                          src={profile.image}
                          alt={`Portrait of ${profile.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-slate">
                          {profile.role}
                          {profile.classYear && <> &middot; {profile.classYear}</>}
                        </div>
                      </div>
                    ) : (
                      <div className={`relative bg-navy/5 flex items-center justify-center ${
                        i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                      }`}>
                        <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center">
                          <span className="font-display text-2xl text-navy/30">
                            {profile.name
                              .replace(/^(Dr\.|Lt\. Col\.) /, '')
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-slate">
                          {profile.role}
                          {profile.classYear && <> &middot; {profile.classYear}</>}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <blockquote className="font-display text-lg text-navy italic leading-snug mb-3">
                        {profile.quote.length > 160
                          ? profile.quote.slice(0, 160).trim() + '..."'
                          : profile.quote}
                      </blockquote>
                      <div className="font-body font-semibold text-navy text-sm">
                        {profile.name}
                      </div>
                      <div className="text-xs text-slate font-body">
                        {profile.yearsAtPomfret}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {profile.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-mist text-slate">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
