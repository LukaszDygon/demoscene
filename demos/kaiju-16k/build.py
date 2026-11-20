#!/usr/bin/env python3
"""Build dist/kaiju-16k.opus-5.5-medium.html: music inlined verbatim, GLSL and main.js stripped of comments and whitespace."""
import pathlib, re
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def minjs(s):
    return '\n'.join(t for t in (l.strip() for l in s.split('\n')) if t and not t.startswith('//'))

def minglsl(s):
    s = re.sub(r'//.*', '', s)
    head, body = s.split('precision highp float;')
    # short aliases for the most frequent type names
    defs = [('vec3', 'V'), ('vec2', 'Y'), ('float', 'F')]
    for tok, rep in defs:
        assert not re.search(r'\b%s\b' % rep, body), rep
        body = re.sub(r'\b%s\b' % tok, rep, body)
    body = re.sub(r'\s+', ' ', body)
    body = re.sub(r' ?([-+*/=<>!&|,;:?(){}\[\]]) ?', r'\1', body).strip()
    return head.strip() + '\nprecision highp float;\n' + ''.join('#define %s %s\n' % (r, t) for t, r in defs) + body

html = rd('index.html').strip()
html = html.replace('/*MUSIC*/', rd('music.js').strip())
html = html.replace('/*FRAG*/', minglsl(rd('scene.frag')))
html = html.replace('/*MAIN*/', minjs(rd('main.js')))
(R / 'dist').mkdir(exist_ok=True)
out = R / 'dist' / 'kaiju-16k.opus-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes (budget 16384)')
print('music.js', len(rd('music.js').encode()), 'bytes (budget 4096)')
