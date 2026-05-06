'use client';

import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { TourStop } from '@/lib/data/tour-stops';

export default function TourStopView({ stop }: { stop: TourStop }) {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [showDeepDive, setShowDeepDive] = useState(false);

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="py-8 lg:py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/tour"
            className="inline-flex items-center gap-2 text-slate hover:text-navy text-sm font-body mb-6 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            All Tour Stops
          </Link>

          {/* Language toggle */}
          <div className="flex items-center gap-2 mb-6" role="radiogroup" aria-label="Language selection">
            <button
              role="radio"
              aria-checked={locale === 'en'}
              onClick={() => setLocale('en')}
              className={`px-4 py-2.5 rounded-xl text-sm font-body font-semibold transition-all min-w-[60px] min-h-[44px] ${
                locale === 'en' ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
              }`}
            >
              EN
            </button>
            <button
              role="radio"
              aria-checked={locale === 'es'}
              onClick={() => setLocale('es')}
              className={`px-4 py-2.5 rounded-xl text-sm font-body font-semibold transition-all min-w-[60px] min-h-[44px] ${
                locale === 'es' ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
              }`}
            >
              ES
            </button>
          </div>

          {/* Location name */}
          <h1 className="font-display text-3xl text-navy mb-4">
            {stop.locationName}
          </h1>

          {/* Quick Look */}
          <div className="bg-cream rounded-2xl p-6 mb-4">
            <div className="text-xs font-body tracking-wider uppercase text-maroon mb-3">
              {locale === 'en' ? 'Quick Look' : 'Vista R\u00e1pida'}
            </div>
            {/* lang attribute tells screen readers to switch phonetic rules for Spanish content */}
            <p lang={locale} className="text-slate font-body leading-relaxed">
              {stop.quickSummary[locale]}
            </p>

            {/* Audio placeholder — tap to play per policy (no autoplay) */}
            <button
              className="mt-4 flex items-center gap-3 px-5 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors w-full justify-center text-sm font-body font-semibold min-h-[48px]"
              aria-label={
                locale === 'en'
                  ? 'Listen to audio narration'
                  : 'Escuchar narraci\u00f3n de audio'
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M4 3L13 8L4 13V3Z" fill="currentColor" />
              </svg>
              {locale === 'en' ? 'Listen' : 'Escuchar'} (~30s)
            </button>
          </div>

          {/* Deep Dive toggle */}
          <button
            onClick={() => setShowDeepDive(!showDeepDive)}
            className="w-full flex items-center justify-between px-6 py-4 bg-cream-dark rounded-2xl text-navy font-body font-semibold min-h-[48px]"
            aria-expanded={showDeepDive}
          >
            <span>{locale === 'en' ? 'Deep Dive' : 'Profundizar'}</span>
            <m.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              animate={{ rotate: showDeepDive ? 180 : 0 }}
              aria-hidden="true"
            >
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </m.svg>
          </button>

          <AnimatePresence>
            {showDeepDive && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-cream rounded-2xl p-6 mt-2">
                  <p lang={locale} className="text-slate font-body leading-relaxed">
                    {stop.deepDive[locale]}
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
