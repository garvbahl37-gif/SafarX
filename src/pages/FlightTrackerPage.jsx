import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DarkTiles from '../components/map/DarkTiles';
import { Search, Plane, TrainFront, RefreshCw, AlertCircle } from 'lucide-react';
import JourneyStrip from '../components/tracker/JourneyStrip';
import { useLiveTrain, haltsOf } from '../hooks/useLiveTrain';

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

/* Looking down at the ground from altitude, through breaks in the cloud —
   which is the view this page is about. A cabin-window shot was the obvious
   alternative and the wrong one: the window surround reads as a black
   letterbox once the footage is stretched full-bleed, and a jet centred on a
   runway fights the hero type for the middle of the frame. This has no
   subject to compete with, and the land moving underneath is the same idea as
   the route drawn across the map below.

   1080p at 8.1MB rather than the 4K rendition at 36. */
const HERO_VIDEO =
  'https://videos.pexels.com/video-files/4070515/4070515-hd_1920_1080_30fps.mp4';

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
  const [errorHint, setErrorHint] = useState(null);
  const resultRef = useRef(null);

  /* One example, not three. The old placeholder offered "AI 302, 6E 2341,
     UK 995" and UK 995 is not scheduled most days — so the app suggested a
     flight number that returns nothing, and the map never appeared for anyone
     who took it at its word. */
  const placeholder = mode === 'flight' ? 'Flight number, e.g. AI302' : 'Train number, e.g. 12951';

  const track = useCallback(async (raw) => {
    const value = String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
    if (!value) return;
    setLoading(true);
    setError(null);
    setErrorHint(null);
    setResult(null);

    try {
      if (mode === 'flight') {
        const res = await fetch(`/api/flights/track?flight=${encodeURIComponent(value)}`);
        const body = await res.json();
        if (!res.ok) {
          /* The API explains WHY a real flight number can come back empty.
             Throwing away that hint left the page saying only that nothing was
             found, which reads as a fault in the app rather than an empty
             schedule. */
          const err = new Error(body.error || 'That flight could not be found.');
          err.hint = body.hint || null;
          throw err;
        }
        setResult({ kind: 'flight', flight: body.flights[0], alternates: body.flights.slice(1) });
      } else {
        /* The train view keeps itself current, so the page only has to
           hand it the number. */
        setResult({ kind: 'train', trainNo: value });
      }
    } catch (err) {
      setError(err.message || 'Nothing came back. Try again in a moment.');
      setErrorHint(err.hint || null);
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
              <div>
                <p className="font-sans text-[14px] text-ivory">{error}</p>
                {errorHint && (
                  <p className="mt-1.5 font-sans text-[13px] leading-relaxed text-ivory-muted">
                    {errorHint}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {result?.kind === 'flight' && (
            <FlightResult key="flight" data={result.flight} />
          )}
          {result?.kind === 'train' && (
            <TrainResult key="train" trainNo={result.trainNo} />
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
      {data.requestedAs && (
        /* Asked for one number, given another: Aviation Stack answers a
           codeshare with the operating carrier's flight. Saying so is the
           difference between a useful answer and an apparently wrong one. */
        <p className="font-sans text-[13px] text-ivory-muted">
          {data.requestedAs} is operated as {data.number}
          {data.airline?.name ? ` by ${data.airline.name}` : ''}.
        </p>
      )}

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
            <DarkTiles />
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

const TrainResult = ({ trainNo }) => {
  const { data, error, loading, fetchedAt, position, refresh, isLive } = useLiveTrain(trainNo);

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-5" role="alert">
        <AlertCircle size={17} className="mt-0.5 shrink-0 text-danger-bright" />
        <p className="font-sans text-[14px] text-ivory">{error}</p>
      </div>
    );
  }
  if (!data) {
    return <p className="font-sans text-[14px] text-ivory-muted">Finding {trainNo}…</p>;
  }

  const status = TRAIN_STATUS[data.status?.state] || {
    label: data.status?.state || 'Unknown', tone: 'text-ivory-muted',
  };
  const halts = haltsOf(data.route);

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
        from={{ code: data.from?.code, name: data.from?.name, scheduled: halts[0]?.scheduled, actual: halts[0]?.actual }}
        to={{
          code: data.to?.code, name: data.to?.name,
          scheduled: halts[halts.length - 1]?.scheduled,
          actual: halts[halts.length - 1]?.actual,
        }}
        progress={position.progress}
        /* Between halts the marker is moving on the clock, so say so rather
           than let a creeping dot imply a GPS fix. */
        continuous={position.betweenHalts}
        progressNote={
          position.betweenHalts && position.nextHalt
            ? `Left ${position.lastHalt?.name}, due into ${position.nextHalt.name} at ${stopClock(position.nextHalt.actual)}.`
            : data.status?.at
              ? `Last reported at ${data.status.at}${data.status.next ? `, next stop ${data.status.next}` : ''}.`
              : null
        }
      />

      <LiveBar isLive={isLive} fetchedAt={fetchedAt} loading={loading} onRefresh={refresh} />

      {halts.length > 0 && <Halts halts={halts} total={data.route?.length || 0} now={position.tick} />}
    </motion.section>
  );
};

/**
 * Whether what is on screen is current, and how current.
 *
 * A tracker that silently stops updating is worse than one that never
 * claimed to, so this says when it last heard anything and lets you ask
 * again. It counts up from the last answer rather than showing a clock time,
 * because "40 seconds ago" is the question being asked.
 */
const LiveBar = ({ isLive, fetchedAt, loading, onRefresh }) => {
  const reduce = useReducedMotion();
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const ago = fetchedAt ? Math.round((Date.now() - fetchedAt) / 1000) : null;
  const agoText = ago == null ? 'never' : ago < 60 ? `${ago}s ago` : `${Math.floor(ago / 60)} min ago`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-ink-900/50 px-5 py-3">
      <span className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          {isLive && !reduce && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-horizon-bright opacity-75" />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${isLive ? 'bg-horizon-bright' : 'bg-ivory-faint'}`} />
        </span>
        <span className="font-sans text-[13px] text-ivory-muted">
          {isLive ? 'Following live' : 'Not running right now'} · updated {agoText}
        </span>
      </span>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 font-sans text-[12.5px] text-saffron-bright transition-colors hover:text-saffron disabled:opacity-50"
      >
        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Checking' : 'Check now'}
      </button>
    </div>
  );
};

/**
 * The stations the train actually stops at.
 *
 * RailRadar returns every station on the line — 221 rows for a Mumbai–Delhi
 * Rajdhani — and puts an `actual` time only on the commercial halts, which is
 * eight of them. Earlier this list showed all 221 and treated that field as
 * proof a station had been passed; it is neither. Whether a halt is behind the
 * train is a question about the clock.
 */
const Halts = ({ halts, total }) => {
  const now = Date.now();
  return (
    <div className="rounded-[26px] border border-white/[0.08] bg-ink-900/60 p-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="eyebrow">Stops</p>
        {total > halts.length && (
          <p className="font-sans text-[12px] text-ivory-faint">
            {halts.length} of {total} stations on the line
          </p>
        )}
      </div>

      <ol className="max-h-[26rem] space-y-0 overflow-y-auto pr-1">
        {halts.map((stop, i) => {
          const at = stop.actual ? new Date(stop.actual).getTime() : null;
          const passed = at != null && at <= now;
          const moved = stop.actual && stop.scheduled && stop.actual !== stop.scheduled;
          return (
            <li key={`${stop.code}-${i}`} className="flex items-baseline gap-3 py-2.5 sm:gap-4">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${passed ? 'bg-saffron' : 'bg-white/20'}`}
                aria-hidden="true"
              />
              <span className="w-14 shrink-0 font-data text-[12px] text-ivory-faint">{stop.code}</span>
              <span className={`flex-1 truncate font-sans text-[13.5px] ${passed ? 'text-ivory' : 'text-ivory-muted'}`}>
                {stop.name}
              </span>
              <span className="flex items-baseline gap-2 font-data text-[12.5px]">
                {moved && <span className="text-ivory-faint line-through">{stopClock(stop.scheduled)}</span>}
                <span className={moved ? 'text-saffron-bright' : 'text-ivory-faint'}>
                  {stopClock(stop.actual || stop.scheduled)}
                </span>
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
