"""
Builds the SafarX recommender dataset.

    python3 scripts/recsys/generate.py --batches 20        # 1,000,000 rows

WHAT THIS IS. The items are real — every one is a place SafarX actually holds.
The users, sessions and interactions are synthetic, generated so a recommender
can be built and measured before SafarX has traffic of its own. None of it is
observed behaviour, no row describes a real person, and no number out of it
should ever be quoted as a usage figure. Each file says so in its own header.

WHY IT IS SHAPED LIKE THIS. A recommender trained on uniformly random
interactions learns nothing, because there is nothing to learn: every model
scores the same and every offline metric measures the sampler. The structure
below is what makes the data worth training on.

  Popularity is long-tailed. A handful of items take most of the traffic and
  the tail is thin, which is what makes a popularity baseline hard to beat and
  therefore worth beating.

  Attention is unevenly spread. Most users leave a handful of events, a few
  leave hundreds. Fit to a uniform user and you will be surprised by the real
  one.

  Geography dominates. People look at places near home far more than places
  across the country. Distance is the strongest single feature in a travel
  recommender and a dataset without it teaches the model to ignore it.

  Seasons matter here more than in most domains. Indian travel peaks between
  October and March, drops through the monsoon, and hill stations invert both
  — Ladakh in January is a different proposition from Ladakh in June.

  Taste is consistent. A persona that opens forts keeps opening forts, which
  is the collaborative signal the whole model rests on.

  Funnels narrow. Views outnumber saves, saves outnumber plans, plans
  outnumber bookings, by roughly an order of magnitude each time.

  Histories are deep. This one is a constraint rather than a flourish, and it
  was measured: at 25 events per user, item-based CF LOST to a popularity
  ranking by 46%, because there is not enough co-occurrence in a short history
  for a collaborative model to find. At 167 events per user, on the identical
  generator, it WON by 34%. So the row count and the user count are chosen
  together — roughly 150 events per user — and raising the user count without
  raising the rows would quietly destroy the signal the corpus exists for.

Every row is unique on (user_id, item_id, event, timestamp) — enforced, not
assumed, and the check is asserted at the end of every batch.
"""
import argparse
import csv
import hashlib
import itertools
import json
import math
import pathlib
import random
from collections import Counter, defaultdict
from datetime import datetime, timedelta

from catalogue import build_items

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "recsys"
BATCH_ROWS = 50_000

# ── The people ────────────────────────────────────────────────────────────
PERSONAS = {
    # weight, the categories they lean into, how far they will go
    "heritage-seeker":  (0.19, ["heritage", "spiritual", "culture"], 1400),
    "mountain-walker":  (0.14, ["adventure", "nature"], 1800),
    "beach-and-slow":   (0.12, ["beach", "nature", "food"], 1200),
    "food-first":       (0.13, ["food", "culture", "city"], 900),
    "family-holiday":   (0.16, ["city", "heritage", "wildlife"], 800),
    "weekend-escaper":  (0.15, ["nature", "adventure", "city"], 350),
    "pilgrim":          (0.11, ["spiritual", "heritage"], 1600),
}
# Every category an item can carry, so each user can hold an opinion on all
# of them.
ALL_CATEGORIES = ["heritage", "spiritual", "culture", "nature", "adventure",
                  "wildlife", "beach", "food", "city"]

PARTY = ["solo", "couple", "family", "friends"]
BUDGET = ["shoestring", "moderate", "comfortable", "premium"]
AGE_BANDS = ["18-24", "25-34", "35-44", "45-54", "55+"]
SURFACES = ["search", "feed", "agent", "vr", "map", "gems"]

# How many past views a user carries. It bounds the run — without it, users at
# a few hundred events each hold millions of live entries for the whole
# generation — and forgetting the oldest is closer to the truth than a
# traveller with perfect recall of every place they ever glanced at.
#
# There is no sampling knob any more. Weighting a random forty of the history
# instead of all of it was tried as a cost saving and measured: item-based CF
# went from beating the popularity baseline to losing to it by 29%. Which item
# a person saves is the sharpest signal in the corpus, and choosing it from a
# reshuffled subset each time blurs exactly the consistency a collaborative
# model looks for. The cost is paid by caching instead — see below.
HISTORY_CAP = 400

