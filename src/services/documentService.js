/**
 * The document vault, from the browser's side.
 *
 * This used to call a separate Express server on http://localhost:5000, which
 * was never deployed — so on the live site every upload was trying to reach a
 * port on the visitor's own machine. It now talks to this same deployment.
 *
 * Files go straight from the browser into private storage using a one-shot
 * signed URL the server issues; only the metadata comes back through the API.
 * Nothing here holds a credential.
 */

const API = "/api/documents";

/** Surfaces the server's own words, which are written to be read by travellers. */
const explain = async (res, fallback) => {
  const body = await res.json().catch(() => ({}));
  return new Error(body.error || fallback);
};

export const getDocuments = async (token) => {
  const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw await explain(res, "Your documents could not be loaded.");
  return res.json();
};

/**
 * @param {FormData} formData with `file`, `name` and `type`
 * @param {string} token a Clerk session token
 */
export const uploadDocument = async (formData, token) => {
  const file = formData.get("file");
  const name = formData.get("name");
  const type = formData.get("type");
  if (!file) throw new Error("Choose a file to store.");

  const auth = { Authorization: `Bearer ${token}` };

  // 1. Ask where to put it. The server decides the path, never the browser.
  const ticketRes = await fetch(`${API}/upload-url`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name }),
  });
  if (!ticketRes.ok) throw await explain(ticketRes, "The upload could not be started.");
  const { path, signedUrl } = await ticketRes.json();

  // 2. Send the bytes straight to storage, not through the API.
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  if (!putRes.ok) throw new Error("The file could not be stored. Try again.");

  // 3. Record it.
  const saveRes = await fetch(API, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ name, type, path, size: file.size }),
  });
  if (!saveRes.ok) throw await explain(saveRes, "The file was stored but could not be saved to your vault.");
  return saveRes.json();
};

export const deleteDocument = async (id, token) => {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await explain(res, "That document could not be removed.");
  return res.json();
};
