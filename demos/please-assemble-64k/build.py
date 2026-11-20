#!/usr/bin/env python3
"""Pack src/ into dist/please-assemble-64k.opus-5.5-medium.html and enforce the 64k budget.

Limits: whole file <= 65536 bytes, soundtrack (music.js as packed, incl. the speech chip) <= 16384 bytes.
Packing is conservative: strip indentation, blank lines and full-line // comments.
"""
import gzip, pathlib, sys

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"
TOTAL_MAX, MUSIC_MAX = 65536, 16384


def pack(js: str) -> str:
    return "\n".join(s for s in (l.strip() for l in js.splitlines()) if s and not s.startswith("//"))


music = pack((SRC / "music.js").read_text("utf-8"))
demo = pack((SRC / "demo.js").read_text("utf-8"))
html = (SRC / "shell.html").read_text("utf-8").replace("/*MUSIC*/", music).replace("/*DEMO*/", demo)

DIST.mkdir(exist_ok=True)
out = DIST / "please-assemble-64k.opus-5.5-medium.html"
out.write_bytes(html.encode("utf-8"))
(DIST / "music.min.js").write_text(music, "utf-8")

mb, tb = len(music.encode()), len(html.encode())
print(f"music   {mb:6d} / {MUSIC_MAX} bytes  ({mb / MUSIC_MAX:.0%})")
print(f"total   {tb:6d} / {TOTAL_MAX} bytes  ({tb / TOTAL_MAX:.0%})   gzip: {len(gzip.compress(html.encode(), 9))} bytes")
print(f"-> {out}")
if mb > MUSIC_MAX or tb > TOTAL_MAX:
    sys.exit("BUDGET EXCEEDED")
