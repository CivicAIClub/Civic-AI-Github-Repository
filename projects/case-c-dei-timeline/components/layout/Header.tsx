'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Matches pomfret.org's main nav structure — single-level dropdowns
const navItems: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  {
    href: '/timeline',
    label: 'Timeline',
    children: [
      { href: '/timeline', label: 'Full DEI Timeline' },
      { href: '/humans-of-pomfret/heads-of-school', label: 'Heads of School' },
    ],
  },
  {
    href: '/humans-of-pomfret',
    label: 'Humans of Pomfret',
    children: [
      { href: '/humans-of-pomfret', label: 'All Profiles' },
      { href: '/humans-of-pomfret/heads-of-school', label: 'Heads of School' },
    ],
  },
  {
    href: '/archive',
    label: 'Archive',
    children: [
      { href: '/archive/civil-rights-era', label: 'Civil Rights Era (2005)' },
      { href: '/archive/mission-accomplished', label: 'Mission Accomplished (2003)' },
    ],
  },
  { href: '/tour', label: 'Campus Tour' },
  { href: '/famous-figures', label: 'Schwartz Fellows' },
  { href: '/ai-bias', label: 'AI & Bias' },
];

// Top utility bar — mimics pomfret.org's "MY POMFRET" / Admissions / Support row
const utilityLinks = [
  { href: 'https://www.pomfret.org', label: 'Pomfret.org', external: true },
  { href: 'https://www.pomfret.org/admissions', label: 'Admissions', external: true },
  { href: 'mailto:dei@pomfretschool.org', label: 'Contact DEI' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top announcement bar (pomfret.org-style red strip) */}
      <div className="bg-maroon text-warm-white text-[11px] font-body tracking-[0.15em] py-2 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 uppercase">
          <span>A Living Archive of Diversity, Equity &amp; Inclusion at Pomfret School</span>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Utility bar — pomfret.org-style top row */}
      <div className="hidden lg:block bg-warm-white border-b border-mist/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-6 h-8">
          {utilityLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-pomfret-navy hover:text-maroon transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main header */}
      <div className="bg-warm-white/95 backdrop-blur-md border-b border-mist/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link
              href="/"
              className="flex flex-col group flex-shrink-0"
              aria-label="Pomfret Voices - Home"
            >
              <div className="font-display text-2xl lg:text-3xl text-navy tracking-tight leading-none">
                POMFRET
              </div>
              <div className="h-0.5 bg-maroon w-full mt-1" />
              <div className="text-[10px] text-pomfret-gray tracking-[0.2em] uppercase mt-1 hidden sm:block">
                Voices &middot; DEI Archive
              </div>
            </Link>

            {/* Desktop Nav with single-level dropdowns */}
            <nav className="hidden lg:flex items-center" aria-label="Main navigation">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.href)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className="px-3 xl:px-4 py-2 text-[13px] xl:text-sm font-body font-semibold text-pomfret-navy hover:text-maroon transition-colors duration-200 tracking-wide inline-flex items-center gap-1"
                  >
                    {item.label}
                    {item.children && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className={`transition-transform ${openDropdown === item.href ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      >
                        <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                  <AnimatePresence>
                    {item.children && openDropdown === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-1 min-w-[240px] bg-warm-white border border-mist shadow-lg rounded-sm py-2 z-50"
                      >
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm font-body text-pomfret-navy hover:text-maroon hover:bg-cream transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right: CTA buttons (pomfret.org-style Inquire/Visit/Apply) */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              <Link
                href="/archive"
                className="hidden lg:inline-flex items-center px-4 py-2 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon border border-maroon hover:bg-maroon hover:text-warm-white transition-colors rounded-sm"
              >
                Explore
              </Link>
              <Link
                href="/timeline"
                className="hidden lg:inline-flex items-center px-4 py-2 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-warm-white bg-maroon hover:bg-maroon-dark transition-colors rounded-sm"
              >
                Timeline
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-cream transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span
                    className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${
                      mobileOpen ? 'rotate-45 translate-y-2' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${
                      mobileOpen ? 'opacity-0' : ''
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-6 bg-navy transition-all duration-300 ${
                      mobileOpen ? '-rotate-45 -translate-y-2' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu — pomfret.org-style red full-panel overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:hidden fixed top-16 right-0 bottom-0 w-full sm:w-[420px] bg-maroon overflow-y-auto"
            aria-label="Mobile navigation"
          >
            <div className="px-6 py-8 space-y-1">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-2 py-3 text-2xl font-display text-warm-white border-b border-warm-white/10 transition-colors hover:text-cream"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}

              {/* Utility links at bottom */}
              <div className="pt-8 mt-4 border-t border-warm-white/20 space-y-2">
                {utilityLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="block px-2 py-2 text-xs font-body font-bold tracking-[0.15em] uppercase text-warm-white/80 hover:text-warm-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="pt-6 grid grid-cols-2 gap-3">
                <Link
                  href="/archive"
                  className="text-center py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-maroon bg-warm-white hover:bg-cream transition-colors rounded-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Explore
                </Link>
                <Link
                  href="/timeline"
                  className="text-center py-3 text-[11px] font-body font-bold tracking-[0.15em] uppercase text-warm-white border border-warm-white hover:bg-warm-white hover:text-maroon transition-colors rounded-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  Timeline
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
