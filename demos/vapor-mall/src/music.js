// ＶＡＰＯＲ ＭＡＬＬ — soundtrack. Slowed city-pop / mallsoft, synthesized offline with WebAudio.
// Budget: this file must stay <= 16384 bytes (checked by build.py).
var SONG=(()=>{
const BPM=85,BT=60/BPM,BAR=BT*4,BARS=52,SR=44100,LEN=BARS*BAR+6;
// -2 semitones: the "slowed tape" transpose
const hz=m=>440*2**((m-71)/12);
// Fmaj9 | Em9 | Dm9 | Bbmaj9  (bass root, voicing)
const PROG=[[41,[53,57,60,64,67]],[40,[52,55,59,62,66]],[38,[50,53,57,60,64]],[34,[53,57,60,62,65]]];
// lead: one char per 8th note, 'a'=C4, '.' hold, '-' rest. 8 bars = phrase A + B
const MEL='q..mo.q.'+'t...q.ol'+'j.m.o.qr'+'q...o..-'+'y.v.t.q.'+'t..q.o..'+'r.q.o.m.'+'o.....--';

function ir(A,sec){const n=SR*sec|0,b=A.createBuffer(2,n,SR);
 for(let c=0;c<2;c++){const d=b.getChannelData(c);let l=0;
  for(let i=0;i<n;i++){const k=i/n;l+=(Math.random()*2-1-l)*(.2+.7*(1-k));d[i]=l*(1-k)**3}}
 return b}

async function render(prog=()=>0){
 const A=new OfflineAudioContext(2,SR*LEN|0,SR);
 // every node made while scheduling a bar goes in its bag; bags are disconnected once the bar has rung out
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.connect(A.destination);
 const master=G(.6,comp);
 // master low-pass: intro opens, rewind dips, dream breathes, outro closes
 const lp=A.createBiquadFilter();lp.Q.value=.4;
 // tape wobble + flutter: one modulated delay line on the whole mix
 const wd=A.createDelay(.1);wd.delayTime.value=.014;lp.connect(wd);wd.connect(master);
 for(const[f,d]of[[.37,.0017],[5.3,.00009]]){const o=A.createOscillator();o.frequency.value=f;o.connect(G(d,wd.delayTime));o.start()}
 const F=lp.frequency,ex=(v,b)=>F.exponentialRampToValueAtTime(v,b*BAR),at=(v,b)=>F.setValueAtTime(v,b*BAR);
 at(250,0);ex(16000,4);at(16000,20);ex(900,20.25);ex(16000,22);
 at(16000,28);ex(2200,29);ex(16000,36);at(16000,48);ex(300,BARS+1.5);
 // space
 const rv=A.createConvolver();rv.buffer=ir(A,4.2);rv.connect(G(.85,lp));
 const dl=A.createDelay(2);dl.delayTime.value=BT*.75;dl.connect(G(.36,dl));dl.connect(G(.45,lp));dl.connect(G(.35,rv));
 const bus=(d,r,e,p)=>{const pn=A.createStereoPanner();pn.pan.value=p;pn.connect(G(d,lp));pn.connect(G(r,rv));if(e)pn.connect(G(e,dl));return G(1,pn)};
 const padB=bus(.32,.75,0,0),epB=bus(.5,.35,.18,-.3),bsB=bus(.95,.06,0,0),drB=bus(.85,.1,0,0),
  snB=bus(.55,.7,0,.08),hhB=bus(.4,.12,0,.35),ldB=bus(.42,.5,.4,.15),vxB=bus(.35,.9,.35,-.2),chB=bus(.35,.8,.3,0);
 // noise
 const NB=A.createBuffer(1,SR*2,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const noise=(t,d)=>{const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;s.start(t,Math.random()*1.5,d);return s};
 const O=(ty,f,t,e,dt=0)=>{const o=keep(A.createOscillator());o.type=ty;o.frequency.value=f;o.detune.value=dt;o.start(t);o.stop(e);return o};
 const env=(g,t,a,pk,d,s,e,r)=>{const p=g.gain;p.setValueAtTime(0,t);p.linearRampToValueAtTime(pk,t+a);p.setTargetAtTime(pk*s,t+a,d);p.setTargetAtTime(0,e,r)};
 const filt=(ty,f,q)=>{const b=keep(A.createBiquadFilter());b.type=ty;b.frequency.value=f;b.Q.value=q;return b};

 // --- instruments ---
 function pad(t,len,ns,o,v){const f=filt('lowpass',400,2),g=G(0,f);f.connect(padB);
  f.frequency.setValueAtTime(380,t);f.frequency.linearRampToValueAtTime(1700,t+len*.5);f.frequency.linearRampToValueAtTime(650,t+len+1);
  env(g,t,.9,v,1,.8,t+len,.5);
  for(const n of ns)for(const dt of[-9,9])O('sawtooth',hz(n+o),t,t+len+3,dt).connect(g)}
 function ep(t,ns,v,len){for(const n of ns){const f=hz(n),g=G(0,epB);env(g,t,.004,v,.4,.35,t+len,.25);
  const c=O('sine',f,t,t+len+1.6),m=O('sine',f,t,t+len+1.6),mg=G(0,c.frequency);
  mg.gain.setValueAtTime(f*2.2,t);mg.gain.setTargetAtTime(f*.25,t,.15);m.connect(mg);c.connect(g)}}
 function bass(t,len,n,v=.34){const f=hz(n),g=G(0,bsB),l=filt('lowpass',900,3);l.connect(g);
  l.frequency.setValueAtTime(950,t);l.frequency.setTargetAtTime(230,t,.12);env(g,t,.01,v,.25,.6,t+len,.06);
  for(const ty of['sine','triangle']){const o=O(ty,f,t,t+len+.5);o.frequency.setValueAtTime(f*.97,t);o.frequency.exponentialRampToValueAtTime(f,t+.06);o.connect(l)}}
 function kick(t,v=.9){const o=O('sine',150,t,t+.6),g=G(0,drB);o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);
  g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(0,t+.05,.12);o.connect(g)}
 function snare(t,v=.33){const s=noise(t,.6),f=filt('bandpass',1700,.6),g=G(0,snB);s.connect(f);f.connect(g);
  g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(0,t,.09);
  const o=O('triangle',200,t,t+.3),g2=G(0,snB);o.frequency.exponentialRampToValueAtTime(140,t+.1);g2.gain.setValueAtTime(v*.8,t);g2.gain.setTargetAtTime(0,t,.04);o.connect(g2)}
 function hat(t,v,d){const s=noise(t,.5),f=filt('highpass',7500,.7),g=G(0,hhB);s.connect(f);f.connect(g);g.gain.setValueAtTime(v,t);g.gain.setTargetAtTime(0,t,d)}
 function lead(t,len,n,v=.065){const f=hz(n),g=G(0,ldB),fl=filt('lowpass',600,3);fl.connect(g);
  fl.frequency.setValueAtTime(600,t);fl.frequency.linearRampToValueAtTime(2600,t+.08);fl.frequency.setTargetAtTime(1300,t+.08,.3);
  env(g,t,.04,v,.3,.75,t+len,.12);
  const vib=O('sine',5.2,t,t+len+1),vg=G(0);vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+len);vib.connect(vg);
  for(const[ty,dt]of[['sawtooth',-6],['square',6]]){const o=O(ty,f,t,t+len+1,dt);vg.connect(o.frequency);o.connect(fl)}}
 function vox(t,len,n,v=.16){const g=G(0,vxB);env(g,t,.03,v,.2,.7,t+len,.08);
  const o=O('sawtooth',hz(n),t,t+len+1);
  for(const[fr,gn]of[[730,1],[1090,.5],[2440,.25]]){const b=filt('bandpass',fr,9);o.connect(b);b.connect(G(gn*3,g))}}
 function bell(t,n,v=.11){const f=hz(n);for(const[r,a,d]of[[1,1,1.2],[2.76,.4,.4],[5.4,.15,.2]]){const o=O('sine',f*r,t,t+5),g=G(0,chB);
  g.gain.setValueAtTime(v*a,t);g.gain.setTargetAtTime(0,t,d);o.connect(g)}}
 // ピンポンパンポーン — the department-store announcement chime
 const chime=(t,up)=>(up?[65,69,72,77]:[77,72,69,65]).forEach((n,i)=>bell(t+i*BT*.55,n+12));
 // VHS rewind squeal
 function rewind(t,len){const g=G(0,lp),bp=filt('bandpass',1800,1.5);bp.connect(g);
  for(let k=0;k<3;k++){const o=O('sawtooth',900,t,t+len,k*17),N=48,cv=new Float32Array(N);
   for(let i=0;i<N;i++)cv[i]=500+Math.random()*2400*(1-Math.abs(i/N*2-1)*.5);o.frequency.setValueCurveAtTime(cv,t,len);o.connect(bp)}
  const s=noise(t,len);s.connect(bp);
  for(let i=0;i<len*14;i++)g.gain.setValueAtTime(i%2?.012:.05,t+i/14);g.gain.setValueAtTime(0,t+len)}
 // vinyl / tape hiss bed
 const VB=A.createBuffer(2,SR*8,SR);
 for(let c=0;c<2;c++){const d=VB.getChannelData(c);let b=0;for(let i=0;i<d.length;i++){b=b*.97+(Math.random()-.5)*.02;d[i]=b+(Math.random()<4e-4?(Math.random()-.5)*.8:0)}}
 const vs=A.createBufferSource();vs.buffer=VB;vs.loop=true;vs.connect(G(.09,master));vs.start(0);vs.stop(LEN);

 // --- arrangement ---
 // 0-3 intro | 4-11 groove | 12-19 full | 20-21 REWIND | 22-27 full | 28-35 dream | 36-47 full | 48-51 outro
 const sw=BT/2;
 function sched(b){
  bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;
  if(b==0)chime(.3,1);if(b==35)chime(36*BAR-BT*2.5,1);if(b==49)chime(49*BAR,0);
  const t=b*BAR,[r,ch]=PROG[b%4],
   s=b<4?0:b<12?1:b<20?2:b<22?3:b<28?2:b<36?4:b<48?2:5;
  if(s==3){if(b==20)rewind(t,2*BAR);return}
  pad(t,BAR,ch,s==4?12:0,s==4?.04:.042);
  if(s==0||s==5){ep(t+BT*2,ch.slice(1).map(n=>n+12),.045,2.2);return}
  if(s==4){
   for(let i=0;i<8;i++)if((i*5+b)%3!=1)vox(t+i*sw,sw*.8,ch[(i*2+b)%5]+12);
   ep(t,ch.map(n=>n+12),.055,3);kick(t,.45);kick(t+BT*.4,.25);
   return}
  // groove
  [[0,0,3],[3,12,1],[4,0,1.5],[6,7,1],[7,12,1]].forEach(([e,iv,d])=>bass(t+e*sw,d*sw*.9,r+iv));
  ep(t+3*sw,ch.slice(1).map(n=>n+12),.05,.5);ep(t+6*sw,ch.slice(1).map(n=>n+12),.04,.4);
  for(let i=0;i<16;i++){const tt=t+i*BT/4+(i%4==2?.025:0);
   if(i==0||i==6||i==10||(b%4==3&&i==14))kick(tt);
   if(s==2&&(i==4||i==12))snare(tt);
   if(s==1&&i==12)snare(tt,.18);
   if(i%2==0)hat(tt,i%4==2?.07:.035,i==14&&b%2?.15:.03)}
  if(s==2){const st=b<20?12:b<28?22:36,pb=(b-st)%8;
   for(let e=0;e<8;e++){const k=pb*8+e,c=MEL[k];
    if(c>='a'&&c<='z'){let d=1;while(MEL[k+d]=='.')d++;lead(t+e*sw,d*sw*.95,c.charCodeAt(0)-37)}}}
 }
 bag=[];sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);prog(b/BARS);A.resume()});
 return A.startRendering()}
return{render,BPM,BAR,LEN}})();
