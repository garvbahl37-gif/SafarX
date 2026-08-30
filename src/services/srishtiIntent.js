/**
 * What Srishti wants the app to do, handed over as a small object.
 *
 * Navigating somewhere is not the same as doing something. Saying "here are
 * your trains" and dropping you on an empty search form makes the traveller
 * redo the work they just did out loud — so when she looks something up, the
 * page she opens arrives already filled in with what she found.
 *
 * Deliberately not React state: an intent is a message that happens once and
 * is then spent, and a page consumes it whenever it happens to mount.
 */

let pending = null;
const listeners = new Set();

/**
 * @typedef {object} Intent
 * @property {"trains"|"stays"|"itinerary"|"tour"|"page"} type
 * @property {object} [payload] what the page needs to fill itself in
 */

/** Srishti hands over a request. Any page already open hears it immediately. */
export const setIntent = (intent) => {
  pending = intent;
  listeners.forEach((fn) => {
    try {
      fn(intent);
    } catch {
      /* one page failing must not stop the others hearing it */
    }
  });
};

/**
 * Takes the pending intent if it is meant for you. Spent once read, so a page
 * that remounts does not re-run a request from ten minutes ago.
 * @returns {Intent|null}
 */
export const takeIntent = (type) => {
  if (!pending || pending.type !== type) return null;
  const intent = pending;
  pending = null;
  return intent;
};

/** For a page that is already open when she asks for something. */
export const onIntent = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const clearIntent = () => {
  pending = null;
};
