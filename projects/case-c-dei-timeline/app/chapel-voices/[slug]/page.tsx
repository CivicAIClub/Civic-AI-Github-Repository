'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import WaveformBars from '@/components/ui/WaveformBars';

// In production, fetched from Sanity via chapelSpeakerBySlugQuery
const demoSpeaker = {
  name: 'Maya Thompson',
  role: 'Student',
  graduationYear: 2024,
  bio: 'A senior passionate about social justice and poetry. Maya\'s chapel talk explored the intersection of identity and belonging at Pomfret, drawing from her experience as a first-generation boarding school student.',
  themes: ['Identity', 'Belonging'],
  speechDate: '2024-02-15',
  transcriptExcerpt: 'When I first arrived at Pomfret, I carried two worlds inside me — the one I grew up in and the one I was stepping into. For a long time, I thought I had to choose. It took three years and this community to realize that both worlds could exist together, and that the space between them is where I found my voice.',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  relatedSpeakers: [
    { name: 'Aisha Patel', slug: 'aisha-patel', themes: ['Identity', 'Belonging'] },
    { name: 'Marcus Rivera', slug: 'marcus-rivera', themes: ['Heritage', 'Identity'] },
  ],
};

export default function ChapelSpeakerPage() {
  const speaker = demoSpeaker;

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header with museum exhibit feel */}
      <section className="relative py-16 lg:py-24 bg-navy texture-grain">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/40 to-navy/90" />
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/chapel-voices"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm font-body mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back to Chapel Voices
          </Link>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center lg:justify-start"
            >
              <div className="w-48 h-48 rounded-full bg-cream/10 border-2 border-gold/30 flex items-center justify-center">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-cream/20" aria-hidden="true">
                  <circle cx="32" cy="24" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 56C12 44 20 36 32 36C44 36 52 44 52 56" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {speaker.themes.map((theme) => (
                  <span key={theme} className="text-xs px-3 py-1 rounded-full bg-cream/10 text-cream/80">
                    {theme}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-cream mb-2">
                {speaker.name}
              </h1>
              <div className="text-cream/60 font-body mb-4">
                {speaker.role}
                {speaker.graduationYear && `, Class of ${speaker.graduationYear}`}
                {' \u00B7 '}
                {new Date(speaker.speechDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <p className="text-cream/80 font-body leading-relaxed max-w-2xl">
                {speaker.bio}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Audio/Video Player */}
              <div className="bg-cream rounded-2xl p-6 museum-frame">
                <div className="flex items-center gap-3 mb-4">
                  <WaveformBars count={9} color="bg-navy" />
                  <span className="text-sm text-slate font-body">Chapel Speech Recording</span>
                </div>
                {/* YouTube embed placeholder */}
                <div className="aspect-video bg-navy/5 rounded-xl flex items-center justify-center">
                  <button
                    className="group flex items-center gap-3 px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors"
                    aria-label={`Play ${speaker.name}'s chapel speech`}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 3L17 10L5 17V3Z" fill="currentColor" />
                    </svg>
                    <span className="font-body font-semibold">Play Chapel Speech</span>
                  </button>
                </div>
              </div>

              {/* Transcript Excerpt */}
              <div>
                <h2 className="font-display text-2xl text-navy mb-4">From the Speech</h2>
                <blockquote className="border-l-4 border-gold pl-6 py-2">
                  <p className="font-body text-lg text-slate leading-relaxed italic">
                    &ldquo;{speaker.transcriptExcerpt}&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Related speakers */}
              <div className="bg-cream rounded-2xl p-6">
                <h3 className="font-display text-lg text-navy mb-4">Related Voices</h3>
                <div className="space-y-3">
                  {speaker.relatedSpeakers.map((rs) => (
                    <Link
                      key={rs.slug}
                      href={`/chapel-voices/${rs.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream-dark transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex-shrink-0 flex items-center justify-center">
                        <span className="text-xs text-navy font-display font-bold">
                          {rs.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-body font-semibold text-navy text-sm">{rs.name}</div>
                        <div className="text-xs text-slate">{rs.themes.join(', ')}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
