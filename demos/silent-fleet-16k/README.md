# SILENT FLEET 16k

An orbital battle above a banded gas giant, told from one escape pod drifting through the wreckage. Explosions are silent. The only sounds come from inside the pod: breathing, a soft beacon ping and a formant choir pad, and at the end a roar of fire.

Entry: `dist/silent-fleet-16k.haiku-5.5-medium.html` (one self-contained file, no packer, no external requests).

Rebuild with `python3 build.py`. It writes `dist/silent-fleet-16k.haiku-5.5-medium.html` and prints its size. It also writes `dist/dev.html`, the same page with the camera-clearance probe, which is only used by the checks.

## Sizes against budget

| | size | budget |
|---|---|---|
| whole HTML (raw UTF-8, no packer) | **12 782 bytes** | 16 384 (3 602 to spare) |
| soundtrack code (`src/music.js`, inlined verbatim) | **3 488 bytes** | 4 096 (608 to spare) |

Pieces: the music is 3 488 bytes and the fragment shader is 4 142 bytes after light minification. The rest is the JavaScript, the HTML and the CSS.

## Timeline

The tempo is 72 BPM, so 1 bar = 3.33 s, and the piece is 24 bars = 80 s. The bar numbers below are the picture bars, counted from 1.

| bars | time | picture | music |
|---|---|---|---|
| 1–2 | 0–6.7 s | Black void. The planet's limb glows in from the dark at lower right. Caption POD 7. HULL INTACT. at 1.5 s | Breathing, then the choir pad fades in |
| 3–5 | 6.7–16.7 s | The pod drifts toward ship A, an intact capital hull lit by the planet, with blue engine glow. The window frame and O2 readout appear at 10 s | Beacon ping every two beats from bar 3 |
| 6–7 | 16.7–23.3 s | Wide establishing shot of the fleet over the planet, hull debris tumbling. Caption FLEET HOLDING ORBIT | Pad rises and the formant morphs |
| 8–9 | 23.3–30 s | **Signature shot.** Ship B splits in two at 27 s, against the planet's limb. The flash and two shells are drawn with no sound. Caption BRIDGE LOST. at 28.5 s | Music drops out to breath only from the flash (about 27 s) until bar 10 |
| 10–12 | 30–40 s | The two halves separate and tumble. The pad returns an octave higher at bar 11. Caption POD 7. HULL INTACT. again at 36.7 s | Choir returns |
| 13–14 | 40–47 s | Ship C breaks apart at 44 s. Pings every beat | Darker pad, every-beat pings |
| 15–17 | 47–57 s | Drift through wreckage. Caption NO RESPONSE ON ANY CHANNEL at 47.5 s | Breathing quickens, pings continue |
| 18–19 | 57–63 s | The pod turns toward the planet. Caption DRIFTING TOWARD THE LIGHT at 59 s. The window and O2 readout return at 58 s | Pad rises in pitch |
| 20–21 | 63–70 s | Plasma glow builds at the limb from 60 s and the camera shakes. The roar comes in at 66.7 s | Roar of noise under the choir |
| 22–23 | 70–76.7 s | Peak roar and shake. O2 hits 0%. White-out from 71 s to 76.7 s | Roar fades into the white |
| 24 + tail | 76.7–80 s | White fades to black. End card SILENT FLEET / POD 7. HULL INTACT. at 77.5 s | Final pings and the chord decays (the music runs on to 85 s) |

## What I invented beyond the brief

- **Start screen:** "POD 7 · SYSTEMS ON / click to breathe", over the dim scene. The click starts both the breathing and the audio.
- **O2 readout** in the window frame, counting down from 94% to 0% across the piece, which gives the second window its dread.
- **Silence as a musical rest:** the music is dropped out at the moment of the flash, so the explosion's silence is felt in the score.
- **Debris and ship detail:** the hull has a spine, bridge, engine block, wing plate and nose spike. The two halves rotate as they separate. Ten hull fragments tumble.
- **Camera breathing:** the camera drifts slightly and rolls slightly, weightless between keys.
- **Plasma entry:** atmospheric glow along the limb, noise streaks, and shake that grows with the plasma.
- **Lens dirt:** the glows (flashes, engines, atmosphere) are multiplied by a noise mask, so they catch in the lens.
- **Captions:** FLEET HOLDING ORBIT, BRIDGE LOST., DRIFTING TOWARD THE LIGHT, and the end-card repeat of POD 7. HULL INTACT., which closes the loop.
- **White-out and end card:** white-out, then the end card on black.

No bloom or post pass is used. The glows are additive in the same shader, which saved bytes.

## Check results

- `budget.py` against 16 384 total and 4 096 music: **OK** (12 782 total, 3 488 music, no external references).
- `check.mjs e2e dist/silent-fleet-16k.haiku-5.5-medium.html`: click to first sound **0.0 s**, **no exceptions or console errors**. This also confirms that the shader compiled in headless Chrome.
- `check.mjs audio src/music.js 4`: 85 s song, **peak 0.573**, **no NaN**. RMS per 4 bars runs −25.8, −23.3, −25.8, −20.8, −23.3, −19.4 dB, then the tail. That follows the arrangement: intro quiet, the silence block dips, the every-beat pings and the roar peak.
- `check.mjs clearance dist/dev.html`: the camera **never enters a probe box**. Minimum distance is 4.28 units, at 40.9 s. The probe boxes are conservative boxes around the static hull fragments and the ships. Two collisions were found and fixed during the work (a hull fragment on the path at about 57 s, and a loose ship box), so the rock at `[-2,-24,64]` was moved.

## Not verified

- **Sound:** I haven't heard it. I only measured the offline render. Please listen for the choir formants, the balance of the pings against the breathing, and the roar's level.
- **Look:** no screenshots were taken, per the brief, so the shading, the planet's bands, the explosion rings and the framing are checked by reasoning about the code, not by eye. The explosion shells are projected approximately, and the planet's visible face is lit only by its limb.
- **Frame rate:** not measured on a real GPU. The canvas is capped at 1280 px wide. The ship and debris loops run up to 128 march steps per pixel.
- **Other platforms:** only headless Chrome on macOS was checked. Hard-coded font fallback is monospace only.
- **Mobile layout:** sizes use `min()` with vh and vw, but no phone was tried.
- **Camera clearance covers only the probe boxes**, not the true hull shapes. The boxes are conservative, so this is a bound, not an exact collision test.
