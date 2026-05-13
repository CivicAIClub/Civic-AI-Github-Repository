import type { Metadata } from 'next';
import HeadsView from './HeadsView';

export const metadata: Metadata = {
  title: 'Heads of School',
  description:
    'The 11 leaders who shaped Pomfret School from William E. Peck (1894) through Heather Willis Daly, the first woman to hold the position (2025\u2013present).',
  alternates: { canonical: '/humans-of-pomfret/heads-of-school' },
  openGraph: {
    title: 'Heads of School · Pomfret Voices',
    description:
      'Leadership since 1894 \u2014 from founder William E. Peck to Pomfret\u2019s first female Head of School, Heather Willis Daly.',
    type: 'article',
  },
};

export default function HeadsOfSchoolPage() {
  return <HeadsView />;
}
