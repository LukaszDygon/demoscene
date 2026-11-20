#!/usr/bin/env python3
"""Inline src/music.js and src/main.js into one self-contained HTML file: dist/the-daily-flux-16k.haiku-5.5-medium.html.
Shipped JS is light-minified: leading indentation and whole-line // comments are stripped (no template-literal
content is touched in music.js; main.js keeps its shader template string untouched by only stripping whole-line comments)."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent

def light(src):
    lines = []
    for ln in src.splitlines():
        s = ln.strip()
        if not s or s.startswith("//"):
            continue
        lines.append(s)
    return "\n".join(lines) + "\n"

music = light((root / "src/music.js").read_text())
main = light((root / "src/main.js").read_text())
tpl = (root / "src/index.html").read_text()
html = tpl.replace("/*MUSIC*/", music.rstrip()).replace("/*MAIN*/", main.rstrip())
(root / "dist").mkdir(exist_ok=True)
(root / "dist/music.shipped.js").write_text(music)
out = root / "dist/the-daily-flux-16k.haiku-5.5-medium.html"
out.write_text(html)
print(out, len(html.encode()), "bytes; music", len(music.encode()), "bytes")
