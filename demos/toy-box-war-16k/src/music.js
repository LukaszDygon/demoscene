var SONG=(()=>{
const BAR=2,BARS=36,LEN=BARS*BAR+5,P=[18,22,26,30,34,50,53,60];
const CH=[[50,62,66,69],[45,64,69,73],[47,62,66,71],[43,59,62,67]];
const M1=[62,66,69,74,71,69,66,62,64,66,69,71,74,74,71,69],M2=[69,71,74,77,76,74,71,69,67,69,71,74,72,71,69,0];
const n=m=>440*2**((m-69)/12);
function setup(A,base){
const SR=A.sampleRate;let bag=[];const BAGS=[],K=x=>(bag.push(x),x);
const bf=(s,f)=>{const b=A.createBuffer(1,SR*s|0,SR),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=f(i/d.length)*(Math.random()*2-1);return b},
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;o.forEach(x=>g.connect(x));return g},
E=(g,t,a,v,d)=>{g=g.gain;g.setValueAtTime(0,t);g.linearRampToValueAtTime(v,t+a);g.exponentialRampToValueAtTime(1e-3,t+a+d)},
C=A.createDynamicsCompressor(),M=G(.5,C),V=A.createConvolver(),RV=G(.45,V),NZ=bf(1,()=>1);
C.connect(A.destination);V.buffer=bf(3,x=>(1-x)**3);V.connect(M);
const N=(t,d,y,f,q,v,o)=>{const s=K(A.createBufferSource()),l=K(A.createBiquadFilter()),g=G(0,o);s.buffer=NZ;l.type=y;l.frequency.value=f;l.Q.value=q;s.connect(l);l.connect(g);E(g,t,.002,v,d);s.start(t,Math.random()*.5);s.stop(t+d+.05)},
T=(t,f,d,v,o,y='sine')=>{const x=K(A.createOscillator()),g=G(0,o);x.type=y;x.frequency.value=f;x.connect(g);x.start(t);x.stop(t+d+.05);E(g,t,.003,v,d)},
bell=(t,m,d,v,o)=>{T(t,n(m),d,v,o);T(t,n(m)*4.02,d*.25,v*.3,o)},
kick=t=>{const x=K(A.createOscillator()),g=G(0,M);x.frequency.setValueAtTime(150,t);x.frequency.exponentialRampToValueAtTime(40,t+.12);x.connect(g);x.start(t);x.stop(t+.3);E(g,t,.002,.7,.22)},
snare=(t,v)=>{N(t,.13,'bandpass',1900,.9,v,M);T(t,200,.06,v*.5,M,'triangle')},
pop=t=>{N(t,.05,'bandpass',2600,1.5,.9,M);N(t,.12,'highpass',3500,.5,.25,RV)},
click=t=>{N(t,.01,'highpass',5000,.5,.6,M);T(t,1800,.01,.2,M)},
fall=t=>{const x=K(A.createOscillator()),g=G(0,M);x.type='triangle';x.frequency.setValueAtTime(900,t);x.frequency.exponentialRampToValueAtTime(55,t+1.6);x.connect(g);x.start(t);x.stop(t+1.7);E(g,t,.01,.3,1.6)},
kz=(t,m,d,v)=>{const x=K(A.createOscillator()),l=K(A.createOscillator()),f=K(A.createBiquadFilter()),g=G(0,M);x.type='sawtooth';x.frequency.value=n(m);l.frequency.value=5.5;l.connect(G(7,x.frequency));l.start(t);l.stop(t+d+.05);f.type='bandpass';f.frequency.value=1200;f.Q.value=1.6;x.connect(f);f.connect(g);x.start(t);x.stop(t+d+.05);E(g,t,.03,v,d)};
function bar(b,t){
const c=CH[b%4],D=k=>t+k*.5,hush=b>=20&&b<24,drum=b>=2&&b<32&&!hush;
if(b<2)for(let k=0;k<8;k++)snare(t+k*.25,.08+.06*b);
if(drum){for(let k=0;k<4;k++)snare(D(k),k?.3:.45);kick(t);kick(D(2))}
if(hush)T(t,n(c[0]),1.9,.12,M,'triangle');
else if(b>=2&&b<32)for(let k=0;k<4;k++)T(D(k),n(c[0]+(k&1?7:0)),.4,.18,M,'triangle');
if(b>=2&&b<32&&!hush)c.slice(1).forEach(m=>bell(t,m,1.5,.07,RV));
if(b>=8&&b<12)for(let k=0;k<4;k++)c.slice(1).forEach(m=>bell(D(k),m,.25,.05,M));
[[M1,4],[M1,12],[M2,16],[M2,28]].forEach(([p,s])=>{if(b>=s&&b<s+4)for(let k=0;k<4;k++){const m=p[(b-s)*4+k];if(m)bell(D(k),m,.4,.12,M)}});
if(b>=24&&b<28)for(let k=0;k<4;k++){const m=M2[(b-24)*4+k];if(m)kz(D(k),m,.45,.12)}
P.forEach(p=>{if(p>=b*BAR&&p<b*BAR+BAR)pop(t+p-b*BAR)});
if(b===2)click(t);
if(b===17)fall(t);
if(b===32)T(t,n(c[0]),1.9,.12,M,'triangle');
if(b===34){[62,66,69,74].forEach(m=>bell(t+1,m,3,.1,RV));T(t+1,n(50),3,.2,M,'triangle')}
}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(x=>x.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
sched.out=C;bag=[];return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sc=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sc(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sc.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sc=setup(A,0);sc(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sc(b);A.resume()});
return A.startRendering()}
return{live,render,P,BAR,BARS,LEN}})();
