"""
Folds a curated table of Indian attractions into the catalogue.

WHAT IT ADDS. Wikidata and OSM give a name, a class and a point on a map, and
nothing else — every item in the catalogue was equally featureless. This table
carries what a traveller actually decides on: what it costs to get in, how long
to allow, how well reviewed it is and by how many people, what time of day to
go, and which day it is shut. Those are content features a recommender can
learn from, and a cold-start recommender has nothing else to work with.

The review count is the most valuable column in it. Popularity in the generator
was a synthetic rank — a made-up ordering of the catalogue. For the few hundred
places covered here it can be anchored to how many people have actually
reviewed them, which is a real signal rather than an invented one.

WHAT WAS REJECTED, and why it matters more than what was taken. Three further
datasets were pulled from Hugging Face and checked before use:

  A state-by-month tourism series looked ideal — measured seasonality per state
  would have replaced a hand-written table. Its numbers are fabricated. Goa
  peaks in May and August, which are the monsoon, with February as its trough
  when February is Goa's high season; Ladakh peaks in February, when the passes
  are under snow. The variance looks statistically plausible, which is exactly
  what makes it dangerous: dropped in unchecked it would have replaced a table
  that matches reality with noise that does not.

  190,665 LLM-generated itineraries, and 1,001 generated travel Q&A pairs. Both
  are model output rather than observation. The catalogue's whole claim is that
  its items are real, and neither would survive that.

More data is not automatically better data. Two of the four were worse than
nothing.

Source: the "Top Indian Places to Visit" table, supplied by the project owner.
Transcription fixes are listed in FIXES below.
"""
import csv
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
CSV = ROOT / "data" / "recsys" / "_external" / "top_indian_places.csv"

# The table names some states as they are colloquially written, and one row
# files a Gujarati memorial under Uttar Pradesh.
STATE_FIX = {
    "Maharastra": "Maharashtra",
    "Daman and Diu": "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi": "Delhi",
}

# Transcription fixes applied when the table was saved, recorded so the file
# can be checked against its source:
#   - "DzÃ¼kou Valley" was mojibake for Dzukou Valley.
#   - Establishment years given as "12th century", "Ancient", "1960s" and the
#     like are not years; they became Unknown rather than being guessed at.
#   - Kargil War Memorial "24", Submarine Museum "22", Simhachalam "198",
#     Char Dham "211", Buddha Park "213": two- and three-digit values that
#     cannot be years. Corrected where the real year is unambiguous (Char Dham
#     2011, Buddha Park 2013, Submarine Museum 2001), else Unknown.
#   - Brihadeeswarar Temple "110" -> 1010, its actual completion.
#   - Kirti Mandir, Porbandar was filed under Uttar Pradesh; it is in Gujarat.
#   - The Dalai Lama Temple row gave its city as "dalhousie"; it is in
#     Dharamshala.
FIXES = "see module docstring"

# The table's own vocabulary mapped onto ours.
SIGNIFICANCE = {
    "Historical": "heritage", "Religious": "spiritual", "Spiritual": "spiritual",
    "Nature": "nature", "Scenic": "nature", "Natural Wonder": "nature",
    "Botanical": "nature", "Environmental": "nature", "Agricultural": "nature",
    "Wildlife": "wildlife", "Recreational": "adventure", "Adventure": "adventure",
    "Trekking": "adventure", "Sports": "adventure", "Entertainment": "adventure",
    "Cultural": "culture", "Artistic": "culture", "Architectural": "culture",
    "Educational": "culture", "Scientific": "culture", "Archaeological": "heritage",
    "Engineering Marvel": "culture", "Market": "food", "Food": "food",
    "Shopping": "city",
}


def _num(v, default=None):
    try:
        return float(str(v).strip())
    except (TypeError, ValueError):
        return default


def _year(v):
    """A four-digit year, or None. Negative values are BCE and kept."""
    s = str(v).strip()
    if re.fullmatch(r"-?\d{1,4}", s):
        n = int(s)
        # A two-digit "year" is a transcription slip, not antiquity.
        if -4000 <= n <= 2026 and (n < 0 or n >= 100):
            return n
    return None


def load():
    """The table, normalised. Returns a list of dicts."""
    if not CSV.exists():
        return []
    out = []
    for r in csv.DictReader(CSV.open()):
        name = (r.get("Name") or "").strip()
        if not name:
            continue
        state = STATE_FIX.get((r.get("State") or "").strip(), (r.get("State") or "").strip())
        sig = (r.get("Significance") or "").strip()
        out.append({
            "title": name,
            "state": state,
            "city": (r.get("City") or "").strip(),
            "type": (r.get("Type") or "").strip(),
            "category": SIGNIFICANCE.get(sig, "heritage"),
            "significance": sig,
            "established": _year(r.get("Establishment Year")),
            "visit_hours": _num(r.get("time needed to visit in hrs")),
            "rating": _num(r.get("Google review rating")),
            # The column is in lakhs; store the count itself.
            "reviews": int((_num(r.get("Number of google review in lakhs")) or 0) * 100_000),
            "fee_inr": _num(r.get("Entrance Fee in INR"), 0),
            "airport_50km": (r.get("Airport with 50km Radius") or "").strip() == "Yes",
            "weekly_off": (r.get("Weekly Off") or "None").strip(),
            "dslr_allowed": (r.get("DSLR Allowed") or "").strip() == "Yes",
            "best_time": (r.get("Best Time to visit") or "All").strip(),
        })
    return out


# Columns this table contributes to items.csv.
FIELDS = ["rating", "reviews", "fee_inr", "visit_hours", "best_time",
          "weekly_off", "dslr_allowed", "established", "significance",
          "airport_50km"]


def blank():
    """The same fields, empty, for the items this table says nothing about."""
    return {f: "" for f in FIELDS}
