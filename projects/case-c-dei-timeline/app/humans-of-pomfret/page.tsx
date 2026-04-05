'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';

const demoProfiles = [
  { _id: '1', name: 'Elena Vasquez', slug: 'elena-vasquez', role: 'Student', quote: 'Pomfret taught me that my voice is both a gift and a responsibility.', bio: 'Senior from Hartford, CT. President of the Latin American Student Alliance and varsity soccer captain.', yearsAtPomfret: '2022-2026', tags: ['leadership', 'athletics', 'culture'] },
  { _id: '2', name: 'David Kim', slug: 'david-kim', role: 'Faculty', quote: 'Teaching here means learning from every student who walks through my door.', bio: 'Mathematics teacher for 15 years. Founded the STEM Diversity Initiative and mentors first-generation students.', yearsAtPomfret: '2011-present', tags: ['STEM', 'mentorship'] },
  { _id: '3', name: 'Amara Okafor', slug: 'amara-okafor', role: 'Alum', quote: 'The friendships I made at Pomfret crossed every boundary I thought existed.', bio: 'Class of 2019. Now a public health researcher focused on healthcare equity.', yearsAtPomfret: '2015-2019', tags: ['health', 'equity', 'research'] },
  { _id: '4', name: 'Robert Hartley III', slug: 'robert-hartley', role: 'Head of School', quote: 'A school must be brave enough to look in the mirror and honest enough to act on what it sees.', bio: 'Served as Head of School from 1990 to 2005. Oversaw the expansion of financial aid and diversity programs.', yearsAtPomfret: '1990-2005', tags: ['leadership', 'institutional change'] },
  { _id: '5', name: 'Priya Sharma', slug: 'priya-sharma', role: 'Student', quote: 'I found home 8,000 miles from home.', bio: 'Junior from Mumbai, India. Editor of the school literary magazine and debate team captain.', yearsAtPomfret: '2023-2027', tags: ['international', 'writing', 'debate'] },
  { _id: '6', name: 'Coach Margaret Allen', slug: 'margaret-allen', role: 'Staff', quote: 'Every athlete I coach teaches me something about resilience I didn\'t know before.', bio: 'Athletic director and girls\' basketball coach. Champion of Title IX initiatives at Pomfret.', yearsAtPomfret: '2003-present', tags: ['athletics', 'equity', 'Title IX'] },
];

const roles = ['All', 'Student', 'Alum', 'Faculty', 'Staff', 'Head of School'];

export default function HumansOfPomfretPage() {
  const [activeRole, setActiveRole] = useState('All');

  const filtered = demoProfiles.filter(
    (p) => activeRole === 'All' || p.role === activeRole
  );

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-4">
                Portraits & Stories
              </div>
              <h1 className="font-display text-section text-navy mb-4">
                Humans of Pomfret
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Short, powerful profiles celebrating the people who make this community extraordinary.
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
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-all ${
                  activeRole === role ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Heads of School link */}
          <Link
            href="/humans-of-pomfret/heads-of-school"
            className="inline-flex items-center gap-2 mt-3 text-sm text-gold-dark hover:text-gold font-body transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1L13 5V13H1V5L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            View Heads of School Archive
          </Link>
        </div>
      </div>

      {/* Masonry Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((profile, i) => (
                <motion.div
                  key={profile._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="break-inside-avoid"
                >
                  <Link
                    href={`/humans-of-pomfret/${profile.slug}`}
                    className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-xl transition-all duration-500"
                  >
                    {/* Portrait placeholder */}
                    <div className={`relative bg-navy/5 flex items-center justify-center ${
                      i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                    }`}>
                      <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center">
                        <span className="font-display text-2xl text-navy/30">
                          {profile.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-slate">
                        {profile.role}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <blockquote className="font-display text-lg text-navy italic leading-snug mb-3">
                        &ldquo;{profile.quote}&rdquo;
                      </blockquote>
                      <div className="font-body font-semibold text-navy text-sm">
                        {profile.name}
                      </div>
                      <div className="text-xs text-slate font-body">
                        {profile.yearsAtPomfret}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {profile.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-mist text-slate">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
