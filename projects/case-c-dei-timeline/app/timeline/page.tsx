'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Demo data — in production, fetched from Sanity CMS
const demoEvents = [
  { _id: '1', title: 'Pomfret School Founded', date: '1894-01-01', category: 'Milestones', description: 'William E. Peck founds the Pomfret School in Pomfret, Connecticut, establishing a vision for education rooted in character and community.', featured: true },
  { _id: '2', title: 'First Diverse Student Body Initiatives', date: '1920-09-01', category: 'Policy Changes', description: 'Early efforts to broaden the school\'s reach beyond its traditional New England base begin to take shape.', featured: false },
  { _id: '3', title: 'Chapel Talk Tradition Begins', date: '1935-03-15', category: 'Cultural Events', description: 'The tradition of student-led chapel talks becomes a cornerstone of Pomfret\'s community life, giving every student a platform.', featured: true },
  { _id: '4', title: 'Civil Rights Era Response', date: '1964-06-01', category: 'Milestones', description: 'Pomfret School responds to the civil rights movement with renewed commitment to access and inclusion in admissions and curriculum.', featured: true },
  { _id: '5', title: 'International Student Program Expands', date: '1978-09-01', category: 'People', description: 'A significant expansion of the international student program brings new perspectives and cultural richness to campus.', featured: false },
  { _id: '6', title: 'Multicultural Affairs Office Established', date: '1995-01-15', category: 'Leadership', description: 'The creation of a dedicated office signals the institution\'s commitment to supporting diverse student experiences.', featured: true },
  { _id: '7', title: 'DEI Department Founded', date: '2010-08-01', category: 'Leadership', description: 'Pomfret establishes a formal Diversity, Equity, and Inclusion department, integrating DEI work into every aspect of school life.', featured: true },
  { _id: '8', title: 'Student Affinity Groups Launch', date: '2015-09-01', category: 'Student Voices', description: 'Student-led affinity groups provide spaces for identity exploration, solidarity, and community building.', featured: false },
  { _id: '9', title: 'Chapel Voices Digital Archive', date: '2024-01-01', category: 'Cultural Events', description: 'The launch of the digital archive preserves decades of powerful chapel speeches for future generations.', featured: true },
];

const categories = ['All', 'Milestones', 'People', 'Policy Changes', 'Student Voices', 'Cultural Events', 'Leadership'];

const categoryColors: Record<string, string> = {
  Milestones: 'bg-navy text-cream',
  People: 'bg-maroon text-cream',
  'Policy Changes': 'bg-gold-dark text-cream',
  'Student Voices': 'bg-maroon-light text-cream',
  'Cultural Events': 'bg-navy-light text-cream',
  Leadership: 'bg-gold text-navy-dark',
};

function getEraStyle(year: number) {
  if (year < 1920) return { bg: 'bg-cream-dark', border: 'border-gold/40', sepia: true };
  if (year < 1950) return { bg: 'bg-linen', border: 'border-gold/30', sepia: true };
  if (year < 1980) return { bg: 'bg-cream', border: 'border-navy/20', sepia: false };
  if (year < 2010) return { bg: 'bg-warm-white', border: 'border-navy/15', sepia: false };
  return { bg: 'bg-white', border: 'border-navy/10', sepia: false };
}

