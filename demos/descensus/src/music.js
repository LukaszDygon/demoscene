// DESCENSUS - soundtrack. 70 BPM, 26 bars (~89 s + tail). Same scheduler runs live and offline.
var SONG=(()=>{
const BPM=70,BAR=240/BPM,BEAT=60/BPM,BARS=26,LEN=BARS*BAR+6;
const mf=m=>440*2**((m-69)/12);
// chords: [bass midi, pad voicing]
const C={d:[38,[53,57,60,64]],b:[34,[50,53,57,60]],g:[31,[50,53,57,58]],a:[33,[52,55,57,62]],
 f:[29,[53,57,60,64]],c:[36,[50,52,55,60]],D:[38,[50,54,57,62,66]]};
const PROG='ddddd bgda ffcga ddd dbfcgba DD'.replace(/ /g,'');
// section levels per bar: [pad, choir, bells, heart, cutoff]
const SEC=b=>b<4?[.5+b*.12,0,0,0,500+b*90]:b<9?[.85,0,1,1,1100]:b<14?[.8,0,.3,1,850]:b<17?[.14,0,0,.5,380]:b<24?[.75,1,.8,1,1500]:[.7,.8,.4,.5,900];
// heartbeat hits in bar b: [beat offset seconds, velocity] (lub-dub). Shared with the visuals.
function hits(b){const h=[],lub=(s,v)=>h.push([s,v],[s+.27,v*.55]);
 if(b>=4&&b<14||b>=17&&b<24){lub(0,1);lub(2*BEAT,.85)}
 else if(b>=14&&b<17||b==24||b==25){lub(0,b>23?.8-(b-24)*.3:.5)}
 return h}
function heart(t){let e=0;const b=Math.floor(t/BAR);for(let k=b-1;k<=b;k++)if(k>=0)for(const[s,v]of hits(k)){const d=t-k*BAR-s;if(d>=0)e=Math.max(e,v*Math.exp(-d*6))}return e}
// whale song: [bar, beat, beats, f0, f1, f2, vel]
const WH=[[9,1,4,196,294,247,.5],[10,1,2.5,330,440,370,.4],[10,3.4,2.6,370,220,185,.45],[11,0,6,147,392,330,.55],
 [12,2,4,294,220,165,.5],[13,0,2.5,247,330,294,.4],[13,2.5,3.5,262,196,147,.45],[15,0,6,98,147,110,.35],
 [16,1.5,5,220,165,131,.28],[19,2,4,294,440,392,.25],[21,0,5,196,294,220,.25],[24,1,6,147,220,196,.25]];
let seed=1;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
 const T=b=>base+b*BAR;
 // ---- long-lived master chain ----
 const comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.4;comp.connect(A.destination);
 const master=G(.55,comp);
 master.gain.setValueAtTime(.55,T(25.3));master.gain.linearRampToValueAtTime(0,base+LEN-.3);
 // reverb: generated stereo IR
 const ir=A.createBuffer(2,SR*5|0,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++){const x=i/SR;d[i]=(Math.random()*2-1)*Math.exp(-x*1.05)*(x<.02?x/.02:1)}}
 const rev=A.createConvolver();rev.buffer=ir;const wet=G(.55,master);rev.connect(wet);
 // beat delay with dark feedback -> reverb
 const dl=A.createDelay(3);dl.delayTime.value=BEAT*1.5;const fb=G(.42),dlp=F('lowpass',1400,.5,fb,rev,master);dl.connect(dlp);fb.connect(dl);
 // noise buffer
 const nb=A.createBuffer(1,SR*3|0,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const N=(t,end)=>{const s=keep(A.createBufferSource());s.buffer=nb;s.loop=true;s.start(t);s.stop(end);return s};
 // surface wash + abyssal rumble (long-lived, automated in bars)
 const wash=G(0,master,rev),wl=F('lowpass',420,.7,wash);N(base,base+LEN).connect(wl);
 const wlfo=O('sine',.11,base,base+LEN),wld=G(260,wl.frequency);wlfo.connect(wld);
 wash.gain.setValueAtTime(0,base);wash.gain.linearRampToValueAtTime(.28,T(1));wash.gain.setValueAtTime(.28,T(3));wash.gain.linearRampToValueAtTime(0,T(6.5));
 const rum=G(0,master),rl=F('lowpass',85,1.2,rum);N(base+.7,base+LEN).connect(rl);
 [[0,.06],[8,.08],[13,.25],[16.5,.35],[18,.15],[24,.15],[26,0]].forEach(([b,v],i)=>i?rum.gain.linearRampToValueAtTime(v,T(b)):rum.gain.setValueAtTime(v,T(b)));
 // D pedal drone: sub sine + low saw pair through slow filter
 const dr=G(0,master,rev),drl=F('lowpass',160,2,dr);
 [[26,'sine',.3],[38,'sawtooth',.11],[38.07,'sawtooth',.11],[45,'sawtooth',.06]].forEach(([m,ty,v])=>{const o=O(ty,mf(m),base,base+LEN);o.connect(G(v,drl))});
 const dlf=O('sine',.05,base,base+LEN),dld=G(90,drl.frequency);dlf.connect(dld);
 [[0,0],[1.5,.5],[9,.35],[14,.3],[15,.45],[17,.35],[24,.45],[26,0]].forEach(([b,v],i)=>i?dr.gain.linearRampToValueAtTime(v,T(b)):dr.gain.setValueAtTime(v,T(b)));
 bag=[];
 // ---- instruments ----
 function env(g,t,a,h,r,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+h);g.gain.linearRampToValueAtTime(0,t+r)}
 function kick(t,v){const g=G(0,master,rev),o=O('sine',110,t,t+.7);o.connect(g);
  o.frequency.setValueAtTime(115,t);o.frequency.exponentialRampToValueAtTime(38,t+.16);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.6);
  const k=G(0,master),kf=F('lowpass',900,1,k);N(t,t+.05).connect(kf);k.gain.setValueAtTime(v*.25,t);k.gain.exponentialRampToValueAtTime(.001,t+.04)}
 function pad(t,notes,cut,v){const g=G(0,master,rev),f=F('lowpass',cut,.6,g);
  notes.forEach(m=>[-7,7].forEach(c=>{const o=O('sawtooth',mf(m),t,t+BAR*1.6);o.detune.value=c;o.connect(f)}));
  f.frequency.setValueAtTime(cut*.6,t);f.frequency.linearRampToValueAtTime(cut,t+BAR*.6);f.frequency.linearRampToValueAtTime(cut*.5,t+BAR*1.5);
  env(g,t,BAR*.4,BAR*1.0,BAR*1.55,v*.05/notes.length*4)}
 function bass(t,m,v){const g=G(0,master,rev),o=O('triangle',mf(m+12),t,t+BAR*1.6);o.connect(g);env(g,t,BAR*.3,BAR,BAR*1.55,v*.16)}
 function choir(t,notes,v){const mix=G(1),g=G(0,master,rev);
  [[700,7,1],[1150,9,.6],[2600,10,.25]].forEach(([fr,q,a])=>mix.connect(F('bandpass',fr,q,G(a,g))));
  notes.forEach((m,i)=>[-9,9].forEach(c=>{const o=O('sawtooth',mf(m+12),t,t+BAR*1.6);o.detune.value=c+i*3;o.connect(mix);
   const l=O('sine',4.6+i*.3,t,t+BAR*1.6),ld=G(9);l.connect(ld);ld.connect(o.detune)}));
  env(g,t,BAR*.5,BAR,BAR*1.55,v*.42/notes.length*4)}
 function bell(t,m,v){const f=mf(m),g=G(0,master,dl,rev),c=O('sine',f,t,t+4),md=O('sine',f*3.007,t,t+4),mg=G(f*2.2);md.connect(mg);mg.connect(c.frequency);c.connect(g);
  mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+1.5);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.001,t+3.8)}
 function whale(t,d,f0,f1,f2,v){const g=G(0,master,dl,rev),bp=F('bandpass',f0*2,1.2,g),lp=F('lowpass',f0*3,.7,bp);
  [['sine',1,1],['triangle',1.004,.5],['sine',2.01,.18]].forEach(([ty,r,a])=>{const o=O(ty,f0*r,t,t+d+.1),og=G(a,lp);o.connect(og);
   o.frequency.setValueAtTime(f0*r,t);o.frequency.exponentialRampToValueAtTime(f1*r,t+d*.45);o.frequency.exponentialRampToValueAtTime(f2*r,t+d);
   const l=O('sine',4.2+r,t,t+d+.1),ld=G(0,o.frequency);l.connect(ld);ld.gain.setValueAtTime(0,t);ld.gain.linearRampToValueAtTime(f1*r*.018,t+d)});
  lp.frequency.setValueAtTime(f0*2,t);lp.frequency.linearRampToValueAtTime(f1*3.5,t+d*.5);lp.frequency.linearRampToValueAtTime(f2*1.5,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.3);g.gain.setValueAtTime(v,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d)}
 function bubble(t,v){const g=G(0,master,rev),o=O('sine',300,t,t+.12);o.connect(g);o.frequency.setValueAtTime(260+rnd()*200,t);o.frequency.exponentialRampToValueAtTime(900+rnd()*900,t+.08);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.1)}
 function shimmer(t,d,v){const g=G(0,master,rev),f=F('bandpass',400,3,g);N(t,t+d).connect(f);f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(7000,t+d);
  env(g,t,d*.6,d*.6,d,v)}
 const PENT=[62,65,67,69,72,74,77,79,81,84];
 function bar(b,t){const ch=C[PROG[b]],s=SEC(b);seed=b*977+13;
  if(b<BARS-1){pad(t,ch[1],s[4],s[0]);bass(t,ch[0],b>=14&&b<17?.22:b<2?.3+b*.3:1);if(s[1])choir(t,ch[1],s[1]*(b==17?.6:1))}
  if(b==BARS-1){pad(t,ch[1],700,.6);choir(t,ch[1],.6);bass(t,ch[0],.8)}
  hits(b).forEach(([o,v])=>kick(t+o,v*(b<5?.6+(b-4)*.4:1)*.6));
  if(s[2])for(let i=0;i<4;i++)if(rnd()<.75)bell(t+(rnd()*8|0)*BEAT/2,PENT[rnd()*PENT.length|0]+(rnd()<.3?12:0),.05*s[2]);
  if(b<6)for(let i=0;i<5-b;i++)bubble(t+rnd()*BAR,.03*(1-b/6));
  WH.forEach(w=>{if(w[0]==b)whale(t+w[1]*BEAT,w[2]*BEAT,w[3],w[4],w[5],w[6]*.55)});
  if(b==16)shimmer(t+BAR*.3,BAR*.7,.18);
  if(b==17)[74,77,81,86,88].forEach((m,i)=>bell(t+i*BEAT*.5,m,.07));
  if(b==24)[62,66,69,74].forEach((m,i)=>bell(t+i*BEAT*.75,m,.06))}
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.12-from,sched=setup(A,base);let b=Math.max(0,Math.ceil(from/BAR-.001));
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,heart,BPM,BAR,BEAT,BARS,LEN}})();
