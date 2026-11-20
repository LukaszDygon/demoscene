# ＶＡＰＯＲ ＭＡＬＬ: a 64k vaporwave intro

The intro is **`dist/vapor-mall.opus-5.5-medium.html`**, a single self-contained file. Open it, then click or press Space/Enter on the title screen ("▶ 入店する · CLICK TO ENTER"). `python3 build.py` rebuilds `dist/` from `src/` and prints the sizes.

An FPV drone flies, low-poly and in RGB neon, through a 3 a.m. dream shopping mall. It goes in through racing gates, loops through the atrium, flies upside down past floating consumer goods, and ends in the breast pocket of a giant smiling man with heavily gelled hair. Inside the pocket is the neon desert where the flight began.

## Size
- **Total: 49,378 / 65,536 bytes (75%)**, raw and uncompressed. No packer is used (gzip would make it 20.8 KB), and the file makes no external requests.
- **Music: 9,494 / 16,384 bytes (58%)** as shipped (`dist/music.min.js`, which is `src/music.js` with comments and indentation stripped). It is inlined verbatim in its own `<script>`.
- The text uses OS fonts with fallback stacks: Hiragino, Yu or MS Mincho and Noto CJK for Japanese, plus Futura or Century Gothic and Snell Roundhand or Brush Script. The 3D shop signs are drawn into a 1024² canvas atlas at load.

## Timeline (80 BPM, 1 bar = 3 s, 48 bars = 2:24, plus a tape-stop tail)
| Bars | Time | Section (caption) | Picture | Music |
|---|---|---|---|---|
| title | – | ＶＡＰＯＲ ＭＡＬＬ · ようこそ · ヴェイパー・モール | The drone hovers over the neon grid desert in front of the pastel art-deco facade, with a striped sunset sun behind it | – |
| 0–4 | 0–12 s | 第一章 入口 *ENTRANCE* | Low FPV run through four neon racing gates and between palms, then through the door under the "Vapor Mall" sign | PA chime (D♭ F A♭ D♭), Rhodes and pad behind a lowpass that opens |
| 4–12 | 12–36 s | 第二章 吹き抜け *ATRIUM* | The drone banks around the fountain with its sunglasses-wearing Helios bust, weaves past the escalators, flies under the bridge, then **power-loops** up and back over it toward the skylight | Drums, octave city-pop bass, syncopated Rhodes comping; vibraphone from bar 8 |
| 12–20 | 36–60 s | 第三章 消費の夢 *CONSUME* | Past a floating soda can, sneaker, shopping bags, credit card, floppy disk, perfume and CRT TVs. A **360° barrel roll** (bar 14), then a U-turn along the upper galleries lined with shop signs (寿司, ゲームセンター, 美容室 HAIR GEL SALON…) | Muzak "sax" lead melody, A then B |
| 20–28 | 60–84 s | 第四章 夢遊病 *SLEEPWALK* | The camera **turns upside down** (bars 22.5–24.6), objects bob harder, fog turns pink, colour channels swap. It dives back under the bridge. At bar 26.2 **the mall's lights go out** and a silhouette shows through the archway against a striped sun | Drums drop, master lowpass at 1.7 kHz, tape wow triples, half-time beat and the lead an octave down. A noise swell into bar 28 |
| 28–31 | 84–93 s | 第五章 彼 *HIM* | **Spotlights slam on** with a flicker into the DREAM PLAZA rotunda: a giant man in a pink suit with shoulder pads, white trousers and a cyan shirt. The drone climbs from his shoes up to his face | Reverse chime and impact, full chorus with vocal chops |
| 31.3–34.3 | 94–103 s | (no caption) | **Face held head-on for 3 bars**: wide toothy grin, glossy gel pompadour with spikes and glints. "ニコッ" pops up, then at bar 32.5 he **winks** with sparkles and "キラッ☆" | Chorus continues, B melody |
| 35–39.5 | 105–118 s | 第六章 胸ポケット *POCKET* | The drone drops to chest height (face, smile, hand and pocket all in frame). His left hand rises from his hip (bars 36–37.5) and hooks the pocket's top corner. He looks down and **pulls the flap open 65°** (bars 37.7–39.2, "パカッ"), and a warm glow spills out and lights his hand | A section returns, then a riser |
| 39.5–41 | 118–123 s | – | **Dive into the pocket**: the pocket fills the frame, with chromatic aberration and a pink-white flash at bar 41 | Snare fill, then the tape drags (pitch about −25%) and catches up, a whoosh and a sub drop |
| 41–48 | 123–144 s | 第七章 ポケットの中 *INSIDE* → end card | Inside the pocket: high over the neon grid desert with a sky-sized Helios bust, dolphins arcing out of the grid and giant floating goods, gliding back toward the mall where it all began. End card from bar 43.5: ＶＡＰＯＲ ＭＡＬＬ · ありがとうございました · またのご来店を心よりお待ちしております | Chime, Rhodes and pad outro, **tape stop** at bar 46.9, fade to black |

