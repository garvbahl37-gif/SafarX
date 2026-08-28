# SafarX — Working To-Do

Live task tracker for the current build push. Updated as work lands.

---

## Done

- [x] **Rebrand Safar360 → SafarX** across app, titles, manifest, docs
- [x] **"Peacock & Gold" design system** — teal ink + antique gold, Fraunces /
      Schibsted Grotesk / Space Grotesk, route-line motif (`DESIGN_SYSTEM.md`)
- [x] **All content Indianised** — 14 VR tours, 40 destinations, 12 travel groups,
      16 mock groups; every image and source URL verified
- [x] **Floating capsule navbar** — hides on scroll down, returns on scroll up;
      Flights + Vault promoted to primary nav
- [x] **Cinematic loading screen** — waypoint ignition, light sweep, compass ring,
      सफ़र inked in Devanagari then morphed to SafarX, letterbox shutter,
      camera push-in, film framing marks
- [x] **Landing page premium pass** — sharper 4K hero (Ken Burns reduced), rebuilt
      bento with depth/glow/light-sweep, count-up stats, voices marquee
- [x] **Premium footer** — Devanagari watermark, closing CTA strip, SIH eyebrow
- [x] **Trip checklist rebuilt** — smart rules engine (destination/season/type/
      travellers), templates, weight + readiness, undo, export, vault tie-in
- [x] **Street view + Orbital view** themed; shared `ImmersiveChrome` furniture
- [x] **Plan a Trip** — 5-step guided flow, budget slider, interest chips,
      live summary rail, day timeline, PDF/WhatsApp export
- [x] **TBO removed** from the codebase entirely
- [x] **Bug: purple/blue gradient buttons** — 10 components recoloured to gold
- [x] **Bug: cursor flicker** — `CurvedLoop` was re-rendering at 60fps
- [x] **Bug: blue focus border on inputs** — `@tailwindcss/forms` default overridden
      globally to gold
- [x] **Bug: broken Udaipur image** on the planner
- [x] **Orbital view** — generic globe clip → 4K aerial Rajasthan; dead space at
      top removed
- [x] **Home 360° section** — YouTube embed removed (its chrome and burned-in
      graphics looked bad); now clean 4K footage with an "enter the tour" affordance
- [x] **Closing CTA video** — was Cappadocia footage (AirTurk watermark), now India

- [x] **SafarX Agent rebuilt** — app shell with left rail (tools + session
      history), designed empty state with intent cards, streaming replies with
      gold filament + waypoint, animated tool-step chips, boarding-pass flight
      results with perforated stubs, heritage-card hotels, glass composer

- [x] **Hidden gems expanded 22 → 81 places** across 29 states/UTs, plus a full
      search autocomplete (grouped Places / States / Categories, gold-highlighted
      matches, keyboard nav, popular-search chips, active-filter row)

- [x] **Bug: refresh landed on the wrong page** — a cache-first service worker
      from an earlier build was caching "/" and serving it for every request;
      replaced with a self-destroying tombstone that clears caches and
      unregisters itself
- [x] **Hidden gems: live search first** — the grid already filtered as you
      type; the suggestion panel now offers only state/category shortcuts so it
      stops covering those live results

- [x] **Local Insights rebuilt** as a real map product — live Overpass nearby
      search across 11 categories, layer switcher (dark/satellite/terrain),
      SafarX overlays, OSRM routing with per-leg costs, place detail sheet,
      marker clustering, mobile bottom sheet; 1426-line page split into 15 modules
- [x] **Bug: map basemap unusable** — CARTO now watermarks keyless requests
      ("API KEY REQUIRED" burnt into every tile); switched to plain OSM tiles
      darkened with a CSS filter

- [x] **VR tours are off YouTube (RULE satisfied)** — in-app three.js
      panorama viewer + Mapillary service; `videoId` replaced with verified
      coordinates on all 14 tours; TourPage360 moved off its iframes too.
      Wikimedia Commons was checked first and has no usable stock of Indian
      equirectangular panoramas, so Mapillary was chosen.
      **Needs from you:** free token at mapillary.com/dashboard/developers →
      `.env` as `VITE_MAPILLARY_TOKEN=`. Until then every tour shows an
      on-brand notice naming the variable — never a YouTube fallback.
- [x] **All 81 hidden gems now on the map** — verified coordinates added to
      the data, hand-written gazetteer deleted (was pinning only 22)
- [x] **Bug: VR mode switcher unpinned** — it was `fixed top-24`, so it floated
      over the tour cards on scroll; now in normal flow

## In progress



- [x] **Premium calendar everywhere** — custom `RangeCalendar` (two-month trip
      window with hover preview) in Plan a Trip, plus a reusable `DateField`
      popover replacing every native `<input type="date">` across the app
- [x] **Bug: broken Udaipur thumbnail** on the planner
- [x] **Rule recorded**: VR tours are never YouTube videos (`DESIGN_SYSTEM.md`)

## Queued

- [ ] Sweep any remaining old-palette components not yet reached

## Roadmap (post-build)

See `ROADMAP.md` for the full team allocation: Lucky (booking & revenue),
Dhruv (Safar Groups 2.0), Aryan (agent + voice), Garv (recommender + Kahani),
Rahul (confidence & safety).
