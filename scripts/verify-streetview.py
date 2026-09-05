#!/usr/bin/env python3
"""
Proves that every tour in src/data/vrTours.json which opts into Street View
actually has Street View coverage, before a visitor discovers otherwise.

    python3 scripts/verify-streetview.py

Reads VITE_GOOGLE_MAPS_KEY from .env and calls the Street View *metadata*
endpoint, which is free and unmetered — you can run this as often as you like
without touching the Maps billing quota. For each tour with a `streetView`
block it reports:

  OK          a panorama exists; prints its id, capture date and how far it
              sits from the tour's own coordinates
  ZERO_RESULTS  nothing within the tour's radius — that tour will fall through
              to Mapillary and then to the honest empty state
  REQUEST_DENIED  the key is not authorised for this API (see below)

A pinned `streetView.panoId` is checked by id; everything else is checked by
coordinates using the tour's own `radius`.

Note the metadata endpoint belongs to the Street View Static API, while the
app renders through the Maps JavaScript API. They are enabled separately in
the Cloud console, so a clean run here confirms coverage and key validity but
not that the *browser* path is switched on.
"""

import json
import math
import os
import pathlib
import sys
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
TOURS = ROOT / "src" / "data" / "vrTours.json"
ENDPOINT = "https://maps.googleapis.com/maps/api/streetview/metadata"


def read_key():
    for name in (".env", ".env.local"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text().splitlines():
            line = line.strip()
            if line.startswith("VITE_GOOGLE_MAPS_KEY="):
                return line.split("=", 1)[1].strip().strip("\"'")
    return os.environ.get("VITE_GOOGLE_MAPS_KEY")


def metres_between(a, b):
    r = 6371000
    dlat = math.radians(b[0] - a[0])
    dlng = math.radians(b[1] - a[1])
    h = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlng / 2) ** 2
    )
    return round(2 * r * math.asin(math.sqrt(h)))


def lookup(key, tour):
    config = tour["streetView"]
    if not isinstance(config, dict):
        config = {}
    params = {"key": key}
    if config.get("panoId"):
        params["pano"] = config["panoId"]
    else:
        params["location"] = f"{tour['latitude']},{tour['longitude']}"
        params["radius"] = config.get("radius", 140)
        params["source"] = "outdoor"
    url = f"{ENDPOINT}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.load(response)


def main():
    key = read_key()
    if not key:
        sys.exit("No VITE_GOOGLE_MAPS_KEY in .env, .env.local or the environment.")

    tours = [t for t in json.loads(TOURS.read_text()) if t.get("streetView")]
    if not tours:
        sys.exit("No tour in vrTours.json opts into Street View.")

    print(f"Checking Street View coverage for {len(tours)} tours\n")
    counts = {}
    for tour in tours:
        try:
            data = lookup(key, tour)
        except Exception as exc:  # network, DNS, timeout
            counts["ERROR"] = counts.get("ERROR", 0) + 1
            print(f"  ERROR         {tour['id']:16s} {exc}")
            continue

        status = data.get("status", "UNKNOWN")
        counts[status] = counts.get(status, 0) + 1

        if status != "OK":
            message = (data.get("error_message") or "").split("\n")[0]
            print(f"  {status:13s} {tour['id']:16s} {message[:70]}")
            continue

        location = data.get("location") or {}
        away = ""
        if "lat" in location and "lng" in location:
            away = f"{metres_between((tour['latitude'], tour['longitude']), (location['lat'], location['lng']))} m away"
        pinned = " (pinned)" if (tour["streetView"] or {}).get("panoId") else ""
        print(
            f"  OK            {tour['id']:16s} {data.get('date', '?'):8s} "
            f"{away:12s} {data.get('pano_id', '')[:24]}{pinned}"
        )

    print("\n" + "  ".join(f"{k}: {v}" for k, v in sorted(counts.items())))
    return 0 if counts.get("OK") == len(tours) else 1


if __name__ == "__main__":
    sys.exit(main())
