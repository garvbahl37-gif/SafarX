/**
 * MapShell — the Leaflet canvas.
 *
 * Owns tiles, markers, grid clustering and the route polyline. Every piece of
 * UI chrome lives outside this component so the map stays a pure surface.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  INDIA_CENTER,
  TILE_LAYERS,
  clusterByPixelGrid,
  formatCoords,
  formatDistance,
  viewRadiusMeters,
  GOLD,
} from "./mapUtils";
import {
  createClusterIcon,
  createPlaceIcon,
  createRouteStopIcon,
  createUserIcon,
} from "./markers";
import IndiaMask from "./IndiaMask";

/* Leaflet ships PNG marker paths that Vite cannot resolve — every marker on
   this page is a div-icon, so we simply neutralise the default. */
L.Icon.Default.mergeOptions({ iconUrl: "", iconRetinaUrl: "", shadowUrl: "" });

const USER_ICON = createUserIcon();

/* ── Bridge: hand the map instance up and report view changes ──────── */
function MapBridge({ onReady, onViewChange, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    onReady?.(map);
    onViewChange?.({
      center: [map.getCenter().lat, map.getCenter().lng],
      zoom: map.getZoom(),
      radius: viewRadiusMeters(map),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({
    moveend: () =>
      onViewChange?.({
        center: [map.getCenter().lat, map.getCenter().lng],
        zoom: map.getZoom(),
        radius: viewRadiusMeters(map),
      }),
    click: (event) => onMapClick?.({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });

  return null;
}

/* ── Grid clustering ───────────────────────────────────────────────── */
function ClusteredMarkers({ points, selectedId, hoveredId, onSelect, onHover }) {
  const map = useMap();
  const [, bump] = useState(0);
  const markerRefs = useRef(new Map());

  useMapEvents({
    zoomend: () => bump((n) => n + 1),
    moveend: () => bump((n) => n + 1),
  });

  /* The chosen marker may still be inside a cluster, or off-screen mid-flight,
     so poll briefly rather than giving up on the first miss. */
  useEffect(() => {
    if (!selectedId) return undefined;
    let timer = null;
    const tryOpen = (attempt = 0) => {
      const marker = markerRefs.current.get(selectedId);
      if (marker) {
        marker.openPopup();
        return;
      }
      if (attempt < 40) timer = window.setTimeout(() => tryOpen(attempt + 1), 60);
    };
    tryOpen();
    return () => window.clearTimeout(timer);
  }, [selectedId, points]);

  const bounds = map.getBounds().pad(0.4);
  const visible = points.filter((point) => bounds.contains([point.lat, point.lng]));
  const clusters = clusterByPixelGrid(
    visible,
    (lat, lng) => map.latLngToLayerPoint([lat, lng]),
    56
  );

  return (
    <>
      {clusters.map((cluster) => {
        /* A cluster holding the selected place always breaks apart. */
        const holdsSelected = cluster.points.some((p) => p.id === selectedId);

        if (cluster.count > 1 && !holdsSelected) {
          return (
            <Marker
              key={`cluster-${cluster.key}`}
              position={[cluster.lat, cluster.lng]}
              icon={createClusterIcon(cluster.count, cluster.points[0].color || GOLD)}
              keyboard={false}
              eventHandlers={{
                click: () => {
                  const group = L.latLngBounds(
                    cluster.points.map((p) => [p.lat, p.lng])
                  );
                  map.flyToBounds(group.pad(0.35), { duration: 0.6, maxZoom: 17 });
                },
              }}
            />
          );
        }

        return cluster.points.map((point) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            ref={(instance) => {
              if (instance) markerRefs.current.set(point.id, instance);
              else markerRefs.current.delete(point.id);
            }}
            icon={createPlaceIcon({
              glyph: point.glyph,
              color: point.color || GOLD,
              selected: point.id === selectedId,
              hovered: point.id === hoveredId,
            })}
            zIndexOffset={point.id === selectedId ? 1000 : 0}
            eventHandlers={{
              click: () => onSelect?.(point),
              mouseover: () => onHover?.(point.id),
              mouseout: () => onHover?.(null),
            }}
          >
            <Popup closeButton={false} autoPanPadding={[40, 60]}>
              <div className="min-w-[13rem] max-w-[16rem] p-1">
                <p className="font-data text-[9px] uppercase tracking-[0.2em] text-saffron">
                  {point.categoryLabel || "Place"}
                </p>
                <p className="mt-1.5 font-display text-base font-medium italic leading-tight text-ivory">
                  {point.name}
                </p>
                <p className="mt-1 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                  {formatCoords(point.lat, point.lng)}
                </p>
                {Number.isFinite(point.distanceKm) && (
                  <p className="mt-1 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-muted">
                    {formatDistance(point.distanceKm)} away
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onSelect?.(point, { openSheet: true })}
                  className="mt-3 w-full rounded-full border border-saffron/40 bg-saffron/15 px-3 py-1.5 font-data text-[10px] font-medium uppercase tracking-[0.16em] text-saffron transition-colors hover:bg-saffron/25"
                >
                  Open details
                </button>
              </div>
            </Popup>
          </Marker>
        ));
      })}
    </>
  );
}

/* ── The canvas ────────────────────────────────────────────────────── */
const MapShell = ({
  baseLayerId = "standard",
  points = [],
  selectedId = null,
  hoveredId = null,
  onSelectPlace,
  onHoverPlace,
  onMapReady,
  onViewChange,
  onMapClick,
  userLocation = null,
  routeStops = [],
  routeGeometry = null,
  indiaOnly = true,
}) => {
  const layer = TILE_LAYERS.find((l) => l.id === baseLayerId) || TILE_LAYERS[0];
  const straightLine =
    routeStops.length > 1 ? routeStops.map((stop) => [stop.lat, stop.lng]) : null;

  return (
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      maxBounds={[[5.5, 66.5], [37.5, 98.5]]}
      maxBoundsViscosity={0.85}
      zoomControl={false}
      preferCanvas
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        key={layer.id}
        url={layer.url}
        attribution={layer.attribution}
        maxZoom={layer.maxZoom}
        {...(layer.subdomains ? { subdomains: layer.subdomains } : {})}
        {...(layer.className ? { className: layer.className } : {})}
      />

      {/* Sits above the tiles so neighbouring countries fall back to ink */}
      <IndiaMask show={indiaOnly} />

      <MapBridge onReady={onMapReady} onViewChange={onViewChange} onMapClick={onMapClick} />

      {/* Straight-line hint while OSRM is still drawing the real thing */}
      {straightLine && !routeGeometry && (
        <Polyline
          positions={straightLine}
          pathOptions={{
            color: GOLD,
            weight: 1.5,
            opacity: 0.45,
            dashArray: "4 8",
          }}
        />
      )}

      {routeGeometry && routeGeometry.length > 1 && (
        <>
          <Polyline
            positions={routeGeometry}
            pathOptions={{ color: "#061412", weight: 9, opacity: 0.55 }}
          />
          <Polyline
            positions={routeGeometry}
            pathOptions={{ color: GOLD, weight: 3.5, opacity: 0.95, lineCap: "round" }}
          />
        </>
      )}

      {routeStops.map((stop, index) => (
        <Marker
          key={`stop-${stop.id}-${index}`}
          position={[stop.lat, stop.lng]}
          icon={createRouteStopIcon(index, index === routeStops.length - 1)}
          zIndexOffset={900}
          eventHandlers={{ click: () => onSelectPlace?.(stop) }}
        />
      ))}

      <ClusteredMarkers
        points={points}
        selectedId={selectedId}
        hoveredId={hoveredId}
        onSelect={onSelectPlace}
        onHover={onHoverPlace}
      />

      {userLocation && (
        <Marker position={userLocation} icon={USER_ICON} zIndexOffset={800}>
          <Popup closeButton={false}>
            <div className="p-1">
              <p className="font-data text-[10px] uppercase tracking-[0.2em] text-saffron">
                You are here
              </p>
              <p className="mt-1 font-data text-[10px] uppercase tracking-[0.14em] text-ivory-faint">
                {formatCoords(userLocation[0], userLocation[1])}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapShell;
