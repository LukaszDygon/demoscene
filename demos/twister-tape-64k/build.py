#!/usr/bin/env python3
"""Build dist/twister-tape-64k.html: music inlined verbatim, GLSL and main.js lightly minified, one file, no externals."""
import re, pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    out = []
    for ln in s.split('\n'):
        ln = re.sub(r'//.*', '', ln).strip()
        if ln: out.append(ln)
    s = '\n'.join(out)
    return re.sub(r'[ \t]*([{}()\[\];,=+\-*/<>!&|?:])[ \t]*', r'\1', s)

def js(s):
    # drop full-line // comments and indentation only (no identifier renaming)
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))

music = rd('music.js')                       # verbatim
main = js(rd('main.js'))
main = main.replace('$SCENE$', glsl(rd('scene.frag'))).replace('$POST$', glsl(rd('post.frag')))
html = rd('index.html').replace('/*MUSIC*/', music, 1).replace('/*MAIN*/', main, 1)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'twister-tape-64k.html'
out.write_text(html)
print(f'{out.name}: {len(html.encode())} bytes (budget 65536); music {len(music.encode())} bytes (budget 16384)')
