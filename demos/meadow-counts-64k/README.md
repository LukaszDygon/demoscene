# THE MEADOW COUNTS

*an educational film for schools · reel three*

A 64k browser intro in the shape of a half-remembered 1970s school film. A meadow at golden hour, a sunflower whose seeds are smaller sunflowers, honeycomb that turns into basalt columns, a horizon that folds up into the sky, telephone poles that get taller as they recede, a television in a field that shows itself, and a sunset over fields that turn out to be the seeds of one enormous flower. A narrator and a child's voice explain it all, a little too calmly.

**Run:** open `dist/meadow-counts-64k.opus-5.5-medium.html` in Chrome, Safari or Firefox (WebGL2) and click. Sound starts immediately (live synthesis, no pre-render).

**Build:** `python3 build.py` inlines `src/` into the dist file and fails if it goes over budget.

**Debug:** `?mute&t=150` starts silently at 150 s.

## Size

| | bytes | budget |
|---|---|---|
| whole file (raw, no packer) | 45,739 | 65,536 |
| soundtrack + narrator voice (`music.js` as shipped) | 15,764 | 16,384 |

There are no external requests and no embedded fonts. Text uses Futura, Century Gothic, Avenir, Trebuchet or DejaVu Sans, whichever the OS has.

| file | what |
|---|---|
| `src/scene.frag` | one raymarching shader with five worlds: film leader, meadow/cylinder world (with TV and children), seed head, honeycomb/basalt, poles |
| `src/film.frag` | film and tape pass: gate weave, line wobble, chroma bleed, halation, faded grade, light leaks, dust, scratch, cue marks, frame roll, burn-out, burned-in subtitles, grain |
| `src/main.js` | storyboard (everything is a function of song time), camera, feedback buffer, particles (fluff, bees, birds), subtitles and diagrams drawn into a canvas texture |
| `src/music.js` | 88 BPM soundtrack plus a formant-synthesis narrator, on the same scheduler live and offline |

## Timeline (88 BPM, 1 bar = 2.727 s, 74 bars, about 3:26 including the tail)

| bars | time | picture | music |
|---|---|---|---|
| start | – | Title card over the meadow, with dandelion fluff and birds | – |
| 0–3 | 0:00 | Film leader counting 8 to 2, with the sweep hand, projector clatter and the pop on "2" | Tape hiss, pad fading in, beep |
| 4–11 | 0:11 | **Part one, the meadow.** A slow drift forward through grass at golden hour. Foreground blades are out of focus, a treeline sits in the haze, and a flock of birds is arranged on a golden-angle spiral. | Pad, bass and music box. The boom-bap drums enter at bar 8 |
| 12–21 | 0:33 | **Part two, the seed.** An infinite pull-back out of a sunflower: each head sits in the central seed of a bigger one. A diagram draws the 137.5° golden angle and counts the 34 and 55 spirals | Groove, then the lead melody at bar 16 |
| 22–31 | 1:00 | **Part three, the cell.** A plain of honeycomb with bees. On "the stones learned it too" the cells rise into basalt columns with honey-light pooled between them, under a hexagonal sun. A hex-tiling diagram appears | Rimshots and a staccato lead |
| 32–43 | 1:27 | **Part four, the fold.** "Now look up." The flat world bends into the inside of a cylinder until the horizon wraps overhead and the sky is a field. A diagram folds a line into a circle. Two children walk upside down on the far side, and the camera slowly rolls 180° until they're the right way up and we aren't | Tape sag, deeper wow, sparse drums, then half-time, a ghost choir and a slow high lead |
| 44–55 | 2:00 | **Part five, the poles.** Dusk. A line of telephone poles with sagging wires and sodium lamps, which grow taller the further away they are. The camera backs away while a pale moon grows. The projector loses its loop and the frame rolls once. On "I counted them" numbers appear above each pole | Busiest section: shaker sixteenths, Neapolitan Eb chord, minor-second lead |
| 56–63 | 2:33 | **Part six, the television.** The cut lands inside a TV screen, and the camera pulls back from a wooden 70s set standing in the grass. Its screen shows the previous frame, so it contains itself all the way down, losing a generation each time | The whole mix goes through a "TV speaker" low-pass; the staccato lead returns |
| 64–72 | 2:55 | **Part seven, the usual time.** Sunset. The camera rises high over the fields, which turn out to be the seeds of one giant flower with a petal rim of crops | Main theme reprise, choir, music box; drums drop out at bar 70 |
| 72–74 | 3:17 | A two-frame flash of "89", the film burns through, and the tape stops (the pitch slides to zero) | Tape stop, projector clatter |
| end | 3:20 | *end of lesson. please rewind the tape before returning it to the library.* | – |

## Narration

**How it's delivered:** a synthesized voice, made entirely in WebAudio, plus burned-in subtitles that reveal word by word in sync with it.

**The voice:**
- **Source and filters:** a sawtooth glottal source and a noise source run through three formant band-passes. Each phoneme is a formant target with a short glide, which gives a Speak & Spell–style educational-film voice.
- **Spelling:** the script carries a hand-written phonetic spelling, one phonetic word per subtitle word. Those word timings drive the subtitles.
- **Intonation:** pitch falls across each line, stressed syllables bump up, and questions rise at the end.
- **Two voices:** the narrator is around 98 Hz. A higher "child" voice (208 Hz, formants scaled 1.17×) asks the questions, and its subtitles are italic and pale green.
- **Mix:** the music ducks under the voice, and the voice goes through the same tape wow and flutter, so it's in the offline render too.

