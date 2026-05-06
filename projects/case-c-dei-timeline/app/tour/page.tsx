import type { Metadata } from 'next';
import TourIndexView from './TourIndexView';

export const metadata: Metadata = {
  title: 'Campus Tour',
  description:
    'QR-powered campus tour with six stops \u2014 each location tells a story of community, inclusion, and institutional evolution at Pomfret School.',
  alternates: { canonical: '/tour' },
  openGraph: {
    title: 'Campus Tour \u00b7 Pomfret Voices',
    description: 'Scan, learn, connect. Six tour stops with bilingual audio narration.',
    type: 'website',
  },
};

export default function TourPage() {
  return <TourIndexView />;
}
