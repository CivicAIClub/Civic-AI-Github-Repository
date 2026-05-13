# Pre-Deployment Audit Report

Audit date: 2026-04-19
Mode: **read-only** — no files modified
Verdict: **NOT READY FOR PRODUCTION**. 8 blockers must be resolved. See "Recommended order of operations" at the end.

---

## Repo Map

### Tech stack (from `package.json`)
- Next.js `14.2.35` (App Router)
- React `^18`
- TypeScript `^5` (`strict: true` in tsconfig ✓)
- Tailwind CSS `^3.4.1`
- Framer Motion `^12.38.0` (imported normally, not via `LazyMotion`)
- Sanity: `@sanity/client ^7.20.0`, `@sanity/image-url ^2.1.1`, `next-sanity ^12.2.1`
- `qrcode ^1.5.4` + `@types/qrcode`
- ESLint `^8` (config: `next/core-web-vitals` + `next/typescript`, with `no-explicit-any` disabled)

### Configuration files
- `next.config.mjs` — **empty default** (no headers, no image remote patterns, no redirects)
- `tsconfig.json` — standard Next.js setup, `strict: true`
- `.eslintrc.json` — default + disables `@typescript-eslint/no-explicit-any`
- `.gitignore` — standard; ignores `.env*.local` correctly
- **Missing:** `vercel.json`, `.env.example`, `sanity.config.ts`, `sanity.cli.ts`

### Route structure (`app/`)
All 15 routes are either **Static (○)** or **Dynamic (ƒ)** per `next build`:

| Route | Type | Notes |
|---|---|---|
| `/` | Static | Homepage |
| `/timeline` | Static | Horizontal DEI timeline (31 hardcoded events) |
| `/humans-of-pomfret` | Static | 17 hardcoded profiles |
| `/humans-of-pomfret/[slug]` | Dynamic | **⚠ Shows hardcoded Elena Vasquez for every slug** |
| `/humans-of-pomfret/heads-of-school` | Static | 11 hardcoded heads with 5 real photos |
| `/archive` | Static | Magazine index |
| `/archive/civil-rights-era` | Static | 14-page viewer |
| `/archive/mission-accomplished` | Static | 27-page viewer |
| `/famous-figures` | Static | 36 Schwartz Fellows (hardcoded) |
| `/tour` | Static | Tour index |
| `/tour/[locationSlug]` | Dynamic | **⚠ Shows hardcoded Clark Memorial Chapel for every slug** |
| `/ai-bias` | Static | AI Bias module + quiz |
| `/admin/qr-generator` | Static | **⚠ No auth — publicly accessible** |

No `not-found.tsx`, `error.tsx`, or `loading.tsx` files exist anywhere.

### Sanity schemas (`lib/sanity/schemas/`)
- `chapelSpeaker.ts` — **orphaned** (Chapel Voices feature was removed; no UI consumes this)
- `humanOfPomfret.ts` — has `imageAuthenticityConfirmed` required field ✓
- `timelineEvent.ts`
- `tourStop.ts`
- `famousFigure.ts` — **no `imageAuthenticityConfirmed`**; field description says "will display AI Content Badge automatically" but the frontend does not render one
- `index.ts` exports 5 schema types

**No schemas are actually consumed at runtime.** Every page's data is a hardcoded const array. The Sanity client (`lib/sanity/client.ts`) exists but is not imported by any page.

### Environment variables referenced
| Var | Location | Server/Client | Default fallback |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `lib/sanity/client.ts:4` | Client (NEXT_PUBLIC_) | `'your-project-id'` |
| `NEXT_PUBLIC_SANITY_DATASET` | `lib/sanity/client.ts:5` | Client | `'production'` |
| `NEXT_PUBLIC_SITE_URL` | `app/admin/qr-generator/page.tsx:15` | Client | `'https://pomfretvoices.org'` |

**No `.env.example` file exists.** No server-side secrets exist either (the Sanity client is configured as public-read only).

