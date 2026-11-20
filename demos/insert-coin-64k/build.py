#!/usr/bin/env python3
"""Rebuild dist/insert-coin-64k.opus-5.5-medium.html: strip comments/indentation, inline shaders and scripts, print sizes."""
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
IDC = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$')
def js(s):
    """Whitespace/comment stripper that respects strings, template literals and regex literals.
    A newline survives only where automatic semicolon insertion could depend on it."""
    s = '\n'.join(l for l in s.split('\n') if not l.strip().startswith("if(typeof module"))
    out, i, n = [], 0, len(s)
    def last():
        for c in reversed(out):
            if c not in ' \n': return c
        return ''
    while i < n:
        c = s[i]
        if c in '"\'`':
            j = i + 1
            while s[j] != c:
                j += 2 if s[j] == '\\' else 1
            out.append(s[i:j + 1]); i = j + 1; continue
        if s.startswith('//', i):
            while i < n and s[i] != '\n': i += 1
            continue
        if s.startswith('/*', i):
            i = s.index('*/', i) + 2; continue
        if c == '/' and (last() in '(,=:[!&|?{};+-*%<>~^' or last() == ''):
            j = i + 1; cls = False
            while s[j] != '/' or cls:
                if s[j] == '\\': j += 1
                elif s[j] == '[': cls = True
                elif s[j] == ']': cls = False
                j += 1
            j += 1
            while j < n and s[j] in 'gimsuy': j += 1
            out.append(s[i:j]); i = j; continue
        if c in ' \t\r\n':
            nl = False
            while i < n and s[i] in ' \t\r\n':
                nl |= s[i] == '\n'; i += 1
            a, b = last(), (s[i] if i < n else '')
            if a in IDC and b in IDC: out.append('\n' if nl else ' ')
            elif nl and a and b and a not in ',{[(;:+-*/=&|?<>!' and b not in ',)]}.?:+-*/=&|<>':
                out.append('\n')
            elif (a == '+' and b == '+') or (a == '-' and b == '-'): out.append(' ')
            continue
        out.append(c); i += 1
    return ''.join(out).strip()
main = js(src('main.js'))
for k, f in (('PERSIST', 'persist.frag'), ('CRT', 'crt.frag')):
    main = main.replace('"$%s$"' % k, json.dumps(glsl(src(f))))
music = js(src('music.js'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html')
for k, v in (('MUSIC', music), ('SIM', js(src('sim.js'))), ('SPR', js(src('sprites.js'))), ('MAIN', main)):
    html = html.replace('/*%s*/' % k, v)
out = R / 'dist' / 'insert-coin-64k.opus-5.5-medium.html'
out.write_text(html)
print(out.name, len(html.encode()), 'bytes /65536; music', len(music.encode()), 'bytes /16384')
