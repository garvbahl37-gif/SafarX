# ✈️ SafarX — AI-Powered Travel Companion

An AI travel assistant with real-time flight search, smart itinerary generation, and a premium glassmorphism UI — built for hackathon glory.

![Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20Gemini%20%7C%20TBO-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 🤖 **AI Travel Agent** — Google Gemini with function calling for natural-language travel queries
- ✈️ **Live Flight Search** — Real-time flight availability via the TBO (TekTravels) API
- 🏨 **Live Hotel Search** — Real-time hotel discovery, filters, and details via RapidAPI/TripAdvisor
- 🔍 **Smart Web Discovery** — Tavily-powered web search for trains, packages & alternative accommodations
- 📅 **Itinerary Generator** — AI-generated day-by-day travel plans
- 🎛️ **Flight Filter & Sort** — Filter by stops, airline, price slider; sort by price/duration/time
- 🎨 **Premium UI** — Glassmorphism, Framer Motion animations, dark mode

---

## 🛠️ Tech Stack

### Backend
| Library | Purpose |
|---------|---------|
| **FastAPI** | Async API server |
| **Google Gemini** | LLM with function calling |
| **TBO API** | Real-time flight search & booking |
| **RapidAPI** | TripAdvisor hotel search & room details |
| **Tavily** | Web search for travel discovery |

### Frontend
| Library | Purpose |
|---------|---------|
| **Vite + React** | App framework |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Lucide React** | Icon library |
| **Axios** | HTTP client |

---

## 📁 Project Structure

```
SafarX/
├── backend/
│   ├── main.py              # FastAPI app & core endpoints
│   ├── agent.py             # Gemini AI agent with tool routing
│   ├── config.py            # Settings & env variable loader
│   ├── tools.py             # AI tool implementations
│   ├── tavily_client.py     # Tavily search client
│   ├── prompts.py           # System prompts
│   ├── requirements.txt
│   ├── .env.example         # ← copy this to .env
│   ├── models/              # Pydantic request/response models
│   ├── routers/
│   │   └── flights.py       # Flight search & booking endpoints
│   └── services/
│       └── tbo_service.py   # TBO API integration layer
│
└── frontend/
    ├── src/
    │   ├── App.jsx           # Root layout & panel state
    │   ├── index.css         # Global styles & design tokens
    │   ├── main.jsx
    │   ├── components/
    │   │   ├── Chat.jsx               # Main AI chat interface
    │   │   ├── FlightBookingPanel.jsx # Flight search form
    │   │   ├── FlightResultsPanel.jsx # Results with filter/sort
    │   │   ├── HotelBookingPanel.jsx  # Hotel search form
    │   │   ├── HotelSearchResults.jsx # Hotel results with filters
    │   │   ├── HotelCard.jsx          # Individual hotel card UI
    │   │   ├── HotelDetailModal.jsx   # Detailed hotel view modal
    │   │   ├── Header.jsx
    │   │   └── Itinerary.jsx
    │   └── services/
    │       └── flightApi.js  # TBO API client + formatters
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- API keys (see environment variables below)

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# → Open .env and fill in your API keys

# Run the server
python main.py
```

Backend runs at: `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔑 Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your values:

```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Tavily Search
TAVILY_API_KEY=your_tavily_api_key

# RapidAPI / TripAdvisor Hotel Credentials
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=tripadvisor16.p.rapidapi.com

# TBO (TekTravels) Flight API
TBO_CLIENT_ID=ApiIntegrationNew
TBO_USERNAME=your_tbo_username
TBO_PASSWORD=your_tbo_password
TBO_END_USER_IP=

# TBO Endpoints (defaults work for production)
TBO_AUTH_URL=http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate
TBO_SEARCH_URL=http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search

# Server
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
```

---

## 📡 API Endpoints

### AI Agent
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent` | POST | Main AI chat with function calling |
| `/search` | POST | Web search via Tavily |
| `/itinerary` | POST | Generate travel itinerary |
| `/recommend` | POST | Destination recommendations |

### Flights (TBO)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/flights/search` | POST | Search available flights |
| `/flights/book` | POST | Book a Non-LCC flight (PNR hold) |
| `/flights/ticket/lcc` | POST | Ticket an LCC flight directly |
| `/flights/ticket/non-lcc` | POST | Ticket a Non-LCC after booking |

### Hotels (RapidAPI)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hotels/search-location` | GET | Search for hotel locations |
| `/api/hotels/filters` | GET | Get hotel filters for a location |
| `/api/hotels/search` | GET | Search hotels by location ID |
| `/api/hotels/search-by-location` | GET | Search hotels by coordinates |
| `/api/hotels/details` | GET | Get details for a specific hotel |

---

## 🎮 Usage Examples

**AI Chat:**
```
"Plan a 3-day trip to Goa"         → AI generates full itinerary
"Best places to visit in Europe"   → Destination recommendations
"Find me cheap hotels in Bali"     → Tavily-powered search results
```

**Flight Search:**
```
Click ✈️ in the chat → opens Flight Booking Panel
Enter DEL → DXB, pick a date → live results from TBO
Filter: Direct only, sort by price → instant re-sort
```

**Hotel Search:**
```
Click 🏨 in the chat → opens Hotel Booking Panel
Search "Bali" → find location and view live hotel results
Filter: by rating, price, view room details & photos
```

---

## 🎨 UI Highlights

- **Side-by-Side Panels** — Chat + Flight/Hotel booking panel without overlap
- **Animated Flight Cards** — Staggered entry, hover lift, airline-colored gradient bars
- **Filter Panel** — Collapsible, with stops filter, airline selector & price range slider
- **Next-Day Indicator** — "+1" badge on flights arriving the next day
- **Refundable Badge** — Clear ✓/✗ refundability label per flight

---

## 🏆 Hackathon Highlights

1. **Full AI Function Calling Pipeline** — Gemini routes user queries to the right tool automatically
2. **Live TBO Integration** — Actual bookable flights, not mock data
3. **Robust Date Parsing** — Handles TBO's `.NET /Date(timestamp)/` format
4. **Production-Quality UI** — Glassmorphism, micro-animations, responsive layout
5. **Secure by Default** — `.env` excluded from git, `.env.example` provided for onboarding

---

## 📝 License

MIT — feel free to fork and build on it!

---

Built with ❤️ for hackathon glory 🏆
