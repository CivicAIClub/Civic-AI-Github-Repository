'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AIContentBadge from '@/components/ethics/AIContentBadge';

const quizQuestions = [
  {
    question: 'An AI generates a portrait of a historical figure. The skin tone appears lighter than historical photographs. Is this an example of AI bias?',
    options: ['Yes — the AI has altered appearance based on biased training data', 'No — AI always produces accurate results', 'It depends on the context'],
    correct: 0,
    explanation: 'AI image generators often lighten skin tones because their training data overrepresents lighter-skinned individuals. This is a clear example of representation bias.',
  },
  {
    question: 'When AI "smooths" or "enhances" someone\'s features in a photo, what cultural impact can this have?',
    options: ['It makes photos look more professional', 'It can erase cultural features and reinforce narrow beauty standards', 'It has no cultural impact'],
    correct: 1,
    explanation: 'AI enhancement often reflects and reinforces dominant beauty standards, which can erase the natural features that connect people to their cultural heritage.',
  },
  {
    question: 'What is the best practice when using AI-generated content in educational settings?',
    options: ['Use it without labels since everyone knows AI exists', 'Always label AI content clearly and link to bias information', 'Avoid using AI entirely'],
    correct: 1,
    explanation: 'Transparency is key. Clear labeling ensures viewers can distinguish AI-generated content from authentic material and think critically about what they see.',
  },
];

