# SafarX recommender dataset

**The interactions in here are synthetic. No row describes a real person or a
real session.** They exist so the recommender can be built and measured before
SafarX has traffic of its own. Do not quote any number from this directory as
a usage figure.

The **items are real**. Every one is a genuine place, dish or festival, from
three sources:

| source | items | what it contributes |
|---|---|---|
| SafarX's own data | 539 | the gems, VR tours, cities and attractions the app has built pages for |
| Wikidata | 15,002 | the famous things — forts, national parks, monuments, dishes, festivals |
| OpenStreetMap | 66,013 | the ordinary ones — restaurants, viewpoints, neighbourhood temples |

Where two sources describe the same place, the richer record wins: SafarX's own
first, then Wikidata, then OSM. Nothing was invented. There is no
two-hundred-thousand-row list of real Indian tourist attractions to be had —
Wikidata's entire tourism universe for India is about 38,000 — so the scale
comes from OSM's named POIs rather than from padding the table with plausible
fiction, which would have made the catalogue as synthetic as the behaviour and
left nothing worth training against.

Categories: food 33,964, spiritual 25,644, nature 11,396, heritage 5,510, culture 4,434, wildlife 226, beach 206, city 126, adventure 48.

The commonest kinds: restaurant 20,100, temple 13,983, street food 6,477, cafe 6,264, church 4,566, mosque 3,983, mountain 2,526, shrine 2,486.

## Files

| file | rows | what it is |
|---|---|---|
| `items.csv` | 81,554 | the real catalogue: everything below |
| `users.csv` | 10,000 | synthetic travellers, each anchored to a real Indian city |
| `interactions_*.csv` | 1,500,000 across 30 | synthetic events, 50,000 per file |

`items.csv` and `users.csv` are committed. The interaction files are **not** —
they are git-ignored. They come to roughly 102 MB, they
regenerate byte-for-byte from the seed below, and a deploying repo should not
carry that in its history for ever. Run the command under *Reproducing* and
they reappear exactly as they were.

## Interactions

`user_id, item_id, event, rating, timestamp, session_id, surface, dwell_seconds`

Events: view 1,195,106, save 171,003, plan 81,971, book 29,441, rate 22,479

Every row is unique on `(user_id, item_id, event, timestamp)`. That is asserted
at the end of generation, not assumed.

## What was built into the data, and why

A recommender trained on uniformly random interactions learns nothing, because
there is nothing there to learn — every model scores alike and the metrics
measure the sampler. These are the structures that make it trainable:

- **Long-tailed popularity, applied to exposure rather than to choice.** Item
  weight falls off as `1/rank^0.8`, and that weight decides which
  candidates a user is *shown*; which of those they act on is decided by their
  own taste alone. Scoring by popularity instead made it decide nearly every
  pick, because it spreads over four orders of magnitude where everything
  personal spans about forty.
- **A latent taste per user.** Two people with the same persona are not the
  same person. This is deliberately absent from `users.csv`: a model should
  infer it from behaviour, and handing it over as a column would make any
  score measured here meaningless.
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
- **Deep histories.** A constraint, not a flourish. At 25 events per user,
  item-based CF *lost* to a popularity ranking by 46%; at 167 events per user,
  on the identical generator, it *won* by 34%. Row count and user count are
  therefore chosen together, at roughly 150 events per user. Raising the user
  count without raising the rows will quietly destroy the signal this corpus
  exists for.

## Baselines

    python3 scripts/recsys/baseline.py

Splits temporally and runs the two models anything else has to beat: a
popularity ranking, and item-based collaborative filtering. Use it before
trusting a result from this data — it was written because a dataset nobody has
trained on is a claim rather than a result, and it caught this one being
barely learnable three separate times.

Two findings from it are worth carrying:

- **CF's margin over popularity shrinks as the catalogue grows** against a
  fixed interaction budget. That is a real property of recommender data, not a
  defect: a large catalogue is sparse, so the collaborative signal concentrates
  in the head while the tail stays cold. Choose the interaction volume to give
  the catalogue a fair chance.
- **Fitting CF on intent only makes it much worse here**, despite being the
  textbook move for implicit feedback. Views are drawn by exposure and do carry
  popularity bias, but positives run to about thirty per user across tens of
  thousands of items and there is nothing there to fit. `--signal intent`
  reproduces the comparison.

## Reproducing

    node scripts/recsys/export-js-data.mjs      # the app's own data
    python3 scripts/recsys/wikidata.py harvest  # slow, resumable, cached
    python3 scripts/recsys/osm.py               # slower, resumable, cached
    python3 scripts/recsys/generate.py --batches 30 --seed 20260904

Deterministic: seed `20260904`, clock starting `2024-01-01`, spanning 588 days.
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
