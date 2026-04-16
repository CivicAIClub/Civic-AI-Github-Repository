'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Transcribed pages for "Mission Accomplished: 35 Years of Coeducation" (September 2003)
const pages = [
  { num: 1, image: '/archive/magazines/mission-accomplished-p01.png', title: 'Cover', transcript: ['MISSION ACCOMPLISHED', 'Pomfret School Celebrates 35 Years of Coeducation'] },
  { num: 2, image: '/archive/magazines/mission-accomplished-p02.png', title: 'Table of Contents', transcript: ['6 — The Trailblazers... First Female Pioneers of Pomfret: Easing Into The Waters, A Founding Father of Coeducation, A Faculty Daughter Kicks Off A Competitive Spirit, The First Female Graduate.', '16 — The Original Six of \'68: In 1972, Pomfret graduated the first true coeducational class to include female students for all four years. While the class boasted a total of thirteen female graduates, there were six in particular who entered in 1968, and unbeknownst to them at the time, made Pomfret School history.', '24 — The Trailblazers Continue... First Female Editor-in-Chief of The Pontefract, First Female Recipient of The Pomfret Bowl.', '28 — A Legacy of Ladies at Pomfret: Profiles of some legacy families who produced a female Pomfret graduate.', '36 — Pomfret Today — The New Look, Feel, and Attitude of Coeducation.', 'Editor: Sharon Gaudreau · Research/Text: Linda J. Colangelo · Design: Good Design · Photography: Pomfret School Archives, Lindsay Shaw, Individual Contributors.', 'September 2003'] },
  { num: 3, image: '/archive/magazines/mission-accomplished-p03.png', title: '1894: Wide Open... To Boys Only', transcript: ['"Her life among us." Life among the male population at Pomfret has changed dramatically since the school embarked on its journey of coeducation in the late sixties.', 'The historic news that female day students would be admitted in the fall of 1968 was announced in The Pontefract "to the joy of most, and the unhappiness of a few." Certainly there were upshots of opening the gilded gates to a few deserving girls.', 'Pomfret headmaster Brad Hastings held a distinct vantage point during this time of change. He graduated from Pomfret in 1968. That fall, the first day females were admitted to Pomfret. Hastings attended the all-boys Union College in Schenectady, which had also begun to admit females by the time he graduated.'] },
  { num: 4, image: '/archive/magazines/mission-accomplished-p04.png', title: 'Merjian\'s Maulers', transcript: ['1974 — Merjian\'s Maulers — Pomfret girls kicked up a storm in soccer under the motivational guidance of Coach Hagop Merjian.', '"When I returned to Pomfret, the atmosphere seemed quite normal," he remarked. "It felt as though girls had been there for quite some time and it appeared that we were full-fledged citizens of the school."', 'Look to the school\'s coat of arms to see the lasting legacy of Harriett Peck\'s design of the school crest. Gaze out to the library courtyard to see Alice Dunbar\'s sculpture of The Falconer.'] },
  { num: 5, image: '/archive/magazines/mission-accomplished-p05.png', title: 'Faculty Member Alice Dunbar', transcript: ['Faculty member Alice Dunbar (1956-1991) helped to shape the lives of many Pomfret grads.', '1972 — Making strides one step at a time!', 'May Cotter, dining hall matron (1942-1973).', 'Early 1970s — United we stand!'] },
  { num: 6, image: '/archive/magazines/mission-accomplished-p06.png', title: 'The Trailblazers', transcript: ['THE TRAILBLAZERS — FIRST FEMALE PIONEERS OF POMFRET', 'Trendsetters, groundbreakers, innovators, founders...call them what you will...these are the confident women, who as girls, arrived at Pomfret School with some curiosity, a few curlers, and a lot of courage.'] },
  { num: 7, image: '/archive/magazines/mission-accomplished-p07.png', title: 'Easing into the Waters — Joan Strong Buell \'50', transcript: ['Pomfret School began to get its first taste of female influence when daughters of faculty members were admitted to the school. Joan Strong Buell \'50, Robin Downing Whitney \'60, Barbara Lazear Ascher \'64, and Linda Parquette \'64 were four young girls afforded a Pomfret education before the school officially began to admit female day students in 1968.', 'Joan Strong Buell: Education: B.A. Music, Smith College, \'54; M.A. Psychology, Portland State University, \'81. Occupation: Retired teacher and Hospice administrator.', '"I look back on Pomfret as a \'happiest\' place."'] },
  { num: 8, image: '/archive/magazines/mission-accomplished-p08.png', title: 'Robin Downing Whitney \'60', transcript: ['Robin Downing Whitney \'60: Education: B.A. in English, Wheaton College, \'65. Occupation: Community volunteer, artist.', '"Being at Pomfret taught me that if I could get through and really be fairly liked."'] },
  { num: 9, image: '/archive/magazines/mission-accomplished-p09.png', title: 'Barbara Lazear Ascher \'64', transcript: ['Barbara Lazear Ascher \'64: Education: B.A., Bennington College, \'68; Cardozo Law School, \'79. Occupation: Author.', 'Ascher has authored "The Hers" column in the New York Times, has written for national magazines and has published a number of non-fiction books, including Playing After Dark (1986), The Habit of Living (1989), Landscape Without Gravity (1993), and her latest, Isn\'t It Romantic? Finding the Magic in Everyday Life (2002). She has been a commentator on National Public Radio and has numerous television appearances to her credit. She now writes for the New York Times and Gourmet Magazine and has recently completed her first novel. Barbara, a widow, lives in New York City and has one daughter, Rebecca Ascher-Walsh, who is a senior writer for Entertainment Weekly.'] },
  { num: 10, image: '/archive/magazines/mission-accomplished-p10.png', title: 'Linda Parquette \'64 + Jay Milnor', transcript: ['Linda Parquette \'64: Education: B.A., University of Pennsylvania, \'68; Master of Regional Planning, UMASS, Amherst, \'74. Occupation: Regional Planner, Southeastern Connecticut Council of Governments & Program Coordinator, Connecticut Rural Development Council.', '"Pomfret teachers brought out the best in me academically, teaching me to discover and have confidence in my own potential rather than compare myself to others."', 'A Founding Father of Coeducation — Jay Milnor: Pomfret School Headmaster (1961-1973). History teacher (1951-1957) and (1960-1961). Headmaster of Roberts Academy, Istanbul, Turkey (1957-1960).', 'In the book, The Spirit that is Pomfret, by Brad Pearson \'65 and Emerson Stone \'45, the twelve-year tenure of Joseph Kirkbride Milnor is described as "the years of challenge."'] },
  { num: 11, image: '/archive/magazines/mission-accomplished-p11.png', title: 'Jay Milnor Continued', transcript: ['"It was a unique time," recalled Jay. "In my estimation, there was no such mixture of distinctive challenges that had previously existed. Fortunately, I inherited a number of very good teachers and a progressive philosophy of integration... I tendered his resignation to the regret of the board, faculty, and students."', '1973 — Jay and daughter Susette.'] },
  { num: 12, image: '/archive/magazines/mission-accomplished-p12.png', title: 'Susette Milnor \'74', transcript: ['A Faculty Daughter Kicks Off a Competitive Spirit — Susette Milnor \'74: Education: B.A., Social Psychology, Tufts University, \'79; M.A., Social Work, Simmons School of Social Work, \'86. Occupation: Psychotherapist in an all-women private group practice.', '"I didn\'t have the sense that there was hostility or unhappiness; just a very normal, understandable resistance to change."'] },
  { num: 13, image: '/archive/magazines/mission-accomplished-p13.png', title: 'Girls\' Soccer — First Organized Sport', transcript: ['Not previously existed for a female population. I didn\'t have that perspective back then, of course, but I realize it now. Susette is credited with helping introduce the first organized sport for girls — soccer — in the fall of \'68. She spent several Pomfret mornings pondering the arrival of the 1971-72 season. The head\'s daughter was kicking up some dirt, which would benefit Pomfret girls in later years. Merjian\'s Maulers did make themselves known. They may joke that their first few undefeated seasons were because they hardly had any other schools to play, but they would go on to form winning teams season after season.'] },
  { num: 14, image: '/archive/magazines/mission-accomplished-p14.png', title: 'The First Female Graduate — Naomi Vega \'69', transcript: ['Faculty daughters grew up on campus, acutely aware of the school\'s rules, regulations, and expectations, and had become part of the fabric of an extended Pomfret family. Essentially, they began to stir the waters that would prepare Pomfret for coeducation. The school, however, was completely caught off guard with the arrival of Hurricane Naomi...', 'The First Female Graduate — Naomi Vega, PhD \'69: Education: B.A., History, Brandeis University, \'73; M.A., City University of New York, \'77; Ph.D., University of Puerto Rico, \'95. Occupation: Professor of English Education, Catholic University of the Sacred Heart, San Juan, Puerto Rico.', 'Puerto Rican, female, poor, Catholic, controversial, assertive, and proud. Naomi Vega was Pomfret\'s baptism with fire as it plunged headfirst into the feminist movement. Take West Side Story, edit in a few scenes from Dead Poet\'s Society, and you have the colorful collision of cultures that exploded on the Pomfret campus in the fall of 1968. Naomi was one of three inner city, underprivileged youths to be selected for education at Pomfret when a teacher\'s strike closed Erasmus Hall High School in New York. Naomi arrived from Brooklyn through the ASPIRA program (meaning "to aspire").'] },
  { num: 15, image: '/archive/magazines/mission-accomplished-p15.png', title: 'The Left Behind + Senior Index 1969', transcript: ['That broke the camel\'s back story in The Left Behind. When word spread that she was leaving, the boys organized a protest. They went to meet with headmaster Milnor and were successful in their bid to keep Naomi further. But it wasn\'t enough, however, and she was turned out on to the Milnor\'s home under careful watch and strict curfew.', '"It was an incredible experience," she recalled. "In hindsight, it raised the social awareness of the school. The boys woke up to seeing something beyond their own community."', '"1969 — Naomi Vega is the first female graduate to be listed in a Pomfret School yearbook."', 'SENIOR INDEX includes dozens of classmates and colleges.'] },
  { num: 16, image: '/archive/magazines/mission-accomplished-p16.png', title: 'The Original Six of \'68', transcript: ['THE ORIGINAL SIX OF \'68: In 1972, Pomfret graduated the first true coeducational class to include female students for all four years. While the class boasted a total of thirteen female graduates, there were six in particular who entered in 1968, and unbeknownst to them at the time, made Pomfret School history.', 'Admission to Pomfret would test their academic skills and the very spirit of their adolescent existence. In many ways, the school was still somewhat unprepared for their arrival. The school community would ponder whether social graces should prevail or the girls should be treated as "one of the boys."'] },
  { num: 17, image: '/archive/magazines/mission-accomplished-p17.png', title: 'The Six Take Their Places', transcript: ['created common ground when and where they could... five had been schooled together since attending Humpty Dumpty Kindergarten in Pomfret; three were attending Pomfret on scholarship; two were faculty daughters; one, along with inner-city arrival Naomi Vega, would become Pomfret\'s first female boarder. All agreed that they weren\'t looking to make history; they were just seeking acceptance as "normal, regular, everyday" students.'] },
  { num: 18, image: '/archive/magazines/mission-accomplished-p18.png', title: 'Mary Albro \'72', transcript: ['Mary Albro \'72: Education: University of Connecticut, \'76, Master of Library Science, \'79, Southern Connecticut State College. Occupation: Co-manager of Information and Reference Services, Hartford Public Library.', '"Pomfret teachers brought out the best in me academically, teaching me to discover and have confidence in my own potential rather than compare myself to others."'] },
  { num: 19, image: '/archive/magazines/mission-accomplished-p19.png', title: 'Michelle Bourgeois, Ph.D. \'72', transcript: ['Michelle Bourgeois, Ph.D. \'72: Education: B.S., Linguistics and French, Georgetown University, \'76; M.S., Speech and Hearing Sciences, University of Washington, \'78; Ph.D., Communication Disorders, University of Pittsburgh, \'83. Occupation: Professor, Florida State University.', '"Being a resident of Pomfret, I am well acquainted with the fine reputation of Pomfret School."'] },
  { num: 20, image: '/archive/magazines/mission-accomplished-p20.png', title: 'Mary Valentine Feathers \'72', transcript: ['Mary Valentine Feathers \'72: Education: B.S., Biology, St. Lawrence University, \'76; Master of Anthropology, University of Wyoming, \'83. Occupation: Conference planner for teachers and young scholars in the educational psychology department at UCONN.', '"The boys can point me out in the team pictures on the walls of the gymnasium," Mary said.'] },
  { num: 21, image: '/archive/magazines/mission-accomplished-p21.png', title: 'B. Eve Geissinger \'72 (1954-1992)', transcript: ['B. Eve Geissinger \'72 (1954-1992): Education: B.A., English, graduated magna cum laude from Brown University, \'76; Eve was working on her Master\'s degree in Social Work at Smith College at the time of her death.', 'Eve Geissinger was the eldest daughter of Pomfret music teacher Warren Geissinger, who taught from 1956 to 1975, and his wife, Barbara, who taught music at Pomfret Community School and was an advisor to the early females of Pomfret School from 1968 to 1970. Eve was one of three Geissinger daughters who would attend Pomfret during the early seventies.', 'Tragically, Eve was killed by a drunk driver on June 8, 1992, at the age of thirty-eight.'] },
  { num: 22, image: '/archive/magazines/mission-accomplished-p22.png', title: 'Lindsey Cole Miesmer \'72', transcript: ['Lindsey Cole Miesmer \'72: Education: B.A., Wheaton College, \'76; M.A., Fairfield University, 2000. Occupation: Marriage and Family Therapist.', '"I have something now that I didn\'t have while attending Pomfret in 1968," begins Lindsey Cole Miesmer \'72, daughter of Pomfret art teacher, crew coach, and long-time legend Chick Cole "Propeller."'] },
  { num: 23, image: '/archive/magazines/mission-accomplished-p23.png', title: 'Carla Jean Smith \'72', transcript: ['Carla Jean Smith \'72: Education: B.A., Sociology/Education, University of Connecticut, \'77; Master of Public Administration, Brenau College, \'85; Armed Forces Staff College, \'88. Occupation: Lieutenant Colonel, Retired, United States Army.', '"If there was one thing Carla Smith learned at Pomfret, it was leadership, and that is a trait that would serve her well during twenty-one years of working hard way up the ranks in the United States Army. But in 1968, Pomfret probably felt more like boot camp..."'] },
  { num: 24, image: '/archive/magazines/mission-accomplished-p24.png', title: 'First Female Editor-in-Chief — Margaret Lamb \'74', transcript: ['FIRST FEMALE EDITOR-IN-CHIEF OF THE PONTEFRACT', 'Dr. Margaret Lamb \'74: Education: A.B., Government, cum laude with honors, Harvard College, Harvard University, \'78; Ph.D., University Reading, England, \'98. Occupation: University Academic (Associate Professor), Warwick Business School, University of Warwick, Coventry, England.', '"The arrival of boarding girls at Pomfret was like pouring a bucket of red Georgia clay on a beach of quartz sand. Initially, the red stands out as a splotch on the wide expanse of white. Then, with the help of the sea, the red slowly begins to disperse. Streaks of red remain, though widely scattered over a large area. The final outcome is that the red clay is no longer visible; it has become part of the beach."', 'So wrote fifth former Margaret Lamb on November 4, 1972 in an article entitled "The Integration of Coeducation."'] },
  { num: 25, image: '/archive/magazines/mission-accomplished-p25.png', title: 'First Female Recipient of the Pomfret Bowl — Jessica Birdsall \'77', transcript: ['FIRST FEMALE RECIPIENT OF THE POMFRET BOWL', 'Jessica Birdsall \'77: Education: B.A., Government & Political Science, Bowdoin College, \'81. Occupation: Litigation Support Supervisor, San Francisco, CA.', 'There\'s a long list of names to acknowledge the recipients of the Pomfret Bowl, a gift of the Class of 1897, "to be awarded to the best athlete in the senior class, by a vote of the entire class." You have to follow your finger down a row of eighty-six names before the first female one jumps out at you — Jessica L. Birdsall.'] },
  { num: 26, image: '/archive/magazines/mission-accomplished-p26.png', title: 'Jessica\'s Legacy', transcript: ['Jessica was also quick to share her academic prowess with the school\'s SPHERE tutorial program, spending two years as the program\'s resident "remedial learning" expert, tutoring inner-city children with learning disabilities. Whether she was excelling on the field or in the classroom, and inspiring her peers at Pomfret or at college, Jessica was admired for her quiet intensity and lead-by-example attitude.', '"Having my name on the bowl makes it that much easier for another female athlete to have hers there too," she said. "It opens possibilities. It\'s not just winning the award, you feel good about the work leading up to it... that you\'re part of a team, part of something larger than yourself."'] },
  { num: 27, image: '/archive/magazines/mission-accomplished-p27.png', title: 'Legacy — 1897 & 2003', transcript: ['"How well I remember those first days, the pioneer days..." — Class of 1897.', '"...how I wish Mr. Peck could now see the institution which he started and was so proud of." — Excerpt from a 1929 interview with Ewing L. Miller 1898, the very first student enrolled at Pomfret School in 1894.', 'Headmaster Brad Hastings \'68, Betsy Hastings, and the Class of 2003.'] },
];

