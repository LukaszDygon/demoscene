#!/usr/bin/env python3
"""Build dist/domino-house-64k.html: music inlined verbatim, main.js with full-line comments and indentation stripped."""
import pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()
music = rd('music.js')
main = '\n'.join(l.strip() for l in rd('main.js').split('\n') if l.strip() and not l.strip().startswith('//'))
html = rd('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'domino-house-64k.html'
out.write_text(html)
n, m = len(html.encode()), len(music.encode())
print(f"{out.name}: {n} bytes of 65536 ({n / 65536:.1%}); music {m} of 16384 ({m / 16384:.1%})")
