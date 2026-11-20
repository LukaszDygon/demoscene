#!/usr/bin/env python3
"""Build dist/the-tapestry-16k.haiku-5.5-medium.html: music inlined verbatim, shader and main.js lightly stripped, then print the size."""
import pathlib

R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()


def strip(s):
    """Drop comment-only and blank lines and leading indentation. Keeps line structure so ASI and #version stay safe."""
    out = []
    for ln in s.split('\n'):
        t = ln.strip()
        if not t or t.startswith('//'):
            continue
        out.append(t)
    return '\n'.join(out)


html = rd('index.html')
html = '\n'.join(l.strip() for l in html.split('\n') if l.strip())
for k, v in [('MUSIC', rd('music.js').strip()), ('SCENE', strip(rd('scene.frag'))), ('MAIN', strip(rd('main.js')))]:
    html = html.replace('/*%s*/' % k, v)

(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'the-tapestry-16k.haiku-5.5-medium.html'
data = html.encode()
out.write_bytes(data)
music = len(rd('music.js').strip().encode())
print(out.name, len(data), 'bytes of 16384 budget;', 'music', music, 'bytes of 4096')
