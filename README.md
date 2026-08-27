# SafarX — Discover Incredible India

**SafarX** is an AI-powered travel companion for Indian tourism, built for **Smart India Hackathon 2026** (Problem Statement **26204**, AICTE — *Student Innovation: boosting the tourism industry including hotels and travel*).

India's tourism runs on uncertainty — travelers book monuments, hotels, and whole trips sight-unseen. SafarX removes that uncertainty: preview every heritage site in immersive 360° VR before you spend a rupee, plan day-by-day itineraries with AI, and carry documents, checklists, flight tracking, and a live AI co-pilot in one place.

---

## Key features

- **360° VR previews** — walk through the Taj Mahal, Hampi, Varanasi's ghats, and dozens of Indian heritage sites in high-fidelity 360° before booking.
- **AI trip planner** — Gemini-powered day-by-day itineraries tuned to pace, budget (₹), and interests.
- **Hidden gems** — offbeat Indian spots (Chand Baori, Ziro Valley, Mawlynnong…) shared by locals and travelers, off every tourist map.
- **SafarX Agent** — an AI travel co-pilot: natural-language chat (Gemini), flight search (Amadeus), hotel discovery, and web discovery (Tavily).
- **Document vault** — encrypted storage for tickets, visas, and IDs (Express + MongoDB + Cloudinary backend).
- **Live flight tracker** — follow any aircraft in real time on a cinematic dark radar.
- **Safar groups** — find and plan group trips across India.
- **Local insights map** — Leaflet-based exploration with OSRM routing.
- **Trip checklist** — smart packing and pre-trip preparation.

## Design system — "Night Atlas"

A single editorial design language across the app: deep night-blue ink surfaces, warm ivory text, and a **saffron** accent; **Fraunces** for display type, **Schibsted Grotesk** for UI, **Space Grotesk** for data; and a signature dashed *route-line* motif with coordinate eyebrows on every section. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Tech stack

**Frontend**: React 18 + Vite, Tailwind CSS, Framer Motion + GSAP, React Three Fiber, Leaflet, Zustand, React Query, Clerk (auth)
**Backend**: Node.js + Express (document vault), Supabase (hidden gems), MongoDB, Cloudinary
**AI**: Google Gemini, Hugging Face, Tavily

## Getting started

```bash
git clone <repo-url>
cd Safar360
npm install
npm run dev
```

The app runs without any keys (auth and uploads gracefully disabled). For full functionality create a `.env` in the root:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_API_BASE_URL=http://localhost:5000
VITE_AI_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CLOUD_NAME=your_cloudinary_name
VITE_CLOUD_API_KEY=your_cloudinary_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_AVIATION_STACK_API_KEY=your_aviation_stack_key
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

## Roadmap

The full plan lives in [ROADMAP.md](ROADMAP.md) — it maps every upcoming feature to the problem statement's goal of boosting the tourism industry:

Every workstream is owned end-to-end. Full specs — data models, file structures, APIs, and acceptance criteria — are in [ROADMAP.md](ROADMAP.md).

| Owner | Workstream | Highlights |
|---|---|---|
| **Lucky** | Booking & revenue engine | Hotel discovery beside VR previews, a self-serve **hotel partner program** (small hotels upload their own 360° room tours), dynamic occupancy deals for empty rooms, train/bus/cab integration, plus allied industries — regional cuisine, GI-tagged crafts, festival calendar |
| **Dhruv** | Safar Groups 2.0 (community) | Rebuild of the existing groups section into a real multi-user product: Supabase-backed membership, collaborative itineraries, live chat, expense splitting with settlements, polls, meetups, photo walls, verification and safety |
| **RN** | SafarX Agent | Drop TBO entirely for free-tier APIs, Gemini **function calling** (search, plan, and book from chat), RAG over an India heritage knowledge base, multilingual voice input, trip memory, and a season-aware dynamic activities engine |
| **Garv** | Recommender system (~2,00,000 data points) | Implicit-ALS collaborative filtering + sentence-transformer content embeddings (FAISS) + seasonality priors, with a deliberate **long-tail floor** that pushes lesser-known destinations — served by FastAPI, powering a "For you" rail, itinerary seeding, and the agent |
| **Rahul** | Confidence & safety · Kahani voice storyteller | Crowd prediction, SOS and emergency directory, Hindi + regional language UI, offline PWA mode, sustainability scores — plus **Kahani**, narrated heritage stories in 22 Indian languages via Bhashini, geo-triggered at monuments and inside VR tours |

**Policy:** free-tier APIs only, no paid contracts. TBO has been dropped across the project.

## Deployment

- **Frontend**: Vercel
- **Document vault backend**: Render
- **AI agent engine**: Hugging Face Spaces

---

Built by **Netaji Ninjas** for Smart India Hackathon 2026.
