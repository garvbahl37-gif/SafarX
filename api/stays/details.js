import { callBooking, formatMoney, fail } from "./_booking.js";

/**
 * One property in full — photos, facilities and the nightly rate for the
 * chosen dates, shaped for the detail modal.
 *
 * Booking's details response carries no review text, so the reviews tab shows
 * the score and count only; inventing quotes would be worse than showing none.
 */
export default async function handler(req, res) {
  const { id, checkIn, checkOut, adults = 2, rooms = 1, currency = "INR" } = req.query;
  if (!id || !checkIn || !checkOut) {
    return res.status(400).json({ error: "id, checkIn and checkOut are all required." });
  }

  try {
    const raw = await callBooking("hotels/getHotelDetails", {
      hotel_id: id,
      arrival_date: checkIn,
      departure_date: checkOut,
      adults,
      room_qty: rooms,
      currency_code: currency,
    });

    const d = raw?.data || {};
    const meta = d.rawData || {};
    const price = d.composite_price_breakdown || {};
    const perNight = price.gross_amount_per_night;

    const photos = [];
    const seen = new Set();
    for (const room of Object.values(d.rooms || {})) {
      for (const photo of room.photos || []) {
        const url = photo.url_max1280 || photo.url_max750 || photo.url_original;
        if (url && !seen.has(photo.photo_id)) {
          seen.add(photo.photo_id);
          photos.push({ urlTemplate: url });
        }
        if (photos.length >= 12) break;
      }
      if (photos.length >= 12) break;
    }

    const highlights = (d.property_highlight_strip || []).map((h) => h.name).filter(Boolean);
    const facilities = (d.facilities_block?.facilities || []).map((f) => f.name);

    const km = typeof d.distance_to_cc === "number" ? d.distance_to_cc.toFixed(1) : null;
    // Booking names the category in the plural ("Hotels", "Homestays").
    const kind = (d.accommodation_type_name || "").replace(/s$/, "");

    return res.status(200).json({
      data: {
        id: String(d.hotel_id ?? id),
        title: d.hotel_name,
        photos,
        rating: typeof meta.reviewScore === "number" ? Number((meta.reviewScore / 2).toFixed(1)) : null,
        score: meta.reviewScore ?? null,
        scoreWord: meta.reviewScoreWord || null,
        price: perNight
          ? {
              displayPrice: formatMoney(perNight.value, perNight.currency || currency),
              totalPrice: formatMoney(price.gross_amount?.value, price.gross_amount?.currency || currency),
              freeCancellation: Boolean(d.free_facilities_cancel_breakfast?.cancellation),
            }
          : null,
        about: {
          title: [kind, d.district && `in ${d.district}`, km && `${km} km from the centre`]
            .filter(Boolean)
            .join(" · "),
          tags: highlights,
        },
        location: {
          address: [d.address, d.city, d.country_trans].filter(Boolean).join(", "),
        },
        amenitiesScreen: facilities.length
          ? [{ title: d.facilities_block?.name || "Facilities", content: facilities }]
          : [],
        reviews: {
          ratingValue: meta.reviewScore ?? null,
          count: meta.reviewCount ?? d.review_nr ?? 0,
          content: [],
        },
        checkIn: d.arrival_date || checkIn,
        checkOut: d.departure_date || checkOut,
      },
    });
  } catch (err) {
    return fail(res, err);
  }
}
