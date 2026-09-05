"""
Rewrite every Special:FilePath image URL to the CDN object it points at.

`commons.wikimedia.org/wiki/Special:FilePath/X.jpg` is not a file, it is a
lookup that 302s twice to an object on Wikimedia's CDN. That indirection is
merely slow when a browser does it. It is fatal when the image CDN does it on
our behalf: asked for five hundred of them in a few minutes, Wikimedia
throttles the application endpoint and wsrv returns 404. Measured, 243 of 525
pictures failed that way, consistently and repeatably — the same URL 404s
through the proxy every time while the CDN object it resolves to serves in
full.

So resolve them once, here, and store the answer. The redirect is then paid
by nobody: not the visitor, not the image CDN, not Wikimedia.

Runs at three at a time with a long backoff, because the endpoint being
resolved is the same one that objects to being hammered — the whole reason
this script exists.

    python3 scripts/resolve-wikimedia-urls.py           # report
    python3 scripts/resolve-wikimedia-urls.py --write   # apply
"""
import json
import pathlib
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[1]
GEMS = ROOT / "src" / "data" / "hiddengems.json"
TOURS = ROOT / "src" / "data" / "vrTours.json"
AGENT = "SafarX-SIH/1.0 (student project; github.com/garvbahl37-gif)"


def resolve(url, attempts=4):
    """Follow the redirects to the real object, or return None."""
    if "Special:FilePath" not in url:
        return url
    for n in range(attempts):
        out = subprocess.run(
            ["curl", "-sIL", "-o", "/dev/null", "-w", "%{http_code} %{url_effective}",
             "-m", "60", "-H", f"User-Agent: {AGENT}", url],
            capture_output=True, text=True).stdout.split(None, 1)
        if len(out) == 2 and out[0] == "200":
            # The tracking parameters are noise on an <img src>, and they make
            # the CDN cache key longer for no benefit.
            return out[1].split("?")[0]
        # Backing off matters: this is the endpoint that rate-limits, and
        # retrying immediately just deepens the hole.
        time.sleep(4 * (n + 1))
    return None


def collect():
    """Every distinct Special:FilePath URL across both data files."""
    gems = json.loads(GEMS.read_text())
    tours = json.loads(TOURS.read_text())
    urls = set()
    for g in gems:
        for u in g.get("images") or []:
            if "Special:FilePath" in u:
                urls.add(u)
    for t in tours:
        if "Special:FilePath" in (t.get("thumbnail") or ""):
            urls.add(t["thumbnail"])
    return gems, tours, sorted(urls)


def main(write):
    gems, tours, urls = collect()
    print(f"  {len(urls)} distinct Special:FilePath URLs to resolve\n")

    done, failed = {}, []
    # Three at a time. Faster gets throttled, which is what we are fixing.
    with ThreadPoolExecutor(max_workers=3) as ex:
        for src, dst in zip(urls, ex.map(resolve, urls)):
            if dst:
                done[src] = dst
            else:
                failed.append(src)
            n = len(done) + len(failed)
            if n % 50 == 0:
                print(f"    {n}/{len(urls)}  ({len(failed)} unresolved)", flush=True)

    print(f"\n  resolved {len(done)}, failed {len(failed)}")
    for u in failed[:8]:
        print(f"    unresolved: {u[:100]}")

    if not write:
        print("\n  report only — pass --write to apply")
        return

    swapped = 0
    for g in gems:
        imgs = g.get("images") or []
        for i, u in enumerate(imgs):
            if u in done:
                imgs[i] = done[u]
                swapped += 1
    for t in tours:
        u = t.get("thumbnail")
        if u in done:
            t["thumbnail"] = done[u]
            swapped += 1

    GEMS.write_text(json.dumps(gems, indent=2, ensure_ascii=False) + "\n")
    TOURS.write_text(json.dumps(tours, indent=2, ensure_ascii=False) + "\n")
    print(f"  rewrote {swapped} URLs across both files")


if __name__ == "__main__":
    main("--write" in sys.argv)