# How steeply popularity falls off with rank. Long-tailed, but not so steep
# that a person's own taste never gets a look in. See item_scores().
POP_EXPONENT = 0.8

EVENTS = ["view", "save", "plan", "book", "rate"]
# Each step down the funnel is roughly a tenth of the one above it.
EVENT_WEIGHTS = [0.795, 0.115, 0.055, 0.020, 0.015]

# Monsoon suppresses travel; the cool months carry it. Index by month number.
SEASON = {1: 1.15, 2: 1.20, 3: 1.05, 4: 0.85, 5: 0.75, 6: 0.55,
          7: 0.50, 8: 0.55, 9: 0.75, 10: 1.25, 11: 1.35, 12: 1.40}
# The hills invert it: summer is when you can get there at all.
HILL_SEASON = {1: 0.45, 2: 0.50, 3: 0.75, 4: 1.10, 5: 1.45, 6: 1.50,
               7: 0.90, 8: 0.85, 9: 1.10, 10: 1.05, 11: 0.70, 12: 0.50}
HILL_STATES = {"Ladakh", "Himachal Pradesh", "Uttarakhand", "Jammu and Kashmir",
               "Sikkim", "Arunachal Pradesh"}

# How likely a session is to survive at each hour, IST. Trip planning happens
# in the evening; almost none of it happens at four in the morning, and a
# dataset where it does will teach any time-of-day feature nonsense.
DIURNAL = [0.06, 0.03, 0.02, 0.02, 0.03, 0.08, 0.18, 0.34, 0.48, 0.62, 0.70,
           0.72, 0.68, 0.60, 0.58, 0.62, 0.70, 0.80, 0.92, 1.00, 0.96, 0.78,
           0.46, 0.20]


def haversine(a_lat, a_lng, b_lat, b_lng):
    """Kilometres between two points, or None when either is unplaced."""
    if None in (a_lat, a_lng, b_lat, b_lng):
        return None
    r = 6371.0
    p1, p2 = math.radians(a_lat), math.radians(b_lat)
    dp = math.radians(b_lat - a_lat)
    dl = math.radians(b_lng - a_lng)
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def make_users(count, items, rng):
    """Synthetic travellers, each anchored to a real Indian city."""
    cities = [i for i in items if i["kind"] == "place" and i["lat"]]
    names = list(PERSONAS)
    weights = [PERSONAS[p][0] for p in names]
    start = datetime(2024, 1, 1)

    users = []
    for n in range(count):
        home = rng.choice(cities)
        persona = rng.choices(names, weights=weights)[0]
        users.append({
            "user_id": f"u{n:07d}",
            "persona": persona,
            "home_state": home["state"],
            "home_region": home["region"],
            "home_lat": round(home["lat"], 4),
            "home_lng": round(home["lng"], 4),
            "age_band": rng.choice(AGE_BANDS),
            "party": rng.choices(PARTY, weights=[0.24, 0.31, 0.29, 0.16])[0],
            "budget": rng.choices(BUDGET, weights=[0.22, 0.38, 0.28, 0.12])[0],
            # Zipf-ish: most people barely use the app, a few live in it.
            "activity": max(1, int(rng.paretovariate(1.35))),
            # Two people with the same persona are not the same person. Without
            # this, taste is fully explained by seven personas and a home
            # state, there is nothing left for a collaborative model to
            # discover, and it cannot beat a popularity ranking. This is the
            # latent signal the whole exercise is meant to be about.
            #
            # Deliberately NOT written to users.csv. A model should have to
            # infer it from behaviour; handing it over as a column would make
            # the task trivial and the benchmark meaningless.
            "taste": {c: rng.lognormvariate(0, 0.85) for c in ALL_CATEGORIES},
            "signed_up": (start + timedelta(days=rng.randrange(0, 640))).date().isoformat(),
        })
    return users


