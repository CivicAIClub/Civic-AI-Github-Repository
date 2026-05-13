import type { Metadata } from 'next';
import ArchiveView from './ArchiveView';

export const metadata: Metadata = {
  title: 'Magazine Archive',
  description:
    'Original archival issues of Pomfret Magazine documenting the school\u2019s DEI history \u2014 \u201CPomfret in the Civil Rights Era\u201D (Fall 2005) and \u201CMission Accomplished: 35 Years of Coeducation\u201D (September 2003).',
  alternates: { canonical: '/archive' },
  openGraph: {
    title: 'Magazine Archive · Pomfret Voices',
    description: 'Two full issues of Pomfret Magazine preserved in their original form.',
    type: 'website',
  },
};

export default function ArchivePage() {
  return <ArchiveView />;
}
