import type { Metadata } from 'next';
import CivilRightsEraView from './CivilRightsEraView';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Pomfret in the Civil Rights Era: More Than Four Decades of Diversity',
  author: { '@type': 'Person', name: 'Elizabeth Lake' },
  datePublished: '2005-10-01',
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'en',
  isPartOf: 'Pomfret Magazine (Fall 2005)',
  url: `${siteUrl}/archive/civil-rights-era`,
  description:
    'The Fall 2005 Pomfret Magazine special issue chronicling four decades of diversity at Pomfret School, including the stories of John Irick \u201965 and Frank Mwine \u201961, SPHERE, and the founding of VOICE.',
};

export const metadata: Metadata = {
  title: 'Pomfret in the Civil Rights Era · Archive',
  description:
    'Fall 2005 Pomfret Magazine special issue by Elizabeth Lake \u2014 14 pages covering John Irick \u201965, Frank Mwine \u201961, the Afro-Latin Society, SPHERE, and the founding of VOICE.',
  alternates: { canonical: '/archive/civil-rights-era' },
  openGraph: {
    title: 'Pomfret in the Civil Rights Era (Fall 2005)',
    description:
      'More Than Four Decades of Diversity \u2014 the full 14-page magazine issue with transcripts.',
    type: 'article',
  },
};

export default function CivilRightsEraPage() {
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <CivilRightsEraView />
    </>
  );
}
