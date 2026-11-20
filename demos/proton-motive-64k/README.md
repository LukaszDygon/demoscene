# PROTON MOTIVE: a 64k intro

The intro is **`dist/proton-motive-64k.opus-5.5-high.html`**, one self-contained file. Open it, then click or press Space/Enter on the title screen ("[ click / space ] respire"). Press `f` for fullscreen.

It's a journey through cellular respiration, scored with hard warehouse techno at 134 BPM. A glucose molecule drifts into a cell and breaks apart. The camera passes through the double membrane of a mitochondrion into the folded cristae. The electron transport chain hands electrons down the line as sparks, and protons pile up against the membrane. At maximum pressure, the ATP synthase rotor engages, and the cell floods with ATP. The arrangement *is* the proton gradient: it builds from bar 40 to bar 72, breaks down at maximum pressure, and drops exactly when the rotor engages. The rotor turns one c-subunit per 16th note, and one catalytic site fires on every beat.

The look is an industrial cathedral of wet, folded membrane, lit by sodium-amber volumetric light and hot white-blue electron sparks. The protein machines are rendered in chrome and bone. The frame is letterboxed to 2.39:1, with anamorphic streaks, film grain, depth of field and heat shimmer.

## Size
- **Total: 62,241 / 65,536 bytes (95%)**. Gzipped, it would be 25.4 KB, raw and uncompressed. There's no packer and no external requests.
- **Music: 13,031 / 16,384 bytes** (`dist/music.min.js`).
- `src/` is commented. `python3 build.py` strips comments and indentation, inlines everything and prints the sizes. `python3 build.py dbg <out.html>` builds a copy that keeps the `window.__dbg` hooks used for the checks below.

## Timeline (134 BPM, 1 bar = 1.79 s, 120 bars ≈ 3:35 plus the end card)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | The ATP synthase stands still in silhouette, backlit, behind the title | – |
| 0–8 | 0:00 | **Intake.** A glucose molecule (chair-form ring, chrome-and-bone ball-and-stick) drifts out of amber haze. It's backlit by a distant glow, with ribosomes and microtubules (13 protofilaments) in silhouette and motes as bokeh | Sub drone, cytosol hiss, an Fm9 pad and distant metal clanks. The three "catalytic site" bell pitches are heard low and alone. A muffled kick enters at bar 4 |
| 8–16 | 0:14 | **Glycolysis.** Two glowing phosphates fly in and dock (bars 8 and 10). At bar 12 the ring cracks into two three-carbon halves in a burst of sparks, and the camera follows them toward the glow | The kick and rumble open up, with offbeat hats. A zap marks each phosphorylation. The one-note bass enters at bar 10. A crash and a sub drop land on the ring snap |
| 16–21 | 0:29 | **Mitochondrion.** The camera cranes down onto a bent, glowing organelle. Its cristae show as dark bands through the translucent outer membrane. Two more glow in the distance | Claps, 16th hats and metal percussion arrive. The bass filter opens, and a riser starts at bar 20 |
| 21–24 | 0:38 | **Double membrane.** A corkscrew dive through the wet lipid heads of the outer membrane, down a porin barrel, across the proton-flecked gap, and through the import channel of the inner membrane into the light of the matrix | Snare fill and a reverse swell |
| 24–40 | 0:43 | **Cristae.** The cathedral: alternating membrane shelves with swollen rims, lined with dormant rows of ATP-synthase dimers. Respiring complexes hang like chandeliers on tubules and throw amber shafts through the haze. The camera slaloms slowly through the openings | The full groove: open hats, the rolling one-note bass, distorted Fm9 stabs through a ping-pong delay, a formant "choir" pad, and a sub drop on bar 24 |
| 40–56 | 1:12 | **Electron transport chain.** Complex I's peripheral arm, where seven cubane iron–sulphur clusters light up one by one. The electron jumps as a white-blue spark trailing a lightning arc. It rides ubiquinone under the membrane skin to Complex III, boards cytochrome c on the far side, and ends at Complex IV with a flash (O₂ → H₂O). Protons gather above the membrane | Each hop is a falling FM zap on the 16th grid, and each zap is lower than the last: the electron loses energy down the chain. Ride and shaker come in, the bass decay tightens, and the stabs turn bright from bar 48 |
| 56–72 | 1:40 | **Proton gradient.** Down the narrow crista lumen between two membranes, past pillars and venting complexes. Protons thicken and jitter, the membranes glow, and heat shimmer rises. At the end, a vortex swirls over the c-ring set in the floor | A pressure tone climbs three octaves, with toms layering in. The snare roll accelerates from quarters to 32nds, the drums are high-passed, and an 8-bar riser builds |
| 72–80 | 2:09 | **Breakdown at maximum pressure.** The ATP synthase stands in silhouette, backlit, its membrane bowing and glowing from the proton sea beneath. The camera cranes up the peripheral stalk while the rotor strains and shudders | The kick drops out. A heartbeat sub, choir, pad, creaks and the catalytic bells play alone. The last half-bar is an inhale |
| 80–104 | 2:23 | **Rotor engaged.** The c-ring steps 30° every 16th, eased like a ratchet, and the γ shaft turns with a glowing index stripe. On every beat one β site flashes and releases an ATP. The shots: a close orbit on the ring, ATPs flying past, a low shot up the shaft, a top-down view of α₃β₃ with the three sites firing in turn, a wide orbit, and a pull-back to reveal the dimer partner | **The drop.** A harder turbine kick with rumble and a sub drop. Ratchet clicks land on every 16th, pitched up through each beat. A bell sounds on every beat, cycling 3 pitches against 4 beats |
| 104–112 | 3:06 | **Flood.** Back in the cathedral, now lit white-gold. Every rim's synthase heads spin and glow, ATP streams off the rims into the matrix, and pulses of work crawl over the membranes | The peak: the pad returns, stabs land on every offbeat, crashes |
| 112–120 | 3:20 | **Coda.** The camera pulls back through a field of mitochondria glowing like embers inside the cell, then fades to the end card | The kick drops out. The rumble tail and choir remain, the bells slow down and fall an octave, and a final kick and crash land at bar 116 |

