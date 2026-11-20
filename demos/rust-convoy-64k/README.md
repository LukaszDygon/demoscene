# RUST CONVOY: a 64k desert chase

The intro is **`dist/rust-convoy-64k.html`**, one self-contained file with no packer and no external requests. Open it and click (or press Space/Enter) on "CLICK TO IGNITE". Rebuild with `python3 build.py`, which writes the dist file and prints its size.

## Size
- **Total: 22,034 / 65,536 bytes (34%)**, raw. gzip would give 9,618 bytes.
- **Music: 8,450 / 16,384 bytes (52%)**, inlined verbatim from `src/music.js`.

## Timeline (96 BPM, 1 bar = 2.5 s, 42 bars ≈ 105 s, tail to 108 s)
| Bars | Time | Beat | Picture | Music |
|---|---|---|---|---|
| 0–4 | 0–10 s | 1. Tanker alone | Low chase cam behind the tanker, road ahead, dust from its wheels | Engine drone; tribal drums enter at bar 2 |
| 4–8 | 10–20 s | 2. Dust plume | Camera swoops to look back; pursuers appear as dust columns on the horizon | Shaker hiss, steady drums |
| 8–14 | 20–35 s | 3. Pack catches up | Camera still looking back; the pack closes and overtakes the lens | Full drums, pulsing bass that follows the speed |
| 14–20 | 35–50 s | 4. Boarding, sparks | Pursuers alongside, sparks on the tanker's flank | Distorted lead riff; metallic clanks on odd bars |
| 20–23 | 50–57.5 s | 5. Harpoon | Harpoon line runs from a pursuer to the tanker, tension holds | Tom roll and riser, sustained lead |
| 23–27 | 57.5–67.5 s | 6. Canyon jump | Tanker arcs over the canyon; slow-motion hang near 63–67 s | **Silent from 63 s to 67.5 s (bars 25.2–27)** |
| 27–31 | 67.5–77.5 s | 7. Jackknife and blast | Trailer swings, fireball rises into the low sun | Boom and crash on bar 27 slams back in |
| 31–42 | 77.5–105 s | 8. End card through dust | Dust thickens, camera rises, sun sinks; "THE SALT KEEPS THE FIRE" fades in at 89–97 s | Drone fades; a Dm9 pad and bells |

## What I invented beyond the brief
- Three pursuers with roles: a harpooner, a boarder and a trailing rig.
- A full-width canyon across the road. A time warp slows the convoy through the hang, and the vehicles jump the canyon on a z-based arc.
- The horizon dust plumes are dust sources that scale with distance.
- Chase-camera swoops: yaw, lateral tracking and a shake during the hang and blast.
- Heat haze in the ray direction, lens ghosts from the sun, and an orange/teal grade with grain and vignette.
- The drone pitch follows the tanker's speed. The speed profile and the warp are shared by the music and the visuals.
- Jackknife on the trailer, exhaust flames and weld sparks.
- The stencil title, a blinking "CLICK TO IGNITE", and the end card text.

## Checks run
- `budget.py`: pass. Total 22,034 bytes, music 8,450 bytes, no external references.
- `check.mjs e2e`: click to first sound 0.0 s, no exceptions and no console errors. The shader compiles in headless Chrome.
- `check.mjs audio`: offline render of 108 s, peak 0.917, no NaN samples. RMS per 4 bars runs from about -19 dB down to -36 dB in the tail, so the levels follow the arrangement.
- `check.mjs clearance`: the probe is a getter that rebuilds the vehicle boxes at the sampled time. Minimum camera distance to a vehicle is 0.16 units, with 0 s inside. I found and fixed an overlap during boarding and the jump by pulling the camera back to 12 units and narrowing its lateral swing there.

## What isn't verified
- **I haven't heard the music or seen the picture.** Per the brief I took no screenshots, so every judgement about balance, colour, flare intensity, haze and motion is reasoned from the code and the measurements.
- The clearance probe covers the vehicles only. The ground is not probed. The camera stays at least 0.8 units above flat salt, and the dunes sit more than 14 units from the road, so the camera should never reach them, but I didn't measure this.
- The canyon walls are a steep heightfield slope, not a true cliff. The camera passes over it during the hang, so the edge may look soft.
- Frame rate on real GPUs and browsers is untested. The resolution scales down if frames run slow.
- The stencil title depends on the Arial Black / Impact fallback stack, which I didn't check on Windows or Linux.
