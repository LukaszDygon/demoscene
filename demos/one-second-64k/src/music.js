var SONG=(()=>{
const BPM=60,BAR=4,BARS=38,LEN=152,SNAP=147,END=149.2,P=12,SN=SNAP+2,ST=BAR/16;
const BL=[0,0,3,5,7,5,3,0],MEL=[293.66,349.23,440,523.25,440,349.23,293.66,261.63,329.63,392,493.88,392],SHM=[587.33,659.25,880,1174.66],BELLF=[293.66,440,349.23,523.25,587.33];
const PT={k1:'x...x...x...x...',k2:'x..x..x.x..x..x.',h1:'..x...x...x...x.',h2:'x.x.x.x.x.x.x.x.'};
const SEC=[[0,8,null,null,0],[8,15,'h1','bA',0],[15,23,'k1','bA',1],[23,28,'h2',null,2],[28,36,'k2','bB',3],[36,37,null,null,0],[37,38,null,null,0]];
const TK=[];for(let t=.5;t<SNAP-2;t+=.5*Math.exp(t/36))TK.push(t);
const BEL=[[12,0],[24,1],[40,2],[56,3],[72,4],[88,2],[104,1],[120,0],[136,3],[144,4]];
function setup(A,base){
 const SR=A.sampleRate;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const sweep=(t,d,f0,f1,v,to,ty)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.type=ty||'sine';
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  o.connect(g);g.connect(to);o.start(t);o.stop(t+d)};
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const noise=(t,d,type,f,q,v,to)=>{const s=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());
  s.buffer=NB;fl.type=type;fl.frequency.value=f;fl.Q.value=q;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  s.connect(fl);fl.connect(g);g.connect(to);s.start(t,Math.random());s.stop(t+d)};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.42,comp);
 master.gain.setValueAtTime(.42,base+END);master.gain.linearRampToValueAtTime(0,base+END+.15);
 const IR=A.createBuffer(2,SR*3|0,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}
 const cv=A.createConvolver();cv.buffer=IR;
 const bus=G(1,master,cv);cv.connect(G(.5,master));
 const lp=A.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1400;lp.connect(master);
 const str=A.createGain();str.gain.setValueAtTime(0,base);str.gain.linearRampToValueAtTime(.12,base+10);
 str.gain.setValueAtTime(.12,base+SNAP);str.gain.linearRampToValueAtTime(.3,base+SNAP+.1);str.connect(lp);
 const N=SN*100+1;
 for(const v of[73.42,87.31,110])for(let k=0;k<7;k++)for(const det of[1,1.004]){
  const F=new Float32Array(N),C=new Float32Array(N);
  for(let i=0;i<N;i++){const ph=(i/100%P)/P;F[i]=v*det*2**(k+ph);C[i]=.04*Math.exp(-((k+ph-3)**2)/2.42)}
  const o=A.createOscillator(),g=A.createGain();o.type='sawtooth';
  o.frequency.setValueCurveAtTime(F,base,SN);g.gain.setValueCurveAtTime(C,base,SN);
  o.connect(g);g.connect(str);o.start(base);o.stop(base+SN);
 }
 const heart=(t,v)=>{sweep(t,.25,58,34,.9*v,bus);sweep(t+.3,.2,58,34,.55*v,bus)};
 const tick=t=>noise(t,.03,'bandpass',3200,4,.12,bus);
 const kick=t=>sweep(t,.35,110,38,.6,bus);
 const snare=t=>{noise(t,.2,'highpass',1800,.7,.25,bus);sweep(t,.12,220,160,.2,bus)};
 const hat=t=>noise(t,.04,'highpass',7000,.5,.12,bus);
 const bass=(t,f,v)=>{const o=keep(A.createOscillator()),g=keep(A.createGain()),fl=keep(A.createBiquadFilter());
  o.type='sawtooth';o.frequency.value=f;fl.type='lowpass';fl.frequency.setValueAtTime(400,t);fl.frequency.exponentialRampToValueAtTime(120,t+.9);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0005,t+.9);
  o.connect(fl);fl.connect(g);g.connect(bus);o.start(t);o.stop(t+.95)};
 const bell=(t,f,v)=>{sweep(t,3.2,f,f*.997,v,bus);sweep(t,2.2,f*2.76,f*2.74,v*.35,bus);sweep(t,1.4,f*5.4,f*5.3,v*.12,bus)};
 const pluck=(t,f,v)=>{sweep(t,.9,f,f*.999,v,bus,'triangle');sweep(t,.5,f*2,f*2,v*.2,bus)};
 const swell=(t,d)=>{noise(t,d,'bandpass',600,.5,.08,bus);noise(t,d,'bandpass',2400,.6,.04,bus)};
 function hit(t){
  sweep(t,2.4,120,28,.6,bus);
  noise(t,2.6,'lowpass',500,.7,.5,bus);
  noise(t,1.6,'highpass',2500,.5,.2,bus);
  for(const d of[0,.04,.1])noise(t+d,.35,'bandpass',1800,1.5,.25,bus);
  noise(t,.2,'highpass',1800,.7,.3,bus);
 }
 function bar(b,t){
  const s=b*BAR,at=x=>t+x-s,L=x=>x>=s&&x<s+BAR;
  const sc=SEC.find(r=>b>=r[0]&&b<r[1])||[0,0,null,null,0];
  for(const x of TK)if(L(x))tick(at(x));
  if(L(96))swell(at(96),8);
  if(L(134))sweep(at(134),13,200,4000,.07,bus,'sawtooth');
  for(let k=0;k<4;k++){const x=s+k;
   if(x>=8&&x<144)heart(at(x),x<32?.3:x<72?.45:x<112?.6:.75);
   if(x>=112&&x<144)for(let h=0;h<2;h++)sweep(at(x+h*.5),.6,SHM[(k*2+h)%4],SHM[(k*2+h)%4]*1.01,.05,bus)}
  for(let j=0;j<16;j++){const x=s+j*ST,tj=at(x);
   if(sc[2]&&PT[sc[2]][j]==='x'){if(sc[2][0]==='k')kick(tj);else hat(tj)}
   if(sc[2]&&sc[2][0]==='k'&&j%8===4)snare(tj);
   if(sc[2]==='k2'&&j===0)sweep(tj,.6,60,30,.7,bus);
   if(sc[3]&&j%2===0){const f=36.71*2**(BL[(b*8+j/2)%8]/12);
    if(sc[3]==='bA'||(sc[3]==='bB'&&j%4===0))bass(tj,f,sc[3]==='bA'?.3:.22)}
   if(sc[4]===1&&j%2===0&&j<8)pluck(tj,MEL[(b*4+j/2)%MEL.length],.09);
   if(sc[4]===2&&j%2===0)pluck(tj,MEL[(b*4+j/2)%MEL.length],.07);
   if(sc[4]===3&&j%2===0)pluck(tj,MEL[(b*2+j/2)%8]*2,.06)}
  for(const[x,i]of BEL)if(L(x))bell(at(x),BELLF[i],.22);
  if(L(SNAP))hit(at(SNAP));
 }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,SNAP,END}})();
