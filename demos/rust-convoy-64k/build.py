#!/usr/bin/env python3
"""Inline the shader, soundtrack and main script into dist/rust-convoy-64k.haiku-5.5-medium.html (verbatim, no packer)."""
import pathlib

R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()

html = (src('index.html')
        .replace('/*SHADER*/', src('scene.frag'))
        .replace('/*MUSIC*/', src('music.js'))
        .replace('/*MAIN*/', src('main.js')))
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'rust-convoy-64k.haiku-5.5-medium.html'
out.write_text(html)
print(f"{out.name}: {len(html.encode())} bytes (budget 65536); music {len(src('music.js').encode())} bytes (budget 16384)")
