#!/usr/bin/env python3
"""Pack src/ into a single self-contained dist/vapor-mall.html and enforce the 64k budget.

Limits: whole file <= 65536 bytes, soundtrack (music.js as packed) <= 16384 bytes.
"Minification" is deliberately conservative: strip indentation and full-line // comments.
"""
import gzip, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "dist"
TOTAL_MAX, MUSIC_MAX = 65536, 16384


def pack(js: str) -> str:
    out = []
    for line in js.splitlines():
        s = line.strip()
        if not s or s.startswith("//"):
            continue
        out.append(s)
    return "\n".join(out)


music = pack((SRC / "music.js").read_text("utf-8"))
demo = pack((SRC / "demo.js").read_text("utf-8"))
shell = (SRC / "shell.html").read_text("utf-8")
html = shell.replace("/*MUSIC*/", music).replace("/*DEMO*/", demo)

DIST.mkdir(exist_ok=True)
out = DIST / "vapor-mall.html"
out.write_bytes(html.encode("utf-8"))

mb, tb = len(music.encode()), len(html.encode())
gz = len(gzip.compress(html.encode(), 9))
print(f"music   {mb:6d} / {MUSIC_MAX} bytes  ({mb / MUSIC_MAX:.0%})")
print(f"total   {tb:6d} / {TOTAL_MAX} bytes  ({tb / TOTAL_MAX:.0%})   gzip: {gz} bytes")
print(f"-> {out}")
if mb > MUSIC_MAX or tb > TOTAL_MAX:
    sys.exit("BUDGET EXCEEDED")
