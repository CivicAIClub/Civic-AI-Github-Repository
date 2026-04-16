import Link from 'next/link';

// Matches pomfret.org's 4-column footer structure
const footerSections = [
  {
    title: 'Discover Pomfret',
    links: [
      { href: '/timeline', label: 'DEI Timeline', external: false },
      { href: '/humans-of-pomfret', label: 'Humans of Pomfret', external: false },
      { href: '/archive', label: 'Magazine Archive', external: false },
      { href: '/tour', label: 'Campus Tour', external: false },
      { href: '/famous-figures', label: 'Schwartz Fellows', external: false },
    ],
  },
  {
    title: 'Quicklinks',
    links: [
      { href: 'https://www.pomfret.org', label: 'Pomfret.org', external: true },
      { href: 'https://www.pomfret.org/about-us/dei', label: 'DEI at Pomfret', external: true },
      { href: 'https://www.pomfret.org/academics', label: 'Academics', external: true },
      { href: 'https://www.pomfret.org/admissions', label: 'Admissions', external: true },
      { href: '/ai-bias', label: 'AI & Bias', external: false },
      { href: '/humans-of-pomfret/heads-of-school', label: 'Heads of School', external: false },
    ],
  },
  {
    title: 'Information For',
    links: [
      { href: 'https://www.pomfret.org', label: 'Students', external: true },
      { href: 'https://www.pomfret.org', label: 'Parents', external: true },
      { href: 'https://www.pomfret.org', label: 'Faculty & Staff', external: true },
      { href: 'https://www.pomfret.org', label: 'Alumni', external: true },
    ],
  },
];

const socials = [
  {
    href: 'https://www.tiktok.com/@pomfretschool',
    label: 'TikTok',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
      </svg>
    ),
  },
  {
    href: 'https://www.instagram.com/pomfretschool',
    label: 'Instagram',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: 'https://www.youtube.com/@pomfretschool',
    label: 'YouTube',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.4 3.5 12 3.5 12 3.5s-7.4 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c2 .6 9.4.6 9.4.6s7.4 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-footer-bg text-warm-white/80" role="contentinfo">
      {/* Bias acknowledgment — top strip */}
      <div className="bg-black/40 border-b border-warm-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-warm-white/60 text-center font-body">
            Pomfret School acknowledges that AI tools carry inherent biases.
            We are committed to authentic representation.{' '}
            <Link
              href="/ai-bias"
              className="text-maroon-light hover:text-warm-white underline underline-offset-2 transition-colors"
            >
              Learn more
            </Link>
          </p>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact — first column */}
          <div>
            <Link href="/" className="block mb-5" aria-label="Pomfret Voices - Home">
              <div className="font-display text-3xl text-warm-white tracking-tight leading-none">
                POMFRET
              </div>
              <div className="h-0.5 bg-maroon w-full mt-1.5 mb-1.5" />
              <div className="text-[10px] text-warm-white/60 tracking-[0.2em] uppercase">
                Voices &middot; DEI Archive
              </div>
            </Link>
            <address className="not-italic text-sm text-warm-white/60 font-body leading-relaxed mb-4">
              398 Pomfret Street<br />
              PO Box 128<br />
              Pomfret, CT 06258-0128
            </address>
            <div className="text-sm text-warm-white/60 font-body space-y-1 mb-6">
              <div>
                <a href="tel:8609636100" className="hover:text-maroon-light transition-colors">
                  860.963.6100
                </a>
              </div>
              <div>
                <a href="tel:8609636120" className="hover:text-maroon-light transition-colors">
                  860.963.6120
                </a>{' '}
                <span className="text-warm-white/40">(admissions)</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-warm-white/20 text-warm-white/70 hover:text-warm-white hover:border-warm-white/50 hover:bg-warm-white/5 transition-colors flex items-center justify-center"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-body font-bold text-warm-white text-xs tracking-[0.15em] uppercase mb-5">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-warm-white/60 hover:text-maroon-light transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-warm-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-xs text-warm-white/40">
            &copy; {new Date().getFullYear()} Pomfret School. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-warm-white/40">
            <Link href="/ai-bias" className="hover:text-warm-white transition-colors">
              Accessibility
            </Link>
            <span className="text-warm-white/20">|</span>
            <Link href="/ai-bias" className="hover:text-warm-white transition-colors">
              AI Ethics
            </Link>
            <span className="text-warm-white/20">|</span>
            <a
              href="https://www.pomfret.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-warm-white transition-colors"
            >
              Main Site
            </a>
            <span className="text-warm-white/20">|</span>
            <span>WCAG 2.1 AA</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