export default function MissionAccomplishedPage() {
  const [activePage, setActivePage] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-20 bg-navy texture-grain">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/archive"
            className="inline-flex items-center gap-2 text-cream/60 hover:text-cream text-sm font-body mb-6 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Back to Archive
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-px bg-maroon-light/60" />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-maroon-light">
              September 2003 &middot; Pomfret Magazine
            </span>
          </div>
          <h1 className="font-display text-section text-cream mb-2 leading-tight">
            Mission Accomplished
          </h1>
          <p className="font-display text-xl text-cream/70 italic mb-4">
            Pomfret School Celebrates 35 Years of Coeducation
          </p>
          <p className="text-sm text-cream/60 font-body">
            Edited by Sharon Gaudreau &middot; Research/Text by Linda J. Colangelo &middot; {pages.length} pages
          </p>
        </div>
      </section>

      {/* Pages grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {pages.map((page) => (
              <button
                key={page.num}
                onClick={() => setActivePage(page.num)}
                className="group block text-left bg-cream rounded-xl overflow-hidden museum-frame hover:shadow-lg transition-all"
              >
                <div className="aspect-[3/4] relative bg-navy/5 overflow-hidden">
                  <Image
                    src={page.image}
                    alt={`Page ${page.num}: ${page.title}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs font-body text-maroon font-semibold">
                    Page {page.num}
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-display text-base text-navy leading-tight group-hover:text-maroon transition-colors">
                    {page.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Modal viewer */}
      <AnimatePresence>
        {activePage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 overflow-y-auto"
            onClick={() => setActivePage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-warm-white rounded-2xl max-w-6xl w-full my-8 grid lg:grid-cols-2 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {pages
                .filter((p) => p.num === activePage)
                .map((page) => (
                  <ScrollReveal key={page.num}>
                    <>
                      <div className="relative aspect-[3/4] lg:aspect-auto bg-cream">
                        <Image
                          src={page.image}
                          alt={`Page ${page.num}: ${page.title}`}
                          fill
                          sizes="50vw"
                          className="object-contain"
                        />
                      </div>
                      <div className="p-6 lg:p-8 overflow-y-auto max-h-[80vh]">
                        <div className="text-xs font-body tracking-wider uppercase text-maroon mb-2">
                          Page {page.num}
                        </div>
                        <h2 className="font-display text-2xl text-navy mb-4">{page.title}</h2>
                        <div className="space-y-4 text-sm text-slate font-body leading-relaxed">
                          {page.transcript.map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </div>
                        <button
                          onClick={() => setActivePage(null)}
                          className="mt-6 px-4 py-2 rounded-lg bg-navy text-cream text-sm font-body hover:bg-navy-light transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  </ScrollReveal>
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
