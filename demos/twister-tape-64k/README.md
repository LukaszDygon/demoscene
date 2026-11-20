# TWISTER TAPE (64k)

Found footage: a storm chaser's VHS camcorder records a tornado tearing through a 1950s-style plains town (JUN 14 1987). Nature is the antagonist.

Build: `python3 build.py` rebuilds `dist/twister-tape-64k.html` and prints the size.

## Timeline

Tempo 90 BPM, one bar = 2.667 s. The song is 40 bars (106.7 s) plus a 5 s tail. The picture follows the same bar numbers.

| Bars | Time (s) | What happens |
|---|---|---|
| start | 0 | Blue screen with a VHS `PLAY ▶` OSD. Click starts the tape; the blue fades over 0.8 s. |
| 0–5 | 0–13 | Calm wide field, distant wall cloud on the horizon, slow handheld drift. Low wind bed, first thunder at 3.1. |
| 5–9 | 13–24 | Wind rises, sirens start (~5.5), lightning flashes, rain droplets build on the lens. |
| 9 | 24 | Funnel touches down (thunder peak). Funnel grows from 8.8 to 10. |
| 9.5–14 | 25–37 | Barn, water tower, pickup, silo and white church are pulled into orbit and up into the sky, one after another. |
| 10–18 | 27–48 | Hail. Chase: camera drives across the field past debris, siren peaks, mud on the lens. |
| 17.9–18.7 | 48–50 | Camera is knocked over: roll goes from 0 to 90 degrees with a jolt. Whoosh and boom at 18. |
| 19.2–22 | 51–59 | Tape glitch: tracking bands, chroma bleed, head-switching noise at the bottom, audio dropout at 20.5–20.95. Funnel lifts out by 22. |
| 21.5–30 | 57–80 | Aftermath: wind dies down, sunbeams break through (21.5–25), church bell at 23 and 27. |
| 29.8–38 | 79–101 | A lone radio in the debris (amber glow) plays a warbly ballad, 8 bars, C–Am–F–G–C–Am–F–C. Tape wobble is one modulated delay. |
| 38.6–40 | 103–107 | Picture fades to blue with `■ STOP`. Tape-stop click at 39.7. |

## Sizes against budget

- HTML: 18,593 bytes raw of 65,536 (28%). Gzip 8,037 (not the budget measure). No packer.
- Music: 5,757 bytes of 16,384 (35%), inlined verbatim from `src/music.js`.
- The rest is WebGL (GLSL is whitespace-minified by `build.py`), the camera, and the overlay.

## Invented beyond the brief

- Volumetric funnel with orbiting debris specks inside the volume, and a dust base.
- Five flung objects with their own pull times, rotation and shrink-into-sky.
- Half-resolution scene target and adaptive resolution (VHS is soft anyway).
- Auto-exposure and autofocus hunting (exposure wobble, blur mix).
- Lens rain droplets (refracting cells) and dim mud at the edges.
- Tape OSD: blinking `REC ●`, a date stamp and a running timecode. End card `■ STOP`.
- Sunbeam shafts in the aftermath, and a warm glow on the radio.
- Church bell in the aftermath (23, 27) and a faint shimmer tone under it.
- Dropout and tape-stop click in the audio.

## Checks

- `budget.py` (total and music): pass.
- `check.mjs e2e`: click to first sound 0.0 s, no uncaught exceptions or console errors. The GL context is live and the shaders compile.
- `check.mjs audio`: offline render 111.7 s, peak 0.593, no NaN. RMS per 4 bars (dB): -37.8, -26.3, -19.5, -17.1, -19.0, -33.6, -30.8, -32.0, -33.8, -34.0, then silence in the tail. The levels follow the arrangement.
- Clearance: not run. The intro defines no `__probe`. The camera stays on the ground and roughly 55 m or more outside the flung objects' orbit.
- Headless pixel sampling across the timeline (not screenshots): frames render through to the end of the timeline with mean brightness around 70–90 of 255 and lightning spikes at the flash bars.

## Not verified

- How it looks and sounds to a person. No screenshots by request, and I have not listened to the mix. The check numbers are only measurements.
- The blue end card and STOP OSD after about 103 s were not sampled.
- Frame rate on real GPUs. The shader is a 150-step raymarch with a 40-step funnel pass at half resolution, with an adaptive scale-down.
- Browsers other than headless Chrome on macOS (Safari, Firefox, Windows and Linux) are untested.
- Whether the funnel and flung objects read well at the chosen camera distances.
