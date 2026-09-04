# SafarX recommender dataset

**The interactions in here are synthetic. No row describes a real person or a
real session.** They exist so the recommender can be built and measured before
SafarX has traffic of its own. Do not quote any number from this directory as
a usage figure.

The **items are real**. Every one is a genuine place, dish or festival, from
three sources:

| source | items | what it contributes |
|---|---|---|
| SafarX's own data | 522 | the gems, VR tours, cities and attractions the app has built pages for |
| Wikidata | 14,698 | the famous things — forts, national parks, monuments, dishes, festivals |
| OpenStreetMap | 19,043 | the ordinary ones — restaurants, viewpoints, neighbourhood temples |

Where two sources describe the same place, the richer record wins: SafarX's own
first, then Wikidata, then OSM. Nothing was invented. There is no
two-hundred-thousand-row list of real Indian tourist attractions to be had —
Wikidata's entire tourism universe for India is about 38,000 — so the scale
comes from OSM's named POIs rather than from padding the table with plausible
fiction, which would have made the catalogue as synthetic as the behaviour and
left nothing worth training against.

Categories: food 11,675, nature 8,308, spiritual 6,811, heritage 3,705, culture 3,308, wildlife 179, beach 141, city 118, adventure 18.

The commonest kinds: restaurant 6,673, temple 3,201, mountain 2,525, lake 2,209, street food 2,048, cafe 1,831, heritage 1,604, park 1,421.

## Files

| file | rows | what it is |
|---|---|---|
| `items.csv` | 34,263 | the real catalogue: everything below |
| `users.csv` | 10,000 | synthetic travellers, each anchored to a real Indian city |
| `interactions_*.csv` | 1,500,000 across 30 | synthetic events, 50,000 per file |

`items.csv` and `users.csv` are committed. The interaction files are **not** —
they are git-ignored. They come to roughly 102 MB, they
regenerate byte-for-byte from the seed below, and a deploying repo should not
carry that in its history for ever. Run the command under *Reproducing* and
they reappear exactly as they were.

## Interactions

`user_id, item_id, event, rating, timestamp, session_id, surface, dwell_seconds`

Events: view 1,193,807, save 171,446, plan 82,308, book 29,845, rate 22,594

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
    python3 scripts/recsys/generate.py --batches 30 --seed 20260904

Deterministic: seed `20260904`, clock starting `2024-01-01`, spanning 586 days.
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
