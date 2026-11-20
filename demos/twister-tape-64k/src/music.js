var SONG=(()=>{
const BPM=90,BAR=240/BPM,OFF=8,BARS=56,LEN=BARS*BAR+5;
const FCH=[[261.6,329.6,392],[349.2,440,523.3],[392,493.9,587.3],[261.6,329.6,392],[349.2,440,523.3],[392,493.9,587.3],[261.6,329.6,392],[261.6,329.6,392]];
const FM=[523.3,659.3,784,659.3,698.5,880,698.5,587.3,784,659.3,587.3,493.9,523.3,523.3,659.3,784,523.3,659.3,784,659.3,698.5,880,698.5,587.3,784,659.3,523.3,392,523.3,659.3,784,523.3];
const FL=[[3.1,.6],[5.5,.4],[7.2,.9],[7.45,.5],[8.4,.6],[9,1],[10.8,.6],[12.2,.8],[15.4,.6],[17,.9]];
const MEL=[659.3,587.3,523.3,392,440,523.3,659.3,523.3,698.5,659.3,587.3,523.3,493.9,587.3,784,698.5,659.3,784,1046.5,784,880,784,659.3,523.3,440,523.3,698.5,659.3,392,523.3,659.3,1046.5];
const CH=[[130.8,164.8,196],[110,130.8,164.8],[87.3,110,130.8],[98,123.5,146.8],[130.8,164.8,196],[110,130.8,164.8],[87.3,110,130.8],[130.8,164.8,196]];
function setup(A,base){
 const SR=A.sampleRate,at=b=>base+b*BAR;
 let seed=7,bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
 const R=(a,c)=>a+(c-a)*rnd();
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);
 for(let i=0;i<nd.length;i++)nd[i]=rnd()*2-1;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const BQ=(type,f,to,q=.7)=>{const b=keep(A.createBiquadFilter());b.type=type;b.frequency.value=f;b.Q.value=q;b.connect(to);return b};
 const auto=(p,pts)=>{p.setValueAtTime(pts[0][1],at(pts[0][0]+OFF));for(let i=1;i<pts.length;i++)p.linearRampToValueAtTime(pts[i][1],at(pts[i][0]+OFF))};
 const osc=(type,f,dest)=>{const o=A.createOscillator();o.type=type;o.frequency.value=f;o.connect(dest);o.start(base);o.stop(base+LEN);return o};
 const loop=(dest)=>{const s=A.createBufferSource();s.buffer=NB;s.loop=true;s.start(base);s.stop(base+LEN);s.connect(dest);return s};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const drop=G(1,comp),master=G(.7,drop);
 const cu=new Float32Array(1024);for(let i=0;i<1024;i++)cu[i]=Math.max(-.7,Math.min(.7,(i/511.5-1)*1.6));
 const mic=A.createWaveShaper();mic.curve=cu;mic.connect(master);
 const micIn=G(1,mic);
 const rOut=G(0,master),wob=A.createDelay(.05);wob.delayTime.value=.02;wob.connect(rOut);
 osc('sine',5.5,G(.0006,wob.delayTime));
 const rIn=BQ('highpass',300,BQ('lowpass',3000,wob));
 const wf=A.createBiquadFilter();wf.type='lowpass';wf.frequency.value=300;loop(wf);
 const wg=G(0,micIn);wf.connect(wg);osc('sine',.13,G(180,wf.frequency));
 const rg=G(0,master);loop(BQ('lowpass',90,rg,1));
 const sg=G(0,micIn),so=osc('sawtooth',720,BQ('lowpass',1400,sg));osc('sine',.3,G(280,so.frequency));
 const rainG=G(0,micIn);loop(BQ('highpass',3000,rainG,.5));
 const sh=G(0,master);osc('sine',1318.5,sh);osc('sine',1975.5,sh);
 const hum=G(0,master);osc('sine',110,hum);
 const roar=G(0,micIn),rf=A.createBiquadFilter();rf.type='bandpass';rf.frequency.value=260;rf.Q.value=.9;loop(rf);rf.connect(roar);osc('sine',.2,G(120,rf.frequency));
 const sub=G(0,master);osc('sine',38,sub);osc('sine',57,sub);
 const howl=G(0,master),ho=osc('sawtooth',90,BQ('lowpass',700,howl,2));
 auto(ho.frequency,[[8.8,90],[12,160],[16,240],[19,300],[21,90]]);
 osc('sine',.5,G(.12,micIn.gain));
 const cg=G(0,micIn),co=A.createOscillator(),cf=BQ('bandpass',700,cg,8);co.type='sawtooth';co.frequency.value=180;co.connect(cf);co.start(base);co.stop(base+LEN);
 osc('sine',.9,G(60,co.frequency));
 const cel=G(0,master);loop(BQ('lowpass',180,cel,.7));auto(cel.gain,[[19.2,0],[19.5,.5],[21.8,.5],[22.1,0]]);
 const en=G(0,master),eo=osc('sawtooth',62,BQ('lowpass',300,en));osc('sine',3,G(4,eo.frequency));auto(en.gain,[[5,0],[5.5,.05],[18.6,.05],[19,0]]);
 const hiss=G(.02,master);loop(BQ('highpass',8000,hiss,.5));
 const so2=osc('triangle',1080,BQ('lowpass',2000,sg));osc('sine',.3,G(420,so2.frequency));
 auto(wg.gain,[[0,.03],[4,.06],[9,.3],[12,.55],[18,.5],[19.6,.1],[22,.04],[30,.03],[46,0],[48,0]]);
 auto(wf.frequency,[[0,250],[12,700],[18,900],[21,300]]);
 auto(sg.gain,[[5.5,0],[6.5,.05],[12,.1],[18,.1],[18.8,0],[40,0]]);
 auto(rg.gain,[[4,0],[9,.25],[12,.4],[20,.35],[22,.02],[40,0]]);
 auto(rainG.gain,[[2,0],[5,.05],[9,.14],[18,.16],[24,.03],[30,0]]);
 auto(drop.gain,[[20.5,1],[20.6,0],[20.85,0],[20.95,1]]);
 auto(rOut.gain,[[29.8,0],[30.6,.95],[45.6,.95],[46.6,0],[48,0]]);
 auto(sh.gain,[[21.5,0],[24,.025],[30,.025],[31.5,0]]);
 auto(hum.gain,[[46.4,0],[46.8,.05],[47.9,0],[48,0]]);
 auto(roar.gain,[[8.8,0],[10,.25],[15,.3],[19,.1],[21,0],[40,0]]);
 auto(howl.gain,[[8.8,0],[10,.05],[17,.09],[19,.02],[20,0],[40,0]]);
 auto(cg.gain,[[14,0],[15,.05],[16.5,.02],[18,.06],[19,0],[40,0]]);
 auto(so.frequency,[[17,720],[17.6,1100],[18.3,560],[18.9,720]]);
 auto(sub.gain,[[8.8,0],[10,.12],[19,.12],[21,0],[40,0]]);
 const hit=(s,d,type,f,f2,q,pk,dest)=>{const src=keep(A.createBufferSource());src.buffer=NB;src.loop=true;src.start(s,rnd()*1.5,d+.02);
  const fi=keep(A.createBiquadFilter());fi.type=type;fi.Q.value=q;fi.frequency.setValueAtTime(f,s);if(f2)fi.frequency.exponentialRampToValueAtTime(f2,s+d);
  const g=keep(A.createGain());g.gain.setValueAtTime(1e-4,s);g.gain.exponentialRampToValueAtTime(pk,s+.005);g.gain.exponentialRampToValueAtTime(1e-4,s+d);
  src.connect(fi);fi.connect(g);g.connect(dest)};
 const tone=(s,d,type,f,pk,dest)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(s);o.stop(s+d+.05);
  const g=keep(A.createGain());g.gain.setValueAtTime(1e-4,s);g.gain.exponentialRampToValueAtTime(pk,s+.015);g.gain.exponentialRampToValueAtTime(1e-4,s+d);o.connect(g);g.connect(dest)};
 function fair(B,t){const c=FCH[B];
  for(let q=0;q<4;q++){const s=t+q*BAR/4;c.forEach(f=>tone(s,BAR/4*1.2,'square',f,.012,master));tone(s,BAR/4*1.4,'triangle',FM[B*4+q],.07,master)}
  tone(t,BAR,'sawtooth',c[0]/2,.05,master);
  for(let n=6;n--;)hit(t+rnd()*BAR,.8,'bandpass',R(500,900),0,.6,.04,master);
  for(let n=2;n--;)tone(t+rnd()*BAR,1.2,'sine',R(1800,2400),.03,master)}
 function bar(B,t){if(B<OFF){fair(B,t);return}
  const b=B-OFF;
  FL.forEach(([f,a],i)=>{if(Math.floor(f)===b){const s=t+(f-b)*BAR;hit(s,2.2,'lowpass',i%2?200:110,i%2?60:40,.7,.6*a,micIn);hit(s,.3,'highpass',1800,0,.6,.5*a,micIn)}});
  if(b>=2&&b<=24)for(let n=3+(b>9&&b<19?3:0);n--;)hit(t+rnd()*BAR,.012,'highpass',4000,0,.5,R(.03,.07),micIn);
  if(b>=10&&b<=18)for(let n=6+(b-10)*3;n--;){hit(t+rnd()*BAR,.03,'highpass',5000,0,.5,R(.12,.22),micIn);tone(t+rnd()*BAR,.06,'triangle',R(2200,4200),.025,micIn)}
  if(b>=12&&b<=18){for(let n=4;n--;)hit(t+rnd()*BAR,.12,'bandpass',R(900,3500),0,6,R(.2,.4),micIn);
   hit(t,BAR,'bandpass',400,2600,1.2,.16,micIn);hit(t+BAR*.5,.25,'lowpass',300,0,.7,.5,micIn);
   for(let n=2;n--;)tone(t+rnd()*BAR,.05,'square',R(160,380),.1,micIn);
   for(let n=3;n--;)hit(t+rnd()*BAR,.15,'bandpass',R(1500,2600),0,4,.25,micIn)}
  if(b>=12&&b<=18)for(let n=2;n--;)hit(t+rnd()*BAR,.4,'bandpass',R(800,2500),R(300,4000),3,.12,micIn);
  if(b===16){hit(t+BAR*.5,.8,'highpass',6000,0,.5,.3,micIn);for(let n=8;n--;)tone(t+BAR*.5+rnd()*.3,.08,'sine',R(3000,7000),.02,micIn)}
  if(b>=4&&b<=18)hit(t+rnd()*BAR,BAR*.4,'lowpass',R(300,800),0,.5,R(.06,.14),micIn);
  if(b>=12&&b<=18)for(let n=2;n--;)hit(t+rnd()*BAR,.2,'lowpass',200,0,.7,.4,micIn);
  if(b===18){hit(t,BAR*.6,'bandpass',3000,120,1.5,.8,micIn);hit(t+BAR*.6,1.6,'lowpass',70,40,.7,1,micIn)}
  if(b>=19&&b<22)for(let k=0;k<16;k++)if(rnd()<.45)hit(t+k*BAR/16,BAR/10,'bandpass',R(600,3600),0,3,R(.1,.5),micIn);
  if(b>=12&&b<=19)for(let k=0;k<2;k++)tone(t+k*BAR/2,.12,'sine',1000,.05,master);
  FL.forEach(([f],i)=>{if(i%3===0&&Math.floor(f)===b)hit(t+(f-b)*BAR+1.2,1.6,'lowpass',90,30,.7,.3,micIn)});
  if(b===23||b===27){tone(t,3,'sine',392,.09,master);tone(t,2.2,'sine',1176,.02,master)}
  if(b>=30&&b<46){const k=(b-30)%8,c2=b>=38?2:1;
   CH[k].forEach(f=>tone(t,BAR,'sine',f,.04,rIn));
   for(let q=0;q<4;q++){const f=MEL[k*4+q]*c2,s=t+q*BAR/4;
    tone(s,BAR/4*1.4,'triangle',f,.11,rIn);tone(s,BAR/4*1.4,'sawtooth',f/2,.02,rIn);if(c2>1)tone(s,BAR/4*1.4,'sine',MEL[k*4+(q+2)%4]*.5,.05,rIn)}
   for(let n=10;n--;)hit(t+rnd()*BAR,.01,'highpass',2000,0,.5,.05,rIn);
   if(b>=32&&b<36)for(let j=0;j<16;j++)tone(t+j*BAR/16,BAR/16*1.6,'triangle',CH[k][[0,1,2,1][j%4]]*(j%8<4?1:2),.035,rIn);
   if(b>=36&&b<38)for(let q=0;q<4;q++)tone(t+q*BAR/4,BAR/4*1.4,'triangle',MEL[k*4+q]*1.5,.06,rIn);
   if(b>=38&&b<46)for(let q=0;q<4;q++)tone(t+q*BAR/4,BAR/4*1.4,'sine',MEL[k*4+q]*.833,.05,rIn);
   for(let j=0;j<8;j++)tone(t+j*BAR/8,BAR/8*1.5,'triangle',CH[k][[0,2,1,2][j%4]]/2*(c2>1&&j>3?2:1),.12,rIn);
   if(b>=44)CH[k].forEach(f=>tone(t,BAR*1.8,'sine',f,.03,rIn));
   for(let h=0;h<2;h++){hit(t+h*BAR/2+BAR/4,.06,'bandpass',5000,0,2,.04,rIn);hit(t+h*BAR/2+BAR/4,.2,'lowpass',120,50,.7,.22,rIn)}}
  if(b>=14&&b<=18&&b!==17)for(let n=2;n--;)tone(t+rnd()*BAR,.6,'sine',R(120,220),.03,micIn);
  if(b===29)hit(t+BAR*.5,BAR*.5,'bandpass',300,3000,6,.1,master);
  if(b===7){hit(t,BAR*.9,'bandpass',2000,0,.3,.05,micIn);for(let n=3;n--;){const s=t+n*BAR*.3;tone(s,.9,'sine',853,.04,master);tone(s,.9,'sine',960,.04,master)}}
  if(b===10){hit(t,.4,'highpass',2500,0,.5,.7,micIn);for(let n=5;n--;)hit(t+rnd()*BAR*.5,.04,'highpass',4000,0,.6,.5,micIn);for(let n=3;n--;)tone(t+rnd()*BAR,.02,'square',R(3000,6000),.03,micIn)}
  if(b>=19&&b<22)for(let n=2;n--;)hit(t+n*BAR/2,.3,'lowpass',90,40,.7,.7,master);
  if(b===45)hit(t+BAR*.7,.02,'highpass',3000,0,.7,.6,master);
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,at(b))}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,FL,OFF}})();
