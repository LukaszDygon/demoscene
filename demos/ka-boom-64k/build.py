#!/usr/bin/env python3
"""Build dist/ka-boom-64k.html: music inlined verbatim, GLSL stripped of comments, main.js stripped of comment lines."""
import json, pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    lines = (l.split('//')[0].strip() for l in s.split('\n'))
    return '\n'.join(l for l in lines if l)

def js(s):
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))

music = rd('music.js')                       # verbatim, no transform
main = js(rd('main.js'))
for key, f in (('__LV__', 'quad.vert'), ('__LF__', 'quad.frag'), ('__FSQ__', 'fsq.vert'),
               ('__BG__', 'bg.frag'), ('__POST__', 'post.frag')):
    main = main.replace(key, json.dumps(glsl(rd(f))))
html = rd('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'ka-boom-64k.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()))
