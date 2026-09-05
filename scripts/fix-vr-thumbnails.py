"""
Audit VR tour thumbnails: do they load, and do they fit a landscape card?

Two problems, one pass over the same data.

SLOWNESS is no longer this script's problem. It was written to resolve each
Special:FilePath redirect and store the result, which would have helped a
little; the real cause turned out to be rate limiting rather than redirects —
Wikimedia returns 429 on fifteen of twenty parallel image requests — so the
fix lives in src/utils/imageCdn.js, which serves every Wikimedia picture
through a caching image CDN instead. Resolving URLs here would have been work
in the wrong place.

What it is still good for is the other half.

CROPPED. A landscape card fed a portrait photograph crops the middle out of it,
which is how the Taj lost its dome and Qutub Minar lost its top. The API
returns the real dimensions, so the same pass flags anything too tall to sit in
a 16:10 card and says so rather than silently shipping it.

    python3 scripts/fix-vr-thumbnails.py
"""
import json
import pathlib
import subprocess
import sys
import urllib.parse

ROOT = pathlib.Path(__file__).resolve().parents[1]
TOURS = ROOT / "src" / "data" / "vrTours.json"
API = "https://commons.wikimedia.org/w/api.php"
AGENT = "SafarX-SIH/1.0 (student project; github.com/garvbahl37-gif)"

# The card is a 16:10 panel a few hundred pixels wide on a phone and about
# 640 on a desktop grid. 800 leaves room for a 2x screen without paying for
# the 1920px original.
WANT_WIDTH = 800
# Below this, a landscape card has to throw away the top or the bottom.
MIN_ASPECT = 1.35


def api(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    out = subprocess.run(["curl", "-s", "-m", "60", "-H", f"User-Agent: {AGENT}", url],
                         capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return {}


def filename_of(url):
    """The Commons file name inside a Special:FilePath URL."""
    if "Special:FilePath/" not in url:
        return None
    tail = url.split("Special:FilePath/", 1)[1].split("?")[0]
    return urllib.parse.unquote(tail)


def head(url):
    """(status, content_type, bytes, seconds) for a URL."""
    out = subprocess.run(
        ["curl", "-sL", "-o", "/dev/null", "-w",
         "%{http_code} %{content_type} %{size_download} %{time_total} %{num_redirects}",
         "-H", f"User-Agent: {AGENT}", url],
        capture_output=True, text=True).stdout.split()
    if len(out) < 5:
        return ("000", "", 0, 0.0, 0)
    return (out[0], out[1], int(out[2]), float(out[3]), int(out[4]))


def main():
    tours = json.loads(TOURS.read_text())
    rows = []

    for t in tours:
        name = filename_of(t.get("thumbnail", ""))
        if not name:
            rows.append((t["name"], None, "not a Commons URL", None))
            continue

        d = api({"action": "query", "titles": f"File:{name}", "prop": "imageinfo",
                 "iiprop": "url|size", "iiurlwidth": WANT_WIDTH})
        pages = (d.get("query") or {}).get("pages") or {}
        info = None
        for p in pages.values():
            if p.get("imageinfo"):
                info = p["imageinfo"][0]
        if not info:
            rows.append((t["name"], None, "API returned nothing", None))
            continue

        # Strip the tracking parameters; they are noise on an <img src>.
        url = info["thumburl"].split("?")[0]
        aspect = info["width"] / info["height"] if info["height"] else 0
        rows.append((t["name"], url, None, aspect))
        t["_resolved"] = url
        t["_aspect"] = round(aspect, 2)

    print(f"{'tour':<34} {'aspect':>7}  {'kB':>6} {'s':>6}  status")
    portrait, broken = [], []
    for t in tours:
        url = t.get("_resolved")
        if not url:
            print(f"{t['name'][:33]:<34} {'—':>7}  {'—':>6} {'—':>6}  UNRESOLVED")
            broken.append(t["name"])
            continue
        code, ctype, size, secs, redirs = head(url)
        ok = code == "200" and ctype.startswith("image/")
        a = t["_aspect"]
        flag = ""
        if not ok:
            flag = f"HTTP {code}"
            broken.append(t["name"])
        elif a < MIN_ASPECT:
            flag = f"PORTRAIT — crops in a 16:10 card"
            portrait.append((t["name"], a))
        print(f"{t['name'][:33]:<34} {a:>7.2f}  {size/1000:>6.0f} {secs:>6.2f}  {flag}")

    print(f"\n  {len(portrait)} too tall for the card, {len(broken)} unresolved")
    for n, a in portrait:
        print(f"    {a:.2f}  {n}")

    print("\n  Anything listed PORTRAIT is cropped by the card. The CDN's")
    print("  attention crop keeps the busiest part of the frame, which is")
    print("  usually right, but below about 0.8 the picture is worth replacing.")


if __name__ == "__main__":
    main()
