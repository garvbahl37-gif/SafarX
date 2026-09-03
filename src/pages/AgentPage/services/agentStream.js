import { PLACES } from '../../../data/indiaPlaces';

/**
 * Talking to the agent, a token at a time.
 *
 * The panel used to await the whole reply and render it in one go, so the
 * eleven-to-twenty-three seconds the model took were eleven-to-twenty-three
 * seconds of nothing. The answer is written into the bubble as it arrives
 * instead, which does not make the model quicker but does mean there is
 * something to read after about a second and a half.
 */

/**
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} handlers
 * @param {() => void} [handlers.onThinking] the model is reasoning, no words yet
 * @param {(chunk: string, whole: string) => void} [handlers.onToken]
 * @param {AbortSignal} [handlers.signal] to stop generating
 * @returns {Promise<string>} the finished reply
 */
export const streamAgent = async (messages, { onThinking, onToken, signal } = {}) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    /* A failure here arrives as JSON, not as a stream. */
    const problem = await response.json().catch(() => ({}));
    throw new Error(problem.error || 'The agent could not answer that.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let whole = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    /* SSE frames are separated by a blank line; a chunk may end mid-frame. */
    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';

    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      let event;
      try {
        event = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (event.type === 'thinking') onThinking?.();
      else if (event.type === 'token') {
        whole += event.value;
        onToken?.(event.value, whole);
      } else if (event.type === 'error') throw new Error(event.message);
    }
  }

  return whole;
};

/* ── Photographs of the places actually named ─────────────────────────── */

/* Sorted longest-first so "Rann of Kutch" wins over "Kutch", and filtered to
   names long enough not to collide with ordinary words — there is a place
   called Bid, and matching it inside "bid farewell" would be worse than
   showing no picture at all. */
/* SafarX's place index is 126 cities and no monuments, so an answer about the
   Amber Fort matched nothing. These are the landmarks a travel agent actually
   talks about, each one checked against Wikipedia for a real summary
   photograph — a name that resolves to a disambiguation page or an article
   with no image is worse than no picture, so those were dropped rather than
   guessed at. Aliases point at the article title the lookup needs. */
const LANDMARKS = [
  'Taj Mahal', 'Amber Fort', 'Hawa Mahal', 'Amer Fort', 'Mehrangarh',
  'Umaid Bhawan Palace', 'Jaisalmer Fort', 'Qutb Minar', 'Red Fort', 'India Gate',
  "Humayun's Tomb", 'Lotus Temple', 'Gateway of India', 'Golden Temple',
  'Meenakshi Temple', 'Konark Sun Temple', 'Ajanta Caves', 'Hampi', 'Mysore Palace',
  'Howrah Bridge', 'Dal Lake', 'Basilica of Bom Jesus', 'Elephanta Caves',
  'Fatehpur Sikri', 'Agra Fort', 'Marina Beach', 'Charminar', 'Golconda Fort',
  'Sanchi', 'Rann of Kutch', 'Valley of Flowers National Park',
  'Kaziranga National Park', 'Ranthambore National Park', 'Jim Corbett National Park',
  'Periyar National Park',
].map((name) => ({ name }));

/* Where the phrase people write differs from the article's title. */
const ALIASES = {
  'city palace': 'City Palace, Udaipur',
  'jantar mantar': 'Jantar Mantar, Jaipur',
  'akshardham': 'Akshardham (Delhi)',
  'victoria memorial': 'Victoria Memorial, Kolkata',
  'khajuraho': 'Khajuraho Group of Monuments',
  'backwaters': 'Kerala backwaters',
};

/* Sorted longest-first so "Rann of Kutch" wins over "Kutch", and filtered to
   names long enough not to collide with ordinary words — there is a place
   called Bid, and matching it inside "bid farewell" would be worse than
   showing no picture at all. */
const MATCHABLE = [...LANDMARKS, ...PLACES, ...Object.entries(ALIASES).map(([k, v]) => ({ name: k, article: v }))]
  .filter((p) => p.name && p.name.length >= 5)
  .sort((a, b) => b.name.length - a.name.length);

const wikiCache = new Map();

/** One Wikipedia summary photo. Keyless, CORS-open, and actually of the place. */
const wikiPhoto = async (name) => {
  if (wikiCache.has(name)) return wikiCache.get(name);
  const request = (async () => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/ /g, '_'))}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      /* Disambiguation pages carry no photograph worth showing. */
      if (data.type === 'disambiguation') return null;
      const src = data.thumbnail?.source || data.originalimage?.source;
      if (!src) return null;
      return {
        name,
        title: data.title || name,
        summary: (data.extract || '').split('. ').slice(0, 2).join('. '),
        /* Exactly as given. Wikimedia only serves the thumbnail widths it has
           already rendered — rewriting 330px- to 640px- in the path looks
           reasonable and returns 400 for every image. */
        image: src,
        link: data.content_urls?.desktop?.page || null,
      };
    } catch {
      return null;
    }
  })();
  wikiCache.set(name, request);
  return request;
};

/**
 * The places a reply actually mentions, with a photograph each.
 *
 * Matched against SafarX's own index of Indian places rather than asking the
 * model to name them, so the pictures follow the text instead of being
 * decoration chosen separately from it.
 *
 * @param {string} text a finished assistant reply
 * @param {number} limit how many photographs at most
 */
export const placePhotos = async (text, limit = 3) => {
  if (!text) return [];
  const haystack = text.toLowerCase();
  const found = [];

  for (const place of MATCHABLE) {
    if (found.length >= limit * 2) break;
    const needle = place.name.toLowerCase();
    if (!haystack.includes(needle)) continue;
    // Whole words only: "Agra" should not match inside "Agrahara".
    const bounded = new RegExp(`(^|[^a-z])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i');
    if (!bounded.test(text)) continue;
    // Skip a place already covered by a longer name matched earlier.
    if (found.some((f) => f.name.toLowerCase().includes(needle))) continue;
    found.push(place);
  }

  const photos = await Promise.all(found.slice(0, limit).map((p) => wikiPhoto(p.article || p.name)));
  return photos.filter(Boolean);
};

export default streamAgent;
