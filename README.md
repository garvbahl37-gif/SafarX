<p align="center">
  <img src="docs/banner.png" alt="SafarX — Discover Incredible India. 360° VR previews, AI trip planner, hidden gems, flight tracker, Safar Groups, document vault and an AI co-pilot." width="100%" />
</p>

# SafarX — Discover Incredible India

**SafarX** is an AI-powered travel companion for Indian tourism, built for **Smart India Hackathon 2026** (Problem Statement **26204**, AICTE — *Student Innovation: boosting the tourism industry including hotels and travel*).

Indian tourism runs on uncertainty. Travellers book monuments, hotels and whole trips sight-unseen, and the country's best places lose out to the same dozen names because nobody can picture the alternatives. SafarX removes that uncertainty: **stand inside a heritage site in 360° before you spend a rupee**, plan the trip by talking to someone who knows the country, and carry your documents, checklists and flights in one place.

Everything is Indian — Indian sites, Indian cities, Indian budgets in ₹. There are no foreign destinations anywhere in the product.

---

## Srishti — the voice of SafarX

Srishti is not a chatbot bolted to a sidebar. She is a **voice-first travel companion who operates the app while she talks to you**, built on the Gemini Live API over a WebSocket, with thirteen tools that let her act rather than merely answer.

She is written as a person, not a persona sheet. She is Indian and sounds it — Jaipur, not "Jay-poor"; Thiruvananthapuram said properly. She is a woman, and in languages that mark gender on verbs she speaks as one (Hindi *मैं ले चलती हूँ*, never *चलता*), which is the fastest tell between a person speaking and a machine translating.

**She replies in the language you speak to her in**, detected from the script she answers in — Hindi, Tamil, Telugu, Malayalam, Kannada, Bengali, Gujarati, Punjabi and Odia, alongside Indian English.

### What she can actually do

| She can | Tool |
|---|---|
| Open a 360° tour of a site and take you into it | `find_vr_tour` |
| Name hidden gems near a place **and open the page with those picked out** | `hidden_gems_near` |
| Walk you through the five-leg trip brief, asking one thing at a time | `plan_itinerary`, `itinerary_step` |
| Save the finished itinerary as a PDF | `export_itinerary_pdf` |
| Draw a route between two places on the Local Insights map | `plan_local_route` |
| Find stays, with dates and guests already filled in | `search_stays` |
| Look up trains between two stations, and check a PNR | `trains_between`, `pnr_status` |
| Raise the SOS beacon, and read the safety picture for a region | `emergency_sos`, `check_safety` |
| Set up a travel reel | `create_reel` |
| Move the app to any page while she keeps talking | `open_page` |

**Finding and showing are one intention.** Reading three gem names aloud while you look at whatever page you were already on just makes you go and search for each by hand — so when she names them, the Hidden Gems page opens with exactly those picked out, behind a banner that says whose shortlist it is and offers the way back to all 96.

**She fills the trip brief in front of you.** She used to take everything you said, fill all five legs and drop you on the last one — a finished form you never saw written, with no moment to correct a date she had misheard. Now the planner walks: it fills what she understood, moves through the legs a beat at a time so each is read, and **stops at the first leg she has no answer for** — which is the one she then asks about. Your answer lands on the form and moves it on, so what is said and what is on screen stay in step.

---

## Features

### 360° VR previews — 43 tours
Real, in-app, draggable equirectangular panoramas rendered on the inside of a three.js sphere. Drag to look around, pinch to zoom, and switch between vantage points at sites shot more than once — eleven at Sanchi, nine at Ellora, seven along the Varanasi ghats.

> **Hard rule: a VR tour is never a video.** No YouTube embeds, no vendor players, no third-party branding. Imagery is verified equirectangular from Wikimedia Commons and Mapillary, each credited on screen in our own type. Where no verified panorama of a site exists, the tour shows an honest *"panorama coming soon"* rather than substituting a video.

### AI trip planner
A five-leg brief — **destination → dates & pace → interests → budget & group → review** — that produces a Gemini-written day-by-day itinerary tuned to ₹ budget, pace and interests. Exportable to PDF. Srishti can drive the whole thing by voice.

### Hidden gems — 96 places
Offbeat spots most itineraries never reach: Chand Baori's stepwell, Bhangarh Fort, Kolukkumalai's tea estates, Gavi. Filterable by region, state and category, searchable, and reachable directly from Srishti.

### Local Insights map
Leaflet exploration of heritage sites, hidden gems and VR tours, with **multi-stop routing over OSRM** — real road geometry and driving time, not straight lines.

### Live flight tracker
Follow any aircraft in real time on a cinematic dark radar.

### Document vault
Encrypted storage for tickets, visas and IDs, so the things you cannot afford to lose are in one place. Express + MongoDB + Cloudinary.

### Safar Groups
Find travellers going where you are going, and plan together.

### Safety & SOS
A one-tap beacon, an offline emergency directory, and a region-by-region safety picture Srishti can read out.

### Travel diary & trip checklist
A place to keep the trip afterwards, and smart packing prompts before it.

---

## Design system — "Peacock & Gold"

One editorial language across every page: deep teal **ink** surfaces (`#061412`), warm **ivory** text (`#F2EFE6`), and an antique **gold** accent (`#D4A843`) — the peacock, India's national bird, rendered in the colours it actually wears.

Type is **Fraunces** for display, **Schibsted Grotesk** for UI, and **Space Grotesk** for data and coordinates. The signature motif is a dashed route-line with coordinate eyebrows, carried from the home page into the VR viewer's HUD.

Full rules, including the non-negotiables, are in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

---

## Tech stack

**Frontend** — React 18 + Vite, Tailwind CSS, Framer Motion + GSAP, three.js / React Three Fiber (the 360° viewer), Leaflet (maps), Zustand, React Query, Clerk (auth)

