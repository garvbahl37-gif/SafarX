/**
 * The tools Srishti can reach for, and what they resolve against.
 *
 * Every one of these is an endpoint SafarX already runs — she is wired into
 * the product rather than bolted onto it. `open_page` is the exception: it
 * returns nothing to her, it tells the browser to navigate, so she can be
 * showing you Varanasi while she describes it.
 */

import vrTours from "../../src/data/vrTours.json";
import gems from "../../src/data/hiddengems.json";
import { findPlaces } from "../stays/_places.js";
import { findStations } from "../../src/data/indiaStations.js";

export const TOOL_DECLARATIONS = [
  {
    name: "search_stays",
    description:
      "Find real places to stay in an Indian city for given dates. Use whenever someone asks about hotels, rooms, where to stay, or prices for a night.",
    parameters: {
      type: "OBJECT",
      properties: {
        city: { type: "STRING", description: "Indian city or destination, e.g. Udaipur" },
        checkIn: { type: "STRING", description: "Check-in date as YYYY-MM-DD" },
        checkOut: { type: "STRING", description: "Check-out date as YYYY-MM-DD" },
        guests: { type: "NUMBER", description: "Number of adults, default 2" },
      },
      required: ["city"],
    },
  },
  {
    name: "trains_between",
    description:
      "Find trains running between two Indian cities or stations. Use for any question about getting somewhere by train.",
    parameters: {
      type: "OBJECT",
      properties: {
        from: { type: "STRING", description: "Origin city or station name" },
        to: { type: "STRING", description: "Destination city or station name" },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "pnr_status",
    description: "Check whether a train ticket is confirmed, using its ten-digit PNR number.",
    parameters: {
      type: "OBJECT",
      properties: { pnr: { type: "STRING", description: "Ten digit PNR" } },
      required: ["pnr"],
    },
  },
  {
    name: "find_vr_tour",
    description:
      "Find a 360° virtual tour of an Indian place that SafarX can open. Use when someone wants to see or look around somewhere.",
    parameters: {
      type: "OBJECT",
      properties: { place: { type: "STRING", description: "Place name, e.g. Varanasi" } },
      required: ["place"],
    },
  },
  {
    name: "hidden_gems_near",
    description:
      "Find lesser-known places worth visiting near an Indian city or state — the ones guidebooks miss.",
    parameters: {
      type: "OBJECT",
      properties: { place: { type: "STRING", description: "City or state name" } },
      required: ["place"],
    },
  },
  {
    name: "open_page",
    description:
      "Move the SafarX app to a page while you keep talking. Use it to show what you are describing.",
    parameters: {
      type: "OBJECT",
      properties: {
        page: {
          type: "STRING",
          description:
            "One of: home, tours, gems, planner, map, flights, vault, checklist, agent",
        },
        tourId: {
          type: "STRING",
          description: "Optional tour id from find_vr_tour, to open that tour directly",
        },
      },
      required: ["page"],
    },
  },
];

const ROUTES = {
  home: "/", tours: "/360tour", gems: "/gems", planner: "/itinerary",
  map: "/map", flights: "/tracker", vault: "/vault",
  checklist: "/checklist", agent: "/chat",
};

const near = (lat, lng, rows, limit) =>
  rows
    .map((r) => ({
      row: r,
      d: Math.hypot((r.latitude ?? r.lat ?? 0) - lat, (r.longitude ?? r.lng ?? 0) - lng),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ row }) => row);

/**
 * Runs one tool call and returns a small, speakable result. Everything here is
 * trimmed hard: she has to say it out loud, so a wall of JSON is useless.
 */
export const runTool = async (name, args, { origin }) => {
  const get = async (path) => {
    const res = await fetch(`${origin}${path}`);
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return res.json();
  };

  switch (name) {
    case "search_stays": {
      const place = findPlaces(args.city, 1)[0];
      if (!place) return { error: `I don't know ${args.city} in India.` };
      const today = new Date();
      const checkIn = args.checkIn || new Date(today.getTime() + 864e5).toISOString().slice(0, 10);
      const checkOut = args.checkOut || new Date(today.getTime() + 3 * 864e5).toISOString().slice(0, 10);
      const { data = [] } = await get(
        `/api/stays/search?lat=${place.lat}&lng=${place.lng}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${args.guests || 2}`
      );
      return {
        city: place.name,
        checkIn,
        checkOut,
        found: data.length,
        top: data.slice(0, 3).map((h) => ({
          name: h.title,
          perNight: h.price?.displayPrice || null,
          rating: h.rating,
        })),
      };
    }

    case "trains_between": {
      const from = findStations(args.from, 1)[0];
      const to = findStations(args.to, 1)[0];
      if (!from || !to) return { error: "I couldn't place one of those stations." };
      const { data = [] } = await get(`/api/trains/between?from=${from.code}&to=${to.code}`);
      return {
        from: from.city,
        to: to.city,
        found: data.length,
        top: data.slice(0, 3).map((t) => ({
          number: t.number,
          name: t.name,
          departs: t.from.time,
          arrives: t.to.time,
          takes: t.duration,
        })),
      };
    }

    case "pnr_status": {
      const { data } = await get(`/api/trains/pnr?pnr=${encodeURIComponent(args.pnr)}`);
      return {
        train: `${data.trainNumber} ${data.trainName}`,
        journey: data.journeyDate,
        chart: data.chartPrepared,
        passengers: data.passengers.map((p) => ({ status: p.current, berth: p.berth })),
      };
    }

    case "find_vr_tour": {
      const q = String(args.place || "").toLowerCase();
      const hit =
        vrTours.find((t) => t.name.toLowerCase().includes(q)) ||
        vrTours.find((t) => (t.country || "").toLowerCase().includes(q));
      if (!hit) return { error: `No 360° tour for ${args.place} yet.` };
      return {
        tourId: hit.id,
        name: hit.name,
        where: hit.country,
        about: hit.description,
        vantages: (hit.panoramas || []).length || "live street captures",
      };
    }

    case "hidden_gems_near": {
      const place = findPlaces(args.place, 1)[0];
      if (!place) return { error: `I don't know ${args.place}.` };
      const found = near(place.lat, place.lng, gems, 3);
      return {
        near: place.name,
        gems: found.map((g) => ({ name: g.name, state: g.state, about: g.description })),
      };
    }

    case "open_page": {
      const path = ROUTES[args.page];
      if (!path) return { error: "I don't have that page." };
      // Handed back to the browser, not to her — she gets a plain confirmation.
      return { navigate: path, tourId: args.tourId || null, opened: args.page };
    }

    default:
      return { error: "Unknown tool." };
  }
};
