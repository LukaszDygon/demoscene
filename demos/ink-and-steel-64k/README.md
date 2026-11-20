# INK & STEEL: a 64k wuxia film in sumi-e

Open **`dist/ink-and-steel-64k.haiku-5.5-medium.html`**. Press Enter or Space, or click the red seal, and the click becomes a brush stroke. The film runs 180 s with sound across five acts. `python3 build.py` rebuilds `dist/` and prints the size.

## Size
- **Total: 38,470 / 65,536 bytes (59%)**, raw and uncompressed (gzip 15.0 KB). No packer, no external requests.
- **Below the requested 57,344-byte floor by 18,874 bytes.** I did not pad to close the gap. Every addition is an object, a shader branch, a figure or a musical phrase with a purpose.
- **Music: 9,565 / 16,384 bytes (58%)**, inlined verbatim. This is below the 10–14 KB range requested.

## Timeline (80 BPM, 4/4, 1 bar = 3 s, 60 bars)
| Time | Act | Picture | Captions | Stamp | Music |
|---|---|---|---|---|---|
| 0–24 s | **1. Prologue** | A lone traveller in a straw hat walks up a mountain path (rocks, pines) to a rope bridge over a gorge. Waterfalls fall down the gorge walls. The path ends at a village gate with houses beyond it, as dusk turns to night | 峠道 The mountain pass; 吊橋 The rope bridge; 門 The village gate | 序 at 0.4 s | Solitary flute melody, creaks on the bridge, a kalimba-like echo, bells at the gate |
| 24–42 s | **2. Teahouse brawl** | Interior of a teahouse. Four thugs close on the straw-hat swordsman. Paper screens flutter and tear at 30, 34 and 38 s. Chairs fly at 33 and 36.5 s. A hanging lantern sways. Ink splashes on the walls at each blow. The thugs fall at 38.8–41 s | 酒楼 The teahouse; 紙障子 Paper screens tear; 静寂 Silence | 破 at 24 s | Fast taiko on eighths and sixteenths, shouts, zither ostinato, kiai roll |
| 42–60 s | **3. Flashback** (indigo ink) | Two students train under a cherry tree, with petals falling and a stone lantern and training post. Ink turns indigo as the memory begins | 追憶 Memory; 桜の下で Under the cherry tree | 想 at 42 s | Gentle zither duet in thirds, arpeggios, bells |
| 60–162 s | **4. The duel**, in three movements | Pond vista at 60–66 s, with a moon, pagoda, reeds, lily pads, reflections and ripples. Ridge standoff 66–96 s, in four shots. Rooftop chase, then the bamboo grove chase with cut stalks and ink flecks. Strike at 120–122.25 s: leap, freeze, slash at 121.5 s, fall, drop, and the bamboo falls at 122.25 s. Aftermath to 162 s | 月下, 對峙, 雨は静かに, 屋根を走る, 竹林, 竹を断つ, 静, 一閃, 竹倒る, 墨は乾く | 弐 at 84 s, 参 at 120 s | Duel theme. Clashes at 84, 87, 91.5, 96, 102, 108, 114, 120.5 s. Silence before the strike at 117–120 s |
| 162–180 s | **5. Epilogue** | A lone grave stele on a hill with a bare winter tree and grass. Autumn leaves fall until 164 s, then snow. The scene fades to paper by 180 s | 秋 Autumn leaves; 雪 Snow settles | 終 at 176 s | Sparse pad, bells, low zither, wind |

Wipes sweep down the frame at the act boundaries (24, 42, 60 and 162 s).

## What was added across the expansion
- **Acts 1, 2, 3 and 5** are new worlds with their own geometry and shader branches: gorge with cliffs, rocks, pines and village houses; teahouse with screens, a scroll, a lantern and flying chairs; cherry trees with petals and a stone lantern; grave, grass and bare tree with snow and leaves.
- **Figures** now go up to six per frame. The prologue traveller, four brawl thugs and the straw-hat hero, the flashback students, and the duellists all use the same figure function.
- **Post-processing** adds indigo ink for the flashback, snow masking, wipes, splashes on up to 16 slots, and bloom.
- **Score** has a section per act, plus the duel theme. Each act has its own instrumental palette.

## Checks run (final build)
- `budget.py`: pass. 38,470 bytes total, 9,565 bytes music, no external references.
- `check.mjs e2e` (headless Chrome): click to first sound 0.0 s, no exceptions or console errors. The shaders compiled. The e2e run plays only the first 8 s, so later acts have not been run in a browser.
- `check.mjs audio` (offline render, 185 s including tail): peak 0.903, 0 NaN. RMS per 4 bars is −20.2, −20.0, −15.4, −16.9 (brawl and intro); −26.3 (flashback, after the fix); −22.2 to −16.4 (duel opening); −29.9 to −24.6 (duel aftermath); −27.4 to −29.4 (epilogue, sparse by design); −61.6 (tail). The lowest sections are the epilogue and the duel aftermath, both intentionally sparse.
- `check.mjs clearance`: pass. 0 s inside geometry, closest approach 0.67 units. The probe returns the boxes for the act at each sampled time, and now includes the gorge cliffs, the brawl chairs and lantern, the training post, the stone lantern and the bare tree.

## Not verified
- **Visuals.** No screenshots were taken, per the brief. The acts, the brawl choreography, the flashback ink colour, the epilogue seasons and the wipes are all unchecked.
- **Sound.** I have not heard the mix. The RMS levels are measured, not judged.
- **Later acts in a browser.** The e2e run covers only the first 8 s.
- **Performance.** No frame-time measurement. Acts with six figures and the 84-slot epilogue loop are the heaviest.
- **Fonts.** The CJK captions depend on OS fonts. Linux falls back to serif.
- **Browsers.** WebGL2 and WebAudio are required. Without WebGL2 the page shows only the seal.
