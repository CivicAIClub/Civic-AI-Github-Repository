import type { Metadata } from 'next';
import TimelineView from './TimelineView';

export const metadata: Metadata = {
  title: 'The Arc of Inclusion · Timeline',
  description:
    'Interactive horizontal timeline of 31 milestone events in the history of diversity, equity, and inclusion at Pomfret School, from the 1894 founding through present day.',
  alternates: { canonical: '/timeline' },
  openGraph: {
    title: 'The Arc of Inclusion · Pomfret DEI Timeline',
    description:
      '130 years of milestone events — first African American graduate, first female graduate, VOICE founding, and the ongoing work of an inclusive community.',
    type: 'article',
  },
};

export default function TimelinePage() {
  return <TimelineView />;
}
