import type { Metadata } from 'next';
import AIBiasView from './AIBiasView';

export const metadata: Metadata = {
  title: 'AI Bias Awareness',
  description:
    'How AI systems lighten skin tones, straighten hair textures, and narrow facial features \u2014 and what Pomfret School is doing to document and counter these biases.',
  alternates: { canonical: '/ai-bias' },
  openGraph: {
    title: 'AI Bias Awareness \u00b7 Pomfret Voices',
    description:
      'An educational module on how AI defaults to Western beauty standards and erases cultural identity, with real research citations and an interactive quiz.',
    type: 'article',
  },
};

export default function AIBiasPage() {
  return <AIBiasView />;
}
