'use client';

import Image from 'next/image';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type Head = {
  name: string;
  initials: string;
  years: string;
  era: 'founding' | 'early' | 'midcentury' | 'modern' | 'contemporary';
  bio: string;
  image?: string;
  imageCredit?: string;
};

// Corrected Heads of School list — sourced from the official Pomfret DEI history PDF
// and cross-referenced with "Mission Accomplished" (September 2003) and
// "Pomfret in the Civil Rights Era" (Fall 2005).
const heads: Head[] = [
  {
    name: 'William E. Peck',
    initials: 'WP',
    years: '1894-1897',
    era: 'founding',
    image: '/heads/william-e-peck.png',
    imageCredit: 'pomfret.org/about-us/history',
    bio: 'Founded Pomfret School with his wife Harriet on October 3, 1894, opening with 42 male students and six faculty in the Charles Grosvenor Inn. Peck died of pneumonia on February 7, 1897. His wife Harriet and three daughters — Esther, Rachel, and Margaret — were the only females to grace Pomfret at that time, as recalled in The Pontefract: "our new matron, Mrs. F.H. Jones, and we wish her all success in her life among us."',
  },
  {
    name: 'William Beach Olmsted',
    initials: 'WO',
    years: '1897-1929',
    era: 'founding',
    bio: 'Succeeded Peck and formalized the school\'s name as "Pomfret School" in 1899. Under Olmsted, architect Ernest Flagg designed a campus master plan (1905), and the school grew to include Clark Memorial Chapel, a gymnasium, dormitories, and other facilities.',
  },
  {
    name: 'Dexter K. Strong',
    initials: 'DS',
    years: '1942-1951',
    era: 'early',
    bio: 'Expanded Pomfret\'s regional scholarship program, broadening the school\'s reach beyond its traditional base. By 1948, enrollment peaked at 151 students drawn from 11 states, the District of Columbia, one U.S. territory, and four foreign countries.',
  },
  {
    name: 'David Twichell',
    initials: 'DT',
    years: '1951-1961',
    era: 'midcentury',
    image: '/heads/david-twichell.png',
    imageCredit: 'pomfret.org/about-us/history',
    bio: 'Introduced innovative educational practices, positioning Pomfret as a leader in progressive boarding school reforms. New facilities under Twichell included Main House (1956) and the Monell Science Building (1958).',
  },
  {
    name: 'Joseph "Jay" Milnor',
    initials: 'JM',
    years: '1961-1973',
    era: 'midcentury',
    image: '/heads/jay-milnor.jpg',
    imageCredit: 'Mission Accomplished (September 2003)',
    bio: 'The "Founding Father of Coeducation." Under Milnor, Pomfret admitted its first African American student (John Irick \'65) in 1964, joined the National Scholarship Service in 1964, and became a Charter Member of A Better Chance in 1963. The Board of Trustees voted in February 1968 to admit female day students; the first arrived that fall. His daughter Susette \'74 was among the first to board. In the book The Spirit that is Pomfret, Brad Pearson \'65 and Emerson Stone \'45 described his twelve-year tenure as "the years of challenge." Retired to Istanbul, Turkey (1978-1986) as Headmaster of Roberts Academy.',
  },
  {
    name: 'Kenneth Deitch',
    initials: 'KD',
    years: '1973-1976',
    era: 'midcentury',
    bio: 'Oversaw Pomfret\'s first official institutional financial aid package (1975), a critical step toward making the school accessible to students from a broader range of socioeconomic backgrounds. This occurred during a period of severe financial difficulty.',
  },
  {
    name: 'Rev. Burton A. MacLean',
    initials: 'BM',
    years: '1976-1979',
    era: 'midcentury',
    bio: 'Launched the "Promise to Posterity" capital campaign in 1977, a $2.5 million effort to eliminate debts and grow the endowment. The campaign helped stabilize the institution after the school\'s worst financial crisis in eight decades.',
  },
  {
    name: 'Patrick Bassett',
    initials: 'PB',
    years: '1989-1992',
    era: 'modern',
    bio: 'Appointed the school\'s first Dean of Women, described as "an instigator for raising the consciousness of women\'s issues." Authorized the formation of a campus chapter of the Council for Women in Independent Schools. Recruited Michael Gary \'82 to return as Director of Multicultural Affairs. Later became president of the National Association of Independent Schools (NAIS).',
  },
  {
    name: "Bradford P. Hastings '68",
    initials: 'BH',
    years: '1992-2011',
    era: 'modern',
    bio: 'Pomfret alum and former headmaster who completed the transition to full coeducation in 1992 — 24 years after the first female day students were admitted. Coached the earliest girls\' ice hockey team in 1973. Presented the first Pomfret Bowl to a female recipient (Jessica Birdsall \'77) years earlier. Oversaw dramatic expansion of DEI infrastructure, international programs, and financial aid.',
  },
  {
    name: 'J. Timothy Richards',
    initials: 'TR',
    years: '2011-2025',
    era: 'contemporary',
    image: '/heads/tim-richards.jpg',
    imageCredit: 'pomfret.org blog',
    bio: 'Launched "The Pomfret Purpose" strategic plan (2013) and "Change Makers and Problem Solvers" (2022-2027), both embedding DEI into institutional goals. Announced Pomfret School received A Better Chance\'s Legacy Award in 2013. Navigated the school through the 2020 racial reckoning and COVID-19. Announced his departure in January 2024.',
  },
  {
    name: 'Heather Willis Daly',
    initials: 'HD',
    years: '2025-present',
    era: 'contemporary',
    image: '/heads/heather-willis-daly.jpg',
    imageCredit: 'pomfret.org blog',
    bio: 'Pomfret\'s 13th Head of School and the first woman to hold the position in the school\'s 131-year history. Wellesley College graduate with an MS in management. Chairs the NAIS Financial Aid Task Force. Previously associate head at Laurel School in Shaker Heights, Ohio. Formally installed at a ceremony on September 26, 2025.',
  },
];

