# RUST CONVOY: a 64k desert film

Output: `dist/rust-convoy-64k.haiku-5.5-medium.html`, one self-contained file with no packer and no external requests. Click (or Space/Enter) on "CLICK TO IGNITE". Rebuild with `python3 build.py`, which writes the dist file and prints its size.

## Size
- Total: 28,389 / 65,536 bytes (43%), raw. gzip gives 11,346 bytes.
- Music: 9,325 / 16,384 bytes (57%), inlined verbatim from `src/music.js`.
- Target not met: the requested total was about 56 KB or more (57,344 minimum) and music 10 to 14 KB. The piece is about 28 KB and 9.3 KB. I did not pad to close the gap. Reaching it needs roughly 28 KB more scene code and 1 to 4 KB more music, which I have not written.

## Acts (96 BPM, 1 bar = 2.5 s, 60 bars, 153 s total)
| Bars | Time | Act | Picture | Music |
|---|---|---|---|---|
| 0–6 | 0–15 s | 1. Pre-dawn depot | Camera looks back at a fortress wall, gantry, flare stacks, flag and fuel tank. The rigs fuel at the forecourt. The tanker breaks out at 12–16 s | Depot pad, clanks, wind riser |
| 6–29 | 15–72.5 s | 2. Chase | The old chase beats (tanker alone, dust plume on the horizon with a look-back orbit cut, pack catches up, boarding with sparks and flamer nozzle, harpoon). Buggy crashes onto the dunes and rolls at 42–48 s; roof fight at 58–67 s | Chase drums, pulse bass, arpeggio, distorted riff |
| 29–37 | 72.5–92.5 s | 3. Sandstorm | Visibility collapses to about 8%. Headlights cut the murk, lightning flashes, and a rig emerges from the storm | Full mix muffled through a lowpass that sweeps down to 800 Hz; rumble and thunder |
| 37–47 | 92.5–117.5 s | 4. Ruined-city run | Car hulks and billboards repeat along the road. The overpass collapses at about 98 s; the tanker weaves around it | Breakbeat with bass pulse and a crash at bar 39 |
| 47–55 | 117.5–137.5 s | 5. Canyon jump and blast | Full-width canyon, hang silent at 123–127.5 s, landing and jackknife, fireball rising into the sunset | Silent hang; boom at 127.5 s |
| 55–60 | 137.5–153 s | 6. Epilogue | Night, stars, embers, the orbit cam around the burnt wreck, a survivor walks off, then the end card (fades in 143–149 s) | Lament: pad and bells |

## Vehicles and effects
- Five vehicles: a tanker with a jackknifing trailer, a spiked rig, a cage flamer with a nozzle flame, a rolling buggy, and a far rig.
- Terrain: salt crust from Voronoi crack lines, dune ridges, and strata on canyon walls.
- Volumetric dust with noise, smoke trail per vehicle, blast smoke and fireball, weld sparks, headlight cones, and embers.
- Lens flare: seven ghosts with coloured halos and a starburst. The flare is off at night.
- Camera: chase with side tracking and yaw swoops, orbit cut, crane on the blast, and an orbit around the wreck in the epilogue.

## Checks run (final build)
- `budget.py`: pass, 28,389 bytes, no external references.
- `check.mjs e2e`: click to first sound 0.0 s, no exceptions or console errors. The shader compiles in headless Chrome.
- `check.mjs audio`: offline render of 153 s, peak 0.934, no NaN. RMS per 4 bars follows the acts, with silence at the hang and a fade in the tail.
- `check.mjs clearance`: pass, 0 s inside. The probe covers the five vehicles (rebuilt at the sampled time), ground and canyon walls as terrain tiles, the depot wall, the overpass, and the city hulk cells. Closest approach 0.14 units, around 100 s near the overpass.

Fixes made along the way: the orbit blend passed through the tanker (now a hard cut); pursuers slid laterally inside camera depth (their lateral moves now lead the gap closing); the storm rig sat at the camera's lateral position (now offset to x=-6); and the canyon landing stalled before the arc end (the cruise speed now holds to 124 s, landing at 127.7 s).

## What isn't verified
- I haven't heard the music or seen the picture. Per the brief, no screenshots were taken, so balance, colour, flare strength, haze, lightning and motion are judged from the code and measurements.
- Frame rate on real GPUs and browsers is untested. Resolution scales down if frames run slow.
- The canyon is a heightfield, so its walls are steep slopes rather than true cliffs. The probe approximates them with tiles.
- The overpass collapse is a rotated slab with approximate probe boxes.
- The stencil title depends on the Arial Black / Impact fallback stack. I didn't check Windows or Linux.
