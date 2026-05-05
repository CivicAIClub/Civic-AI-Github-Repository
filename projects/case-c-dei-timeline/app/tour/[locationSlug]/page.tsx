'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTourStopBySlug } from '../tour-stops';

export default function TourStopPage({ params }: { params: { locationSlug: string } }) {
  const stop = getTourStopBySlug(params.locationSlug);

  const [locale, setLocale] = useState<'en' | 'es'>('en');
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!stop) {
    notFound();
  }

  const handleListen = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(stop.quickSummary[locale]);
    utterance.lang = locale === 'es' ? 'es-ES' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const isDraft = stop.status === 'draft';

  return (
    <div className="min-h-screen bg-warm-white">
      <section className="py-8 lg:py-16">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <Link
            href="/tour"
            className="inline-flex items-center gap-2 text-slate hover:text-navy text-sm font-body mb-6 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            All Tour Stops
          </Link>

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

          <div className="aspect-[16/10] bg-cream rounded-2xl museum-frame flex items-center justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-navy/15" aria-hidden="true">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="20" r="4" stroke="currentColor" strokeWidth="2" />
              <path d="M4 36L16 24L28 36L38 28L44 34" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-navy mb-4">{stop.locationName}</h1>

          {isDraft && (
            <div className="rounded-2xl bg-cream-dark/40 border border-mist px-5 py-4 mb-4">
              <div className="text-xs font-body tracking-wider uppercase text-maroon mb-1">
                {locale === 'en' ? 'Draft preview' : 'Vista previa'}
              </div>
              <p className="text-sm text-slate font-body leading-relaxed">
                {locale === 'en'
                  ? "Long-form content for this stop is still being reviewed by Pomfret's DEI Office. The summary below is a draft — final copy and a campus photograph will replace it before public launch."
                  : 'El contenido completo de esta parada aún está siendo revisado por la Oficina de DEI de Pomfret. El resumen a continuación es un borrador; la versión final y una fotografía del campus lo reemplazarán antes del lanzamiento público.'}
              </p>
            </div>
          )}

          <div className="bg-cream rounded-2xl p-6 mb-4">
            <div className="text-xs font-body tracking-wider uppercase text-maroon mb-3">
              {locale === 'en' ? 'Quick Look' : 'Vista Rápida'}
            </div>
            <p className="text-slate font-body leading-relaxed">{stop.quickSummary[locale]}</p>

            <button
              onClick={handleListen}
              className="mt-4 flex items-center gap-3 px-5 py-3 bg-navy text-cream rounded-xl hover:bg-navy/90 transition-colors w-full justify-center text-sm font-body font-semibold min-h-[48px]"
              aria-label={
                locale === 'en'
                  ? isSpeaking ? 'Stop audio narration' : 'Listen to audio narration'
                  : isSpeaking ? 'Detener narración' : 'Escuchar narración'
              }
            >
              {isSpeaking ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="4" y="3" width="3" height="10" fill="currentColor" />
                  <rect x="9" y="3" width="3" height="10" fill="currentColor" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 3L13 8L4 13V3Z" fill="currentColor" />
                </svg>
              )}
              {isSpeaking
                ? (locale === 'en' ? 'Stop' : 'Detener')
                : (locale === 'en' ? 'Listen' : 'Escuchar')}
            </button>
          </div>

          {stop.deepDive[locale] && (
            <>
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
                      <p className="text-slate font-body leading-relaxed whitespace-pre-line">
                        {stop.deepDive[locale]}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
