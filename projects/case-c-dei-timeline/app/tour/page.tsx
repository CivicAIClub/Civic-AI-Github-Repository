import type { Metadata } from 'next';
import TourIndexView from './TourIndexView';

export const metadata: Metadata = {
  title: 'Campus Overview',
  description:
    'A wide-angle campus overview of Pomfret School\u2019s 500-acre Hilltop, designed around aerial views, landscape change, and student privacy.',
  alternates: { canonical: '/tour' },
  openGraph: {
    title: 'Campus Overview \u00b7 Pomfret Voices',
    description: 'The Hilltop from above: campus scale, community, and then-and-now landscape change.',
    type: 'website',
  },
};

export default function TourPage() {
  return <TourIndexView />;
}
