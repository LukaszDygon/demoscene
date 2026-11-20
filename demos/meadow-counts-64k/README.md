# THE MEADOW COUNTS

*an educational film for schools · reel three*

A 64k browser intro in the shape of a half-remembered 1970s school film. A meadow at golden hour, a sunflower whose seeds are smaller sunflowers, honeycomb that turns into basalt columns, a horizon that folds up into the sky, telephone poles that get taller as they recede, a television in a field that shows itself, and a sunset over fields that turn out to be the seeds of one enormous flower. It's a silent film: the narrator speaks in burned-in subtitles, and a child's questions are typed into the picture one key at a time, in time with the beat.

**Run:** open `dist/meadow-counts-64k.opus-5.5-medium.html` in Chrome, Safari or Firefox (WebGL2) and click. Sound starts immediately (live synthesis, no pre-render).

**Build:** `python3 build.py` inlines `src/` into the dist file and fails if it goes over budget.

**Debug:** `?mute&t=150` starts silently at 150 s.

## Size

| | bytes | budget |
|---|---|---|
| whole file (raw, no packer) | 46,754 | 65,536 |
| soundtrack (`music.js` as shipped) | 14,308 | 16,384 |

There are no external requests and no embedded fonts. All type comes from the OS:
- **The narrator's subtitles:** Baskerville, Hoefler Text, Georgia or DejaVu Serif.
- **The child's lines:** American Typewriter, Courier or DejaVu Sans Mono.
- **Labels and diagrams:** Futura, Century Gothic, Avenir or DejaVu Sans.

| file | what |
|---|---|
| `src/scene.frag` | one shader with five worlds: film leader, meadow/cylinder world (with the TV and the children), the self-similar seed head, honeycomb/basalt, poles |
| `src/film.frag` | film and tape pass: gate weave, line wobble, chroma bleed, halation, faded grade, light leaks, dust, burn-out, burned-in text, grain |
| `src/main.js` | storyboard (everything is a function of song time), camera, feedback buffer, particles (fluff, bees, birds); subtitles, typed lines and diagrams drawn into a canvas texture |
| `src/music.js` | the 88 BPM soundtrack, including the typewriter keys for the child's lines, on the same scheduler live and offline |

## Timeline (88 BPM, 1 bar = 2.727 s, 74 bars, about 3:26 including the tail)

| bars | time | picture | music |
|---|---|---|---|
| start | – | Title card over the meadow, with dandelion fluff and birds | – |
| 0–3 | 0:00 | Film leader counting 8 to 2, with the sweep hand, projector clatter and the pop on "2" | Tape hiss, pad fading in, beep |
| 4–11 | 0:11 | **Part one, the meadow.** A slow drift forward through grass at golden hour. Foreground blades are out of focus, a treeline sits in the haze, and a flock of birds is arranged on a golden-angle spiral. | Pad, bass, music box and electric-piano comping. The boom-bap drums enter at bar 8 |
| 12–21 | 0:33 | **Part two, the seed.** A held close-up of one textbook sunflower head: 1000 seeds on a Vogel spiral at the golden angle. A diagram draws the 137.5° angle. On "Thirty-four one way" every other one of the 34 spiral arms lights up while a counter counts them, then the 55 arms the other way. On "Every seed is a smaller flower" the camera pulls back 47× over 6.5 s, until the head is one seed of an identical, bigger head, and keeps drifting | A recorder melody first, then the lead at bar 16 |
| 22–31 | 1:00 | **Part three, the cell.** A plain of honeycomb with bees. On "the stones learned it too" the cells rise into basalt columns with honey pooled between them, under a hexagonal sun. A hex-tiling diagram appears | Recorder, rimshots, a staccato lead, then a resonant arpeggio |
| 32–43 | 1:27 | **Part four, the fold.** "Now look up." The flat world bends into a cylinder until the horizon wraps overhead and the sky is a field. A diagram folds a line into a circle. Two giant children walk upside down on the far side. **Bars 42–44 have no words:** the camera rolls 180° until the children are the right way up and we aren't | Tape sag, deeper wow, sparse drums, then half-time, a ghost choir, a slow high lead, and the recorder carrying the roll into a reversed cymbal |
| 44–55 | 2:00 | **Part five, the poles.** Dusk. A line of telephone poles with sagging wires and sodium lamps, which grow taller the further away they are. The camera backs away while a pale moon grows. **The child counts them:** a number appears above each pole, one every eighth note, each with a rising music-box note | Busiest section: arpeggio opening across 12 bars, shaker sixteenths, the Neapolitan Eb chord, a minor-second lead |
| 56–63 | 2:33 | **Part six, the television.** A wooden 70s set standing in the grass, whose screen shows the previous frame, so it contains itself all the way down. **Bars 63–64 have no words:** the long pull-back | The whole mix goes through a "TV speaker" low-pass; recorder, electric piano, the staccato lead returns |
| 64–72 | 2:55 | **Part seven, the usual time.** Sunset. The camera rises high over the fields, which turn out to be the seeds of one giant flower with a petal rim of crops | Main theme reprise with the lead doubled a sixth below, choir, music box; the drums drop out at bar 70 and the recorder walks down |
| 72–74 | 3:17 | The last typed question, a two-frame flash of "89", the film burns through, and the tape stops (the pitch slides to zero) | Typewriter bell, tape stop, projector clatter |
| end | 3:20 | *end of lesson. please rewind the tape before returning it to the library.* | – |

