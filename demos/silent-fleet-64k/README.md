# SILENT FLEET: a 64k intro, battle in orbit

The intro is **`dist/silent-fleet-64k.html`**, one self-contained file with no external requests. Open it and touch the glass (or press Space/Enter) to board pod 7. Sound starts on the click. Rebuild with `python3 build.py`, which also prints the size.

## Size
- **Total: 20,300 / 65,536 bytes (31%)**, raw and uncompressed. No packer (gzip would be about 9.3 KB).
- **Music: 5,083 / 16,384 bytes (31%)**, inlined verbatim from `src/music.js`, not minified.

## Timeline (72 BPM, 1 bar = 3.33 s, 30 bars = 100 s)

| Bars | Time | Picture | Caption (typed out) | Music |
|---|---|---|---|---|
| title | before click | The frame holds at t=0, with the gas giant at the right edge | SILENT FLEET · battle in orbit | none |
| 0–4 | 0–13 s | Pod drifting, with the planet rising at the right. Slight roll and weightless drift | POD 7. HULL INTACT. | D pedal drone fades in, breath once per bar |
| 4–9 | 13–30 s | The fleet at range. A silent flash at 18 s | NO RESPONSE ON ANY CHANNEL | Beacon pings begin at bar 4, two per bar |
| 9–14 | 30–46 s | **Carrier 3 splits in half at 34 s**, backlit against the planet | CARRIER 3 SEVERED. BOTH HALVES DRIFTING. | Choir enters at bar 9 with formant vowels |
| 14–18 | 46–60 s | Shock rings from blasts at 48 s and 55 s. Ship 2 splits at 57 s. O2 readout appears at 40 s | (none) | Choir swells, breath gets louder |
| 18–23 | 60–77 s | Camera threads through the wreck field. Debris tumbles | BEACON 7 SENT. NO ANSWER. | Pings slow to one per bar at bar 19 |
| 23–27 | 77–90 s | Descent. The planet grows and the camera nears its surface | ENTRY IN 14 s. HEAT SHIELD UNKNOWN. | Choir drops out, drone opens |
| 27–29 | 90–97 s | Plasma glow from 84 s, view shakes. Roar begins at 90 s | ATMOSPHERE CONTACT. | **Roar of fire**, all breath and pings stop |
| 29–30 | 97–100 s | White-out at 94.5–97.6 s, then the end card | (none) | Roar fades out, then silence |

## What I added beyond the brief
- **Lit ship hulls** with window rows and explosion light falling on them, plus the silent blasts. Each blast is a fireball, a white flash and a cold shock ring.
- **A second split**: ship 2 also breaks apart, at 57 s. The halves' drift is capped at about 60 units so they stay in frame.
- **The pod's O2 readout** (40–92 s) and a "POD 7" label in the HUD, plus a window frame around the screen.
- **Lens dirt**: a starburst from the star, with streaks modulated by noise so the starlight catches on the dirt.
- **Pod breathing and beacon pings** as the only sounds in the quiet sections. The pings have a short delay echo into the reverb.
- **Formant choir**: eight detuned saws on four chord tones, through three bandpass formants that morph between "ah", "oo" and "ee".
- **Captions**: "NO RESPONSE ON ANY CHANNEL" is the brief's line, and the others are my additions in the same log style. Captions type out letter by letter.
- The end card: "SILENT FLEET / there is no sound in vacuum / SILENTIUM · 64K · MMXXVI".

## How it's built
- **Graphics:** a single raymarched WebGL2 fragment shader (`src/scene.frag`). Ships are SDF hulls with bounding-sphere skips. Debris is one candidate per 60-unit cell, tumbling in place. The gas giant is an analytic sphere with banded noise and a rim glow. The camera is a Catmull-Rom spline through keys in `src/main.js`.
- **Audio:** WebAudio, scheduled bar by bar with node pruning, like the skill's reference. The drone, choir and roar are long-lived nodes with bar-timed automation. Breaths and pings are short-lived per bar. The offline renderer runs the same code.
- **Captions and HUD:** DOM text in a monospace stack with a dark glow, so they stay readable over the bright planet.

## Checks run
- `budget.py`: passes. 20,300 total and 5,083 music, both well under budget, no external references.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with **no console errors or exceptions**. This also means the shaders compiled in headless Chrome.
- `check.mjs audio`: offline render of 106 s. Peak **0.843**, 0 NaN samples. Per-bar RMS follows the arrangement: quiet drone and breath in bars 0–8 (about -21 dB), choir at -15 to -18 dB in bars 9–23, and the roar at -14 to -15 dB in bars 27–28, the loudest section, with the fade-out at the end.
- `check.mjs clearance`: the camera **never enters the probe boxes** and stays at least 37 units from them, with the closest approach at 68.5 s. The boxes are 84 chunks, 15 units long, rotated to match each hull. They cover the three hulls at their unsplit positions and the halves at mid and full split.
- Camera altitude over the whole spline: at least **13.7 units above the gas giant's surface** (the spline stays outside the sphere; the end point sits 14 units above it).

## What isn't verified
- **I have not heard the music.** I measured it (levels, peak, NaNs). The balance between the choir and the roar, and the breath and ping levels, have not been judged by ear.
- **I have not watched it.** No screenshots were taken, per the brief. The look (lighting, the planet's banding, the starburst strength, explosion brightness, the lens dirt) was reasoned from the code, not seen. The frame rate on other GPUs is unmeasured. The render scales itself down if frames run slower than about 30 fps.
- **The clearance probe covers the three hulls only.** It does not include the debris field or the planet. The pod passes through the wreck field at 60–77 s, and the debris there is not covered by the probe, so debris clearance is unchecked. The planet is kept outside its sphere by the spline, which I checked numerically, not by the probe.
- **Split halves are approximated.** The probe uses boxes at mid and full separation, not every intermediate position.
- **Fonts** fall back through the stack on Windows and Linux, and that has not been checked.
- **Pacing** of the captions and the cut between the fleet and the wreck field is judged from the timeline only.
