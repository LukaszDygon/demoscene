// SILENT FLEET - soundtrack. 72 BPM, 30 bars (100 s). The same scheduler renders live and offline.
var SONG=(()=>{
const BPM=72,BAR=240/BPM,BEAT=60/BPM,BARS=30,LEN=BARS*BAR+6;
const mf=m=>440*2**((m-69)/12);
const PROG=[[50,53,57,60],[46,50,53,57],[43,46,50,53],[45,48,52,55]]; // Dm9, Bb, Gm7, Am: two bars each
const VOW=[[700,1220,2600],[320,800,2400],[300,2300,3000]];          // ah, oo, ee formants
const VSEQ=[[9,0],[13,1],[17,2],[21,0],[25,1],[27,2]];                // [bar, vowel] morph points
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const T=b=>base+b*BAR;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
 const LO=(type,f,to)=>{const o=A.createOscillator();o.type=type;o.frequency.value=f;o.connect(to);o.start(base);o.stop(base+LEN);return o};
 const rampTo=(p,pts)=>pts.forEach(([b,v],i)=>i?p.linearRampToValueAtTime(v,T(b)):p.setValueAtTime(v,T(b)));
 const env=(g,t,a,h,r,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+h);g.gain.linearRampToValueAtTime(0,t+r)};
 // ---- long-lived master chain ----
 const comp=A.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.5;comp.connect(A.destination);
 const master=G(.5,comp);
 // pod reverb: generated stereo IR; beacon echo: delay with dark feedback into the reverb
 const ir=A.createBuffer(2,SR*3.5|0,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++){const x=i/SR;d[i]=(Math.random()*2-1)*Math.exp(-x*1.7)*(x<.01?x/.01:1)}}
 const rev=A.createConvolver();rev.buffer=ir;rev.connect(G(.6,master));
 const dl=A.createDelay(2);dl.delayTime.value=BEAT*1.5;const fbk=G(.38),dlp=F('lowpass',1800,.5,fbk,rev,master);dl.connect(dlp);fbk.connect(dl);
 // noise buffer (breath, roar)
 const nb=A.createBuffer(1,SR*3|0,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 // ---- drone: D pedal, sine sub and two low saws through a slowly opening lowpass ----
 const dr=G(0,master,rev),dc=F('lowpass',180,2,dr),sg=G(.14,dc);
 LO('sine',mf(26),G(.5,dr));LO('sawtooth',mf(38),sg);LO('sawtooth',mf(38)*1.006,sg);
 rampTo(dr.gain,[[0,0],[1,.3],[9,.32],[22,.34],[27,.4],[29.5,0]]);
 rampTo(dc.frequency,[[0,160],[9,240],[22,300],[27,520],[29,260]]);
 // ---- choir: eight detuned saws on four chord tones, through three formant bandpasses ----
 const cb=G(0,master,rev),f1=F('bandpass',700,6,cb),f2=F('bandpass',1220,8,cb),f3=F('bandpass',2600,10,cb);
 const cin=G(1,f1,f2,f3);
 const vo=[];for(let j=0;j<4;j++)for(const d of[-7,7]){const o=LO('sawtooth',mf(PROG[0][j]),cin);o.detune.value=d;vo.push(o)}
 vo.forEach((o,k)=>{const j=k>>1;for(let b=0;b<BARS;b+=2)o.frequency.setValueAtTime(mf(PROG[(b>>1)&3][j]),T(b))});
 [f1,f2,f3].forEach((f,k)=>rampTo(f.frequency,[[0,VOW[0][k]],...VSEQ.map(([b,v])=>[b,VOW[v][k]])]));
 rampTo(cb.gain,[[0,0],[8.5,0],[9.5,.5],[13,.6],[16,.25],[17.5,.75],[23,.7],[25,.4],[27,0]]);
 // ---- roar: from bar 27 the noise of fire, opening up, fading out before the end ----
 const rg=G(0,master),rf=F('lowpass',400,.8,rg),rn=A.createBufferSource();rn.buffer=nb;rn.loop=true;rn.connect(rf);rn.start(T(26.9));rn.stop(base+LEN);
 rampTo(rg.gain,[[26.9,0],[27,1.5],[28.5,1.6],[29.6,1.6],[29.9,0]]);
 rampTo(rf.frequency,[[26.9,300],[28,2400],[29.6,700]]);
 // ---- per-bar nodes (short-lived, pruned) ----
 bag=[];
 function breath(b,t){if(b>=27)return;const s=keep(A.createBufferSource());s.buffer=nb;s.start(t,Math.random());s.stop(t+BAR);
  const g=G(0,master),bp=F('bandpass',1100,.7,g);s.connect(bp);env(g,t,1.3,1.8,BAR*.98,b>=13&&b<17?.22:.12)}
 function ping(t,v){const g=G(0,master,dl),o=keep(A.createOscillator());o.type='sine';o.frequency.value=1760;o.connect(g);o.start(t);o.stop(t+1);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+.9)}
 function bar(b,t){breath(b,t);if(b>=4&&b<27){ping(t,.16);if(b<19)ping(t+2*BEAT,.1)}}
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,T(b))}
 sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
