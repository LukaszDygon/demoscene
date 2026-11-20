# KA-BOOM!: a 64k kinetic-typography intro

Open `dist/ka-boom-64k.haiku-5.5-medium.html` and press or click on the start screen. `python3 build.py` rebuilds it (`src/main.js` and `src/chapters.js` are concatenated into one script).

## Size
- **Total: 26,384 / 65,536 bytes (40%)**, raw. No packer, no external requests.
- **Music: 7,041 / 16,384 bytes (43%)**, inlined verbatim from `src/music.js`.
- **Below the requested 57,344-byte floor.** About 31 KB is missing. I did not pad to reach it. Closing the gap needs real content: more chapter detail (city blocks and traffic, tornado layers, punctuation variety), and roughly 4 KB more music to reach the 14 KB ceiling.

## Runtime
144 bars at 174 BPM, about 3 min 19 s (audio render 201.6 s). Cuts land on beats.

| Bars | Time | Chapter | Picture | Music |
|---|---|---|---|---|
| start | until click | Start | Red square, PRESS TO DETONATE. Letters blow apart on click. | none |
| 0-3 | 0-5.5 s | Arc | SILENCE alone | Ticks, sub drone |
| 4-7 | 5.5-11 s | Arc | CRASH smashes SILENCE, cuts per beat | Full break |
| 8-15 | 11-22 s | Arc | RUN chased by FASTER and FASTER!! | Break, reese, stabs |
| 16-23 | 22-33 s | Arc | BOOM detonates; shards hang in slow motion on bars 18-19; four poster layouts | Hang on a pad, break returns on bar 20 |
| 24-31 | 33-44 s | Arc | PILE of letters in eight columns | Kick, hats, shaker |
| 32-39 | 44-55 s | Arc | NO wall (extruded); red blade bulldozes it | Drive reese |
| 40-47 | 55-66 s | Arc | KA- stamps; grid tears | Break, riser |
| 48-55 | 66-77 s | Arc | COLLISIONS: BANG, CRUNCH, WHAM, THUD rebound on mass | Half-time, hits |
| 56-63 | 77-88 s | Arc | Red wipe, then GRAVITY PILE of KABOOM with bounce, halftone | Full break |
| 64-71 | 88-99 s | Arc | Extruded BOOM spins 90 degrees per beat; camera orbits | Arpeggio |
| 72-79 | 99-110 s | Arc | KA-BOOM! fills, extruded, dolly in, second grid | Double-time break |
| 80-83 | 110-116 s | Arc | Shatter; STILL | Pad |
| 84-99 | 116-138 s | **TYPE CITY** | Words stacked as extruded towers. The camera flies on a path through the street. A wrecking-ball O swings and knocks out floors on contact. | Jungle break, 32nd chop, deep reese, stabs, riser |
| 100-107 | 138-148 s | **COUNTDOWN** | Giant numerals 10 to 0, each knocking the last off the poster | Halftime neuro drop |
| 108-119 | 148-165 s | **PUNCTUATION WAR** | ! ? . , ; fired at HOLD THE LINE. Red # shields bounce them. The sentence is shot to pieces at bar 118. | Liquid roller, light break |
| 120-131 | 165-182 s | **TYPE TORNADO** | 500 glyphs in a helix round a camera orbit. Each height band spells TORNADO, SPIN or VORTEX in turn. | Ragga chopped stabs, claps, dancehall bass |
| 132-143 | 182-199 s | **EPILOGUE** | SILENCE is shattered and reassembled from its shards | Ambient pads, fade out |

## What I invented beyond the brief
- Extruded letterforms with depth-shaded sides. The extrusion turns with the letter.
- A general look-at camera, so chapters can fly in 3D.
- A wrecking ball, a punctuation war with shields, and a tornado built from glyph instances.
- Bounce on landing, mass-based rebound in collisions, a red wipe between chapters, a halftone screen, and misregistration on flashes.
- Music for each chapter: jungle chop, neuro halftime, liquid roller, ragga stabs, ambient outro. Also a shaker, reversed and stuttered fills, and risers.

## How it is built
- **Letters:** glyphs are rasterized once into a canvas atlas (letters, `!-#`, digits, and `?.,;`). Letters are instanced quads with per-instance Euler rotation. A spring pulls each one to its target. A shatter splits a quad into 2x2 shards. The pool holds 1600 slots, so the tornado can hold 500 glyphs.
- **Director:** `cue(B)` runs once per beat (B = 4 * bar + beat). From beat 336 on, `chap(B)` dispatches to the chapter. `chapFrame` runs each frame for camera flights, the ball, projectile hits and tornado positions.
- **Post:** the previous frame is blended for motion blur, cut to zero on each beat. The post pass also does the halftone screen, misregistration, flash and grain.
- **Music:** bar-by-bar WebAudio scheduling with node pruning.

## Checks run
- `budget.py dist/ka-boom-64k.haiku-5.5-medium.html --total 65536 --music src/music.js --music-max 16384`: passes. Total 26,384 bytes, music 7,041 bytes, no external references. **Below the requested floor.**
- `check.mjs e2e dist/ka-boom-64k.haiku-5.5-medium.html`: click to first sound 0.0 s, no exceptions or console errors over 8 s.
- `check.mjs audio src/music.js 4`: offline render of 201.6 s, peak 0.894, no NaN samples. Levels follow the sections.
- `check.mjs clearance` on a scratch copy with a probe covering the city flight (not shipped): the camera never enters a tower box. Minimum distance 16.7 units.
- Headless walk (my own harness outside the repo): steps the page's own `cue`, `chapFrame`, `step` and `draw` through all 593 beats. No exceptions. Pool peak 568 of 1600. The epilogue gathers all 28 shards into SILENCE. This checks code paths, not visuals.

## Found and fixed during checking
- The epilogue's burst shattered the 500 tornado glyphs into 2,000 shards, saturating the pool. Fixed by clearing the tornado before the burst.
- Epilogue shards expired before reassembly. Fixed by extending their life.

## Not verified
- **Visuals:** nothing looked at. The city flight, the wrecking ball, the countdown knocks, the shields, the tornado spelling and the extrusion are all unseen.
- **Sound:** not listened to. Chapter levels are measured but not heard.
- **Fonts:** Helvetica, then Arial, then Liberation Sans. Digits and punctuation rely on the same fallback chain.
- **Performance:** not measured. With 1600 pool slots, the tornado's 500 letters, and extrusion, GPU and CPU cost is unknown.
- **Phone and portrait layouts:** not checked.
- **Beat sync:** the cuts follow the audio clock. The audible-to-visible latency is not measured.
