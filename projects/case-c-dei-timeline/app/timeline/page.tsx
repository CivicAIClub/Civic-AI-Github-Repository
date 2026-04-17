'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Historical timeline — sourced from "History of Diversity, Equity, and Inclusion at Pomfret School"
// and enriched with content from two archival magazines:
//   • "Pomfret in the Civil Rights Era: More Than Four Decades of Diversity" (Fall 2005)
//   • "Mission Accomplished: 35 Years of Coeducation" (September 2003)
// In production, fetched from Sanity CMS
const demoEvents = [
  { _id: '1', title: 'Pomfret School Founded', date: '1894-10-03', category: 'Milestones', description: 'William E. Peck and his wife Harriet founded Pomfret School as an independent, Episcopal-affiliated, all-boys college preparatory boarding school. The school opened with 42 male students and six faculty members in the Charles Grosvenor Inn. Harriet and three daughters — Esther, Rachel, and Margaret — were the only females on campus at that time.', featured: true },
  { _id: '2', title: 'Geographic Diversification', date: '1948-09-01', category: 'Policy Changes', description: 'Under Headmaster Dexter Strong, Pomfret expanded its regional scholarship program. By 1948, enrollment peaked at 151 students drawn from 11 states, the District of Columbia, one U.S. territory, and four foreign countries.', featured: false },
  { _id: '2b', title: 'First Female in Classroom', date: '1946-09-01', category: 'People', description: 'Joan Strong Buell \'50, daughter of headmaster Bronson Strong, became the first female student in the classroom at Pomfret when her parents asked the board if she could attend the second form (eighth grade). "I look back on Pomfret as a happiest place."', featured: false },
  { _id: '3', title: 'A Better Chance Charter Membership', date: '1963-01-01', category: 'Milestones', description: 'Pomfret became a Charter Member of A Better Chance (ABC), a national program founded in 1963 to increase the number of well-educated young people of color. This partnership facilitated the enrollment of talented students of color at Pomfret for decades.', featured: true },
  { _id: '3b', title: 'Matt Hobbs \'64 Visits Wilkinson High', date: '1963-01-01', category: 'Cultural Events', description: 'Matt Hobbs \'64 visited Wilkinson High School in Orangeburg, South Carolina, as part of a program organized by the American Friends Service Community. The aim: to allow white students from northeast schools to experience the Civil Rights Movement firsthand. Hobbs\'s visit led directly to the recruitment of John Irick.', featured: false },
  { _id: '3c', title: 'First Black Diploma on the Hilltop', date: '1961-06-01', category: 'People', description: 'Frank Mwine \'61, a Ugandan student who attended Pomfret for one year, became the first Black student to take a diploma on the Hilltop — preceding John Irick by half a decade. At graduation, Mwine presented Pomfret with a traditional African spear with the words "to kill the lion of misunderstanding." His legacy lived on in a display outside Headmaster Brad Hastings\'s office.', featured: true },
  { _id: '4', title: 'First African American Student Enrolls', date: '1964-09-01', category: 'People', description: 'John Irick \'65, born in Calhoun County, South Carolina in 1947 and raised in Orangeburg, arrived at Pomfret for his senior year under Headmaster Joseph "Jay" Milnor, becoming the first African American student to attend the school. His parents — share croppers Alma and Wilbur Irick — moved to Orangeburg in 1950 when discouraged by the sharecropping system that gave them 10 percent of the profit for 100 percent of the labor. Irick received a full scholarship, all expenses paid.', featured: true },
  { _id: '4b', title: 'The First Four African Americans', date: '1964-09-15', category: 'Milestones', description: 'The "first four" African Americans to be admitted to Pomfret in the fall of 1964 were: John Irick \'65, Jim Parker \'67, Martin Bolton \'68, and Carl McAuley \'68. Their arrival followed the Civil Rights Era and Headmaster Jay Milnor\'s administration partnering with the Fund for Negro Students and the National Scholarship Service.', featured: true },
  { _id: '5', title: 'First African American Graduate', date: '1965-06-01', category: 'People', description: 'John Irick graduated from Pomfret, becoming the school\'s first Black alumnus. Elected President of the Student Council, he saw Pomfret\'s offer as "not only a fortuitous opportunity for him but a sign that Pomfret was in step with the times." He later earned a B.A. in Political Science and a law degree from Boston College Law School. "For me, Pomfret was a dream come true."', featured: true },
  { _id: '5b', title: 'SPHERE Program Launched', date: '1967-06-01', category: 'Policy Changes', description: 'Under Headmaster Jay Milnor, Pomfret joined a program to assist minority students in Hartford, which became known as the Supplementary Program in Hartford for Educational Reinforcement and Enrichment (SPHERE). Hagop Merjian, Pomfret faculty from 1961 to 1999, served as Pomfret\'s on-site director. At its peak, SPHERE brought 60+ students to campus for six-week summer sessions of reading, writing, speaking, English, and sports. 80 percent of SPHERE graduates later attended Pomfret\'s regular summer school.', featured: true },
  { _id: '6', title: 'Board Votes for Coeducation', date: '1968-02-01', category: 'Policy Changes', description: 'The Board of Trustees voted to admit female day students beginning in the fall of 1968. The student newspaper, The Pontefract, bannered the news, noting it was received "to the joy of most, and the unhappiness of a few." Headmaster Jay Milnor wrote of the change: "We had to make a splash and make sense; none of us were going to be recognized as equals. I was not going to be relegated to a small puddle-filled soccer field in some hand-me-down boy\'s uniform. It felt like it was imperative that we make ourselves be known."', featured: true },
  { _id: '6b', title: 'Afro-Latin Society Formed', date: '1968-09-01', category: 'Student Voices', description: 'The Afro-Latin Society was formed in 1968 — the venue where Pomfret minority students found support, with the goal to enable them to have a community voice and help each other adjust to the cultural climate on campus. The society served for years of service (1968-1978) until VOICE was founded in 1984. Its memorial bench stands as a reminder.', featured: true },
  { _id: '7', title: 'First Female Students Arrive', date: '1968-09-01', category: 'People', description: 'Female day students enrolled at Pomfret for the first time. Among the original cohort: Naomi Vega (who would become the first female graduate), along with "The Original Six of \'68" — six girls who entered in 1968 and would graduate in 1972 as Pomfret\'s first true coeducational class. Boarding for girls would follow in subsequent years.', featured: true },
  { _id: '7b', title: 'Girls\' Soccer Introduced', date: '1968-09-15', category: 'Cultural Events', description: 'Susette Milnor \'74, daughter of Headmaster Jay Milnor, helped introduce the first true organized sport for girls at Pomfret — soccer — in the fall of 1968 upon her freshman arrival. The team was coached by Hagop Merjian, who coached "Merjian\'s Maulers," a team that went on to win three straight undefeated seasons and the Women\'s Western New England Soccer Association championship.', featured: false },
  { _id: '8', title: 'First Female Graduate', date: '1969-06-01', category: 'People', description: 'Naomi Vega \'69 — Puerto Rican, poor, Catholic, controversial, assertive, and proud — graduated from Pomfret, becoming the first female to receive a diploma from the school. She was the only girl in her graduating class. Arrived in Pomfret after the 1968 teachers\' strike that threatened to jeopardize her plans. Admissions Director John Howland stepped in to offer a scholarship. "It was a time of major upheaval in the country." Naomi earned degrees from Brandeis, CUNY, and University of Puerto Rico (PhD).', featured: true },
  { _id: '8b', title: 'First Female Editor-in-Chief of The Pontefract', date: '1972-11-04', category: 'Student Voices', description: 'Dr. Margaret Lamb \'74 became the first female Editor-in-Chief of The Pontefract when she published an article titled "The Integration of Coeducation" on November 4, 1972. Seven months later, Margaret would assume major editorial responsibility as the first female Editor-in-Chief of The Pontefract. Other females would round out the production team — Donna Sullivan as Associate Editor, Kathy Daly and Ginny Sampson as Cartoonists, and Donna Reynolds on the Editorial Board. Together with Sports Editor David Buttolph, Photography Editor Bob Hendel, Business Editor Stan Patay, and Dan Chow on the Editorial Board, they created an all-out women\'s revolution in Pomfret print.', featured: true },
  { _id: '8c', title: 'First True Coeducational Class Graduates', date: '1972-06-01', category: 'Milestones', description: 'Pomfret graduated its first true coeducational class for all four years — "The Original Six of \'68." While the class boasted a total of thirteen female graduates, there were six in particular who entered in 1968, and unbeknownst to them at the time, made Pomfret School history: Mary Albro \'72, Michelle Bourgeois \'72, Mary Valentine Feathers \'72, B. Eve Geissinger \'72, Lindsey Cole Miesmer \'72, and Lt. Col. Carla Jean Smith \'72.', featured: true },
  { _id: '9', title: 'SPHERE Consortium Founded', date: '1972-01-01', category: 'Policy Changes', description: 'Pomfret became a founding member of SPHERE, a consortium of eleven Hartford-area independent schools that came together to broaden the diversity of their student bodies and support students of color transitioning to predominantly white institutions.', featured: false },
  { _id: '10', title: 'Girls Ice Hockey Club Formed', date: '1973-01-01', category: 'Student Voices', description: 'Five female students, including Donna (Reynolds) Lynch \'75, approached Headmaster Joseph Milnor about forming a girls\' ice hockey team. The club practiced late at night using hand-me-down boys\' equipment, coached by Brad Hastings \'68 (later headmaster).', featured: false },
  { _id: '11', title: 'First Institutional Financial Aid Package', date: '1975-01-01', category: 'Policy Changes', description: 'Pomfret awarded its first official institutional financial aid package, a critical step toward making the school accessible to students from a broader range of socioeconomic backgrounds.', featured: true },
  { _id: '12', title: 'Girls Varsity Hockey Established', date: '1975-09-01', category: 'Cultural Events', description: 'The girls\' hockey club was elevated to a varsity team. Pomfret became one of the six original prep schools to offer girls\' ice hockey, alongside Loomis Chaffee, Taft, Choate, Northfield Mount Hermon, and Williston.', featured: false },
  { _id: '12b', title: 'First Female Recipient of the Pomfret Bowl', date: '1977-06-01', category: 'People', description: 'Jessica Birdsall \'77 became the first female recipient of the Pomfret Bowl, awarded since 1897 to the student-athlete representing the highest qualities of effort, drive, and determination. Presented by Coach Brad Hastings, who said "He was somewhat coy in his introductory remarks." Birdsall was a standout in girls\' basketball, soccer (first girls\' crew team), and tennis. "It\'s been great to see Izzie flourish at Pomfret."', featured: true },
  { _id: '13', title: 'Michael Gary \'82 Attends via ABC', date: '1980-09-01', category: 'People', description: 'Michael Gary, growing up in New Haven, Connecticut, attended Pomfret through the A Better Chance program. He later described Pomfret as "the best decision of my life," and would return as the school\'s first Director of Multicultural Affairs.', featured: false },
  { _id: '14', title: 'VOICE Founded', date: '1984-01-01', category: 'Student Voices', description: 'VOICE was founded in 1984 by Desi DelValle \'85 and Alex Pena \'85. VOICE was open to all students who might consider themselves a minority, which included international students and day students. The spelling of VOICE is not an acronym. When VOICE started in 1984, it was "Voice." When the Reunion occurred in 2002, Ginny Eaton changed the lettering to "VOICE" so that it would "make a voice" by being in all capital letters.', featured: true },
  { _id: '15', title: 'First Dean of Women Appointed', date: '1989-09-01', category: 'Leadership', description: 'Headmaster Patrick Bassett appointed the school\'s first Dean of Women, described as "an instigator for raising the consciousness of women\'s issues." Bassett also authorized the formation of a campus chapter of the Council for Women in Independent Schools.', featured: false },
  { _id: '16', title: 'Full Coeducation Achieved', date: '1992-09-01', category: 'Milestones', description: 'Under newly appointed Headmaster Bradford Hastings \'68, Pomfret completed its transition to full coeducation, with female boarding students fully integrated into the residential community. This came 24 years after the first female day students were admitted.', featured: true },
  { _id: '17', title: 'First Director of Multicultural Affairs', date: '1995-09-01', category: 'Leadership', description: 'Michael Gary \'82, recruited by former Headmaster Patrick Bassett, returned to Pomfret as Associate Director of Admissions and Director of Multicultural Affairs. Gary and his wife Trina collaborated with the Eatons to enhance diversity, equity, and inclusion at Pomfret.', featured: true },
  { _id: '18', title: 'First Director of Diversity Hired', date: '2012-09-01', category: 'Leadership', description: 'Pomfret officially hired its first dedicated Director of Diversity to oversee and coordinate inclusion efforts across campus. This marked a shift from the earlier model where multicultural work was combined with admissions duties.', featured: true },
  { _id: '19', title: '"The Pomfret Purpose" Strategic Plan', date: '2013-01-01', category: 'Policy Changes', description: 'Under Head of School J. Timothy Richards, Pomfret launched its first comprehensive strategic plan, which included commitments to fostering an inclusive community and preparing students for a diverse, changing world.', featured: false },
  { _id: '20', title: 'ABC Legacy Award', date: '2013-06-01', category: 'Milestones', description: 'Pomfret received A Better Chance\'s Legacy Award at the organization\'s 50th anniversary celebration in New York City, recognizing the school\'s decades-long partnership in supporting students of color.', featured: true },
  { _id: '21', title: 'Virginia S. Eaton Multicultural Resource Center', date: '2015-09-01', category: 'Cultural Events', description: 'The Eaton Multicultural Resource Center was established on campus. Its mission is "to enrich the Pomfret community through increased knowledge, awareness, and understanding of diverse cultures." It serves as a physical hub for DEI programming.', featured: true },
  { _id: '22', title: 'QUEST Program Launched', date: '2015-09-15', category: 'Cultural Events', description: 'Pomfret introduced the QUEST program (Questioning, Understanding, Engagement, Sharing, Transitioning), a student-facilitated curriculum focusing on character, community, social justice, and health/wellness.', featured: false },
  { _id: '23', title: 'Certificate Program with Social Justice Track', date: '2018-09-01', category: 'Policy Changes', description: 'Pomfret launched a Certificate Program allowing students to pursue specialized academic tracks, including one focused on Social Justice and Global Citizenship, embedding DEI themes into the formal curriculum.', featured: false },
  { _id: '24', title: 'DEI Role Elevated to Dean Level', date: '2019-09-01', category: 'Leadership', description: 'The school elevated its primary diversity role from director to dean-level, broadening the mandate to explicitly encompass equity and inclusion. The position was retitled Dean of Diversity, Equity, and Inclusion.', featured: true },
  { _id: '25', title: '@BlackAtPomfret Launched', date: '2020-06-01', category: 'Student Voices', description: 'Following the murder of George Floyd and the ensuing national racial justice movement, Black students and alumni at Pomfret launched the @blackatpomfret Instagram account, documenting experiences of racism, microaggressions, and institutional responses.', featured: true },
  { _id: '26', title: 'Alumni Petition for Change', date: '2020-06-07', category: 'Student Voices', description: 'An alumni-led Change.org petition titled "Pomfret School: An Unchecked Institution of Privilege" garnered over 760 verified signatures, calling for decolonizing the curriculum, diversity coursework requirements, restorative justice practices, and a pre-orientation program for incoming students of color.', featured: true },
  { _id: '27', title: 'Bias Incident Reporting System', date: '2020-09-01', category: 'Policy Changes', description: 'In response to the 2020 activism, Pomfret established a formal, confidential Bias Incident Reporting system, allowing any witness or victim of a bias-related incident to file a confidential report.', featured: false },
  { _id: '28', title: 'Strategic Plan 2022–2027', date: '2022-01-28', category: 'Policy Changes', description: '"Change Makers and Problem Solvers" — Pomfret released its updated strategic plan, explicitly embedding diversity, equity, and inclusion into institutional goals and emphasizing recruiting and retaining a diverse faculty and student body.', featured: false },
  { _id: '29', title: 'First Female Head of School Appointed', date: '2024-10-01', category: 'Leadership', description: 'The Board of Trustees announced the appointment of Heather Willis Daly as Pomfret\'s 13th Head of School and the first woman to hold the position in the school\'s 130-year history. Daly chairs the NAIS Financial Aid Task Force.', featured: true },
  { _id: '30', title: 'Heather Willis Daly Installed', date: '2025-09-26', category: 'Leadership', description: 'Pomfret hosted a formal installation ceremony for Heather Willis Daly as the 13th Head of School, marking a historic moment as the first woman to lead Pomfret School.', featured: true },
  { _id: '31', title: '"A Day On for Justice" — MLK Day', date: '2026-01-21', category: 'Cultural Events', description: 'Pomfret marked Martin Luther King Jr. Day with a full day of student-led workshops on civil rights, policy writing, disability equity, the racial wealth gap, and creative writing inspired by Black artists. Dean of DEI Dr. Coretta McCarter oversaw the programming.', featured: true },
];

