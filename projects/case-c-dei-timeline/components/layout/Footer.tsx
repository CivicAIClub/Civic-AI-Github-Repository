import Link from 'next/link';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { href: '/timeline', label: 'Diversity Timeline' },
      { href: '/chapel-voices', label: 'Chapel Voices' },
      { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
      { href: '/tour', label: 'Campus Tour' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { href: '/famous-figures', label: 'Famous Figures' },
      { href: '/ai-bias', label: 'AI Bias Awareness' },
      { href: '/humans-of-pomfret/heads-of-school', label: 'Heads of School' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-cream/80" role="contentinfo">
      {/* Bias Acknowledgment Banner */}
      <div className="bg-navy-dark border-b border-cream/10">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-cream/60 text-center font-body">
            Pomfret School acknowledges that AI tools carry inherent biases.
            We are committed to authentic representation.{' '}
            <Link
              href="/ai-bias"
              className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold font-display font-bold text-lg">P</span>
              </div>
              <div>
                <div className="font-display font-bold text-cream text-lg">
                  Pomfret Voices
                </div>
                <div className="text-xs text-cream/50 tracking-wider uppercase">
                  Diversity, Equity & Inclusion
                </div>
              </div>
            </div>
            <p className="text-sm text-cream/60 max-w-md leading-relaxed">
              A living archive celebrating the diverse voices, histories, and stories
              that shape the Pomfret School community. Founded 1894, Pomfret, Connecticut.
            </p>
          </div>

          {/* Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-display font-semibold text-cream text-sm tracking-wider uppercase mb-4">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} Pomfret School. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/ai-bias"
              className="text-xs text-cream/40 hover:text-gold transition-colors"
            >
              AI Ethics
            </Link>
            <span className="text-cream/20">|</span>
            <span className="text-xs text-cream/40">
              Accessibility Commitment: WCAG 2.1 AA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
