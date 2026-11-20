# CLEAVE: a 64k intro

The intro is **`dist/cleave-64k.opus-5.5-high.html`**, one self-contained file. Open it, then click or press Space/Enter on the title screen ("[ click / space ] fertilise"). Press `f` for fullscreen.

*cleave /kliːv/: 1. to split apart. 2. to cling together.* It's about the cell cycle and morphogenesis. One cell divides, and its daughters stick together and divide again, until a hollow ball folds into a body, a chemical pattern draws itself across the skin, and the animal opens its eye. Each stage is seen through a different instrument. There are seven microscopes in all: phase contrast, DIC, polarised light, SEM (secondary-electron and backscatter detectors), an H&E histology section, a colourised SEM, and finally the naked eye. The soundtrack starts as deep dub techno at 120 BPM and grows into peak-time techno at 130 BPM. The arrangement divides with the cells: each cleavage doubles the chord polyphony (1 → 2 → 4 → 8), the stab hits per bar and the hat density (4 → 8 → 16 → 32 per bar), and then adds percussion layers.

## Size
- **Total: 61,448 / 65,536 bytes (94%)**, raw and uncompressed. There's no packer and no external requests. Gzipped, it would be 25.2 KB.
- **Music: 16,108 / 16,384 bytes** (`dist/music.min.js`). There's no narration voice.
- `src/` is commented. `python3 build.py` strips comments and indentation, compacts the GLSL, inlines everything, writes `dist/` and prints the sizes. `python3 build.py dbg <out.html>` builds a debug copy that keeps the `/*DBG*/` hooks: `__frame(t)` renders any time and returns pixel statistics, and `self.MUTE=[...]` solos instruments in the offline render.

## Timeline (1 bar = 2.0 s at 120 BPM, easing to 1.85 s at 130 BPM; 104 bars + tail ≈ 3:31)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | A living cell seen through a small eyepiece circle with a graticule. Title, epigraph and "fertilise" | – |
| 0–8 | 0:00 | **Interphase, phase contrast.** The eyepiece field opens to full frame and the focus pulls in. One spread cell is shown in olive-grey with bright phase halos: a nucleus with chromatin and two nucleoli, ER, Golgi stacks by the centrosome, vesicles running out along a radial microtubule array, phase-light vacuoles, and granules jiggling in Brownian motion. The cell rounds up from bar 5 | Vinyl crackle, a sub drone and a single chord-stab voice dissolving in a ping-pong tape delay. Resonant "granule" blips. A muffled kick from bar 4 |
| 8–20 | 0:16 | **Prophase → prometaphase, DIC** (a bronze/violet relief). Chromatin threads condense into banded X-shaped chromosomes. The centrosomes migrate round the nucleus and the nuclear envelope dissolves. Spindle fibres reach out one beat at a time | Full dub kick, offbeat sub bass and rim shots thrown into the delay. Dub throw at bar 15. From 16: open hats (4 per bar), a big-room clap and a taut high "spindle" tone |
| 20–24 | 0:40 | **Metaphase, polarised light.** On a dark field only the ordered spindle glows, tinted gold or blue by its angle to the compensator. Kinetochore fibres attach chromosome by chromosome | The same groove, with the spindle tone rising a semitone over the phrase |
| 24–28 | 0:48 | **Anaphase, DIC.** Each X splits into V-shaped sisters, pulled to the poles in beat-locked tugs. The spindle elongates | A fibre "snap" at 24. A falling "tug" tone on every beat, panned left/right |
| 28–32 | 0:56 | **Telophase and cytokinesis.** A contractile ring and a furrow form, blebs bulge on the daughters, nuclei re-form and a midbody appears. A refocus blur at the end | The whole mix closes through a low-pass "drawstring", then a tape-stop sags the echoes |
| 32–48 | 1:04 | **Cleavage, SEM.** The new image is written over the old one scan line by scan line. Soft-body blastomeres are flattened against each other and squeezed inside a fractured zona pellucida. Sperm are stuck on the zona, a polar body sits on the porous filter, and lineages are false-coloured amber/teal. Divisions land on bars 36, 40, 44 and 48: the furrow cuts in during the bar before (lit hot orange), it completes on the downbeat with a flash and a hard camera cut, and the frame itself splits into 2, 4, 8, 16 and 32 tiles for a beat. The counter reads 2 → 4 → 8 → 16 → 32 | **Each division doubles the arrangement:** stab voices 2 → 4 → 8, stab hits per bar 2 → 4 → … 7, hats 8 → 16 → 32nd ghosts, then shaker and congas at 16 cells and a ride at 32. A "split" sound (one tone gliding apart into two, hard left/right), a crash and a sub drop on each division, a noise swell into it, and tom runs at phrase ends |
| 48–52 | 1:36 | **Morula, SEM in backscatter mode.** The cells compact and seal, and the zona breaks away (hatching) | Rolling bass and ride. The inverted stab voicing an octave up |
| 52–60 | 1:44 | **Blastula, SEM.** A scan-in reveal at 52 shows a slowly turning, ciliated hollow ball of about 500 cells, which fractures open from 54 to show the blastocoel, nuclei and yolk on the cut face | The fullest dub section: a quiet acid line enters, plus high bell shimmers |
| 60–64 | 2:00 | **Gastrulation, SEM.** The vegetal plate buckles inward and the lip of the fold (the organiser) is picked out in orange. Mesenchyme cells drop into the cavity. The camera turns square-on to the cut | **Breakdown.** The kick drops out, a long downward "fold" sweep plays, and the pads open. The tape delay feeds back. The tempo begins to rise |
| 64–72 | 2:08 | **H&E section** on a light table, crossfaded from the SEM cut at the same framing. Pink columnar epithelium, violet nuclei with a few mitotic figures, cilia, an archenteron (gut) extending to the roof, filopodia, mesenchyme, an earlier blastula on the same slide, an air bubble and section cracks. A slide label slides in | The "fold" motif on FM bells over pads and a formant "ah" choir. From 68: a muffled kick, a 4-bar riser, a snare roll accelerating to 32nds and a one-beat gap. The tempo reaches 130 |
| 72–80 | 2:23 | **Pattern formation (the drop), colourised SEM macro.** A GPU Gray-Scott simulation runs live on the skin, starting with one spot per seed that **divides** 1 → 2 → 4 → 8 → 16 (the "mitosis" regime). Hard cuts every 2 bars visit the four seeds. A lab-monitor inset shows the raw 256² field. The pattern's feed pulses with the kick | Peak-time techno: a driven kick with a reverb rumble, rolling 16th bass, a 16-step acid line, chord stabs, 16th hats, claps and ghost snares. FM bell pings double every bar like the spots: 1, 2, 4, 8, 16 |
| 80–88 | 2:38 | **Pull-back.** The spots stretch into stripes, with spatially varying feed so some bands stay spotted. The organism is revealed: an axolotl-like larva with a head, feathery gills, legs, and a swaying tail and fin. From 84, somite chevrons are laid down head to tail | Acid accents on every step, ride, and crash at 80 |
| 88–96 | 2:53 | **Approach and the eye.** At bar 92 the eye opens and the world turns from SEM grey to living colour: wet translucent skin with subsurface glow, iridophore flecks, caustics, light shafts and marine snow. The iris is patterned by the same reaction-diffusion field, and the cornea reflects a ring. The eye turns to look at you and blinks once at 95 | The fold motif returns as a lead, an octave up. A supersaw swell (biggest at 92), shuffled open hats and a ride bell |
| 96–100 | 3:07 | The camera pushes into the pupil as it dilates, to black | The mix closes through a low-pass, and the hats stop at 98 |
| 100–104 | 3:15 | **A new zygote**, back in phase contrast inside the eyepiece circle: a fertilisation envelope, a polar body, and two pronuclei drifting together with the sperm aster. The counter returns to 1. End card at 104 | One stab voice in a long echo, and the split sound reversed (two tones gliding into one). The first two notes of the motif, then the vinyl runs out |

