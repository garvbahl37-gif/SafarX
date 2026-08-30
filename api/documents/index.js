import { guard, send, readJson, BUCKET, SIGNED_URL_TTL } from "./_lib.js";

/**
 * GET  /api/documents  — everything this traveller has stored.
 * POST /api/documents  — record a file that has just been uploaded.
 *
 * Files live in a private bucket, so the list hands back freshly signed URLs
 * rather than storing a link anyone could follow.
 */
export default async function handler(req, res) {
  const ctx = await guard(req, res, ["GET", "POST"]);
  if (!ctx) return;
  const { userId, db } = ctx;

  if (req.method === "GET") {
    const { data, error } = await db
      .from("documents")
      .select("id, name, type, path, size, uploaded_at")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (error) return send(res, 500, { error: error.message });

    const rows = await Promise.all(
      (data || []).map(async (row) => {
        const { data: signed } = await db.storage
          .from(BUCKET)
          .createSignedUrl(row.path, SIGNED_URL_TTL);
        return {
          _id: row.id,
          name: row.name,
          type: row.type,
          size: row.size,
          uploadedAt: row.uploaded_at,
          url: signed?.signedUrl || null,
        };
      })
    );
    return send(res, 200, rows);
  }

  // POST — the browser has finished putting the bytes in the bucket.
  const { name, type, path, size } = await readJson(req);
  if (!name || !path) return send(res, 400, { error: "A name and a stored file are both required." });

  /* The path is derived server-side at upload time and always begins with the
     owner's id. Re-checking it here stops a caller claiming someone else's
     file by posting its path. */
  if (!String(path).startsWith(`${userId}/`)) {
    return send(res, 403, { error: "That file does not belong to you." });
  }

  const { data, error } = await db
    .from("documents")
    .insert({ user_id: userId, name, type: type || "Other", path, size: size || 0 })
    .select("id")
    .single();

  if (error) return send(res, 500, { error: error.message });
  return send(res, 201, { success: true, id: data.id });
}
