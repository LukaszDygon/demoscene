# THE TAPESTRY: a 64k medieval siege in embroidery

The intro is **`dist/the-tapestry-64k.haiku-5.5-medium.html`**, one self-contained file with no external requests. Open it and click (or press Space/Enter) on the title card to unroll the cloth. The sound starts on that click.

Rebuild with `python3 build.py`. It prints the size.

## Size (below the 57,344-byte target)
- **Total: 31,507 / 65,536 bytes (48%)**, raw and uncompressed. No packer. gzip would give about 11,462.
- **Music: 6,113 / 16,384 bytes (37%)**. `src/music.js` is inlined verbatim and has no comments.
- **The 57,344-byte floor is not met, and the 10–14 KB music target is not met.** The piece is about 26 KB short overall and about 4 KB short on music. The shader source is about 21 KB. Reaching the floor needs roughly 25 KB more real content: fuller hall geometry, more per-episode detail, separate score sections for the procession, lament and chorale, and more voices. I did not pad to reach it.

## Technique
One WebGL2 fragment shader paints a flat tapestry. The picture is laid out as 7 px cross-stitches: each cell takes the colour of the scene at its centre, and an X is drawn in it. Stitch types are cross, satin (horizontal fill), knot (dot) and gold (sparkling thread). Linen shows in the gaps. Cloth folds sway slowly. Panels are 4 world units wide, and the camera pans at a constant rate. Captions are a DOM band in the top margin. There are no meshes and no post-processing. The brief asks for a flat medieval perspective, so the piece stays 2D.

## Timeline (100 BPM, 1 bar = 2.4 s, 60 bars = 144 s)
The camera reaches panel *i* centre at T = 9.6 s x *i*. A panel's caption and music phrase run from 9.6 s x *i* - 4.8 s, each phrase four bars long, starting two bars before the panel centre. The pan stops at the cloth's end at about 125 s.

| Panel | Time | Caption | Picture | Music |
|---|---|---|---|---|
| 0 | 0–4.8 s (hall at start) | HIC EXERCITUS CASTRUM OBSIDET | camp, castle, sun, cloud, wagon, knights marching, campfire | drone and lead, no drums |
| 1 | 4.8–14.4 s | PRINCIPES CONSILIUM HABENT | council of lords at a table, shields, banners | drums enter, rhythm level 2 |
| 2 | 14.4–24 s | MACHINA LAPIDES IACIT | trebuchet throws boulders at a castle, ladder assault | pulsing drums |
| 3 | 24–33.6 s | MURUS ARDET | rampart burns, archers loose arrows, ram, mangonel | driving, drums 3 |
| 4 | 33.6–43.2 s | TURRIS CADIT | siege tower and a wooden tower falls, threads unpick | driving, drums 3 |
| 5 | 43.2–52.8 s | CUNICULUS SUB MURO | sapper tunnel, castle wall falls, gate | low and sparse |
| 6 | 52.8–62.4 s | EQUITES IN VADO PUGNANT | cavalry fords a river; knights fight on the bank | fast, drums 1 |
| 7 | 62.4–72 s | MILITES IN PUGNA | knights clash, some fall | driving |
| 8 | 72–81.6 s | DRACO ADVENIT | dragon with flapping wings; the breath burns a hole through the cloth at about 77.8–80.2 s; the hole pans off left | sparse; roar swell at bars 31.5–33 |
| 9 | 81.6–91.2 s | IGNIS PERFORAT TELAM | town burns, wagon, fleeing crowd | half-time |
| 10 | 91.2–100.8 s | CAPTIVI NAVE DUCUNTUR | longship on stitched waves in a storm, rain, captives on deck | storm noise swells every bar |
| 11 | 100.8–110.4 s | CONVIVIUM VICTORIAE | feast with gold cups, dancers, banners | major lift |
| 12 | 110.4–120 s | CIVITAS CECIDIT | night: dark-blue thread, stitched moon, comet with gold tail, ruins and embers | minor, sparse |
| 13 | 120–129.6 s | FINIS OPERIS | crowned king on a throne, gold halo, kneeling court; a needle embroiders the halo in gold from about 116 s to 126 s; the camera stops at about 125 s | chorale with bells, full |
| outro | 129.6–144 s | (none) | pull-back to the hall from about 130 s, the burnt hole still in the tapestry; woven fringe grows from about 126 s; end card from 140 s | D held with bells, then fade |

