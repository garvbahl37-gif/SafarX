/**
 * Builds the offline Indian Railways timetable the app searches against.
 *
 * Why offline: every metered train API on RapidAPI gives ~50 calls a month,
 * which a single demo exhausts. Station-to-station search is the one thing
 * travellers do most, and it does not need to be live — a timetable is a
 * timetable. This bakes one in, so that search costs nothing and answers in
 * milliseconds, forever.
 *
 * Source: datameet/railways (open civic data, CC-BY). It carries 5,208 trains
 * and 8,990 stations, but predates the Vande Bharat and Tejas services — the
 * API stays wired for live running and PNR, which genuinely cannot be static.
 *
 *   node scripts/build-timetable.mjs
 */

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://raw.githubusercontent.com/datameet/railways/master";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../api/trains/timetable.json");

const fetchJson = async (name) => {
  process.stdout.write(`  fetching ${name}… `);
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const body = await res.json();
  console.log("ok");
  return body;
};

/** "17:00:00" → minutes since midnight; "None" and blanks → null. */
const toMinutes = (value) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(value || ""));
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

const CLASS_FLAGS = [
  ["first_ac", "1A"], ["second_ac", "2A"], ["third_ac", "3A"],
  ["chair_car", "CC"], ["sleeper", "SL"], ["first_class", "FC"],
];

console.log("Building the offline timetable");
const [stationsGeo, trainsGeo, schedules] = await Promise.all([
  fetchJson("stations.json"),
  fetchJson("trains.json"),
  fetchJson("schedules.json"),
]);

/* Stations, indexed so a stop costs one integer rather than a repeated code. */
const stationIndex = new Map();
const stations = [];
for (const f of stationsGeo.features) {
  const p = f.properties || {};
  if (!p.code || stationIndex.has(p.code)) continue;
  const [lng, lat] = f.geometry?.coordinates || [];
  stationIndex.set(p.code, stations.length);
  stations.push([p.code, p.name || p.code, p.state || "", lat ?? null, lng ?? null]);
}

/* Per-train metadata: ends, distance, duration and the classes it carries. */
const meta = new Map();
for (const f of trainsGeo.features) {
  const p = f.properties || {};
  if (!p.number) continue;
  meta.set(String(p.number), {
    classes: CLASS_FLAGS.filter(([key]) => Number(p[key]) > 0).map(([, code]) => code),
    distance: Number(p.distance) || null,
    minutes: (Number(p.duration_h) || 0) * 60 + (Number(p.duration_m) || 0),
    type: p.type || null,
  });
}

/* Stops, grouped by train and left in schedule order. */
const byTrain = new Map();
for (const row of schedules) {
  const code = row.station_code;
  if (!stationIndex.has(code)) {
    stationIndex.set(code, stations.length);
    stations.push([code, row.station_name || code, "", null, null]);
  }
  const number = String(row.train_number);
  if (!byTrain.has(number)) byTrain.set(number, { name: row.train_name, stops: [] });
  const arrival = toMinutes(row.arrival);
  const departure = toMinutes(row.departure);
  // The dataset lists every point the train passes, not just where it stops.
  // A dwell means it actually halts; without one it is only running through.
  const halts = arrival == null || departure == null || arrival !== departure ? 1 : 0;
  byTrain.get(number).stops.push([stationIndex.get(code), arrival, departure, Number(row.day) || 1, halts]);
}

const trains = [];
for (const [number, { name, stops }] of byTrain) {
  if (stops.length < 2) continue;
  const m = meta.get(number) || {};
  trains.push({
    n: number,
    t: name,
    c: m.classes?.length ? m.classes : undefined,
    d: m.distance || undefined,
    m: m.minutes || undefined,
    y: m.type || undefined,
    s: stops,
  });
}

const payload = {
  version: 1,
  source: "datameet/railways (CC-BY)",
  note: "Static timetable. Predates services introduced after ~2018.",
  stations,
  trains,
};

writeFileSync(OUT, JSON.stringify(payload));
const mb = (JSON.stringify(payload).length / 1024 / 1024).toFixed(1);
console.log(`\n${trains.length} trains · ${stations.length} stations · ${schedules.length} stops`);
console.log(`written to api/trains/timetable.json (${mb} MB)`);
