# SafarX Roadmap — SIH PS 26204

Problem statement 26204 (AICTE, Travel & Tourism) asks for solutions that **boost the tourism industry — hotels, travel, and beyond**. This roadmap maps every planned upgrade to that goal: more bookings, more confidence for travelers, more visibility for India's lesser-known destinations, and better data for the industry.

---

## 1. Feature roadmap

### Phase 1 — Booking & revenue (directly boosts industry)
- [ ] **Hotel discovery & booking** — TripAdvisor/RapidAPI listings surfaced beside every VR preview ("liked the view? book the stay"), with price comparison and direct booking deep links.
- [ ] **Transport integration** — IRCTC train availability, bus (redBus-style) and cab estimates inside the itinerary, so a plan converts into purchases.
- [ ] **Local guide & experience marketplace** — verified local guides, food walks, and homestays listed per destination; commission-free discovery for small operators (the segment the PS cares most about).
- [ ] **Festival & event calendar** — Pushkar Mela, Hornbill, Rann Utsav… seasonal events drive off-peak tourism to smaller destinations.

### Phase 2 — Confidence & safety (removes reasons not to travel)
- [ ] **Crowd prediction** — expected crowd level per site per date (from seasonality + holiday calendar), so travelers pick quieter windows and sites spread load.
- [ ] **Tourist safety layer** — SOS button with location sharing, verified emergency contacts per state, women-safety ratings, embassy/helpline directory.
- [ ] **Multilingual UI** — Hindi first, then Tamil/Telugu/Bengali/Marathi; i18n scaffolding via `react-i18next`.
- [ ] **Offline PWA mode** — itineraries, documents, and maps cached for zero-connectivity zones (Ladakh, Spiti).

### Phase 3 — Immersion & discovery (differentiators)
- [ ] **AR monument overlays** — point the camera at a monument, see reconstruction/history overlays (WebXR, already polyfilled in the codebase).
- [ ] **QR heritage plaques** — printable QR codes for tourism boards; scanning opens the site's 360° tour + audio story in SafarX.
- [ ] **Audio stories** — 2-minute narrated histories per heritage site (TTS-generated, human-reviewed), auto-playing in VR tours.
- [ ] **Sustainability score** — each destination gets a responsible-tourism rating (fragility, waste, local-economy benefit) nudging travelers to lower-impact choices.

### Phase 4 — Industry intelligence (the "boost" made measurable)
- [ ] **Tourism analytics dashboard** — anonymized demand signals (searches, itinerary inclusions, VR views per site) exposed to tourism boards/hotels: *where interest is rising before footfall arrives*.
- [ ] **Review & sentiment pipeline** — aggregate traveler reviews per destination, sentiment-scored, surfaced to both travelers and operators.

---

## 2. SafarX Agent — upgrade plan

Today: Gemini chat + TBO flight search + TripAdvisor hotels + Tavily search.

| Upgrade | What it adds | How |
|---|---|---|
| **Tool/function calling** | Agent executes real actions: "book me a Jaipur hotel under ₹3k" → calls hotel search, filters, returns bookable options; "add Hampi to my itinerary" → writes to the planner. | Gemini function-calling schema over the existing services (`aiService`, `placesService`, itinerary store). |
| **RAG knowledge base** | Grounded answers about 500+ Indian sites (timings, fees, history, local etiquette) instead of hallucination-prone free generation. | Embed the destinations/gems corpus (see recommender §3 — same embeddings), retrieve top-k chunks into the prompt. |
| **Multilingual voice** | Speak to the agent in Hindi/Hinglish + 4 regional languages; voice in, voice out. | Web Speech API (STT) + Gemini multilingual + TTS; language auto-detect. |
| **Trip memory** | Agent remembers the user's trip context across sessions ("my Ladakh trip") — no re-explaining. | Persist conversation summaries + itinerary state per user (Supabase), inject as context. |
| **Proactive alerts** | Flight delay → agent messages you rebooking options; monsoon warning for your dates → suggests alternates. | Cron checks on AviationStack/OpenWeather against stored trips + push notifications (PWA). |
| **WhatsApp channel** | The QR in the footer becomes real: chat with SafarX on WhatsApp — where Indian travelers actually are. | WhatsApp Business Cloud API webhook → same agent backend. |
| **Budget copilot** | Live trip budget tracking in ₹; agent warns on overshoot and suggests swaps. | Structured expense state + function calls from chat. |

