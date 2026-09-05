"""
Hotels and restaurants from Kaggle, with the attributes OSM does not carry.

OSM knows the name and position of 25,000 restaurants and a few hundred places
to stay. It does not know what any of them costs, how they are rated, or how
many people rated them — which is most of what a person actually chooses on.
These two tables do.

  MakeMyTrip hotels — 19,589 Indian properties with coordinates, star rating,
  review score and review count. The `stay` category was the thinnest thing in
  the catalogue; this is the bulk of it.

  Zomato restaurants — 8,652 Indian restaurants with coordinates, cuisines,
  average cost for two, rating and vote count. Cost is the useful part: a
  budget term is meaningless when nothing states a price.

NEITHER TABLE NAMES A STATE, which the catalogue keys on. Both give
coordinates, and the catalogue already holds a hundred thousand placed items,
so the state is read off the nearest one rather than guessed from a city name —
city names in these files are written every which way ("NewDelhiAndNCR"), and a
lookup table of them would be wrong in ways nobody would notice. A row with no
neighbour inside 60km is dropped rather than placed in a state it might not be
in.
"""
import csv
import math
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
EXT = ROOT / "data" / "recsys" / "_external"
HOTELS = EXT / "kg_PromptCloudHQ_hotels-on-makemytrip" / "makemytrip_com-travel_sample.csv"
ZOMATO = EXT / "kg_shrutimehta_zomato-restaurants-data" / "zomato.csv"

# Degrees, for the grid the nearest-neighbour search walks. Half a degree is
# roughly 55km, so a 3x3 block of cells always covers the 60km radius.
CELL = 0.5
MAX_KM = 60.0


def _f(v):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return None


def _haversine(a_lat, a_lng, b_lat, b_lng):
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp, dl = math.radians(b_lat - a_lat), math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


class StateLocator:
    """Which Indian state a coordinate falls in, by nearest placed item."""

    def __init__(self, items):
        self.grid = {}
        for it in items:
            lat, lng, st = it.get("lat"), it.get("lng"), it.get("state")
            # Items whose position was borrowed from their state capital would
            # answer every query with that state; they are excluded.
            if lat is None or lng is None or not st or it.get("coords_from_state"):
                continue
            self.grid.setdefault((int(lat / CELL), int(lng / CELL)), []).append((lat, lng, st))

    def state_of(self, lat, lng):
        gx, gy = int(lat / CELL), int(lng / CELL)
        best, best_d = None, MAX_KM
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for plat, plng, st in self.grid.get((gx + dx, gy + dy), ()):
                    d = _haversine(lat, lng, plat, plng)
                    if d < best_d:
                        best, best_d = st, d
        return best


def _star_kind(v):
    s = (v or "").lower()
    for n in ("5", "4", "3", "2", "1"):
        if n in s:
            return f"{n}-star hotel"
    if "home" in s or "guest" in s:
        return "guest house"
    return "hotel"


def load(locator):
    """Both tables as catalogue items. Rows without a state are dropped."""
    out, dropped = [], 0

    if HOTELS.exists():
        for r in csv.DictReader(HOTELS.open(encoding="utf-8", errors="replace")):
            lat, lng = _f(r.get("latitude")), _f(r.get("longitude"))
            name = (r.get("property_name") or "").strip()
            if not name or lat is None or lng is None:
                continue
            state = locator.state_of(lat, lng)
            if not state:
                dropped += 1
                continue
            score = _f(r.get("mmt_review_score"))
            out.append({
                "item_id": f"mmt-{(r.get('uniq_id') or name)[:28].strip().replace(' ', '-').lower()}",
                "kind": _star_kind(r.get("hotel_star_rating")),
                "title": name[:120], "state": state, "region": "",
                "category": "stay", "lat": lat, "lng": lng,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None, "cuisine": "",
                "rating": score if score else "",
                "reviews": int(_f(r.get("mmt_review_count")) or 0),
                "fee_inr": "", "visit_hours": "", "best_time": "",
                "weekly_off": "None", "dslr_allowed": "", "established": "",
                "significance": "Accommodation",
                "_source": "kaggle",
            })

    if ZOMATO.exists():
        for r in csv.DictReader(ZOMATO.open(encoding="latin-1")):
            if (r.get("Country Code") or "").strip() != "1":       # India only
                continue
            lat, lng = _f(r.get("Latitude")), _f(r.get("Longitude"))
            name = (r.get("Restaurant Name") or "").strip()
            # Zomato carries a scattering of 0,0 coordinates.
            if not name or not lat or not lng:
                continue
            state = locator.state_of(lat, lng)
            if not state:
                dropped += 1
                continue
            rating = _f(r.get("Aggregate rating"))
            out.append({
                "item_id": f"zom-{(r.get('Restaurant ID') or name)[:28].strip()}",
                "kind": "restaurant",
                "title": name[:120], "state": state, "region": "",
                "category": "food", "lat": lat, "lng": lng,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None,
                "cuisine": (r.get("Cuisines") or "").strip()[:80],
                "rating": rating if rating else "",
                "reviews": int(_f(r.get("Votes")) or 0),
                # Cost for two, which is how Indian restaurant pricing is
                # quoted. Kept in the fee column so one budget term covers
                # both an entrance ticket and a meal.
                "fee_inr": _f(r.get("Average Cost for two")) or "",
                "visit_hours": 1.5, "best_time": "", "weekly_off": "None",
                "dslr_allowed": "", "established": "",
                "significance": "Food",
                "_source": "kaggle",
            })

    return out, dropped
