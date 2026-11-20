# TOY BOX WAR: a 64k mock-epic on a bedroom floor

The intro is **`dist/toy-box-war-64k.html`**, one self-contained file with no external requests. Open it and click (or press a key) on the title screen to start. The sound starts on that gesture.

Rebuild with `python3 build.py`. It inlines `src/music.js` and `src/main.js` verbatim into `src/index.html` and prints the size.

## Size
- **Total: 23,320 / 65,536 bytes (36%)**, raw and uncompressed. No packer. (gzip would give 10,404.)
- **Music: 5,838 / 16,384 bytes (36%)**, `src/music.js` inlined as written.

## Timeline
Tempo 100 BPM, 1 bar = 2.4 s. The scene runs in its own clock: bars 27 to 33 are slow motion (scene at 0.3x while the music keeps tempo), and bar 42 freezes it. Real times are approximate.

| Bars | Time | Picture | Caption | Music |
|---|---|---|---|---|
| start | until click | Dark bedroom floor. Title: TOY BOX WAR, A FILM ON THE BEDROOM FLOOR | CLICK TO BEGIN | none |
| 0-3 | 0-7 s | Black room, army and plush lines in the dark | DAY 3. THE BOOKSHELF HAS FALLEN. | music-box arpeggio, no drums |
| 3 | 7 s | Desk lamp clicks on, warm light grows | THE PLUSH DIVISION ADVANCES AT DAWN. | lamp click |
| 3-9 | 7-22 s | Low macro camera over carpet fibres, green line and plush line | CARPET SECTOR 4. THE GREEN LINE HOLDS. | marching snare, toy-piano anthem (phrase 1) |
| 9-16 | 22-38 s | Army marches; the sock avalanche slides from the pile at bar 13; the block tower topples at 13-15 | AN AVALANCHE OF SOCKS IS UNDERWAY. | kazoo countermelody, bass, sock noise sweep at 13 |
| 16-22 | 38-53 s | Lego fortress under fire; bursts at 16.5, 18.5, 19.5, 21; its odd top bricks scatter at 21 | THE BRICK FORTRESS HAS FALLEN. | snare rolls, cap-gun pops |
| 22-27 | 53-65 s | Toy tank on the rug fires at 22.5 and 24 | THE TANK ADVANCES ALONG THE RUG. | kazoo lead, bass |
| 27-33 | 65-79 s | **Last stand behind the cereal box in slow motion**. Holdouts fall at 29.5-32, bursts at 29.5, 31, 33 | LAST STAND BEHIND THE CEREAL BOX. | half-time pulse, kazoo solo, pops |
| 33-41 | 79-98 s | Triumph: confetti shower from 35, the rabbit general stands | THE PLUSH DIVISION HOLDS THE CARPET. | full drums, anthem (phrase 2) |
| 40.6-41.9 | 98-101 s | Still moving | MOM: "DINNER!" | last drums |
| 42 | 100.8 s | **Everything freezes**: particles, soldiers, camera | (none) | music cut |
| 42.5-43.5 | 102-104 s | Light floods in from the doorway on the right | (none) | final tonic chord at 43 |
| 43.8-44.8 | 105-108 s | End card | FINIS. THE BEDROOM FLOOR, ALL UNITS ACCOUNTED FOR. TOY BOX WAR 64K MMXXVI | music tail to 114 s |

## What I invented beyond the brief
- Title screen and end-card wording, plus extra captions (carpet sector, the tank, the holdouts' last stand).
- The tower topples, the sock pile avalanche and the lego fortress collapse.
- The teddy general wears a gold medal. A plush rabbit general stands at the back.
- Three plush holdouts make the last stand behind the cereal box. Five plush die in the battle.
- A confetti shower after bar 35 that freezes with everything else.
- Slow motion is a time warp of the scene clock (0.3x in bars 27-33) with music at full tempo.
- Army, tank and plush casualties are staged on a timeline.

## Check results
- `budget.py dist/toy-box-war-64k.html --total 65536 --music src/music.js --music-max 16384`: pass. 23,320 / 65,536 total, 5,838 / 16,384 music (the figure printed by the check and `build.py` is 5,838 bytes).
- `check.mjs audio src/music.js 4`: pass. Song length 114.4 s, peak 0.694, no NaN samples. RMS per 4 bars runs from -26 to -33 dB through the body, with a quieter slow-motion section at bars 28-31 (about -35 dB) and the tail at -55 dB.
- `check.mjs e2e dist/toy-box-war-64k.html`: pass. Click to first sound 0.0 s, no exceptions or console errors (headless Chrome).
- `check.mjs clearance dist/toy-box-war-64k.html`: pass. The probe covers the fortress, tower and cereal box. Minimum camera distance 1.57, time inside geometry 0 s. The bar-12 camera key was moved once because the first run clipped the cereal box by 0.07.

## Not verified
- **Look.** I could not view it. Per the rules I took no screenshots, so lighting, colour, tone mapping, the tilt-shift strength and the plush look come from reasoning about the shader maths, not from pixels. Expect at least one round of tuning.
- **Sound.** I measured the offline render only. Nobody has listened to the mix, so balance and timbre are unchecked.
- **Performance.** The scene rebuilds about 1,000 instances on the CPU each frame and uses 4x MSAA. I have not measured frame rate on real hardware; headless Chrome uses software GL.
- **Other browsers and GPUs.** Only headless Chrome was checked. There is no fallback if 4x multisampling is unsupported.
- **Sync feel.** The freeze at bar 42, the dinner caption and the flood timing are set on the bar grid but not judged by eye or ear.
- No shadows. Contact darkening is a height-based approximation only.