---

## 3. Recommender system — design (≈2,00,000 data points)

**Goal:** a production-grade hybrid recommender that answers *"where should I go next?"* personally, and pushes long-tail Indian destinations (the PS's core ask — spreading tourism beyond the top 20 sites).

### 3.1 Dataset (~2 lakh points)

| Source | Points | What |
|---|---|---|
| POI catalog | ~15,000 | Indian destinations/attractions from OpenTripMap + Wikidata (heritage sites, forts, temples, beaches, treks) with lat/long, category, Wikipedia abstract |
| Interaction matrix | ~150,000 | User–destination interactions: synthetic-but-principled bootstrap (persona-based simulation over 5,000 personas × ~30 interactions each, weighted by real popularity priors from tourism statistics at data.gov.in), replaced gradually by real events (views, bookmarks, VR-tour opens, itinerary adds — already emitted by the app) |
| Reviews/sentiment | ~25,000 | Scraped/open review snippets per POI, sentiment-scored, used as content features |
| Seasonality table | ~10,000 | Site × month suitability (weather, festivals, crowd) from IMD normals + holiday calendar |

Total ≈ 200,000 rows. The synthetic interaction bootstrap solves cold start on day one; every real user event replaces synthetic mass over time.

### 3.2 Architecture (hybrid, three signals + re-rank)

```
user profile ─┐
              ├─► [1] Collaborative filtering — implicit ALS
interactions ─┘        (user × destination matrix, 150k events)
                                 │
POI text/tags ──► [2] Content similarity — sentence-transformer
                       embeddings in FAISS (15k POIs)
                                 │
                  [3] Priors — popularity × seasonality × novelty boost
                       (deliberate long-tail exposure: hidden gems get
                        a floor share of every recommendation slate)
                                 │
                  Re-ranker: blend(α·CF + β·content + γ·prior)
                  then geo/budget/season filters from the query
                                 │
                  FastAPI  →  /recommend, /similar/{poi}, /for-you
```

- **CF**: `implicit` library ALS, d=64 factors — learns taste ("likes treks & forts").
- **Content**: `sentence-transformers` (multilingual MiniLM) over descriptions + tags — powers *"similar to Hampi"* and cold-start by preference quiz.
- **Priors with a long-tail floor**: 20% of every slate reserved for high-match low-footfall destinations — the recommender is itself a tourism-boosting policy, not just engagement optimization.
- **Serving**: FastAPI on Hugging Face Spaces (already in our stack), FAISS in-memory (15k vectors is tiny), <50 ms per request. The existing client-side `recommendationEngine.js` stays as offline fallback.

### 3.3 Surfaces in the app
- **"For you" rail** on the home page (replaces static destination grid for signed-in users).
- **"Travelers like you also visited"** on every VR tour page.
- **Itinerary seeding** — planner starts from recommendations instead of a blank form.
- **SafarX agent tool** — the agent calls `/recommend` so chat answers are personalized.

### 3.4 Evaluation
- Offline: hold-out 20% of interactions → Recall@10, NDCG@10 vs popularity baseline; coverage/diversity metrics (long-tail share of recommendations).
- Online: bookmark-through-rate on the "For you" rail vs static grid.

---

## Suggested build order

1. Recommender dataset build + FastAPI service (2 weeks — highest demo impact)
2. Agent function-calling + RAG over the same corpus (1 week — shared embeddings)
3. Hotel booking surface + itinerary transport (1–2 weeks)
4. Multilingual + PWA offline (1 week)
5. Analytics dashboard + crowd prediction (post-hackathon)
