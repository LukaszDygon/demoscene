#!/usr/bin/env python3
"""Build dist/toy-box-war-16k.html: music inlined verbatim, shaders and main.js minified, then print the size."""
import re, pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()


def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out, buf = [], []
    for ln in s.split('\n'):
        ln = re.sub(r'//.*', '', ln).strip()
        if not ln:
            continue
        if ln.startswith('#'):
            if buf:
                out.append(' '.join(buf))
                buf = []
            out.append(ln)
        else:
            buf.append(ln)
    if buf:
        out.append(' '.join(buf))
    s = '\n'.join(out)
    s = re.sub(r'[ \t]*([{}()\[\];,=+\-*/<>!&|?:])[ \t]*', r'\1', s)
    return s


def js(s):
    out = []
    for ln in s.split('\n'):
        t = ln.strip()
        if t and not t.startswith('//'):
            out.append(t)
    return '\n'.join(out)


def build():
    html = '\n'.join(l.strip() for l in rd('index.html').split('\n'))
    parts = [('MUSIC', rd('music.js').rstrip('\n')), ('SCENE', glsl(rd('scene.frag'))),
             ('POST', glsl(rd('post.frag'))), ('MAIN', js(rd('main.js')))]
    for k, v in parts:
        assert '/*%s*/' % k in html, k
        html = html.replace('/*%s*/' % k, v)
    (R / 'dist').mkdir(exist_ok=True)
    out = R / 'dist' / 'toy-box-war-16k.html'
    out.write_text(html)
    music = len(rd('music.js').encode())
    print(out.name, len(html.encode()), 'bytes (music source', music, 'bytes)')


build()
