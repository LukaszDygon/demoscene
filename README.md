# demoscene

Size-coded browser intros: each one is a single self-contained HTML file with real-time WebGL graphics and a soundtrack synthesized in WebAudio, under a demoscene byte budget (64k or 16k).

## Watch

Online: **https://lukaszdygon.github.io/demoscene/**. Click a demo's screen to start it with sound.

Locally:

```bash
python3 -m http.server 8000      # from this folder
```
Open http://localhost:8000. The page lists every demo with a play button and an "open in own window" link (use that for fullscreen). You can also open any `demos/*/dist/*.html` directly and click to start.

| Demo | Budget | Notes |
|---|---|---|
| [Vapor Mall](demos/vapor-mall) | 64k | The original; the skill was distilled from it |
| [Descensus](demos/descensus) | 64k | Deep-sea descent, raymarched |
| [KAIJU](demos/kaiju-16k) | 16k | Neon city, a single raymarched shader |
| [Autumn Walk](demos/autumn-walk) | 64k | Fox, forest, birthday cake |
| [The Daily Flux](demos/daily-flux-16k) | 16k | 70s newspaper; built by Claude Haiku |

Each demo folder has `src/`, `build.py` (rebuilds `dist/` and checks the budget) and a README with its timeline and assumptions.

## The skill

`skill/demoscene-intro/` is a Claude Code skill for making new intros from your own art direction. It covers the spec, the pitfalls and the checking scripts (byte budget, click-to-sound, audio levels, camera clearance). The last four demos were made with it. To install it:

```bash
cp -r skill/demoscene-intro ~/.claude/skills/
```
