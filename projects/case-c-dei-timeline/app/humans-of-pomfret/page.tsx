'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Historical alumni profiles sourced from two archival magazines:
// - "Pomfret in the Civil Rights Era: More Than Four Decades of Diversity" (Fall 2005)
// - "Mission Accomplished: Pomfret School Celebrates 35 Years of Coeducation" (September 2003)
const profiles = [
  {
    _id: 'john-irick',
    name: 'John Irick',
    slug: 'john-irick',
    role: 'Alum',
    classYear: "'65",
    quote: '"For me, Pomfret was a dream come true; it provided an opportunity for an excellent education but more importantly, a chance to demonstrate that students committed to exercising mutual respect for each other, regardless of their race, could live, study, and play together."',
    bio: 'First African American student to enroll at Pomfret (Fall 1964) and the first to graduate (June 1965). Born in Calhoun County, SC in 1947 and raised in Orangeburg. Attended Northeastern University and Boston College Law School. Returned in 2005 for the 40th anniversary of his matriculation to receive the "First Step Towards Diversity" plaque from VOICE.',
    yearsAtPomfret: '1964-1965',
    tags: ['Civil Rights', 'First', 'Pioneer', 'Law'],
    image: '/archive/portraits/john-irick-1965.jpg',
    source: 'Pomfret in the Civil Rights Era (Fall 2005)',
  },
  {
    _id: 'frank-mwine',
    name: 'Frank Mwine',
    slug: 'frank-mwine',
    role: 'Alum',
    classYear: "'61",
    quote: '"To kill the lion of misunderstanding."',
    bio: 'Ugandan-born student and the first Black student to take a diploma on the Hilltop, preceding John Irick by half a decade. Attended Pomfret for one year. At graduation, Mwine presented Pomfret with a traditional African spear. His legacy lived on in a display outside Headmaster Brad Hastings\'s office.',
    yearsAtPomfret: '1960-1961',
    tags: ['International', 'First', 'Pioneer', 'Heritage'],
    source: 'Pomfret in the Civil Rights Era (Fall 2005)',
  },
  {
    _id: 'naomi-vega',
    name: 'Naomi Vega, PhD',
    slug: 'naomi-vega',
    role: 'Alum',
    classYear: "'69",
    quote: '"It was a time of major upheaval in the country as a whole, and it was a bad time at Pomfret as well. We had rabble-rousers: a kid stealing from a faculty member\'s apartment, another slashing tires — tough years."',
    bio: 'Puerto Rican, female, poor, Catholic, controversial, assertive, and proud — the first female to receive a diploma from Pomfret School (June 1969) and the only girl in her graduating class. Selected through the ASPIRA program. After graduation, earned degrees from Brandeis, CUNY, and University of Puerto Rico (PhD). Became professor of English Education at the Catholic University of the Sacred Heart, San Juan, Puerto Rico.',
    yearsAtPomfret: '1968-1969',
    tags: ['Coeducation', 'First', 'Pioneer', 'Puerto Rico'],
    image: '/archive/portraits/naomi-vega.jpg',
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'joan-strong-buell',
    name: 'Joan Strong Buell',
    slug: 'joan-strong-buell',
    role: 'Alum',
    classYear: "'50",
    quote: '"I look back on Pomfret as a \'happiest\' place."',
    bio: 'Daughter of beloved Pomfret headmaster Bronson Strong, Joan became the first female student in the classroom at Pomfret. Her parents asked the board of trustees if she could attend Main House (eighth grade), and she then continued for the second form. Later earned a B.A. in Music from Smith College, M.A. in Psychology from Wheaton, and attended Portland State. Retired teacher and hospice administrator.',
    yearsAtPomfret: '1945-1946',
    tags: ['Coeducation', 'First', 'Faculty Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'robin-downing-whitney',
    name: 'Robin Downing Whitney',
    slug: 'robin-downing-whitney',
    role: 'Alum',
    classYear: "'60",
    quote: '"Being at Pomfret taught me that if I could be heard, understood and accepted in such a tough, challenging, and male environment, I was really my whole life, and that second form created another dimension. Many people in the class of \'60 are still professional and personal friends."',
    bio: 'Daughter of Pomfret dean Dolph Downing. Attended for the sixth form (senior year), 1959-1960. One of a handful of Pomfret daughters allowed to attend classes. Later earned a B.A. in English from Wheaton College. Community volunteer and artist in Worcester, Massachusetts.',
    yearsAtPomfret: '1959-1960',
    tags: ['Coeducation', 'Faculty Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'barbara-lazear-ascher',
    name: 'Barbara Lazear Ascher',
    slug: 'barbara-lazear-ascher',
    role: 'Alum',
    classYear: "'64",
    quote: '"Pomfret taught me what a community of adults — generous with their time, thoughts, and talents — can do for youth."',
    bio: 'Daughter of Pomfret English master Robert Lazear. One of three girls from Pomfret Community School chosen to attend Kingswood-Oxford School in West Hartford. An accomplished author of several books including Landscape Without Gravity, Playing After Dark, and The Habit of Living. Columnist for The New York Times, with work published in Vogue, The Yale Review, and Gourmet.',
    yearsAtPomfret: '1962-1964',
    tags: ['Coeducation', 'Literature', 'Faculty Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'linda-parquette',
    name: 'Linda Parquette',
    slug: 'linda-parquette',
    role: 'Alum',
    classYear: "'64",
    quote: '"Pomfret teachers brought out the best in me academically, teaching me to discover and have confidence in my own potential rather than compare myself to others."',
    bio: 'Daughter of Pomfret English Chair and beloved coach Bill Parquette. Escaped the shyness of being the only girl with a student body of two hundred. Finished at Woodstock Academy in 1964. Later: B.A. University of Pennsylvania, M.S. UMASS Amherst \'74. Regional Planner for the Southeastern Connecticut Council of Governments.',
    yearsAtPomfret: '1962-1964',
    tags: ['Coeducation', 'Faculty Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'susette-milnor',
    name: 'Susette Milnor',
    slug: 'susette-milnor',
    role: 'Alum',
    classYear: "'74",
    quote: '"I didn\'t have the sense that there was hostility or unhappiness; just a very normal, understandable resistance to change."',
    bio: 'Daughter of headmaster Jay Milnor. Credited with helping introduce the first true organized sport for girls at Pomfret — soccer — in the fall of \'68 upon her freshman arrival. The team was coached by Hagop Merjian (Pomfret faculty 1961-1999) who would become a legendary mentor. Later earned a B.A. Social Psychology (Tufts), M.A. Social Work (Simmons). Psychotherapist in an all-women private group practice.',
    yearsAtPomfret: '1968-1974',
    tags: ['Coeducation', 'Athletics', 'Headmaster Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'margaret-lamb',
    name: 'Dr. Margaret Lamb',
    slug: 'margaret-lamb',
    role: 'Alum',
    classYear: "'74",
    quote: '"I never considered myself to be the first female Editor-in-Chief of The Pontefract, but no one was going to be up-set if you realized it wasn\'t your thing. I was a left-footed, slightly tone deaf farm girl when I arrived at Pomfret, but I had the lead in musicals and played soccer."',
    bio: 'First female Editor-in-Chief of The Pontefract, editing the November 4, 1972 article titled "The Integration of Coeducation." Earned degrees from Harvard (A.B., cum laude), University of Reading (Ph.D., \'98), and is now University Academic at Warwick Business School, University of Warwick, Coventry, England.',
    yearsAtPomfret: '1970-1974',
    tags: ['Coeducation', 'First', 'Journalism'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'jessica-birdsall',
    name: 'Jessica Birdsall',
    slug: 'jessica-birdsall',
    role: 'Alum',
    classYear: "'77",
    quote: '"Having my name on the bowl makes it that much easier for another female athlete to have hers there too. It opens possibilities. It\'s not just winning the award — you feel good about the work leading up to it. That you\'re part of a team, part of something larger than yourself."',
    bio: 'First female recipient of the Pomfret Bowl, awarded at the Class of 1977 graduation. Presented by Coach Brad Hastings. A standout in girls\' basketball, soccer, and girls\' crew, and one of eighty-six names before the first female name jumped out. Earned B.A. in Government & Political Science from Bowdoin \'81. Litigation Support Supervisor, San Francisco, CA.',
    yearsAtPomfret: '1973-1977',
    tags: ['Coeducation', 'First', 'Athletics'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'carla-jean-smith',
    name: 'Lt. Col. Carla Jean Smith',
    slug: 'carla-jean-smith',
    role: 'Alum',
    classYear: "'72",
    quote: '"I never thought my daughter would go to Pomfret, because she always wanted things \'separate, equal, and just.\'"',
    bio: 'Lieutenant Colonel, Retired, United States Army. Arrived at Pomfret as one of the first six women to board from the United States. Served with Peace Corps, UCLA, Army Corps of Engineers, 11th Signal Battalion, 7th Signal Command, Letterkenny Depot in Pennsylvania. A concurrent assignment was a two-year term as the Chancellor\'s Advisory Council on the Academic Deans, including command positions in Colombia, Bolivia, Ecuador, Panama. Recipient of the Meritorious Service Medal, the Defense Meritorious Service Medal, and numerous Army Commendation medals.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Military', 'Original Six'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'mary-albro',
    name: 'Mary Albro',
    slug: 'mary-albro',
    role: 'Alum',
    classYear: "'72",
    quote: '"Pomfret School was an oasis...a place where I felt I could use all my smarts."',
    bio: 'Attended with her cousin from 1968-1972. Mary has continued to maintain the very highest standards of academic excellence throughout her life. Later: B.A. University of Connecticut \'76, Master of Library Science \'79, Southern Connecticut State College. Co-manager of Information and Reference Services, Hartford Public Library. Volunteers as an outreach worker for environmental education through the Connecticut Department of Environmental Protection\'s Master Wildlife Conservationist Program.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Original Six', 'Library'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'michelle-bourgeois',
    name: 'Dr. Michelle Bourgeois',
    slug: 'michelle-bourgeois',
    role: 'Alum',
    classYear: "'72",
    quote: '"Being a resident of Pomfret, I am well acquainted with the fine reputation of Pomfret School. Also, as a Service family, which necessitates frequent relocations, we are well aware of the importance of an environment that will academically challenge our children as well as provide an ambitious scholastic, socially and physically. My husband is expecting an unaccompanied tour of duty this summer."',
    bio: 'In the book, The Spirit that is Pomfret, by Brad Pearson \'65 and Emerson Stone \'45, the twelve-year tenure of Joseph Kirkbride Milnor is described as "the years of challenge." Despite her father\'s Pentagon assignments, Michelle graduated with her one brother, Andrew \'03. Received her Master\'s degree in Regional Planning from UMASS at Amherst in 1975. Currently: Professor of Communication Disorders, Florida State University. Bachelor\'s in Linguistics and French \'76, M.S. Speech and Hearing Sciences \'78, Ph.D. University of Pittsburgh \'83.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Original Six', 'Academia'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'mary-valentine-feathers',
    name: 'Mary Valentine Feathers',
    slug: 'mary-valentine-feathers',
    role: 'Alum',
    classYear: "'72",
    quote: '"I have to say a special thank you to my English teacher, Don Hinman. I was so thoroughly prepared for college English, I was able to take sophomore English in my freshman year. During that class when my professor asked, \'Who has read such-and-such?\' My hand went up... and went up. I remember feeling like I was so far ahead of the game."',
    bio: 'Entered Pomfret with precocious sixth form ambitions. Her class includes Andrew \'03 and Stephen \'05 (her sons). Conference planner for teachers and young scholars in the educational psychology department at UCONN. B.S., Biology, St. Lawrence University \'76, Master of Anthropology, University of Wyoming \'83.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Original Six', 'Education'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'lindsey-cole-miesmer',
    name: 'Lindsey Cole Miesmer',
    slug: 'lindsey-cole-miesmer',
    role: 'Alum',
    classYear: "'72",
    quote: '"It\'s been great to watch Izzie flourish at Pomfret. Lindsey said of her niece. I love knowing that the Pomfret girls of today feel that the school has always been coed. They don\'t realize that an entirely different atmosphere existed not that long ago. I think it\'s a testament to how far Pomfret School has come in establishing itself as an excellent boarding and day school for girls."',
    bio: 'Daughter of Pomfret art teacher, crew coach, and long-time legend Chick Cole "Propeller." Beyond being a regular teenager dealing with teenage issues — studying, socializing, establishing friendships, and hoping for acceptance. The Susette Milnor sister became eventually, it did work. Creating a Cole family legacy when her daughter, Elizabeth "Izzie" Butch entered Pomfret in 2001. Later: B.A. Wheaton College \'76, M.A. Fairfield University, 2000. Occupation: Marriage and Family Therapist.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Original Six', 'Faculty Daughter'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'eve-geissinger',
    name: 'B. Eve Geissinger',
    slug: 'eve-geissinger',
    role: 'Alum',
    classYear: "'72",
    quote: '"I recall the first two years being very difficult for Eve."',
    bio: 'Class of 1972 (1954-1992). Eldest daughter of Pomfret music teacher Warren Geissinger (faculty 1956-1975), who taught from 1956-1975, and his wife Barbara, who taught music at Pomfret Community School. Served as an advisor to the early females of Pomfret School from 1968 to 1970. Tragically, Eve was killed by a drunk driver on June 8, 1992, at the age of thirty-eight. Her father graciously agreed to share his recollections. Later: B.A., English, graduated magna cum laude from Brown University \'76. State of Connecticut Scholar in 1972. Working on her Master\'s degree in Social Work at Smith College at the time of her death.',
    yearsAtPomfret: '1968-1972',
    tags: ['Coeducation', 'Original Six', 'In Memoriam'],
    source: 'Mission Accomplished (September 2003)',
  },
  {
    _id: 'hagop-merjian',
    name: 'Hagop Merjian',
    slug: 'hagop-merjian',
    role: 'Faculty',
    quote: '"Be tougher than you look." (As remembered by his 1974 girls\' soccer team)',
    bio: 'Pomfret faculty 1961-1999, serving as on-site director of SPHERE (Supplementary Program in Hartford for Educational Reinforcement and Enrichment). Introduced the first true organized sport for girls at Pomfret — soccer — in the fall of 1968. Coached "Merjian\'s Maulers," the first girls\' soccer team that kicked up a storm in 1974. Teams earned the distinction of scoring the first goal of the first game in the second season of play, and won the team captain and top scorer of the 1971-72 season. His brand of passion for writing, drama, and public speaking were elements of his pedagogy. His dedication to the "least of these" was unparalleled.',
    yearsAtPomfret: '1961-1999',
    tags: ['Faculty', 'SPHERE', 'Coach', 'Mentor'],
    source: 'Mission Accomplished (September 2003) & Pomfret in the Civil Rights Era (Fall 2005)',
  },
];

const roles = ['All', 'Alum', 'Faculty'];

export default function HumansOfPomfretPage() {
  const [activeRole, setActiveRole] = useState('All');

  const filtered = profiles.filter(
    (p) => activeRole === 'All' || p.role === activeRole
  );

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="pt-10 lg:pt-14 pb-16 lg:pb-24 bg-cream">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/humans-of-pomfret', label: 'Humans of Pomfret' },
            ]}
            className="mb-8"
          />
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                Portraits &amp; Stories
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
                <span className="font-bold">Humans</span>{' '}
                <span className="text-pomfret-gray">of Pomfret</span>
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Real people from Pomfret&apos;s history — trailblazers, pioneers, and quiet
                agents of change drawn directly from the pages of{' '}
                <em>Pomfret in the Civil Rights Era</em> (Fall 2005) and{' '}
                <em>Mission Accomplished: 35 Years of Coeducation</em> (September 2003).
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by role">
            {roles.map((role) => (
              <button
                key={role}
                role="tab"
                aria-selected={activeRole === role}
                onClick={() => setActiveRole(role)}
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-all ${
                  activeRole === role ? 'bg-navy text-cream' : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Cross-links */}
          <div className="flex flex-wrap gap-4 mt-3">
            <Link
              href="/humans-of-pomfret/heads-of-school"
              className="inline-flex items-center gap-2 text-sm text-maroon hover:text-maroon-dark font-body transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L13 5V13H1V5L7 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              Heads of School Archive
            </Link>
            <Link
              href="/archive"
              className="inline-flex items-center gap-2 text-sm text-maroon hover:text-maroon-dark font-body transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1.5" y="2" width="11" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 5H10M4 7H10M4 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Magazine Archive
            </Link>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <section className="py-12 lg:py-20">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((profile, i) => (
                <motion.div
                  key={profile._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: (i % 9) * 0.05 }}
                  className="break-inside-avoid"
                >
                  <Link
                    href={`/humans-of-pomfret/${profile.slug}`}
                    className="group block bg-cream rounded-2xl overflow-hidden museum-frame hover:shadow-xl transition-all duration-500"
                  >
                    {/* Portrait */}
                    {profile.image ? (
                      <div className="relative aspect-[3/4] bg-navy/5 overflow-hidden">
                        <Image
                          src={profile.image}
                          alt={`Portrait of ${profile.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-slate">
                          {profile.role}
                          {profile.classYear && <> &middot; {profile.classYear}</>}
                        </div>
                      </div>
                    ) : (
                      <div className={`relative bg-navy/5 flex items-center justify-center ${
                        i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'
                      }`}>
                        <div className="w-20 h-20 rounded-full bg-navy/10 flex items-center justify-center">
                          <span className="font-display text-2xl text-navy/30">
                            {profile.name
                              .replace(/^(Dr\.|Lt\. Col\.) /, '')
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </span>
                        </div>
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-slate">
                          {profile.role}
                          {profile.classYear && <> &middot; {profile.classYear}</>}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <blockquote className="font-display text-lg text-navy italic leading-snug mb-3">
                        {profile.quote.length > 160
                          ? profile.quote.slice(0, 160).trim() + '..."'
                          : profile.quote}
                      </blockquote>
                      <div className="font-body font-semibold text-navy text-sm">
                        {profile.name}
                      </div>
                      <div className="text-xs text-slate font-body">
                        {profile.yearsAtPomfret}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {profile.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-mist text-slate">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