### Third-party integrations (actual code)
- **Google Fonts** via `next/font/google` — DM_Serif_Display + Poppins ✓
- **Finalsite CDN images** (pomfret.org) — Head of School and Schwartz Fellow photos hotlinked locally copied to `public/` folders. No runtime fetch. Note: Images of Tim Richards, Heather Willis Daly, and other Pomfret School public figures are served from `public/heads/` having been copied from pomfret.org's Finalsite CDN — **check whether this use is licensed**.
- **Sanity** — client configured, not consumed by any route
- **QRCode library** — client-only generation of QR images in admin tool
- **YouTube/video** — none. A grep for `youtube` only matches one import in `famous-figures/page.tsx`, but no actual embeds. (Consistent with Chapel Voices having been removed.)
- **No analytics, no error tracking, no monitoring.**

### Deployment config
- No `vercel.json`
- No `.env.example`
- No `sanity.config.ts` or `sanity.cli.ts` (Sanity Studio is not set up to deploy)
- Framework will be auto-detected as Next.js on Vercel, default settings

---

## Blockers (must fix before deploy)

### B1. `/humans-of-pomfret/[slug]/page.tsx` is hardcoded to Elena Vasquez
**File:** `app/humans-of-pomfret/[slug]/page.tsx:6-13`
**Finding:** Every individual profile page — regardless of the slug in the URL — renders a hardcoded demo profile for "Elena Vasquez," a fictional student that does **not exist** anywhere in the site's real data. Clicking any of the 17 real profile cards on `/humans-of-pomfret` navigates here and shows Elena Vasquez.
**Severity:** Blocker. Shipping this presents visitors with fabricated content about a fictional person under real people's names.
**Fix:** Resolve the `params.slug` against the real `profiles` array (already centralized in `app/humans-of-pomfret/page.tsx`). Move the array to a shared file like `lib/data/profiles.ts`, then import it in both routes and filter by slug. Add `generateStaticParams` to pre-render the 17 routes.

### B2. `/tour/[locationSlug]/page.tsx` is hardcoded to Clark Memorial Chapel
**File:** `app/tour/[locationSlug]/page.tsx:7-17`
**Finding:** Same issue as B1 — every QR-code destination resolves to a single hardcoded stop (Clark Memorial Chapel). The QR campus tour (the primary mobile use case) is currently non-functional: all 6 generated QR codes point to distinct URLs that all render the same page.
**Severity:** Blocker. This is the feature visitors will encounter first in person.
**Fix:** Same pattern — centralize `demoStops` in `lib/data/tour.ts`, resolve by `params.locationSlug` in the dynamic route, add `generateStaticParams`.

### B3. `/admin/qr-generator` has no authentication
**File:** `app/admin/qr-generator/page.tsx`
**Finding:** Fully public route. Anyone who guesses the URL can generate/download QR codes for any campus location. The route has no middleware, no auth check, no robots blocker.
**Severity:** Blocker. A public admin tool at a predictable URL is unacceptable, even for low-risk output.
**Fix:** Move behind one of:
- Vercel protected preview + disable on production builds (`vercel.json` routes block)
- Basic auth via `middleware.ts` checking `process.env.ADMIN_PASSWORD`
- Relocate to a non-indexed path and add to `robots.txt` disallow

### B4. AI disclaimer badges are absent on all AI-generated content
**File:** `app/famous-figures/page.tsx` (entire file) — and the `famousFigure` Sanity schema at `lib/sanity/schemas/famousFigure.ts:49` which explicitly promises the badge will appear
**Finding:** The Schwartz Visiting Fellows page (formerly Famous Figures, with AI-generated video) imports `AIContentBadge` **nowhere**. A grep confirms `AIContentBadge` is referenced only in:
- `components/ethics/AIContentBadge.tsx` (the component itself)
- `app/ai-bias/page.tsx` (only place it renders)

**Per project spec, every AI-generated portrait/video must carry a visible disclaimer.** Currently the `/famous-figures` page displays 35 real human photographs (not AI) but the schema was written expecting AI-generated video. This is an architectural inconsistency: if these are now REAL photos, the data model no longer matches the original AI-disclosure intent — but the schema still says "AI-Generated Video URL."
**Severity:** Blocker (ethical non-negotiable).
**Fix path 1 (if the content is real, not AI):** Rename the schema from `famousFigure` to `schwartzFellow`, remove the videoUrl/videoFile/AI-content-badge language, add `imageAuthenticityConfirmed` like other human-photo schemas.
**Fix path 2 (if there ARE AI videos to be added later):** Wire `<AIContentBadge />` into every card in `/famous-figures/page.tsx` and gate it on a "content is AI-generated" flag per fellow.

