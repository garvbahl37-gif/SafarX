import { guard, send, BUCKET } from "./_lib.js";

/**
 * DELETE /api/documents/:id — remove one document, file and record.
 *
 * The row is looked up by id *and* owner, so an id belonging to someone else
 * simply is not found. The file goes first: a record with no file is a broken
 * row, while a file with no record is only an orphan the owner can no longer
 * reach.
 */
export default async function handler(req, res) {
  const ctx = await guard(req, res, ["DELETE"]);
  if (!ctx) return;
  const { userId, db } = ctx;

  const id = req.query?.id || req.url.split("/").pop().split("?")[0];
  if (!id) return send(res, 400, { error: "Which document?" });

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
}
