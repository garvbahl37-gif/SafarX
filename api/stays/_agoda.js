import { formatMoney } from "./_booking.js";

/**
 * Agoda, as a third way to answer "where can I stay".
 *
 * Booking and Tripadvisor are both metered monthly and both ran dry, which
 * left the stays panel with nothing to show. Agoda is a separate subscription
 * with its own allowance, so the three fail independently.
 *
 * Two things about this API are worth knowing before reading the mapping.
 * It searches by Agoda's own numeric city id rather than coordinates, so a
 * place name has to be turned into one first. And the hotels are not under
 * `searchResult` where the counts and histograms live — `searchResult` carries
 * only metadata, and the properties hang off `citySearch` beside it.
 */

const HOST = "agoda-com.p.rapidapi.com";

const call = async (path, params) => {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw Object.assign(new Error("Agoda is not configured."), { status: 503 });

  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const res = await fetch(`https://${HOST}/${path}?${query}`, {
    headers: { "x-rapidapi-host": HOST, "x-rapidapi-key": key },
  });
  if (!res.ok) {
    throw Object.assign(new Error(`Agoda returned ${res.status}.`), { status: res.status });
  }
  return res.json();
};

/* One name-to-id lookup per city per warm instance; the ids never move. */
const cityIds = new Map();

/**
 * Agoda's id for a destination, as `<searchType>_<cityId>`.
 * @returns {Promise<string|null>} null when Agoda does not know the place.
 */
export const agodaCityId = async (name) => {
  const key = String(name || "").trim().toLowerCase();
  if (!key) return null;
  if (cityIds.has(key)) return cityIds.get(key);

  const body = await call("hotels/auto-complete", { query: key });
  const places = body?.places || [];
  /* Prefer an Indian city over a neighbourhood or a hotel of the same name —
     asking for "Jaipur" and being handed M.I. Road is not the same search. */
  const place =
    places.find((p) => p.typeName === "City" && p.country?.name === "India") ||
    places.find((p) => p.country?.name === "India") ||
    places[0];

  const id = place ? `${place.searchType}_${place.id}` : null;
  cityIds.set(key, id);
  return id;
};

const imageUrl = (property) => {
  const first = property?.content?.images?.hotelImages?.[0]?.urls?.[0]?.value;
  if (!first) return null;
  // Agoda hands these back protocol-relative.
  return first.startsWith("//") ? `https:${first}` : first;
};

const perNight = (property) => {
  const offer = property?.pricing?.offers?.[0]?.roomOffers?.[0]?.room?.pricing?.[0];
  const price = offer?.price?.perNight?.exclusive;
  if (!price?.display) return null;
  return { amount: price.display, was: price.crossedOutPrice || null, currency: offer.currency };
};

const normalise = (property, { nights, currency, checkIn, checkOut }) => {
  const info = property?.content?.informationSummary || {};
  const reviews = property?.content?.reviews?.cumulative || {};
  const night = perNight(property);
  const money = night?.currency || currency;

  const area = info.address?.area?.name;
  const city = info.address?.city?.name;

  return {
    id: String(property.propertyId),
    provider: "agoda",
    title: info.localeName || info.defaultName || "Unnamed property",
    thumbnail: imageUrl(property),
    // Agoda scores out of 10; the card's dots are out of 5.
    rating: typeof reviews.score === "number" ? Number((reviews.score / 2).toFixed(1)) : null,
    score: reviews.score ?? null,
    scoreWord: null,
    reviewCount: reviews.reviewCount ?? 0,
    stars: info.rating ?? null,
    primaryInfo: info.propertyType || null,
    secondaryInfo: [area, city].filter(Boolean).join(", ") || null,
    amenities: [],
    price: night
      ? {
          displayPrice: formatMoney(night.amount, money),
          totalPrice: formatMoney(night.amount * nights, money),
          freeCancellation: Boolean(property?.pricing?.isEasyCancel),
        }
      : null,
    priceDetails: night
      ? `${formatMoney(night.amount * nights, money)} total for ${nights} night${nights > 1 ? "s" : ""}`
      : null,
    lat: info.geoInfo?.latitude ?? null,
    lng: info.geoInfo?.longitude ?? null,
    checkIn,
    checkOut,
  };
};

/**
 * Stays in a named place.
 * @param {object} args
 * @param {string} args.place a destination name, e.g. "Jaipur"
 * @returns {Promise<object[]>} rows in the shape the result cards already use
 */
export const searchAgoda = async ({
  place, checkIn, checkOut, adults = 2, rooms = 1, currency = "INR", nights = 1,
}) => {
  const id = await agodaCityId(place);
  if (!id) throw Object.assign(new Error(`Agoda does not know ${place}.`), { status: 404 });

  const body = await call("hotels/search-overnight", {
    id,
    checkinDate: checkIn,
    checkoutDate: checkOut,
    adults,
    rooms,
    currency,
  });

  const search = body?.data?.citySearch || {};
  /* Hotels and Agoda Homes are two lists of the same shape; a traveller
     looking for somewhere to sleep does not care which bucket it came from. */
  const rows = [...(search.properties || []), ...(search.highlyRatedAgodaHomes || [])];
  return rows
    .map((row) => normalise(row, { nights, currency, checkIn, checkOut }))
    .filter((row) => row.price);
};
