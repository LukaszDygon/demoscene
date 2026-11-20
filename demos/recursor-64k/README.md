# RECURSOR: a 64k intro

The intro is **`dist/recursor-64k.opus-5.5-medium.html`**, one self-contained file. Open it, then click or press Space/Enter on the title screen ("[ click / space ] fall inward"). Press `f` for fullscreen.

It's a harsh, manic fall through recursive and non-Euclidean geometry, set to 170 BPM drill'n'bass. A cold machine voice counts the depths as you pass them. The picture is stark black and white, with hazard yellow-green, UV magenta and sodium red as accents. Hard cuts, inversions, scanline tearing and datamosh holds land on the drum edits.

## Size
- **Total: 41,544 / 65,536 bytes (63%)**, raw and uncompressed. There's no packer and no external requests. Gzipped, it would be 17.5 KB.
- **Music: 11,829 / 16,384 bytes** (`dist/music.min.js`).
- **Narration voice: 4,355 bytes** (`dist/voice.min.js`). Counted together with the music, the audio comes to **16,184 / 16,384**, so it fits the music budget either way.
- `src/` is commented. `python3 build.py` strips comments and indentation, inlines everything and prints the sizes.

## Timeline (170 BPM, 1 bar = 1.41 s, 128 bars + end card ≈ 3:03)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | A white wireframe tesseract rotates through 4D inside a spiralling square tunnel; the RECURSOR logotype glitches | – |
| 0–8 | 0:00 | **Boot**: the tesseract fades in, and a boot log types itself ("w-axis … unbounded", "interior volume … > exterior") | An acid line alone, its filter opening; data blips; sub drone; a snare roll and a riser into the slam |
| 8–16 | 0:11 | **Depth 01 · Tesseract**: three nested tesseracts zoom inward forever, with feedback trails. Every snare cuts to a new 4D rotation, and an acid accent flares on the near cell | The breaks come in. Every bar is regenerated with ratchets, stutters, pitch-swept snare rolls and sudden gaps of silence. Metallic stabs land on the edits |
| 16–24 | 0:22 | **8 cells**: a lattice where every cell is a *different* 3D slice through the same rotating 4D sponge, flown through between the slices | Same, plus reversed-snare swells |
| 24–40 | 0:34 | **Depth 02 · Corridor**: a lattice of square corridors whose gravity turns 90° every 8 m. An octahedron hovers 14 m ahead at exactly your speed, and you never reach it. From bar 32 the corridor twists into a helix. 90° camera roll snaps on cuts | Heavier, saturated breaks; sampled-break chops (re-sliced, pitched, reversed); reese bass; ring-modulated clanks; acid line B |
| 40–48 | 0:56 | **Interior** (drop): a small wireframe cube in the void. Its faces are portals into a hall about 10× wider than the cube. The camera enters, and the hall holds a smaller cube that is the same portal again (three halls deep) | Silence, then a fragile FM music-box in E minor with a major 7th, a pad and the sub. A roll and a riser slam back |
| 48–64 | 1:08 | **Depth 03 · Fold**: the descent down the axis of a Menger lattice, each recursion level rotated about the flight axis and re-cut on every edit. Sodium-red accent on one recursion level, blinking data cells, inversions held for 4 bars at a time. Bars 56–60 cut between the sponge and an apollonian inversion foam ("CUT. FOLD."); bars 60–64 cut into the corridor | The fullest section. A 20-resonance acid line with a mutating pattern, a 32nd-note acid lead, and a hard stop at bar 63 |
| 64–72 | 1:30 | **Vertex**: an endless zoom into a vertex of a twisted Sierpinski tetrahedron. It's self-similar under "scale ×2 + twist", so the fall never ends; each cut changes the twist | The music-box motif comes back at double speed inside the breaks |
| 72–80 | 1:42 | **Depth 04 · {p,q}**: hyperbolic tilings ({7,3}, {5,4}, {4,5}, {6,4}, {8,3}…) falling inward by Möbius translation. Each cut changes the tiling and switches between the Poincaré disk and the half-plane, where the tiles recede to a horizon that is infinitely far | Half-time break with 32nd hats, bit-crushed drums, and the acid line in a 12-step cycle against the 16-step bar |
| 80–88 | 1:53 | **Inversion**: flying through the {4,3,5} hyperbolic honeycomb (five cubes around every edge) in the Poincaré ball. A Möbius translation wraps after exactly one cell, so the flight is seamless and never arrives | Busier crushed breaks |
| 88–96 | 2:04 | **24-cell** (drop): a lone white 24-cell turning in 4D with long trails | The music-box motif played backwards and detuned, with a canon an octave lower |
| 96–120 | 2:15 | **Depth ERR · Collapse**: a hard-cut montage of all nine geometries on the edits, with heavy datamosh, pixel-sort drips and tearing. The frame falls into itself (rotating Droste recursion) at "ALL DEPTHS AT ONCE" and through the last four bars | Every edit type at once, a supersaw swell, a ratchet on every beat in the last four bars, and a hard stop at bar 103 |
| 120–128 | 2:49 | **Zero**: silence. The 24-cell shrinks to a point, the picture switches off like a CRT (to a line, then a dot), and the end card shows | Bells, sub, the voice, and a single final crash at bar 126 |

