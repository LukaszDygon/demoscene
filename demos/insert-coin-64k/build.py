#!/usr/bin/env python3
"""Build dist/insert-coin-64k.haiku-5.5-medium.html from src/. The music is inlined verbatim; shader and main script are only stripped of comments and indentation."""
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
    # drop full-line // comments and leading indentation only
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
main = js(src('main.js')).replace('$CRT$', glsl(src('crt.frag')))
music = src('music.js')
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'insert-coin-64k.haiku-5.5-medium.html').write_text(html)
print(len(html.encode()), 'bytes total; music', len(music.encode()), 'bytes')
