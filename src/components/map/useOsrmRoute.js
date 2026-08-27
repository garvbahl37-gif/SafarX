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

    fetch(`${OSRM_BASE}/${path}?overview=full&geometries=geojson&steps=false`, {
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
