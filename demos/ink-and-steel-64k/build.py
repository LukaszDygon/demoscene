#!/usr/bin/env python3
"""Build dist/ink-and-steel-64k.html: src/music.js is inlined verbatim, src/main.js is inlined as is, into src/index.html."""
import pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text(encoding='utf-8')
music = src('music.js')
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', src('main.js'))
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'ink-and-steel-64k.html'
out.write_text(html, encoding='utf-8')
print(f"{out.name}: {len(html.encode())} bytes raw; music {len(music.encode())} bytes")
