# DOMINO HOUSE: a 64k chain reaction

Open `dist/domino-house-64k.haiku-5.5-medium.html` and click (or press Space or Enter). The start screen shows one upright domino and "TAP TO TIP". The tap tips it, and the sound and picture begin together.

The file is a single self-contained HTML document: no external requests, no packer, no embedded fonts. WebGL2 draws the picture and WebAudio synthesises the music.

## Build

```
python3 build.py
```

This inlines `src/music.js` verbatim and concatenates `src/gl.js`, `src/house.js`, `src/house2.js`, `src/house3.js`, `src/fx.js` and `src/main.js` into one scope, with full-line comments and indentation stripped. It writes `dist/domino-house-64k.haiku-5.5-medium.html` and prints the sizes.

## Size against budget

**Not met.** The target for this revision is 57,344 to 65,536 bytes. The build is at **34,584 bytes (52.8%)**, 22,760 bytes short of the floor. The music is **9,377 bytes**, just under the 10 to 14 KB target. The 16,384 cap is respected.

| | Bytes | Budget | Used |
|---|---|---|---|
| Total HTML (raw, no packer) | 34,584 | 65,536 (floor 57,344) | 52.8% |
| Music source (`src/music.js`, inlined verbatim) | 9,377 | 16,384 (target 10,240 to 14,336) | 57.2% |

I have not padded the file. Padding is ruled out, so the remaining gap needs real content (see "Still missing").

## Timeline

The film runs 149.4 s, inside the 2.5 to 3 minute target. The tempo rises through the chain (38 to 74 bpm), then speeds up for the garden and collapse, and drops for the coda. Times come from the tempo map in `src/music.js`.

| Act | Bars | Time | Picture | Music |
|---|---|---|---|---|
| Prologue | 0 | 0 s | The title domino tips on the tap. The camera pulls back to the wide, centred shot. | Music box, bass and pizzicato. |
| I · Drawer | 3 to 7 | 10.8 to 31 s | The dresser drawer slides out and the marble drops. It rolls to the stair head and bounces down sixteen steps. | Celesta over a waltz. |
| II · Kitchen | 7 to 13 | 31 to 52.6 s | Eighteen dominoes topple one per beat. A conveyor of six teacups runs along the counter. An egg timer rings at bar 11. | Accordion-style reed melody. |
| III · Toaster | 13 to 14.5 | 52.6 to 56 s | The last domino triggers the toaster and toast flies to the lever. | Pop, whoosh, tink. |
| IV · Attic | 14.5 to 17 | 56 to 61.9 s | A rocking horse rocks, a globe spins, and the telescope tips over. | Chimes over a waltz. |
| V · Cannon | 16.4 to 17.4 | 54.3 to 58 s | The cannon fires and the cannonball hits the crate. A hammer swings onto a 24-key piano. | Boom, thock, piano chord. |
| VI · Fireworks | 18 to 23 | 63 to 82 s | Nine rockets burst in the conservatory. Each burst flashes the backdrop. | Celesta, with a sparkle per burst. |
| VII · Bathroom | 23.2 to 27 | 82 to 92 s | Water fills the tub, overflows, and the rubber duck rides the spill onto a seesaw, which flings it into the nursery. | Plucked strings, with a bloop per bubble. |
| VIII · Nursery | 27.4 to 31 | 92 to 101 s | A wind-up train circles the room, knocking over three block towers. | Toy piano and a thud per tower. |
| — · Chandelier | 31.2 to 31.4 | 101 to 101.4 s | The cord is cut and the chandelier falls and shatters. | Snap, then a glass crash. |
| IX · Garden | 31.6 to 35.2 | 101.4 to 110 s | The camera pulls back to the house in its garden: a sprinkler, a weathervane and a kite. | Celesta with chimes and a pad. |
| X · Pop-up | 35.2 to 40.5 | 110 to 122 s | The waltz falls apart into a loud cacophony. The house folds shut in three staggered panels. | Kicks, snares, distorted clusters, glissandi and glass. Peaks at about -20 dB, against about -28 dB for the waltz. |
| XI · Coda | 40.5 to 44.5 | 122 to 140 s | The house is gone. Confetti falls after the end card. | The waltz fades out and ends on a single music box note at 139.8 s. |

The 9 brief steps stay in order: marble, stairs, dominoes, toaster, toast, lever, telescope-then-cannon, fireworks, chandelier, fold.

## What is in this revision

- **Bathroom**: a hollow tub that fills, overflows and spills. A rubber duck floats in the water, rides the spill onto a seesaw, and is flung into the nursery.
- **Kitchen**: a conveyor of six teacups on a counter, an egg timer that rings three times, and dish stacks. The toaster is the one already in the parlour.
- **Nursery**: a wind-up train on a 20-piece circular track, three block towers that topple as the train passes, and a toy piano.
- **Attic**: a rocking horse, a spinning globe with continents, and a telescope that tips over.
- **Garden**: a lawn outside the house, trees, a hedge, a rotating sprinkler with spray, a weathervane on the roof, and a kite. The garden does not fold.
- **Shader detail**: wood grain on wood, a weave pattern on fabrics and wallpaper, corner ambient occlusion near the back wall, and soft contact-shadow decals under the heavy furniture.
- **Dust in the sunbeam**: a warm dust beam from the attic window, plus floating motes.
- **Music**: each room has its own instrument. Pluck strings in the bathroom, a toy piano in the nursery, an accordion reed in the kitchen, chimes in the attic and the garden, and a loud cacophony for the collapse.
- **Physics**: the marble spins (shown by a surface dot), the marble trail sparkles, and the spill and bubbles are particles.

## Checks

- `budget.py dist/domino-house-64k.haiku-5.5-medium.html --total 65536 --music src/music.js --music-max 16384`: passes the 64 KB cap and the 16 KB music cap. Total 34,584, music 9,377. The 57,344 floor is not met (see above). No external references.
- `check.mjs audio src/music.js 4`: passes. Offline render of 149.4 s with no NaN samples and peak 0.647. RMS per 4-bar chunk runs from about -27 dB in the waltz, to -19.7 dB in the collapse, to -47 dB at the final note.
- `check.mjs e2e dist/domino-house-64k.haiku-5.5-medium.html`: passes. Click to first sound reported as 0.0 s (coarse, since the script polls every 250 ms). No uncaught exceptions, console errors or shader compile errors.
- Headless WebGL probe, not in the folder (kept in the session scratchpad): WebGL2 context, zero GL errors, non-blank frames before and after the click, and the title hides on the click.
- `check.mjs clearance`: not applicable. The camera never enters the house volume; its distance from the house stays above about 20 units. No `window.__probe` is defined.

## Still missing to reach 57,344 bytes

About 23 KB of real content and about 1 KB of music, roughly:

- A more detailed set in each room: furniture (armchairs, a sideboard, a grandfather clock's case), a fireplace, more wallpaper and carpet pattern, more books and more toys.
- A second fireworks show and a longer collapse, both with their own physics detail.
- Shader work that has not yet been done: real shadow maps for the main props, bloom on the fireworks, and a lit window with a stronger sunbeam.
- Music: about 1 KB more, so the score reaches the 10 KB target. The kitchen and nursery could each get a counter-line.

## Not verified

- Nothing was viewed or listened to. The checks are headless and numerical.
- The three-panel fold, the books toppling, the telescope's fall and the train's track alignment are set by construction. They have not been checked for clipping or contact.
- The garden pull-back and its framing at the portrait aspect ratio are untested.
- Frame rate on real hardware is not measured. The scene now draws several hundred objects per frame.
- Only headless Chrome was used.
