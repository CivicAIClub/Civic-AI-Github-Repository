# pomfret.org Design Tokens

Reference document extracted from `www.pomfret.org` and `www.pomfret.org/about-us/dei` — the source of truth for aligning the DEI site's visual language to the main Pomfret School website.

---

## 1. Colors

| Token | Value | Where used on pomfret.org |
|---|---|---|
| Primary gray (body text) | `#7F8588` | Headings, body copy |
| Dark navy (bold emphasis) | `#0E2034` | Bold text, accents |
| Crimson red | `~#A8172B` | Buttons (Inquire/Visit/Apply), Learn More links, underline accents, mobile menu background |
| Black | `#000000` | POMFRET wordmark, display headings |
| Warm cream | `~#F0EAE0` | Page background |
| Warm white | `~#F7F2E8` | Section backgrounds |
| Dark footer bg | `~#0E1117` | Footer (near-black navy/charcoal) |
| White | `#FFFFFF` | Text on red/dark backgrounds |

**Key observation:** pomfret.org uses **crimson as an accent**, not a primary. Primary text is pure black or the gray `#7F8588`. The red is reserved for **interactive elements** (buttons, links, hover states) and the **mobile menu panel background**.

The sidebar/red-menu panel uses an **oxblood-tinted crimson** darker than our `#A8172B`, closer to `~#8E1A26` in full-saturation regions.

---

## 2. Typography

### Raw stacks from pomfret.org CSS

```css
/* Headings (fs_style_19, fs_style_20, etc.) */
font-family: Times, 'Times New Roman', serif;
color: #7F8588;
font-size: 30px;  /* large heads */
font-size: 22px;  /* sub-heads */

/* Body (fs_style_21, fs_style_22) */
font-family: Arial, sans-serif;
font-size: 17px;

/* Emphasized bold text */
color: #0E2034;
```

### Distinctive display serif

The POMFRET **wordmark** and large editorial headlines (e.g., "let your evolution begin", "What you know is important", "ACADEMIC CENTERS") use a **distinctive high-contrast Didone-style serif** — NOT just Times. This appears to be either **Canela** (Commercial Type, commercial license) or **GT Super Display**, served through Finalsite's CDN.

**Closest Google Fonts match:** `DM Serif Display` (already used in the current DEI site — keep).

### Body font

pomfret.org defaults to **Arial** — a system font. The DEI site currently uses **Poppins** which is more modern/humanist-geometric.

**Recommendation:** Keep **Poppins** in our DEI site — it renders cleaner on the web than Arial and the tonal difference is acceptable for a sister-site brand extension. Alternative: switch to **Inter** which is more Arial-like.

### Section heading pattern — BOLD + REGULAR word split

pomfret.org uses a signature editorial pattern where **the first word is bold and the second is regular**:

- **Signature** Experiences
- **Remarkable** Griffins
- **Pomfret** Stories
- **Academic** Centers

This is the **key typographic differentiator** we need to adopt — replacing our "small red kicker → large heading" pattern on appropriate sections.

### Font weights in use

- Regular (400) — body
- Bold (700) — emphasized first word + nav labels
- Black/heavy — display headlines (Times substitute)

### Letter-spacing

Display type: slight negative tracking (`~-0.01em`) — matches our current setting.
Uppercase nav/utility labels: wide tracking (`~0.1em` to `0.2em`).

---

## 3. Layout

### Container widths

- Main content max-width: approximately **1440px** on the homepage, **1200px** on interior content blocks.
- Padding: `24px` horizontal on mobile, `48px` on desktop.

Our current site uses `max-w-7xl` (1280px) and `max-w-content` (also 1280px). This is close enough — keep.

### Header height

- **Announcement bar:** ~40px
- **Main header:** ~80-100px tall
- Fixed at top, stays visible on scroll, translucent/white backdrop.

Our current: `h-20 lg:h-24` (80/96px) — matches.

### Border-radius

pomfret.org uses **minimal radius**:
- Buttons: ~4-6px (slightly rounded, not pill-shaped)
- Cards: ~0-4px (near-sharp corners) for image cards
- Icon buttons: fully round (circular)
- Input fields: ~4px

