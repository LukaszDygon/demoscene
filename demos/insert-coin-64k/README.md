# INSERT COIN: a 64k pixel brawler

The intro is **`dist/insert-coin-64k.haiku-5.5-medium.html`**, one self-contained file with no external requests. Open it and click (or press Space or Enter) on the title screen to start the attract run. The soundtrack starts on that gesture.

Rebuild with `python3 build.py`. It writes `dist/` and prints the size.

## Size
- **Total: 57,594 / 65,536 bytes (88%)**, raw and uncompressed, with no packer. Gzip would give about 20.5 KB, which is for information only.
- **Music: 9,771 / 16,384 bytes (60%)**. `src/music.js` is inlined verbatim, with no minifier.

## Timeline (120 BPM, 1 bar = 2 s, runs 136 s)
| Time | Stage or card | What happens | Music |
|---|---|---|---|
| before click | Title | **BLOCKTOWN BRAWLERS** with a bouncing logo, blinking **PRESS START**, a cycling rogue-gallery panel (enemies and their names), a how-to panel (PUNCH, KICK, SPIN, JUMP) and a stage strip | Silent, until the click |
| 0-24 s | **STAGE 1 - STREET** | Hero runs in. Punks, traffic cones, ninjas that drop in, a roller nana, a boombox kid, a worker, barrels, a phone booth, a mailbox, a bonus car and a skater. Neon, rain, a bus and a police light bar in the parallax | Theme 0, lead and drums build |
| 24-44 s | **STAGE 2 - SUBWAY CAR** | Ninjas, a train conductor and a bike courier. A train passes the window, passengers sway, a route map and a station ticker run | Theme 1, sixteenth-note bass |
| 44-64 s | **STAGE 3 - ROOFTOP** | Pizza drones, balloon clowns and pigeons. A helicopter crosses, a water tower, clotheslines and a pigeon flock | Theme 2, bell stabs |
| 64-80 s | **STAGE 4 - CONSTRUCTION** | A construction mech mini-boss at 70 s. A breakdown (70-74 s) with a hot dog pickup and a GO prompt. A crate drops from the crane and a wrecking ball swings | Theme 3, drums thin out in the breakdown |
| 80-108 s | **STAGE 5 - SLAM ARENA** | WARNING card, then **GIANT SLAMMER** walks in at 83 s with a name card. Phase 2 (ENRAGED!, under 110 HP) adds shockwaves. Phase 3 (FINAL FORM!, under 50 HP) adds a laser | Theme 4, brass and sawtooth doubling |
| 108-112 s | **SUPER** | Rings fill the screen, "SUPER BRAWL!!" alternates with "K.O.", confetti, white flash, fade to black | Riser and crash, after a pre-super build-up on theme 6 (bars 52-54) |
| 112-116 s | **NEW HIGH SCORE** | Ranking table with fireworks. The name is typed as ACE on a letter grid | Theme 5, jingle |
| 116-121 s | **CONTINUE?** | Countdown 9 to 0, one number per beat, with the digit pulsing and light rays behind it | Beeps on each beat |
| 121-136 s | **END CARD** | Blinking **INSERT COIN**, the score and high score, a credits roll with a sprite cameo, and a fade-out | Theme 7, chords resolve to E major |

## What I invented beyond the brief
- **Original cast and names.** Enemies include punks, traffic cones, ninjas, a roller nana, a hot dog vendor, a boombox kid, a worker, a pigeon, a bike courier, a conductor, a pizza drone, a balloon clown, a tuba guy, a bouncer, a mascot, a skater kid, a sax soldier and a park ranger. Props are barrels, phone booths, cars, mailboxes, trash cans, meters, crates and hydrants. The boss is GIANT SLAMMER, and the game is BLOCKTOWN BRAWLERS. Shop signs are NOODLE, PAWN, DONUTS, ARCADE, KARAOKE, BAIT, LAUNDRY and PIZZA.
- **Attack and hit feedback.** Each enemy has its own attack animation, a telegraph ring and "!" before attacks, shout bubbles and a drop-in for ninjas. Hits show a flash star, a swing arc, knockback and words (BAM!, POW!, WHAM!, ZAP!, OOF!). Kills spin the enemy away with a burst.
- **Autopilot combat.** Punches, every third swing is a kick, and every fifth swing is a spin that hits everything in front. Airborne targets make the hero jump and uppercut. The hero also jumps over shockwaves, and health regenerates over time.
- **Stage-specific content.** Each stage has its own parallax layers, foreground silhouettes, weather (rain, snow, dust, confetti), a stage cut-in showing that stage's cast, a stage name plate and a clear panel with a count-up bonus and a PERFECT STAGE bonus at a combo of 10 or more.
- **Score and HUD.** Combo multiplier on score, a combo timer bar, enemy count, a stage progress strip, lives icons, boss health with segment ticks, and a demo-play blink.
- **Boss.** A three-phase fight with a boss name card, a follow spot, stomp shake, steam while enraged, a laser in the final form and a shockwave that you dodge by jumping.
- **Score screen.** A ranking table with fireworks and a letter grid for the name entry.
- **Music.** Six stage themes (street, subway, rooftop, construction, boss, jingle), an extra pre-super theme and an outro theme. Each theme has its own drum, bass and lead patterns, with alternating second patterns, retrograde and transposed lead variants, a harmony voice, stage-start fanfares, risers and brass stabs in the boss theme.
- **Debug hook.** `?mute&t=SECONDS` jumps to a point in the timeline with no audio, as in descensus.

