/**
 * The gazetteer lives in src/ so the browser can match against the same list
 * the server does — suggestions appear on the first keystroke with no network
 * call at all, and the API agrees with them exactly.
 */
export { PLACES, findPlaces } from "../../src/data/indiaPlaces.js";