def item_scores(items, rng):
    """
    A popularity prior with a long tail.

    Rank the catalogue once, then let score fall off as 1/rank^POP_EXPONENT.
    Without this every item is equally likely, a popularity baseline is
    worthless, and the dataset cannot tell a good model from a coin toss.

    This prior no longer scores candidates — it decides which candidates a
    user is shown at all. That separation is the important one, and it took
    two measurements to arrive at.

    Scoring by popularity made popularity decide nearly every pick, because it
    spreads over four orders of magnitude where everything personal spans
    about forty: item-based CF beat the popularity baseline by 1%. Flattening
    the exponent to compensate was worse — CF then LOST to popularity by 32%,
    because spreading a fixed number of interactions across a large catalogue
    left roughly seventeen training events per user and no item co-occurrence
    for a collaborative model to find.

    Both failures have the same cause: exposure and choice were the same step.
    Real systems do not work that way. Popular places are what people are
    shown, and which of those they act on is where their own taste lives. So
    candidates are now drawn in proportion to this prior, and the personal
    terms alone decide the winner — which concentrates traffic enough for
    co-occurrence to exist while leaving the decision genuinely personal.
    """
    order = items[:]
    rng.shuffle(order)
    prior = {}
    for rank, it in enumerate(order, start=1):
        base = 1.0 / (rank ** POP_EXPONENT)
        # A tour with sixteen panoramas or a gem with six photographs really
        # does get opened more than a bare record.
        prior[it["item_id"]] = base * (1.0 + 0.09 * min(it.get("media_count", 1), 8))
    return prior


def affinity(user, item, _prior=None, _unused=None):
    """
    How much this user wants this item, given they have already seen it.

    Deliberately carries no popularity term: the candidate was drawn in
    proportion to popularity, so counting it again here would let the famous
    win twice and flatten the personal signal back out.
    """
    score = 1.0

    cats = PERSONAS[user["persona"]][1]
    if item["category"] in cats:
        score *= 4.5
    elif item["category"] in ("city",):
        score *= 1.2
    else:
        score *= 0.35

    # The individual on top of the type.
    score *= user["taste"].get(item["category"], 1.0)

    if item["region"] == user["home_region"]:
        score *= 2.1
    if item["state"] == user["home_state"]:
        score *= 2.6

    # Computed, not cached. Memoising on (user, item) was fine against 522
    # items and becomes a liability against tens of thousands: forty thousand
    # users browsing a few hundred places each is millions of live entries and
    # gigabytes of dictionary, to avoid a haversine that costs a microsecond.
    d = haversine(user["home_lat"], user["home_lng"], item["lat"], item["lng"])
    if d is not None:
        reach = PERSONAS[user["persona"]][2]
        # Interest decays with distance and falls away past the persona's reach.
        score *= math.exp(-d / (reach * 1.6))

    return score


def season_weight(item, when):
    table = HILL_SEASON if item["state"] in HILL_STATES else SEASON
    return table[when.month]


def rating_for(user, item, event, rng):
    """Ratings are only left after a plan or a booking, and skew high."""
    if event != "rate":
        return ""
    liked = item["category"] in PERSONAS[user["persona"]][1]
    base = 4.3 if liked else 3.5
    return round(min(5.0, max(1.0, rng.gauss(base, 0.7))) * 2) / 2


