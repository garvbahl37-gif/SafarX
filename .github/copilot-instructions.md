# Safar360: AI Coding Agent Instructions

**Safar360** is a full-stack React + Vite travel companion app for exploring India's heritage, hidden gems, arts, and festivals. This guide helps AI agents contribute productively.

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **State Management**: React Context (AppContext) + Zustand
- **Data Fetching**: React Query + Axios
- **Authentication**: Clerk (social login)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **3D Rendering**: Three.js + React Three Fiber (@react-three/fiber)
- **AI Integration**: Google Gemini API (itinerary generation), Gradio
- **Maps**: Leaflet + React Leaflet
- **Build**: Vite with path alias `@` → `src/`

### Core Data Flow

```
HomePage/Feature Pages → App Context (state mgmt) → Services (API, Supabase) → External APIs (Gemini, Clerk)
                      ↓
                   Local JSON data (heritage.json, festivals.json, arts.json, quiz_questions.json)
```

### Key Directories

| Path | Purpose |
|------|---------|
| `src/components/` | Reusable UI components (Header, Footer, modals, forms) |
| `src/pages/` | Full page components (HomePage, HeritagePage, ItineraryPlanner, etc.) |
| `src/services/` | API clients, Gemini service, Supabase operations, badge/quiz logic |
| `src/hooks/` | Custom React hooks (useApi, useAuth, useLocalStorage, useProgress, useSearch) |
| `src/contexts/` | Global state (AppContext with user, bookmarks, progress, preferences) |
| `src/data/` | Static JSON files for heritage sites, festivals, arts, states, quiz questions |
| `src/utils/` | Helper functions (constants, validation, imageHelper, itineraryCalculator) |
| `src/lib/` | Supabase client initialization with RLS bypass for uploads |
| `src/components/3d/` | 3D scenes (Globe.jsx with interactive globe visualization) |

## Critical Development Workflows

### Setup & Development
```bash
npm install
npm run dev          # Start Vite dev server on localhost:3000
npm run build        # Production build to dist/
npm run lint         # ESLint check
npm run preview      # Preview production build
```

### Environment Variables (Required)
Create `.env.local` with:
```
VITE_GEMINI_API_KEY=your_gemini_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For RLS bypass
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_AI_API_URL=http://localhost:8000  # Local AI service (optional)
```

### Key Vite Proxy Routes
- `/api/*` → `http://localhost:1337/api/*` (Strapi CMS backend)
- `/graphql/*` → `http://localhost:1337/graphql/*` (GraphQL endpoint)

## Project-Specific Patterns

### 1. API Service Architecture
**Location**: [src/services/api.js](src/services/api.js)

Uses Axios with a singleton `ApiService` class:
```javascript
// Example: Heritage sites
ApiService.getHeritageSites();  // GET /api/heritage-sites
ApiService.getHeritageSiteById(id);
```

**Critical**: Token management via `setToken()` method syncs with Clerk authentication.

### 2. Authentication Pattern
**Challenge**: Clerk + Supabase coexist separately (no token mixing).

**Flow**:
1. User signs in via Clerk UI (Header.jsx)
2. Clerk user profile synced to Supabase via `createOrUpdateUser()` (userService.js)
3. Supabase operations use anonymous key (RLS enabled for read-only)
4. File uploads bypass RLS using `supabaseAdmin` client with service_role_key (see [src/lib/supabaseClient.js](src/lib/supabaseClient.js))

**Rule**: Never mix Clerk tokens with Supabase API calls. Both systems track user separately.

### 3. State Management Pattern
**AppContext** ([src/contexts/AppContext.js](src/contexts/AppContext.js)) manages:
- `user` (basic profile)
- `bookmarks` (saved sites)
- `progress` (visited sites, quiz scores, badges, level)
- `preferences` (theme, language)
- `ui` (sidebar, loading state)

Access via `useContext(AppContext)` or custom hooks like `useProgress()`.

### 4. Gemini Itinerary Generation
**Service**: [src/services/geminiService.js](src/services/geminiService.js)

Key function: `generateItinerary(params)` with:
- Seasonal context (winter/summer/monsoon/autumn)
- Multi-day trip planning with time-of-day activities
- State-aware recommendations
- **Temperature**: 0.9 (higher randomness for diverse choices)

**Form integration**: [src/components/GeminiItineraryForm.jsx](src/components/GeminiItineraryForm.jsx) + Display: [src/components/GeminiItineraryDisplay.jsx](src/components/GeminiItineraryDisplay.jsx)

### 5. 3D Globe Component
**Location**: [src/components/3d/Globe.jsx](src/components/3d/Globe.jsx)

Interactive 3D visualization using React Three Fiber:
- Renders textured Earth with custom shaders
- OrbitControls for mouse/touch interaction
- Custom stars field (FullSphereStars component)
- Performance optimized with Suspense & Preload

**Important**: Uses @react-three/fiber + @react-three/drei. Check device WebGL support.