export default function TimelinePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [startYear, setStartYear] = useState(1890);
  const [endYear, setEndYear] = useState(2026);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = demoEvents.filter((event) => {
    const year = new Date(event.date).getFullYear();
    const matchCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchRange = year >= startYear && year <= endYear;
    return matchCategory && matchRange;
  });

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-4">
                Interactive Timeline
              </div>
              <h1 className="font-display text-section text-navy mb-4">
                The Arc of Inclusion
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Explore the milestones, voices, and turning points that shaped diversity,
                equity, and inclusion at Pomfret School — from 1890 to today.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filter Controls */}
      <div className="sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-navy text-cream shadow-sm'
                    : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Career span selector */}
          <div className="flex items-center gap-4 text-sm font-body text-slate">
            <span className="hidden sm:inline">Career Span:</span>
            <div className="flex items-center gap-2">
              <label htmlFor="start-year" className="sr-only">Start year</label>
              <input
                id="start-year"
                type="number"
                min={1890}
                max={2026}
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-mist bg-cream text-navy text-center"
              />
              <span>to</span>
              <label htmlFor="end-year" className="sr-only">End year</label>
              <input
                id="end-year"
                type="number"
                min={1890}
                max={2026}
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-mist bg-cream text-navy text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline — Desktop: Horizontal, Mobile: Vertical */}
      {/* Desktop Horizontal */}
      <div className="hidden lg:block overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-x-auto py-16 px-8"
          role="region"
          aria-label="Diversity timeline"
          tabIndex={0}
        >
          <div className="relative min-w-max flex items-start gap-0">
            {/* Timeline track */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/60 via-navy/30 to-maroon/40" />

            {filteredEvents.map((event, i) => {
              const year = new Date(event.date).getFullYear();
              const era = getEraStyle(year);
              const isTop = i % 2 === 0;

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: isTop ? -30 : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative flex-shrink-0 w-72"
                  style={{ marginTop: isTop ? '0' : '180px' }}
                >
                  {/* Node dot */}
                  <div
                    className={`absolute ${isTop ? 'bottom-0' : 'top-0'} left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${era.border} ${
                      event.featured ? 'bg-gold' : 'bg-warm-white'
                    } z-10`}
                  />

                  {/* Connector line */}
                  <div className={`absolute ${isTop ? 'bottom-0' : 'top-0'} left-1/2 w-px h-8 bg-mist`} />

                  {/* Card */}
                  <button
                    onClick={() => setExpandedId(expandedId === event._id ? null : event._id)}
                    className={`block w-full text-left p-5 rounded-xl ${era.bg} border ${era.border} hover:shadow-lg transition-all duration-300 ${
                      isTop ? 'mb-12' : 'mt-12'
                    } ${era.sepia ? 'sepia-[.15]' : ''}`}
                    aria-expanded={expandedId === event._id}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[event.category] || 'bg-mist text-slate'}`}>
                        {event.category}
                      </span>
                      {event.featured && (
                        <span className="text-xs text-gold-dark">&#9733;</span>
                      )}
                    </div>
                    <div className="font-display text-2xl text-navy/80 mb-1">{year}</div>
                    <h3 className="font-display text-base text-navy mb-2 leading-snug">
                      {event.title}
                    </h3>
                    {expandedId === event._id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-slate font-body leading-relaxed"
                      >
                        {event.description}
                      </motion.p>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Vertical */}
      <div className="lg:hidden py-12 px-4 sm:px-6">
        <div className="relative max-w-lg mx-auto">
          {/* Vertical timeline track */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gold/60 via-navy/30 to-maroon/40" />

          <div className="space-y-8">
            {filteredEvents.map((event, i) => {
              const year = new Date(event.date).getFullYear();
              const era = getEraStyle(year);

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="relative pl-14"
                >
                  {/* Node */}
                  <div className={`absolute left-4 top-6 w-4 h-4 rounded-full border-2 ${era.border} ${
                    event.featured ? 'bg-gold' : 'bg-warm-white'
                  } z-10`} />

                  <button
                    onClick={() => setExpandedId(expandedId === event._id ? null : event._id)}
                    className={`block w-full text-left p-5 rounded-xl ${era.bg} border ${era.border} hover:shadow-md transition-all ${
                      era.sepia ? 'sepia-[.15]' : ''
                    }`}
                    aria-expanded={expandedId === event._id}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[event.category] || 'bg-mist text-slate'}`}>
                        {event.category}
                      </span>
                      <span className="text-sm text-navy/60 font-display">{year}</span>
                    </div>
                    <h3 className="font-display text-lg text-navy mb-1">{event.title}</h3>
                    {expandedId === event._id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm text-slate font-body leading-relaxed mt-2"
                      >
                        {event.description}
                      </motion.p>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-lg text-slate font-body">
            No events found for the selected filters. Try adjusting your category or date range.
          </p>
        </div>
      )}
    </div>
  );
}
