'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AIContentBadge from '@/components/ethics/AIContentBadge';

const demoFigures = [
  { _id: '1', name: 'Langston Hughes', era: '20th Century', fieldOfWork: 'Poetry & Literature', narrative: 'Hughes gave voice to the African American experience with beauty and defiance. His belief that art should reflect the full complexity of Black life resonates with Pomfret\'s commitment to authentic representation.' },
  { _id: '2', name: 'Frida Kahlo', era: '20th Century', fieldOfWork: 'Visual Art', narrative: 'Kahlo transformed personal pain into universal art, refusing to hide her identity or heritage. Her unapologetic self-expression embodies the courage Pomfret cultivates in its students.' },
  { _id: '3', name: 'Alan Turing', era: '20th Century', fieldOfWork: 'Mathematics & Computer Science', narrative: 'Turing\'s brilliance changed the world, yet he was persecuted for who he was. His story reminds us why creating inclusive spaces for every mind matters.' },
  { _id: '4', name: 'Wangari Maathai', era: '20th-21st Century', fieldOfWork: 'Environmental Activism', narrative: 'The first African woman to win the Nobel Peace Prize, Maathai showed that environmental justice and social justice are inseparable — a lesson central to Pomfret\'s holistic approach to education.' },
  { _id: '5', name: 'Frederick Douglass', era: '19th Century', fieldOfWork: 'Abolitionism & Oratory', narrative: 'Douglass\'s power as a speaker and writer proved that the voice is the most potent tool for justice. The chapel talk tradition at Pomfret carries this same conviction.' },
  { _id: '6', name: 'Hypatia', era: 'Ancient World', fieldOfWork: 'Mathematics & Philosophy', narrative: 'One of the first known women mathematicians and philosophers, Hypatia represents the long, often erased history of women in intellectual leadership.' },
];

export default function FamousFiguresPage() {
  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Header */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-dark via-navy to-navy-dark" />
        {/* Subtle holographic ambient */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-gold/20 via-transparent to-maroon/20" />

        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-gold/40" />
              <span className="text-xs font-body tracking-[0.3em] uppercase text-gold/60">
                Hologram Gallery
              </span>
              <div className="w-12 h-px bg-gold/40" />
            </div>
            <h1 className="font-display text-section text-cream mb-4">
              Famous Figures
            </h1>
            <p className="text-lg text-cream/50 max-w-2xl mx-auto font-body mb-6">
              Visionaries, rebels, and pioneers whose legacy connects to Pomfret&apos;s mission
              of celebrating every voice and every identity.
            </p>
            <AIContentBadge size="md" />
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoFigures.map((figure, i) => (
              <ScrollReveal key={figure._id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative rounded-2xl overflow-hidden holographic holographic-glow"
                >
                  {/* AI Content Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <AIContentBadge size="sm" />
                  </div>

                  {/* Portrait placeholder with holographic effect */}
                  <div className="aspect-[3/4] bg-gradient-to-b from-navy/40 to-navy-dark/80 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-maroon/5 animate-pulse-soft" />
                    <div className="relative text-center p-6">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                        <span className="font-display text-3xl text-gold/60">
                          {figure.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-cream mb-1">{figure.name}</h3>
                      <div className="text-xs text-gold/60 font-body mb-1">{figure.era}</div>
                      <div className="text-xs text-cream/40 font-body">{figure.fieldOfWork}</div>
                    </div>
                  </div>

                  {/* Narrative */}
                  <div className="p-5 bg-navy-dark/90">
                    <p className="text-sm text-cream/70 font-body leading-relaxed">
                      {figure.narrative}
                    </p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Transparency note */}
      <section className="py-12 border-t border-cream/5">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-sm text-cream/40 font-body">
            All portrait videos in this gallery are AI-generated interpretations,
            not real footage. Pomfret School is committed to transparency about AI use.{' '}
            <a href="/ai-bias" className="text-gold/60 hover:text-gold underline underline-offset-2">
              Learn about our approach to AI ethics
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
