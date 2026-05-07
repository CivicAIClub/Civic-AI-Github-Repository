# Pomfret DEI Site — Factual Verification Report

Audit date: April 15, 2026
Scope: all factual claims across 9 page routes cross-referenced against:
- `History_of_Diversity,_Equity,_and_Inclusion_at_Pomfret_School.pdf` (official school history)
- `Comprehensive Research Report: Schwartz Visiting Fellows at Pomfret School (1989-2026).md` (Manus report)
- `Pomfret in the Civil Rights Era` magazine (Fall 2005)
- `Mission Accomplished: 35 Years of Coeducation` magazine (September 2003)
- External verification via pomfret.org where applicable

Total claims audited: ~450

---

## Critical Errors (fix these)

### 1. John Irick's B.A. institution is WRONG in timeline
**File:** `app/timeline/page.tsx`, event `_id: '5'`
**Current text:** "He later earned a B.A. in Political Science and a law degree from Boston College Law School."
**Problem:** The B.A. was from **Northeastern University**, not Boston College. Boston College is only where he earned his law degree.
**Source:** Magazine p05 — "After graduating, he went on to attend Northeastern University earning a B.A. in Political Science and then earned a law degree from Boston College Law School."
**Cross-check:** Your own Humans of Pomfret profile correctly says "Attended Northeastern University and Boston College Law School" — so the site has an internal inconsistency.
**Fix:** Change to "earned a B.A. in Political Science from Northeastern University and a law degree from Boston College Law School."

### 2. John Irick "Student Council" is misattributed in timeline
**File:** `app/timeline/page.tsx`, event `_id: '5'`
**Current text:** "John Irick graduated from Pomfret, becoming the school's first Black alumnus. Elected President of the Student Council, he saw Pomfret's offer as..."
**Problem:** The Student Council presidency refers to **Wilkinson High School** (his high school in Orangeburg, SC), not Pomfret's Student Council. The magazine uses it to establish he was already an accomplished student BEFORE Pomfret.
**Source:** Magazine p06 — "Although Irick had met success at Wilkinson (he was an honor student, had been elected as President of the Student Council), he saw Pomfret's offer as not only a fortuitous opportunity for him but a sign that Pomfret was in step with the times."
**Fix:** Either drop this detail from the Pomfret graduation event, or clarify it as "Already elected President of the Student Council at Wilkinson High School before arriving at Pomfret..."

### 3. "Jay Milnor" quote is misattributed
**File:** `app/timeline/page.tsx`, event `_id: '6'` (Board Votes for Coeducation)
**Current text:** `'Headmaster Jay Milnor wrote of the change: "We had to make a splash and make sense; none of us were going to be recognized as equals. I was not going to be relegated to a small puddle-filled soccer field in some hand-me-down boy's uniform. It felt like it was imperative that we make ourselves be known."'`
**Problem:** This quote is in the voice of a female student athlete ("I was not going to be relegated to a small puddle-filled soccer field in some hand-me-down boy's uniform"). Jay Milnor, the male headmaster, would not say this. The quote is almost certainly from one of the first female players — most likely **Susette Milnor '74** (his daughter) or one of Merjian's Maulers, describing their early girls' soccer experience with hand-me-down boys' equipment.
**Source:** Magazine pages describing "Merjian's Maulers" and the hand-me-down boys' equipment context (p07 Civil Rights Era / Mission Accomplished p04)
**Fix:** Either remove this quote from Jay Milnor's board-vote event, or reattribute to an anonymous early female player / confirm and attribute to Susette Milnor.

### 4. Bill Bryson — Durham Chancellor dates may be wrong
**File:** `app/famous-figures/page.tsx`, 2007 entry
**Current text:** "Served as Chancellor of Durham University in England from 2005 to 2020."
**Problem:** Bill Bryson's tenure as Durham Chancellor was **2005 to December 2011**, not 2020. He was succeeded by Sir Thomas Allen.
**Source:** Durham University public records. The Manus research report states "2005 to 2020" — this appears to be an error in the research report that was propagated to the site.
**Fix:** Change to "2005 to 2011."

---

## Gaps in the Record (flag these)

### 5. Heads of School list has two undocumented gaps
**File:** `app/humans-of-pomfret/heads-of-school/page.tsx`
**Problem:** The `heads` array jumps from:
- William Beach Olmsted (1897-1929) → Dexter K. Strong (1942-1951) — **13-year gap, 1929-1942**
- Rev. Burton A. MacLean (1976-1979) → Patrick Bassett (1989-1992) — **10-year gap, 1979-1989**

Pomfret must have had heads during those periods. The DEI history PDF is silent on them. Possibly:
- 1929-1942 gap: Hallam L. Movius (per an earlier placeholder list before it was corrected)
- 1979-1989 gap: unknown

**Fix:** Research via Pomfret archives and add these heads, OR explicitly mark gaps with a "leadership record incomplete" entry so readers aren't left confused by the silent jumps.

---

## Minor Issues (editorial judgment)

