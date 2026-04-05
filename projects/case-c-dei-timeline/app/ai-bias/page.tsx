'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
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
      {/* Header */}
      <section className="py-16 lg:py-24 bg-navy texture-grain">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <AIContentBadge size="lg" className="mb-6" />
            <h1 className="font-display text-section text-cream mb-4">
              AI Bias Awareness
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

        {/* Bias in Images */}
        <ScrollReveal>
          <section>
            <h2 className="font-display text-2xl text-navy mb-4">Bias in Images</h2>
            <div className="bg-cream rounded-2xl p-6 lg:p-8 museum-frame">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-navy/5 rounded-xl aspect-square flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div className="text-sm font-body text-navy font-semibold">Original Photo</div>
                    <div className="text-xs text-slate">Authentic, unaltered</div>
                  </div>
                </div>
                <div className="bg-navy/5 rounded-xl aspect-square flex items-center justify-center p-6 border-2 border-dashed border-maroon/30">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🤖</div>
                    <div className="text-sm font-body text-maroon font-semibold">AI &quot;Enhanced&quot;</div>
                    <div className="text-xs text-slate">Features altered by bias</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-maroon/5 rounded-xl border border-maroon/20">
                <p className="text-sm text-maroon-dark font-body font-semibold text-center">
                  No one should be changed. Images should be authentic and no part of the person should be erased.
                </p>
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