**Why not speechSynthesis:** it isn't routed through WebAudio, it differs between operating systems, it can't be time-locked to the bar grid, and it wouldn't appear in `SONG.render()`. The cost of the synthesized voice is intelligibility, which is why every line is also subtitled.

**The script** (bar = song bar; the time is from the click):

| bar | time | voice | line |
|---|---|---|---|
| 4.5 | 0:12.3 | narrator | This is a meadow. |
| 6.6 | 0:18.0 | narrator | Everything here is counting. |
| 9.0 | 0:24.5 | narrator | The grass counts the wind. |
| 12.5 | 0:34.1 | narrator | Look closer at the flower. |
| 14.6 | 0:39.8 | narrator | The seeds turn by the golden angle. |
| 16.8 | 0:45.8 | narrator | Thirty-four one way. Fifty-five the other. |
| 19.0 | 0:51.8 | narrator | Every seed is a smaller flower. |
| 20.8 | 0:56.7 | child | And every flower is a seed. |
| 22.5 | 1:01.4 | narrator | The bees learned it first. |
| 24.5 | 1:06.8 | narrator | Six sides. No gaps. No waste. |
| 26.8 | 1:13.1 | narrator | Then the stones learned it too. |
| 29.0 | 1:19.1 | child | How long did they practise? |
| 30.6 | 1:23.5 | narrator | A very long time. |
| 32.6 | 1:28.9 | narrator | Now look up. |
| 34.5 | 1:34.1 | narrator | The horizon does not end. It folds. |
| 37.0 | 1:40.9 | narrator | That is the same field, above you. |
| 39.6 | 1:48.0 | narrator | We walked there as children. |
| 41.6 | 1:53.5 | child | We are still walking there. |
| 44.6 | 2:01.6 | narrator | Follow the line of poles. |
| 46.8 | 2:07.6 | narrator | They do not get smaller. |
| 49.0 | 2:13.6 | narrator | The further they go, the taller they grow. |
| 51.8 | 2:21.3 | narrator | Do not count them. |
| 53.6 | 2:26.2 | child | I counted them. |
| 56.6 | 2:34.4 | narrator | This film was made a long time ago. |
| 59.0 | 2:40.9 | narrator | It is still playing. |
| 60.6 | 2:45.3 | child | Is that us? |
| 61.8 | 2:48.5 | narrator | You are watching it now. |
| 64.5 | 2:55.9 | narrator | The sun goes down at the usual time. |
| 67.0 | 3:02.7 | narrator | This is the end of the lesson. |
| 69.2 | 3:08.7 | narrator | Remember the number. |
| 71.2 | 3:14.2 | child | What was the number? |

The answer flashes for two frames just before the film burns: 89, the next Fibonacci number after 34 and 55.

## Tricks

- **One shader, five worlds:**
  - The meadow is a heightfield wrapped onto the inside of a cylinder of radius `Rc`. At `Rc = 10⁴` it's flat. Shrinking it to 20 folds the horizon up into the sky, and since the terrain is mirrored around the path, the seam overhead stays invisible.
  - The seed head is an exact self-similar zoom. Each 256-seed Vogel head (r = √n, θ = n·137.5°) holds a 40× smaller copy in its central seed, and the camera's spin is chosen so the loop is seamless. The nearest-seed search only looks at indices whose radius is within ±1.3.
  - The basalt is a hex-cell walker, not an SDF. Each step goes to the nearer of the cell edge or the column top, and a short second walk gives the long shadows.
  - The poles scale with distance (s = 1 + z/55). Their wires are two-segment sags, intersected analytically against the ray and anti-aliased by angular distance. Their lamps are analytic glows.
- **TV recursion:** the scene shader samples last frame's composite onto the TV screen, with barrel distortion, scanlines, a phosphor tint and a gain below 1, so it converges as genuine video feedback.
- **Feedback dissolves:** cuts dissolve through the feedback buffer, which is slightly zoomed each frame so ghosts drift outward. Cuts are also marked by light leaks and film cue marks.
- **Film and tape pass:** chroma is blurred and offset while luma stays sharp (VHS bleed), plus halation from the mip chain, lifted teal blacks, warm faded highlights, gate weave, grain, dust, a scratch, a tracking band during the tape sags, a one-off frame roll and the burn-out.
- **Music:** the master runs through a delay line modulated by wow (0.43 Hz and 0.17 Hz) and flutter (6 Hz). Its delay time is also automated:
  - three "motor sags", where the pitch dips and recovers at section changes
  - a quadratic ramp at the end, which makes a real tape stop
  - then tanh saturation, a 7 kHz low-pass, vinyl crackle and hiss

  The drums are swung boom-bap at 88 BPM. The pads are detuned saws with slowly drifting detune. The harmony is D minor with a flattened-second (Eb) unease section.

## What I invented beyond the brief

- the school-film framing: leader countdown, chapter cards, the "fig." diagrams, the rewind-the-tape end card, the cue marks
- the 34/55/89 counting thread through the script
- the honeycomb-to-basalt rise
- the upside-down children on the folded field
- the poles that grow with distance, and the moon that grows as you leave
- the self-containing television, and the TV-speaker filter on the music
- the closing reveal that the fields are seeds of a flower

## Not verified

I haven't heard the music or watched the film. Checks run (all pass):
- **audio:** peak 0.87, no NaNs, about −12 to −14 dB RMS per section, quieter leader and tail
- **e2e:** sound at the click, no errors
- **clearance:** min 0.3 at the TV close-up, 0 s inside geometry

Things I can't confirm:
- How intelligible the formant voice is. It's crude by design, and the subtitles carry the meaning.
- Frame rate on slower GPUs. The scene renders at about 0.48 MP and scales down automatically if frames take longer than 24 ms.
