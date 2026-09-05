/**
 * MapPage — "Local Insights".
 *
 * A full-height map application shell: live OpenStreetMap discovery through
 * Overpass, SafarX's own curated India content as toggleable overlays, real
 * OSRM routing, and a collapsible results panel that becomes a bottom sheet
 * on phones.
 *
 * Live data sources (all free, no keys):
 *   · Photon / Nominatim  — place search, via services/placesService
 *   · Overpass API        — nearby amenities
 *   · OSRM demo server    — driving distance, duration and geometry
 *   · CARTO / Esri / OpenTopoMap — base tiles
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Route as RouteIcon,
  Compass,
  MapPinned,
} from "lucide-react";

import MapShell from "../components/map/MapShell";
import SearchPanel from "../components/map/SearchPanel";
import NearbyCategories from "../components/map/NearbyCategories";
import ResultsPanel from "../components/map/ResultsPanel";
import PlaceSheet from "../components/map/PlaceSheet";
import LayerSwitcher from "../components/map/LayerSwitcher";
import RoutePanel from "../components/map/RoutePanel";
import MapControls from "../components/map/MapControls";
import { useOverpass } from "../components/map/useOverpass";
import { useOsrmRoute } from "../components/map/useOsrmRoute";
import { takeIntent, onIntent } from "../services/srishtiIntent";
import { CATEGORY_BY_ID, SAFARX_LAYERS } from "../components/map/categories";
import { SAFARX_POINTS_BY_LAYER } from "../components/map/safarxData";
import { GlassIconButton } from "../components/VirtualTour/ImmersiveChrome";
import {
  EASE,
  INDIA_CENTER,
  TILE_LAYERS,
  formatDistance,
  haversineKm,
  regionFor,
} from "../components/map/mapUtils";
import { placesService } from "../services/placesService";

const LAYER_COLOR = SAFARX_LAYERS.reduce((acc, layer) => {
  acc[layer.id] = layer.color;
  return acc;
}, {});

const MapPage = ({ onPageChange }) => {
  const reduce = useReducedMotion();
  const shellRef = useRef(null);
  const mapRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState({ center: INDIA_CENTER, zoom: 5, radius: 12000 });
  const [baseLayerId, setBaseLayerId] = useState("standard");
  const [overlays, setOverlays] = useState({ gems: true, heritage: true, vr: true });
  const [region, setRegion] = useState("all");

  const [activeCategory, setActiveCategory] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [searchPin, setSearchPin] = useState(null);

  const [routeStops, setRouteStops] = useState([]);
  const [routeOpen, setRouteOpen] = useState(false);

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const [panelOpen, setPanelOpen] = useState(true);

  /* Srishti has been asked how to get from one place to another. The stops
     arrive already resolved — she looks them up in the same gazetteer this
     page searches — so the route panel opens on them and the map frames both
     ends, rather than dropping the traveller on an empty map of India with
     the answer only spoken aloud. */
  useEffect(() => {
    const apply = (intent) => {
      if (intent?.type !== "route") return;
      const stops = (intent.payload?.stops || []).filter(
        (st) => Number.isFinite(st?.lat) && Number.isFinite(st?.lng)
      );
      if (stops.length < 2) return;
      setRouteStops(stops);
      setRouteOpen(true);
      setPanelOpen(true);
      setSheetOpen(false);
      const lat = stops.reduce((n, st) => n + st.lat, 0) / stops.length;
      const lng = stops.reduce((n, st) => n + st.lng, 0) / stops.length;
      const spread = Math.max(
        ...stops.map((st) => Math.abs(st.lat - lat) + Math.abs(st.lng - lng))
      );
      setView({
        center: [lat, lng],
        // Two stops a state apart need a different frame from two in one city.
        zoom: spread > 4 ? 5 : spread > 1.5 ? 6 : spread > 0.4 ? 8 : 10,
        radius: 12000,
      });
    };
    apply(takeIntent("route"));
    return onIntent(apply);
  }, []);
  const [layersOpen, setLayersOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const overpass = useOverpass();
  const route = useOsrmRoute(routeStops);

  useEffect(() => setMounted(true), []);

  /* ── Geolocation (silent, non-blocking) ─────────────────────────── */
  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation([position.coords.latitude, position.coords.longitude]),
      () => {},
      { timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  /* ── Fullscreen ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Leaflet needs a nudge whenever its box changes. */
  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.invalidateSize(), 260);
    return () => clearTimeout(timer);
  }, [isFullscreen, panelOpen, routeOpen, sheetExpanded]);

  /* ── Escape closes the topmost surface ──────────────────────────── */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      if (layersOpen) setLayersOpen(false);
      else if (sheetOpen) setSheetOpen(false);
      else if (routeOpen) setRouteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layersOpen, sheetOpen, routeOpen]);

  /* ── Map helpers ────────────────────────────────────────────────── */
  const flyTo = useCallback(
    (lat, lng, zoom) => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo([lat, lng], zoom ?? Math.max(map.getZoom(), 14), {
        duration: reduce ? 0 : 1.05,
      });
    },
    [reduce]
  );

  /* ── Curated overlay points ─────────────────────────────────────── */
  const curatedPoints = useMemo(() => {
    const list = [];
    for (const layer of SAFARX_LAYERS) {
      if (!overlays[layer.id]) continue;
      for (const point of SAFARX_POINTS_BY_LAYER[layer.id] || []) {
        if (region !== "all" && regionFor(point.lat, point.lng) !== region) continue;
        list.push({ ...point, color: LAYER_COLOR[layer.id] });
      }
    }
    return list;
  }, [overlays, region]);

  const curatedResults = useMemo(() => {
    const [lat, lng] = view.center;
    return curatedPoints
      .map((point) => ({
        ...point,
        distanceKm: haversineKm(lat, lng, point.lat, point.lng),
      }))
      .sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
      .slice(0, 40);
  }, [curatedPoints, view.center]);

  const results = activeCategory ? overpass.places : curatedResults;

  const mapPoints = useMemo(() => {
    const list = [...curatedPoints];
    if (activeCategory) list.push(...overpass.places);
    if (searchPin) list.push(searchPin);
    return list;
  }, [curatedPoints, activeCategory, overpass.places, searchPin]);

  /* ── Overpass ───────────────────────────────────────────────────── */
  const runCategory = useCallback(
    (categoryId, options) => {
      if (!categoryId) {
        setActiveCategory(null);
        overpass.reset();
        return;
      }
      setActiveCategory(categoryId);
      setSelected(null);
      setSheetOpen(false);
      overpass.search(categoryId, view.center, view.radius, options);
    },
    [overpass, view.center, view.radius]
  );

  /* True once the map has drifted meaningfully away from the last query. */
  const areaMoved = useMemo(() => {
    if (!activeCategory || !overpass.center) return false;
    const drift = haversineKm(
      view.center[0],
      view.center[1],
      overpass.center[0],
      overpass.center[1]
    );
    return (drift ?? 0) * 1000 > (overpass.radius || 3000) * 0.4;
  }, [activeCategory, overpass.center, overpass.radius, view.center]);

  /* ── Selection ──────────────────────────────────────────────────── */
  const selectPlace = useCallback(
    (place, options = {}) => {
      if (!place) return;
      setSelected(place);
      setSheetOpen(true);
      if (options.fly !== false) flyTo(place.lat, place.lng);
    },
    [flyTo]
  );

  const handleSearchSelect = useCallback(
    (option) => {
      const point = option.point || {
        id: `search-${option.key}`,
        source: "search",
        name: option.name,
        subtitle: option.subtitle,
        lat: option.lat,
        lng: option.lng,
        glyph: "flag",
        color: "#E5BE5C",
        categoryLabel: "Search result",
      };
      /* A curated point already has a marker unless its layer is switched off. */
      const alreadyOnMap = Boolean(option.point && overlays[option.point.layer]);
      setSearchPin(alreadyOnMap ? null : point);
      selectPlace(point, { fly: false });
      flyTo(point.lat, point.lng, 14);
      if (activeCategory) {
        overpass.search(activeCategory, [point.lat, point.lng], view.radius);
      }
    },
    [activeCategory, flyTo, overlays, overpass, selectPlace, view.radius]
  );

  /* ── Route ──────────────────────────────────────────────────────── */
  const routeIds = useMemo(() => routeStops.map((stop) => stop.id), [routeStops]);
  const hasLiveLocation = routeIds.includes("live-location");

  const addToRoute = useCallback((place) => {
    if (!place) return;
    setRouteOpen(true);
    setRouteStops((stops) =>
      stops.some((stop) => stop.id === place.id)
        ? stops.filter((stop) => stop.id !== place.id)
        : [
            ...stops,
            {
              id: place.id,
              name: place.name,
              lat: place.lat,
              lng: place.lng,
              categoryLabel: place.categoryLabel,
              subtitle: place.subtitle,
            },
          ]
    );
  }, []);

  const moveStop = useCallback((from, to) => {
    setRouteStops((stops) => {
      if (to < 0 || to >= stops.length) return stops;
      const next = [...stops];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const optimiseRoute = useCallback(() => {
    setRouteStops((stops) => {
      if (stops.length < 3) return stops;
      const ordered = [stops[0]];
      const remaining = stops.slice(1);
      while (remaining.length) {
        const current = ordered[ordered.length - 1];
        let bestIndex = 0;
        let bestDistance = Infinity;
        remaining.forEach((stop, index) => {
          const distance =
            haversineKm(current.lat, current.lng, stop.lat, stop.lng) ?? Infinity;
          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        });
        ordered.push(remaining[bestIndex]);
        remaining.splice(bestIndex, 1);
      }
      return ordered;
    });
  }, []);

  const startFromLocation = useCallback(() => {
    if (!userLocation) return;
    setRouteStops((stops) => [
      {
        id: "live-location",
        name: "Your location",
        lat: userLocation[0],
        lng: userLocation[1],
        categoryLabel: "Live location",
        isLive: true,
      },
      ...stops.filter((stop) => stop.id !== "live-location"),
    ]);
  }, [userLocation]);

  /**
   * Directions stay inside SafarX — no hand-off to Google Maps.
   * Routing from the user's location (when shared) to the chosen place,
   * with OSRM geometry and turn-by-turn steps rendered in the route panel.
   */
  const openDirections = useCallback(
    (place) => {
      if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;

      const destination = {
        id: place.id || `dest-${place.lat},${place.lng}`,
        name: place.name || "Selected place",
        lat: place.lat,
        lng: place.lng,
      };

      setRouteStops(
        userLocation
          ? [
              {
                id: "live-location",
                name: "My location",
                lat: userLocation[0],
                lng: userLocation[1],
              },
              destination,
            ]
          : [destination]
      );
      setRouteOpen(true);
      setSelected(null);
    },
    [userLocation]
  );

  /* Tapping the map while the planner is open drops a stop. */
  const handleMapClick = useCallback(
    async ({ lat, lng }) => {
      if (!routeOpen) {
        setSheetOpen(false);
        return;
      }
      const id = `pin-${lat.toFixed(5)}-${lng.toFixed(5)}`;
      setRouteStops((stops) =>
        stops.some((stop) => stop.id === id)
          ? stops
          : [...stops, { id, name: "Dropped pin", lat, lng, categoryLabel: "Map pin" }]
      );
      try {
        const label = await placesService.reverseGeocode(lat, lng);
        if (label && label !== "Unknown Location") {
          setRouteStops((stops) =>
            stops.map((stop) => (stop.id === id ? { ...stop, name: label } : stop))
          );
        }
      } catch {
        /* the coordinates alone are a perfectly good stop */
      }
    },
    [routeOpen]
  );

  /* ── Controls ───────────────────────────────────────────────────── */
  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = [position.coords.latitude, position.coords.longitude];
        setUserLocation(next);
        setLocating(false);
        flyTo(next[0], next[1], 14);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [flyTo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) shellRef.current?.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  }, []);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo(INDIA_CENTER, 5, { duration: reduce ? 0 : 1.1 });
  }, [reduce]);

  const openTour = useCallback(
    (point) => {
      const tour = point?.tour || point?.raw;
      if (tour) onPageChange?.("360tour", tour);
    },
    [onPageChange]
  );

  const openStory = useCallback(
    (point) => onPageChange?.("gems", point?.raw || null),
    [onPageChange]
  );

  /* ── Derived copy ───────────────────────────────────────────────── */
  const category = activeCategory ? CATEGORY_BY_ID[activeCategory] : null;
  const baseLayer = TILE_LAYERS.find((l) => l.id === baseLayerId) || TILE_LAYERS[0];
  const metaLine = activeCategory
    ? `${results.length} ${category?.label.toLowerCase()} · within ${formatDistance(
        (overpass.radius || view.radius) / 1000
      )} of centre`
    : `${results.length} SafarX places · nearest first`;

  const listProps = {
    places: results,
    status: activeCategory ? overpass.status : "ready",
    error: overpass.error,
    categoryId: activeCategory,
    radius: overpass.radius || view.radius,
    selectedId: selected?.id ?? null,
    hoveredId,
    routeIds,
    onSelect: selectPlace,
    onHover: setHoveredId,
    onAddToRoute: addToRoute,
    onDirections: openDirections,
    onRetry: () => runCategory(activeCategory, { force: true }),
    emptyTitle: "No layers switched on",
    emptyBody:
      "Turn a SafarX layer back on from the layers control, or pick a category above to pull live data for this area.",
  };

  if (!mounted) {
    return <div className="h-screen [height:100dvh] w-full bg-ink-950" aria-hidden="true" />;
  }

  return (
    <div
      ref={shellRef}
      className="relative w-full overflow-hidden bg-ink-950 h-screen [height:100dvh]"
    >
      {/* ── Map canvas. z-0 keeps every Leaflet pane inside one stacking
             context so the glass chrome always paints above it. ─────── */}
      <div className="absolute inset-0 z-0 [&_.leaflet-container]:!rounded-none [&_.leaflet-control-attribution]:!bg-ink-950/75 [&_.leaflet-control-attribution]:!px-2 [&_.leaflet-control-attribution]:!text-[9px] [&_.leaflet-control-attribution]:!text-ivory-faint [&_.leaflet-control-attribution_a]:!text-ivory-muted [&_.leaflet-popup-content-wrapper]:!rounded-2xl [&_.leaflet-popup-content-wrapper]:!border [&_.leaflet-popup-content-wrapper]:!border-white/10 [&_.leaflet-popup-content-wrapper]:!bg-ink-900/95 [&_.leaflet-popup-content-wrapper]:!shadow-2xl [&_.leaflet-popup-content]:!m-2.5 [&_.leaflet-popup-tip]:!bg-ink-900">
        <MapShell
          baseLayerId={baseLayerId}
          points={mapPoints}
          selectedId={selected?.id ?? null}
          hoveredId={hoveredId}
          onSelectPlace={selectPlace}
          onHoverPlace={setHoveredId}
          onMapReady={(map) => {
            mapRef.current = map;
          }}
          onViewChange={setView}
          onMapClick={handleMapClick}
          userLocation={userLocation}
          routeStops={routeStops}
          routeGeometry={route.geometry}
        />
      </div>

      {/* ── Desktop left column ───────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {panelOpen && (
          <Motion.aside
            key="panel"
            initial={reduce ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.32, ease: EASE }}
            aria-label="Local insights results"
            className="absolute bottom-4 left-4 top-[5.5rem] z-20 hidden w-[23rem] flex-col gap-2.5 md:flex"
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SearchPanel onSelect={handleSearchSelect} />
              </div>
              <GlassIconButton
                icon={PanelLeftClose}
                label="Collapse results panel"
                onClick={() => setPanelOpen(false)}
              />
            </div>

            <NearbyCategories activeId={activeCategory} onSelect={runCategory} />

            <ResultsPanel
              className="glass-panel min-h-0 flex-1 overflow-hidden"
              center={view.center}
              region={region}
              onRegionChange={setRegion}
              metaLine={metaLine}
              areaMoved={areaMoved}
              onSearchArea={() => runCategory(activeCategory)}
              listProps={listProps}
            />
          </Motion.aside>
        )}
      </AnimatePresence>

      {!panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          className="absolute left-4 top-[5.5rem] z-20 hidden items-center gap-2 rounded-full border border-white/[0.09] bg-ink-950/80 px-4 py-2.5 text-[13px] font-medium text-ivory backdrop-blur-xl transition-colors hover:border-saffron/35 md:inline-flex"
        >
          <PanelLeftOpen className="h-4 w-4 text-saffron" aria-hidden="true" />
          Local insights
          <span className="font-data text-[10px] tabular-nums text-ivory-faint">
            {results.length}
          </span>
        </button>
      )}

      {/* ── Desktop place detail — sits over the results column ────── */}
      <AnimatePresence>
        {sheetOpen && selected && (
          <PlaceSheet
            key="detail-desktop"
            place={selected}
            variant="side"
            className="absolute left-4 top-[10.75rem] z-30 hidden max-h-[calc(100%-13rem)] w-[23rem] md:flex"
            userLocation={userLocation}
            mapCenter={view.center}
            inRoute={routeIds.includes(selected.id)}
            onClose={() => setSheetOpen(false)}
            onAddToRoute={addToRoute}
            onDirections={openDirections}
            onOpenTour={openTour}
            onOpenStory={openStory}
          />
        )}
      </AnimatePresence>

      {/* ── Right-hand chrome ─────────────────────────────────────── */}
      <div
        className={`absolute top-[4.5rem] z-20 flex flex-col items-end gap-2 transition-[right] duration-300 md:top-[5.5rem] ${
          routeOpen ? "right-3 md:right-[22.5rem]" : "right-3 md:right-4"
        }`}
      >
        <GlassIconButton
          icon={RouteIcon}
          label="Route planner"
          active={routeOpen}
          pressed={routeOpen}
          onClick={() => setRouteOpen((open) => !open)}
        />
        <MapControls
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onLocate={locate}
          locating={locating}
          onToggleLayers={() => setLayersOpen((open) => !open)}
          layersOpen={layersOpen}
          onResetView={resetView}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
        <LayerSwitcher
          open={layersOpen}
          baseLayerId={baseLayerId}
          onBaseLayer={(id) => setBaseLayerId(id)}
          overlays={overlays}
          onToggleOverlay={(id) =>
            setOverlays((current) => ({ ...current, [id]: !current[id] }))
          }
        />
      </div>

      {/* ── Route planner ─────────────────────────────────────────── */}
      <AnimatePresence>
        {routeOpen && (
          <RoutePanel
            key="route"
            className="absolute inset-x-3 bottom-3 top-3 z-30 md:inset-x-auto md:bottom-4 md:right-4 md:top-[5.5rem] md:w-[21rem]"
            stops={routeStops}
            route={route}
            userLocation={userLocation}
            hasLiveLocation={hasLiveLocation}
            onClose={() => setRouteOpen(false)}
            onRemove={(id) =>
              setRouteStops((stops) => stops.filter((stop) => stop.id !== id))
            }
            onMove={moveStop}
            onClear={() => setRouteStops([])}
            onOptimize={optimiseRoute}
            onStartFromLocation={startFromLocation}
            onFocusStop={(stop) => flyTo(stop.lat, stop.lng, 15)}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile: search capsule + draggable bottom sheet ───────── */}
      <div className="absolute inset-x-3 top-3 z-20 md:hidden">
        <SearchPanel onSelect={handleSearchSelect} placeholder="Search across India" />
      </div>

      <Motion.section
        aria-label="Local insights results"
        initial={false}
        animate={{ height: sheetExpanded ? "72%" : "38%" }}
        transition={{ duration: reduce ? 0 : 0.34, ease: EASE }}
        className="absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-3xl border-t border-white/[0.09] bg-ink-900/95 backdrop-blur-xl md:hidden"
      >
        <Motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.3}
          onDragEnd={(_, info) => {
            if (info.offset.y < -40) setSheetExpanded(true);
            else if (info.offset.y > 40) setSheetExpanded(false);
          }}
          className="shrink-0 cursor-grab touch-none px-3 pb-1 pt-2.5 active:cursor-grabbing"
        >
          <button
            type="button"
            onClick={() => setSheetExpanded((open) => !open)}
            aria-expanded={sheetExpanded}
            aria-label={sheetExpanded ? "Collapse results" : "Expand results"}
            className="mx-auto block h-1 w-10 rounded-full bg-white/20"
          />
        </Motion.div>

        <div className="shrink-0 px-3 pb-2 pt-1">
          <NearbyCategories activeId={activeCategory} onSelect={runCategory} />
        </div>

        <ResultsPanel
          className="min-h-0 flex-1"
          center={view.center}
          region={region}
          onRegionChange={setRegion}
          metaLine={metaLine}
          areaMoved={areaMoved}
          onSearchArea={() => runCategory(activeCategory)}
          listProps={listProps}
          footer={
            <p className="shrink-0 border-t border-white/[0.07] px-3.5 py-2 font-data text-[8px] uppercase leading-relaxed tracking-[0.12em] text-ivory-faint">
              {baseLayer.attributionText}
            </p>
          }
        />
      </Motion.section>

      {/* ── Mobile place detail ───────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && selected && (
          <PlaceSheet
            key="detail-mobile"
            place={selected}
            variant="sheet"
            className="absolute inset-x-0 bottom-0 z-40 max-h-[82%] md:hidden"
            userLocation={userLocation}
            mapCenter={view.center}
            inRoute={routeIds.includes(selected.id)}
            onClose={() => setSheetOpen(false)}
            onAddToRoute={addToRoute}
            onDirections={openDirections}
            onOpenTour={openTour}
            onOpenStory={openStory}
          />
        )}
      </AnimatePresence>

      {/* ── Identity strip (desktop, bottom-centre) ───────────────── */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-white/[0.07] bg-ink-950/70 px-4 py-2 backdrop-blur-xl xl:flex">
        <Compass className="h-3.5 w-3.5 text-saffron" aria-hidden="true" />
        <span className="font-data text-[9px] uppercase tracking-[0.22em] text-ivory-faint">
          Local insights
        </span>
        <span className="route-line w-8" aria-hidden="true" />
        <MapPinned className="h-3.5 w-3.5 text-ivory-faint" aria-hidden="true" />
        <span className="font-data text-[9px] uppercase tracking-[0.22em] text-ivory-faint">
          OpenStreetMap · OSRM live
        </span>
      </div>
    </div>
  );
};

export default MapPage;
