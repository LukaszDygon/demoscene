# KA-BOOM!: a 64k kinetic-typography intro

Open `dist/ka-boom-64k.html` and press or click on the start screen. Rebuild with `python3 build.py`, which writes `dist/ka-boom-64k.html` and prints the size.

## Size
- **Total: 19,819 / 65,536 bytes (30%)**, raw and uncompressed. No packer. Gzip would be about 8 KB, but that is not used. The file makes no external requests.
- **Music: 5,686 / 16,384 bytes (35%)**. `src/music.js` is inlined verbatim, with no transform.

## Timeline
The tempo is 174 BPM: 1 beat = 0.345 s, 1 bar = 1.379 s. Cuts land on beats. The piece runs 66 bars, about 91 s, and the end card holds after that.

| Bars | Time | Picture | Music |
|---|---|---|---|
| start | until click | Red square on white, "PRESS TO DETONATE". On click the letters blow apart. | none |
| 0-3 | 0-5.5 s | **SILENCE** sits alone, centred on the grid | Metronome ticks, a sub drone swelling in |
| 4-7 | 5.5-11.0 s | **CRASH** comes out of depth (z = -30) and smashes SILENCE to shards. It then cuts every beat through four layouts (row, column, rotated row, scattered), with the red rule jumping. | Full amen break enters on bar 4, with a crash |
| 8-15 | 11.0-22.1 s | **RUN** leads, chased by red **FASTER** and then **FASTER!!**, one cell per beat. The lag tightens at bar 12. | Break, reese, offbeat stabs. Bars 10-15 are double-time (32nd chop). |
| 16-23 | 22.1-33.1 s | **BOOM** appears on bar 16 and detonates into shards on beat 2 (22.8 s). **The signature moment:** the shards hang at 3 percent speed through bars 18-19 (24.8-27.6 s) while the drums drop out. On bar 20 the shards are released and the break returns with a crash. Bars 20-23 cut on every beat, with mini-bursts. | Boom on bar 16. Bars 18-19: drums out, a held minor pad. Break back on bar 20. |
| 24-31 | 33.1-44.1 s | **PILE**: one letter per beat falls into eight columns, building a stack of 32 | Kick and hats, reese filter opens |
| 32-35 | 44.1-49.7 s | **NO wall**: six rows of NONONONO slam in, one per beat, over beats 32-33 | Full break and reese; boom on 36 |
| 36-37 | 49.7-52.4 s | A red **blade** sweeps left to right and shatters every NO it reaches. Halftone dots ride ahead of the blade. | Crash and boom on bar 36, drive reese |
| 38-39 | 52.4-55.2 s | Aftermath: a single **NO** cuts every beat, rotated by 90-degree snaps | Break |
| 40-47 | 55.2-66.2 s | **KA-** stamps on every beat in random snapped rotations. The grid bends and tears more as the section goes on. | Break, reese, stabs |
| 48-51 | 66.2-71.7 s | **KA-BOOM!** arrives from depth on bar 48 and fills the screen. It cycles one-row, two-row, rotated, one-row on each beat. | Boom and crash on bar 48, double-time break |
| 52-53 | 71.7-74.5 s | The word **shatters** into shards with a flash and a crash | Crash, double-time chop |
| 54-65 | 74.5-91.0 s | **End card**: a red square on white with END in it, and KA-BOOM! beneath. The shards settle. | Half-time kick. Fades from bar 62. D major chord on bar 64. |

## What I invented beyond the brief
- **Start-screen transition:** the letters blow apart when the piece starts.
- **Bulldozer blade:** a red column that shatters the NO wall, plus halftone dots that trail it.
- **Pile section:** letters fall in columns one per beat, between the NO wall and the chase.
- **KA- section (bars 40-47):** a stamp-per-beat passage where the grid tears and bends progressively.
- **Layout cycle for KA-BOOM!:** the word is cycled through row, two-row, and rotated layouts on each beat before it shatters.
- **Palette flips:** on most beats the palette inverts (black on white, then white on black). The post pass gives a short flash on impacts, plus grain.
- **Motion blur:** the previous frame is blended into the current one. It is cut to zero on every beat, so cuts stay hard.
- **Sub drone and held pad:** the drone under SILENCE, and the pad under the hang.
- **Final chord:** a D major (Picardy third) on bar 64, under the fade.

## How it is built
- **Letters:** each glyph is rasterized once into a canvas atlas (A-Z, `!`, `-`, and a solid block for the red blocks). Letters are instanced quads with per-instance Euler rotation. They move on springs toward a target, and a shatter splits a quad into a 2x2 set of shards. Shards carry a quarter of the glyph's UV rectangle, have drag, and die after 2.5-5 s. The pool holds 360 slots.
- **Background:** one fragment shader draws the grid, with bend and tear driven by uniforms. Letters sit on the same 1.25-unit pitch, so they line up with the grid's cells.
- **Director:** one `cue(B)` function per beat, with B = 4 * bar + beat. Section changes are explicit per bar range.
- **Music:** a bar-by-bar WebAudio scheduler with node pruning, as in `skill/demoscene-intro/references/audio.md`. The amen-style break is synthesized into one 16th-based bar (kick, snare, ghosts, hats) and chopped into 16th or 32nd slices with a permutation on every fourth bar. The reverb is a generated noise impulse response.
- **Clock:** visuals read the audio clock, so beats and cuts follow the music.

## Checks run
- `budget.py dist/ka-boom-64k.html --total 65536 --music src/music.js --music-max 16384`: passes. Total 19,819 bytes, music 5,686 bytes, no external references.
- `check.mjs e2e dist/ka-boom-64k.html`: click to first sound is 0.0 s. No exceptions or console errors over an 8 s run after the click.
- `check.mjs audio src/music.js 4`: offline render of 94 s. Peak 0.898 (the first render peaked at 0.982, so I cut the master gain from 0.8 to 0.6). No NaN samples. RMS per 4 bars is about -29 dB in the silence, then -13 to -17 dB through the piece, with a tail fade. The hang at bars 18-19 is averaged into a 4-bar chunk, so it doesn't show on its own.
- Headless walk (my own harness, outside the repo): steps the page's own `cue`, `step` and `draw` through all 281 beats. The bulldozer moves per substep. No exceptions. Pool peaks at 48 springs and 192 shards, well under the 360 slots. By bar 38 the blade has cleared the wall. (This checks the code paths; it is not a visual check.)
- `clearance`: not run. The camera stays on the z = 0 plane (about 10.8 units away), moving only in x and y with shake. Letters stay at z <= 0 except the smash letters, which start behind the plane. Shards fly away from the camera.

## Not verified
- **Visuals:** I did not look at the output, per the brief. Layout, legibility, the grid tear, the halftone, the palette flips and the motion blur are all unseen. Check that the hang in bars 18-19 reads as slow motion and that the blade is visible.
- **Fonts:** the glyphs use Helvetica, then Arial, then Liberation Sans, bold. On systems without these the fallback changes the letterforms.
- **Sound:** I have not listened to it. The break, reese and stabs are measured, not heard. The amen-like character is a guess, and the level balance may need a tweak.
- **Performance:** GPU time is not measured. The canvas is capped at 1.5x device pixel ratio, and the post pass does a full-screen copy each frame.
- **Portrait and phone layouts:** not checked. The camera fits a 14-unit width, so letters get small on narrow screens.
- **Beat sync:** the audio clock drives the cuts, but I have not measured the latency between an audible beat and the cut.
