import type { Metadata } from 'next';
import MissionAccomplishedView from './MissionAccomplishedView';
import JsonLd from '@/components/seo/JsonLd';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Mission Accomplished: Pomfret School Celebrates 35 Years of Coeducation',
  editor: { '@type': 'Person', name: 'Sharon Gaudreau' },
  author: { '@type': 'Person', name: 'Linda J. Colangelo' },
  datePublished: '2003-09-01',
  publisher: { '@id': `${siteUrl}/#organization` },
  inLanguage: 'en',
  isPartOf: 'Pomfret Magazine (September 2003)',
  url: `${siteUrl}/archive/mission-accomplished`,
  description:
    'The September 2003 Pomfret Magazine commemorative edition marking 35 years since the first female day students arrived in 1968.',
};

export const metadata: Metadata = {
  title: 'Mission Accomplished: 35 Years of Coeducation · Archive',
  description:
    'September 2003 Pomfret Magazine anniversary edition \u2014 27 pages celebrating 35 years since the first female day students arrived in 1968. Edited by Sharon Gaudreau.',
  alternates: { canonical: '/archive/mission-accomplished' },
  openGraph: {
    title: 'Mission Accomplished \u2014 Pomfret Celebrates 35 Years of Coeducation',
    description:
      'Profiles of the trailblazers who arrived at Pomfret with \u201Ca few curlers and a lot of courage.\u201D',
    type: 'article',
  },
};

export default function MissionAccomplishedPage() {
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <MissionAccomplishedView />
    </>
  );
}
