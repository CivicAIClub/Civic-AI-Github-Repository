import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How the Pomfret DEI archive collects, uses, and protects information about visitors and profile subjects.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  const lastUpdated = 'April 19, 2026';

  return (
    <div className="min-h-screen bg-warm-white">
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/privacy', label: 'Privacy Policy' },
            ]}
          />
        </div>
      </div>

      <section className="py-16 lg:py-20 bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
            Legal
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
            <span className="font-bold">Privacy</span>{' '}
            <span className="text-pomfret-gray">Policy</span>
          </h1>
          <p className="text-sm text-slate font-body italic">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      <section className="py-12 lg:py-20 bg-warm-white">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate font-body prose-headings:font-display prose-headings:text-navy prose-h2:text-2xl prose-h2:mt-10 prose-p:text-slate prose-p:leading-relaxed">
          <h2>What this site is</h2>
          <p>
            The Pomfret Voices DEI archive is an editorial site operated by the
            Pomfret School Diversity, Equity &amp; Inclusion Department. It documents
            the history of DEI at Pomfret School and hosts interactive features
            (timeline, magazine archive, campus tour, Schwartz Visiting Fellows
            roster, and an AI Bias Awareness module).
          </p>

          <h2>Information we collect</h2>
          <p>
            This site does not currently run third-party analytics, behavioral
            advertising, or cross-site tracking. We do not place cookies that
            identify you personally.
          </p>
          <p>
            Standard web server logs captured by our hosting provider (Vercel)
            may include anonymized request metadata such as IP address, browser
            version, and referring URL. These are used solely for uptime and
            abuse monitoring and are retained for a limited period.
          </p>

          <h2>Information about profiled individuals</h2>
          <p>
            The &ldquo;Humans of Pomfret,&rdquo; &ldquo;Heads of School,&rdquo; and
            &ldquo;Schwartz Visiting Fellows&rdquo; pages display biographical
            information and photographs about real people connected to Pomfret
            School. All content is drawn from:
          </p>
          <ul>
            <li>
              Published Pomfret School archival materials (<em>Pomfret Magazine</em>{' '}
              issues from 2003 and 2005)
            </li>
            <li>
              The school&apos;s official public history records
            </li>
            <li>
              Publicly available biographical information for visiting fellows
              (who consented to their visit being documented)
            </li>
          </ul>
          <p>
            If you are profiled on this site and would like to request a
            correction, addition, or removal, please contact the Dean of DEI
            using the address listed on the site footer.
          </p>

          <h2>Photographs</h2>
          <p>
            Every photograph of a real person on this site is <strong>unaltered</strong>.
            AI enhancement, skin-tone adjustment, feature modification, and hair
            retexturing are prohibited, and our content workflow enforces this
            via a required authenticity confirmation before any photo can be
            published.
          </p>
          <p>
            Photographs of current Pomfret School heads of school and other
            recent figures are sourced from Pomfret School&apos;s own publications
            with attribution. If you are a rights-holder who believes a photo is
            used incorrectly, please contact us for immediate review.
          </p>

          <h2>AI content</h2>
          <p>
            This site does not host AI-generated images or videos of real people.
            The AI Bias Awareness module discusses AI bias using clearly-labeled
            illustrative examples (gradient blocks with text labels) rather than
            generated imagery. When any AI-generated content is ever introduced,
            it is marked with a visible &ldquo;AI-Generated Content&rdquo; badge
            that links to the AI Bias Awareness page.
          </p>

          <h2>Children&apos;s privacy</h2>
          <p>
            This site is an institutional educational archive. We do not solicit
            personal information from users of any age. We do not have accounts,
            comments, or uploads.
          </p>

          <h2>Contact</h2>
          <p>
            Address: 398 Pomfret Street, PO Box 128, Pomfret, CT 06258-0128
            <br />
            Phone: 860.963.6100
          </p>
        </article>
      </section>
    </div>
  );
}