// Stylized portrait per era — maps to a gradient and tint that evokes the time period
const eraStyles: Record<Head['era'], { bg: string; ring: string; text: string; subtitle: string }> = {
  founding:      { bg: 'bg-gradient-to-br from-cream-dark to-mist',       ring: 'ring-mist',             text: 'text-pomfret-navy/80', subtitle: 'sepia-[0.3]' },
  early:         { bg: 'bg-gradient-to-br from-linen to-cream-dark',      ring: 'ring-mist',             text: 'text-pomfret-navy/80', subtitle: 'sepia-[0.15]' },
  midcentury:    { bg: 'bg-gradient-to-br from-pomfret-navy to-navy',     ring: 'ring-pomfret-navy/20', text: 'text-warm-white',       subtitle: '' },
  modern:        { bg: 'bg-gradient-to-br from-maroon-dark to-maroon',    ring: 'ring-maroon/20',        text: 'text-warm-white',       subtitle: '' },
  contemporary:  { bg: 'bg-gradient-to-br from-maroon to-pomfret-navy',   ring: 'ring-maroon/30',        text: 'text-warm-white',       subtitle: '' },
};

export default function HeadsOfSchoolPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumb strip */}
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
              { href: '/humans-of-pomfret/heads-of-school', label: 'Heads of School' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="py-16 lg:py-24 bg-navy">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/humans-of-pomfret"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm font-body mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back to Humans of Pomfret
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-maroon-light/60" />
            <span className="text-[11px] font-body font-bold tracking-[0.3em] uppercase text-maroon-light">
              Leadership Archive
            </span>
          </div>
          <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-cream mb-4">
            <span className="font-bold">Heads</span>{' '}
            <span className="font-normal text-cream/60">of School</span>
          </h1>
          <p className="text-lg text-cream/70 max-w-2xl font-body leading-relaxed">
            The leaders who shaped Pomfret School across 131 years of history, sourced
            from official school archives and the September 2003 &ldquo;Mission Accomplished&rdquo;
            anniversary edition of <em>Pomfret Magazine</em>.
          </p>
        </div>
      </section>

      {/* Heads list */}
      <section className="py-12 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 lg:space-y-10">
            {heads.map((head, i) => {
              const style = eraStyles[head.era];
              return (
                <ScrollReveal key={head.name} delay={(i % 6) * 0.05}>
                  <article className="grid grid-cols-[100px_1fr] sm:grid-cols-[160px_1fr] lg:grid-cols-[200px_1fr] gap-5 sm:gap-8 lg:gap-12 items-start">
                    {/* Portrait card — real photo if available, otherwise styled initials */}
                    <div
                      className={`aspect-[3/4] rounded-sm overflow-hidden relative flex items-center justify-center ring-1 ${style.ring} shadow-sm ${
                        head.image ? 'bg-cream' : `${style.bg} ${style.subtitle}`
                      }`}
                    >
                      {head.image ? (
                        <>
                          <Image
                            src={head.image}
                            alt={`Portrait of ${head.name}`}
                            fill
                            sizes="(max-width: 640px) 100px, (max-width: 1024px) 160px, 200px"
                            className="object-cover"
                          />
                          {/* Era ribbon */}
                          <div className="absolute bottom-0 inset-x-0 h-px bg-maroon" />
                        </>
                      ) : (
                        <>
                          {/* Subtle texture overlay */}
                          <div
                            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                            style={{
                              backgroundImage:
                                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
                            }}
                          />
                          <div className="relative text-center p-4" aria-hidden="true">
                            <div className={`font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-none ${style.text}`}>
                              {head.initials}
                            </div>
                            <div className={`mt-2 sm:mt-3 text-[8px] sm:text-[10px] font-body font-bold tracking-[0.2em] uppercase ${style.text} opacity-70`}>
                              {head.years}
                            </div>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 h-px bg-maroon" />
                        </>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="pt-1 lg:pt-3">
                      <div className="text-[11px] font-body font-bold tracking-[0.2em] uppercase text-maroon mb-2">
                        {head.years}
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl lg:text-[2rem] leading-[1.15] text-navy mb-4">
                        {head.name}
                      </h2>
                      <p className="text-sm sm:text-base text-slate font-body leading-relaxed">
                        {head.bio}
                      </p>
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Context footer */}
      <section className="py-12 border-t border-mist bg-cream">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
            A Note on Portraits
          </div>
          <p className="text-sm text-slate font-body leading-relaxed">
            Authenticated photographs of five heads — William E. Peck, David Twichell, Joseph &ldquo;Jay&rdquo; Milnor,
            J. Timothy Richards, and Heather Willis Daly — are sourced from the Pomfret School public archives
            and the September 2003 anniversary edition of <em>Pomfret Magazine</em>.
            Where a verified photograph has not yet been located, an initials placeholder is displayed against
            an era-keyed palette: sepia for the founding decades, navy for the mid-century years, and crimson for the modern era.
          </p>
        </div>
      </section>
    </div>
  );
}
