"""
Checks the dataset has the structure it claims to have.

Every property the README advertises is measured here rather than asserted.
A generator can quietly lose a signal — a weight typo, a gate that fires too
often — and the resulting file still looks like a dataset. This is how you
find out before spending a training run on it.

    python3 scripts/recsys/validate.py
"""
import csv
import glob
import math
import pathlib
from collections import Counter, defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "recsys"

def load(name):
    with (OUT / name).open() as fh:
        return list(csv.DictReader(fh))

def main():
    items = {r["item_id"]: r for r in load("items.csv")}
    users = {r["user_id"]: r for r in load("users.csv")}

    rows = []
    for path in sorted(glob.glob(str(OUT / "interactions_*.csv"))):
        with open(path) as fh:
            rows.extend(csv.DictReader(fh))

    fails = []
    def check(label, ok, detail):
        print(f"  {'PASS' if ok else 'FAIL'}  {label:<26} {detail}")
        if not ok:
            fails.append(label)

    print(f"\n{len(rows):,} interactions · {len(items):,} items · {len(users):,} users\n")

    # 1. Uniqueness — the promise the whole dataset rests on.
    keys = {(r["user_id"], r["item_id"], r["event"], r["timestamp"]) for r in rows}
    check("no duplicate rows", len(keys) == len(rows), f"{len(rows) - len(keys)} duplicates")

    # 2. Referential integrity.
    bad_i = sum(1 for r in rows if r["item_id"] not in items)
    bad_u = sum(1 for r in rows if r["user_id"] not in users)
    check("all ids resolve", bad_i == 0 and bad_u == 0, f"{bad_i} bad items, {bad_u} bad users")

    # 3. Long tail: the top decile of items should carry well over its share.
    pop = Counter(r["item_id"] for r in rows)
    ranked = [c for _, c in pop.most_common()]
    top10 = sum(ranked[: max(1, len(ranked) // 10)]) / len(rows)
    check("long-tailed popularity", 0.30 <= top10 <= 0.85, f"top 10% of items hold {top10:.0%} of events")

    # 4. Power-law attention.
    per_user = Counter(r["user_id"] for r in rows)
    counts = sorted(per_user.values(), reverse=True)
    heavy = sum(counts[: max(1, len(counts) // 10)]) / len(rows)
    check("power-law attention", heavy >= 0.30, f"heaviest 10% of users leave {heavy:.0%} of events")

    # 5. Funnel narrows monotonically.
    ev = Counter(r["event"] for r in rows)
    order = ["view", "save", "plan", "book"]
    narrows = all(ev[a] > ev[b] for a, b in zip(order, order[1:]))
    check("funnel narrows", narrows, " > ".join(f"{k} {ev[k]:,}" for k in order))

    # 6. Nobody books or rates something they never viewed.
    seen, violations = defaultdict(set), 0
    for r in sorted(rows, key=lambda r: r["timestamp"]):
        if r["event"] in ("book", "rate") and r["item_id"] not in seen[r["user_id"]]:
            violations += 1
        seen[r["user_id"]].add(r["item_id"])
    check("funnel is ordered", violations == 0, f"{violations} bookings before any view")

    # 7. Distance decay — home-state items must beat the catalogue average.
    home_hits = sum(1 for r in rows if items[r["item_id"]]["state"] == users[r["user_id"]]["home_state"])
    home_share = home_hits / len(rows)
    states = Counter(i["state"] for i in items.values())
    baseline = sum(c * c for c in states.values()) / (len(items) ** 2)
    check("distance decay", home_share > baseline * 3,
          f"home state {home_share:.1%} vs {baseline:.1%} if geography were ignored")

    # 8. Seasonality — the cool months must beat the monsoon.
    by_month = Counter(int(r["timestamp"][5:7]) for r in rows)
    peak = sum(by_month[m] for m in (11, 12, 1, 2))
    trough = sum(by_month[m] for m in (6, 7, 8))
    check("seasonality", peak > trough * 1.4, f"Nov-Feb {peak:,} vs Jun-Aug {trough:,}")

    # 9. Hill states must invert it, or the inversion never made it in.
    hill = {"Ladakh", "Himachal Pradesh", "Uttarakhand", "Sikkim",
            "Jammu and Kashmir", "Arunachal Pradesh"}
    h = Counter(int(r["timestamp"][5:7]) for r in rows if items[r["item_id"]]["state"] in hill)
    if sum(h.values()):
        h_summer = sum(h[m] for m in (5, 6)) / sum(h.values())
        a_summer = sum(by_month[m] for m in (5, 6)) / len(rows)
        check("hill season inverts", h_summer > a_summer,
              f"May-Jun is {h_summer:.1%} of hill events vs {a_summer:.1%} overall")

    # 10. Sessions hold more than one event, or sequence models have nothing.
    sess = Counter(r["session_id"] for r in rows)
    multi = sum(1 for c in sess.values() if c > 1) / len(sess)
    check("sessions are sessions", multi > 0.4,
          f"{multi:.0%} of sessions hold 2+ events, mean {len(rows)/len(sess):.1f}")

    # 11. Persona affinity — the collaborative signal itself.
    from generate import PERSONAS
    on = sum(1 for r in rows
             if items[r["item_id"]]["category"] in PERSONAS[users[r["user_id"]]["persona"]][1])
    check("persona affinity", on / len(rows) > 0.5,
          f"{on/len(rows):.0%} of events land in the user's own categories")

    # 12. Coverage — a catalogue with dead items trains a model that ignores them.
    check("catalogue covered", len(pop) / len(items) > 0.95,
          f"{len(pop)}/{len(items)} items seen at least once")

    print()
    if fails:
        print(f"  {len(fails)} FAILED: {', '.join(fails)}")
        raise SystemExit(1)
    print("  all checks passed")

if __name__ == "__main__":
    main()
