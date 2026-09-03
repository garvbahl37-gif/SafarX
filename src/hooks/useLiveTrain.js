import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A train's running status, kept current.
 *
 * Two clocks run here. The server is asked for the truth rarely — RailRadar's
 * free plan allows about a thousand calls a month, so polling every minute
 * would exhaust it inside a day of one person watching — and the marker is
 * moved between those answers by working out where the train must be from the
 * times it has already reported. Infrequent truth, continuous honest
 * interpolation.
 *
 * On the data: RailRadar returns every station a train passes, and puts an
 * `actual` time only on its commercial halts — 8 for a Mumbai–Delhi Rajdhani,
 * 19 for a Vidarbha Express, out of 221 route rows. That field marks a halt,
 * not a station already visited; whether it has been visited is a question
 * about the clock, which is what this works out.
 */

/* Quota, not latency, sets this. The API caches for a minute of its own, so
   several people watching one train cost one call between them. */
const POLL_MS = 120_000;
/* The marker is redrawn from the clock this often. Costs nothing. */
const TICK_MS = 1000;

const time = (iso) => {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
};

/**
 * Where the train is along its route, 0–1, from the halts it has reported.
 *
 * @returns {{progress: number|null, lastHalt: object|null, nextHalt: object|null, betweenHalts: boolean}}
 */
export const positionFromRoute = (route, state, now = Date.now()) => {
  const empty = { progress: null, lastHalt: null, nextHalt: null, betweenHalts: false };
  if (!Array.isArray(route) || route.length < 2) return empty;

  /* Keep the index into the full route: halts are not evenly spaced along a
     journey, and pretending they are would move the marker at the wrong rate. */
  const halts = route
    .map((stop, index) => ({ ...stop, index }))
    .filter((stop) => stop.actual);
  if (!halts.length) return empty;

  if (state === 'completed') {
    return { progress: 1, lastHalt: halts[halts.length - 1], nextHalt: null, betweenHalts: false };
  }
  if (state === 'not-started') {
    return { progress: 0, lastHalt: null, nextHalt: halts[0], betweenHalts: false };
  }

  const span = route.length - 1;
  let last = null;
  let next = null;
  for (const halt of halts) {
    const t = time(halt.actual);
    if (t != null && t <= now) last = halt;
    else if (!next) next = halt;
  }

  if (!last) return { progress: 0, lastHalt: null, nextHalt: next || halts[0], betweenHalts: false };
  if (!next) return { progress: 1, lastHalt: last, nextHalt: null, betweenHalts: false };

  const from = time(last.actual);
  const to = time(next.actual);
  /* Without two usable times, sit on the last halt rather than invent motion. */
  if (from == null || to == null || to <= from) {
    return { progress: last.index / span, lastHalt: last, nextHalt: next, betweenHalts: false };
  }

  const t = Math.max(0, Math.min(1, (now - from) / (to - from)));
  const index = last.index + t * (next.index - last.index);
  return { progress: index / span, lastHalt: last, nextHalt: next, betweenHalts: true };
};

/** Only the stations the train actually stops at. */
export const haltsOf = (route) => (Array.isArray(route) ? route.filter((s) => s.actual) : []);

export const useLiveTrain = (trainNo) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  /* Bumped every second so the marker recomputes without a network call. */
  const [tick, setTick] = useState(0);
  const timerRef = useRef(null);

  const load = useCallback(async (signal) => {
    if (!trainNo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/trains/live?trainNo=${encodeURIComponent(trainNo)}`, { signal });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'That train could not be found.');
      setData(body.data);
      setError(null);
      setFetchedAt(Date.now());
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message || 'Could not reach the train feed.');
    } finally {
      setLoading(false);
    }
  }, [trainNo]);

  /* Fetch, then keep fetching — but only while the tab is in front, and only
     while the journey is still happening. A finished train is finished. */
  useEffect(() => {
    if (!trainNo) return undefined;
    const controller = new AbortController();
    load(controller.signal);

    const schedule = () => {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (document.visibilityState !== 'visible') return;
        load();
      }, POLL_MS);
    };
    schedule();

    /* Coming back to a tab that has been hidden for ten minutes should show
       something current, not a stale marker creeping along on old times. */
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      controller.abort();
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [trainNo, load]);

  /* Stop polling once there is nothing left to report. */
  useEffect(() => {
    if (data?.status?.state === 'completed') clearInterval(timerRef.current);
  }, [data]);

  /* The between-polls clock. Idle when the train is not moving. */
  useEffect(() => {
    const state = data?.status?.state;
    if (state !== 'running') return undefined;
    const id = setInterval(() => setTick((n) => n + 1), TICK_MS);
    return () => clearInterval(id);
  }, [data?.status?.state]);

  const position = data
    ? positionFromRoute(data.route, data.status?.state, Date.now())
    : { progress: null, lastHalt: null, nextHalt: null, betweenHalts: false };

  return {
    data,
    error,
    loading,
    fetchedAt,
    /* `tick` is read so the value recomputes on the clock, not just on fetch. */
    position: { ...position, tick },
    refresh: () => load(),
    isLive: data?.status?.state === 'running',
  };
};

export default useLiveTrain;
