import type { Metadata } from 'next';
import HumansView from './HumansView';

export const metadata: Metadata = {
  title: 'Humans of Pomfret',
  description:
    'Real profiles of Pomfret School trailblazers — John Irick \u201965, Naomi Vega \u201969, the Original Six of \u201968, and other figures drawn from archival magazines.',
  alternates: { canonical: '/humans-of-pomfret' },
  openGraph: {
    title: 'Humans of Pomfret',
    description:
      'Short, powerful profiles of the pioneers who shaped diversity, equity, and inclusion at Pomfret School.',
    type: 'website',
  },
};

export default function HumansOfPomfretPage() {
  return <HumansView />;
}
