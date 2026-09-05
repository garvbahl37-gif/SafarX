"""
The item catalogue for the SafarX recommender, read out of the app's own data.

Items are real. Everything else this pipeline produces — users, sessions,
interactions — is synthetic, and is generated only so the recommender can be
built and evaluated before SafarX has traffic of its own. Nothing here is
observed behaviour and none of it should ever be reported as such.

Grounding the items in the real catalogue matters: a recommender trained on
invented destinations learns an invented India, and every offline metric it
produces would be measuring the generator rather than the model.
"""
import json

import external
import kaggle_sets
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]

# Counters the CLI prints, so the merge is visible rather than silent.
_STATS = {}

# The 28 states and 8 union territories, and nothing else.
INDIAN_STATES = {
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
    "Ladakh", "Lakshadweep", "Puducherry",
}
SRC = ROOT / "src" / "data"

# Nine gem categories, five tour categories and a mixed bag of attractions
# collapse into one vocabulary the model can actually learn from.
CATEGORY = {
    "beach": "beach", "cave": "heritage", "eatery": "food", "fort": "heritage",
    "nature": "nature", "temple": "spiritual", "trek": "adventure",
    "village": "culture", "wildlife": "wildlife",
    "Adventure": "adventure", "Beach": "beach", "Heritage": "heritage",
    "Nature": "nature", "Spiritual": "spiritual",
}

REGION_OF_STATE = {}


def _slug(text):
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")


def _read_json(name):
    return json.loads((SRC / name).read_text())


def _js_source():
    """Places and attractions, exported from JavaScript by export-js-data.mjs."""
    f = ROOT / "data" / "recsys" / "_source.json"
    if not f.exists():
        raise SystemExit("Run: node scripts/recsys/export-js-data.mjs first")
    return json.loads(f.read_text())



# Every state and union territory placed in a region, so an item harvested
# from Wikidata can be reasoned about geographically even when the app's own
# files have never heard of it. The app's data wins where the two disagree:
# whatever region hiddengems.json assigns to Rajasthan is the region every
# Rajasthan item gets, so the catalogue never contradicts itself.
REGION_FALLBACK = {
    "Delhi": "north", "Haryana": "north", "Punjab": "north",
    "Himachal Pradesh": "north", "Uttarakhand": "north",
    "Uttar Pradesh": "north", "Jammu and Kashmir": "north",
    "Ladakh": "north", "Chandigarh": "north", "Rajasthan": "north",
    "Gujarat": "west", "Maharashtra": "west", "Goa": "west",
    "Dadra and Nagar Haveli and Daman and Diu": "west",
    "Karnataka": "south", "Kerala": "south", "Tamil Nadu": "south",
    "Andhra Pradesh": "south", "Telangana": "south", "Puducherry": "south",
    "Lakshadweep": "south", "Andaman and Nicobar Islands": "south",
    "West Bengal": "east", "Bihar": "east", "Jharkhand": "east",
    "Odisha": "east",
    "Madhya Pradesh": "central", "Chhattisgarh": "central",
    "Assam": "northeast", "Arunachal Pradesh": "northeast",
    "Manipur": "northeast", "Meghalaya": "northeast", "Mizoram": "northeast",
    "Nagaland": "northeast", "Sikkim": "northeast", "Tripura": "northeast",
}

# Wikidata writes some state names with an ampersand and files a handful of
# items under states that were dissolved in the 1950s. Left alone these split
# a state in two — an item in "Jammu & Kashmir" never matches a user whose
# home is "Jammu and Kashmir" — which quietly weakens the geography signal
# that is the strongest feature a travel recommender has.
STATE_ALIASES = {
    # Picked up from the Kaggle and rainfall tables: an old name, two ways of
    # writing Delhi, and one row that is not in India at all.
    "Orissa": "Odisha",
    "Delhi NCT": "Delhi",
    "NCT of Delhi": "Delhi",
    "Jammu & Kashmir": "Jammu and Kashmir",
    "Andaman & Nicobar Islands": "Andaman and Nicobar Islands",
    "Andaman & Nicobar": "Andaman and Nicobar Islands",
    "Dadra & Nagar Haveli & Daman & Diu": "Dadra and Nagar Haveli and Daman and Diu",
    # Successor states, so the place keeps a location that exists today.
    "Ajmer State": "Rajasthan",
    "Bombay State": "Maharashtra",
    "Madras State": "Tamil Nadu",
    "Mysore State": "Karnataka",
    "Hyderabad State (1948-1956)": "Telangana",
    "Madhya Bharat": "Madhya Pradesh",
    "Travancore-Cochin": "Kerala",
    "East Punjab": "Punjab",
    "Vindhya Pradesh": "Madhya Pradesh",
    "Saurashtra State": "Gujarat",
    "Coorg State": "Karnataka",
    "Bhopal State (1949–1956)": "Madhya Pradesh",
    "Bilaspur State": "Himachal Pradesh",
    "Patiala and East Punjab States Union": "Punjab",
    "Undivided Assam": "Assam",
    "National Capital Territory of Delhi": "Delhi",
    "Andhra State": "Andhra Pradesh",
    "Andhra Pradesh (1956–2014)": "Andhra Pradesh",
    "Goa, Daman and Diu": "Goa",
}

