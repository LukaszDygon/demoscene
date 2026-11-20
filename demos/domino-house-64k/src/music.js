var SONG=(()=>{
const TM=[[0,38],[3,43],[7,50],[13,58],[18,67],[23,74],[31,81],[35,88],[40,41]];
const TS=[0];for(let i=1;i<TM.length;i++)TS[i]=TS[i-1]+(TM[i][0]-TM[i-1][0])*180/TM[i-1][1];
const T=b=>{let i=0;while(i<TM.length-1&&b>=TM[i+1][0])i++;return TS[i]+(b-TM[i][0])*180/TM[i][1]};
const B=t=>{let i=TS.length-1;while(i>0&&t<TS[i])i--;return TM[i][0]+(t-TS[i])*TM[i][1]/180};
const BARS=46,E={tap:0,drawer:3,drop:3.5,stairs:4.2,dom:7,books:3.8,ring:11,pop:13,lever:14.5,tele:16,cannon:16.4,hit:17.4,piano:17.7,bath:23.2,over:25.2,duck:25.4,seesaw:26.2,launch:26.6,train:27.4,t1:28.2,t2:29,t3:29.8,cut:31.2,crash:31.4,garden:31.6,fold:35.2,fold2:40.5,end:44.5};
const BURST=[18,18.6,19.2,19.8,20.4,21,21.6,22.2,22.8];
const CH={C:[60,64,67],Am:[57,60,64],F:[53,57,60],G:[55,59,62],Em:[52,55,59],Dm:[50,53,57],Bb:[58,62,65]},PR=['C','Am','F','G','C','Em','Dm','G','F','Am','Dm','G','C','Bb','F','G'];
const mf=m=>440*Math.pow(2,(m-69)/12);
const H=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)};
const EV=[[E.tap,'click'],[E.cut,'click'],[E.pop,'pop'],[E.pop,'whoosh'],[E.lever,'tink'],[E.tele,'snap'],[E.cannon,'boom'],[E.hit,'thock'],[E.piano,'piano'],[E.over,'splash'],[E.launch,'boing'],[E.t1,'thud'],[E.t2,'thud'],[E.t3,'thud'],[E.ring,'ring'],[E.ring+.3,'ring'],[E.ring+.6,'ring'],[E.crash,'crash'],[E.fold,'creak'],[E.end,'note']];
for(let i=0;i<18;i++)EV.push([E.dom+i/3,'click']);
for(let i=0;i<8;i++)EV.push([E.books+i*.06,'slap']);
for(let i=0;i<9;i++)EV.push([E.bath+i*.3,'bloop']);
BURST.forEach(b=>EV.push([b,'burst']));
const LEN=T(BARS)+3;