**Serverless** — Vercel functions under `api/`: Srishti's voice (`live.js`, a WebSocket bridge to Gemini Live) and text (`turn.js`) endpoints, stays, trains, flights, groups, documents and music

**Backend** — Node + Express (document vault), Supabase (hidden gems), MongoDB, Cloudinary

**AI** — Google Gemini (itineraries, chat, and `gemini-3.1-flash-live-preview` for Srishti's voice), Hugging Face, Tavily

**Imagery** — Wikimedia Commons and Mapillary for panoramas, OpenStreetMap + OSRM for routing, Esri for satellite tiles

---

## Getting started

```bash
git clone https://github.com/garvbahl37-gif/SafarX-SIH.git
cd Safar360
npm install
npm run dev
```

The app runs with **no keys at all** — auth, uploads, live panoramas and Srishti degrade gracefully rather than breaking. For the full experience, create a `.env` in the root:

```env
# Srishti + the AI planner
GEMINI_API_KEY=your_gemini_key

# 360° panoramas — free, no card, from mapillary.com/dashboard/developers
VITE_MAPILLARY_TOKEN=your_mapillary_token

# Auth, data and uploads
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUD_NAME=your_cloudinary_name
VITE_CLOUD_API_KEY=your_cloudinary_key

# Live data
VITE_OPENWEATHER_API_KEY=your_openweather_key
AVIATIONSTACK_API_KEY=your_aviationstack_key
RAPIDAPI_KEY=your_rapidapi_key
```

And for the document-vault backend, a `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_clerk_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

```bash
cd server && npm install && npm run dev
```

### Useful scripts

```bash
npm run build                          # production build
npm run lint                           # eslint
python3 scripts/verify-panoramas.py    # prove every shipped panorama is real, reachable and 2:1
```

---

## Coming next

Three features already specced, each building on something the app can already do.

### Local Language Survival Mode

The gap SafarX has not closed yet: you can plan a trip to Madurai in perfect detail and still be unable to ask where the railway station is.

Survival Mode is a phrasebook built for the moment you are actually standing in, not a translation box. For any destination it carries the phrases that matter — *Where is the railway station? · How much is this? · I need a doctor · Is this vegetarian?* — in the language spoken there: Hindi, Marathi, Tamil, Bengali, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia.

What makes it more than translation is the three ways you use it:

| | |
|---|---|
| **Tap to speak** | The phone says the phrase aloud, in the local language, so you do not have to attempt the pronunciation |
| **Show to local** | The phrase fills the screen in large type — the fallback that works in a loud station, or when the person you are asking would rather read than listen |
| **Hear reply** | They answer, and SafarX translates it back to you |

That last one is the hard half, and it is where this meets Srishti: she already listens in nine Indian scripts, speaks with correct Indian pronunciation, and runs over a live audio socket. Survival Mode is that same pipeline turned outward — pointed at the person in front of you rather than at the app.

Designed to work offline for the phrase set, because the moment you need it most is usually the moment you have no signal.

### Recommender system — ~2,00,000 data points

Implicit-ALS collaborative filtering, sentence-transformer content embeddings over FAISS, and seasonality priors — with a deliberate **long-tail floor** that reserves slots for lesser-known destinations.

That floor is the point rather than a side effect. A recommender trained on where people already go will keep sending them to the same dozen places, which is precisely the problem the tourism brief asks us to solve. Pushing the long tail is how a hidden gem gets its first hundred visitors.

### Kahani — the voice storyteller

Narrated heritage stories in **22 Indian languages**, geo-triggered: the story of a monument begins when you arrive at it, and the same story plays inside its 360° tour.

A plaque tells you a building's date. Kahani tells you why Shah Jahan built it, in the language you grew up in, while you are standing in front of it.

---

## Roadmap

Every workstream is owned end-to-end and maps back to the problem statement's goal of boosting the tourism industry. Full specs — data models, file structures, APIs and acceptance criteria — are in [ROADMAP.md](ROADMAP.md).

| Owner | Workstream | Highlights |
|---|---|---|
| **Lucky** | Booking & revenue engine | Hotel discovery beside VR previews, a self-serve **hotel partner program** (small hotels upload their own 360° room tours), dynamic occupancy deals for empty rooms, train/bus/cab integration, plus allied industries — regional cuisine, GI-tagged crafts, festival calendar |
| **Dhruv** | Safar Groups 2.0 (community) | Rebuild of the existing groups section into a real multi-user product: Supabase-backed membership, collaborative itineraries, live chat, expense splitting with settlements, polls, meetups, photo walls, verification and safety |
| **Aryan** | SafarX Agent | Gemini **function calling** (search, plan and book from chat), RAG over an India heritage knowledge base, trip memory, a season-aware activities engine |
| **Garv** | Recommender system (~2,00,000 data points) · Kahani voice storyteller | Implicit-ALS collaborative filtering + sentence-transformer content embeddings (FAISS) + seasonality priors, with a deliberate **long-tail floor** that pushes lesser-known destinations — plus **Kahani**, narrated heritage stories in 22 Indian languages, geo-triggered at monuments and inside VR tours |
| **Rahul** | Confidence & safety | Crowd prediction with quiet-window nudges, SOS and offline emergency directory, regional-language UI, **Local Language Survival Mode** (speak it, show it, hear the reply translated — offline-capable), offline PWA mode, sustainability scores |

**Policy:** free-tier APIs only, no paid contracts.

---

## Deployment

| Piece | Host |
|---|---|
| Frontend + serverless API | Vercel |
| Document vault backend | Render |
| AI agent engine | Hugging Face Spaces |

---

Built by **Netaji Ninjas** for Smart India Hackathon 2026.
