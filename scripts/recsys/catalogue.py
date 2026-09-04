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

    # Regions are only recorded on gems; carry them across by state so every
    # item can be reasoned about geographically.
    for it in items:
        if not it["region"]:
            it["region"] = REGION_OF_STATE.get(it["state"], "north")

    # Two sources can describe the same place. Keep the richer record.
    best = {}
    for it in items:
        key = (_slug(it["title"]), it["state"].lower())
        if key not in best or it["media_count"] > best[key]["media_count"]:
            best[key] = it
    return sorted(best.values(), key=lambda x: x["item_id"])


if __name__ == "__main__":
    items = build_items()
    print(f"  {len(items)} items")
    from collections import Counter
    print("  by kind:    ", dict(Counter(i["kind"] for i in items)))
    print("  by category:", dict(Counter(i["category"] for i in items)))
    print("  by region:  ", dict(Counter(i["region"] for i in items)))
    print("  with coords:", sum(1 for i in items if i["lat"]))