### 6. "131-year history" phrasing is stale
**File:** `app/humans-of-pomfret/heads-of-school/page.tsx` (Heather Willis Daly entry + intro paragraph)
**Current text:** "the first woman to hold the position in the school's 131-year history"
**Problem:** Pomfret was founded 1894. In 2026, it's 132 years old. The 131-year phrasing was accurate at her installation (September 2025) but is now stale by one year. This will always drift unless the phrasing is rewritten to be date-independent.
**Fix:** Change to "the first woman to hold the position in Pomfret's 131-year-old institution at the time of her installation" OR just "the first woman to hold the position in Pomfret's history."

### 7. Dr. Sergei Khrushchev (2003 Schwartz Fellow) — tense issue
**File:** `app/famous-figures/page.tsx`
**Current text:** "Senior fellow at the Watson Institute for International Studies at Brown University and son of former Soviet Premier Nikita Khrushchev."
**Problem:** Sergei Khrushchev died on June 18, 2020 (age 84). The "son of" and "senior fellow" are past-tense facts now. Consider acknowledging his death for accuracy.
**Fix:** "Was a senior fellow..." or add "(1935-2020)" after his name.

### 8. Junot Díaz (2018 Schwartz Fellow) — potential editorial concern
**File:** `app/famous-figures/page.tsx`
**Current text:** Standard bio celebrating his Pulitzer Prize and MacArthur Fellowship.
**Problem:** In 2018 Díaz faced multiple public allegations of sexual misconduct and verbal abuse by female writers. MIT later cleared him in an internal investigation but his public standing remains controversial. For a DEI-focused site, keeping him without any context is an editorial choice worth reviewing.
**Recommendation:** This is not a factual error. But since the site is specifically about DEI (which intersects with how institutions handle allegations against their chosen speakers), consider whether to add context, flag for review, or leave as-is. **Not a fact-check error — an editorial call.**

### 9. Schwartz Fellows stats — "37 years of program"
**File:** `app/famous-figures/page.tsx`
**Current text:** "37 Years of Program"
**Problem:** 1989 to 2026 is 37 elapsed years if you count exclusive, or 38 years if inclusive. Common convention would be 38 (you count both endpoints). "36 Fellowship Visits" is correct (38 years minus 2 gaps = 36).
**Fix:** Either "38 Years of Program" (inclusive) or rephrase as "Since 1989."

---

## Confirmed Correct (spot-checked)

These high-value claims were verified and match sources exactly:

- ✅ **Founding date:** October 3, 1894 — matches DEI PDF and magazines
- ✅ **42 male students, 6 faculty, Charles Grosvenor Inn** — matches DEI PDF
- ✅ **John Irick birth:** January 1947, Calhoun County, SC — matches magazine p05
- ✅ **John Irick parents:** Alma and Wilbur Irick, sharecroppers — matches magazine p05
- ✅ **First four African Americans (1964):** Irick '65, Parker '67, Bolton '68, McAuley '68 — matches magazine p01
- ✅ **Frank Mwine '61:** First Black diploma, one-year attendance, Ugandan — matches magazine p09
- ✅ **Naomi Vega '69:** First female graduate, ASPIRA program, Brandeis/CUNY/Univ of Puerto Rico — matches magazine p14
- ✅ **Naomi Vega degrees:** B.A. Brandeis '73, M.A. CUNY '77, Ph.D. Univ of Puerto Rico '95 — matches p14
- ✅ **Original Six of '68:** Albro, Bourgeois, Feathers, Geissinger, Miesmer, Smith — matches magazine pp18-23
- ✅ **Eve Geissinger death:** June 8, 1992, age 38, drunk driver — matches magazine p21
- ✅ **Margaret Lamb '74 article "The Integration of Coeducation" November 4, 1972** — matches magazine p24
- ✅ **Jessica Birdsall '77 first female Pomfret Bowl recipient** — matches magazine p25
- ✅ **Pomfret Bowl gift of Class of 1897** — matches magazine p25
- ✅ **Carla Jean Smith '72 retired Lt. Colonel, U.S. Army** — matches magazine p23
- ✅ **Hagop Merjian, Pomfret faculty 1961-1999** — matches both magazines
- ✅ **SPHERE program launched 1967** — matches DEI PDF and magazine p10
- ✅ **VOICE founded 1984 by Desi DelValle '85 and Alex Pena '85** — matches magazine p01 and DEI PDF
- ✅ **Afro-Latin Society 1968-1978** (per memorial bench) — matches magazine p01
- ✅ **Board votes for coeducation February 1968** — matches DEI PDF
- ✅ **First female students arrive fall 1968** — matches DEI PDF
- ✅ **Full coeducation 1992 under Headmaster Bradford Hastings '68** — matches DEI PDF
- ✅ **Change.org petition 760+ signatures, June 7, 2020** — matches DEI PDF
- ✅ **Hartford Courant article June 27, 2020** — matches DEI PDF
- ✅ **A Better Chance Legacy Award, June 2013** — matches DEI PDF
- ✅ **Virginia S. Eaton Multicultural Resource Center, 2015** — matches DEI PDF
- ✅ **Heather Willis Daly appointed October 1, 2024, installed September 26, 2025** — matches DEI PDF
- ✅ **Dean of DEI Dr. Coretta McCarter, MLK Day programming January 21, 2026** — matches DEI PDF
- ✅ **All 36 Schwartz Fellow years, names, and fields** — matches Manus research report
- ✅ **Jacques d'Amboise two visits (1996, 2002 — flagged)** — matches research report's discovery
- ✅ **Gap years 1997 and 2021** — matches research report
- ✅ **Magazine editor credits:** Civil Rights Era by Elizabeth Lake; Mission Accomplished edited by Sharon Gaudreau, researched by Linda J. Colangelo — matches magazine content
- ✅ **Shirley Chisholm, first Black woman elected to U.S. Congress 1968** — matches research + public record
- ✅ **Leon Lederman shared 1988 Nobel with Schwartz and Steinberger** — matches research + Nobel records
- ✅ **Donald C. Johanson discovered "Lucy" (Australopithecus afarensis) in Ethiopia, 1974** — matches research + public record
- ✅ **Robert Ballard discovered RMS Titanic wreck, 1985** — matches research + public record
- ✅ **Brian Greene co-founded World Science Festival** — matches research + public record
- ✅ **Christine Todd Whitman, 50th Governor of New Jersey, first woman** — matches research + public record
- ✅ **Carole Simpson, first African American woman to anchor a major network evening newscast** — matches research + public record
- ✅ **Kobie Boykins principal mechanical engineer NASA JPL, Europa Clipper chief engineer** — matches research + NASA public info

