# TWISTER TAPE 16k

A found-footage storm chaser's camcorder tape from a 1950s plains town. The tornado takes the barn, water tower, silo, pickup and white church, then the tape glitches, the sky clears and a lone radio in the debris plays a ballad. The tape ends on blue.

Entry: `dist/twister-tape-16k.haiku-5.5-medium.html`. Rebuild with `python3 build.py`, which also prints the size.

## Sizes

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **12 067 bytes** (74%) | 16 384 |
| soundtrack (`src/music.js`, inlined verbatim) | **4 070 bytes** (99%) | 4 096 |

Shader, main script and markup make up the other ~8 000 bytes. Gzip is 5 772 bytes, shown for information only.

## Timeline

100 BPM, 4/4, 1 bar = 2.4 s. Bar numbers are 1-based. The picture ends at 76.8 s and the music tail runs to about 79.8 s.

| bars | time | picture | sound |
|---|---|---|---|
| 1–4 | 0–9.6 s | Calm wide field, camera walking forward. A dark wall cloud sits on the horizon in the storm's bearing. Barn, silo, water tower and church are small silhouettes. REC and date OSD. | Quiet wind bed. Distant thunder at bar 4. |
| 5–8 | 9.6–19.2 s | Wind and handheld shake grow. The camera yaws towards the storm. The sky darkens and lightning flickers. | Hail on the 16ths from bar 5. Siren from bar 6. Wind on the mic clips. |
| 9 | 19.2–21.6 s | **Touchdown** at the horizon. The funnel grows over about 4 s. | Big thunder and a sub rumble. |
| 10–16 | 21.6–38.4 s | Chase. The camera runs and sways forward. The tornado moves towards the camera. The pickup, barn, silo, tower and church are sucked up in that order (22, 26, 28, 31, 34 s) and orbit the funnel. Debris streaks fly past the lens. | Siren, rumble, metallic debris clatter. |
| 17 | 38.4–40.6 s | **Camera knocked over.** The roll ramps to 90 degrees. | Low boom on the first beat of bar 17, then a wind howl through bar 18. |
| 19–20 | 43.2–48 s | **Tape glitch.** "TRACKING" OSD, row jitter, colour split. The camera cuts back upright at 43.2 s and the funnel dissolves. | Granular stutter of noise bursts. |
| 21–26 | 48–62.4 s | **Aftermath.** Empty field, the cloud deck thins and sunbeams break through. | Wind decays to nothing. No music. |
| 27–32 | 62.4–76.8 s | Same field, sunlit. The cloud fades to blue from 72 s and the screen is blue from 75 s. | **Lone radio ballad**, C – Am – F – G – Am – C, through a radio band-pass with hiss and tape flutter. |

## What I invented beyond the brief

- **Start screen:** a blinking `PLAY ▶` over blue, and the first click starts the audio. The overlay is HTML over the canvas.
- **Building rig:** each object has its own lift time. They are sucked up and orbit the funnel, and climb out of view.
- **Dark funnel:** volumetric, with swirling arms and debris dust inside the cylinder.
- **Camera:** it tracks the storm with yaw. Handheld shake grows with the storm, and exposure drifts and dips on lightning.
- **Tape:** head-switching noise at the bottom, chroma desaturation with highlight bleed, scanlines, grain and rain speckles. The glitch adds a colour split.
- **Radio:** a radio lies in the field after the storm.
- **Sound:** a sub rumble under the storm, and a delay with flutter in the ballad bus.
- **OSD:** a live timecode and a bottom-right date stamp.

## Checks

- **`budget.py`:** passes. Total 12 067 / 16 384 bytes, music 4 070 / 4 096 bytes, no external references.
- **`check.mjs e2e` (headless Chrome):** click to first sound 0.0 s, no uncaught exceptions and no console errors. This includes the shader compile.
- **`check.mjs audio` (offline render):** no NaN samples, peak 0.78. RMS per 4 bars: −26.3, −18.1, −15.2, −14.4, −17.3, −30.8, −29.4, −27.4 dB, then −71 dB in the tail. The storm is loudest, the aftermath is quiet and the radio sits at −27 to −29 dB.
- **Extra probe (not one of the skill scripts):** a scratch-copy headless run rendered frames at 12 times from −1 s to 76 s. The shader linked with no GL errors. Every frame had non-trivial content, and the start and end frames were blue. I did not save or view images.
- **`check.mjs clearance`:** not run. No `__probe` is defined because the camera never enters geometry. Its highest point is z ≈ 40, and the nearest lifted object orbits at z ≈ 55 or further.

## Not verified

- **Look and sound:** I have not seen or heard the piece. Everything above comes from code reading, headless frame statistics and offline audio measurement.
- **Performance:** not measured on real GPUs. Each pixel runs up to 100 march steps, a funnel integral of 20 samples, and up to three scene evaluations in glitch frames. The canvas is capped at 1024 px wide. Heavy on weak GPUs.
- **Visual gaps versus the brief:** no mud on the lens, and no autofocus hunting or depth of field. Chroma bleed is approximated by desaturation and highlight tint, not a true horizontal blur. Lightning is random and not synced to thunder.
- **Audio:** the ballad balance against the wind is untested by ear. The soundtrack sits at 4 070 of 4 096 bytes, so there is little room for changes.
- **Browsers:** tested in headless Chrome on macOS only. Needs WebGL2 and WebAudio. Font fallback for the OSD is not checked on Windows or Linux.
- **Other:** the other 64k variant was not read or touched.

## Files

- `src/music.js`: the soundtrack. `SONG.live()` plays it and `SONG.render()` renders it offline.
- `src/intro.frag`: the fragment shader, with the storm, the camera timeline and the VHS post pass.
- `src/main.js`: the WebGL bootstrap, the start screen and the OSD.
- `src/index.html`: the HTML shell and the OSD styles.
- `build.py`: builds `dist/twister-tape-16k.haiku-5.5-medium.html`.
