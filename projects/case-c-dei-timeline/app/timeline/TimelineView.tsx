'use client';

import { useState, useRef, useLayoutEffect } from 'react';
import { m, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// Historical timeline — sourced from "History of Diversity, Equity, and Inclusion at Pomfret School"
// and enriched with content from two archival magazines:
//   • "Pomfret in the Civil Rights Era: More Than Four Decades of Diversity" (Fall 2005)
//   • "Mission Accomplished: 35 Years of Coeducation" (September 2003)
// In production, fetched from Sanity CMS
const demoEvents = [
  { _id: '1', title: 'Pomfret School Founded', date: '1894-10-03', category: 'Milestones', description: 'William E. Peck and his wife Harriet Benson Peck founded Pomfret School as an independent, Episcopal-affiliated, all-boys college preparatory boarding school. It opened on October 3, 1894 with 42 students and 6 teachers in the Main House of the Charles Grosvenor estate (formerly the Charles Grosvenor Inn). The founding faculty was largely a Peck family enterprise: William taught Latin, his brother Rev. Theodore M. Peck taught English, his cousin Rev. Florus C. Peck served as Episcopal pastor and teacher, and Harriet ran the school\'s infirmary. The Pecks\' three daughters — Esther, Rachel, and Margaret — completed the family on campus. Tuition was $600 a year plus $30 for incidentals. Most boarders came from New York, with several traveling from as far as Ohio and Illinois.', featured: true },
  { _id: '1b', title: 'Year Two: Enrollment Reaches 74', date: '1895-09-01', category: 'Milestones', description: 'Pomfret returned for its second fall with a new wooden School House built over the summer and a student body that had grown from 42 to 74. Four additional faculty were hired to keep up with the increase. By the end of year two, the school had passed beyond the experimental stage \u2014 a marker that the founding had taken hold.', featured: false },
  { _id: '2', title: 'Geographic Diversification', date: '1948-09-01', category: 'Policy Changes', description: 'Under Headmaster Dexter Strong, the Board adopted a regional scholarship plan with a stated purpose: "to increase the school\u2019s service to the community and to the nation, and to broaden the geographical base." Five or six competitive scholarships were granted annually to boys "from all parts of the United States," capped at 10% of total tuition revenue. Enrollment that fall reached 151 students drawn from 11 states, the District of Columbia, one U.S. territory, and four foreign countries.', featured: false },
  { _id: '2b', title: 'First Female in Classroom', date: '1945-09-01', category: 'People', description: 'Joan Strong (later Joan Strong Buell \'50), daughter of Headmaster Dexter K. Strong, became the first female student in a Pomfret classroom in the fall of 1945. A teachers\u2019 strike at Putnam School (the local public school) left her without an option, and her father enrolled her in second form (eighth grade) at Pomfret for the academic year. "I look back on Pomfret as a happiest place."', featured: false },
  { _id: '2d', title: 'Students Push for Integration: The Dodds Editorial', date: '1949-04-01', category: 'Student Voices', description: 'Pontefract editor-in-chief Gordon B. Dodds \'50 published a sweeping editorial calling for racial integration at Pomfret: "Educational opportunities offered by Pomfret should not be denied to any student because of his race." A concurrent Pontefract poll found roughly 75% of students agreed integration would further democratic teaching at the school, and roughly two-thirds favored admitting Black students at that time \u2014 fifteen years before John Irick became Pomfret\'s first African American student in 1964.', featured: true },
  { _id: '2c', title: 'Faculty Diversifies: Shamil Utuner Joins', date: '1962-09-01', category: 'People', description: 'Shamil Utuner, an Albanian-Turkish educator who had taught with Headmaster Jay Milnor at Robert Academy in Istanbul, joined the Pomfret faculty as a physical education teacher and trainer. Fluent in seven languages, Utuner broadened the cultural backgrounds represented on a faculty long drawn primarily from New England prep schools.', featured: false },
  { _id: '3', title: 'A Better Chance Charter Membership', date: '1963-01-01', category: 'Milestones', description: 'Pomfret became a Charter Member of A Better Chance (ABC), a national program founded in 1963 to increase the number of well-educated young people of color. This partnership facilitated the enrollment of talented students of color at Pomfret for decades.', featured: true },
  { _id: '3b', title: 'Matt Hobbs \'64 Visits Wilkinson High', date: '1963-01-01', category: 'Cultural Events', description: 'Matt Hobbs \'64 visited Wilkinson High School in Orangeburg, South Carolina, as part of a program organized by the American Friends Service Community. The aim: to allow white students from northeast schools to experience the Civil Rights Movement firsthand. Hobbs\'s visit led directly to the recruitment of John Irick.', featured: false },
  { _id: '3c', title: 'First Black Diploma on the Hilltop', date: '1961-06-01', category: 'People', description: 'Frank Mwine \'61, a Ugandan student who attended Pomfret for one year, became the first Black student to take a diploma on the Hilltop — preceding John Irick by half a decade. At graduation, Mwine presented Pomfret with a traditional African spear with the words "to kill the lion of misunderstanding." His legacy lived on in a display outside Headmaster Brad Hastings\'s office.', featured: true },
  { _id: '3d', title: 'Outreach Program Founded', date: '1964-10-01', category: 'Cultural Events', description: 'In the 1964\u201365 school year, Pomfret launched the Outreach Program with the Hartford Tutoring Project as its main initiative. Students traveled to Hartford to tutor at-risk youth \u2014 the school\'s first sustained engagement with what The Pontefract would later describe as the \u201Csocial, cultural, and even racial dimensions\u201D of education beyond the Hilltop. Outreach predated Pomfret\'s involvement with SPHERE by three years.', featured: true },
  { _id: '4', title: 'First African American Student Enrolls', date: '1964-09-01', category: 'People', description: 'John Irick \'65, born in Calhoun County, South Carolina in 1947 and raised in Orangeburg, arrived at Pomfret for his senior year under Headmaster Joseph "Jay" Milnor, becoming the first African American student to attend the school. His parents — share croppers Alma and Wilbur Irick — moved to Orangeburg in 1950 when discouraged by the sharecropping system that gave them 10 percent of the profit for 100 percent of the labor. Irick received a full scholarship, all expenses paid.', featured: true },
  { _id: '4b', title: 'The First Four African Americans', date: '1964-09-15', category: 'Milestones', description: 'The "first four" African Americans to be admitted to Pomfret in the fall of 1964 were: John Irick \'65, Jim Parker \'67, Martin Bolton \'68, and Carl McAuley \'68. Their arrival followed the Civil Rights Era and Headmaster Jay Milnor\'s administration partnering with the Fund for Negro Students and the National Scholarship Service.', featured: true },
  { _id: '5', title: 'First African American Graduate', date: '1965-06-01', category: 'People', description: 'John Irick graduated from Pomfret, becoming the school\'s first Black alumnus. He had already been an honor student and President of the Student Council at Wilkinson High School in Orangeburg before Pomfret\'s offer, which he saw as "not only a fortuitous opportunity for him but a sign that Pomfret was in step with the times." After Pomfret he earned a B.A. in Political Science from Northeastern University and a law degree from Boston College Law School. "For me, Pomfret was a dream come true."', featured: true },
  { _id: '5b', title: 'SPHERE Program Launched', date: '1967-06-01', category: 'Policy Changes', description: 'Under Headmaster Jay Milnor, Pomfret joined a program to assist minority students in Hartford, which became known as the Supplementary Program in Hartford for Educational Reinforcement and Enrichment (SPHERE). Hagop Merjian, Pomfret faculty from 1961 to 1999, served as Pomfret\'s on-site director. At its peak, SPHERE brought 60+ students to campus for six-week summer sessions of reading, writing, speaking, English, and sports. 80 percent of SPHERE graduates later attended Pomfret\'s regular summer school.', featured: true },
  { _id: '6', title: 'Board Votes for Coeducation', date: '1968-02-01', category: 'Policy Changes', description: 'The Board of Trustees voted to admit female day students beginning in the fall of 1968. The student newspaper, The Pontefract, bannered the news, noting it was received "to the joy of most, and the unhappiness of a few." Even so, Headmaster Jay Milnor and Admissions Director John Howland were quick to qualify the move, stating that girls "are not being admitted in an attempt to turn the school into a coeducational institution. This is a step which is still a long way off \u2014 even if it is ever taken at all." Girls would initially join as day students only, with boarding to follow.', featured: true },
  { _id: '6b', title: 'Afro-Latin Society Formed', date: '1968-09-01', category: 'Student Voices', description: 'The Afro-Latin Society was formed in 1968 — the venue where Pomfret minority students found support, with the goal to enable them to have a community voice and help each other adjust to the cultural climate on campus. A late-1968 Pontefract poll showed 90% of students supported the society\u2019s formation, with 77% agreeing that Pomfret had a racial problem the school needed to address. The society served for years of service (1968-1978) until VOICE was founded in 1984. Its memorial bench stands as a reminder.', featured: true },
  { _id: '7', title: 'First Female Students Arrive', date: '1968-09-01', category: 'People', description: 'Female day students enrolled at Pomfret for the first time. Among the original cohort: Naomi Vega (who would become the first female graduate), along with "The Original Six of \'68" — six girls who entered in 1968 and would graduate in 1972 as Pomfret\'s first true coeducational class. Boarding for girls would follow in subsequent years.', featured: true },
  { _id: '7b', title: 'Girls\' Soccer Introduced', date: '1968-09-15', category: 'Cultural Events', description: 'Susette Milnor \'74, daughter of Headmaster Jay Milnor, helped introduce the first true organized sport for girls at Pomfret — soccer — in the fall of 1968 upon her freshman arrival. The team was coached by Hagop Merjian, who coached "Merjian\'s Maulers," a team that went on to win three straight undefeated seasons and the Women\'s Western New England Soccer Association championship.', featured: false },
  { _id: '8', title: 'First Female Graduate', date: '1969-06-01', category: 'People', description: 'Naomi Vega \'69 — Puerto Rican, poor, Catholic, controversial, assertive, and proud — graduated from Pomfret, becoming the first female to receive a diploma from the school. She was the only girl in her graduating class. Arrived in Pomfret after the 1968 teachers\' strike that threatened to jeopardize her plans. Admissions Director John Howland stepped in to offer a scholarship. "It was a time of major upheaval in the country." Naomi earned degrees from Brandeis, CUNY, and University of Puerto Rico (PhD).', featured: true },
  { _id: '8b', title: 'First Female Editor-in-Chief of The Pontefract', date: '1972-11-04', category: 'Student Voices', description: 'Dr. Margaret Lamb \'74 became the first female Editor-in-Chief of The Pontefract when she published an article titled "The Integration of Coeducation" on November 4, 1972. Seven months later, Margaret would assume major editorial responsibility as the first female Editor-in-Chief of The Pontefract. Other females would round out the production team — Donna Sullivan as Associate Editor, Kathy Daly and Ginny Sampson as Cartoonists, and Donna Reynolds on the Editorial Board. Together with Sports Editor David Buttolph, Photography Editor Bob Hendel, Business Editor Stan Patay, and Dan Chow on the Editorial Board, they created an all-out women\'s revolution in Pomfret print.', featured: true },
  { _id: '8c', title: 'First True Coeducational Class Graduates', date: '1972-06-01', category: 'Milestones', description: 'Pomfret graduated its first true coeducational class for all four years — "The Original Six of \'68." While the class boasted a total of thirteen female graduates, there were six in particular who entered in 1968, and unbeknownst to them at the time, made Pomfret School history: Mary Albro \'72, Michelle Bourgeois \'72, Mary Valentine Feathers \'72, B. Eve Geissinger \'72, Lindsey Cole Miesmer \'72, and Lt. Col. Carla Jean Smith \'72.', featured: true },
  { _id: '8d', title: 'First Female Boarders + Minority Enrollment Milestone', date: '1972-09-01', category: 'Milestones', description: 'Female students began boarding at Pomfret for the first time in autumn 1972 \u2014 twenty years before the school would describe itself as fully coeducational. Meg Morbach was appointed the school\'s first Administrative Assistant for girls\' affairs, and faculty couples were assigned as dorm parents to two newly designated female residential corridors (Middle Two and Middle Three). At the same autumn 1972 board meeting, Headmaster Jay Milnor reported a then-record minority enrollment: 17 Black, 13 Latino, and 2 Asian students.', featured: true },
  { _id: '9', title: 'SPHERE Consortium Founded', date: '1972-01-01', category: 'Policy Changes', description: 'Pomfret became a founding member of SPHERE, a consortium of eleven Hartford-area independent schools that came together to broaden the diversity of their student bodies and support students of color transitioning to predominantly white institutions.', featured: false },
  { _id: '10', title: 'Girls Ice Hockey Club Formed', date: '1973-01-01', category: 'Student Voices', description: 'Five female students, including Donna (Reynolds) Lynch \'75, approached Headmaster Joseph Milnor about forming a girls\' ice hockey team. The club practiced late at night using hand-me-down boys\' equipment, coached by Brad Hastings \'68 (later headmaster).', featured: false },
  { _id: '10c', title: 'A Struggle for Survival', date: '1973-09-01', category: 'Policy Changes', description: 'Kenneth M. Deitch arrived as headmaster amid a near-existential financial crisis. Enrollment had been declining since the early 1960s, and Pomfret carried roughly $500,000 in operating deficits. Deitch \u2014 a Harvard Ph.D. in economics brought in for fiscal triage \u2014 launched an emergency fundraising drive that trustee Henry \'Hank\' Strong \'41 anchored with a $450,000 pledge before his death in July 1975. The campaign bought the school the time it needed; the modern coeducational, multicultural Pomfret survived because of those years.', featured: true },
  { _id: '11', title: 'First Institutional Financial Aid Package', date: '1975-01-01', category: 'Policy Changes', description: 'Pomfret awarded its first official institutional financial aid package, a critical step toward making the school accessible to students from a broader range of socioeconomic backgrounds.', featured: true },
  { _id: '12', title: 'Girls Varsity Hockey Established', date: '1975-09-01', category: 'Cultural Events', description: 'The girls\' hockey club was elevated to a varsity team. Pomfret became one of the six original prep schools to offer girls\' ice hockey, alongside Loomis Chaffee, Taft, Choate, Northfield Mount Hermon, and Williston.', featured: false },
  { _id: '12a', title: 'AFS Exchange Student Declan Randels Arrives', date: '1975-09-01', category: 'Cultural Events', description: 'Declan Randels arrived from England as an American Field Service (AFS) exchange student. His presence in 1975-76 continued a Pomfret tradition that traced back at least to the late 1940s, when Swedish hockey-playing exchange student Nils Hansen attended the school and a British exchange student became valedictorian of the Class of 1950.', featured: false },
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

type Event = (typeof demoEvents)[number];

// One timeline card. Used by both the scroll-driven pinned track (desktop) and
// the overflow-x-auto fallback (mobile / reduced motion).
//
// Layout: each card container is h-full so its center (50%) always lines up
// with the horizontal track line that runs across the whole row. The visible
// card body sits in either the top half or the bottom half; the node dot sits
// dead on the track line and a short connector line bridges the gap. Cards
// have a fixed height — clicking opens a modal with the full description, so
// the track never reflows and the dot is never obscured.
function TimelineCard({
  event,
  index,
  onOpen,
  animateIn,
}: {
  event: Event;
  index: number;
  onOpen: (event: Event) => void;
  animateIn: boolean;
}) {
  const year = new Date(event.date).getFullYear();
  const era = getEraStyle(year);
  const isTop = index % 2 === 0;

  return (
    <m.div
      initial={animateIn ? { opacity: 0, y: 20 } : false}
      animate={animateIn ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.6) }}
      className="relative flex-shrink-0 w-64 lg:w-72 h-full"
    >
      {/* Card body — locked into the top or bottom half. Leaves a 28px gap
          between the card edge and the track line for the connector. The card
          is intentionally compact: just the category, year, and title. The full
          description opens in a modal when the user clicks the card. */}
      <div
        className={`absolute left-0 right-0 ${
          isTop ? 'top-0 bottom-[calc(50%+28px)]' : 'top-[calc(50%+28px)] bottom-0'
        }`}
      >
        <button
          type="button"
          onClick={() => onOpen(event)}
          className={`group w-full h-full text-left p-4 lg:p-5 rounded-xl ${era.bg} border ${era.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${
            era.sepia ? 'sepia-[.15]' : ''
          } flex flex-col justify-between`}
          aria-label={`${year} — ${event.title}. Click to read more.`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-[10px] lg:text-xs px-2 py-0.5 rounded-full ${
                  categoryColors[event.category] || 'bg-mist text-slate'
                }`}
              >
                {event.category}
              </span>
              {event.featured && (
                <span className="text-xs text-gold-dark" aria-label="Featured">
                  &#9733;
                </span>
              )}
            </div>
            <div className="font-display text-2xl lg:text-3xl text-navy mb-2 leading-none">
              {year}
            </div>
            <h3 className="font-display text-base lg:text-lg text-navy/90 leading-snug line-clamp-3">
              {event.title}
            </h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[10px] lg:text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-maroon opacity-70 group-hover:opacity-100 group-hover:gap-2 transition-all">
            Read more
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 5H8M8 5L5 2M8 5L5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
      </div>

      {/* Connector line: 28px of mist-colored rule between card edge and dot */}
      <div
        className="absolute left-1/2 -translate-x-px w-px bg-mist/80"
        style={
          isTop
            ? { top: 'calc(50% - 28px)', height: '28px' }
            : { top: '50%', height: '28px' }
        }
      />

      {/* Node dot — always on the track line, regardless of card content */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${era.border} ${
          event.featured ? 'bg-gold' : 'bg-warm-white'
        } z-10 shadow-sm`}
      />
    </m.div>
  );
}

