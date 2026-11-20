// KA-BOOM! soundtrack, 174 BPM. A synthesized amen-style break (kick/snare/hats) is rendered into one bar and
// chopped into 16ths or 32nds; reese bass, square stabs, a sub drone, boom and crash. Scheduled bar by bar.
var SONG=(()=>{
const BPM=174,BEAT=60/BPM,BAR=4*BEAT,BARS=66,LEN=BARS*BAR+3;
const ROOT=[73.42,73.42,58.27,65.41,87.31,87.31,58.27,65.41];
const CH=[[146.83,174.61,220],[146.83,174.61,220],[233.08,293.66,349.23],[261.63,329.63,392],[174.61,220,261.63],[174.61,220,261.63],[233.08,293.66,349.23],[261.63,329.63,392]];
function setup(A,base){
const SR=A.sampleRate,PI=Math.PI;
let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
let sd=7;const rn=()=>(sd=sd*16807%2147483647)/1073741823.5-1;
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const comp=A.createDynamicsCompressor();comp.connect(A.destination);
const master=G(.6,comp);
const rev=keep(A.createConvolver()),ir=A.createBuffer(2,SR*2|0,SR);
for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=rn()*(1-i/d.length)**3}
rev.buffer=ir;rev.connect(master);
const bus=G(1,master,rev);
const mkb=n=>A.createBuffer(1,n,SR),NB=BAR*SR|0;
const BK=mkb(NB),SN=mkb(NB),BM=mkb(3*SR|0),CR=mkb(2*SR|0);
const put=(b,t0,dur,f)=>{const d=b.getChannelData(0),s=t0*SR|0;for(let i=0,n=dur*SR|0;i<n&&s+i<d.length;i++)d[s+i]+=f(i/SR)};
const S16=BAR/16;
for(let s=0;s<16;s++)put(BK,s*S16,.04,t=>rn()*Math.exp(-90*t)*(s&1?.12:.3));
[0,10].forEach(s=>put(BK,s*S16,.5,t=>Math.sin(2*PI*(40*t+5*(1-Math.exp(-40*t))))*Math.exp(-11*t)));
[[4,1],[12,1],[7,.35],[11,.35],[15,.3]].forEach(([s,v])=>put(SN,s*S16,.25,t=>v*(.8*rn()*Math.exp(-22*t)+.6*Math.sin(2*PI*190*t)*Math.exp(-30*t))));
put(BM,0,3,t=>Math.sin(2*PI*(25*t+15*(1-Math.exp(-2*t))))*Math.exp(-1.1*t)*.9);
put(CR,0,2,t=>rn()*Math.exp(-2.2*t)*.35);
const slice=(buf,t,i,div,v)=>{const s=keep(A.createBufferSource());s.buffer=buf;s.connect(G(v,bus));s.start(t,i*BAR/div,BAR/div)};
const chop=(b,t,div,v,sn)=>{const h=div/2;for(let s=0;s<div;s++){const i=b%4==3&&s>=h?h+(s*5+b)%h:s,u=t+s*BAR/div;slice(BK,u,i,div,v);if(sn)slice(SN,u,i,div,v)}};
const play=(buf,t,v)=>{const s=keep(A.createBufferSource());s.buffer=buf;s.connect(G(v,bus));s.start(t)};
const tone=(t,f,dur,v)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+Math.min(.5,dur/3));g.gain.linearRampToValueAtTime(0,t+dur);o.connect(g);g.connect(bus);o.start(t);o.stop(t+dur)};
const reese=(t,f,dur,cut,v)=>{const lp=keep(A.createBiquadFilter()),g=keep(A.createGain());lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(cut,t);lp.frequency.exponentialRampToValueAtTime(cut/4,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.setValueAtTime(v,t+dur-.03);g.gain.linearRampToValueAtTime(0,t+dur);lp.connect(g);g.connect(bus);[.993,1.007].forEach(d=>{const o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=f*d;o.connect(lp);o.start(t);o.stop(t+dur)})};
const stab=(t,ch,dur,v)=>ch.forEach(f=>{const o=keep(A.createOscillator()),lp=keep(A.createBiquadFilter()),g=keep(A.createGain());o.type='square';o.frequency.value=f;lp.frequency.setValueAtTime(2500,t);lp.frequency.exponentialRampToValueAtTime(300,t+dur);g.gain.setValueAtTime(v/ch.length,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(lp);lp.connect(g);g.connect(bus);o.start(t);o.stop(t+dur)});
function bar(b,t){
const B=BEAT,S=BAR/16,r=ROOT[b%8],ch=CH[b%8];
// 0-3 silence: metronome ticks and a sub drone that swells
if(b<4){for(let i=0;i<4;i++)tone(t+i*B,3000,.03,.04);tone(t,36.7,BAR,.02*b+.02)}
// impacts: crash at CRASH, RUN-less entries, BOOM, bulldozer, KA-BOOM, shatter
if(b===4||b===20||b===36||b===48||b===52)play(CR,t,.8);
if(b===16||b===36||b===48)play(BM,t,.9);
// break: full amen, double-time chop in FASTER and KA-BOOM, kick+hats only in PILE, silent in the slow-mo hang
if(b>=4&&b<52&&!(b>=18&&b<20)){if(b>=24&&b<32)chop(b,t,16,.9,0);else chop(b,t,(b>=10&&b<16)||b>=48?32:16,.9,1)}
// end card: half-time kick
if(b>=54&&b<66){slice(BK,t,0,16,.9);slice(BK,t+2*B,0,16,.8)}
// reese bass, filter opening through PILE, drive for the bulldozer
if(b>=6&&b<66&&!(b>=18&&b<20)){const cut=b<24?500:b<32?500*2**((b-24)/4):b<36?900:1400,v=b>=54?.12:.22;[0,6,8,14].forEach(s=>reese(t+s*S,r,S*3,cut,v))}
// stabs on the offbeats
if((b>=8&&b<16)||(b>=20&&b<36)||(b>=40&&b<52))[1,3].forEach(k=>stab(t+k*B,ch,B*.8,.2));
// slow-mo hang: a held minor pad under the silence
if(b===18||b===19)ch.forEach(f=>tone(t,f,BAR*1.02,.03));
// fade out into a Picardy-third D major chord
if(b===62){master.gain.setValueAtTime(.6,t);master.gain.linearRampToValueAtTime(0,t+BAR*4)}
if(b===64)[146.83,185,220].forEach(f=>tone(t,f,BAR*2,.05));
}
const sched=b=>{bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)};
sched.out=comp;return sched}
// live: schedule each bar ~1.2 s ahead so sound starts within a fraction of a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: the same code, with bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
return{live,render,BPM,BEAT,BAR,BARS,LEN}})();
