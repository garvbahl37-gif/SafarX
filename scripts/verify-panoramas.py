#!/usr/bin/env python3
"""
Walks src/data/vrTours.json and proves every image it ships is real and
reachable — every vantage point in every tour's `panoramas[]`, and (with
`--gallery`) every image in every `story.gallery`.

    python3 scripts/verify-panoramas.py            # panoramas only
    python3 scripts/verify-panoramas.py --gallery  # panoramas + story galleries

For each panorama it:
  1. HEADs the URL             -> must be HTTP 200 with an image/* content-type
  2. ranged-GETs the first 384K-> parses the *actual* pixel dimensions out of
                                  the JPEG/PNG/WebP header, so we measure the
                                  bytes that will be rendered rather than
                                  trusting any API's metadata
  3. asserts 1.90 <= width/height <= 2.10

Gallery images are only checked for reachability and content-type: they are
ordinary photographs, so a 2:1 ratio would be wrong for them.

Note that a 2:1 ratio is necessary but *not* sufficient to call an image
equirectangular — a 24%-wide slice of a sphere and an 18:9 phone crop are both
exactly 2:1 and both render as a smear. Sourcing therefore also requires GPano
XMP with full-sphere crop values, a 360 camera in EXIF, or membership of a
Commons 360°/photosphere category. This script is the last gate, not the only
one.

Exit status is non-zero if any image fails, or if any tour ships without a
panorama.
"""
import io
import json
import os
import struct
import sys
import time
import urllib.error
import urllib.request

UA = {"User-Agent": "SafarX-PanoramaVerifier/1.0 (jiteshbhalla1@gmail.com)"}
DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    "src", "data", "vrTours.json")
LO, HI = 1.90, 2.10


def _open(req, timeout):
    """One request, retrying politely through Wikimedia's 429 throttle."""
    for attempt in range(5):
        try:
            return urllib.request.urlopen(req, timeout=timeout)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 4:
                time.sleep(3 + attempt * 4)
                continue
            raise


def head(url):
    req = urllib.request.Request(url, headers=UA, method="HEAD")
    with _open(req, 45) as r:
        return r.status, r.headers.get("Content-Type", ""), r.headers.get("Content-Length")


def head_bytes(url, n=393216):
    req = urllib.request.Request(url, headers=dict(UA, Range="bytes=0-%d" % (n - 1)))
    with _open(req, 90) as r:
        return r.read()


def jpeg_size(b):
    f, n = io.BytesIO(b), len(b)
    if f.read(2) != b"\xff\xd8":
        return None
    while f.tell() < n:
        while True:                       # scan to next marker
            byte = f.read(1)
            if not byte:
                return None
            if byte == b"\xff":
                break
        marker = f.read(1)
        while marker == b"\xff":
            marker = f.read(1)
        if not marker:
            return None
        m = marker[0]
        if m in (0x00, 0x01, 0xD8) or 0xD0 <= m <= 0xD7:
            continue
        if m == 0xD9:                     # EOI — no SOF found
            return None
        raw = f.read(2)
        if len(raw) < 2:
            return None
        seglen = struct.unpack(">H", raw)[0]
        if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            body = f.read(5)
            if len(body) < 5:
                return None
            h, w = struct.unpack(">HH", body[1:5])
            return w, h
        f.seek(seglen - 2, 1)
    return None


def png_size(b):
    if b[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", b[16:24])


def webp_size(b):
    if b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return None
    if b[12:16] == b"VP8X":
        w = int.from_bytes(b[24:27], "little") + 1
        h = int.from_bytes(b[27:30], "little") + 1
        return w, h
    return None


def dimensions(b):
    for fn in (jpeg_size, png_size, webp_size):
        try:
            got = fn(b)
        except Exception:
            got = None
        if got and got[0] and got[1]:
            return got
    return None


def check(label, url, want_ratio=True):
    row = {"id": label, "url": url}
    if not url:
        row.update(status="NONE", dims="-", ratio="-", ok=False)
        return row
    try:
        code, ctype, clen = head(url)
    except urllib.error.HTTPError as e:
        row.update(status="HTTP %s" % e.code, dims="-", ratio="-", ok=False)
        return row
    except Exception as e:
        row.update(status="ERR %s" % e, dims="-", ratio="-", ok=False)
        return row

    if code != 200 or not ctype.startswith("image/"):
        row.update(status="HTTP %s %s" % (code, ctype), dims="-", ratio="-", ok=False)
        return row

    try:
        dim = dimensions(head_bytes(url))
    except Exception as e:
        row.update(status="200 %s" % ctype, dims="read-failed: %s" % e,
                   ratio="-", ok=False)
        return row

    if not dim:
        row.update(status="200 %s" % ctype, dims="unparsed", ratio="-", ok=False)
        return row

    w, h = dim
    ratio = w / h
    row.update(status="200 %s" % ctype.split(";")[0],
               dims="%dx%d" % (w, h), ratio=round(ratio, 3),
               bytes=int(clen) if clen else None,
               ok=(LO <= ratio <= HI) if want_ratio else True)
    return row


def rows_for(tours, with_gallery):
    """Every image the data ships, flattened into (label, url, want_ratio)."""
    out = []
    for t in tours:
        tid = t.get("id")
        pans = t.get("panoramas") or []
        if not pans and t.get("panorama"):        # legacy single-panorama tour
            pans = [{"url": t["panorama"], "label": t.get("name")}]
        if not pans:
            out.append(("%s [no panorama]" % tid, None, True))
            continue
        for i, p in enumerate(pans):
            out.append(("%s#%d" % (tid, i), p.get("url"), True))
        if with_gallery:
            for i, g in enumerate((t.get("story") or {}).get("gallery") or []):
                out.append(("%s gal#%d" % (tid, i), g.get("url"), False))
                if g.get("full"):
                    out.append(("%s gal#%df" % (tid, i), g["full"], False))
    return out


def main():
    with_gallery = "--gallery" in sys.argv
    tours = json.load(open(DATA))
    todo = rows_for(tours, with_gallery)
    # Sequential on purpose: upload.wikimedia.org throttles parallel range reads.
    rows = [check(label, url, want_ratio) for label, url, want_ratio in todo]

    w = [20, 58, 13, 7, 22, 6]
    hdr = ("tour / vantage", "image URL (tail)", "dimensions", "ratio", "status", "ok")
    line = "  ".join(h.ljust(x) for h, x in zip(hdr, w))
    print(line)
    print("-" * len(line))
    for r in rows:
        tail = (r["url"] or "NONE")
        if len(tail) > w[1]:
            tail = "…" + tail[-(w[1] - 1):]
        print("  ".join([
            str(r["id"]).ljust(w[0]),
            tail.ljust(w[1]),
            str(r["dims"]).ljust(w[2]),
            str(r["ratio"]).ljust(w[3]),
            str(r["status"])[:w[4]].ljust(w[4]),
            ("PASS" if r["ok"] else "FAIL").ljust(w[5]),
        ]))

    bad = [r for r in rows if not r["ok"]]
    kind = "images" if with_gallery else "vantage points"
    print("\n%d/%d %s verified across %d tours."
          % (len(rows) - len(bad), len(rows), kind, len(tours)))
    if not with_gallery:
        print("Re-run with --gallery to check every story gallery image too.")
    if bad:
        print("Failing: " + ", ".join(str(r["id"]) for r in bad))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
