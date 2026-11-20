#!/usr/bin/env python3
"""Build dist/rust-convoy-16k.haiku-5.5-medium.html: music inlined verbatim, shaders and main.js lightly minified."""
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
    return re.sub(r'(\d)\.0+\b', r'\1.', s)

def js(s):
    return '\n'.join(t for t in (ln.strip() for ln in s.split('\n')) if t and not t.startswith('//'))

html = '\n'.join(l.strip() for l in rd('index.html').split('\n'))
for k, v in [('MUSIC', rd('music.js').strip()), ('SCENE', glsl(rd('scene.frag'))), ('POST', glsl(rd('post.frag'))), ('MAIN', js(rd('main.js')))]:
    html = html.replace('/*%s*/' % k, v)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'rust-convoy-16k.haiku-5.5-medium.html'
out.write_bytes(html.encode())
print(out.name, len(html.encode()), 'bytes')
