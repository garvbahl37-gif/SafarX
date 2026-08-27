/**
 * Name → lucide component map.
 * `checklistGenerator.js` stays pure by storing icon NAMES as strings; this is
 * the one place that turns those names back into React components.
 */
import {
  Backpack,
  Binoculars,
  Briefcase,
  Car,
  CloudRain,
  Coffee,
  Compass,
  Droplets,
  FileText,
  HeartPulse,
  IdCard,
  Info,
  Landmark,
  Mountain,
  Plug,
  Shirt,
  Sparkles,
  Stamp,
  Sun,
  Thermometer,
  Wallet,
  Waves,
} from "lucide-react";

export const ICONS = {
  Backpack,
  Binoculars,
  Briefcase,
  Car,
  CloudRain,
  Coffee,
  Compass,
  Droplets,
  FileText,
  HeartPulse,
  IdCard,
  Info,
  Landmark,
  Mountain,
  Plug,
  Shirt,
  Sparkles,
  Stamp,
  Sun,
  Thermometer,
  Wallet,
  Waves,
};

/** Resolve an icon name to a component, falling back to a neutral glyph. */
export function getIcon(name) {
  return ICONS[name] || Sparkles;
}
