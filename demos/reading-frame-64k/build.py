#!/usr/bin/env python3
"""Inline shaders, music and main script into dist/reading-frame-64k.opus-5.5-high.html.

String-aware minifier (no external tools): strips comments, collapses whitespace outside string and
template literals, keeps a newline wherever automatic semicolon insertion could matter.
"""
import json, pathlib, re, sys
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
ID = re.compile(r'[A-Za-z0-9_$]')

def strip(s, keep_nl):
    out, i, n, q = [], 0, len(s), None
    while i < n:
        c = s[i]
        if q:
            out.append(c)
            if c == '\\': out.append(s[i + 1]); i += 2; continue
            if c == q: q = None
            i += 1; continue
        if c in '"\'`': q = c; out.append(c); i += 1; continue
        if s.startswith('//', i):
            while i < n and s[i] != '\n': i += 1
            continue
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2; continue
        if c.isspace():
            j = i
            while j < n and s[j].isspace(): j += 1
            nl = '\n' in s[i:j]
            p = out[-1] if out else ''
            nx = s[j] if j < n else ''
            if p and nx:
                if ID.match(p) and ID.match(nx): out.append('\n' if (nl and keep_nl) else ' ')
                elif p == nx and p in '+-': out.append(' ')
                elif nl and keep_nl and p not in ';{,([=:?&|+-*/<>!' and nx not in '}]).,;:?&|=+*/': out.append('\n')
            i = j; continue
        out.append(c); i += 1
    return ''.join(out)

def glsl(s): return strip(s, False)
def js(s): return strip(s, True)

main = js(src('main.js'))
for k, f in (('ATOMV', 'atom.vert'), ('ATOMF', 'atom.frag'), ('AOF', 'ao.frag'), ('DOFF', 'dof.frag'), ('FINF', 'final.frag')):
    main = main.replace('"$%s$"' % k, json.dumps(glsl(src(f))))
assert '$' + 'ATOM' not in main
music = js(src('music.js'))
html = src('index.html')
html = re.sub(r'<style>(.*?)</style>', lambda m: '<style>' + re.sub(r'\s*([{};:,>])\s*', r'\1', re.sub(r'\s+', ' ', m.group(1))).replace(';}', '}') + '</style>', html, flags=re.S)
html = re.sub(r'>\s*\n\s*<', '><', html).strip()
html = html.replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
out = R / 'dist' / 'reading-frame-64k.opus-5.5-high.html'
if len(sys.argv) > 2 and sys.argv[1] == 'dbg': out = pathlib.Path(sys.argv[2]); html = html.replace('</body>', '<script>' + (R / sys.argv[3]).read_text() + '</script></body>') if len(sys.argv) > 3 else html
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()))
