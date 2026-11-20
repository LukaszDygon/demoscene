# INSERT COIN: a 64k intro

The intro is **`dist/insert-coin-64k.opus-5.5-medium.html`**, one self-contained file. Open it and click, or press any key, on the title screen ("PRESS START"). Press `f` for fullscreen.

It's an attract-mode run of an original side-scrolling brawler, *NEON KNUCKLES*. KAZ, a headband-wearing brawler, plays one city block on autopilot ("DEMO PLAY"). He beats four waves and a giant wrestler with a screen-filling super move. Then the hot-dog vendor he let escape comes back and knocks him out with a thrown hot dog. CONTINUE? counts down from 9, and the run ends on INSERT COIN.

## The fix for "the logic is tenuous": the fight is simulated, not timed
- **Choreography as data.** `src/sim.js` (`RAW`) is a script of intents per actor: enter from a side, walk, attack a target with a move, block an attacker's next attack, sidestep it, throw, charge, stomp, super, taunt, flee. Beats count from the moment the camera locks on a wave.
- **Deterministic simulation.** A 60 fps simulation turns that script into bodies, positions and events.
  - **Hits are resolved from geometry.** On the strike frame of a move, the attacker's reach is compared with the gap between the two bodies and their depth difference. If the target is out of reach, airborne or knocked down, the attack whiffs.
  - **Targets react on contact.** On a hit, the target goes into hurt, knockback or knockdown on that same frame. The hit freezes the world for 4–12 frames (hitstop) and shakes the screen.
  - **Defences are reactions.** A block or sidestep starts when the attacker begins its wind-up. A dodge works only because the body really leaves the strike lane, and a block only stops attacks from the front. A grab beats a block.
  - **Bodies are solid.** A move that would overlap someone on the same lane is refused, and the walker steps around in depth. The screen edges are walls once an enemy has walked in.
  - **Enemies take turns (attack token).** They circle at a distance while the hero is busy, and strike when he can answer. The cone guy and the grandma are flagged as ambushes, so they hit him from behind.
- **The HUD only reads simulation state.** Health bars with a red damage trail, score, the combo counter (hits under 70 frames apart), enemy names and bars, the super meter (it fills from damage dealt), PERFECT! (a wave cleared without taking damage) and K.O. all come from events. The TIME counter is the only free-running clock, as in the real thing.
- **Scrolling is earned.** The camera only advances after the current wave is cleared. GO → flashes, the hero walks right by himself, and the next wave spawns when the camera locks.
- **The ending has causes.** The boss is finished by the super, which is only available when the meter is full. The vendor ran off at 10 HP in wave 4. He comes back while KAZ is celebrating, and the hot dog takes exactly his last 36 HP. CONTINUE? starts only after the hero's KO.

`node test/check_sim.js` replays the whole choreography in Node and re-checks it independently from the per-frame snapshots:
- every hit and block has both bodies within the move's reach on that frame, with the attacker in its strike pose and the target already reacting (projectiles must touch the body)
- no two standing bodies on a lane overlap on any frame, and nobody walks through anyone
- health never goes negative, and every KO lands on exactly 0
- every enemy enters from off screen and leaves after defeat (blinks out or runs off)
- the camera never scrolls while an enemy is standing
- every scripted command runs, and the only whiffs are attacks the hero sidestepped
- the boss is finished by the super with a full meter, and the hero is KO'd before CONTINUE

Current result: 63 hits, 9 blocks, 0 overlaps, 0 separations needed, ALL CHECKS PASS. (`-v` prints the event log in bar.beat.frame.) `node test/ascii.js hero p` prints any sprite pose as text.

## Size
- **Total: 63,042 / 65,536 bytes (96%)**, raw and uncompressed. There's no packer and no external requests (gzip: about 26 KB).
- **Music: 9,161 / 16,384 bytes** (`src/music.js`). The inlined, whitespace-stripped copy is 8,257 bytes (`dist/music.min.js`).
- `python3 build.py` strips comments and whitespace (string- and regex-aware), inlines the shaders and the four scripts, and prints the sizes.