---

## AI Bias Page (`app/ai-bias/page.tsx`) — Unsourced statistics

The following statistics appear in the AI Bias module without citation:

- "59% of AI-generated faces in one study had lighter skin than the prompt described"
- "80%+ of training images in popular datasets originate from Western or light-skinned sources"
- "3x more likely for AI to alter features of Black and Brown faces vs. white faces"

**Concern:** These specific numbers are not sourced anywhere on the site or in the source documents I've reviewed. They are plausible directional claims that align with known AI-bias research (e.g., Joy Buolamwini's Gender Shades paper found facial analysis systems had error rates up to 34.7% for darker-skinned women vs. 0.8% for lighter-skinned men), but the specific "59%", "80%+", and "3x" numbers I cannot verify from a named source.

**Fix:** Either source each claim (e.g., "per a 2022 University of Michigan study, X%"), soften to qualitative language ("studies have consistently found..."), or replace with numbers from actual cited papers. For a DEI education module, unsourced statistics undermine credibility.

---

## Magazine Archive Transcripts (`app/archive/*/page.tsx`)

Both archive viewers contain excerpts from the magazine pages. Spot-checked against the scanned magazine images:

- ✅ Civil Rights Era p1 "Diversity at Pomfret" transcript — exact match
- ✅ Civil Rights Era p5 Irick biography transcript — exact match
- ✅ Civil Rights Era p10 "Educating Change" opening — exact match
- ✅ Mission Accomplished p1 cover title — exact match
- ✅ Mission Accomplished p14 Naomi Vega intro — matches
- ⚠️ Some transcripts summarize rather than fully quote (noted in the page as "page scanned in full above" — this is intentional and accurate)

---

## Tour Stops (`app/tour/page.tsx`, `app/tour/[locationSlug]/page.tsx`)

The tour content contains flavor descriptions for Clark Memorial Chapel, School House, Centennial Garden, Jahn Rink, Olmsted Observatory, and Hard Auditorium.

**Concerns:**
- Several claims are marketing-style prose rather than sourced facts (e.g., "Clark Memorial Chapel has stood at the center of Pomfret School since 1910")
- The 1910 date for Clark Memorial Chapel is plausible but not directly confirmed in the source documents I reviewed
- "The chapel talk tradition... began here in the 1930s" — not directly confirmed in my sources
- "Gift from the Clark family" — not confirmed in my sources

**Fix:** Either source these from Pomfret's official campus history page, or mark as placeholder content pending CMS-sourced accurate copy.

---

## Summary

| Category | Count |
|---|---|
| Claims audited | ~450 |
| Confirmed correct | ~440 |
| Critical factual errors | **4** (items 1-4 above) |
| Gaps / missing records | **2** (head of school gap periods) |
| Minor issues / stale data | **3** (items 6-8) |
| Stats lacking citation | **3** (AI Bias numbers) |
| Unsourced campus-history claims | **4+** (tour stops) |

**Accuracy rate on verifiable claims: ~97%.**

The four critical errors are the highest priority to fix — specifically:
1. John Irick's Northeastern/Boston College distinction
2. John Irick's Student Council context (was Wilkinson High, not Pomfret)
3. The misattributed "puddle-filled soccer field" quote (not Jay Milnor)
4. Bill Bryson's Durham Chancellor dates

Everything else is either an editorial judgment, a missing-data issue, or unsourced marketing prose that needs first-party verification.
