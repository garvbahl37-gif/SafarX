import { verifyToken } from "@clerk/backend";
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
  } catch {
    return null;
  }
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
    send(res, 401, { error: "Sign in first." });
    return null;
  }
  return { userId, db: admin() };
};
