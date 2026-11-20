var SONG=(()=>{
const BPM=72,BAR=240/BPM,BARS=24,LEN=BARS*BAR+5,BT=BAR/4;
const CH=[[50,57,62,65],[46,53,57,60],[43,50,53,57],[45,52,56,59]];
const F=m=>440*2**((m-69)/12);
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[];
 const keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const comp=A.createDynamicsCompressor(),master=G(1.4,comp);comp.connect(A.destination);
 const rv=A.createConvolver(),IR=A.createBuffer(2,SR*3,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}
 rv.buffer=IR;const bus=G(1,master,rv);rv.connect(G(.6,master));
 const NB=A.createBuffer(1,SR*2,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const nz=(t,d)=>{const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;s.start(t);s.stop(t+d);return s};
 function V(f,t,d,v,f1,f2){
  const o=keep(A.createOscillator()),g=G(0,bus);o.type='sawtooth';o.frequency.value=f;o.detune.value=Math.random()*10-5;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.35);g.gain.linearRampToValueAtTime(0,t+d);
  for(const q of[f1,f2]){const b=keep(A.createBiquadFilter());b.type='bandpass';b.Q.value=8;b.frequency.value=q;o.connect(b);b.connect(g)}
  o.start(t);o.stop(t+d)}
 function ping(t,f){
  const o=keep(A.createOscillator()),g=G(0,bus);o.frequency.value=f;o.connect(g);
  g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+1.4);o.start(t);o.stop(t+1.5)}
 function breath(t,d){
  const s=nz(t,d),f=keep(A.createBiquadFilter()),g=G(0,bus);f.frequency.value=700;s.connect(f);f.connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22,t+d*.45);g.gain.linearRampToValueAtTime(0,t+d)}
 function roar(t,d,amp){
  const s=nz(t,d),f=keep(A.createBiquadFilter()),g=G(0,bus),o=keep(A.createOscillator());
  f.type='bandpass';f.Q.value=.9;f.frequency.setValueAtTime(250,t);f.frequency.exponentialRampToValueAtTime(2400,t+d);
  s.connect(f);f.connect(g);o.type='sawtooth';o.frequency.value=41;o.connect(G(.2,g));o.start(t);o.stop(t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(amp,t+d*.3);g.gain.linearRampToValueAtTime(0,t+d)}
 // one bar of the arrangement (b = 0-based bar, t = context time of its downbeat)
 function bar(b,t){
  const sil=b==8||b==9,o=b<8?0:b<13?12:b<16?-12:b<20?0:12,m=.5+.5*Math.sin(b*.6);
  if(b%2==0&&b!=8){const c=CH[(b>>1)%4];for(const n of c)V(F(n+o),t,2*BAR+.3,(b<2?.04:.07)/4,350+450*m,1200-400*m)}
  if(b>1&&!sil)for(let k=0;k<4;k+=b>12&&b<16?1:2)ping(t+k*BT,b>21?988:1318);
  if(b%2==0||b>12&&b<16)breath(t,b>19?1.6:2.4);
  if(b==20)roar(t,2.2*BAR,.5);
  if(b==21)roar(t,1.2*BAR,.45);
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
