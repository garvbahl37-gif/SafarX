import { callBooking, formatMoney, fail } from "./_booking.js";
import { hotelDetails as tripadvisorDetails } from "./_tripadvisor.js";
import { rateLimit, clientIp } from "../trains/_ratelimit.js";

/**
 * One property in full.
 *
 * Booking splits a property across several endpoints, so this fans out and
 * merges them: the property itself, its description, its rooms and their
 * rates, real guest reviews with the score distribution, and the landmarks
 * around it. Each is settled independently — a missing piece hides its
 * section rather than emptying the modal.
 */

/* Review text is written by the public. It is rendered as text, never HTML. */
const plain = (s) =>
  String(s ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .trim();

const bucket = (rows) => {
  const at = (score) => rows.find((r) => Number(r.score) === score) || {};
  const sum = (...scores) =>
    scores.reduce(
      (acc, s) => {
        const row = at(s);
        acc.count += Number(row.count || 0);
        acc.percentage += Number(row.percent || 0);
        return acc;
      },
      { count: 0, percentage: 0 }
    );
  const round = (b) => ({ count: b.count, percentage: Math.round(b.percentage) });
  return {
    excellent: round(sum(9, 10)),
    veryGood: round(sum(7, 8)),
    average: round(sum(5, 6)),
    poor: round(sum(3, 4)),
    terrible: round(sum(1, 2)),
  };
};

export default async function handler(req, res) {
  /* These calls cost metered quota, and the endpoint is public. */
  const burst = rateLimit(`detail:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!burst.ok) {
    res.setHeader("Retry-After", String(burst.retryAfter));
    return res.status(429).json({ error: "Too many searches from this connection. Try again shortly." });
  }

  const { id, checkIn, checkOut, adults = 2, rooms = 1, currency = "INR", parts = "base", provider } = req.query;
  const want = new Set(String(parts).split(","));

  const viaTripadvisor = async () => {
    const data = await tripadvisorDetails({ id, checkIn, checkOut, currency, want });
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ data });
  };

  /* A result card knows which provider produced it, and its id only means
     something to that provider. */
  if (provider === "tripadvisor") return viaTripadvisor().catch((err) => fail(res, err));
  if (!id || !checkIn || !checkOut) {
    return res.status(400).json({ error: "id, checkIn and checkOut are all required." });
  }

  const stay = {
    hotel_id: id,
    arrival_date: checkIn,
    departure_date: checkOut,
    adults,
    room_qty: rooms,
    currency_code: currency,
  };

  try {
    // The plan allows very few calls a month, so nothing is fetched
    // speculatively — each tab pays for itself the first time it is opened.
    const skip = Promise.resolve({ status: "fulfilled", value: null });
    const maybe = (wanted, call) => (wanted ? call().then(
      (value) => ({ status: "fulfilled", value }),
      (reason) => ({ status: "rejected", reason })
    ) : skip);

    const [property, description, reviews, scores, roomList, landmarks] = await Promise.all([
      maybe(want.has("base"), () => callBooking("hotels/getHotelDetails", stay)),
      maybe(want.has("base"), () => callBooking("hotels/getDescriptionAndInfo", { hotel_id: id, languagecode: "en-us" })),
      maybe(want.has("reviews"), () => callBooking("hotels/getHotelReviews", { ...stay, sort_option_id: "sort_most_relevant", page_number: 1 })),
      maybe(want.has("reviews"), () => callBooking("hotels/getHotelReviewScores", { hotel_id: id, languagecode: "en-us" })),
      maybe(want.has("rooms"), () => callBooking("hotels/getRoomList", stay)),
      maybe(want.has("nearby"), () => callBooking("hotels/getPopularAttractionNearBy", { hotel_id: id, languagecode: "en-us" })),
    ]);

    const val = (settled, fallback) =>
      settled.status === "fulfilled" ? settled.value?.data ?? fallback : fallback;

    const d = val(property, {});
    if (want.has("base") && !d.hotel_name) {
      const reason = property.status === "rejected" ? property.reason : null;
      throw reason || Object.assign(new Error("That property could not be loaded."), { status: 404 });
    }

    const meta = d.rawData || {};
    const price = d.composite_price_breakdown || {};
    const perNight = price.gross_amount_per_night;

    /* Photos: the room galleries carry far more than the property header. */
    const photos = [];
    const seen = new Set();
    for (const room of Object.values(d.rooms || {})) {
      for (const photo of room.photos || []) {
        const url = photo.url_max1280 || photo.url_max750 || photo.url_original;
        if (url && !seen.has(photo.photo_id)) {
          seen.add(photo.photo_id);
          photos.push({ urlTemplate: url });
        }
        if (photos.length >= 14) break;
      }
      if (photos.length >= 14) break;
    }

    /* Rooms on offer for these dates. */
    const blocks = val(roomList, {}).block || [];
    const roomOptions = [];
    const seenRooms = new Set();
    for (const b of blocks) {
      const name = b.room_name || b.name;
      if (!name || seenRooms.has(name)) continue;
      seenRooms.add(name);
      const nightly = b.product_price_breakdown?.gross_amount_per_night;
      const beds = (b.bed_configurations?.[0]?.bed_types || [])
        .map((bed) => bed.name_with_count || bed.name)
        .filter(Boolean);
      roomOptions.push({
        id: String(b.block_id || name),
        name: name.split(":")[0].trim(),
        detail: name.includes(":") ? name.split(":").slice(1).join(":").trim() : null,
        sleeps: b.max_occupancy ? Number(b.max_occupancy) : null,
        beds,
        pricePerNight: nightly ? formatMoney(nightly.value, nightly.currency || currency) : null,
        refundable: Boolean(b.refundable),
        breakfast: Boolean(b.breakfast_included),
      });
      if (roomOptions.length >= 8) break;
    }

    /* Guest reviews — pros and cons kept apart, as Booking collects them. */
    const reviewRows = val(reviews, {}).result || [];
    const content = reviewRows
      .filter((r) => plain(r.pros) || plain(r.cons))
      .slice(0, 12)
      .map((r) => ({
        title: plain(r.title) || null,
        pros: plain(r.pros) || null,
        cons: plain(r.cons) || null,
        score: typeof r.average_score === "number" ? Number(r.average_score.toFixed(1)) : null,
        publishedDate: (r.date || "").slice(0, 10),
        author: {
          name: plain(r.author?.name) || "A guest",
          type: plain(r.author?.type_string) || null,
          countryCode: r.author?.countrycode || null,
        },
      }));

    const distribution = val(scores, [])[0]?.score_distribution || [];

    const near = val(landmarks, {});
    const places = [...(near.closest_landmarks || []), ...(near.popular_landmarks || [])]
      .filter((l) => l.tag)
      .slice(0, 10)
      .map((l) => ({
        name: plain(l.tag),
        km: typeof l.distance === "number" ? Number(l.distance.toFixed(1)) : null,
        score: typeof l.average_out_of_10 === "number" ? l.average_out_of_10 : null,
      }));

    const blurb = (val(description, []) || [])
      .map((row) => plain(row.description))
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || null;

    const km = typeof d.distance_to_cc === "number" ? d.distance_to_cc.toFixed(1) : null;
    // Booking names the category in the plural ("Hotels", "Homestays").
    const kind = (d.accommodation_type_name || "").replace(/s$/, "");

    /* Only what was asked for — the client merges parts as tabs open. */
    const data = {};

    if (want.has("base")) {
      data.id = String(d.hotel_id ?? id);
      data.provider = "booking";
      data.title = d.hotel_name;
      data.photos = photos;
      data.rating = typeof meta.reviewScore === "number" ? Number((meta.reviewScore / 2).toFixed(1)) : null;
      data.score = meta.reviewScore ?? null;
      data.scoreWord = meta.reviewScoreWord || null;
      // The header shows the tally before the reviews tab is ever opened, and
      // getHotelDetails already carries it — no extra call for this.
      data.reviewCount = meta.reviewCount ?? d.review_nr ?? 0;
      data.stars = meta.accuratePropertyClass || meta.propertyClass || null;
      data.price = perNight
        ? {
            displayPrice: formatMoney(perNight.value, perNight.currency || currency),
            totalPrice: formatMoney(price.gross_amount?.value, price.gross_amount?.currency || currency),
          }
        : null;
      data.about = {
        title: [kind, d.district && `in ${d.district}`, km && `${km} km from the centre`]
          .filter(Boolean)
          .join(" · "),
        description: blurb,
        tags: (d.property_highlight_strip || []).map((h) => h.name).filter(Boolean),
      };
      data.checkin = d.checkin?.from ? `${d.checkin.from}${d.checkin.until ? ` – ${d.checkin.until}` : ""}` : null;
      data.checkout = d.checkout?.until ? `${d.checkout.from ? `${d.checkout.from} – ` : ""}${d.checkout.until}` : null;
      data.location = {
        address: [d.address, d.city, d.country_trans].filter(Boolean).join(", "),
        lat: d.latitude ?? null,
        lng: d.longitude ?? null,
      };
      data.amenitiesScreen = (d.facilities_block?.facilities || []).length
        ? [{
            title: d.facilities_block.name || "Facilities",
            content: d.facilities_block.facilities.map((f) => f.name),
          }]
        : [];
      data.checkInDate = d.arrival_date || checkIn;
      data.checkOutDate = d.departure_date || checkOut;
    }

    if (want.has("rooms")) data.rooms = roomOptions;
    if (want.has("nearby")) data.landmarks = places;
    if (want.has("reviews")) {
      // Score and tally come from the base load; this adds only what the
      // reviews endpoints know.
      data.reviews = {
        ratingCounts: distribution.length ? bucket(distribution) : {},
        content,
      };
    }

    // A property's facts barely move within a day, and the plan is small.
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ data });
  } catch (err) {
    try {
      return await viaTripadvisor();
    } catch {
      return fail(res, err);
    }
  }
}