**Our current site uses `rounded-xl` (12px) and `rounded-2xl` (16px) aggressively** — this is a mismatch. We should drop to `rounded` (4px) or `rounded-md` (6px) for most surfaces.

### Box-shadow

pomfret.org uses very subtle shadows — barely visible. Mostly cards rely on background contrast and hairline borders rather than drop shadows.

Our `museum-frame` triple-shadow effect is more decorative than pomfret.org's. We should simplify to a single subtle shadow or replace with a 1px border + background-color-shift hover.

---

## 4. Header Structure (key difference)

pomfret.org header has **three tiers top-to-bottom**:

```
┌──────────────────────────────────────────────────────────────────┐
│ THE SPRING COLLEGE FAIR IS ALMOST HERE... [→]                    │  ← Announcement (red bg, white text)
├──────────────────────────────────────────────────────────────────┤
│ POMFRET [logo]   About | Academics | Athletics | Boarding | ...  │  ← Main nav
│ ─────                                          [search] [☰]       │
├──────────────────────────────────────────────────────────────────┤
│                                           [Inquire][Visit][Apply]│  ← CTAs visible on landing
└──────────────────────────────────────────────────────────────────┘
```

When you open the **mobile or full menu**, a red panel slides in from the right covering ~40% of the viewport with:
- "MY POMFRET" dropdown (Students, Parents, Faculty & Staff, Alumni)
- Main nav in large text
- "ADMISSIONS" and "SUPPORT POMFRET" pill buttons at the bottom
- Inquire / Visit / Apply tiles at the very bottom

Our current site has:
- Red announcement bar ✓ (matches)
- POMFRET wordmark with red underline ✓ (matches)
- Main nav ✓ (matches)
- **Vertical utility sidebar on the left** ✗ (does NOT exist on pomfret.org — remove)
- No mega-dropdowns ✗ (needs adding, though DEI site has flat nav so single-level dropdowns may suffice)
- No CTAs on the right ✗ (should add "Back to pomfret.org" or "Contact DEI")

---

## 5. Footer Structure

pomfret.org footer is **dark navy (`#0E1117`-ish)** with:

```
┌──────────────────────────────────────────────────────────────────┐
│  [Logo]                                                           │
│                                                                    │
│  CONTACT            DISCOVER POMFRET    QUICKLINKS    INFO FOR   │
│  398 Pomfret St     Link                Link           Students  │
│  PO Box 128         Link                Link           Parents   │
│  Pomfret, CT        Link                Link           Faculty   │
│  860.963.6100                           Link           Alumni    │
│  860.963.6120                                                     │
│  (admissions)                                                     │
│                                                                    │
│  [TikTok] [IG] [YT]                                               │
├──────────────────────────────────────────────────────────────────┤
│  © 2024 Pomfret School    Accessibility | Privacy | Sitemap      │  ← bottom bar
│                                        Powered by Finalsite       │
└──────────────────────────────────────────────────────────────────┘
```

