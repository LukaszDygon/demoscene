#!/usr/bin/env python3
"""Build dist/insert-coin-16k.html: music.js inlined verbatim, post.frag inlined into main.js, main.js lightly minified."""
import pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text(encoding='utf-8')


def strip(s):
    """Drop blank and comment-only lines and leading indentation. No comments are used on trailing positions."""
    return '\n'.join(ln.strip() for ln in s.split('\n') if ln.strip() and not ln.strip().startswith('//'))


music = rd('music.js')  # shipped verbatim
main = strip(rd('main.js')).replace('/*POST*/', strip(rd('post.frag')))
html = strip(rd('index.html')).replace('/*MUSIC*/', music).replace('/*MAIN*/', main)

out = R / 'dist' / 'insert-coin-16k.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html, encoding='utf-8')
print(out.name, len(html.encode('utf-8')), 'bytes; music', len(music.encode('utf-8')), 'bytes')
