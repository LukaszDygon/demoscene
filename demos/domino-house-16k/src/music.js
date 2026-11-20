var SONG=(()=>{const BAR=1.5,BARS=41,LEN=62;
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;o.map(x=>g.connect(x));return g},
O=(y,f,t,e,...o)=>{const n=K(A.createOscillator());n.type=y;n.frequency.value=f;n.start(t);n.stop(e);o.map(x=>n.connect(x));return n},
E=(g,t,d,v)=>{const p=g.gain;p.setValueAtTime(0,t);p.linearRampToValueAtTime(v,t+.003);p.exponentialRampToValueAtTime(1e-4,t+d)},
mf=m=>440*2**((m-69)/12),
comp=A.createDynamicsCompressor(),M=G(.5,comp),cv=A.createConvolver(),RV=G(.3,cv),
NB=(()=>{const b=A.createBuffer(1,SR*.03|0,SR),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b})(),
IR=(()=>{const b=A.createBuffer(2,SR*2|0,SR);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}return b})();
cv.buffer=IR;cv.connect(M);comp.connect(A.destination);
const cel=(t,m,v,d=1.2)=>{const g=G(0,M,RV);O('sine',mf(m),t,t+d,g);O('sine',mf(m)*4,t,t+.3,g);E(g,t,d,v)},
box=(t,m,v)=>{const g=G(0,M,RV);O('triangle',mf(m),t,t+1,g);O('sine',mf(m)*2,t,t+.4,g);E(g,t,1,v)},
pz=(t,m,v)=>{const g=G(0,M);O('triangle',mf(m),t,t+.25,g);E(g,t,.2,v)},
clk=(t,v)=>{const s=K(A.createBufferSource());s.buffer=NB;const f=K(A.createBiquadFilter());f.type='highpass';f.frequency.value=2800;s.connect(f);f.connect(G(v,M));s.start(t);s.stop(t+.03)},
boom=t=>{const g=G(0,M),o=O('sine',120,t,t+.6,g);o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(35,t+.5);E(g,t,.6,.8)},
CH=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]];
function bar(b,t){const c=CH[b&3],N=b<12?3:b<17?6:9;
 if(b>=33){if(b==40)box(t,84,.3);return}
 if(b>=20){for(let i=0;i<12;i++){const u=t+i*BAR/12;pz(u,36+(Math.random()*48|0),.14);if(i%2)cel(u,60+(Math.random()*24|0),.05,.4)}if(b==20)boom(t);return}
 pz(t,c[0]-12,.45);pz(t+BAR/3,c[1],.1);pz(t+2*BAR/3,c[2],.1);
 for(let i=0;i<N;i++)cel(t+i*BAR/N,c[i%3]+12+12*((i/3|0)%2),b<3?.07:.1);
 if(b>=3&&b<6)for(let i=0;i<6;i++)box(t+i*BAR/6,88-(b-3)*6-i*2,.12);
 for(let i=0;i<20;i++){const s=9+i*.2;if(s>=b*BAR&&s<(b+1)*BAR)clk(t+s-b*BAR,.5)}
 if(b==10)cel(t,88,.2);
 if(b==11){clk(t+BAR/2,.8);pz(t+BAR/2,79,.3)}
 if(b==12)boom(t+BAR/2);
 if(b>=14&&b<17)for(let i=0;i<N;i++)cel(t+i*BAR/N,96+(Math.random()*12|0),.06,.6);
 if(b==17||b==18)for(let i=0;i<6;i++)cel(t+i*BAR/6,96-i*3-(b-17)*12,.1,.9)}
function sched(b){bag=[];if(BAGS[b-3]){BAGS[b-3].map(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BAR,BARS,LEN}})();