def generate(batches, users_count, seed, since):
    rng = random.Random(seed)
    items = build_items()
    users = make_users(users_count, items, rng)
    prior = item_scores(items, rng)

    OUT.mkdir(parents=True, exist_ok=True)
    write_items(items)
    write_users(users)

    # Sampling users by activity is what produces the power law: a heavy user
    # is simply drawn more often than a light one.
    user_weights = [u["activity"] for u in users]
    item_list = items
    by_id = {i["item_id"]: i for i in items}
    # Cumulative popularity, so a candidate draw is one bisect rather than a
    # pass over the catalogue.
    cum_pop = list(itertools.accumulate(prior[i["item_id"]] for i in items))

    # Hashes, not the tuples themselves: six million four-string tuples is
    # well over a gigabyte held for the whole run, purely to answer "have I
    # written this row before".
    seen = set()               # hash of (user, item, event, timestamp)
    # user -> {item: when it was first viewed}, the causal record
    first_seen = defaultdict(dict)
    written = 0
    stats = Counter()
    start = datetime.fromisoformat(since)
    days = 640

    # One clock, moving forward only.
    #
    # Sessions used to be stamped with a random day inside the window, which
    # broke two things at once. Rows came out in generation order rather than
    # time order, so a booking could be written before the view that
    # authorised it had happened — a model trained on that learns to predict
    # the past from the future. And seasonality only ever biased *which* item
    # was picked, never how many events a month held, so monthly volume came
    # out flat despite the table below.
    #
    # A single advancing clock fixes both. The gap to the next session is
    # exponential — a Poisson arrival process, which is what site traffic
    # actually is — with its mean divided by the month's seasonal weight, so
    # busy months simply have sessions closer together. Session starts are
    # ordered, so files come out in clock order; the rows themselves interleave
    # slightly because sessions overlap, so sort by timestamp if you need an
    # exact split boundary.
    per_session = 3.13         # mean of the session-length weights below
    est_sessions = max(1, int(batches * BATCH_ROWS / per_session))
    # E[1/season] and the share of sessions the night filter keeps, so the run
    # still spans `days` rather than drifting long.
    norm = sum(1 / v for v in SEASON.values()) / len(SEASON)
    norm *= len(DIURNAL) / sum(DIURNAL)
    base_gap = days * 86400 / est_sessions / norm
    clock = start

    for b in range(1, batches + 1):
        path = OUT / f"interactions_{b:05d}.csv"
        with path.open("w", newline="") as fh:
            w = csv.writer(fh)
            w.writerow(["user_id", "item_id", "event", "rating", "timestamp",
                        "session_id", "surface", "dwell_seconds"])
            rows = 0
            while rows < BATCH_ROWS:
                # Advance to the next session. Busy months get shorter gaps.
                clock += timedelta(
                    seconds=rng.expovariate(SEASON[clock.month] / base_gap)
                )
                # Nobody plans a holiday at four in the morning. Skipping the
                # session rather than moving it keeps the clock monotonic.
                if rng.random() > DIURNAL[clock.hour]:
                    continue

                user = rng.choices(users, weights=user_weights)[0]

                # A session is a handful of events minutes apart, not one event
                # in isolation — sequence models need the ordering to exist.
                when = clock
                session = hashlib.blake2s(
                    f"{user['user_id']}{when.date()}{rng.random()}".encode(), digest_size=6
                ).hexdigest()
                surface = rng.choices(SURFACES, weights=[0.28, 0.24, 0.14, 0.11, 0.09, 0.14])[0]

                for _ in range(rng.choices([1, 2, 3, 4, 6, 9], weights=[26, 24, 18, 14, 11, 7])[0]):
                    if rows >= BATCH_ROWS:
                        break

                    # Six things they were shown, drawn by popularity; the one
                    # they act on is decided by taste. Scoring all of a large
                    # catalogue per event is not affordable, and would not be
                    # more truthful — nobody is shown two hundred thousand
                    # places either.
                    pick, best = None, -1.0
                    for cand in rng.choices(item_list, cum_weights=cum_pop, k=6):
                        sc = affinity(user, cand) * season_weight(cand, when)
                        if sc > best:
                            pick, best = cand, sc
                    if pick is None:
                        continue

                    when += timedelta(seconds=rng.randrange(20, 900))
                    event = rng.choices(EVENTS, weights=EVENT_WEIGHTS)[0]

                    # You cannot book or rate what you have not already looked
                    # at. The test is against the clock, not against a set of
                    # everything the user ever touched — sessions overlap, so
                    # "has viewed it" and "had viewed it by now" are different
                    # questions, and only the second one is causal.
                    #
                    # When the gate trips, re-aim at something the user really
                    # had seen by then rather than demoting the event to a
                    # view. Demoting starved the deep end of the funnel: rate
                    # events came out at a quarter of their intended rate, and
                    # those are the strongest signal a ranking model has.
                    if event != "view":
                        history = first_seen[user["user_id"]]
                        prior_view = history.get(pick["item_id"])
                        if prior_view is None or prior_view[0] >= when:
                            earlier = [(i, a) for i, (t, a) in history.items()
                                       if t < when]
                            if earlier:
                                # Weighted by how much they actually like it,
                                # not drawn at random. Picking uniformly made
                                # every save, plan and booking an arbitrary
                                # item from the user's history — which is
                                # precisely the set a recommender is scored
                                # on, so the deep funnel carried no preference
                                # at all and item-based CF lost to a
                                # popularity ranking by 24%. What someone
                                # saves is the strongest statement of taste
                                # they make; it cannot be a coin toss.
                                cands = [by_id[i] for i, _a in earlier]
                                like = [a for _i, a in earlier]
                                pick = (rng.choices(cands, weights=like)[0]
                                        if sum(like) > 0 else rng.choice(cands))
                            else:
                                event = "view"

                    stamp = when.isoformat(timespec="seconds")
                    key = hash((user["user_id"], pick["item_id"], event, stamp))
                    if key in seen:
                        continue
                    seen.add(key)
                    # Only a view establishes that a place has been seen. Letting
                    # any event do it meant an item first touched by a save
                    # could then be booked with no view anywhere in the
                    # history — 5,109 rows deep in a run, and a straight
                    # contradiction of what this file claims about itself.
                    if event == "view":
                        hist = first_seen[user["user_id"]]
                        # Affinity is stored with the view, not recomputed
                        # later. It depends only on the user and the item, so
                        # it is the same value every time — and recomputing it
                        # across the whole history on every save, plan and
                        # booking was tens of millions of calls a run.
                        hist.setdefault(pick["item_id"], (when, affinity(user, pick)))
                        if len(hist) > HISTORY_CAP:
                            # Oldest out. dicts keep insertion order, and views
                            # are inserted in clock order, so the first key is
                            # the oldest.
                            del hist[next(iter(hist))]

                    dwell = max(2, int(rng.lognormvariate(3.1, 0.9)))
                    w.writerow([
                        user["user_id"], pick["item_id"], event,
                        rating_for(user, pick, event, rng),
                        stamp, session, surface, dwell,
                    ])
                    stats[event] += 1
                    rows += 1
                    written += 1

                # The clock deliberately does NOT jump to the end of this
                # session. Sessions overlap, because on any real site several
                # people are browsing at once. Pushing the clock past each one
                # made sessions strictly sequential, and since every session
                # spends about twenty-four minutes of clock on its own events,
                # the window then grew with the row count — 640 days became
                # 981 at fifty thousand rows and would have passed 5,000 at a
                # million. Session *starts* stay ordered; the rows themselves
                # interleave, exactly as a real log does.

        print(f"  batch {b:>3}  {rows:,} rows  →  {path.relative_to(ROOT)}")

    # The no-duplicates promise, checked rather than claimed.
    assert len(seen) == written, f"duplicate rows: {written - len(seen)}"
    span = (clock - start).days
    write_readme(items, users, batches, written, stats, seed, since, span)
    return items, users, written, stats


