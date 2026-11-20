#!/usr/bin/env python3
"""Inline the shader, music and main script into dist/the-tapestry-64k.opus-5.5-medium.html and print the sizes.
   python3 build.py        -> release build
   python3 build.py dbg F  -> keeps the /*DBG*/ hooks, writes to F (for the headless element checks)"""
import re, sys, json, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
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
DBG = len(sys.argv) > 1 and sys.argv[1] == 'dbg'
main = js(src('main.js'))
if not DBG: main = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', main, flags=re.S)
main = main.replace('"$CLOTH$"', json.dumps(glsl(src('cloth.frag'))))
music = js(src('music.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
out = pathlib.Path(sys.argv[2]) if DBG else R / 'dist' / 'the-tapestry-64k.opus-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()))
