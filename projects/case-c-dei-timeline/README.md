# Pomfret Voices — DEI Digital Archive

A living digital archive of diversity, equity, and inclusion at **Pomfret School** (founded 1894, Pomfret, Connecticut). Built as a companion to the main [pomfret.org](https://www.pomfret.org) site and maintained by the Pomfret School DEI Department.

**Live:** _(to be deployed — see [Deployment](#deployment) below)_

---

## What's on the site

| Route | What it is |
|---|---|
| `/` | Auto-advancing hero slideshow + mission + signature exhibits + real voices + story feed |
| `/timeline` | Horizontal-scroll interactive timeline of 31 DEI milestones, 1894 → 2026 |
| `/humans-of-pomfret` | 17 real alumni + faculty profiles drawn from archival magazines |
| `/humans-of-pomfret/[slug]` | Individual profile detail (dynamically pre-rendered for every person) |
| `/humans-of-pomfret/heads-of-school` | 11 Heads of School from William E. Peck (1894) through Heather Willis Daly (2025) |
| `/archive` | Magazine archive index |
| `/archive/civil-rights-era` | 14-page viewer for *Pomfret in the Civil Rights Era* (Fall 2005) |
| `/archive/mission-accomplished` | 27-page viewer for *Mission Accomplished: 35 Years of Coeducation* (September 2003) |
| `/famous-figures` | 36 Schwartz Visiting Fellows (1989–2026) with real photographs |
| `/tour` | Campus tour index — six stops, bilingual (EN/ES) |
| `/tour/[locationSlug]` | Mobile-first QR landing page for each stop |
| `/ai-bias` | AI Bias Awareness educational module with interactive quiz |
| `/privacy` | Privacy policy |
| `/accessibility` | WCAG 2.1 AA accessibility statement |
| `/admin/qr-generator` | **Protected** QR code generator for tour stops (basic auth) |

---

## Tech stack

- **Framework:** [Next.js 14](https://nextjs.org) App Router, TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com) with CSS custom properties for the Pomfret brand palette
- **Animation:** [Framer Motion](https://motion.dev) via `LazyMotion` for bundle-size optimization
- **Fonts:** DM Serif Display + Poppins via `next/font/google`
- **CMS (planned, not yet wired):** [Sanity.io](https://www.sanity.io) — schemas live in `lib/sanity/schemas/`
- **Hosting target:** [Vercel](https://vercel.com)

---

## Local development

### Prerequisites

- Node.js ≥ 18.17
- npm (or pnpm/yarn/bun — scripts assume npm)

### Setup

```bash
git clone <repo-url>
cd pomfret-dei
npm install
cp .env.example .env.local
# edit .env.local — at minimum, set NEXT_PUBLIC_SITE_URL
npm run dev
```

Open http://localhost:3000.

### Scripts

```bash
npm run dev     # Start dev server (hot reload)
npm run build   # Production build — fails on type / lint errors
npm run start   # Serve the production build locally
npm run lint    # ESLint check
```

---

## Environment variables

All required env vars are documented in [`.env.example`](./.env.example). Copy to `.env.local` for development; set in Vercel's project settings for deployments.

| Var | Purpose | Used where |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (no trailing slash) | Sitemap, robots, `metadataBase`, QR generator base |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (future use) | `lib/sanity/client.ts` — **throws** if missing when the client is imported |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (usually `production`) | Same |
| `ADMIN_USERNAME` | Admin login username | `app/admin/login/actions.ts` — `/admin/*` fails closed if unset |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password (generate with `node scripts/hash-password.mjs <password>`) | Same |
| `SESSION_SECRET` | Random ≥32-byte string used to HMAC-sign admin session cookies | `lib/auth.ts`, `middleware.ts` — fail-closed 503 if unset |
| `KV_REST_API_URL` | _Optional_ Vercel KV / Upstash URL — enables durable login rate limiting | `lib/rate-limit.ts` (falls back to in-memory if absent) |
| `KV_REST_API_TOKEN` | _Optional_ Vercel KV / Upstash token | Same |

> **Heads up:** the Sanity client throws at import time if its env vars are missing, so you can't accidentally ship a broken CMS connection that "looks fine." Don't import `lib/sanity/client.ts` until you're ready to wire up the CMS.

---

## Content editing

**Currently:** all content is hardcoded in TypeScript files for stability while Sanity is being set up. To edit content, modify:

| File | Content |
|---|---|
| `lib/data/profiles.ts` | Humans of Pomfret — 17 profiles |
| `lib/data/tour-stops.ts` | Campus tour — 6 bilingual stops |
| `app/timeline/TimelineView.tsx` | Timeline events — 31 items in the `demoEvents` array |
| `app/humans-of-pomfret/heads-of-school/HeadsView.tsx` | 11 Heads of School |
| `app/famous-figures/SchwartzFellowsView.tsx` | 36 Schwartz Fellows |
| `app/archive/civil-rights-era/CivilRightsEraView.tsx` | 14-page magazine transcripts |
| `app/archive/mission-accomplished/MissionAccomplishedView.tsx` | 27-page magazine transcripts |

**After Sanity is wired**, edits will happen in the Studio (not yet deployed). Sanity schemas are already defined in `lib/sanity/schemas/` for:
- `timelineEvent`
- `humanOfPomfret` (with required `imageAuthenticityConfirmed` field)
- `tourStop`
- `schwartzFellow` (with required `imageAuthenticityConfirmed` field)

---

## Ethical guardrails

Three commitments are enforced throughout this codebase:

1. **No AI-generated portraits of real people.** The schemas for any human-photo content require an `imageAuthenticityConfirmed` checkbox; publishing is blocked until it's ticked.
2. **Persistent AI bias acknowledgment.** A footer strip on every page links to `/ai-bias` with the text "Pomfret School acknowledges that AI tools carry inherent biases."
3. **Photo consent workflow.** Documented in [`docs/PHOTO_CONSENT.md`](./docs/PHOTO_CONSENT.md) — three tiers (living subject, public figure, archival) with clear response-time SLAs.

---

## Accessibility

See [`/accessibility`](./app/accessibility/page.tsx) — the public statement committing to WCAG 2.1 AA.

Implementation notes:
- Skip-to-main-content link on every page
- All images have meaningful alt text
- `prefers-reduced-motion` respected in both CSS and Framer Motion (via `useReducedMotion`)
- Spanish content on the campus tour uses `lang="es"` for correct screen-reader pronunciation
- Semantic heading hierarchy (one `<h1>` per page, no level skips)
- Minimum 44×44 px touch targets on interactive elements
- Audio never autoplays — every audio clip requires a user tap

---

## Security

Configured in `next.config.mjs`:

- HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- Minimal `Permissions-Policy` (camera, mic, geolocation, payment, USB all denied)
- Content Security Policy covering `default-src 'self'`, YouTube embed allowlist, Sanity CDN, Finalsite image CDN
- `/admin/*` routes protected by **session-cookie auth** (`middleware.ts` + `lib/auth.ts`):
  - Login form at `/admin/login`; bcrypt-verified password (`ADMIN_PASSWORD_HASH`)
  - HMAC-SHA256-signed HttpOnly cookie, 8-hour TTL
  - Constant-time comparison, no username enumeration
  - Rate limit: 5 attempts / 15 min / IP (Vercel KV when configured; in-memory fallback)
  - Logout endpoint at `/admin/logout`
  - Fails closed with 503 if `SESSION_SECRET` is missing

No secrets are committed; the `.gitignore` blocks all `.env*.local` variants.

---

## Deployment

Designed for Vercel with zero config. Steps:

1. Connect the GitHub repo to Vercel.
2. In **Project Settings → Environment Variables**, set:
   - `NEXT_PUBLIC_SITE_URL` → production domain (e.g., `https://pomfretvoices.org`)
   - `ADMIN_USERNAME`, `ADMIN_PASSWORD` → whatever the DEI team uses for the admin tool
   - Sanity vars — only if/when the CMS is being wired
3. Deploy.

**Before first deploy:**
- Register the production domain (DNS → Vercel's name servers or CNAME record)
- Confirm photo rights for any hotlinked images in `public/heads/` and `public/fellows/` — see [`docs/PHOTO_CONSENT.md`](./docs/PHOTO_CONSENT.md)
- Review [`AUDIT-REPORT.md`](./AUDIT-REPORT.md) for remaining Medium-priority items

**After deploy:**
- Verify `/robots.txt` and `/sitemap.xml` return the right production URLs
- Verify `/admin/qr-generator` requires auth
- Test a Twitter/Open Graph share of the homepage (preview image via `metadataBase`)

---

## Repository layout

```
pomfret-dei/
├── app/                        # Next.js App Router routes
│   ├── layout.tsx              # Root layout (fonts, metadata, MotionProvider, Header, Footer)
│   ├── page.tsx                # Homepage
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── not-found.tsx           # 404 page
│   ├── error.tsx               # Global error boundary
│   ├── loading.tsx             # Loading state
│   ├── privacy/                # Privacy policy
│   ├── accessibility/          # Accessibility statement
│   ├── timeline/               # Interactive DEI timeline
│   ├── humans-of-pomfret/      # Profile index + dynamic detail + Heads of School
│   ├── archive/                # Magazine archive
│   ├── famous-figures/         # Schwartz Visiting Fellows
│   ├── tour/                   # Campus tour (index + dynamic stops)
│   ├── ai-bias/                # AI bias awareness module
│   └── admin/qr-generator/     # Admin QR generator (auth-protected)
│
├── components/
│   ├── layout/                 # Header, Footer, Breadcrumbs, SidebarNav, SectionHeading
│   ├── ethics/                 # AIContentBadge
│   └── ui/                     # ScrollReveal, WaveformBars, MotionProvider
│
├── lib/
│   ├── data/                   # Hardcoded content (profiles, tour-stops) — becomes Sanity queries
│   ├── qr.ts                   # QR code generation utilities
│   └── sanity/                 # Sanity client + GROQ queries + schemas (not yet wired)
│
├── public/
│   ├── archive/                # Magazine scans + cropped portraits
│   ├── fellows/                # 35 Schwartz Fellow photos
│   └── heads/                  # 5 Head of School photos
│
├── docs/
│   └── PHOTO_CONSENT.md        # Internal photo-consent workflow
│
├── middleware.ts               # Basic auth for /admin/*
├── next.config.mjs             # Security headers, image remotePatterns
├── tailwind.config.ts          # Pomfret brand tokens
├── .env.example                # Every required env var, documented
├── AUDIT-REPORT.md             # Pre-deployment audit
├── SITE-AUDIT.md               # Design system reference
├── POMFRET-ORG-TOKENS.md       # pomfret.org design-token reference
└── VERIFICATION-REPORT.md      # Fact-check report against source documents
```

---

## Source documents

Every piece of content on this site is traceable back to one of four primary sources:

1. **Pomfret School DEI History PDF** — official school timeline
2. **Manus Research Report** (April 2026) — full roster of Schwartz Visiting Fellows
3. **"Pomfret in the Civil Rights Era"** (Pomfret Magazine, Fall 2005) — 14-page issue by Elizabeth Lake
4. **"Mission Accomplished: 35 Years of Coeducation"** (Pomfret Magazine, September 2003) — 27-page issue edited by Sharon Gaudreau

See [`VERIFICATION-REPORT.md`](./VERIFICATION-REPORT.md) for a claim-by-claim audit.

---

## Team

- **Owner:** Pomfret School DEI Department
- **Dean of DEI:** Dr. Coretta McCarter

For content corrections, removal requests, or accessibility issues: email the Dean of DEI or call 860.963.6100.