export default function AIBiasPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumb strip (light) */}
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/ai-bias', label: 'AI & Bias' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="py-16 lg:py-24 bg-navy">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <AIContentBadge size="lg" className="mb-6" />
            <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-cream mb-4">
              <span className="font-bold">AI Bias</span>{' '}
              <span className="font-normal text-cream/70">Awareness</span>
            </h1>
            <p className="text-lg text-cream/70 font-body leading-relaxed">
              Understanding how artificial intelligence can perpetuate bias — and what
              Pomfret School is doing about it.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-16">
        {/* What is AI Bias? */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">What is AI Bias?</h2>
            <div className="prose prose-slate font-body">
              <p className="text-slate leading-relaxed">
                Artificial intelligence learns from data created by humans — and humans have biases.
                When AI systems are trained on datasets that overrepresent certain groups or underrepresent
                others, the technology reproduces and amplifies those imbalances.
              </p>
              <p className="text-slate leading-relaxed">
                This means AI can generate images that lighten skin tones, alter natural hair textures,
                narrow facial features, or default to Western beauty standards — even when no one
                explicitly programmed it to do so.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Bias in Images — Visual Examples */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">Bias in Images: See It for Yourself</h2>
            <p className="text-slate font-body leading-relaxed mb-6">
              AI image tools don&apos;t just generate — they alter. When asked to &quot;enhance&quot; or &quot;improve&quot;
              a photo, AI systems frequently change the subject&apos;s appearance in ways that reflect deep
              biases in their training data. Here are real patterns researchers have documented:
            </p>

            {/* Example 1: Skin Tone */}
            <div className="bg-cream rounded-2xl p-6 lg:p-8 museum-frame mb-6">
              <h3 className="font-display text-lg text-navy mb-4">Skin Tone Lightening</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-5 border border-mist">
                  <div className="aspect-[4/3] rounded-lg mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8B6914 0%, #5C3D0E 100%)' }}>
                    <span className="text-white/80 font-body text-sm font-semibold">Original Skin Tone</span>
                  </div>
                  <div className="text-xs font-body text-navy font-semibold">Authentic photograph</div>
                  <div className="text-xs text-slate">The person as they actually appear</div>
                </div>
                <div className="bg-white rounded-xl p-5 border-2 border-dashed border-maroon/30">
                  <div className="aspect-[4/3] rounded-lg mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C4A265 0%, #9B7E4A 100%)' }}>
                    <span className="text-white/80 font-body text-sm font-semibold">AI &quot;Enhanced&quot;</span>
                  </div>
                  <div className="text-xs font-body text-maroon font-semibold">Lightened by AI</div>
                  <div className="text-xs text-slate">Skin tone shifted 2-3 shades lighter</div>
                </div>
              </div>
              <p className="text-sm text-slate font-body leading-relaxed">
                Studies show AI image generators consistently lighten skin tones, especially for
                darker-skinned individuals. This happens because training datasets overrepresent
                lighter-skinned faces, teaching the AI that &quot;better&quot; means &quot;lighter.&quot;
              </p>
            </div>

            {/* Example 2: Hair Texture */}
            <div className="bg-cream rounded-2xl p-6 lg:p-8 museum-frame mb-6">
              <h3 className="font-display text-lg text-navy mb-4">Hair Texture Alteration</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-5 border border-mist">
                  <div className="aspect-[4/3] rounded-lg bg-navy/5 mb-3 flex flex-col items-center justify-center gap-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                      <path d="M12 20C12 20 14 8 24 8C34 8 36 20 36 20" stroke="#1B2A4A" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M14 18C14 18 16 24 14 32M18 16C18 16 20 24 18 34M22 15C22 15 24 24 22 36M26 15C26 15 28 24 26 36M30 16C30 16 32 24 30 34M34 18C34 18 36 24 34 32" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-body text-navy font-semibold">Natural curls &amp; coils</span>
                  </div>
                  <div className="text-xs font-body text-navy font-semibold">Authentic texture</div>
                  <div className="text-xs text-slate">4C coils, locs, braids, natural styles</div>
                </div>
                <div className="bg-white rounded-xl p-5 border-2 border-dashed border-maroon/30">
                  <div className="aspect-[4/3] rounded-lg bg-navy/5 mb-3 flex flex-col items-center justify-center gap-2">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                      <path d="M10 16C10 16 14 8 24 8C34 8 38 16 38 16" stroke="#7B2D3B" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M10 16C10 16 10 36 12 40M16 12C16 12 15 36 16 40M22 10C22 10 21 36 22 40M28 10C28 10 27 36 28 40M34 12C34 12 33 36 34 40M38 16C38 16 38 36 36 40" stroke="#7B2D3B" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-body text-maroon font-semibold">Straightened by AI</span>
                  </div>
                  <div className="text-xs font-body text-maroon font-semibold">AI &quot;corrected&quot;</div>
                  <div className="text-xs text-slate">Curls smoothed, texture removed</div>
                </div>
              </div>
              <p className="text-sm text-slate font-body leading-relaxed">
                AI tools frequently straighten curly and coiled hair textures when &quot;enhancing&quot; photos.
                Natural Black hairstyles — locs, braids, afros, twists — are treated as imperfections to
                fix rather than expressions of identity and culture.
              </p>
            </div>

            {/* Example 3: Facial Features */}
            <div className="bg-cream rounded-2xl p-6 lg:p-8 museum-frame mb-6">
              <h3 className="font-display text-lg text-navy mb-4">Facial Feature Narrowing</h3>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-mist text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-navy/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <path d="M6 16C6 16 10 22 14 22C18 22 22 16 22 16" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="9" cy="11" r="1.5" fill="#1B2A4A" />
                      <circle cx="19" cy="11" r="1.5" fill="#1B2A4A" />
                    </svg>
                  </div>
                  <div className="text-xs font-body text-navy font-semibold">Broad nose</div>
                  <div className="text-xs text-slate">Natural feature</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-mist text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-navy/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <path d="M7 16C7 16 10 21 14 21C18 21 21 16 21 16" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="10" cy="12" r="1.5" fill="#1B2A4A" />
                      <circle cx="18" cy="12" r="1.5" fill="#1B2A4A" />
                    </svg>
                  </div>
                  <div className="text-xs font-body text-navy font-semibold">Full lips</div>
                  <div className="text-xs text-slate">Natural feature</div>
                </div>
                <div className="bg-white rounded-xl p-4 border-2 border-dashed border-maroon/30 text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-maroon/20 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                      <path d="M10 16C10 16 12 19 14 19C16 19 18 16 18 16" stroke="#7B2D3B" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="11" cy="12" r="1" fill="#7B2D3B" />
                      <circle cx="17" cy="12" r="1" fill="#7B2D3B" />
                    </svg>
                  </div>
                  <div className="text-xs font-body text-maroon font-semibold">AI &quot;refined&quot;</div>
                  <div className="text-xs text-slate">Narrowed &amp; thinned</div>
                </div>
              </div>
              <p className="text-sm text-slate font-body leading-relaxed">
                AI tools often narrow noses, thin lips, and slim jawlines — reshaping faces toward a
                single Eurocentric template. Features common across African, Asian, Indigenous, and
                Latinx communities are systematically minimized.
              </p>
            </div>

            <div className="p-5 bg-maroon/5 rounded-xl border border-maroon/20">
              <p className="text-base text-maroon-dark font-body font-semibold text-center">
                No one should be changed. Images should be authentic and no part of the person should be erased.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* How AI Defaults to Western Beauty Standards */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">
              How AI Defaults to Western Beauty Standards
            </h2>
            <p className="text-slate font-body leading-relaxed mb-6">
              AI doesn&apos;t have opinions about beauty — but the data it learns from does.
              The vast majority of images used to train AI systems come from Western media,
              fashion, and advertising, which have historically promoted a narrow set of features as &quot;ideal.&quot;
            </p>

            <div className="space-y-4 mb-6">
              {[
                {
                  label: 'Training data imbalance',
                  detail: 'Datasets used to train image AI are overwhelmingly sourced from Western media. Faces and bodies that appear most frequently become the AI\'s definition of "normal" — everything else becomes a deviation to "correct."',
                },
                {
                  label: 'The "enhancement" trap',
                  detail: 'When users ask AI to "enhance" or "beautify" a photo, the system applies learned biases: lighter skin, straighter hair, thinner features, smoother texture. The word "enhance" becomes a euphemism for erasure.',
                },
                {
                  label: 'Homogenization of beauty',
                  detail: 'AI tools push every face toward the same template — small nose, light skin, straight hair, angular jaw. This erases the stunning diversity of human appearance and tells people from non-Western cultures that their natural features are flaws.',
                },
                {
                  label: 'Feedback loops',
                  detail: 'When AI-altered images flood social media, they reshape public perception of "normal" appearance. People begin to feel their unaltered faces don\'t measure up — not to reality, but to an AI-manufactured ideal.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-cream rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-maroon/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-display text-maroon font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <div className="font-body font-semibold text-navy mb-1">{item.label}</div>
                      <p className="text-sm text-slate font-body leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy rounded-2xl p-6 lg:p-8">
              <h3 className="font-display text-lg text-cream mb-3">The real-world impact</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { stat: '59%', label: 'of AI-generated faces in one study had lighter skin than the prompt described' },
                  { stat: '80%+', label: 'of training images in popular datasets originate from Western or light-skinned sources' },
                  { stat: '3x', label: 'more likely for AI to alter features of Black and Brown faces vs. white faces' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-cream/5 rounded-xl">
                    <div className="font-display text-2xl text-gold font-bold mb-1">{item.stat}</div>
                    <p className="text-xs text-cream/70 font-body">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Cultural Erasure */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">Cultural Erasure</h2>
            <p className="text-slate font-body leading-relaxed mb-4">
              When AI alters someone&apos;s appearance, it doesn&apos;t just change pixels — it can erase
              cultural identity. Natural hair textures, skin tones, facial features, and traditional
              adornments are not &quot;imperfections&quot; to be corrected. They are expressions of heritage,
              identity, and belonging.
            </p>
            <p className="text-slate font-body leading-relaxed">
              AI systems that default to Eurocentric standards of appearance perpetuate the
              harmful message that some identities need to be &quot;fixed&quot; — a message directly
              contrary to everything Pomfret&apos;s DEI mission stands for.
            </p>
          </section>
        </ScrollReveal>

        {/* What Pomfret Is Doing */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">What Pomfret Is Doing</h2>
            <div className="space-y-4">
              {[
                { title: 'Transparent Labeling', desc: 'Every piece of AI-generated content on this site carries a visible badge linking to this page.' },
                { title: 'Authentic Photography', desc: 'All photographs of real people are completely unaltered. Our CMS requires staff to confirm image authenticity before publishing.' },
                { title: 'Content Review', desc: 'All content goes through a draft → review → publish workflow to ensure cultural sensitivity.' },
                { title: 'Education', desc: 'This module exists to make our community aware of AI bias, not just on our platform, but everywhere they encounter AI.' },
                { title: 'Honest Acknowledgment', desc: 'We know AI tools are imperfect. Instead of hiding from that reality, we confront it openly.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-cream rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-display text-navy font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <div className="font-body font-semibold text-navy text-sm">{item.title}</div>
                    <div className="text-sm text-slate font-body">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Interactive Quiz */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">Test Your Knowledge</h2>
            <div className="bg-cream rounded-2xl p-6 lg:p-8 museum-frame">
              {!quizComplete ? (
                <>
                  <div className="text-xs font-body text-slate mb-2">
                    Question {currentQuestion + 1} of {quizQuestions.length}
                  </div>
                  <div className="w-full bg-mist rounded-full h-1.5 mb-6">
                    <div
                      className="bg-navy rounded-full h-1.5 transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>

                  <p className="font-body font-semibold text-navy text-lg mb-6">
                    {quizQuestions[currentQuestion].question}
                  </p>

                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option, idx) => {
                      const isCorrect = idx === quizQuestions[currentQuestion].correct;
                      const isSelected = idx === selectedAnswer;

                      return (
                        <button
                          key={idx}
                          onClick={() => !showResult && handleAnswer(idx)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all font-body min-h-[48px] ${
                            showResult
                              ? isCorrect
                                ? 'border-green-500 bg-green-50'
                                : isSelected
                                ? 'border-maroon bg-maroon/5'
                                : 'border-mist bg-white opacity-60'
                              : 'border-mist bg-white hover:border-navy/30 hover:bg-navy/5'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <div className={`p-4 rounded-xl ${
                        selectedAnswer === quizQuestions[currentQuestion].correct
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-maroon/5 border border-maroon/20'
                      }`}>
                        <p className="text-sm font-body text-slate">
                          {quizQuestions[currentQuestion].explanation}
                        </p>
                      </div>
                      <button
                        onClick={nextQuestion}
                        className="mt-4 px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors font-body font-semibold min-h-[48px]"
                      >
                        {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                      </button>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="font-display text-4xl text-navy mb-2">
                    {score}/{quizQuestions.length}
                  </div>
                  <p className="text-lg text-slate font-body mb-6">
                    {score === quizQuestions.length
                      ? 'Excellent! You have a strong understanding of AI bias.'
                      : score >= 2
                      ? 'Good work! Keep learning about AI bias.'
                      : 'There\'s more to learn — and that\'s okay. Awareness is the first step.'}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentQuestion(0);
                      setSelectedAnswer(null);
                      setShowResult(false);
                      setScore(0);
                      setQuizComplete(false);
                    }}
                    className="px-6 py-3 bg-navy text-cream rounded-xl hover:bg-navy-light transition-colors font-body font-semibold min-h-[48px]"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