## On-screen text
- **HUD**:
  - top-left: the microscope mode, flagged ▸ for half a bar on each objective change, then elapsed embryo time, time-lapse rate, focus z, and Gray-Scott iteration count
  - top-centre: a developmental timeline strip with a tick per stage and a moving marker
  - top-right: the cell count (1, 2, 4 … then 2²⁰ … 2⁴⁵ ≈ 35 trillion) with a "×2" flash on each doubling
  - bottom-left: the stage name, with a typed lab-notebook line under it ("cohesin cleaved · sisters drawn to opposite poles", "Turing 1952 · Gray–Scott F .035 k .065: spots that divide" …)
  - in SEM modes: a databar with kV, spot, magnification, WD, detector, scale bar, and FRAME/SCANNING
- **Captions** (italic serif, centred low): "one cell, alone", "the chromosomes find the middle", "and are pulled apart", "a waist, a furrow, a cut", "each one does it again", "and again", "a hollow ball of cells", "the sheet folds into itself", "chemistry starts drawing", "no one draws the stripes", "a body, built from the inside out", "and the form opens its eye", "one".

## What I invented
- The title and its double meaning. The "seven microscopes" structure, where the imaging technique changes as the scale grows, with mechanical turret clicks and radial zoom smears on every change. The polarised-light metaphase, the SE/BSE detector switch, and the lab-notebook HUD.
- **The cell is a 2D optical-path field**, not a picture. Phase contrast is computed from the field minus a wide version of it, which gives the authentic bright halos and shade-off. DIC is the field's shear derivative, taken in screen space. Polarised light is a birefringence channel of the same field.
- **The blastomeres are soft-body cells.** Each one is a sphere cut by its power-diagram (radical) plane against its nearest neighbour, which gives flat contact faces with rounded rims. The cleavage furrow ingresses progressively, as an intersection with a shrinking inner core. Positions come from an analytic synchronous-cleavage tree along alternating axes plus a stateless relaxation inside the zona, so seeking is exact.
- **One epithelial profile** (32 material points, morphing from a sphere into a gastrula with an archenteron) drives both the 3D SEM shell, through a per-frame distance-field texture and a precomputed spherical cell-pattern map, and the 2D H&E section. That makes the SEM → H&E crossfade a true match cut.
- **The signature technique:** a GPU Gray-Scott simulation in the regime where spots divide, so the pattern rhymes with cleavage. It is ping-ponged at 256² in float textures, scheduled from audio time so it keeps sync, and mapped triplanar onto the raymarched animal as displacement and colour, and in polar form onto the iris.
- **The music's "division" logic** (polyphony, hits, hat density and bell pings all doubling). Signature sounds for split, snap, tug, pinch and fold, the dub throws, the tape stop, and the motif that links the breakdown to the eye opening.

