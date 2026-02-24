# 🌍 Safar360 - Immersive Traveler Companion AI

A hackathon-winning AI-powered travel assistant with VR destination previews, intelligent itinerary generation, and real-time booking search.

![Tech Stack](https://img.shields.io/badge/Stack-FastAPI%20%7C%20React%20%7C%20Gemini%20%7C%20Tavily-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **AI Travel Agent** - Powered by Google Gemini with function calling
- 🌐 **VR Previews** - Explore destinations in 3D via Google Earth
- 📅 **Smart Itineraries** - AI-generated day-by-day travel plans
- 🔍 **Real-time Search** - Tavily-powered booking site discovery
- 🎨 **Premium UI** - Glassmorphism, animations, dark mode

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - High-performance async API
- **Google Gemini** - LLM with function calling
- **Tavily** - Web search API

### Frontend
- **Vite + React**
- **Tailwind CSS**
- **Framer Motion**
- **Lucide React Icons**

## 📁 Project Structure

```
Agent Safar360/
├── backend/
│   ├── main.py           # FastAPI app & endpoints
│   ├── agent.py          # Gemini AI agent
│   ├── tools.py          # Tool implementations
│   ├── tavily_client.py  # Tavily API client
│   ├── prompts.py        # System prompts
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   ├── index.css
    │   ├── main.jsx
    │   └── components/
    │       ├── Chat.jsx
    │       ├── VRViewer.jsx
    │       ├── Header.jsx
    │       ├── Itinerary.jsx
    │       └── BookingResults.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Tavily API Key ([Get one here](https://tavily.com))

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Run the server
python main.py
```

Backend runs at: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 🔑 Environment Variables

Create a `.env` file in the backend folder:

```env
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
HOST=0.0.0.0
PORT=8000
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent` | POST | Main AI chat |
| `/search` | POST | Web search via Tavily |
| `/vr` | POST | Get VR preview link |
| `/itinerary` | POST | Generate itinerary |
| `/recommend` | POST | Get destination recommendations |
| `/destinations` | GET | List VR destinations |

## 🎮 Demo Scenarios

### Scenario 1: Plan a Trip
```
User: "Plan a 3-day Goa trip"
→ AI generates itinerary
→ VR preview loads
→ User can explore in 3D
```

### Scenario 2: Find Bookings
```
User: "Where should I book flights to Bali?"
→ Agent uses Tavily search
→ Returns booking site options
→ User clicks to visit sites
```

### Scenario 3: Discover Destinations
```
User: "I want a peaceful beach destination under $1000"
→ AI recommends destinations
→ Offers VR previews for each
→ Can generate itinerary for any
```

## 🗣️ Example Queries

**Discovery:**
- "Suggest a romantic getaway in Europe"
- "Best adventure destinations in Asia"
- "Budget-friendly beach destinations"

**Planning:**
- "Plan a 5-day Tokyo itinerary"
- "Create a cultural tour of Jaipur"
- "Weekend trip to Paris"

**Booking:**
- "Find best flight deals to Dubai"
- "Where to book hotels in Maldives"
- "Compare train tickets to Goa"

**VR Preview:**
- "Show me Santorini in VR"
- "Preview Machu Picchu"
- "Explore the streets of Tokyo"

## 🎨 UI Features

- **Split Layout**: Chat + VR side by side
- **Glassmorphism**: Frosted glass effects
- **Micro-animations**: Smooth transitions
- **Dark Mode**: Default with light mode toggle
- **Responsive**: Works on all devices
- **Quick Actions**: Preset query chips

## 🏆 Hackathon Highlights

1. **End-to-End AI Integration** - Full function calling pipeline
2. **Immersive VR** - Google Earth embedded previews
3. **Real-time Search** - Live booking site discovery
4. **Premium Design** - Production-quality UI
5. **Scalable Architecture** - Clean separation of concerns

## 📝 License

MIT License - feel free to use for your projects!

---

Built with ❤️ for hackathon glory 🏆
