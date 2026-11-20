# KA-BOOM! 16k

Kinetic typography in Swiss style: black, white and one signal red. No figurative imagery. Each word is a set of glyph quads rasterized from a canvas atlas and drawn with instanced WebGL2. A background shader draws the grid, and a post pass adds motion trails and hit shake. The soundtrack is synthesized with WebAudio.

Entry: `dist/ka-boom-16k.haiku-5.5-medium.html`. Rebuild with `python3 build.py`, which prints the size.

## Sizes against budget

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **13 687 bytes** (84%) | 16 384 (2 697 to spare) |
| music source (`src/music.js`, inlined verbatim) | **4 065 bytes** (99%) | 4 096 (31 to spare) |

Length: 48 bars at 174 BPM, which is 66.2 s plus a 3 s audio tail. Start is one click on the start screen.

## Timeline (174 BPM, 1 bar = 1.379 s, 1 beat = 0.345 s, hard cuts on every beat unless noted)

| bars | time | picture | music |
|---|---|---|---|
| 0–3 | 0–5.5 s | Start screen: red square on white with PRESS TO DETONATE. After the click, SILENCE sits alone in black, centred on the grid | Near silence, only a quiet hiss |
| 4 | 5.5–6.9 s | SILENCE shatters at beat 16. CRASH slams in on each beat, shrinking from 1.2 to 0.6 units, snapping to 0° or 90°, flipping ink and red | Crash, kick, and the break enters at bar 5 |
| 5–6 | 6.9–9.7 s | RUN on a red block, chased by FASTER. Each beat the pair jumps to a new column | Break |
| 7–9 | 9.7–13.8 s | FASTER leads, chased by FASTER!!. Grid tears and bends | Reese bass enters at bar 7, snare roll at bar 9 |
| 10–13 | 13.8–19.3 s | BOOM detonates into 2x2 shrapnel at beat 40. BOOM re-lays out on every beat | Drop: break, reese, stabs |
| 14 | 19.3–20.7 s | BOOM shatters again at beat 56 into 3x3 shards. The word stays hidden until bar 17 | Break |
| 15–16 (signature) | 20.7–23.4 s | Slow motion: shards at 0.04x speed, hanging in the air, with the background flipping each beat | Drums and reese drop out. Only a faint pad, sub and reverb swell remain (about −28 dB) |
| 17–21 | 23.4–30.3 s | Break returns on a hard cut with a kick, and the shards fall back into motion. BOOM relayouts resume | Full drop again |
| 22–29 | 30.3–41.4 s | Letters fall one per beat into 12 columns and pile up. Filter opens over the break | Break with the filter sweeping open, roll at bar 29 |
| 30–35 | 41.4–49.7 s | A wall of NO fills the grid, shuffling each beat. A red bulldozer blade sweeps across from beat 124 and pushes the wall off-screen | Stabs and reese, snare roll at bar 35 |
| 36–41 | 49.7–57.9 s | KA-BOOM! fills the width, with a red bar on odd beats | Full arrangement |
| 42–47 | 57.9–66.2 s | KA-BOOM! shatters into 3x3 shards. Red square with END (end card, mirrors the start screen) | Crash, then a sub drone |

## What I invented beyond the brief

- The start screen's red square and PRESS TO DETONATE are drawn in the same atlas and grid as the piece, so the click is part of the frame.
- SILENCE shatters into its own shrapnel on CRASH, so the cut is visible.
- BOOM shatters twice. The second burst (3x3) sets up the slow-motion hang.
- Pile letters are random A–Z and land in 12 columns, with a red letter about 1 time in 5.
- The NO wall reshuffles its rotations every beat until the blade reaches it.
- The end card repeats the start screen's red square, now with END.
- Hit shake plus a small RGB split on impacts, and a frame-blend trail (30%) for motion blur during the chase and the drop.
- A reverb swell and sub drone for the slow-motion moment and the tail.

## Checks

- `budget.py` (total 16 384, music 4 096): **pass**. No external requests.
- `check.mjs e2e` (headless Chrome): click to first sound **0.0 s**, **no errors** before or after the click.
- `check.mjs audio src/music.js`: **no NaN**, peak **0.86**, RMS per 4 bars between −15.5 and −18 dB in the body, −49 dB in the opening silence, and the slow-mo section is about −28 dB against −16 dB around it.
- Section sweep (a scratch script in the scratchpad, not in the repo). It runs the full 48-bar timeline with a 12x fast-forwarded audio clock in headless Chrome. **No runtime exceptions, no WebGL errors** (`getError` = 0) across the sweep.
- `check.mjs clearance`: **not applicable**. Nothing flies through geometry. The piece is a 2D quad layout, with no camera.

## Not verified

- **How it looks.** I did not take screenshots, per the brief. Layout, glyph sizes, grid and colour were reasoned about, not seen. Check especially the BOOM letter sizes and the bulldozer overlap.
- **How it sounds.** Measured, not heard. Check the snare rolls, the reese and the stab levels, and the slow-motion drop-out.
- **Frame rate.** The page renders at a fixed 1280×720 and is scaled up. Real-GPU speed is untested.
- **Fonts.** Glyphs are rasterized from Helvetica, Arial or Liberation Sans bold (system fonts). Other platforms are unchecked.
- **Fast-forward sweep.** The sweep runs on a fake clock, so the real audio-visual sync is only checked by the e2e test's first 8 s.
- **Visual timing.** Beat cuts are per frame, so a dropped frame can delay a cut by one frame.

## Files

- `src/music.js`: the soundtrack. `SONG.live()` plays it in the browser, and `SONG.render()` renders it offline for checks.
- `src/main.js`: the WebGL pipeline, the timeline and the shrapnel system.
- `src/index.html`: the shell that `build.py` fills.
- `build.py` → `dist/ka-boom-16k.haiku-5.5-medium.html`.
