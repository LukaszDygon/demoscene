**KAIJU 16k** is built and fits both budgets. The entry is `~/demos/kaiju16k/dist/kaiju16k.html`.

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **16 233 bytes** | 16 384 (151 to spare) |
| soundtrack code (`src/music.js`, shipped verbatim) | **4 060 bytes** | 4 096 |

It's one self-contained file. It makes no external requests, embeds no fonts and uses no packer. Graphics are one raymarched WebGL2 fragment shader plus a bloom/CRT post pass. The music is synthesized live with WebAudio. Rebuild with `python3 build.py`.

## Timeline (120 BPM, 1 bar = 2 s, 30 bars)
| bars | time | picture | music |
|---|---|---|---|
| 1–4 | 0–8 s | High establishing shot over the neon grid city, caption ネオ・トーキョー | Pads + 16th arp with the filter opening, noise riser |
| 5–12 | 8–24 s | Camera dives into the avenue and races at about 2.6 m between towers. Katakana billboards on every face, wet-street reflections, light-trail traffic | Kick, octave-pumping bass, hats (snare from bar 9), sidechain pump |
| 13–16 | 24–32 s | Tunnel through a megablock: chasing neon rings and katakana wall signs, all flashing on the kick | 16th bass, 4-bar riser, snare roll into the drop |
| 17–24 | 32–48 s | Out of the tunnel and weaving higher. Captions ナニカ ガ メザメタ ("something woke up") and ミアゲロ ("look up") | Drop: saw lead melody with vibrato and dotted-8th delay, 16th hats |
| 25–28 | 48–56 s | The hologram switches on with flicker, a top-down scan-in and glitch bands, and is first seen between towers. The camera brakes and tilts up while the HUD blinks カイジュウ ケイホウ | Full arrangement + crash |
| 29–30 | 56–60 s | Hold looking up at the giant KAIJU / カイジュウ hologram on its emitter spire, framed by towers. End card アリガトウ, fade from 60 s | Final A-minor chord, kick and crash ring out |

## What I added beyond the brief
- **The start screen is part of the piece.** It shows a dimmed live city behind CRT scanlines and a flickering ▶ ジャック・イン / CLICK TO JACK IN.
- **The logo has more than one layer.** There are 3 parallax layers, chromatic split that pulses on the kick, scanlines, a sweeping scan bar, glitch row offsets and a mip-blur halo. It tilts toward the viewer so it reads from street level. It stays hidden until 46 s, so it doesn't appear early.
- **A synthwave striped sun sits at the end of the avenue.** It moves in the city's vanishing point and is still visible under the logo in the final shot.
- **A cockpit HUD** shows altitude, speed and the bar counter.
- **More katakana:** a giant トーキョー sign over the tunnel mouth, and a kanji/katakana sub-line under the logo (怪獣 · デモパーティ · 16K).
- **Captions are short Japanese/English lines** that hint at the reveal instead of naming each scene.
- **The music:** Am–F–C–G, with a pumping sidechain on pad, bass and arp, a gated-reverb-style snare, a dotted-8th delay and a convolution reverb.

## Assumptions
- **Byte count:** "under 16384" means raw bytes of the HTML file, with no compression or packer.
- **The 4096-byte music limit** applies to the soundtrack source as it appears inside the HTML. It is copied in byte for byte.
- **Fonts:** katakana come from the OS fonts (Hiragino on macOS, Yu Gothic/Meiryo on Windows, Noto CJK on Linux). On a Linux box without a CJK font the signs would show as fallback glyphs.
- **Logo font:** KAIJU uses Impact or Arial Black.
- **Party machine:** I targeted a reasonably modern GPU. The scene renders at up to 1280 px wide and is upscaled to the screen.
- **Folder:** I created the requested folder.

## Checks
- **Size:** `budget.py` reports both budgets OK and finds no external references.
- **Start and errors:** the headless click test gives click → first sound in 0.0 s with no exceptions or console errors.
- **Audio (offline render):** peak 0.62, no NaNs. RMS per 2 bars climbs from −28 dB (intro) to −21 dB (main part) to −19.7 dB (drop), then falls to −23.5 dB and −38 dB at the end.
- **Camera path:** a dev build with a camera probe (`dist/dev.html`) passed: the camera is never inside the tunnel walls, the spire or the street walls. Closest pass is 0.81 units. The probe models buildings as solid walls 2.2 units each side of the avenue centre, which is their closest possible position. The shipped file leaves the probe out to save bytes.

## Not verified
- **The sound itself:** I haven't heard it, only measured it. Please listen for mix balance, especially lead against pad in the drop and how loud the snare roll is.
- **Smoothness and frame rate:** stills don't show these. Real-time speed on the party machine is untested, as the screenshots ran headless. If it drops frames, lower the `1280` in `main.js`'s resize function.
- **Other platforms:** I only checked Chrome on macOS, so Windows and Linux font rendering are unchecked.

## Files
- `src/music.js`: the soundtrack. `SONG.live()` plays it in the browser and `SONG.render()` renders it offline for measuring.
- `src/scene.frag`, `src/post.frag`: the shaders.
- `src/main.js`, `src/index.html`: camera path, sign textures, captions and HUD.
- `build.py` → `dist/kaiju16k.html` (the entry) and `dist/dev.html` (dev build with the camera probe).
