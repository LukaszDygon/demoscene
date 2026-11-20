# THE TAPESTRY: a 64k medieval siege in embroidery

The intro is **`dist/the-tapestry-64k.html`**, one self-contained file with no external requests. Open it and click (or press Space/Enter) on the title card to unroll the cloth. The sound starts on that click.

Rebuild with `python3 build.py`. It prints the size.

## Size
- **Total: 17,368 / 65,536 bytes (27%)**, raw and uncompressed. No packer. gzip would give 7,513.
- **Music: 5,141 / 16,384 bytes (31%)**. `src/music.js` is inlined verbatim.

## Technique
One WebGL2 fragment shader paints a flat tapestry. The picture is laid out as 7 px cross-stitches: each cell takes the colour of the scene at its centre, and an X (or a stray diagonal) is drawn in it. Linen shows in the gaps. Panels are 4 world units wide and the camera pans at a constant rate. Captions are a DOM band in the top margin. The page has no meshes and no post-processing. The brief asks for a flat medieval perspective, so the piece stays 2D.

## Timeline (100 BPM, 1 bar = 2.4 s, 42 bars = 100.8 s)
The camera reaches panel *i* centre at T = 9.6 s × *i*. Its caption and music phrase run from 9.6 s × *i* − 4.8 s. Each phrase is four bars, starting two bars before the panel centre.

| Panel | Bars | Time | Caption | Picture | Music |
|---|---|---|---|---|---|
| 0 | 0–2 | 0–4.8 s | HIC EXERCITUS CASTRUM OBSIDET | camp, marching knights, castle with defenders | drone and lead, no drums |
| 1 | 2–6 | 4.8–14.4 s | MACHINA LAPIDES IACIT | trebuchet launches boulders with thread trails at the wall | drums enter, rhythm level 2 |
| 2 | 6–10 | 14.4–24 s | MURUS ARDET | rampart burns; flames unravel and re-knit | filter sweeps up, drums 2 |
| 3 | 10–14 | 24–33.6 s | TURRIS CADIT | wooden tower falls, threads unpick and debris remains | driving, drums 3 |
| 4 | 14–18 | 33.6–43.2 s | MILITES IN PUGNA | two knight groups meet, some fall | driving, drums 3 |
| 5 | 18–22 | 43.2–52.8 s | DRACO ADVENIT | dragon arrives from above, breathes; the hole burns through the cloth at about 48.6–50.2 s | sparse; roar swell at bars 19.5–21 |
| 6 | 22–26 | 52.8–62.4 s | IGNIS PERFORAT TELAM | town burns; the hole stays in frame and pans off left | half-time, drums 1 |
| 7 | 26–30 | 62.4–72 s | CAPTIVI DUCUNTUR | captives led past a lord | minor, drums 1 |
| 8 | 30–34 | 72–81.6 s | CIVITAS CECIDIT | ruins and drifting embers | sparse, no drums |
| 9 | 34–38 | 81.6–91.2 s | FINIS OPERIS | crowned king with banner; the camera stops at about 86.9 s | full, drums 3 |
| outro | 38–42 | 91.2–100.8 s | (none) | woven fringe grows from about 88 s; fade from 98 s; end card from 97 s | D held, then fade |

## Invented beyond the brief
- The cloth is a 40-unit band with stitched beast borders on top and bottom. It has panel seams and a fringe at the end.
- Cross-stitch cells of 7 px on a linen weave, with per-cell wool colour variation and fuzz.
- The hole has a jagged, frayed edge with glowing rim cells, and those cells keep flickering.
- Fire cells re-pick their stitch direction every eighth of a second and drop out at random (unravel and re-knit). The tower's threads drop out in proportion to its collapse.
- The pan stops once the cloth edge reaches the frame edge. Before that the camera moves at a constant speed.
- Pseudo-Latin captions, one per panel, shown in a stitched band.
- The title card, "THE TAPESTRY", with the subtitle "bellum in filo texitur".

## Check results
- `budget.py --total 65536 --music src/music.js --music-max 16384`: passes. Total 17,368 bytes, music 5,141 bytes, no external references.
- `check.mjs audio src/music.js`: passes. Offline render 104.8 s, peak 0.905, no NaN samples. RMS per four bars runs from about −10.8 to −15.2 dB. The first bars are quieter than the drum sections, as designed.
- `check.mjs e2e dist/the-tapestry-64k.html`: passes. Click to first sound is 0.0 s and there are no exceptions or console errors. A shader compile failure would have thrown, so the shader compiles in headless Chrome.
- `check.mjs clearance`: not run. The camera pans on a 2D plane and never flies through geometry.

## Not verified
- **The picture has not been looked at.** Per the brief I took no screenshots, so the colours, stitch density, fire, hole and dragon are checked only by reading the code. The first thing to watch is the dragon's hole.
- **Frame rate is unmeasured.** The shader evaluates the panel under each cell, with fBm fire and up to about 20 segments per pixel in the trebuchet panel. It may be heavy on integrated GPUs at 4K.
- **The music is not heard.** I measured the offline mix only. The lead is a buzzing saw with a detuned square over a three-string drone, with a frame drum. The mix may be too loud or too quiet in places.
- Live sync is not measured. The caption timing and the pan follow the audio clock, but I did not check the drift on a real machine.
