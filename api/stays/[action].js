import { searchStays } from "./_search.js";
import { stayDetails } from "./_details.js";
import { searchLocation } from "./_searchLocation.js";

/**
 * Stays, behind one function.
 *
 * These were three separate routes. Vercel's Hobby plan allows twelve
 * functions and SafarX was using all twelve, so the flight tracker had
 * nowhere to put its API key except the browser — which is where it was, in
 * the client bundle, on a ten-thousand-call monthly quota.
 *
 * Collapsing three routes that already shared their helpers into one
 * dispatcher costs nothing and pays for the flights route. The URLs are
 * unchanged: /api/stays/search, /api/stays/details and
 * /api/stays/search-location all still land here.
 */
const ROUTES = {
  search: searchStays,
  details: stayDetails,
  "search-location": searchLocation,
};

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();
  const route = ROUTES[action];
  if (!route) {
    return res.status(404).json({ error: `No stays endpoint called "${action}".` });
  }
  return route(req, res);
}
