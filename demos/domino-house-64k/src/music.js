var SONG=(()=>{
// tempo map [bar, bpm]; one bar is three beats (a waltz)
const TM=[[0,50],[3,58],[7,68],[13,80],[18,92],[23,104],[29,54]];
const TS=[0];for(let i=1;i<TM.length;i++)TS[i]=TS[i-1]+(TM[i][0]-TM[i-1][0])*180/TM[i-1][1];
const T=b=>{let i=0;while(i<TM.length-1&&b>=TM[i+1][0])i++;return TS[i]+(b-TM[i][0])*180/TM[i][1]};
const B=t=>{let i=TS.length-1;while(i>0&&t<TS[i])i--;return TM[i][0]+(t-TS[i])*TM[i][1]/180};
const BARS=35,LEN=T(BARS)+3;
// chain events, in bars (shared with the visuals)
const E={tap:0,drawer:3,drop:3.5,stairs:4.2,dom:7,pop:13,lever:14.5,cannon:15,hit:16,cut:22.5,crash:22.7,fold:23.6,fold2:28.5,end:34};
const BURST=[16.5,17.2,17.9,18.7,19.5,20.3,21.1,21.8];
const CH=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]];
const mf=m=>440*Math.pow(2,(m-69)/12);
const H=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)};
const EV=[[E.tap,'click'],[E.cut,'click'],[E.pop,'pop'],[E.pop,'whoosh'],[E.lever,'tink'],[E.cannon,'boom'],[E.crash,'crash'],[E.end,'note']];
for(let i=0;i<18;i++)EV.push([E.dom+i/3,'click']);
BURST.forEach(b=>EV.push([b,'burst']));

function setup(A,base){
 const SR=A.sampleRate,X=b=>base+T(b);
 let bag=[];const BAGS=[];const keep=n=>(bag.push(n),n);
 const comp=A.createDynamicsCompressor(),master=A.createGain(),verb=A.createConvolver(),send=A.createGain(),bus=A.createGain();
 comp.connect(A.destination);master.gain.value=.6;master.connect(comp);
 verb.connect(master);send.gain.value=.35;send.connect(verb);bus.connect(master);bus.connect(send);
 const IR=A.createBuffer(2,SR*2|0,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(H(i,c+1)*2-1)*Math.pow(1-i/d.length,3)}
 verb.buffer=IR;
 const NB=A.createBuffer(1,SR*.5|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=H(i,9)*2-1;
 const V=(fr,t,d,v,ty,sw)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.type=ty||'sine';o.frequency.setValueAtTime(fr,t);
  if(sw)o.frequency.exponentialRampToValueAtTime(sw,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(1e-4,t+d);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+d+.05)};
 const N=(ty,fr,t,d,v,fe,q)=>{const s=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());
  s.buffer=NB;s.loop=true;fl.type=ty;fl.Q.value=q||1;fl.frequency.setValueAtTime(fr,t);if(fe)fl.frequency.exponentialRampToValueAtTime(fe,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-4,t+d);
  s.connect(fl);fl.connect(g);g.connect(bus);s.start(t,H(t,3)*.3);s.stop(t+d+.05)};
 const celesta=(f,t,v)=>{V(f,t,1.5,v);V(f*4,t,.3,v*.25)};
 const mbox=(f,t,v,d)=>{V(f,t,d||2.4,v);V(f*3,t,.6,v*.3)};
 const pizz=(f,t,v)=>V(f,t,.25,v,'triangle');
 const bass=(f,t,v)=>{V(f,t,.8,v);V(f*2,t,.12,v*.3,'triangle')};
 const SFX={
  click:t=>{N('bandpass',2600,t,.03,.5,0,2);V(900,t,.03,.12)},
  pop:t=>{V(1400,t,.12,.25,'sine',300);N('highpass',2000,t,.05,.2)},
  whoosh:t=>N('bandpass',600,t,1.5,.25,2400,.8),
  tink:t=>{V(2600,t,.5,.12);V(3900,t,.25,.06)},
  boom:t=>{V(140,t,.7,.7,'sine',35);N('lowpass',500,t,.35,.6)},
  burst:t=>{N('bandpass',1200,t,.5,.2,6000,4);for(let n=0;n<6;n++)celesta(mf(84+Math.floor(H(t,n)*12)),t+.25+n*.05,.08)},
  crash:t=>{N('highpass',3000,t,.9,.3,0,1);for(let n=0;n<10;n++)V(mf(80+H(n,5)*24),t+H(n,6)*.5,.6,.05)},
  note:t=>mbox(mf(79),t,.35,3.5)};
 function bar(b){
  const C=CH[(b>>1)&3],R=k=>H(b,k),x=k=>X(b+k/3);
  if(b<3){mbox(mf([C[2],C[1],C[0]][b]+12),X(b),.22);bass(mf(C[0]-24),X(b),.25);pizz(mf(C[1]-12),x(2),.04)}
  else if(b<23){
   bass(mf(C[0]-24),x(0),.35);
   for(const k of[1,2])C.forEach(m=>pizz(mf(m-12),x(k),.035));
   for(let e=0;e<6;e++)celesta(mf(C[[0,2,1,2,0,1][e]]+12),X(b+e/6),.1);
   if(b>=13)for(let e=0;e<6;e++)if(R(e)>.5)mbox(mf(C[2]+24),X(b+e/6),.05,1);
  }
  else if(b<28){
   V(mf(C[0]-24),X(b),.9,.25,'sawtooth',mf(C[0]-36));
   for(let k=0;k<16;k++)if(R(k)<.85){const f=mf(40+Math.floor(R(k+20)*40)),w=['square','sawtooth','triangle'][Math.floor(R(k+40)*3)];V(f,X(b+k/16),.3,.1,w);V(f*1.03,X(b+k/16),.3,.06,w)}
  }
  else{mbox(mf(C[1]+12),X(b),.2,2.6);if(b<34)pizz(mf(C[0]-12),x(1.5),.03)}
  for(const[eb,k]of EV)if(eb>=b&&eb<b+1)SFX[k](X(eb));
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b)}
 sched.out=master;return sched}

// live: schedule each bar about 1.2 s ahead of the audio clock
function live(A){const base=A.currentTime+.15,sched=setup(A,base);let b=0;
 const tick=()=>{while(b<BARS&&base+T(b)<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(Math.floor((T(b)-.5)*SR/128)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,T,B,E,BURST,LEN,BARS,BAR:LEN/BARS}})();