Whip pans (directional smear and chromatic split) cover the scene cuts and the shot changes inside the drop. The flashes at bars 24, 80 and 104 are tied to the crashes.

### Captions
Captions sit lower left, in the letterbox: a small uppercase title and a line of plain text. In order: Glucose · Glycolysis · 2 × Pyruvate · Mitochondrion · Double membrane · Cristae · Complex I · Ubiquinone → Complex III · Cytochrome c · Complex IV · Proton gradient · Pressure · ATP synthase · Rotor engaged · α₃β₃ · Dimers · ATP · The cell at work.

A HUD lower right reads `Δp nnn mV   ATP nnnnnn` from bar 40. The proton-motive force is the same curve that drives the picture (fog, glow, shimmer), and the ATP counter adds one on every catalytic bell from bar 80.

## Sync: the music drives the picture
- **One source of truth.** `SONG.ev(bar)` is the single source of every hit. The visuals read it to build envelopes for kick, hats, stabs, crashes and bells, and to drive the electron hops (the same 11 16th-note positions as the zaps).
- **The rotor.** The rotor angle is a pure function of the 16th grid: one 30° step per 16th from bar 80, eased in the first 35 % of the step. With 12 c-subunits that's 120° per beat, so the γ cam reaches the next β site exactly on the beat, and that's when its ATP is released and the bell rings.
- **The gradient.** One "pressure" curve sets the fog density, the membrane glow, the proton count, the shimmer and the HUD. It climbs from bar 40, peaks at 80 and is spent by the rotor.
- **The kick.** During the drop, the kick pumps the exposure and shakes the camera.

## What I invented
- The mitochondrion rides a microtubule track, and each electron hop through I, III and IV launches its protons up through the membrane: 4, 4 and 2, timed to the hop.
- The title and concept. The arc follows the brief; the cathedral is my reading of the cristae: alternating shelves with swollen rims, tubular cristae as chandelier cords, and respiring supercomplexes as the lamps.
- **Biology kept in spirit, with liberties:**
  - Complex I's L shape, with its lateral helix and a chain of seven iron–sulphur cubanes.
  - Complex II (succinate dehydrogenase) as the second, non-pumping entrance.
  - Complex III as a dimer with Rieske heads.
  - Cytochrome c shuttling on the lumen side, and Complex IV reducing oxygen.
  - The F₀F₁ synthase: c-ring hairpins carrying protons (every site loaded except the one at the a-subunit), the a-subunit half channels, a two-helix peripheral stalk with the OSCP cap, a γ coiled coil with an eccentric cam, and α₃β₃ lobes where the β lobe facing the cam breathes open.
  - ATP-synthase dimers lining the crista rims.
  - **Liberty:** the c-ring has 12 subunits (the bovine enzyme has 8) so that 4 steps make exactly one catalytic site per beat.
