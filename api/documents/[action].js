import { guard, send, readJson, BUCKET } from "./_lib.js";

/**
 * Everything under /api/documents/… in one function.
 *
 *   POST   /api/documents/upload-url  → a one-shot signed URL to PUT a file to
 *   DELETE /api/documents/<id>        → remove one document, file and record
 *
 * These were two functions until Vercel refused the deployment: the Hobby plan
 * allows twelve serverless functions and the vault took the project to fifteen,
 * so every push after it failed to build. Routing by the path segment costs
 * nothing and keeps the URLs the browser already calls.
 */

/** Keeps a filename to something a storage key can hold, and its extension. */
const safeName = (name) =>
  String(name || "document")
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .slice(-80) || "document";

const issueUploadUrl = async (req, res, { userId, db }) => {
  const { filename } = await readJson(req);
  const key = `${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName(filename)}`;
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(key);
  if (error) return send(res, 500, { error: error.message });
  return send(res, 200, { path: key, signedUrl: data.signedUrl, token: data.token });
};

/**
 * The row is looked up by id *and* owner, so an id belonging to someone else
 * simply is not found. The file goes first: a record with no file is a broken
 * row, while a file with no record is only an orphan nobody can reach.
 */
const removeDocument = async (res, { userId, db }, id) => {
  const { data: row, error: findError } = await db
    .from("documents")
    .select("id, path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (findError) return send(res, 500, { error: findError.message });
  if (!row) return send(res, 404, { error: "That document is not in your vault." });

  const { error: fileError } = await db.storage.from(BUCKET).remove([row.path]);
  if (fileError) return send(res, 500, { error: fileError.message });

  const { error: rowError } = await db.from("documents").delete().eq("id", row.id);
  if (rowError) return send(res, 500, { error: rowError.message });

  return send(res, 200, { success: true });
};

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();

  if (action === "upload-url") {
    const ctx = await guard(req, res, ["POST"]);
    if (!ctx) return;
    return issueUploadUrl(req, res, ctx);
  }

  const ctx = await guard(req, res, ["DELETE"]);
  if (!ctx) return;
  if (!action) return send(res, 400, { error: "Which document?" });
  return removeDocument(res, ctx, action);
}