Our current footer:
- Dark navy background ✓
- Multi-column grid ✓
- "Explore" and "Learn" sections (close but different naming)
- Has brand block with P icon ✗ (should be replaced with simple logo)
- No social icons ✗ (add TikTok, Instagram, YouTube)
- No contact info column ✗ (could add address/phone — our site doesn't need this since Pomfret school handles that, but we can link back)

---

## 6. Hero

pomfret.org homepage hero:
- **Video slideshow** (4 videos referenced: Severin Harrison, Charlie, Haynes, Nathan)
- Full-viewport immersive
- Play/pause controls
- Navigation arrows
- Centered white serif heading: "A More Human Kind of School"
- No kicker/subtitle immediately visible on hero

Our current hero:
- Gradient + SVG noise ✗ (should be image-based)
- Static carousel arrows (visually only) ✗ (should auto-advance)
- Kicker "Est. 1894 · Pomfret, Connecticut" above heading
- Heading: "A Living Archive of *Every Voice*" (italic accent on second line)
- Subtitle paragraph

Since we don't have licensed campus photography, we'll keep using a textured background but tighten up the carousel visuals to better mimic pomfret.org's slideshow feel (dots at bottom, prev/next arrows).

---

## 7. Interior Page Patterns

pomfret.org interior pages (e.g., DEI page):
- **Breadcrumbs** immediately below header: `Home > About Us > Diversity, Equity, and Inclusion`
- Large page title (no hero image)
- Sidebar may or may not appear (the DEI page seems not to have one — uses a grid of cards instead)
- **4-card grid** of sub-topics (VOICE, Unity Groups, History & Associations, Statistics)
- **Quote/staff profile block** with attribution
- **Text-content blocks** with section headings

Our current interior pages have their own design — cream hero sections with red kicker + large heading. This is fine and matches pomfret.org's typographic feel.

**Additions needed:**
- **Breadcrumbs** on every interior page
- **Stats strip** pattern (22% / 45% / 20%) — we already have this on Schwartz Fellows page, reuse

---

## 8. Buttons

pomfret.org buttons:
- **Primary CTAs (Inquire, Visit, Apply):** Red background, white text, **small radius (~4px)**, **wide letter-spacing**, uppercase, modest padding
- **Secondary (text link):** Red text, small arrow icon `→`, no background, uppercase
- **Ghost buttons in red panel:** White outline, white text, red background

Our current:
- Primary: `bg-navy rounded-xl shadow-lg` — **too dark and too rounded**
- Secondary: `border-2 rounded-xl` — **too rounded**

**Action:** Change primary to `bg-maroon` (red, not black), reduce radius to `rounded` (4px) or `rounded-md`, add uppercase tracking.

---

## 9. Section Headings — Bold + Regular Pattern

pomfret.org uses:
```html
<h2>
  <strong>Signature</strong> Experiences
</h2>
```

Rendered visually: the first word is **bold display serif**, the second is **thin display serif** in the same size.

**Conversion for our homepage sections:**
- "Signature Exhibits" → **Signature** Exhibits
- "Remarkable Voices" → **Remarkable** Voices (already kind of matches their Griffins phrasing)
- "Stories from our history" → **Pomfret** Stories (rename)
- "A visual archive" → **Through** the Years or keep as-is

---

## 10. Animations & Motion

pomfret.org uses:
- Subtle fade-in on scroll for content blocks
- Hover color transitions (~200ms)
- Hamburger → red panel slide in from right
- Video hero with crossfade between slides

Our current Framer Motion setup matches this vibe. No changes required to motion system itself — durations and easing (0.7s, `[0.25,0.1,0.25,1]`) are compatible.

---

## 11. Textures

pomfret.org uses **no background textures**. Clean solid-color backgrounds (cream, white, navy).

**Action:** Remove or tone down our `.texture-linen` and `.texture-grain` classes from interior page heroes. Keep them OK only in places where they add archival flavor (like the magazine archive viewer).

---

## Summary — What Needs to Change

| Area | Current | Target |
|---|---|---|
| Primary CTA color | Black (`bg-navy`) | **Red (`bg-maroon`)** |
| Button radius | `rounded-xl` (12px) | **`rounded` (4px)** |
| Card radius | `rounded-2xl` (16px) | **`rounded-md` (6px)** or sharper |
| Header layout | Logo + nav + vertical sidebar | **Logo + nav + CTAs on right. Remove vertical sidebar.** |
| Footer | 2-group columns + brand block | **4-column + social icons + bottom bar** |
| Section headings | Kicker + heading | **Bold first word + regular second word** |
| Interior pages | Direct into content | **Add breadcrumbs** |
| Body font | Poppins | Keep Poppins (close enough to Arial replacement) |
| Headings font | DM Serif Display | Keep DM Serif Display |
| Textures | `.texture-linen` / `.texture-grain` | Mostly remove |
| Museum-frame shadow | Triple-shadow | **Single subtle shadow or 1px border** |

These changes preserve the feature logic, route structure, content, and Sanity schemas — only the UI layer shifts to match pomfret.org.
