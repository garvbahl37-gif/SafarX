/**
 * useOverpass — live "what's around me" data from the free Overpass API.
 *
 * Overpass rate-limits hard, so this hook is deliberately defensive:
 *   · an in-memory LRU cache keyed by (category, rounded centre, radius)
 *   · a global minimum gap between requests
 *   · one AbortController per request, aborted on category change / unmount
 *   · a hard client-side timeout, and honest messages for 429 / 504
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORY_BY_ID } from "./categories";
import { haversineKm, humanise, parseOpenNow } from "./mapUtils";

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const REQUEST_TIMEOUT_MS = 28000;
const MIN_GAP_MS = 1200;
const MAX_CACHE_ENTRIES = 40;
const MAX_RESULTS = 90;

/* Module-level so the cache survives panel remounts within a session. */
const cache = new Map();
let lastRequestAt = 0;

const cacheKey = (categoryId, lat, lng, radius) =>
  `${categoryId}|${lat.toFixed(2)}|${lng.toFixed(2)}|${Math.round(radius / 250)}`;

const readCache = (key) => {
  if (!cache.has(key)) return null;
  const value = cache.get(key);
  cache.delete(key);
  cache.set(key, value); // refresh recency
  return value;
};

const writeCache = (key, value) => {
  cache.set(key, value);
  while (cache.size > MAX_CACHE_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildQuery = (category, lat, lng, radius) => {
  const around = `(around:${Math.round(radius)},${lat.toFixed(5)},${lng.toFixed(5)})`;
  const body = category.filters.map((f) => f.replace("{{A}}", around)).join("\n  ");
  return `[out:json][timeout:25];\n(\n  ${body}\n);\nout center ${MAX_RESULTS};`;
};

const toPlace = (element, category) => {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const tags = element.tags || {};
  const fallback = humanise(category.labelFrom?.(tags)) || category.label;

  return {
    id: `osm-${element.type}-${element.id}`,
    source: "overpass",
    name: tags.name || tags["name:en"] || tags.brand || tags.operator || fallback,
    unnamed: !(tags.name || tags["name:en"] || tags.brand || tags.operator),
    lat,
    lng,
    tags,
    glyph: category.glyph,
    color: category.color,
    categoryId: category.id,
    categoryLabel: humanise(category.labelFrom?.(tags)) || category.label,
    openNow: parseOpenNow(tags.opening_hours),
  };
};

const dedupe = (places) => {
  const seen = new Set();
  return places.filter((place) => {
    const key = `${(place.name || "").toLowerCase()}|${place.lat.toFixed(4)}|${place.lng.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const describeFailure = (status) => {
  if (status === 429) return "Overpass is rate-limiting right now — try again in a moment.";
  if (status === 504 || status === 502) return "Overpass is busy — try again in a moment.";
  return "Overpass could not be reached. Check your connection and try again.";
};

export function useOverpass() {
  const [state, setState] = useState({
    status: "idle", // idle | loading | ready | error
    categoryId: null,
    places: [],
    error: null,
    center: null,
    radius: null,
    fromCache: false,
  });

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const cancel = useCallback(() => {
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      status: "idle",
      categoryId: null,
      places: [],
      error: null,
      center: null,
      radius: null,
      fromCache: false,
    });
  }, [cancel]);

  const search = useCallback(
    async (categoryId, center, radius, { force = false } = {}) => {
      const category = CATEGORY_BY_ID[categoryId];
      if (!category || !center) return;

      const [lat, lng] = center;
      const key = cacheKey(categoryId, lat, lng, radius);

      cancel();
      const requestId = requestIdRef.current;

      const cached = !force && readCache(key);
      if (cached) {
        setState({
          status: "ready",
          categoryId,
          places: cached,
          error: null,
          center,
          radius,
          fromCache: true,
        });
        return;
      }

      setState({
        status: "loading",
        categoryId,
        places: [],
        error: null,
        center,
        radius,
        fromCache: false,
      });

      const gap = MIN_GAP_MS - (Date.now() - lastRequestAt);
      if (gap > 0) await sleep(gap);
      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      const controller = new AbortController();
      abortRef.current = controller;
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      const query = buildQuery(category, lat, lng, radius);

      let lastStatus = 0;

      try {
        for (const endpoint of ENDPOINTS) {
          lastRequestAt = Date.now();
          let response;
          try {
            response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: `data=${encodeURIComponent(query)}`,
              signal: controller.signal,
            });
          } catch (networkError) {
            if (networkError?.name === "AbortError") throw networkError;
            lastStatus = 0;
            continue;
          }

          if (!response.ok) {
            lastStatus = response.status;
            continue;
          }

          const json = await response.json();
          if (!mountedRef.current || requestId !== requestIdRef.current) return;

          const places = dedupe(
            (json.elements || [])
              .map((element) => toPlace(element, category))
              .filter(Boolean)
          )
            .map((place) => ({
              ...place,
              distanceKm: haversineKm(lat, lng, place.lat, place.lng),
            }))
            .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
            .slice(0, MAX_RESULTS);

          writeCache(key, places);
          setState({
            status: "ready",
            categoryId,
            places,
            error: null,
            center,
            radius,
            fromCache: false,
          });
          return;
        }

        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setState({
          status: "error",
          categoryId,
          places: [],
          error: describeFailure(lastStatus),
          center,
          radius,
          fromCache: false,
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        if (!mountedRef.current || requestId !== requestIdRef.current) return;
        setState({
          status: "error",
          categoryId,
          places: [],
          error: describeFailure(lastStatus),
          center,
          radius,
          fromCache: false,
        });
      } finally {
        clearTimeout(timer);
      }
    },
    [cancel]
  );

  return { ...state, search, cancel, reset };
}
