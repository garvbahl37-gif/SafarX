#!/bin/sh
# Re-download the third-party tables the catalogue merges.
#
# The extracted files are git-ignored — 91MB of them — so this is how they come
# back. Tokens live in .env, which is git-ignored too; never commit either.
#
#   sh scripts/recsys/fetch-external.sh
#
# What it fetches, and why:
#   MakeMyTrip hotels   19,589 Indian properties with coordinates and ratings.
#                       The `stay` category is mostly this.
#   Zomato restaurants  55,568 Indian restaurants with cost for two, cuisines
#                       and ratings. The only real prices in the catalogue.
#   Indian Railways      8,990 stations with coordinates. SafarX tracks trains.
#   Indian Food 101        253 dishes, each tied to the state it comes from.
#   IMD rainfall normals   641 districts x 12 months. Real seasonality — see
#                       scripts/recsys/rainfall.py for why this one is trusted
#                       when a similar-looking dataset was not.
#   Indian cities          212 cities with coordinates.
#   Airports in India      119 real airports, once heliports and closed
#                       strips are dropped.
#   UNESCO sites            38 Indian World Heritage sites, used to mark
#                       catalogue items rather than to add new ones.
#
# Deliberately NOT fetched: a state-by-month tourism series whose numbers are
# fabricated (Goa peaking in the monsoon, Ladakh in February under snow), and
# two sets of LLM-generated itineraries and Q&A. See scripts/recsys/external.py.
set -e
cd "$(dirname "$0")/../.."
. ./.env 2>/dev/null || { echo "no .env with KAGGLE_TOKEN"; exit 1; }
OUT=data/recsys/_external
mkdir -p "$OUT"
for ds in \
  PromptCloudHQ/hotels-on-makemytrip \
  shrutimehta/zomato-restaurants-data \
  rabhar/zomato-restaurants-in-india \
  sripaadsrinivasan/indian-railways-dataset \
  nehaprabhavalkar/indian-food-101 \
  rajanand/rainfall-in-india \
  parulpandey/indian-cities-database \
  bhanupratapbiswas/list-of-airports-in-india \
  ujwalkandi/unesco-world-heritage-sites ; do
  slug=$(echo "$ds" | tr '/' '_')
  echo "  fetching $ds"
  curl -sL -H "Authorization: Bearer $KAGGLE_TOKEN" -o "/tmp/$slug.zip" \
    "https://www.kaggle.com/api/v1/datasets/download/$ds"
  mkdir -p "$OUT/kg_$slug"
  unzip -o -q "/tmp/$slug.zip" -d "$OUT/kg_$slug"
  rm -f "/tmp/$slug.zip"
done
echo "  done — rebuild with: python3 scripts/recsys/catalogue.py"
