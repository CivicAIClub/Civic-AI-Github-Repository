import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3 } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
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
    'chapel voices',
    'timeline',
    'living archive',
  ],
  openGraph: {
    title: 'Pomfret Voices | Diversity, Equity & Inclusion',
    description:
      'A living archive celebrating the diverse voices, histories, and stories that shape the Pomfret School community.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable}`}>
      <body className="font-body antialiased bg-warm-white text-charcoal">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-cream focus:rounded-lg"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="pt-16 lg:pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