## Timeline (150 BPM, 1 bar = 1.6 s, 70 bars ≈ 1:55)
Wave timings come out of the simulation. The bars below are where they land, and the music sections are laid out to match.

| Bars | Game | Music |
|---|---|---|
| title | NEON KNUCKLES logo with a chrome glint over the scrolling block; KAZ and a punk face off; PRESS START blinks | – |
| 0–2 | STAGE 1 · NEON BLOCK, KAZ walks in, FIGHT! | Drum fill and arpeggio intro |
| 2–9 | **Wave 1**: SPIKE and RAZOR (punks). Jab-cross-uppercut, a blocked punch, a combo, a final kick. **PERFECT!** | Theme A: lead, 32nd arps, triangle bass |
| 9–10 | GO →, scroll | |
| 10–18 | **Wave 2**: DUKE blocks and taunts. CONEHEAD CARL headbutts KAZ from behind (first damage), then gets beaten. CLEAR! | Theme A with the octave doubled |
| 18–20 | GO →, scroll | Theme B |
| 20–28 | **Wave 3**: KAGE and OBORO drop from the rooftops. A shuriken is blocked and deflected, a kick is sidestepped, both are KO'd. **PERFECT!** | Theme B |
| 28–30 | GO →, scroll | Theme B (doubled) |
| 30–38 | **Wave 4**: GRANNY GRIND rams him from behind on her skateboard. HOTDOG HANK's hot-dog swing is blocked. Granny is KO'd; Hank is knocked down to 10 HP, gets up and runs away | Theme B, then the bridge (Dm–B♭–E) |
| 38–40 | GO →, scroll to MACK'S GYM | Bridge |
| 40–42 | **WARNING!**: the gym shutter rises, MEGATON MACK walks out and flexes, his name card slides in | Two-tone siren, toms |
| 42–54 | **Boss**: shoulder charge (KAZ sidesteps, Mack crashes into the wall and sees stars), a punish combo, overhead slam (blocked, chip damage), a counter, a grab and body slam (connects, −30), a jump stomp (sidestepped, shockwave), another combo, another slam blocked. Mack flashes red, and the super meter reads READY! | Boss riff over Am–B♭–Am–G, 16th hats; the third pass goes up an octave |
| 54–55 | **Super, NEON TYPHOON**: the screen darkens; a cut-in band with KAZ's portrait at 4× and speed lines; a beam that grows from his fists; 11 hits; a rotating starburst floods the whole screen with Mack silhouetted | Chromatic riser, zap sweep, a hit sound per beam hit |
| 55–57 | **K.O.**: white flash, Mack flies and blinks out. KAZ raises his fist; STAGE CLEAR! | A-major stab, victory fanfare |
| 57–59 | HOTDOG HANK sneaks back in and throws a hot dog; it hits KAZ in the back (−36 → 0). Hank laughs and runs off | Sad four-note trombone fall |
| 59–64 | **CONTINUE? 9..8..7..0**, with a tick on every count; INSERT COIN blinks | Slow Am–F–Dm–E arpeggios |
| 64–65 | GAME OVER | Falling line |
| 65– | End card: **INSERT COIN** blinking over scrolling raster bars | Coin sound and an A-major outro |

## The look
- **Native resolution and crispness:** native 320×180, every position rounded to whole pixels. It's integer-scaled to the largest multiple that fits the window, then shown through a WebGL2 CRT pass:
  - native pixels read with `texelFetch`, so they stay crisp
  - gentle barrel curvature
  - a beam-shaped scanline profile that widens on bright pixels
  - an aperture grille
  - bloom from the mip chain
  - a phosphor-persistence buffer at native resolution
  - vignette and rounded corners
- **Characters** are jointed puppets posed from 41 joint-angle poses and rasterised at load:
  - 4-shade lighting from the top left (shadows lean purple, highlights warm)
  - back limbs a shade darker
  - a dark outline
  - "selout" edges where a front limb crosses the body
