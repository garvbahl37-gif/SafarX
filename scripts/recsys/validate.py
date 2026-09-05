"""
Checks the dataset has the structure it claims to have.

Every property the README advertises is measured here rather than asserted. A
generator can quietly lose a signal — a weight typo, a gate that fires too
often — and the resulting file still looks like a dataset. This is how you find
out before spending a training run on it. It has already earned its keep twice:
it caught bookings that preceded the views causing them, and a seasonality
setting that steered which item was picked without ever changing how many
events a month held.

Nothing here holds the interactions in memory. At two million rows a list of
row dicts is well over a gigabyte, and the checks only ever need counters, so
the files are streamed once and the tallies kept instead.

    python3 scripts/recsys/validate.py
"""
import csv
import glob
import math
import pathlib
import random
import statistics
from collections import Counter, defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "recsys"

HILL = {"Ladakh", "Himachal Pradesh", "Uttarakhand", "Sikkim",
        "Jammu and Kashmir", "Arunachal Pradesh"}


def haversine(a_lat, a_lng, b_lat, b_lng):
    """Kilometres between two points, or None when either is unplaced."""
    if None in (a_lat, a_lng, b_lat, b_lng):
        return None
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp, dl = math.radians(b_lat - a_lat), math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def load(name):
    with (OUT / name).open() as fh:
        return list(csv.DictReader(fh))