WIKIDATA_DIR = ROOT / "data" / "recsys" / "_wikidata"
# Two harvest passes: attractions and eateries first, then where a traveller
# sleeps and shops. Separate caches, read as one.
OSM_DIRS = [ROOT / "data" / "recsys" / "_osm",
            ROOT / "data" / "recsys" / "_osm2"]

# Which source wins when two of them describe the same place. The app's own
# record has photographs, costs and a page behind it; Wikidata has a curated
# entity and often an image; OSM has a name and a point. Highest wins.
SOURCE_RANK = {"app": 5, "external": 4, "kaggle": 3, "wikidata": 2, "osm": 1}

# A place of worship is not a useful category on its own — OSM files a
# cathedral and a village shrine under the same tag — so the religion refines
# it into something a traveller would recognise.
WORSHIP = {
    "hindu": "temple", "muslim": "mosque", "christian": "church",
    "sikh": "gurdwara", "jain": "jain temple", "buddhist": "monastery",
    "zoroastrian": "fire temple", "jewish": "synagogue", "bahai": "temple",
}


def _wikidata_items():
    """The harvested entities, if wikidata.py has been run."""
    if not WIKIDATA_DIR.exists():
        return []
    out = []
    for path in sorted(WIKIDATA_DIR.glob("Q*.jsonl")):
        for line in path.open():
            r = json.loads(line)
            out.append({
                "item_id": f"wd-{r['qid']}",
                "kind": r["kind"],
                "title": r["title"],
                "state": r["state"],
                "region": "",
                "category": r["category"],
                "lat": r["lat"], "lng": r["lng"],
                # A Wikidata entity carries at most one photograph, so this is
                # 1 or 2 where an app gem reaches 7. That is the right ordering:
                # the places SafarX has actually built pages for should surface
                # above the ones it merely knows the name of.
                "media_count": 1 + (1 if r.get("image") else 0),
                "difficulty": "easy",
                "cost_per_day": None,
                "duration_days": None,
                "_source": "wikidata",
            })
    return out


def _osm_items():
    """Named POIs harvested from OpenStreetMap, if osm.py has been run."""
    out = []
    for d in OSM_DIRS:
        if not d.exists():
            continue
        for path in sorted(d.glob("*.jsonl")):
            for line in path.open():
                r = json.loads(line)
                kind = r["kind"]
                if kind == "place of worship":
                    kind = WORSHIP.get((r.get("religion") or "").lower(), "shrine")
                out.append({
                    "item_id": f"osm-{r['osm_id']}",
                    "kind": kind,
                    "title": r["title"],
                    "state": r["state"],
                    "region": "",
                    "category": r["category"],
                    "lat": r["lat"], "lng": r["lng"],
                    # No photograph, so the thinnest card in the catalogue —
                    # which is the right place for a POI we know only the name
                    # of.
                    "media_count": 1,
                    "difficulty": "easy",
                    "cost_per_day": None,
                    "duration_days": None,
                    "cuisine": r.get("cuisine", ""),
                    "_source": "osm",
                })
    return out


