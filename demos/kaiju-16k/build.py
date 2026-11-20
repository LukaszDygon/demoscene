#!/usr/bin/env python3
"""Build dist/kaiju16k.html: inline music (verbatim), minified shaders and lightly minified main.js."""
import re, pathlib
R = pathlib.Path(__file__).parent
rd = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    out, buf = [], []
    for ln in s.split('\n'):
        ln = re.sub(r'//.*', '', ln).strip()
        if not ln: continue
        if ln.startswith('#'):
            if buf: out.append(' '.join(buf)); buf = []
            out.append(ln)
        else: buf.append(ln)
    if buf: out.append(' '.join(buf))
    s = '\n'.join(out)
    s = re.sub(r'[ \t]*([{}()\[\];,=+\-*/<>!&|?:])[ \t]*', r'\1', s)
    s = re.sub(r'(\d)\.0+\b', r'\1.', s)
    for a, b in REN.items(): s = re.sub(r'\b%s\b' % a, b, s)
    return s
REN = dict(col='C', hue='H', bore='B', lane='la', ring='rg', band='ba', inb='ib', mid='mi', lit='li', sky='sk', pal='pl', map='mp', gid='G')

def js(s):
    out = []
    for ln in s.split('\n'):
        t = ln.strip()
        if not t or t.startswith('//'): continue
        out.append(t)
    return '\n'.join(out)

def build(dev):
  html = rd('index.html')
  html = '\n'.join(l.strip() for l in html.split('\n'))
  main = rd('main.js')
  if not dev: main = re.sub(r'//DEV\{.*?//\}DEV\n', '', main, flags=re.S)  # clearance probe: dev build only
  for k, v in [('MUSIC', rd('music.js').strip()), ('SCENE', glsl(rd('scene.frag'))), ('POST', glsl(rd('post.frag'))), ('MAIN', js(main))]:
    html = html.replace('/*%s*/' % k, v)
  (R / 'dist').mkdir(exist_ok=True)
  out = R / 'dist' / ('dev.html' if dev else 'kaiju16k.html')
  out.write_text(html)
  print(out.name, len(html.encode()), 'bytes')
build(False); build(True)
