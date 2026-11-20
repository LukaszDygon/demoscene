# READING FRAME: a 64k intro

The intro is **`dist/reading-frame-64k.opus-5.5-high.html`**, one self-contained file. Open it, then click or press Space/Enter on the title screen ("[ click ] begin transcription"). Press `f` for fullscreen.

It follows one real gene, the green fluorescent protein of the jellyfish *Aequorea victoria*, through the central dogma, filmed as if through a confocal microscope. It starts in dense chromatin. The DNA unspools, gets transcribed and leaves the nucleus through a pore. A ribosome translates it codon by codon, and the chain folds into GFP's eleven-stranded β-barrel. Then its chromophore lights up: the green that the whole film has been looking through turns out to be this protein. The camera pulls back from one molecule to a whole cell of them, and the cell photobleaches to black.

The soundtrack is 124 BPM progressive techno in F minor. **The arpeggio is the gene.** Every note is one base of the GFP coding sequence (717 nt, wild type). It is played at the exact moment the polymerase or ribosome on screen reads that base, and the letters on screen are the same letters.

## Size
- **Total: 62,906 / 65,536 bytes (96%)**, raw and uncompressed. There's no packer and no external requests. Gzipped, it would be about 27.9 KB.
- **Music: 15,231 / 16,384 bytes** (`dist/music.min.js`). There's no narration voice.
- `src/` is commented. `python3 build.py` strips comments and whitespace with a string-aware minifier (no external tools), inlines the five shaders, the music and the main script, and prints the sizes.

## How the sequence becomes music
- **The gene:** the 717-nt wild-type *gfp* cDNA, translated in code with the standard genetic code. I checked the translation against the published protein: MSKGEELFTGVV…GMDELYK, 238 aa. Ser65-Tyr66-Gly67, the chromophore, sits at codons 65–67.
- **Base → note:** A = root, C = 3rd, G = 5th, T/U = 7th of the current chord (Fm7, Dbmaj7, Abmaj7, Eb6, and F major for the light). Register depends on position:
  - In transcription it cycles on four 16ths, so the line feels 4/4.
  - In translation it follows the position in the codon (low, mid, high), so every codon is a three-note figure rolling against the 4/4 grid. Codon starts also get a wood "tock" and a glass bell pitched from the amino acid.
- **One reading head, shared:** `SONG.rd(bar)` drives both the scheduler and the picture: the polymerase position, the codon in the ribosome's A-site, the on-screen ticker, and the "reading frame" bracket of light that pulses on each base or codon.

| Bars | Reading | Rate |
|---|---|---|
| 24–40 | bases 1–256, transcribed | one per 16th (8.3 nt/s) |
| 40–48 | bases 1–64, through the nuclear pore | 8ths |
| 48–66 | codons 1–96, translated | one base per 16th (2.8 aa/s, about half of real speed) |
| 66–72 | codons 97–239, accelerating ×2, ×4, ×8 | to 128ths, where the arpeggio becomes a riser. The stop codon UAA lands at bar 71.85; then silence |
| 72–88 | the chromophore codons TCT TAT GGT, looped | 9 steps against 16 |
| 88–96 | the last 64 bases, ending on TAA | 8ths |

The amino-acid sequence is also a melody: a slow FM lead plays residues 1–16 over the export breakdown and the C-terminal residues over the outro.