def build_items():
    """Every recommendable thing SafarX holds, in one flat shape."""
    items = []

    for g in _read_json("hiddengems.json"):
        REGION_OF_STATE.setdefault(g["state"], g.get("region", "north"))
        items.append({
            "item_id": f"gem-{g['id']}",
            "kind": "gem",
            "title": g["title"],
            "state": g["state"],
            "region": g.get("region", ""),
            "category": CATEGORY.get(g.get("category", ""), "nature"),
            "lat": g.get("latitude"), "lng": g.get("longitude"),
            # A gem with six photographs and a film is a richer card than one
            # with a single picture, and richer cards genuinely do get opened
            # more — so the generator is allowed to know this.
            "media_count": len(g.get("images") or []) + (1 if g.get("video") else 0),
            "difficulty": g.get("difficulty", "easy"),
        })

    for t in _read_json("vrTours.json"):
        items.append({
            "item_id": f"tour-{_slug(t['id'])}",
            "kind": "tour",
            "title": t["name"],
            "state": (t.get("country") or "").split(",")[0].strip(),
            "region": "",
            "category": CATEGORY.get(t.get("category", ""), "heritage"),
            "lat": t.get("latitude"), "lng": t.get("longitude"),
            "media_count": len(t.get("panoramas") or []) or 1,
            "difficulty": "easy",
        })

    source = _js_source()

    for p in source["places"]:
        items.append({
            "item_id": f"place-{_slug(p['name'])}",
            "kind": "place",
            "title": p["name"],
            "state": p.get("state", ""),
            "region": "",
            "category": "city",
            "lat": p.get("lat"), "lng": p.get("lng"),
            "media_count": 1,
            "difficulty": "easy",
        })

    for a in source["attractions"]:
        items.append({
            "item_id": f"attr-{a['id']}",
            "kind": "attraction",
            "title": a["name"],
            "state": a.get("state", ""),
            "region": "",
            "category": "heritage",
            "lat": None, "lng": None,
            "media_count": 1,
            "difficulty": "easy",
            # The only real price signal in the catalogue.
            "cost_per_day": a.get("avgCostPerDay"),
            "duration_days": a.get("duration"),
        })

    # Everything the app knows is in by now. The harvest goes on top: far more
    # of it, but thinner, and it loses every tie below.
    for it in items:
        it["_source"] = "app"
    items += _wikidata_items()
    items += _osm_items()

    # A curated table of well-known attractions, carrying the fields no
    # harvest provides — fee, duration, rating, review count, best time of day.
    # Matched by name and state onto what is already here, so the Taj gains its
    # attributes rather than gaining a twin; anything unmatched joins as a new
    # item, since these are real places too.
    ext = external.load()
    index, by_name = {}, {}
    for it in items:
        index.setdefault((_slug(it["title"]), it["state"].lower()), it)
        by_name.setdefault(_slug(it["title"]), []).append(it)
    enriched = 0
    for row in ext:
        attrs = {f: row.get(f) for f in external.FIELDS}
        attrs = {k: ("" if v is None else v) for k, v in attrs.items()}
        # State first. Failing that, a name that occurs exactly once in the
        # whole catalogue is the same place under a differently-recorded
        # state — 67 rows matched by name but disagreed on state, and adding
        # them as new items would have duplicated real places rather than
        # enriched them.
        hit = index.get((_slug(row["title"]), row["state"].lower()))
        if hit is None:
            same_name = by_name.get(_slug(row["title"]))
            if same_name and len(same_name) == 1:
                hit = same_name[0]
        if hit is not None:
            hit.update(attrs)
            enriched += 1
            continue
        items.append({
            "item_id": f"ext-{_slug(row['title'])}-{_slug(row['state'])[:12]}",
            "kind": row["type"].lower() or "attraction",
            "title": row["title"],
            "state": row["state"],
            "region": "",
            "category": row["category"],
            "lat": None, "lng": None,
            "media_count": 1,
            "difficulty": "easy",
            "cost_per_day": None,
            "duration_days": None,
            "cuisine": "",
            "_source": "external",
            **attrs,
        })
    _STATS["enriched"] = enriched
    _STATS["from_external"] = len(ext)

    # Hotels and restaurants, which carry a price and a rating where OSM
    # carries only a name. Their state is read off the nearest already-placed
    # item, so this has to run after everything with real coordinates is in.
    locator = kaggle_sets.StateLocator(items)
    kag, dropped = kaggle_sets.load(locator)
    items += kag
    _STATS["from_kaggle"] = len(kag)
    _STATS["kaggle_unplaceable"] = dropped

    # One spelling per state, before anything is keyed on it.
    for it in items:
        it["state"] = STATE_ALIASES.get(it["state"], it["state"])

    # And nothing outside India. The nearest-neighbour locator works on
    # coordinates, so a border town's restaurant can resolve to a state that
    # does not exist here — one row came back as "Bangladesh". A catalogue of
    # Indian travel should not quietly contain it.
    before = len(items)
    items = [it for it in items if not it["state"] or it["state"] in INDIAN_STATES]
    _STATS["dropped_non_indian"] = before - len(items)

    # Regions are only recorded on gems; carry them across by state so every
    # item can be reasoned about geographically.
    for it in items:
        if not it["region"]:
            it["region"] = (REGION_OF_STATE.get(it["state"])
                            or REGION_FALLBACK.get(it["state"], "pan-india"))

    # Two sources can describe the same place — the Taj is a VR tour, an
    # attraction and a Wikidata entity. Keep one, and prefer the app's own
    # record: it has the photographs, the costs and the page behind it, where
    # the harvested twin has a name and a point on a map.
    # Keyed on name, state AND position, not name and state alone.
    #
    # Name-and-state threw away 12,599 real places: Maharashtra has 135
    # distinct Hanuman Mandirs and Karnataka 130 Domino's, and 11,579 of the
    # same-name pairs sit more than two kilometres apart. Those are different
    # buildings in different neighbourhoods, not duplicate records, and a
    # recommender that cannot tell one from another is no use to anyone
    # standing in a city.
    #
    # A cell of 0.01 degrees is about 1.1km. It merged 1,014 rows against the
    # 1,020 same-name pairs measured within two kilometres, so it collapses
    # what genuinely is one place and keeps what is not — and it is still
    # coarse enough to merge the Taj across all three sources, which was the
    # point of deduping at all. Two records either side of a cell boundary
    # will survive as two; that error keeps a real place, where the old key's
    # error destroyed eleven thousand of them.
    # Two passes, because a record with coordinates and the same record
    # without them are still the same place. Keying on position alone left
    # three Taj Mahals: the VR tour, an attraction row carrying no coordinates,
    # and an unrelated restaurant in Kerala that happens to share the name. The
    # first two are one place; the third genuinely is not.
    #
    # So: placed items are keyed by name, state and cell as before. Unplaced
    # ones then attach to a placed item of the same name and state if one
    # exists, and only otherwise stand alone.
    best = {}
    placed = [i for i in items if i.get("lat") is not None and i.get("lng") is not None]
    unplaced = [i for i in items if i.get("lat") is None or i.get("lng") is None]
    by_name_state = {}
    for it in placed + unplaced:
        # A title in Devanagari slugs to nothing, and 97 such rows would
        # otherwise share one empty key and collapse into a single item.
        name = _slug(it["title"]) or it["title"].strip().casefold()
        cell = ((round(it["lat"], 2), round(it["lng"], 2))
                if it.get("lat") is not None and it.get("lng") is not None
                else None)
        ns = (name, it["state"].lower())
        if cell is None and ns in by_name_state:
            # An unplaced twin of something already located.
            key = by_name_state[ns]
        else:
            key = (name, it["state"].lower(), cell)
            if cell is not None:
                by_name_state.setdefault(ns, key)
        prior = best.get(key)
        # Source rank first, then whichever carries more media. Comparing the
        # pair in one go avoids the ordering bug the long-hand version had,
        # where the first item seen never recorded its origin and a harvested
        # twin could quietly displace the real page.
        rank = (SOURCE_RANK[it["_source"]], it["media_count"])
        if prior is None or rank > (SOURCE_RANK[prior["_source"]], prior["media_count"]):
            best[key] = it

    out = sorted(best.values(), key=lambda x: x["item_id"])
    # World Heritage status marked on whatever is already here, after dedupe
    # so it lands on the surviving record rather than a discarded twin.
    _STATS["unesco_marked"] = kaggle_sets.mark_unesco(out)

    # Borrowed coordinates, AFTER deduplication rather than before.
    #
    # An attraction carries no position of its own, so it inherits its state's
    # largest place — geography being one of the strongest signals a travel
    # recommender has. Doing that first was a mistake: it turned an unplaced
    # record into a placed one sitting in the wrong cell, so the Taj Mahal
    # attraction row stopped matching the Taj Mahal tour and the catalogue
    # carried both. Dedupe first, borrow after.
    by_state = {}
    for it in out:
        if it["lat"] and it["state"] and not it.get("coords_from_state"):
            by_state.setdefault(it["state"], (it["lat"], it["lng"]))
    for it in out:
        if not it["lat"]:
            it["lat"], it["lng"] = by_state.get(it["state"], (None, None))
            it["coords_from_state"] = bool(it["lat"])

    for it in out:
        it.setdefault("cuisine", "")
        for f in external.FIELDS:
            it.setdefault(f, "")
    return out


if __name__ == "__main__":
    items = build_items()
    print(f"  {len(items)} items")
    from collections import Counter
    print("  by kind:    ", dict(Counter(i["kind"] for i in items)))
    print("  by category:", dict(Counter(i["category"] for i in items)))
    print("  by region:  ", dict(Counter(i["region"] for i in items)))
    print("  with coords:", sum(1 for i in items if i["lat"]))
