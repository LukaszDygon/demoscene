#!/usr/bin/env python3
"""Build dist/cowbell-grand-prix-64k.fable-5.2-high.html from src/.

    python3 build.py              -> dist/<name>.html and dist/music.min.js, prints the sizes
    python3 build.py dbg out.html -> a copy that keeps the /*DBG*/.../*END*/ hooks (window.__dbg)

GLSL is minified here (comments, whitespace, identifiers renamed). JavaScript goes through terser
(`npm i terser` in this folder, or set TERSER=/path/to/terser). No packer: the output is plain text.
"""
import re, json, sys, os, subprocess, pathlib, itertools, collections
R = pathlib.Path(__file__).parent
src = lambda n: (R / 'src' / n).read_text()
NAME = 'cowbell-grand-prix-64k.fable-5.2-high.html'

KEEP = set("""void float int bool vec2 vec3 vec4 mat2 mat3 mat4 ivec2 ivec3 uniform in out inout const if else for while do
return break continue discard precision highp mediump lowp sampler2D true false struct switch case default flat
sin cos tan asin acos atan pow exp exp2 log log2 sqrt inversesqrt abs sign floor ceil fract mod min max clamp mix step
smoothstep length distance dot cross normalize reflect refract texture texelFetch textureSize round trunc transpose
gl_FragCoord gl_Position gl_VertexID gl_InstanceID main define version es layout location
U M T0 T1 T2 T3 D V W""".split())

def names():
    al = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for n in itertools.count(1):
        for t in itertools.product(al, repeat=n):
            s = ''.join(t)
            if s not in KEEP and not set(s) <= set('xyzwrgbastpq'): yield s

def glsl(s):
    s = re.sub(r'//[^\n]*', '', s)
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    ident = re.compile(r'(?<![\w.])[A-Za-z_]\w*')
    freq = collections.Counter(m for m in ident.findall(s) if m not in KEEP and not m.startswith('gl_'))
    gen = names()
    ren = {k: next(gen) for k, _ in freq.most_common()}
    s = ident.sub(lambda m: ren.get(m.group(0), m.group(0)), s)
    out = []
    for line in s.split('\n'):
        line = line.strip()
        if not line: continue
        if line.startswith('#'):
            out.append('\n' + re.sub(r'\s+', ' ', line) + '\n')
            continue
        line = re.sub(r'\s+', ' ', line)
        line = re.sub(r' ?([{}()\[\];,=+\-*/<>?:&|!^%]) ?', r'\1', line)
        if out and not out[-1].endswith('\n') and re.match(r'[\w.]', line) and re.search(r'\w$', out[-1]): line = ' ' + line
        out.append(line)
    return ''.join(out).replace('\n\n', '\n').strip()

def terser(code, top):
    exe = os.environ.get('TERSER') or str(R / 'node_modules/.bin/terser')
    args = [exe, '--ecma', '2020', '-c', 'passes=3,unsafe=true,unsafe_arrows=true,unsafe_math=true,booleans_as_integers=true,pure_getters=true', '-m'] + (['--toplevel'] if top else [])
    return subprocess.run(args, input=code, capture_output=True, text=True, check=True).stdout.strip()

DBG = 'dbg' in sys.argv
main = src('main.js')
if not DBG: main = re.sub(r'/\*DBG\*/.*?/\*END\*/', '', main, flags=re.S)
common = src('common.glsl')
part = src('part.glsl')
pv, pf = part.split('//FRAG')
for k, v in (('SCENE', common + src('scene.glsl')), ('POST', common + src('post.glsl')), ('BLUR', src('blur.glsl')),
             ('PARTV', common + pv), ('PARTF', pf)):
    main = main.replace('"$%s$"' % k, json.dumps(glsl(v)))
music = terser(src('music.js'), False)
main = terser(main, True)
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'music.min.js').write_text(music)
html = src('index.html').strip().replace('/*MUSIC*/', music).replace('/*MAIN*/', main)
out = pathlib.Path(sys.argv[2]) if DBG else R / 'dist' / NAME
out.write_text(html)
print(out.name, len(html.encode()), 'bytes; music', len(music.encode()), '; main', len(main.encode()))
