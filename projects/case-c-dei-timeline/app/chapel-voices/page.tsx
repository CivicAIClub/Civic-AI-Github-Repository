'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import WaveformBars from '@/components/ui/WaveformBars';

// Demo data — in production, fetched from Sanity CMS
const demoSpeakers = [
  { _id: '1', name: 'Maya Thompson', slug: 'maya-thompson', role: 'Student', graduationYear: 2024, bio: 'A senior passionate about social justice and poetry. Maya\'s chapel talk explored the intersection of identity and belonging.', themes: ['Identity', 'Belonging'], speechDate: '2024-02-15', featured: true },
  { _id: '2', name: 'Dr. James Walker', slug: 'james-walker', role: 'Faculty', bio: 'History teacher and advisor to the DEI committee. His talk traced the arc of civil rights through personal family narratives.', themes: ['Justice', 'Heritage'], speechDate: '2023-11-08', featured: false },
  { _id: '3', name: 'Sarah Chen', slug: 'sarah-chen', role: 'Alum', graduationYear: 2018, bio: 'Pomfret alum and community organizer. Sarah returned to campus to share how her Pomfret experience shaped her commitment to service.', themes: ['Community', 'Growth'], speechDate: '2023-09-20', featured: false },
  { _id: '4', name: 'Marcus Rivera', slug: 'marcus-rivera', role: 'Student', graduationYear: 2025, bio: 'A junior whose chapel talk about cultural heritage moved the community to tears. Marcus shared stories passed down through three generations.', themes: ['Heritage', 'Identity', 'Change'], speechDate: '2024-01-22', featured: false },
  { _id: '5', name: 'Dr. Patricia Owens', slug: 'patricia-owens', role: 'Guest Speaker', bio: 'Author and educator specializing in restorative justice. Her visit sparked a school-wide conversation about accountability and healing.', themes: ['Justice', 'Change', 'Community'], speechDate: '2023-05-14', featured: false },
  { _id: '6', name: 'Aisha Patel', slug: 'aisha-patel', role: 'Student', graduationYear: 2023, bio: 'Aisha\'s chapel talk about navigating multiple cultural identities became one of the most-discussed speeches of the year.', themes: ['Identity', 'Belonging', 'Growth'], speechDate: '2023-03-07', featured: false },
];

const allThemes = ['Identity', 'Belonging', 'Justice', 'Heritage', 'Growth', 'Community', 'Change'];

const themeColors: Record<string, string> = {
  Identity: 'bg-navy/10 text-navy',
  Belonging: 'bg-maroon/10 text-maroon',
  Justice: 'bg-gold/10 text-gold-dark',
  Heritage: 'bg-amber/10 text-amber',
  Growth: 'bg-navy-light/10 text-navy-light',
  Community: 'bg-maroon-light/10 text-maroon-light',
  Change: 'bg-gold-dark/10 text-gold-dark',
};

export default function ChapelVoicesPage() {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = demoSpeakers.filter((s) => {
    const matchTheme = !activeTheme || s.themes.includes(activeTheme);
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTheme && matchSearch;
  });

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Museum Header */}
      <section className="relative py-20 lg:py-32 bg-navy texture-grain overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark/50 to-navy/80" />
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold/60" />
              <span className="text-xs font-body tracking-[0.3em] uppercase text-gold/80">
                Digital Museum
              </span>
              <div className="w-12 h-px bg-gold/60" />
            </div>
            <h1 className="font-display text-section text-cream mb-4">
              Chapel Voices
            </h1>
            <p className="text-lg text-cream/70 max-w-2xl mx-auto font-body">
              A permanent archive of the powerful speeches delivered in the Pomfret School chapel.
              Every voice preserved. Every story honored.
            </p>
          </motion.div>

          {/* Decorative waveform */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8 gap-1"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gold/30 rounded-full"
                style={{
                  height: `${Math.sin(i * 0.5) * 16 + 20}px`,
                }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <label htmlFor="speaker-search" className="sr-only">Search speakers</label>
              <input
                id="speaker-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search speakers, themes..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-mist bg-cream text-navy placeholder:text-slate/50 font-body focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate/50" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Theme filters */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by theme">
              <button
                role="tab"
                aria-selected={activeTheme === null}
                onClick={() => setActiveTheme(null)}
                className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
                  activeTheme === null ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                All
              </button>
              {allThemes.map((theme) => (
                <button
                  key={theme}
                  role="tab"
                  aria-selected={activeTheme === theme}
                  onClick={() => setActiveTheme(activeTheme === theme ? null : theme)}
                  className={`px-3 py-1 rounded-full text-xs font-body transition-all ${
                    activeTheme === theme ? 'bg-navy text-cream' : `${themeColors[theme]} hover:opacity-80`
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid — Museum exhibit style */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((speaker, i) => (
                <motion.div
                  key={speaker._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link
                    href={`/chapel-voices/${speaker.slug}`}
                    className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-xl transition-all duration-500"
                  >
                    {/* Speaker portrait placeholder */}
                    <div className="relative aspect-[4/3] bg-navy/5 flex items-center justify-center overflow-hidden">
                      <div className="w-24 h-24 rounded-full bg-navy/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-navy/20" aria-hidden="true">
                          <circle cx="20" cy="15" r="6" stroke="currentColor" strokeWidth="2" />
                          <path d="M8 35C8 28 13 23 20 23C27 23 32 28 32 35" stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>

                      {/* Museum placard overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent p-4 pt-12">
                        <div className="flex items-center gap-2">
                          <WaveformBars count={5} color="bg-gold" className="opacity-60" />
                          <span className="text-xs text-cream/60 font-body">Tap to listen</span>
                        </div>
                      </div>

                      {/* Featured badge */}
                      {speaker.featured && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gold/90 text-navy-dark text-xs font-body font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-display text-xl text-navy mb-1 group-hover:text-maroon transition-colors">
                        {speaker.name}
                      </h3>
                      <div className="text-sm text-slate font-body mb-3">
                        {speaker.role}
                        {speaker.graduationYear && ` '${String(speaker.graduationYear).slice(2)}`}
                        {speaker.speechDate && ` \u00B7 ${new Date(speaker.speechDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                      </div>
                      <p className="text-sm text-slate/80 font-body leading-relaxed mb-4 line-clamp-2">
                        {speaker.bio}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {speaker.themes.map((theme) => (
                          <span key={theme} className={`text-xs px-2 py-0.5 rounded-full ${themeColors[theme]}`}>
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-lg text-slate font-body">
                No speakers found. Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
