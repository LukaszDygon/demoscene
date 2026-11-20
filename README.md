# demoscene

Size-coded browser intros: each one is a single self-contained HTML file with real-time WebGL graphics and a soundtrack synthesized in WebAudio, under a demoscene byte budget (64k or 16k).

## Watch

Online: **https://lukaszdygon.github.io/demoscene/**. Click a demo's screen to start it with sound.

Locally:

```bash
python3 -m http.server 8000      # from this folder
```
Open http://localhost:8000. The page shows every demo as a thumbnail, and you can filter by size budget (16k, 64k) and by the model that built it. Clicking a thumbnail loads that demo. Only one demo runs at a time, so only one WebGL context is ever open. Each card has a fullscreen button, and on phones and tablets a demo opens fullscreen on its own. On iPhone, which has no fullscreen API, it fills the viewport instead. You can also open any `demos/*/dist/*.html` directly and click to start.

Each card's preview is a 4-second looping clip of the demo's start screen (`demos/<folder>/thumb.webm`), with `thumb.png` as its poster. A clip plays only while its card is on screen, and all clips pause while a demo runs. With reduced motion turned on, the card shows only the poster. To regenerate them after adding a demo to `index.html`, run `node tools/thumbs.mjs [folder]`. It needs Chrome, Node 22 or later, and ffmpeg with libvpx-vp9. It steps Chrome's virtual clock one frame per capture, so the motion is smooth even on a slow machine.

| Demo | Budget | Notes |
|---|---|---|
| [Vapor Mall](demos/vapor-mall) | 64k | The original; the skill was distilled from it |
| [Descensus](demos/descensus) | 64k | Deep-sea descent, raymarched |
| [KAIJU](demos/kaiju-16k) | 16k | Neon city, a single raymarched shader |
| [Autumn Walk](demos/autumn-walk) | 64k | Fox, forest, birthday cake |
| [The Daily Flux](demos/daily-flux-16k) | 16k | 70s newspaper; built by Claude Haiku |

Each demo folder has `src/`, `build.py` (rebuilds `dist/` and checks the budget) and a README with its timeline and assumptions.

Each shipped file is named after the model and effort level that built it, e.g. `kaiju16k.opus-5.5-high.html` or `one-second-16k.haiku-5.5-medium.html`. The label was taken from the Claude Code session logs.

## The skill

`skill/demoscene-intro/` is a Claude Code skill for making new intros from your own art direction. It covers the spec, the pitfalls and the checking scripts (byte budget, click-to-sound, audio levels, camera clearance). The last four demos were made with it. To install it:

```bash
cp -r skill/demoscene-intro ~/.claude/skills/
```
