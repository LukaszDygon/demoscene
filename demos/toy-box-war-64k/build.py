#!/usr/bin/env python3
"""Inline src/music.js and src/main.js verbatim into src/index.html and write dist/toy-box-war-64k.html."""
import pathlib

R = pathlib.Path(__file__).resolve().parent
src = lambda n: (R / 'src' / n).read_text(encoding='utf-8')
music, main = src('music.js'), src('main.js')
html = src('index.html').replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'toy-box-war-64k.html').write_text(html, encoding='utf-8')
total, mus = len(html.encode()), len(music.encode())
print(f'total {total} / 65536 bytes ({total / 65536:.1%}), {65536 - total} left')
print(f'music {mus} / 16384 bytes ({mus / 16384:.1%})')
