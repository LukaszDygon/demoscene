# SILENT FLEET: a 64k intro, battle in orbit

The intro is **`dist/silent-fleet-64k.haiku-5.5-medium.html`**, one self-contained file with no external requests. Open it and touch the glass (or press Space/Enter) to board pod 7. Sound starts on the click. Rebuild with `python3 build.py`, which also prints the size.

## Size
- **Total: 29,130 / 65,536 bytes (44%)**, raw and uncompressed (gzip 11.8 KB). No packer.
- **Music: 7,148 / 16,384 bytes (44%)**, inlined verbatim from `src/music.js`.
- **Below the 57,344-byte target.** This build is about 28 KB short of the floor. Reaching it would mean writing a lot more content, and I did not pad to get there. The bytes that were added are real code and data.

## Timeline (72 BPM, 1 bar = 3.33 s, 30 bars = 100 s)

| Bars | Time | Picture | Caption (typed out) | Music |
|---|---|---|---|---|
| title | before click | Frame holds at t=0, gas giant at the right edge | SILENT FLEET · battle in orbit | none |
| 0–4 | 0–13 s | Pod drifts, roll and weightless drift, planet rising | POD 7. HULL INTACT. | Drone fades in, breath once per bar |
| 4–9 | 13–30 s | Fleet at range. Silent flash at 18 s | NO RESPONSE ON ANY CHANNEL | Beacon pings from bar 4 |
| 9–14 | 30–46 s | **Carrier 3 splits at 34 s**, backlit against the planet. Blast at 44 s | CARRIER 3 SEVERED. BOTH HALVES DRIFTING. | Choir enters at bar 9. Whisper formants |
| 14–18 | 46–60 s | Shock rings at 48 s and 55 s. Carrier 2 splits at 57 s. O2 readout from 40 s, frost from 40 s | O2 RESERVE: 61 MIN (50–58 s) | Bell melody, choir swells |
| 18–23 | 60–77 s | Venting fire from carrier 1 (60–74 s). Frigate blasts at 66 s and 74 s. Hand on the glass 61–75 s. Debris and panels tumble | BEACON 7 SENT. NO ANSWER. | Pings slow, lead line from bar 17 |
| 23–27 | 77–90 s | Descent. Planet grows, rings, moon. Heartbeat kick from bar 22 | ENTRY IN 14 s. HEAT SHIELD UNKNOWN. | Choir drops out, drone opens |
| 27–29 | 90–97 s | Plasma from 84 s, view shakes. Roar begins at 90 s | ATMOSPHERE CONTACT. | **Roar of fire**, breath and pings stop |
| 29–30 | 97–100 s | White-out 94.5–97.6 s, then end card | (none) | Roar fades, then silence |

## What's in the build
- **Ships:** five SDF ships in three hull classes. Carrier A has greebles, four engine bells, two turrets and a bridge. Frigate B has a sensor dish and a fin. Tanker C has frame rings and tank spheres. Ships 0 and 2 split. Engine plumes glow cold blue.
- **Debris:** five tumbling types per cell (boxes, struts, escape pods, tanks, panels). The field is thinned near the origin.
- **Planet:** banded atmosphere with two storms, cloud grain, aurora rim, a ring system with a gap, and two moons (one cratered).
- **Blasts:** fireball, white flash, shock ring and six fragments each, all silent.
- **Venting fire:** an 8-blob jet and smoke puffs from carrier 1, 60–74 s.
- **Pod interior:** frost growing with time, condensation drops, a hand on the glass (61–75 s), drifting dust, lens ghosts, starburst and film grain.
- **HUD:** T+ timer, O2 readout and beacon meter. Captions type out letter by letter.
- **Music:** a three-part choir (twelve detuned saws per part) in three formant banks, a whispered choir driven by noise, bell melody, lead line with vibrato, ticks, bass pulses, a descent heartbeat, and a roar with crackle.

## Checks run
- `budget.py`: passes, 29,130 total and 7,148 music. No external references.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with **no console errors or exceptions**. The shaders compile in headless Chrome.
- `check.mjs audio`: offline render of 106 s, peak **0.854**, 0 NaN. RMS per bar: quiet pod in bars 0–8 (about -27 dB), choir and bells in bars 9–23 (about -13 to -18 dB), roar in bars 27–28 at the top of the range, then fade.
- `check.mjs clearance`: **0 samples inside any probe box**, minimum distance **17.7 units**. The probe is generated in JS from the same ship, debris and planet parameters as the shader:
  - **Ships:** about 7-unit chunks along each rotated hull (30 per carrier and tanker, 24 per frigate), with split halves at mid and full separation.
  - **Debris:** one cube per debris cell in range (about 110 cubes), sized to each body's bounding radius.
  - **Planet:** 12 inscribed slab boxes. A box is only hit when the camera is inside the sphere, so there are no false positives, but the boxes cover only the inner part of the sphere. Penetration of the outer shell is not caught by the probe. The camera altitude above the surface was checked numerically at 13.7 units or more.
- The camera key at 62 s was moved to route under a split-carrier half and clear of a debris body (scanned candidates, chose the one with the largest clearance).

## What isn't verified
- **I have not heard the music, and I have not watched the piece.** No screenshots were taken. The look (planet detail, ring brightness, venting fire, hand, frost, starburst) was reasoned from the code.
- **Frame rate** on other GPUs is unmeasured. The render scales itself down if frames run below about 30 fps.
- **Probe approximations:** ship boxes assume the yaw wobble stays within 0.02 rad, and split halves are checked at two intermediate separations only. Debris cubes use bounding spheres, so they're conservative. The probe does not cover the planet's outer shell (see above).
- **Fonts** fall back through the stack on Windows and Linux, and that is untested.
- **The size target** (57,344–65,536 bytes) is not met. The build is 29,130 bytes.
