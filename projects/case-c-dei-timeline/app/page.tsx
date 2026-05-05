'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import SectionHeading from '@/components/layout/SectionHeading';

// =================================================================
// SECTION 1: HERO — pomfret.org-style auto-advancing slideshow
// =================================================================
const heroSlides = [
  {
    id: 0,
    headline: 'A Living Archive of',
    accent: 'Every Voice',
    subtitle: 'Exploring more than a century of diversity, equity, and inclusion at Pomfret School.',
    gradient: 'from-pomfret-navy via-navy to-maroon-dark',
  },
  {
    id: 1,
    headline: 'Every Story',
    accent: 'Matters Here',
    subtitle: 'Since 1894, the voices that shape our community have shaped our mission.',
    gradient: 'from-maroon-dark via-pomfret-navy to-navy',
  },
  {
    id: 2,
    headline: 'More Than',
    accent: 'Four Decades',
    subtitle: 'Of diversity, integration, and intentional inclusion on the Hilltop.',
    gradient: 'from-navy via-pomfret-navy to-maroon',
  },
  {
    id: 3,
    headline: 'Change Makers.',
    accent: 'Problem Solvers.',
    subtitle: 'The people, programs, and milestones that define the Pomfret we are becoming.',
    gradient: 'from-pomfret-navy via-maroon-dark to-navy',
  },
];

