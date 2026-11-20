# THE TAPESTRY: a 64k intro

The intro is **`dist/the-tapestry-64k.opus-5.5-medium.html`**, one self-contained file. Open it and click, or press Space/Enter, on the title card ("click to unroll the cloth"). Press `f` for fullscreen.

It shows a medieval siege as an embroidered tapestry that comes alive. The camera pans steadily along the cloth and reads it like a chronicle: the king's order, the crossing, the ride, the siege, the burning walls, the dragon, and the castle taken. It ends on the cloth's woven fringe. The music is a hurdy-gurdy over drone strings, with a frame drum, a shawm, a psaltery, bells and the sounds of the siege.

## How it is drawn (the fix for "not all elements render properly")
- **One pixel = one stitch.** Each frame, only the visible stretch of cloth is drawn with Canvas 2D into a small canvas, 160 stitches tall and as wide as the screen's aspect needs. Each figure is drawn from a few clean, well-scaled polygons, ellipses and thick strokes. Every coloured area is outlined in dark wool, and limbs are outlined strokes. There are no tiny SDF details.
- **Stitches can't drop out.** The background is transparent, so any stitch that a shape covers by 30 % or more becomes a full stitch, coloured by the shape. A thin line thickens instead of vanishing. The shader then snaps every stitch to the nearest of 10 dyes, so anti-aliased blends turn into real dye colours rather than mud.
- **The pan stays clean.** Shapes are drawn in cloth coordinates with an integer offset, and the shader shifts the sub-stitch remainder. Stitches therefore stay fixed in the cloth and never shimmer as the camera pans. Moving figures step by whole stitches.
- **The shader makes it wool** (`src/cloth.frag`):
  - each stitch is a slanted tent stitch with ply twist, a cylindrical sheen, a dark gap and fuzz, with fibres spilling onto the linen next to it
  - the ground is plain-weave linen with slubs and stains
  - raised wool casts a shadow on the linen
  - the cloth has hanging folds, a hem with a running stitch, a rod with loops, and a woven, knotted fringe at the end
- **Sizes.** People are about 29 stitches tall, horses with riders 41, the castle about 75 × 128, the dragon about 95 × 50, and the border beasts 14 × 22. Captions are 13 px bold serif, with a cap height of about 9 stitches.

## Layout of the cloth (rows of 160)
| Rows | Band |
|---|---|
| 0–4 | rod and loops on the dark wall |
| 4–6.5 | hem |
| 7–25 | top border: beasts (lion, bird, wyvern, stag, hound) in compartments between diagonal bars |
| 25–42 | caption band, stitched in woad |
| 42–126 | the scene; the ground is at row 120 |
| 126–145 | bottom border: beasts. Under the battle, the fallen take their place: dropped shields, helmets, broken lances and spent arrows |
| 145.5–148 | hem |
| 148–160 | dark margin with the English gloss |

## Timeline (100 BPM, 1 bar = 2.4 s, 48 bars ≈ 1:55 plus the end card)
The pan moves 40 stitches per bar. It eases in over bars 0–1.5 and out over bars 42.5–46.5, then stops with the final panel and the fringe in view. Each element is placed at the cloth position the camera centre reaches at its bar, so it is on screen when its action happens. On a 16:9 screen, an element is visible for about ±3.5 bars around its bar.

| Bars | Caption (stitched) | Picture | Music |
|---|---|---|---|
| title | – | The left end of the cloth: a tree, a house, the king's hall. The title card sits over it | – |
| 0–2 | HIC REX BELLUM IUBET | The king on his throne under a tiled pavilion. A vassal kneels, a herald blows a horn, and spearmen march off | Drone fades in; bells; a gurdy lead-in |
| 2–10 | HIC NAVES TRANSEUNT | A comet streams over the shore. Two longships with striped sails, dragon prows and rows of shields bob on wave lines that are never still. Gulls; a jumping fish | Melody A (D dorian) on the gurdy; the psaltery and soft frame drum from bar 4 |
| 10–16 | HIC MILITES EQUITANT | Four knights gallop with couched lances and fluttering pennons, on blue, yellow, red and brown horses | The dance (melody B) with chien buzz strokes, a gallop drum, psaltery and tambourine |
| 16–24 | HIC EXERCITUS CASTRUM OBSIDET | The trebuchet swings over the top on bars 16, 17.5, 19, 20.5 and 22. Each boulder arcs as a running stitch of thread, which then unpicks from its tail. Archers loose arrows. The crew hauls the arm back. A siege tower rolls up and drops its drawbridge onto the castle tower (bar 21). A battering ram hits the gate twice a bar. Defenders throw stones. Fires start on the battlements from bar 20.5 | Full band: the shawm joins in parallel fourths. A whoosh on each launch and a boom on each impact |
| 24–30 | MOENIA ARDENT · TURRIS CADIT | A long rampart burns along its merlons. Its fire is made of stitches that jitter, change dye, unravel in climbing waves and re-knit. Ladders with climbers; torch-bearers; defenders; flaming boulders arcing in from off-screen. **Bars 27–28.6:** the tall tower is unpicked thread by thread, top first. Its upper half tips and drops while it unravels, loose threads stand up from the stump, and it ends as rubble | Melody A over heavier drums, crackle; a collapse of four booms at bar 27 |
| 30–38 | DRACO VENIT · ET PANNUM URIT | Burning houses, fleeing men, a rearing horse, an archer. The dragon flies in (bars 29.3–31) and hovers, keeping pace with the pan. **Bars 32–34.4:** its breath burns a hole through the cloth itself: darkness behind, a scorched ring, charred threads poking in, a glowing frayed rim and embers. The pan carries on: the hole slides left and out of frame, still smouldering, while the dragon breathes after it. It turns and flies off to the right (bars 34.6–37) | Roar at bar 30. Drums and toms only, then the dragon melody (phrygian dominant) from bar 32; blaze and cloth-tearing sound; a second roar at 36.5 |
| 38–46 | DRACO FUGIT · CASTRUM CAPTUM EST | A cheering crowd, a tree, the taken castle under the victors' yellow banner with a red cross, the crowned king on horseback with his banner, a trumpeter | Melody D (D major) with a gurdy third below, shawm, psaltery, tambourine, bells at bars 38 and 44 |
| 46–48 | – | The pan stops. The cloth ends in its knotted fringe, the cloth dims, and the end card shows: EXPLICIT | A final D chord, bells, the drone dies away |

