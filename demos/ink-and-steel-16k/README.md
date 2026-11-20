# INK & STEEL (16k)

A wuxia rooftop duel in sumi-e ink wash. One WebGL2 fragment shader, synthesized WebAudio music, DOM captions and a seal stamp. The entry is `dist/ink-and-steel-16k.html`. Rebuild with `python3 build.py`, which also prints the size.

## Sizes

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | 13 114 bytes | 16 384 (3 270 to spare) |
| music source, inlined verbatim (`src/music.js`) | 3 845 bytes | 4 096 (251 to spare) |

## Timeline

72 BPM, 1 bar = 3.33 s, 20 bars = 66.7 s. The song tail runs to 70.7 s. Bars are counted from the click.

| bars | time | picture | music |
|---|---|---|---|
| 0–2.5 | 0–8 s | Blank paper. The click becomes a brush stroke across the frame. Far ridges bleed up out of the ink. Rain starts. Captions RAIN ON THE ROOF | Rain loop, sparse guzheng, first flute note |
| 2.5–5 | 8–16.7 s | Standoff on a temple roof in the rain. Two robed figures face each other, the right one in a straw hat. Only the robes, rain and mist move. Caption STILLNESS | Guzheng with silence in bar 4 |
| 5 | 16.7 s | First clash: an ink blot spreads across the frame. Whip cut into the chase | Clang and taiko |
| 5–7 | 16.7–23 s | Rooftop run (odd bars) alternating with the bamboo forest. Whip-pan cuts with motion smear on each bar. Clashes at 6.5 | 8th-note guzheng, taiko, flute melody |
| 7–11 | 23–36.7 s | Forest chase. Bamboo is cut at 7, 9 and 11, and the flecks scatter as ink. Clashes at 8 and 10 | Crack on each cut |
| 12–14.5 | 40–48.3 s | Pursuit closes in, with the figures drawing together. Silence before the strike | Sparser taiko |
| 14.5–15.6 | 48.3–52 s | Both leap, then freeze. Rain and robes keep moving | Silence, then a low guzheng on the freeze |
| 15.6 | 52 s | One horizontal ink slash crosses the screen | Swoosh and big taiko |
| 16–17 | 53.3–56.7 s | The left figure falls backward. A beat later the bamboo behind them topples to the right. A vermilion drop falls and lands with a red splash | Low pluck, cracks, high pluck on the landing |
| 17–20 | 56.7–66.7 s | Aftermath: the standing figure in the hat, rain and mist. Seal caption FIN at 18.6, end seal card, fade to paper | Sparse guzheng and flute, master fades out |

## What I invented beyond the brief

- The start screen is the seal stamp on blank paper, and the first click draws the brush stroke.
- Ink wash rendering: rough brush edges, a halo that bleeds into the paper, wet dark edges on the ridges, drifting mist, paper grain and stains.
- Clash blots spread with droplets. Bamboo flecks scatter from each cut.
- Four explicit bamboo stalks topple after the strike, with staggered timing.
- A vermilion drop that lands with a red splash, which is the only accent colour besides the seal.
- An end card with the seal and a fade to paper.
- Captions are short CJK lines with English subtitles. The CJK stack is Kaiti first, then Hiragino/Yu Mincho/Noto Serif. The English subtitles use Georgia.

## Checks

- `budget.py` against 16 384 total and 4 096 music: passed (13 114 and 3 845 bytes).
- `check.mjs audio`: no NaNs, peak 0.918, RMS per 4 bars from -30 dB (intro) to -25 dB (chase). Master gain was lowered from 0.5 to 0.3 to bring the peak under 0.95.
- `check.mjs e2e`: click to first sound 0.0 s, no exceptions or console errors. Shader compile and link errors would also show here, since they are logged with `console.error`.
- `check.mjs clearance`: not run. The camera does not fly through geometry. It is static, with cut-based whip pans.

## Not verified

- I have not seen the picture. Ink look, figure readability against the ink wash, bamboo toppling and caption legibility are judged from the code only.
- I have not heard the music. I only measured it. RMS is fairly low (about -25 to -30 dB) against peaks near 0.9, so the balance and loudness need a listen.
- Frame rate on a real GPU is untested. Whip-pan frames evaluate the shader three times, for about one bar in six of the chase.
- Only headless Chrome on macOS was tested. CJK glyph rendering on Windows and Linux is unchecked, and WebGL2 is required.
