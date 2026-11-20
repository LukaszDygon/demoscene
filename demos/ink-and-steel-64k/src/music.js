// INK & STEEL score: 80 BPM, 4/4, 34 bars (about 102 s). Plucked zither (Karplus-Strong), breathy bamboo flute,
// taiko, metallic clashes, rain and a low drone. Scheduled bar by bar, so the same code plays live and renders offline.
var SONG=(()=>{
const BPM=80,BEAT=60/BPM,BAR=4*BEAT,BARS=34,LEN=BARS*BAR+5;
const SC=[0,3,5,7,10];                                   // D minor pentatonic
const M=d=>50+12*Math.floor(d/5)+SC[((d%5)+5)%5];        // scale degree to MIDI (0 = D3)
const HZ=m=>440*Math.pow(2,(m-69)/12);
const CLASH=[8,9,10.5,12,14,16,18];                      // bars; the visuals use the same bars
function setup(A,base){
 const SR=A.sampleRate;                                  // live contexts are often 48 kHz
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 let seed=20260,walk=0;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.6,comp);
 const rv=A.createConvolver(),IL=Math.floor(SR*2.6),ir=A.createBuffer(2,IL,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<IL;i++)d[i]=(rnd()*2-1)*Math.pow(1-i/IL,3)}
 rv.buffer=ir;rv.connect(G(.45,master));
 const bus=G(1,master,rv);
 const NB=A.createBuffer(1,2*SR|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rnd()*2-1;
 // persistent layers: rain and drone (created outside the bags, so they are never pruned)
 const rg=G(0,master),rl=A.createBiquadFilter(),rain=A.createBufferSource();
 rl.type='lowpass';rl.frequency.value=1500;rain.buffer=NB;rain.loop=true;rain.connect(rl);rl.connect(rg);rain.start(base);
 const dg=G(0,master);
 for(const[m,ty,v]of[[M(0)-12,'sine',.6],[M(0)-5,'triangle',.35]]){const o=A.createOscillator();o.type=ty;o.frequency.value=HZ(m);o.connect(G(v,dg));o.start(base)}
 // Karplus-Strong zither: one cached buffer per pitch
 const KS={};
 function pluck(f){const k=Math.round(f);if(KS[k])return KS[k];
  const N=Math.round(SR/f),L=Math.round(SR*2.2),b=A.createBuffer(1,L,SR),d=b.getChannelData(0);
  for(let i=0;i<N;i++)d[i]=rnd()*2-1;
  for(let i=N;i<L;i++)d[i]=.4965*(d[i-N]+(i>N?d[i-N-1]:0));
  return KS[k]=b}
 function zither(t,m,v){const s=keep(A.createBufferSource());s.buffer=pluck(HZ(m));const g=G(v,bus);s.connect(g);s.start(t)}
 function noise(t,v,d,fq){const n=keep(A.createBufferSource()),f=keep(A.createBiquadFilter()),g=keep(A.createGain());
  n.buffer=NB;f.type='bandpass';f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  n.connect(f);f.connect(g);g.connect(bus);n.start(t,rnd()*1.5,d+.01)}
 function flute(t,m,d,v){const f=HZ(m),e=keep(A.createGain());
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.15);e.gain.setValueAtTime(v,t+d-.2);e.gain.linearRampToValueAtTime(0,t+d);e.connect(bus);
  const o=keep(A.createOscillator()),o2=keep(A.createOscillator()),l=keep(A.createOscillator()),lg=keep(A.createGain());
  o.frequency.value=f;o2.frequency.value=2*f;l.frequency.value=5.2;lg.gain.value=f*.012;l.connect(lg);lg.connect(o.frequency);
  o2.connect(G(.12,e));o.connect(e);
  const n=keep(A.createBufferSource()),bp=keep(A.createBiquadFilter());
  n.buffer=NB;n.loop=true;bp.type='bandpass';bp.frequency.value=f*1.5;bp.Q.value=2.5;n.connect(bp);bp.connect(G(.25,e));
  for(const x of[o,o2,l,n]){x.start(t);x.stop(t+d)}}
 function taiko(t,v){const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(44,t+.2);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+1.25);noise(t,v*.5,.06,2200)}
 function clash(t){[1,2.76,5.4,8.93].forEach((r,i)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.value=700*r;g.gain.setValueAtTime(.16/(i+1),t);g.gain.exponentialRampToValueAtTime(.001,t+1.4-.2*i);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+1.5)});noise(t,.5,.03,5000)}
 // the arrangement, one bar at a time (t = bar start in context time)
 function bar(b,t){
  const B=k=>t+k*BEAT,R=rnd;
  if(b===0){rg.gain.setValueAtTime(0,t);rg.gain.linearRampToValueAtTime(.07,t+2*BAR);dg.gain.setValueAtTime(0,t);dg.gain.linearRampToValueAtTime(.07,t+2*BAR)}
  if(b===22)rg.gain.linearRampToValueAtTime(.035,t+BAR);
  if(b===28){rg.gain.linearRampToValueAtTime(0,t+6*BAR);dg.gain.linearRampToValueAtTime(0,t+6*BAR)}
  CLASH.forEach(c=>{if(Math.floor(c)===b)clash(t+(c-b)*BAR)});
  if(b<7){                                              // standoff: sparse, long still shot
   if(b%2===1)zither(B(0),M(R()*4|0),.28);
   if(b>=3)flute(B(0),M(5+(R()*5|0)),BAR*.92,.13);
   if(b===4||b===6)taiko(B(0),.45);                     // slow heartbeat
   if(b===6)taiko(B(2.5),.25);
  }
  else if(b===7){}                                      // silence before the first clash
  else if(b<19){                                        // chase: taiko, zither walk, flute answers
   const hits=b<12?[0,1,2,2.5,3,3.5]:[0,1,1.5,2,2.5,3,3.5];
   hits.forEach(k=>taiko(B(k),k?.4:.8));
   for(let k=0;k<4;k++){walk=Math.max(0,Math.min(9,walk+(R()*3|0)-1));zither(B(k),M(walk),.22)}
   flute(B(0),M(5+(R()*5|0)),2*BEAT,.15);flute(B(2),M(5+(R()*5|0)),2*BEAT,.15);
  }
  else if(b===19){}                                     // silence before the strike
  else if(b===20){                                      // leap, freeze, slash (beat 2), fall (beat 2.5), bamboo (beat 3)
   taiko(B(0),1);flute(B(0),M(9),BAR*1.4,.2);
   zither(B(2),M(12),.45);clash(B(2));
   taiko(B(2.5),.9);
   noise(B(3),.35,1.8,900);taiko(B(3),.6);
  }
  else if(b===21){zither(B(0),M(0),.3);zither(B(2),M(3),.2);flute(B(0),M(5),BAR*.95,.09)}
  else if(b<28){                                        // aftermath: rain, drone, a note every other bar
   if(b===22)flute(B(0),M(5),BAR*2,.09);
   if(b%2===0)zither(B(0),M(R()*5|0),.2);
  }
  else{                                                 // end: last notes
   if(b===28)zither(B(0),M(0),.25);
   if(b===30)zither(B(0),M(3),.2);
   if(b===32)zither(B(0),M(0),.18);
  }
 }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}   // prune nodes from 3 bars ago
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
// live: schedule each bar about 1.2 s before it plays, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
