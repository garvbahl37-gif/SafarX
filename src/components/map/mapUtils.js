/**
 * mapUtils — pure helpers for the Local Insights map surface.
 *
 * No React, no Leaflet imports: everything here is either maths, formatting
 * or static configuration so it stays cheap to test and reuse.
 */

/* Shared motion curve — matches the rest of SafarX. */
export const EASE = [0.22, 1, 0.36, 1];

/* Geographic centre of India + a generous national bounding box. */
export const INDIA_CENTER = [20.5937, 78.9629];
export const INDIA_BBOX = { south: 6.2, west: 67.5, north: 37.8, east: 97.8 };

export const isInIndia = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= INDIA_BBOX.south &&
  lat <= INDIA_BBOX.north &&
  lng >= INDIA_BBOX.west &&
  lng <= INDIA_BBOX.east;

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ── Distance ─────────────────────────────────────────────────────── */

/** Great-circle distance between two coordinates, in kilometres. */
export const haversineKm = (lat1, lng1, lat2, lng2) => {
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null;
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (km) => {
  if (km === null || km === undefined || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

/** "27.17° N · 78.04° E" — the SafarX coordinate eyebrow. */
export const formatCoords = (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns} · ${Math.abs(lng).toFixed(2)}° ${ew}`;
};

/* ── Base layers (all free tile providers, attributed individually) ── */

export const TILE_LAYERS = [
  {
    // CARTO now watermarks unauthenticated basemap requests ("API KEY
    // REQUIRED" burnt into every tile), so the dark base is plain OSM
    // darkened with a CSS filter — free, keyless, and on-theme.
    id: "standard",
    name: "Standard",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "",
    maxZoom: 19,
    className: "map-tiles-dark",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    attributionText: "© OpenStreetMap contributors",
  },
  {
    id: "satellite",
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 19,
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics and the GIS User Community",
    attributionText: "Tiles © Esri — Esri, Maxar, Earthstar Geographics",
  },
  {
    id: "terrain",
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 17,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM · Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    attributionText: "© OpenStreetMap contributors, SRTM · © OpenTopoMap (CC-BY-SA)",
  },
];

/**
 * Half the viewport diagonal, clamped to a sane "nearby" radius (metres).
 * Takes a Leaflet map instance but needs no Leaflet import of its own.
 */
export const viewRadiusMeters = (map) => {
  const bounds = map.getBounds();
  const metres = bounds.getCenter().distanceTo(bounds.getNorthEast());
  return Math.round(clamp(metres, 800, 12000));
};

/* ── Marker palette ───────────────────────────────────────────────── */

export const GOLD = "#D4A843";
export const GOLD_BRIGHT = "#E5BE5C";
export const JADE = "#2E8B74";
export const IVORY = "#F2EFE6";

/* ── Clustering ───────────────────────────────────────────────────── */

/**
 * Grid clustering in screen space. `project` maps (lat, lng) to a pixel
 * point, so clusters follow zoom without any extra dependency.
 */
export const clusterByPixelGrid = (points, project, cellSize = 56) => {
  const cells = new Map();

  for (const point of points) {
    const pixel = project(point.lat, point.lng);
    if (!pixel) continue;
    const key = `${Math.floor(pixel.x / cellSize)}:${Math.floor(pixel.y / cellSize)}`;
    let cell = cells.get(key);
    if (!cell) {
      cell = { key, points: [], sumLat: 0, sumLng: 0 };
      cells.set(key, cell);
    }
    cell.points.push(point);
    cell.sumLat += point.lat;
    cell.sumLng += point.lng;
  }

  return Array.from(cells.values()).map((cell) => ({
    key: cell.key,
    count: cell.points.length,
    lat: cell.sumLat / cell.points.length,
    lng: cell.sumLng / cell.points.length,
    points: cell.points,
  }));
};

/* ── Google Maps deep links (kept from the previous page) ──────────── */

export const googleDirectionsUrl = (stops = []) => {
  const waypoints = stops
    .filter((s) => Number.isFinite(s?.lat) && Number.isFinite(s?.lng))
    .map((s) => `${s.lat},${s.lng}`);
  if (waypoints.length === 0) return null;
  return `https://www.google.com/maps/dir/${waypoints.join("/")}`;
};

export const googleDirectionsTo = (destination, origin = null) => {
  if (!destination) return null;
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (origin && Number.isFinite(origin.lat)) {
    params.set("origin", `${origin.lat},${origin.lng}`);
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
};

/* ── OSM tag readers ──────────────────────────────────────────────── */

export const addressFromTags = (tags = {}) => {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

export const phoneFromTags = (tags = {}) =>
  tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null;

export const websiteFromTags = (tags = {}) => {
  const raw = tags.website || tags["contact:website"] || tags.url || null;
  if (!raw) return null;
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
};

/** Humanise an OSM value: "fast_food" → "Fast food". */
export const humanise = (value) => {
  if (!value || typeof value !== "string") return null;
  const words = value.replace(/_/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/* ── opening_hours ────────────────────────────────────────────────── */

const DAY_TOKENS = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 };

const daysFromSpec = (spec) => {
  const days = new Set();
  for (const chunk of spec.split(",")) {
    const [from, to] = chunk.trim().toLowerCase().split("-");
    const start = DAY_TOKENS[from];
    if (start === undefined) continue;
    if (to === undefined) {
      days.add(start);
      continue;
    }
    const end = DAY_TOKENS[to];
    if (end === undefined) continue;
    for (let i = 0; i < 7; i += 1) {
      const day = (start + i) % 7;
      days.add(day);
      if (day === end) break;
    }
  }
  return days;
};

/**
 * A deliberately conservative `opening_hours` reader.
 * Returns true / false when the rule is understood, and null when it is not —
 * we would rather show nothing than show a wrong "open now".
 */
export const parseOpenNow = (value, now = new Date()) => {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  if (/^24\s*\/\s*7$/.test(raw)) return true;
  if (/(sunrise|sunset|dawn|dusk|week|easter|holiday|season|\bjan\b|\bfeb\b|\bmar\b|\bapr\b|\bjun\b|\bjul\b|\baug\b|\bsep\b|\boct\b|\bnov\b|\bdec\b)/i.test(raw)) {
    return null;
  }

  const today = now.getDay();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  let understood = false;
  let open = false;

  for (const rule of raw.split(";")) {
    const trimmed = rule.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^((?:mo|tu|we|th|fr|sa|su|ph|,|-|\s)*)(.*)$/i);
    if (!match) return null;

    const daySpec = (match[1] || "").trim();
    const timeSpec = (match[2] || "").trim();

    if (/ph/i.test(daySpec)) {
      understood = true;
      continue;
    }

    if (daySpec) {
      const days = daysFromSpec(daySpec);
      if (days.size === 0) return null;
      if (!days.has(today)) {
        understood = true;
        continue;
      }
    }

    if (/^(off|closed)$/i.test(timeSpec)) {
      understood = true;
      continue;
    }

    if (/^24\s*\/\s*7$/.test(timeSpec)) {
      understood = true;
      open = true;
      continue;
    }

    const ranges = timeSpec.match(/\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/g);
    if (!ranges) return null;

    understood = true;
    for (const range of ranges) {
      const [start, end] = range.split("-").map((token) => {
        const [h, m] = token.trim().split(":").map(Number);
        return h * 60 + m;
      });
      if (end <= start) {
        if (minutesNow >= start || minutesNow < end) open = true;
      } else if (minutesNow >= start && minutesNow < end) {
        open = true;
      }
    }
  }

  return understood ? open : null;
};

export const REGIONS = [
  { id: "all", name: "All regions" },
  { id: "north", name: "North India" },
  { id: "northeast", name: "Northeast India" },
  { id: "east", name: "East India" },
  { id: "central", name: "Central India" },
  { id: "west", name: "West India" },
  { id: "south", name: "South India" },
];

/**
 * A coarse region for any Indian coordinate — used by the region filter so
 * curated content from three different files can share one control.
 */
export const regionFor = (lat, lng) => {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "central";
  if (lng >= 88 && lat >= 21.5) return "northeast";
  if (lat >= 26.5) return "north";
  if (lat < 16.5) return "south";
  if (lng < 76.5) return "west";
  if (lng >= 82) return "east";
  return "central";
};

/* ── Misc ─────────────────────────────────────────────────────────── */

export const slug = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/** Loose name comparison used to link OSM places to SafarX's own content. */
export const namesLookAlike = (a = "", b = "") => {
  const norm = (v) =>
    v
      .toLowerCase()
      .replace(/\b(the|of|fort|temple|palace|caves?|valley|ruins?)\b/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const left = norm(a);
  const right = norm(b);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
};