## Narration (silent, burned-in subtitles)

There's no voice. The film is narrated by burned-in subtitles of the kind school films carried. There are no cards, boxes, bands or haze, and the picture is never dimmed: it stays at full brightness while text is up.

- **The narrator:** cream Baskerville-style serif, in the lower third (one or two lines stacked upward from 83% of the height).
- **Readability:** a tight dark outline (about 13% of the type size) plus a small drop shadow keeps both voices legible. I checked frames over the brightest moments: the golden meadow, the hexagonal sun over the honey, and the sunset.
- **Timing:** each narrator line fades in over 0.15 bar, on the bar grid. It stays for 85% of its slot, which is 1¼ to 2½ bars.
- **The child:** smaller pale-green typewriter type at 92.5% of the height, below the narrator's lines, so the two stack when they overlap. It's typed one letter per swung sixteenth with a blinking cursor. The soundtrack plays a typewriter key for every letter and a carriage-return bell at the end of each line, so the typing is part of the groove.
- **Wordless moments:** the music carries two passages on its own, the fold roll (bars 42–44) and the TV pull-back (63–64). A third moment is told in music and numbers instead of a sentence: the counting (bars 53.5–55.4).
- **Burned in:** all text and diagrams are drawn into a canvas that's burned into the film, so they wobble, bleed and grain with the picture.

| bar | time | who | text (`/` = line break) |
|---|---|---|---|
| 5–7 | 0:13.6 | narrator | This is a meadow. |
| 7–9 | 0:19.1 | narrator | Everything here is counting. |
| 9–11 | 0:24.5 | narrator | The grass counts the wind. |
| 13–15 | 0:35.5 | narrator | Look closer at the flower. |
| 15–17 | 0:40.9 | narrator | The seeds turn by / the golden angle. |
| 17–19 | 0:46.4 | narrator | Thirty-four one way. / Fifty-five the other. |
| 19–20.5 | 0:51.8 | narrator | Every seed is / a smaller flower. |
| 20.5 | 0:55.9 | typed | and every flower is a seed. |
| 23–24.5 | 1:02.7 | narrator | The bees learned it first. |
| 25–26.5 | 1:08.2 | narrator | Six sides. No gaps. / No waste. |
| 27–29 | 1:13.6 | narrator | Then the stones / learned it too. |
| 29 | 1:19.1 | typed | how long did they practise? |
| 30.75–32 | 1:23.9 | narrator | A very long time. |
| 33–34.5 | 1:30.0 | narrator | Now look up. |
| 35–37 | 1:35.5 | narrator | The horizon does not end. / It folds. |
| 37.5–39.5 | 1:42.3 | narrator | That is the same field, / above you. |
| 39.5–41.5 | 1:47.7 | narrator | We walked there / as children. |
| 41.75 | 1:53.9 | typed | we are still walking there. |
| 45–47 | 2:02.7 | narrator | Follow the line of poles. |
| 47–49 | 2:08.2 | narrator | They do not get smaller. |
| 49–51.5 | 2:13.6 | narrator | The further they go, / the taller they grow. |
| 52–53.5 | 2:21.8 | narrator | Do not count them. |
| 53.5 | 2:25.9 | typed | i counted them. (numbers 1 to 15 then appear over the poles, one per eighth note) |
| 57–59 | 2:35.5 | narrator | This film was made / a long time ago. |
| 59.25–60.75 | 2:41.6 | narrator | It is still playing. |
| 61 | 2:46.4 | typed | is that us? |
| 62.5–64 | 2:50.5 | narrator | You are watching it now. |
| 65–67 | 2:57.3 | narrator | The sun goes down / at the usual time. |
| 67.5–69 | 3:04.1 | narrator | This is the end / of the lesson. |
| 69.5–71 | 3:09.5 | narrator | Remember the number. |
| 71 | 3:13.6 | typed | what was the number? |

The answer flashes for two frames just before the film burns: 89, the next Fibonacci number after 34 and 55.

## Tricks

