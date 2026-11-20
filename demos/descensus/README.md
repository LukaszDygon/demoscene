# DESCENSUS: a 64k deep-sea intro

The intro is **`dist/descensus.html`**, a single self-contained file. Open it, then click or press Space/Enter on the title screen ("tange aquam ut descendas", meaning "touch the water to descend").

## Size
- **Total: 30,185 / 65,536 bytes (46%)**, raw and uncompressed. No packer is used (gzip would bring it to 13 KB), and it makes no external requests.
- **Music: 8,371 / 16,384 bytes (51%)** as shipped (`dist/music.min.js`, which is the same code as `src/music.js` with comments and indentation removed). The commented source is 9,110 bytes.

## Timeline (70 BPM, 1 bar = 3.43 s, 26 bars ≈ 89 s plus the end card, about 92 s in all)
| Bars | Time | Section (caption) | Picture | Music |
|---|---|---|---|---|
| title | – | *DESCENSUS · ad abyssum, ubi lux non pervenit* | Looking up through Snell's window at a violet dusk sky with the first stars | – |
| 0–4 | 0–14 s | **I · Vesper**: *lux ultima super aquas* | The camera tilts down from the surface into slanted dusk light shafts | D drone fades in, surface wash, bubbles |
| 4–9 | 14–31 s | **II · Medusae**: *lux moritur, vita lucet* | Sinking through a field of cyan and magenta jellyfish whose bells pulse in time with the music | The heartbeat kick enters as a lub-dub, twice per bar. Pads (Dm9, B♭, Gm9) and sparse FM "bioluminescence" bells |
| 9–14 | 31–48 s | **III · Cetus**: *cetus canit in tenebris* | A humpback whale drifts across, seen from below as a silhouette against the ceiling of jellies, with plankton glinting on its skin | Whale-song glides: sine and triangle with portamento and vibrato, fed into a beat delay and reverb |
| 14–17 | 48–58 s | **IV · Nox**: *de profundis clamavi* | Near-total darkness. A long siphonophore (a chain of light) drifts past with pulses running along it, and plankton flash on the heartbeat | The heart slows to one beat per bar, sub rumble, distant whale calls, a rising shimmer |
| 17–21 | 58–72 s | **V · Templum**: *templum sub fluctibus* | A lure flickers on in the dark, and its light gradually reveals a sunken Gothic nave: clustered piers, pointed arcades, a ribbed vault with collapsed holes | Full heartbeat, choir pad (formant-filtered saws), a bell arpeggio for the ignition |
| 21–24 | 72–82 s | **VI · Lucerna**: *et lux in tenebris lucet* | The ROV glides down the nave to the altar. A giant anglerfish hangs behind it with its lure lighting the altar, with soft shadows and a volumetric glow | Choir and organ-like pads in D minor |
| 24–26 | 82–92 s | end card: **FINIS** · *requiescat in profundis* | The lantern dims and goes out, and the scene fades to black | Resolves on D **major** (a Picardy third), the heart stops, and the reverb tail fades |

## What I added beyond the brief
- **Snell's window** for the opening, with refracted dusk sky, clouds and first stars. There is no sun.
- The **siphonophore light-chain** and the **plankton flashing on the heartbeat**, so the dark section still has something to look at.
- **Bioluminescent specks on the cathedral stones** that faintly show its outline before the lantern lights it.
- A **rose window in "stained glass"**, glowing cyan and magenta from bioluminescent colonies behind it.
- The **lure flickering on**, the anglerfish's magenta photophores, and its rim light pulsing with the heartbeat.
- The title and end-card text, the section numbering in Roman numerals, and the **Picardy-third ending**.

## How it's built
- **Graphics:** a single raymarched fragment shader (WebGL2) holding one continuous world from the surface down to the abyss.
  - Jellyfish are made with domain repetition, and their tentacles add glow as the ray passes near them.
  - The whale, cathedral and anglerfish are SDFs.
  - The anglerfish's light uses an analytic point-light in-scatter integral for the glow in the water.
  - The dusk shafts are raymarched volumetric noise.
  - Marine snow and plankton are a separate pass of 4,500 GL points, depth-tested against the raymarched scene.
- **Captions** are DOM text in a serif font stack (Cormorant Garamond / Hoefler Text / Baskerville / Palatino Linotype / Book Antiqua / Georgia / DejaVu Serif / Liberation Serif) with a dark glow so they stay readable.
- **Music:** WebAudio, scheduled bar by bar with node pruning. It uses a generated convolution reverb and a dotted-beat delay.
  - The heartbeat pattern lives in `SONG.heart()`, and the visuals read the same function, so the pulses are synced by construction.
  - The audio clock drives everything.
- **Camera:** a time-tangent Hermite spline through ROV keyframes plus slow multi-sine drift. Roll is at most about 1.6°, so there are no barrel rolls.
- `src/` holds `music.js`, `main.js`, `scene.frag`, `snow.vert`, `snow.frag` and `index.html`. `python3 build.py` produces `dist/`.

## Checks run
- `budget.py`: passes. The file is self-contained.
- `check.mjs e2e`: sound starts **0.0 s after the click**, with no exceptions or console errors.
- `check.mjs audio`: offline render of 95 s, **peak 0.87**, 0 NaN samples.
  - RMS per 2 bars: −24.5, −20.3, −19.7, −20.0, −18.4, −16.1, −16.4, **−21.0** (the dark section dips), −18.8, −16.3, −16.6, −16.9, −18.2, then the tail.
  - So the levels follow the arrangement: quiet surface, building jellies, fullest at the whale, a dip into the dark, back up for the cathedral, then the fade.
- `check.mjs clearance` (piers, arcade walls, altar, anglerfish, floor): the camera never enters geometry, and it comes no closer than 3.6 units.
- GPU time on an Apple M1 (headless Chrome, forced sync), measured at 1024 px internal width: about 8–17 ms per frame across all sections. The shipped cap is 1152 px internal width, which should come out around 10–21 ms by pixel count; I didn't re-time it at that width. The render is upscaled to fill the window, and it scales itself down further if frames run slower than about 30 fps.

## Assumptions
- 64k means 65,536 raw bytes with no packer, and the default 16 KB music budget applies.
- "About 90 seconds" means 26 bars at 70 BPM plus the end card.
- Captions are Latin only, with no translations. Translations, for reference:
  - "the last light upon the waters"
  - "light dies, life shines"
  - "the whale sings in the darkness"
  - "out of the depths I have cried"
  - "a temple beneath the waves"
  - "and the light shines in the darkness"
  - end card: "may it rest in the depths"
- There is no checkerboard: the cathedral floor is rippled sand.

## What I couldn't verify
- **I haven't heard the music.** I only measured it (levels, peak, NaNs). Please listen for the balance between the heartbeat kick and the drone, and for any live crackle on slower machines.
- Real-time smoothness on other GPUs or browsers, and how the font stack falls back on Windows and Linux.
- Motion and pacing were judged from stills only.
- For debugging, `?mute&t=SECONDS` jumps to a moment, and `?cam=x,y,z,tx,ty,tz` freezes the camera.