## Timeline (124 BPM, 1 bar = 1.935 s, 100 bars + tail ≈ 3:20)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | Out-of-focus, depth-coded DAPI chromatin behind the title | – |
| 0–16 | 0:00 | **Chromatin.** A confocal raster scan reveals the field. The focus racks in, then a z-stack sweep moves the focal plane through three solenoid fibres. Each fibre carries nucleosomes (histone octamers wrapped by 147 bp, linker H1 at the dyad), coloured by depth, in front of a blue haze of the rest of the chromosome | Pads, sparse "sonar" pings taken from the chord, a breathing noise bed. The kick enters at bar 8 through an opening filter; hats join at 12 |
| 16–24 | 0:31 | **Unspool.** An unwrapping wave runs outward from the focus. Histones drift away, the strained front glows, and the fibre falls back as the DNA straightens into a B-form double helix (space-filling backbone, sugars and base pairs). Three general transcription factors settle on the promoter. A helicase ring and RNA polymerase ride in | The rolling bass enters with its filter opening; open hats, crash, tom fill, reverse cymbal |
| 24–40 | 0:46 | **Transcription.** The hexameric helicase spins ahead, and the helix over-winds in front of it as the bubble opens. The polymerase is shown in cutaway. Nucleotide triphosphates fly into the active site one per 16th, each landing on its note. The new RNA pairs briefly with the template, then peels off and rises. The ticker shows the 3′ template above the growing 5′ mRNA. From bar 36 the camera climbs the messenger; fade to black | **The gene starts playing**, one base per 16th. Shaker, clap from 32, offbeat chord plucks from 32, riser |
| 40–48 | 1:17 | **Export.** A scan reveals the nuclear envelope from inside the nucleus: a lipid bilayer with a toroidal pore, peripheral heterochromatin that leaves a channel under the pore, and an 8-fold pore complex (spokes, rings, basket, cytoplasmic filaments). A wiggling FG-repeat mesh parts around the messenger, which leaves 5′-cap first. Importins move inward. The camera flies through the channel with motion trails | Breakdown: no kick, a sub drone, the arpeggio at 8ths, the amino-acid lead (M S K G E E L F T G V V…), a riser and a snare roll into a flash |
| 48–60 | 1:33 | **Translation.** The large subunit docks onto the small one. The messenger slides three bases per codon into the bracket on the accent. tRNAs arrive with EF-Tu, dock in the A-site, shift to P and E, and leave. The small subunit ratchets on each step. The chain threads the exit tunnel, shown in cutaway, then writhes out as a full-atom random coil. Two more ribosomes sit on the same messenger (a polysome) | Codons as three-note figures against the 4/4, codon tocks, amino-acid bells, rides, congas on the 3-grid |
| 60–66 | 1:56 | Bar 60 exactly: **S65 · Y66 · G67**, the chromophore codons, light green in the messenger and on their residues | Chord stabs on the three codons |
| 66–72 | 2:08 | **Faster.** The reading runs at ×2, ×4, ×8. The tRNAs smear into motion trails, the camera shakes and pulls back as 238 residues spill out. At the stop codon: black, "UAA · STOP" | The arpeggio accelerates into a riser. A master high-pass sweeps up, the kick drops out at 70, the snare roll accelerates, a tape-stop, then silence on the stop codon |
| 72–84 | 2:19 | **Fold** (the drop). Hydrophobic collapse squeezes the water out of the core and the ribbon diagram resolves out of the space-filling atoms. Then **the 11 β-strands snap in one every 3 beats** in GFP's real order around the can (1-2-3-11-10-7-8-9-4-5-6). Each snap flashes and throws a ladder of hydrogen-bond sparks to its neighbour; the last pair, β1/β6, is the parallel one. The N- and C-termini are labelled; the camera punches in on every snap | **Biggest drop:** reese, octave-down rolling bass, supersaw stabs on the 3-step grid, the chromophore riff, a rising glass note per snap, and each strand's own residues as a fast glass run |
| 84–88 | 2:42 | **Ignition.** The central helix locks and the chromophore lights. Blue excitation photons stream in and green emission photons stream out, with light shafts through the gaps between the strands. Ser65-Tyr66-Gly67 collapse into the real fused-ring chromophore (a phenol ring bridged to an imidazolinone). The surface closes, becomes molecular, and is cut away to show it glowing at the centre | F major for the first time: choir, boom, bell cascade |
| 88–96 | 2:50 | **Pull-back** from ×4,000,000 to ×77 with motion trails. The molecule dissolves into its own point-spread function, its neighbours appear, and then the whole cell: a DAPI nucleus, GFP cytoplasm, mCherry puncta and four neighbouring cells. A marker reads "you are here". The scale bar is computed from the real projection | Outro: the arpeggio reads the last 64 bases down to TAA, and the lead plays the C-terminus (…G M D E L Y K). Kick out at 92 |
| 96–104 | 3:06 | **End card**, with the protein and mRNA sequences in full. Every fluorophore photobleaches at its own moment; the molecule we followed is the last light | A final F-major chord with choir, and the tail |

