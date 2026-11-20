# INK & STEEL: a 64k wuxia rooftop duel in sumi-e

Open **`dist/ink-and-steel-64k.html`**. Click (or press Enter/Space) on the red seal and the click becomes a brush stroke. The piece runs about 102 s with sound. `python3 build.py` rebuilds `dist/` and prints the size.

## Size
- **Total: 23,758 / 65,536 bytes (36%)**, raw and uncompressed (gzip ~10.2 KB). No packer, no external requests.
- **Music: 7,097 / 16,384 bytes (43%)**. `src/music.js` is inlined verbatim, with no minifier.

## Timeline (80 BPM, 4/4, 1 bar = 3 s)
| Bars | Time | Picture | Caption (CJK / English) | Music |
|---|---|---|---|---|
| title | pre-click | Blank cream paper with the vermilion seal 墨と鋼 / INK & STEEL | – | silent |
| 0–8 | 0–24 s | **I. Standoff.** Two robed swordsmen on a temple ridge in the rain, side-on. Wide still shot (0–8 s), closer from behind one (8–16 s), low shot with the robes moving (16–24 s). Ink-wash ridges in the mist | 對峙 / Standoff in the rain; 雨は静かに / The rain is quiet | Sparse zither, flute from bar 3, slow heartbeat taiko. **Bar 7 is silent** |
| 8 | 24 s | First clash: ink splash | – | clang |
| 8–12 | 24–36 s | **II. Chase, rooftops.** Camera follows over the ridge, whip pans at 25.5 and 30.5 s | 屋根を走る / Across the roofs | Taiko eighths, zither walk, flute answers |
| 12–20 | 36–60 s | **Chase, bamboo grove.** Figures run through a lane of bamboo. Whip pans at 42.5 and 49 s. Stalks are cut and fall at 40, 46 and 52 s (bars 13.3, 15.3, 17.3), each throwing ink flecks. Clashes at bars 8, 9, 10.5, 12, 14, 16, 18 | 竹林 / Bamboo grove; 竹を断つ / Stalks cut through | Denser taiko from bar 12 |
| 19 | 57–60 s | The chase continues on screen with no music | – | **Silence** |
| 20 | 60 s | **III. Strike.** Both leap (60 s) and freeze (60.6–62 s). A single horizontal ink slash crosses the frame at 61.5 s (bar 20.5). The far figure falls backward (61.5–62.6 s). The vermilion drop lands at 61.8 s | 静 / Stillness; 一閃 / One stroke | Taiko on the leap, zither and clash on the slash, thud on the fall |
| 20.75 | 62.25 s | Bamboo cluster behind them falls, a beat after the figure (flecks again) | 竹倒る / The bamboo falls | Crash |
| 21–28 | 63–84 s | Aftermath. The standing swordsman lowers his blade. Rain, mist, camera pulls back slowly | 墨は乾く / The ink dries (80–93 s) | Sparse zither, rain and drone fade out by bar 34 |
| 28–34 | 84–102 s | End card | 終 / FINIS (95–101.5 s) | Last notes, fade to silence |

## What I invented beyond the brief
- **Ink mechanics.** Figures and bamboo get dry-brush edges, while far ridges and mist are soft washes. The scene bleeds (its lookup is displaced by noise), and edges pool with a darker rim. Rain is ink streaks.
- **Clash splashes.** Each clash throws a rough blot with flung droplets at a fixed place on screen. There are seven, matching the music.
- **Flecks.** Cut stalks throw small ink dots that drift and fade over 3.5 s.
- **Stroke at the start.** The click becomes a brush stroke, and the seal fades out.
- **Music.** A Karplus-Strong zither walk, a bamboo flute with breath noise and vibrato, taiko with noise clicks, metallic clashes, a rain bed, and a drone.
- **Whip pans** are snap changes of camera target, alternating left and right so they net to zero.
- **Start, end and captions.** The seal, the end card and the captions in brush-style Kaiti with an English subtitle. The English subtitles are italic small caps.

## How it's built
- **Pass 1** is a WebGL2 raymarch at up to 620 px tall (scene-resolution scaled down if frames run slowly). It writes ink density and a crisp flag. Figures are robed capsules with a straw hat on one of them. Bamboo is a domain-repeated grid with a lane kept clear, and the falling stalks are analytic.
- **Pass 2** runs at canvas resolution and does paper grain, bleed, edges, rain, splashes, the slash and the drop.
- **Audio** is WebAudio, scheduled bar by bar with node pruning. `SONG.render()` runs the same code offline for the audio check.
- **Camera, poses and hero stalks** are computed in JS and passed as uniforms. The clearance probe uses the same camera function.

## Checks run
- `budget.py`: pass. 23,758 bytes total, 7,097 music, no external references.
- `check.mjs e2e` (headless Chrome): click to first sound 0.0 s. No uncaught exceptions or console errors over 8 s of play. The shaders compiled, so WebGL2 works headless.
- `check.mjs audio` (offline render, 107 s): peak 0.782, 0 NaN samples. RMS per 4 bars: −26.4, −21.8, −16.6, −16.4, −17.5, −19.6, −30.1, −38.3, −43.1 dB. The levels follow the arrangement, from the standoff through the chase and the strike to the fade.
- `check.mjs clearance`: pass. 0 s inside geometry, closest approach 0.67 units (the ridge edge during the low shot at 16 s). The probe is a conservative union of boxes for both worlds (ridge, outer grove cells, hero stalks), so it doesn't model the exact stalk positions.

## Not verified
- **Visuals.** I did not look at the piece (no screenshots, per the brief). Silhouette legibility, the look of the ink, the slash, the splashes and the figure falls are all unchecked.
- **Sound.** I have not heard the mix. The peak and RMS numbers are measured, but balance, taiko weight, rain level and the flute are judgments I haven't tested.
- **Performance.** There is no frame-time measurement. The headless run used software WebGL, and the adaptive resolution (it steps the scene down when frames exceed about 45 ms for 45 frames) was not exercised.
- **Fonts.** The CJK captions depend on OS fonts. Kaiti is on macOS and Windows, and Linux falls back to Noto/serif. The rendering was not checked on any of them.
- **Browsers.** The piece needs WebGL2 and WebAudio. Without WebGL2, the shader setup throws and the page shows only the seal.
- **Choreography.** Figures can pass through the lane's bamboo (the lane is clear, but I didn't test the figures' paths for collisions with the fallen stalks).
