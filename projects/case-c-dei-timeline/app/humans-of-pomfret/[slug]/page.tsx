'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const demoProfile = {
  name: 'Elena Vasquez',
  role: 'Student',
  quote: 'Pomfret taught me that my voice is both a gift and a responsibility.',
  bio: 'Elena is a senior from Hartford, Connecticut. She serves as President of the Latin American Student Alliance and is varsity soccer captain. Through her leadership, she has organized cultural celebrations that bring the entire school community together.',
  yearsAtPomfret: '2022-2026',
  tags: ['leadership', 'athletics', 'culture'],
};

export default function ProfilePage() {
  const profile = demoProfile;

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="py-16 lg:py-24">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/humans-of-pomfret"
            className="inline-flex items-center gap-2 text-slate hover:text-navy text-sm font-body mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back to Humans of Pomfret
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="aspect-[3/4] bg-cream rounded-2xl museum-frame flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-navy/10 flex items-center justify-center">
                  <span className="font-display text-4xl text-navy/30">
                    {profile.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-2">
                {profile.role} &middot; {profile.yearsAtPomfret}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-navy mb-6">
                {profile.name}
              </h1>

              <blockquote className="border-l-4 border-gold pl-6 py-2 mb-8">
                <p className="font-display text-2xl text-navy italic leading-relaxed">
                  &ldquo;{profile.quote}&rdquo;
                </p>
              </blockquote>

              <p className="text-lg text-slate font-body leading-relaxed mb-8">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-cream text-slate text-sm font-body">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
