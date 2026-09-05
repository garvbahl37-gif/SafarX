"""
Swap every oversized Pexels video for a lighter rendition of the same clip.

The home page was loading a 566MB file. Not a typo: one background video, 4K,
fifty-eight seconds, 566 megabytes. Another was 171MB. On a development
machine they had been cached weeks earlier and played instantly, which is
exactly why nobody noticed; a visitor arriving at the deployed site has to pull
the whole thing before it can start, so it never starts. That is the entire
bug — the videos were never broken, they were unreachable in any practical
sense. Across the app there was 1,138MB of it.

The footage is kept and only the rendition changes, so nothing ends up
mislabelled: the Varanasi slide still shows Varanasi. Pexels publishes every
clip at several sizes and the URL is the only thing that differs.

BUDGET is what a background video may weigh. A hero behind text does not need
4K — it is scaled to fit, darkened by an overlay and usually moving, which is
the worst case for noticing detail and the best case for saving bytes.

    python3 scripts/shrink-videos.py            # report
    python3 scripts/shrink-videos.py --write    # apply
"""
import json
import os
import pathlib
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
URL_RE = re.compile(r'https://videos\.pexels\.com/video-files/(\d+)/([^"\s\')]+\.mp4)')

# Megabytes. Above this a background video is a download, not a backdrop.
BUDGET = 12.0
# Never go below this width, however tempting the file size: a backdrop
# stretched full-bleed from 640px looks like a mistake even behind an overlay.
MIN_WIDTH = 960


def api(vid):
    key = os.environ.get("PEXELS_KEY", "")
    out = subprocess.run(
        ["curl", "-s", "-m", "60", "-H", f"Authorization: {key}",
         f"https://api.pexels.com/videos/videos/{vid}"],
        capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except json.JSONDecodeError:
        return {}


def best_rendition(vid, current_file):
    """The largest rendition that fits the budget, and its size."""
    d = api(vid)
    files = [f for f in d.get("video_files", []) if f.get("width") and f.get("size")]
    if not files:
        return None, None, None
    current = next((f for f in files if f["link"].split("?")[0].endswith(current_file)), None)
    cur_mb = (current["size"] / 1048576) if current else None

    fits = [f for f in files
            if f["size"] / 1048576 <= BUDGET and f["width"] >= MIN_WIDTH]
    if fits:
        pick = max(fits, key=lambda f: f["width"])
    else:
        # Nothing fits: take the smallest that still clears the width floor,
        # and if even that fails, the smallest there is.
        wide = [f for f in files if f["width"] >= MIN_WIDTH]
        pick = min(wide or files, key=lambda f: f["size"])
    return pick["link"].split("?")[0], pick["size"] / 1048576, cur_mb


def main(write):
    if not os.environ.get("PEXELS_KEY"):
        print("  set PEXELS_KEY first"); return

    files = list(SRC.rglob("*.jsx")) + list(SRC.rglob("*.js"))
    used = {}
    for f in files:
        for m in URL_RE.finditer(f.read_text()):
            used.setdefault(m.group(0), (m.group(1), m.group(2)))

    def work(item):
        url, (vid, fname) = item
        new, mb, cur = best_rendition(vid, fname)
        return url, new, mb, cur

    with ThreadPoolExecutor(max_workers=5) as ex:
        rows = list(ex.map(work, used.items()))

    plan, before, after = {}, 0.0, 0.0
    print(f"{'was':>9} {'now':>9}   clip")
    for url, new, mb, cur in sorted(rows, key=lambda r: -(r[3] or 0)):
        if cur:
            before += cur
        if not new or not mb:
            print(f"{cur or 0:>8.1f}M {'?':>9}   {url.split('/')[-1][:44]}  (no data)")
            continue
        # Never trade up. The rule is "largest that fits the budget", which on
        # a clip already chosen small would quietly replace it with a heavier
        # one — the sign-in screen's 720p backdrops were picked deliberately
        # and this would have undone that. Only shrink.
        if cur is not None and mb >= cur:
            after += cur
            continue
        after += mb
        if new != url:
            plan[url] = new
            print(f"{cur:>8.1f}M {mb:>8.1f}M   {url.split('/')[-1][:40]}")
    print(f"\n  {len(plan)} to swap · {before:.0f}MB -> {after:.0f}MB")

    if not write:
        print("  report only — pass --write to apply")
        return

    changed = 0
    for f in files:
        text = original = f.read_text()
        for old, new in plan.items():
            text = text.replace(old, new)
        if text != original:
            f.write_text(text)
            changed += 1
    print(f"  rewrote {changed} files")


if __name__ == "__main__":
    main("--write" in sys.argv)