An English gloss fades in under the cloth for each caption.

## Invented beyond the brief
- The one-pixel-per-stitch pipeline, which makes stitches survive and snaps colours to dyes. It was built specifically to answer the rejection.
- A comet over the crossing, a nod to the famous comet in the Bayeux Tapestry.
- In the lower margin, the fallen replace the beasts during the battle.
- The caption "ET PANNUM URIT" ("and it burns the cloth"): the tapestry narrates its own damage.
- A battering ram, a siege tower with a drawbridge, archers, ladders and climbers, torch-bearers, a rearing horse, and a crowned king for the victory.
- The rod with linen loops and the hem with a running stitch. Raised wool casts shadows, and fibres spill onto the linen.
- A psaltery, a tambourine and church bells alongside the requested drone, hurdy-gurdy (with the chien buzz), frame drum and shawm.
- Foley timed to the picture: trebuchet whoosh and impact, collapse, roars, the blaze, and the tearing of the cloth. The launch bars (`SONG.LA`, `SONG.FB`) are shared between the music and the picture.

## Size
- **Total: 44,775 / 65,536 bytes (68 %)**, raw and uncompressed (19.0 KB gzipped). There's no packer and no external requests.
- **Music: 9,944 / 16,384 bytes** as shipped (`dist/music.min.js`, inlined verbatim). The commented source `src/music.js` is 11,396 bytes, so it fits as well.
- `python3 build.py` strips comments and indentation, inlines everything and prints the sizes. `python3 build.py dbg <file>` keeps the numeric debug hooks.

## Checks (all pass)
- `budget.py`: total 44,775 / 65,536 and music 9,944 / 16,384, with no external references.
- `check.mjs e2e`: about 0.0 s from click to first sound; no errors, and the shader compiles.
- `check.mjs audio`:
  - 122.2 s rendered, peak 0.76, 0 NaN samples
  - RMS per 4 bars climbs from −20.2 dB (intro) to about −15 dB (siege, fire, dragon), eases to −16.4 dB at the end and −38 dB in the tail
  - offline render takes 7.3 s
- **Per-element numeric probe** (headless, no screenshots). The debug build draws one named element at a time at its key bar, then counts the stitches it covers and its bounding box on screen:
  - all 40-odd elements are present and on screen at their bars
  - every element stays within rows 44–123 of the scene band
  - the beasts stay between the border lines
  - captions stay in rows 28–37, and the measured caption extents don't overlap
  - examples: king 493 stitches, ship 1,850, knights about 750 each, castle 6,500, dragon 1,000–1,400, tower 1,700 standing and about 1,000 as stump and rubble
  - the smallest are the gulls, the jumping fish (about 18–36 stitches) and arrows in flight (7)
- Layout fixes found by reasoning through each panel:
  - knights stop before the trebuchet crew
  - the siege tower is drawn after the castle, so it sits on the motte foot
  - the fireballs' targets avoid the torch-bearer
  - the defenders don't sit behind the rampart towers
  - the castle flags stay below the caption band
  - the beasts were shrunk to fit inside the border

## Not verified
- I haven't seen or heard it; everything was measured.
- The look depends on the shader's stitch and wool maths, which no check covers: tent-stitch shading, the snapping to dyes, the hole's fray and glow, and the fringe.
- Live audio in a real browser, for crackle under load.
- Frame rate on weak GPUs. The canvas work measured 1.3–4 ms per frame headless, and the shader is one full-screen pass.
- Text rendering on fonts other than Georgia or Times: the caption widths were measured with headless Chrome's serif.
- Overlaps on screens wider than about 2:1. There, the departing dragon can briefly cross the tree and castle at the right edge before it leaves the frame.
- Portrait screens show only about 90 stitches across, so some long actions (boulder arcs, fireballs launched off-screen) are cut by the frame edge.
