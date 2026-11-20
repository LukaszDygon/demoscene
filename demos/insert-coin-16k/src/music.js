var SONG=(()=>{
const BAR=2,BARS=40,LEN=BARS*BAR+5,B=.5,CH=[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],LD=[0,7,12,7,3,7,10,12];
const f=n=>440*2**((n-69)/12);
let A0,NB;
const nz=A=>{const b=A.createBuffer(1,A.sampleRate,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};
function setup(A,base){
let bag=[],BAGS=[];
const keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const comp=A.createDynamicsCompressor();comp.connect(A.destination);
const M=G(.4,comp),nb=nz(A);
const N=(ty,q,t,d,v,to=M,s)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.type=ty;o.frequency.setValueAtTime(q,t);if(s)o.frequency.exponentialRampToValueAtTime(s,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(to);o.start(t);o.stop(t+d)};
const X=(t,d,v,ty,q,s)=>{const b=keep(A.createBufferSource()),g=keep(A.createGain()),l=keep(A.createBiquadFilter());b.buffer=nb;l.type=ty;l.frequency.setValueAtTime(q,t);if(s)l.frequency.exponentialRampToValueAtTime(s,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);b.connect(l).connect(g).connect(M);b.start(t,Math.random());b.stop(t+d)};
function bar(b,t){
const c=CH[b&3],L=b<3?0:b<10?1:b<16?2:b<32?3:b<35?4:b<36?5:b<39?6:7,n=L>2?16:8,st=BAR/n,K=L>3?4:2,D=L>0&&L<7;
for(let i=0;i<n;i++){
N('square',f([c[0],c[1],c[2],c[0]+12][i&3]+(L>3&&i&8?12:0)),t+i*st,st*1.5,L?.04:.02);
if(L)N('triangle',f(c[0]-12-(L>3&&i&1?12:0)),t+i*st,st*1.2,.35);
}
if(D)for(let i=0;i<K;i++)N('sine',150,t+i*BAR/K,.15,.9,M,40);
if(D)for(let i=0;i<8;i++)X(t+i*.25,.05,.1,'highpass',7000);
if(D&&L>1)for(let i=0;i<2;i++)X(t+B+i*BAR/2,.15,.3,'bandpass',1800);
if(L==2)for(let i=0;i<8;i++)N('square',f(c[0]+12+LD[i]),t+i*.25,.25,.035);
if(b==33)X(t,4,.3,'bandpass',300,9000);
if(b==35){X(t,1.5,.5,'highpass',3000);N('sine',50,t,.6,.8,M,30)}
if(L==6)for(let i=0;i<4;i++)N('square',f(96-2*((b-36)*4+i)),t+i*B,.2,.15);
if(L==7){N('triangle',f(c[0]-12),t,4,.4);N('square',f(c[0]+12),t,4,.05)}
}
const sched=b=>{bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)};
sched.out=comp;bag=[];return sched}
function live(A,from=0){A0=A;NB=nz(A);const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
function sfx(k){const A=A0;if(!A)return;const t=A.currentTime,o=A.createOscillator(),g=A.createGain(),s=A.createBufferSource(),q=A.createGain();
o.type=k?'sine':'square';o.frequency.setValueAtTime(k?150:900,t);o.frequency.exponentialRampToValueAtTime(k?40:200,t+.12);
g.gain.setValueAtTime(k?.5:.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(g).connect(A.destination);o.start(t);o.stop(t+.16);
s.buffer=NB;q.gain.setValueAtTime(k?.4:.25,t);q.gain.exponentialRampToValueAtTime(.001,t+.08+k*.12);s.connect(q).connect(A.destination);s.start(t);s.stop(t+.3)}
return{live,render,sfx,BAR,BARS,LEN}})();
