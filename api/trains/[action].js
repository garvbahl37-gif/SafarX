/**
 * Every /api/trains/… endpoint behind one function.
 *
 * Vercel's Hobby plan allows twelve serverless functions and this project had
 * reached fifteen, so deployments were failing outright. The five handlers are
 * unchanged and still live in their own files — this only dispatches to them,
 * so /api/trains/between, /live, /pnr and /search stay exactly the URLs the
 * app already calls. (timetable.js beside them is the generated offline
 * dataset, not a route — it is underscored so it stops counting as one.)
 */
import between from "./_between.js";
import live from "./_live.js";
import pnr from "./_pnr.js";
import search from "./_search.js";

const ROUTES = { between, live, pnr, search };

export default async function handler(req, res) {
  const action = req.query?.action || req.url.split("?")[0].split("/").pop();
  const route = ROUTES[action];
  if (!route) {
    return res.status(404).json({ error: `No train endpoint called "${action}".` });
  }
  return route(req, res);
}
