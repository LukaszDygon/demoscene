#!/usr/bin/env python3
"""Inline the shaders, the soundtrack (verbatim) and the main script into dist/one-second-64k.haiku-5.5-medium.html."""
import pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
def glsl(s):
    # drop // comments and indentation; the #version line stays first
    return '\n'.join(l.split('//')[0].strip() for l in s.split('\n') if l.split('//')[0].strip())
music = src('music.js')
main = src('main.js').replace('/*SCENE*/', glsl(src('scene.frag'))).replace('/*POST*/', glsl(src('post.frag')))
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'one-second-64k.haiku-5.5-medium.html').write_text(html)
print(len(html.encode()), 'bytes; music', len(music.encode()))