function setup(A,base){
 const SR=A.sampleRate,X=b=>base+T(b);
 let bag=[];const BAGS=[];const keep=n=>(bag.push(n),n);
 const comp=A.createDynamicsCompressor(),master=A.createGain(),verb=A.createConvolver(),send=A.createGain(),bus=A.createGain(),dist=A.createWaveShaper(),dbus=A.createGain();
 const cu=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511-1;cu[i]=Math.tanh(5*x)/Math.tanh(5)}
 dist.curve=cu;dist.oversample='4x';
 comp.connect(A.destination);master.gain.value=.6;master.connect(comp);
 verb.connect(master);send.gain.value=.35;send.connect(verb);bus.connect(master);bus.connect(send);
 dbus.gain.value=.5;dbus.connect(dist);dist.connect(master);
 const IR=A.createBuffer(2,SR*2.4|0,SR);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(H(i,c+1)*2-1)*Math.pow(1-i/d.length,3)}
 verb.buffer=IR;
 const NB=A.createBuffer(1,SR*.5|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=H(i,9)*2-1;
 const V=(fr,t,d,v,ty,sw,o)=>{const x=keep(A.createOscillator()),g=keep(A.createGain());x.type=ty||'sine';x.frequency.setValueAtTime(fr,t);
  if(sw)x.frequency.exponentialRampToValueAtTime(sw,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(1e-4,t+d);
  x.connect(g);g.connect(o||bus);x.start(t);x.stop(t+d+.05)};
 const N=(ty,fr,t,d,v,fe,q,o)=>{const s=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());
  s.buffer=NB;s.loop=true;fl.type=ty;fl.Q.value=q||1;fl.frequency.setValueAtTime(fr,t);if(fe)fl.frequency.exponentialRampToValueAtTime(fe,t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-4,t+d);
  s.connect(fl);fl.connect(g);g.connect(o||bus);s.start(t,H(t,3)*.3);s.stop(t+d+.05)};
 const PAD=(fr,t,d,v,o)=>{const f=keep(A.createBiquadFilter()),g=keep(A.createGain());f.type='lowpass';f.frequency.value=1400;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.4);g.gain.setValueAtTime(v,t+d-.5);g.gain.linearRampToValueAtTime(0,t+d);
  f.connect(g);g.connect(o||bus);
  for(const k of[-8,0,8]){const x=keep(A.createOscillator());x.type='sawtooth';x.frequency.value=fr;x.detune.value=k;x.connect(f);x.start(t);x.stop(t+d+.05)}};
 const celesta=(f,t,v)=>{V(f,t,1.5,v);V(f*4,t,.3,v*.25)};
 const mbox=(f,t,v,d)=>{V(f,t,d||2.4,v);V(f*3,t,.6,v*.3);V(f*5,t,.3,v*.08)};
 const pizz=(f,t,v,o)=>V(f,t,.25,v,'triangle',0,o);
 const bass=(f,t,v,o)=>{V(f,t,.8,v,'sine',0,o);V(f*2,t,.12,v*.3,'triangle',0,o)};
 const harp=(f,t,v)=>{V(f,t,.9,v,'triangle');V(f*2,t,.2,v*.2,'sine')};
 const reed=(f,t,d,v)=>{const fl=keep(A.createBiquadFilter()),g=keep(A.createGain());fl.type='bandpass';fl.frequency.value=f*2.5;fl.Q.value=2;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.08);g.gain.setValueAtTime(v,t+d-.1);g.gain.linearRampToValueAtTime(0,t+d);fl.connect(g);g.connect(bus);
  for(const k of[-5,5]){const x=keep(A.createOscillator());x.type='sawtooth';x.frequency.value=f;x.detune.value=k;x.connect(fl);x.start(t);x.stop(t+d+.05)}};
 const chime=(f,t,v)=>{V(f,t,3.2,v);V(f*2.76,t,1.6,v*.4);V(f*5.4,t,.6,v*.15)};
 const pluck=(f,t,v)=>{V(f,t,.6,v,'triangle');V(f*2,t,.2,v*.2)};
 const toy=(f,t,v)=>{const fl=keep(A.createBiquadFilter());fl.type='lowpass';fl.frequency.value=3000;fl.connect(bus);const x=keep(A.createOscillator()),g=keep(A.createGain());
  x.type='square';x.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-4,t+.25);x.connect(g);g.connect(fl);x.start(t);x.stop(t+.3)};
 const piano=(f,t,v)=>{V(f,t,2.4,v,'triangle');V(f*2,t,.9,v*.35);V(f*3,t,.4,v*.12);N('highpass',1800,t,.02,v*.4)};
 const kick=(t,v)=>{V(120,t,.3,v,'sine',40,dbus);N('lowpass',900,t,.05,v*.6,0,1,dbus)};
 const snare=(t,v)=>N('bandpass',1800,t,.2,v,0,1,dbus);
 const hat=(t,v,o)=>N('highpass',7000,t,.04,v,0,1,o);
 const SFX={
  click:t=>{N('bandpass',2600,t,.03,.5,0,2);V(900,t,.03,.12)},
  slap:t=>{N('bandpass',900,t,.05,.3,0,2);V(420,t,.05,.1)},
  pop:t=>{V(1400,t,.12,.25,'sine',300);N('highpass',2000,t,.05,.2)},
  whoosh:t=>N('bandpass',600,t,1.5,.25,2400,.8),
  tink:t=>{V(2600,t,.5,.12);V(3900,t,.25,.06)},
  snap:t=>{N('highpass',2500,t,.08,.4,0,1);V(180,t,.1,.3)},
  boom:t=>{V(140,t,.7,.7,'sine',35);N('lowpass',500,t,.35,.6)},
  thock:t=>{N('lowpass',700,t,.06,.5,0,1);V(220,t,.1,.2)},
  thud:t=>{V(90,t,.25,.5,'sine',40);N('lowpass',400,t,.1,.3)},
  ring:t=>{V(1760,t,.6,.18);V(2637,t,.4,.07)},
  bloop:t=>V(300,t,.2,.08,'sine',700),
  splash:t=>{N('bandpass',1500,t,.6,.35,600,1);V(500,t,.3,.1,'sine',1200)},
  boing:t=>V(200,t,.5,.2,'sine',800),
  creak:t=>V(160,t,1.2,.15,'sawtooth',70),
  piano:t=>[60,64,67,72].forEach((m,i)=>piano(mf(m),t+i*.05,.3)),
  burst:t=>{N('bandpass',1200,t,.5,.2,6000,4);for(let n=0;n<6;n++)celesta(mf(84+Math.floor(H(t,n)*12)),t+.25+n*.05,.08)},
  crash:t=>{N('highpass',3000,t,.9,.3,0,1,dbus);for(let n=0;n<10;n++)V(mf(80+H(n,5)*24),t+H(n,6)*.5,.6,.05)},
  note:t=>mbox(mf(79),t,.35,3.5)};
 function bar(b){
  const c=CH[PR[b%16]],x=k=>X(b+k/3),R=k=>H(b,k),M=[0,2,1,2,0,1],e6=e=>X(b+e/6);
  const mel=(f,v)=>{for(let e=0;e<6;e++)f(mf(c[M[(e+b)%6]]+12),e6(e),v)};
  const oom=(v)=>{bass(mf(c[0]-24),x(0),v);bass(mf(c[2]-24),x(2),v*.55);for(const k of[1,2])c.forEach(m=>pizz(mf(m-12),x(k),v*.09))};
  if(b<3){mbox(mf(c[2]+12),X(b),.2);bass(mf(c[0]-24),X(b),.25);pizz(mf(c[1]-12),x(2),.04);for(let e=0;e<3;e++)harp(mf(c[e]+24),x(e*.5),.02)}
  else if(b<7){oom(.4);mel(celesta,.1);if(b>=5)PAD(mf(c[0]-12),X(b),2.9,.03)}
  else if(b<14.5){
   oom(.38);mel((f,t,v)=>reed(f,t,.5,v*1.2),.08);
  }
  else if(b<18){
   bass(mf(c[0]-24),x(0),.3);bass(mf(c[2]-24),x(2),.2);
   for(let e=0;e<3;e++)chime(mf(c[(e+b)%3]+24),e6(e*2),.05);
   for(const k of[0,1,2])pizz(mf(c[k]+12),x(k),.04);
  }
  else if(b<23){oom(.4);mel(celesta,.1);if(b>=18)for(let k=0;k<6;k++)hat(X(b+k/6),.012)}
  else if(b<27){
   for(let e=0;e<9;e++)pluck(mf(c[e%3]+24+12*(e>5)),X(b+e/9),.05);
   bass(mf(c[0]-24),x(0),.3);
  }
  else if(b<31){
   for(let e=0;e<6;e++)toy(mf(c[M[(e+b)%6]]+24),e6(e),.05);
   bass(mf(c[0]-24),x(0),.25);kick(x(0),.15);
  }
  else if(b<35){oom(.36);mel(celesta,.09);for(let e=0;e<3;e++)chime(mf(c[e]+24),e6(e*2+1),.03);PAD(mf(c[0]-12),X(b),2.9,.03)}
  else if(b<40){
   const hot=1-(b-35)*.06;
   kick(X(b),.95*hot);kick(x(2),.7*hot);snare(x(1),.6*hot);hat(x(.5),.25);hat(x(1.5),.25);hat(x(2.5),.25);
   for(let k=0;k<8;k++){const f=mf(c[k%3]+(k<4?0:12)+R(k)*1.4-.7),t=x(k/2);V(f,t,.5,.16*hot,'sawtooth',0,dbus);V(f*1.02,t,.5,.12*hot,'square',0,dbus)}
   V(mf(c[0]-24),X(b),.9,.5,'sawtooth',mf(c[0]-36),dbus);
   V(mf(60+Math.floor(R(3)*12)),X(b),.9,.25*hot,'sawtooth',mf(40+Math.floor(R(4)*12)),dbus);
   for(let j=0;j<8;j++)if(R(j+8)<.75)V(mf(72+Math.floor(R(j+16)*24)),X(b+j/8),.2,.08*hot,'sine',0,dbus);
   N('bandpass',1000,X(b),.9,.25*hot,4000,1,dbus);
  }
  else if(b<44){
   const f=(44-b)/4;
   PAD(mf(c[0]-12),X(b),2.9,.035*f);mbox(mf(c[2]+12),X(b),.16*f,2.6);
   if(b%2===0)pizz(mf(c[1]-12),x(2),.03*f);
   for(let e=0;e<3;e++)harp(mf(c[e]+24),x(e*.5),.02*f);
  }
  for(const[eb,k]of EV)if(eb>=b&&eb<b+1)SFX[k](X(eb));
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b)}
 sched.out=master;return sched}

function live(A){const base=A.currentTime+.15,sched=setup(A,base);let b=0;
 const tick=()=>{while(b<BARS&&base+T(b)<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(Math.floor((T(b)-.5)*SR/128)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,T,B,E,BURST,LEN,BARS,BAR:LEN/BARS}})();
