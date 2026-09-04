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
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
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
OSM_DIR = ROOT / "data" / "recsys" / "_osm"

# Which source wins when two of them describe the same place. The app's own
# record has photographs, costs and a page behind it; Wikidata has a curated
# entity and often an image; OSM has a name and a point. Highest wins.
SOURCE_RANK = {"app": 3, "wikidata": 2, "osm": 1}

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
    if not OSM_DIR.exists():
        return []
    out = []
    for path in sorted(OSM_DIR.glob("*.jsonl")):
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
                # No photograph, so the thinnest card in the catalogue — which
                # is the right place for a POI we know only the name of.
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

    # An attraction has no coordinates, but its state's largest place does,
    # and geography is one of the strongest signals a travel recommender has.
    by_state = {}
    for it in items:
        if it["lat"] and it["state"]:
            by_state.setdefault(it["state"], (it["lat"], it["lng"]))
    for it in items:
        if not it["lat"]:
            it["lat"], it["lng"] = by_state.get(it["state"], (None, None))
            it["coords_from_state"] = bool(it["lat"])

    # One spelling per state, before anything is keyed on it.
    for it in items:
        it["state"] = STATE_ALIASES.get(it["state"], it["state"])

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
    best = {}
    for it in items:
        key = (_slug(it["title"]), it["state"].lower())
        prior = best.get(key)
        # Source rank first, then whichever carries more media. Comparing the
        # pair in one go avoids the ordering bug the long-hand version had,
        # where the first item seen never recorded its origin and a harvested
        # twin could quietly displace the real page.
        rank = (SOURCE_RANK[it["_source"]], it["media_count"])
        if prior is None or rank > (SOURCE_RANK[prior["_source"]], prior["media_count"]):
            best[key] = it

    out = sorted(best.values(), key=lambda x: x["item_id"])
    for it in out:
        it.setdefault("cuisine", "")
    return out


if __name__ == "__main__":
    items = build_items()
    print(f"  {len(items)} items")
    from collections import Counter
    print("  by kind:    ", dict(Counter(i["kind"] for i in items)))
    print("  by category:", dict(Counter(i["category"] for i in items)))
    print("  by region:  ", dict(Counter(i["region"] for i in items)))
    print("  with coords:", sum(1 for i in items if i["lat"]))