- **The music:** all of it is original, and every sound is synthesized sample by sample at startup:
  - a pitch-swept kick, and a harder variant for the drop
  - 808-style metallic hats and ride
  - a clap, an industrial snare and metallic toms
  - an FM clank, a ratchet click and an FM "ATP" bell
  - a falling electron zap
  - risers and reverse swells
  - the one-note bass in four decay settings that tighten through the song
  - a distorted Fm9 stab
  - an Fm9 pad and a formant choir
  - both convolution impulses: a bright room, and the long dark "rumble" space
  - The rumble is the kick fed into that dark reverb, low-passed, saturated and sidechained with the sub and the bass.

## How it's built
- **Graphics:** WebGL2. One scene shader is compiled seven times with `#define S n`, so each program only carries its own distance field. All seven are pre-warmed on the title screen, because Metal and D3D build pipelines lazily, which would otherwise hitch at each cut.
  - **Per pixel:**
    - a sphere-traced march with per-object bounding volumes
    - soft shadows and 4-tap AO
    - a wrap-lit, thickness-probed translucency term for the lipid
    - normalized Blinn-Phong with Fresnel
    - chrome reflections of a per-scene environment
    - up to four dynamic spark lights
  - **Then a participating medium:** 16–20 jittered steps with Henyey–Greenstein scattering. The key light is shadowed by a cheap per-scene occluder, which is what gives the light shafts. Emissive fog glows around the mitochondria and electron arcs.
  - **Particles:** up to 5,000 procedural point sprites (protons, ATP, motes, sparks) with bokeh that grows with the circle of confusion. They're occluded against the hit distance stored in the scene buffer's alpha.
  - **Post:** a bright pass, two bloom radii, a two-pass anamorphic streak, depth of field (16-tap golden-angle gather), whip-pan smear, heat-shimmer refraction, chromatic aberration, ACES, a teal-shadow grade, vignette, grain and dither.
  - **Noise:** comes from a 64³ RGBA16F volume generated at load (two gradient noises, a finer octave and cellular F1).
- **Resolution:** internal width is capped at 1152 px, letterboxed. A quality governor scales the render size down to 0.5× when frames run slower than about 28 fps.
- **Audio:** WebAudio, scheduled bar by bar with node pruning. Live, it starts within a fraction of a second because the samples are synthesized before the click. `SONG.render()` renders the same graph offline.
- **Debugging:** `?t=SECONDS` starts at a given time.

## Checks run
- `budget.py`: passes. The file is self-contained.
- `check.mjs e2e`: the first sound starts 0.3 s after the click. No exceptions or console errors, and all shaders compile.
- `check.mjs audio`: **peak 0.91**, 0 NaN samples, 223 s rendered in about 20 s.
  - RMS per 4 bars, in dB: −21.1 −10.7 (intake) | −7.9 … −8.4 (glycolysis through the gradient) | −8.5 −10.9 −12.2 −12.0 (the high-pass squeeze and the breakdown) | −7.7 … −8.0 (the drop and the flood) | −12.5 −12.2 (coda) | −26.4 −39.6 (tail).
  - The groove runs hot through a tanh soft clipper after the bus compressor, so the arrangement shows more in density than in RMS.
  - Balance was set from soloed stem renders: kick plus rumble against bass, hats, percussion, stabs and bells.
- **Pixel statistics:** measured in headless Chrome on an Apple M1 (ANGLE Metal) at 1152×482 internal, one frame per bar across the whole timeline.
  - No black or NaN frames where content is expected. The only near-black frames are bar 0 (the fade-in) and bar 119.5 (the fade-out).
  - Brightness follows the arc: dark intake, a lit cathedral, mounting brightness through the gradient, the release in the flood, and a fade in the coda.
  - Frame times are 8–35 ms in most scenes and about 40–50 ms in the closest synthase shots, before the governor lowers resolution.
- **Camera clearance:** the shader evaluated its own distance field at the camera position every 0.1 s of the timeline. The camera never enters geometry. The closest approach is **0.46** (in the synthase scene; the released ATP molecules are retired before they reach the camera orbits), and every other scene is at least 0.6.

## What I couldn't verify
- **I haven't heard it or watched it in motion.** I only measured levels, peaks, frame times, luminance percentiles and coarse luminance maps. These need a person:
  - the balance of rumble against bass on real speakers
  - whether the electron relay reads as a relay
  - whether the cathedral feels enormous rather than murky
  - how legible the synthase's rotation is at speed
- Real-time smoothness on other GPUs. The frame times above are from one M1 in headless Chrome, while other GPU work was running.
- How the font stacks fall back on Windows and Linux.
