"""
Pulls real Indian tourism entities out of Wikidata.

The app's own files gave 522 items and are exhausted. Everything beyond that
has to come from somewhere real, because the whole premise of this dataset is
that the catalogue is genuine even though the behaviour is not. Inventing two
hundred thousand plausible-sounding attractions would make the item table as
synthetic as the interactions, and there would then be nothing in the corpus
worth training against.

Wikidata is the right source: every row is a real entity with a stable QID
anyone can check, most carry coordinates, and the administrative hierarchy
gives us the state for free.

    python3 scripts/recsys/wikidata.py survey     # what exists, and how much
    python3 scripts/recsys/wikidata.py harvest    # pull it down
"""
import json
import pathlib
import subprocess
import sys
import time
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "recsys" / "_wikidata"
ENDPOINT = "https://query.wikidata.org/sparql"
# Wikidata asks for a descriptive agent; anonymous floods get throttled.
AGENT = "SafarX-SIH-dataset/1.0 (student project; contact via github.com/garvbahl37-gif)"

INDIA = "wd:Q668"


def sparql(query, retries=3):
    """Run a query, returning the bindings. Retries on the endpoint's 429/500."""
    for attempt in range(retries):
        out = subprocess.run(
            ["curl", "-s", "-m", "180", "-H", "Accept: application/sparql-results+json",
             "-H", f"User-Agent: {AGENT}", "--data-urlencode", f"query={query}", ENDPOINT],
            capture_output=True, text=True).stdout
        try:
            return json.loads(out)["results"]["bindings"]
        except (json.JSONDecodeError, KeyError):
            if attempt == retries - 1:
                sys.stderr.write(f"  ! query failed: {out[:200]}\n")
                return []
            time.sleep(5 * (attempt + 1))
    return []


# What to sweep, and what to call it in our own terms.
#
# The survey decided this list, not intuition. Classes that looked promising
# and returned nothing for India were dropped: Wikidata has three handicrafts,
# three dances and no hill stations here, so "culture" has to be carried by
# museums, festivals, monuments and designated heritage instead. Architectural
# structure was left out deliberately despite holding 315,210 Indian entities
# — it is every building in the country, schools and substations included, and
# padding a tourism catalogue with those would make it worse, not bigger.
#
# Order matters: an item is claimed by the first class that matches, so the
# specific ones come before the general.
CLASSES = [
    # (Wikidata class, our category, our kind)
    ("Q46169",   "nature",    "park"),        # national park
    ("Q1377575", "wildlife",  "sanctuary"),   # wildlife refuge
    ("Q43501",   "wildlife",  "zoo"),
    ("Q40080",   "beach",     "beach"),
    ("Q34038",   "nature",    "waterfall"),
    ("Q35509",   "nature",    "cave"),
    ("Q23397",   "nature",    "lake"),
    ("Q8502",    "nature",    "mountain"),
    ("Q1107656", "nature",    "garden"),
    ("Q22698",   "nature",    "park"),

    ("Q57821",   "heritage",  "fort"),        # fortification
    ("Q16560",   "heritage",  "palace"),
    ("Q839954",  "heritage",  "archaeology"),
    ("Q4989906", "heritage",  "monument"),
    ("Q12518",   "heritage",  "tower"),
    ("Q570116",  "heritage",  "attraction"),  # tourist attraction

    ("Q44539",   "spiritual", "temple"),
    ("Q32815",   "spiritual", "mosque"),
    ("Q16970",   "spiritual", "church"),
    ("Q1128397", "spiritual", "convent"),

    ("Q33506",   "culture",   "museum"),
    ("Q207694",  "culture",   "museum"),
    ("Q132241",  "culture",   "festival"),
    ("Q210272",  "culture",   "heritage"),
    ("Q153562",  "culture",   "theatre"),

    ("Q746549",  "food",      "dish"),
    ("Q2095",    "food",      "food"),
    ("Q11707",   "food",      "restaurant"),
]

# The 28 states and 8 union territories as they stand today. Wikidata's
# instance-of query also returns Bombay State, Madras State and a dozen other
# historical entities; an item filed under those is filed under a country that
# no longer draws its borders that way.
STATES = {
    "Q1159": "Andhra Pradesh", "Q1162": "Arunachal Pradesh", "Q1164": "Assam",
    "Q1165": "Bihar", "Q1168": "Chhattisgarh", "Q1171": "Goa",
    "Q1061": "Gujarat", "Q1174": "Haryana", "Q1177": "Himachal Pradesh",
    "Q1184": "Jharkhand", "Q1185": "Karnataka", "Q1186": "Kerala",
    "Q1188": "Madhya Pradesh", "Q1191": "Maharashtra", "Q1193": "Manipur",
    "Q1195": "Meghalaya", "Q1502": "Mizoram", "Q1599": "Nagaland",
    "Q22048": "Odisha", "Q22424": "Punjab", "Q1437": "Rajasthan",
    "Q1505": "Sikkim", "Q1445": "Tamil Nadu", "Q677037": "Telangana",
    "Q1363": "Tripura", "Q1498": "Uttar Pradesh", "Q1499": "Uttarakhand",
    "Q1356": "West Bengal",
    "Q40888": "Andaman and Nicobar Islands", "Q120971341": "Chandigarh",
    "Q77997266": "Dadra and Nagar Haveli and Daman and Diu",
    "Q9357528": "Delhi", "Q66278313": "Jammu and Kashmir",
    "Q200667": "Ladakh", "Q26927": "Lakshadweep", "Q66743": "Puducherry",
}

