The 16k intro is built: **THE DAILY FLUX**, a one-minute black-and-white newspaper demo with a 70s muzak soundtrack.

**File:** `dist/the-daily-flux-16k.haiku-5.5-medium.html`, a single self-contained HTML file. Open it in Chrome, Edge or Safari, then click or press a key to print the edition; the sound starts on that click.

**Size:** 12,943 bytes total against a 16,384 budget. The soundtrack is 4,091 bytes against a 4,096 sub-budget. The build inlines `src/music.js` and `src/main.js` and light-minifies them (indentation and comments stripped).

**What happens (about 60 s, 20 headlines):**
- Each headline slams onto the page with a rubber "BREAKING" or "EXTRA!" stamp, a camera shake and a white flash.
- Headlines hold for one or two bars (about 2 to 4 s), so the pace is quick and gets quicker in places.
- Body copy types out under a halftoned black-and-white "photo". The photos are procedural: skyline, UFO, moon, tiger stripes, falling chart, robot, disco ball, rainbow.
- A ticker runs across the bottom, a rolling press band passes over the page, and the piece ends on an END OF EDITION card that fades to black.

**Sound:** a 116 BPM lounge loop with electric piano, vibraphone, pad strings, walking bass and brushed drums. Each headline gets a brass sting with a kick. Later sections build tension with snare rolls.

**Assumptions I made:**
- The newspaper is fictional ("The Daily Flux"), with invented headlines in a 1970s register. No real people or brands.
- Fonts are OS fonts: Impact for headlines and Georgia for body text, with fallbacks. Nothing is embedded.
- WebGL2 and WebAudio are required. The headless test used Chrome.
- The story timeline is set by the bar durations in `DUR` in `src/music.js`. Visuals read the audio clock, so they stay in sync.

**Checks I ran (headless only, nothing was opened on your screen):**
- Click to first sound: 0.0 s, no uncaught exceptions or console errors.
- Offline audio render: no NaN samples, peak 0.785, steady levels around -23 dB, with a fade at the end.
- Frame captures at 1, 9, 13, 16, 24, 30, 33, 42, 51 and 57 s were reviewed in a contact sheet, and two layout issues were fixed (stamp overlapping body copy, halftone box on the end card).

**Not verified:** I have not listened to the music. I only measured it. Real-time audio stutter on slow machines is also untested.

**Files:**
- Sources: `src/index.html`, `src/music.js`, `src/main.js`
- Build: `build.py` (run `python3 build.py`)
- Shipped soundtrack for budget checks: `dist/music.shipped.js`