### B5. No privacy policy, accessibility statement, or photo-consent documentation
**Files:** none exist
**Finding:** Grep for `privacy|consent|GDPR|CCPA|accessibility statement` returns only one match in a markdown doc — no pages, no linked routes. Per the project brief, privacy policy + accessibility statement are required for an institutional DEI site. Photo consent for Humans of Pomfret profiles is not documented anywhere.
**Severity:** Blocker for public launch (ethical + potentially legal).
**Fix:** Create `app/privacy/page.tsx`, `app/accessibility/page.tsx`, and a `docs/PHOTO_CONSENT.md` describing the internal consent workflow. Add footer links to both pages.

### B6. No `metadataBase` in root layout
**File:** `app/layout.tsx:21-45`
**Finding:** Open Graph URLs will be relative → broken. Per Next.js, omitting `metadataBase` produces a build warning. The current build does not surface this warning only because no page uses `openGraph.images` with relative paths yet — but the moment one does, OG previews (LinkedIn, Twitter, iMessage, etc.) break.
**Severity:** Blocker (SEO + social sharing will silently degrade).
**Fix:** Add `metadataBase: new URL('https://pomfretvoices.org')` to the metadata export in `app/layout.tsx`.

### B7. No error boundaries, no 404, no loading states
**Finding:** No `app/not-found.tsx`, no `app/error.tsx`, no `app/loading.tsx`, no `app/global-error.tsx`. A runtime error on any route will display the default ugly Next.js error page in production; an unknown URL will display a default 404 unstyled page.
**Severity:** Blocker.
**Fix:** Add at minimum `app/not-found.tsx` and `app/error.tsx`, both styled to match the site brand.

### B8. Sanity client falls back to placeholder `'your-project-id'`
**File:** `lib/sanity/client.ts:4-5`
**Finding:** If `NEXT_PUBLIC_SANITY_PROJECT_ID` is not set at build time, the client silently uses `'your-project-id'`. Because **no page currently fetches from Sanity**, this is not visible — but it's a time bomb: as soon as someone wires up the first Sanity fetch without setting the env var, queries will silently fail against a nonexistent project.
**Severity:** Blocker (hidden failure mode).
**Fix:** Either throw on missing env var, or remove the Sanity client entirely until it's actually being used. Also create `.env.example` documenting the three env vars.

---

## High priority (should fix before deploy)

### H1. Every page shares the homepage's `<title>` and `<meta description>`
**Files:** Only `app/layout.tsx` exports `metadata`. None of `/timeline`, `/humans-of-pomfret`, `/humans-of-pomfret/heads-of-school`, `/archive`, `/archive/civil-rights-era`, `/archive/mission-accomplished`, `/famous-figures`, `/tour`, `/tour/[locationSlug]`, `/humans-of-pomfret/[slug]`, `/ai-bias`, or `/admin/qr-generator` export their own `metadata`.
**Effect:** Every search result and social share says "Pomfret Voices | Diversity, Equity & Inclusion" with the same generic description. Google will deduplicate these in search.
**Fix:** Add `export const metadata` to each static page and `generateMetadata({ params })` to each dynamic page.

### H2. No `robots.txt`, no `sitemap.xml`
**Finding:** No files in `public/` or App Router metadata API for either. Google will crawl whatever it finds; there's no way to block `/admin/qr-generator` from being indexed.
**Fix:** Add `app/robots.ts` and `app/sitemap.ts` (App Router convention). Disallow `/admin/*`.

