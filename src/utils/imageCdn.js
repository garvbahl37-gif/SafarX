/**
 * Wikimedia photographs, served through a caching image CDN.
 *
 * WHY THIS EXISTS. Hidden Gems shows ninety-six cards and the tour grid
 * thirty-four, every picture hotlinked straight from Wikimedia. That is the
 * exact pattern Wikimedia rate-limits: requesting twenty of them at once
 * returns 429 Too Many Requests on fifteen, with a real Chrome user-agent, and
 * a 429 fires the <img> onError handler. The gem cards fall back to a stock
 * photograph when that happens — which is why every gem on the page was
 * showing the Taj Mahal.
 *
 * It was slow for the same reason it was failing. `Special:FilePath` is a
 * MediaWiki application endpoint rather than a file: it redirects twice before
 * serving anything, 2.2 seconds cold with 1.5 of those before the first byte.
 * It also cannot be asked for a size — `?width=640` and `?width=800` both came
 * back as the 960px rendition, and `?width=1400` served the full 1920px at
 * 465KB for a card a few hundred pixels wide.
 *
 * wsrv.nl fetches each image once, caches it, and serves a resized WebP from
 * its own CDN. Twenty parallel requests all return 200, and a card image drops
 * from 246-595KB of JPEG to about 35KB of WebP. It also means we ask Wikimedia
 * for each photograph once rather than once per visitor, which is the polite
 * way to use somebody else's bandwidth.
 *
 * Anything that is not a Wikimedia URL passes through untouched: local assets
 * are already ours, and Unsplash does its own resizing through query
 * parameters we would otherwise throw away.
 */

/* Commons and the upload CDN, and the language Wikipedias too: one tour's
   thumbnail lives on en.wikipedia.org, which the earlier pattern missed, so it
   went on being hotlinked and rate-limited while everything else was fixed. */
const WIKIMEDIA =
  /^https?:\/\/([a-z-]+\.)?(m\.)?(wikimedia|wikipedia)\.org\//i;

/**
 * @param {string} url    the original image URL
 * @param {number} width  the widest this image is ever drawn, in CSS pixels
 * @returns {string} a URL to use as an <img src>
 */
export const cdnImage = (url, width = 640) => {
  if (!url || typeof url !== "string") return url;
  if (!WIKIMEDIA.test(url)) return url;

  // wsrv takes the source without its scheme, encoded so the source's own
  // query string does not terminate ours.
  const source = encodeURIComponent(url.replace(/^https?:\/\//i, ""));
  // Doubled for retina, capped: past about 1600 the file costs more than the
  // sharpness is worth on a card.
  const w = Math.min(Math.round(width * 2), 1600);
  return `https://wsrv.nl/?url=${source}&w=${w}&output=webp&q=76&we`;
};

/**
 * The same, for a picture that must fill a box of known shape rather than
 * simply be scaled. `fit=cover` crops to the ratio; `a=attention` picks what
 * to keep by looking for the busiest part of the frame, which for a portrait
 * photograph in a landscape card is a great deal better than taking the
 * middle and hoping.
 *
 * @param {number} ratio  width divided by height of the box being filled
 */
export const cdnImageCropped = (url, width = 640, ratio = 1.6) => {
  if (!url || typeof url !== "string") return url;
  if (!WIKIMEDIA.test(url)) return url;
  const source = encodeURIComponent(url.replace(/^https?:\/\//i, ""));
  const w = Math.min(Math.round(width * 2), 1600);
  const h = Math.round(w / ratio);
  return `https://wsrv.nl/?url=${source}&w=${w}&h=${h}&fit=cover&a=attention&output=webp&q=76&we`;
};

/**
 * The original image URL hiding inside a proxied one.
 *
 * The proxy is an optimisation, not a dependency, and this is what keeps it
 * that way. wsrv.nl is a free third-party service; if it is ever slow or down,
 * an <img> that falls straight through to a neutral placeholder means a page
 * with no photographs on it. Falling back to the source instead means a page
 * that is merely slower than it should be — the state everything was in before
 * any of this, which is a perfectly survivable demo and not a broken one.
 *
 * Returns null when the URL was never ours to begin with.
 */
export const originalFrom = (proxied) => {
  if (typeof proxied !== "string" || !proxied.includes("wsrv.nl")) return null;
  try {
    const raw = new URL(proxied).searchParams.get("url");
    return raw ? `https://${raw}` : null;
  } catch {
    return null;
  }
};

export default cdnImage;
