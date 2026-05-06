# Pomfret Voices — Site Design Audit

_Comprehensive design-system reference for building a visually identical sister site. All values are pulled directly from the codebase as of this audit. Where a value comes from a specific file, the path is noted inline._

---

## Table of Contents

1. [Design Tokens & Brand System](#1-design-tokens--brand-system)
2. [Layout Architecture](#2-layout-architecture)
3. [Component Inventory](#3-component-inventory)
4. [Typography Details](#4-typography-details)
5. [Animation & Motion](#5-animation--motion)
6. [Tech Stack & Dependencies](#6-tech-stack--dependencies)
7. [File Structure](#7-file-structure)
8. [Homepage Section-by-Section](#8-homepage-section-by-section)
9. [Interior Page Patterns](#9-interior-page-patterns)
10. [Raw Values Dump](#10-raw-values-dump)

---

## 1. Design Tokens & Brand System

### 1.1 CSS Custom Properties

All tokens live in `app/globals.css`:

```css
:root {
  /* Brand — Black & Crimson Red (mimics pomfret.org) */
  --navy:         #000000;   /* Pure black, used as the primary heading/text color */
  --navy-light:   #1A1A1A;
  --navy-dark:   #000000;

  /* Crimson Red — primary accent */
  --maroon:       #A8172B;
  --maroon-light: #C93545;
  --maroon-dark:  #7A1520;

  /* "Gold" is aliased to crimson — a legacy variable kept for semantic clarity,
     but it renders as red. Use --maroon for new work. */
  --gold:         #A8172B;
  --gold-light:   #C93545;
  --gold-dark:    #7A1520;
  --amber:        #A8172B;

  /* Warm cream neutrals */
  --cream:        #F0EAE0;   /* Secondary background, cards */
  --cream-dark:   #E5DDC9;
  --linen:        #EDE8DD;
  --warm-white:   #F7F2E8;   /* Primary page background */
  --charcoal:     #000000;   /* Body text */
  --slate:        #4A4A4A;   /* Muted body text */
  --mist:         #D9D2C4;   /* Borders, dividers */

  /* Semantic aliases */
  --background:   var(--warm-white);
  --foreground:   var(--charcoal);
  --primary:      var(--navy);
  --secondary:    var(--maroon);
  --accent:       var(--maroon);
  --surface:      var(--cream);
  --surface-alt:  var(--linen);
  --border:       var(--mist);

  /* Type */
  --font-display: 'DM Serif Display', 'Playfair Display', Times, serif;
  --font-body:    'Poppins', 'DM Sans', Arial, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Spacing */
  --section-padding:    clamp(3rem, 8vw, 8rem);
  --content-max-width:  1280px;
}
```

### 1.2 All Hex Values in Use

Grepped from the full codebase — these are the actual colors, including tokens and inline rgba:

| Hex | Usage |
|---|---|
| `#000000` | Black. Primary text/heading color. Also used for image overlays at varying opacity. |
| `#1A1A1A` | `--navy-light`. Rare — menu active state. |
| `#A8172B` | Crimson red. All accent color, hovers, underline, links, CTAs. |
| `#C93545` | Lighter crimson. Hero italic phrase, hover states. |
| `#7A1520` | Darker crimson. Hover-darken, text-link hover. |
| `#F0EAE0` | Cream. Card backgrounds, section BG (alternating with warm-white). |
| `#E5DDC9` | Darker cream. Occasional accents. |
| `#EDE8DD` | Linen. Between cream and warm-white. |
| `#F7F2E8` | Warm white. Page background. |
| `#4A4A4A` | Slate gray. Body text (secondary). |
| `#D9D2C4` | Mist. Dividers, subtle borders. |

Hardcoded rgba/rgb values (inline, not in tokens):

```
rgba(0,0,0,0.01)           /* linen texture lines */
rgba(0,0,0,0.5)            /* hero text-shadow */
rgba(0,0,0,0.3)            /* gallery image overlay */
rgba(27, 42, 74, 0.08)     /* legacy museum-frame shadow (old navy blue) */
rgba(27, 42, 74, 0.04)     /* legacy museum-frame shadow outer */
rgba(196, 153, 59, 0.10-0.30)  /* holographic effect (gold tinted) — legacy, Famous Figures */
rgba(123, 45, 59, 0.10)    /* holographic maroon tint */
```

> Note on legacy tokens: `--gold`, `--amber`, and the `rgba(196, 153, 59, …)` values date from an earlier gold-accent palette. The current brand is red-only. New work should use `--maroon`.

### 1.3 Typography Stack

- **Display:** `DM Serif Display` (weight 400) — loaded via `next/font/google` in `app/layout.tsx`. Fallbacks: `Playfair Display`, `Times`, `serif`.
- **Body:** `Poppins` (weights 300 / 400 / 500 / 600 / 700) — loaded via `next/font/google`. Fallbacks: `DM Sans`, `Arial`, `sans-serif`.
- **Mono:** `JetBrains Mono` — referenced as a variable but **not actually imported**. Nothing on the site renders mono text.
- Font files: none self-hosted. Both served from Google Fonts through Next.js font optimization. The `public/fonts/` and `app/fonts/` directories are empty/boilerplate.
- Font-display: `swap` (configured in `app/layout.tsx`).

### 1.4 Spacing Scale

Spacing uses **Tailwind's default 4px base scale** (0.25rem step) plus two custom tokens:

- `section` → `clamp(3rem, 8vw, 8rem)` — vertical rhythm between page sections
- `content` maxWidth → `1280px`

Repeating section patterns observed:

```
Hero sections:        py-24 lg:py-32  (96px / 128px)
Interior page hero:   py-16 lg:py-24  (64px / 96px)
Content sections:     py-12 lg:py-20  (48px / 80px)
Card interior:        p-5 / p-6 lg:p-8
Stacked UI groups:    space-y-4 / space-y-6 / space-y-8 / space-y-12
```

### 1.5 Border Radius

Radius is **conservative and editorial** — generally small. No pill-shaped buttons by default (except circular icon buttons).

| Token | Value | Used on |
|---|---|---|
| `rounded-sm` (Tailwind default) | `0.125rem` = 2px | Cards, image tiles, most surfaces |
| `rounded-lg` | `0.5rem` | Nav menu mobile items, skip-link |
| `rounded-xl` | `0.75rem` | Tour / admin cards |
| `rounded-2xl` | `1rem` | Large feature cards, museum frames, modal dialogs |
| `rounded-full` | Circle | Icon buttons, category badges, utility sidebar |

Most **photographic cards use `rounded-2xl`**; most **gallery tiles use `rounded-sm`**.

### 1.6 Box Shadows

```css
/* museum-frame class — used on profile/archive cards */
box-shadow:
  0 0 0 1px var(--mist),
  0 2px 8px rgba(27, 42, 74, 0.08),
  0 8px 24px rgba(27, 42, 74, 0.04);

/* holographic-glow (legacy — Famous Figures dark theme variant) */
box-shadow:
  0 0 15px rgba(196, 153, 59, 0.15),
  0 0 30px rgba(196, 153, 59, 0.08),
  inset 0 0 15px rgba(196, 153, 59, 0.05);

/* Tailwind hover:shadow-lg / shadow-xl on cards (default Tailwind values) */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
```

### 1.7 Transitions & Easing

Everything uses **Tailwind's default transitions**:

- `transition-colors`   → 150ms, default cubic-bezier(0.4, 0, 0.2, 1)
- `transition-all`      → 150ms
- `duration-200`        → 200ms (button hover, utility sidebar)
- `duration-300`        → 300ms (hamburger morph, card hover bg)
- `duration-500`        → 500ms (card hover shadow, image zoom)

Framer Motion (JS-driven animations) uses a custom cubic bezier:

```js
ease: [0.25, 0.1, 0.25, 1]  // in ScrollReveal.tsx
```

Framer motion durations seen: 0.3, 0.4, 0.5, 0.7, 0.8, 1.0, 1.2 seconds. Typical scroll-reveal is 0.7s.

### 1.8 Z-Index Layers

| Value | Used on |
|---|---|
| `z-20` | Hero carousel arrows + indicators |
| `z-30` | Sticky page filter bars |
| `z-50` | Fixed header, modal overlays |
| `z-[100]` | Skip-to-content focus link |

---

## 2. Layout Architecture

### 2.1 Grid & Container System

Two "widths" live in the codebase:

- **`max-w-content`** → `1280px` (Tailwind extend, CSS var `--content-max-width`). Used on most interior page headers/footers.
- **`max-w-7xl`** → Tailwind default `80rem` = 1280px. Functionally identical — newer code uses `max-w-7xl` directly.
- Narrower content: `max-w-3xl` (768px) for single-column reading measure (mission statement, article body).
- Narrower still: `max-w-2xl` (672px) for intro blurbs under section titles.

**All containers use:**
```
px-4 sm:px-6 lg:px-8    /* Horizontal padding */
mx-auto                  /* Centered */
```

### 2.2 Responsive Breakpoints (Tailwind defaults)

| Prefix | Min width |
|---|---|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

The site uses **`sm:` and `lg:` almost exclusively**. `md:` and `xl:` appear rarely.

Typical breakpoint behavior:
- **Under `sm`:** Single column layouts, hamburger menu, stacked cards, reduced padding.
- **`sm` to `lg`:** 2-column grids, still hamburger.
- **`lg` and up:** Full desktop nav bar, announcement bar visible, vertical utility sidebar, 3-6 column grids, vertical padding increases.

### 2.3 Page Template Pattern

Every non-home page follows this structure:

```
<Header />                        (fixed, z-50)
<main id="main-content">
  <section> Page Hero              (bg-cream OR bg-navy — textured)
    ├── Kicker text                (uppercase, tracking-[0.3em], red)
    ├── <h1 className="text-section">
    └── Intro paragraph
  </section>

  <div> Sticky Filter / Sub-nav    (only where filtering applies)

  <section> Page Content           (bg-warm-white, py-12 lg:py-20)

  <section> Credits / Footer strip (optional)
</main>
<Footer />
```

### 2.4 Section Vertical Rhythm

On the homepage, **each section alternates between `bg-warm-white` and `bg-cream`**:

| Section | Background | Vertical padding |
|---|---|---|
| Hero | gradient to dark | `h-[100vh] min-h-[700px]` |
| Mission | `bg-warm-white` | `py-24 lg:py-32` |
| Signature Exhibits | `bg-cream` | `py-24 lg:py-32` |
| Remarkable Voices | `bg-warm-white` | `py-24 lg:py-32` |
| Latest Stories | `bg-cream` | `py-24 lg:py-32` |
| Image Gallery | `bg-warm-white` | `py-24 lg:py-32` |

---

## 3. Component Inventory

### 3.1 Header (`components/layout/Header.tsx`)

Three-zone fixed header:

1. **Announcement bar** (`hidden lg:block`)
   - `bg-maroon text-warm-white py-2.5 px-4`
   - `text-xs tracking-wider uppercase`
   - Centered content with inline arrow SVG
2. **Main header** (`bg-warm-white/95 backdrop-blur-md border-b border-mist/50`)
   - Height: `h-20 lg:h-24`
   - **Logo pattern:** stacked wordmark — `font-display text-2xl lg:text-3xl` "POMFRET" on top, a red underline bar (`h-0.5 bg-maroon`), then `text-[10px] tracking-[0.2em] uppercase` subtitle.
   - **Nav items:** `px-4 py-2 text-sm font-semibold text-navy hover:text-maroon` — no underline, color-only hover.
   - **Search button:** Circular, `w-10 h-10 rounded-full border border-navy/20`, invert colors on hover.
   - **Hamburger:** 3 stacked `h-0.5 w-6 bg-navy` bars that rotate into an X (`rotate-45 translate-y-2` top, `opacity-0` middle, `-rotate-45 -translate-y-2` bottom) over 300ms.
3. **Vertical utility sidebar** (`hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2`)
   - Pill container `border border-navy/20 rounded-full backdrop-blur-md`
   - Each link is text rotated via `writingMode: 'vertical-rl'; transform: rotate(180deg)`.
   - `text-[10px] font-semibold tracking-[0.2em] uppercase`.

Mobile menu: slides down from the header using Framer Motion `initial={{opacity:0, height:0}}` / `animate={{opacity:1, height:'auto'}}`, duration 300ms.

### 3.2 Footer (`components/layout/Footer.tsx`)

- `bg-navy text-cream/80`
- Two-tier layout:
  1. **Top bias-acknowledgment bar** — `bg-navy-dark border-b border-cream/10 py-4`, centered small text with a single inline gold/red "Learn more" link.
  2. **Main grid** — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12`, first column spans 2 and holds a brand block (circular P icon in `bg-gold/20`, wordmark, tagline).
  3. **Bottom bar** — `border-t border-cream/10 mt-12 pt-8`, `text-xs text-cream/40` for copyright + legal.
- Link hover: `hover:text-gold transition-colors duration-200`.
- Section headings: `font-display font-semibold text-cream text-sm tracking-wider uppercase mb-4`.

### 3.3 Hero (homepage only)

See section 8.1 for detail. Key traits:
- Full viewport height `h-[100vh] min-h-[700px]`
- Gradient background with SVG noise overlay
- Circular carousel arrows positioned at `top-1/2 -translate-y-1/2`
- Headline size: `clamp(3rem, 8vw, 7rem)` with `leading-[0.95]`
- One italic word wrapped in `text-maroon-light italic` for accent
- `textShadow: '0 2px 20px rgba(0,0,0,0.5)'` on heading, half strength on subtitle
- Carousel indicator: 1 active `w-8 h-0.5 bg-warm-white` + 3 inactive `w-2 h-0.5 bg-warm-white/40`

### 3.4 Section Kicker Pattern

Every section header follows this identical micro-pattern:

```tsx
<div className="text-xs font-body tracking-[0.3em] uppercase text-maroon mb-4">
  Kicker Text
</div>
<h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight text-navy">
  Section title.
</h2>
```

Variations include:
- Centered over a `w-16 h-px bg-maroon` divider (mission statement).
- Left-aligned with a right-side "View all →" link (latest stories).
- Left-aligned with carousel prev/next arrow buttons (remarkable voices).

### 3.5 Cards

**Profile Card** (Humans of Pomfret masonry, Schwartz Fellows grid):

```
bg-cream rounded-2xl overflow-hidden museum-frame

  aspect-[3/4] portrait area                (image or initials fallback)
  ├── Top-left badge                        (role · year, rounded-full bg-warm-white/90)
  └── Image via next/image fill + object-cover

  p-5 content
  ├── blockquote  font-display italic text-lg text-navy
  ├── Name        font-semibold text-navy text-sm
  ├── Meta        text-xs text-slate
  └── Tag pills   text-xs px-2 py-0.5 rounded-full bg-mist text-slate
```

Hover: `hover:shadow-xl transition-all duration-500`.

**Exhibit Card** (homepage Signature Exhibits — editorial directory):

```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-navy/10 rounded-sm overflow-hidden
  └── Each cell: bg-cream hover:bg-warm-white p-6 lg:p-7 min-h-[280px]
      ├── Top row (flex justify-between):
      │     ├── tiny red uppercase category    (text-[10px] tracking-[0.25em])
      │     └── "01 / 05" counter              (font-display text-navy/30)
      ├── Title                                (font-display text-2xl)
      ├── Meta row                             (text-[11px] uppercase tracking-wider)
      ├── Description                          (text-sm text-slate, flex-1)
      └── "Explore →" link (mt-auto, bottom pin)
```

No photography. Cards sit flush with 1px dividers between them (the gap-px + bg-navy/10 trick).

**Story Card** (Latest Stories homepage section):

```
article
  aspect-[16/10] bg-gradient-to-br from-navy/80 to-navy-dark  (image placeholder)
  category · author · date         (uppercase tracking-wider text-xs, category in red)
  Title                            (font-display text-2xl group-hover:text-maroon)
  Excerpt paragraph                (text-slate leading-relaxed)
```

### 3.6 Buttons

**Primary (on light bg):**
```tsx
className="group inline-flex items-center gap-3 px-6 py-3.5 bg-navy text-cream rounded-xl
  hover:bg-navy-light transition-all duration-300 shadow-lg shadow-navy/20
  hover:shadow-xl hover:shadow-navy/30"
```

**Secondary / outline:**
```tsx
className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-navy/20 text-navy
  rounded-xl hover:border-navy/40 hover:bg-cream transition-all duration-300
  font-body font-semibold"
```

**Circular icon button (used for carousel nav, search):**
```tsx
className="w-12 h-12 rounded-full border border-navy/20 text-navy/60
  hover:text-navy hover:border-navy transition-all flex items-center justify-center"
```

On dark backgrounds the same pattern uses `border-warm-white/30 text-warm-white/60 hover:text-warm-white`.

**Text CTA ("Explore →"):**
```tsx
className="inline-flex items-center gap-2 text-sm font-body font-semibold text-maroon
  group-hover:gap-3 transition-all"
```

The gap widens on hover — a subtle signature detail.

**Filter pills (sticky sub-nav):**
```tsx
/* Active */    bg-navy text-cream
/* Inactive */  bg-cream text-slate hover:bg-cream-dark
/* Shape */     px-4 py-1.5 rounded-full text-sm font-body transition-all
```

### 3.7 Badges & Pills

- **Role/category pill:** `text-xs px-2 py-0.5 rounded-full` — bg colors map to the category (e.g., `bg-mist text-slate` for tags, `bg-navy text-cream` for active filters, `bg-maroon/10 text-maroon` for flagged entries).
- **"Est. 1894 · Pomfret, Connecticut" pill:** bordered rule + small caps text between two thin red dashes (`w-12 h-px bg-maroon`).

### 3.8 ScrollReveal (`components/ui/ScrollReveal.tsx`)

Wraps children in a `motion.div` that fades + translates in when scrolled into view. Defaults:

```
direction: 'up'
delay: 0
duration: 0.7
once: true
margin: '-80px'  (triggers 80px before fully visible)
ease: [0.25, 0.1, 0.25, 1]
```

Offsets:
- `up` → initial `y: 40`
- `down` → `y: -40`
- `left` → `x: 40`
- `right` → `x: -40`

Staggered use: delay is computed from the index (`i * 0.08` to `i * 0.1`).

### 3.9 WaveformBars (`components/ui/WaveformBars.tsx`)

Audio indicator. 5 bars by default, each `w-1` rounded full. When `active={true}`, each bar animates `height: ['40%', '100%', '60%', '90%', '40%']` on a 1.2s loop, staggered by `i * 0.15s`, `ease: easeInOut`.

### 3.10 AIContentBadge (`components/ethics/AIContentBadge.tsx`)

Pill-style Link to `/ai-bias`:
```
inline-flex items-center rounded-full
bg-amber/10 border border-amber/30 text-amber-dark
hover:bg-amber/20
font-body font-medium
sizes: sm | md | lg  (adjusts text-size + padding + svg size)
```

Contains a small circled-info SVG. (Since `--amber` aliases to `--maroon` in the current palette, this renders as red/crimson.)

### 3.11 Timeline Node (Heads of School list)

Vertical track:
```
  absolute left-6 top-0 bottom-0 w-0.5  bg-gradient-to-b from-maroon via-navy/20 to-maroon/30
```

Each entry:
```tsx
<div className="relative pl-16">
  <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-maroon border-2 border-warm-white" />
  <div className="bg-cream rounded-2xl p-6 museum-frame">
    <div className="text-sm text-maroon mb-1">{years}</div>
    <h2 className="font-display text-2xl text-navy mb-2">{name}</h2>
    <p className="text-slate font-body leading-relaxed">{bio}</p>
  </div>
</div>
```

### 3.12 Horizontal Timeline (`app/timeline/page.tsx`)

Horizontal-scroll `overflow-x-auto` container with:
- A central track line (`absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-maroon via-navy/30 to-maroon/40`)
- Event cards alternately pinned to the top or bottom of the track (`flex items-end`, with conditional `paddingTop`/`paddingBottom`)
- A 4px circle node positioned on the track for each event
- A 1px vertical connector between the card and the track
- Arrow-key keyboard nav (listeners on the scroll container)

Categories have a color map:
```
Milestones → bg-navy text-cream
People → bg-maroon text-cream
Policy Changes → bg-gold-dark text-cream
Student Voices → bg-maroon-light text-cream
Cultural Events → bg-navy-light text-cream
Leadership → bg-gold text-navy-dark
```

Era-based visual theming (`getEraStyle`): pre-1920 uses `bg-cream-dark border-gold/40 sepia-[.15]`, gradually modernizing; post-2010 uses plain `bg-white border-navy/10`.

### 3.13 Magazine Archive Viewer (`app/archive/*/page.tsx`)

- Grid of magazine page thumbnails (3 columns on lg).
- Each tile is a button with an `aspect-[3/4]` page scan and a caption.
- Click opens a Framer Motion modal (`fixed inset-0 z-50 bg-navy/90 backdrop-blur-sm`) with the full page on the left and scrollable transcript on the right (`grid lg:grid-cols-2`).

### 3.14 Sticky Sub-nav (used on Humans of Pomfret, Timeline, Archive pages)

```
sticky top-16 lg:top-20 z-30 bg-warm-white/95 backdrop-blur-md border-b border-mist
```
Contains filter pills (see Buttons → Filter pills) and optional cross-links styled with a small SVG icon + `text-sm text-maroon hover:text-maroon-dark`.

### 3.15 Famous Figures / Schwartz Fellows Card

Detail-rich card on cream background:
```
rounded-2xl overflow-hidden border border-mist bg-cream museum-frame

  aspect-[3/4] relative
    ├── <Image fill object-cover>
    ├── top-left year badge (bg-warm-white/90 backdrop-blur-sm, rounded-full)
    └── bottom gradient (from-black/70 to-transparent) with overlaid name + field

  p-5 bg-warm-white border-t border-mist
    ├── bio paragraph (text-sm text-slate)
    └── optional flag box (border-t border-maroon/20, warning icon + italic note)
```

Hover: `motion.div whileHover={{ scale: 1.02, y: -4 }}`.

### 3.16 Accordion / Deep-Dive Toggle (Campus Tour stop page)

Button that toggles a Framer Motion `height: 'auto'` expansion. The chevron rotates via `animate={{ rotate: open ? 180 : 0 }}`. Button is `w-full px-6 py-4 bg-cream-dark rounded-2xl min-h-[48px]`.

### 3.17 Language Toggle (Campus Tour)

Two-button `role="radiogroup"` group. Active: `bg-navy text-cream`, inactive: `bg-cream text-slate`. `rounded-xl px-4 py-2`, `min-w-[60px]` so the button widths stay consistent.

### 3.18 Quiz Interactive (AI Bias page)

- Progress bar: `w-full bg-mist rounded-full h-1.5` with inner fill `bg-navy rounded-full h-1.5 transition-all duration-500`.
- Answer buttons are full-width `rounded-xl border-2` — default `border-mist bg-white`, hover `border-navy/30 bg-navy/5`, on result correct turns `border-green-500 bg-green-50`, incorrect `border-maroon bg-maroon/5`.

### 3.19 Stats Row

Consistent pattern across multiple pages:

```tsx
<div className="text-center">
  <div className="font-display text-3xl lg:text-4xl text-maroon">36</div>
  <div className="text-xs text-slate font-body tracking-wider uppercase mt-1">
    Fellowship Visits
  </div>
</div>
```

Grouped in `flex flex-wrap justify-center gap-8 lg:gap-16 pt-12 border-t border-navy/10` when used as a stats strip.

### 3.20 Skip-to-Content Link

```tsx
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
     focus:z-[100] focus:px-4 focus:py-2 focus:bg-navy focus:text-cream
     focus:rounded-lg">
  Skip to main content
</a>
```

---

## 4. Typography Details

### 4.1 Heading Scale

| Tag | Treatment |
|---|---|
| `h1` (page hero) | `text-section` → `clamp(2rem, 4vw, 3.5rem)`, `font-display`, `leading-tight`, `text-navy` (pure black) |
| `h1` (homepage hero only) | `clamp(3rem, 8vw, 7rem)`, `leading-[0.95]`, italic accent word wrapped in `text-maroon-light italic` |
| `h2` (section title) | `clamp(2rem, 4vw, 3.5rem)`, `font-display`, `leading-tight`, `text-navy` |
| `h2` (quote, centered) | `clamp(1.75rem, 3.5vw, 3rem)`, `leading-tight` |
| `h3` (card title) | `text-2xl` or `text-[1.6rem]`, `font-display`, `leading-[1.15]`, `text-navy` |
| `h3` (story card) | `text-2xl`, hover transitions to `text-maroon` |
| `h4` (list item) | `text-lg font-display leading-tight text-navy` |

Global heading rule (from `globals.css`):
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: 1.1;
  color: var(--navy);            /* black */
  letter-spacing: -0.01em;
}
```

### 4.2 Body Text

- Default: `font-body` (Poppins), `line-height: 1.7`, `color: #000000`.
- Paragraphs in card content: `text-sm text-slate leading-relaxed` (1.625 via Tailwind).
- Intro paragraphs: `text-lg text-slate font-body leading-relaxed`.
- Reading measure: constrained to `max-w-3xl` (for centered blocks) or naturally limited by card width.

### 4.3 Small Text & Labels

- **Kicker (uppercase pre-headings):** `text-xs font-body tracking-[0.3em] uppercase text-maroon`. This is the signature "small label" throughout the site.
- **Card meta line:** `text-xs font-body text-slate/70 uppercase tracking-wider`. Uses `·` as separator.
- **Badges/pills:** `text-xs px-2 py-0.5 rounded-full`.
- **Extra tight caps:** `text-[10px] tracking-[0.2em] uppercase` (on logo subtitle, utility sidebar).

### 4.4 Italic Accent

The site uses one very consistent italic pattern — isolating a single word or phrase inside a heading and rendering it in the accent color:

```tsx
A Living Archive of<br />
<span className="text-maroon-light italic">Every Voice</span>
```

This pattern echoes magazine editorial headlines. Used in hero, some card titles, and quote blocks.

### 4.5 Link Styles

Default in-content link: **no underline by default**, transitions color on hover. For example: `text-maroon hover:text-maroon-dark`.

Navigation links: `text-navy hover:text-maroon transition-colors duration-200`.

Footer links: `text-cream/60 hover:text-gold transition-colors duration-200` (gold resolves to red).

Inline text links (emphasis inside paragraphs): `text-gold underline underline-offset-2` (again, red). This is the only place underlines appear by default.

### 4.6 Mobile Type Changes

Headings are already fluid via `clamp()` — they automatically scale. Cards reduce from `lg:text-3xl` on the logo to `text-2xl` on mobile. Hero kicker drops from `text-xs` to `text-[10px]` on some pages.

---

## 5. Animation & Motion

### 5.1 Scroll-Triggered

Every "revealable" block on the site is wrapped in `<ScrollReveal>`. Defaults: fade + 40px upward slide, 700ms duration, `ease: [0.25, 0.1, 0.25, 1]`, triggers 80px before entering viewport, fires once.

Staggered reveals use `delay={i * 0.08}` or `i * 0.1` where `i` is the index in a grid/list.

### 5.2 Hover

| Element | Effect |
|---|---|
| Nav link | `text-navy` → `text-maroon`, color transition 200ms |
| Icon button | `text-navy/60` → `text-navy`, border darkens, `transition-all` |
| Card | Tailwind `hover:shadow-lg` or `hover:shadow-xl`, some cards also `hover:scale-[1.02]` or Framer `whileHover={{ scale: 1.02, y: -4 }}` |
| Image tile (gallery) | `hover:opacity-80`, `+` icon fades in from `opacity-0` to `opacity-100` |
| Text CTA ("Explore →") | `gap-2` → `gap-3` (arrow slides right) |
| Exhibit card | `bg-cream` → `bg-warm-white`, title color shifts to `text-maroon`, 300ms |

### 5.3 Hamburger → X

Three `<span>` bars at fixed positions. When `mobileOpen` is true:
- Top bar: `rotate-45 translate-y-2`
- Middle bar: `opacity-0`
- Bottom bar: `-rotate-45 -translate-y-2`

All with `transition-all duration-300`.

### 5.4 Mobile Menu

Framer `AnimatePresence` with `height: 0` → `height: 'auto'`, fade, 300ms.

### 5.5 Hero "Carousel"

Currently **static visually** — the carousel arrows and indicator dots are rendered but not wired to state. Intended for future multi-slide content. Initial framer-motion animations stagger in:
- Kicker: `delay: 0` (implicit), `duration: 0.8`
- Heading: `delay: 0.2`, `duration: 1.0`
- Subtitle: `delay: 0.5`, `duration: 0.8`

### 5.6 Timeline Cards (horizontal)

Each card uses `initial={{ opacity: 0, x: 30 }}; animate={{ opacity: 1, x: 0 }}; transition={{ duration: 0.5, delay: i * 0.08 }}` — a staggered fade+slide from right.

### 5.7 Modal (Archive viewer)

Framer Motion modal:
- Backdrop: `initial={{opacity: 0}}; animate={{opacity: 1}}; exit={{opacity: 0}}`
- Content: `initial={{scale: 0.95}}; animate={{scale: 1}}; exit={{scale: 0.95}}`

### 5.8 Scroll Behavior

Global `html { scroll-behavior: smooth }` in `globals.css`.

### 5.9 Reduced Motion

Respected via:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5.10 No Parallax / No Auto-Advance

The site deliberately **does not** use parallax effects or auto-advancing carousels.

---

## 6. Tech Stack & Dependencies

- **Framework:** Next.js **14.2.35** (App Router)
- **UI:** React **18**
- **Language:** TypeScript **5**
- **Styling:** **Tailwind CSS 3.4.1** + custom CSS variables in `app/globals.css`. No CSS modules, no styled-components.
- **Animation:** **Framer Motion 12.38** (primary) + Tailwind transitions (secondary).
- **Fonts:** `next/font/google` (DM Serif Display + Poppins) — inlined, no external Google Fonts requests at runtime.
- **CMS (configured, not live):** Sanity Studio — schemas defined in `lib/sanity/schemas/` but no active project ID. All page data is currently hardcoded in TSX files. The shape of the Sanity schemas is production-ready for later activation.
- **Icons:** Inline SVGs — no icon library.
- **QR Codes:** `qrcode` npm package, used by `/admin/qr-generator`.
- **Deployment:** No deploy config committed. README boilerplate references Vercel.

---

## 7. File Structure

```
pomfret-dei/
├── app/
│   ├── layout.tsx               # Root layout: font loading, Header, Footer, skip link
│   ├── page.tsx                 # Homepage (6 sections in one file)
│   ├── globals.css              # CSS variables + base typography + utility classes
│   ├── favicon.ico
│   ├── fonts/                   # (empty — boilerplate)
│   ├── admin/
│   │   └── qr-generator/page.tsx
│   ├── ai-bias/page.tsx
│   ├── archive/
│   │   ├── page.tsx             # Magazine archive index
│   │   ├── civil-rights-era/page.tsx
│   │   └── mission-accomplished/page.tsx
│   ├── famous-figures/page.tsx  # Schwartz Visiting Fellows
│   ├── humans-of-pomfret/
│   │   ├── page.tsx
│   │   ├── [slug]/page.tsx      # Dynamic profile page
│   │   └── heads-of-school/page.tsx
│   ├── timeline/page.tsx
│   └── tour/
│       ├── page.tsx
│       └── [locationSlug]/page.tsx
├── components/
│   ├── ethics/
│   │   └── AIContentBadge.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/
│   │   ├── ScrollReveal.tsx
│   │   └── WaveformBars.tsx
│   ├── audio/                   # (empty — placeholders)
│   ├── museum/                  # (empty)
│   ├── profiles/                # (empty)
│   ├── timeline/                # (empty)
│   └── tour/                    # (empty)
├── lib/
│   ├── qr.ts                    # QR-code generation utilities
│   └── sanity/
│       ├── client.ts
│       ├── queries.ts
│       └── schemas/
│           ├── chapelSpeaker.ts
│           ├── famousFigure.ts
│           ├── humanOfPomfret.ts
│           ├── timelineEvent.ts
│           ├── tourStop.ts
│           └── index.ts
├── public/
│   ├── archive/
│   │   ├── magazines/           # 41 magazine page scans (PNG)
│   │   └── portraits/           # 10 cropped portraits (JPG)
│   ├── fellows/                 # 35 Schwartz Fellow portraits
│   └── fonts/                   # (empty)
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

Three empty `components/*` directories (`audio`, `museum`, `profiles`, `timeline`, `tour`) were scaffolded but never filled — a sister site can safely ignore them.

---

## 8. Homepage Section-by-Section

All in `app/page.tsx` as top-level functions inside the default export.

### 8.1 Section 1 — Hero (`HeroSection`)

- **Container:** `<section className="relative h-[100vh] min-h-[700px] flex items-center justify-center overflow-hidden">`
- **Background layers:**
  1. `bg-gradient-to-br from-cream-dark via-linen to-cream` (warm base)
  2. Top overlay: `bg-gradient-to-b from-black/20 via-transparent to-black/60` (darkens for text contrast)
  3. SVG noise texture at 8% opacity (inline data URI, `feTurbulence baseFrequency=0.9`)
- **Carousel arrows** (static, non-functional): absolute-positioned circular buttons at left/right, 12×12 units, `border border-warm-white/30`.
- **Kicker:** `Est. 1894 · Pomfret, Connecticut` between two `w-12 h-px bg-maroon` rules.
- **Headline:** `font-display text-[clamp(3rem,8vw,7rem)] leading-[0.95]` white; word "Every Voice" on second line is `text-maroon-light italic`.
- **Subtitle:** `text-lg lg:text-xl text-warm-white/90 max-w-2xl mx-auto font-body font-light`.
- **Indicator dots:** one wide active bar + three thin inactive bars at `bottom-12`.
- **Mobile:** Same layout, type scales via clamp. Arrows remain but sit inside margin.

### 8.2 Section 2 — Mission (`MissionSection`)

- `<section className="py-24 lg:py-32 bg-warm-white">`
- `max-w-3xl mx-auto px-6 text-center`
- Kicker "OUR MISSION" in red caps tracking-[0.3em].
- Heading is a pull-quote in `clamp(1.75rem, 3.5vw, 3rem) leading-tight text-navy`.
- `w-16 h-px bg-maroon mx-auto` divider.
- Intro body paragraph below.

### 8.3 Section 3 — Signature Exhibits (`SignatureExhibits`)

- `bg-cream py-24 lg:py-32`, `max-w-7xl`.
- Section header: left-aligned kicker + large heading (no arrows).
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-navy/10 rounded-sm overflow-hidden border border-navy/10` — the **gap-px + bg-navy/10** technique creates hairline dividers between cards without a border property.
- Each card is an editorial listing (category, index, title, meta, description, CTA). See 3.5.

### 8.4 Section 4 — Remarkable Voices (`RemarkableVoices`)

- `bg-warm-white py-24 lg:py-32`.
- Left-aligned header with right-side circular prev/next arrow buttons.
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4`.
- Each tile is an `aspect-[3/4]` color-block (`bg-navy`, `bg-maroon`, etc.) with a dark gradient overlay and year text at the bottom. Name + one-line description sit **below** the image.

### 8.5 Section 5 — Latest Stories (`LatestStories`)

- `bg-cream py-24 lg:py-32`.
- Header with "View all stories →" link on the right.
- Grid: `grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12`.
- Story card: see 3.5.

### 8.6 Section 6 — Image Gallery (`ImageGallery`)

- `bg-warm-white py-24 lg:py-32`.
- Centered header ending with italic instruction "Click any image to enlarge".
- Grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4`.
- Varied aspect ratios (`aspect-[4/5]`, `aspect-[4/3]`, `aspect-square` — rotating) produce a subtle mosaic feel.
- Each tile has a "+" icon that fades in on hover.

---

## 9. Interior Page Patterns

### 9.1 Humans of Pomfret (`app/humans-of-pomfret/page.tsx`)

- Hero: `py-16 lg:py-24 bg-cream texture-linen`, left-aligned kicker + `text-section` h1 + intro paragraph inside `max-w-3xl`.
- Sticky sub-nav bar with filter pills (All / Alum / Faculty) + cross-links to Heads of School and Magazine Archive.
- **Masonry grid** via CSS `columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6`. Each card uses `break-inside-avoid` to prevent splitting.
- Uses Framer `AnimatePresence mode="popLayout"` with `layout` prop so filter changes animate smoothly.

### 9.2 Timeline (`app/timeline/page.tsx`)

- Hero: `py-16 lg:py-24 bg-cream texture-linen`.
- Sticky bar with category filter pills + year-range "Career Span" number inputs.
- Body: horizontal-scroll timeline (see 3.12). Each event card expands on click to show full description.
- Empty state: centered message when filters return zero events.

### 9.3 Schwartz Visiting Fellows (`app/famous-figures/page.tsx`)

- Hero: `py-20 lg:py-32 bg-cream`, center-aligned.
- Red rules flanking the kicker: `w-12 h-px bg-maroon` on both sides of "Est. 1989 · Speaker Series".
- Stats strip (3 cells) below the heading, separated by `border-t border-navy/10 pt-12 mt-12`.
- Body: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8` of fellow cards (see 3.15).
- Footer credit strip: `bg-cream border-t border-mist py-16`, centered text inside `max-w-2xl`.

### 9.4 Archive Magazine Viewer (`app/archive/mission-accomplished/page.tsx`, `civil-rights-era/page.tsx`)

- Hero: `bg-navy texture-grain` dark hero with cream text (inverted).
- Back link in `text-cream/60 hover:text-cream text-sm`.
- Red-rule kicker, `text-section` white heading, italic subtitle.
- Page grid: thumbnails with captions, each opens a Framer Motion modal with full-bleed page + scrollable transcript.

### 9.5 AI Bias (`app/ai-bias/page.tsx`)

- Hero: `bg-navy texture-grain` dark hero with `<AIContentBadge size="lg">` at the top.
- Long-form content in `max-w-3xl mx-auto space-y-16`.
- Contains the interactive quiz component (see 3.18).

---

## 10. Raw Values Dump

### 10.1 `:root` CSS Variables (copy-paste)

```css
:root {
  --navy:         #000000;
  --navy-light:   #1A1A1A;
  --navy-dark:    #000000;

  --maroon:       #A8172B;
  --maroon-light: #C93545;
  --maroon-dark:  #7A1520;

  /* Legacy alias — renders red */
  --gold:         #A8172B;
  --gold-light:   #C93545;
  --gold-dark:    #7A1520;
  --amber:        #A8172B;

  --cream:        #F0EAE0;
  --cream-dark:   #E5DDC9;
  --linen:        #EDE8DD;
  --warm-white:   #F7F2E8;
  --charcoal:     #000000;
  --slate:        #4A4A4A;
  --mist:         #D9D2C4;

  --background:   var(--warm-white);
  --foreground:   var(--charcoal);
  --primary:      var(--navy);
  --secondary:    var(--maroon);
  --accent:       var(--maroon);
  --surface:      var(--cream);
  --surface-alt:  var(--linen);
  --border:       var(--mist);

  --font-display: 'DM Serif Display', 'Playfair Display', Times, serif;
  --font-body:    'Poppins', 'DM Sans', Arial, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  --section-padding:    clamp(3rem, 8vw, 8rem);
  --content-max-width:  1280px;
}
```

### 10.2 Tailwind `theme.extend` (copy-paste)

```ts
theme: {
  extend: {
    colors: {
      navy:   { DEFAULT: '#000000', light: '#1A1A1A', dark: '#000000' },
      maroon: { DEFAULT: '#A8172B', light: '#C93545', dark: '#7A1520' },
      gold:   { DEFAULT: '#A8172B', light: '#C93545', dark: '#7A1520' },
      amber: '#A8172B',
      cream:  { DEFAULT: '#F0EAE0', dark: '#E5DDC9' },
      linen: '#EDE8DD',
      'warm-white': '#F7F2E8',
      charcoal: '#000000',
      slate: '#4A4A4A',
      mist: '#D9D2C4',
    },
    fontFamily: {
      display: ['DM Serif Display', 'Playfair Display', 'Times', 'serif'],
      body:    ['Poppins', 'DM Sans', 'Arial', 'sans-serif'],
    },
    fontSize: {
      'hero':     ['clamp(2.5rem, 6vw, 5rem)',   { lineHeight: '1.1' }],
      'section':  ['clamp(2rem, 4vw, 3.5rem)',   { lineHeight: '1.15' }],
      'subtitle': ['clamp(1.125rem, 2vw, 1.5rem)', { lineHeight: '1.4' }],
    },
    spacing:  { section: 'clamp(3rem, 8vw, 8rem)' },
    maxWidth: { content: '1280px' },
    animation: {
      'fade-in':        'fadeIn 0.8s ease-out forwards',
      'fade-up':        'fadeUp 0.8s ease-out forwards',
      'slide-in-left':  'slideInLeft 0.8s ease-out forwards',
      'slide-in-right': 'slideInRight 0.8s ease-out forwards',
      'scale-in':       'scaleIn 0.6s ease-out forwards',
      'pulse-soft':     'pulseSoft 3s ease-in-out infinite',
      'waveform':       'waveform 1.5s ease-in-out infinite',
    },
    keyframes: {
      fadeIn:        { '0%': { opacity: '0' },                              '100%': { opacity: '1' } },
      fadeUp:        { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      slideInLeft:   { '0%': { opacity: '0', transform: 'translateX(-40px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
      slideInRight:  { '0%': { opacity: '0', transform: 'translateX(40px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
      scaleIn:       { '0%': { opacity: '0', transform: 'scale(0.95)' },     '100%': { opacity: '1', transform: 'scale(1)' } },
      pulseSoft:     { '0%, 100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
      waveform:      { '0%, 100%': { transform: 'scaleY(0.5)' }, '50%': { transform: 'scaleY(1)' } },
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
    },
  },
}
```

### 10.3 Next.js Font Loading (copy-paste)

```tsx
import { DM_Serif_Display, Poppins } from 'next/font/google';

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

// <html className={`${dmSerif.variable} ${poppins.variable}`}>
// <body className="font-body antialiased bg-warm-white text-charcoal">
```

### 10.4 Most Common Tailwind Recipes

**Primary dark button:**
```tsx
<Link className="group inline-flex items-center gap-3 px-6 py-3.5 bg-navy text-cream rounded-xl
  hover:bg-navy-light transition-all duration-300 shadow-lg shadow-navy/20
  hover:shadow-xl hover:shadow-navy/30">
  <span className="font-body font-semibold">Label</span>
</Link>
```

**Secondary outline button:**
```tsx
<Link className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-navy/20 text-navy
  rounded-xl hover:border-navy/40 hover:bg-cream transition-all duration-300
  font-body font-semibold">
  Label
</Link>
```

**Circular icon button:**
```tsx
<button className="w-10 h-10 rounded-full border border-navy/20 text-navy
  hover:bg-navy hover:text-warm-white transition-colors flex items-center justify-center">
  {/* svg */}
</button>
```

**Section container (interior page hero):**
```tsx
<section className="py-16 lg:py-24 bg-cream texture-linen">
  <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
    <ScrollReveal>
      <div className="max-w-3xl">
        <div className="text-xs font-body tracking-wider uppercase text-maroon mb-4">
          Kicker
        </div>
        <h1 className="font-display text-section text-navy mb-4">Page Title</h1>
        <p className="text-lg text-slate font-body leading-relaxed">Intro body.</p>
      </div>
    </ScrollReveal>
  </div>
</section>
```

**Card (profile):**
```tsx
<Link className="group block bg-cream rounded-2xl overflow-hidden museum-frame
  hover:shadow-xl transition-all duration-500">
  <div className="relative aspect-[3/4] bg-navy/5 overflow-hidden">
    <Image src={src} alt="" fill sizes="..." className="object-cover" />
    <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-warm-white/90 text-xs text-slate">
      {role}
    </div>
  </div>
  <div className="p-5">
    <blockquote className="font-display text-lg text-navy italic leading-snug mb-3">
      "Quote"
    </blockquote>
    <div className="font-body font-semibold text-navy text-sm">{name}</div>
    <div className="text-xs text-slate font-body">{years}</div>
  </div>
</Link>
```

**Kicker + heading duo:**
```tsx
<div className="text-xs font-body tracking-[0.3em] uppercase text-maroon mb-4">
  Section Kicker
</div>
<h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-tight text-navy max-w-2xl">
  Section title.
</h2>
```

**Stats strip:**
```tsx
<div className="flex flex-wrap justify-center gap-8 lg:gap-16 pt-12 border-t border-navy/10">
  <div className="text-center">
    <div className="font-display text-3xl lg:text-4xl text-maroon">36</div>
    <div className="text-xs text-slate font-body tracking-wider uppercase mt-1">Metric</div>
  </div>
</div>
```

**Editorial directory grid (signature exhibits):**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px bg-navy/10
  rounded-sm overflow-hidden border border-navy/10">
  {items.map((item, i) => (
    <Link className="group flex flex-col h-full bg-cream hover:bg-warm-white
      transition-colors duration-300 p-6 lg:p-7 min-h-[280px]">
      ...
    </Link>
  ))}
</div>
```

### 10.5 Utility Classes Defined in `globals.css`

```css
.texture-grain {
  /* SVG noise at 3% opacity, absolutely positioned ::after pseudo-element */
}

.texture-linen {
  /* Tiny perpendicular 1px-line pattern, 4×4px, at ~1% opacity */
}

.museum-frame {
  box-shadow:
    0 0 0 1px var(--mist),
    0 2px 8px rgba(27, 42, 74, 0.08),
    0 8px 24px rgba(27, 42, 74, 0.04);
}

.holographic { /* gradient + border, used only on Famous Figures legacy theme */ }
.holographic-glow { /* glow box-shadow */ }

.text-balance { text-wrap: balance; }
```

### 10.6 Scrollbar Styling

```css
::-webkit-scrollbar         { width: 8px; height: 8px; }
::-webkit-scrollbar-track   { background: var(--cream); }
::-webkit-scrollbar-thumb   { background: var(--mist); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--slate); }
```

---

## Quick "Brand DNA" Summary

If you only remember six things:

1. **Palette is pure black + `#A8172B` crimson + `#F0EAE0` cream.** No navy, no gold — the tokens named that way are vestigial.
2. **Typography is editorial:** `DM Serif Display` for every heading, `Poppins` for every body text.
3. **Kicker pattern is signature:** `text-xs tracking-[0.3em] uppercase text-maroon` sits above every major heading.
4. **Section rhythm alternates `bg-warm-white` and `bg-cream`** with `py-24 lg:py-32` each.
5. **Corners are mostly modest:** `rounded-sm` for tiles, `rounded-2xl` for feature cards, `rounded-full` for icon buttons. No pill-shaped CTA buttons.
6. **Motion is restrained:** scroll-triggered 40px fade-up (Framer `ScrollReveal`), color-only hovers, no parallax, no autoplay carousels.
