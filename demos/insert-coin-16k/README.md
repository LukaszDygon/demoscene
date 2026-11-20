# INSERT COIN (16k)

An original side-scrolling arcade brawler shown as an attract-mode run: one city block, one headband hero, escalating absurd enemies, a giant wrestler boss, a super move and a CONTINUE countdown into the INSERT COIN end card.

Entry: `dist/insert-coin-16k.html`. Rebuild with `python3 build.py`, which prints the sizes.

## Sizes

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | 12 575 bytes | 16 384 (3 809 to spare, 77%) |
| music source (`src/music.js`, inlined verbatim) | 3 391 bytes | 4 096 (705 to spare, 83%) |

Gzip for reference: 5 694 bytes. Not used for the budget.

## Timeline

120 BPM, 4/4, so one bar is 2 s. The song is 40 bars (85 s); the visuals hold the end card from 77 s.

| bars | time | picture | music |
|---|---|---|---|
| 0–2 | 0–6 s | Title: CITY BLOCK logo, a hero and a cone head on a city silhouette, blinking PRESS START until the click. Then a short hold | Arpeggio only, quiet intro |
| 3–9 | 6–20 s | Wave 1: seven PUNKS, one hit each, one per bar. Scroll starts, DEMO PLAY label | Kick, hats, triangle bass, pulse arp |
| 9–12 | 18–24 s | Gap: flashing GO → arrow | Same |
| 12–16 | 24–33 s | Wave 2: four CONE HEADs, two hits each | Snare and pulse lead come in at bar 10 |
| 16–22 | 32–45 s | Wave 3: six NINJAs, fast dashes, one hit each | 16th-note arp and bass |
| 24–28 | 48–56 s | Wave 4: three SK8 GRANNYs on skateboards, three hits each | Same as 16–22 |
| 29–31 | 58–62 s | Wave 5: three HOT DOG vendors with carts, two hits each | Same |
| 32–35 | 64–70 s | BOSS: BIG BRUISER, twelve hits at half-second spacing, one attack on the hero, boss health bar. Riser in bars 33–34 | Octave-jumping bass, four-on-the-floor kick |
| 35 | 70–72 s | SUPER: rings fill the screen, white flash, SUPER! | Crash and boom at bar 35 |
| 36–38 | 72–77 s | CONTINUE? 9, 8 … 0, one digit each half second. Scroll freezes behind a dark overlay | Blip on each beat, falling pitch |
| 38.5 | 77 s | INSERT COIN end card, blinking, CREDIT 00 | Final A minor chord, ringing to 82 s, file ends at 85 s |

Hits land on the beat grid (every enemy contact is at a half-second multiple), so the combat is locked to the music. The pre-click title is not counted in the song timing.

## What I invented beyond the brief

- The game name, CITY BLOCK, and the in-world names: BIG BRUISER, SK8 GRANNY, HOT DOG, CONE HEAD.
- The hero's health bar drops by 6 when an enemy survives to land a hit (floor of 20) and recovers by 3 on each knockout. It is decorative: there is no game over.
- Combo counter, score, a decorative hi-score, and a PERFECT! stamp on every fifth combo hit.
- Hitstop: each hit holds the last rendered frame for 50 ms (90 ms on a knockout), while the music keeps running. Screen shake runs in the post pass.
- Parallax city: three layers with lit windows and neon signs, scrolling at different speeds.
- Enemy knockouts fly off in an arc with rotation.
- Super move in the boss fight with a hero at 3x scale, expanding colour rings, a white flash and a black cut.
- The title screen has a city silhouette and an enemy sprite beside the hero.

## Deviations from the brief

- The scene is drawn with Canvas 2D at 320×180, not a single raymarched or 2D fragment shader. Sprites, HUD text and the knockout and super effects are much cheaper in 2D canvas at this size. A single fragment shader handles the post pass: CRT barrel curvature, scanlines, bloom from four neighbour samples, a horizontal phosphor smear (not a true persistence buffer) and a vignette. Nearest-neighbour upscaling is used throughout.
- There is no camera flight, so `check.mjs clearance` is not applicable and `window.__probe` is not defined.

## Checks

- `budget.py dist/insert-coin-16k.html --total 16384 --music src/music.js --music-max 4096`: passes, no external references.
- `check.mjs e2e dist/insert-coin-16k.html`: click → first sound 0.0 s, no exceptions and no console errors over 8 s of play.
- `check.mjs audio src/music.js`: offline render in 0.74 s, 85 s long, peak 0.862, no NaN samples. RMS per four bars: intro −31.8 dB, stage 1 −26 dB, stages 2–4 −24 to −26 dB, boss −23.9 dB. The last partial chunk is −53 dB because the chord has decayed.
- Extra headless check, outside the repo: stepped the game clock through the whole run (no audio) with the scene drawn every frame. 2 581 frames, no exceptions, all 24 enemies including the boss knocked out.

## Not verified

- Nothing was heard. The mix balance, the levels between stages (stage 1 and stage 3 measure almost the same RMS), and whether the arpeggio and lead sit well over the drums are all judged from measurements only.
- Nothing was seen. Per the brief, there were no screenshots and no visible browser. Text legibility, the CRT strength, the super move's impact and the hit feel are all unreviewed.
- Frame rate on a real GPU is untested. The scene does a few hundred `fillRect` calls per frame at 320×180.
- Only the headless Chrome on macOS was run. Monospace font fallback, the `→` glyph, and Windows or Linux rendering are unchecked. Touch start is untested (the start listens to `pointerdown` and `keydown`).
- The run needs a click or key press to start the audio, as with any browser intro. The title screen waits until then.

## Files

- `src/music.js`: the song and sound effects. `SONG.live()` plays it, `SONG.render()` renders it offline, and `SONG.sfx()` plays the hit and super effects.
- `src/main.js`: the game, title, HUD and state timeline.
- `src/post.frag`: the CRT and bloom pass.
- `src/index.html`: the page shell.
- `build.py`: builds `dist/insert-coin-16k.html`.
