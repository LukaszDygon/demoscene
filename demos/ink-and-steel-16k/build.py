#!/usr/bin/env python3
"""Build dist/ink-and-steel-16k.haiku-5.5-medium.html: music inlined verbatim, GLSL and JS lightly minified, then print the size."""
import re, pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out, buf = [], []
    for ln in s.split('\n'):
        ln = re.sub(r'//.*', '', ln).strip()
        if not ln: continue
        if ln.startswith('#'):
            if buf: out.append(' '.join(buf)); buf = []
            out.append(ln)
        else: buf.append(ln)
    if buf: out.append(' '.join(buf))
    s = '\n'.join(out)
    s = re.sub(r'[ \t]*([{}()\[\];,=+\-*/<>!&|?:])[ \t]*', r'\1', s)
    s = re.sub(r'(\d)\.0+\b', r'\1.', s)
    return s

def js(s):
    out = []
    for ln in s.split('\n'):
        t = ln.strip()
        if not t or t.startswith('//'): continue
        out.append(t)
    return '\n'.join(out)

html = rd('index.html')
html = '\n'.join(l.strip() for l in html.split('\n'))
for k, v in [('MUSIC', rd('music.js').strip()), ('SCENE', glsl(rd('scene.frag'))), ('MAIN', js(rd('main.js')))]:
    html = html.replace('/*%s*/' % k, v)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'ink-and-steel-16k.haiku-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes')