### H3. No security headers configured
**File:** `next.config.mjs` is an empty object.
**Finding:** Missing `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`. Next.js does not add these by default on Vercel.
**Fix:** Add `async headers()` block to `next.config.mjs`. Minimum recommended set:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### H4. Framer Motion imported into every interactive page (~53kB)
**Finding:** `framer-motion` is imported as `{ motion, AnimatePresence } from 'framer-motion'` in at least 7 route files. This pulls the full library into every route's bundle. The shared chunk `fd9d1056-b11b2651f33aae7f.js` at 53.6 kB is mostly Framer Motion.
**Effect:** Acceptable but suboptimal — no route exceeds 200 kB First Load JS (max is `/mission-accomplished` at 152 kB), so not a blocker. But LazyMotion would shave ~20-30 kB off every route.
**Fix:** Refactor animations to use `LazyMotion` + `m.div` (`domAnimation` feature bundle).

### H5. `prefers-reduced-motion` is respected only at CSS level — not in Framer Motion
**File:** `app/globals.css:139-146` has a `@media (prefers-reduced-motion: reduce)` block that overrides CSS animation/transition durations. It does **not** affect Framer Motion's JS-driven animations (ScrollReveal, hero slideshow, mobile menu, modal open/close).
**Fix:** Use Framer's `useReducedMotion()` hook in `components/ui/ScrollReveal.tsx` to skip the slide-up animation and fade-in animation when the user prefers reduced motion. Do the same in the homepage hero slideshow.

### H6. No `next/image` `remotePatterns` configured but external URLs are expected
**File:** `next.config.mjs`
**Finding:** Empty config. If the team ever wires a real Sanity CDN (`cdn.sanity.io`) or any remote image into `next/image`, the build will fail with "Invalid src prop". Currently all images are local to `public/`, so this is latent, not broken.
**Fix:** Add `images.remotePatterns` for whatever external sources will be used (`cdn.sanity.io`, `resources.finalsite.net`, `img.youtube.com` etc.).

### H7. README is the default Next.js boilerplate
**File:** `README.md`
**Finding:** "This is a Next.js project bootstrapped with create-next-app..." with no project-specific content. No team instructions, no env var documentation, no Sanity setup steps, no deployment notes.
**Fix:** Rewrite for the Pomfret DEI project — explain features, env vars, Sanity studio plan, content-edit workflow for the DEI team.

### H8. Eve Geissinger '72 card still shows a misattributed-style quote
**File:** `app/humans-of-pomfret/page.tsx:275`
**Finding:** The quote for B. Eve Geissinger '72 reads: `'"I recall the first two years being very difficult for Eve."'` This quote is clearly from her father Warren (per magazine p21), not from Eve herself. Cards elsewhere attribute quotes to the named person. This was flagged in VERIFICATION-REPORT.md but not fixed.
**Severity:** High (misleading attribution).
**Fix:** Rewrite as a direct quote from Eve if one exists, or remove the quote and replace with a descriptive tagline.

### H9. Tour stop detail page's Spanish content lacks `lang="es"`
**File:** `app/tour/[locationSlug]/page.tsx` — conditionally renders Spanish content via `stop.quickSummary[locale]` and `stop.deepDive[locale]` but the surrounding `<p>` has no `lang` attribute.
**Effect:** Screen readers will pronounce Spanish text with English phonetic rules. Fails WCAG 3.1.2 (Language of Parts).
**Fix:** Add `lang={locale}` to the paragraph elements containing translated content.

