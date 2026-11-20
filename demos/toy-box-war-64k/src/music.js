var SONG=(()=>{
const BPM=100,BAR=240/BPM,BARS=46,Q=BAR/4,LEN=BARS*BAR+4,mt=m=>440*2**((m-69)/12);
// chords per 8-bar cycle: D A Bm G D G A D (root midi, minor flag)
const CH=[[50,0],[45,0],[47,1],[43,0],[50,0],[43,0],[45,0],[50,0]];
// anthem phrases (midi, beats); 0 = rest; each phrase is 32 beats = 8 bars
const P1=[[62,2],[66,1],[69,3],[67,1],[66,1],[64,2],[62,2],[0,2],[62,2],[66,1],[69,3],[71,1],[69,1],[67,2],[66,2],[0,2],[62,4]];
const P2=[[69,2],[71,2],[74,4],[72,2],[71,2],[69,4],[66,2],[62,4],[0,4],[62,2],[66,2],[69,2]];
const K1=[[57,2],[59,2],[62,4],[64,2],[62,2],[59,4],[57,2],[62,2],[66,2],[62,2],[59,4],[57,4]];
const K2=[[62,8],[66,4],[69,8],[66,4],[62,8]];
// cap-gun pops, in bars (matched to explosions in main.js)
const PO=[16.5,18.5,19.5,21,22.5,24,29.5,31,33];
// Builds the graph on ctx with song time 0 at context time `base`. Returns sched(barIndex).
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[];let s=7;const rnd=()=>(s=s*16807%2147483647)/2147483647;
 const keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=A.createGain();g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 // long-lived master chain: compressor, reverb send, kazoo band-pass, drum bus
 const comp=A.createDynamicsCompressor(),mo=G(.6,A.destination);comp.connect(mo);
 const verb=A.createConvolver(),IR=A.createBuffer(2,SR*1.8|0,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(rnd()*2-1)*(1-i/d.length)**3}
 verb.buffer=IR;verb.connect(comp);
 const NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=rnd()*2-1;
 const PN=G(.6,comp,verb),KZ=A.createBiquadFilter(),DR=G(.9,comp);
 KZ.type='bandpass';KZ.frequency.value=1000;KZ.Q.value=1.6;KZ.connect(comp);
 // voices: each note is an oscillator with an exponential envelope, kept in the bag for pruning
 const env=(g,v,t,d)=>{g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(1e-4,t+d)};
 const osc=(type,f,t,d,v,to)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.type=type;o.frequency.value=f;env(g,v,t,d);o.connect(g);g.connect(to);o.start(t);o.stop(t+d+.05);return g};
 const nz=(t,d,v,type,f,qq,to)=>{const src=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());src.buffer=NB;fl.type=type;fl.frequency.value=f;fl.Q.value=qq;env(g,v,t,d);src.connect(fl);fl.connect(g);g.connect(to);src.start(t,rnd()*.9);src.stop(t+d+.05);return fl};
 // instruments
 const pn=(m,t,d,v)=>{osc('sine',mt(m),t,d,v,PN);osc('sine',mt(m)*4.02,t,d*.3,v*.15,PN)};      // toy piano / music box
 const kz=(m,t,d,v)=>osc('sawtooth',mt(m),t,d,v,KZ);                                            // kazoo-ish lead
 const sn=(t,v)=>{nz(t,.14,v,'bandpass',1900,1.2,DR);osc('triangle',190,t,.09,v*.6,DR)};         // marching snare
 const kk=t=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(40,t+.16);env(g,.9,t,.35);o.connect(g);g.connect(DR);o.start(t);o.stop(t+.4)};
 const pop=(t,v)=>{nz(t,.04,v,'highpass',1800,.7,DR);const o=keep(A.createOscillator()),g=keep(A.createGain());o.frequency.setValueAtTime(700,t);o.frequency.exponentialRampToValueAtTime(140,t+.1);env(g,v*.6,t,.12);o.connect(g);g.connect(DR);o.start(t);o.stop(t+.14)};
 const clk=t=>nz(t,.012,.5,'highpass',3500,.7,DR);
 // one bar: everything that starts in bar b, at context time t
 function bar(b,t){
  const[r,mi]=CH[b==43?0:b%8],c3=mi?3:4,sl=b>=27&&b<33;
  const mel=(L,b0,f)=>{const k=b-b0;if(k<0)return;const o=(k%8)*4;let x=0;for(const[m,d]of L){if(m&&x>=o&&x<o+4)f(m,t+(x-o)*Q,d*Q);x+=d}};
  if(b<3)for(let k=0;k<8;k++)pn(r+12+[0,c3,7,12][k%4],t+k*Q/2,1.2,.12);      // music-box intro
  if(b==3)clk(t);                                                              // desk lamp click
  if(sl)sn(t,.35);                                                             // slow-motion pulse
  else if(b>=4&&b<42){kk(t);kk(t+2*Q);sn(t+Q,.55);sn(t+3*Q,.55);if(b>=16&&b<22)for(let k=0;k<8;k++)sn(t+k*Q/2,.1)}
  if((b>=3&&b<42&&!(sl&&b%2))||b==43){const d=b==43?BAR*2.5:sl?BAR*2:BAR*.9;   // brass chords in toy-piano timbre
   for(const n of[r+12,r+12+c3,r+19,r+24])pn(n,t,d,.05)}
  if(b>=10&&b<27&&!sl)for(let k=0;k<8;k++)osc('triangle',mt(r-12),t+k*Q/2,Q*.45,.25,DR);   // bass
  if(b>=4&&b<16)mel(P1,4,(m,x,d)=>pn(m,x,d,.2));
  if(b>=33&&b<41)mel(P2,33,(m,x,d)=>pn(m,x,d,.2));
  if(b>=10&&b<27&&!sl)mel(K1,10,(m,x,d)=>kz(m,x,d,.12));
  if(sl)mel(K2,27,(m,x,d)=>kz(m,x,d,.14));
  if(b>=33&&b<41)mel(K1,33,(m,x,d)=>kz(m,x,d,.12));
  if(b==13){const f=nz(t,BAR*2,.4,'bandpass',200,2,DR);f.frequency.exponentialRampToValueAtTime(2600,t+BAR*2)}   // sock avalanche
  for(const p of PO)if(p>=b&&p<b+1){const x=t+(p-b)*BAR;pop(x,.8);for(let k=1;k<4;k++)pop(x+k*.07,.4/k)}
  if(b==43){pn(r+12,t,BAR*2.5,.2);pn(r+24,t+Q,BAR*2.5,.12)}                   // final tonic
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
