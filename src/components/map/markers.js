/**
 * Leaflet div-icons for the Local Insights map.
 *
 * Every marker is a dark-glass chip with a hairline ring in its category
 * colour and a hand-drawn glyph — the same furniture language as the rest of
 * the SafarX chrome, but legible at 28px on a satellite tile.
 */

import L from "leaflet";
import { GOLD, GOLD_BRIGHT, IVORY } from "./mapUtils";

/* 24×24 stroke glyphs. Kept tiny and geometric so they hold up when scaled. */
const GLYPHS = {
  eat: '<path d="M7 3v6M5 3v3.5a2 2 0 0 0 4 0V3M7 9v12M16.5 3c-1.2 1.2-1.7 2.9-1.7 4.6 0 1.4.6 2.4 1.7 2.7V21"/>',
  stay: '<path d="M3 19V7M3 12h11a4 4 0 0 1 4 4v3M3 19h18M7.5 10.5h.01"/>',
  money:
    '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/><path d="M5.5 9.5h.01M18.5 14.5h.01"/>',
  health: '<path d="M10 3h4v6h6v4h-6v8h-4v-8H4V9h6z"/>',
  fuel:
    '<path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h13M4 10h10M17 8.5l3 3V17a1.5 1.5 0 0 1-3 0v-4h-3"/>',
  toilets:
    '<path d="M3.5 6.5l1.8 11 1.7-6.2 1.7 6.2 1.8-11M14.5 6.5v11h3a3.5 3.5 0 0 0 3.5-3.5v-4a3.5 3.5 0 0 0-3.5-3.5z"/>',
  rail:
    '<rect x="5" y="3" width="14" height="12.5" rx="3.5"/><path d="M5 10.5h14M8.5 20l-2 1.5M15.5 20l2 1.5M8.5 15.5v0M9 13h.01M15 13h.01"/>',
  bus:
    '<rect x="3.5" y="4" width="17" height="12" rx="2.5"/><path d="M3.5 10.5h17M7 20v-3.5M17 20v-3.5M7.5 13.5h.01M16.5 13.5h.01"/>',
  worship:
    '<path d="M12 2.5l3.8 4.6V21H8.2V7.1zM4 21v-8.5l4.2-3M20 21v-8.5L15.8 9.5M10.6 21v-4.4a1.4 1.4 0 0 1 2.8 0V21"/>',
  viewpoint:
    '<path d="M2 12s3.6-6.2 10-6.2S22 12 22 12s-3.6 6.2-10 6.2S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  museum:
    '<path d="M2.5 21h19M4.5 21V10M9 21V10M15 21V10M19.5 21V10M2.5 10h19L12 3.2z"/>',
  gem: '<path d="M6.5 3h11l3.5 6-9 12L3 9z"/><path d="M3 9h18"/>',
  heritage:
    '<path d="M2.5 21h19M4.5 21V9.5L12 3.2l7.5 6.3V21M9.5 21v-6h5v6"/>',
  vr: '<path d="M9.5 7.5l7.5 4.5-7.5 4.5z"/>',
  pin: '<circle cx="12" cy="12" r="4.5"/>',
  flag: '<path d="M5 21V4M5 4.5h11l-2.2 3.6L16 12H5"/>',
};

const svg = (glyph, color, size) => `
  <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none"
       stroke="${color}" stroke-width="1.6" stroke-linecap="round"
       stroke-linejoin="round" aria-hidden="true">${GLYPHS[glyph] || GLYPHS.pin}</svg>`;

/**
 * A place marker — OSM result or a SafarX curated waypoint.
 */
export const createPlaceIcon = ({
  glyph = "pin",
  color = GOLD,
  selected = false,
  hovered = false,
} = {}) => {
  const size = selected ? 40 : 30;
  const glyphSize = selected ? 19 : 15;
  const ring = selected || hovered ? 2 : 1.25;
  const glow = selected
    ? `0 0 0 6px ${color}22, 0 0 22px ${color}88, 0 10px 22px rgba(0,0,0,.55)`
    : hovered
      ? `0 0 14px ${color}77, 0 6px 16px rgba(0,0,0,.5)`
      : `0 4px 12px rgba(0,0,0,.5)`;

  return L.divIcon({
    className: "safarx-marker",
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:999px;
        background:rgba(6,20,18,.92);
        border:${ring}px solid ${color};
        box-shadow:${glow};
        transition:box-shadow .2s ease;
      ">${svg(glyph, color, glyphSize)}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
};

/**
 * A grid cluster. The ring thickens with density so a busy bazaar reads
 * differently from two lonely pins.
 */
export const createClusterIcon = (count, color = GOLD) => {
  const size = count > 200 ? 54 : count > 50 ? 48 : count > 12 ? 42 : 36;
  const label = count > 999 ? "999+" : String(count);

  return L.divIcon({
    className: "safarx-cluster",
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:999px;
        background:rgba(6,20,18,.9);
        border:1.5px solid ${color}88;
        box-shadow:0 0 0 6px ${color}14, 0 8px 20px rgba(0,0,0,.5);
        color:${color};
        font-family:'Space Grotesk','JetBrains Mono',monospace;
        font-size:${size > 46 ? 13 : 12}px;font-weight:500;
        letter-spacing:.04em;
      ">${label}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

/** Numbered gold waypoint for route stops. */
export const createRouteStopIcon = (index, isLast = false) => {
  const size = 30;
  const label = index === 0 ? "A" : isLast ? "B" : String(index + 1);

  return L.divIcon({
    className: "safarx-route-stop",
    html: `
      <span style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:999px;
        background:${GOLD};color:#061412;
        border:2px solid rgba(6,20,18,.9);
        box-shadow:0 0 18px rgba(212,168,67,.55), 0 6px 16px rgba(0,0,0,.5);
        font-family:'Space Grotesk','JetBrains Mono',monospace;
        font-size:12px;font-weight:600;
      ">${label}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -18],
  });
};

/** "You are here" — ivory core, gold halo. */
export const createUserIcon = () =>
  L.divIcon({
    className: "safarx-user-marker",
    html: `
      <span style="
        display:block;width:16px;height:16px;border-radius:999px;
        background:${IVORY};border:3px solid ${GOLD_BRIGHT};
        box-shadow:0 0 0 7px rgba(212,168,67,.16), 0 0 18px rgba(212,168,67,.6);
      "></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });

export const GLYPH_KEYS = Object.keys(GLYPHS);
