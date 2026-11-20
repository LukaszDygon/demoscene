# DOMINO HOUSE — 16k

Entry: `dist/domino-house-16k.haiku-5.5-medium.html` (one self-contained file, no packer, no external requests). Rebuild with `python3 build.py`, which also prints the size.

## Sizes against budget

| | size | budget |
|---|---|---|
| whole HTML (raw bytes, no packer) | 9 284 bytes (57%) | 16 384 (7 100 spare) |
| soundtrack source (`src/music.js`, inlined verbatim) | 3 118 bytes (76%) | 4 096 |

## Timeline

Waltz at 120 bpm in 3/4, so one bar is 1.5 s. Runtime is 62 s (41 bars).

| bars | time | picture | music |
|---|---|---|---|
| 0–2 | 0–4.5 s | Cutaway house, centred and symmetrical. Caption DOMINO HOUSE | Sparse celesta over oom-pah-pah pizzicato |
| 3–5 | 4.5–9 s | Marble drops from the top-floor drawer, then rolls down the ramp to the ground floor (floor reached at about 8.5 s) | Music-box plinks falling down the stairs |
| 6–8 | 9–13 s | 20 dominoes fall across the parlour, one every 0.2 s | A click on every domino fall (same timing as the shader) |
| 10–11 | 15–17.25 s | Toaster ding at 15 s, toast launches in an arc | Celesta ding, then a click when the toast lands |
| 11–12 | 17.25–18.75 s | Toast hits the lever, which tilts | Click on the hit |
| 12–14 | 18.75–21 s | Cannon recoils and fires, ball arcs across | Low boom on the shot |
| 14–17 | 21–25.5 s | Five 2D fireworks bursts, upper half of the frame | Glitter celesta, denser |
| 17–19 | 25.5–28.5 s | Chandelier breaks loose and falls | Descending celesta arpeggio |
| 19–33 | 28.5–50 s | Wings swing toward the camera and the house squashes flat | Waltz collapses into cacophony from 30 s (bar 20), then falls silent |
| 33–41 | 50–62 s | Caption THANK YOU from 52 s, fade out 56–61 s | One music-box note at 60 s |

The waltz speeds up by note density, from 3 notes per bar to 6 at bar 12 and 9 at bar 17. The tempo itself stays fixed.

## What I invented beyond the brief
- A start screen with a CSS domino standing upright. It tips when you tap, and the audio starts on that tap.
- A pop-up-book fold. Each wing rotates about the centre spine toward the camera while the house squashes in height.
- Fake ambient occlusion from the march step count, and a vignette and film grain.
- Captions in the title and end cards only, nothing narrating the chain.

## Deviations from the brief
- **No rooms.** The house is one back wall, two side walls and floor slabs. There is no separate parlour, kitchen or conservatory.
- **Stairs** are a single slanted slab, not steps.
- **Fireworks** are 2D overlay bursts in the upper half of the screen, not objects in a room.
- **Camera** dollies in from about 19 to 15 units (3–26 s) and pulls back for the fold. It does not track the marble or the chain sideways.
- **Props** are primitives: a box toaster, a box cannon, a stick lever and a sphere chandelier. There is no post pass.
- **Clicks and collapse** use `Math.random()`, so offline render levels vary slightly between runs.

## Checks
- `budget.py --total 16384 --music src/music.js --music-max 4096`: passes. Total 9 284 bytes, music 3 118 bytes, no external references.
- `check.mjs e2e`: click to first sound 0.0 s, no exceptions and no console errors.
- `check.mjs audio src/music.js`: no NaN samples, peak 0.67 to 0.72 across runs. Levels follow the arrangement: about −23 to −29 dB in the waltz, rising to −23 dB in the chain, then silence over bars 33–39.
- Shader compiles and links. I checked this in headless Chrome by reading the compile log from the DOM. The first build failed on a missing semicolon, which is now fixed.
- `check.mjs clearance` not run: the camera stays at z ≥ 15 and the house is about ±1 deep, so it never flies through geometry.

## Not verified
- **How it looks.** Nothing was screenshotted or watched. The fold's distance estimate is approximate and may show artifacts; the sizes and timings are reasoned from the code.
- **Frame rate.** Raymarching cost on real GPUs is untested. If it's slow, lower the `1280` cap in `main.js`'s `rs()`.
- **The sound.** I measured the mix but haven't heard it, so balance and the click-to-beat alignment are unconfirmed by ear.
- **Other browsers and platforms.** Only headless Chrome on macOS was run.

## Files
- `src/scene.frag`: the raymarched fragment shader (house, props, fold, fireworks, grade).
- `src/main.js`: WebGL setup, camera path, captions.
- `src/index.html`: page, start screen and caption styles.
- `src/music.js`: the soundtrack. `SONG.live()` plays it, `SONG.render()` renders it offline.
- `build.py`: inlines the sources and writes `dist/domino-house-16k.haiku-5.5-medium.html`.
