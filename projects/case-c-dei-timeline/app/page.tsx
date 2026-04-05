'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import WaveformBars from '@/components/ui/WaveformBars';

// --- Hero Section: Three-emotion cinematic reveal ---
function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden texture-grain">
      {/* Background layers - era transition */}
      <div className="absolute inset-0">
        {/* Archival warm base */}
        <div className="absolute inset-0 bg-gradient-to-b from-cream-dark via-linen to-warm-white" />
        {/* Subtle sepia overlay for history feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-maroon/5" />
      </div>

      {/* Decorative timeline line */}
      <motion.div
        className="absolute left-8 lg:left-16 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
      />

      <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text content */}
          <div>
            {/* Era badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy/5 border border-navy/10 mb-8"
            >
              <span className="text-xs font-body tracking-wider uppercase text-navy/60">
                Est. 1894
              </span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span className="text-xs font-body tracking-wider uppercase text-navy/60">
                Pomfret, Connecticut
              </span>
            </motion.div>

            {/* Main heading - three emotional notes */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="font-display text-hero text-navy mb-6"
            >
              Every Voice
              <br />
              <span className="text-maroon">Shapes Our</span>
              <br />
              <span className="text-gold-dark">Story</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-subtitle text-slate max-w-lg mb-8"
            >
              A living archive of diversity, equity, and inclusion at Pomfret School —
              from our founding in 1894 to the voices shaping our community today.
            </motion.p>

            {/* CTA: Audio teaser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                href="/chapel-voices"
                className="group inline-flex items-center gap-3 px-6 py-3.5 bg-navy text-cream rounded-xl hover:bg-navy-light transition-all duration-300 shadow-lg shadow-navy/20 hover:shadow-xl hover:shadow-navy/30"
              >
                <div className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center group-hover:bg-cream/30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor" />
                  </svg>
                </div>
                <span className="font-body font-semibold">Listen to Our Voices</span>
              </Link>

              <Link
                href="/timeline"
                className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-navy/20 text-navy rounded-xl hover:border-navy/40 hover:bg-cream transition-all duration-300 font-body font-semibold"
              >
                Explore the Timeline
              </Link>
            </motion.div>
          </div>

          {/* Right: Visual composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="relative"
          >
            {/* Featured voice card */}
            <div className="relative bg-cream rounded-2xl p-8 museum-frame">
              <div className="absolute -top-3 -left-3 w-20 h-20 border-l-2 border-t-2 border-gold/40 rounded-tl-2xl" />
              <div className="absolute -bottom-3 -right-3 w-20 h-20 border-r-2 border-b-2 border-gold/40 rounded-br-2xl" />

              <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-4">
                Featured Voice
              </div>

              {/* Placeholder for CMS content */}
              <div className="w-20 h-20 rounded-full bg-navy/10 mb-4 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-navy/30" aria-hidden="true">
                  <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
                  <path d="M6 28C6 22.477 10.477 18 16 18C21.523 18 26 22.477 26 28" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>

              <blockquote className="font-display text-xl text-navy italic mb-4 leading-relaxed">
                &ldquo;This is where every story begins — with the courage to speak and the grace to listen.&rdquo;
              </blockquote>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-body font-semibold text-navy text-sm">
                    Chapel Speaker
                  </div>
                  <div className="font-body text-xs text-slate">
                    Featured Voice &middot; Pomfret School
                  </div>
                </div>

                <WaveformBars count={7} className="opacity-60" />
              </div>
            </div>

            {/* Floating stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="absolute -right-4 top-8 bg-white rounded-xl p-4 shadow-lg shadow-navy/5 border border-mist"
            >
              <div className="font-display text-2xl text-navy font-bold">130+</div>
              <div className="text-xs text-slate font-body">Years of History</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="absolute -left-4 bottom-8 bg-white rounded-xl p-4 shadow-lg shadow-navy/5 border border-mist"
            >
              <div className="font-display text-2xl text-maroon font-bold">30+</div>
              <div className="text-xs text-slate font-body">Chapel Voices</div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-navy/20 flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-navy/40" />
        </div>
      </motion.div>
    </section>
  );
}

// --- Section Highlights ---
function HighlightsSection() {
  const highlights = [
    {
      href: '/timeline',
      title: 'Interactive Timeline',
      description:
        'Explore the milestones, voices, and turning points that shaped diversity at Pomfret from 1890 to today.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M4 14H24M4 14L8 10M4 14L8 18M24 14L20 10M24 14L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="14" cy="14" r="2" fill="currentColor" />
        </svg>
      ),
      color: 'text-navy',
      bgColor: 'bg-navy/5',
    },
    {
      href: '/chapel-voices',
      title: 'Chapel Voices',
      description:
        'A digital museum preserving the powerful speeches of students, alumni, and guests in the chapel tradition.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <path d="M14 4V20M14 4C11 4 6 6 6 10V20C6 16 11 14 14 14M14 4C17 4 22 6 22 10V20C22 16 17 14 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10 24H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: 'text-maroon',
      bgColor: 'bg-maroon/5',
    },
    {
      href: '/humans-of-pomfret',
      title: 'Humans of Pomfret',
      description:
        'Meet the people who make this community extraordinary — students, faculty, alumni, and leaders.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
          <circle cx="18" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M4 22C4 18 6.5 16 10 16C11.5 16 12.8 16.4 14 17.2C15.2 16.4 16.5 16 18 16C21.5 16 24 18 24 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      color: 'text-gold-dark',
      bgColor: 'bg-gold/5',
    },
    {
      href: '/tour',
      title: 'Campus Tour',
      description:
        'Scan QR codes on campus to unlock the hidden stories behind our buildings and monuments.',
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="16" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="4" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
          <rect x="18" y="18" width="4" height="4" rx="0.5" fill="currentColor" />
        </svg>
      ),
      color: 'text-navy',
      bgColor: 'bg-navy/5',
    },
  ];

  return (
    <section className="py-section bg-warm-white">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-section text-navy mb-4">
              Explore Our Living Archive
            </h2>
            <p className="text-lg text-slate max-w-2xl mx-auto font-body">
              Six interconnected exhibits celebrating the people, voices, and history
              that define our commitment to diversity, equity, and inclusion.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, i) => (
            <ScrollReveal key={item.href} delay={i * 0.1}>
              <Link
                href={item.href}
                className="group block p-6 rounded-2xl bg-cream hover:bg-cream-dark border border-transparent hover:border-mist transition-all duration-300 h-full"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <h3 className="font-display text-lg text-navy mb-2 group-hover:text-maroon transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate font-body leading-relaxed">
                  {item.description}
                </p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- Mission Statement ---
function MissionSection() {
  return (
    <section className="py-section bg-navy texture-grain">
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-px bg-gold mx-auto mb-8" />
            <blockquote className="font-display text-2xl sm:text-3xl lg:text-4xl text-cream leading-relaxed mb-8">
              &ldquo;A school&apos;s truest measure is not the stories it tells about itself,
              but the voices it chooses to amplify.&rdquo;
            </blockquote>
            <div className="w-16 h-px bg-gold mx-auto mb-8" />
            <p className="text-cream/60 font-body text-lg">
              The Pomfret School DEI Department is committed to building a community
              where every voice matters and every story is honored.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

// --- Homepage ---
export default function Home() {
  return (
    <>
      <HeroSection />
      <HighlightsSection />
      <MissionSection />
    </>
  );
}
