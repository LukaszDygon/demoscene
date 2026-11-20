# KAIJU 16k

A neon wireframe city at night, with an actual monster in it. The camera dives off the rooftops, races low down a neon avenue, glimpses a giant creature down a side boulevard, and runs a tunnel under a megastructure. It exits into a plaza where the kaiju stands fully lit. The kaiju roars and breathes a beam into the sky, and buildings flicker in its shockwave. It then turns and breathes into a huge holographic KAIJU logo, which glitches under the beam. Everything is one raymarched fragment shader. The soundtrack is 120 BPM synthwave synthesized with WebAudio.

Entry: `dist/kaiju-16k.opus-5.5-medium.html`. Rebuild with `python3 build.py`, which prints both sizes.

## Sizes against budget

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **16 106 bytes** (98%) | 16 384 (278 to spare) |
| music source (`src/music.js`, inlined verbatim) | **3 973 bytes** (97%) | 4 096 (123 to spare) |

`build.py` minifies only the shader (comments and whitespace removed, `vec3`/`vec2`/`float` aliased by `#define`) and `main.js` (comment lines and indentation removed). It strips the trailing newline from `music.js` and otherwise leaves it untouched. The piece is 30 bars at 120 BPM (60 s), plus a 5 s tail.

## Timeline (120 BPM, 1 bar = 2 s)

| bars | time | picture | kaiju | music |
|---|---|---|---|---|
| title | before click | Moving rooftop view under the KAIJU / カイジュウ title | A tiny dark silhouette on the horizon (about 34x44 px), slightly brighter than the sky behind it | silent |
| 0–1 | 0–4 s | Crane shot over the rooftops in magenta haze | Silhouette in fog, walking (footstep booms) | pad, footstep booms on bars 0 and 2 |
| 2–3 | 4–8 s | Camera dives into the avenue and races between the towers. Katakana billboards, neon edges, wet reflective street | Out of sight behind the towers | arp enters |
| 4–7 | 8–16 s | Racing down the avenue. At bar 6 the camera yaws right down a wide boulevard and holds | **Glimpse:** walking in profile between towers, spine plates glowing cyan, eyes orange, the body kept dark. It fills about 9% of the frame | kick and bass at bar 4, boom every bar, a growl at bar 6 beat 3 |
| 7–8 | 15–17 s | Whip pan forward, past the キケン カイジュウ注意 banner, into the tunnel | — | |
| 8–11 | 16–24 s | Tunnel with ceiling light strobes and cyan and magenta wall strips. A boom at bar 10 flickers the lights | Legs and lower body seen through the tunnel exit (about 1% of the frame) | bass filter opens, riser from bar 10, snare roll in bar 11 |
| 12–15 | 24–32 s | **Reveal.** Exit into the plaza. Two searchlights snap on and the camera rises toward the head | Lit for silhouette: a dim key light, magenta under-light, a tight cyan rim, spine glow ramping up. A near-black shape against bright haze (luminance 38 against 134), with the moon behind the head | **drop:** crash, boom, drums, lead |
| 16–17 | 32–36 s | **Roar.** Camera low at the kaiju's feet, looking up. Shake, flash, breath beam over the camera into the sky. A shockwave ring crosses the ground, and windows and billboards flicker and glitch | Head raised, jaws open, spines pulsing, mouth glowing | drums drop out, a 4 s roar (detuned saws with growl FM and swept band-passed noise) |
| 18–23 | 36–48 s | Orbit to the left-hand profile | Idles, tail swaying, then walks forward 6 units (bars 20–23, one step per bar) | full arrangement, footstep booms on bars 20–23 |
| 24–25 | 48–52 s | The holographic KAIJU / カイジュウ logo flickers on. The camera moves to the final position low at the plaza edge | Turns 90° to face the logo | breakdown: pad, arp, bass |
| 26–28 | 52–58 s | **Final shot**, looking up at the huge logo | Second roar; the breath beam hits the logo, which glitches (row tears, RGB split) | crash, roar, full arrangement |
| 29 | 58–60 s | Hold, then fade to black over 61.5–64 s. "click to replay" | Head still raised toward the logo, spines glowing | last boom, pad |

## What I invented beyond the brief

