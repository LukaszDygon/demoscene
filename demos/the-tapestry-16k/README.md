# THE TAPESTRY (16k)

A medieval siege worked as an embroidered tapestry. The camera pans steadily along the cloth at 0.3 world units per second, and the action inside the frame is busy. One WebGL2 fragment shader draws the cloth, one WebAudio scheduler plays the music, and the caption band is plain HTML.

Build: `python3 build.py` writes `dist/the-tapestry-16k.html` and prints the size.

## Sizes against budget

| | size | budget |
|---|---|---|
| whole HTML (raw bytes, no packer) | **12 373 bytes** (76%, gzip 5 667 for reference) | 16 384 |
| music source (`src/music.js`, inlined verbatim) | **3 855 bytes** (94%) | 4 096 |

The 3 855 figure is the file as given. The build inlines it with outer whitespace trimmed, so the shipped copy is 1 byte smaller.

## Timeline (120 BPM, 1 bar = 2 s, 36 bars, 75 s)

| bars | time | picture | music |
|---|---|---|---|
| 1–4 | 0–8 s | Cloth unrolls from the left fringe. Woad castle and madder-and-weld emblem, pseudo-Latin caption HIC INCIPIT TELA | Drone fades in, nothing else |
| 5–12 | 8–24 s | Siege camp: tents, a trebuchet whose arm swings, boulders that arc as dotted weld-yellow thread trails (from 10 s). Caption HIC EXERCITVS CASTRVM OBSIDET | Lead A (hurdy-gurdy saw), frame drum on eighths |
| 13–20 | 24–40 s | The tower (world x 10) tips over and its cells unpick from 26 to 32 s. Fire of unravelling stitches on the castle wall. Captions TVRRIS CADIT (26 s), IGNIS MVROS VORAT (32 s) | Crumbling noise sweep at bar 14, lead B, syncopated drum |
| 21–26 | 40–52 s | **Signature moment.** The dragon is present from 39 s. Flame runs from its mouth at 43 s and burns a hole through the cloth, 44–50 s, at world x 14.5. Behind the hole is dark with stars and a frayed glowing rim. The pan carries the hole off-screen to the left. Captions DRACO ADVENIT (40 s), FLAMMA PERFORAT TELAM (44 s) | Growl at bars 21 and 23, flame whoosh at bar 23, sixteenth-note roll 21–26 |
| 27–32 | 52–64 s | Frantic: three knights charge along a fire-lit wall, boulders keep arcing until 62 s. Caption HOSTES FVGIVNT | Sixteenth drum pattern, lead ostinato |
| 33–36 | 64–72 s | Final panel: a lord with a waving madder cloak and a weld banner. The cloth ends at world x 23 and enters from the right at about 68 s as a woven fringe. Caption HIC FINIS (64 s), overlay fades to black 68–72 s | Drone fades out at bar 36, tail to 75 s |

## Invented beyond the brief

- **Chronicle layout.** The cloth is six 4-unit panels, each a different scene, with stitched seams between them. The pan reads them in order.
- **Woven fringe at both ends.** The cloth starts with a fringe on the left and ends with one on the right.
- **Beast border.** Small beasts sit on the walnut ground band along the bottom edge. The top edge is hidden under the caption band.
- **Start screen.** "THE TAPESTRY / CLICK TO UNROLL" overlays the first frame, and the click starts audio.
- **Stitch shading.** Every fill uses satin-stitch direction and density, world-fixed so the cloth scrolls past. The weave grain, the fuzz noise and a light vignette and grain pass sit on top.
- **Other animation.** Fire is built from stitches that flicker in and out. The tower rotates as it falls, and the dragon's wings flap. Knights run with swinging legs, and the banner waves.
- **Extra music.** A sine-and-noise frame drum, a crumbling sweep and a flame whoosh, and a dragon growl made from the lead saw at D2.

## Checks

- `budget.py dist/the-tapestry-16k.html --total 16384 --music src/music.js --music-max 4096`: **pass**. No external references.
- `check.mjs e2e dist/the-tapestry-16k.html`: **pass**. Click to first sound 0.0 s, no uncaught exceptions or console errors. The shader compiles and links in headless Chrome, since a compile failure would throw at page load.
- `check.mjs audio src/music.js 4`: **pass**. Offline render 75 s, peak 0.555, no NaN. RMS per 4 bars runs from −29 dB (intro) to about −22 dB (bars 5–20), about −20.5 dB (bars 21–24, growl and roll) and −21 to −22 dB (bars 25–32), then −25.5 dB (bars 33–36). The tail after 75 s is silent.
- `check.mjs clearance`: **not run**. The camera is a 2D pan with no geometry to pass through, so there is no `__probe`.

## Not verified

- **How it looks.** No screenshots were taken, per the brief. Composition, the stitch and weave texture, the collapse, the dragon's appearance and the hole's on-screen timing are reasoned from the code, not seen.
- **How it sounds.** The render was measured, not heard. The sections differ by only about 2 dB, so the drop may not read as a drop.
- **Performance.** Not measured on any GPU. It is one full-screen shader at up to 1280 px wide, with nine boulder trails, several noise octaves per pixel and fire loops. Weak GPUs may drop frames.
- **Fonts and platforms.** Only headless Chrome on macOS was used. The caption band uses Georgia with serif fallbacks. Windows and Linux font metrics, and phone widths, are unchecked. The shader requires WebGL2 and has no fallback.
- **Ending and fringe.** The fringe and the fade-out at 68–72 s are the least-tested parts visually.
