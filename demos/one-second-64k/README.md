# ONE SECOND: a frozen gunfight

Intro: **`dist/one-second-64k.html`**, one self-contained file with no external requests. Open it and click (or press Space/Enter) on the frozen frame, which says "CLICK TO RESUME TIME". The click starts the audio clock, and everything else follows it.

Rebuild with `python3 build.py`. It inlines `src/` into `dist/` and prints the size.

## Size
- **Total: 19,773 / 65,536 bytes (30%)**, raw and uncompressed. No packer (gzip would be 8,721).
- **Music: 4,501 / 16,384 bytes (27%)**, inlined verbatim from `src/music.js`.

## Timeline (60 BPM, one bar = 4 s, 25 bars, about 100 s)
The whole piece is one second of real time. Motion runs at 1/100 speed (S = T/100) until the snap at T = 97 s. The timecode counts 00:00.000 to 00:01.000 over the same stretch.

| Bars | Time | Picture | Music |
|---|---|---|---|
| start | - | The frozen frame: the skylight shards, the guard, the robber, with "CLICK TO RESUME TIME" | silence |
| 0-4 | 0-16 s | **A. Skylight.** The camera rises from the floor up through the shafts toward the shards. The timecode starts at 00:00.000 | The Shepard chord fades in over 8 s. Ticks begin at 0.5 s intervals |
| 4-8 | 16-32 s | **B. Muzzle flashes.** The camera orbits the diving guard. The flashes hang as blooms with red cores, and banknotes flutter | Heartbeat from 8 s at a soft level |
| 8-11 | 32-44 s | **C. Robber.** A low camera dolly on the mid-stride robber, with its flash | Heartbeat deepens |
| 11-14 | 44-56 s | **D. Brass.** Casings on the marble, camera near the floor | Ticks slow down |
| 14-18 | 56-72 s | **E. Vault.** The camera flies over the robber's flash to the vault, ajar under the red alarm lamp | Heartbeat at a louder level from 32 s |
| 18-21 | 72-84 s | **F. Clock.** A close view of the wall clock with its second hand frozen at 12 | Heartbeat louder |
| 21-24 | 84-96 s | **G. Wide orbit.** The whole lobby, with banknotes and blood droplets in the air | Heartbeat at full level. The heartbeat stops at 96 s |
| 24-25 | 96-100 s | **H. Snap.** At 97 s time returns to full speed. The shards and banknotes fall, the guns fire harder, a white flash decays, and the picture cuts to black at 98.5 s | The massive hit at 97 s: a sub drop, a noise boom, a crash and three gunshot pops. The chord runs until 99.2 s, then silence |

## What I invented beyond the brief
- **Rendering.** A single raymarched SDF scene, not meshes. It has volumetric skylight shafts with dust motes, bloom-like halos around the muzzles, and a few wisps of smoke that move at the same frozen speed.
- **Depth of field.** Depth is written to the alpha channel, and a 20-tap disc blur follows the distance from each shot's focus plane. Film grain is static, because the frame is frozen.
- **Red.** The alarm lamp casts red light and a red halo. It pulses with the heartbeat. Blood droplets and the flash cores are the other red elements.
- **Shepard strings.** Three voices of six octave-spaced sawtooth partials, through a lowpass. Each partial glides up one octave over 97 s, and its level follows a bell in log-frequency. Built once and automated, so it works live and offline.
- **Ticks** that slow exponentially (interval 0.5 s, growing to about 4 s), a generated reverb, and a hard cut to silence at 99.2 s.
- **Debris scatter** is seeded, so every run shows the same frame. Falling debris lands on the floor instead of passing through it.
- **Adaptive resolution.** The render drops resolution if frames run slow. It also falls back to 8-bit targets when half-float is not available.
- **Clearance probe.** `window.__probe` checks the camera path against rough boxes for the set.

## Checks run
- `budget.py` (total 65,536; music 16,384): **pass**.
- `check.mjs e2e`: **click to first sound 0.0 s**, no uncaught exceptions or console errors.
- `check.mjs audio src/music.js`: offline render of 102 s, **peak 0.906**, **0 NaN samples**. RMS per 4 bars runs −30.1, −27.2, −23.8, −23.8, −22.9, −22.2, −21.4 dB. The levels rise through the piece as the heartbeat and the chord build.
- `check.mjs clearance`: the camera never enters geometry (**min distance 1.0**, 0 s inside).
- Headless numeric frame checks, without screenshots. Both shader programs link with no GL errors. The white flash rises at 97.2 s, the frame is fully black at 98.6 s, and red appears in the vault and clock shots.

## What isn't verified
- **I have not heard the piece or seen it in motion.** The audio numbers are measurements, not listening. Whether the Shepard illusion holds, whether the hit lands with the snap, and whether the ticks read as slowing are all unjudged.
- **The look is unjudged.** I checked the frames numerically, not by eye. The exposure, the DOF strength, the shaft and flash brightness, and how readable the red alarm is all need a look on a real screen.
- **Performance is unmeasured on real hardware.** The headless run used software rendering, so frame times mean nothing. The adaptive resolution is the only safeguard.
- **Untested paths.** The 8-bit fallback (no `EXT_color_buffer_float`), other browsers, and phone layouts are not checked.
- **The clearance boxes are rough approximations** of the set, not the real meshes.
