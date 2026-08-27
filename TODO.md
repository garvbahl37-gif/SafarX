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

## In progress

- [ ] **VR tours off YouTube (RULE)** — real in-app draggable equirectangular
      panoramas via three.js, sourced and verified from Wikimedia Commons
- [ ] **Hidden gems** — expand to 60+ places, add search autocomplete with
      suggestions, popular-search chips, keyboard nav

- [x] **Premium calendar everywhere** — custom `RangeCalendar` (two-month trip
      window with hover preview) in Plan a Trip, plus a reusable `DateField`
      popover replacing every native `<input type="date">` across the app
- [x] **Bug: broken Udaipur thumbnail** on the planner
- [x] **Rule recorded**: VR tours are never YouTube videos (`DESIGN_SYSTEM.md`)

## Queued

- [ ] **Local Insights rebuild** — real map product: Overpass nearby search
      (eat/stay/ATM/pharmacy/transport), layer switcher, SafarX data overlays,
      OSRM routing, place detail sheet, mobile bottom sheet
- [ ] **Bug: VR mode switcher stays pinned** and overlaps tour cards on scroll
- [ ] Sweep any remaining old-palette components not yet reached

## Roadmap (post-build)

See `ROADMAP.md` for the full team allocation: Lucky (booking & revenue),
Dhruv (Safar Groups 2.0), Aryan (agent + voice), Garv (recommender + Kahani),
Rahul (confidence & safety).
