var SONG=(()=>{const BAR=60/72*4,BARS=20,LEN=BARS*BAR+4,mf=m=>440*2**((m-69)/12);
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),cn=(n,...o)=>(o.forEach(x=>n.connect(x)),n),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;return cn(g,...o)},
E=(g,t,a,v,d)=>{const p=g.gain;p.setValueAtTime(0,t);p.linearRampToValueAtTime(v,t+a);p.exponentialRampToValueAtTime(1e-4,t+a+d)},
O=(y,f,t,e,d)=>{const o=K(A.createOscillator());o.type=y;o.frequency.setValueAtTime(f,t);o.start(t);o.stop(e);return cn(o,d)},
F=(y,f,q,...o)=>{const x=K(A.createBiquadFilter());x.type=y;x.frequency.value=f;x.Q.value=q;return cn(x,...o)};
const NB=A.createBuffer(1,SR*2,SR),nz=NB.getChannelData(0);for(let i=0;i<nz.length;i++)nz[i]=Math.random()*2-1;
const N=(t,e,d)=>{const s=K(A.createBufferSource());s.buffer=NB;s.loop=1;s.start(t);s.stop(e);return cn(s,d)};
const comp=A.createDynamicsCompressor(),M=G(.3,comp),RV=A.createConvolver(),IR=A.createBuffer(2,SR*2.5|0,SR);
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}
RV.buffer=IR;cn(RV,G(.3,M));cn(comp,A.destination);
const rain=A.createBufferSource();rain.buffer=NB;rain.loop=1;rain.start(base);rain.stop(base+LEN);cn(rain,F('highpass',2500,.6,G(.07,M)));
const PL=(t,m,v)=>{const P=SR/mf(m)|0,n=SR*2,b=A.createBuffer(1,n,SR),y=b.getChannelData(0);
 for(let i=0;i<n;i++)y[i]=i<P?Math.random()*2-1:i>P?.4985*(y[i-P]+y[i-P-1]):0;
 const s=K(A.createBufferSource());s.buffer=b;s.start(t);return cn(s,G(v,M,RV))},
TK=(t,v)=>{const g=G(0,M);E(g,t,.002,v,.7);O('sine',120,t,t+.8,g).frequency.exponentialRampToValueAtTime(42,t+.35);N(t,t+.04,F('highpass',2500,.7,g))},
CL=(t,v)=>{const g=G(0,M,RV);E(g,t,.001,v,.6);[2310,3140,4870].forEach(f=>O('sine',f,t,t+.7,g));N(t,t+.12,F('bandpass',3500,3,g))},
CK=t=>{const g=G(0,M,RV);E(g,t,.001,.8,.5);O('sine',180,t,t+.4,g).frequency.exponentialRampToValueAtTime(45,t+.2);N(t,t+.2,F('bandpass',1400,1.5,g))},
SW=(t,d)=>{const g=G(0,M,RV),f=F('bandpass',300,2,g);f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(5000,t+d);E(g,t,.05,.35,d);N(t,t+d+.1,f)},
FL=(t,m,d,v)=>{const g=G(0,M,RV);E(g,t,.25,v,d);O('sine',mf(m),t,t+d+.3,g);N(t,t+d,F('bandpass',mf(m)*2,9,G(.2,g)))};
const EV=[],at=(b,f)=>EV.push([b,f]),Z=(b,k,m,v)=>at(b+k/4,t=>PL(t,m,v)),DR=(b,k,v)=>at(b+k/4,t=>TK(t,v));
Z(0,0,62,.5);Z(0,2.5,57,.35);Z(1,1,55,.4);Z(1,3,50,.4);Z(2,0,55,.45);Z(2,2,62,.35);Z(3,0,50,.5);Z(3,2,59,.35);
at(2,t=>FL(t,62,BAR*1.6,.2));
const FM=[62,64,67,62,59,57,62,64,59],P8=[62,57,59,64,62,55,57,59];
for(let b=5;b<14;b++){for(let k=0;k<8;k++)Z(b,k/2,P8[(k+b)%8],.28);DR(b,0,.7);DR(b,2,.5);at(b,t=>FL(t,FM[b-5],BAR*.8,.2))}
[5,6.5,8,10,11.5].forEach(b=>at(b,t=>{CL(t,.35);TK(t,.9)}));
[7,9,11].forEach(b=>at(b,CK));
at(15,t=>PL(t,38,.6));at(15.6,t=>{SW(t,.35);TK(t,1)});at(16,t=>{PL(t,38,.7);TK(t,.6)});at(16.25,CK);at(16.8,CK);at(17,t=>PL(t,74,.6));
Z(18,0,62,.3);Z(18.5,2,57,.25);Z(19,0,50,.3);at(18,t=>FL(t,62,BAR*1.8,.16));
M.gain.setValueAtTime(.5,base+19*BAR);M.gain.linearRampToValueAtTime(0,base+20*BAR);
const sched=b=>{bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
 EV.forEach(([e,f])=>{if(Math.floor(e)===b)f(base+e*BAR)});BAGS[b]=bag};
bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sc=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sc(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sc.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sc=setup(A,0);sc(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sc(b);A.resume()});
 return A.startRendering()}
return{live,render,BAR,BARS,LEN}})();
