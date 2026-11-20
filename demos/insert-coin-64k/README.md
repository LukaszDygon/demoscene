# INSERT COIN: a 64k pixel brawler

The intro is **`dist/insert-coin-64k.html`**, one self-contained file with no external requests. Open it and click (or press Space or Enter) on the title screen to start the attract run. The soundtrack starts on that gesture.

Rebuild with `python3 build.py`. It writes `dist/` and prints the size.

## Size
- **Total: 20,424 / 65,536 bytes (31%)**, raw and uncompressed. No packer. Gzip would give about 8.9 KB, which is for information only.
- **Music: 5,195 / 16,384 bytes (32%)**. `src/music.js` is inlined verbatim, with no minifier.

## Timeline (120 BPM, 1 bar = 2 s, 46 bars = 92 s of content)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | before click | Dusk street, hero standing, **BLOCKTOWN BRAWLERS**, blinking **PRESS START** | none |
| 0-3 | 0-8 s | Hero walks in. Parallax skyline and shopfronts scroll. **LEVEL 1** banner, then a blinking **GO >** | Arp, then bass, kick and drums |
| 4-7 | 8-16 s | Punks come in from the right. Combo counter and PERFECT! stamps | Full beat, pulse lead from bar 6 |
| 8-11 | 16-24 s | **TRAFFIC CONE** guy and **NINJA** teleport-ins with a purple puff. **LEVEL 2** banner | Full beat, arp up an octave |
| 12-15 | 24-32 s | **ROLLER NANA** rolls in on a board, **HOT DOG VENDOR** pushes a cart. **LEVEL 3** banner | Full beat |
| 16-19 | 32-40 s | Breakdown. No enemies, so **GO** flashes. A hot dog pickup at 34 s heals 5 HP | Pads and bass, drums drop out |
| 20-23 | 40-48 s | **WARNING - GIANT SLAMMER** banner. The boss walks in from the right | Drums back |
| 24-35 | 48-72 s | Boss fight. Boss health bar drains. Hits trigger hitstop and screen shake | Heaviest section. Syncopated kick, lead |
| 36-37 | 72-76 s | **Super**: rings of colour fill the screen, **SUPER BRAWL!!**, white flash, fade to black | Riser and crash, drums cut |
| 38-40 | 76-81 s | **CONTINUE?** then 9 8 7 ... 0, one digit per beat | Beeps on each beat, lower on the 0 |
| 41-45 | 81-92 s | **INSERT COIN** blinking over the end card, credit line, fade out | Chords resolve to E major |

## What I invented beyond the brief
- **Original cast and names.** The boss is GIANT SLAMMER, a masked wrestler built from procedural rectangles. The game is BLOCKTOWN BRAWLERS. Shop signs are NOODLE, PAWN, DONUTS, ARCADE, KARAOKE, BAIT, LAUNDRY and PIZZA. I didn't copy anything from an existing game.
- **Level banners** (LEVEL 1 to 3, BONUS, WARNING) that slide in on the beat.
- **Hot dog pickup** in the breakdown, and an autopilot that regenerates health, so the demo doesn't sit at 1 HP.
- **Scoring and HUD details:** 1UP, HI, a health bar, a combo counter, "DEMO PLAY" blinking, "INSERT COIN" blinking, and CREDIT 00.
- **Hit feedback:** hitstop, shake, sparks, and "PERFECT!" on kills and every fifth combo hit.
- **Countdown synced to music.** The beeps are scheduled on the same beat grid as the numbers.
- **End-card extras:** THANKS FOR PLAYING and a fade-out over the last 2.5 s.
- **Debug hook:** `?mute&t=SECONDS` jumps to a point in the timeline with no audio, as in descensus.

## How it's built
- **Native resolution 320x180.** Sprites, text and the stage are drawn on a 2D canvas. Sprites are procedural: lists of coloured rectangles from the feet, mirrored for facing. Text uses a hand-coded 3x5 bitmap font, so no OS font is needed.
- **CRT pass in WebGL2.** One fragment shader takes the 2D canvas as a texture. It applies barrel curvature, nearest-neighbour pixels, a bloom over a 5x5 neighbourhood, scanlines, a shadow mask, vignette and a slight flicker.
- **Scripted brawl on the song clock.** Spawns, banners and the super are keyed to song time. The sim is frozen during hitstop and from the super on.
- **Audio.** Pulse-wave arpeggios (25% and 12.5% duty via periodic waves), a triangle bass, a sine kick, a noise snare and hats, a generated reverb, and a compressor. The bar-by-bar scheduler with node pruning follows `skill/demoscene-intro/references/audio.md`. Hit, hurt, perfect, boss and super effects sit on the same bus.

## Checks run
- **`budget.py`** (total 65,536 and music 16,384): pass. Self-contained, with no external references.
- **`check.mjs e2e`**: click to first sound in **1.3 s**, no uncaught exceptions and no console errors.
- **`check.mjs audio`** (offline render, 96 s): peak **0.844**, **0 NaN** samples. RMS per 4 bars runs from about -22 dB in the main sections. It dips to -32 dB in the breakdown and -33 dB in the super bars, and falls to -26 and -29 dB over the outro, so the levels follow the arrangement.
- **Timeline scan** (my own headless script, not in the skill): loaded in `?mute&t=` mode at 31 song times from 0 to 95 s, covering every scene including the super, countdown and end card. **No exceptions and no console errors.**
- **`check.mjs clearance`**: not run. This is a 2D side-scroller with no camera flight through geometry, so it doesn't apply.

## What isn't verified
- **I haven't heard the music or watched the piece.** The audio measurements are levels and NaN checks only. I haven't checked the mix balance, the kick against the bass, or whether the lead sits well.
- **Game sound effects are not measured.** The offline render covers only the music, not the hit, hurt, perfect, boss or super effects.
- **Visuals are unchecked by eye.** I didn't take screenshots, by rule. The scan confirms that no scene throws, but not what is drawn. Text legibility over the bright sky, the super's colour rings, the CRT strength and the composition are all judged from coordinates only.
- **Frame rate and feel.** I haven't timed the frame rate on real GPUs. The canvas is capped at 1280 px wide and the bloom uses 25 taps. Hitstop and shake strength are untuned.
- **Balance.** The autopilot's hit rate, enemy damage and the boss's health pacing are set by hand. The boss has 80 health and is worn down by hits over about 24 s. The super sets it to zero, so the boss does not die on its own. Whether the fights read well is untested.
