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
import json
import math
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
EXT = ROOT / "data" / "recsys" / "_external"
HOTELS = EXT / "kg_PromptCloudHQ_hotels-on-makemytrip" / "makemytrip_com-travel_sample.csv"
ZOMATO = EXT / "kg_shrutimehta_zomato-restaurants-data" / "zomato.csv"
# The same idea at forty times the size, and India-only: 211,944 rows covering
# 55,568 restaurants, each repeated once per cuisine it serves.
ZOMATO_IN = EXT / "kg_rabhar_zomato-restaurants-in-india" / "zomato_restaurants_in_India.csv"
# 8,990 railway stations, already carrying a state, so no inference needed.
# SafarX tracks trains; a station is a place people go to and plan around.
STATIONS = EXT / "kg_sripaadsrinivasan_indian-railways-dataset" / "stations.json"
# 253 dishes, each with the state it belongs to. Not a restaurant — the dish
# itself, which is what somebody means by "what should I eat in Bengal".
DISHES = EXT / "kg_nehaprabhavalkar_indian-food-101" / "indian_food.csv"
# 212 cities with coordinates. The catalogue held 133, which for a country of
# this size was the thinnest thing in it after accommodation.
CITIES = EXT / "kg_parulpandey_indian-cities-database" / "Indian Cities Database.csv"
# 345 airfields, of which 119 are real airports rather than heliports, closed
# strips or airstrips. SafarX tracks flights; these are where they land.
AIRPORTS = (EXT / "kg_bhanupratapbiswas_list-of-airports-in-india" /
            "list-of-airports-in-india-hxl-tags-1.csv")
# 38 Indian UNESCO World Heritage sites. Used to mark places already in the
# catalogue rather than to add new ones — see below.
UNESCO = EXT / "kg_ujwalkandi_unesco-world-heritage-sites" / "whc-sites-2019.csv"

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

    # Zomato India: bigger, India-only, and repeated once per cuisine, so the
    # restaurant id is what makes a row unique rather than the row itself.
    if ZOMATO_IN.exists():
        seen_res = set()
        for r in csv.DictReader(ZOMATO_IN.open(encoding="utf-8", errors="replace")):
            rid = (r.get("res_id") or "").strip()
            if not rid or rid in seen_res:
                continue
            seen_res.add(rid)
            lat, lng = _f(r.get("latitude")), _f(r.get("longitude"))
            name = (r.get("name") or "").strip()
            if not name or not lat or not lng:
                continue
            state = locator.state_of(lat, lng)
            if not state:
                dropped += 1
                continue
            rating = _f(r.get("aggregate_rating"))
            out.append({
                "item_id": f"zin-{rid}",
                "kind": "restaurant",
                "title": name[:120], "state": state, "region": "",
                "category": "food", "lat": lat, "lng": lng,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None,
                "cuisine": (r.get("cuisines") or "").strip()[:80],
                "rating": rating if rating else "",
                "reviews": int(_f(r.get("votes")) or 0),
                "fee_inr": _f(r.get("average_cost_for_two")) or "",
                "visit_hours": 1.5, "best_time": "", "weekly_off": "None",
                "dslr_allowed": "", "established": "", "significance": "Food",
                "_source": "kaggle",
            })

    # Railway stations. Their state is given, so they bypass the locator.
    if STATIONS.exists():
        blob = json.loads(STATIONS.read_text(encoding="utf-8", errors="replace"))
        for feat in blob.get("features", []):
            props = feat.get("properties") or {}
            coords = (feat.get("geometry") or {}).get("coordinates") or []
            name, state = (props.get("name") or "").strip(), (props.get("state") or "").strip()
            if not name or len(coords) < 2:
                continue
            # More than half the stations — 4,593 of 8,990 — carry no state in
            # the source. They all carry coordinates, so the locator answers
            # for them rather than throwing away half the rail network.
            if not state:
                state = locator.state_of(coords[1], coords[0])
            if not state:
                dropped += 1
                continue
            out.append({
                "item_id": f"rail-{(props.get('code') or name)[:20].strip()}",
                "kind": "railway station",
                "title": f"{name} railway station"[:120],
                "state": state, "region": "",
                "category": "transport", "lat": coords[1], "lng": coords[0],
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None, "cuisine": "",
                "rating": "", "reviews": 0, "fee_inr": "", "visit_hours": "",
                "best_time": "", "weekly_off": "None", "dslr_allowed": "",
                "established": "", "significance": "Transport",
                "_source": "kaggle",
            })

    # Dishes. These have no coordinates and never will — a dish belongs to a
    # state, not to a point — so they sit in the catalogue the way a festival
    # does, reachable by state and category rather than by distance.
    if DISHES.exists():
        for r in csv.DictReader(DISHES.open(encoding="utf-8", errors="replace")):
            name = (r.get("name") or "").strip()
            state = (r.get("state") or "").strip()
            if not name or state in ("", "-1"):
                continue
            out.append({
                "item_id": f"dish-{name.lower().replace(' ', '-')[:40]}",
                "kind": "dish",
                "title": name[:120], "state": state, "region": "",
                "category": "food", "lat": None, "lng": None,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None,
                "cuisine": (r.get("flavor_profile") or "").strip(),
                "rating": "", "reviews": 0, "fee_inr": "", "visit_hours": "",
                "best_time": "", "weekly_off": "None", "dslr_allowed": "",
                "established": "",
                "significance": (r.get("course") or "Food").strip().title(),
                "_source": "kaggle",
            })

    # Cities. Real administrative places, and the anchor every synthetic user
    # is given a home in, so a thin list here narrows the whole population.
    if CITIES.exists():
        for r in csv.DictReader(CITIES.open(encoding="utf-8", errors="replace")):
            lat, lng = _f(r.get("Lat")), _f(r.get("Long"))
            name, state = (r.get("City") or "").strip(), (r.get("State") or "").strip()
            if not name or lat is None or lng is None:
                continue
            out.append({
                "item_id": f"city-{name.lower().replace(' ', '-')[:34]}",
                "kind": "place", "title": name[:120],
                "state": state or (locator.state_of(lat, lng) or ""),
                "region": "", "category": "city", "lat": lat, "lng": lng,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None, "cuisine": "",
                "rating": "", "reviews": 0, "fee_inr": "", "visit_hours": "",
                "best_time": "", "weekly_off": "None", "dslr_allowed": "",
                "established": "", "significance": "City",
                "_source": "kaggle",
            })

    # Airports — the ones aircraft actually schedule into. Heliports, closed
    # strips and small airfields are dropped: 345 rows become 119 places a
    # traveller could plausibly arrive at.
    if AIRPORTS.exists():
        for r in csv.DictReader(AIRPORTS.open(encoding="utf-8", errors="replace")):
            if (r.get("type") or "") not in ("large_airport", "medium_airport"):
                continue
            lat, lng = _f(r.get("latitude_deg")), _f(r.get("longitude_deg"))
            name = (r.get("name") or "").strip()
            if not name or lat is None or lng is None:
                continue
            state = locator.state_of(lat, lng)
            if not state:
                dropped += 1
                continue
            out.append({
                "item_id": f"air-{(r.get('iata_code') or r.get('ident') or name)[:16].strip()}",
                "kind": "airport", "title": name[:120], "state": state,
                "region": "", "category": "transport", "lat": lat, "lng": lng,
                "media_count": 1, "difficulty": "easy",
                "cost_per_day": None, "duration_days": None, "cuisine": "",
                "rating": "", "reviews": 0, "fee_inr": "", "visit_hours": "",
                "best_time": "", "weekly_off": "None", "dslr_allowed": "",
                "established": "", "significance": "Transport",
                "_source": "kaggle",
            })

    return out, dropped