# Above this, a single query times out and OFFSET paging crawls, so the class
# is swept one state at a time instead.
SPLIT_ABOVE = 5000

def count(qid, country=True):
    """How many Indian entities sit under this class."""
    where = f"?x wdt:P31/wdt:P279* wd:{qid} ."
    if country:
        where += f" ?x wdt:P17 {INDIA} ."
    rows = sparql(f"SELECT (COUNT(DISTINCT ?x) AS ?n) WHERE {{ {where} }}")
    return int(rows[0]["n"]["value"]) if rows else -1


def fetch(qid, category, kind, state_qid=None, limit=10000):
    """One class, optionally narrowed to one state. Returns raw bindings."""
    scope = (f"?item wdt:P131* wd:{state_qid} ." if state_qid
             else f"?item wdt:P17 {INDIA} .")
    q = f"""
    SELECT DISTINCT ?item ?itemLabel ?coord ?stateLabel ?img ?desc WHERE {{
      ?item wdt:P31/wdt:P279* wd:{qid} .
      {scope}
      OPTIONAL {{ ?item wdt:P625 ?coord }}
      OPTIONAL {{ ?item wdt:P18 ?img }}
      OPTIONAL {{ ?item wdt:P131* ?st . ?st wdt:P31 wd:Q12443800 . 
                 ?st rdfs:label ?stateLabel . FILTER(LANG(?stateLabel)="en") }}
      OPTIONAL {{ ?item schema:description ?desc . FILTER(LANG(?desc)="en") }}
      SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
    }} LIMIT {limit}"""
    rows = sparql(q)
    out = []
    for r in rows:
        qidv = r["item"]["value"].rsplit("/", 1)[-1]
        label = r.get("itemLabel", {}).get("value", "")
        # An unlabelled entity comes back as its own QID. Nobody is being
        # recommended "Q60815847", so those are dropped rather than carried.
        if not label or label == qidv:
            continue
        lat = lng = None
        if "coord" in r:
            try:
                lng, lat = r["coord"]["value"].removeprefix("Point(").rstrip(")").split()
                lat, lng = float(lat), float(lng)
            except ValueError:
                lat = lng = None
        out.append({
            "qid": qidv, "title": label, "category": category, "kind": kind,
            "state": r.get("stateLabel", {}).get("value") or (STATES.get(state_qid) or ""),
            "lat": lat, "lng": lng,
            "image": r.get("img", {}).get("value", ""),
            "desc": r.get("desc", {}).get("value", "")[:200],
        })
    return out


def harvest():
    """Sweep every class, cache each to disk, and report the yield."""
    RAW.mkdir(parents=True, exist_ok=True)
    grand = 0
    for qid, category, kind in CLASSES:
        cache = RAW / f"{qid}.jsonl"
        if cache.exists():                      # resumable: this takes a while
            n = sum(1 for _ in cache.open())
            print(f"  {qid:<12} {n:>7,}  {category}/{kind}  (cached)")
            grand += n
            continue

        total = count(qid)
        rows = []
        if total > SPLIT_ABOVE:
            # One state at a time: a single sweep of 22,000 temples times the
            # endpoint out, and OFFSET paging past ten thousand crawls.
            for sq in STATES:
                rows += fetch(qid, category, kind, state_qid=sq, limit=6000)
        else:
            rows = fetch(qid, category, kind)

        seen, uniq = set(), []
        for r in rows:
            if r["qid"] in seen:
                continue
            seen.add(r["qid"])
            uniq.append(r)

        with cache.open("w") as fh:
            for r in uniq:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
        print(f"  {qid:<12} {len(uniq):>7,}  {category}/{kind}"
              f"{'  (split by state)' if total > SPLIT_ABOVE else ''}")
        grand += len(uniq)

    print(f"\n  {grand:,} rows cached across {len(CLASSES)} classes"
          f"  (duplicates across classes still to be resolved)")


if __name__ == "__main__":
    RAW.mkdir(parents=True, exist_ok=True)
    cmd = sys.argv[1] if len(sys.argv) > 1 else "harvest"
    if cmd == "harvest":
        harvest()
    elif cmd == "count":
        for qid, cat, kind in CLASSES:
            print(f"  {qid:<12} {count(qid):>8,}  {cat}/{kind}")
