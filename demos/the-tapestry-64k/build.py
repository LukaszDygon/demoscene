#!/usr/bin/env python3
"""Inline shader, music and main script into dist/the-tapestry-64k.html and print the size.

The music source goes in verbatim. The GLSL and JS only lose comments and indentation.
"""
import pathlib, re
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    out = []
    for line in s.split('\n'):
        line = re.sub(r'//[^\n]*', '', line).strip()
        if line:
            out.append(line)
    return '\n'.join(out)

def js(s):
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))

main = js(src('main.js')).replace('/*SHADER*/', glsl(src('scene.frag')))
music = src('music.js')
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'the-tapestry-64k.html').write_bytes(html.encode())
print(len(html.encode()), 'bytes total; music', len(music.encode()))
