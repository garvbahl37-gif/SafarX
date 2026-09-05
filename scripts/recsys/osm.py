"""
Pulls real, named tourism POIs out of OpenStreetMap.

Wikidata gave the famous places — the forts and the national parks — and ran
out at roughly forty thousand. OSM is the other half: it holds the ordinary
ones, the restaurants and viewpoints and neighbourhood temples that nobody
writes an encyclopaedia article about but that a traveller actually goes to.
It is also where the food comes from, since Wikidata knows seventy Indian
restaurants and OSM knows a hundred times that.

Two rules keep the catalogue honest:

  Everything must have a name. An unnamed node is a dot on a map — it cannot
  be recommended, displayed, or evaluated against, and a catalogue padded with
  them would be bigger and worse.

  Queries run one state at a time. It keeps each request inside the public
  endpoint's timeout, and it means every row knows which state it is in
  without any reverse geocoding.

A KNOWN GAP, recorded rather than quietly left. Both passes ask only for
`node`. A great many features are mapped in OSM as ways — a fort is usually
the polygon of its walls, a park and a beach are areas, a large temple is a
building outline — and none of those are collected here. Adding them means
`way[...]` with `out center;` to get a representative point, which roughly
doubles the cost of an already slow sweep.

How much is missed is unmeasured: the attempt to count it ran while both
Overpass slots were occupied by this same harvest and returned nothing. Some
of it will be duplicates, since a well-mapped POI often carries both a node and
a way, and the catalogue would merge those on name and position anyway. The
honest summary is that the node-only sweep is a floor on what OSM holds, not a
ceiling, and `adventure` at around a hundred items is the category where that
shows most — trekking routes are relations, which this never asks for.

    python3 scripts/recsys/osm.py count      # what is out there
    python3 scripts/recsys/osm.py harvest    # pull it down (slow, resumable)
"""
import json
import os
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
# Two passes, two caches. The second sweeps tags the first deliberately left
# out; keeping them apart means pass one's twenty-three finished states are not
# thrown away to add them.
PASS = os.environ.get("OSM_PASS", "1")
RAW = ROOT / "data" / "recsys" / ("_osm" if PASS == "1" else "_osm2")
# Overridable so the sweep can be split across providers. One state takes
# minutes and there are thirty-six, so a single worker on a single endpoint is
# most of a day. Two workers on two different Overpass instances halves that
# without exceeding either provider's two-slot-per-IP guidance — which running
# both against the same host would.
ENDPOINT = os.environ.get("OVERPASS_ENDPOINT",
                          "https://overpass-api.de/api/interpreter")
AGENT = "SafarX-SIH-dataset/1.0 (student project; github.com/garvbahl37-gif)"

# The same 36 names Wikidata uses, so the two harvests merge without a
# translation table.
STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
]

# OSM tag -> (our category, our kind), in priority order: an element carrying
# several of these is claimed by the first match. Chosen for what a traveller
# would go and see or eat; shops, offices and infrastructure are left out.
TAG_MAP = [
    (("amenity", "restaurant"),           "food",      "restaurant"),
    (("amenity", "cafe"),                 "food",      "cafe"),
    (("amenity", "fast_food"),            "food",      "street food"),
    (("tourism", "museum"),               "culture",   "museum"),
    (("tourism", "gallery"),              "culture",   "gallery"),
    (("tourism", "artwork"),              "culture",   "artwork"),
    (("tourism", "theme_park"),           "adventure", "theme park"),
    (("tourism", "zoo"),                  "wildlife",  "zoo"),
    (("tourism", "viewpoint"),            "nature",    "viewpoint"),
    (("tourism", "picnic_site"),          "nature",    "picnic site"),
    (("tourism", "attraction"),           "heritage",  "attraction"),
    (("historic", "fort"),                "heritage",  "fort"),
    (("historic", "castle"),              "heritage",  "palace"),
    (("historic", "archaeological_site"), "heritage",  "archaeology"),
    (("historic", "monument"),            "heritage",  "monument"),
    (("historic", "memorial"),            "heritage",  "memorial"),
    (("historic", "ruins"),               "heritage",  "ruins"),
    (("natural",  "waterfall"),           "nature",    "waterfall"),
    (("natural",  "beach"),               "beach",     "beach"),
    (("natural",  "cave_entrance"),       "nature",    "cave"),
    (("natural",  "peak"),                "nature",    "peak"),
    (("leisure",  "nature_reserve"),      "wildlife",  "reserve"),
    (("leisure",  "garden"),              "nature",    "garden"),
    (("leisure",  "park"),                "nature",    "park"),
    (("amenity",  "place_of_worship"),    "spiritual", "place of worship"),
]

