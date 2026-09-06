import React from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * The basemap under every map in SafarX.
 *
 * It used to be CARTO's dark_all, which was free and is not any more: every
 * tile now comes back stamped "API KEY REQUIRED" across the middle in white
 * letters. It still returns HTTP 200 and a valid PNG, which is why nothing
 * caught it — the map looked like it worked right up until you looked at it.
 *
 * OpenStreetMap's own tiles need no key and never will, but they are light,
 * and a light map in a dark app is worse than no map. So they are inverted in
 * CSS: invert plus a 180 degree hue rotation turns a light basemap dark while
 * leaving the colours the right way round, and the rest tunes it to the app's
 * ink and saffron rather than leaving it a flat grey.
 *
 * Attribution stays, because OSM's licence requires it and because the data is
 * somebody else's work.
 */
/* The darkening filter itself lives in index.css, on .sx-dark-tiles. */

const DarkTiles = () => (
  <TileLayer
    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    className="sx-dark-tiles"
    maxZoom={19}
  />
);


export default DarkTiles;
