import type { Metadata } from 'next';
import SchwartzFellowsView from './SchwartzFellowsView';
import JsonLd from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Schwartz Visiting Fellows',
  description:
    '36 fellowship visits by world-renowned experts since 1989 \u2014 from Shirley Chisholm (1989) through Kobie Boykins (2026) \u2014 established by Michael \u201966 and Eric \u201969 Schwartz.',
  alternates: { canonical: '/famous-figures' },
  openGraph: {
    title: 'Schwartz Visiting Fellows \u00b7 Pomfret Voices',
    description:
      'Every speaker brought to the Hilltop since 1989 \u2014 Nobel laureates, Pulitzer winners, explorers, artists, and statesmen.',
    type: 'website',
  },
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Collection page schema describing the fellowship program as a whole.
// Individual fellows are documented on the page itself; search engines
// can reconstruct the list from the page content.
const fellowsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Schwartz Visiting Fellows at Pomfret School',
  description:
    'Roster of 36 fellowship visits by world-renowned experts at Pomfret School since 1989, under the auspices of the Schwartz Visiting Fellow program.',
  url: `${siteUrl}/famous-figures`,
  isPartOf: { '@id': `${siteUrl}/#website` },
  about: {
    '@type': 'EducationalEvent',
    name: 'Schwartz Visiting Fellow program',
    startDate: '1989',
    organizer: { '@id': `${siteUrl}/#organization` },
  },
};

export default function SchwartzFellowsPage() {
  return (
    <>
      <JsonLd data={fellowsJsonLd} />
      <SchwartzFellowsView />
    </>
  );
}
