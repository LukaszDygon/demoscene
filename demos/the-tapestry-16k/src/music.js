var SONG=(()=>{const BPM=120,BAR=2,BARS=36,LEN=BARS*BAR+3,SC=[0,2,3,5,7,9,10,12],
LD=['DEFEDCBAGFEDCDEF','EFGEDCBAGFEDCAB-','DFAFGFEDCEAEFEDC','BCDEFEDCBGAGFEDA','GFEDGAFEDCBAGFED','EFGAFEDC','DEFGAGFEDCBAGFED','CDEFGFED','DFAGFEDCA---D---'].join(''),
MK=['1000100010001000','1010101010101010','1011001010110010','1111111111111111','1011101110111011','1000100010001000'],
mk=m=>m<3||m>35?'':MK[m<5?0:m<13?1:m<21?2:m<27?3:m<33?4:5],
dl=m=>m<5?.035:m<27?.06:m<36?.05:0;
function setup(A,base){const SR=A.sampleRate;let bag=[];const BAGS=[],K=n=>(bag.push(n),n),
G=(v,...o)=>{const g=K(A.createGain());g.gain.value=v;o.forEach(x=>g.connect(x));return g},
F=(y,f,q,...o)=>{const n=K(A.createBiquadFilter());n.type=y;n.frequency.value=f;n.Q.value=q;o.forEach(x=>n.connect(x));return n},
NB=A.createBuffer(1,SR*2,SR),IR=A.createBuffer(2,SR*2,SR);
const nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**3}
const cp=A.createDynamicsCompressor();cp.connect(A.destination);
const M=G(.45,cp),cv=A.createConvolver();cv.buffer=IR;cv.connect(M);
const RV=G(.3,cv),dg=G(0,M),dd=F('lowpass',520,1,dg);
[73.42,110,146.8,110.6].forEach(f=>{const o=K(A.createOscillator());o.type='sawtooth';o.frequency.value=f;o.connect(dd);o.start(base);o.stop(base+LEN)});
// hurdy-gurdy lead: two detuned saws (the bowed buzz) through a resonant lowpass
function lead(t,m,d){const f=440*2**((m-69)/12),g=G(0,M,RV),p=F('lowpass',f*4,2,g);
 [f,f*1.007].forEach(x=>{const o=K(A.createOscillator());o.type='sawtooth';o.frequency.value=x;o.connect(p);o.start(t);o.stop(t+d+.1)});
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.06);g.gain.setTargetAtTime(0,t+d*.75,.06)}
// frame drum: pitch-dropped sine body plus a short highpassed noise slap
function drum(t,v){const g=G(0,M,RV),o=K(A.createOscillator()),n=K(A.createBufferSource());
 o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(55,t+.14);o.connect(g);o.start(t);o.stop(t+.3);
 n.buffer=NB;n.connect(F('highpass',2500,.7,g));n.start(t,0,.03);
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-3,t+.22)}
// filtered noise sweep: tower crumbling, flame whoosh
function sweep(t,d,y,f0,f1,v){const g=G(0,M,RV),q=F(y,f0,3,g),n=K(A.createBufferSource());n.buffer=NB;n.loop=1;n.connect(q);n.start(t);n.stop(t+d);
 q.frequency.setValueAtTime(f0,t);q.frequency.exponentialRampToValueAtTime(f1,t+d);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.3);g.gain.linearRampToValueAtTime(0,t+d)}
function bar(i,t){const m=i+1;dg.gain.setTargetAtTime(dl(m),t,.4);
 for(let k=0;k<4;k++){const c=LD[(m-5)*4+k];if(c&&c!='-')lead(t+k*BAR/4,62+SC[c.charCodeAt(0)-65],BAR/4*1.1)}
 const p=mk(m);for(let s=0;s<16;s++)if(p[s]=='1')drum(t+s*BAR/16,.4);
 if(m==14)sweep(t,4,'lowpass',2500,120,.25);
 if(m==21||m==23)lead(t,38,BAR*2);
 if(m==23)sweep(t,3,'bandpass',300,2200,.3)}
function sched(i){bag=[];if(i>2&&BAGS[i-3]){BAGS[i-3].forEach(n=>n.disconnect());BAGS[i-3]=0}
 BAGS[i]=bag;bar(i,base+i*BAR)}
sched.out=cp;return sched}
// live: schedule each bar about 1.2 s ahead of the audio clock
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let i=Math.ceil(from/BAR-.001);
 const tick=()=>{while(i<BARS&&base+i*BAR<A.currentTime+1.2)sched(i++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: the same scheduler, bars injected with suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let i=1;i<BARS;i++)A.suspend(((i*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(i);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
