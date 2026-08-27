/**
 * The eleven things a traveller standing in an Indian city actually needs to
 * find. Each entry carries its own Overpass filter set, so adding a category
 * is a data change rather than a code change.
 */

import {
  UtensilsCrossed,
  BedDouble,
  Banknote,
  Cross,
  Fuel,
  Toilet,
  TrainFront,
  Bus,
  Landmark,
  Binoculars,
  Building2,
} from "lucide-react";

import { GOLD, GOLD_BRIGHT, JADE } from "./mapUtils";

/**
 * `filters` are raw Overpass element selectors; `{{A}}` is replaced with the
 * around-clause at query time.
 */
export const NEARBY_CATEGORIES = [
  {
    id: "eat",
    label: "Eat",
    long: "Restaurants & street food",
    icon: UtensilsCrossed,
    glyph: "eat",
    color: GOLD,
    filters: [
      'nwr["amenity"~"^(restaurant|fast_food|cafe|food_court|ice_cream)$"]{{A}};',
      'nwr["shop"="bakery"]{{A}};',
    ],
    labelFrom: (tags) => tags.cuisine || tags.amenity,
  },
  {
    id: "stay",
    label: "Stay",
    long: "Hotels & guesthouses",
    icon: BedDouble,
    glyph: "stay",
    color: GOLD_BRIGHT,
    filters: ['nwr["tourism"~"^(hotel|guest_house|hostel|motel|apartment)$"]{{A}};'],
    labelFrom: (tags) => tags.tourism,
  },
  {
    id: "money",
    label: "ATMs & banks",
    long: "Cash and currency",
    icon: Banknote,
    glyph: "money",
    color: GOLD,
    filters: ['nwr["amenity"~"^(atm|bank|bureau_de_change)$"]{{A}};'],
    labelFrom: (tags) => tags.amenity,
  },
  {
    id: "health",
    label: "Pharmacy & hospital",
    long: "Medical help",
    icon: Cross,
    glyph: "health",
    color: GOLD_BRIGHT,
    filters: ['nwr["amenity"~"^(pharmacy|hospital|clinic|doctors)$"]{{A}};'],
    labelFrom: (tags) => tags.amenity,
  },
  {
    id: "fuel",
    label: "Petrol pumps",
    long: "Fuel and charging",
    icon: Fuel,
    glyph: "fuel",
    color: GOLD,
    filters: [
      'nwr["amenity"="fuel"]{{A}};',
      'nwr["amenity"="charging_station"]{{A}};',
    ],
    labelFrom: (tags) => tags.amenity,
  },
  {
    id: "toilets",
    label: "Public toilets",
    long: "Rest stops",
    icon: Toilet,
    glyph: "toilets",
    color: JADE,
    filters: ['nwr["amenity"="toilets"]{{A}};'],
    labelFrom: () => "toilets",
  },
  {
    id: "rail",
    label: "Rail & metro",
    long: "Stations",
    icon: TrainFront,
    glyph: "rail",
    color: GOLD_BRIGHT,
    filters: [
      'nwr["railway"~"^(station|halt)$"]{{A}};',
      'nwr["public_transport"="station"]["train"="yes"]{{A}};',
    ],
    labelFrom: (tags) => (tags.station ? `${tags.station} station` : "railway station"),
  },
  {
    id: "bus",
    label: "Bus stands",
    long: "Long-distance & city buses",
    icon: Bus,
    glyph: "bus",
    color: JADE,
    filters: [
      'nwr["amenity"="bus_station"]{{A}};',
      'nwr["highway"="bus_stop"]["name"]{{A}};',
    ],
    labelFrom: (tags) => (tags.amenity === "bus_station" ? "bus station" : "bus stop"),
  },
  {
    id: "worship",
    label: "Places of worship",
    long: "Temples, mosques, churches, gurudwaras",
    icon: Landmark,
    glyph: "worship",
    color: GOLD,
    filters: ['nwr["amenity"="place_of_worship"]["name"]{{A}};'],
    labelFrom: (tags) => tags.religion || "place of worship",
  },
  {
    id: "viewpoint",
    label: "Viewpoints",
    long: "Where the view is",
    icon: Binoculars,
    glyph: "viewpoint",
    color: GOLD_BRIGHT,
    filters: [
      'nwr["tourism"="viewpoint"]{{A}};',
      'nwr["natural"="peak"]["name"]{{A}};',
    ],
    labelFrom: (tags) => (tags.natural === "peak" ? "peak" : "viewpoint"),
  },
  {
    id: "museum",
    label: "Museums",
    long: "Museums & galleries",
    icon: Building2,
    glyph: "museum",
    color: GOLD,
    filters: [
      'nwr["tourism"~"^(museum|gallery)$"]{{A}};',
      'nwr["historic"="museum"]{{A}};',
    ],
    labelFrom: (tags) => tags.tourism || "museum",
  },
];

export const CATEGORY_BY_ID = NEARBY_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = category;
  return acc;
}, {});

/* SafarX's own curated overlays — shown alongside the live OSM data. */
export const SAFARX_LAYERS = [
  {
    id: "gems",
    label: "Hidden gems",
    glyph: "gem",
    color: JADE,
  },
  {
    id: "heritage",
    label: "Heritage & cities",
    glyph: "heritage",
    color: GOLD,
  },
  {
    id: "vr",
    label: "360° tours",
    glyph: "vr",
    color: GOLD_BRIGHT,
  },
];
