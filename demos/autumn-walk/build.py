#!/usr/bin/env python3
"""Build dist/autumn-walk.opus-5.5-high.html: inline src/music.js and src/main.js into src/index.html.
Light minification only: drops full-line // comments and leading indentation (safe for the GLSL template strings)."""
import pathlib,re
R=pathlib.Path(__file__).parent
def mini(s):return "\n".join(l.strip() for l in s.splitlines() if l.strip() and not l.strip().startswith("//"))
music=mini((R/"src/music.js").read_text());main=mini((R/"src/main.js").read_text())
html=(R/"src/index.html").read_text()
html=re.sub(r"\n\s+","\n",html).replace("/*MUSIC*/",music).replace("/*MAIN*/",main)
(R/"dist").mkdir(exist_ok=True)
(R/"dist/music.min.js").write_text(music)
(R/"dist/autumn-walk.opus-5.5-high.html").write_text(html)
print(len(html.encode()),"bytes total,",len(music.encode()),"bytes music")
