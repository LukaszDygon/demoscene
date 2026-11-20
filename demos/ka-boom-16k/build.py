#!/usr/bin/env python3
"""Build dist/ka-boom-16k.haiku-5.5-medium.html: music inlined verbatim, main.js with comments and indentation stripped."""
import pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def minjs(s):
    out = []
    for ln in s.split('\n'):
        t = ln.strip()
        if not t or t.startswith('//'): continue
        out.append(t)
    return '\n'.join(out)

html = rd('index.html')
html = html.replace('/*MUSIC*/', rd('music.js'))
html = html.replace('/*MAIN*/', minjs(rd('main.js')))
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'ka-boom-16k.haiku-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes')
