#!/usr/bin/env python3
"""Build dist/domino-house-16k.haiku-5.5-medium.html: music inlined verbatim, GLSL and JS comment-stripped, then print the size."""
import re, pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out = []
    for ln in s.split('\n'):
        ln = re.sub(r'//.*', '', ln).strip()
        if not ln: continue
        out.append(ln + '\n' if ln.startswith('#') else ln)
    s = ' '.join(out)
    s = re.sub(r'[ \t]+', ' ', s)
    s = re.sub(r'\s*([{}();,=])\s*', r'\1', s)
    return s.strip()

def js(s):
    return '\n'.join(t for t in (l.strip() for l in s.split('\n')) if t and not t.startswith('//'))

html = rd('index.html')
music = rd('music.js')
html = html.replace('/*SCENE*/', glsl(rd('scene.frag'))).replace('/*MUSIC*/', music).replace('/*MAIN*/', js(rd('main.js')))
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'domino-house-16k.haiku-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes', '| music', len(music.encode()), 'bytes')
