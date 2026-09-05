# SafarX — Working To-Do

Live task tracker for the current build push. Updated as work lands.

---

## Done

- [x] **Bug: every tour opened as the Taj Mahal** — she routed to the 360°
      explorer, which carries its own list of four places and always opens the
      first. Asking for the Taj looked right; asking for Varanasi quietly gave
      the Taj too. Tours now go to the VR tours page, which knows all 34
- [x] **Bug: her voice broke up mid-answer** — Gemini was working out when
      someone was speaking from the microphone, and the microphone could hear
      her, so her own voice read as an interruption. No sensitivity setting
      fixes that, because the echo genuinely is speech. The browser now marks
      where an utterance starts and ends, since it knows the one thing Gemini
      cannot: whether the voice is hers. The threshold calibrates to the room
- [x] **Bug: her voice flickered** — playback re-based its clock on every
      chunk, so each one restarted a fraction late and you heard the seams. A
      short jitter buffer absorbs the network, and the timeline is only reset
      when it has genuinely fallen behind
- [x] **Bug: she cut herself off mid-sentence** — her own voice returning
      through the microphone registered as an interruption. Two guards: a lower
      start-of-speech threshold, and the browser only forwarding sound clearly
      louder than the echo while she is speaking. Genuine barge-in still works
- [x] **Bug: tours she announced never opened** — she navigated to the tours
      index rather than opening the tour, so "I'm opening the Taj Mahal" left
      you looking at a list. She now opens it the same way clicking its card does
- [x] **Srishti greets you in Hindi** — "SafarX में आपका स्वागत है। कहाँ जाने
      का प्लान है?" — and then follows whatever language you reply in, every
      turn. The greeting no longer locks the conversation into Hindi
- [x] **Captions fixed** — transcript fragments were appended forever, so each
      answer ran into the one before it. They now assemble per turn and reset
      cleanly when the next one starts
- [x] **Srishti is hands-free** — grant the microphone once and she stays
      open: she hears you start, hears you stop, answers, and listens again.
      Talk over her and she stops mid-word. The room is measured first, so the
      threshold works in a quiet flat and a loud hall
- [x] **Srishti speaks Indian languages properly** — the speech model was
      reading Devanagari with an English mouth because nothing told it
      otherwise. Her reply's script now picks the voice: hi-IN, ta-IN, te-IN,
      and en-IN rather than en-US for English, which is the accent she is meant
      to have
- [x] **Srishti** — the voice of SafarX. Ask her anything by voice or text, in
      Hindi, Tamil, Telugu, Malayalam or English, and she answers in the
      language she was asked in. She reaches into the app's own APIs — stays,
      trains, PNR, 360° tours, hidden gems — and can open a page while she
      talks, then steps aside to the corner so you can see it. Her form is a
      kolam of dashed rings that travel inward while she listens and outward
      while she speaks

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
- [x] **Animated peacock emblem on the boot screen** (`PeacockLoader.jsx` +
      `.css`) — the icon's bird, built as live SVG so it can be drawn rather
      than shown. A gold journey path draws itself first, then the S of Safar
      inks in as one stroke, then head, crest and a folded wing, and only then
      does the train unfurl: 27 covert plumes for mass and 21 eyed feathers
      over them, each with combed hairline barbs and an ocellus (bronze halo,
      gold ring, jade ring, indigo heart, gold pip). Emerald → teal → peacock
      blue across the fan, deterministic per-feather variation in length,
      curvature and eye placement. Then a light ring crosses the train, a
      highlight rakes it, the head lifts and the eye catches the light. Holds
      and breathes: sway, glint wave, and pointer parallax at three depths.
      ~4.1s to build, 5.2s total, once per session. Everything is `transform`
      / `opacity` / `stroke-dashoffset`; `prefers-reduced-motion` shows the
      finished bird. `PeacockMark` is the same bird reduced for favicon /
      nav use, exported but not yet wired in
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
- [x] **Agent side rail steadied** — switching between Stays, Flights and
      Trains threw the conversation column 80px out and back; the rail now
      stays mounted and only cross-fades its contents. Below 1280px the panel
      comes over the top instead of squashing the chat to a strip
- [x] **Tripadvisor fallback for stays** — Booking's 50-call month runs out,
      so hotel search, results and the whole detail modal now fall through to
      Tripadvisor on a separate quota. One normalised shape, either provider
- [x] **Instant destination autocomplete** — 126 Indian destinations ship with
      the app and the browser matches them itself: 20ms to a rendered list,
      zero network calls, aliases for Bombay, Calcutta, Benares, Mysore,
      Pondicherry and Trivandrum
- [x] **Page-to-page transition removed** — it read as a bug because it was
      one: measured an 83ms window under 25% opacity (a visible blink) and
      55px of vertical lurch, because the scroll-to-top ran against the
      transform. Every page already choreographs its own entrance, so the
      wrapper only added a dip. Route changes now land instantly at the top
- [x] **Bug: square inside the map search bar** — @tailwindcss/forms draws a
      resting 1px border on every field. Each field style here supplies its
      own, so that default only ever showed as a stray rectangle inside
      components that border their own container. Reset globally
- [x] **Trains panel rebuilt around four questions** — Route (A→B on a date,
      the search people actually start from), Train (by name or number, with
      the full timetable), Live (where it is and how late, straight from
      IRCTC), and PNR (is my seat confirmed). 126 stations ship with the app so
      from/to predicts in ~50ms with no network call
- [x] **Multiple 360s per place** — Mapillary lookups now return several
      captures spread at least 55m apart instead of only the nearest, labelled
      by how far and which way they lie ("128 m south-west"). A site with one
      curated panorama gains live viewpoints beside it, and the live-only tours
      open with five or six. The old curated/live swap button is gone; the
      vantage switcher covers it
- [x] **Three more VR tours** — Rishikesh, Haridwar and Cubbon Park in
      Bengaluru, resolved live from Mapillary. 34 tours in 15 states
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

- [ ] **Orbital view hero video** — the clip is measurably the dullest asset
      in the app: saturation 17/255 and contrast 29, against 44–118 and 59–72
      for the heroes that were signed off. No overlay tuning fixes footage
      that flat; it needs replacing, which needs a free Pexels or Pixabay API
      key to search their libraries
- [ ] **irctc-train-api monthly quota is spent** — Route, Live and PNR return
      a clear "out of quota" message until it resets. Train mode runs on the
      other host and is unaffected
- [ ] **Google Images is not a usable tour source** — it indexes other
      people's copyrighted photos and grants no licence to redistribute them;
      Street View forbids extracting imagery outside its own embed. Free,
      licensed sources only: Mapillary (CC BY-SA) and Commons
- [ ] **Mapillary is the ceiling on new VR tours** — of 58 Indian sites
      scanned, only six have any 360° coverage at all, and Commons' 360
      category for India is 240 files that are almost entirely one
      photographer's West Bengal series. Hampi, Mysore, Khajuraho, the Golden
      Temple and Konark have no equirectangular imagery anywhere public
- [ ] **All three stay providers are out of monthly quota** — Booking,
      Tripadvisor and Airbnb. Hotel search cannot return results until one
      resets or a new free API is subscribed; Srishti says so plainly and
      offers what she can still do
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
