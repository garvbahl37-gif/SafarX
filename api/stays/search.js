import { callBooking, formatMoney, fail } from "./_booking.js";
import { searchHotelsNear } from "./_tripadvisor.js";

const nightsBetween = (from, to) =>
  Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));

/** Booking states the neighbourhood and distance in its a11y label; nothing else carries it. */
const placeLine = (label) => {
  if (!label) return null;
  const line = label
    .split("\n")
    .map((l) => l.replace(/[‎‬]/g, "").trim())
    .find((l) => /km from centre|km from center/i.test(l));
  return line || null;
};

const perks = (label = "") => {
  const found = [];
  if (/free cancellation/i.test(label)) found.push("Free cancellation");
  if (/breakfast/i.test(label)) found.push("Breakfast included");
  if (/no prepayment/i.test(label)) found.push("No prepayment");
  return found;
};

/**
 * Hotel search for a chosen destination.
 *
 * Maps Booking's property rows onto the shape the result cards already use,
 * so the panel renders the same whichever provider is behind it.
 */
export default async function handler(req, res) {
  const {
    destId, searchType = "CITY", checkIn, checkOut,
    adults = 2, rooms = 1, rating = 0, sort, page = 1,
    currency = "INR", lat, lng,
  } = req.query;

  if (!checkIn || !checkOut || (!destId && !(lat && lng))) {
    return res
      .status(400)
      .json({ error: "Dates plus either destId or a lat/lng are required." });
  }

  /* Tripadvisor searches around a point, so it can stand in for any
     destination the gazetteer or Booking gave coordinates for. */
  const viaTripadvisor = async () => {
    if (!lat || !lng) throw Object.assign(new Error("No coordinates to search around."), { status: 502 });
    const results = await searchHotelsNear({
      lat, lng, checkIn, checkOut, adults, rooms, currency, page,
    });
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({
      data: results,
      meta: { nights: nightsBetween(checkIn, checkOut), count: results.length, currency, provider: "tripadvisor" },
    });
  };

  if (!destId) return viaTripadvisor().catch((err) => fail(res, err));

  try {
    const raw = await callBooking("hotels/searchHotels", {
      dest_id: destId,
      search_type: String(searchType).toUpperCase(),
      arrival_date: checkIn,
      departure_date: checkOut,
      adults,
      room_qty: rooms,
      page_number: page,
      currency_code: currency,
      sort_by: sort || undefined,
      // Booking wants the star filter as a class list, not a number.
      categories_filter: Number(rating) > 0 ? `class::${rating}` : undefined,
    });

    const rows = raw?.data?.hotels || [];
    const nights = nightsBetween(checkIn, checkOut);

    const results = rows.map((row) => {
      const p = row.property || {};
      const gross = p.priceBreakdown?.grossPrice;
      const amenities = perks(row.accessibilityLabel);

      return {
        id: String(row.hotel_id),
        provider: "booking",
        title: p.name,
        thumbnail: p.photoUrls?.[0] || null,
        // Booking scores out of 10; the card's dots are out of 5.
        rating: typeof p.reviewScore === "number" ? Number((p.reviewScore / 2).toFixed(1)) : null,
        score: p.reviewScore ?? null,
        scoreWord: p.reviewScoreWord || null,
        reviewCount: p.reviewCount ?? 0,
        stars: p.accuratePropertyClass || p.propertyClass || null,
        primaryInfo: [p.reviewScoreWord, ...amenities].filter(Boolean).join(" · ") || null,
        secondaryInfo: placeLine(row.accessibilityLabel) || p.wishlistName || null,
        amenities,
        // Booking quotes the whole stay; the card leads on the nightly rate.
        price: gross
          ? {
              displayPrice: formatMoney(gross.value / nights, gross.currency || currency),
              totalPrice: formatMoney(gross.value, gross.currency || currency),
              freeCancellation: amenities.includes("Free cancellation"),
            }
          : null,
        priceDetails: gross
          ? `${formatMoney(gross.value, gross.currency || currency)} total for ${nights} night${nights > 1 ? "s" : ""}`
          : null,
        lat: p.latitude ?? null,
        lng: p.longitude ?? null,
        checkIn: p.checkinDate || checkIn,
        checkOut: p.checkoutDate || checkOut,
      };
    });

    return res.status(200).json({
      data: results,
      meta: { nights, count: results.length, currency, provider: "booking" },
    });
  } catch (err) {
    // Booking out of quota or down: the search still happens, elsewhere.
    try {
      return await viaTripadvisor();
    } catch {
      return fail(res, err);
    }
  }
}