const categories = ['All', 'Milestones', 'People', 'Policy Changes', 'Student Voices', 'Cultural Events', 'Leadership'];

const categoryColors: Record<string, string> = {
  Milestones: 'bg-navy text-cream',
  People: 'bg-maroon text-cream',
  'Policy Changes': 'bg-gold-dark text-cream',
  'Student Voices': 'bg-maroon-light text-cream',
  'Cultural Events': 'bg-navy-light text-cream',
  Leadership: 'bg-gold text-navy-dark',
};

function getEraStyle(year: number) {
  if (year < 1920) return { bg: 'bg-cream-dark', border: 'border-gold/40', sepia: true };
  if (year < 1950) return { bg: 'bg-linen', border: 'border-gold/30', sepia: true };
  if (year < 1980) return { bg: 'bg-cream', border: 'border-navy/20', sepia: false };
  if (year < 2010) return { bg: 'bg-warm-white', border: 'border-navy/15', sepia: false };
  return { bg: 'bg-white', border: 'border-navy/10', sepia: false };
}

export default function TimelinePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [startYear, setStartYear] = useState(1890);
  const [endYear, setEndYear] = useState(2026);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEvents = demoEvents.filter((event) => {
    const year = new Date(event.date).getFullYear();
    const matchCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchRange = year >= startYear && year <= endYear;
    return matchCategory && matchRange;
  });

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-cream texture-linen">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            trail={[
              { href: '/', label: 'Home' },
              { href: '/timeline', label: 'Timeline' },
            ]}
            className="mb-8"
          />
          <ScrollReveal>
            <div className="max-w-3xl">
              <div className="text-[11px] font-body font-bold tracking-[0.25em] uppercase text-maroon mb-4">
                Interactive Timeline
              </div>
              <h1 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] text-navy mb-4">
                <span className="font-bold">The Arc</span>{' '}
                <span className="text-pomfret-gray">of Inclusion</span>
              </h1>
              <p className="text-lg text-slate font-body leading-relaxed">
                Explore the milestones, voices, and turning points that shaped diversity,
                equity, and inclusion at Pomfret School — from 1890 to today.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filter Controls */}
      <div className="sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-body transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-navy text-cream shadow-sm'
                    : 'bg-cream text-slate hover:bg-cream-dark'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Career span selector */}
          <div className="flex items-center gap-4 text-sm font-body text-slate">
            <span className="hidden sm:inline">Career Span:</span>
            <div className="flex items-center gap-2">
              <label htmlFor="start-year" className="sr-only">Start year</label>
              <input
                id="start-year"
                type="number"
                min={1890}
                max={2026}
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-mist bg-cream text-navy text-center"
              />
              <span>to</span>
              <label htmlFor="end-year" className="sr-only">End year</label>
              <input
                id="end-year"
                type="number"
                min={1890}
                max={2026}
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-20 px-2 py-1 rounded-lg border border-mist bg-cream text-navy text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="overflow-hidden">
        <div
          ref={scrollRef}
          className="overflow-x-auto py-8 lg:py-16 px-4 sm:px-6 lg:px-8 scrollbar-thin"
          role="region"
          aria-label="Diversity timeline"
          tabIndex={0}
          onKeyDown={(e) => {
            if (!scrollRef.current) return;
            if (e.key === 'ArrowRight') scrollRef.current.scrollLeft += 300;
            if (e.key === 'ArrowLeft') scrollRef.current.scrollLeft -= 300;
          }}
        >
          {/* Scroll hint */}
          <div className="flex items-center gap-2 mb-6 text-xs text-slate/60 font-body">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 8H14M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Scroll horizontally to explore &middot; Use arrow keys to navigate
          </div>

          <div className="relative min-w-max flex items-end gap-0 pb-4" style={{ minHeight: '420px' }}>
            {/* Timeline track — centered */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-gold/60 via-navy/30 to-maroon/40" style={{ top: '50%' }} />

            {filteredEvents.map((event, i) => {
              const year = new Date(event.date).getFullYear();
              const era = getEraStyle(year);
              const isTop = i % 2 === 0;

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative flex-shrink-0 w-56 sm:w-64 lg:w-72 flex flex-col"
                  style={{
                    alignSelf: isTop ? 'flex-start' : 'flex-end',
                    marginTop: isTop ? '0' : 'auto',
                    paddingTop: isTop ? '0' : '220px',
                    paddingBottom: isTop ? '220px' : '0',
                  }}
                >
                  {/* Node dot on the track */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${era.border} ${
                      event.featured ? 'bg-gold' : 'bg-warm-white'
                    } z-10 shadow-sm`}
                    style={{ top: 'calc(50%)' }}
                  />

                  {/* Connector line from card to track */}
                  <div
                    className="absolute left-1/2 w-px bg-mist/80"
                    style={
                      isTop
                        ? { bottom: '0', top: 'auto', height: '28px', transform: 'translateY(-190px)' }
                        : { top: '0', bottom: 'auto', height: '28px', transform: 'translateY(190px)' }
                    }
                  />

                  {/* Card */}
                  <button
                    onClick={() => setExpandedId(expandedId === event._id ? null : event._id)}
                    className={`block w-full text-left p-4 sm:p-5 rounded-xl ${era.bg} border ${era.border} hover:shadow-lg transition-all duration-300 ${
                      era.sepia ? 'sepia-[.15]' : ''
                    }`}
                    aria-expanded={expandedId === event._id}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[event.category] || 'bg-mist text-slate'}`}>
                        {event.category}
                      </span>
                      {event.featured && (
                        <span className="text-xs text-gold-dark">&#9733;</span>
                      )}
                    </div>
                    <div className="font-display text-xl sm:text-2xl text-navy/80 mb-1">{year}</div>
                    <h3 className="font-display text-sm sm:text-base text-navy mb-2 leading-snug">
                      {event.title}
                    </h3>
                    {expandedId === event._id && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-xs sm:text-sm text-slate font-body leading-relaxed"
                      >
                        {event.description}
                      </motion.p>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filteredEvents.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-lg text-slate font-body">
            No events found for the selected filters. Try adjusting your category or date range.
          </p>
        </div>
      )}
    </div>
  );
}
