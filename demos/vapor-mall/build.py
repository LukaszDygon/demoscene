#!/usr/bin/env python3
"""Inline music and main script into dist/vapor-mall.opus-5.5-medium.html (no external minifier) and print sizes."""
import pathlib
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
def js(s):
    # conservative: drop full-line // comments and indentation only (GLSL lives in template strings and survives this)
    return '\n'.join(l.strip() for l in s.split('\n') if l.strip() and not l.strip().startswith('//'))
main, music = js(src('main.js')), js(src('music.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
out = R / 'dist' / 'vapor-mall.opus-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), '/ 65536 bytes; music', len(music.encode()), '/ 16384 bytes')