def main():
    from generate import PERSONAS
    items = {r["item_id"]: r for r in load("items.csv")}
    users = {r["user_id"]: r for r in load("users.csv")}

    # One pass over every interaction file, accumulating only what the checks
    # need. `first_view` is the largest structure and it is unavoidable: the
    # causality check has to know when each user first saw each item.
    n = 0
    dup = 0
    bad_ids = 0
    pop = Counter()
    per_user = Counter()
    events = Counter()
    by_month = Counter()
    hill_month = Counter()
    sessions = Counter()
    ev_cat = Counter()
    home_hits = 0
    persona_hits = 0
    travel_d = []
    out_of_order = 0
    # Both keyed by hash rather than by the tuple itself. A set of two million
    # four-string tuples is around 400MB and a dict of them more; the hashes
    # cost a fraction of that. The trade is a vanishing chance of a collision
    # reading as a duplicate — at these volumes, on the order of one in 10^7 —
    # against a validator that cannot run at all on the real file.
    first_view = {}
    seen_keys = set()

    files = sorted(glob.glob(str(OUT / "interactions_*.csv")))
    for path in files:
        with open(path) as fh:
            for r in csv.DictReader(fh):
                n += 1
                u, i, ev, ts = r["user_id"], r["item_id"], r["event"], r["timestamp"]

                key = hash((u, i, ev, ts))
                if key in seen_keys:
                    dup += 1
                else:
                    seen_keys.add(key)

                item = items.get(i)
                user = users.get(u)
                if item is None or user is None:
                    bad_ids += 1
                    continue

                pop[i] += 1
                per_user[u] += 1
                events[ev] += 1
                sessions[r["session_id"]] += 1
                ev_cat[item["category"]] += 1
                month = int(ts[5:7])
                by_month[month] += 1
                if item["state"] in HILL:
                    hill_month[month] += 1
                if item["state"] and item["state"] == user["home_state"]:
                    home_hits += 1
                # Sampled, not every row: a million haversines is pointless
                # when ten thousand fixes the median to within a kilometre.
                if len(travel_d) < 40000 and item["lat"] and user["home_lat"]:
                    d = haversine(float(user["home_lat"]), float(user["home_lng"]),
                                  float(item["lat"]), float(item["lng"]))
                    if d is not None:
                        travel_d.append(d)
                if item["category"] in PERSONAS[user["persona"]][1]:
                    persona_hits += 1

                ui = hash((u, i))
                if ev == "view":
                    prev = first_view.get(ui)
                    if prev is None or ts < prev:
                        first_view[ui] = ts
                elif ev in ("book", "rate"):
                    prev = first_view.get(ui)
                    if prev is None or prev >= ts:
                        out_of_order += 1

    fails = []

    def check(label, ok, detail):
        print(f"  {'PASS' if ok else 'FAIL'}  {label:<26} {detail}")
        if not ok:
            fails.append(label)

    print(f"\n{n:,} interactions · {len(items):,} items · {len(users):,} users"
          f" · {len(files)} files\n")

    check("no duplicate rows", dup == 0, f"{dup} duplicates")
    check("all ids resolve", bad_ids == 0, f"{bad_ids} rows reference nothing")

    ranked = [c for _, c in pop.most_common()]
    top10 = sum(ranked[: max(1, len(ranked) // 10)]) / max(1, n)
    check("long-tailed popularity", 0.25 <= top10 <= 0.90,
          f"top 10% of seen items hold {top10:.0%} of events")

    counts = sorted(per_user.values(), reverse=True)
    heavy = sum(counts[: max(1, len(counts) // 10)]) / max(1, n)
    check("power-law attention", heavy >= 0.30,
          f"heaviest 10% of users leave {heavy:.0%} of events")

    order = ["view", "save", "plan", "book"]
    check("funnel narrows", all(events[a] > events[b] for a, b in zip(order, order[1:])),
          " > ".join(f"{k} {events[k]:,}" for k in order))

    check("funnel is ordered", out_of_order == 0,
          f"{out_of_order} bookings or ratings before any view")

    # Distance decay, measured in kilometres rather than by state.
    #
    # This used to ask what share of events landed in the user's home state,
    # against a null built from where users and items actually are. That is a
    # coarse proxy: crossing a state line half a mile away counts the same as
    # flying two thousand kilometres, and the answer swings with how lopsided
    # the catalogue happens to be. Comparing the real distances against
    # randomly paired users and items tests the thing itself, and cannot be
    # satisfied by a catalogue that merely clusters.
    rng = random.Random(11)
    placed_items = [i for i in items.values() if i["lat"] and i["lng"]]
    placed_users = [u for u in users.values() if u["home_lat"] and u["home_lng"]]
    null_d = []
    if placed_items and placed_users:
        for _ in range(20000):
            u = rng.choice(placed_users)
            i = rng.choice(placed_items)
            d = haversine(float(u["home_lat"]), float(u["home_lng"]),
                          float(i["lat"]), float(i["lng"]))
            if d is not None:
                null_d.append(d)
    if null_d and travel_d:
        real_med = statistics.median(travel_d)
        null_med = statistics.median(null_d)
        check("distance decay", real_med < null_med * 0.75,
              f"median {real_med:,.0f}km travelled vs {null_med:,.0f}km "
              f"if geography were ignored ({real_med / null_med:.0%})")
    home_share = home_hits / max(1, n)
    print(f"        (home-state share {home_share:.1%}, for reference)")

    peak = sum(by_month[m] for m in (11, 12, 1, 2))
    trough = sum(by_month[m] for m in (6, 7, 8))
    check("seasonality", peak > trough * 1.4, f"Nov-Feb {peak:,} vs Jun-Aug {trough:,}")

    if sum(hill_month.values()):
        h = sum(hill_month[m] for m in (5, 6)) / sum(hill_month.values())
        a = sum(by_month[m] for m in (5, 6)) / max(1, n)
        check("hill season inverts", h > a,
              f"May-Jun is {h:.1%} of hill events vs {a:.1%} overall")

    multi = sum(1 for c in sessions.values() if c > 1) / max(1, len(sessions))
    check("sessions are sessions", multi > 0.4,
          f"{multi:.0%} of sessions hold 2+ events, mean {n / max(1, len(sessions)):.1f}")

    # Measured per user against their own persona. The earlier version asked
    # whether the category was sought by ANY persona, which every category is,
    # so it reported 100% and tested nothing.
    check("persona affinity", persona_hits / max(1, n) > 0.45,
          f"{persona_hits / max(1, n):.0%} of events land in the user's own categories")

    seen_share = len(pop) / max(1, len(items))
    check("catalogue covered", seen_share > 0.60,
          f"{len(pop):,}/{len(items):,} items seen ({seen_share:.0%}); "
          f"{len(items) - len(pop):,} cold")

    cats = Counter(i["category"] for i in items.values())
    thin = [c for c in ("food", "culture", "nature", "heritage", "spiritual")
            if cats.get(c, 0) < 100]
    check("category variety", not thin,
          f"{len(cats)} categories; "
          + ", ".join(f"{c} {v:,}" for c, v in cats.most_common(6))
          + (f" — thin: {thin}" if thin else ""))

    check("food is reachable", ev_cat.get("food", 0) > n * 0.01,
          f"{ev_cat.get('food', 0):,} food events ({ev_cat.get('food', 0) / max(1, n):.1%})")
    check("culture is reachable", ev_cat.get("culture", 0) > n * 0.01,
          f"{ev_cat.get('culture', 0):,} culture events "
          f"({ev_cat.get('culture', 0) / max(1, n):.1%})")

    states = Counter(i["state"] for i in items.values() if i["state"])
    check("states covered", len(states) >= 30,
          f"{len(states)} states/UTs, largest {states.most_common(1)[0][0]} "
          f"at {states.most_common(1)[0][1]:,}")

    print()
    if fails:
        print(f"  {len(fails)} FAILED: {', '.join(fails)}")
        raise SystemExit(1)
    print("  all checks passed")


if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
    main()
