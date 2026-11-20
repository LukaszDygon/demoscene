var SONG=(()=>{const BAR=2.4,BARS=32,LEN=BARS*BAR+3,TH={3:.4,8:.9,10:.6,13:.7,21:.3},rnd=Math.random,
CH=[[60,64,67],[57,60,64],[53,57,60],[55,59,62],[57,60,64],[60,64,67]],
ML=[67,64,62,60,69,72,71,69,65,69,67,65,67,71,74,71,72,67,64,67,62,59,67,62];
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),
cn=(n,o)=>(o.map(x=>n.connect(x)),n),
S=(p,v,t)=>p.setValueAtTime(v,t),L=(p,v,t)=>p.linearRampToValueAtTime(v,t),X=(p,v,t)=>p.exponentialRampToValueAtTime(v,t),
R=(p,q)=>q.forEach(([b,v],i)=>(i?L:S)(p,v,base+b*BAR)),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;return cn(g,o)},
F=(y,f,q,...o)=>{const n=K(A.createBiquadFilter());n.type=y;n.frequency.value=f;n.Q.value=q;return cn(n,o)},
O=(y,f,t,e,...o)=>{const n=K(A.createOscillator());n.type=y;n.frequency.value=f;n.start(t);n.stop(e);return cn(n,o)},
NB=A.createBuffer(1,SR*2,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rnd()*2-1;
const NS=(t,d,...o)=>{const s=K(A.createBufferSource());s.buffer=NB;s.loop=true;s.start(t,rnd());s.stop(t+d);return cn(s,o)},
E=(g,t,a,d)=>{const p=g.gain;S(p,0,t);L(p,a,t+.03);X(p,1e-4,t+d)},
mf=m=>440*2**((m-69)/12),
cp=A.createDynamicsCompressor(),MS=G(.6,cp);cp.connect(A.destination);
const hit=(t,d,ty,f,q,v,dec)=>{const g=G(0,MS);S(g.gain,v,t);X(g.gain,1e-4,t+dec);NS(t,d,F(ty,f,q,g))},
ping=(t,f,v)=>{const g=G(0,MS);S(g.gain,v,t);X(g.gain,1e-4,t+.12);O('sine',f,t,t+.13,g)};
// persistent beds, automated in bar indices (0 = bar 1)
const CL=A.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++)cv[i]=Math.max(-.5,Math.min(.5,(i/511.5-1)*3));CL.curve=cv;
const LP=F('lowpass',2500,.5,MS);cn(CL,[LP]);
const WG=G(0,CL),WB=F('bandpass',300,.6,WG);NS(base,LEN,WB);
R(WB.frequency,[[0,260],[8,700],[12,1000],[16,1500],[18,600],[26,250]]);
R(WG.gain,[[0,.03],[6,.2],[8,.35],[15,.35],[16,.7],[17,.5],[18,.15],[24,.04],[30,0]]);
const SG=G(0,F('lowpass',1400,.7,MS)),SI=O('triangle',700,base,base+LEN,SG);O('sine',.4,base,base+LEN,G(250,SI.frequency));
R(SG.gain,[[0,0],[5,0],[5.5,.04],[17,.05],[18,0]]);
const SB=G(0,MS);O('sine',38,base,base+LEN,SB);R(SB.gain,[[0,0],[8,.2],[16,.2],[17,0]]);
const DL=A.createDelay(.1);DL.delayTime.value=.02;cn(DL,[MS]);const RB=F('bandpass',1100,.7,DL);
O('sine',5.3,base,base+LEN,G(.003,DL.delayTime));O('sine',.7,base,base+LEN,G(.006,DL.delayTime));
const HS=G(0,RB);NS(base,LEN,HS);R(HS.gain,[[0,0],[26,0],[26.5,.025],[31,.025],[32,0]]);
function bar(b,t){
 if(b>=4&&b<=17)for(let k=0;k<16;k++)rnd()<.3&&hit(t+k*BAR/16,.02,'highpass',4e3+rnd()*2e3,.7,.12,.025);
 if(TH[b])hit(t,2.5,'lowpass',180,.5,TH[b],2.5);
 if(b>=9&&b<=15)for(let k=0;k<16;k++)rnd()<.12&&ping(t+k*BAR/16,1200+rnd()*2800,.05);
 if(b===16){const g=G(0,MS),o=O('sine',80,t,t+1.2,g);S(g.gain,.9,t);X(g.gain,1e-4,t+1.2);X(o.frequency,25,t+1)}
 if(b===18||b===19)for(let k=0;k<16;k++)rnd()<.6&&hit(t+k*BAR/16,.02,'bandpass',1500+rnd()*3e3,4,.3,.025);
 if(b>=26){const n=b-26,c=CH[n];
  c.forEach(x=>{const g=G(0,RB);O('triangle',mf(x),t,t+BAR,g);E(g,t,.25,BAR*.95)});
  {const g=G(0,RB);O('triangle',mf(c[0]-24),t,t+BAR,g);E(g,t,.3,BAR)}
  for(let q=0;q<4;q++){const s=t+q*BAR/4,g=G(0,RB);O('sine',mf(ML[n*4+q]),s,s+BAR/2,g);E(g,s,.3,BAR/2)}}}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
bag=[];sched.out=cp;return sched}
// live: bars are scheduled ~1.2 s ahead so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same graph, bars injected with suspend()
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BAR,BARS,LEN}})();