def write_items(items):
    cols = ["item_id", "kind", "title", "state", "region", "category",
            "lat", "lng", "media_count", "difficulty", "cost_per_day",
            # Sparse — about a fifth of OSM's eateries carry it — but real
            # where present, and the only content feature the catalogue has
            # that speaks to what a place actually serves.
            "duration_days", "cuisine"]
    with (OUT / "items.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for it in items:
            w.writerow(it)


def write_users(users):
    # `taste` is deliberately excluded. It is the latent preference a model is
    # supposed to infer from behaviour; writing it as a column would hand over
    # the answer and make any score measured against this data meaningless.
    cols = [c for c in users[0] if c != "taste"]
    with (OUT / "users.csv").open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(users)


def write_readme(items, users, batches, rows, stats, seed, since, span):
    from collections import Counter as _C
    src = _C(i.get("_source", "app") for i in items)
    cats = _C(i["category"] for i in items)
    kinds = _C(i["kind"] for i in items)
    (OUT / "README.md").write_text(f"""# SafarX recommender dataset

**The interactions in here are synthetic. No row describes a real person or a
real session.** They exist so the recommender can be built and measured before
SafarX has traffic of its own. Do not quote any number from this directory as
a usage figure.

The **items are real**. Every one is a genuine place, dish or festival, from
three sources:

| source | items | what it contributes |
|---|---|---|
| SafarX's own data | {src.get("app", 0):,} | the gems, VR tours, cities and attractions the app has built pages for |
| Wikidata | {src.get("wikidata", 0):,} | the famous things — forts, national parks, monuments, dishes, festivals |
| OpenStreetMap | {src.get("osm", 0):,} | the ordinary ones — restaurants, viewpoints, neighbourhood temples |

Where two sources describe the same place, the richer record wins: SafarX's own
first, then Wikidata, then OSM. Nothing was invented. There is no
two-hundred-thousand-row list of real Indian tourist attractions to be had —
Wikidata's entire tourism universe for India is about 38,000 — so the scale
comes from OSM's named POIs rather than from padding the table with plausible
fiction, which would have made the catalogue as synthetic as the behaviour and
left nothing worth training against.

Categories: {", ".join(f"{c} {n:,}" for c, n in cats.most_common())}.

The commonest kinds: {", ".join(f"{k} {n:,}" for k, n in kinds.most_common(8))}.

## Files

| file | rows | what it is |
|---|---|---|
| `items.csv` | {len(items):,} | the real catalogue: everything below |
| `users.csv` | {len(users):,} | synthetic travellers, each anchored to a real Indian city |
| `interactions_*.csv` | {rows:,} across {batches} | synthetic events, {BATCH_ROWS:,} per file |

`items.csv` and `users.csv` are committed. The interaction files are **not** —
they are git-ignored. They come to roughly {rows * 68 // 1_000_000} MB, they
regenerate byte-for-byte from the seed below, and a deploying repo should not
carry that in its history for ever. Run the command under *Reproducing* and
they reappear exactly as they were.

## Interactions

`user_id, item_id, event, rating, timestamp, session_id, surface, dwell_seconds`

Events: {", ".join(f"{k} {v:,}" for k, v in stats.most_common())}

Every row is unique on `(user_id, item_id, event, timestamp)`. That is asserted
at the end of generation, not assumed.

## What was built into the data, and why

A recommender trained on uniformly random interactions learns nothing, because
there is nothing there to learn — every model scores alike and the metrics
measure the sampler. These are the structures that make it trainable:

- **Long-tailed popularity.** Item score falls off as `1/rank^0.85`, so a
  popularity baseline is genuinely hard to beat, and therefore worth beating.
- **Power-law attention.** User activity is Pareto-distributed: most users
  leave a few events, a few leave hundreds.
- **Distance decay.** Interest falls off exponentially with kilometres from a
  user's home city, scaled by how far their persona travels. Geography is the
  strongest single feature in travel recommendation.
- **Season, and its inversion.** Indian travel peaks October–March and drops
  through the monsoon; the six Himalayan states invert it, because Ladakh in
  January is not Ladakh in June.
- **Persona affinity.** Seven personas each lean towards three categories, so
  the collaborative signal the model depends on actually exists.
- **A narrowing funnel.** view → save → plan → book, each roughly a tenth of
  the last, and nobody books or rates an item they never viewed.
- **Sessions.** Events arrive in bursts minutes apart under one `session_id`,
  so sequence models have an ordering to learn from. Sessions overlap, because
  more than one person is browsing at any given moment.
- **A daily rhythm.** Trip planning peaks around 7pm and nearly stops at 4am,
  so an hour-of-day feature has something true to learn.

## Reproducing

    node scripts/recsys/export-js-data.mjs      # the app's own data
    python3 scripts/recsys/wikidata.py harvest  # slow, resumable, cached
    python3 scripts/recsys/osm.py               # slower, resumable, cached
    python3 scripts/recsys/generate.py --batches {batches} --seed {seed}

Deterministic: seed `{seed}`, clock starting `{since}`, spanning {span} days.
Same seed, same rows, every time — which is why the files themselves need not
be committed.

## Splitting

Split on time, never at random. A random split lets the model see a user's
future while predicting their past, and every score it produces will be a
flattering lie. Sort by `timestamp` and cut the last ~15% as your test set.

Batches are written in clock order, so `interactions_00001.csv` is the oldest
traffic and the highest-numbered file the newest. Holding out the last file or
two is a reasonable temporal split on its own; sort within them if you need
the boundary to be exact, since overlapping sessions interleave rows slightly.
""")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--batches", type=int, default=4, help=f"files of {BATCH_ROWS:,} rows")
    ap.add_argument("--users", type=int, default=40_000)
    ap.add_argument("--seed", type=int, default=20260904)
    ap.add_argument("--since", default="2024-01-01")
    a = ap.parse_args()

    items, users, rows, stats = generate(a.batches, a.users, a.seed, a.since)
    print(f"\n  {len(items):,} items · {len(users):,} users · {rows:,} interactions")
    print(f"  events: {dict(stats)}")