## On-screen text
- **HUD:** confocal metadata (objective, pinhole, laser line, stage Z, time, bar), the active channels (DAPI, GFP, mCherry), a typed acquisition log at the start, a focal-plane slider, and a scale bar computed from the projection (nm to µm).
- **Spectral detector:** 32 bars drawn from a live `AnalyserNode` on the mix, coloured by wavelength.
- **Reading ticker:** template and mRNA, the bases passing the pore, codons with their amino acids, the current strand and its sequence during the fold, and the chromophore chemistry. It is synced to the notes.
- **Captions:** chromatin, unspool, transcription, export, translation, S65 · Y66 · G67, fold, "488 nm in · 509 nm out", and a few lines of context.

## What I invented
- The concept and title: the gene is GFP, so the light the microscope sees is the payoff. Also the S65-Y66-G67 hook, the chromophore riff, and a photobleaching ending.
- **Rendering:** everything is atoms, as instanced ray-cast sphere impostors with exact depth, 2k–59k spheres plus up to 79k point-spread dots per frame. Molecular "surfaces" are min-distance packed atoms sampled inside implicit shapes: polymerase claw, ribosome subunits with tunnel and cutaway, histone octamer, nucleoporin, tRNA L-shape. Post-processing:
  - screen-space AO on log depth
  - single-pass thin-lens depth of field
  - motion trails by temporal accumulation
  - tent-filtered mip bloom
  - light shafts from the chromophore
  - lateral chromatic aberration, ACES tone curve, grain and dither
  - a confocal raster-scan reveal
- **Biology with licence:**
  - The nucleosome solenoid has parallel-transport frames, so the helix never flips.
  - The DNA has groove geometry. The template strand is read while the coding strand is displaced.
  - RNA–DNA hybrid then exit. Ribosomal ratchet. EF-Tu delivery. A polysome. FG-mesh gating. Importins. H1 at the dyad.
  - The GFP barrel uses the real strand order and orientation (all antiparallel except β1/β6), with a central helix carrying the chromophore. Loops arc over the caps.
- **The soundtrack** is synthesized sample by sample at start-up (kick, clap, hats, ride, shaker, conga, snare, crash, reverse cymbal, boom, reverb IR). On top of that come oscillator voices: FM plucks, bells, rolling bass, reese, pads with chorus, formant choir, FM lead and supersaw stabs. Everything runs through a ping-pong dotted-eighth delay, a convolution reverb, kick sidechain ducking, a compressor and a soft clipper.

## Checks run
- `budget.py`: passes. The file is self-contained.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with no exceptions or console errors. All shaders compile.
- `check.mjs audio`: **peak 0.92**, 0 NaN samples, 200.5 s rendered.
  - RMS per 4 bars, in dB:
    - intro: −23.5 −21.4
    - kick in: −15.7 −14.2
    - unspool: −12.8 −12.7
    - transcription: −13.0 −13.0 −13.0 −13.3
    - export breakdown: −16.0 −15.6
    - translation: −12.5 −12.9 −12.7 −12.8 −12.7
    - build: −16.5
    - **drop: −12.0 −12.3 −12.1 −11.2** (the ignition is the loudest section)
    - outro: −13.4 −18.9
    - end: −16.4, then the tail
  - The peak comes from the final tanh soft clipper. Only a few dozen samples in the drop reach its knee, and none clip hard.
- Headless-Chrome pixel statistics on an Apple M-series GPU (Metal ANGLE) at 1280×633:
  - no shader errors, and no NaN or black frames where content is expected
  - per-frame cost of JS plus all passes is 4–9 ms
  - the renderer lowers its resolution by itself if frames go over about 26 ms; internal width is capped at 2048 px

## What I couldn't verify
- **I haven't watched it or heard it.** I judged the picture from code, coarse luminance maps and per-scene means, and the sound from offline levels.
  - Things to look at: whether the fold reads clearly as strands zipping into a can, the brightness of the close-ups (the polymerase and the pore channel fill the frame), and whether the 128th-note frenzy feels exciting or just busy.
  - Things to listen to: the balance of the gene arpeggio against the groove, and whether the base-to-chord-tone mapping sounds melodic enough when the sequence repeats a letter many times (e.g. the `TTTTT` runs).
- Real-time smoothness on non-Apple GPUs and other browsers. It needs WebGL2 with `EXT_color_buffer_float`.
- The strand boundaries of the barrel and the loop shapes are approximations of the GFP structure, not coordinates from PDB 1EMA.
- **Debugging:** `?t=SECONDS` starts the song at a given time.
