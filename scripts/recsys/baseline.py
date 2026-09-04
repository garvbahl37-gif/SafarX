"""
Splits the dataset and measures two baselines on it.

A dataset nobody has trained anything on is a claim, not a result. This is the
smallest honest test of whether the corpus carries learnable structure: split
it the way it must be split, run the two models everything else has to beat,
and print the numbers.

  Popularity — recommend the most-visited items to everybody. It ignores the
  user entirely, so it is the floor. If a collaborative model cannot beat it,
  the collaborative signal is not there.

  Item-based collaborative filtering — score an item by how often it co-occurs
  with the ones this user already touched, cosine-normalised. No training
  step, no hyperparameters worth arguing about; it is the honest second
  baseline for implicit feedback.

THE SPLIT IS TEMPORAL, and that is not a detail. Splitting interactions at
random lets a model see a user's future while predicting their past, and every
score it produces afterwards is a flattering lie. Here the last 15% of the
timeline is the test set, the 15% before it validation, and a model only ever
sees a user's earlier behaviour.

Scoring uses the standard associativity trick rather than building an
item-item matrix: with two hundred thousand items that matrix has forty
billion cells, while (x·Xᵀ)·X gives the same scores in two sparse
multiplications per user.

    python3 scripts/recsys/baseline.py [--users 3000] [--k 20]
"""
import argparse
import csv
import glob
import pathlib
from collections import Counter
from datetime import datetime

import numpy as np
from scipy import sparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "recsys"

# What counts as a positive worth predicting. A view is a glance; the intent
# a recommender is judged on is the deliberate act.
POSITIVE = {"save", "plan", "book", "rate"}


def load_interactions():
    """Stream the files into three parallel arrays, ints not strings."""
    users, items, stamps, kinds = [], [], [], []
    uidx, iidx = {}, {}
    epoch = datetime(2024, 1, 1)

    for path in sorted(glob.glob(str(OUT / "interactions_*.csv"))):
        with open(path) as fh:
            for r in csv.DictReader(fh):
                u = uidx.setdefault(r["user_id"], len(uidx))
                i = iidx.setdefault(r["item_id"], len(iidx))
                t = int((datetime.fromisoformat(r["timestamp"]) - epoch).total_seconds())
                users.append(u)
                items.append(i)
                stamps.append(t)
                kinds.append(r["event"] in POSITIVE)

    return (np.array(users, dtype=np.int32), np.array(items, dtype=np.int32),
            np.array(stamps, dtype=np.int64), np.array(kinds, dtype=bool),
            uidx, iidx)


def temporal_split(stamps, val=0.15, test=0.15):
    """Cut points on the clock, not on the row order."""
    lo = np.quantile(stamps, 1.0 - val - test)
    hi = np.quantile(stamps, 1.0 - test)
    return stamps < lo, (stamps >= lo) & (stamps < hi), stamps >= hi


def ndcg_at_k(ranked, truth, k):
    """Graded only by position; every held-out item counts the same."""
    gains = [1.0 / np.log2(r + 2) for r, item in enumerate(ranked[:k]) if item in truth]
    ideal = sum(1.0 / np.log2(r + 2) for r in range(min(len(truth), k)))
    return sum(gains) / ideal if ideal else 0.0


def evaluate(sample_users, train_csr, truth_by_user, n_items, k, popular):
    """Recall@k and NDCG@k for popularity and for item-based CF."""
    pop_recall = pop_ndcg = cf_recall = cf_ndcg = 0.0
    counted = 0

    for u in sample_users:
        truth = truth_by_user.get(u)
        if not truth:
            continue
        seen = train_csr[u].indices
        counted += 1

        # Popularity: the same list for everyone, minus what they have seen.
        ranked = [i for i in popular if i not in set(seen)][:k]
        pop_recall += len(set(ranked) & truth) / len(truth)
        pop_ndcg += ndcg_at_k(ranked, truth, k)

        # Item CF: (x·Xᵀ)·X, never materialising the item-item matrix.
        x = train_csr[u]
        if x.nnz == 0:
            continue
        neighbours = x @ train_csr.T          # 1 x users
        scores = np.asarray((neighbours @ train_csr).todense()).ravel()
        scores[seen] = -np.inf                # never re-recommend the known
        top = np.argpartition(-scores, min(k, n_items - 1))[:k]
        top = top[np.argsort(-scores[top])]
        cf_recall += len(set(top.tolist()) & truth) / len(truth)
        cf_ndcg += ndcg_at_k(top.tolist(), truth, k)

    if not counted:
        return None
    return {
        "users": counted,
        "pop_recall": pop_recall / counted, "pop_ndcg": pop_ndcg / counted,
        "cf_recall": cf_recall / counted, "cf_ndcg": cf_ndcg / counted,
    }


def main(n_sample, k, seed):
    print("  loading…", flush=True)
    users, items, stamps, positive, uidx, iidx = load_interactions()
    n_users, n_items = len(uidx), len(iidx)
    print(f"  {len(users):,} interactions · {n_users:,} users · {n_items:,} items")

    tr, va, te = temporal_split(stamps)
    print(f"  train {tr.sum():,} · val {va.sum():,} · test {te.sum():,}  (temporal)")

    # Confidence-weighted implicit matrix: a save or a booking is worth more
    # than a glance, but a glance is not worth nothing.
    weight = np.where(positive[tr], 3.0, 1.0)
    train_csr = sparse.csr_matrix(
        (weight, (users[tr], items[tr])), shape=(n_users, n_items))
    train_csr.data = train_csr.data / np.maximum(
        1e-9, np.sqrt(np.asarray(train_csr.multiply(train_csr).sum(axis=0)).ravel()
                      )[train_csr.indices])   # cosine over items

    popular = [i for i, _ in Counter(items[tr].tolist()).most_common(k * 40)]

    truth = {}
    for u, i, p in zip(users[te], items[te], positive[te]):
        if p:
            truth.setdefault(int(u), set()).add(int(i))
    print(f"  {len(truth):,} users hold a positive in the test window")

    rng = np.random.default_rng(seed)
    candidates = np.array(sorted(truth))
    sample = rng.choice(candidates, size=min(n_sample, len(candidates)), replace=False)

    print(f"  scoring {len(sample):,} of them…", flush=True)
    r = evaluate(sample, train_csr, truth, n_items, k, popular)
    if not r:
        print("  no evaluable users")
        return

    print(f"\n  evaluated on {r['users']:,} users, k={k}\n")
    print(f"  {'model':<26} {'Recall@' + str(k):>10} {'NDCG@' + str(k):>10}")
    print(f"  {'popularity (floor)':<26} {r['pop_recall']:>10.4f} {r['pop_ndcg']:>10.4f}")
    print(f"  {'item-based CF':<26} {r['cf_recall']:>10.4f} {r['cf_ndcg']:>10.4f}")

    lift = (r["cf_ndcg"] / r["pop_ndcg"] - 1) * 100 if r["pop_ndcg"] else float("inf")
    print(f"\n  CF beats popularity by {lift:+.0f}% on NDCG.")
    print("  A collaborative model beating the popularity floor is the whole")
    print("  point: it means the corpus carries per-user signal, not just a")
    print("  ranking of famous places that would score the same for everyone.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--users", type=int, default=3000)
    ap.add_argument("--k", type=int, default=20)
    ap.add_argument("--seed", type=int, default=7)
    a = ap.parse_args()
    main(a.users, a.k, a.seed)