- **Build-up in three stages:** a silhouette on the horizon from the rooftops, a profile glimpse down a side boulevard, then legs seen through the tunnel exit. The creature walks (alternating leg lifts) during the build-up, and every footstep is a boom with camera shake.
- **How it reads at night:** the body is a near-black silhouette against a bright magenta city-glow haze. Kaiju pixels get only 12% of the haze, spine halo and searchlight glow that the rest of the scene gets, which keeps the silhouette crisp. A tight cyan rim (fresnel to the 8th power), glowing dorsal plates, orange eyes and a magenta under-light from the street outline it. A moon sits behind the head in the reveal shot. Every shot it appears in measures at least 2:1 against what's directly behind it (see the probe below).
- **The creature:** an SDF built from round cones: legs, torso, small arms, a three-segment swaying tail, neck, skull, snout, a hinged lower jaw, horns and two rows of hashed triangular dorsal plates. It is 34 units tall, against towers of 6–22 (up to 28.6 with setbacks).
- **Searchlights** that snap on at the reveal and track the kaiju.
- **How the buildings react:** a shockwave ring, windows flickering out, billboards glitching and tunnel lights flickering on footsteps.
- **Signs:** a キケン カイジュウ注意 ("danger: kaiju") banner over the tunnel mouth, vertical katakana billboards (ネオン, カラオケ, ラーメン, …) and a Tron grid in the plaza.
- **Wet street:** a single reflection bounce off the ground.
- **The logo** gets breathed on: it glitches only while the beam hits it.

## Checks

- `budget.py --total 16384 --music src/music.js --music-max 4096`: **pass**. 16 106 / 16 384 and 3 973 / 4 096. No external references.
- `check.mjs e2e`: click to first sound **0.0 s**, **no errors** (shader compile errors would show up here, since `main.js` sends them to `console.error`).
- `check.mjs audio src/music.js`: renders in 2.8 s, 65 s long, peak **0.832**, **0 NaN samples**. RMS per 4 bars: −21.1 (intro), −15.8, −18.1 (tunnel), −17.0, −17.1 (roar and full), −15.9, −18.2 (logo breakdown, then roar 2), −19.5 (ending), then −120 for the tail.
- `check.mjs clearance` (`__probe` boxes are conservative: every tower at its largest possible size, plus the tunnel walls and roof and a kaiju core box): **0 s inside geometry**, min distance **0.77**. The closest moments are t = 0.5 s (skimming the rooftops) and t = 55.7 s (the final camera beside a corner tower).
- **Visibility probe** (a scratch script in the scratchpad, not in the repo). It renders chosen times headless and builds a mask of pixels where the primary ray hits the kaiju, then compares their mean luminance with a 12 px ring of background around them. This produced numbers only, no images.

  | t (s) | 13.5 | 15 | 23 | 24.5 | 27 | 30 | 33.5 | 35 | 40 | 42 | 45 | 50 | 54 | 58 | 62 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
  | kaiju share of frame | 8.7% | 8.9% | 1% | 3.4% | 5.2% | 7.1% | 6.1% | 5.9% | 9.8% | 15.2% | 14.7% | 11% | 11.4% | 10.6% | 10.5% |
  | kaiju / ring luminance | 30/77 | 30/80 | 31/85 | 38/134 | 47/113 | 42/103 | 62/134 | 61/136 | 41/86 | 39/85 | 42/94 | 39/98 | 54/129 | 43/112 | 39/108 |
  | ratio | 2.6 | 2.7 | 2.7 | 3.5 | 2.4 | 2.5 | 2.2 | 2.2 | 2.1 | 2.2 | 2.2 | 2.5 | 2.4 | 2.6 | 2.8 |

  The ratio is between 2.1 and 3.5 in every shot after the opening. The exception is the opening horizon hint at t = 0–3 s, where the kaiju is 0.1% of the frame or less: there the body is about 1.5–1.9:1 darker than the sky (48 against 82 at t = 2), and its glowing plates come out roughly level with the sky on average. The earlier version measured as low as 1.15:1 in the close side-view shots.

  Spine-plate pixels are visible in the glimpse, the profile and the final shot. With the logo on (t ≥ 50) it covers 13–18% of the frame (upper middle), and the kaiju sits at lower right.

## Not verified

- **How it looks in motion.** I took no screenshots, as asked. Composition was reasoned from the shader maths and the luminance probe above, not seen. The ratios are mean luminance, so the body reads as a dark silhouette. Surface detail inside the silhouette is deliberately subdued.
- **How it sounds.** Measured, not heard. Check the roar timbre and the balance between the boom and the kick.
- **Frame rate.** It renders at 960x540 with up to 120 primary steps plus a 50-step reflection on street pixels. The canvas drops resolution if frames average over 50 ms, but real-GPU speed is untested.
- **Fonts.** Katakana and the logo are rasterized from system fonts (Hiragino, Yu Gothic, Meiryo, Noto CJK; Arial Black or Impact). They are unchecked on Windows and Linux.
- **Most of the timeline.** e2e only exercises the first 8 s on the real audio clock. Later moments were rendered only at fixed times in the probe.
- **Camera shake** (at most about 0.17 units) is not part of `__probe`. That is within the 0.77 margin.
