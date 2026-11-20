# COWBELL GRAND PRIX: a 64k intro

The intro is **`dist/cowbell-grand-prix-64k.fable-5.2-high.html`**, one self-contained file. Open it and click (or press Space/Enter) on the starting grid. Press `f` for fullscreen.

It's a kart-style race between four heavily modified cars on a skyway through a megacity, scored with drift phonk at 144 BPM. The cars throw ridiculous things at each other: a rocket, a mirror ball, a black hole, a magnet, a boxing glove on a spring, a grand piano, a freeze ray and, last of all, a rubber duck. The story is told by the pictures, the HUD (position, item box, clock) and the music; the only words are comic-book lettering on the big hits.

## Size
- **Total: 63,893 / 65,536 bytes (97.5%)**, raw and uncompressed (gzip would be 28.2 KB). No packer, no external requests.
- **Music: 12,182 / 16,384 bytes** (`dist/music.min.js`, the exact script inlined in the page).
- `src/` is commented. `python3 build.py` minifies the GLSL itself (whitespace and identifier renaming), runs the JavaScript through terser (`npm i` in this folder first), inlines everything and prints the sizes. `python3 build.py dbg out.html` keeps the `window.__dbg` hooks used for the checks below.

## The cast
| Car | Looks | Role |
|---|---|---|
| **PEARL** (hero) | wedge coupe, chameleon flip paint, twin stripes, big wing, cyan underglow, gold spinners | starts last, bogs down off the line |
| **VANTA** (villain) | long matte-black muscle car, hot-rod flames, blower through the hood, side pipes that spit fire on every kick | leads from pole and plays dirty |
| **EL DORADO** | gold-to-crimson lowrider, bull horns, tail fins, whitewalls, hydraulics that hop on the kick | carries a grand piano on its roof from bar 70 |
| **BUBBLEGUM** | pink polka-dot kei car on monster-truck wheels with a speaker stack that pulses with the bass | dances under a mirror ball from bar 28 to the end |

## Timeline (144 BPM, 1 bar = 1.67 s, 128 bars = 3:33)
| Bars | Time | Picture | Music |
|---|---|---|---|
| title | – | The grid at dusk, seen from behind the hero. Grandstands flash, hydraulics idle | – |
| 0–8 | 0:00 | **Grid.** Close passes over the four cars with name plates, the start lights count 3-2-1 (bars 4, 5, 6), a held breath on bar 7 | Cowbell riff through a "radio" low-pass, crackle, engine revs that climb each bar, three beeps |
| 8–24 | 0:13 | **Launch.** Green light on the drop. The hero spins its wheels and falls to 4th; chase, trackside and helicopter shots through the dusk canyon; a row of item boxes at bar 20 and the roulette spins | Full drift-phonk beat in F Phrygian: distorted 808, claps, the cowbell riff, chord stabs, chopped formant "vocals" |
| 24–28 | 0:40 | **Rocket.** A rocket pops onto the hero's roof, blue flame, wide lens, radial blur; it passes the pink car for 3rd | Busier riff with a saw lead, rising whine, jet noise |
| 28–32 | 0:47 | **Mirror ball.** The gold car lobs a mirror ball over the pink car: the road becomes a dance floor, spots sweep the city, and the pink car can't stop dancing | Four bars of four-on-the-floor disco phonk with open hats |
| 32–40 | 0:53 | **Megawall tunnel.** The road dives into a neon-ringed bore. The villain throws a black hole (bar 36) that bends and swirls the tunnel around it; the hero is stretched and swallowed on bar 40 | Sparse low riff with delay; riser; a tape-stop dive as the master filter closes |
| 40–48 | 1:07 | **Inside the hole.** The hero tumbles through streaks of smeared city light. A rubber duck drifts past | Half time: pads (Fm–D♭–B♭m–C), bells, sub, everything muffled, opening towards the exit |
| 48–56 | 1:20 | **Undercity.** Spat out of a hole in the sky into a rain-soaked street under the deck: blade signs, steam, raindrops on the lens. A golden box gives a magnet | Half-time beat with rain; snare build |
| 56–64 | 1:33 | **Magnet.** Back on the skyway at night under a huge moon. The beam locks on to the pack far ahead and reels it in; the pink car is yanked clean over the hero's roof (bar 61) | Second drop, saw lead doubling the cowbell, ghost rim |
| 64–72 | 1:47 | **Glove and piano.** The gold car punches the hero into the barrier with a spring-loaded boxing glove (bar 66). The hero's next item is a grand piano, which whistles down and lands on the gold car on bar 70 | "Boing", a falling whistle while the drums drop out, a two-fisted piano cluster on the downbeat |
| 72–80 | 2:00 | **Freeze.** The villain's freeze ray seals the hero in a block of ice that slides and slowly spins while the others close in; frost creeps over the lens; the cracks glow and it shatters on bar 80 | The riff moves to glassy bells, drums high-passed and half time; snare roll |
| 80–88 | 2:13 | **Storm climb.** A 15 % ramp into the cloud: rain, lightning (one bolt finds the piano), the last item roulette runs long and lands on… a duck. White-out, silence, one small squeak | Heaviest section: low riff, siren, thunder, then a bar of nothing |
| 88–104 | 2:27 | **Above the clouds at dawn.** The road rides over a sea of cloud into the sunrise; megatowers pierce it; an airship keeps pace. A blocking duel, then (bar 96) the duck is thrown: it bounces down the road, doubling in size on every beat of bars 97–99, and lands on the villain on bar 100 | Final drop. The harmony resolves from F Phrygian to **F major by ♭VI–♭VII–I**, then IV–V–vi–I; squeaks on the bounces |
| 104–112 | 2:53 | **Finish.** Slow motion under the chequered gantry, confetti, fireworks, victory doughnuts | Crash, bell glissando, crowd; half time from bar 108 |
| 112–128 | 3:07 | **Coda.** The duck, with the villain still under it, slides over the line in 4th. The camera cranes up over the cloud sea; results | Drums out, bells and pad, a last chord, one cowbell, one squeak |

