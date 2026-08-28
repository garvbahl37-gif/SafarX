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

- [x] **AnimatedCompass component** — brass marine compass in SVG: engraved
      bezel with 72 degree ticks, cardinal letters, counter-rotating rose,
      spring-swinging needle, direction-finder sweep, glass dome highlight
- [x] **Both loading screens reworked** — compass is now the centrepiece;
      progress bars removed (the stray line), wordmark handover tightened
- [x] **Directions stay in-app** — OSRM turn-by-turn steps in the route panel,
      no Google Maps hand-off
- [x] **Bug: itinerary showed "Choose a destination" on open** — StrictMode
      double-invoked the regenerate effect past its first-run boolean guard
- [x] **Bug: navbar "VR Tours" re-opened the last tour** — stale `selectedItem`

- [x] **Journey section is now a road trip** — a winding tarmac road with a
      painted centre line that draws in on scroll, a car that drives it (banking
      into the curves, headlight wash, tail lamp), and waypoints + stage
      eyebrows that light up in gold as the car reaches them

- [x] **Compass component removed** — it competed with the wordmark; both boot
      screens now let the सफ़र → SafarX morph carry the moment
- [x] **Orbital view video fixed** — was a 4K/50fps file under three stacked
      dark overlays, so it started slowly and rendered near-black. Now a 1080p
      rendition with a poster frame and a single scrim plus a pool of shade
      under the copy

- [x] **Video quality pass across the app** — the real culprit was the
      film-grain overlay sitting at opacity 0.5: a grayscale noise layer that
      acted as a grey veil over every hero. Dropped to 0.18, softened the
      vignette, and added a `video-crisp` grading utility
      (saturate 1.28 / contrast 1.12 / brightness 1.09) applied to every
      background video, with `on-media` text-shadow so copy stays legible
      without darkening the footage back down
- [x] **Brighter, higher-res hero videos** — Plan a Trip now shows a car on a
      winding Indian mountain road (was an alpine valley in *Switzerland*);
      Hidden Gems upgraded 1080p → 1440p60 Hogenakkal Falls; flight tracker
      raised from 60% to 90% opacity

- [x] **Place detail panel** — it was pinned top-to-bottom on desktop, so a
      place with two lines of data left a large void. Now sizes to content
      under a max-height, with a taller image and an always-present facts
      strip (coordinates / distance / type)
- [x] **Bug: "10 m away"** — distance was measured from the map centre, which
      becomes ~0 the moment the map flies to the place. Now measured only from
      the user's real location, falling back to the region name

- [x] **Dead space under the navbar** — App.jsx padded every page, including
      those that open with full-bleed media, leaving an ink strip between the
      floating navbar and the hero. Full-bleed routes now run to the top
- [x] **Footer shortened** — ~700px → 384px; dropped the closing CTA strip
      (it repeated CTAs already on every page) and tightened every step
- [x] **Hidden gems search bar** — the native `<select>` inside the pill was
      rendering the browser's own box and arrow. Region moved to a chip row
- [x] **Journey car redrawn** — proper side profile with bonnet, glass, wheel
      hubs and a soft headlight throw, instead of a blob and a grey triangle
- [x] **VR gallery images loading late** — every image was a 1280px / ~250KB
      thumb; now 500px / ~43KB with reserved dimensions, eager first four,
      and a fade-in on decode
- [x] **VR tours hero** — centred, and moved off a 1080p60 file that thrashed
      through 8 abort/retry cycles before settling

- [x] **Local Insights shows India only** — a world-rect polygon with the
      India outline punched out as a hole dims every neighbouring country,
      with a gold hairline coastline and the view bounded to the subcontinent.
      Outline simplified from the 10MB Survey of India composite to 41KB
- [x] **VR gallery images confirmed working** — a paced script reported 72/84
      "failures", but they were Wikimedia's robot policy blocking the script.
      In a real browser: 15 responses, all 200, 0 broken

- [x] **Deployed to Vercel** — project `safarx-sih`, production build Ready.
      `GROQ_API_KEY` stored as an encrypted Vercel env var
