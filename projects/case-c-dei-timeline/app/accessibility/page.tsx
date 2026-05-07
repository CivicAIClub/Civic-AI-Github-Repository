import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description:
    'Pomfret Voices is committed to WCAG 2.1 AA compliance. Report accessibility issues here.',
  alternates: { canonical: '/accessibility' },
};

export default function AccessibilityPage() {
  const lastUpdated = 'April 19, 2026';

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/accessibility', label: 'Accessibility' },
            ]}
          />
        </div>
      </div>

      <section className="py-16 lg:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
            Commitment
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
            <span className="font-bold">Accessibility</span>{' '}
            <span className="text-pomfret-gray">Statement</span>
          </h1>
          <p className="text-sm text-slate font-body italic">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20 bg-warm-white">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate font-body prose-headings:font-display prose-headings:text-navy prose-h2:text-2xl prose-h2:mt-10 prose-p:text-slate prose-p:leading-relaxed">
          <h2>Our commitment</h2>
          <p>
            Pomfret Voices is a DEI-focused archive, and accessibility is
            central to our mission. We aim to meet the Web Content Accessibility
            Guidelines (WCAG) 2.1 Level AA across every page and feature.
          </p>

          <h2>Standards we follow</h2>
          <ul>
            <li>WCAG 2.1 AA minimum (AAA where reasonable)</li>
            <li>Semantic HTML with logical heading hierarchy</li>
            <li>
              Alt text on every informative image; decorative images are marked{' '}
              <code>aria-hidden</code>
            </li>
            <li>Keyboard-accessible navigation and visible focus indicators</li>
            <li>
              A skip-to-main-content link at the top of every page for
              screen-reader users
            </li>
            <li>
              Support for <code>prefers-reduced-motion</code>, which disables
              or shortens animations for users who request reduced motion
            </li>
            <li>
              Color contrast ratios that meet AA thresholds for normal and
              large text
            </li>
            <li>
              Correct language declarations (<code>lang=&quot;en&quot;</code> site-wide,{' '}
              <code>lang=&quot;es&quot;</code> on Spanish tour content)
            </li>
            <li>
              Minimum 44×44px touch targets on interactive elements
            </li>
          </ul>

          <h2>Audio and video policy</h2>
          <p>
            All audio narration requires a user tap to play — the site never
            autoplays sound. Audio content includes transcripts or captions.
            Videos will include captions before they are published.
          </p>

          <h2>Known limitations</h2>
          <p>
            We test with recent versions of Chrome, Safari, Firefox, and Edge,
            and with common screen readers (VoiceOver, NVDA). If you encounter
            an area where assistive technology fails to convey content
            properly, please report it and we will fix it as a priority.
          </p>

          <h2>Reporting accessibility issues</h2>
          <p>
            Please email the Pomfret School DEI Department or call
            860.963.6100. Include:
          </p>
          <ul>
            <li>The page URL where the issue occurred</li>
            <li>Your browser and assistive technology (if applicable)</li>
            <li>A short description of the problem</li>
          </ul>
          <p>
            We aim to respond to accessibility reports within 5 business days.
          </p>

          <h2>Continuous improvement</h2>
          <p>
            This site is under active development. As features are added, each
            is reviewed for accessibility before launch. If this statement
            drifts out of sync with the actual site, the site is the source of
            truth — and we will update this document promptly.
          </p>
        </article>
      </section>
    </div>
  );
}
