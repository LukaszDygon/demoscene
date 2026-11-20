// VAPOR MALL soundtrack: slowed city-pop / mall muzak in Db major, 80 BPM, 48 bars, tape wobble on the whole mix.
var SONG=(()=>{
const BPM=80,BAR=240/BPM,BARS=48,LEN=BARS*BAR+3,S=BAR/16;
const mf=n=>440*2**((n-69)/12);
// harmony: [bass root, Rhodes voicing...] in MIDI
const CH=[[37,53,56,60,63],[36,51,55,58,62],[34,49,53,56,60],[39,54,58,61,65],[32,54,60,63,65],
[42,53,58,61,65],[41,51,56,60,63],[39,49,54,58,61],[44,54,61,63,66]];
// A = Dbmaj9 Cm9 Bbm9 Ebm9|Ab13 ; B = Gbmaj9 Fm9 Ebm9 Ab7sus
const isB=b=>b>=16&&b<20||b>=24&&b<36;
const prog=b=>b>=46?[0]:isB(b)?[[5],[6],[7],[8]][b%4]:[[0],[1],[2],[3,4]][b%4];
// melodies in 8ths over 4 bars: a..l = scale steps, '-' tie, '.' rest
const SC=[56,58,60,61,63,65,68,70,72,73,75,77];
const M1='..fgi-h-g---e-f-e-d-c-d-f---.efg',M2='..fgi-h-g---h-i-j-i-h-g-h-------',
M3='j-j-i-h-i---g-f-h-h-g-f-e---..fg',M4='j-k-l-k-j---i-h-g-h-i-j-i-------';
const mel=b=>b>=12&&b<16?M1:b>=16&&b<20||b>=24&&b<32?M3:b>=32&&b<36?M4:b>=36&&b<40?M2:'';
function setup(A,base){
const SR=A.sampleRate,at=b=>base+b*BAR;
let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(1e-4,t+d)};
const nb=A.createBuffer(1,SR*2,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
const N=(t,d,...to)=>{const s=keep(A.createBufferSource());s.buffer=nb;s.loop=true;s.start(t,Math.random()*1.5,d);to.forEach(n=>s.connect(n));return s};
// master: mix -> tape wobble delay -> tone lowpass -> compressor -> out
const comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.25;comp.connect(A.destination);
const tone=F('lowpass',9000,.6,comp),wob=A.createDelay(4);wob.delayTime.value=.02;wob.connect(tone);
const mix=G(.5,wob);
// wow (slow) + flutter (fast) on the one delay line: the whole mix warbles like a worn tape
const lfo=(f,d)=>{const g=G(d,wob.delayTime);O('sine',f,base,base+LEN+2).connect(g);return g};
const wow=lfo(.31,.0032);lfo(5.3,.00032);
// reverb (generated IR) and a dotted-8th echo
const rv=A.createConvolver(),ir=A.createBuffer(2,SR*3.2|0,SR);
for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)**2.6}
rv.buffer=ir;rv.connect(mix);const rvIn=G(.3,rv);
const dl=A.createDelay(2);dl.delayTime.value=S*6;const fb=G(.4,dl);dl.connect(F('lowpass',2200,.5,fb,mix,G(.5,rvIn)));const dlIn=G(.5,dl);
const epB=G(.9,mix,G(.5,rvIn)),bsB=G(.9,mix),drB=G(.8,mix),snB=G(.5,mix,G(1.3,rvIn)),ldB=G(.8,mix,G(.6,rvIn),G(.7,dlIn)),
pdB=G(.7,mix,G(.8,rvIn)),chB=G(.8,mix,G(1,rvIn),G(.6,dlIn)),vbB=G(.7,mix,G(.5,dlIn)),vxB=G(.6,mix,G(1,rvIn));
// tape hiss
const hs=A.createBufferSource();hs.buffer=nb;hs.loop=true;hs.start(base);hs.stop(base+LEN);hs.connect(F('highpass',3500,.5,G(.016,tone)));
// arrangement automation, in bars
const tf=tone.frequency;tf.setValueAtTime(1300,at(0));tf.exponentialRampToValueAtTime(9000,at(4));tf.setValueAtTime(9000,at(20));
tf.exponentialRampToValueAtTime(1700,at(21));tf.setValueAtTime(1700,at(27));tf.exponentialRampToValueAtTime(11000,at(28));
tf.setValueAtTime(11000,at(41));tf.exponentialRampToValueAtTime(2600,at(43));
const wg=wow.gain;wg.setValueAtTime(.0032,at(20));wg.linearRampToValueAtTime(.009,at(22));wg.setValueAtTime(.009,at(27));
wg.linearRampToValueAtTime(.0032,at(28));wg.setValueAtTime(.0032,at(42));wg.linearRampToValueAtTime(.006,at(44));
const curve=f=>Float32Array.from({length:96},(_,i)=>f(i/95));
// pocket dive: the tape drags and catches up (pitch dips ~25% then overshoots)
wob.delayTime.setValueCurveAtTime(curve(u=>.02+.14*Math.sin(Math.PI*u)**2),at(40.85),1.8);
// the end: a tape stop (pitch falls linearly to zero)
wob.delayTime.setValueCurveAtTime(curve(u=>.02+u*u*1.4),at(46.9),2.8);
// section levels
[[0,.6],[4,.36],[12,.4],[20,.46],[28,.5],[36,.48],[42,.6]].forEach(([b,v])=>mix.gain.setValueAtTime(v,at(b)));
mix.gain.setValueAtTime(.6,at(47.4));mix.gain.linearRampToValueAtTime(0,at(48)+.3);
// ---- instruments ----
function ep(t,n,v,d){// FM electric piano + tine
const f=mf(n),g=G(0,epB),mg=G(0),c=O('sine',f,t,t+d),m=O('sine',f,t,t+d);
m.connect(mg);mg.connect(c.frequency);c.connect(g);
mg.gain.setValueAtTime(f*1.6*v,t);mg.gain.exponentialRampToValueAtTime(f*.08,t+d*.6);env(g,t,.006,.07*v,d);
const b=O('sine',f*7,t,t+.3),bg=G(0,epB);b.connect(bg);env(bg,t,.002,.012*v,.25)}
function bass(t,n,d,v=1){const f=mf(n),g=G(0,bsB),fl=F('lowpass',f*6,3,g);
O('sawtooth',f,t,t+d+.1).connect(fl);O('sine',f,t,t+d+.1).connect(g);
fl.frequency.setValueAtTime(f*7,t);fl.frequency.exponentialRampToValueAtTime(f*1.5,t+d);
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.22*v,t+.012);g.gain.setValueAtTime(.18*v,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d+.08)}
function kick(t,v=1){const o=O('sine',140,t,t+.6),g=G(0,drB);o.connect(g);o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(40,t+.2);env(g,t,.004,.8*v,.5)}
function snare(t,v=1){const g=G(0,snB);N(t,.4,F('bandpass',1800,.7,g));env(g,t,.002,.5*v,.3);
const o=O('triangle',185,t,t+.2),og=G(0,drB);o.connect(og);env(og,t,.002,.3*v,.15)}
function hat(t,v=1,op){const g=G(0,drB);N(t,op?.4:.08,F('highpass',8000,.6,g));env(g,t,.002,.12*v,op?.35:.05)}
function lead(t,n,d,v=1){// muzak "sax": detuned saw+square, lowpassed, delayed vibrato
const f=mf(n),g=G(0,ldB),fl=F('lowpass',2400,1.5,g),vg=G(0),vib=O('sine',5.2,t,t+d+.5);vib.connect(vg);
vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.012,t+.45);
for(const[ty,dt]of[['sawtooth',-7],['square',7]]){const o=O(ty,f,t,t+d+.5);o.detune.value=dt;o.connect(fl);vg.connect(o.frequency)}
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06*v,t+.07);g.gain.setValueAtTime(.05*v,t+d);g.gain.linearRampToValueAtTime(0,t+d+.4)}
function pad(t,n,d,v=1){const g=G(0,pdB),fl=F('lowpass',1000,.8,g);
for(const dt of[-11,11]){const o=O('sawtooth',mf(n),t,t+d+1);o.detune.value=dt;o.connect(fl)}
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022*v,t+d*.45);g.gain.linearRampToValueAtTime(0,t+d+.9)}
function vibe(t,n,v=1){// muzak vibraphone
const f=mf(n);[[1,.05],[4,.012],[10,.004]].forEach(([r,a])=>{const o=O('sine',f*r,t,t+1.6),g=G(0,vbB);o.connect(g);env(g,t,.003,a*v,1.5/Math.sqrt(r))})}
function vox(t,n,d,v=1){// "aah" chop: saw through two vowel formants
const g=G(0,vxB),o=O('sawtooth',mf(n),t,t+d+.2);[[730,8],[1090,9]].forEach(([f,q])=>o.connect(F('bandpass',f,q,g)));
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16*v,t+.04);g.gain.linearRampToValueAtTime(0,t+d)}
function chime(t,ns){// department-store PA chime
ns.forEach((n,i)=>{const s=t+i*.45;[[1,.08],[2.76,.02],[5.4,.008]].forEach(([r,a])=>{const o=O('sine',mf(n)*r,s,s+4),g=G(0,chB);o.connect(g);env(g,s,.003,a,4/r)})})}
function sweep(t,d,f0,f1,v){const g=G(0,mix,G(.5,rvIn)),fl=F('bandpass',f0,2,g);N(t,d,fl);
fl.frequency.setValueAtTime(f0,t);fl.frequency.exponentialRampToValueAtTime(f1,t+d);
g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.9);g.gain.linearRampToValueAtTime(0,t+d)}
// ---- one bar ----
function bar(b,t){
const ch=prog(b),C=s=>CH[ch[ch.length>1&&s>=8?1:0]],halves=ch.length>1?[0,8]:[0],hl=ch.length>1?.5:1,
sec=b<4?0:b<12?1:b<20?2:b<24?3:b<28?4:b<36?5:b<41?6:b<42?7:8,sw=s=>t+s*S+(s%2?S*.18:0);
// Rhodes: rolled whole chords in the quiet sections, syncopated comping elsewhere
if(sec==0||sec==3||sec==4||sec==8)halves.forEach(h=>C(h).slice(1).forEach((n,i)=>ep(t+h*S+i*.05,n,sec==0||sec==8?1.2:.8,BAR*hl*.95)));
else if(sec!=7)[[0,4,1],[6,3,.75],[10,2,.6],[14,2,.7]].forEach(([s,l,v])=>C(s).slice(1).forEach((n,i)=>ep(sw(s)+i*.012,n,v,l*S+.15)));
// bass
if(sec>=1&&sec<=6){if(sec==3)bass(t,C(0)[0],BAR*.9,.8);else if(sec==4)halves.concat(ch.length>1?[]:[8]).forEach(s=>bass(t+s*S,C(s)[0],6*S));
else[[0,0,3],[3,12,1],[6,0,2],[8,0,2],[10,7,2],[11,12,1],[14,7,2]].forEach(([s,iv,l])=>bass(sw(s),C(s)[0]+iv,l*S))}
// drums
if(sec==1||sec==2||sec==5||sec==6){[0,7,10].forEach(s=>kick(sw(s)));[4,12].forEach(s=>snare(sw(s)));
for(let s=0;s<16;s+=2)hat(sw(s),s%4?.6:1);if(sec>=5){hat(sw(14),.8,1);for(let s=1;s<16;s+=4)hat(sw(s),.35)}
if(b%8==7||b==40)for(let s=13;s<16;s++)snare(sw(s),.4+.15*(s-13))}
else if(sec==4){kick(t);snare(t+8*S,.8);for(let s=2;s<16;s+=4)hat(t+s*S,.5)}
else if(sec==3&&b>21)hat(t+8*S,.3);
// lead melody
const m=mel(b);if(m)for(let i=0;i<8;i++){const k=b%4*8+i,c=m[k];if(c>='a'){let j=k+1;while(m[j]=='-')j++;
lead(t+i*2*S,SC[c.charCodeAt(0)-97]-(sec==4?12:0),(j-k)*2*S,sec==4?.7:1)}}
// vibraphone counter-line in the shopping sections
if(sec==1&&b>=8||sec==2||sec==6)[2,5,9,13].forEach((s,i)=>vibe(sw(s),C(s)[1+(i+b)%4]+12,.8));
// vocal chops in the chorus
if(sec==5)[[0,3],[3,2],[8,3],[11,4]].forEach(([s,l])=>vox(sw(s),C(s)[4],l*S,s?.7:1));
// pads
if(sec==0||sec>=3&&sec!=7)halves.forEach(h=>C(h).slice(1).forEach(n=>pad(t+h*S,n,BAR*hl,sec==5||sec==6?.7:sec==0||sec==8?1.6:1)));
// events
if(b==0)chime(t+.1,[73,77,80,85]);
if(b==27)sweep(t+BAR*.25,BAR*.75,500,9000,.12);
if(b==28){chime(t,[85,80,77,73]);kick(t,1.3)}
if(b==38)sweep(t,BAR*3,300,7000,.12);
if(b==41){sweep(t,BAR*.8,6000,150,.2);const o=O('sine',90,t,t+2),g=G(0,mix);o.connect(g);o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(28,t+1.8);env(g,t,.01,.6,1.9)}
if(b==42)chime(t+.2,[73,77,80,85,89]);
}
function sched(b){bag=[];
if(b>3&&BAGS[b-4]){BAGS[b-4].forEach(n=>n.disconnect());BAGS[b-4]=0}
BAGS[b]=bag;bar(b,base+b*BAR)}
bag=[];sched.out=comp;return sched}
// live: schedule each bar ~1.2 s ahead
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected via suspend()
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
