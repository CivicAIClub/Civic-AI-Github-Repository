import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SectionHeading from '@/components/layout/SectionHeading';

export const metadata: Metadata = {
  title: 'Accessibility',
  description:
    "Pomfret Voices is committed to inclusive, accessible digital experiences. Learn how this living archive is designed and how to report accessibility issues.",
};

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      <section className="pt-10 lg:pt-14 pb-16 lg:pb-24 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/accessibility', label: 'Accessibility' },
            ]}
            className="mb-8"
          />
          <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
            Inclusive design
          </div>
          <SectionHeading bold="Accessibility" rest="at Pomfret Voices" />
          <p className="mt-6 text-lg text-slate font-body leading-relaxed">
            An archive of every voice has to be reachable by every visitor. We&apos;re committed to
            designing this site so it works for the widest possible audience — including students,
            alumni, and community members who use assistive technologies.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <h2 className="font-display text-2xl text-navy mb-4">Our commitment</h2>
            <p className="text-slate font-body leading-relaxed">
              Pomfret Voices targets the{' '}
              <a
                href="https://www.w3.org/TR/WCAG21/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-maroon hover:text-maroon-dark underline underline-offset-2"
              >
                Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
              </a>{' '}
              as our design and engineering baseline. We treat accessibility as an ongoing
              responsibility rather than a one-time audit, and we welcome feedback from anyone who
              encounters a barrier on the site.
            </p>
          </div>

          <div>
            <h2 className="font-display text-2xl text-navy mb-4">What we&apos;ve built so far</h2>
            <ul className="space-y-3 text-slate font-body leading-relaxed list-disc pl-5">
              <li>Semantic HTML with descriptive page titles, headings, and landmarks.</li>
              <li>Skip-to-main-content link on every page for keyboard and screen-reader users.</li>
              <li>Color combinations chosen to meet WCAG contrast ratios for body text and UI.</li>
              <li>
                Visible focus rings on every interactive element, with keyboard navigation
                supported across menus, filters, image galleries, and tour pages.
              </li>
              <li>
                Alternative text for every meaningful image, including portraits, archival photos,
                and magazine page scans.
              </li>
              <li>
                Bilingual (English / Spanish) text and a built-in audio narration option on the
                Campus Tour, powered by the browser&apos;s native speech synthesis.
              </li>
              <li>
                Animations that respect the operating system&apos;s reduced-motion preference where
                supported.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-navy mb-4">Known gaps we&apos;re still working on</h2>
            <ul className="space-y-3 text-slate font-body leading-relaxed list-disc pl-5">
              <li>
                A full third-party WCAG 2.1 AA conformance audit has not yet been completed; we will
                publish the audit summary here once it is.
              </li>
              <li>
                Some archival magazine pages are presented as scanned images. Where transcripts are
                already available, we surface them; where they are not, full transcription is
                pending.
              </li>
              <li>
                Captioned audio narration with downloadable transcripts will replace the current
                browser-based text-to-speech once the Campus Tour clears its security review.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-2xl text-navy mb-4">Report an accessibility issue</h2>
            <p className="text-slate font-body leading-relaxed mb-4">
              If you run into a barrier on this site — anything from low contrast, to a focus trap,
              to missing alt text, to a piece of content that&apos;s hard to reach with assistive
              tech — please tell us. We treat accessibility reports as priority work.
            </p>
            <p className="text-slate font-body leading-relaxed">
              Email the DEI Office at{' '}
              <a
                href="mailto:dei@pomfret.org"
                className="text-maroon hover:text-maroon-dark underline underline-offset-2"
              >
                dei@pomfret.org
              </a>{' '}
              with the page URL and a short description, and we&apos;ll respond and remediate as
              quickly as we can.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
