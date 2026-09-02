import CryptoJS from "crypto-js";
import { rateLimit, clientIp } from "../trains/_ratelimit.js";

/**
 * Soundtrack search for the cinematic reel.
 *
 * The reel's music never loaded because the browser was asking
 * http://localhost:5000 for it — a port on the visitor's own machine, the same
 * dead Express server the document vault used to call. The proxy itself was
 * sound; it just lived somewhere that was never deployed. This is that code,
 * moved to where the rest of SafarX runs.
 *
 * The proxy exists because a stream URL cannot be used as it arrives: JioSaavn
 * returns it DES-encrypted, and the decrypted address points at a 96kbps file
 * whose 320kbps sibling is one substitution away. Doing that in the browser
 * would also mean every visitor calling jiosaavn.com directly, which CORS
 * refuses.
 */

const SEARCH = "https://www.jiosaavn.com/api.php";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

/* Their fixed DES key. Node's own crypto cannot help here — modern OpenSSL
   retired DES to the legacy provider, so createDecipheriv('des-ecb') throws
   ERR_OSSL_EVP_UNSUPPORTED. crypto-js implements it in pure JavaScript. */
const KEY = CryptoJS.enc.Utf8.parse("38346591");

const decryptStream = (encrypted) => {
  try {
    const out = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encrypted) },
      KEY,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    ).toString(CryptoJS.enc.Utf8);
    if (!out) return null;
    // The address you are handed is the 96kbps one; its sibling is better.
    return out
      .replace("_96.mp4", "_320.mp4")
      .replace("_96.mp3", "_320.mp3")
      .replace("http:", "https:");
  } catch {
    return null;
  }
};

const saavn = async (params) => {
  const res = await fetch(`${SEARCH}?${new URLSearchParams(params)}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`JioSaavn returned ${res.status}.`);
  return res.json();
};

const searchSongs = async (req, res) => {
  const query = String(req.query?.q || "").trim();
  const limit = Math.min(12, Math.max(1, Number(req.query?.limit) || 3));
  if (!query) {
    return res.status(400).json({ success: false, error: 'Give me something to search for.' });
  }

  const found = await saavn({
    p: 1, q: query, _format: "json", _marker: 0,
    api_version: 4, ctx: "wap6dot0", n: limit,
    __call: "search.getResults",
  });

  const results = found.results || [];
  if (!results.length) return res.status(200).json({ success: true, results: [] });

  const songs = await Promise.all(
    results.map(async (song) => {
      try {
        const detail = await saavn({
          __call: "song.getDetails", cc: "in", _marker: 0,
          _format: "json", pids: song.id,
        });
        const data = detail[song.id] || detail.songs?.[0];
        const streamUrl = data?.encrypted_media_url ? decryptStream(data.encrypted_media_url) : null;
        if (!streamUrl) return null;

        return {
          id: song.id,
          title: song.title || song.song,
          artist: song.more_info?.singers || song.more_info?.artist || song.subtitle,
          album: song.more_info?.album || song.album,
          year: song.year,
          duration: parseInt(song.more_info?.duration || song.duration || 0, 10) || 0,
          // The 150px thumbnail is unusable behind a full-bleed reel.
          image: song.image ? song.image.replace("-150x150", "-500x500") : null,
          streamUrl,
        };
      } catch {
        return null;
      }
    })
  );

  /* A track with no playable stream is worse than one fewer result. */
  const playable = songs.filter(Boolean);

  // The catalogue does not change minute to minute; let the edge hold it.
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).json({ success: true, results: playable });
};

const ROUTES = { search: searchSongs };

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();
  const route = ROUTES[action];
  if (!route) {
    return res.status(404).json({ success: false, error: `No music endpoint called "${action}".` });
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: `${req.method} is not allowed here.` });
  }

  /* Each search fans out into one request per result upstream, so this is
     worth a limit even though it costs us no quota of our own. */
  const burst = rateLimit(`music:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ success: false, error: "Too many searches from this connection." });
  }

  try {
    return await route(req, res);
  } catch (err) {
    return res.status(502).json({ success: false, error: err.message || "Music search is not coming through." });
  }
}
