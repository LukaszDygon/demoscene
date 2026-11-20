// RUST CONVOY - soundtrack. 96 BPM, 42 bars (105 s) plus a tail. The same scheduler runs live and offline.
var SONG=(()=>{
const BPM=96,BEAT=60/BPM,BAR=4*BEAT,BARS=42,LEN=BARS*BAR+3;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const K=(k,t)=>{let i=0;while(i<k.length-2&&t>k[i+1][0])i++;const a=k[i],b=k[i+1];return a[1]+(b[1]-a[1])*ss(a[0],b[0],t)};
const mf=m=>440*2**((m-69)/12);
// tanker speed (units/s), and the time warp that stretches the canyon hang (real time 61-69 s)
const VK=[[0,8],[9,18],[20,26],[34,34],[49,36],[60,38],[67,36],[72,0],[999,0]];
const WARP=t=>1-.8*ss(61,63,t)*(1-ss(67,69,t));
const SPD=t=>K(VK,t)*WARP(t);
// distance travelled by the convoy, integrated once in 10 ms steps
const ZT=new Float32Array(LEN*100+3);for(let i=1;i<ZT.length;i++)ZT[i]=ZT[i-1]+SPD((i-1)*.01)*.01;
const Z=t=>{const x=Math.max(0,t)*100,i=Math.min(x|0,ZT.length-2);return ZT[i]+(ZT[i+1]-ZT[i])*(x-(x|0))};
// builds the graph on ctx with song time 0 at context time `base`; returns sched(bar)
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
 const SH=k=>{const w=A.createWaveShaper(),c=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}w.curve=c;return w};
 let sd=5;const rnd=()=>(sd=sd*16807%2147483647)/2147483647*2-1;
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rnd();
 const IR=A.createBuffer(2,SR*3|0,SR);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=rnd()*(1-i/d.length)**3}
 // ---- long-lived master chain ----
 const comp=A.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=6;comp.attack.value=.002;comp.connect(A.destination);
 const master=G(.27,comp);
 master.gain.setValueAtTime(0,base+63);master.gain.setValueAtTime(.27,base+67.5);   // the canyon hang is silent
 master.gain.setValueAtTime(.27,base+101);master.gain.linearRampToValueAtTime(0,base+LEN);
 const rev=A.createConvolver();rev.buffer=IR;rev.connect(G(.5,master));
 const dsh=SH(4);dsh.connect(master);const dIn=G(.9,dsh);                 // distorted tribal drums
 const gsh=SH(12),gtr=F('lowpass',2400,.7,master,rev);gsh.connect(gtr);     // distorted saw lead
 const bp=F('lowpass',380,2,master,rev);                                    // pulse bass
 const pf=F('lowpass',800,.5,master,rev);                                   // end pad
 // engine drone: three oscillators whose pitch follows the tanker's speed (sampled every 1/4 s)
 const dsh2=SH(2);dsh2.connect(master);const dlp=F('lowpass',200,3,dsh2),dg=G(0,dlp);
 const os=[0,1,2].map(i=>{const o=A.createOscillator();o.type=i==2?'sine':'sawtooth';o.detune.value=i*9;o.connect(dg);o.start(base);o.stop(base+LEN);return o});
 os.forEach(o=>o.frequency.setValueAtTime(34,base));dlp.frequency.setValueAtTime(200,base);
 for(let s=0;s<=LEN;s+=.25){const f=34+.8*SPD(s);os.forEach(o=>o.frequency.linearRampToValueAtTime(f,base+s));dlp.frequency.linearRampToValueAtTime(160+10*SPD(s),base+s)}
 dg.gain.setValueAtTime(0,base);dg.gain.linearRampToValueAtTime(.22,base+6);dg.gain.setValueAtTime(.22,base+62);
 dg.gain.linearRampToValueAtTime(.32,base+70);dg.gain.setValueAtTime(.32,base+80);dg.gain.linearRampToValueAtTime(.12,base+92);dg.gain.linearRampToValueAtTime(0,base+LEN-2);
 bag=[];
 // ---- one-shot voices (all land in the bag of the bar that schedules them) ----
 function drum(t,f0,f1,dec,v){const o=keep(A.createOscillator()),e=G(0,dIn);o.connect(e);
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.4);
  e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+dec);o.start(t);o.stop(t+dec+.05)}
 function hit(t,dur,f,q,v,type,to){const s=keep(A.createBufferSource()),e=G(0,to||master),x=F(type||'bandpass',f,q,e);
  s.buffer=NB;s.connect(x);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+dur);s.start(t,Math.abs(rnd())*1.5);s.stop(t+dur+.05)}
 function lead(t,m,d,v){const e=G(0,gsh);[0,1].forEach(i=>{const o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m)*(1+i*.004);o.connect(e);o.start(t);o.stop(t+d+.05)});
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.02);e.gain.setValueAtTime(v,t+d*.75);e.gain.linearRampToValueAtTime(0,t+d)}
 function pluck(t,m,d,v){const e=G(0,bp),o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m);o.connect(e);o.start(t);o.stop(t+d+.05);
  e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+d)}
 function pad(t,ms,d,v){ms.forEach(m=>[-8,8].forEach(c=>{const e=G(0,pf),o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m);o.detune.value=c;o.connect(e);o.start(t);o.stop(t+d+.05);
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+1.5);e.gain.linearRampToValueAtTime(0,t+d)}))}
 function bell(t,m,v){[1,2.76,5.4].forEach((r,i)=>{const e=G(0,master,rev),o=keep(A.createOscillator());o.frequency.value=mf(m)*r;o.connect(e);o.start(t);o.stop(t+5);
  e.gain.setValueAtTime(v/(i+1),t);e.gain.exponentialRampToValueAtTime(.001,t+4/(i+1))})}
 function boom(t){const e=G(0,master,rev),o=keep(A.createOscillator());o.connect(e);o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(22,t+2.5);o.start(t);o.stop(t+3.6);
  e.gain.setValueAtTime(1.2,t);e.gain.exponentialRampToValueAtTime(.001,t+3.4);hit(t,2.8,500,.6,.7,'lowpass')}
 function riser(t,d){const s=keep(A.createBufferSource()),e=G(0,master,rev),x=F('bandpass',300,3,e);s.buffer=NB;s.loop=true;s.connect(x);s.start(t);s.stop(t+d+.05);
  x.frequency.setValueAtTime(300,t);x.frequency.exponentialRampToValueAtTime(5000,t+d);e.gain.setValueAtTime(.001,t);e.gain.exponentialRampToValueAtTime(.4,t+d)}
 // ---- arrangement, bar by bar ----
 const RF=[62,62,65,67,69,67,65,62,60,60,62,65,67,65,64,62];
 function bar(b,t){const B=x=>t+x*BEAT,K1=x=>drum(B(x),120,40,.45,.9),T1=x=>drum(B(x),200,95,.22,.5),S1=x=>hit(B(x),.04,6500,.8,.12),SP=x=>hit(B(x),.25,3200,5,.25);
  if(b>=2&&b<4){K1(0);K1(2);T1(3.5)}                                             // 1: tanker alone, a few drums
  if(b>=4&&b<8){K1(0);T1(1);K1(2);T1(3);for(let x=0;x<4;x+=.5)S1(x)}              // 2: dust plume, shaker
  if(b>=8&&b<14){const P=[38,38,41,38,36,38,41,38];for(let x=0;x<4;x++){K1(x);T1(x+.5)}for(let k=0;k<8;k++)pluck(B(k*.5),P[k],.4,.3)} // 3: pack closes in
  if(b>=14&&b<20){K1(0);K1(2);T1(1.5);T1(3);for(let k=0;k<8;k++)lead(B(k*.5),RF[(b%2)*8+k],.3,.2);if(b%2){SP(1.5);SP(3.25)}} // 4: boarding, sparks
  if(b==20){riser(t,BAR*3);lead(t,62,BAR*2.8,.22)}                              // 5: harpoon line
  if(b>=20&&b<23){K1(0);K1(2);for(let x=0;x<4;x+=.25)T1(x)}
  if(b>=23&&b<25){for(let x=0;x<4;x+=.5)K1(x);T1(1);T1(3)}                       // 6: the run-up to the canyon
  if(b>=25&&b<27)return;                                                         // 6: hang, silent
  if(b==27){boom(t);hit(t,3,7000,.6,.3,'highpass');lead(t,74,BAR*1.8,.25)}       // 7: jackknife, blast
  if(b>=27&&b<31){for(let x=0;x<4;x++)K1(x);T1(.5);T1(2.5)}
  if(b>=31&&b<36){K1(0);if(b%2)T1(2)}                                            // 8: dust, quiet
  if(b==36){pad(t,[50,53,57,60,64],BAR*4,.12);bell(t,74,.2)}                     // 8: end card
  if(b==38)bell(t,77,.15);
 }
 function sched(b){bag=[];if(b>4&&BAGS[b-5]){BAGS[b-5].forEach(n=>n.disconnect());BAGS[b-5]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
 sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,Z,SPD,K,ss,BAR,LEN,BARS}})();
