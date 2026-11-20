# RUST CONVOY (16k)

A desert chase on a salt flat at golden hour. One raymarched WebGL2 fragment shader, a bloom/grade post pass, and a WebAudio score. No words except the title and the end card.

Entry: `dist/rust-convoy-16k.html`. Rebuild with `python3 build.py`, which prints the size.

## Sizes

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | 12 405 bytes (gzip 5 710) | 16 384 (3 979 to spare) |
| music source (`src/music.js`, inlined verbatim) | 3 686 bytes | 4 096 (410 to spare) |

## Timeline (96 BPM, 1 bar = 2.5 s, 32 bars = 80 s; bars are 1-based)

| bars | time | picture | music |
|---|---|---|---|
| 1-4 | 0-10 s | Tanker alone. Low chase cam behind it, flat salt, cracks | Engine drone, slow tribal tom pulse |
| 5-6 | 10-15 s | Dust plumes from the pursuers rise on the horizon ahead | Toms and kicks enter |
| 7-9 | 15-22.5 s | Swoop cam. The pack races in from the horizon | Approach pattern, drone climbs |
| 10-12 | 22.5-30 s | Side-track shot. Vehicles side by side, sparks between them | Full drums, distorted lead enters at bar 10 |
| 13-14 | 30-35 s | Harpoon line fired and drawn taut, sagging, then snapped | Lead builds |
| 15-16 | 35-40 s | Canyon jump. Slow-motion hang at the apex (about 37.5-40 s) | **Audio drops out at 37.5 s** (start of bar 16) |
| 17 | 40-42.5 s | Landing. The trailer jackknifes | Silence |
| 18 | 42.5-45 s | Explosion, fireball, audio slams back in | Boom, crash, kick, lead returns |
| 19-20 | 45-50 s | Fireball rises toward the sun | Full drums |
| 21-32 | 50-80 s | Fixed camera, dust thickens. End card "RUST CONVOY / THE FUEL IS GONE" fades in through the dust from 54 s, fades out 78-80 s | Thinned drums, lead decays, master fades |

## What I invented beyond the brief

- **Pursuers come from ahead.** The camera rides behind the tanker, so the pack is placed on the horizon ahead, which makes the dust plume visible. They swing in and pull alongside by 24 s, and the third rig trails.
- **Camera.** It sits at 0.6-1.8 m above the ground, offset from the tanker, not a real bumper mount. Shots cut on bar lines.
- **Harpoon line** with sag and tension, then snapped at 36 s.
- **Jackknifing trailer**, rotating about the hitch after landing.
- **Slow-motion hang** from a time-warp on the jump's progress curve, so the apex lingers while the terrain and vehicles stay continuous.
- **Chasm** across the road at z=342, roughly 26 m wide, with dark rock walls.
- **Volumetric details:** wheel dust, exhaust flames, boarding sparks, fireball and smoke, end-card dust haze.
- **Post:** heat-haze band at the horizon, chromatic split, mirrored bloom as lens ghosts (approximate, not placed from the sun's position), orange/teal grade, grain, vignette.
- **Start screen:** stencil-style title with a slit mask and a flickering "CLICK TO IGNITE" over the live scene.
- **Score:** tribal toms and kicks with a tanh drum bus, a drone whose pitch rises with speed (36 Hz to 46 Hz, plus a surge at bars 13-16), and a waveshaped-saw lead with a dotted delay. A master gate produces the drop-out and slam.

## Checks

- `budget.py` (total and music): both within budget, no external references.
- `check.mjs e2e`: click to first sound 0.0 s, no exceptions, no console errors. The shader compile log is included in that run, and no shader errors were logged.
- `check.mjs audio`: offline render 81 s, peak 0.877, no NaNs. Per-bar RMS shows bars 1-4 at about -20 dB, the main section at -13 to -15 dB, and bar 18 (42.5-45 s) back in at -13.7 dB after the drop. Bar 16 (37.5-40 s) reads -42.5 dB, which is only the compressor's few-ms tail after the gate. Bar 17 (40-42.5 s) is at -120 dB, so the drop is silent.
- `check.mjs clearance`: not run. The brief says to run it only if the camera flies through geometry. The camera is always above the terrain it looks over, and no `__probe` is defined.

## Not verified

- **Visuals.** I had no screenshots, so composition, exposure and colour are reasoned from the code, not seen. The headless run confirms the shader compiles and runs, not how it looks.
- **Frame rate.** The march is 110 steps with volumetric dust and fire per pixel, at up to 1280 px wide. It may be heavy on weak GPUs. The lever is the `1280` cap in `src/main.js`.
- **Sound.** I measured the mix offline but have not heard it. Check the lead against the drone in the drop, and the drum level.
- **Other platforms.** Only headless Chrome was used. The title uses Impact where available, with fallbacks elsewhere.

## Files

- `src/scene.frag`: raymarched terrain, vehicles, dust, fire, camera shots and timing.
- `src/post.frag`: haze, bloom, flares, grade, grain and fade.
- `src/music.js`: the score. `SONG.live()` plays it, `SONG.render()` renders it offline.
- `src/main.js`, `src/index.html`: start, uniforms, end card.
- `build.py` produces `dist/rust-convoy-16k.html`.
