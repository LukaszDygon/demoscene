# ONE SECOND, 16k

A frozen bank-lobby gunfight. The piece covers one real second, stretched over about 72 s. Entry: `dist/one-second-16k.html`. Rebuild with `python3 build.py`, which prints the size.

## Sizes

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **12 247 bytes** | 16 384 (4 137 to spare, 75%) |
| music source (`src/music.js`, inlined verbatim) | **3 466 bytes** | 4 096 (85%) |

No external requests, fonts or packer. Graphics: one raymarched WebGL2 fragment shader, then a depth-of-field post pass. Text uses OS fonts. Sound: WebAudio, synthesised live, with the same code rendered offline for measurement.

## Timeline

Tempo 80 BPM, 4/4, 1 bar = 3 s, 24 bars. The frozen clock runs 0 to 69 s, so the timecode reads 00:00.000 to 00:01.000 over the frozen part.

| bars | time | picture | music |
|---|---|---|---|
| 1–4 | 0–12 s | Wide high dolly under the shattered skylight. Glass shards hang in two layers. Guard and robber are small in frame | Chord fades in over bars 1–2. Heartbeat starts. Ticks start |
| 5–8 | 12–24 s | Orbit down to the muzzle-flash blooms, with the guard mid-dive | Ticks slow down |
| 9–12 | 24–36 s | Low dolly across brass shells and fluttering banknotes to the masked robber, mid-stride | Chord keeps rising |
| 13–16 | 36–48 s | Vault door ajar under the red alarm beacon. Red light tints the marble | Chord only, ticks sparse |
| 17–20 | 48–60 s | Pull to the wall clock, whose second hand is frozen, then around to the guard | Ticks thinning |
| 21–23 | 60–69 s | Close on the blood droplets and the guard's face. Settle on a hero frame | Riser from 63 s. Ticks stop at 69 s |
| 24 | 69–72 s | **Signature moment.** Time resumes at full speed: shards fall, guns flash, the camera shakes. White flash at 71.2 s with the hit. Cut to black at 71.4 s | Heartbeat doubles. Hit at 71.2 s, then silence after about 73.6 s |

## What I invented beyond the brief

- **Motion clock:** everything moves at 1/100 speed while frozen. Time resuming is a change in speed, not a jump.
- **Glass:** two layers of shards with hash-jittered positions, slow spin, and fall after 69 s.
- **Banknotes and shells:** sparse hashed lattices. The notes flutter by tilting, and the shells are laid on the marble.
- **Wall clock and blood:** the clock is a real SDF with a frozen second hand. Four droplets hang near the guard.
- **Light:** a central skylight pool, shafts with sparse dust motes, and glow from the flashes that accumulates along each ray. The alarm tints the room red.
- **Depth of field:** the scene pass writes depth into alpha. The post pass blurs by distance from the centre pixel, which is the focus target.
- **Music:** a Cm chord (C3/G3/Eb4, each over three octaves) rising one octave over the piece. Gains follow a bell in log-frequency, so it fades at the top and bottom. This is Shepard-like, but it does not wrap, so it is not an endless Shepard tone. Lub-dub heartbeat. Ticks whose spacing grows 7% per tick. A saw riser. A hit with a sub boom and a noise crash.
- **Captions:** a small "ONE SECOND" tag top left, the "CLICK TO RESUME TIME" start screen, and the timecode.

## Checks

- **budget.py** (`--total 16384 --music src/music.js --music-max 4096`): pass. No external references.
- **check.mjs e2e**: click to first sound 0.0 s, no exceptions, no console errors.
- **check.mjs audio**: renders 76 s with 0 NaN samples and peak 0.864. RMS per 3 bars sits flat at about −22 dB through bars 1–21, then rises to −18 and −17 dB at the riser and hit.
- **Probe (scratch script, not in the folder)**: both shader programs link. Sampled frames at 5, 40, 62, 69 and 70.5 s render, with no GL errors. The flash at 71.3 s is bright, and frames are black from 71.6 s on, with no page exceptions.
- **clearance**: not run. The camera is in open air by keyframe design. The shards and banknotes are sparse and hashed, so a near pass is possible and unchecked.

## Not verified

- **How it looks.** I took no screenshots, per the brief. Exposure is unjudged (the probe's mean brightness is about 140/255 in the frozen frame, which may be high). The light is a single key from above with no shadows, so the depth cues rely on fake AO and the DOF pass.
- **Dust motes** are sampled along the ray on a grid, so they may sparkle or flicker.
- **Performance.** The march is 96 steps at up to 1024 px wide. It is untested on real GPUs.
- **Sound.** I measured the mix but did not listen. The chord's balance and the hit's level are unjudged.
- **Click handling** was tested only with CDP mouse events. Browsers other than Chrome are untested, and WebGL2 is required.
- **Timing of the snap** was checked by jumping the audio-derived clock in a headless page, not by playing the full 72 s.
