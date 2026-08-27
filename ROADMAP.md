# SafarX — Build Roadmap & Team Allocation

**Smart India Hackathon 2026 · Problem Statement 26204 (AICTE, Travel & Tourism)**
*"A solution that can boost the current situation of the tourism industry including hotels, travel and others."*

Every workstream below is written so its owner can pick it up and start without asking questions: goal, scope, data model, file paths, APIs, acceptance criteria, and how it ties back to the problem statement.

---

## 0. Team & ownership

| Owner | Workstream | Why it matters to PS 26204 |
|---|---|---|
| **Lucky** | [A — Booking & Revenue Engine](#workstream-a--booking--revenue-engine-lucky) | Turns plans into actual bookings — direct revenue for hotels, transport, and local operators |
| **Dhruv** | [B — Safar Groups 2.0 (Community)](#workstream-b--safar-groups-20-community-dhruv) | Group travel = higher-value bookings; community content is free distribution for small destinations |
| **RN** | [C — SafarX Agent](#workstream-c--safarx-agent-rn) | The conversational front door — search, plan, and book without forms |
| **Garv** | [D — Recommender System (2 lakh data points)](#workstream-d--recommender-system-garv) | Spreads demand to lesser-known destinations instead of the same 20 sites |
| **Rahul** | [E — Confidence & Safety](#workstream-e--confidence--safety-rahul) + [F — Voice Storyteller](#workstream-f--kahani-voice-storyteller-rahul) | Removes the reasons people *don't* travel; voice makes heritage accessible in every Indian language |

> Names to confirm: "RN" is as-dictated — rename the heading if the spelling differs.

### Ground rules for everyone

1. **Free tier only.** No paid API contracts anywhere in this project. TBO has been dropped entirely — see the [approved API list](#approved-free-tier-apis). If a service needs a credit card, don't use it.
2. **Design system is fixed.** Read `DESIGN_SYSTEM.md` before writing UI. Peacock & Gold tokens (`ink-*`, `ivory`, `saffron`, `horizon`), Fraunces / Schibsted Grotesk / Space Grotesk, route-line motif. No new colors, no light-mode sections, no emoji as icons (use `lucide-react`).
3. **Branch naming:** `feat/<workstream-letter>-<short-name>` — e.g. `feat/b-groups-expenses`. PR into `main`.
4. **All content is Indian.** Indian destinations, ₹ pricing, Indian names in mock data. No foreign cities anywhere.
5. **Never commit keys.** Everything goes in `.env` / `server/.env`, referenced via `import.meta.env.VITE_*`. Update `.env.example` when you add a variable.
6. **Graceful degradation.** Every feature must render something sensible when its API key is missing — the demo laptop may not have every key.

### Approved free-tier APIs

| Need | Service | Free tier | Notes |
|---|---|---|---|
| LLM / agent | **Google Gemini** (`gemini-2.0-flash`) | Generous free tier | Already integrated |
| LLM fallback | **Groq** (Llama 3.x) | Free, very fast | Good for cheap tool-calling loops |
| Flight search | **Amadeus Self-Service** | Free test env, ~2k calls/mo | Replaces TBO for search + offers |
| Live aircraft | **OpenSky Network** | Free, no key | Already powers the tracker |
| Hotels | **Amadeus Hotel Search** | Free test env | Replaces TBO for hotel content |
| Hotels (backup) | **OpenTripMap** + OSM | Free | POI/stay data, no rate anxiety |
| Trains | **Indian Rail / IRCTC via RapidAPI** | Free tier | PNR, train between stations |
| Maps / routing | **OpenStreetMap, Nominatim, OSRM, Photon** | Free | Already in use |
| Geocoding | **Photon** | Free | Already in use |
| Weather | **Open-Meteo** | Free, no key | Prefer over OpenWeather (no key needed) |
| Voice (TTS/STT) | **Bhashini** (Govt. of India) | Free | 22 Indian languages — first choice for Workstream F |
| Voice fallback | **Web Speech API** | Free, in-browser | Zero-dependency fallback |
| Media | **Cloudinary** | Free tier | Already in use |
| DB / realtime | **Supabase** | Free tier | Postgres + Realtime + Storage |
| Auth | **Clerk** | Free tier | Already in use |

**Removed:** TBO API (all flight/hotel booking flows must be migrated off it — see Workstream C, task C1).

---

## Workstream A — Booking & Revenue Engine (Lucky)

**Goal:** every plan a user makes should end in a bookable, revenue-generating action — for hotels first, then transport and local operators. This is the workstream that most directly answers "boost the tourism industry."

### A1. Hotel discovery surface
- New route `/stays` plus an embedded hotel rail on VR tour pages and itinerary days.
- Card shows: photo, name, locality, star rating, guest score, **₹ per night**, distance from the monument the user was just viewing, and a "Book" CTA that deep-links out.
- Data: Amadeus Hotel Search (city code → offers). Cache responses in Supabase for 24h to stay inside the free tier.
- **The hook:** "You just toured the Taj in 360° — here are 12 stays within 2 km." Contextual continuity from VR → booking is the differentiator.

**Files:** `src/pages/StaysPage.jsx`, `src/components/stays/HotelCard.jsx`, `HotelRail.jsx`, `src/services/hotelService.js`

### A2. Hotel partner program (the industry-boosting piece)
- `/partner` — a self-serve portal where a hotel claims its listing.
- A partner can: upload photos, upload/link their **own 360° room tour** (YouTube 360 URL or panorama image), set amenities, publish an offer.
- Verification: manual approve flag in Supabase (`partners.status = pending | verified`).
- Why it matters: a 12-room heritage homestay in Orchha gets OTA-grade presence — including VR — for free. Judges should see this as the "small operator" story.

**Schema (Supabase):**
```sql
partners(id, name, type, city, state, contact_email, phone, status, created_at)
partner_listings(id, partner_id, title, description, amenities jsonb,
                 price_per_night int, images text[], tour_url text, rooms int)
partner_offers(id, listing_id, label, discount_pct, valid_from, valid_to, inventory int)
```

### A3. Dynamic occupancy deals
- Partners publish last-minute / off-season rates into `partner_offers`.
- A "Deals near you this week" rail on the home page and in the agent's answers.
- Rule: an offer only surfaces if it matches the user's region interest or dates — coordinate with Garv's recommender (Workstream D) so deals are *targeted*, not spammed.
- Fills rooms that would otherwise sit empty — the cleanest "boost" metric for the pitch.

### A4. Transport
- Trains: search between stations + PNR status (Indian Rail API via RapidAPI free tier).
- Buses/cabs: estimate-only cards with deep links out (no booking integration needed for the hackathon).
- Surfaced inside the itinerary between cities so a plan reads as a real trip.

### A5. Allied industries (breadth for the PS)
- **Eat local:** per-destination regional dish list + where to eat (OpenTripMap restaurants + curated JSON).
- **Craft bazaar:** GI-tagged crafts per region (Banarasi silk, blue pottery, Channapatna toys) with links to state emporium sites.
- Keep these as data-driven cards — `src/data/cuisine.json`, `src/data/crafts.json` — cheap to build, high pitch value.

### A6. Festival & events calendar
- `src/data/festivals.json`: name, place, coords, dates for 2026, description, image.
- Shows on the destination page and drives off-season travel (Rann Utsav in winter, Hornbill in December).

**Acceptance criteria (A):**
- [ ] A user can go VR tour → see stays nearby → open a booking link, in ≤ 3 clicks
- [ ] A hotel can self-register, add a 360° tour, and publish an offer, end-to-end
- [ ] Deals rail renders and respects the user's region/date context
- [ ] Train search works for at least Delhi↔Agra, Mumbai↔Goa
- [ ] Every price displayed in ₹, every empty/error state written per `DESIGN_SYSTEM.md`

---

## Workstream B — Safar Groups 2.0 (Community) — Dhruv

**Goal:** the community section already exists in the project but is shallow — mock data, no real collaboration. Rebuild it into a properly working, advanced group-travel product. This is the workstream with the most surface area; treat it as a mini-app.

**Current state:** `src/pages/SocialPage.jsx` + `src/components/SocialGroups/*` render groups from `src/data/realWorldGroups.js` and `socialMockData.js`. It is read-mostly and not persisted.

**Target state:** real, persisted, multi-user groups with co-planning, expenses, chat, and meetups — backed by Supabase (Postgres + Realtime + Storage), authenticated with Clerk.

### B1. Data model (Supabase)

```sql
groups(
  id uuid pk, name text, slug text unique, description text,
  cover_image text, destination_city text, destination_state text,
  lat float8, lng float8, start_date date, end_date date,
  budget_per_head int, max_members int, visibility text,      -- public | request | private
  category text,                                              -- trek | heritage | food | roadtrip | pilgrimage | photography
  created_by text, created_at timestamptz
)

group_members(
  group_id uuid, user_id text, role text,                     -- owner | admin | member
  status text,                                                -- joined | requested | invited | removed
  joined_at timestamptz, primary key (group_id, user_id)
)

group_messages(id, group_id, user_id, body text, attachment_url, reply_to, created_at)
group_itinerary(id, group_id, day int, time text, title, notes, place_name, lat, lng, cost int, added_by)
group_expenses(id, group_id, payer_id, label, amount int, split_type, split_with text[], created_at)
group_polls(id, group_id, question, options jsonb, closes_at, created_by)
group_poll_votes(poll_id, user_id, option_index, primary key(poll_id, user_id))
group_photos(id, group_id, user_id, url, caption, created_at)
group_reviews(id, group_id, user_id, rating int, body text, created_at)
```

Enable **Row Level Security**: a user can read a group's private tables only if they have a `group_members` row with `status = 'joined'`.

### B2. Screens & components

| Screen | Route | What it does |
|---|---|---|
| Group explorer | `/social` | Search + filters (destination, dates, budget, category, group size, verified-only). Card grid. |
| Group detail | `/social/:slug` | Tabbed: Overview · Itinerary · Chat · Expenses · Photos · Members |
| Create group | `/social/new` | Multi-step form (basics → destination & dates → budget & size → cover photo → visibility) |
| My groups | `/social/mine` | Joined, requested, and owned groups |
| Meetup detail | `/social/:slug/meet/:id` | Time, place, map pin, RSVP list |

**Component structure** (rebuild under `src/components/SocialGroups/`):
```
GroupExplorer.jsx        GroupCard.jsx           GroupSearchFilters.jsx
GroupDetail.jsx          GroupHeader.jsx         GroupTabs.jsx
GroupItinerary.jsx       ItineraryDayEditor.jsx  AddStopDialog.jsx
GroupChat.jsx            MessageBubble.jsx       MessageComposer.jsx
GroupExpenses.jsx        AddExpenseDialog.jsx    SettlementSummary.jsx
GroupPolls.jsx           PollCard.jsx
GroupPhotos.jsx          GroupMembers.jsx        MemberCard.jsx
JoinRequestPanel.jsx     GroupCreationForm.jsx
```

### B3. Feature requirements (this is the "advanced" part)

1. **Real membership flow** — join public groups instantly; request-to-join groups create a pending row the owner approves/rejects. Owner can invite by email, promote to admin, remove members.
2. **Collaborative itinerary** — any member adds stops to a day; changes appear live for everyone via Supabase Realtime. Each stop can carry a cost, which rolls into the group budget.
3. **Expense splitting** — log who paid what; split equally or with selected members; show a **settlement summary** ("Rahul owes Dhruv ₹1,240"). Use a simple debt-minimization pass so the settlement list is short.
4. **Group chat** — Realtime messages, replies, image attachments via Supabase Storage, unread badge. Rate-limit client-side.
5. **Polls** — "Which day for Hampi?" with live results; auto-closes at `closes_at`.
6. **Meetups** — a group can schedule an in-person meetup with a place, time, and map pin; members RSVP.
7. **Safety & trust** — verified badge for Clerk users with a confirmed email + phone; report/block on members; women-only group flag; group owner must accept a code-of-conduct on creation. Coordinate with Rahul (Workstream E).
8. **Photo wall** — post-trip gallery; these photos become social proof on the destination pages.
9. **Reviews** — after `end_date`, members can rate the group; ratings show on the explorer card.
10. **Notifications** — in-app bell for join requests, new messages, itinerary changes, poll closing.
11. **Share** — public group page with OG meta so a WhatsApp share renders a card (huge for organic growth in India).

### B4. Realtime & state
- Supabase Realtime channels per group: `group:{id}:messages`, `group:{id}:itinerary`.
- Use React Query for fetch/caching; subscribe on mount, unsubscribe on unmount.
- Optimistic updates for messages and itinerary stops.

### B5. Migration
- Keep `realWorldGroups.js` / `socialMockData.js` as **seed data** — write `scripts/seedGroups.js` to push them into Supabase so the demo has content on day one. Do not keep reading from the JS files at runtime.

**Acceptance criteria (B):**
- [ ] Two different signed-in users can join the same group and see each other's chat messages live
- [ ] An itinerary stop added by one member appears for the other without refresh
- [ ] Expenses produce a correct settlement summary for a 3-person, 5-expense case
- [ ] Join request → owner approval → member gains access to private tabs
- [ ] RLS verified: a non-member cannot read `group_messages` via the API
- [ ] All screens follow `DESIGN_SYSTEM.md`; works at 375px

---

## Workstream C — SafarX Agent (RN)

**Goal:** make the agent the fastest way to plan and book an Indian trip — and get it off TBO entirely.

**Current state:** `src/pages/AgentPage/` — Gemini chat, plus flight/hotel panels wired to TBO and RapidAPI.

### C1. Remove TBO (do this first)
Files that still reference TBO:
- `src/pages/AgentPage/services/flightApi.js`
- `src/pages/AgentPage/components/FlightBookingPanel.jsx`
- `src/components/GoogleEarthExplorer.jsx` (string only)
- `README.md` (already cleaned)

Replace with **Amadeus Self-Service** (free test environment):
- `POST /v1/security/oauth2/token` → bearer token (cache in memory, 30 min TTL)
- `GET /v2/shopping/flight-offers` → search
- `GET /v3/shopping/hotel-offers` → hotel offers
Keep the existing panel components and their props; swap only the service layer so the UI doesn't regress. If Amadeus is unreachable, fall back to a clearly-labelled sample dataset so the demo never dies.

### C2. Tool / function calling
Give Gemini real tools instead of free-text answers. Define a tool schema and route calls to existing services:

| Tool | Backs onto | Example utterance |
|---|---|---|
| `search_flights` | Amadeus | "Flights Delhi to Leh on 12 June under ₹8000" |
| `search_hotels` | Amadeus / partner listings | "Hotels near the Taj under ₹4000" |
| `recommend_destinations` | Garv's `/recommend` (Workstream D) | "Where should I go in October for 5 days?" |
| `build_itinerary` | existing Gemini itinerary service | "Plan 5 days in Kerala under ₹30k" |
| `search_trains` | Indian Rail API | "Trains from Mumbai to Goa on Friday" |
| `find_activities` | activities data (below) | "What can I do in Meghalaya in October?" |
| `get_weather` | Open-Meteo | "Will it rain in Munnar next week?" |

Show tool execution as visible steps in the chat ("Searching flights…", "Found 14 stays") — the agentic feel comes from making work legible.

### C3. RAG knowledge base
- Corpus: the 40 destinations, 22 hidden gems, 14 VR tours, plus festival and activity data.
- Embed with a sentence-transformer (same model Garv uses for content vectors — **share the embedding service, don't build two**).
- Retrieve top-k chunks into the prompt so answers about timings, entry fees, and etiquette are grounded, not hallucinated.

### C4. Multilingual + voice input
- Detect and answer in Hindi, Hinglish, and 4 regional languages.
- Speech-to-text via Web Speech API (free) with Bhashini as the Indian-language upgrade — coordinate with Rahul (Workstream F) so there is **one** voice service module, `src/services/voiceService.js`, used by both.

### C5. Trip memory
- Persist a rolling conversation summary + the user's active trip in Supabase, keyed by Clerk user id.
- Inject on every new session so the user never re-explains "my Ladakh trip".

### C6. Dynamic activities engine
Region- and season-aware "what can I do" layer — also consumed by the itinerary planner and the recommender.
- `src/data/activities.json`: `{ id, name, region, state, lat, lng, category, season_months[], difficulty, price_band_inr, duration_hrs, operator_note }`
- Seed ~120 activities: rafting in Rishikesh, paragliding in Bir-Billing, scuba in Havelock, camel safari in Jaisalmer, tea-trail walks in Munnar, Kedarkantha winter trek, Rann Utsav, Ziro music festival, houseboat stays, Hampi bouldering.
- The engine rotates featured activities by current month so the app always answers "what's happening in India *this* month".

### C7. UI polish
The agent UI is mid-restyle to the Peacock & Gold system — finish it:
- Assistant messages: ink-800 glass card with a gold waypoint dot + `SafarX` label in Space Grotesk
- User messages: gold-tinted bubble, right-aligned
- Thinking state: three route-dots pulsing in sequence, or a route line drawing — never a generic spinner
- Empty state: Fraunces greeting + 4 suggested prompt chips (Indian, ₹-denominated)
- Flight results styled as boarding passes (IATA codes in `font-data`, route-line with a plane between origin and destination)

**Acceptance criteria (C):**
- [ ] `grep -ri "tbo" src/` returns nothing
- [ ] "Plan 5 days in Kerala under ₹30k" produces a real day-by-day itinerary via tool call
- [ ] "Flights Delhi to Leh in June" returns live Amadeus results in the boarding-pass UI
- [ ] Agent answers a Hindi question in Hindi
- [ ] Voice input works in Chrome; falls back gracefully elsewhere
- [ ] No API key in the client bundle for anything that must stay secret (proxy through the server if needed)

---

## Workstream D — Recommender System (Garv)

**Goal:** a production-grade hybrid recommender over **~2,00,000 data points** that answers "where should I go next?" — and deliberately pushes demand toward lesser-known destinations.

### D1. Dataset (~2 lakh rows)

| Source | Rows | Contents |
|---|---|---|
| POI catalog | ~15,000 | Indian destinations & attractions from OpenTripMap + Wikidata: lat/lng, category, tags, Wikipedia abstract |
| Interaction matrix | ~150,000 | User–destination events. Bootstrap: 5,000 personas × ~30 interactions, weighted by real popularity priors (tourism statistics from data.gov.in). Replaced over time by real events already emitted by the app (views, bookmarks, VR opens, itinerary adds) |
| Reviews / sentiment | ~25,000 | Open review snippets per POI, sentiment-scored, used as content features |
| Seasonality | ~10,000 | POI × month suitability from IMD climate normals + festival/holiday calendar |

**Total ≈ 2,00,000.** The synthetic bootstrap solves cold start on day one; real events progressively replace synthetic mass.

### D2. Architecture

```
user profile ─┐
              ├─► [1] Collaborative filtering — implicit ALS (d=64)
interactions ─┘        over the 150k user×POI matrix
                                 │
POI text/tags ──► [2] Content similarity — sentence-transformer
                       embeddings (multilingual MiniLM) in FAISS
                                 │
                  [3] Priors — popularity × seasonality × novelty
                                 │
          Re-rank: blend(α·CF + β·content + γ·prior)
          → geo / budget / season / duration filters
          → LONG-TAIL FLOOR: ≥20% of every slate reserved for
            high-match, low-footfall destinations
                                 │
          FastAPI:  /recommend  /similar/{poi}  /for-you  /explain
```

The long-tail floor is the point: the recommender is a **tourism-distribution policy**, not an engagement optimizer. Say this explicitly in the pitch.

### D3. Serving
- FastAPI on Hugging Face Spaces (already in our stack), FAISS in memory (15k vectors is tiny), target < 50 ms.
- `/explain` returns *why* a place was recommended ("because you saved Hampi and it's peak season") — judges love interpretability.
- Keep the existing client-side `src/services/recommendationEngine.js` as the offline fallback.

### D4. Surfaces in the app
- **"For you" rail** on the home page for signed-in users (replaces the static destination grid).
- **"Travelers like you also visited"** on every VR tour and destination page.
- **Itinerary seeding** — the planner opens pre-filled with recommendations instead of a blank form.
- **Agent tool** — `recommend_destinations` calls `/recommend` (Workstream C).
- **Deal targeting** — Lucky's occupancy deals (A3) are filtered through the recommender so they reach matched users.

### D5. Evaluation (put these numbers in the deck)
- Offline: hold out 20% of interactions → **Recall@10**, **NDCG@10** vs a popularity baseline.
- Coverage: catalogue coverage % and long-tail share of recommendations vs baseline — this is the tourism-spreading proof.
- Online: bookmark-through-rate on the "For you" rail vs the static grid.

**Acceptance criteria (D):**
- [ ] Dataset built, ~200k rows, reproducible via a script in `ml/`
- [ ] `/recommend` returns 10 results < 200 ms with ≥20% long-tail
- [ ] Recall@10 beats the popularity baseline by a stated margin
- [ ] "For you" rail live on the home page
- [ ] `/explain` returns a human-readable reason per recommendation

---

## Workstream E — Confidence & Safety (Rahul)

**Goal:** remove the reasons people *don't* book — uncertainty, crowds, and safety worries.

### E1. Crowd prediction
- Predict expected crowd level per site per date from seasonality + holiday/festival calendar + historical popularity.
- Show as a simple band on the destination page: **Quiet / Moderate / Packed**, with a nudge — "Visit Tue–Thu in Feb for half the queue."
- Spreads load off peak days, which is exactly what heritage sites need.
- Start rule-based (`src/services/crowdService.js`); upgrade to a model only if time allows.

### E2. Safety layer
- **SOS button** — one tap shares live location + trip details with pre-set emergency contacts (Web Share + SMS deep link; no paid SMS gateway).
- **Emergency directory** — per-state police/ambulance/tourist-helpline numbers (`src/data/emergency.json`), works offline.
- **Women's safety rating** per destination, sourced from open safety indices + community reports.
- **Trust in groups** — verified badges, report/block; coordinate with Dhruv (B3.7).

### E3. Multilingual UI
- `react-i18next` scaffolding; Hindi first, then Tamil, Telugu, Bengali, Marathi.
- Extract all UI strings to `src/locales/<lang>.json`. Do this early — retrofitting is painful.

### E4. Offline PWA mode
- Cache itineraries, documents, checklists, and map tiles for zero-connectivity zones (Ladakh, Spiti).
- Service worker with a cache-first strategy for static content, network-first for live data.
- Note: `index.html` currently *unregisters* service workers (a legacy blank-page fix) — remove that block carefully as part of this task.

### E5. Sustainability score
- Per-destination responsible-tourism rating (fragility, waste load, local-economy benefit), shown as a small badge.
- Nudges travelers toward lower-impact choices — a strong, under-used angle for the PS.

**Acceptance criteria (E):**
- [ ] Crowd band renders for all 40 destinations with a recommended visit window
- [ ] SOS shares location + contacts in under 3 seconds
- [ ] Emergency numbers work with the network off
- [ ] Full UI switches to Hindi without layout breakage
- [ ] App shell + a saved itinerary load offline

---

## Workstream F — "Kahani" Voice Storyteller (Rahul)

**Goal:** every monument tells its own story, aloud, in the visitor's language. This replaces the analytics dashboard (dropped — not needed for this phase).

*Owner note: assigned to Rahul alongside Workstream E; move it if load needs rebalancing.*

### F1. What it is
A narrated audio layer over India's heritage. Stand in front of Qutub Minar, open SafarX, and a 2–3 minute story plays — who built it, why, what happened here — in Hindi, English, or a regional language. The same stories play inside VR tours as a guided audio track.

### F2. Scope
- **Story library:** 2–3 minute scripts for the 40 destinations + 14 VR tour sites. Drafted with Gemini, then **human-reviewed for historical accuracy** (non-negotiable — wrong history in a government-facing demo is fatal).
- **Voice synthesis:** Bhashini TTS (free, 22 Indian languages) as primary; Web Speech API as fallback. Generate once, cache the audio in Cloudinary/Supabase Storage — do not synthesize on every play.
- **Player:** a persistent mini-player with play/pause, scrub, speed, and language switch. Reuse the design language of `GlobalMusicPlayer.jsx`; the two must never play at once.
- **Geo-trigger:** if the user is within ~300 m of a site, offer "Play the story of Qutub Minar" as a card. Opt-in location, never automatic audio.
- **Offline:** stories downloadable per trip (ties into E4).
- **VR integration:** in a 360° tour, the story plays as narration with the video muted.
- **Accessibility:** full transcript shown alongside audio — also makes the content indexable and usable by deaf visitors.

### F3. Structure
```
src/services/voiceService.js        // shared with Workstream C — one module only
src/data/stories/<site-id>.json     // { title, language, script, duration, audio_url, transcript }
src/components/kahani/StoryPlayer.jsx
src/components/kahani/StoryCard.jsx
src/components/kahani/LanguagePicker.jsx
scripts/generateStoryAudio.js       // batch TTS + upload, run once
```

### F4. Stretch
- **Voices of locals:** let residents record 60-second stories about their town — a community audio layer no OTA has, and a direct line to the "hidden gems" theme.
- **Guide mode:** a continuous narrated walk through a site with stop-by-stop chapters.

**Acceptance criteria (F):**
- [ ] 10 sites have reviewed scripts + cached audio in at least Hindi and English
- [ ] Player works, survives navigation, and never overlaps background music
- [ ] Language switch re-plays the same story in the new language
- [ ] Transcript visible for every story
- [ ] Stories playable offline once downloaded

---

## Cross-cutting

**Dropped from scope:** the tourism analytics dashboard for boards/hotels. Not needed for this phase — revisit after the hackathon.

### Shared dependencies (agree these early, they block two people each)
| Shared thing | Owners | Note |
|---|---|---|
| Embedding service | Garv + RN | One sentence-transformer service, used by both RAG and content similarity |
| `voiceService.js` | Rahul + RN | One voice module for agent input and story playback |
| Supabase schema | Dhruv + Lucky | Both add tables — agree naming and RLS conventions before writing migrations |
| Recommender API | Garv + Lucky + RN | `/recommend` feeds the For-You rail, deal targeting, and the agent tool |
| Design system | Everyone | `DESIGN_SYSTEM.md` is the single source of truth |

### Suggested milestones
| Week | Target |
|---|---|
| 1 | C1 (TBO removed), B1 (schema + auth), D1 (dataset built), E3 (i18n scaffold), F2 scripts drafted |
| 2 | A1–A2 (stays + partner portal), B2–B3 (groups working end-to-end), D2–D3 (recommender served), C2 (tool calling) |
| 3 | A3–A6, B3 advanced features, D4 (surfaces live), C3–C6, E1–E2, F audio cached |
| 4 | Polish, offline mode, demo script, deck, dry runs |

### Demo narrative (build toward this)
1. Open SafarX → cinematic boot → hero: Taj at sunrise.
2. "Where should I go in October for 5 days under ₹25k?" → agent calls the recommender → suggests **Ziro Valley**, a place the judges haven't heard of. *(That's the tourism-spreading moment.)*
3. Open its 360° tour → play the **Kahani** story in Hindi.
4. Stays nearby → a verified homestay partner with its own 360° room tour and an off-season deal.
5. Add to itinerary → invite friends → **Safar Group** with live chat, shared plan, split expenses.
6. Land in Ziro offline → documents, checklist, emergency numbers, and the story all still work.
