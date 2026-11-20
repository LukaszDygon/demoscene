var SONG=(()=>{const BAR=2.5,BARS=32,LEN=81,m2f=m=>440*2**((m-69)/12),MEL=[64,67,69,71,74,71,69,67,64,67,71,69,67,64,62,64];
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),
W=k=>{const c=new Float32Array(2001);for(let i=0;i<2001;i++)c[i]=Math.tanh(k*(i/1000-1));const w=A.createWaveShaper();w.curve=c;return w},
M=A.createGain(),CP=A.createDynamicsCompressor(),DV=W(4),LD=W(9),DL=A.createDelay(1),FB=A.createGain(),LP=A.createBiquadFilter(),DR=A.createOscillator(),DG=A.createGain(),
NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);
for(let i=0;i<SR;i++)nd[i]=Math.random()*2-1;
M.gain.value=.5;M.connect(CP);CP.connect(A.destination);DV.connect(M);LD.connect(M);LD.connect(DL);DL.connect(M);DL.connect(FB);FB.connect(DL);
DL.delayTime.value=.47;FB.gain.value=.35;
DR.type='sawtooth';DR.frequency.setValueAtTime(36,base);
for(let b=1;b<=BARS;b++)DR.frequency.linearRampToValueAtTime(36+10*Math.min(b/12,1)+(b>12&&b<17?8:0),base+b*BAR);
LP.type='lowpass';LP.frequency.value=170;DG.gain.value=.22;DR.connect(LP);LP.connect(DG);DG.connect(M);DR.start(base);DR.stop(base+LEN);
M.gain.setValueAtTime(.5,base);M.gain.setValueAtTime(0,base+15*BAR);M.gain.setValueAtTime(.5,base+17*BAR);M.gain.setValueAtTime(.5,base+30*BAR);M.gain.linearRampToValueAtTime(0,base+31*BAR);
function kick(t){const o=K(A.createOscillator()),g=K(A.createGain());o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.15);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(DV);o.start(t);o.stop(t+.36)}
function tom(t,f,v){const o=K(A.createOscillator()),g=K(A.createGain());o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.6,t+.25);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(g);g.connect(DV);o.start(t);o.stop(t+.26)}
function nz(t,d,v,f,to){const s=K(A.createBufferSource()),F=K(A.createBiquadFilter()),g=K(A.createGain());s.buffer=NB;F.type='bandpass';F.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(F);F.connect(g);g.connect(to);s.start(t);s.stop(t+d)}
function lead(t,m,d){const o=K(A.createOscillator()),g=K(A.createGain());o.type='sawtooth';o.frequency.value=m2f(m);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(LD);o.start(t);o.stop(t+d)}
function bar(b,t){if(b===15||b===16)return;const q=BAR/4,full=b>8&&b<15,mid=b>3&&b<9||b>16&&b<22;
 if(b<4){tom(t,110,.5);tom(t+2*q,110,.5)}
 else if(full||mid){for(let i=0;i<(full?16:8);i++)tom(t+i*q/(full?4:2),[95,150,80,120][i&3],.3);
  for(let i=0;i<(full?4:2);i++)kick(t+i*q*(full?1:2));
  if(full){nz(t+q,.25,.4,1500,DV);nz(t+3*q,.25,.4,1500,DV)}}
 else{if(b%2==0)kick(t);tom(t+2*q,80,.25)}
 if(b>8&&b<15||b>16)for(let i=0;i<4;i++)lead(t+i*q,MEL[(b%4)*4+i],q*.9);
 if(b===17){nz(t,3,1.2,200,M);tom(t,50,1.5);nz(t,4,.5,6000,M)}}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
sched.out=M;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BAR,BARS,LEN}})();
