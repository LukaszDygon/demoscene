# TOY BOX WAR (16k)

A mock-epic war film on a bedroom floor. Green plastic army men hold a brick fortress against a plush division of teddy-bear generals and a rabbit. One raymarched fragment shader, a tilt-shift post pass, a WebAudio score written in code, and typewriter title cards.

Open `dist/toy-box-war-16k.html` in a browser with sound on. Click to enlist.

## Timeline (120 BPM, 1 bar = 2 s, 36 bars = 72 s)

| Bars | Time (s) | What happens |
|---|---|---|
| start screen | before click | Dark room, "TOY BOX WAR", "CLICK TO ENLIST". The click starts the score. |
| 0-1 | 0-4 | Night. Snare roll. Card: "DAY 3. THE BOOKSHELF HAS FALLEN." |
| 2 | 4 | Desk lamp clicks on (flicker 4-4.3 s) and the room warms. Dawn. Marching snare starts. Card: "THE PLUSH DIVISION ADVANCES AT DAWN". |
| 4-7 | 8-14 | Toy-piano anthem phrase 1. Teddy generals march in, bobbing. Kazoo-free. Card at bar 6. |
| 8-11 | 16-22 | Brick fortress. Brass-like bell stabs on every beat. Cap-gun pops at bars 9 and 11. |
| 12-15 | 24-30 | Sock avalanche rolls across the rug (bars 12-15). Phrase 2. Pop at bar 13 and bar 15 (tower hit). |
| 16-19 | 32-38 | Block tower falls at bar 17 (pitched-down sweep plus pop). Phrase 3. |
| 20-23 | 40-46 | Hush. No drums, bass pedal only. Stuffing settles. |
| 24-27 | 48-54 | Last stand behind the cereal box, in slow motion (scene runs at 0.35x from 48 to 56 s). Kazoo lead. Pops at bar 25 and bar 26.5. |
| 28-31 | 56-62 | Anthem reprise. Pop at bar 30. Card: "THE RABBIT RETREATS TO THE BEANBAG." |
| 32 | 64 | Bass pedal only. |
| 33 | 66 | Card: `MOM: "DINNER!"`. Music stops. |
| 33.5-34.4 | 67-69 | Everything freezes at 67 s. Light from the doorway (right edge) floods the room, 67.4-68.8 s. |
| 34.5 | 69 | Final chord. |
| end card | 70 | "THE END". Music tail rings out to 72 s. |

## Sizes against budget

| Item | Bytes | Budget | Used |
|---|---|---|---|
| Whole HTML, raw (no packer) | 14,862 | 16,384 | 91% |
| Music source, inlined verbatim | 3,972 | 4,096 | 97% |

The HTML is gzip 6,490 bytes for reference only; the rules count raw bytes. No external requests.

## What I invented beyond the brief

- Characters and cards: General Barnaby (teddy), the rabbit, "Private Plastic" holding the cereal box, and the 0900 hours and sector cards.
- Terrain: the sock avalanche rolls across bars 12-15, and the block tower falls at bar 17.
- Start screen as part of the piece, with the lamp click at dawn and a flicker.
- Explosions split into three kinds of particle: confetti (hued), stuffing fluff (white-pink) and popcorn (larger, cream). Each is synced to a cap-gun pop in the score.
- Warm light: moonlight-blue at night, shifting to lamp amber after the click. Plush gets a soft subsurface glow at grazing angles, and green plastic gets a glossy highlight.
- Slow motion done as a time warp in the shader clock, so the score keeps its tempo.
- Captions typewrite with a cursor, one at a time.
- The end card sits on a black fade after the freeze.

## Checks

- `budget.py dist/toy-box-war-16k.html --total 16384 --music src/music.js --music-max 4096`: pass, exit 0. Total 14,862 / 16,384, music 3,972 / 4,096, no external references.
- `check.mjs e2e dist/toy-box-war-16k.html`: pass, exit 0. Click to first sound reported 0.0 s (check granularity). No uncaught exceptions or console errors, so both shaders compiled and linked.
- `check.mjs audio src/music.js`: pass, exit 0. Renders 77 s in 1.3 s, peak 0.723, 0 NaN samples. RMS per 4 bars runs -26 to -30 dB through the main sections, drops to -35.6 dB in the hush (bars 20-23) and -34 dB in the ending, then falls to -77 dB in the tail.
- `check.mjs clearance`: not run. The camera does not fly through geometry: it dollies slowly between x -0.35 and 0.15 at height 0.28 with z staying at 1.16 or more, in front of every object.
- Extra headless probe (not one of the required checks): reads back the scene buffer at song times. Night mean about 15/255, dawn mean about 61/38/22, and identical frames at 68.5 s and 71 s, which confirms the freeze.

## Not verified

- I have not seen or heard the piece. The probe gives numbers only. Look, timing and mix are unjudged by eye and ear.
- The tilt-shift strength, the doorway flood (it is in the post pass, which the probe does not read back), particle look, caption legibility over bright frames, and whether the bears and army men read at distance.
- Sync of cap-gun pops to the particle bursts, the kazoo timbre, and the dawn click feel.
- Frame rate on real GPUs. Headless Chrome uses software WebGL, so the speed is not representative. The raymarch runs up to 96 steps at up to 1280 px wide, which could be heavy on low-end machines.
- Browsers other than headless Chrome (Safari, Firefox) are untested.

## Files

- `src/index.html`: page skeleton, styles and overlays.
- `src/scene.frag`: raymarched scene and particle bursts.
- `src/post.frag`: tilt-shift blur, saturation, warm grade, doorway flood and vignette.
- `src/music.js`: score (inlined verbatim).
- `src/main.js`: render loop, time warp, explosion sites and title cards.
- `build.py`: builds `dist/toy-box-war-16k.html` and prints its size.
