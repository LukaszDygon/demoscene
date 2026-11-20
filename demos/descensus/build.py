#!/usr/bin/env python3
"""Inline shaders, music and main script into dist/descensus.opus-5.5-high.html (no external minifier needed)."""
import re, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
def glsl(s):
    s = re.sub(r'//[^\n]*', '', s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'): out.append('\n' + line + '\n'); continue
        line = re.sub(r'\s*([{}();,=+\-*/<>?:&|!])\s*', r'\1', line)
        out.append(line)
    return ''.join(out).replace('\n\n', '\n').strip()
def js(s):
    # conservative: drop full-line // comments and leading indentation only
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
main = js(src('main.js'))
for k, f in (('SCENE', 'scene.frag'), ('SNOWV', 'snow.vert'), ('SNOWF', 'snow.frag')):
    main = main.replace('$%s$' % k, glsl(src(f)))
music = js(src('music.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist' / 'descensus.opus-5.5-high.html').write_text(html)
print(len(html.encode()), 'bytes; music', len(music.encode()))