## Narration
The narration is a **formant voice synthesized in WebAudio** (`src/voice.js`).
- **How it speaks:** a sawtooth glottal source and noise go through three bandpass formant filters driven by a small phoneme table (vowels, sonorants, fricatives, stops). The result is bit-crushed through an amplitude staircase and partly ring-modulated at 47 Hz, which gives it a cold Speak & Spell-like timbre. The pitch is flat and drifts down a little at the end of each line.
- **Timing:** every phoneme lands on the 32nd-note grid, so the voice is locked to the beat. The music is ducked about 7 dB while it speaks.
- **On screen:** each word appears at the moment the voice reaches it, as black text on hazard-green labels, with a brief scramble as it arrives. The words come from the same phoneme layout the voice uses, so text and voice can't drift apart.
- **Why not speechSynthesis:** it bypasses WebAudio, so it can't be ducked or crushed. It also varies by OS and is missing from the offline render. The formant voice avoids all three problems.

| Bar.16th | Time | Line | Phonemes |
|---|---|---|---|
| 1 | 0:01.4 | SUBJECT ACQUIRED. | `s@bjekt @kwaird` |
| 4 | 0:05.6 | BEGIN DESCENT. | `bigI:n dise:nt.` |
| 8.4 | 0:11.6 | DEPTH ONE. | `de:pT wa:n` |
| 13 | 0:18.4 | EIGHT CELLS. YOU ARE IN ALL OF THEM. | `eit se:lz. yu ar In O:l @v De:m` |
| 19 | 0:26.8 | ROTATE. ROTATE. (stuttered "ro-rotate") | `routeit. ro-routeit` |
| 24.2 | 0:34.1 | DEPTH TWO. THE CORRIDOR. | `de:pT tu:. D@ korIdo:r` |
| 29 | 0:40.9 | DO NOT TURN AROUND. | `du: na:t t@rn @raund` |
| 34 | 0:48.0 | IT IS THE SAME CORRIDOR. | `It Iz D@ seim korIdo:r` |
| 41 | 0:57.9 | THE ROOM IS LARGER THAN THE HOUSE. | `D@ ru:m Iz la:rj@r DAn D@ hau:s` |
| 45 | 1:03.5 | ENTER. | `e:nt@r` |
| 48.4 | 1:08.1 | DEPTH THREE. FOLD. | `de:pT Tri:. fo:ld` |
| 56 | 1:19.1 | CUT. FOLD. CUT. FOLD. | `k@t. fo:ld. k@t. fo:ld` |
| 64 | 1:30.4 | EVERY PIECE CONTAINS THE WHOLE. | `evri pi:s k@nteinz D@ ho:l` |
| 72.4 | 1:42.0 | DEPTH FOUR. | `de:pT fo:r` |
| 76 | 1:47.3 | THE EDGE IS INFINITELY FAR. | `Di e:dj Iz Inf@n@tli fa:r` |
| 82 | 1:55.8 | KEEP FALLING. YOU WILL NOT ARRIVE. | `ki:p fO:lIN. yu wIl na:t @rai:v` |
| 89 | 2:05.6 | EVERY EXIT IS AN ENTRANCE. | `evri egzIt Iz An e:ntr@ns` |
| 93 | 2:11.3 | THERE IS NO BOTTOM. | `De:r Iz no: ba:t@m` |
| 96.2 | 2:15.7 | DEP- DEPTH ERROR. (pitched up) | `de- de:pT er@:r` |
| 104 | 2:26.8 | COLLAPSE. | `k@lA:ps` |
| 110 | 2:35.3 | ALL DEPTHS AT ONCE. | `O:l de:pTs At wa:ns` |
| 116 | 2:43.8 | COLLAPSE. COLLAPSE. COLLAPSE. (pitched up a fourth) | `k@lAps. k@lAps. k@lA:ps` |
| 120.4 | 2:49.8 | RETURN TO ZERO. | `rit@:rn tu zi:ro:` |
| 124 | 2:55.1 | GOODBYE. | `gu:dbai::` |

Section cards also flash in huge difference-blended type on the downbeats: DEPTH 01, 8 CELLS, DEPTH 02, INTERIOR, DEPTH 03, VERTEX, DEPTH 04, INVERSION, 24-CELL, DEPTH ERR, COLLAPSE, ZERO. A HUD in the corner reads `RCSR // DEPTH nn // bar:16th // CUT n` and changes to `//// SIGNAL LOST ////` during the drum gaps.

