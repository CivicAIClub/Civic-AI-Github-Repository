# Case C: DEI Interactive Timeline

## Client
Dr. McCarter, DEI Office — Pomfret School

## Overview
An interactive digital experience that tells the story of Diversity, Equity, and Inclusion at Pomfret School — built for campus visitors, MLK Day events, and ongoing community engagement. The site pairs a filterable historical timeline with real profiles of students, alumni, faculty, and visiting fellows, plus archival magazine viewers drawn from the school's published history. It is designed to live inside the existing Pomfret School website under the DEI section, not as a standalone domain.

## Tech Stack
- **Framework:** Next.js 14.2.35 (App Router)
- **Language:** TypeScript 5
- **CMS:** Sanity (`@sanity/client` 7.20, `next-sanity` 12.2, `@sanity/image-url` 2.1)
- **Styling:** Tailwind CSS 3.4
- **Animation:** Framer Motion 12.38
- **Fonts:** Playfair Display (headings) + Source Sans 3 (body), with Geist available as a fallback/local font
- **Utilities:** `qrcode` 1.5 (for the admin QR generator)

## Features
- **Interactive Timeline** (`/timeline`) — filterable by year range, category, and person, spanning 1890 to the present.
- **Humans of Pomfret** (`/humans-of-pomfret`) — profile gallery of 17 real historical and contemporary figures, with a dedicated **Heads of School** subsection (`/humans-of-pomfret/heads-of-school`) covering 11 heads with accurate dates.
- **Archive** (`/archive`) — page-by-page magazine viewers with transcripts, including:
  - *Pomfret in the Civil Rights Era* (Fall 2005) — `/archive/civil-rights-era`
  - *Mission Accomplished: 35 Years of Coeducation* (September 2003) — `/archive/mission-accomplished`
- **Schwartz Visiting Fellows** (`/famous-figures`) — gallery of 36 real visiting fellows from 1989 to 2026, with archival headshots.
- **AI & Bias** (`/ai-bias`) — awareness module with visual examples of bias in AI image generation (skin tone, hair, features) and an interactive 3-question quiz.
- **Campus Tour** (`/tour`) — QR-code-triggered tour stops with EN/ES language support. **On hold pending security review.**
- **Admin QR Generator** (`/admin/qr-generator`) — utility page for generating the tour stop QR codes.
- **Contact** — "Contact DEI" link in the top utility bar (mailto).

Design and navigation are aligned with pomfret.org (utility bar, mega-dropdowns, maroon CTAs, bold-first-word section headings). All AI-generated content is tagged with the `AIContentBadge` component.

> Note: **Chapel Voices was removed** from an earlier version of the site.

## Project Structure
```
case-c-dei-timeline/
├── app/                          # Next.js App Router routes
│   ├── page.tsx                  # Home page (hero slideshow + section links)
│   ├── layout.tsx                # Root layout, fonts, metadata
│   ├── globals.css               # Tailwind base + global styles
│   ├── timeline/                 # Filterable interactive timeline
│   ├── humans-of-pomfret/        # Profile gallery + /heads-of-school
│   ├── archive/                  # Magazine index + civil-rights-era + mission-accomplished
│   ├── famous-figures/           # Schwartz Visiting Fellows gallery
│   ├── ai-bias/                  # AI bias awareness module + quiz
│   ├── tour/                     # Campus Tour (on hold)
│   ├── admin/qr-generator/       # QR code generator utility
│   ├── fonts/                    # Local font files (Geist)
│   └── favicon.ico
├── components/
│   ├── layout/                   # Header, Footer, Breadcrumbs, SectionHeading, SidebarNav
│   ├── ethics/AIContentBadge.tsx # Badge applied to all AI-generated content
│   └── ui/                       # ScrollReveal, WaveformBars
├── lib/
│   ├── qr.ts                     # QR code helper
│   └── sanity/                   # CMS client, queries, schemas
│       ├── client.ts
│       ├── queries.ts
│       └── schemas/              # chapelSpeaker, famousFigure, humanOfPomfret, timelineEvent, tourStop
├── public/                       # Archival images, fellow headshots, head portraits
│   ├── archive/
│   ├── fellows/
│   └── heads/
├── SITE-AUDIT.md                 # Internal design-system reference
├── POMFRET-ORG-TOKENS.md         # Cross-reference with pomfret.org tokens
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## Quick Start
```bash
# From the repo root
cd projects/case-c-dei-timeline
npm install
cp .env.example .env.local   # fill in Sanity credentials
npm run dev
```
Open http://localhost:3000

## Environment Variables
The app connects to Sanity CMS. You'll need a `.env.local` file with:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (usually `production`) |
| `SANITY_API_TOKEN` | Auth token for read/write (if needed) |

A `.env.example` file should be added to this folder (Phase 1 DoD item — assigned to Zahir/Keke).

## Current Status
- **Prototype merged to `main`** via PR #1 (initial build) and PR #5 (pomfret.org alignment + magazine archive + real profiles/portraits).
- Sanity schemas are written (`lib/sanity/schemas/`) but the site is **not yet wired to live Sanity data** — most content is still hardcoded demo data in the route files.
- Awaiting content approval from Dr. McCarter before handing off to the Communications department for integration into the main Pomfret School website.

## Known Issues / Phase 1 DoD Remaining
- [ ] Sanity CMS not yet connected to the site (demo data is still hardcoded)
- [ ] `.env.example` file not yet created
- [ ] "Career Span" label on the timeline year filter should be renamed to "Year Range" (`app/timeline/page.tsx`, line ~144)
- [ ] Real lockfile needs to be regenerated (run `npm install`)
- [ ] Awaiting Communications department integration

## Team
- Developers: Zahir Williams, Keke Li
- Club Lead: Cayden Auyang

## Publishing Path
This site will **not** be deployed as a standalone domain. After Dr. McCarter's final approval, it will be presented to the Communications department for integration into the main Pomfret School website under the existing DEI section.

## Links
- [Developer Onboarding Guide](../../docs/developer-onboarding.md)
- [Main Repo README](../../README.md)
- [Civic AI Club GitHub Org](https://github.com/CivicAIClub)
