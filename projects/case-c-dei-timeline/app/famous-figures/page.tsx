'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

type Fellow = {
  year: number;
  name: string;
  field: string;
  bio: string;
  image?: string;
  note?: string;
  gapYear?: boolean;
  gapReason?: string;
  flagged?: string;
};

// Complete roster of Schwartz Visiting Fellows (1989–2026)
// Sourced from Manus Research Report — April 13, 2026
// Order: newest first
const fellows: Fellow[] = [
  {
    year: 2026,
    name: 'Kobie Boykins',
    field: 'Aerospace Engineering (NASA)',
    image: '/fellows/2026_kobie_boykins.jpg',
    bio: 'Principal mechanical engineer at NASA\'s Jet Propulsion Laboratory who has worked on every Mars mission since 1996. Designed the solar arrays for the Mars rovers Spirit and Opportunity, led mobility teams for Curiosity, and currently serves as chief engineer on the Europa Clipper mission.',
  },
  {
    year: 2025,
    name: 'Bill T. Jones',
    field: 'Dance and Choreography',
    image: '/fellows/2025_bill_t_jones.jpg',
    bio: 'One of the most innovative dancers, directors, and choreographers of our time. Recipient of two Tony Awards, a MacArthur "Genius" Grant, Kennedy Center Honors, and the National Medal of Arts. His performances explore identity, race, and sexuality.',
  },
  {
    year: 2024,
    name: 'Ndaba Mandela',
    field: 'Humanitarian Leadership',
    image: '/fellows/2024_ndaba_mandela.jpg',
    bio: 'Grandson of Nelson Mandela and founder of the Mandela Institute for Humanity. Author of Going to the Mountain: Life Lessons from My Grandfather, Nelson Mandela, sharing wisdom from growing up with one of the twentieth century\'s most iconic leaders.',
  },
  {
    year: 2023,
    name: 'Jessica Bruder',
    field: 'Journalism and Nonfiction',
    image: '/fellows/2023_jessica_bruder.jpg',
    bio: 'Journalist covering subcultures for The New York Times, WIRED, and Harper\'s. Author of Nomadland: Surviving America in the Twenty-First Century, which was adapted into the Academy Award-winning film directed by Chloé Zhao.',
  },
  {
    year: 2022,
    name: 'Ming Tsai',
    field: 'Culinary Arts and Television',
    image: '/fellows/2022_ming_tsai.jpg',
    bio: 'Award-winning chef, restaurateur, and television host behind Blue Ginger, Blue Dragon, and PBS\'s Simply Ming. A Yale and Le Cordon Bleu graduate known for East-West fusion cuisine. His visit marked the program\'s return after the COVID-19 hiatus.',
  },
  {
    year: 2021,
    name: 'No Fellow Hosted',
    field: 'COVID-19 Pandemic',
    bio: 'The program paused in 2021 as travel and in-person gatherings were restricted at educational institutions globally.',
    gapYear: true,
    gapReason: 'COVID-19',
  },
  {
    year: 2020,
    name: 'Steven Johnson',
    field: 'Science Writing and Media',
    image: '/fellows/2020_steven_johnson.webp',
    bio: 'Author of eleven books including Where Good Ideas Come From and The Ghost Map. Host of the PBS series How We Got to Now and the podcast American Innovations. Visited Pomfret in early 2020, just before the COVID-19 pandemic disrupted in-person events.',
  },
  {
    year: 2019,
    name: 'Dr. Temple Grandin',
    field: 'Animal Science and Autism Advocacy',
    image: '/fellows/2019_temple_grandin.jpeg',
    bio: 'Professor of animal science at Colorado State University and one of the first individuals on the autism spectrum to share insights from her personal experience with the public. Revolutionized the livestock industry with humane handling designs.',
  },
  {
    year: 2018,
    name: 'Junot Díaz',
    field: 'Literature (Pulitzer Laureate)',
    image: '/fellows/2018_junot_diaz.jpg',
    bio: 'Pulitzer Prize winner for The Brief Wondrous Life of Oscar Wao, MIT professor of writing, and MacArthur Fellow. Born in the Dominican Republic, his work explores the immigrant experience, identity, and Dominican-American life.',
  },
  {
    year: 2017,
    name: 'Alec Ross',
    field: 'Technology and Innovation Policy',
    image: '/fellows/2017_alec_ross.jpg',
    bio: 'One of America\'s leading experts on innovation. Served as senior advisor for innovation to Secretary of State Hillary Clinton and is a distinguished visiting fellow at Johns Hopkins. Author of The Industries of the Future.',
  },
  {
    year: 2016,
    name: 'Peter Bergen',
    field: 'Journalism and National Security',
    image: '/fellows/2016_peter_bergen.jpg',
    bio: 'CNN national security analyst, vice president at New America, and author of books including Manhunt: The Ten-Year Search for Bin Laden. The last Western journalist to interview Osama bin Laden.',
  },
  {
    year: 2015,
    name: 'Cheryl L. West',
    field: 'Playwriting',
    image: '/fellows/2015_cheryl_l_west.jpg',
    bio: 'Award-winning playwright whose works include Jar the Floor, Before It Hits Home, and Pullman Porter Blues. Her plays explore African American family dynamics and social issues, and have been commissioned by major theaters across the United States.',
  },
  {
    year: 2014,
    name: 'Destin Sandlin',
    field: 'Engineering and Science Communication',
    image: '/fellows/2014_destin_sandlin.jpg',
    bio: 'Rocket scientist and mechanical engineer at Redstone Arsenal and creator of the popular YouTube channel Smarter Every Day, which has amassed over 10 million subscribers. His visit represented the program\'s embrace of new media science communication.',
  },
  {
    year: 2013,
    name: 'Ray Suarez',
    field: 'Broadcast Journalism',
    image: '/fellows/2013_ray_suarez.jpg',
    bio: 'PBS senior correspondent for NewsHour and former host of NPR\'s Talk of the Nation. A prominent voice in American broadcast journalism for decades, covering politics, policy, and social issues.',
  },
  {
    year: 2012,
    name: 'Da Chen',
    field: 'Literature and Memoir',
    image: '/fellows/2012_da_chen.png',
    bio: 'Leading Chinese-American memoirist and novelist, author of the bestselling memoirs Colors of the Mountain and Sounds of the River, chronicling his experiences growing up during the Cultural Revolution in China and his journey to America.',
  },
  {
    year: 2011,
    name: 'Dr. Carolyn Porco',
    field: 'Planetary Science',
    image: '/fellows/2011_carolyn_porco.jpg',
    bio: 'Head of the imaging team for the Cassini-Huygens mission to Saturn and winner of the Carl Sagan Award for Science Education. Also served on the imaging team for the Voyager missions. Named one of Time magazine\'s 25 most influential people in space.',
  },
  {
    year: 2010,
    name: 'Wade Davis',
    field: 'Anthropology and Exploration',
    image: '/fellows/2010_wade_davis.jpg',
    bio: 'National Geographic Explorer-in-Residence who lives alongside indigenous peoples to document their cultural practices. Holds a Ph.D. in ethnobotany from Harvard. Author of The Serpent and the Rainbow and One River.',
  },
  {
    year: 2009,
    name: 'Dana Gioia',
    field: 'Poetry and Arts Administration',
    image: '/fellows/2009_dana_gioia.jpg',
    bio: 'Award-winning poet, critic, and former chairman of the National Endowment for the Arts (2003–2009). Author of the influential essay "Can Poetry Matter?" Later served as Poet Laureate of California.',
  },
  {
    year: 2008,
    name: 'Carole Simpson',
    field: 'Broadcast Journalism',
    image: '/fellows/2008_carole_simpson.jpeg',
    bio: 'Award-winning journalist and the first African American woman to anchor a major network evening newscast, serving as anchor for ABC\'s World News Tonight Sunday (1988–2003). Moderated the 1992 presidential debate between Bush, Clinton, and Perot.',
  },
  {
    year: 2007,
    name: 'Bill Bryson',
    field: 'Literature and Science Writing',
    image: '/fellows/2007_bill_bryson.jpg',
    bio: 'Internationally acclaimed author of more than a dozen books including A Short History of Nearly Everything, A Walk in the Woods, and The Mother Tongue. Served as Chancellor of Durham University in England from 2005 to 2020.',
  },
  {
    year: 2006,
    name: 'Brian Greene',
    field: 'Theoretical Physics',
    image: '/fellows/2006_brian_greene.jpg',
    bio: 'Professor of physics and mathematics at Columbia University, best known for his work on string theory and his bestselling books The Elegant Universe and The Fabric of the Cosmos. Co-founder of the World Science Festival.',
  },
  {
    year: 2005,
    name: 'Christine Todd Whitman',
    field: 'Public Service and Government',
    image: '/fellows/2005_christine_todd_whitman.jpg',
    bio: 'Administrator of the Environmental Protection Agency (2001–2003) under President George W. Bush and the 50th Governor of New Jersey (1994–2001). The first woman to serve as Governor of New Jersey.',
  },
  {
    year: 2004,
    name: 'Jean-Michel Cousteau',
    field: 'Ocean Exploration and Environmentalism',
    image: '/fellows/2004_jean_michel_cousteau.jpg',
    bio: 'Son of legendary explorer Jacques Cousteau. Environmentalist, film producer, and founder of Ocean Futures Society. Has produced over 80 films and continues his father\'s legacy of ocean conservation and marine education.',
  },
  {
    year: 2003,
    name: 'Dr. Sergei Khrushchev',
    field: 'International Studies and Politics',
    image: '/fellows/2003_sergei_khrushchev.jpg',
    bio: 'Senior fellow at the Watson Institute for International Studies at Brown University and son of former Soviet Premier Nikita Khrushchev. His unique perspective on the Cold War and Soviet history made him an exceptionally compelling fellow.',
  },
  {
    year: 2002,
    name: 'Jacques d\'Amboise',
    field: 'Dance and Arts Education',
    bio: 'D\'Amboise returned to Pomfret for a second fellowship visit, six years after his first appearance in 1996.',
    note: '2nd visit',
    flagged: 'This entry is preserved on Pomfret\'s legacy MySchoolApp archive but is absent from the current pomfret.org site, which appears to have consolidated both visits into a single 1996 entry. Please verify with school archives before publishing.',
  },
  {
    year: 2001,
    name: 'Carlos Fuentes',
    field: 'Literature',
    image: '/fellows/2001_carlos_fuentes.jpg',
    bio: 'One of Latin America\'s most distinguished novelists and a central figure of the Latin American literary "Boom." Author of The Old Gringo, The Death of Artemio Cruz, and Terra Nostra. Recipient of the Miguel de Cervantes Prize.',
  },
  {
    year: 2000,
    name: 'Dr. Donald C. Johanson',
    field: 'Paleoanthropology',
    image: '/fellows/2000_donald_johanson.jpg',
    bio: 'Paleoanthropologist best known for discovering the 3.2 million-year-old Australopithecus afarensis skeleton named "Lucy" in Ethiopia in 1974. Founder of the Institute of Human Origins at Arizona State University.',
  },
  {
    year: 1999,
    name: 'Robert Ballard',
    field: 'Marine Science and Exploration',
    image: '/fellows/1999_robert_ballard.jpg',
    bio: 'World-renowned marine geologist best known for his 1985 discovery of the wreck of the RMS Titanic. Also discovered hydrothermal vents on the ocean floor, the wreck of the Bismarck, and numerous other significant underwater sites.',
  },
  {
    year: 1998,
    name: 'Frank McCourt',
    field: 'Literature (Pulitzer Laureate)',
    image: '/fellows/1998_frank_mccourt.jpg',
    bio: 'Teacher and author who won the Pulitzer Prize for Biography for his memoir Angela\'s Ashes. The book recounted his impoverished childhood in Limerick, Ireland, and became an international bestseller. Spent decades as a public school teacher in New York City.',
  },
  {
    year: 1997,
    name: 'No Fellow Hosted',
    field: 'Program Gap',
    bio: 'No fellow is listed for this year in any historical record or archive examined. This appears to be a genuine gap in the program\'s continuity.',
    gapYear: true,
    gapReason: 'No fellow hosted',
  },
  {
    year: 1996,
    name: 'Jacques d\'Amboise',
    field: 'Dance and Arts Education',
    image: '/fellows/1996_jacques_damboise.jpg',
    bio: 'One of the finest classical dancers of his time, founder of the National Dance Institute and former principal dancer with the New York City Ballet under George Balanchine for over three decades. Received the Kennedy Center Honor in 1995.',
  },
  {
    year: 1995,
    name: 'Joyce Carol Oates',
    field: 'Literature',
    image: '/fellows/1995_joyce_carol_oates.jpg',
    bio: 'American writer of extraordinary prolificacy, having published over 40 novels, plays, novellas, and volumes of short stories, poetry, and nonfiction. Her honors include a National Book Award, two O. Henry Awards, and the National Humanities Medal.',
  },
  {
    year: 1994,
    name: 'David McCullough',
    field: 'History and Literature',
    image: '/fellows/1994_david_mccullough.jpg',
    bio: 'American author, historian, and lecturer. Two-time winner of the Pulitzer Prize (for Truman and John Adams) and the National Book Award, and recipient of the Presidential Medal of Freedom. One of the most beloved historians of his generation.',
  },
  {
    year: 1993,
    name: 'Madame Jehan Sadat',
    field: 'Human Rights and Diplomacy',
    image: '/fellows/1993_jehan_sadat.jpg',
    bio: 'Human rights activist and widow of former Egyptian president Anwar Sadat, serving as First Lady of Egypt from 1970 until his assassination in 1981. A prominent advocate for women\'s rights in the Arab world.',
  },
  {
    year: 1992,
    name: 'Leon Lederman',
    field: 'Physics (Nobel Laureate)',
    image: '/fellows/1992_leon_lederman.jpg',
    bio: 'Winner of the 1988 Nobel Prize for Physics for work on neutrino beams. Lead scientist on the Superconducting Super Collider, former director of Fermi National Accelerator Laboratory, and a passionate advocate for science education.',
  },
  {
    year: 1991,
    name: 'Edward Albee',
    field: 'Theater and Playwriting',
    image: '/fellows/1991_edward_albee.jpg',
    bio: 'American playwright known for The Zoo Story, Who\'s Afraid of Virginia Woolf?, and A Delicate Balance. Three of his plays won the Pulitzer Prize for Drama. Widely regarded as one of the greatest American dramatists of the twentieth century.',
  },
  {
    year: 1990,
    name: 'Stanislav Levchenko',
    field: 'Intelligence and Geopolitics',
    image: '/fellows/1990_stanislav_levchenko.jpg',
    bio: 'Former Russian KGB major who defected to the United States in 1979 — the highest-ranking KGB officer to defect to the West. His visit came just one year after the fall of the Berlin Wall, making his account of Soviet operations particularly timely.',
  },
  {
    year: 1989,
    name: 'The Honorable Shirley Chisholm',
    field: 'Politics and Education',
    image: '/fellows/1989_shirley_chisholm.jpg',
    bio: 'Winner of the Presidential Medal of Freedom. In 1968, she became the first Black woman elected to the U.S. Congress. In 1972, she became the first Black candidate for a major party\'s presidential nomination. The inaugural Schwartz Visiting Fellow.',
  },
];

