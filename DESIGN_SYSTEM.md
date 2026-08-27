# SafarX — "Peacock & Gold" Design System

SafarX (formerly Safar360) is a travel companion for **Incredible India** — all
content is Indian: heritage sites, Indian cities, Indian hidden gems, Indian
budgets in ₹. No foreign destinations anywhere.


## Hard rules (non-negotiable)

1. **VR tours are never YouTube videos.** No YouTube embeds, no `youtube.com/embed`
   iframes, no `videoId` fields anywhere in the VR/360° experience. Tours render as
   real in-app draggable equirectangular panoramas (three.js), with zero
   third-party branding. If a verified panorama source does not exist for a site,
   show an honest "panorama coming soon" state — never fall back to YouTube.
2. **All content is Indian.** Indian destinations, ₹ pricing, Indian names in mock
   data. No foreign cities anywhere in user-facing content.
3. **Free-tier APIs only.** No paid API contracts. TBO is removed project-wide.
4. **Dark ink theme only.** No light/white sections, no blue/sky/cyan/purple/indigo
   accents. Gold (`saffron`) is the single accent; jade (`horizon`) is used sparingly
   for map/tech chrome.
5. **No emoji as icons.** Use `lucide-react`.

## Palette (Tailwind tokens — already configured)

Deep peacock-teal ink surfaces, warm ivory text, antique-gold accent.
NOTE: the accent token is still NAMED `saffron` for compatibility — its value
is now antique gold. Use the token names, never raw hexes.

| Token | Value | Use |
|---|---|---|
| `ink-950` | `#061412` | Page background (teal-black) |
| `ink-900` | `#0A1D1A` | Elevated / alternating sections |
| `ink-850` | `#0D231F` | Section alt |
| `ink-800` | `#102822` | Cards |
| `ink-700` | `#17352D` | Hover / raised surfaces |
| `ivory` | `#F2EFE6` | Primary text (`text-ivory`) |
| `ivory-muted` | 62% ivory | Secondary text (`text-ivory-muted`) |
| `ivory-faint` | 38% ivory | Tertiary text (`text-ivory-faint`) |
| `saffron` | `#D4A843` | THE accent (antique gold) — CTAs, active states |
| `saffron-bright` | `#E5BE5C` | Gradient tops, italic display accents |
| `horizon` | `#2E8B74` | Rare secondary jade tone (maps/tech only) |

Borders: `border-white/[0.07]` default, `border-saffron/35` on hover.
**Never** use sky/cyan/purple/blue accents. Pages are dark ink throughout — no
white/light sections.

## Type

- **Display** `font-display` (Fraunces): headings. Italic for destination
  names and accent words. Weights 300–600, tight leading/tracking.
- **UI/body** `font-sans` (Schibsted Grotesk): everything else.
- **Data** `font-data` (Space Grotesk): coordinates, stats, codes, meta rows,
  uppercase eyebrows.

## Signature motif — the route line

Dashed "flight path" + glowing waypoint dot. Utilities in `index.css`:
- `.route-line` — 1px dashed horizontal line
- `.route-dot` — 5px glowing saffron dot
- `.eyebrow` / `.eyebrow-muted` — Space Grotesk uppercase labels, often real
  coordinates ("27.17° N · 78.04° E") or route codes

Reusable header: `src/components/ui/SectionHeading.jsx`
(`<SectionHeading eyebrow="…" title="…" lede="…" align="left|center" />`, plus
named export `RouteDivider`).

## Components / utilities (index.css)

- `.btn-primary` — saffron gradient pill (dark text)
- `.btn-ghost` — glass pill, ivory text
- `.btn-outline` — saffron outline pill
- `.glass-panel` — blurred ink glass, rounded-2xl
- `.glass-input` / `.form-input` — dark input with saffron focus ring
- `.card` / `.heritage-card` — ink-800 card, hover lift + saffron border

## Patterns

- Cards: image with `bg-gradient-to-t from-ink-950` scrim, coordinates eyebrow,
  Fraunces italic name, `font-data` uppercase meta row (season · ₹ budget).
- Motion: framer-motion `whileInView` fade/rise (`once: true`), 0.6–0.8s,
  ease `[0.22, 1, 0.36, 1]`. Subtle — no spinning/bouncing decorations.
- No emoji in headings. Sentence-case copy, plain verbs, no filler.
- Accessibility: visible focus (global `:focus-visible` is set), `aria-label`
  on icon buttons, alt text on meaningful images.