## How it's built
- **Native resolution 320x180.** Sprites, text and the stage are drawn on a 2D canvas. Sprites are procedural: lists of coloured rectangles from the feet, with a dark outline pass and mirroring for facing. Text uses a hand-coded 3x5 bitmap font, so no OS font is needed.
- **CRT pass in WebGL2.** One fragment shader takes the 2D canvas as its texture. It applies barrel curvature, nearest-neighbour pixels, a bloom over a 5x5 neighbourhood, scanlines, a shadow mask, vignette, edge darkening and a slight flicker.
- **Song-clock simulation.** Spawns, banners, the super and the score screen are keyed to song time. The sim is frozen during hitstop and from the super on.
- **Audio.** Pulse-wave arpeggios (25%, 12.5% and 50% duty, as periodic waves), triangle and square basses, a sine kick, a noise snare, hats and claps, a generated reverb, and a compressor. The bar-by-bar scheduler with node pruning follows `skill/demoscene-intro/references/audio.md`. The hit, hurt, perfect, boss, smash and super effects use the same bus.
- **Start latency.** The audio context is created in the click handler, and the first bars are scheduled synchronously before `resume()`, so sound starts with the click.

## Checks run
- **`budget.py`** (total 65,536 and music 16,384): **pass**. 57,594 bytes total and 9,771 bytes of music. Self-contained, with no external references.
- **`check.mjs e2e`**: **pass**. Click to first sound is **0.0 s** (previously 1.3 s). No uncaught exceptions or console errors, including the pre-click title screen.
- **`check.mjs audio`** (offline render, 140 s): **pass**. Peak **0.811**, **0 NaN** samples. RMS per 4 bars is about -22 dB through the main stages, drops to -33 dB in the super and countdown, and is about -20 dB in the boss theme. The outro runs about -28 to -29 dB and fades to silence at the end.
- **Timeline scan** (my own headless script, `timeline-scan.mjs`, not in the skill): loaded in `?mute&t=` mode at 43 song times from 0 to 136 s, covering every stage, the boss phases, the super, the score screen, the countdown and the end card. **No exceptions and no console errors.**
- **`check.mjs clearance`**: not run. This is a 2D side-scroller with no camera flight through geometry, so it doesn't apply.

## What isn't verified
- **I haven't heard the music or watched the piece.** The audio measurements are levels and NaN checks only. I haven't checked the mix balance, whether the themes contrast well, or whether the lead sits over the drums.
- **Game sound effects are not measured.** The offline render covers only the music, not the hit, hurt, perfect, boss, smash or super effects.
- **Visuals are unchecked by eye.** I didn't take screenshots, by rule. The scan confirms that no scene throws, but not what is drawn. Legibility of the signs, the stage cut-ins, the score-screen layout, the CRT strength and the composition are judged from coordinates only.
- **Frame rate and feel.** I haven't timed the frame rate on real GPUs. The canvas is capped at 1280 px wide and the bloom uses 25 taps. Hitstop, shake and the boss's phase thresholds are hand-tuned.
- **Balance.** The autopilot's hit rate, enemy damage, the boss's 160 HP and the phase thresholds are set by hand. Whether the fights read well is untested.
- **Music size.** The music is 9,771 bytes, just under the 10 KB target. The total stays inside 57,344 to 65,536 bytes, but only by about 250 bytes at the floor. Any further trimming will cross below the minimum, so keep this in mind before removing content.
