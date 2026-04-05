'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const demoStop = {
  locationName: 'Clark Memorial Chapel',
  quickSummary: {
    en: 'The heart of community life at Pomfret since 1910. This is where generations of students have shared their stories through the chapel talk tradition.',
    es: 'El coraz\u00f3n de la vida comunitaria en Pomfret desde 1910. Aqu\u00ed, generaciones de estudiantes han compartido sus historias a trav\u00e9s de la tradici\u00f3n de charlas en la capilla.',
  },
  deepDive: {
    en: 'Clark Memorial Chapel has stood at the center of Pomfret School since 1910, when it was built as a gift from the Clark family. More than a place of worship, it has always been a place of gathering, reflection, and courage. The chapel talk tradition, where students stand before the entire school community to share their personal stories, began here in the 1930s. Over the decades, these talks have become some of the most powerful moments in students\' Pomfret experience — moments where vulnerability becomes strength and individual stories become shared understanding.',
    es: 'La Capilla Conmemorativa Clark ha estado en el centro de la Escuela Pomfret desde 1910, cuando fue construida como un regalo de la familia Clark. M\u00e1s que un lugar de culto, siempre ha sido un lugar de reuni\u00f3n, reflexi\u00f3n y coraje.',
  },
};

export default function TourStopPage() {
  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [showDeepDive, setShowDeepDive] = useState(false);
  const stop = demoStop;

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Mobile-first tour stop */}
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
              className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all min-w-[60px] ${
                locale === 'en' ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
              }`}
            >
              EN
            </button>
            <button
              role="radio"
              aria-checked={locale === 'es'}
              onClick={() => setLocale('es')}
              className={`px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all min-w-[60px] ${
                locale === 'es' ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
              }`}
            >
              ES
            </button>
          </div>

          {/* Hero photo placeholder */}
          <div className="aspect-[16/10] bg-cream rounded-2xl museum-frame flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-navy/15" aria-hidden="true">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 36L16 24L28 36L38 28L44 34" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Location name */}
          <h1 className="font-display text-3xl text-navy mb-4">
            {stop.locationName}
          </h1>

          {/* Quick Look */}
          <div className="bg-cream rounded-2xl p-6 mb-4">
            <div className="text-xs font-body tracking-wider uppercase text-gold-dark mb-3">
              {locale === 'en' ? 'Quick Look' : 'Vista R\u00e1pida'}
            </div>
            <p className="text-slate font-body leading-relaxed">
              {stop.quickSummary[locale]}
            </p>

            {/* Audio placeholder */}
            <button
              className="mt-4 flex items-center gap-3 px-5 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors w-full justify-center text-sm font-body font-semibold min-h-[48px]"
              aria-label={locale === 'en' ? 'Listen to audio narration' : 'Escuchar narraci\u00f3n de audio'}
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
            <motion.svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              animate={{ rotate: showDeepDive ? 180 : 0 }}
              aria-hidden="true"
            >
              <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showDeepDive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-cream rounded-2xl p-6 mt-2">
                  <p className="text-slate font-body leading-relaxed">
                    {stop.deepDive[locale]}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
