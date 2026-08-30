import { guard, send, readJson, BUCKET } from "./_lib.js";

/**
 * POST /api/documents/upload-url
 *
 * Hands back a one-shot signed URL the browser can PUT the file straight to.
 *
 * The bytes never pass through this function: a passport scan does not need to
 * be buffered in serverless memory, and the upload is not bounded by a request
 * body limit. What the server keeps hold of is the part that matters — the
 * path, which always starts with the owner's id, so a traveller cannot write
 * into anybody else's folder.
 */

/** Keeps a filename to something a storage key can hold, and its extension. */
const safeName = (name) =>
  String(name || "document")
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(-80) || "document";

export default async function handler(req, res) {
  const ctx = await guard(req, res, ["POST"]);
  if (!ctx) return;
  const { userId, db } = ctx;

  const { filename } = await readJson(req);
  const key = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(filename)}`;

  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(key);
  if (error) return send(res, 500, { error: error.message });

  return send(res, 200, { path: key, signedUrl: data.signedUrl, token: data.token });
}