### 6. Data Structure Conventions
**Heritage/Festivals/Arts/Hidden Gems** follow this structure:
```json
{
  "id": 1,
  "title": "Site Name",
  "description": "Brief description",
  "state": "State Name",
  "imageKey": "ajanta",  // Maps to asset files
  "rating": 4.8,
  "tags": ["culture", "historical"],
  "bestTimeToVisit": "Oct-Mar"
}
```

**Images stored in**: `src/assets/` (AVIF format preferred for performance)

### 7. Component Naming & Location Conventions
- **Pages** (`src/pages/`): PascalCase, one per route (HomePage, HeritagePage, etc.)
- **Components** (`src/components/`): PascalCase, reusable UI (Button, Card, Modal)
- **Hooks** (`src/hooks/`): camelCase, `use*` prefix
- **Services** (`src/services/`): Singleton classes or named exports

### 8. Sound Effects & Animation Patterns
- **Sound**: `useSoundEffect()` hook loads audio from URL or local assets
- **Animation**: Framer Motion for UI transitions (`motion.*`, `AnimatePresence`)
- **3D**: React Three Fiber for Canvas-based rendering

### 9. Quiz & Progress System
**Quiz Questions**: [src/data/quiz_questions.json](src/data/quiz_questions.json) (array of Q&A with state context)

**Progress Tracking**:
- Stored in AppContext + localStorage
- Quizzes → scores aggregated for level/badges
- Badge service ([src/services/badgeService.js](src/services/badgeService.js)) awards badges based on milestones

### 10. Styling Conventions
- **Tailwind CSS** primary; custom CSS in component files (.jsx.css)
- **Color scheme**: Light/dark theme via preferences (AppContext)
- **Icons**: lucide-react for consistent iconography
- **Responsive**: Mobile-first; breakpoints via Tailwind (sm, md, lg, xl)

## Common Workflows

### Adding a New Feature
1. Create page in `src/pages/YourFeaturePage.jsx`
2. Add route in App.jsx (page navigation state)
3. Create service layer in `src/services/yourService.js` if API calls needed
4. Update AppContext if global state required
5. Create components in `src/components/` as needed
6. Wire Header navigation in [src/components/Header.jsx](src/components/Header.jsx)

### Integrating External API
1. Add client initialization in `src/lib/` or `src/services/`
2. Expose methods via ApiService singleton (api.js)
3. Use `useApi()` hook or React Query in components
4. Handle errors with `react-hot-toast` notifications

### Debugging State Issues
- Check AppContext reducer logic ([src/contexts/AppContext.js](src/contexts/AppContext.js))
- Verify localStorage sync in hooks ([src/hooks/useLocalStorage.js](src/hooks/useLocalStorage.js))
- Check Clerk sync in App.jsx (Clerk → Supabase flow)

### Performance Optimization
- Lazy-load pages with React.lazy() + Suspense
- Use React Query caching (`staleTime: 5min, cacheTime: 10min`)
- Memoize expensive 3D components
- Compress images to AVIF format

## Known Gotchas & Decisions

1. **Supabase RLS Bypass**: Hidden gems uploads currently bypass RLS using `supabaseAdmin` client. This is a temporary fix—proper RLS rules should be implemented before production.

2. **Clerk + Supabase Separation**: User auth is dual-system. Sync happens in `createOrUpdateUser()`. Do not rely on Supabase JWT for API auth.

3. **No Backend ORM**: API calls go directly to Strapi CMS (localhost:1337). No local Node.js server for business logic.

4. **Static Data Priority**: heritage.json, festivals.json, etc. are source-of-truth. CMS updates should sync back.

5. **Gemini Token Limits**: Temperature at 0.9 for randomness; watch for API quota on itinerary generation.

## Key Files for Quick Reference

| File | Purpose |
|------|---------|
| [src/App.jsx](src/App.jsx) | Entry point, page routing, Clerk integration |
| [src/contexts/AppContext.js](src/contexts/AppContext.js) | Global state (user, bookmarks, progress) |
| [src/services/api.js](src/services/api.js) | Axios client for all API calls |
| [src/lib/supabaseClient.js](src/lib/supabaseClient.js) | Supabase + RLS bypass setup |
| [src/services/geminiService.js](src/services/geminiService.js) | Gemini API for itinerary generation |
| [src/hooks/useApi.js](src/hooks/useApi.js) | Custom hook for API data fetching |
| [src/utils/constants.js](src/utils/constants.js) | API endpoints, states list, constants |
| [src/components/Header.jsx](src/components/Header.jsx) | Navigation, menu, auth UI |
| [src/components/3d/Globe.jsx](src/components/3d/Globe.jsx) | Interactive 3D globe |
| [vite.config.js](vite.config.js) | Vite config with proxies + path alias |

## Testing & Debugging Tips

- **Local Dev**: `npm run dev` with `.env.local` configured
- **Network Issues**: Check Vite proxy config (localhost:1337 must be running)
- **Supabase Errors**: Look at browser console; RLS policy issues are common
- **Clerk Issues**: Verify VITE_CLERK_PUBLISHABLE_KEY in .env.local
- **3D Performance**: Check Three.js console warnings; reduce star count if needed

---

**Last Updated**: January 2026 | **Vite 5.x**, **React 18.3**, **Tailwind 3.x**
