#!/usr/bin/env python3
"""Inline shaders, music and main script into dist/meadow-counts-64k.opus-5.5-medium.html and check the 64k budget."""
import re, sys, gzip, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
TOTAL_MAX, MUSIC_MAX = 65536, 16384
def glsl(s):
    s = re.sub(r'//[^\n]*', '', s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'): out.append('\n' + line + '\n'); continue
        out.append(re.sub(r'\s*([{}();,=+\-*/<>?:&|!])\s*', r'\1', line))
    return ''.join(out).replace('\n\n', '\n').strip()
def js(s):
    # conservative: drop full-line // comments and indentation only
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
main = js(src('main.js'))
for k, f in (('SCENE', 'scene.frag'), ('FILM', 'film.frag')):
    main = main.replace('$%s$' % k, glsl(src(f)))
music = js(src('music.js'))
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'meadow-counts-64k.opus-5.5-medium.html'
out.write_text(html)
(R / 'dist' / 'music.min.js').write_text(music)
tb, mb = len(html.encode()), len(music.encode())
print(f"music {mb:6d} / {MUSIC_MAX}   total {tb:6d} / {TOTAL_MAX}   gzip {len(gzip.compress(html.encode(), 9))}")
if tb > TOTAL_MAX or mb > MUSIC_MAX: sys.exit('BUDGET EXCEEDED')