# Pass two: where a traveller sleeps, shops and buys things made locally.
#
# Left out of pass one on the grounds that a catalogue of shops is not a
# catalogue of attractions, which is right for supermarkets and wrong for
# these. Somewhere to stay is half of planning a trip and SafarX already has a
# stays feature; a handicraft workshop or a spice market is exactly the
# "culture" and "food" a visitor travels for. Hostels and campsites belong for
# the same reason forts do — they are the trip.
TAG_MAP_2 = [
    (("tourism",  "hotel"),          "stay",    "hotel"),
    (("tourism",  "guest_house"),    "stay",    "guest house"),
    (("tourism",  "hostel"),         "stay",    "hostel"),
    (("tourism",  "apartment"),      "stay",    "apartment"),
    (("tourism",  "chalet"),         "stay",    "chalet"),
    (("tourism",  "camp_site"),      "stay",    "campsite"),
    (("tourism",  "alpine_hut"),     "stay",    "mountain hut"),
    (("tourism",  "wilderness_hut"), "stay",    "hut"),
    (("amenity",  "marketplace"),    "culture", "market"),
    (("shop",     "handicraft"),     "culture", "handicraft"),
    (("shop",     "art"),            "culture", "art shop"),
    (("shop",     "craft"),          "culture", "craft shop"),
    (("shop",     "musical_instrument"), "culture", "instrument maker"),
    (("shop",     "spices"),         "food",    "spice shop"),
    (("shop",     "tea"),            "food",    "tea shop"),
    (("shop",     "coffee"),         "food",    "coffee shop"),
    (("shop",     "bakery"),         "food",    "bakery"),
    (("shop",     "confectionery"),  "food",    "sweet shop"),
    (("amenity",  "ice_cream"),      "food",    "ice cream"),
    (("amenity",  "food_court"),     "food",    "food court"),
    (("amenity",  "biergarten"),     "food",    "biergarten"),
    (("historic", "wayside_shrine"), "spiritual", "wayside shrine"),
    (("historic", "tomb"),           "heritage", "tomb"),
    (("historic", "city_gate"),      "heritage", "city gate"),
    (("historic", "aqueduct"),       "heritage", "aqueduct"),
    (("natural",  "hot_spring"),     "nature",  "hot spring"),
    (("natural",  "spring"),         "nature",  "spring"),
    (("leisure",  "water_park"),     "adventure", "water park"),
    (("tourism",  "aquarium"),       "wildlife", "aquarium"),
    (("tourism",  "information"),    "heritage", "visitor centre"),
]

if PASS != "1":
    TAG_MAP = TAG_MAP_2

# Every filter in one union, so a state costs one request instead of
# twenty-five. Sweeping tag-by-tag would have been 900 requests against a
# shared public endpoint, which is both slow and rude; the tags come back on
# each element anyway, so the category can be decided here rather than by
# which query returned it.
UNION = "".join(
    f'node["{k}"="{v}"]["name"](area.s);' for (k, v), _c, _kd in TAG_MAP
)


def classify(tags):
    """First matching tag wins, in TAG_MAP order."""
    for (k, v), cat, kind in TAG_MAP:
        if tags.get(k) == v:
            return cat, kind
    return None, None


def overpass(body, timeout=250, retries=3):
    """Run an Overpass query. The public endpoint throttles, so retry politely."""
    query = f'[out:json][timeout:{timeout}];{body}'
    for attempt in range(retries):
        out = subprocess.run(
            ["curl", "-s", "-m", str(timeout + 40), "-H", f"User-Agent: {AGENT}",
             "--data-urlencode", f"data={query}", ENDPOINT],
            capture_output=True, text=True).stdout
        try:
            return json.loads(out)["elements"]
        except (json.JSONDecodeError, KeyError):
            if attempt == retries - 1:
                return None
            # Backing off matters here: hammering a busy endpoint gets the
            # whole harvest rate-limited rather than just this query.
            time.sleep(20 * (attempt + 1))
    return None


def area(state):
    """An Overpass area clause for one Indian state."""
    return f'area["name"="{state}"]["admin_level"="4"]["boundary"="administrative"]->.s;'


def harvest():
    """One request per state, cached per state so the run can resume."""
    RAW.mkdir(parents=True, exist_ok=True)
    # A worker takes every Nth state, so two of them share the list without
    # racing for the same one.
    offset = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    stride = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    grand, failed = 0, []
    for state in STATES[offset::stride]:
        cache = RAW / (state.replace(" ", "_") + ".jsonl")
        if cache.exists():
            n = sum(1 for _ in cache.open())
            print(f"  {state:<42} {n:>8,}  (cached)", flush=True)
            grand += n
            continue

        els = overpass(area(state) + f"({UNION});out body;", timeout=600)
        if els is None:
            # Goa, one of the smallest states, took four minutes and 3,301
            # POIs. Maharashtra will not fit in one response, so a state that
            # fails whole is retried in halves rather than written off.
            els = []
            for half in (TAG_MAP[:len(TAG_MAP) // 2], TAG_MAP[len(TAG_MAP) // 2:]):
                union = "".join(f'node["{k}"="{v}"]["name"](area.s);'
                                for (k, v), _c, _kd in half)
                part = overpass(area(state) + f"({union});out body;", timeout=600)
                if part is None:
                    els = None
                    break
                els += part
                time.sleep(5)
        if els is None:
            print(f"  {state:<42} {'failed':>8}", flush=True)
            failed.append(state)
            continue

        rows = []
        for e in els:
            t = e.get("tags", {})
            name = t.get("name:en") or t.get("name")
            if not name:
                continue
            cat, kind = classify(t)
            if not cat:
                continue
            rows.append({
                "osm_id": e["id"], "title": name[:120],
                "category": cat, "kind": kind, "state": state,
                "lat": e.get("lat"), "lng": e.get("lon"),
                "cuisine": t.get("cuisine", ""),
                "religion": t.get("religion", ""),
            })

        with cache.open("w") as fh:
            for r in rows:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
        print(f"  {state:<42} {len(rows):>8,}", flush=True)
        grand += len(rows)
        time.sleep(3)          # the endpoint is shared; do not hammer it

    print(f"\n  {grand:,} named POIs across {len(STATES) - len(failed)} states", flush=True)
    if failed:
        print(f"  failed, rerun to retry: {', '.join(failed)}", flush=True)


if __name__ == "__main__":
    harvest()
