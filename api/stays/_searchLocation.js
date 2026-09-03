import { callBooking, fail } from "./_booking.js";
import { findPlaces } from "./_places.js";

/**
 * Destination autocomplete.
 *
 * The local gazetteer answers first: it is instant, costs nothing, and covers
 * the Indian destinations this app is about. Booking.com is only asked when a
 * query finds little or nothing locally — which keeps a 50-call monthly plan
 * for the searches that actually need it, and means the field keeps working
 * when that plan is spent.
 */
export async function searchLocation(req, res) {
  const query = String(req.query.query || "").trim();
  if (query.length < 2) return res.status(200).json({ data: [] });

  const local = findPlaces(query, 8);

  // A confident local match is the whole answer.
  if (local.length >= 3) {
    res.setHeader("Cache-Control", "public, s-maxage=86400");
    return res.status(200).json({ data: local, source: "safarx" });
  }

  try {
    const raw = await callBooking("hotels/searchDestination", { query });
    const rows = Array.isArray(raw.data) ? raw.data : [];

    const remote = rows.slice(0, 8).map((d) => ({
      id: `${d.dest_type}-${d.dest_id}`,
      destId: String(d.dest_id),
      searchType: String(d.search_type || d.dest_type || "city").toUpperCase(),
      destType: d.dest_type,
      name: d.name,
      secondaryText:
        (d.label || [d.region, d.country].filter(Boolean).join(", "))
          .replace(new RegExp(`^${d.name}\\s*,\\s*`), ""),
      country: d.country,
      region: d.region,
      hotels: d.nr_hotels ?? d.hotels ?? null,
      image: d.image_url || null,
      lat: d.latitude ?? null,
      lng: d.longitude ?? null,
      source: "booking",
    }));

    const seen = new Set(local.map((p) => p.name.toLowerCase()));
    const merged = [...local, ...remote.filter((r) => !seen.has(String(r.name).toLowerCase()))];

    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=604800");
    return res.status(200).json({ data: merged.slice(0, 8), source: "booking" });
  } catch (err) {
    // The provider being down or out of quota must not empty the field.
    if (local.length) {
      return res.status(200).json({ data: local, source: "safarx", degraded: true });
    }
    return fail(res, err);
  }
}