// Full-event modal — keyboard-accessible (Escape closes, click outside closes).
function EventModal({ event, onClose }: { event: Event | null; onClose: () => void }) {
  // Lock body scroll and close on Escape while the modal is open.
  useLayoutEffect(() => {
    if (!event) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [event, onClose]);

  if (!event) return null;

  const year = new Date(event.date).getFullYear();
  const era = getEraStyle(year);
  const categoryClass = categoryColors[event.category] || 'bg-mist text-slate';

  return (
    <div
      className="fixed inset-0 z-[60] bg-navy/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-modal-title"
      onClick={onClose}
    >
      <m.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-warm-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-cream hover:bg-cream-dark text-navy flex items-center justify-center transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className={`${era.bg} px-8 pt-10 pb-6 border-b border-mist ${era.sepia ? 'sepia-[.1]' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2.5 py-1 rounded-full ${categoryClass}`}>{event.category}</span>
            {event.featured && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gold/20 text-gold-dark font-semibold">
                &#9733; Featured
              </span>
            )}
          </div>
          <div className="font-display text-5xl text-navy mb-2">{year}</div>
          <h2 id="timeline-modal-title" className="font-display text-2xl lg:text-3xl text-navy leading-tight">
            {event.title}
          </h2>
        </div>

        <div className="px-8 py-6 overflow-y-auto max-h-[50vh]">
          <p className="text-base text-slate font-body leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>
      </m.div>
    </div>
  );
}