## Sync: one clock, one plan
- The audio clock drives everything; the picture is a pure function of the bar number (plus a particle simulation that follows it).
- `SONG.plan(bar)` is the only source of patterns. The picture reads the same kick and cowbell strings the music plays: kicks pump the underglow, the arch lamps, the light strips across the road, the tunnel ribs, the pink car's speakers, the gold car's hydraulics, the villain's backfire and the lens; cowbell notes drive the barrier LEDs, neon sign columns and the gates.
- **Arches stand 33.3 m apart and the pack cruises at 80 m/s**, so in every chase shot one arch passes per beat.
- Cuts land on bar lines (mostly every two bars) and each cut gets a few frames of whip blur.
- Every prop has its sound on the same bar: roulette ticks are the cowbell itself (32nd notes that slow down for the last spin), the piano lands as a piano, the duck squeaks lower as it grows.

## How it is made
- **One raymarched scene shader** renders the world at 704×320 in a 2.2:1 letterbox, then a post pass upscales it with an unsharp mask. The scene: a curving skyway, a procedural megacity (superblocks, setbacks, lit windows, neon sign columns, holo billboards, roof beacons), arches, gates, grandstands, a megawall with a tunnel, a street-level undercity, a cloud sea, an airship, four SDF cars and all the props.
- **Shading:** wet asphalt with puddles and one ray-traced reflection bounce, iridescent/metal-flake/matte paints, soft sun shadows at dawn, per-car underglow, headlight and tail-light pools, mirror-ball spots projected on everything, an ice block you see the car through, glow volumes for flames, beams and headlight shafts.
- **Post:** gravitational lensing and swirl around the black hole, shock rings on impacts, radial speed blur with chromatic dispersion, bloom with an anamorphic streak, god rays from the dawn sun, raindrops and frost on the lens, film grain, ACES tone curve.
- **Particles** (CPU-simulated, instanced): tyre smoke tinted by each car's underglow, tail-light trails, spray, sparks, piano keys, ice shards, feathers, confetti, fireworks, bass rings.
- **Music:** every sound is synthesized. One-shots (cowbell, kick, clap, hats, snare, bell, stab chords, formant chops, duck, boing, piano cluster) are rendered into buffers at startup in about 0.2 s; 808 bass, pads, lead and sweeps are live oscillators. The same scheduler plays live and renders offline.

## What I invented beyond the brief
- The title, the four cars and their names, the item set and the order of the gags, the HUD (position, item roulette with emoji, lap clock) and the results card.
- The dusk → night → storm → dawn arc, the megawall, the undercity detour through the black hole, the monorail whose oncoming train passes every four bars, the airship, and the duck foreshadowing (holo billboards, a drone show in the night sky, a cameo inside the hole).
- Musical choices: the roulette played by the cowbell, a disco interlude for the mirror ball, and the major-key resolution for the finale.

## Checks
- `budget.py`: 63,893 / 65,536 total, 12,182 / 16,384 music, no external references.
- `check.mjs audio`: no NaN, peak 0.92; RMS per 8 bars follows the arrangement (intro −12 dB, drops −7.5, black hole −12, ice −9, outro −10 → −15).
- `check.mjs e2e`: click → first sound 0.3 s, no errors. (The one-shot samples are synthesized while the title screen is up, about 0.2 s, so the click only has to start the scheduler.)
- `__dbg.clear()` (debug build): steps the whole timeline and reports any frame where the camera is inside a car, the duck, the piano, a barrier, an arch or a gate, or where two cars overlap. It reports none.
- Frame time on an Apple M1 (headless Chrome, Metal, with a forced read-back after every frame): 14–18 ms at the default internal resolution of 704×320, so a base M1 sits right at the edge of 60 fps. A governor lowers the resolution by 20 % at a time if the page can't hold about 48 fps, and undoes it and stops if two cuts in a row don't help (a 30 Hz display, a throttled tab).
- `__dbg.scan()` (debug build): draws 964 frames across the whole timeline; no exception, GL error or NaN uniform.

## Not verified
- I measured the mix but have not heard it, and I checked the picture through luminance statistics and material-ID maps rather than by watching it. Framing, colour and comic timing are judged by reasoning; they need a human eye and ear.
- Tested in Chrome (Metal/ANGLE) only. It needs WebGL2 with float render targets. Emoji in the item box come from the system font.