- **One shader, five worlds:**
  - The meadow is a heightfield wrapped onto the inside of a cylinder of radius `Rc`. At `Rc = 10⁴` it's flat. Shrinking it to 20 folds the horizon up into the sky, and since the terrain is mirrored around the path, the seam overhead stays invisible.
  - The seed head is an exact self-similar zoom:
    - **Layout:** a head is 1000 Vogel seeds (r = √n, θ = n·137.5077°) out to r = 31.6, then a ring of 34 petals out to 40.
    - **Every seed is drawn as a small head:** a dark disc graded from a greenish heart through umber to an ochre rim, then a gold petal ring (r 0.79–1), lit as one dome, with no per-seed noise. So a head shrunk into a seed's disc (×1/47, turned 0.35 rad) looks exactly like the seed it replaces.
    - **Descending:** once a seed is more than about 24–60 px across on screen, the renderer steps into it and draws its real head.
    - **The camera:** it holds on one head (the one in seed 55 of its parent). During the pull-back, scale, centre and rotation interpolate in log-space to the parent head, and the end state is the same picture as the start, one level up. The spiral families are lit by index: every other residue of n mod 34 (or mod 55) is one parastichy arm.
    - **The search:** the nearest-seed search only looks at indices whose radius is within ±1.3.
  - The basalt is a hex-cell walker, not an SDF. It first jumps down to the tallest possible column top and stops once the ray climbs back above it. Each step goes to the nearer of the cell edge or the column top, and a short second walk gives the long shadows.
  - The poles scale with distance (s = 1 + z/55). Their wires are two-segment sags, intersected analytically against the ray and anti-aliased by angular distance. Their lamps are analytic glows.
- **TV recursion:** the scene shader samples last frame's composite onto the TV screen, with barrel distortion, scanlines, a phosphor tint and a gain below 1, so it converges as genuine video feedback.
- **Feedback dissolves:** cuts dissolve through the feedback buffer, which is slightly zoomed each frame so ghosts drift outward. Cuts are also marked by light leaks. The feedback dissolve is short (it decays at 2.2/s), and the feedback is zeroed when the buffers are recreated.
- **Film and tape pass:** chroma is blurred while luma stays sharp (VHS bleed), plus halation from the mip chain, lifted teal blacks, warm faded highlights, gate weave, grain, dust, a tracking band during the tape sags and the burn-out. The frame-indexed hashes for grain, dust and weave are wrapped modulo a small prime, because large arguments to `sin` turned the grain into diagonal stripes late in the film.
- **Music:** the master runs through a delay line modulated by wow (0.43 Hz and 0.17 Hz) and flutter (6 Hz). Its delay time is also automated:
  - three "motor sags", where the pitch dips and recovers at section changes
  - a quadratic ramp at the end, which makes a real tape stop
  - then tanh saturation, a 7 kHz low-pass, vinyl crackle and hiss

  The drums are swung boom-bap at 88 BPM. The pads are detuned saws with slowly drifting detune. The harmony is D minor with a flattened-second (Eb) unease section. Other voices:
  - a school recorder (triangle wave plus breath noise) for the wordless passages
  - FM electric piano comping
  - a resonant saw arpeggio in the poles
  - reversed cymbals into the big moments
  - typewriter keys and the bell for the child's lines

## What I invented beyond the brief

- the school-film framing: leader countdown, chapter cards, the "fig." diagrams, the rewind-the-tape end card
- the 34/55/89 counting thread through the script
- the honeycomb-to-basalt rise
- the upside-down children on the folded field
- the poles that grow with distance, and the moon that grows as you leave
- the self-containing television, and the TV-speaker filter on the music
- the closing reveal that the fields are seeds of a flower

## Fixes in the second round

**1. Black rectangles.** There were several sources, all fixed at the root:
- **Negative colour in the seed scene.** The seed scene's vignette, `1.25 − 0.3·|uv|²`, went negative in the screen corners. That fed tens of thousands of negative pixels into the feedback buffer and the mip chain used for halation. The film pass reads mip 5 for halation, which is about 32×32 pixels per texel, so any bad value came out as a dark block. The vignette is now clamped at 0, and the seed scene was rewritten anyway (see 2).
- **Values that are NaN on some GPUs.** One bad pixel becomes a black square through that same mip chain, then lingers through the feedback:
  - `atan(0,0)` at the exact centre of every pollen and fluff sprite (`gl_PointCoord` = 0.5) and of the leader on odd-sized buffers
  - the TV box test dividing by ray components that are exactly 0, which happens on a whole pixel row when the camera is level
  - `pow()` of `1 − |dot|`, which can go slightly negative, on the TV rim and the children
  - `normalize()` of a zero gradient on the basalt side faces

  All are guarded at their source.
