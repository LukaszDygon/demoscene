# Audio scheduling pattern

One function builds the song on *any* context, so the same code plays live (instant start) and renders offline (for `check.mjs audio`). Instruments, timbres, harmony and arrangement are entirely yours; only the scheduling skeleton below is load-bearing.

```js
var SONG=(()=>{
const BPM=90,BAR=240/BPM,BARS=48,LEN=BARS*BAR+5;
// Builds the graph on ctx with song time 0 at context time `base`. Returns sched(barIndex).
function setup(A,base){
 const SR=A.sampleRate;               // live contexts are often 48 kHz: never hard-code 44100 for buffers
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 // --- master chain (long-lived: build before the bags start) ---
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.6,comp);
 // tape wobble / chorus: ONE modulated delay on the mix, not an LFO on every oscillator (that's slow)
 // reverb: ConvolverNode with a generated decaying-noise IR at SR
 // --- instruments: functions (t, note, ...) that create nodes through G/O (so they land in the bag) ---
 function bar(b,t){ /* arrangement: schedule everything for bar b at context time t */ }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}   // prune nodes from 3 bars ago
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays → sound within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
```

Playback: `actx=new AudioContext(); await actx.resume(); song=SONG.live(actx, startSec)`. Then every frame `t = actx.currentTime - song.base`.

Why it's shaped like this:
- **Pruning matters.** Without the bags, every finished note stays connected, so the renderer walks thousands of dead nodes each 128-sample quantum. Offline render time went from 46 s to 11 s for a 2.5-minute song when bags were added. If a sound rings longer than ~2.5 bars, raise the lag (`b-3`) or create it outside the bags.
- **Live needs headroom.** If a dense arrangement crackles in real time, thin it out or fall back to playing a pre-rendered buffer behind a progress bar.
- **Automation in bars.** Write filter sweeps and fades as `base + bar*BAR` so they stay locked to the music in both modes.