- **Cast:**
  - KAZ (about 46 px): red headband with flowing tails, spiky hair, tank top, jeans, red sneakers
  - punks: mohawks, studded jackets, two palettes
  - CONEHEAD CARL: a striped traffic cone and a hi-vis vest; the cone leads the headbutt
  - ninjas: navy wraps, eye slit and red sash
  - GRANNY GRIND: bun, glasses, cardigan, skirt, handbag, on a skateboard with yellow wheels
  - HOTDOG HANK: paper hat, moustache, striped apron belly, a giant mustard hot dog in his hand
  - MEGATON MACK (about 67 px): gold lightning mask, title belt, tall red boots
- **Animation:** idle breathing, a 4-frame walk, punch/cross/kick/uppercut/spin kick wind-ups and strikes, hurt, flying, lying, getting up, block, hop, throw, taunt, dizzy, charge, slam, grab, victory and the two super poses.
- **Ground plane:** feet sit on a shared ground plane with drop shadows that shrink with height, and bodies are depth-sorted by feet y.
- **The city block:**
  - sky: a dithered gradient, stars and a cratered moon
  - far skyline (×0.15) with blinking antenna lights
  - mid layer (×0.4) with billboards
  - the street (×1.0): 14 storefronts with brick texture, cornices, lit and dark windows, AC units and fire escapes; flickering neon signs on sign boards (ARCADE, NOODLES, PAWN, HOT DOGS, MACK'S GYM…), striped awnings, shop windows with goods and reflections, doors and alleys
  - street furniture: hydrants, trash cans, newspaper boxes and benches
  - ground: paving slabs with lamp pools, the curb, and asphalt with lane dashes and manholes
- **Pixel font:** a 5×5 font in base-32 drives the whole HUD and every title, with gradient fills and outlines.

## What I invented beyond the brief
- **Story and cast:** the game's name (NEON KNUCKLES), the hero's name, every enemy name and the boss (MEGATON MACK).
- **The vendor running away:** it sets up the ending, so the KO that leads to CONTINUE? has a cause seeded a minute earlier.
- **Game rules:** the attack-token rule for enemies; the boss's four patterns (charge → dizzy, slam, grab, stomp shockwave); a super meter that fills from damage dealt; deflected shuriken; the gym shutter as the boss entrance; the PERFECT bonus; score popups on KOs.
- **Screens:** the "TYPHOON" cut-in; the 2P side alternating INSERT COIN / CREDIT 00; the STAGE CLEAR! moment that the hot dog interrupts.
- **Sound:** the game's sound effects are scheduled by the music engine from the simulation's events: punches, heavy hits, block clangs, whooshes on sidesteps and throws, landing thuds, the super zap, the KO boom, the sad trombone, countdown ticks and the coin.

## Check results
- `python3 build.py` → 63,042 bytes; music 9,161 bytes source / 8,257 bytes inlined.
- `budget.py --total 65536 --music src/music.js --music-max 16384` → total 63,042 (96%), music 9,161 (56%), no external references.
- `check.mjs e2e` → click → first sound 0.0 s, errors: none.
- `check.mjs audio dist/music.min.js` → 115 s, peak 0.838, 0 NaN. RMS about −16.5 dB through the fights, −19.6 / −21.9 dB in the continue screen, −19.5 dB in the tail.
- `node test/check_sim.js` → ALL CHECKS PASS.
- Every frame of the timeline was drawn headlessly once (`window.__F`) with no exceptions.

## What isn't verified
- **Nobody has watched it.** I haven't looked at any picture, by the rules. Sprite shapes were checked as ASCII dumps and one frame as a luminance dump; colours, the CRT look and readability come from reasoning about the code.
- **Nobody has heard the music.** It is only measured. The sound effects are not in the offline render, because `check.mjs audio` loads the music file without the game, so their loudness against the music is unmeasured.
- **Live performance is unmeasured:** the frame rate on slow machines, and audio crackle when hits and music stack up. Canvas-2D drawing averaged about 0.12 ms per frame in headless Chrome, but GPU cost wasn't measured.
- **Window size and DPR:** tested only through the headless 1280×720 window. Windows smaller than 320×180 device pixels fall back to scale 1.
