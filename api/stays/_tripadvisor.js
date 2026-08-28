/**
 * Tripadvisor (RapidAPI) — the stand-in for Booking.com.
 *
 * Booking's plan allows 50 calls a month, so a single busy afternoon takes the
 * stays feature down. Tripadvisor covers the same ground from a different
 * quota: hotels around a point, and a property page deep enough to fill the
 * detail tabs. Both providers are normalised to one shape here, so the panel
 * neither knows nor cares which one answered.
 */

const HOST = "tripadvisor16.p.rapidapi.com";

export const callTripadvisor = async (path, params) => {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    const err = new Error("RAPIDAPI_KEY is missing on the server.");
    err.status = 503;
    throw err;
  }

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const upstream = await fetch(`https://${HOST}/api/v1/${path}?${qs}`, {
    headers: { "x-rapidapi-key": key, "x-rapidapi-host": HOST },
  });

  if (!upstream.ok) {
    const body = (await upstream.text()).slice(0, 200);
    const err = new Error(`Tripadvisor replied ${upstream.status}.`);
    err.status = upstream.status === 429 ? 429 : 502;
    err.quotaExhausted = /exceeded the MONTHLY quota/i.test(body);
    throw err;
  }

  const body = await upstream.json();
  // The provider answers 200 with status:false when it fails internally.
  if (body.status === false) {
    const err = new Error("Tripadvisor could not answer that.");
    err.status = 502;
    throw err;
  }
  return body.data;
};

const plain = (s) =>
  String(s ?? "").replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").trim();

/** Tripadvisor prefixes ranked results with "1. ", "2. " and so on. */
const cleanTitle = (t) => plain(t).replace(/^\d+\.\s*/, "");

/* The CDN rejects arbitrary height values — 320 came back 400 — but accepts
   h=-1, which scales to the width. Resolve here so the client never guesses. */
const photoUrl = (tpl, w = 800) =>
  typeof tpl === "string" ? tpl.replace("{width}", String(w)).replace("{height}", "-1") : null;

const countFrom = (s) => {
  const digits = String(s ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
};

/** Hotels around a point, in the same shape the Booking search returns. */
export const searchHotelsNear = async ({ lat, lng, checkIn, checkOut, adults, rooms, currency, page = 1 }) => {
  const data = await callTripadvisor("hotels/searchHotelsByLocation", {
    latitude: lat,
    longitude: lng,
    checkIn,
    checkOut,
    pageNumber: page,
    adults,
    rooms,
    currencyCode: currency,
  });

  const rows = data?.data || [];
  return rows
    .filter((r) => r.title)
    .map((r) => ({
      id: String(r.id),
      provider: "tripadvisor",
      title: cleanTitle(r.title),
      thumbnail: photoUrl(r.cardPhotos?.[0]?.sizes?.urlTemplate, 600),
      rating: typeof r.bubbleRating?.rating === "number" ? r.bubbleRating.rating : null,
      score: null,
      scoreWord: null,
      reviewCount: countFrom(r.bubbleRating?.count),
      stars: null,
      primaryInfo: plain(r.primaryInfo) || null,
      secondaryInfo: plain(r.secondaryInfo) || null,
      amenities: /free cancellation/i.test(r.priceDetails || "") ? ["Free cancellation"] : [],
      price: r.priceForDisplay
        ? { displayPrice: plain(r.priceForDisplay), totalPrice: null }
        : null,
      // Tripadvisor quotes a nightly rate and names who is selling it.
      priceDetails: [plain(r.priceDetails), r.provider && `via ${r.provider}`]
        .filter(Boolean)
        .join(" · ") || null,
    }));
};

/** One property, shaped for the detail modal's tabs. */
export const hotelDetails = async ({ id, checkIn, checkOut, currency, want }) => {
  const d = await callTripadvisor("hotels/getHotelDetails", {
    id,
    checkIn,
    checkOut,
    currency,
  });
  if (!d?.title) {
    const err = new Error("That property could not be loaded.");
    err.status = 404;
    throw err;
  }

  const data = {};
  const sections = d.about?.content || [];
  const amenitySection = sections.find((s) => /amenit/i.test(s.title || ""));
  const languages = sections.find((s) => /language/i.test(s.title || ""));

  if (want.has("base")) {
    data.id = String(id);
    data.provider = "tripadvisor";
    data.title = cleanTitle(d.title);
    data.photos = (d.photos || []).slice(0, 14).map((p) => ({ urlTemplate: photoUrl(p.urlTemplate, 1200) }));
    data.rating = typeof d.rating === "number" ? d.rating : null;
    data.score = null;
    data.scoreWord = null;
    data.reviewCount = d.numberReviews ?? 0;
    data.stars = null;
    data.price = null;
    data.about = {
      title: plain(d.rankingDetails) || null,
      description: null,
      tags: (amenitySection?.content || []).map((a) => plain(a.title)).filter(Boolean).slice(0, 10),
    };
    data.checkin = null;
    data.checkout = null;
    data.languages = (languages?.content || []).map((l) => plain(l.content)).filter(Boolean);
    data.location = {
      address: plain(d.location?.address) || null,
      lat: d.geoPoint?.latitude ?? null,
      lng: d.geoPoint?.longitude ?? null,
    };
    data.amenitiesScreen = (d.amenitiesScreen || []).map((s) => ({
      title: plain(s.title),
      content: (s.content || []).map(plain).filter(Boolean),
    }));
    data.checkInDate = checkIn;
    data.checkOutDate = checkOut;
  }

  // Tripadvisor has no room inventory on this endpoint.
  if (want.has("rooms")) data.rooms = [];

  if (want.has("nearby")) {
    data.landmarks = (d.attractionsNearby?.content || [])
      .filter((a) => a.title)
      .slice(0, 10)
      .map((a) => {
        const km = Number(String(a.distance || "").replace(/[^\d.]/g, ""));
        return {
          name: cleanTitle(a.title),
          km: Number.isFinite(km) && km > 0 ? km : null,
          score: typeof a.bubbleRating?.rating === "number" ? a.bubbleRating.rating : null,
        };
      });
  }

  if (want.has("reviews")) {
    const counts = d.reviews?.ratingCounts || {};
    const bucket = (key) => ({
      count: countFrom(counts[key]?.count),
      percentage: Number(counts[key]?.percentage || 0),
    });
    data.reviews = {
      ratingCounts: Object.keys(counts).length
        ? {
            excellent: bucket("excellent"),
            veryGood: bucket("veryGood"),
            average: bucket("average"),
            poor: bucket("poor"),
            terrible: bucket("terrible"),
          }
        : {},
      content: (d.reviews?.content || []).slice(0, 12).map((r) => ({
        title: plain(r.title) || null,
        text: plain(r.text) || null,
        pros: null,
        cons: null,
        score: null,
        publishedDate: plain(r.publishedDate).replace(/^Written\s*/i, ""),
        author: {
          name: plain(r.userProfile?.displayName) || "A traveller",
          type: plain(r.bubbleRatingText) || null,
          countryCode: null,
        },
      })),
    };
  }

  return data;
};
