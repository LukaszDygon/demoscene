#!/usr/bin/env python3
"""Check a built intro against its byte budget.

    budget.py dist/x.html [--total 65536] [--music src/music.js] [--music-max 16384]

Sizes are raw bytes (UTF-8), which is what demoparty rules usually mean. --music measures the
soundtrack source as given; pass the minified/shipped music file if your build minifies it.
Also flags anything that looks like an external request. Exits 1 if over budget or not self-contained.
"""
import argparse, gzip, pathlib, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("html")
ap.add_argument("--total", type=int, default=65536)
ap.add_argument("--music")
ap.add_argument("--music-max", type=int, default=16384)
a = ap.parse_args()

data = pathlib.Path(a.html).read_bytes()
ok = True
print(f"total  {len(data):6d} / {a.total} bytes ({len(data) / a.total:.0%})   gzip {len(gzip.compress(data, 9))}")
if len(data) > a.total:
    ok = False
    print("  OVER BUDGET")
if a.music:
    m = len(pathlib.Path(a.music).read_bytes())
    print(f"music  {m:6d} / {a.music_max} bytes ({m / a.music_max:.0%})")
    if m > a.music_max:
        ok = False
        print("  MUSIC OVER BUDGET")
ext = re.findall(rb"""(?:src|href)\s*=\s*["']?(?:https?:)?//[^"'\s>]+|@import|\bfetch\(|\bimport\(""", data)
if ext:
    ok = False
    print("  external references:", [e.decode(errors="replace")[:80] for e in ext[:5]])
sys.exit(0 if ok else 1)
