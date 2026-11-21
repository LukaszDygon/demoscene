# UNDERGLOW: a 64k intro

The intro is **`dist/underglow-64k.fable-5.2-high.html`**, one self-contained file. Open it and click (or press any key) in the dark garage. Press `f` for fullscreen.

It's a night drive scored with slow, bouncy Memphis-style phonk at 96 BPM. A white coupe wakes up in its garage, three friends fall in behind it at three downtown corners, the convoy shows off at a car meet, and then climbs a hill road to park at an overlook and watch the moonlit city with the headlights off. Nobody races. The story is told by the pictures and a camcorder overlay (REC lamp, clock, a battery that runs down, and a place name typed out at the start of each scene).

## Size
- **Total: 62,167 / 65,536 bytes (94.9%)**, raw and uncompressed. No packer, no external requests.
- **Music: 11,294 / 16,384 bytes** (`dist/music.min.js`, the exact script inlined in the page).
- `src/` is commented. `python3 build.py` minifies the GLSL itself (whitespace and identifier renaming), runs the JavaScript through terser (`npm i` in this folder first), inlines everything and prints the sizes. `python3 build.py dbg out.html` keeps the `window.__dbg` hooks used for the checks below.

## The cars
| Car | Looks | Underglow |
|---|---|---|
| **Coupe** (leads) | wide-body fastback in pearl white that flips to violet, big wing, splitter, vented bonnet, a wave down the flank, twin ring tail lamps | violet |
| **Notchback** | boxy teal saloon with pop-up lamps, a duck tail, an eighties tri-stripe and louvres on the rear glass | cyan |
| **Lowrider** | long candy-red saloon with chrome bumpers, fins, wire wheels, whitewalls, gold pinstripes and a lace roof; it nods to the 808 and scrapes sparks on every kick | amber |
| **Wagon** | slammed matte-black estate with leaning wheels, a sticker-bombed wing, an intercooler and a roof light bar | pink |

All four have neon rings in the wheels, coloured brake calipers, tail lights that brighten when the car slows, and headlights that throw a blue anamorphic streak across the frame when they look into the lens.

## Timeline (96 BPM, 1 bar = 2.5 s, 88 bars = 3:40)
Cars drift only where the path turns: the tail swings out on the way in and eases back over about a second.

| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | The garage in the dark: a neon moon on the wall, a dying ceiling tube, the title in neon | – |
| 0–4 | 0:00 | **Garage.** The engine catches (bar 0), the underglow flickers on (bar 1), the headlights (bar 2), the roller door goes up and the street pours in (bar 3) | Heard through the wall: electric piano and the hook under a low-pass, crackle, starter and idle, an 808 hit for each light, a snare roll and a sine dive into the drop |
| 4–12 | 0:10 | **Downtown, alone.** Wet streets, shop fronts, blade signs, lanterns, signals that turn green as the car comes near, the moon at the end of the avenue | The full beat: syncopated kick, snare and clap on 2 and 4, swung sixteenth hats with rolls, an 808 that slides, the cowbell hook |
| 12–28 | 0:30 | **The convoy forms.** The notchback drifts in from the opposite direction at the first corner (bar 12) as a train crosses overhead, the lowrider falls in at the second (16), the wagon at the third (20); all four slide through the fourth (24) | Each arrival is announced by an engine and tyres; the piano joins at 12, the hook is doubled an octave down at 20, and takes a second shape at 24 |
| 28–32 | 1:10 | **The lot.** Rows of parked cars with their own glows, a ring of people with phones up, a canopy, speaker stacks, bulbs on wires; the lowrider sways in on the beat | Half-time: the hook's skeleton with delay, crowd noise |
| 32–40 | 1:20 | **Doughnuts.** The coupe circles the pit laying rubber (32), then the notchback joins it door to door (36); a camera in the middle of the circle | The second drop: a busier kick and 808, a choir of saws, whoops, tyres |
| 40–44 | 1:40 | **Hop-off.** The lowrider's front end jumps on every note of an 808 solo (bars 40, 42); the coupe answers with flames (41, 43) and rolls out | 808 solo and hook trade bars; backfire on the pops |
| 44–52 | 1:50 | **Tunnel.** Strip lights, tiles, graffiti; the cars fan out four abreast, two of them pop flames; the moon sits in the exit | Low-passed, long reverb, rim shots; the filter opens over eight bars |
| 52–68 | 2:10 | **Hill road.** A bend on every second bar, the city spreading out below on the left, cherry trees along the wall; each car leaves a ribbon of its own colour; the pack closes up from bar 64 | The peak: everything plus a pad; tyres at each apex, a turbo flutter at the end of each phrase |
| 68–76 | 2:50 | **The last climb.** Longer shots, the camera pulls back and up | Half-time, bells take the hook, crickets fade in |
| 76–84 | 3:10 | **Overlook.** The cars swing in and park in a row facing the drop. Engines off (78). The headlights go out one car per bar (80, 81, 82, 83), far to near, watched by a cat on the guard rail | No drums: piano, pad, one bell per headlight, doors, hot metal ticking |
| 84–88 | 3:30 | **The view.** The camera rises behind the row: river, bridge, towers, the moon. Four fireworks in the four colours, a shooting star, then the underglows go out on the last four beats | The hook once more, slow; distant fireworks; four last notes |