## What I invented
- The concept and title, plus the "depth counter" structure: the voice is a machine logging a subject's descent.
- **The geometries:**
  - nested recursive tesseracts
  - a lattice of 3D slices of one 4D sponge, where every room is a different cross-section of the same object
  - a gravity-rotating corridor lattice with an occupant you never catch
  - a cube that is about 10× wider inside, holding the same cube again
  - a Menger lattice descent whose recursion levels are re-cut on the edits
  - an endless vertex zoom into a twisted Sierpinski tetrahedron
  - hyperbolic tilings in two models
  - the {4,3,5} honeycomb flight
  - an apollonian foam
  - the Droste frame-inside-the-frame collapse
  - a CRT switch-off ending
- **The music:** procedural breaks from five templates, mutated per bar by a seeded generator. Edits are ratchets, stutters, swept rolls, break chops and gaps. The one-bar "sampled" break is synthesized sample by sample at startup so it can be chopped and played reversed. The acid patterns, the reese, the stabs, the supersaw swell and the music-box motif are all original.

## How it's built
- **Graphics:** WebGL2 in three passes.
  1. A single scene fragment shader holds nine scenes. Seven are raymarched SDFs; the other two (the 4D polytopes and the hyperbolic tilings) are 2D. The 4D polytopes are projected in JS (4D rotation in six planes, then a perspective drop to 3D and to 2D) and drawn as anti-aliased line segments.
  2. A feedback pass handles scanline tearing, chroma split, inward zoom trails, datamosh block-hold, pixel-sort drips and the Droste recursion.
  3. A final pass adds inversion, scanlines, grain and the CRT switch-off.
- **Sync:** `SONG.ev(bar)` is the single source of truth for every hit. The visuals use it for cuts, kick and snare envelopes, gaps (the frame freezes and moshes) and break chops (tear spikes). The audio clock drives everything.
- **Strobing is limited.** Full-screen inversion flashes come from about 20–45% of cuts and are at least 0.45 s apart. Measured: at least 0.53 s apart, 0.89 flashes per second in the collapse and 0.32–0.58 per second in the other drum sections. The menger section holds inversions for 4 bars at a time instead of flashing. Most of the violence comes from cuts, rotations, tearing and moshing.
- **Resolution:** internal width is capped at 1280 px, upscaled with nearest-neighbour, and it scales itself down if frames run slower than about 26 fps.
- `src/` holds `index.html`, `main.js`, `scene.frag`, `post.frag`, `music.js` and `voice.js`. `python3 build.py` builds `dist/`, and `python3 build.py dbg <out.html>` builds a debug copy with pixel-statistics hooks.

## Checks run
- `budget.py`: passes. The file is self-contained.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with no exceptions or console errors. All shaders compile.
- `check.mjs audio` on voice + music (the full mix): **peak 0.88**, 0 NaN samples, 187 s rendered.
  - RMS per 4 bars, in dB: −16.6 −15.0 | −10.7 −10.8 −10.3 −9.9 | −11.0 −11.2 −9.5 −10.0 | **−16.0 −17.1** (drop) | −10.3 −10.6 −10.9 −10.6 −12.5 −10.7 | −13.5 −14.2 −12.8 −13.6 | **−16.5 −16.4** (drop) | −10.8 −10.9 −10.6 −10.7 −10.7 −8.7 | −17.9 −17.9 (end), then the tail.
  - Voice alone measures about −15 to −17 dB RMS per bar while it speaks, against music ducked to about −17 dB.
- `check.mjs clearance` (the corridor flight, bars 24–40, against the tube walls and all 80 ribs): the camera never enters geometry, and it comes no closer than **0.88**.
  - The other flights are clear by construction:
    - the menger camera stays on an axis that is empty at every recursion level, at least 1/3 from any wall
    - the 4D-slice lattice camera runs between cells, at least 1.2 from any slice
    - the honeycomb camera moves along an axis through face centres
    - the apollonian path is a straight line found offline that stays at least 0.24 from the surface for every inversion strength used
    - the cube walk passes through the portal face, and the pillars are at least 17 units from the path inside
- Pixel statistics from headless Chrome on the GPU at 960×540, across the timeline: no black or NaN frames where content is expected, and mean luminance 0.03–0.5 depending on the scene. Six frames plus a readback take 5–63 ms, so the heaviest scenes (honeycomb, apollonian, the 4D polytope lines) cost about 8–10 ms per frame on an Apple M1 at that size.

## What I couldn't verify
- **I haven't heard it or watched it.** I only measured levels, peaks and pixel statistics.
  - The formant voice's intelligibility is the biggest unknown. It's meant to be a Speak & Spell-style robot read alongside the on-screen words, but some lines will be hard to make out without the text.
  - Please also listen for the balance of the acid line against the breaks, and for crackle on slower machines; the collapse is the densest part of the graph.
- The motion, the hyperbolic honeycomb's legibility, and how violent the cuts feel were judged from code and coarse luminance maps only.
- Real-time smoothness on other GPUs or browsers, and how the font stacks fall back on Windows and Linux.
- **Debugging:** `?t=SECONDS` starts the song at a given time.
