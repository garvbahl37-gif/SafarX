import { verifyToken, createClerkClient } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side plumbing shared by the features that own user data.
 *
 * The service role key lives behind this module and nothing under src/ imports
 * it. It bypasses every row-level policy in the project, so it must never take
 * a VITE_ prefix or reach the client bundle.
 *
 * Identity always comes from a verified Clerk token, never from a user id the
 * browser sends — that is the whole difference between "this is my document"
 * and "I typed someone else's id".
 */

/** Configuration problems should read as configuration problems, not 500s. */
export const missingConfig = () => {
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CLERK_SECRET_KEY"].filter(
    (k) => !process.env[k]
  );
  return missing.length ? `This feature is not configured on the server (missing ${missing.join(", ")}).` : null;
};

export const admin = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

/**
 * The Clerk user this request actually belongs to.
 * @returns {Promise<string|null>} the user id, or null if the token is absent,
 *   expired, or not signed by this Clerk instance.
 */
export const userFromRequest = async (req) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    return claims?.sub || null;
  } catch (err) {
    /* The failure worth naming. If CLERK_SECRET_KEY belongs to a different
       Clerk application than VITE_CLERK_PUBLISHABLE_KEY, every real sign-in
       produces a token this server cannot verify — and the traveller is told
       to sign in, which they just did. The two keys must be copied from the
       same application's API Keys page. */
    if (process.env.NODE_ENV !== "production") {
      console.warn("[auth] token rejected:", err?.message || err);
    }
    return null;
  }
};

/**
 * Whether the frontend and backend Clerk keys are the same application.
 *
 * Cheap to check and worth checking: a mismatch looks exactly like "not
 * signed in" from the browser, which sends people to re-enter a password
 * that was never the problem.
 * @returns {Promise<string|null>} an explanation, or null when they agree.
 */
export const clerkKeyMismatch = async () => {
  const pk = process.env.VITE_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  if (!pk || !sk) return null;
  try {
    const frontendApi = Buffer.from(pk.replace(/^pk_(test|live)_/, ""), "base64")
      .toString("utf8")
      .replace(/\$$/, "");
    const [theirs, ours] = await Promise.all([
      fetch(`https://${frontendApi}/.well-known/jwks.json`).then((r) => r.json()),
      fetch("https://api.clerk.com/v1/jwks", { headers: { Authorization: `Bearer ${sk}` } }).then((r) => r.json()),
    ]);
    const a = theirs?.keys?.[0]?.kid;
    const b = ours?.keys?.[0]?.kid;
    if (a && b && a !== b) {
      return `The Clerk keys are from different applications: the browser signs in to ${a} but this server verifies ${b}. Copy both keys from the same application.`;
    }
  } catch {
    /* Never block a request on a diagnostic. */
  }
  return null;
};

/* Names and faces are looked up, never accepted. A caller who could send its
   own display name could post a message that renders as somebody else with
   somebody else's photograph — the user id would be right and the byline a
   lie. Cached per warm instance, since it is the same handful of people. */
const profiles = new Map();

/**
 * The traveller's real name and picture, from Clerk.
 * @returns {Promise<{displayName: string, avatarUrl: string|null}>}
 */
export const profileOf = async (userId) => {
  if (!userId) return { displayName: "Traveller", avatarUrl: null };
  if (profiles.has(userId)) return profiles.get(userId);

  let profile = { displayName: "Traveller", avatarUrl: null };
  try {
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerk.users.getUser(userId);
    profile = {
      displayName:
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.username ||
        user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        "Traveller",
      avatarUrl: user.imageUrl || null,
    };
  } catch {
    /* Clerk unreachable: a generic byline is better than a borrowed one. */
  }
  profiles.set(userId, profile);
  return profile;
};

/** Reads a JSON body whether or not the platform has already parsed it. */
export const readJson = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
};

/* status().json() rather than end(): it is what Vercel's response object
   offers and what the local dev shim understands. Writing the body with end()
   skipped the shim's status handling and every reply came back 200. */
export const send = (res, status, body) => res.status(status).json(body);

/* Resolved once per warm instance, and only if something actually fails. */
let mismatchNote;

/**
 * Guards a route: config present, method allowed, caller identified.
 * @param {boolean} [needsUser] when false, an anonymous caller is allowed
 *   through with userId null — browsing is public, joining is not.
 * @returns {Promise<{userId: string|null, db: object}|null>} null once it has
 *   already answered the request.
 */
export const guard = async (req, res, methods, needsUser = true) => {
  if (!methods.includes(req.method)) {
    res.setHeader("Allow", methods.join(", "));
    send(res, 405, { error: `${req.method} is not allowed here.` });
    return null;
  }
  const problem = missingConfig();
  if (problem) {
    send(res, 503, { error: problem });
    return null;
  }
  const userId = await userFromRequest(req);
  if (needsUser && !userId) {
    /* Only on the failure path, and only once per warm instance: a
       misconfiguration should explain itself rather than send someone back to
       a password that was never wrong. */
    if (mismatchNote === undefined) mismatchNote = await clerkKeyMismatch();
    send(res, 401, { error: mismatchNote || "Sign in first." });
    return null;
  }
  return { userId, db: admin() };
};
