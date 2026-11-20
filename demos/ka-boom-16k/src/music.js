var SONG=(()=>{
const BPM=174,BEAT=60/BPM,BAR=4*BEAT,BARS=48,LEN=BARS*BAR+3,RT=[29,25,20,27];
const hz=n=>440*2**((n-69)/12);
function setup(A,base){
const S=A.sampleRate;let bag=[];const BAGS=[];
const keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const comp=A.createDynamicsCompressor(),master=G(.5,comp),LP=A.createBiquadFilter(),bus=G(1,LP);
LP.frequency.value=18000;LP.connect(master);comp.connect(A.destination);
const cv=A.createConvolver(),ir=A.createBuffer(1,S*3|0,S),id=ir.getChannelData(0);for(let i=0;i<id.length;i++)id[i]=(Math.random()*2-1)*(1-i/id.length)**3;
cv.buffer=ir;cv.connect(master);const rv=G(.6,cv);
const nb=A.createBuffer(1,S*2|0,S),nd=nb.getChannelData(0);
for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
const bn=BAR*S|0,bb=A.createBuffer(1,bn,S),bd=bb.getChannelData(0),Q=bn/16;
for(let s=0;s<16;s++){const ev=(len,f)=>{const o=s*Q|0;for(let j=0;j<len*S&&o+j<bn;j++)bd[o+j]+=f(j/S)};
if(s==0||s==10)ev(.3,t=>Math.sin(6.28*(40*t+4.8*(1-Math.exp(-25*t))))*Math.exp(-9*t));
if(s==4||s==12)ev(.25,t=>((Math.random()*2-1)*.7+Math.sin(1194*t)*.4)*Math.exp(-20*t));
if(s%2)ev(.04,t=>(Math.random()*2-1)*Math.exp(-90*t)*.3);
if(s==7||s==11||s==14)ev(.15,t=>(Math.random()*2-1)*Math.exp(-30*t)*.4)}
const E=(t,v,d,to=bus)=>{const g=keep(A.createGain());g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.setTargetAtTime(0,t+d*.6,d*.15);g.connect(to);return g};
const kick=(t,v)=>{const o=keep(A.createOscillator());o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(38,t+.12);o.connect(E(t,v,.5));o.start(t);o.stop(t+.6)};
const NZ=(t,v,d,ty,f,to)=>{const s=keep(A.createBufferSource()),q=keep(A.createBiquadFilter());s.buffer=nb;s.loop=true;q.type=ty;q.frequency.value=f;s.connect(q);q.connect(E(t,v,d,to));s.start(t,Math.random());s.stop(t+d*1.2)};
const TONE=(ty,t,d,n,v,to)=>{const o=keep(A.createOscillator());o.type=ty;o.frequency.value=hz(n);o.connect(E(t,v,d,to));o.start(t);o.stop(t+d*1.2)};
const SAW=(t,d,n,v,cut)=>{for(const dt of[-9,9]){const o=keep(A.createOscillator()),q=keep(A.createBiquadFilter());o.type='sawtooth';o.frequency.value=hz(n);o.detune.value=dt;q.frequency.setValueAtTime(cut,t);q.frequency.exponentialRampToValueAtTime(cut/3,t+d);o.connect(q);q.connect(E(t,v,d*1.1));o.start(t);o.stop(t+d*1.2)}};
const brk=(t,b)=>{for(let s=0;s<16;s++){const x=keep(A.createBufferSource());x.buffer=bb;x.playbackRate.value=s%7?1:2;x.connect(bus);x.start(t+s*BAR/16,((s*(5+b%3*2)+b*3)%16)*Q/S,Q/S)}};
function bar(b,t){const r=RT[b&3],bt=s=>t+s*BEAT,on=b>=5&&b<15||b>=17&&b<42;
if(b<4)NZ(t,.012,BAR,'highpass',5000);
if(b==4){NZ(t,.5,1.6,'highpass',2500);kick(t,1)}
if(b==10||b==17||b==30||b==36||b==42)kick(t,.8);
if(b==17||b==42)NZ(t,.35,1.4,'highpass',3000);
if(on)brk(t,b);
if(b>=7&&on)for(const o of[0,2])SAW(bt(o),BEAT*1.5,r+12,.2,300);
if(b>=10&&on)for(const o of[1.5,3.5])for(const n of[24,27,31])SAW(bt(o),BEAT*.45,r+n,.08,1800);
if([9,21,29,35].includes(b))for(let s=0;s<16;s++)NZ(t+s*BAR/16,.03+s*.012,BEAT/3,'highpass',1500+s*400);
if(b==15){SAW(t,BAR*2,r+12,.05,500);NZ(t,.15,BAR*2,'lowpass',900,rv)}
if(b==15||b==16)TONE('sine',t,BAR,r,.06);
if(b==22){LP.frequency.setValueAtTime(600,t);LP.frequency.exponentialRampToValueAtTime(18000,t+BAR*7)}
if(b>=42)TONE('sine',t,BAR,r,.3)}
const sched=b=>{bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)};
sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();