- [x] **Groq wired securely** — `api/chat.js` serverless function holds the key
      server-side; a `VITE_` prefixed key would ship inside the client bundle.
      `vercel.json`'s catch-all rewrite now excludes `/api`
- [x] **TBO-free backend written** (`backend/`) — FastAPI for the HF Space:
      Groq chat, Amadeus flights/hotels (free tier), RapidAPI trains, Docker
      for HF's Docker SDK. `/flights/search` contract unchanged
- [ ] **Turn off Vercel Deployment Protection** — the live URL currently 401s
      for anonymous visitors (Settings → Deployment Protection → Vercel
      Authentication → Disabled). One toggle, needs your account
- [ ] **Add Amadeus keys** to the HF Space for flights/hotels to go live

- [x] **Map region selector** — the bare `<select>` brought the browser's own
      box and arrow with it, breaking the pill. Native element kept for
      behaviour and accessibility, chrome hidden, our own caret drawn
- [x] **VITE_MAPILLARY_TOKEN added to Vercel** production (encrypted)

## In progress

- [x] **VR tours expanded 14 → 21, with a story under every one** — 16 tours
      now carry 44 verified vantage points (multi-panorama sites get a glass
      vantage switcher), every tour has an editorial section (tagline, history,
      facts grid, what to look for, tips, gallery), and all 84 gallery images
      plus 44 panoramas were curl-verified — 148 URLs, 0 failures
- [x] **VR tours hero video** — Mehrangarh Fort over Jodhpur, graded and scrimmed
- [x] **"Free roam" section rebuilt** — three real cards (street view, orbital,
      atlas) with imagery, icon tiles and clear actions, instead of loose text
- [x] **All 21 tours now show on the map** — the VR gazetteer gated points on a
      hardcoded table, hiding the 7 new tours; it now reads coordinates from
      the data like every other layer



- [x] **Premium calendar everywhere** — a shared `CalendarPanel` behind
      `DateField` (single date) and `DateRangeField` (check-in → check-out on
      one two-month calendar, with a gold band that follows the cursor and
      flows across month boundaries). No native `<input type="date">` is left
      in the app; the agent's booking panels were the last holdouts
- [x] **Stays search actually works** — the destination autocomplete had been
      calling `/api/hotels/search-location`, which nothing served, so typing
      never produced suggestions and the search returned the SPA's HTML
      ("Unexpected token '<'"). New `/api/stays/*` functions proxy Booking.com
      with the key server-side; suggestions, results and the detail modal all
      run on live data in ₹
- [x] **Trains in the agent** — a third booking panel beside Flights and Stays.
      Search by train name or number, see the ends, duration, running days and
      classes, then open the full timetable: every halt with arrival, halt
      length, distance and day count. Live IRCTC data
- [x] **Richer stay popup** — the card now opens onto Overview (description,
      check-in/out, highlights), Rooms (what is free for those dates, with
      nightly rates, beds and cancellation), Amenities, Reviews (real guest
      pros and cons over the true score distribution) and Location (address
      plus what is close by, with distances). Each tab fetches its own section
      the first time it is opened
- [x] **Bug: dev server had no API** — Vite proxied `/api` to a Strapi instance
      on :1337 from the original template. A dev plugin now runs the real
      serverless functions locally
- [x] **Bug: broken Udaipur thumbnail** on the planner
- [x] **Rule recorded**: VR tours are never YouTube videos (`DESIGN_SYSTEM.md`)

## Queued

- [ ] **Booking.com plan is the bottleneck** — BASIC allows 50 requests a
      month for the whole site, and they are spent. Stays search returns a
      clear "out of quota" message until it resets. Responses are cached at
      the edge for a day, and the detail tabs fetch on demand, so the next 50
      go much further — but a demo needs a larger plan
- [ ] **Station-to-station train search** needs the `irctc1` RapidAPI
      subscription; the current plan only indexes trains by name and number
- [ ] Sweep any remaining old-palette components not yet reached

## Roadmap (post-build)

See `ROADMAP.md` for the full team allocation: Lucky (booking & revenue),
Dhruv (Safar Groups 2.0), Aryan (agent + voice), Garv (recommender + Kahani),
Rahul (confidence & safety).
