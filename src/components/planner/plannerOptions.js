/**
 * Shared option sets, copy, and formatters for the SafarX trip planner.
 *
 * Icons are stored as lucide-react component references (not elements) so this
 * stays a plain .js module — render them as `<Icon size={16} />`.
 */
import {
  Palmtree, Compass, Clock, Wallet, Building, Gem,
  Landmark, Mountain, Utensils, ShoppingBag, Moon, Sun,
  Camera, Music, PawPrint, Waves, Flower2, Footprints,
  MapPin, CalendarDays, Heart, IndianRupee, ClipboardCheck,
} from "lucide-react";

export const EASE = [0.22, 1, 0.36, 1];

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

export const PLANNER_STEPS = [
  { id: "destination", label: "Destination", short: "Where", icon: MapPin, coords: "20.59° N · 78.96° E" },
  { id: "dates", label: "Dates & pace", short: "When", icon: CalendarDays, coords: "Leg 02" },
  { id: "interests", label: "Interests", short: "What", icon: Heart, coords: "Leg 03" },
  { id: "budget", label: "Budget & group", short: "How", icon: IndianRupee, coords: "Leg 04" },
  { id: "review", label: "Review", short: "Go", icon: ClipboardCheck, coords: "Final" },
];

/* ------------------------------------------------------------------ */
/*  Popular Indian destinations — thumbnail chips                      */
/* ------------------------------------------------------------------ */

export const POPULAR_DESTINATIONS = [
  {
    city: "Jaipur",
    region: "Rajasthan",
    coords: "26.99° N · 75.85° E",
    note: "Forts & bazaars",
    thumb: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Goa",
    region: "Konkan coast",
    coords: "15.30° N · 74.12° E",
    note: "Beaches & cafés",
    thumb: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Varanasi",
    region: "Uttar Pradesh",
    coords: "25.32° N · 83.01° E",
    note: "Ghats & aarti",
    thumb: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Kerala (Region)",
    region: "Malabar coast",
    coords: "9.50° N · 76.34° E",
    note: "Backwaters",
    thumb: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Ladakh",
    region: "Trans-Himalaya",
    coords: "34.15° N · 77.58° E",
    note: "High passes",
    thumb: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Agra",
    region: "Uttar Pradesh",
    coords: "27.17° N · 78.04° E",
    note: "The Taj",
    thumb: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Hampi",
    region: "Karnataka",
    coords: "15.34° N · 76.46° E",
    note: "Ruined capital",
    thumb: "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?w=280&auto=format&fit=crop&q=60",
  },
  {
    city: "Udaipur",
    region: "Rajasthan",
    coords: "24.58° N · 73.68° E",
    note: "Lake palaces",
    thumb: "https://images.unsplash.com/photo-1590766940554-153a4d9f6e56?w=280&auto=format&fit=crop&q=60",
  },
];

/* ------------------------------------------------------------------ */
/*  Preference options                                                 */
/*  NOTE: `id` values are sent verbatim to the Gemini prompt — the      */
/*  existing ids must not be renamed.                                  */
/* ------------------------------------------------------------------ */

export const TRAVEL_PACES = [
  { id: "Relaxed", label: "Relaxed", desc: "Two or three stops a day, long lunches", icon: Palmtree, meta: "2–3 stops / day" },
  { id: "Moderate", label: "Moderate", desc: "A full day out with time to breathe", icon: Compass, meta: "4–5 stops / day" },
  { id: "Intense", label: "Intense", desc: "Early starts, everything squeezed in", icon: Clock, meta: "6+ stops / day" },
];

export const TRAVEL_STYLES = [
  { id: "Budget", label: "Budget", desc: "Hostels, buses, street food", icon: Wallet, meta: "₹1.5k–2.5k / day" },
  { id: "Mid Range", label: "Mid range", desc: "Clean 3-star stays, cabs, sit-down meals", icon: Building, meta: "₹3k–5k / day" },
  { id: "Luxury", label: "Luxury", desc: "Heritage hotels, private drivers, fine dining", icon: Gem, meta: "₹8k+ / day" },
];

export const INTERESTS_OPTIONS = [
  { id: "Heritage", label: "Heritage", icon: Landmark },
  { id: "History", label: "History", icon: Building },
  { id: "Culture", label: "Culture", icon: Music },
  { id: "Spiritual", label: "Spiritual", icon: Flower2 },
  { id: "Trekking", label: "Trekking", icon: Mountain },
  { id: "Adventure", label: "Adventure", icon: Compass },
  { id: "Wildlife", label: "Wildlife", icon: PawPrint },
  { id: "Nature", label: "Nature", icon: Palmtree },
  { id: "Beaches", label: "Beaches", icon: Waves },
  { id: "Food", label: "Food", icon: Utensils },
  { id: "Shopping", label: "Shopping", icon: ShoppingBag },
  { id: "Photography", label: "Photography", icon: Camera },
  { id: "Art", label: "Art", icon: Footprints },
  { id: "Nightlife", label: "Nightlife", icon: Moon },
  { id: "Relaxation", label: "Relaxation", icon: Sun },
];

/* ------------------------------------------------------------------ */
/*  Budget                                                             */
/* ------------------------------------------------------------------ */

export const BUDGET_MIN = 5000;
export const BUDGET_MAX = 500000;
export const BUDGET_STEP = 2500;

export const BUDGET_PRESETS = [15000, 40000, 75000, 150000];

/* ------------------------------------------------------------------ */
/*  Loading copy                                                       */
/* ------------------------------------------------------------------ */

export const GENERATING_MESSAGES = [
  "Charting your route…",
  "Checking the season…",
  "Reading train and road times…",
  "Pricing stays and tickets in ₹…",
  "Balancing the day against your pace…",
  "Adding the places locals actually go…",
  "Writing the final plan…",
];

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */

/** 40000 → "₹40,000" (Indian digit grouping). */
export const formatINR = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

/** Inclusive day count between two ISO date strings; 0 when invalid. */
export const dayCountBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end - start) / 86400000) + 1;
  return diff > 0 ? diff : 0;
};

/** "2026-03-14" → "14 Mar 2026" */
export const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

/** Today as YYYY-MM-DD, for date input `min` attributes. */
export const todayISO = () => {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};
