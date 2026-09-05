/**
 * The trip planner's call to Gemini.
 *
 * This used to construct the prompt and call the model from the browser, using
 * `import.meta.env.VITE_GEMINI_API_KEY`. That variable was never set, so every
 * generation failed with "Failed to generate itinerary" no matter how good the
 * brief was — and setting it would have been the wrong repair, because Vite
 * exposes a `VITE_` variable by writing it into the client bundle, where the
 * key is readable by anyone who opens devtools and spendable on someone else's
 * quota. `api/_server.js` states the rule the rest of the project follows: a
 * secret must never take a VITE_ prefix or reach the client.
 *
 * So the model call moved to `api/itinerary.js`, which holds the key
 * server-side and builds the prompt itself. What is left here is the shaping of
 * the brief and the reporting of what went wrong.
 */

import toast from "react-hot-toast";

/**
 * Writes a day-by-day itinerary from a completed trip brief.
 *
 * @param {object} params the planner's five legs, as the form holds them
 * @returns {Promise<object>} the itinerary, already parsed
 * @throws {Error} carrying a sentence that can be shown to the traveller
 */
export async function generateItinerary(params) {
  const {
    state, startDate, endDate, startTime, endTime, destination,
    pace, travelStyle, interests, travelingWithChildren, travelingWithSeniors,
    budget, specialRequests,
  } = params || {};

  // Who is going, in the words the prompt asks for.
  const travellers = ["Adults"]
    .concat(travelingWithChildren ? "children" : [])
    .concat(travelingWithSeniors ? "seniors" : [])
    .join(", ");

  toast.loading("Planning your trip…", { id: "itinerary" });

  let response;
  try {
    response = await fetch("/api/itinerary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        destination,
        state,
        startDate,
        endDate,
        startTime,
        endTime,
        pace,
        travelStyle,
        interests: Array.isArray(interests) ? interests.join(", ") : interests || "",
        travellers,
        budget,
        specialRequests,
      }),
    });
  } catch {
    toast.dismiss("itinerary");
    toast.error("Couldn't reach the planner — check your connection.");
    throw new Error("network");
  }

  if (!response.ok) {
    /* The server says which side failed and why; repeating "try again" at
       someone whose key is missing just sends them round the loop. */
    const detail = await response.json().catch(() => ({}));
    const message = detail.error || "The planner could not write this trip.";
    toast.dismiss("itinerary");
    toast.error(message);
    throw new Error(message);
  }

  const itinerary = await response.json();
  toast.dismiss("itinerary");
  toast.success("Your itinerary is ready");
  return itinerary;
}
