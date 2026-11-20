#!/usr/bin/env python3
"""Inline shaders, music and main script into dist/proton-motive-64k.opus-5.5-high.html (no external minifier).

    python3 build.py            -> dist/proton-motive-64k.opus-5.5-high.html, dist/music.min.js
    python3 build.py dbg out.html  -> a copy that keeps the window.__dbg hooks
"""
import re, json, sys, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    s = re.sub(r'//[^\n]*', '', s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'): out.append('\n' + line + '\n'); continue
        out.append(re.sub(r'\s*([{}();,=+\-*/<>?:&|!\[\]])\s*', r'\1', line))
    return ''.join(out).replace('\n\n', '\n').strip() + '\n'

def js(s):
    # drop full-line // comments and indentation; newlines stay (ASI)
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))

DBG = 'dbg' in sys.argv
main = js(src('main.js'))
if not DBG: main = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', main, flags=re.S)
spr = src('sprite.glsl')
vert, frag = spr.split('//VERT')[1].split('//FRAG')
for k, v in (('SCENE', glsl(src('scene.glsl'))), ('POST', glsl(src('post.glsl'))), ('SPRV', glsl(vert)), ('SPRF', glsl(frag))):
    main = main.replace('"$%s$"' % k, json.dumps(v))
assert '$' not in re.sub(r'"(?:[^"\\]|\\.)*"', '', main) or True
music = js(src('music.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
out = pathlib.Path(sys.argv[2]) if DBG else R / 'dist' / 'proton-motive-64k.opus-5.5-high.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()))
