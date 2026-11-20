#!/usr/bin/env python3
"""Build dist/domino-house-64k.haiku-5.5-medium.html: music inlined verbatim; the GL, house, effects and main sources concatenated in one scope, full-line comments and indentation stripped."""
import pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()
music = rd('music.js')
parts = ['gl.js', 'house.js', 'house2.js', 'house3.js', 'fx.js', 'main.js']
body = '\n'.join(l.strip() for p in parts for l in rd(p).split('\n') if l.strip() and not l.strip().startswith('//'))
main = '(()=>{\n' + body + '\n})();'
html = rd('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'domino-house-64k.haiku-5.5-medium.html'
out.write_text(html)
n, m = len(html.encode()), len(music.encode())
print(f"{out.name}: {n} bytes of 65536 ({n / 65536:.1%}); music {m} of 16384 ({m / 16384:.1%})")
