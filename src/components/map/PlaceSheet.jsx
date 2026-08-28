/**
 * PlaceSheet — the detail surface for one place.
 * Side panel on desktop, draggable bottom sheet on mobile.
 */

import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  X,
  Plus,
  Check,
  CornerUpRight,
  Phone,
  Globe,
  Clock,
  MapPin,
  Play,
  BookOpen,
} from "lucide-react";

import { GlassButton } from "../VirtualTour/ImmersiveChrome";
import {
  EASE,
  addressFromTags,
  formatCoords,
  formatDistance,
  haversineKm,
  humanise,
  phoneFromTags,
  websiteFromTags,
} from "./mapUtils";
import { findSafarxLinks } from "./safarxData";

const Row = ({ icon: Icon, children }) => (
  <li className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ivory-muted">
    {Icon ? <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron/70" aria-hidden="true" /> : null}
    <span className="min-w-0 break-words">{children}</span>
  </li>
);

const PlaceSheet = ({
  place,
  variant = "side",
  userLocation = null,
  inRoute = false,
  onClose,
  onAddToRoute,
  onDirections,
  onOpenTour,
  onOpenStory,
  className = "",
}) => {
  const reduce = useReducedMotion();
  if (!place) return null;

  const tags = place.tags || {};
  const address = addressFromTags(tags) || place.subtitle || null;
  const phone = phoneFromTags(tags);
  const website = websiteFromTags(tags);
  const hours = tags.opening_hours || null;
  const cuisine = tags.cuisine ? humanise(tags.cuisine) : null;

  // Only measure from the user's real position. Measuring from the map centre
  // produced "10 m away" the moment the map flew to the place.
  const distanceKm = userLocation
    ? haversineKm(userLocation[0], userLocation[1], place.lat, place.lng)
    : place.distanceKm ?? null;

  const links = findSafarxLinks(place);
  const tour = place.layer === "vr" ? place : links.tour;
  const gem = place.layer === "gems" ? place : links.gem;

  const isSheet = variant === "sheet";

  const motionProps = reduce
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isSheet
      ? {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { duration: 0.36, ease: EASE },
          drag: "y",
          dragConstraints: { top: 0, bottom: 0 },
          dragElastic: { top: 0, bottom: 0.4 },
          onDragEnd: (_, info) => {
            if (info.offset.y > 110 || info.velocity.y > 600) onClose?.();
          },
        }
      : {
          initial: { opacity: 0, x: -18 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -18 },
          transition: { duration: 0.32, ease: EASE },
        };

  return (
    <Motion.aside
      {...motionProps}
      aria-label={`${place.name} details`}
      className={`flex flex-col overflow-hidden border border-white/[0.09] bg-ink-900/95 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
        isSheet ? "rounded-t-3xl" : "rounded-2xl"
      } ${className}`}
    >
      {isSheet && (
        <div className="flex justify-center pb-1 pt-2.5">
          <span className="h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />
        </div>
      )}

      {place.image && (
        <div className="relative h-40 shrink-0 overflow-hidden">
          <img
            src={place.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="route-dot" aria-hidden="true" />
            <span className="font-data text-[9px] uppercase tracking-[0.2em] text-saffron">
              {place.categoryLabel || "Place"}
            </span>
          </p>
          <h2 className="mt-1.5 font-display text-xl font-medium italic leading-tight text-ivory">
            {place.name}
          </h2>
          <p className="mt-1.5 font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint">
            {formatCoords(place.lat, place.lng)}
            {distanceKm ? ` · ${formatDistance(distanceKm)} away` : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close place details"
          className="shrink-0 rounded-full p-1.5 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-ivory"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {place.detail && (
          <p className="mb-3.5 text-[13px] leading-relaxed text-ivory-muted">{place.detail}</p>
        )}

        {/* Facts strip — always present, so places with thin OSM data still
            read as a designed panel rather than a gap. */}
        <dl className="mb-3.5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.05]">
          {[
            ["Latitude", place.lat?.toFixed(4)],
            ["Longitude", place.lng?.toFixed(4)],
            distanceKm
              ? ["From you", formatDistance(distanceKm)]
              : ["Region", place.subtitle?.split(",").pop()?.trim() || "India"],
            ["Type", place.categoryLabel || "Place"],
          ].map(([label, value]) => (
            <div key={label} className="bg-ink-900 px-3 py-2.5">
              <dt className="font-data text-[8.5px] uppercase tracking-[0.18em] text-ivory-faint">
                {label}
              </dt>
              <dd className="mt-1 truncate font-data text-[12px] tabular-nums text-ivory">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="space-y-2">
          {address && <Row icon={MapPin}>{address}</Row>}
          {hours && (
            <Row icon={Clock}>
              <span className="font-data text-[11px] uppercase tracking-[0.08em]">{hours}</span>
              {place.openNow === true && <span className="ml-2 text-saffron">· open now</span>}
              {place.openNow === false && <span className="ml-2 text-ivory-faint">· closed now</span>}
            </Row>
          )}
          {cuisine && <Row icon={MapPin}>{cuisine}</Row>}
          {phone && (
            <Row icon={Phone}>
              <a href={`tel:${phone}`} className="text-ivory hover:text-saffron">
                {phone}
              </a>
            </Row>
          )}
          {website && (
            <Row icon={Globe}>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-ivory hover:text-saffron"
              >
                {website.replace(/^https?:\/\//, "")}
              </a>
            </Row>
          )}
        </ul>

        {place.meta?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {place.meta.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {(tour || gem) && (
          <div className="mt-4 rounded-2xl border border-saffron/20 bg-saffron/[0.06] p-3">
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-saffron">
              On SafarX
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {tour && (
                <GlassButton
                  icon={Play}
                  tone="gold"
                  onClick={() => onOpenTour?.(tour)}
                  className="!px-3 !py-1.5 !text-[12px]"
                >
                  Open 360° tour
                </GlassButton>
              )}
              {gem && (
                <GlassButton
                  icon={BookOpen}
                  onClick={() => onOpenStory?.(gem)}
                  className="!px-3 !py-1.5 !text-[12px]"
                >
                  Read the story
                </GlassButton>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/[0.07] px-4 py-3">
        <button
          type="button"
          onClick={() => onAddToRoute?.(place)}
          aria-pressed={inRoute}
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-[13px] font-semibold transition-colors ${
            inRoute
              ? "border-saffron/45 bg-saffron/15 text-saffron"
              : "border-white/[0.09] bg-white/[0.05] text-ivory hover:border-saffron/35"
          }`}
        >
          {inRoute ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          {inRoute ? "On route" : "Add to route"}
        </button>
        <button
          type="button"
          onClick={() => onDirections?.(place)}
          className="btn-primary !flex !items-center !justify-center !gap-1.5 !px-3 !py-2.5 !text-[13px]"
        >
          <CornerUpRight className="h-4 w-4" aria-hidden="true" />
          Directions
        </button>
      </div>
    </Motion.aside>
  );
};

export default PlaceSheet;
