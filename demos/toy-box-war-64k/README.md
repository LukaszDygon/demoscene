# TOY BOX WAR: a 64k mock-epic on a bedroom floor

The intro is **`dist/toy-box-war-64k.haiku-5.5-medium.html`**, one self-contained file with no external requests. Click (or press a key) on the title screen to start; sound starts on that gesture.

Rebuild with `python3 build.py`. It inlines `src/music.js` and `src/main.js` verbatim into `src/index.html` and prints the sizes.

## Size: below the requested floor
- **Total: 35,133 / 65,536 bytes (54%)**, raw, no packer (gzip would be 14,135).
- **Music: 7,734 / 16,384 bytes (47%)**, `src/music.js` inlined as written.
- **Requested:** total at least 57,344 and music 10 to 14 KB. **Not met.** The total is about 22 KB short and the music about 2.3 KB short. I did not pad to reach the floor.
- **Runtime:** 186 s of music (76 bars at 100 BPM), inside the 2.5 to 3 minute target.

## Timeline
Tempo 100 BPM, 1 bar = 2.4 s. Bars 28 to 33.5 are slow motion (scene clock 0.3x, music at full tempo). Bar 72 freezes the scene. Times are approximate.

Placement note: the new acts run after the existing battles (bars 45 to 72), not before. Putting them earlier would have meant retiming every existing event and caption.

| Bars | Time | Picture | Caption | Music |
|---|---|---|---|---|
| 0-3 | 0-7 s | **Briefing**: cork board with pins and string, a plastic general points at the map, camera tracks along the board | DAY 3. THE BOOKSHELF HAS FALLEN. | music-box arpeggio |
| 3 | 7 s | Desk lamp clicks on | THE PLUSH DIVISION ADVANCES AT DAWN. | lamp click |
| 3-44 | 7-106 s | Carpet, rug, lint and crumbs; army march; sock avalanche; paratroopers; lego fortress; die-cast car and tank; night raid with flashlight beam (bars 25.4-28.2); last stand behind the cereal box in slow motion; bookshelf siege; triumph | (existing captions) | anthem, snare, kazoo, pops |
| 45-52 | 108-125 s | **Bathtub naval battle**: a rubber-duck carrier and four toy boats on a water plane with ripples; soap foam bursts at 47, 49.5, 51 | THE BATHTUB FLEET ENGAGES AT FULL SOAP. | sea-shanty on toy instruments |
| 52-58 | 125-139 s | **Air war**: six paper aeroplanes and a wind-up helicopter over the bed, seen from above; glowing tracers; crashes at 55, 57 | PAPER AIRCRAFT CONTACT OVER THE BED. | aerial waltz (bass and chords in 3) |
| 58-65 | 139-156 s | **Winter campaign**: freezer drawer open, frost, condensation fog, eight soldiers trudging over sugar snow; burst at 61, 63 | THE FREEZER DRAWER IS OPEN. WINTER CAMPAIGN. | winter dirge |
| 65-68 | 156-163 s | **Medal ceremony** on a shoebox podium; gold medals drop onto three plush generals | MEDAL CEREMONY ON THE SHOEBOX PODIUM. | victory fanfare, snare roll |
| 68-72 | 163-173 s | Triumph; confetti shower; bursts at 67, 69 | MOM: "DINNER!" (70.2-71.7) | anthem phrase 2, drums |
| 72 | 173 s | **Everything freezes** | (none) | music cut |
| 72.5-73.5 | 174-176 s | Light floods from the open doorway (emissive door) | (none) | final ring at 73 |
| 73.8-74.8 | 177-179 s | End card | FINIS. THE BEDROOM FLOOR, ALL UNITS ACCOUNTED FOR. TOY BOX WAR 64K MMXXVI | tail to 186 s |

## Materials and rendering
- **Materials:** plastic, plush (wobble and subsurface), felt (fuzz), cardboard, wood (grain), die-cast metal (specular and environment), rubber, emissive light (door, dust motes), water (ripples, reflection tint), frost (sparkle), contact-shadow discs (mat 12).
- **Additive pass:** the flashlight beam and fog puffs are drawn in a second, additive pass.
- **Plastic:** army men get a mould seam line; plastic has a grazing-angle sheen.
- **Post:** tilt-shift blur grows toward the top and bottom; glow, vignette, warm grade, flash, flood and grain.
- **MSAA:** four-sample MSAA when the GPU supports it; otherwise the sample count drops to what the GPU offers (0 means none).

## What I invented beyond the brief
- Briefing board with pins, string and crayon plan lines.
- Bathtub water with a rubber-duck carrier and toy boats; soap foam bursts.
- Paper aeroplanes, a wind-up helicopter, and tracers over the bed.
- Freezer drawer frost, condensation fog, sugar snow and trudging squad.
- Shoebox podium and falling medals.
- Earlier additions still in place: paratroopers, die-cast car, night raid flashlight, bookshelf siege, toy props.

## Check results
- `budget.py`: pass. 35,133 / 65,536 total, 7,734 / 16,384 music.
- `check.mjs audio src/music.js 4`: pass. Song 186.4 s, peak 0.75, no NaN samples.
- `check.mjs e2e dist/toy-box-war-64k.haiku-5.5-medium.html`: pass. Click to first sound 0.0 s, no exceptions or console errors (headless Chrome).
- `check.mjs clearance dist/toy-box-war-64k.haiku-5.5-medium.html`: pass. Seven static boxes (fortress, tower, cereal box, bed, bookshelf, door frame, bathtub). Minimum distance 0.15, 0 s inside.

## Not verified
- **Look.** No screenshots, per the rules. Colour, lighting, water, shadows and each material come from shader reasoning only.
- **Sound.** Only the offline render was measured. The mix has not been heard.
- **Performance.** About 3,000 instances are rebuilt on the CPU each frame. Frame rate is unmeasured on real hardware.
- **Shadows.** Contact shadows are flat discs, used only for some props; the army in the main battles has none.
- **Other browsers and GPUs.** Only headless Chrome was run.
