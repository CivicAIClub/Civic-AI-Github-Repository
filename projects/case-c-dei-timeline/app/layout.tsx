import type { Metadata } from 'next';
import { DM_Serif_Display, Poppins } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MotionProvider from '@/components/ui/MotionProvider';
import JsonLd from '@/components/seo/JsonLd';
import './globals.css';

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// Prefer the explicit site URL from env so social previews always point at the real domain.
// Falls back to Vercel's deployment URL, or localhost during development.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Pomfret Voices | Diversity, Equity & Inclusion',
    template: '%s | Pomfret Voices',
  },
  description:
    'A living archive celebrating the diverse voices, histories, and stories that shape the Pomfret School community. Founded 1894, Pomfret, Connecticut.',
  keywords: [
    'Pomfret School',
    'diversity',
    'equity',
    'inclusion',
    'DEI',
    'timeline',
    'living archive',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pomfret Voices | Diversity, Equity & Inclusion',
    description:
      'A living archive celebrating the diverse voices, histories, and stories that shape the Pomfret School community.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Pomfret Voices',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomfret Voices | Diversity, Equity & Inclusion',
    description:
      'A living archive of diversity, equity, and inclusion at Pomfret School.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Baseline schema.org JSON-LD describing the site itself. Loaded on every page.
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Pomfret School',
      alternateName: 'Pomfret Voices',
      url: siteUrl,
      foundingDate: '1894-10-03',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '398 Pomfret Street, PO Box 128',
        addressLocality: 'Pomfret',
        addressRegion: 'CT',
        postalCode: '06258-0128',
        addressCountry: 'US',
      },
      telephone: '+1-860-963-6100',
      sameAs: ['https://www.pomfret.org'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Pomfret Voices',
      description:
        'A living archive of diversity, equity, and inclusion at Pomfret School.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${poppins.variable}`}>
      <body className="font-body antialiased bg-warm-white text-charcoal">
        <JsonLd data={organizationJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-cream focus:rounded-lg"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <Header />
          <main id="main-content">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
