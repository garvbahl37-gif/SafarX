import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Custom Map Bounds Fitter
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [points, map]);
  return null;
};

// Create custom Amber Marker Icon
const createCustomIcon = (number, title) => {
  return L.divIcon({
    className: 'custom-journey-pin',
    html: `
      <div style="
        background: #0f172a;
        border: 2px solid #f59e0b;
        color: #f59e0b;
        font-weight: bold;
        font-size: 11px;
        font-family: sans-serif;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
      ">
        ${number}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export const JourneyMap = ({ photos }) => {
  const validPoints = photos.filter(p => p.lat && p.lng);
  const routeCoordinates = validPoints.map(p => [p.lat, p.lng]);

  const defaultCenter = validPoints.length
    ? [validPoints[0].lat, validPoints[0].lng]
    : [26.9124, 75.7873]; // Jaipur fallback

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={18} className="text-amber-500" />
          <h3 className="text-lg font-serif font-bold text-white">
            Journey Route Map
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {validPoints.length} Milestones Tracked
        </span>
      </div>

      <div className="h-[380px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          {/* Night/Dark Basemap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <FitBounds points={validPoints} />

          {/* Saffron Dashed Journey Route Line */}
          {routeCoordinates.length > 1 && (
            <Polyline
              positions={routeCoordinates}
              pathOptions={{
                color: '#f59e0b',
                weight: 3.5,
                dashArray: '8, 8',
                opacity: 0.85
              }}
            />
          )}

          {/* Interactive Landmark Pins */}
          {validPoints.map((point, index) => (
            <Marker
              key={point.id || index}
              position={[point.lat, point.lng]}
              icon={createCustomIcon(index + 1, point.location)}
            >
              <Popup className="custom-popup">
                <div className="p-1 max-w-[200px] text-slate-900">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Stop #{index + 1} • {point.day || 'Milestone'}
                  </div>
                  <div className="text-xs font-bold font-serif">{point.location}</div>
                  {point.caption && (
                    <div className="text-[11px] text-slate-600 italic mt-0.5">
                      "{point.caption}"
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
