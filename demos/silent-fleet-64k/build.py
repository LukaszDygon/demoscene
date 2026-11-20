#!/usr/bin/env python3
"""Inline shader, main script and music into dist/silent-fleet-64k.html. The music is inlined verbatim."""
import re, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
def glsl(s):
    # drop // comments and blank lines; keep the #version line first
    s = re.sub(r'//[^\n]*', '', s)
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip())
def js(s):
    # drop full-line // comments and leading indentation only
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
main = js(src('main.js')).replace('$SCENE$', glsl(src('scene.frag')))
music = src('music.js')
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'silent-fleet-64k.html').write_text(html)
print(len(html.encode()), 'bytes total;', len(music.encode()), 'bytes music (verbatim)')
