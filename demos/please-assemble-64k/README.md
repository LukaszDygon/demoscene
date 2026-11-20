# PLEASE ASSEMBLE — assembly kit nº 7/8

A 64k browser intro, the bright toy-box end of IDM: a cheerful speech chip walks you through eight assembly steps, and the impossible objects you build only work from one side. Penrose stairs, a Reutersvärd triangle, a room with three floors, Necker cubes, a Möbius ribbon, and a tower that rebuilds itself every time the camera turns.

**Run:** open `dist/please-assemble-64k.opus-5.5-medium.html` in Chrome, Safari or Firefox (WebGL2) and click. Sound starts right away, because the music is synthesized live a bar ahead.

**Build:** `python3 build.py` packs `src/` into the dist file (and `dist/music.min.js` for measuring). It fails if the page goes over 65 536 bytes or the soundtrack over 16 384 bytes.

**Debug:** `?t=120` starts at 120 s, `?mute` runs silently on the wall clock.

| file | what |
|---|---|
| `src/demo.js` | instanced mesh renderer (box, faceted sphere, cylinder, cone, Möbius strip), shadow map, the impossible-object tricks, scenes, 2D overlay (captions, tags, icons, page wipes) |
| `src/music.js` | soundtrack plus the speech chip: song structure, narration script and word timings, which the visuals read too |
| `src/shell.html` | page and start card |

## Size

| | bytes | budget |
|---|---|---|
| total | 46 718 | 65 536 |
| music (`dist/music.min.js`, includes the speech synth and script) | 15 033 | 16 384 |

Raw and uncompressed (gzip: about 20.1 KB). No packer.

## Timeline (132 BPM on a constant eighth-note grid; the meter shifts per step)

| bars | time | meter | step | scene | music |
|---|---|---|---|---|---|
| 0–3 | 0:00 | 7/8 | title | the closed kit box hops on each downbeat; PLEASE ASSEMBLE stamps in letter by letter | music box and clockwork ticks |
| 4–15 | 0:06 | 7/8 | 1 · Open the box | flaps pop open on four eighths; 78 pieces (cubes, pawns, cones, gears, tiny ribbons, wire cubes…) jump out one per eighth and click into a row; the camera pans sideways along it; number tags count up, then all turn into ∞ | ticks, then soft kick and woodblock, then bass |
| 16–31 | 0:25 | 7/8 | 2 · Build a staircase | Penrose stairs: 24 candy steps drop in one per eighth; three pawns climb for ever while marbles roll down the same steps; a quarter turn shows it's an open spiral ("DO NOT LOOK"), turn back; two more rings stack up as the camera climbs | full 7/8 groove (2+2+3), glockenspiel lead, music-box sparkle, organ stabs, ratchets |
| 32–43 | 0:51 | 5/4 | 3 · Join the corners | Reutersvärd triangle of 15 cubes clicks together on the grid; a quarter turn shows the corners aren't touching ("NOT TOUCHING"); the ground shadow always shows the truth; then five fast turns where the cubes fly apart and re-form the triangle each time | toy piano lead (FM), prepared-piano plinks, 3+3+2+2 drums |
| 44–55 | 1:18 | 4/4 + 3/4 | 4 · Choose a down | the room unfolds from a flat-pack net: two walls hinge up on the beat. In the room corner each of the three walls is a floor, with stairs, an arch, a ticking gear and pawns on each; the camera rolls 120° per instruction and six balls fall to the new "down" and roll back to their spots; nine pawns march a triangle that crosses all three floors | glockenspiel and music box, organ, alternating bars |
| 56–67 | 1:37 | 4/4 | 5 · Look at the cube | a hero wire cube clicks together edge by edge and its face snaps in, then a field of cubes ripples out and the camera scrolls sideways over them. The spinning wire cubes whose depth order is mirrored on the beat, so they seem to spin backwards; tags say ?, then YES/NO; at "neither" the camera settles into true isometric and every cube becomes a flat hexagon | busiest, most micro-edited drums, melodic stutters, plinks |
| 68–79 | 1:59 | 7/8 | 6 · Paint the ribbon | a candy-striped Möbius strip draws itself on, then ticks round; a pawn walks two laps and paints it pink in one stroke, inside and "outside"; cubes ride the strip like a conveyor | waltzing music box, detune creeping in, soft rim drums |
| 80–81 | 2:18 | 5/4 | 6½ | everything freezes; a dotted fold line and scissors; the whole picture folds away | the music box winds down and sags out of tune |
| 82–101 | 2:23 | 7+7+7+10 | 7 · Climb | an endless tower of stairs, triangles, gears and ribbons; the camera climbs, turns 90° every two bars and every level re-forms; the room rolls upside down at "fold the room", and back at "up is also down"; extra triangles appear at "too many corners"; confetti; the step badge glitches 7/8/A/∞ | climax: everything, toy-piano counter-melody, fills; the last four bars lift a semitone |
| 102–113 | 2:58 | 7/8 | 8 · Put it all back | the camera pans back along the row while every piece arcs into the box; the flaps close, the box flattens to a square and shrinks to a dot; ASSEMBLY COMPLETE end card | drums thin out, fanfare, ticks, final bell chord |
| | 3:17–3:22 | | | end card holds | reverb tail |

Each step change has a page-turn wipe on the overlay, synced to a swoosh and a glockenspiel ding in the music.

## Narration

The narration has two parts that run together:

