/**
 * useOsrmRoute — real driving distance, duration and geometry for the
 * multi-stop planner, from the free OSRM demo server.
 */

import { useEffect, useRef, useState } from "react";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";
const TIMEOUT_MS = 20000;
const MAX_STOPS = 12;

const EMPTY = {
  status: "idle", // idle | loading | ready | error
  geometry: null,
  legs: [],
  distanceKm: null,
  durationSec: null,
  error: null,
};


/**
 * OSRM returns a maneuver object, not a sentence. Build a readable
 * instruction from its type/modifier plus the road name.
 */
function describeStep(step) {
  const road = step?.name ? ` onto ${step.name}` : "";
  const type = step?.maneuver?.type;
  const mod = step?.maneuver?.modifier;

  if (type === "depart") return step?.name ? `Head out along ${step.name}` : "Start here";
  if (type === "arrive") return "Arrive at your stop";
  if (type === "roundabout" || type === "rotary") {
    const exit = step?.maneuver?.exit;
    return exit ? `Take exit ${exit} at the roundabout${road}` : `Enter the roundabout${road}`;
  }
  if (type === "merge") return `Merge${road}`;
  if (type === "fork") return `Keep ${mod || "straight"} at the fork${road}`;
  if (type === "on ramp") return `Take the ramp${road}`;
  if (type === "off ramp") return `Take the exit${road}`;
  if (type === "continue" || !mod) return step?.name ? `Continue on ${step.name}` : "Continue";
  if (mod === "straight") return `Continue straight${road}`;
  if (mod === "uturn") return "Make a U-turn";
  return `Turn ${mod}${road}`;
}

export function useOsrmRoute(stops) {
  const [state, setState] = useState(EMPTY);
  const abortRef = useRef(null);

  const key = stops
    .slice(0, MAX_STOPS)
    .map((s) => `${s.lat.toFixed(5)},${s.lng.toFixed(5)}`)
    .join(";");

  useEffect(() => {
    abortRef.current?.abort();

    const coordinates = key.split(";").filter(Boolean);
    if (coordinates.length < 2) {
      setState(EMPTY);
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    const path = coordinates
      .map((pair) => {
        const [lat, lng] = pair.split(",");
        return `${lng},${lat}`;
      })
      .join(";");

    fetch(`${OSRM_BASE}/${path}?overview=full&geometries=geojson&steps=true&annotations=false`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`osrm-${response.status}`);
        return response.json();
      })
      .then((json) => {
        const route = json?.routes?.[0];
        if (!route) throw new Error("osrm-no-route");
        setState({
          status: "ready",
          geometry: (route.geometry?.coordinates || []).map(([lng, lat]) => [lat, lng]),
          legs: (route.legs || []).map((leg) => ({
            distanceKm: leg.distance / 1000,
            durationSec: leg.duration,
            // Turn-by-turn, so directions never leave the app
            steps: (leg.steps || []).map((step) => ({
              instruction: describeStep(step),
              distanceM: step.distance,
              durationSec: step.duration,
              name: step.name || "",
              modifier: step.maneuver?.modifier || null,
              type: step.maneuver?.type || null,
            })),
          })),
          distanceKm: route.distance / 1000,
          durationSec: route.duration,
          error: null,
        });
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setState({
          ...EMPTY,
          status: "error",
          error: "OSRM could not draw this route — straight-line distances shown instead.",
        });
      })
      .finally(() => clearTimeout(timer));

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  return state;
}
