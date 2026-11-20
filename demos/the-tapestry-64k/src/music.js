var SONG=(()=>{
const BPM=100,BAR=2.4,BARS=60,LEN=BARS*BAR+4,E=BAR/8;
const SC=[0,2,3,5,7,9,10],hz=d=>440*Math.pow(2,(62+12*(d/7|0)+SC[d%7]-69)/12);
const PH=["0-2-4-5-4-5-7-5-4-2-1-0--1-0-2-4","0---2---4---5---4---2---0-------","2-0-0-2-4-4-2-0-0-0-2-0--2-4-5-7","5-5-7-5-4-4-2-4-5-7-9-7-5-4-2-0","0-0-4-0-2-2-0-2--5-4-2-0-2-0-0-0","0--0--2-0--0--4-2--2--0-0-------","0-2-4-2-5-4-2-4-5-7-9-7-5-4-2-0","0-4-2-4-0-4-2-4-5-7-5-4-2-0-2-4-","0---4---0---2---0---5---2---0---","2-------5-------4-------2-------","4-2-1-0-1-0-2-1--1-0-2-4-2-1-0--","0-2-4-5-4-2-4-5-7-5-4-2-0-2-4-2","0-------3-------1-------0-------","0-2-4-5-7-7-5-4-5-4-2-4-5-7-9-7"];
const CH=["0530","0605","0606","5306","0603","0000","0530","0603","0000","3030","0500","0400","0000","0530"];
const DR=["D-D-D-D-","D---D---","D-T-D-T-","DTDTDTDT","D-DTD-DT","D-------","DTDTDTDT","DTDDTDDT","D-------","D---T---","D-------","D-T-DTD-","--------","DTDTDTDD"];
const RD=[0,0,0,0,0,0,1,0,0,0,0,1,0,1];
const CUT=[1800,1400,900,1600,2000,1000,1200,1000,700,2400,1500,1700,900,2600,1500];
const VOL=[.5,.45,.5,.55,.55,.35,.45,.4,.25,.6,.4,.5,.3,.6,.5];
const VOC=[.3,.5,.6,.4,.4,.2,.5,.5,.2,.6,.3,.5,.2,.8,.6];
function setup(A,base){
const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const O=(ty,f,t,end)=>{const o=keep(A.createOscillator());o.type=ty;o.frequency.value=f;o.start(t);o.stop(end);return o};
const comp=A.createDynamicsCompressor();comp.connect(A.destination);
const master=G(.6,comp);
const IR=A.createBuffer(2,SR*2.5|0,SR);
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
const rv=A.createConvolver();rv.buffer=IR;rv.connect(comp);const send=G(.35,rv);
const lf=A.createBiquadFilter();lf.type='lowpass';lf.Q.value=4;lf.frequency.value=900;lf.connect(master);lf.connect(send);
const dl=A.createBiquadFilter();dl.type='lowpass';dl.frequency.value=420;const dr=G(0,master);dl.connect(dr);
[73.42,110,146.83].forEach((f,i)=>O('sawtooth',f*(1+.002*i),base,base+LEN).connect(dl));
lf.frequency.setValueAtTime(900,base);dr.gain.setValueAtTime(0,base);
for(let b=0;b<BARS;b++){const p=Math.min(14,Math.floor((b+2)/4)),t=base+b*BAR;lf.frequency.linearRampToValueAtTime(CUT[p],t);dr.gain.linearRampToValueAtTime(VOL[p],t)}
dr.gain.linearRampToValueAtTime(0,base+BARS*BAR);
const vg=G(0,master),vf=[400,800,1600].map(f=>{const b=A.createBiquadFilter();b.type='bandpass';b.frequency.value=f;b.Q.value=6;b.connect(vg);return b});
[146.83,220].forEach(f=>{const o=O('sawtooth',f,base,base+LEN);vf.forEach(b=>o.connect(b))});
vg.gain.setValueAtTime(0,base);
for(let b=0;b<BARS;b++)vg.gain.linearRampToValueAtTime(VOC[Math.min(14,Math.floor((b+2)/4))]*.12,base+b*BAR);
vg.gain.linearRampToValueAtTime(0,base+BARS*BAR);
const NB=A.createBuffer(1,SR*.5|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
const env=(g,t,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.linearRampToValueAtTime(v*.7,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d)};
function note(t,f,d,v){const g=G(0,lf);env(g,t,d,v);O('sawtooth',f,t,t+d).connect(g);O('square',f*1.007,t,t+d).connect(g)}
function reed(t,f,d){const g=G(0,lf);env(g,t,d,.1);const o=O('sawtooth',f,t,t+d);O('sine',5.5,t,t+d).connect(G(f*.012,o.frequency));o.connect(g)}
function tri(t,f,d,v){const g=G(0,master);env(g,t,d,v);O('triangle',f,t,t+d).connect(g)}
function pad(t,deg,d){[0,2,4].forEach(j=>{const g=G(0,master);env(g,t,d,.035);O('sine',hz(deg+j),t,t+d).connect(g)})}
function drum(t,v){const o=O('sine',160,t,t+.3);o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(48,t+.14);const g=G(0,master);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g)}
function hiss(t,fr,d,v){const s=keep(A.createBufferSource());s.buffer=NB;const h=keep(A.createBiquadFilter());h.type='highpass';h.frequency.value=fr;const g=G(0,master);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(h);h.connect(g);s.start(t,.1);s.stop(t+d)}
function bell(t,f){[1,2.76].forEach((m,i)=>{const g=G(0,master);g.gain.setValueAtTime(.12/(i+1),t);g.gain.exponentialRampToValueAtTime(.001,t+2.5);O('sine',f*m,t,t+3).connect(g)})}
function rush(t,d){const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;const f=keep(A.createBiquadFilter());f.type='bandpass';f.Q.value=1.5;f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(2200,t+d);const g=G(0,master);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.45,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d);s.connect(f);f.connect(g);s.start(t);s.stop(t+d)}
function bar(b,t){
const p=Math.floor((b+2)/4),k=(b+2)%4;
if(p<14){
const ph=PH[p],dr=DR[p],cv=+CH[p][k];
pad(t,cv,BAR);
if(k%2===0)tri(t,hz(cv)/2,BAR*1.6,.1);
for(let e=0;e<8;e++){
const ch=ph[k*8+e],te=t+e*E,d=dr[e];
if(ch!=='-'){const n=parseInt(ch,36);RD[p]?reed(te,hz(n),E*1.6):note(te,hz(n),E*1.6,.12);tri(te,hz(n+2),E*1.4,.04)}
if(d==='D')drum(te,.9);
if(d==='T')hiss(te,7000,.05,.12);
}
if(b===31)rush(t+BAR*.5,BAR*1.5);
if(p===10)rush(t,BAR*.8);
if(p===13)pad(t,cv+7,BAR);
if(k===0&&(p===11||p===13))bell(t,hz(7));
}else{
if(b===54){pad(t,0,BAR*6);bell(t,hz(7))}
if(b===56)bell(t,hz(7));
if(b===58)bell(t,hz(14));
}
}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
