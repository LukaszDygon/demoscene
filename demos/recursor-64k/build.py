#!/usr/bin/env python3
"""Inline shaders, voice, music and main script into dist/recursor-64k.opus-5.5-medium.html (no external minifier)."""
import re, json, pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
def glsl(s):
    s = re.sub(r'//[^\n]*', '', s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'): out.append('\n' + line + '\n'); continue
        out.append(re.sub(r'\s*([{}();,=+\-*/<>?:&|!])\s*', r'\1', line))
    return ''.join(out).replace('\n\n', '\n').strip()
def js(s):
    # conservative: drop full-line // comments and indentation only
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
import sys
DBG = 'dbg' in sys.argv
main = js(src('main.js'))
if not DBG: main = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', main, flags=re.S)
for k, f in (('SCENE', 'scene.frag'), ('POST', 'post.frag')):
    main = main.replace('"$%s$"' % k, json.dumps(glsl(src(f))))
music, voice = js(src('music.js')), js(src('voice.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
(R / 'dist' / 'voice.min.js').write_text(voice)
html = src('index.html').replace('/*VOICE*/', voice).replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
out = pathlib.Path(sys.argv[2]) if DBG else R / 'dist' / 'recursor-64k.opus-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()), '; voice', len(voice.encode()))