export default function SchwartzVisitingFellowsPage() {
  return (
    <div className="min-h-screen bg-warm-white">
      {/* Breadcrumb strip */}
      <div className="bg-cream pt-10 pb-6 border-b border-mist/40">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/famous-figures', label: 'Schwartz Visiting Fellows' },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <section className="relative py-16 lg:py-24 overflow-hidden bg-cream">
        <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-maroon" />
              <span className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon">
                Est. 1989 &middot; Speaker Series
              </span>
              <div className="w-12 h-px bg-maroon" />
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
              <span className="font-bold">Schwartz Visiting</span>{' '}
              <span className="font-normal text-pomfret-gray">Fellows</span>
            </h1>
            <p className="text-lg text-slate max-w-3xl mx-auto font-body leading-relaxed">
              Since 1989, world-renowned experts have visited Pomfret School under the
              auspices of the Schwartz Visiting Fellow program — a speaker series
              established through the vision and generosity of Michael &apos;66 and Eric &apos;69 Schwartz.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-8 lg:gap-16 mt-12 pt-12 border-t border-navy/10"
          >
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl text-maroon">36</div>
              <div className="text-xs text-slate font-body tracking-wider uppercase mt-1">
                Fellowship Visits
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl text-maroon">37</div>
              <div className="text-xs text-slate font-body tracking-wider uppercase mt-1">
                Years of Program
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl lg:text-4xl text-maroon">8</div>
              <div className="text-xs text-slate font-body tracking-wider uppercase mt-1">
                Disciplines Represented
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fellows Gallery */}
      <section className="py-12 lg:py-20 bg-warm-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {fellows.map((fellow, i) => (
              <ScrollReveal key={`${fellow.year}-${fellow.name}`} delay={(i % 6) * 0.08}>
                {fellow.gapYear ? (
                  // Gap year marker — visually distinct, lower visual weight
                  <div className="relative rounded-2xl overflow-hidden border border-mist bg-cream/50 h-full">
                    <div className="aspect-[3/4] flex flex-col items-center justify-center p-6 text-center">
                      <div className="font-display text-5xl text-navy/20 mb-4">{fellow.year}</div>
                      <div className="text-xs font-body tracking-[0.2em] uppercase text-slate/60 mb-3">
                        {fellow.gapReason}
                      </div>
                      <p className="text-xs text-slate/60 font-body leading-relaxed max-w-[220px]">
                        {fellow.bio}
                      </p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="relative rounded-2xl overflow-hidden border border-mist bg-cream h-full flex flex-col museum-frame"
                  >
                    {/* Portrait — photo if available, otherwise initials */}
                    <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-linen to-cream">
                      {fellow.image ? (
                        <>
                          <Image
                            src={fellow.image}
                            alt={`Portrait of ${fellow.name}`}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                          {/* Year badge overlay */}
                          <div className="absolute top-4 left-4 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-warm-white/90 backdrop-blur-sm border border-white shadow-sm">
                              <span className="text-xs font-body tracking-[0.2em] uppercase text-maroon font-semibold">
                                {fellow.year}
                              </span>
                              {fellow.note && (
                                <>
                                  <span className="w-px h-3 bg-maroon/30" />
                                  <span className="text-xs font-body text-maroon">
                                    {fellow.note}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Bottom gradient overlay for name readability */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-16">
                            <h3 className="font-display text-xl text-warm-white mb-1 leading-tight">
                              {fellow.name}
                            </h3>
                            <div className="text-xs text-warm-white/80 font-body italic">
                              {fellow.field}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-tr from-maroon/5 via-transparent to-navy/5" />
                          <div className="relative text-center p-6">
                            <div className="text-xs font-body tracking-[0.3em] uppercase text-maroon mb-4">
                              {fellow.year}
                              {fellow.note && (
                                <span className="ml-2 px-2 py-0.5 bg-maroon/10 text-maroon rounded-full">
                                  {fellow.note}
                                </span>
                              )}
                            </div>
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-maroon/30 bg-warm-white flex items-center justify-center">
                              <span className="font-display text-2xl text-navy">
                                {fellow.name
                                  .replace(/^(The Honorable|Dr\.|Madame) /, '')
                                  .split(' ')
                                  .slice(0, 2)
                                  .map((n) => n[0])
                                  .join('')}
                              </span>
                            </div>
                            <h3 className="font-display text-xl text-navy mb-1 leading-tight">
                              {fellow.name}
                            </h3>
                            <div className="text-xs text-slate font-body italic">
                              {fellow.field}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <div className="p-5 bg-warm-white border-t border-mist flex-1">
                      <p className="text-sm text-slate font-body leading-relaxed">
                        {fellow.bio}
                      </p>
                      {fellow.flagged && (
                        <div className="mt-4 pt-3 border-t border-maroon/20 flex items-start gap-2">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            className="text-maroon flex-shrink-0 mt-0.5"
                            aria-hidden="true"
                          >
                            <path
                              d="M7 1V8M7 11V11.01"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                          <p className="text-xs text-maroon font-body leading-relaxed italic">
                            {fellow.flagged}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Program Context Footer */}
      <section className="py-16 border-t border-mist bg-cream">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="text-xs font-body tracking-[0.3em] uppercase text-maroon mb-4">
            About the Program
          </div>
          <p className="text-sm text-slate font-body leading-relaxed">
            Each fellowship typically involves a multi-day campus visit including a
            school-wide lecture, a public community lecture in Hard Auditorium, student
            panel discussions, classroom visits, and a reception. The selection rotates
            among academic departments to ensure a diversity of disciplines represented
            over time.
          </p>
        </div>
      </section>
    </div>
  );
}