- **Voice:** a toy "speech chip" synthesized in WebAudio inside `music.js`, so it is in the offline render, in sync with the music, and sounds the same on every OS. A sawtooth glottal source goes through three bandpass formant filters, and a noise source handles fricatives and plosive bursts. Each line's phonemes are written by hand in a small phonetic alphabet. The voice is lightly bit-crushed (a 4-bit waveshaper) and pitched on a sing-song pattern taken from the song's key (D major), and the music ducks under it. Later lines get a "glitch" amount, which adds random pitch jumps and stuttered syllables ("ha- ha- half").
- **Text:** an instruction-manual caption card at the bottom with the step badge. Each word lights up as the chip says it, karaoke-style, using word times computed from the same phoneme plan. The card is the main channel. The chip sounds like a speech toy and is only partly intelligible.

Script (cue = bar.eighth):

| cue | time | line |
|---|---|---|
| 1.0 | 0:01.6 | Hello! I am your assembly kit. |
| 4.0 | 0:06.4 | Step one. Open the box. |
| 8.0 | 0:12.7 | Count the pieces. |
| 10.0 | 0:15.9 | There should be infinity. |
| 13.0 | 0:20.7 | Good counting! |
| 16.0 | 0:25.5 | Step two. Build a staircase. |
| 21.0 | 0:33.4 | Climb it. Keep climbing. |
| 25.0 | 0:39.8 | Please do not look behind the stairs. |
| 29.0 | 0:46.1 | Thank you. You are back at the bottom. |
| 32.0 | 0:50.9 | Step three. Join the three corners. |
| 36.0 | 1:00.0 | Turn the room a quarter turn. |
| 38.4 | 1:05.5 | Some corners are farther away than they look. |
| 41.2 | 1:11.8 | Ignore the shadow. |
| 44.0 | 1:18.2 | Step four. Choose which way is down. |
| 48.0 | 1:24.5 | Choose again. |
| 50.0 | 1:27.7 | Down is now to the left. |
| 52.0 | 1:30.9 | Down is now behind you. |
| 54.0 | 1:34.1 | Good. Stay there. |
| 56.0 | 1:37.3 | Step five. Look at the cube. |
| 59.0 | 1:42.7 | Is it facing you? Is it facing away? |
| 62.0 | 1:48.2 | Both answers are correct. |
| 64.4 | 1:52.7 | Neither answer is correct. *(slight glitch)* |
| 68.0 | 1:59.1 | Step six. Paint the inside of the ribbon pink. |
| 73.0 | 2:07.0 | Now paint the outside pink. |
| 76.0 | 2:11.8 | There is no outside. |
| 80.0 | 2:18.2 | Step six and a ha- ha- half. *(heavy glitch)* |
| 82.0 | 2:22.7 | Step seven. Place step eight before step seven. |
| 87.0 | 2:31.4 | Fold the room along the dotted line. |
| 91.0 | 2:38.4 | Insert yourself into slot A. |
| 94.0 | 2:43.9 | You have too many corners. This is normal. |
| 98.0 | 2:50.9 | Keep climbing. Up is also down. *(most glitched)* |
| 102.0 | 2:58.0 | Step eight. Put everything back in the box. |
| 106.0 | 3:04.3 | Including the stairs. Including you. |
| 110.0 | 3:10.7 | Assembly complete. Thank you for playing! |

## How the impossible objects work

- **The camera is orthographic,** so moving any object along the view axis (1,1,1) leaves the picture unchanged. The Penrose stairs (flights of 10, 10, 2 and 2 steps, each rising a third of a tread) and the Reutersvärd triangle (5+5+5 cubes) are real open 3D shapes. Their two ends are exactly (8,8,8) or (5,5,5) apart, so from the magic angle they close. Walkers that pass the seam teleport by that same vector, which is invisible from the front and obvious from the side.
- **Fixing the seam:** the triangle needs one bit of occlusion that no real object has. The first three cubes write a stencil bit, and the last two cubes are not drawn there. This only happens while the camera is exactly at the magic angle. During a turn everything renders honestly.
- **Re-forming:** to rebuild on a turn, the design is rotated by the same quarter turn as the camera. Each piece flies, staggered, from its old place to its new one, so the picture is identical at both ends of the turn and in pieces in the middle.
- **Necker cubes:** each instance can mirror its depth around its own centre in the vertex shader. In orthographic view that leaves the image the same and swaps what is in front, so a spinning wire cube appears to reverse direction on the beat.
- **The room** is one set of furniture copied onto three walls by the 120° rotation about (1,1,1). Rolling the camera by 120° maps the room onto itself, and only "down" changes.
- **The Möbius ribbon** is painted in the fragment shader from `gl_FrontFacing` and the strip parameter. The two faces form one continuous 0–1 range, so a single stroke covers both "sides".
- **Rendering:** flat shading comes from screen-space derivatives. Ink edges on boxes are computed from local coordinates and the instance scale (about 1.5 px wide at any zoom). The shadows are crisp, lavender-tinted and come from a 2048² shadow map. A graph-paper grid on every floor plane is chosen by the surface normal, plus paper grain and a vignette in the background.

## What I invented beyond the brief

The kit-box framing, with steps, a contents list, number tags, "click" stickers, turn and gravity icons, page-turn wipes and an end card that tallies the pieces. Marbles rolling down the stairs the pawns climb up. Shadows that tell the truth the picture hides. The room whose three walls are all floors, with a pawn procession that crosses all three. The ribbon painted in one stroke. The music box winding down at step 6½, and the picture folding away. The tower that rebuilds itself on every turn. The semitone lift at "up is also down".

## Not verified

I measured the music offline but haven't heard it. I don't know how intelligible the speech chip is (the caption card carries the words regardless). I checked the visuals by reasoning and with coarse pixel probes, not by watching. The CSS fold at step 6½ uses a 3D transform on the WebGL canvas, which should work in every modern browser but I haven't seen it.
