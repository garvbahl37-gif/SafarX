import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Plane, TrainFront, RefreshCw, AlertCircle } from 'lucide-react';
import JourneyStrip from '../components/tracker/JourneyStrip';

/**
 * Track a flight or a train.
 *
 * Two things changed here beyond the look. The Aviation Stack key used to sit
 * on a VITE_ variable, which Vite compiles into the client bundle — anyone
 * could read it out of devtools and spend the account's ten thousand monthly
 * calls. It is behind /api/flights now. And trains were not here at all,
 * though SafarX has had live running status from RailRadar for weeks; a
 * traveller waiting on something does not care which kind of vehicle it is.
 *
 * The page is built around the line between two points rather than a grid of
 * cards, because that is what the subject actually is.
 */

/* Changing this changes the hero. It is the one thing on this page I could
   not source: Pexels needs an API key, and Mixkit and Coverr both refuse
   hotlinking. Drop a Cloudinary URL here — the project's other backdrops all
   live in that account. */
const HERO_VIDEO =
  'https://res.cloudinary.com/dnmhqosoa/video/upload/v1772188206/bgvideo_rzovxb.mp4';

const EASE = [0.22, 1, 0.36, 1];

const MARKER = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
       <circle cx="9" cy="9" r="5" fill="#E5BE5C" stroke="#061412" stroke-width="3"/>
     </svg>`
  ),
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* Leaflet cannot know the container resized under it, and the panel appears
   after a search. Without this the tiles render as grey. */
const FitRoute = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (points.length >= 2) map.fitBounds(points, { padding: [48, 48] });
    else if (points.length === 1) map.setView(points[0], 6);
  }, [map, points]);
  return null;
};

const STATUS = {
  scheduled: { label: 'Scheduled', tone: 'text-ivory-muted' },
  active: { label: 'In the air', tone: 'text-horizon-bright' },
  landed: { label: 'Landed', tone: 'text-ivory-muted' },
  cancelled: { label: 'Cancelled', tone: 'text-danger-bright' },
  incident: { label: 'Incident', tone: 'text-danger-bright' },
  diverted: { label: 'Diverted', tone: 'text-saffron-bright' },
};

const TRAIN_STATUS = {
  'not-started': { label: 'Not departed yet', tone: 'text-ivory-muted' },
  running: { label: 'Running', tone: 'text-horizon-bright' },
  completed: { label: 'Journey complete', tone: 'text-ivory-muted' },
};

const FlightTrackerPage = () => {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState('flight');
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultRef = useRef(null);

  const placeholder = mode === 'flight' ? 'AI 302, 6E 2341, UK 995' : '12951, 12009, 22691';

  const track = useCallback(async (raw) => {
    const value = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
    if (!value) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (mode === 'flight') {
        const res = await fetch(`/api/flights/track?flight=${encodeURIComponent(value)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'That flight could not be found.');
        setResult({ kind: 'flight', flight: body.flights[0], alternates: body.flights.slice(1) });
      } else {
        const res = await fetch(`/api/trains/live?trainNo=${encodeURIComponent(value)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || 'That train could not be found.');
        setResult({ kind: 'train', train: body.data });
      }
    } catch (err) {
      setError(err.message || 'Nothing came back. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  /* Bring the answer into view; it lands below the fold on a laptop. */
  useEffect(() => {
    if (result || error) resultRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, [result, error, reduce]);

  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ivory pb-24">
      {/* ══════════ Hero ══════════ */}
      <header className="relative isolate flex min-h-[72vh] flex-col items-center justify-center overflow-hidden px-6">
        {!reduce && (
          <video
            autoPlay loop muted playsInline preload="auto" aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover brightness-[0.38] saturate-[1.1]"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-ink-950 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />
        <div className="absolute inset-x-0 top-[16%] bottom-[16%] bg-gradient-to-b from-transparent via-ink-950/45 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          className="relative z-10 w-full max-w-2xl pt-24 text-center [text-shadow:0_2px_20px_rgba(6,20,18,0.85)]"
        >
          <p className="mb-5 flex items-center justify-center gap-3">
            <span className="route-line w-10 hidden sm:inline-block" aria-hidden="true" />
            <span className="route-dot" aria-hidden="true" />
            <span className="eyebrow">Live tracker</span>
            <span className="route-dot" aria-hidden="true" />
            <span className="route-line w-10 hidden sm:inline-block" aria-hidden="true" />
          </p>

          <h1 className="font-display text-4xl font-light leading-[1.06] tracking-tight text-ivory sm:text-5xl">
            Somebody is waiting for this to land.
          </h1>
          <p className="mx-auto mt-4 max-w-md font-sans text-[15px] leading-relaxed text-ivory-muted">
            Flights and trains on one board — where it is now, how late it is
            running, and which gate or platform to stand at.
          </p>

          {/* Mode + search, one row on desktop */}
          <div className="mx-auto mt-8 max-w-xl">
            <div
              role="tablist"
              aria-label="What are you tracking"
              className="mx-auto mb-3 inline-flex rounded-full border border-white/[0.1] bg-ink-900/80 p-1 backdrop-blur"
            >
              {[
                { id: 'flight', label: 'Flight', Icon: Plane },
                { id: 'train', label: 'Train', Icon: TrainFront },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => { setMode(id); setResult(null); setError(null); setQuery(''); }}
                  className={`flex items-center gap-2 rounded-full px-5 py-2 font-sans text-[13.5px] transition-colors ${
                    mode === id
                      ? 'bg-saffron text-ink-950 font-semibold'
                      : 'text-ivory-muted hover:text-ivory'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); track(query); }}
              className="flex flex-col gap-2.5 sm:flex-row"
            >
              <label htmlFor="tracker-input" className="sr-only">
                {mode === 'flight' ? 'Flight number' : 'Train number'}
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory-faint" />
                <input
                  id="tracker-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  autoComplete="off"
                  className="search-field w-full pl-11 font-data tracking-[0.06em]"
                />
              </div>
              <button type="submit" disabled={loading || !query.trim()} className="btn-primary shrink-0">
                {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                {loading ? 'Looking' : 'Track'}
              </button>
            </form>
          </div>
        </motion.div>
      </header>

      {/* ══════════ Result ══════════ */}
      <main ref={resultRef} className="mx-auto w-full max-w-4xl scroll-mt-24 px-5 sm:px-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-5"
              role="alert"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-danger-bright" />
              <p className="font-sans text-[14px] text-ivory">{error}</p>
            </motion.div>
          )}

          {result?.kind === 'flight' && (
            <FlightResult key="flight" data={result.flight} />
          )}
          {result?.kind === 'train' && (
            <TrainResult key="train" data={result.train} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/* ── Flights ──────────────────────────────────────────────────────────── */

const FlightResult = ({ data }) => {
  const status = STATUS[data.status] || { label: data.status || 'Unknown', tone: 'text-ivory-muted' };
  const points = [];
  if (data.from.lat != null) points.push([data.from.lat, data.from.lng]);
  if (data.to.lat != null) points.push([data.to.lat, data.to.lng]);
  const live = data.live;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-5"
    >
      <JourneyStrip
        mode="flight"
        code={data.number}
        operator={data.airline?.name}
        statusLabel={status.label}
        statusTone={status.tone}
        delayMinutes={data.from.delayMinutes}
        from={{ code: data.from.iata, name: data.from.name, scheduled: data.from.scheduled, actual: data.from.actual, estimated: data.from.estimated, terminal: data.from.terminal, gate: data.from.gate }}
        to={{ code: data.to.iata, name: data.to.name, scheduled: data.to.scheduled, actual: data.to.actual, estimated: data.to.estimated, terminal: data.to.terminal, baggage: data.to.baggage }}
        progress={live?.progress ?? null}
        progressNote={
          live?.estimated
            ? `About ${Math.floor(live.minutesRemaining / 60)}h ${live.minutesRemaining % 60}m left — worked out from the timetable, not radar.`
            : live
              ? `${Math.round(live.altitude)} m · ${Math.round(live.speed)} km/h`
              : null
        }
      />

      {points.length >= 2 && (
        <div className="overflow-hidden rounded-[26px] border border-white/[0.08]">
          <MapContainer
            center={points[0]} zoom={4} scrollWheelZoom={false}
            style={{ height: 340, width: '100%', background: '#061412' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <Polyline positions={points} pathOptions={{ color: '#D4A843', weight: 1.5, dashArray: '5 7', opacity: 0.75 }} />
            {points.map((p, i) => <Marker key={i} position={p} icon={MARKER} />)}
            {live && <Marker position={[live.lat, live.lng]} icon={MARKER} />}
            <FitRoute points={points} />
          </MapContainer>
        </div>
      )}

      {data.aircraft && (
        <p className="font-sans text-[13px] text-ivory-faint">Aircraft {data.aircraft}</p>
      )}
    </motion.section>
  );
};

/* ── Trains ───────────────────────────────────────────────────────────── */

const TrainResult = ({ data }) => {
  const status = TRAIN_STATUS[data.status?.state] || { label: data.status?.state || 'Unknown', tone: 'text-ivory-muted' };

  /* Progress from the route: how many halts are behind it. Real, because
     RailRadar reports actual times per station. */
  const route = data.route || [];
  const done = route.filter((s) => s.actual).length;
  const progress = route.length > 1 ? done / route.length : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="space-y-5"
    >
      <JourneyStrip
        mode="train"
        code={data.number}
        operator={data.name}
        statusLabel={status.label}
        statusTone={status.tone}
        delayMinutes={data.status?.delayMinutes}
        from={{ code: data.from?.code, name: data.from?.name, scheduled: route[0]?.scheduled, actual: route[0]?.actual }}
        to={{ code: data.to?.code, name: data.to?.name, scheduled: route[route.length - 1]?.scheduled, actual: route[route.length - 1]?.actual }}
        progress={progress}
        progressNote={
          data.status?.at
            ? `Last reported at ${data.status.at}${data.status.next ? `, next stop ${data.status.next}` : ''}.`
            : null
        }
      />

      {route.length > 0 && <Halts route={route} />}

    </motion.section>
  );
};

/**
 * The stations, but only the ones anyone is looking for.
 *
 * RailRadar returns every station the train passes — 221 of them for a
 * Mumbai–Delhi Rajdhani, most of which it does not stop at and none of which
 * are flagged as halts. Printing all of them is a wall nobody reads. What a
 * person waiting actually wants is where it has just been and what is coming,
 * so that is what opens; the rest is one click away.
 */
const Halts = ({ route }) => {
  const [all, setAll] = useState(false);

  const lastPassed = route.reduce((acc, s, i) => (s.actual ? i : acc), -1);
  const shown = all
    ? route
    : (() => {
        /* Clamped at both ends so the window keeps its size. Without the
           upper clamp a train one stop from its destination showed three
           rows, because the slice ran off the end of the route. */
        const size = 8;
        const start = Math.min(
          Math.max(0, lastPassed - 2),
          Math.max(0, route.length - size)
        );
        const window = route.slice(start, start + size);
        /* Keep the two ends visible: they are the journey. */
        const withEnds = [route[0], ...window, route[route.length - 1]];
        return withEnds.filter((s, i, arr) => s && arr.indexOf(s) === i);
      })();

  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-ink-900/60 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="eyebrow">{all ? `All ${route.length} stations` : 'Where it is now'}</p>
        <button
          onClick={() => setAll((v) => !v)}
          className="font-sans text-[12.5px] text-saffron-bright transition-colors hover:text-saffron"
        >
          {all ? 'Show less' : `Show all ${route.length}`}
        </button>
      </div>

      <ol className={all ? 'max-h-[26rem] space-y-0 overflow-y-auto pr-1' : 'space-y-0'}>
        {shown.map((stop, i) => {
          const passed = Boolean(stop.actual);
          return (
            <li key={`${stop.code}-${i}`} className="flex items-baseline gap-3 py-2 sm:gap-4">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${passed ? 'bg-saffron' : 'bg-white/20'}`}
                aria-hidden="true"
              />
              <span className="w-14 shrink-0 font-data text-[12px] text-ivory-faint">{stop.code}</span>
              <span className={`flex-1 truncate font-sans text-[13.5px] ${passed ? 'text-ivory' : 'text-ivory-muted'}`}>
                {stop.name}
              </span>
              <span className="font-data text-[12.5px] text-ivory-faint">
                {stopClock(stop.actual || stop.scheduled)}
              </span>
              {stop.delayMinutes > 0 && (
                <span className="w-9 shrink-0 text-right font-data text-[11.5px] text-saffron-bright">
                  +{stop.delayMinutes}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* The API sends full ISO timestamps; a timetable shows a clock. */
const stopClock = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default FlightTrackerPage;
