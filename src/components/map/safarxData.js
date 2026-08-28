/**
 * SafarX's own curated content, projected onto the map.
 *
 * Hidden gems and destinations ship their own latitude/longitude and are
 * used as-is. `vrTours.json` does not yet, so a small gazetteer pins those
 * until it does.
 */

import gemsData from "../../data/hiddengems.json";
import destinationsData from "../../data/destinations.json";
import vrToursData from "../../data/vrTours.json";
import { haversineKm, namesLookAlike } from "./mapUtils";

/* Gem images live in the shared assets folder, keyed by filename. */
const gemImages = import.meta.glob("../../assets/hidden-gems/*", {
  eager: true,
  import: "default",
});

const gemImage = (gem) => {
  const file = gem.images?.[0];
  if (!file) return null;
  const hit = Object.entries(gemImages).find(([path]) => path.endsWith(`/${file}`));
  return hit ? hit[1] : null;
};

/* ── Gazetteer: VR tour id → coordinates ──────────────────────────── */
/* vrTours.json still ships without coordinates; delete this table once
   it does. Hidden gems and destinations now carry their own. */
const VR_COORDS = {
  "taj-mahal": [27.1751, 78.0421],
  varanasi: [25.3109, 83.0107],
  jaipur: [26.9855, 75.8513],
  hampi: [15.335, 76.46],
  kerala: [9.4981, 76.3388],
  ladakh: [34.1526, 77.5771],
  goa: [15.01, 74.0232],
  delhi: [28.5245, 77.1855],
  mysore: [12.3052, 76.6552],
  khajuraho: [24.8318, 79.9199],
  amritsar: [31.62, 74.8765],
  ellora: [20.0268, 75.1779],
  madurai: [9.9195, 78.1193],
  konark: [19.8876, 86.0945],
};

/* ── Normalised map points ────────────────────────────────────────── */

export const GEM_POINTS = gemsData
  .filter((gem) => Number.isFinite(gem.latitude) && Number.isFinite(gem.longitude))
  .map((gem) => ({
    id: `gem-${gem.id}`,
    layer: "gems",
    glyph: "gem",
    name: gem.title,
    lat: gem.latitude,
    lng: gem.longitude,
    subtitle: gem.location,
    categoryLabel: "Hidden gem",
    detail: gem.description,
    image: gemImage(gem),
    meta: [gem.difficulty, gem.visitors].filter(Boolean),
    rating: gem.rating,
    raw: gem,
  }));

export const HERITAGE_POINTS = destinationsData
  .filter((d) => Number.isFinite(d.latitude) && Number.isFinite(d.longitude))
  .map((d) => ({
    id: `dest-${d.id}`,
    layer: "heritage",
    glyph: "heritage",
    name: d.city,
    lat: d.latitude,
    lng: d.longitude,
    subtitle: d.travel_theme ? `${d.travel_theme} · India` : "India",
    categoryLabel: "Heritage & cities",
    detail: d.description,
    image: d.image,
    meta: [
      d.crowd_level ? `${d.crowd_level} crowds` : null,
      d.avg_budget_per_day ? `₹${Math.round(d.avg_budget_per_day * 83)}/day` : null,
    ].filter(Boolean),
    rating: null,
    raw: d,
  }));

export const VR_POINTS = vrToursData
  .filter((tour) => VR_COORDS[tour.id])
  .map((tour) => ({
    id: `vr-${tour.id}`,
    layer: "vr",
    glyph: "vr",
    name: tour.name,
    lat: VR_COORDS[tour.id][0],
    lng: VR_COORDS[tour.id][1],
    subtitle: tour.country,
    categoryLabel: "360° tour",
    detail: tour.description,
    image: tour.thumbnail,
    meta: [tour.category, tour.duration].filter(Boolean),
    rating: null,
    tour,
    raw: tour,
  }));

export const SAFARX_POINTS_BY_LAYER = {
  gems: GEM_POINTS,
  heritage: HERITAGE_POINTS,
  vr: VR_POINTS,
};

export const ALL_SAFARX_POINTS = [...GEM_POINTS, ...HERITAGE_POINTS, ...VR_POINTS];

/* ── Linking OSM places back to SafarX content ────────────────────── */

const nearestWithin = (points, lat, lng, maxKm, name) => {
  let best = null;
  let bestKm = Infinity;
  for (const point of points) {
    const km = haversineKm(lat, lng, point.lat, point.lng);
    if (km === null) continue;
    const nameMatch = name ? namesLookAlike(name, point.name) : false;
    const limit = nameMatch ? maxKm * 4 : maxKm;
    if (km <= limit && km < bestKm) {
      best = point;
      bestKm = km;
    }
  }
  return best;
};

/**
 * Given any map point, find the SafarX content that belongs to it —
 * a 360° tour to open, or a hidden-gem story to read.
 */
export const findSafarxLinks = (place) => {
  if (!place || !Number.isFinite(place.lat)) return { tour: null, gem: null, destination: null };
  return {
    tour: nearestWithin(VR_POINTS, place.lat, place.lng, 2.5, place.name),
    gem: nearestWithin(GEM_POINTS, place.lat, place.lng, 3, place.name),
    destination: nearestWithin(HERITAGE_POINTS, place.lat, place.lng, 6, place.name),
  };
};

/** Local, zero-latency matches for the search box. */
export const searchSafarxContent = (query, limit = 4) => {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return ALL_SAFARX_POINTS.filter(
    (point) =>
      point.name.toLowerCase().includes(q) ||
      (point.subtitle || "").toLowerCase().includes(q)
  ).slice(0, limit);
};
