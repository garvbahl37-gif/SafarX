import { callBooking, fail } from "./_booking.js";

/**
 * Destination autocomplete — what the stays field calls on every keystroke.
 *
 * Booking.com returns cities, districts, landmarks and individual properties
 * for a partial query; the panel needs a stable, flat shape it can render and
 * hand straight back to /api/stays/search.
 */
export default async function handler(req, res) {
  const query = String(req.query.query || "").trim();
  if (query.length < 2) return res.status(200).json({ data: [] });

  try {
    const raw = await callBooking("hotels/searchDestination", { query });
    const rows = Array.isArray(raw.data) ? raw.data : [];

    const data = rows.slice(0, 8).map((d) => ({
      id: `${d.dest_type}-${d.dest_id}`,
      destId: String(d.dest_id),
      searchType: String(d.search_type || d.dest_type || "city").toUpperCase(),
      destType: d.dest_type,
      name: d.name,
      // "Jaipur, Rajasthan, India" minus the name itself, so the two lines
      // of the suggestion do not repeat each other.
      secondaryText:
        (d.label || [d.region, d.country].filter(Boolean).join(", "))
          .replace(new RegExp(`^${d.name}\\s*,\\s*`), ""),
      country: d.country,
      region: d.region,
      hotels: d.nr_hotels ?? d.hotels ?? null,
      image: d.image_url || null,
      lat: d.latitude ?? null,
      lng: d.longitude ?? null,
    }));

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ data });
  } catch (err) {
    return fail(res, err);
  }
}
