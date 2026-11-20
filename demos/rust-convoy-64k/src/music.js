var SONG=(()=>{
const BPM=96,BEAT=60/BPM,BAR=4*BEAT,BARS=60,LEN=BARS*BAR+3,JC=125;
const ss=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
const K=(k,t)=>{let i=0;while(i<k.length-2&&t>k[i+1][0])i++;const a=k[i],b=k[i+1];return a[1]+(b[1]-a[1])*ss(a[0],b[0],t)};
const mf=m=>440*2**((m-69)/12);
const VK=[[0,0],[12,0],[16,8],[24,18],[35,26],[49,34],[64,36],[80,30],[92,30],[110,34],[124,36],[134,0],[999,0]];
const WARP=t=>1-.8*ss(JC-4,JC-2,t)*(1-ss(JC+2,JC+4,t));
const SPD=t=>K(VK,t)*WARP(t);
const ZT=new Float32Array(LEN*100+3);for(let i=1;i<ZT.length;i++)ZT[i]=ZT[i-1]+SPD((i-1)*.01)*.01;
const Z=t=>{const x=Math.max(0,t)*100,i=Math.min(x|0,ZT.length-2);return ZT[i]+(ZT[i+1]-ZT[i])*(x-(x|0))};
function setup(A,base){
const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
const SH=k=>{const w=A.createWaveShaper(),c=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;c[i]=Math.tanh(k*x)/Math.tanh(k)}w.curve=c;return w};
let sd=5;const rnd=()=>(sd=sd*16807%2147483647)/2147483647*2-1;
const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rnd();
const IR=A.createBuffer(2,SR*3|0,SR);for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=rnd()*(1-i/d.length)**3}
const comp=A.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=6;comp.attack.value=.002;comp.connect(A.destination);
const mlp=F('lowpass',20000,.5,comp);
const master=G(.23,mlp);
mlp.frequency.setValueAtTime(20000,base);mlp.frequency.setValueAtTime(20000,base+72);mlp.frequency.linearRampToValueAtTime(800,base+73);mlp.frequency.setValueAtTime(800,base+91);mlp.frequency.linearRampToValueAtTime(20000,base+93);
master.gain.setValueAtTime(0,base+JC-2);master.gain.setValueAtTime(.23,base+JC+2.5);master.gain.setValueAtTime(.23,base+146);master.gain.linearRampToValueAtTime(0,base+LEN);
const rev=A.createConvolver();rev.buffer=IR;rev.connect(G(.5,master));
const dsh=SH(4);dsh.connect(master);const dIn=G(.9,dsh);
const gsh=SH(12),gtr=F('lowpass',2400,.7,master,rev);gsh.connect(gtr);
const bp=F('lowpass',380,2,master,rev),pf=F('lowpass',800,.5,master,rev),af=F('lowpass',3200,.8,master,rev);
const dsh2=SH(2);dsh2.connect(master);const dlp=F('lowpass',200,3,dsh2),dg=G(0,dlp);
const os=[0,1,2].map(i=>{const o=A.createOscillator();o.type=i==2?'sine':'sawtooth';o.detune.value=i*9;o.connect(dg);o.start(base);o.stop(base+LEN);return o});
os.forEach(o=>o.frequency.setValueAtTime(34,base));dlp.frequency.setValueAtTime(200,base);
for(let s=0;s<=LEN;s+=.25){const f=34+.8*SPD(s);os.forEach(o=>o.frequency.linearRampToValueAtTime(f,base+s));dlp.frequency.linearRampToValueAtTime(160+10*SPD(s),base+s)}
dg.gain.setValueAtTime(0,base);dg.gain.linearRampToValueAtTime(.22,base+6);dg.gain.setValueAtTime(.22,base+JC-2);
dg.gain.linearRampToValueAtTime(.32,base+JC+5);dg.gain.setValueAtTime(.32,base+140);dg.gain.linearRampToValueAtTime(.12,base+146);dg.gain.linearRampToValueAtTime(0,base+LEN-2);
const wn=A.createBufferSource(),wf=F('lowpass',520,.6,master),wg=G(0,wf);wn.buffer=NB;wn.loop=true;wn.connect(wg);wn.start(base);wn.stop(base+LEN);
[[0,0],[15,.12],[72,.06],[80,.2],[92,.12],[120,.06],[135,.14],[LEN-1,0]].forEach(([s,v],i)=>i?wg.gain.linearRampToValueAtTime(v,base+s):wg.gain.setValueAtTime(v,base+s));
wf.frequency.setValueAtTime(520,base);for(let s=0;s<=LEN;s+=.5)wf.frequency.linearRampToValueAtTime(400+30*SPD(s),base+s);
bag=[];
function drum(t,f0,f1,dec,v){const o=keep(A.createOscillator()),e=G(0,dIn);o.connect(e);o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dec*.4);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+dec);o.start(t);o.stop(t+dec+.05)}
function hit(t,dur,f,q,v,type,to){const s=keep(A.createBufferSource()),e=G(0,to||master),x=F(type||'bandpass',f,q,e);s.buffer=NB;s.connect(x);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+dur);s.start(t,Math.abs(rnd())*1.5);s.stop(t+dur+.05)}
function lead(t,m,d,v){const e=G(0,gsh);[0,1].forEach(i=>{const o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m)*(1+i*.004);o.connect(e);o.start(t);o.stop(t+d+.05)});e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.02);e.gain.setValueAtTime(v,t+d*.75);e.gain.linearRampToValueAtTime(0,t+d)}
function pluck(t,m,d,v){const e=G(0,bp),o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m);o.connect(e);o.start(t);o.stop(t+d+.05);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+d)}
function arp(t,m,v){const e=G(0,af),o=keep(A.createOscillator());o.type='square';o.frequency.value=mf(m);o.connect(e);o.start(t);o.stop(t+.12);e.gain.setValueAtTime(v,t);e.gain.exponentialRampToValueAtTime(.001,t+.11)}
function pad(t,ms,d,v){ms.forEach(m=>[-8,8].forEach(c=>{const e=G(0,pf),o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=mf(m);o.detune.value=c;o.connect(e);o.start(t);o.stop(t+d+.05);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+1.5);e.gain.linearRampToValueAtTime(0,t+d)}))}
function bell(t,m,v){[1,2.76,5.4].forEach((r,i)=>{const e=G(0,master,rev),o=keep(A.createOscillator());o.frequency.value=mf(m)*r;o.connect(e);o.start(t);o.stop(t+5);e.gain.setValueAtTime(v/(i+1),t);e.gain.exponentialRampToValueAtTime(.001,t+4/(i+1))})}
function boom(t,k){const e=G(0,master,rev),o=keep(A.createOscillator());o.connect(e);o.frequency.setValueAtTime(90*k,t);o.frequency.exponentialRampToValueAtTime(22,t+2.5);o.start(t);o.stop(t+3.6);e.gain.setValueAtTime(1.2*k,t);e.gain.exponentialRampToValueAtTime(.001,t+3.4);hit(t,2.8,500,.6,.7,'lowpass')}
function riser(t,d){const s=keep(A.createBufferSource()),e=G(0,master,rev),x=F('bandpass',300,3,e);s.buffer=NB;s.loop=true;s.connect(x);s.start(t);s.stop(t+d+.05);x.frequency.setValueAtTime(300,t);x.frequency.exponentialRampToValueAtTime(5000,t+d);e.gain.setValueAtTime(.001,t);e.gain.exponentialRampToValueAtTime(.4,t+d)}
const RF=[62,62,65,67,69,67,65,62,60,60,62,65,67,65,64,62];
function chase(b,t){const B=x=>t+x*BEAT,K1=x=>drum(B(x),120,40,.45,.9),T1=x=>drum(B(x),200,95,.22,.5),S1=x=>hit(B(x),.04,6500,.8,.12),SP=x=>hit(B(x),.25,3200,5,.25);
if(b>=2&&b<4){K1(0);K1(2);T1(3.5)}
if(b>=4&&b<8){K1(0);T1(1);K1(2);T1(3);for(let x=0;x<4;x+=.5)S1(x)}
if(b>=8&&b<14){const P=[38,38,41,38,36,38,41,38];for(let x=0;x<4;x++){K1(x);T1(x+.5)}for(let k=0;k<8;k++){pluck(B(k*.5),P[k],.4,.3);arp(B(k*.5),[62,65,69,74][k%4]+(b>=12?12:0),.05)}}
if(b==10)boom(t+2,.5);
if(b>=14&&b<20){K1(0);K1(2);T1(1.5);T1(3);for(let k=0;k<8;k++){const m=RF[(b%2)*8+k];lead(B(k*.5),m,.3,.2);lead(B(k*.5),m+12,.3,.07)}if(b%2){SP(1.5);SP(3.25)}}
if(b==17){for(let x=0;x<4;x+=.25)T1(x)}
if(b==20){riser(t,BAR*3);lead(t,62,BAR*2.8,.22)}
if(b>=20&&b<23){K1(0);K1(2);for(let x=0;x<4;x+=.25)T1(x)}
if(b>=23&&b<25){for(let x=0;x<4;x+=.5)K1(x);T1(1);T1(3)}
}
function canyon(b,t){const B=x=>t+x*BEAT,K1=x=>drum(B(x),120,40,.45,.9),T1=x=>drum(B(x),200,95,.22,.5);
if(b>=25&&b<27)return;
if(b==27){boom(t,1);hit(t,3,7000,.6,.3,'highpass');lead(t,74,BAR*1.8,.25)}
if(b>=27&&b<31){for(let x=0;x<4;x++)K1(x);T1(.5);T1(2.5)}
if(b>=31&&b<36){K1(0);if(b%2)T1(2)}
}
function depot(b,t){const B=x=>t+x*BEAT;
if(b==0)pad(t,[38,45,50],BAR*6,.08);
if(b==2||b==4)hit(B(2),.4,1800,4,.12);
if(b==3)riser(t,BAR*2);
if(b>=4){drum(B(0),120,40,.45,.5);drum(B(2),120,40,.45,.5)}
}
function storm(b,t){const B=x=>t+x*BEAT,K1=x=>drum(B(x),120,40,.45,.9);
K1(0);K1(2);for(let x=0;x<4;x+=.5)hit(B(x),.05,7000,.7,.05);
hit(t,BAR,140,.7,.5,'lowpass');
if(b==31)hit(t+BEAT,2.5,90,.5,.9,'lowpass');
if(b%2)for(let k=0;k<4;k++)pluck(B(k),[38,36,41,38][k],.4,.15);
}
function city(b,t){const B=x=>t+x*BEAT,K1=x=>drum(B(x),120,40,.45,.9);
K1(0);K1(2.5);hit(B(1),.18,2600,.9,.35);hit(B(3),.18,2600,.9,.35);
for(let x=0;x<4;x+=.5)hit(B(x),.03,9000,.7,.06);
const P=[38,38,36,41,38,38,43,41];for(let k=0;k<8;k++)pluck(B(k*.5),P[k],.25,.25);
if(b==39){hit(t+2,2,600,.6,.5,'lowpass');boom(t+2,.4)}
}
function lament(b,t){const B=x=>t+x*BEAT;
if(b==55){pad(t,[50,53,57,60,64],BAR*5,.1);bell(t,74,.16);drum(B(0),90,40,.6,.4)}
if(b==57)bell(t,77,.12);
if(b==58)bell(t,71,.1);
for(let x=0;x<4;x++)if(b>=55&&b<59)hit(B(x+.25),.03,5000,6,.05);
}
function bar(b,t){
if(b<6)depot(b,t);
else if(b<29)chase(b-6,t);
else if(b<37)storm(b,t);
else if(b<47)city(b,t);
else if(b<55)canyon(b-24,t);
else lament(b,t);
}
function sched(b){bag=[];if(b>4&&BAGS[b-5]){BAGS[b-5].forEach(n=>n.disconnect());BAGS[b-5]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});return A.startRendering()}
return{live,render,Z,SPD,K,ss,BAR,LEN,BARS,JC}})();
