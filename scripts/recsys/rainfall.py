"""
Per-state travel seasonality, derived from measured rainfall.

The generator's seasonality was a table I wrote from general knowledge: a
national peak between October and March, a monsoon dip, and an inversion for
six Himalayan states. It is roughly right and specifically wrong.

This replaces it with India Meteorological Department rainfall normals — 641
districts, twelve monthly means each, averaged to the state. The data is
demonstrably real, and the proof is Tamil Nadu: it peaks in OCTOBER, because
Tamil Nadu is fed by the northeast monsoon rather than the southwest one. The
hand-written table had October as high season everywhere, which is exactly
backwards for the one state where it is the wettest month of the year. Kerala
comes out at 2,937mm a year, Goa 3,278mm, Meghalaya 3,683mm and Rajasthan
582mm, all of which are right.

This is the dataset a fabricated one was rejected for. A Hugging Face
state-by-month tourism series was checked first and thrown out: it had Goa
peaking in the monsoon and Ladakh in February under snow. The difference is not
that this one is from Kaggle — it is that its numbers survive being checked
against things that are independently known.

HOW RAIN BECOMES A TRAVEL WEIGHT. Wet months suppress travel, so weight falls
as monthly rainfall rises relative to that state's own annual pattern. It is
relative on purpose: 200mm is a downpour in Rajasthan and a quiet week in
Meghalaya, and a traveller's sense of "the rains" is local.

Altitude is the one thing rainfall cannot express. Ladakh is bone dry all year
and unreachable in January for a reason that has nothing to do with rain, so
the six Himalayan states keep an explicit summer preference on top.
"""
import csv
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
CSV = (ROOT / "data" / "recsys" / "_external" /
       "kg_rajanand_rainfall-in-india" / "district wise rainfall normal.csv")

MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
          "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

# The rainfall file names states in caps and a few differently from ours.
ALIASES = {
    "ANDAMAN And NICOBAR ISLANDS": "Andaman and Nicobar Islands",
    "ARUNACHAL PRADESH": "Arunachal Pradesh", "HIMACHAL": "Himachal Pradesh",
    "JAMMU AND KASHMIR": "Jammu and Kashmir", "MADHYA PRADESH": "Madhya Pradesh",
    "TAMIL NADU": "Tamil Nadu", "UTTAR PRADESH": "Uttar Pradesh",
    "WEST BENGAL": "West Bengal", "ANDHRA PRADESH": "Andhra Pradesh",
    "DADRA AND NAGAR HAVELI": "Dadra and Nagar Haveli and Daman and Diu",
    "DAMAN AND DIU": "Dadra and Nagar Haveli and Daman and Diu",
    "ORISSA": "Odisha", "PONDICHERRY": "Puducherry",
    "CHATTISGARH": "Chhattisgarh", "UTTARANCHAL": "Uttarakhand",
}

# Dry, high and closed in winter for reasons rain says nothing about.
HILL_STATES = {"Ladakh", "Himachal Pradesh", "Uttarakhand", "Jammu and Kashmir",
               "Sikkim", "Arunachal Pradesh"}
# Multiplied on top for those states, by month. Summer is when the passes open.
ALTITUDE = [0.55, 0.60, 0.85, 1.15, 1.45, 1.45,
            1.00, 0.95, 1.15, 1.10, 0.75, 0.55]


def _canonical(name):
    n = (name or "").strip()
    if n in ALIASES:
        return ALIASES[n]
    return n.title().replace(" And ", " and ")


def state_weights():
    """
    {state: [12 floats]} — how attractive each month is, mean 1.0 per state.

    Returns {} when the file is absent, and the caller keeps its own table.
    """
    if not CSV.exists():
        return {}

    totals, counts = {}, {}
    for r in csv.DictReader(CSV.open(encoding="utf-8", errors="replace")):
        st = _canonical(r.get("STATE_UT_NAME"))
        try:
            vals = [float(r[m]) for m in MONTHS]
        except (TypeError, ValueError, KeyError):
            continue
        acc = totals.setdefault(st, [0.0] * 12)
        for i, v in enumerate(vals):
            acc[i] += v
        counts[st] = counts.get(st, 0) + 1

    out = {}
    for st, acc in totals.items():
        mean_mm = [v / counts[st] for v in acc]
        annual = sum(mean_mm) or 1.0
        weights = []
        for i, mm in enumerate(mean_mm):
            # Share of the year's rain falling in this month. A twelfth is
            # even; more than that is the wet season.
            share = (mm / annual) * 12.0
            # Falls away as a month gets wetter than the state's own average,
            # bottoming out rather than going to zero — people do still travel
            # in the monsoon, just far fewer of them.
            w = 1.0 / (1.0 + 1.35 * max(0.0, share - 0.85))
            if st in HILL_STATES:
                w *= ALTITUDE[i]
            weights.append(w)
        # Normalise so every state averages 1.0: this decides WHEN people go
        # to a state, not HOW MANY go there, which popularity already handles.
        avg = sum(weights) / 12.0
        out[st] = [w / avg for w in weights]
    return out


if __name__ == "__main__":
    w = state_weights()
    print(f"{len(w)} states\n")
    for st in ("Kerala", "Tamil Nadu", "Goa", "Rajasthan", "Ladakh", "Meghalaya"):
        if st in w:
            best = max(range(12), key=lambda i: w[st][i])
            worst = min(range(12), key=lambda i: w[st][i])
            print(f"  {st:<18} best {MONTHS[best]} ({w[st][best]:.2f})   "
                  f"worst {MONTHS[worst]} ({w[st][worst]:.2f})")
