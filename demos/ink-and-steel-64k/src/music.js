var SONG=(()=>{
const BPM=80,BEAT=60/BPM,BAR=4*BEAT,BARS=60,LEN=BARS*BAR+5;
const SC=[0,3,5,7,10],MEL=[5,6,7,6,9,8,7,5,4,3,4,5],CH=[[0,2,4],[1,3,0],[0,2,4],[3,0,2]];
const PRO=[5,7,6,5,8,7,6,5],DU=[0,2,1,3,2,4,3,2,4,3,1,0];
const M=d=>50+12*Math.floor(d/5)+SC[((d%5)+5)%5];
const HZ=m=>440*Math.pow(2,(m-69)/12);
const CLS=[8,9,10.5,12,14,16,18,20.5],WH=[8.5,10.1667,14.1667,16.3333],BASS=[0,0,3,2];
const BH=[29,31,33.5,35,37,39.5];
function setup(A,base){
 const SR=A.sampleRate;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 let seed=20260,walk=0;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.62,comp);
 const rv=A.createConvolver(),IL=Math.floor(SR*2.6),ir=A.createBuffer(2,IL,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<IL;i++)d[i]=(rnd()*2-1)*Math.pow(1-i/IL,3)}
 rv.buffer=ir;rv.connect(G(.45,master));
 const bus=G(1,master,rv);
 const NB=A.createBuffer(1,2*SR|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rnd()*2-1;
 const rg=G(0,master),rl=A.createBiquadFilter(),rain=A.createBufferSource();
 rl.type='lowpass';rl.frequency.value=1500;rain.buffer=NB;rain.loop=true;rain.connect(rl);rl.connect(rg);rain.start(base);
 const dg=G(0,master);
 for(const[m,ty,v]of[[M(0)-12,'sine',.6],[M(0)-5,'triangle',.35],[M(0)+7,'sine',.08]]){const o=A.createOscillator();o.type=ty;o.frequency.value=HZ(m);o.connect(G(v,dg));o.start(base)}
 const KS={};
 function pluck(f){const k=Math.round(f);if(KS[k])return KS[k];
  const N=Math.round(SR/f),L=Math.round(SR*2.2),b=A.createBuffer(1,L,SR),d=b.getChannelData(0);
  for(let i=0;i<N;i++)d[i]=rnd()*2-1;
  for(let i=N;i<L;i++)d[i]=.4965*(d[i-N]+(i>N?d[i-N-1]:0));
  return KS[k]=b}
 function pn(x){const p=keep(A.createStereoPanner());p.pan.value=x;p.connect(bus);return p}
 function zither(t,m,v,x){const s=keep(A.createBufferSource());s.buffer=pluck(HZ(m));s.connect(G(v,pn(x)));s.start(t)}
 function noise(t,v,d,fq){const n=keep(A.createBufferSource()),f=keep(A.createBiquadFilter()),g=keep(A.createGain());
  n.buffer=NB;f.type='bandpass';f.frequency.value=fq;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
  n.connect(f);f.connect(g);g.connect(bus);n.start(t,rnd()*1.5,d+.01)}
 function flute(t,m,d,v,bend){const f=HZ(m),e=keep(A.createGain());
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.15);e.gain.setValueAtTime(v,t+d-.2);e.gain.linearRampToValueAtTime(0,t+d);e.connect(bus);
  const o=keep(A.createOscillator()),o2=keep(A.createOscillator()),l=keep(A.createOscillator()),lg=keep(A.createGain()),n=keep(A.createBufferSource()),bp=keep(A.createBiquadFilter());
  o.frequency.value=f;if(bend){o.frequency.setValueAtTime(f*.93,t);o.frequency.exponentialRampToValueAtTime(f,t+.3)}
  o2.frequency.value=2*f;l.frequency.value=5.2;lg.gain.value=f*.012;l.connect(lg);lg.connect(o.frequency);
  o2.connect(G(.12,e));o.connect(e);
  n.buffer=NB;n.loop=true;bp.type='bandpass';bp.frequency.value=f*1.5;bp.Q.value=2.5;n.connect(bp);bp.connect(G(.25,e));
  for(const x of[o,o2,l,n]){x.start(t);x.stop(t+d)}}
 function taiko(t,v){const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(44,t+.2);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+1.2);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+1.25);noise(t,v*.5,.06,2200)}
 function clash(t){[1,2.76,5.4,8.93].forEach((r,i)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.value=700*r;g.gain.setValueAtTime(.16/(i+1),t);g.gain.exponentialRampToValueAtTime(.001,t+1.4-.2*i);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+1.5)});noise(t,.5,.03,5000)}
 function bell(t,m,v){[[1,1],[2.76,.4],[5.4,.15]].forEach(([r,a])=>{const o=keep(A.createOscillator()),g=keep(A.createGain());
  o.frequency.value=HZ(m)*r;g.gain.setValueAtTime(v*a,t);g.gain.exponentialRampToValueAtTime(.001,t+4);
  o.connect(g);g.connect(bus);o.start(t);o.stop(t+4.1)})}
 function pad(t,m,d,v){const f=keep(A.createBiquadFilter()),e=keep(A.createGain());
  f.type='lowpass';f.frequency.value=700;e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+d*.4);e.gain.linearRampToValueAtTime(0,t+d);
  f.connect(e);e.connect(bus);
  [-.012,0,.012].forEach(dt=>{const o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=HZ(m)*(1+dt);o.connect(f);o.start(t);o.stop(t+d)})}
 function pro(b,t){
  const B=k=>t+k*BEAT,p=b;
  if(p===0){dg.gain.setValueAtTime(0,t);dg.gain.linearRampToValueAtTime(.05,t+BAR*2);noise(t,.05,2.5,1200)}
  flute(B(0),M(PRO[p]),BAR*.95,.15,true);
  if(p%2===1)flute(B(2),M(PRO[p]+2),BAR*.5,.05,false);
  if(p===0||p===4)zither(B(1.5),M(0),.15,0);
  if(p===4)noise(t,.05,2.5,1200);
  if(p===2){noise(B(0),.06,1.6,500);noise(B(2),.04,1.2,700)}
  if(p===5){flute(B(1),M(PRO[p]+4),BAR*.6,.07,true);flute(B(2.5),M(PRO[p]-2),BAR*.4,.05,false)}
  if(p===6)for(let k=0;k<4;k++)zither(B(k*.5),M([0,2,4,2][k]),.07,k%2?.3:-.3);
  if(p===7){bell(B(0),M(4)+12,.12);bell(B(2),M(0)+12,.06)}
 }
 function brawl(b,t){
  const B=k=>t+k*BEAT,q=b-8;
  for(let k=0;k<8;k++)taiko(B(k*.5),k%2?.35:.8);
  if(q>=2)for(let k=0;k<16;k++)noise(B(k*.25),.1,.04,3500);
  if(q>=4)for(let k=0;k<4;k++)zither(B(k),M(k%2?3:0)-12,.12,0);
  if(q===0)noise(t,.3,.8,700);
  if(q===3||q===5)for(let k=0;k<4;k++)noise(B(k),.22,.12,1500+400*k);
  if(q===5)for(let k=0;k<16;k++)taiko(B(2+k*.0625),.2+.04*k);
  if(q>=3)for(let k=0;k<8;k++)zither(B(k*.5),M(k%3?0:3)-12,.09,k%2?.4:-.4);
  BH.forEach(c=>{if(Math.floor(c/BAR)===b)clash(t+c-b*BAR)});
 }
 function flash(b,t){
  const B=k=>t+k*BEAT,f=b-14;
  for(let k=0;k<4;k++){const d=DU[(f*4+k)%12];zither(B(k),M(d),.34,-.4);zither(B(k),M(d+2),.3,.4)}
  if(f%2===1)bell(B(0),M(9),.05);
  if(f%2===0)for(let k=0;k<8;k++)zither(B(k*.5),M(DU[(f*8+k)%12]+(k%2?2:0)),.13,k%2?.25:-.25);
  if(f===5)bell(B(2),M(0)+12,.08);
 }
 function epi(b,t){
  const B=k=>t+k*BEAT,e=b-54;
  if(e===0){CH[0].forEach(d=>pad(B(0),M(d),BAR*5,.05));bell(B(0),M(0),.14)}
  if(e===1)zither(B(1),M(3),.26,.3);
  if(e===2){noise(B(0),.03,3,800);noise(B(2),.02,3,600)}
  if(e===1||e===4)bell(B(0),M(0),.05);
  if(e===3){zither(B(0),M(0),.14,-.2);bell(B(0),M(5),.07)}
  if(e===5){zither(B(0),M(0),.12,0);bell(B(0),M(0),.08)}
 }
 function duel(b,t){
  const B=k=>t+k*BEAT,R=rnd;
  if(b===0){rg.gain.setValueAtTime(0,t);rg.gain.linearRampToValueAtTime(.07,t+2*BAR);dg.gain.linearRampToValueAtTime(.07,t+2*BAR);bell(B(0),M(5),.1)}
  if(b===2)dg.gain.linearRampToValueAtTime(.05,t+BAR);
  if(b===22)rg.gain.linearRampToValueAtTime(.035,t+BAR);
  if(b===28){rg.gain.linearRampToValueAtTime(0,t+6*BAR);dg.gain.linearRampToValueAtTime(0,t+6*BAR)}
  WH.forEach(w=>{if(Math.floor(w)===b)noise(t+(w-b)*BAR,.18,.6,2500)});
  if(b<2)[0,2,4,2,0,3,4,1].forEach((d,k)=>{if(k%2===0||b===1)bell(B(k*.5),M(d+5),.05)});
  if(b<2)pad(B(0),M(0),BAR*2,.028);
  CLS.forEach(c=>{if(Math.floor(c)===b)clash(t+(c-b)*BAR)});
  if(b<7){
   if(b%2===1)zither(B(0),M(R()*4|0),.28,R()*.8-.4);
   if(b>=2)flute(B(0),M(MEL[b]),BAR*.9,.13,b>=3);
   if(b>=3)flute(B(0),M(MEL[b]+2),BAR*.9,.05,false);
   if(b===4||b===6)taiko(B(0),.45);
   if(b===6)taiko(B(2.5),.25);
  }
  else if(b===7){}
  else if(b<19){
   const hits=b<12?[0,1,2,2.5,3,3.5]:[0,1,1.5,2,2.5,3,3.5];
   hits.forEach(k=>taiko(B(k),k?0.4:0.8));
   for(let k=0;k<4;k++){walk=Math.max(0,Math.min(9,walk+(R()*3|0)-1));zither(B(k),M(walk),.22,(k-1.5)*.3)}
   zither(B(2),M(walk%5)-12,.3,0);
   flute(B(0),M(MEL[b%12]),2*BEAT,.15,false);flute(B(2),M(MEL[(b+5)%12]),2*BEAT,.15,b%2===0);
   if(b===9||b===13)bell(B(0),M(9),.08);
   for(let k=0;k<4;k+=2)zither(B(k),M(BASS[(b+k)%4])-12,.25,-.2);
   if(b>=12)taiko(B(1.5),.15);
  }
  else if(b===19){}
  else if(b===20){
   taiko(B(0),1);flute(B(0),M(9),BAR*1.4,.2,true);
   zither(B(2),M(12),.45,0);clash(B(2));
   taiko(B(2.5),.9);noise(B(3),.35,1.8,900);taiko(B(3),.6);bell(B(3),M(2),.1);
  }
  else if(b===21){zither(B(0),M(0),.3,-.3);zither(B(2),M(3),.2,.3);flute(B(0),M(5),BAR*.95,.09,false);pad(B(0),M(0),BAR*3,.035)}
  else if(b<28){
   if(b===22)flute(B(0),M(5),BAR*2,.09,true);
   if(b>=23&&b<=26)flute(B(0),M(MEL[b-16]),BAR*.9,.08,true);
   CH[b%4].forEach(d=>pad(B(0),M(d),BAR*2.5,.022));
   if(b%2===0)zither(B(0),M(R()*5|0),.2,R()*.6-.3);
   if(b===25)bell(B(0),M(0),.07);
  }
  else{
   if(b===28){CH[0].forEach(d=>pad(B(0),M(d),BAR*5,.03));zither(B(0),M(0),.25,0)}
   if(b===30){zither(B(0),M(3),.2,.2);bell(B(0),M(5),.1)}
   if(b===32){zither(B(0),M(0),.18,0);bell(B(0),M(0),.14)}
   if(b===33)bell(B(0),M(0),.1);
  }
 }
 function bar(b,t){
  if(b<8)pro(b,t);else if(b<14)brawl(b,t);else if(b<20)flash(b,t);else if(b<54)duel(b-20,t);else epi(b,t);
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
return{live,render,BPM,BAR,BARS,LEN}})();
