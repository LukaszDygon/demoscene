// ONE SECOND - soundtrack. 60 BPM (one beat = one second), 25 bars, about 100 s.
// The same scheduler runs live and offline (SONG.render), so check.mjs audio can measure it.
var SONG=(()=>{
const BPM=60,BAR=240/BPM,BEAT=60/BPM,BARS=25,LEN=BARS*BAR+2;
const HIT=97,END=99.2;                        // the massive hit lands with the snap; silence from END
const VOICES=[73.42,87.31,110],PARTS=6;       // D2 F2 A2, six octave partials each
// ticks: the interval grows from 0.5 s to about 4 s, so the clock slows down
const TICKS=[];for(let t=.5;t<HIT-1;t+=.5*Math.exp(t/32))TICKS.push(t);
const hv=s=>s<32?.4:s<72?.7:.95;              // heartbeat level by time
function setup(A,base){
 const SR=A.sampleRate;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const sweep=(t,dur,f0,f1,v,to)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  o.connect(g);g.connect(to);o.start(t);o.stop(t+dur)};
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const noise=(t,dur,type,f,q,v,to)=>{const s=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());
  s.buffer=NB;fl.type=type;fl.frequency.value=f;fl.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  s.connect(fl);fl.connect(g);g.connect(to);s.start(t,Math.random());s.stop(t+dur)};
 // master chain: compressor, a generated reverb IR, and a hard silence after END
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.7,comp);
 master.gain.setValueAtTime(.7,base+END);master.gain.linearRampToValueAtTime(0,base+END+.15);
 const IR=A.createBuffer(2,SR*2.5|0,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}
 const cv=A.createConvolver();cv.buffer=IR;
 const bus=G(1,master,cv);cv.connect(G(.5,master));
 // Shepard strings, built once outside the bags. Each partial glides up one octave over the piece and its
 // level is a bell in log-frequency, so partials fade out at the top as they come in at the bottom.
 const lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;lp.connect(master);
 const str=A.createGain();str.gain.setValueAtTime(0,base);str.gain.linearRampToValueAtTime(.22,base+8);str.connect(lp);
 const N=HIT*10+1;
 for(const v of VOICES)for(let k=0;k<PARTS;k++){
  const f0=v*2**k,o=A.createOscillator(),g=A.createGain(),C=new Float32Array(N);
  for(let i=0;i<N;i++){const x=(Math.log2(f0)+i/10/HIT-8)/1.6;C[i]=.07*Math.exp(-x*x/2)}
  o.type='sawtooth';o.frequency.setValueAtTime(f0,base);o.frequency.exponentialRampToValueAtTime(2*f0,base+HIT);
  g.gain.setValueCurveAtTime(C,base,HIT);
  o.connect(g);g.connect(str);o.start(base);o.stop(base+LEN);
 }
 const heart=(t,v)=>{sweep(t,.25,58,34,.9*v,bus);sweep(t+.3,.2,58,34,.55*v,bus)};
 const tick=t=>noise(t,.03,'bandpass',3200,4,.12,bus);
 function hit(t){
  sweep(t,2.4,120,28,1,bus);
  noise(t,2.6,'lowpass',500,.7,.9,bus);
  noise(t,1.6,'highpass',2500,.5,.35,bus);
  for(const d of[0,.04,.1])noise(t+d,.35,'bandpass',1800,1.5,.5,bus);   // three shots
 }
 function bar(b,t){
  const s=b*BAR,at=x=>t+x-s;
  for(const x of TICKS)if(x>=s&&x<s+BAR)tick(at(x));
  for(let k=0;k<4;k++){const x=s+k*BEAT;if(x>=8&&x<96)heart(at(x),hv(x))}
  if(HIT>=s&&HIT<s+BAR)hit(at(HIT));
 }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: the same code, with bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,HIT,END}})();
