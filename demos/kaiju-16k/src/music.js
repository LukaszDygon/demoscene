var SONG=(()=>{const BAR=2,BARS=30,LEN=65,PR=[45,41,48,43],ML='4..32.127..65.456..42.343...1.36',SC=[0,2,3,5,7,8,10,12],f=n=>440*2**((n-69)/12),Z=()=>Math.random()*2-1,W='sawtooth',
setup=(A,base)=>{const S=A.sampleRate,B=[],K=n=>(bag.push(n),n),c=(a,b)=>b.map(n=>a.connect(n)),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;c(g,o);return g},
O=(y,h,t,e)=>{const o=K(A.createOscillator());o.type=y;o.frequency.value=h;o.start(t);o.stop(e);return o},
F=(y,h,q,...o)=>{const b=K(A.createBiquadFilter());b.type=y;b.frequency.value=h;b.Q.value=q;c(b,o);return b},
P=(a,t,v,d,e,x)=>{a.setValueAtTime(v,t);a[x?'exponentialRampToValueAtTime':'linearRampToValueAtTime'](d,e)},
E=(g,t,v,a,d)=>{P(g=g.gain,t,0,v,t+a);g.setTargetAtTime(0,t+a,d/4)},
L=S*3|0,ir=A.createBuffer(2,L,S),N=A.createBuffer(1,S*2,S),nd=N.getChannelData(0);let bag=[];
const cp=A.createDynamicsCompressor(),M=G(.45,cp),rv=A.createConvolver(),dl=A.createDelay(1),R=G(.35,rv),fb=G(.35,dl);cp.connect(A.destination);
for(let k=0;k<2;k++){const d=ir.getChannelData(k);for(let i=0;i<L;i++)d[i]=Z()*(1-i/L)**4}
for(let i=0;i<S*2;i++)nd[i]=Z();
rv.buffer=ir;rv.connect(M);dl.delayTime.value=.375;c(dl,[fb,M]);
const ns=(t,d,...o)=>{const s=K(A.createBufferSource());s.buffer=N;s.loop=1;s.start(t);s.stop(t+d);c(s,o)},
kick=t=>{const o=O('sine',160,t,t+.4),g=G(0,M);P(o.frequency,t,160,42,t+.12,1);o.connect(g);E(g,t,1,.003,.35)},
snr=(t,v=.45)=>{const g=G(0,M,R);ns(t,.25,F('bandpass',1500,.5,g));E(g,t,v,.002,.18)},
hat=(t,v=.1)=>{const g=G(0,M);ns(t,.06,F('highpass',8e3,1,g));E(g,t,v,.001,.04)},
syn=(t,y,n,d,v,q,...o)=>{const g=G(0,...o);O(y,f(n),t,t+d).connect(F('lowpass',q,3,g));E(g,t,v,.005,d-.05)},
boom=(t,v)=>{const o=O('sine',70,t,t+2),g=G(0,M,R),h=G(0,M);P(o.frequency,t,70,28,t+1.5,1);o.connect(g);E(g,t,v,.005,1.8);ns(t,.6,F('lowpass',300,1,h));E(h,t,v*.8,.005,.5)},
roar=(t,d,v)=>{const g=G(0,M,R),b=F('bandpass',250,2.5,g),l=G(30);O('sine',23,t,t+d+.5).connect(l);
[70,71.5,104].map(h=>{const o=O(W,h,t,t+d+.5);l.connect(o.frequency);P(o.frequency,t,h,h*.6,t+d);o.connect(b)});
ns(t,d+.5,b);P(b.frequency,t,250,1400,t+.6,1);P(b.frequency,t+.6,1400,220,t+d,1);P(g.gain,t,0,v,t+.25);P(g.gain,t+d-.8,v,0,t+d+.4)};
function bar(b,t){const c=b%4,r=PR[c],ch=[0,c?4:3,7].map(x=>r+12+x),br=b==16||b==17,
dr=b>3&&b<11||b>11&&b<16||b>17&&b<24||b>25&&b<29,ld=dr&&b>11;
const g=G(0,M,R),p=F('lowpass',900,1,g),v=br||b>28?.16:.09;ch.map(n=>[-9,9].map(x=>{const o=O(W,f(n+12),t,t+2.6);o.detune.value=x;o.connect(p)}));P(g.gain,t,0,v,t+.5);P(g.gain,t+.5,v,0,t+2.5);
if([0,2,4,5,6,7,10,12,20,21,22,23,29].includes(b))boom(t,b==12||b==29?1.2:.8);
if(b==12||b==18||b==26){const g=G(0,M,R);ns(t,2.5,F('highpass',5e3,.5,g));E(g,t,.22,.002,2.3)}
if(b==16)roar(t,4,1.4);if(b==26)roar(t,3.5,1.3);if(b==6)roar(t+1,1.2,.5);
if(b==10){const g=G(0,M,R),q=F('bandpass',300,4,g);ns(t,4,q);P(q.frequency,t,300,7e3,t+4,1);P(g.gain,t,0,.3,t+4)}
for(let i=0;i<16;i++){const u=t+i/8,m=ML[c*8+i/2];
if(b>1&&b<29&&!br)syn(u,'square',ch[[0,1,2,1][i%4]]+24+(i&8?12:0),.2,b<4?.025:.05,2400,M,dl);
if(dr){i%4||kick(u);i%8==4&&b>7&&snr(u);i%4==2&&(b<8||b>11)&&hat(u);b>11&&i%2&&hat(u,.04)}
if(b>3&&b<29&&!br&&i%2==0)syn(u,W,r-12+(i%4?12:0),.25,.3,b>7&&b<12?200+(b-8+i/16)*600:1100,M);
b==11&&snr(u,.08+i*.025);
if(ld&&i%2==0&&m!='.'){syn(u,W,57+SC[+m],.6,.06,2800,M,dl,R);syn(u,'square',69+SC[+m],.6,.04,2800,M,dl,R)}}}
const sched=b=>{bag=[];if(B[b-3]){B[b-3].map(n=>n.disconnect());B[b-3]=0}B[b]=bag;bar(b,base+b*BAR)};sched.out=cp;return sched};
return{BAR,BARS,LEN,live(A,from=0){const base=A.currentTime+.15-from,s=setup(A,base);let b=Math.ceil(from/BAR-.001);
const k=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)s(b++)};k();const iv=setInterval(k,100);
return{base,stop(){clearInterval(iv);s.out.disconnect()}}},
render(){const A=new OfflineAudioContext(2,44100*LEN,44100),s=setup(A,0);s(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*44100/128|0)*128/44100).then(()=>{s(b);A.resume()});
return A.startRendering()}}})();
