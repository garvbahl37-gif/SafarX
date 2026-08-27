/**
 * ResultsList — the left panel's result feed.
 *
 * Owns its own loading / empty / error states so the page shell stays thin,
 * and reports hover so the matching marker lights up on the map.
 */

import React from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { CornerUpRight, Plus, Check, SearchX, AlertTriangle } from "lucide-react";

import { CompassLoader, StateNotice } from "../VirtualTour/ImmersiveChrome";
import { CATEGORY_BY_ID } from "./categories";
import { EASE, formatDistance } from "./mapUtils";

const OpenBadge = ({ openNow }) => {
  if (openNow === null || openNow === undefined) return null;
  return (
    <span
      className={`font-data text-[9px] uppercase tracking-[0.16em] ${
        openNow ? "text-saffron" : "text-ivory-faint"
      }`}
    >
      {openNow ? "Open now" : "Closed now"}
    </span>
  );
};

const ResultsList = ({
  places = [],
  status = "idle",
  error = null,
  categoryId = null,
  radius = null,
  selectedId = null,
  hoveredId = null,
  routeIds = [],
  onSelect,
  onHover,
  onAddToRoute,
  onDirections,
  onRetry,
  emptyTitle = "Pick a category to explore",
  emptyBody = "Choose what you need nearby — food, a bed, an ATM, a station — and SafarX will pull live OpenStreetMap data for the area you are looking at.",
}) => {
  const reduce = useReducedMotion();
  const category = categoryId ? CATEGORY_BY_ID[categoryId] : null;

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center py-14">
        <CompassLoader
          label="Reading the neighbourhood"
          detail={category ? `Overpass · ${category.label}` : "Overpass"}
        />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <StateNotice
          icon={AlertTriangle}
          tone="error"
          title="Overpass is busy"
          body={error || "Overpass is busy — try again in a moment."}
          actionLabel="Try again"
          onAction={onRetry}
        />
      </div>
    );
  }

  if (status === "ready" && places.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <StateNotice
          icon={SearchX}
          title="Nothing mapped here yet"
          body={`OpenStreetMap has no ${
            category ? category.label.toLowerCase() : "results"
          } within ${radius ? Math.round(radius / 1000) : 5} km of this view. Pan somewhere denser, or zoom out and try again.`}
          actionLabel="Search again"
          onAction={onRetry}
        />
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <StateNotice title={emptyTitle} body={emptyBody} />
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 pb-4">
      {places.map((place, index) => {
        const inRoute = routeIds.includes(place.id);
        const isSelected = place.id === selectedId;
        const isHovered = place.id === hoveredId;

        return (
          <Motion.li
            key={place.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: Math.min(index * 0.02, 0.24), ease: EASE }}
          >
            <div
              onMouseEnter={() => onHover?.(place.id)}
              onMouseLeave={() => onHover?.(null)}
              className={`rounded-2xl border p-3 transition-colors ${
                isSelected
                  ? "border-saffron/45 bg-saffron/[0.07]"
                  : isHovered
                    ? "border-saffron/30 bg-white/[0.05]"
                    : "border-white/[0.07] bg-ink-800/60 hover:border-saffron/25"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect?.(place)}
                className="block w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-data text-[10px] tabular-nums"
                    style={{
                      borderColor: `${place.color || "#D4A843"}55`,
                      color: place.color || "#D4A843",
                      backgroundColor: `${place.color || "#D4A843"}14`,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-ivory">
                      {place.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className="rounded-full px-2 py-0.5 font-data text-[9px] uppercase tracking-[0.14em]"
                        style={{
                          color: place.color || "#D4A843",
                          backgroundColor: `${place.color || "#D4A843"}18`,
                        }}
                      >
                        {place.categoryLabel || "Place"}
                      </span>
                      <OpenBadge openNow={place.openNow} />
                    </span>
                  </span>

                  {formatDistance(place.distanceKm) && (
                    <span className="shrink-0 font-data text-[11px] uppercase tracking-[0.1em] text-ivory-muted">
                      {formatDistance(place.distanceKm)}
                    </span>
                  )}
                </div>
              </button>

              <div className="mt-2.5 flex items-center gap-2 pl-10">
                <button
                  type="button"
                  onClick={() => onDirections?.(place)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-2.5 py-1 font-data text-[9px] uppercase tracking-[0.14em] text-ivory-muted transition-colors hover:border-saffron/35 hover:text-ivory"
                >
                  <CornerUpRight className="h-3 w-3" aria-hidden="true" />
                  Directions
                </button>
                <button
                  type="button"
                  onClick={() => onAddToRoute?.(place)}
                  aria-pressed={inRoute}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-data text-[9px] uppercase tracking-[0.14em] transition-colors ${
                    inRoute
                      ? "border-saffron/45 bg-saffron/15 text-saffron"
                      : "border-white/[0.09] bg-white/[0.04] text-ivory-muted hover:border-saffron/35 hover:text-ivory"
                  }`}
                >
                  {inRoute ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <Plus className="h-3 w-3" aria-hidden="true" />
                  )}
                  {inRoute ? "On route" : "Add stop"}
                </button>
              </div>
            </div>
          </Motion.li>
        );
      })}
    </ul>
  );
};

export default ResultsList;
