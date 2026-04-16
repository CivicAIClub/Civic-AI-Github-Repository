'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';

// Transcribed content for each page of "Pomfret in the Civil Rights Era" (Fall 2005)
const pages = [
  {
    num: 1,
    image: '/archive/magazines/civil-rights-era-p01.png',
    title: 'Diversity at Pomfret',
    transcript: [
      'The Pomfret Bulletin/Magazine issue from 2005, with John Irick\'s picture on the front, is a wonderful tribute and record of diversity at Pomfret.',
      'The "first four" African-Americans to be admitted to Pomfret School in the fall of 1964 were:',
      '1) John Irick \'65',
      '2) Jim Parker \'67',
      '3) Martin Bolton \'68',
      '4) Carl McAuley \'68',
      'While John Irick was the first African-American to graduate from Pomfret School, Frank Mwine \'61 was the first black student to take a diploma on the Hilltop.',
      'The Afro-Latin Society was formed in 1968; it was the venue where Pomfret minority students found support, with the goal to enable them to have a community voice and help each other adjust to the cultural climate on campus. (2008 was the 40th reunion and a celebration was held on campus.)',
      'By the 1980s, "the notion of diversity began to expand and the Afro-Latin Society needed to adjust to the changing student body. As a result, VOICE was founded in 1984 by Desi DelValle \'85 and Alex Pena \'85." VOICE was open to all students who might consider themselves a minority, which included international students and day students. (Interestingly, the memorial bench for the Afro-Latin Society lists its years of service as 1968-1978.)',
      'The spelling of VOICE is not an acronym. When VOICE started in 1984, it was \'Voice.\' When the Reunion occurred in 2002, Ginny Eaton changed the lettering to \'VOICE,\' so that it would "make a voice" by being in all capital letters.',
    ],
  },
  { num: 2, image: '/archive/magazines/civil-rights-era-p02.png', title: 'Minorities, 1961-1973', transcript: ['(Faculty reflections on integration and early student culture — page scanned in full above.)'] },
  { num: 3, image: '/archive/magazines/civil-rights-era-p03.png', title: 'Naomi Vega and the Class of \'69', transcript: ['"Naomi Vega was one of three talented, influential newcomers who joined the class of \'69 for their sixth form year under extenuating circumstances. Naomi, James Edwards, and Eloibadis Nieves were students in New York City before a teachers\' strike threatened to jeopardize their college plans, and Mr. Milnor and Admissions Director John Howland stepped in to offer them scholarships to Pomfret."', '"It was a time of major upheaval in the country as a whole, and it was a bad time at Pomfret as well."'] },
  { num: 4, image: '/archive/magazines/civil-rights-era-p04.png', title: 'Title Page: More than Four Decades of Diversity', transcript: ['Pomfret In The...', 'More than Four Decades of Diversity', 'By Elizabeth Lake', '"Every once in a while, one small step by a man can be a giant step for humankind. Sometimes that step is in the name of science, but the step John Irick \'65 took 40 years ago helped change the face of Pomfret School."'] },
  { num: 5, image: '/archive/magazines/civil-rights-era-p05.png', title: 'Civil Rights Era', transcript: ['When Irick came to Northeast Connecticut in 1964, he was not the typical Pomfret student. He was born in January 1947, in John C. Calhoun County in South Carolina to share croppers Alma and Wilbur Irick. In 1950, discouraged with the share cropping system that gave them 10 percent of the profit for 100 percent of the labor, his parents moved to Orangeburg, South Carolina.', 'Irick attended segregated schools and worked hard, taking advantage of these programs and seeking out whatever opportunity he could. Irick first became aware of Pomfret School in the 1963-1964 school year, when Matt Hobbs \'64 visited Wilkinson High School as part of a program organized by American Friends Service Community.', '"For me, Pomfret was a dream come true; it provided an opportunity for an excellent education but more importantly, a chance to demonstrate that students committed to exercising mutual respect for each other, regardless of their race, could live, study, and play together." — John Irick \'65'] },
  { num: 6, image: '/archive/magazines/civil-rights-era-p06.png', title: '1964 Yearbook Photo', transcript: ['JOHN IRICK, CENTER RIGHT, JOINED HIS CLASSMATES FOR A HUMOROUS DORM PHOTOGRAPH THAT CHALLENGED STEREOTYPES AND POKED A LITTLE FUN AT CULTURAL MORES. THIS PHOTO WAS PRINTED IN THE 1964 YEARBOOK.'] },
  { num: 7, image: '/archive/magazines/civil-rights-era-p07.png', title: 'A Private School\'s Opportunity', transcript: ['"Most textbooks and documentaries of the Civil Rights Era tell a story seen through the lens of public schools. But private schools, including Pomfret School, were exempt from the philosophical debate over whether tax dollars should be colorblind. Whether African Americans were permitted to attend a private school was up to Admissions officials, and Pomfret was eager to get involved."', 'In 1964 the administration, along with those of twenty other prep schools, were working hard to "assist African-American students in obtaining better educational opportunities at the secondary level" by working with the Fund for Negro Students and the National Scholarship Service.'] },
  { num: 8, image: '/archive/magazines/civil-rights-era-p08.png', title: 'Return in 2005', transcript: ['Irick\'s experience at Pomfret led the way for more African American students to attend the school. Pomfret\'s administration has worked to increase the school\'s diversity, in both student and faculty numbers.', '"Bringing a diverse group of students to Pomfret serves only to enhance the depth of experience of both students and faculty," said Erik Bertelsen, Assistant Head of Enrollment at Pomfret School.', 'IRICK, RIGHT, IS GIVEN A PLAQUE BY VOICE ADVISOR GINNY EATON AT A CEREMONY THIS SPRING (2005).'] },
  { num: 9, image: '/archive/magazines/civil-rights-era-p09.png', title: 'Ugandan Frank Mwine \'61', transcript: ['"The time I spent here was significant and important," Irick told students at the VOICE dinner. "For me, Pomfret was a dream come true; it provided an opportunity for an excellent education but more importantly, a chance to demonstrate that students committed to exercising mutual respect for each other, regardless of their race, could live, study, and play together."', 'Ugandan Frank Mwine \'61: While John Irick \'65 was the first African American to graduate from Pomfret School, Ugandan Frank Mwine \'61 was the first black student to take a diploma on the Hilltop, preceding Irick by half a decade. Like Irick, Mwine only attended Pomfret for one year, but his legacy lives on in the display outside Headmaster Brad Hastings\'s office; when he graduated, Mwine presented Pomfret School with a traditional African spear with the words, "to kill the lion of misunderstanding."'] },
  { num: 10, image: '/archive/magazines/civil-rights-era-p10.png', title: 'Educating Change', transcript: ['Educating Change — By Elizabeth Lake', 'As the Civil Rights Movement gained momentum in the United States, Headmaster Jay Milnor was already seeking ways to further better educational opportunities for minorities. Under Milnor, Pomfret School joined a program to assist minority students in Hartford in 1967 which would become known as the Supplementary Program in Hartford for Educational Reinforcement and Enrichment. Hagop Merjian, Pomfret faculty from 1961 to 1999, served as Pomfret\'s on-site director of the program.'] },
  { num: 11, image: '/archive/magazines/civil-rights-era-p11.png', title: 'SPHERE — 15 Schools, 60 Students', transcript: ['SPHERE was a collaboration of 15 private schools, which each held summer sessions for disadvantaged students. Pomfret\'s six week program began with 22 students. By the 80s, the sessions were attended by as many as 60 students. These sessions continued even as Pomfret\'s regular summer school classes had ceased.', '"These young men took part in an intensive six weeks of remedial education stressing language skills, reading, writing, speaking, interpreting of the American language," wrote Merjian in the Winter 1973 Bulletin.', 'SPHERE was not used as a vehicle to bring minority students to Pomfret, but was the first opportunity to participate in a sport, and many tried basketball, soccer, track, volleyball, and, Merjian\'s second passion, wrestling.'] },
  { num: 12, image: '/archive/magazines/civil-rights-era-p12.png', title: 'Unteachable', transcript: ['Hagop Merjian remembers one SPHERE student that the public school system had labeled "unteachable." That student went on to attend Bates College.'] },
  { num: 13, image: '/archive/magazines/civil-rights-era-p13.png', title: 'Giving Diversity a VOICE', transcript: ['As Pomfret School administrators in the 1960s worked to increase its on-campus diversity, other members of the school community — students, parents, faculty, and staff — had their own works cut out to overcome cultural and social stereotypes.', 'Despite some near-heroic efforts, many ground-breaking minorities found their spot at Pomfret sometimes difficult and lonely. By 1968, black students cried out for a venue that would support them and the Afro-Latin Society was born.', 'But by the 80s, the notion of diversity had begun to expand, and the Afro-Latin Society needed to adjust to the changing student body. As a result, VOICE was founded in 1984 by Desi DelValle \'85 and Alex Pena \'85. VOICE was open to all students who might consider themselves a minority.'] },
  { num: 14, image: '/archive/magazines/civil-rights-era-p14.png', title: 'VOICE Reunions, Cultural Extravaganza', transcript: ['Following a VOICE dinner hosted by Dolph Clinton \'92 in 1999; VOICE Reunion 2002; VOICE Reunion 2004-2005; The Quinceañera of Jenny Rodriguez \'94; VOICE at a dinner honoring John Irick \'64 last spring; VOICE Alumni filled out surveys for the Alumni Office and big sheets for Ginny Eaton during the VOICE 2002 Reunion.'] },
];

export default function CivilRightsEraPage() {
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
              Fall 2005 &middot; Pomfret Magazine
            </span>
          </div>
          <h1 className="font-display text-section text-cream mb-2 leading-tight">
            Pomfret in the Civil Rights Era
          </h1>
          <p className="font-display text-xl text-cream/70 italic mb-4">
            More Than Four Decades of Diversity
          </p>
          <p className="text-sm text-cream/60 font-body">By Elizabeth Lake &middot; {pages.length} pages</p>
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

      {/* Modal / full page viewer */}
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
