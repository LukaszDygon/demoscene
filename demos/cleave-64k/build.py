#!/usr/bin/env python3
"""Build dist/cleave-64k.opus-5.5-high.html: inline the shaders, music and main script (no external minifier).

    python3 build.py            -> dist/cleave-64k.opus-5.5-high.html, dist/music.min.js, prints sizes
    python3 build.py dbg out.html  -> debug copy that keeps /*DBG*/ ... /*END*/ blocks
"""
import re, json, pathlib, sys
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()

def glsl(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'//[^\n]*', '', s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'): out.append('\n' + line + '\n'); continue
        line = re.sub(r'\s+', ' ', line)
        out.append(re.sub(r'\s*([{}()\[\];,=+\-*/<>?:&|!.])\s*', r'\1', line))
    s = ''.join(out).replace('\n\n', '\n').strip()
    s = re.sub(r'(?<![\w.])0\.(\d)', r'.\1', s)        # 0.5 -> .5
    s = re.sub(r'(\d)\.0(?![\d])', r'\1.', s)          # 2.0 -> 2.
    return s

def js(s):
    """Strip comments (outside strings / template literals) and indentation; keep line breaks for ASI safety."""
    o, i, n, q = [], 0, len(s), None
    while i < n:
        c = s[i]
        if q:
            o.append(c)
            if c == '\\': o.append(s[i + 1]); i += 2; continue
            if c == q: q = None
            i += 1; continue
        if c in '"\'`': q = c; o.append(c); i += 1; continue
        if s.startswith('//', i) and (i == 0 or s[i - 1] != '\\'):
            j = s.find('\n', i); i = n if j < 0 else j; continue
        if s.startswith('/*', i) and not s.startswith('/*DBG*/', i) and not s.startswith('/*END*/', i):
            j = s.find('*/', i); i = j + 2; continue
        o.append(c); i += 1
    lines = [l.strip() for l in ''.join(o).split('\n')]
    out = ''
    for l in lines:
        if not l: continue
        # join with the previous line when that cannot change meaning
        if out and (out[-1] in '{(,;[=:?&|+' or l[0] in '}).,;:?&|'):
            out += l
        else:
            out += ('\n' if out else '') + l
    return out

DBG = len(sys.argv) > 1 and sys.argv[1] == 'dbg'
main = js(src('main.js')) if (R / 'src' / 'main.js').exists() else ''
if not DBG: main = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', main, flags=re.S)
for f in sorted((R / 'src').glob('*.frag')):
    main = main.replace('"$%s$"' % f.stem.upper(), json.dumps(glsl(f.read_text())))
music = js(src('music.js'))
music_dbg = music
music = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', music, flags=re.S)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
if DBG: music = music_dbg
if main:
    html = src('index.html')
    html = re.sub(r'<style>(.*?)</style>', lambda m: '<style>' + re.sub(r'\s*([{};:,>])\s*', r'\1', re.sub(r'\s+', ' ', m.group(1))).strip() + '</style>', html, flags=re.S)
    html = html.replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
    out = pathlib.Path(sys.argv[2]) if DBG else R / 'dist' / 'cleave-64k.opus-5.5-high.html'
    out.write_text(html)
    print(out.name, len(html.encode()), 'bytes; music', len(music.encode()), '; main', len(main.encode()))
else:
    print('music', len(music.encode()))