export default function TimelinePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [startYear, setStartYear] = useState(1890);
  const [endYear, setEndYear] = useState(2026);
  const [openEvent, setOpenEvent] = useState<Event | null>(null);

  // Refs and state for the scroll-driven horizontal pin (desktop only).
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fallbackScrollRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const filteredEvents = demoEvents.filter((event) => {
    const year = new Date(event.date).getFullYear();
    const matchCategory = activeCategory === 'All' || event.category === activeCategory;
    const matchRange = year >= startYear && year <= endYear;
    return matchCategory && matchRange;
  });

  // Measure how far the track has to travel = trackWidth - viewportWidth.
  // Re-measures when filters change (card count) or the window resizes.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const measure = () => {
      if (!trackRef.current) return;
      const trackWidth = trackRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      setTravel(Math.max(0, trackWidth - viewportWidth + 96)); // +96px = a little right-side breathing room
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [filteredEvents.length]);

  // Scroll progress through the pinned section (0 → 1) drives the x translate.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  const useScrollDriven = !prefersReducedMotion;

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
              <p className="text-lg text-slate font-body leading-relaxed mb-3">
                Explore the milestones, voices, and turning points that shaped diversity,
                equity, and inclusion at Pomfret School — from 1890 to today.
              </p>
              <div className="mt-8 max-w-3xl rounded-2xl border border-maroon/15 bg-warm-white/80 p-5 shadow-sm">
                <div className="text-[11px] font-body font-bold tracking-[0.22em] uppercase text-maroon mb-4">
                  Current Student Diversity Snapshot
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-cream px-4 py-4 border border-mist">
                    <div className="font-display text-4xl text-navy leading-none">350</div>
                    <p className="mt-2 text-xs font-body font-semibold tracking-[0.12em] uppercase text-slate/70">
                      Students
                    </p>
                  </div>
                  <div className="rounded-xl bg-cream px-4 py-4 border border-mist">
                    <div className="font-display text-4xl text-navy leading-none">25%</div>
                    <p className="mt-2 text-xs font-body font-semibold tracking-[0.12em] uppercase text-slate/70">
                      People of color
                    </p>
                  </div>
                  <div className="rounded-xl bg-pomfret-navy px-4 py-4 text-warm-white">
                    <div className="font-display text-4xl leading-none">22%</div>
                    <p className="mt-2 text-xs font-body font-semibold tracking-[0.12em] uppercase text-warm-white/70">
                      International
                    </p>
                  </div>
                  <div className="rounded-xl bg-cream px-4 py-4 border border-mist">
                    <div className="font-display text-4xl text-navy leading-none">29</div>
                    <p className="mt-2 text-xs font-body font-semibold tracking-[0.12em] uppercase text-slate/70">
                      Countries
                    </p>
                  </div>
                </div>
              </div>
              {useScrollDriven && (
                <p className="hidden lg:flex items-center gap-2 text-sm text-slate/70 font-body mt-6">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Scroll down to advance through time, left to right.
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Filter Controls */}
      <div className="border-b border-mist bg-warm-white">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Filter by category">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[44px] px-4 py-2.5 rounded-full text-sm font-body transition-all duration-200 ${
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

      {/* ═══════════════════════════════════════════════════════════════
          SCROLL-DRIVEN HORIZONTAL TIMELINE (desktop / motion-safe)

          Pattern: a tall outer <section> acts as the "scroll runway."
          Its height = viewport height + travel distance, so scrollYProgress
          runs 0→1 exactly while the pinned inner is filling the viewport.
          The track inside translates x = 0 → -travel as progress advances.
          ═══════════════════════════════════════════════════════════════ */}
      {useScrollDriven && (
        <section
          ref={sectionRef}
          className="relative hidden lg:block"
          style={{ height: `calc(100vh + ${travel}px)` }}
          aria-label="Diversity timeline"
        >
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-hidden flex items-center bg-warm-white">
            {/* Scroll progress rail */}
            <div className="absolute top-6 left-0 right-0 px-6 lg:px-8 flex items-center gap-3 text-xs font-body text-slate/70 z-20 pointer-events-none">
              <span className="whitespace-nowrap font-semibold tracking-wider uppercase text-[11px]">
                {filteredEvents.length} events
              </span>
              <div className="flex-1 h-0.5 bg-mist/60 rounded-full overflow-hidden">
                <m.div
                  className="h-full bg-gradient-to-r from-gold via-maroon to-navy origin-left"
                  style={{ scaleX: scrollYProgress }}
                />
              </div>
              <span className="whitespace-nowrap text-[11px] text-slate/50">
                {filteredEvents.length > 0 ? new Date(filteredEvents[0].date).getFullYear() : ''} →{' '}
                {filteredEvents.length > 0 ? new Date(filteredEvents[filteredEvents.length - 1].date).getFullYear() : ''}
              </span>
            </div>

            {/* The moving track. `items-stretch` + `h-[70%]` on the track gives
                every card the same fixed height — keeps the dots lined up on
                the gradient rule no matter how much text a card holds. */}
            <m.div
              ref={trackRef}
              style={{ x }}
              className="relative flex items-stretch gap-4 pl-16 pr-24 will-change-transform h-[72%]"
              aria-hidden={filteredEvents.length === 0}
            >
              {/* Horizontal timeline "track" line — sits exactly at the row
                  midpoint, so every card's internal 50% marker lands on it. */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-gold/60 via-navy/30 to-maroon/40 pointer-events-none"
                style={{ top: '50%' }}
              />
              {filteredEvents.map((event, i) => (
                <TimelineCard
                  key={event._id}
                  event={event}
                  index={i}
                  onOpen={setOpenEvent}
                  animateIn={false}
                />
              ))}
            </m.div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CLASSIC OVERFLOW-X SCROLL (mobile, and motion-reduced desktop)
          ═══════════════════════════════════════════════════════════════ */}
      <div className={useScrollDriven ? 'lg:hidden' : ''}>
        <div className="overflow-hidden">
          <div
            ref={fallbackScrollRef}
            className="overflow-x-auto py-8 lg:py-16 px-4 sm:px-6 lg:px-8 scrollbar-thin"
            role="region"
            aria-label="Diversity timeline"
            tabIndex={0}
            onKeyDown={(e) => {
              if (!fallbackScrollRef.current) return;
              if (e.key === 'ArrowRight') fallbackScrollRef.current.scrollLeft += 300;
              if (e.key === 'ArrowLeft') fallbackScrollRef.current.scrollLeft -= 300;
            }}
          >
            <div className="flex items-center gap-2 mb-6 text-xs text-slate/60 font-body">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8H14M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Swipe horizontally to explore &middot; Use arrow keys to navigate
            </div>

            <div className="relative min-w-max flex items-stretch gap-4 pb-4 h-[540px]">
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-gold/60 via-navy/30 to-maroon/40"
                style={{ top: '50%' }}
              />
              {filteredEvents.map((event, i) => (
                <TimelineCard
                  key={event._id}
                  event={event}
                  index={i}
                  onOpen={setOpenEvent}
                  animateIn
                />
              ))}
            </div>
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

      {/* Event detail modal — opens when any timeline card is clicked */}
      <EventModal event={openEvent} onClose={() => setOpenEvent(null)} />
    </div>
  );
}
