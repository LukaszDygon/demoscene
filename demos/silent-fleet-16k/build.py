#!/usr/bin/env python3
"""Build dist/silent-fleet-16k.html: music inlined verbatim, shader and main.js lightly minified.

Also writes dist/dev.html, the same page with the camera-clearance probe (window.__probe) for check.mjs clearance.
"""
import re, pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()


def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    lines = [re.sub(r'//.*', '', l).strip() for l in s.split('\n')]
    lines = [l for l in lines if l]
    head = [l for l in lines if l.startswith('#')]
    body = ' '.join(l for l in lines if not l.startswith('#'))
    return '\n'.join(head) + '\n' + re.sub(r'\s+', ' ', body)


def js(s, dev):
    out, skip = [], False
    for l in s.split('\n'):
        t = l.strip()
        if t.startswith('//DEV{'):
            skip = not dev
            continue
        if t.startswith('//}DEV'):
            skip = False
            continue
        if skip or not t or t.startswith('//'):
            continue
        out.append(t)
    return '\n'.join(out)


def build(dev):
    html = '\n'.join(l.strip() for l in rd('index.html').split('\n') if l.strip())
    music = rd('music.js').strip()
    for k, v in [('MUSIC', music), ('SCENE', glsl(rd('scene.frag'))), ('MAIN', js(rd('main.js'), dev))]:
        html = html.replace('/*%s*/' % k, v)
    (R / 'dist').mkdir(exist_ok=True)
    out = R / 'dist' / ('dev.html' if dev else 'silent-fleet-16k.html')
    out.write_bytes(html.encode())
    print(f'{out.name}: {len(html.encode())} bytes (music {len(music.encode())} bytes)')


build(False)
build(True)