## Changes in this pass
- **Framing in 3D.** The camera starts in a candlelit stone hall with a perspective view of the tapestry on the far wall. The camera pushes in over about 9 s until the cloth fills the frame, which is the flat pan. Four candles give flickering light, with haze in the ceiling. The end pulls back to the hall, aimed at the burnt hole. Walls, floor and ceiling are analytic planes, not a march.
- **Macro dives.** Four short zooms (about 18–21 s, 47–50 s, 84–87 s, 112–115 s) push the camera toward the weave. Above about 1.3x zoom the stitches get a fibre-style relief shade with twist.
- **Cloth physics.** A slow wind warps the whole cloth. The area around the burnt hole curls outward after the burn.
- **Live stitching.** From about 116 s to 126 s, a gold needle embroiders the halo ring of the final panel one arc at a time.
- **New episodes.** Ford battle (panel 6), sea voyage in a storm (panel 10), night panel with a stitched moon and a comet (panel 12). These replaced the cavalry, captives and ruins panels, so the panel count stays 14.
- **Music.** The procession pattern is a steady march. The vocal drone runs through three formant filters. Storm noise swells in the sea panel. Bells call the feast and the chorale. The chorale adds a fifth voice to the pad.
- **Deviations from the brief.** The pan does not pause during the macro dives; it zooms while still moving. The "separate sections" for the lament and procession are only patterns inside the existing phrase system, not separate compositions.

## Invented beyond the brief
- The cloth is a 56-unit band with stitched beast borders (quadruped, bird and serpent types) on top and bottom, panel seams, and a fringe at the end.
- Cross-stitch cells of 7 px on a linen weave, with per-cell wool colour variation and fuzz. Satin, knot and gold stitch types. Gold thread sparkles.
- Millefleurs flower pattern on the linen ground. Cloth folds sway slowly.
- The hole has a jagged, frayed edge with glowing rim cells.
- Fire cells re-pick their stitch direction every eighth of a second and drop out at random (unravel and re-knit). The tower's threads drop out in proportion to its collapse.
- Figures in profile with arms, shields and helmets. Horses with riders and lances. Knights with mail stitching and crests. Archers and mangonel. Siege tower and ram. Gate with portcullis.
- Pseudo-Latin captions, one per panel, shown in a stitched band. A title card and an end card.

## Check results (current build)
- `budget.py --total 65536 --music src/music.js --music-max 16384`: passes. Total 31,507 bytes, music 6,113 bytes, no external references.
- `check.mjs audio src/music.js`: passes. Offline render 148 s, peak 0.906, no NaN samples. The last chunk is silent because it lies beyond the song's end.
- `check.mjs e2e dist/the-tapestry-64k.haiku-5.5-medium.html`: passes. Click to first sound is 0.0 s and there are no exceptions or console errors. A shader compile failure would have thrown, so the shader compiles in headless Chrome.
- `check.mjs clearance`: not run. The camera does not fly through geometry; the hall is analytic planes and the camera stays in front of the wall.

## Not verified
- **The picture has not been looked at.** Per the brief I took no screenshots, so the colours, stitch density, fire, hole and dragon are checked only by reading the code. The first thing to watch is the dragon's hole.
- **Frame rate is unmeasured.** The shader evaluates one panel per cell with fBm fire and many segments, so it may be heavy on integrated GPUs at 4K.
- **The music is not heard.** I measured the offline mix only. The lead is a buzzing saw with a detuned square over a three-string drone, with a frame drum. The mix may be too loud or too quiet in places.
- Live sync is not measured. The caption timing and the pan follow the audio clock, but I did not check the drift on a real machine.
- The new hall framing, macro dives, live needle stitching and cloth wind/curl have not been looked at. Their geometry is reasoned from the code (the perspective maps to the flat pan at 1.732 units) and compiles, but nothing was viewed.