## Music
G minor with a flattened second, 96 BPM, sixteenths swung 60/40. The hook stays between E♭4 and D5 in all three of its shapes. Every sound is synthesized: an 808-style cowbell (two squares into a band-pass and saturation, scooped up into each note), a sine 808 through a wave shaper with per-note slides, a two-operator electric piano through a slow pitch wobble, a saw pad, saws through two vowel formants as a choir, and noise or looped-buffer effects for engines, tyres, the crowd, the train and the crickets. `SONG.plan(bar)` is the single source of every pattern, and the picture reads it for its kick, snare, bass and cowbell envelopes.

## How it's built
- **Scene:** one raymarched fragment shader at 668×304 into a float target, with one reflection bounce, then instanced particles, a bloom chain with a wide horizontal streak, and a post pass (depth of field with oval bokeh, lens streaks, unsharp mask, grade, grain). A governor lowers the resolution if frames run long.
- **Places:** a garage; a downtown grid of 80 m blocks, four buildings each, with one block cleared for the meet; a tunnel; a hill road whose centre line is a sine in z, with terrain defined relative to the road. Each place has its own branch of the distance function.
- **The city seen from the hill** is not geometry: rays that leave the hill are intersected with a plane and shaded with lights at two cross-faded scales, avenues with traffic, a river carrying the moon, and towers sampled on four higher planes.
- **Choreography:** everything is a pure function of the bar number. Downtown is a list of straights and arcs; cars that have not joined yet drive their own mirrored approach to the same corner. Drift is the clamped yaw rate averaged over a window from half a bar behind to a fifth of a bar ahead.

## Checks
- `budget.py`: 62,167 / 65,536 total, 11,294 / 16,384 music.
- `check.mjs audio`: peak 0.906, no NaN; RMS per 4 bars −13.8 (garage), about −10 through the drops, −11.3 (lot arrival and tunnel), −11.4 (last climb), −13.9 → −17.1 (overlook). Soloed stems in the drops: drums −18.8 dB, 808 −16.9, cowbell −18.2 to −16.6, piano −23, pad −24.
- `check.mjs e2e`: no errors; click to first sound 2.4 s in its software-rendered Chrome (the page synthesizes its samples before the click, so a real browser starts sooner).
- `__dbg.scan()`: 661 frames across the timeline, no GL errors or NaN uniforms.
- `__dbg.clear()`: reads the scene depth every 0.05 bar; the camera is never inside a car, a wall or a person, and no two cars overlap. The only flags are low cameras that sit less than 0.7 m above the garage floor, the kerb or the road.
- Motion: each car's heading changes by at most 0.07 rad between frames at 60 fps, including across cuts; drift is 0 on straights, 0.66 rad in the downtown corners, about 0.55 at each hill apex and 0.75 in the doughnuts.
- Frame time in headless Chrome with the GPU on a base M1: 8 to 14 ms.

## Invented beyond the brief
The garage opening, the camcorder overlay with its battery, friends joining from mirrored streets, the green wave of traffic signals, the elevated train, the hop-off between 808 and flames, the cat, the vending machines under the old cherry tree, the colour ribbons on the hill, and the fireworks in the four underglow colours.

## Not verified
I have not heard the music or watched the picture: levels, timings, exposure and framing were measured, and staging was checked from material maps and coarse luminance maps, not seen.
