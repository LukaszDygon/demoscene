#!/usr/bin/env python3
"""Build dist/twister-tape-16k.haiku-5.5-medium.html: music.js inlined verbatim, shader and main.js with comments and blank lines stripped."""
import pathlib, re

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()


def strip(s):
    out = []
    for ln in s.split('\n'):
        ln = re.sub(r'(^|\s)//.*$', '', ln).strip()
        if ln:
            out.append(ln)
    return '\n'.join(out)


def build():
    html = rd('index.html')
    html = html.replace('/*MUSIC*/', rd('music.js').rstrip('\n'))
    html = html.replace('/*SHADER*/', strip(rd('intro.frag')))
    html = html.replace('/*MAIN*/', strip(rd('main.js')))
    (R / 'dist').mkdir(exist_ok=True)
    out = R / 'dist' / 'twister-tape-16k.haiku-5.5-medium.html'
    data = html.encode()
    out.write_bytes(data)
    music = len(rd('music.js').rstrip('\n').encode())
    print(out.name, len(data), 'bytes;', 'music', music, 'bytes')


build()
