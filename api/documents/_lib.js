import { admin, userFromRequest, readJson, send, guard, missingConfig } from "../_server.js";

/**
 * The document vault's own constants. Everything else — the Supabase admin
 * client, Clerk verification, the guard — is shared with the other features
 * that own user data and lives in api/_server.js.
 */

export const BUCKET = "vault";
/** Long enough to open a PDF, short enough that a copied link goes stale. */
export const SIGNED_URL_TTL = 300;

/** Configuration problems should read as configuration problems, not 500s. */

export { admin, userFromRequest, readJson, send, guard, missingConfig };
