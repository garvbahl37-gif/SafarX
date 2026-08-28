import React, { useMemo } from "react";
import { Polygon } from "react-leaflet";
import outline from "./indiaOutline.json";

/**
 * IndiaMask — dims everything outside India's border.
 *
 * Leaflet renders a polygon's second ring onward as holes, so a world-sized
 * rectangle with the India outline punched out of it leaves only India lit.
 * The outline is a simplified (~2.7k point, 41KB) render of the Survey of
 * India composite boundary; full resolution is 10MB and not worth bundling.
 */

// Leaflet wants [lat, lng]; GeoJSON stores [lng, lat].
const toLatLng = (ring) => ring.map(([lng, lat]) => [lat, lng]);

const WORLD = [
  [-89.9, -179.9],
  [-89.9, 179.9],
  [89.9, 179.9],
  [89.9, -179.9],
];

const IndiaMask = ({ show = true }) => {
  const positions = useMemo(
    () => [WORLD, ...outline.map(toLatLng)],
    []
  );
  const border = useMemo(() => outline.map(toLatLng), []);

  if (!show) return null;

  return (
    <>
      {/* Everything beyond the border falls back to the page ink */}
      <Polygon
        positions={positions}
        pathOptions={{
          fillColor: "#061412",
          fillOpacity: 0.88,
          color: "transparent",
          weight: 0,
          interactive: false,
        }}
      />
      {/* A gold hairline so the coastline still reads */}
      <Polygon
        positions={border}
        pathOptions={{
          fill: false,
          color: "#D4A843",
          weight: 1.2,
          opacity: 0.5,
          interactive: false,
        }}
      />
    </>
  );
};

export default IndiaMask;