## How it's built
- **Graphics: WebGL2.**
  - One scene source is compiled into five programs with `#define SC n`: cell, embryo, section, form, and utility passes. Per-scene programs cut register pressure, which made the 2D scenes about 5× faster than an uber-shader.
  - Crossfades are drawn as a second program blended with constant alpha.
  - Post-processing: mip-based depth of field and bloom, a star flare, chromatic fringe, SEM line noise, beam jitter and charging smear, the scan-reveal over a held frame, the eyepiece field stop and graticule, the tile split, the RD inset, and dither.
  - The embryo march uses a per-ray candidate list of blastomeres and analytic sphere shadows and occlusion. The animal has a bounding capsule.
  - Internal width is capped at 1280 px, with adaptive resolution that steps down when frames take longer than ~24 ms.
- **Sync:** the audio clock drives everything through the tempo map `SONG.T`. The same `SONG.kon()` decides kicks for the drums and the kick pulse in the picture (spindle flicker, camera breathing, the RD feed, gill blood, bloom).
- **Audio:** the skill's bar-by-bar scheduler, pruned after 6 bars, runs live and offline. The master chain is a convolution reverb, a second short dark convolver for the kick rumble, a saturating ping-pong tape delay with wow, sidechain ducking on every kick, a master low-pass for sweeps, and a gentle compressor.

## Checks run
- `budget.py`: passes. **61,448 total, 16,108 music**, and the file is self-contained.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with no exceptions or console errors.
- `check.mjs audio`: **peak 0.877**, 0 NaN samples, 211 s rendered in 23 s.
  - RMS per 4 bars, in dB: −23.7 (intro) −15.8 | −13.0 ×6 (dub) | −12.5 … −12.1 (cleavage, blastula) | **−18.8 −18.8** (breakdown) −13.1 (build) | −10.5 … −10.3 (drop) | −14.7 −38.5 (end and tail).
  - Solo renders (debug `MUTE`) were used to balance the layers. An early tape-delay self-oscillation was found this way and fixed.
- Headless Chrome on an Apple M1 at 1280×650, per frame:

  | Scene | ms per frame |
  |---|---|
  | Cell | 2–5 |
  | H&E | 2.6 |
  | Cleavage | 6–14 (32-cell morula) |
  | Blastula/gastrula | 7–10 |
  | Organism | 8–15 |

- A full-timeline luminance sweep (sequential, so the RD simulation evolves) found no black or blown frames apart from the intended ones: the white-out into the drop, the dark polarised-light field and the fade into the pupil.
- Material-ID maps confirmed:
  - two cells at 33 and a packed morula
  - the zona opening the right way (a bug that was fixed)
  - the hollow blastula through the cut
  - the archenteron tube
  - the creature's silhouette in the pull-back

## What I couldn't verify
- **I haven't heard it or watched it.** I only measured levels and peaks, and read coarse luminance and material-ID maps, so the look and feel are judged from code and statistics. Please check:
  - **DIC and phase-contrast contrast.** Thin edges are only a few pixels wide, so they were hard to judge.
  - **Whether the axolotl reads clearly** in the 80–88 pull-back, and whether the SEM-to-colour switch at the eye opening lands.
  - **The balance of the acid, bells and supersaw** against the kick in the drop.
  - **Whether the "tug", granule and spindle-tone details are audible.** They measure quiet.
- The Gray-Scott doubling is tuned for ~620 iterations per second of song. It keeps sync by catching up, by up to 48 steps per frame, so on very slow machines the pattern may lag the music.
- It needs `EXT_color_buffer_float`. Real-time smoothness on other GPUs or browsers, and how the font stacks fall back on Windows and Linux, are untested.
- **Debugging:** `?t=SECONDS` starts the song at a given time. After a seek into the drop, the reaction-diffusion simulation catches up over a few seconds.
