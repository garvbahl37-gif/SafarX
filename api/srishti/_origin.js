/**
 * Where this deployment is, and who is allowed to talk to it.
 *
 * Srishti's tools call SafarX's own endpoints, so something has to say what
 * "own" means. Taking that from the request's Host header — as this did — lets
 * a caller point our server at any host they like simply by setting a header,
 * and our server will happily fetch it and feed the result to the model.
 * Vercel's edge happens to overwrite that header today, which is luck rather
 * than a defence.
 *
 * So the address comes from the platform's own environment, never from the
 * request, and only falls back to the request when it is unmistakably local.
 */

const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** @returns {string} the origin this deployment's own endpoints live on. */
export const selfOrigin = (req) => {
  if (process.env.SRISHTI_ORIGIN) return process.env.SRISHTI_ORIGIN;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Development: the dev server is the only thing that can be talking to us,
  // and it is on this machine.
  const host = req?.headers?.host || "";
  if (LOCAL.test(host)) return `http://${host}`;
  return "http://localhost:5173";
};

/**
 * A WebSocket upgrade is not covered by the same-origin policy: any page on
 * any site can open one to us, and it would carry the user's session and spend
 * our Gemini quota. Browsers do always send Origin on an upgrade, so requiring
 * a recognised one is the check that CORS would otherwise have made.
 *
 * @returns {boolean}
 */
export const isAllowedOrigin = (origin) => {
  if (!origin) return false;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (LOCAL.test(url.host)) return true;
  if (process.env.SRISHTI_ORIGIN) return origin === process.env.SRISHTI_ORIGIN;
  // Our own production domain and its preview deployments.
  return url.hostname === "safarx-sih.vercel.app" || url.hostname.endsWith("-garvbahl37-gifs-projects.vercel.app");
};