def mark_unesco(items):
    """
    Flag catalogue items that are UNESCO World Heritage sites.

    Adding these as items would have produced 38 duplicates: the Red Fort,
    Humayun's Tomb and Qutb Minar are already here, under shorter names than
    UNESCO's ("Qutb Minar and its Monuments, Delhi"), so a name match would
    have missed and a new row would have been created beside the old one.
    Position alone is not enough either, and the first attempt proved it:
    nearest-within-two-kilometres marked "Alay Palace Room & Restaurant" and
    "Guards' Barracks" as World Heritage Sites, because at a site the size of
    Ellora the closest mapped node is an individual cave or a cafe. Calling a
    restaurant a World Heritage Site is worse than not marking it at all.

    So a candidate has to be near it AND share a distinctive word with its
    name AND be the kind of thing that could be one — heritage, culture or
    spiritual, not a hotel. Where nothing qualifies, nothing is marked; thirty
    plausible-looking marks were worth less than a dozen correct ones.

    Twenty-four survive that, and they are recognisably right — the Taj,
    Ajanta, Ellora, Hampi, Bhimbetka, Nalanda, Pattadakal, the Chola temples.
    A handful land on a building inside the inscribed area rather than on the
    site itself, Sanchi's museum standing in for the stupas; near enough to be
    useful, and flagged here rather than presented as exact.

    It is worth marking at all because World Heritage status is a real and
    unusually strong popularity signal, and the catalogue had no way to say it.
    """
    STOP = {"the", "of", "and", "its", "at", "in", "de", "site", "sites",
            "monument", "monuments", "complex", "group", "national", "park",
            "temple", "fort", "city", "caves", "cave", "church", "churches",
            "great", "living", "india", "indian"}

    def tokens(text):
        return {w for w in re.split(r"[^a-z]+", (text or "").lower())
                if len(w) > 3 and w not in STOP}

    if not UNESCO.exists():
        return 0
    grid = {}
    for it in items:
        if it.get("lat") is not None and not it.get("coords_from_state"):
            grid.setdefault((int(it["lat"] / CELL), int(it["lng"] / CELL)), []).append(it)

    marked = 0
    for r in csv.DictReader(UNESCO.open(encoding="utf-8", errors="replace")):
        if "india" not in (r.get("states_name_en") or "").lower():
            continue
        lat, lng = _f(r.get("latitude")), _f(r.get("longitude"))
        if lat is None or lng is None:
            continue
        want = tokens(r.get("name_en"))
        gx, gy = int(lat / CELL), int(lng / CELL)
        best, best_d = None, 8.0
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for it in grid.get((gx + dx, gy + dy), ()):
                    if it["category"] not in ("heritage", "culture", "spiritual"):
                        continue
                    if not (want & tokens(it["title"])):
                        continue
                    d = _haversine(lat, lng, it["lat"], it["lng"])
                    if d < best_d:
                        best, best_d = it, d
        if best is not None:
            best["significance"] = "UNESCO World Heritage"
            best["unesco"] = True
            marked += 1
    return marked
