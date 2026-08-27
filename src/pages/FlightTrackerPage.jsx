import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Search, Plane, Clock, Navigation, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Ensure CSS is imported

// Fix Leaflet Default Icon Issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Plane Icon
const planeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7893/7893979.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'plane-marker'
});

// Component to recenter map
const MapRecenter = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 6, { duration: 1.5 });
        }
    }, [lat, lng, map]);
    return null;
};

const FlightTrackerPage = () => {
    const [flightNumber, setFlightNumber] = useState('');
    const [flightData, setFlightData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_KEY = import.meta.env.VITE_AVIATION_STACK_API_KEY;

    const fetchFlightData = async (e) => {
        if (e) e.preventDefault();
        if (!flightNumber.trim()) return;

        setLoading(true);
        setError(null);
        setFlightData(null);

        if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
            setError('The tracker needs an Aviation Stack API key. Add VITE_AVIATION_STACK_API_KEY to your .env file and restart the app.');
            setLoading(false);
            return;
        }

        try {
            // Updated to HTTPS for better browser compatibility.
            // NOTE: If using a free plan that ONLY supports HTTP, this might need a proxy or fallback.
            const response = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${API_KEY}&flight_iata=${flightNumber}`);

            if (response.status === 401) {
                throw new Error('The Aviation Stack API key was rejected. Check the key in your .env file.');
            }

            if (!response.ok) {
                throw new Error(`The flight service returned an error (${response.status}). Wait a minute and try again — free plans have a small request limit.`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'The flight service returned an error. Try again in a moment.');
            }

            if (data.data && data.data.length > 0) {
                // Find the active flight or the most recent one
                const activeFlight = data.data.find(f => f.flight_status === 'active') || data.data[0];
                setFlightData(activeFlight);
            } else {
                setError('No flight found for that number. Use the airline code plus number, like AI302 or 6E204.');
            }
        } catch (err) {
            console.error("Error fetching flight:", err);
            setError(err.message || 'Could not reach the flight service. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusChip = (status) => {
        if (status === 'active') return 'bg-saffron/15 text-saffron border border-saffron/30';
        if (status === 'scheduled') return 'bg-white/[0.05] text-ivory-muted border border-white/[0.09]';
        return 'bg-white/[0.04] text-ivory-faint border border-white/[0.07]';
    };

    return (
        <div className="min-h-screen bg-ink-950 font-sans text-ivory pb-24">
            {/* ======================= HERO ======================= */}
            <div className="relative h-screen px-6 overflow-hidden flex flex-col justify-center items-center bg-ink-950">
                {/* Video backdrop */}
                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute top-1/2 left-1/2 w-[177.77vh] h-[100vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover scale-110 pointer-events-none opacity-60"
                    >
                        <source src="https://res.cloudinary.com/dnmhqosoa/video/upload/v1772188206/bgvideo_rzovxb.mp4" type="video/mp4" />
                    </video>
                    {/* Ink scrims for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/35 to-ink-950" />
                    <div className="absolute inset-0 bg-ink-950/30" />
                </div>

                <div className="max-w-6xl mx-auto text-center relative z-10 w-full px-4">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="flex items-center justify-center gap-3 mb-8"
                    >
                        <span className="route-line w-12 hidden sm:inline-block" />
                        <span className="route-dot animate-pulse" />
                        <span className="eyebrow">Live flight telemetry</span>
                        <span className="route-dot animate-pulse" />
                        <span className="route-line w-12 hidden sm:inline-block" />
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="font-display text-5xl sm:text-6xl md:text-[5.5rem] font-light tracking-tight leading-[1.02] text-ivory mb-7"
                    >
                        Follow your flight{' '}
                        <em className="italic font-medium text-saffron-bright">across the sky</em>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.35 }}
                        className="text-base md:text-lg text-ivory-muted max-w-xl mx-auto leading-relaxed"
                    >
                        Live position, altitude, and speed for any flight — enter a flight number below to put it on the map.
                    </motion.p>
                </div>

                {/* Scroll cue */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-40" aria-hidden="true">
                    <div className="w-px h-12 bg-gradient-to-b from-saffron to-transparent" />
                </div>
            </div>

            {/* ======================= SEARCH ======================= */}
            <div className="bg-ink-900 border-y border-white/[0.06] relative z-30 py-20">
                <div className="max-w-2xl mx-auto px-6">
                    <p className="eyebrow-muted text-center mb-6">Enter a flight number</p>
                    <form onSubmit={fetchFlightData} className="relative group">
                        <div className="relative flex items-center">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-ivory-faint group-focus-within:text-saffron transition-colors" />
                            </div>
                            <input
                                type="text"
                                value={flightNumber}
                                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                                placeholder="Flight number, e.g. AI302"
                                aria-label="Flight number"
                                className="glass-input w-full !rounded-full pl-14 pr-36 py-5 font-data text-lg tracking-[0.08em] uppercase"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="absolute right-2 top-2 bottom-2 btn-primary !py-0 !px-8 !rounded-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" aria-label="Searching" /> : 'Track'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            role="alert"
                            className="mt-8 flex items-start justify-center gap-3 text-red-300 bg-red-500/[0.08] px-6 py-4 rounded-2xl border border-red-400/20"
                        >
                            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
                            <span className="text-sm leading-relaxed">{error}</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ======================= FLIGHT DASHBOARD ======================= */}
            <div className="max-w-7xl mx-auto px-6 relative z-20 mt-16">
                <AnimatePresence>
                    {flightData && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", damping: 20 }}
                            className="bg-ink-900 rounded-3xl border border-white/[0.07] overflow-hidden mb-24 shadow-2xl"
                        >
                            {/* Header: Route Info */}
                            <div className="border-b border-white/[0.06] p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                        <div className="bg-saffron text-ink-950 px-4 py-1.5 rounded-lg font-data text-base font-semibold tracking-[0.08em]">
                                            {flightData.flight?.iata || flightNumber}
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-lg font-data text-[10px] uppercase tracking-[0.2em] ${statusChip(flightData.flight_status)}`}>
                                            {flightData.flight_status}
                                        </div>
                                    </div>
                                    <h2 className="font-display text-3xl md:text-4xl font-medium text-ivory mb-2">
                                        {flightData.airline?.name}
                                    </h2>
                                    <p className="text-ivory-faint text-sm flex items-center justify-center md:justify-start gap-2.5">
                                        <span className="route-dot animate-pulse" />
                                        Live data from Aviation Stack
                                    </p>
                                </div>

                                <div className="flex items-center gap-8 md:gap-14 bg-ink-800 p-6 md:p-8 rounded-2xl border border-white/[0.07]">
                                    <div className="text-center">
                                        <div className="font-data text-4xl md:text-5xl font-medium text-ivory tracking-tight">
                                            {flightData.departure?.iata}
                                        </div>
                                        <div className="font-data text-[10px] text-saffron/80 uppercase tracking-[0.3em] mt-2">Departure</div>
                                        <div className="font-data text-lg text-ivory-muted mt-2 tabular-nums">
                                            {new Date(flightData.departure?.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 3 }}
                                            className="w-28 md:w-40 route-line relative mb-4"
                                        >
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink-900 p-2 border border-saffron/35 rounded-full">
                                                <Plane className="w-5 h-5 text-saffron rotate-90" />
                                            </div>
                                        </motion.div>
                                        <div className="font-data text-[10px] text-ivory-faint uppercase tracking-[0.16em]">Non-stop</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="font-data text-4xl md:text-5xl font-medium text-ivory tracking-tight">
                                            {flightData.arrival?.iata}
                                        </div>
                                        <div className="font-data text-[10px] text-saffron/80 uppercase tracking-[0.3em] mt-2">Arrival</div>
                                        <div className="font-data text-lg text-ivory-muted mt-2 tabular-nums">
                                            {new Date(flightData.arrival?.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Grid: Map + Details */}
                            <div className="grid grid-cols-1 lg:grid-cols-3">
                                {/* Map Section - Spans 2 cols */}
                                <div className="lg:col-span-2 h-[650px] bg-ink-950 relative z-0">
                                    {/* MAP CONTAINER */}
                                    {(flightData.live || (flightData.departure?.latitude)) ? (
                                        <MapContainer
                                            center={[
                                                flightData.live?.latitude || flightData.departure.latitude || 20,
                                                flightData.live?.longitude || flightData.departure.longitude || 0
                                            ]}
                                            zoom={5}
                                            className="w-full h-full z-0"
                                            scrollWheelZoom={false}
                                            attributionControl={false}
                                        >
                                            <TileLayer
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            />

                                            {/* Live Plane Marker */}
                                            {flightData.live && (
                                                <Marker position={[flightData.live.latitude, flightData.live.longitude]} icon={planeIcon}>
                                                    <Popup>
                                                        <div className="font-data font-semibold flex items-center gap-2">
                                                            <span className="route-dot animate-pulse" />
                                                            {flightData.flight?.iata}
                                                        </div>
                                                        <div className="font-data text-xs mt-1">
                                                            <div>Alt {Math.round(flightData.live.altitude * 3.28084).toLocaleString()} ft</div>
                                                            <div>Spd {Math.round(flightData.live.speed_horizontal * 0.539957)} kts</div>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            )}

                                            {/* Origin Marker */}
                                            {flightData.departure?.latitude && (
                                                <Marker position={[Number(flightData.departure.latitude), Number(flightData.departure.longitude)]}>
                                                    <Popup>Departure: {flightData.departure.airport}</Popup>
                                                </Marker>
                                            )}

                                            {/* Destination Marker */}
                                            {flightData.arrival?.latitude && (
                                                <Marker position={[Number(flightData.arrival.latitude), Number(flightData.arrival.longitude)]}>
                                                    <Popup>Arrival: {flightData.arrival.airport}</Popup>
                                                </Marker>
                                            )}

                                            {/* Path Line */}
                                            {flightData.departure?.latitude && flightData.arrival?.latitude && (
                                                <Polyline
                                                    positions={[
                                                        [Number(flightData.departure.latitude), Number(flightData.departure.longitude)],
                                                        [Number(flightData.arrival.latitude), Number(flightData.arrival.longitude)]
                                                    ]}
                                                    color="#E8A33D"
                                                    weight={3}
                                                    dashArray="12, 12"
                                                    opacity={0.7}
                                                />
                                            )}

                                            <MapRecenter lat={flightData.live?.latitude || flightData.departure?.latitude} lng={flightData.live?.longitude || flightData.departure?.longitude} />
                                        </MapContainer>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-ink-950">
                                            <div className="text-center">
                                                <MapPin className="w-14 h-14 mx-auto mb-4 text-ivory-faint opacity-40" />
                                                <p className="text-ivory-muted text-sm">No live position for this flight yet — map data appears once the aircraft is airborne.</p>
                                            </div>
                                        </div>
                                    )}
                                    {/* Map Data Badge */}
                                    <div className="absolute bottom-6 left-6 z-10 glass-panel !rounded-full px-4 py-2 pointer-events-none">
                                        <div className="flex items-center gap-2.5 font-data text-[10px] tracking-[0.2em] text-ivory/80 uppercase">
                                            <span className="route-dot animate-pulse" />
                                            Live telemetry
                                        </div>
                                    </div>
                                </div>

                                {/* Details Panel */}
                                <div className="bg-ink-900 p-8 md:p-10 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col justify-between">
                                    <div>
                                        <h3 className="eyebrow-muted mb-10">Telemetry</h3>

                                        <div className="space-y-10">
                                            <div className="flex items-start gap-5">
                                                <div className="p-3.5 bg-ink-800 border border-white/[0.07] text-saffron rounded-2xl">
                                                    <Navigation className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-data text-[10px] text-ivory-faint uppercase tracking-[0.16em] mb-1.5">Altitude</div>
                                                    <div className="font-data text-3xl md:text-4xl font-medium text-ivory leading-none tabular-nums">
                                                        {flightData.live?.altitude ? Math.round(flightData.live.altitude * 3.28084).toLocaleString() : '--'}{' '}
                                                        <span className="text-sm text-saffron uppercase">ft</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-5">
                                                <div className="p-3.5 bg-ink-800 border border-white/[0.07] text-saffron rounded-2xl">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-data text-[10px] text-ivory-faint uppercase tracking-[0.16em] mb-1.5">Ground speed</div>
                                                    <div className="font-data text-3xl md:text-4xl font-medium text-ivory leading-none tabular-nums">
                                                        {flightData.live?.speed_horizontal ? Math.round(flightData.live.speed_horizontal * 0.539957) : '--'}{' '}
                                                        <span className="text-sm text-saffron uppercase">kts</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-5">
                                                <div className="p-3.5 bg-ink-800 border border-white/[0.07] text-saffron rounded-2xl">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-data text-[10px] text-ivory-faint uppercase tracking-[0.16em] mb-1.5">Position</div>
                                                    <div className="font-data text-lg text-ivory tabular-nums">
                                                        {flightData.live?.latitude?.toFixed(4) || '---'} / {flightData.live?.longitude?.toFixed(4) || '---'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-14 p-6 bg-ink-800 rounded-2xl border border-white/[0.07]">
                                        <div className="flex items-center gap-2.5 mb-5">
                                            <span className="route-dot" />
                                            <h4 className="font-data text-ivory text-[11px] uppercase tracking-[0.16em]">Flight details</h4>
                                        </div>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex justify-between items-center bg-white/[0.03] px-4 py-2.5 rounded-lg border border-white/[0.05]">
                                                <span className="text-ivory-muted">Aircraft</span>
                                                <span className="font-data text-ivory">{flightData.aircraft?.iata || 'TBD'}</span>
                                            </li>
                                            <li className="flex justify-between items-center bg-white/[0.03] px-4 py-2.5 rounded-lg border border-white/[0.05]">
                                                <span className="text-ivory-muted">Terminal</span>
                                                <span className="font-data text-ivory">{flightData.departure?.terminal || '---'}</span>
                                            </li>
                                            <li className="flex justify-between items-center bg-white/[0.03] px-4 py-2.5 rounded-lg border border-white/[0.05]">
                                                <span className="text-ivory-muted">Gate</span>
                                                <span className="font-data text-ivory">{flightData.departure?.gate || '---'}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state — what the tracker does */}
                {!flightData && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4 mb-24">
                        {[
                            {
                                icon: Search,
                                code: 'STEP 01',
                                title: "Find a flight",
                                desc: "Enter an IATA flight number — the airline code plus the flight number, like AI302 for Air India or 6E204 for IndiGo."
                            },
                            {
                                icon: Navigation,
                                code: 'STEP 02',
                                title: "Watch it live",
                                desc: "Active flights appear on the map with their current position, altitude, and ground speed, updated from live telemetry."
                            },
                            {
                                icon: Clock,
                                code: 'STEP 03',
                                title: "Check the details",
                                desc: "Departure and arrival times, terminals, and gates — everything you need for a pickup at Delhi, Mumbai, or any airport."
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-60px" }}
                                transition={{ duration: 0.65, delay: idx * 0.1 }}
                                className="heritage-card p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <span className="w-11 h-11 rounded-xl bg-ink-950/60 border border-white/[0.09] flex items-center justify-center">
                                        <item.icon className="w-5 h-5 text-saffron" />
                                    </span>
                                    <span className="font-data text-[10px] tracking-[0.24em] text-ivory-faint uppercase">{item.code}</span>
                                </div>
                                <h3 className="font-display text-xl font-medium text-ivory mb-3">{item.title}</h3>
                                <p className="text-ivory-muted text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightTrackerPage;
