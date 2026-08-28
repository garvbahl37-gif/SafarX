/**
 * RoutePanel — the multi-stop planner.
 *
 * Distances and durations are real: OSRM's public router returns the driving
 * geometry and per-leg costs, which we render in Space Grotesk. If OSRM is
 * unreachable we fall back to straight-line kilometres and say so.
 */

import React, { useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import {
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Wand2,
  MapPin,
  ListOrdered,
  Route as RouteIcon,
  Loader2,
} from "lucide-react";

import { StateNotice } from "../VirtualTour/ImmersiveChrome";
import { EASE, formatDistance, formatDuration, haversineKm } from "./mapUtils";

const Leg = ({ leg, fallbackKm }) => (
  <li className="flex items-center gap-2.5 py-1.5 pl-[1.15rem]">
    <span className="h-6 w-px bg-gradient-to-b from-saffron/40 to-saffron/10" aria-hidden="true" />
    <span className="font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
      {leg
        ? `${formatDistance(leg.distanceKm)} · ${formatDuration(leg.durationSec)}`
        : `${formatDistance(fallbackKm)} straight line`}
    </span>
  </li>
);

const RoutePanel = ({
  stops = [],
  route,
  userLocation = null,
  hasLiveLocation = false,
  onClose,
  onRemove,
  onMove,
  onClear,
  onOptimize,
  onStartFromLocation,
  onFocusStop,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const [showSteps, setShowSteps] = useState(false);

  // Flatten OSRM's per-leg steps into one readable list of directions.
  const directionSteps = (route?.legs || []).flatMap((leg, legIndex) =>
    (leg.steps || []).map((step, stepIndex) => ({
      ...step,
      key: `${legIndex}-${stepIndex}`,
      legIndex,
    }))
  );
  const hasSteps = directionSteps.length > 0;

  const straightTotal = stops.slice(1).reduce((sum, stop, index) => {
    const previous = stops[index];
    return sum + (haversineKm(previous.lat, previous.lng, stop.lat, stop.lng) || 0);
  }, 0);

  const totalDistance =
    route?.status === "ready" ? route.distanceKm : straightTotal || null;
  const totalDuration = route?.status === "ready" ? route.durationSec : null;

  return (
    <Motion.aside
      initial={reduce ? false : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{ duration: 0.32, ease: EASE }}
      aria-label="Route planner"
      className={`flex flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-ink-900/95 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <h2 className="flex items-center gap-2.5 font-data text-[10px] uppercase tracking-[0.2em] text-ivory">
          <span className="route-dot" aria-hidden="true" />
          Route planner
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close route planner"
          className="rounded-full p-1.5 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-ivory"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {stops.length > 0 && (
        <div className="border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ivory-faint">
              {stops.length} {stops.length === 1 ? "stop" : "stops"}
            </span>
            <span className="flex items-center gap-2 font-data text-[13px] tabular-nums text-saffron">
              {route?.status === "loading" && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-ivory-faint" aria-hidden="true" />
              )}
              {formatDistance(totalDistance) || "—"}
              {totalDuration && (
                <span className="text-ivory-muted">· {formatDuration(totalDuration)}</span>
              )}
            </span>
          </div>
          {route?.status === "error" && (
            <p className="mt-2 font-data text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ivory-faint">
              {route.error}
            </p>
          )}
          {route?.status === "ready" && (
            <p className="mt-2 font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
              Driving · via OSRM
            </p>
          )}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {stops.length === 0 ? (
          <div className="flex h-full items-center justify-center py-8">
            <StateNotice
              icon={RouteIcon}
              title="Build a trip"
              body="Add stops from the results list, from a place's detail sheet, or by tapping anywhere on the map."
            />
          </div>
        ) : (
          <ol className="space-y-0">
            {stops.map((stop, index) => {
              const leg = route?.legs?.[index - 1] || null;
              const fallbackKm =
                index > 0
                  ? haversineKm(
                      stops[index - 1].lat,
                      stops[index - 1].lng,
                      stop.lat,
                      stop.lng
                    )
                  : null;

              return (
                <li key={`${stop.id}-${index}`}>
                  {index > 0 && (
                    <ul>
                      <Leg leg={leg} fallbackKm={fallbackKm} />
                    </ul>
                  )}
                  <div
                    className={`flex items-start gap-2.5 rounded-2xl border p-2.5 transition-colors ${
                      stop.isLive
                        ? "border-saffron/30 bg-saffron/[0.07]"
                        : "border-white/[0.07] bg-ink-800/60 hover:border-saffron/25"
                    }`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-saffron font-data text-[10px] font-semibold text-ink-950">
                      {index === 0 ? "A" : index === stops.length - 1 ? "B" : index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => onFocusStop?.(stop)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-[13px] font-medium text-ivory">
                        {stop.name}
                      </span>
                      <span className="mt-0.5 block truncate font-data text-[9px] uppercase tracking-[0.14em] text-ivory-faint">
                        {stop.categoryLabel || stop.subtitle || "Stop"}
                      </span>
                    </button>

                    <span className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMove?.(index, index - 1)}
                        disabled={index === 0}
                        aria-label={`Move ${stop.name} earlier`}
                        className="rounded-full p-1 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-saffron disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove?.(index, index + 1)}
                        disabled={index === stops.length - 1}
                        aria-label={`Move ${stop.name} later`}
                        className="rounded-full p-1 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-saffron disabled:pointer-events-none disabled:opacity-25"
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove?.(stop.id)}
                        aria-label={`Remove ${stop.name} from route`}
                        className="rounded-full p-1 text-ivory-faint transition-colors hover:bg-white/[0.08] hover:text-ivory"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <footer className="shrink-0 space-y-2 border-t border-white/[0.07] px-4 py-3">
        {userLocation && !hasLiveLocation && (
          <button
            type="button"
            onClick={onStartFromLocation}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:border-saffron/35"
          >
            <MapPin className="h-4 w-4 text-saffron" aria-hidden="true" />
            Start from my location
          </button>
        )}

        {stops.length > 2 && (
          <button
            type="button"
            onClick={onOptimize}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.05] px-3 py-2.5 text-[13px] font-medium text-ivory transition-colors hover:border-saffron/35"
          >
            <Wand2 className="h-4 w-4 text-saffron" aria-hidden="true" />
            Reorder by nearest hop
          </button>
        )}

        {stops.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowSteps((v) => !v)}
              aria-expanded={showSteps}
              disabled={!hasSteps}
              className="btn-primary !flex !w-full !items-center !justify-center !gap-2 !py-2.5 !text-[13px] disabled:!opacity-40 disabled:!cursor-not-allowed"
            >
              <ListOrdered className="h-4 w-4" aria-hidden="true" />
              {showSteps ? "Hide directions" : "Show turn-by-turn"}
            </button>
            {/* Turn-by-turn, rendered in-app */}
            {showSteps && hasSteps && (
              <Motion.ol
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3, ease: EASE }}
                className="max-h-64 overflow-y-auto rounded-xl border border-white/[0.07] bg-ink-950/60 p-1"
              >
                {directionSteps.map((step, index) => (
                  <li
                    key={step.key}
                    className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-saffron/30 bg-saffron/10 font-data text-[10px] text-saffron tabular-nums">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] leading-snug text-ivory">
                        {step.instruction}
                      </span>
                      {step.distanceM > 0 && (
                        <span className="mt-0.5 block font-data text-[10px] uppercase tracking-[0.16em] text-ivory-faint tabular-nums">
                          {formatDistance(step.distanceM / 1000)}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </Motion.ol>
            )}

            <button
              type="button"
              onClick={onClear}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-[13px] font-medium text-ivory-muted transition-colors hover:bg-white/[0.07] hover:text-ivory"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Clear route
            </button>
          </>
        )}
      </footer>
    </Motion.aside>
  );
};

export default RoutePanel;
