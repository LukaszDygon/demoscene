# ONE SECOND: a frozen gunfight

Intro: **dist/one-second-64k.haiku-5.5-medium.html**, one self-contained file with no external requests. Click (or press Space/Enter) on the frozen frame, which says CLICK TO RESUME TIME. The click starts the audio clock, and everything else follows it.

Rebuild with python3 build.py. It inlines src/ into dist/ and prints the size.

## Size: below the requested range
- **Total: 30,306 / 65,536 bytes (46%)**, raw. The requested floor was 57,344, so this is **27 KB short**. I did not reach it, and I did not pad to reach it.
- **Music: 6,027 / 16,384 bytes (37%)**, inlined as written. The requested 9-14 KB is **about 3 KB short**.
- Comments are stripped from the shaders and main script at build time. Music is inlined without a minifier.

## Timeline (60 BPM, one bar = 4 s, 38 bars, runtime 150 s)
The piece is one second of real time. Motion runs at 1/147 speed until the snap at 147 s, so the timecode reaches 00:01.000 at the snap.

| Time | Shot | Picture |
|---|---|---|
| start | - | Frozen frame with the title, CLICK TO RESUME TIME |
| 0-8 | 01 Skylight | Camera rises through the shafts toward the shards |
| 8-16 | 02 Coffers | Looks up at the coffered ceiling and the chandelier |
| 16-24 | 03 Muzzle flash | Orbits the diving guard; flashes hang as blooms with red cores |
| 24-32 | 04 Robber | Low dolly on the mid-stride robber |
| 32-40 | 05 Dropped gun | Low view of the gun on the marble |
| 40-48 | 06 Banknotes | Among the fluttering notes |
| 48-56 | 07 Money bag | Bag on the floor |
| 56-64 | 08 Brass | Casings on the marble |
| 64-72 | 09 Cabinets | Filing cabinets along the left wall |
| 72-80 | 10 Teller | Crouched teller behind the counter, with the glass screen |
| 80-88 | 11 Plant and rope | Potted plant and velvet rope |
| 88-96 | 12 Vault | Vault ajar under the red alarm lamp |
| 96-104 | 13 Clock | Wall clock, second hand frozen at 12 |
| 104-112 | 14 Sconce | Wall sconce and safe-deposit boxes |
| 112-120 | 15 Chandelier | Chandelier and the surrendering standing guard |
| 120-128 | 16 Blood | Blood pool and droplets |
| 128-137 | 17 Lobby | Wide orbit |
| 137-147 | 18 Push | Slow push-in toward the snap |
| 147-148.5 | 19 Snap | Shards and banknotes fall, guns fire, white flash, cut to black |
| 148.5-150 | - | Black, then the end card |

Music: the Shepard tone is seven octave-spaced partials per voice, with a detuned pair each, wrapping every 12 s. Levels stay on a bell in log-frequency, so the wrap is inaudible. Heartbeat from 8 s, sequenced bass and drums in sections, a pentatonic pluck melody, a riser before the snap, and the hit at 147 s with silence from 149.2 s.

## What I added beyond the brief
- Volumetric skylight shafts with dust motes; muzzle smoke plumes; a red alarm halo.
- Marble veining with bullet holes and cracks, brass floor inlay, column fluting, bump-mapped walls.
- Reflections on the marble floor (single bounce).
- Props: coffered ceiling, safe-deposit wall, pendant lamps, desk and chairs, teller glass screen with mullions, banknote stacks, revolving door, plant, velvet rope, filing cabinets, money bag, dropped gun.
- Characters: diving guard, mid-stride robber, crouched teller, standing guard with hands up.
- Depth of field and bloom in the post pass.
- Shot captions, end card, timecode.

## Checks run
- budget.py: pass (30,306 / 65,536; music 6,027 / 16,384).
- check.mjs e2e: click to first sound 0.4 s, no exceptions or console errors.
- check.mjs audio: peak 0.879, no NaN, RMS rising from -34 to -23 dB through the piece.
- check.mjs clearance: 67 boxes, including every shard and banknote position. Min distance 0.4, 0 s inside geometry. Two camera paths were moved because they clipped a stanchion and a column.
- Headless numeric frame checks (no screenshots): both programs link, no GL errors, cut to black at 148.5 s.

## Not verified
- Not heard, not seen. Audio figures are measurements. Whether the Shepard wrap, the hit timing and the tick slowdown work is unjudged.
- Look is unjudged; exposure, DOF and red legibility need a real screen.
- Performance not measured on real hardware.
- The 8-bit fallback, other browsers and phone layouts are untested.
- The clearance boxes are approximations.
