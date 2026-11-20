# TWISTER TAPE (64k)

A recovered tape. Home video of a county fair (JUL 04 1986) is recorded over by a storm chaser's camcorder footage (JUN 14 1987): a tornado tears through a 1950s-style plains town. Nature is the antagonist.

Build: `python3 build.py` rebuilds `dist/twister-tape-64k.haiku-5.5-medium.html` and prints the size.

## Size against budget

- HTML: 34,065 bytes raw of 65,536 (52%). Gzip 13,050 (not the budget measure). No packer.
- Music: 10,092 bytes of 16,384 (62%), inlined verbatim from `src/music.js`. Target was 10–14 KB, so it is in range.
- **The 57,344-byte floor is not met.** The file is 23,279 bytes short. I did not pad to reach it. Closing the gap needs roughly 23 KB more real content (more town and destruction detail, more scene variety, fuller shader paths). That is a further pass, not a build setting.

## Timeline

Tempo 90 BPM, one bar = 2.667 s. The prologue is bars 0–8 (absolute 0–21.3 s). Storm bar `s` plays at absolute `(s+8) × 2.667` s. Total length 154 s, with a 5 s tail.

| Storm bar | Absolute (s) | What happens |
|---|---|---|
| prologue 0–8 | 0–21 | Home video: county fair with a Ferris wheel, bunting, a pie-contest table, saturated sunny colours and a fair organ waltz. "RECORDED OVER" card at 8. |
| 0–5 | 21–35 | Calm wide field, distant wall cloud, zoom rocker in and out. Start of the storm footage. |
| 5–19.2 | 35–72 | **Car segment.** Camera on the dashboard. Wipers fight the rain. Radio dial glows. Weather bulletin tone at 7. Road ahead with the funnel sitting across it. Power-line wire snaps at 10.2 and throws sparks. Pulled objects (barn, tower, roof, pickup, two cows, tractor, two cars, steeple, silo, windmill, church) are seen through the windshield. Knock at 17.9–18.7: the dashboard rolls 90 degrees. |
| 19.2–21.9 | 72–79 | **Storm cellar.** Darkness and a flashlight cone. Dust drifts from the ceiling. The roar passes overhead (muffled). The door rattles, then tears away at 21.5–21.9 and reveals the sky. "RECORDED OVER" at 19.1. |
| 21.9–26.5 | 79–92 | Aftermath in daylight: sunbeams, church bell at 23 and 27. |
| 26.5–28.5 | 92–97 | Dusk falls. |
| 28.5–46 | 97–145 | **Night aftermath.** Lightning-lit wreckage, red and blue emergency lights flashing, a search party of three with lanterns. The radio ballad plays from the rubble from 29.8 (first chorus 30–38, second chorus 38–46 with counter-melody). |
| 45.7–46.4 | 143–145 | Tape stop click, then the picture fades to blue with `■ STOP`. |

## Invented beyond the brief

- Fair prologue (ferris wheel, bunting, pie table, organ waltz, date stamp JUL 04 1986).
- Car segment details: dashboard, wiper arm, radio dial with a moving needle, EBS-style weather alert tone, engine drone, power-line snap with sparks.
- Cellar: flashlight cone lighting, dust specks falling through the beam, a shelf and barrel, muffled roar and door thumps.
- Night aftermath: emergency lights, searchers with lanterns (the lanterns are light sources, the searchers are capsules), wet-road reflections.
- Storm town details: a row of shops along the highway, a diner with a flickering neon sign, a grain elevator, a second water tower, lamp posts, a fence, a hay field, tree line and rubble around the radio.
- Thirteen flung objects with their own pull times, tumbling and shrinking into the sky.
- Funnel: two sub-vortices, condensation sheath, mesocyclone ring, tendrils, debris specks in the volume.
- Hail on the lens and as metal-roof pings in the audio.
- Camcorder: auto-exposure and autofocus hunting (a green focus box jitters during hunting), zoom rocker with a ZOOM bar, a battery-low warning, `REC ●`, date stamp and timecode.
- Tape: lens rain (drops and streaks), mud at the edges, tracking bands, ghosting, chroma bleed, head-switching noise, dropout streaks, a vertical roll and a horizontal crease.
- Sound: fair organ, weather alert, engine, power-line crack and crackle, cellar roar and thumps, windmill creak, siren Doppler, glass shatter, plank cracks, thunder with echo, rain hiss, tape hiss, and the ballad with brushes, walking bass and counter-melody.

## Rendering notes

- Volumetric rain: 16 samples along each view ray, animated sheets, up to 80 m.
- Wet surfaces: the ground and road reflect the sky with a Fresnel term, strength rising through the storm.
- Debris motion blur: **not implemented as true blur.** The debris is moving, but there is no motion-blur accumulation.
- The funnel sits on the road ahead; it does not move across it.

## Checks

- `budget.py` (total and music): pass.
- `check.mjs e2e`: click to first sound 0.0 s, no uncaught exceptions or console errors. The WebGL2 context is live and every shader compiles and links.
- `check.mjs audio`: offline render 154.3 s, peak 0.739, no NaN. RMS per 4 bars (dB): -33.5, -33.1, -32.4, -20.1, -14.9, -13.6, -14.4, -21.9, -27.7, -30.6, -31.7, -30.4, -30.0, -31.2, then the tail.
- Clearance: not run. The intro defines no `__probe`. The car camera sits about 9 m from the power poles and the cellar camera stays inside the room walls.
- Segment pixel checks (headless, a scratch copy with a settable clock, not screenshots): the fair, car, cellar, aftermath, night and end-card frames each render with the expected brightness. Night is dark with lit wreckage. The end card is blue.
- This check found a real bug: `OFF` was not exported from the music, so every storm-relative value was NaN and the picture rendered black. Fixed by exporting it; the build's e2e check had passed in the meantime because it does not inspect pixels.

## Not verified

- How it looks and sounds to a person. No screenshots by request, and I have not listened to the mix. The numbers are measurements only.
- Frame rate on real GPUs. The scene is a 150-step raymarch whose tape pass also reads a half-resolution target. Shader compile time on Metal may be noticeable at load.
- Browsers other than headless Chrome on macOS (Safari, Firefox, Windows, Linux).
- Whether the car and cellar framings and the night lighting read well at the chosen distances.