### H10. AI Bias statistics have no citations
**File:** `app/ai-bias/page.tsx` — the "The real-world impact" stats row (59%, 80%+, 3x)
**Finding:** Three specific percentages presented as facts without any source. Earlier audit flagged these as plausible but unverified.
**Severity:** High (credibility risk on a page whose entire purpose is teaching critical thinking about AI).
**Fix:** Either replace with sourced citations (e.g., Buolamwini & Gebru's Gender Shades paper, MIT Media Lab studies) or soften to qualitative phrasing.

---

## Medium priority (fix soon after deploy)

### M1. `<h1>` on `/humans-of-pomfret/[slug]` page header rules skip levels
**File:** `app/humans-of-pomfret/[slug]/page.tsx:57` — uses `<h1>` but same page renders Header component (which has no h1) — OK. However, because the slug page is broken (see B1), heading audit is moot until content works.

### M2. No canonical URL in metadata
**File:** `app/layout.tsx:21-45`
**Finding:** No `alternates.canonical` set.
**Fix:** Add a per-page `canonical` via `metadata.alternates.canonical` OR a sensible default once `metadataBase` is set.

### M3. No structured data (JSON-LD)
**Finding:** Site has 17 person profiles, 31 timeline events, 36 fellows, and 2 articles — all ideal candidates for schema.org `Person`, `Event`, `Article`, `NewsArticle`, `EducationalOrganization`. No JSON-LD emitted anywhere.
**Fix:** Add JSON-LD via `<script type="application/ld+json">` in each page's layout or via `generateMetadata`.

### M4. YouTube iframes referenced in schema but not in UI
**Finding:** `chapelSpeaker.ts` schema has `youtubeUrl` field but Chapel Voices routes don't exist (feature removed). Nothing to fix, but the orphaned schema should be deleted to avoid confusion.

### M5. `chapelSpeaker.ts` schema is orphaned
**File:** `lib/sanity/schemas/chapelSpeaker.ts` exists and is exported from `lib/sanity/schemas/index.ts` but no page consumes it.
**Fix:** Delete the schema file and update `index.ts` OR restore the Chapel Voices feature per the original spec.

### M6. 10 MB `tim-richards.jpg` downloaded then resized — original still fetched
**Finding:** Resized locally to 89 KB via `sips` earlier. File is now small. **No issue**, just noting this as an FYI — the resized version is what's shipped.

### M7. Schwartz Fellows stats say "37 Years of Program" for 1989-2026
**File:** `app/famous-figures/page.tsx:350`
**Finding:** 1989 through 2026 is 38 years (inclusive). 37 is debatable. Minor copy issue.
**Fix:** Verify with Pomfret's intended interpretation.

### M8. Bradford Hastings and other heads still have no real photos
**File:** `public/heads/`
**Finding:** 5 real photos (Peck, Twichell, Milnor, Richards, Daly). 6 heads still use initials placeholders (Olmsted, Strong, Deitch, MacLean, Bassett, Hastings). Initials are visually consistent but not authentic.
**Fix:** Request from Pomfret archivist.

### M9. "131-year history" text is already stale
**Files:** `app/humans-of-pomfret/heads-of-school/page.tsx:171, 133` and the Daly entry
**Finding:** 2026-1894 = 132. "131-year" phrasing was accurate at install date (Sep 2025) only.
**Fix:** Change to a date-independent phrasing.

### M10. Schwartz Fellows Junot Díaz entry has no editorial context
**File:** `app/famous-figures/page.tsx` (2018 entry)
**Finding:** 2018 misconduct allegations against Díaz. On a DEI-specific site this merits an editorial decision — either add context or remove. Not a fact error but an editorial judgment call.

### M11. Tour stop cards are text-only now
**File:** `app/tour/page.tsx`
**Finding:** Per user request, photo placeholders were removed. Cards now show just title + summary + a small QR badge. The "visual hook" for campus tour stops is gone until real photos are added. Acceptable but visually bare.
**Fix:** Add campus photography through CMS or `public/tour/`.

### M12. Sergei Khrushchev (2003 Schwartz Fellow) bio uses present tense but he died June 2020
**File:** `app/famous-figures/page.tsx` 2003 entry
**Fix:** Switch to past tense ("was a senior fellow...") or add `(1935-2020)` after name.

### M13. Bill Bryson Durham Chancellor dates were fixed in an earlier pass
**Status:** Fixed (timeline says 2005-2011 now). Verified.

---

## Low priority / nice-to-have

### L1. `@typescript-eslint/no-explicit-any` is globally disabled
**File:** `.eslintrc.json:4`
**Fix:** Re-enable globally and whitelist only `lib/sanity/schemas/**` where Sanity's Rule API requires `any`.

### L2. No 44×44px touch target audit on tour sub-navigation
**Finding:** The tour campus map was removed. Tour cards link-only (entire card is clickable). OK but no explicit minimum size enforced.

### L3. No bundle analyzer configured
**Fix:** Add `@next/bundle-analyzer` for future diagnostics.

### L4. No tests
**Finding:** No `*.test.tsx` files. No Vitest/Jest/Playwright config.
**Fix:** Add at minimum a Playwright smoke test that hits every top-level route and asserts 200.

### L5. No pre-commit hooks
**Fix:** Add Husky + lint-staged to enforce lint on commit.

### L6. `package.json` engines field not set
**Fix:** Add `"engines": { "node": ">=18.17" }` to ensure Vercel uses a compatible Node version.

### L7. Social icons in footer use inline SVG (good) but have no `rel="me"` or `rel="noopener"` enforcement audit
**Status:** All external links DO have `rel="noopener noreferrer" target="_blank"` ✓.

### L8. VERIFICATION-REPORT.md, SITE-AUDIT.md, POMFRET-ORG-TOKENS.md shipped in repo
**Finding:** Internal planning docs are committed alongside app code. Will be publicly accessible via Vercel if a future page links them.
**Fix:** Move to `docs/` or `.internal/` and add to `.gitignore` before launch if they're not meant to be public.

---

## Category summary

| # | Category | State |
|---|---|---|
| 1 | **Content completeness** | **Broken.** Two dynamic routes hardcoded to demo data (B1, B2); Sanity configured but unused. |
| 2 | **Ethical guardrails** | **Partially implemented.** Footer acknowledgment ✓. Photo authenticity field in 2/5 schemas. AI badge component exists but isn't rendered on the Schwartz Fellows / Famous Figures page (B4). |
| 3 | **Accessibility** | **Mostly good.** Skip link ✓, `alt` on all images ✓, `lang="en"` ✓, CSS reduced-motion ✓. Issues: Framer animations ignore reduced-motion preference (H5), Spanish content missing `lang="es"` (H9), no label audit on form inputs in the quiz. |
| 4 | **Performance** | **Acceptable.** No route exceeds 200 kB. Framer Motion imported fully (H4) but tolerable. No raw `<img>` for content; one `<img>` in admin QR tool for data-URL rendering is appropriate. |
| 5 | **SEO & metadata** | **Weak.** Only the root layout has metadata (H1). No `metadataBase` (B6). No `robots.txt`, no `sitemap.xml` (H2). No canonicals (M2), no JSON-LD (M3). |
| 6 | **Security** | **Missing.** No custom headers (H3). Public admin route (B3). Sanity client has placeholder fallback (B8). No CSP. |
| 7 | **Error handling** | **Missing.** No `not-found.tsx`, `error.tsx`, or `loading.tsx` anywhere (B7). |
| 8 | **Responsive design** | **Good.** Tailwind responsive prefixes used throughout. Mobile QR flow (the primary use case) works, but currently broken because of B2. |
| 9 | **CMS / Sanity** | **Not wired.** Schemas defined, client configured, but zero pages consume them. Studio is not deployable. Orphaned schema (M5). |
| 10 | **Build & deploy config** | **Partial.** Build ✓, lint ✓, TypeScript strict ✓. Missing: `.env.example`, `vercel.json`, boilerplate README (H7). |
| 11 | **Legal & compliance** | **Missing.** No privacy policy, no accessibility statement, no photo-consent documentation (B5). Cookie consent not needed (no analytics). |
| 12 | **Monitoring & observability** | **Missing.** No Sentry, no Vercel Analytics, no uptime monitoring. Reasonable to defer for a v1 but should be flagged explicitly. |

---

## Open questions for Kerun

1. **Is the `/famous-figures` page showing AI-generated video/images or real photographs?** The Sanity schema (`famousFigure.ts`) still says "AI-Generated Video URL" and promises an AI Content Badge, but the rendered UI shows 35 real-human photographs of visiting fellows (sourced from Pomfret's CDN and Wikipedia-style imagery). If these are real, the schema and disclaimer structure need to change (per B4). If they're a placeholder until AI videos exist, the badge must be wired.

2. **Is Chapel Voices intentionally removed, or on hold?** The schema `chapelSpeaker.ts` is orphaned. If it's been cancelled, we should delete the schema. If it's paused, we should leave it but document that.

3. **Is Sanity CMS going to be activated before launch?** Every data page currently ships hardcoded arrays. The DEI staff cannot edit content without developer intervention. Per the original spec this was the main reason for CMS — should we prioritize wiring at least one content type (e.g., timeline events) before launch?

4. **What is the live domain?** `pomfretvoices.org` appears as a placeholder in `app/admin/qr-generator/page.tsx:15`. Is that domain actually registered? `metadataBase` needs the real URL. If this is the domain, `robots.txt` and `sitemap.xml` need it.

5. **Do we have copyright clearance for the 5 Head of School photos downloaded from pomfret.org's Finalsite CDN?** These were hotlinked/copied for internal use. If the main school site retains copyright, we need written permission — especially for the living heads (Richards, Daly).

6. **Is there a photo-consent process for the Humans of Pomfret profiles?** The schema enforces an "unaltered image" checkbox but nothing documents who signs off on the person's consent to appear at all.

7. **Should `/admin/qr-generator` exist in production?** If it's a one-time internal tool used only during QR creation, we should either protect it with auth or remove it from the production build entirely.

8. **Who owns the Sanity account?** No `.env.example`, no Sanity config committed. If the deployment team can't locate project credentials, the CMS activation path is blocked.

---

## Recommended order of operations

Tackle in this order to minimize rework:

1. **Fix B1 + B2 (dynamic route hardcoding).** Extract `profiles` and `demoStops` into `lib/data/*.ts`, implement slug resolution, add `generateStaticParams`. Without this, two routes are broken for every visitor.
2. **Fix B6 (`metadataBase`)** and **H1 (per-page metadata)** together. Add `metadataBase` to root layout, then add `export const metadata` to each page.
3. **Add B7 (`not-found.tsx`, `error.tsx`, `loading.tsx`).** Styled to match the brand.
4. **Fix B4 (AI content badge) OR restructure schema.** Decide with Kerun (Open Question 1) whether the Schwartz page shows AI or real content, then either wire the badge or rewrite the schema.
5. **Fix B5 (legal pages).** Add `/privacy`, `/accessibility`. Even MVP stubs are better than nothing for an institutional site.
6. **Fix B3 (admin auth).** Simplest: `middleware.ts` with basic auth against an env var.
7. **Fix B8 (Sanity fallback).** Either throw on missing env or delete the client until CMS is wired.
8. **Add H2 (`robots.ts` + `sitemap.ts`) and H3 (security headers).** Both one-liner additions in `next.config.mjs` and new files in `app/`.
9. **Fix H5 (`useReducedMotion` in Framer Motion).** WCAG 2.3.3 compliance.
10. **Fix H7 (README) and add `.env.example`.** Required for any new team member or deploy engineer.

After these 10 items, the Medium priority issues can be addressed post-launch or in parallel. Items M4, M5, M6, M13 are already resolved or are purely editorial decisions.

---

## Build output (verbatim)

```
✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (15/15)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    5.19 kB         141 kB
├ ○ /_not-found                          873 B          88.2 kB
├ ○ /admin/qr-generator                  11.1 kB        98.5 kB
├ ○ /ai-bias                             6.65 kB         143 kB
├ ○ /archive                             2.67 kB         144 kB
├ ○ /archive/civil-rights-era            7.51 kB         149 kB
├ ○ /archive/mission-accomplished        10.6 kB         152 kB
├ ○ /famous-figures                      8.17 kB         150 kB
├ ○ /humans-of-pomfret                   9.99 kB         152 kB
├ ƒ /humans-of-pomfret/[slug]            1.26 kB         137 kB
├ ○ /humans-of-pomfret/heads-of-school   4.91 kB         147 kB
├ ○ /timeline                            9.73 kB         146 kB
├ ○ /tour                                2.28 kB         138 kB
└ ƒ /tour/[locationSlug]                 3.67 kB         140 kB
+ First Load JS shared by all            87.3 kB
```

```
$ npx next lint
✔ No ESLint warnings or errors
```

Build and lint are clean — which makes the B1 and B2 blockers especially dangerous, because nothing in CI will catch them. They pass compile-time checks but render fabricated content.
