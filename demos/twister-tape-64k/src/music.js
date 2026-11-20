var SONG=(()=>{
const BPM=90,BAR=240/BPM,BARS=40,LEN=BARS*BAR+5;
const FL=[[3.1,.6],[5.5,.4],[7.2,.9],[7.45,.5],[8.4,.6],[9,1],[10.8,.6],[12.2,.8],[15.4,.6],[17,.9]];
const MEL=[[659.3,587.3],[523.3,440],[440,523.3],[493.9,587.3],[659.3,784],[880,784],[698.5,523.3],[587.3,523.3]];
const CH=[[130.8,164.8,196],[110,130.8,164.8],[87.3,110,130.8],[98,123.5,146.8],[130.8,164.8,196],[110,130.8,164.8],[87.3,110,130.8],[130.8,164.8,196]];
function setup(A,base){
 const SR=A.sampleRate,at=b=>base+b*BAR;
 let seed=7,bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);
 for(let i=0;i<nd.length;i++)nd[i]=rnd()*2-1;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const BQ=(type,f,to,q=.7)=>{const b=keep(A.createBiquadFilter());b.type=type;b.frequency.value=f;b.Q.value=q;b.connect(to);return b};
 const auto=(p,pts)=>{p.setValueAtTime(pts[0][1],at(pts[0][0]));for(let i=1;i<pts.length;i++)p.linearRampToValueAtTime(pts[i][1],at(pts[i][0]))};
 const osc=(type,f,dest)=>{const o=A.createOscillator();o.type=type;o.frequency.value=f;o.connect(dest);o.start(base);o.stop(base+LEN);return o};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const drop=G(1,comp),master=G(.7,drop);
 const cu=new Float32Array(1024);for(let i=0;i<1024;i++)cu[i]=Math.max(-.7,Math.min(.7,(i/511.5-1)*1.6));
 const mic=A.createWaveShaper();mic.curve=cu;mic.connect(master);
 const micIn=G(1,mic);
 const rOut=G(0,master),wob=A.createDelay(.05);wob.delayTime.value=.02;wob.connect(rOut);
 osc('sine',5.5,G(.0006,wob.delayTime));
 const rIn=BQ('highpass',300,BQ('lowpass',3000,wob));
 const ws=A.createBufferSource();ws.buffer=NB;ws.loop=true;ws.start(base);ws.stop(base+LEN);
 const wf=A.createBiquadFilter();wf.type='lowpass';wf.frequency.value=300;ws.connect(wf);
 const wg=G(0,micIn);wf.connect(wg);osc('sine',.13,G(180,wf.frequency));
 const rs=A.createBufferSource();rs.buffer=NB;rs.loop=true;rs.start(base);rs.stop(base+LEN);
 const rg=G(0,master);rs.connect(BQ('lowpass',90,rg,1));
 const sg=G(0,micIn),so=osc('sawtooth',720,BQ('lowpass',1400,sg));osc('sine',.3,G(280,so.frequency));
 const sh=G(0,master);osc('sine',1318.5,sh);osc('sine',1975.5,sh);
 const hum=G(0,master);osc('sine',110,hum);
 auto(wg.gain,[[0,.03],[4,.06],[9,.3],[12,.55],[18,.5],[19.6,.1],[22,.04],[30,.03],[38,0],[40,0]]);
 auto(wf.frequency,[[0,250],[12,700],[18,900],[21,300]]);
 auto(sg.gain,[[5.5,0],[6.5,.05],[12,.1],[18,.1],[18.8,0],[40,0]]);
 auto(rg.gain,[[4,0],[9,.25],[12,.4],[20,.35],[22,.02],[40,0]]);
 auto(drop.gain,[[20.5,1],[20.6,0],[20.85,0],[20.95,1]]);
 auto(rOut.gain,[[29.8,0],[30.6,.95],[37.6,.95],[38.6,0],[40,0]]);
 auto(sh.gain,[[21.5,0],[24,.025],[30,.025],[31.5,0]]);
 auto(hum.gain,[[38.4,0],[38.8,.05],[39.9,0],[40,0]]);
 // noise burst: s start, d length, f (f2 = sweep target), q, pk peak
 const hit=(s,d,type,f,f2,q,pk,dest)=>{const src=keep(A.createBufferSource());src.buffer=NB;src.loop=true;src.start(s,rnd()*1.5,d+.02);
  const fi=keep(A.createBiquadFilter());fi.type=type;fi.Q.value=q;fi.frequency.setValueAtTime(f,s);if(f2)fi.frequency.exponentialRampToValueAtTime(f2,s+d);
  const g=keep(A.createGain());g.gain.setValueAtTime(1e-4,s);g.gain.exponentialRampToValueAtTime(pk,s+.005);g.gain.exponentialRampToValueAtTime(1e-4,s+d);
  src.connect(fi);fi.connect(g);g.connect(dest)};
 const tone=(s,d,type,f,pk,dest)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(s);o.stop(s+d+.05);
  const g=keep(A.createGain());g.gain.setValueAtTime(1e-4,s);g.gain.exponentialRampToValueAtTime(pk,s+.015);g.gain.exponentialRampToValueAtTime(1e-4,s+d);o.connect(g);g.connect(dest)};
 function bar(b,t){
  const R=(a,c)=>a+(c-a)*rnd();
  FL.forEach(([f,a])=>{if(Math.floor(f)===b){const s=t+(f-b)*BAR;hit(s,2.2,'lowpass',110,40,.7,.6*a,micIn);hit(s,.3,'highpass',1800,0,.6,.5*a,micIn)}});
  if(b>=10&&b<=18)for(let n=6+(b-10)*3;n--;)hit(t+rnd()*BAR,.03,'highpass',5000,0,.5,R(.12,.22),micIn);
  if(b>=12&&b<=18){for(let n=4;n--;)hit(t+rnd()*BAR,.12,'bandpass',R(900,3500),0,6,R(.2,.4),micIn);
   hit(t,BAR,'bandpass',400,2600,1.2,.16,micIn);hit(t+BAR*.5,.25,'lowpass',300,0,.7,.5,micIn)}
  if(b===18){hit(t,BAR*.6,'bandpass',3000,120,1.5,.8,micIn);hit(t+BAR*.6,1.6,'lowpass',70,40,.7,1,micIn)}
  if(b>=19&&b<22)for(let k=0;k<16;k++)if(rnd()<.45)hit(t+k*BAR/16,BAR/10,'bandpass',R(600,3600),0,3,R(.1,.5),micIn);
  if(b===23||b===27){tone(t,3,'sine',392,.09,master);tone(t,2.2,'sine',1176,.02,master)}
  if(b>=30&&b<38){const k=b-30;
   CH[k].forEach(f=>tone(t,BAR,'sine',f,.04,rIn));
   tone(t,BAR,'triangle',CH[k][0]/2,.14,rIn);
   tone(t,BAR/2,'triangle',MEL[k][0],.11,rIn);tone(t+BAR/2,BAR/2,'triangle',MEL[k][1],.11,rIn)}
  if(b===39)hit(t+BAR*.7,.02,'highpass',3000,0,.7,.6,master);
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,at(b))}
 bag=[];sched.out=comp;return sched}
// live: schedule each bar ~1.2 s before it plays → sound within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,FL}})();
