# demoscene

Size-coded browser intros: each one is a single self-contained HTML file with real-time WebGL graphics and a soundtrack synthesized in WebAudio, under a demoscene byte budget (64k or 16k).

## Watch

Online: **https://lukaszdygon.github.io/demoscene/**. Click a demo's screen to start it with sound.

Locally:

```bash
python3 -m http.server 8000      # from this folder
```
Open http://localhost:8000. The page lists every demo with a moving preview, and you can filter by size budget (16k, 64k) and by the model that built it. Click a demo to open it, then click its start screen to play with sound. Use the browser's back button to return to the list. You can also open any `demos/*/dist/*.html` directly.

The page is a directory: each card plays a 4-second looping clip of the demo's start screen and links to the demo itself. The clips are `demos/<folder>/thumb.webm` (VP8) and `thumb.mp4` (H.264, for browsers without WebM), with `thumb.png` as the poster. A clip only plays while its card is near the screen, because phones have few video decoders. VP8 is used rather than VP9 because hardware VP9 decoding in Chrome on macOS throws decode errors. With reduced motion turned on, the card shows only the poster.

To regenerate the clips after adding a demo to `index.html`, run `node tools/thumbs.mjs [folder]`. It needs Chrome, Node 22 or later, and ffmpeg with libvpx and libx264. It steps Chrome's virtual clock one frame per capture, so the motion is smooth even on a slow machine. Some heavy raymarched pages wedge headless Chrome's compositor under virtual time (screenshots stop returning); the tool then fails with an error rather than hanging, and `REALTIME=1 node tools/thumbs.mjs <folder>` records that demo on the wall clock instead.

| Demo | Budget | Notes |
|---|---|---|
| [Vapor Mall](demos/vapor-mall) | 64k | The original; the skill was distilled from it |
| [Descensus](demos/descensus) | 64k | Deep-sea descent, raymarched |
| [KAIJU](demos/kaiju-16k) | 16k | Neon city, a single raymarched shader |
| [Autumn Walk](demos/autumn-walk) | 64k | Fox, forest, birthday cake |
| [The Daily Flux](demos/daily-flux-16k) | 16k | 70s newspaper; built by Claude Haiku |
| [The Meadow Counts](demos/meadow-counts-64k) | 64k | IDM: warm 70s school film, 88 BPM boom-bap, formant narrator |
| [RECURSOR](demos/recursor-64k) | 64k | IDM: 170 BPM acid drill'n'bass, 4D and hyperbolic geometry |
| [PLEASE ASSEMBLE](demos/please-assemble-64k) | 64k | IDM: toy speech chip, impossible objects, 7/8 and 5/4 |

Each demo folder has `src/`, `build.py` (rebuilds `dist/` and checks the budget) and a README with its timeline and assumptions.

Each shipped file is named after the model and effort level that built it, e.g. `kaiju16k.opus-5.5-high.html` or `ka-boom-16k.haiku-5.5-medium.html`. The label was taken from the Claude Code session logs.

## The skill

`skill/demoscene-intro/` is a Claude Code skill for making new intros from your own art direction. It covers the spec, the pitfalls and the checking scripts (byte budget, click-to-sound, audio levels, camera clearance). The last four demos were made with it. To install it:

```bash
cp -r skill/demoscene-intro ~/.claude/skills/
```