- **The projector "frame roll".** It slid a dark frame-line bar through the picture at 2:00 and 2:33, and it looked like a glitch. Removed.
- **The cut into the TV.** It started with the camera against the near-black bezel, while a long feedback dissolve smeared dark bezel edges across the frame. The camera now starts 1.75 m back, the bezel is dark brown rather than black, and dissolves are shorter.
- **Diagonal stripes in the grain.** The grain and dust hashes took frame numbers in the thousands, so `sin` lost precision and drew stripes. The hashes now wrap.
- **Resizing.** When the adaptive resolution recreated the buffers, the next frame blended with an empty feedback buffer. The feedback is now skipped for that frame.

**How I checked:** a headless scan stepped the whole film every 0.25 s with three frames per step. At each step it read the scene and both feedback buffers back as floats, counting NaN, Inf and negative values, and counted near-black 8×8 blocks in the final image. Every check is now clean except the intended burn-out and black end card. I also looked at frames throughout.

**2. Seed zoom.** The old version put a 40× copy inside the cramped central seed. That seed was smaller than its neighbours, and the copy was drawn differently from the ordinary seeds, so it read as a dot in a hole. Now every seed is a whole head and the zoom runs about the fixed point of the head-into-seed-21 map. Frames on either side of the loop point (L = 10.27 s and L = 10.57 s) frame the same thing, and the zoom is continuous in between.

**3. Narration.** The formant voice, its phoneme table and the ducking are gone. The intertitle cards that replaced them, which dimmed the picture, have since become plain burned-in subtitles. The freed music bytes went to:
- the recorder and the electric piano
- the arpeggio
- the doubled reprise lead
- reversed cymbals
- typewriter keys and the bell
- the counting notes

## Fixes in the third round

I found these by rendering dense sequences at 1280×720, 10 frames per second of film time, and reading consecutive frames side by side. I also ran a frame-to-frame change detector over the whole film at 10 fps. Its only spikes are the intended hard cuts (bars 4, 32, 44 and 64) and the two-frame "89" flash.

**Cell (bees and stones):**
- **Towers along the horizon.** The hex-cell walker ran out of its 150 steps on grazing rays. Those pixels fell through to the sky, which drew jagged stair-step "towers" along the horizon of the honeycomb plain. It now skips straight to the tallest possible column top, stops once the ray climbs above it, has 240 steps, and treats running out of steps as a hit in the haze.
- **Ledges between honey cells.** The honey pools sat at slightly different heights, leaving dashed little ledges between them. They're now one level.
- **Honey on rising stones.** The honey disc was still painted on top of stones as they rose. Now only cells still at comb height show honey.
- **Flat honey.** The honey was the same tone as the wax. It's now a deeper glossy amber with a sun glint.
- **Distant shimmer.** Distant columns get more haze.

**Poles:**
- **Overlapping numbers.** The far poles all crowd the vanishing point, so their numbers overlapped. Labels are now placed in strict near-to-far order, each at least a label-width right of the previous one along a rising diagonal, and tied to its pole top by a thin leader line. They can't collide.
- **Stepped dark band in the field.** The ground was marched together with the poles with a loose hit threshold. Far ground pixels landed a little above y = 0 and were shaded as pole silhouettes, which drew a stepped dark band across the field. The ground is now an exact ray-plane intersection, and only the poles are marched.
- **Red fringes.** The VHS chroma bleed was offset to one side, which put red fringes on every thin pole. It's now centred.

**Meadow:**
- **Pale streak under the ridge crests.** Rays skimming the ridge crests ran out of steps and showed sky, a pale streak under the crests. Running out of steps now counts as ground.
- **Mirror line and V-notch.** The terrain was mirrored about the camera path, so it had a symmetric line and a V-notch at the vanishing point. It's now asymmetric, and folds symmetric only near the cylinder's far seam, where it must. The flat lane under the camera now opens out again 50 m ahead.
- **Blotchy dandelion dots.** The dots were bright blotches that swam in motion. They're now small, dim and fade in close.

**Seed zoom:** rebuilt as described in Tricks. The head is crisp and regular, the 34 and 55 families are shown, and there's one deliberate held pull-back instead of a constant zoom.

**Film pass:**
- **Scratch and cue mark removed.** The vertical "film scratch" line and the white reel-change cue mark both read as glitches.

## Not verified

I haven't heard the music; I've only measured it.
- **audio:** peak 0.85, no NaNs, about −12 to −14 dB RMS per section, quieter leader (−22) and tail (−18)
- **e2e:** sound at the click, no errors
- **clearance:** min 0.32 at the TV, 0 s inside geometry

I could only look at headless frames at low resolution, and frame rate on slower GPUs is unknown. The scene renders at about 0.48 MP and scales down automatically.