function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = heroSlides[active];

  return (
    <section
      className="relative h-[100vh] min-h-[620px] flex items-center justify-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide backgrounds — cross-fade between gradients with Ken Burns zoom */}
      {heroSlides.map((s, i) => (
        <motion.div
          key={s.id}
          initial={false}
          animate={{
            opacity: i === active ? 1 : 0,
            scale: i === active ? 1.05 : 1,
          }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeInOut' },
            scale: { duration: 8, ease: 'linear' },
          }}
          className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`}
        />
      ))}

      {/* Subtle grain overlay for archival feel */}
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />
      {/* Darken bottom for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />

      {/* Carousel navigation arrows */}
      <button
        onClick={() => setActive((i) => (i - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white hover:bg-warm-white/10 transition-all flex items-center justify-center z-20"
        aria-label="Previous slide"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        onClick={() => setActive((i) => (i + 1) % heroSlides.length)}
        className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white hover:bg-warm-white/10 transition-all flex items-center justify-center z-20"
        aria-label="Next slide"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Centered headline — swaps with slide */}
      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.div
          key={`kicker-${slide.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-px bg-maroon-light" />
            <span className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-warm-white/90">
              Est. 1894 &middot; Pomfret, Connecticut
            </span>
            <div className="w-12 h-px bg-maroon-light" />
          </div>
        </motion.div>

        <motion.h1
          key={`headline-${slide.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] text-warm-white mb-6"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {slide.headline}
          <br />
          <span className="italic font-normal">{slide.accent}</span>
        </motion.h1>

        <motion.p
          key={`subtitle-${slide.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg lg:text-xl text-warm-white/90 max-w-2xl mx-auto font-body font-light"
          style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
        >
          {slide.subtitle}
        </motion.p>
      </div>

      {/* Play/Pause control */}
      <button
        onClick={() => setPaused((p) => !p)}
        className="absolute bottom-8 right-8 lg:right-12 z-20 w-9 h-9 rounded-full border border-warm-white/30 text-warm-white/70 hover:text-warm-white hover:border-warm-white transition-all flex items-center justify-center"
        aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
      >
        {paused ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M3 2v8l7-4-7-4z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="3" height="8" />
            <rect x="6" y="1" width="3" height="8" />
          </svg>
        )}
      </button>

      {/* Carousel indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {heroSlides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`transition-all h-0.5 ${
              i === active ? 'w-10 bg-warm-white' : 'w-2 bg-warm-white/40 hover:bg-warm-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// =================================================================
// SECTION 2: MISSION STATEMENT — Centered single-column text
// =================================================================
function MissionSection() {
  return (
    <section className="py-20 lg:py-28 bg-warm-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <ScrollReveal>
          <div className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-maroon mb-6">
            Our Mission
          </div>
          <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] text-navy mb-6">
            <span className="font-bold">A school&apos;s truest measure</span>{' '}
            <span className="font-normal text-pomfret-gray">is not the stories it tells about itself, but the voices it chooses to amplify.</span>
          </h2>
          <div className="w-12 h-0.5 bg-maroon mx-auto mb-6" />
          <p className="text-base text-slate font-body leading-relaxed max-w-2xl mx-auto">
            Founded in 1894, Pomfret School has spent more than a century evolving its
            commitment to an inclusive community. This archive preserves the milestones,
            the voices, and the ongoing work of building a place where every student belongs.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 3: SIGNATURE EXHIBITS — 4-column card grid with images
// =================================================================
function SignatureExhibits() {
  const exhibits = [
    {
      href: '/timeline',
      category: 'Interactive',
      title: 'The DEI Timeline',
      meta: '132 Years · 41 Events',
      description: 'From founding in 1894 to today — explore the milestones that shaped diversity at Pomfret.',
    },
    {
      href: '/humans-of-pomfret',
      category: 'Portraits',
      title: 'Humans of Pomfret',
      meta: 'Students · Alumni · Faculty',
      description: 'Short, powerful profiles celebrating the people who make this community extraordinary.',
    },
    {
      href: '/archive',
      category: 'Magazines',
      title: 'Magazine Archive',
      meta: '2 Issues · 41 Pages',
      description: 'Original Pomfret Magazine issues preserving the school\'s DEI history in its own voice.',
    },
    {
      href: '/tour',
      category: 'Campus',
      title: 'Campus Tour',
      meta: 'Scan · Learn · Connect',
      description: 'QR-powered audio guides unlocking the stories behind our buildings and monuments.',
    },
    {
      href: '/ai-bias',
      category: 'Ethics',
      title: 'AI Bias Awareness',
      meta: 'Education · Transparency',
      description: 'How AI perpetuates bias in representation — and what Pomfret is doing about it.',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="mb-16">
            <SectionHeading bold="Signature" rest="Exhibits" />
            <p className="mt-4 text-base text-slate font-body max-w-2xl">
              Five interconnected archives, exhibits, and educational modules that make the living archive.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-navy/10 rounded-sm overflow-hidden border border-navy/10">
          {exhibits.map((exhibit, i) => (
            <ScrollReveal key={exhibit.href} delay={i * 0.08}>
              <Link
                href={exhibit.href}
                className="group flex flex-col h-full bg-cream hover:bg-warm-white transition-colors duration-300 p-6 lg:p-7 min-h-[280px]"
              >
                {/* Category tag + number */}
                <div className="flex items-baseline justify-between mb-8">
                  <span className="text-[10px] font-body tracking-[0.25em] uppercase text-maroon font-semibold">
                    {exhibit.category}
                  </span>
                  <span className="font-display text-xs text-navy/30 tabular-nums">
                    {String(i + 1).padStart(2, '0')} / {String(exhibits.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl lg:text-[1.6rem] text-navy mb-3 group-hover:text-maroon transition-colors leading-[1.15]">
                  {exhibit.title}
                </h3>

                <div className="text-[11px] font-body text-slate/70 uppercase tracking-wider mb-4">
                  {exhibit.meta}
                </div>

                <p className="text-sm text-slate font-body leading-relaxed mb-6 flex-1">
                  {exhibit.description}
                </p>

                {/* Arrow CTA */}
                <span className="inline-flex items-center gap-2 text-sm font-body font-semibold text-maroon group-hover:gap-3 transition-all mt-auto">
                  Explore
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 4: REMARKABLE VOICES — 6-column carousel of profiles
// =================================================================
function RemarkableVoices() {
  const voices = [
    {
      name: 'John Irick',
      year: "'65",
      quote: 'First African American graduate',
      href: '/humans-of-pomfret/john-irick',
      image: '/archive/portraits/john-irick-1965.jpg',
      bg: 'bg-navy',
    },
    {
      name: 'Naomi Vega',
      year: "'69",
      quote: 'First female graduate',
      href: '/humans-of-pomfret/naomi-vega',
      image: '/archive/portraits/naomi-vega.jpg',
      bg: 'bg-maroon',
    },
    {
      name: 'Michael Gary',
      year: "'82",
      quote: 'First Director of Multicultural Affairs',
      href: '/timeline',
      image: null,
      bg: 'bg-navy/80',
    },
    {
      name: 'Heather Willis Daly',
      year: '2024',
      quote: 'First female Head of School',
      href: '/humans-of-pomfret/heads-of-school',
      image: '/heads/heather-willis-daly.jpg',
      bg: 'bg-maroon-dark',
    },
    {
      name: 'Dr. Coretta McCarter',
      year: 'Today',
      quote: 'Dean of DEI',
      href: '/timeline',
      image: null,
      bg: 'bg-navy',
    },
    {
      name: 'VOICE',
      year: '1984',
      quote: 'Multicultural student leadership',
      href: '/timeline',
      image: null,
      bg: 'bg-maroon',
    },
  ];

  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector('[data-voice-card]') as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : 240;
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  return (
    <section className="py-24 lg:py-32 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <SectionHeading bold="Remarkable" rest="Voices" />
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => scroll('prev')}
                className="w-12 h-12 rounded-full border border-navy/20 text-navy/60 hover:text-navy hover:border-navy transition-all flex items-center justify-center"
                aria-label="Scroll voices left"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={() => scroll('next')}
                className="w-12 h-12 rounded-full border border-navy/20 text-navy/60 hover:text-navy hover:border-navy transition-all flex items-center justify-center"
                aria-label="Scroll voices right"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </ScrollReveal>

        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-6 lg:overflow-visible"
        >
          {voices.map((voice, i) => (
            <ScrollReveal key={voice.name} delay={i * 0.08} className="snap-start shrink-0 w-[60%] sm:w-[40%] lg:w-auto">
              <Link
                href={voice.href}
                data-voice-card
                className="group block"
              >
                <div className={`aspect-[3/4] ${voice.bg} rounded-sm overflow-hidden relative mb-4 group-hover:scale-[1.02] transition-transform`}>
                  {voice.image ? (
                    <Image
                      src={voice.image}
                      alt={`Portrait of ${voice.name}`}
                      fill
                      sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 16vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-display text-3xl text-warm-white/40">
                        {voice.name
                          .replace(/^Dr\.\s/, '')
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-xs text-warm-white/80 font-body">{voice.year}</div>
                  </div>
                </div>
                <h4 className="font-display text-lg text-navy leading-tight mb-1 group-hover:text-maroon transition-colors">
                  {voice.name}
                </h4>
                <p className="text-xs text-slate font-body leading-snug">{voice.quote}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 5: LATEST STORIES — Blog feed style
// =================================================================
function LatestStories() {
  const stories = [
    {
      href: '/timeline',
      category: 'Milestone',
      author: 'The Archive',
      date: 'January 21, 2026',
      title: 'A Day On for Justice: MLK Programming Brings Community Together',
      excerpt: 'Dr. Coretta McCarter led a full day of student workshops on civil rights, policy, and social justice.',
      image: '/archive/portraits/trailblazers-banner.jpg',
    },
    {
      href: '/humans-of-pomfret/heads-of-school',
      category: 'Leadership',
      author: 'Pomfret School',
      date: 'October 1, 2024',
      title: 'First Female Head of School Appointed in 130-Year History',
      excerpt: 'Heather Willis Daly becomes the 13th Head of School — and the first woman to hold the role.',
      image: '/heads/heather-willis-daly.jpg',
    },
    {
      href: '/timeline',
      category: 'Student Voices',
      author: 'The Archive',
      date: 'June 1, 2020',
      title: '@BlackAtPomfret: When Students Told Their Stories',
      excerpt: "How the racial reckoning of 2020 reshaped Pomfret's approach to accountability and inclusion.",
      image: '/archive/portraits/original-six-banner.jpg',
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-16 gap-6">
            <SectionHeading bold="Pomfret" rest="Stories" />
            <Link href="/timeline" className="text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon hover:text-maroon-dark inline-flex items-center gap-2">
              View All Stories
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {stories.map((story, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <Link href={story.href} className="group block">
                <article>
                  <div className="aspect-[16/10] rounded-sm mb-6 relative overflow-hidden bg-navy/10">
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-body text-slate/70 uppercase tracking-wider mb-3">
                    <span className="text-maroon font-semibold">{story.category}</span>
                    <span>&middot;</span>
                    <span>{story.author}</span>
                    <span>&middot;</span>
                    <span>{story.date}</span>
                  </div>
                  <h3 className="font-display text-2xl text-navy mb-3 group-hover:text-maroon transition-colors leading-tight">
                    {story.title}
                  </h3>
                  <p className="text-slate font-body leading-relaxed">{story.excerpt}</p>
                </article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// =================================================================
// SECTION 6: IMAGE GALLERY — Thumbnail grid
// =================================================================
function ImageGallery() {
  const images = [
    {
      src: '/archive/portraits/john-irick-1965.jpg',
      alt: 'John Irick, 1965 — first African American graduate of Pomfret School',
      caption: 'John Irick \'65 — first African American graduate',
      ratio: 'aspect-[4/5]',
    },
    {
      src: '/archive/portraits/1964-basketball-team.jpg',
      alt: '1964 Pomfret basketball team',
      caption: '1964 Pomfret basketball team',
      ratio: 'aspect-[4/3]',
    },
    {
      src: '/archive/portraits/naomi-vega.jpg',
      alt: 'Naomi Vega \'69 — first female graduate of Pomfret',
      caption: 'Naomi Vega \'69 — first female graduate',
      ratio: 'aspect-square',
    },
    {
      src: '/archive/portraits/first-girls-soccer.jpg',
      alt: "First girls' soccer team at Pomfret, fall 1968",
      caption: "First girls' soccer team, fall 1968",
      ratio: 'aspect-[4/5]',
    },
    {
      src: '/archive/portraits/original-six-banner.jpg',
      alt: 'The Original Six — first six female boarders at Pomfret, 1968',
      caption: 'The Original Six, 1968',
      ratio: 'aspect-[4/3]',
    },
    {
      src: '/archive/portraits/1964-dorm-naacp.jpg',
      alt: '1964 dormitory NAACP poster at Pomfret',
      caption: 'NAACP poster in a 1964 dorm',
      ratio: 'aspect-square',
    },
    {
      src: '/archive/portraits/trailblazers-banner.jpg',
      alt: 'Pomfret trailblazers banner',
      caption: 'Pomfret trailblazers',
      ratio: 'aspect-[4/5]',
    },
    {
      src: '/archive/portraits/class-heritage-1897-2003.jpg',
      alt: 'Class heritage at Pomfret, 1897-2003',
      caption: 'Class heritage, 1897–2003',
      ratio: 'aspect-[4/3]',
    },
  ];

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIdx, images.length]);

  return (
    <section className="py-24 lg:py-32 bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <SectionHeading bold="Through" rest="the Years" align="center" />
            <p className="mt-4 text-sm text-slate font-body italic">
              Click any image to enlarge — use ← → to navigate, Esc to close
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {images.map((img, i) => (
            <ScrollReveal key={img.src} delay={i * 0.05}>
              <button
                onClick={() => setLightboxIdx(i)}
                className={`${img.ratio} w-full bg-navy/5 rounded-sm overflow-hidden hover:opacity-90 transition-opacity relative group`}
                aria-label={`Enlarge: ${img.caption}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-warm-white/30 backdrop-blur-sm flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-warm-white">
                      <path d="M3 8H13M8 3V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-warm-white font-body line-clamp-2 text-left">
                    {img.caption}
                  </p>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIdx(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 lg:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(null);
              }}
              className="absolute top-4 right-4 lg:top-8 lg:right-8 w-12 h-12 rounded-full bg-warm-white/10 hover:bg-warm-white/20 text-warm-white flex items-center justify-center transition-colors z-10"
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
              }}
              className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-warm-white/10 hover:bg-warm-white/20 text-warm-white flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12 5L7 10L12 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
              }}
              className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-warm-white/10 hover:bg-warm-white/20 text-warm-white flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <motion.div
              key={lightboxIdx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            >
              <div className="relative w-full flex-1 min-h-0">
                <Image
                  src={images[lightboxIdx].src}
                  alt={images[lightboxIdx].alt}
                  width={1600}
                  height={1200}
                  className="object-contain w-full h-auto max-h-[80vh] rounded-sm"
                  priority
                />
              </div>
              <p className="mt-4 text-center text-sm text-warm-white/90 font-body">
                {images[lightboxIdx].caption}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// =================================================================
// HOMEPAGE
// =================================================================
export default function Home() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <SignatureExhibits />
      <RemarkableVoices />
      <LatestStories />
      <ImageGallery />
    </>
  );
}
