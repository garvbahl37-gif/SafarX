/**
 * A line from Srishti to whichever 360° tour is open on screen.
 *
 * Most tours were shot from more than one spot — nine caves at Ellora, seven
 * points along the Varanasi ghats — and she should be able to move someone
 * between them the way a guide would: "let me take you to the charbagh".
 *
 * This is a request with a reply, which is why it is not the intent store.
 * An intent is dropped off for a page to collect when it mounts; this needs
 * an answer straight back — did it work, where are we now, what else is
 * there — so she never says she has moved somewhere she has not. Only the
 * viewer knows that: which tour is open, and which views it actually has,
 * including live street captures that are only found once it loads.
 */

let controller = null;

/**
 * The open viewer registers itself. Returns an unregister function, which
 * only clears the slot if it still holds this viewer — so a viewer unmounting
 * after a newer one has mounted cannot unhook the newer one.
 *
 * @param {(request: string) => object} fn
 */
export const registerVrViewer = (fn) => {
  controller = fn;
  return () => {
    if (controller === fn) controller = null;
  };
};

/** Asks the open tour to change view. Always returns a plain result object. */
export const commandVrView = (request) => {
  if (!controller) {
    return { unavailable: "No 360° tour is open on screen right now." };
  }
  try {
    return controller(request);
  } catch {
    return { unavailable: "The tour could not change view just then." };
  }
};

/* ── Working out which view was meant ─────────────────────────────────── */

const ORDINALS = {
  first: 0, "1st": 0,
  second: 1, "2nd": 1,
  third: 2, "3rd": 2,
  fourth: 3, "4th": 3,
  fifth: 4, "5th": 4,
  sixth: 5, "6th": 5,
  seventh: 6, "7th": 6,
  eighth: 7, "8th": 7,
  ninth: 8, "9th": 8,
  tenth: 9, "10th": 9,
  eleventh: 10, "11th": 10,
  twelfth: 11, "12th": 11,
};

const NEXT = new Set(["next", "another", "different", "other", "forward", "onward", "further", "ahead"]);
const PREV = new Set(["previous", "prev", "back", "before", "earlier", "backward", "backwards"]);
const LAST = new Set(["last", "final"]);

/* Words that say how to move rather than where to. Taken out before matching
   against view names, so "go back" is a direction while "looking back at the
   great gate" — which still has "looking", "great" and "gate" left — is a
   place. */
const DIRECTIONAL = new Set([...NEXT, ...PREV, ...LAST, ...Object.keys(ORDINALS)]);

const STOP = new Set([
  "the", "a", "an", "of", "to", "at", "in", "on", "by", "from", "for", "with",
  "and", "or", "is", "it", "its", "that", "this", "there", "here", "one", "ones",
  "view", "views", "spot", "spots", "angle", "vantage", "point", "position",
  "place", "number", "no", "please", "show", "me", "us", "take", "go", "move",
  "switch", "change", "see", "look", "can", "you", "let", "lets", "now", "then",
  "i", "want", "would", "like", "where", "which", "into", "inside", "outside",
]);

const words = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[—–-]/g, " ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/* "ghats" and "ghat", "caves" and "cave", "court" and "courtyard". */
const stem = (w) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
const sameWord = (a, b) => {
  const x = stem(a);
  const y = stem(b);
  if (x === y) return true;
  if (x.length >= 4 && y.length >= 4) return x.startsWith(y) || y.startsWith(x);
  return false;
};

/**
 * Which view does a free-text request mean?
 *
 * Tried in this order, because a view's own name is the strongest signal and
 * view names contain numbers and direction words of their own ("Cave 10",
 * "looking back at the great gate"):
 *
 *   1. a view named in the request
 *   2. a position given only as a number — "3", "view 3"
 *   3. a direction — next, previous, first, last, second, third…
 *
 * @param {string} request what she was asked for, in her words
 * @param {string[]} labels the open tour's views, in order
 * @param {number} current the index on screen now
 * @returns {{ index: number|null, by?: string }}
 */
export function resolveView(request, labels, current = 0) {
  const n = labels.length;
  if (!n) return { index: null };

  const q = words(request);
  const content = q.filter((w) => !STOP.has(w) && !DIRECTIONAL.has(w));
  const onlyNumbers = content.length > 0 && content.every((w) => /^\d+$/.test(w));

  // 1 — a view named in the request. Numbers count here, so "cave 3" finds
  //     "Cave 3", not the third view.
  if (content.length && !onlyNumbers) {
    const wanted = q.join(" ");
    let best = -1;
    let bestScore = 0;
    labels.forEach((label, i) => {
      const lw = words(label);
      if (lw.join(" ") === wanted) {
        best = i;
        bestScore = Infinity;
        return;
      }
      let score = 0;
      for (const w of content) if (lw.some((x) => sameWord(x, w))) score += 1;
      // A direction word that is also part of a name breaks a tie between two
      // otherwise equal names: "the second courtyard".
      for (const w of q) if (DIRECTIONAL.has(w) && lw.includes(w)) score += 0.5;
      if (score > bestScore) {
        best = i;
        bestScore = score;
      }
    });
    if (best >= 0) return { index: best, by: "name" };
  }

  // 2 — a bare position.
  if (onlyNumbers) {
    const i = Number(content[0]) - 1;
    return i >= 0 && i < n ? { index: i, by: "position" } : { index: null, outOfRange: true };
  }

  // 3 — a direction.
  if (q.some((w) => NEXT.has(w))) return { index: (current + 1) % n, by: "next" };
  if (q.some((w) => PREV.has(w))) return { index: (current - 1 + n) % n, by: "previous" };
  if (q.some((w) => LAST.has(w))) return { index: n - 1, by: "last" };
  for (const w of q) {
    if (w in ORDINALS) {
      const i = ORDINALS[w];
      return i < n ? { index: i, by: "ordinal" } : { index: null, outOfRange: true };
    }
  }

  return { index: null };
}