## What I invented beyond the brief
- **FPV language:** racing gates on the plaza, banking that follows lateral acceleration, a barrel roll, a power loop, an inverted section, prop-vibration jitter and a barrel-distorted lens. A Japanese/VHS **OSD** shows ● REC, PLAY ▶, 高度 altitude and 速度 speed from the real camera path, a draining 電池 battery, a timecode and the date "1995年11月20日 午前3:14".
- **The pocket is a loop:** inside it is the desert in front of the mall, so the dream contains the mall that contains the dream.
- **Lights-out reveal:** the whole mall dims at bar 26 and the man appears only as a silhouette against the rotunda's striped sun, until the spotlights flicker on at bar 28.
- **Manga sound-effects** (ニコッ, キラッ☆, パカッ) projected from his 3D position onto the screen, plus the **wink** and the **gel glints** that twinkle on his hair tips.
- A Helios bust in pink shades on the fountain, vending machines, 16 neon shop signs drawn with OS fonts (including 美容室 HAIR GEL SALON), a department-store PA chime, a CRT showing colour bars and ようこそ, and a credit card reading "DREAM CARD".
- **Music:** FM Rhodes, octave slap-style bass, a muzak "sax" lead, a vibraphone counter-line, "aah" formant vocal chops, swung drums with gated-reverb snares, and tape hiss. One modulated delay on the whole mix carries the wow and flutter, and the same delay line produces the pocket-dive pitch drag and the final tape stop.

## Checks (run from this folder)
- `budget.py dist/vapor-mall.opus-5.5-medium.html --music dist/music.min.js`: total 49,378 / 65,536, music 9,494 / 16,384, no external references. **Pass.**
- `check.mjs e2e`: click → first sound **0.0 s**, **no errors**. A scratch variant that jumps through bars 0–47.5 and polls `gl.getError()` also reported no errors.
- `check.mjs audio src/music.js`: renders in 8.1 s, 147 s long, **peak 0.769**, **0 NaN**. RMS per 4 bars: −31.5 (filtered intro), −21.8, −21.8, −20.6, −20.6, −21.8 (dream), −20.4, −18.6 / −18.7 (chorus, the loudest), −19.1, −23.9, −32, −43.7 (tape stop).
- `check.mjs clearance` (`window.__probe` covers 136 boxes: shell, facade, gates, columns, palms, escalators, bridge, fountain, floating goods and the man's body): **0 s inside geometry**. The minimum distance is 1.5 m, at the deliberate entry into the pocket mouth at bar 41. Elsewhere the closest is about 2 m, flying past the giant soda can and a gallery column.
- **Character framing**, checked by projecting the face, smile, eye, hair, pocket and hand through the real camera in Node:
  - Face hold, bars 31.3–34.3: face centred, smile at NDC y ≈ −0.5, hair top +0.55, quiff tip +0.8, all in frame.
  - Pocket scene, bars 36–39: face (y +0.55 to +0.83), smile, pocket (≈0, −0.2) and hand (x +0.2 to +0.36) are all on screen.
  - He is drawn only from bar 26 and lit only from bar 28, with the key light at (0, 34, −60) in front of his face.

## Not verified
- **Nothing has been watched or heard.** No screenshots were taken, as instructed. Exposure, the bloom on the face, the legibility of the shop-sign kanji at distance and the overall mix are reasoned from the code and measurements only.
- Frame rate on real hardware: the build uses 4× MSAA in half-float, 8 point lights per fragment and a 4-pass bloom, capped at 1.5× DPR and 1920 px wide. It wasn't measured.
- Font fallback on Windows and Linux: the Japanese text needs a CJK font to be installed. Without one it falls back to the system default.
- Real-time audio under load: only the offline render was measured. The live scheduler uses the same code with 1.2 s of lookahead.
