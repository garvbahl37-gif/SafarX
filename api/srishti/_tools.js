/**
 * The tools Srishti can reach for, and what they resolve against.
 *
 * Every one of these is an endpoint SafarX already runs — she is wired into
 * the product rather than bolted onto it. `open_page` is the exception: it
 * returns nothing to her, it tells the browser to navigate, so she can be
 * showing you Varanasi while she describes it.
 */

/* Node runs these functions as real ESM, so JSON needs the attribute — without
   it the whole function fails to load. */
import vrTours from "../../src/data/vrTours.json" with { type: "json" };
import gems from "../../src/data/hiddengems.json" with { type: "json" };
import { findPlaces } from "../stays/_places.js";
import { findStations } from "../../src/data/indiaStations.js";

export const TOOL_DECLARATIONS = [
  {
    name: "search_stays",
    description:
      "Find real places to stay in an Indian city. Use whenever someone asks about hotels, rooms, where to stay, or prices. Only the city is required — if they have not said when, search anyway with the default dates and mention what you assumed. Never ask for dates before searching.",
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
        date: {
          type: "STRING",
          description: "Date of travel as YYYY-MM-DD, if they said one. Assume the next occurrence of a bare date like '3 September'.",
        },
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
      "Find a 360° virtual tour of an Indian place AND open it on screen. Use when someone wants to see or look around somewhere. This both finds and opens it — no other call is needed.",
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
    name: "plan_itinerary",
    description:
      "Plan a day-by-day trip and put it on screen. Use whenever someone wants an itinerary, a plan, or help working out what to do somewhere over several days. Fills the planner in and starts it — do not send them to the planner to do it themselves.",
    parameters: {
      type: "OBJECT",
      properties: {
        destination: { type: "STRING", description: "Indian city, state or region" },
        startDate: {
          type: "STRING",
          description:
            "First day of the trip as YYYY-MM-DD — exactly the date they named, not the day before. " +
            "\"three days from 6 September\" starts on the 6th. Leave out if they did not say.",
        },
        days: { type: "NUMBER", description: "How many days, default 3" },
        interests: {
          type: "STRING",
          description:
            "Comma separated, from: Heritage, Nature, Food, Adventure, Spiritual, Shopping, Nightlife, Photography",
        },
        pace: { type: "STRING", description: "Relaxed, Moderate or Packed" },
        budget: { type: "STRING", description: "Total budget in rupees, digits only" },
        travellers: { type: "NUMBER", description: "How many adults, default 2" },
      },
      required: ["destination"],
    },
  },
  {
    name: "emergency_sos",
    description:
      "Open the emergency SOS beacon immediately. Use the moment someone says they are in danger, hurt, lost, being followed, or asks for help — do not ask clarifying questions first, open it and keep talking. This is the one tool where acting early is better than acting correctly.",
    parameters: {
      type: "OBJECT",
      properties: {
        reason: {
          type: "STRING",
          description: "What they said is wrong, in a few words, so the screen opens with context",
        },
      },
      required: [],
    },
  },
  {
    name: "check_safety",
    description:
      "Open the safety hub for a place: verified emergency numbers, women's safety ratings, and crowd forecasts. Use when someone asks whether somewhere is safe, how crowded it will be, when to avoid queues, or who to call there.",
    parameters: {
      type: "OBJECT",
      properties: {
        destination: { type: "STRING", description: "Indian state, city or monument" },
        focus: {
          type: "STRING",
          description: "advisor for safety measures, crowd for queue forecasts, directory for emergency contacts",
        },
      },
      required: ["destination"],
    },
  },
  {
    name: "create_reel",
    description:
      "Open the digital diary with a reel set up from a trip: title, edit style, aspect ratio and soundtrack. Use when someone wants to turn their trip photos into a video, make a reel, or share their journey. Fill in whatever they told you and leave the rest out.",
    parameters: {
      type: "OBJECT",
      properties: {
        tripTitle: { type: "STRING", description: "What to call the trip, e.g. Royal Echoes of Rajasthan" },
        travellers: { type: "STRING", description: "Who went, e.g. Aarav & Meera" },
        style: {
          type: "STRING",
          description: "One of: Trending Reel, 35mm Film, Polaroid Vlog, Luxury Gallery",
        },
        ratio: { type: "STRING", description: "One of: 9:16, 4:5, 1:1, 16:9, 4:3" },
        track: { type: "STRING", description: "A song to score it with, e.g. Ilahi or Safarnama" },
      },
      required: [],
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
            "One of: home, tours, gems, planner, map, flights, vault, checklist, agent, " +
            "groups (travellers to share a trip with), upload (add a document to the vault)",
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

/* Every page a traveller can reach on their own, she can reach for them.
   `/360view` is deliberately absent: it carries its own fixed shortlist and
   ignores the tour asked for, so tours go through `/360tour`. */
const ROUTES = {
  home: "/", tours: "/360tour", gems: "/gems", planner: "/itinerary",
  map: "/map", flights: "/tracker", vault: "/vault",
  checklist: "/checklist", agent: "/chat",
  groups: "/social", upload: "/upload",
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
/**
 * Whether a spoken destination and a gazetteer entry are the same place.
 * Tolerates the odd transcription slip ("Kerela"/"Kerala", "Varnasi"/"Varanasi")
 * without letting "Coorg" quietly become "Coimbatore".
 */
/** The regions the safety hub carries, mirroring POPULAR_DESTINATIONS. */
const SAFETY_REGIONS = [
  "Goa", "Rajasthan", "Kerala", "Himachal Pradesh", "Ladakh", "Uttarakhand",
  "Tamil Nadu", "Karnataka", "Uttar Pradesh", "Meghalaya", "Sikkim", "Delhi",
];

const isSamePlace = (asked, name) => {
  const a = asked.toLowerCase().trim();
  const b = name.toLowerCase().trim();
  if (b.startsWith(a.slice(0, 4))) return true;
  // A misspelling stays about the same length; a different place rarely does.
  if (Math.abs(a.length - b.length) > 2) return false;
  return editDistance(a, b) <= Math.min(2, Math.floor(a.length / 4));
};

/** Levenshtein, one row at a time — these strings are a few characters long. */
const editDistance = (a, b) => {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = row;
  }
  return prev[b.length];
};

export const runTool = async (name, args, { origin }) => {
  /* Whatever goes wrong, she is told it in words she can repeat out loud.
     She was quoting HTTP status codes at travellers. */
  const get = async (path) => {
    const res = await fetch(`${origin}${path}`);
    if (!res.ok) {
      throw new Error(
        res.status === 429
          ? "live prices are unavailable for the rest of the month"
          : "that information isn't available right now"
      );
    }
    return res.json();
  };

  switch (name) {
    case "search_stays": {
      const place = findPlaces(args.city, 1)[0];
      if (!place) return { unavailable: `I don't know ${args.city} in India.` };
      const today = new Date();
      const checkIn = args.checkIn || new Date(today.getTime() + 864e5).toISOString().slice(0, 10);
      const checkOut = args.checkOut || new Date(today.getTime() + 3 * 864e5).toISOString().slice(0, 10);
      let data = [];
      try {
        ({ data = [] } = await get(
          `/api/stays/search?lat=${place.lat}&lng=${place.lng}&place=${encodeURIComponent(place.name)}` +
          `&checkIn=${checkIn}&checkOut=${checkOut}&adults=${args.guests || 2}`
        ));
      } catch (err) {
        /* No live prices — say so plainly, but still open the panel with the
           city and the nights filled in. Promising a page and then leaving
           them where they were is worse than an honest empty one, and the
           search is one tap away when the quota comes back. */
        return {
          unavailable: `Live hotel prices for ${place.name} are unavailable right now (${err.message}).`,
          city: place.name,
          suggestion: "Say prices are not coming through, and that you have opened the stays panel for that city anyway.",
          navigate: "/chat",
          intent: {
            type: "stays",
            payload: { place, checkIn, checkOut, guests: Number(args.guests) || 2 },
          },
        };
      }
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
        navigate: "/chat",
        intent: {
          type: "stays",
          payload: { place, checkIn, checkOut, guests: Number(args.guests) || 2 },
        },
      };
    }

    case "trains_between": {
      const from = findStations(args.from, 1)[0];
      const to = findStations(args.to, 1)[0];
      if (!from || !to) return { error: "I couldn't place one of those stations." };
      const { data = [] } = await get(`/api/trains/between?from=${from.code}&to=${to.code}`);
      const best = data[0];
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
        /* Opens the trains panel already filled in, with the one she named
           picked out — so "the Shatabdi at six" is on screen, not a form. */
        navigate: "/chat",
        intent: {
          type: "trains",
          payload: {
            from: { code: from.code, name: from.name, city: from.city },
            to: { code: to.code, name: to.name, city: to.city },
            date: args.date || null,
            highlight: best?.number || null,
          },
        },
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
      /* A tour she can actually open. Some sites are listed but have no
         panorama the app can paint — they were added against Google Street
         View, which needs a billing-enabled key the browser may not have. She
         must not offer those: announcing a tour and then showing "coming soon"
         is the same broken promise as opening nothing at all. */
      const showable = (t) => Boolean((t.panoramas || []).length || t.panorama || !t.streetView);
      const pool = vrTours.filter(showable);
      const hit =
        pool.find((t) => t.name.toLowerCase().includes(q)) ||
        pool.find((t) => (t.country || "").toLowerCase().includes(q));
      if (!hit) return { unavailable: `There is no 360° tour of ${args.place} yet.` };
      /* Finding a tour and opening it are one intention, so this navigates by
         itself. Asking her to chain find_vr_tour into open_page meant that on
         a weaker model she announced "I'm opening Varanasi" and then opened
         nothing — worse than not offering, because it is untrue. */
      return {
        navigate: "/360tour",
        tourId: hit.id,
        opened: hit.name,
        name: hit.name,
        where: hit.country,
        about: hit.description,
        // Say what is really there: a count when the tour ships verified
        // images, otherwise the live capture it falls back to.
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

    case "plan_itinerary": {
      /* "Kerala" is a place to plan a trip around; resolving it to the first
         Kerala city in the gazetteer quietly narrowed a whole state to
         Alappuzha. Only take the match when it is what they actually named. */
      const asked = String(args.destination || "").trim();
      const place = findPlaces(asked, 1)[0];
      /* Take the gazetteer's spelling when it is plainly the same place —
         she dictates from speech and writes "Kerela" often enough that the
         traveller would otherwise see their own trip misspelled back at them.
         A near-miss is a typo; anything further is a different place. */
      const sameThing = place && isSamePlace(asked, place.name);
      const destination = sameThing ? place.name : asked;
      if (!destination) return { unavailable: "I need somewhere in India to plan for." };

      const days = Math.min(14, Math.max(1, Number(args.days) || 3));
      /* Parsed as UTC, deliberately. Without the Z, "2026-09-06T00:00:00" is
         local midnight, and toISOString then walks it back across the offset —
         on an IST machine every trip started the day before the one she said. */
      const start = args.startDate && /^\d{4}-\d{2}-\d{2}$/.test(args.startDate)
        ? new Date(`${args.startDate}T00:00:00Z`)
        : new Date(Date.now() + 7 * 864e5);
      const end = new Date(start.getTime() + (days - 1) * 864e5);
      const iso = (d) => d.toISOString().slice(0, 10);

      /* The planner does the writing; she sets it going and talks over it. */
      return {
        planning: destination,
        days,
        from: iso(start),
        to: iso(end),
        navigate: "/itinerary",
        intent: {
          type: "itinerary",
          payload: {
            destination,
            startDate: iso(start),
            endDate: iso(end),
            interests: String(args.interests || "")
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean),
            pace: ["Relaxed", "Moderate", "Packed"].includes(args.pace) ? args.pace : "Moderate",
            budget: String(args.budget || "").replace(/[^\d]/g, ""),
            adults: Math.max(1, Number(args.travellers) || 2),
          },
        },
      };
    }

    case "emergency_sos": {
      /* No lookup, no confirmation. Someone saying they need help should not
         wait on a round trip, and a voice that asks "which city?" first is
         the wrong thing to be in an emergency. */
      return {
        opened: "sos",
        say: "Opening the emergency beacon now. Stay with me.",
        navigate: "/safety",
        intent: { type: "sos", payload: { reason: String(args.reason || "").slice(0, 200) } },
      };
    }

    case "check_safety": {
      const asked = String(args.destination || "").trim();
      if (!asked) return { unavailable: "I need somewhere in India to check." };

      /* The safety hub is organised by state, so this resolves against the
         regions it actually holds rather than the stays city index — that one
         answers "Rajasthan" with "Ajmer", which is a real place and the wrong
         one. Anything outside the list is passed through untouched: the
         advisor takes free text, and a city we cannot map is still a better
         question than a state we guessed at. */
      const near = SAFETY_REGIONS.find((r) => isSamePlace(asked, r));
      const destination = near || asked;

      const focus = ["advisor", "crowd", "directory"].includes(args.focus) ? args.focus : "advisor";
      return {
        checking: destination,
        focus,
        navigate: "/safety",
        intent: { type: "safety", payload: { destination, focus } },
      };
    }

    case "create_reel": {
      const STYLES = ["Trending Reel", "35mm Film", "Polaroid Vlog", "Luxury Gallery"];
      const RATIOS = ["9:16", "4:5", "1:1", "16:9", "4:3"];
      return {
        opening: "diary",
        navigate: "/diary",
        intent: {
          type: "diary",
          payload: {
            tripTitle: String(args.tripTitle || "").slice(0, 80) || null,
            travellers: String(args.travellers || "").slice(0, 60) || null,
            style: STYLES.includes(args.style) ? args.style : null,
            ratio: RATIOS.includes(args.ratio) ? args.ratio : null,
            track: String(args.track || "").slice(0, 60) || null,
          },
        },
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
