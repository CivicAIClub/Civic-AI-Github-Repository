'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProfileBySlug } from '../profiles';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function ProfilePage({ params }: { params: { slug: string } }) {
  const profile = getProfileBySlug(params.slug);

  if (!profile) {
    notFound();
  }

  const initials = profile.name
    .replace(/^(Dr\.|Lt\. Col\.|B\.) /, '')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="pt-10 lg:pt-14 pb-8 bg-cream">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
              { href: `/humans-of-pomfret/${profile.slug}`, label: profile.name },
            ]}
          />
        </div>
      </section>

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

          <div className="grid lg:grid-cols-[2fr_3fr] gap-12 items-start">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              {profile.image ? (
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden museum-frame bg-navy/5">
                  <Image
                    src={profile.image}
                    alt={`Portrait of ${profile.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[3/4] bg-cream rounded-2xl museum-frame flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-navy/10 flex items-center justify-center">
                    <span className="font-display text-4xl text-navy/30">{initials}</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-xs font-body tracking-wider uppercase text-maroon mb-2">
                {profile.role}
                {profile.classYear && <> &middot; Class of {profile.classYear}</>}
                {' · '}
                {profile.yearsAtPomfret}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-navy mb-6">
                {profile.name}
              </h1>

              <blockquote className="border-l-4 border-maroon pl-6 py-2 mb-8">
                <p className="font-display text-2xl text-navy italic leading-relaxed">
                  {profile.quote}
                </p>
              </blockquote>

              <p className="text-lg text-slate font-body leading-relaxed mb-8 whitespace-pre-line">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-2 mb-10">
                {profile.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-cream text-slate text-sm font-body"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="border-t border-mist pt-6">
                <div className="text-xs font-body tracking-wider uppercase text-pomfret-gray mb-1">
                  Source
                </div>
                <p className="text-sm text-slate font-body italic">
                  Drawn from <span className="not-italic font-semibold">{profile.source}</span>.{' '}
                  <Link href="/archive" className="text-maroon hover:text-maroon-dark underline underline-offset-2">
                    Read the magazine →
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
