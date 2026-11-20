var SONG=(()=>{const BAR=2,BARS=30,LEN=65;
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),
cn=(n,o)=>(o.map(x=>n.connect(x)),n),
S=(p,v,t)=>p.setValueAtTime(v,t),L=(p,v,t)=>p.linearRampToValueAtTime(v,t),X=(p,v,t)=>p.exponentialRampToValueAtTime(v,t),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;return cn(g,o)},
O=(y,f,t,e,...o)=>{const n=K(A.createOscillator());n.type=y;n.frequency.value=f;n.start(t);n.stop(e);return cn(n,o)},
F=(y,f,q,...o)=>{const n=K(A.createBiquadFilter());n.type=y;n.frequency.value=f;n.Q.value=q;return cn(n,o)},
W='sawtooth',mf=m=>440*2**((m-69)/12),
E=(g,t,a,v,d)=>{g=g.gain;S(g,0,t);L(g,v,t+a);X(g,1e-4,t+a+d)},
bf=(s,f)=>{const b=A.createBuffer(2,SR*s,SR);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=f(i/d.length)*(Math.random()*2-1)}return b},
NB=bf(2,x=>1),
N=(t,d,o)=>{const s=K(A.createBufferSource());s.buffer=NB;s.loop=1;s.start(t);s.stop(t+d);s.connect(o)},
comp=A.createDynamicsCompressor(),M=G(.42,comp),cv=A.createConvolver(),RV=G(.35,cv),dl=A.createDelay(1),PU=G(1,M,RV),pg=PU.gain,
kick=(t,v)=>{const g=G(0,M);X(O('sine',150,t,t+.5,g).frequency,42,t+.14);E(g,t,.002,v,.45);S(pg,.2,t);pg.setTargetAtTime(1,t+.03,.1)},
nz=(t,d,y,f,v,e,...o)=>{const g=G(0,...o);N(t,d,F(y,f,.7,g));E(g,t,.001,v,e)},
snare=(t,v)=>{const h=G(0,M);nz(t,.3,'bandpass',1900,v,.22,M,RV);O('triangle',190,t,t+.2,h);E(h,t,.001,v*.5,.1)},
hat=(t,v)=>nz(t,.08,'highpass',8e3,v,.04,M),
crash=(t,v)=>nz(t,2,'highpass',5e3,v,1.8,M,RV),
riser=(t,d)=>{const g=G(0,M,RV),f=F('bandpass',300,3,g);N(t,d,f);X(f.frequency,7e3,t+d);S(g.gain,0,t);L(g.gain,.5,t+d)},
bass=(t,m,d)=>{const g=G(0,PU),f=F('lowpass',1600,6,g);O(W,mf(m),t,t+d+.05,f);O('square',mf(m-12),t,t+d+.05,f);X(f.frequency,180,t+d);E(g,t,.005,.3,d)},
arp=(t,m,c,v)=>{const g=G(0,PU,dl);O('square',mf(m),t,t+.3,F('lowpass',c,5,g));E(g,t,.003,v,.2)},
pad=(t,ch,d,v)=>{const g=G(0,PU,RV),f=F('lowpass',1300,1,g),x=g.gain;
 ch.map(m=>[-9,9].map(c=>O(W,mf(m),t,t+d+.8,f).detune.value=c));S(x,0,t);L(x,v,t+.4);S(x,v,t+d);L(x,0,t+d+.7)},
lead=(t,m,d)=>{const g=G(0,M,dl,RV),f=F('lowpass',3200,2,g),l=G(14),x=g.gain;O('sine',5.5,t,t+d+.1,l);
 [1,1.006].map(r=>l.connect(O(W,mf(m)*r,t,t+d+.1,f).detune));S(x,0,t);L(x,.13,t+.015);S(x,.11,t+d-.03);L(x,0,t+d+.08)},
MEL='O..MK.H.K.H.D.KMO..RO.K.M...J.F.T.RO..MOK...HKM.O.R.T.ROM.....--';
comp.connect(A.destination);cv.buffer=bf(2.5,x=>(1-x)**4);cv.connect(M);dl.delayTime.value=.375;cn(dl,[F('lowpass',2500,0,G(.4,dl)),G(.3,M,RV)]);
function bar(b,t){const C=[[45,57,60,64],[41,53,57,60],[48,55,60,64],[43,55,59,62]][b%4],dr=b>3&&b<28,tu=b>11&&b<16;
 if(b<28)pad(t,C.slice(1),BAR,b<4?.05:.035);
 if(b==28){pad(t,[57,64,69,72],4,.06);bass(t,33,3.5);kick(t,1);crash(t,.3)}
 if([4,16,24].includes(b))crash(t,.22);
 if(b==3||b==14)riser(t,b==3?2:4);
 for(let i=0;i<16;i++){const s=t+i/8;
  if(b<28)arp(s,C[[1,2,3,2][i%4]]+12+(i>>2)%2*12,b<4?250+b*600:b<12?2600:tu?900+(b-12)*700:3800,b<4?.07:.05);
  if(dr){if(i%4==0&&!(b==15&&i>7))kick(s,.9);
   if(tu||i%2==0)bass(s,C[0]+(i%4==2?12:0),tu?.11:.23);
   if(i%4==2||(b>15&&i%2))hat(s,i%4==2?.14:.06);
   if((b>7&&b<12||b>15)&&i%8==4)snare(s,.5);
   if(b==15)snare(s,.08+i*.03)}}
 if(b>15&&b<28)for(let i=0,k=(b-16)%8*8,c,d;i<8;i++)if((c=MEL[k+i])>'.'){for(d=1;MEL[k+i+d]=='.';)d++;lead(t+i/4,c.charCodeAt()-3,d/4)}}
function sched(b){bag=[];if(BAGS[b-3]){BAGS[b-3].map(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM:120,BAR,BARS,LEN}})();
