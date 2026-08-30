import { verifyToken } from "@clerk/backend";
import { createClient } from "@supabase/supabase-js";

/**
 * Shared plumbing for the document vault.
 *
 * This holds passports and tickets, so two rules shape everything here:
 * the bucket is private and files are only ever handed out through
 * short-lived signed URLs, and the owner of a document is the Clerk user id
 * proven by a verified token — never a user id sent up by the browser.
 *
 * The service role key lives here and only here. It bypasses every row-level
 * policy in the project, so it must never reach the client bundle: no VITE_
 * prefix, and nothing in this file is imported by anything under src/.
 */

export const BUCKET = "vault";
/** Long enough to open a PDF, short enough that a copied link goes stale. */
export const SIGNED_URL_TTL = 300;

/** Configuration problems should read as configuration problems, not 500s. */
export const missingConfig = () => {
  const missing = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "CLERK_SECRET_KEY"].filter(
    (k) => !process.env[k]
  );
  return missing.length ? `The vault is not configured on the server (missing ${missing.join(", ")}).` : null;
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
 * Guards every route: config present, method allowed, caller identified.
 * @returns {Promise<{userId: string, db: object}|null>} null once it has
 *   already answered the request.
 */
export const guard = async (req, res, methods) => {
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
  if (!userId) {
    send(res, 401, { error: "Sign in to use the vault." });
    return null;
  }
  return { userId, db: admin() };
};
