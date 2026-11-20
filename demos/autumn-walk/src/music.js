// "a little autumn walk" - lo-fi hip hop at 80 BPM, 41 bars (~2:03) + tail.
// Rhodes (FM) chords, sine sub bass, boom-bap drums, kalimba melody, vinyl crackle, tape wow.
// Same scheduler runs live (bar by bar, ~1.2 s lookahead) and offline (SONG.render()).
var SONG=(()=>{
const BPM=80,BEAT=60/BPM,BAR=4*BEAT,BARS=41,LEN=BARS*BAR+4;
const mf=m=>440*2**((m-69)/12);
// [bass, voicing...]
const CH={F:[41,57,60,64,67],Em:[40,55,59,62,66],Dm:[38,53,57,60,64],C:[36,52,55,59,62],
 Bb:[34,57,60,62,65],Am:[45,55,59,60,64],Gm:[43,53,57,58,62],Cs:[36,53,58,62,67],C7:[36,52,55,58,62],F7:[41,51,57,60,65]};
const LOOP=['F','Em','Dm','C'],BRK=['Bb','Am','Gm','Cs','Bb','Cs'],HBC=['F','C7','C7','F','F7','Bb','Cs','F'],OUT=['Bb','Cs','F'];
const chordAt=b=>b<24?LOOP[b%4]:b<30?BRK[b-24]:b<38?HBC[b-30]:OUT[b-38]||'F';
// Happy Birthday (public domain), beats from bar 30: [beat, midi, dur]
const HB=[[-1,72,.7],[-.25,72,.25],[0,74,1],[1,72,1],[2,77,1],[3,76,3],
 [7,72,.7],[7.75,72,.25],[8,74,1],[9,72,1],[10,79,1],[11,77,3],
 [15,72,.7],[15.75,72,.25],[16,84,1],[17,81,1],[18,77,1],[19,76,1],[20,74,3],
 [23,82,.7],[23.75,82,.25],[24,81,1],[25,77,1],[26,79,1],[27,77,5]];
// two 2-bar kalimba phrases (F major pentatonic)
const NOOD=[[[0,81],[.5,79],[1,77],[2,74],[2.5,77],[3.5,79],[4,81],[5,84],[5.5,81],[6,79],[7,77]],
 [[0,77],[.5,79],[1.5,81],[2,84],[3,81],[3.5,79],[4.5,77],[5,74],[6,72],[6.5,74],[7,77]]];
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 const F=(type,f,q,...to)=>{const o=keep(A.createBiquadFilter());o.type=type;o.frequency.value=f;o.Q.value=q;to.forEach(n=>o.connect(n));return o};
 let seed=7;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
 const mk=(sec,ch,fn)=>{const b=A.createBuffer(ch,sec*SR|0,SR);for(let c=0;c<ch;c++){const d=b.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=fn(i/SR,c)}return b};
 const src=(b,t,end,off=0,...to)=>{const s=keep(A.createBufferSource());s.buffer=b;to.forEach(n=>s.connect(n));s.start(t,off);if(end)s.stop(end);return s};
 const at=(b,beat)=>base+b*BAR+beat*BEAT;
 // ---- master chain (long-lived)
 const comp=A.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3.5;comp.attack.value=.008;comp.release.value=.25;comp.connect(A.destination);
 const mst=A.createGain();mst.connect(comp);const mg=mst.gain;
 mg.setValueAtTime(0,base);mg.linearRampToValueAtTime(.62,base+1.2);mg.setValueAtTime(.62,base+BARS*BAR-4);mg.linearRampToValueAtTime(0,base+LEN-.3);
 const tone=F('lowpass',4600,.4,mst),hp=F('highpass',32,.7,tone);
 const duck=G(1,hp),drums=G(.9,hp);
 // tape wow: one modulated delay on the music bus
 const wob=A.createDelay(.1);wob.delayTime.value=.014;wob.connect(duck);
 const lfo=O('sine',.55,base,base+LEN);lfo.connect(G(.0024,wob.delayTime));
 const keyLP=F('lowpass',600,.5,wob),kf=keyLP.frequency;
 kf.setValueAtTime(900,base);kf.exponentialRampToValueAtTime(3600,at(4,0));kf.setValueAtTime(3600,at(24,0));
 kf.exponentialRampToValueAtTime(1200,at(25,0));kf.setValueAtTime(1200,at(28,0));kf.exponentialRampToValueAtTime(3800,at(30,0));
 kf.setValueAtTime(3800,at(38,0));kf.exponentialRampToValueAtTime(900,base+LEN);
 // reverb + kalimba echo
 const rev=A.createConvolver();rev.buffer=mk(2.6,2,t=>(rnd()*2-1)*Math.exp(-t*2.3)*(1-Math.exp(-t*80)));rev.connect(G(.55,duck));
 const revIn=G(1,rev);
 const dl=A.createDelay(2);dl.delayTime.value=BEAT*.75;const dlf=F('lowpass',2200,.5);dl.connect(dlf);dlf.connect(G(.38,dl));dlf.connect(G(.5,wob));
 const bassF=F('lowpass',520,.6,duck);
 // vinyl crackle: hiss + decaying clicks + rare pops, looped for the whole piece
 const k=[0,0];
 const CR=mk(6,2,(t,c)=>{const r=rnd();k[c]=k[c]*.55+(r<.0011?(rnd()-.5)*1.6*rnd()**2:r>.99996?(rnd()-.5)*2.4:0);return k[c]+(rnd()-.5)*.02});
 const cs=src(CR,base,base+LEN,0,F('highpass',500,.5,F('lowpass',9000,.3,G(.32,hp))));cs.loop=true;
 const NZ=mk(1,1,()=>rnd()*2-1);
 // ---- instruments
 function ep(t,m,dur,v){const f=mf(m),e=t+dur,a=G(0,keyLP,revIn),c=O('sine',f,t,e+1.2);c.connect(a);
  const md=G(0,c.frequency);O('sine',f,t,e+1.2).connect(md);
  md.gain.setValueAtTime(f*1.8*v,t);md.gain.setTargetAtTime(f*.2,t,.3);
  a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.075*v,t+.008);a.gain.setTargetAtTime(.028*v,t+.008,.7);a.gain.setTargetAtTime(0,e,.2)}
 function chord(t,nm,v,dur){const n=CH[nm];for(let i=1;i<5;i++)ep(t+i*.017,n[i],dur,v*(i>3?.8:1))}
 function bass(t,m,dur,v){const f=mf(m),e=t+dur,a=G(0,bassF);O('sine',f,t,e+.4).connect(a);O('triangle',f*2,t,e+.4).connect(G(.12,a));
  a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.42*v,t+.025);a.gain.setTargetAtTime(.3*v,t+.03,.4);a.gain.setTargetAtTime(0,e,.08)}
 function kick(t,v){const o=O('sine',140,t,t+.6),a=G(0,drums);o.connect(a);o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(44,t+.11);
  a.gain.setValueAtTime(.95*v,t);a.gain.setTargetAtTime(0,t+.04,.11);
  duck.gain.setValueAtTime(1,t);duck.gain.linearRampToValueAtTime(.55,t+.01);duck.gain.linearRampToValueAtTime(1,t+.32)}
 function snare(t,v){const f=F('bandpass',1600,.7),a=G(0,drums,revIn);src(NZ,t,t+.5,rnd()*.4,f);f.connect(a);
  a.gain.setValueAtTime(.5*v,t);a.gain.setTargetAtTime(0,t+.005,.075);
  const b=G(0,drums);O('triangle',180,t,t+.25).connect(b);b.gain.setValueAtTime(.32*v,t);b.gain.setTargetAtTime(0,t,.045)}
 function hat(t,v,open){const f=F('highpass',7200,.5),a=G(0,drums);src(NZ,t,t+.6,rnd()*.4,f);f.connect(a);
  a.gain.setValueAtTime(.13*v,t);a.gain.setTargetAtTime(0,t+.002,open?.13:.022)}
 function kal(t,m,v,dur=1.4){const f=mf(m),a=G(0,wob,revIn);a.connect(dl);O('sine',f,t,t+dur+1.5).connect(a);
  a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.13*v,t+.004);a.gain.setTargetAtTime(0,t+.004,.42*dur);
  const b=G(0,a);O('sine',f*5.4,t,t+.6).connect(b);b.gain.setValueAtTime(.35,t);b.gain.setTargetAtTime(0,t,.04);
  const c=G(0,a);O('sine',f*2,t,t+1).connect(c);c.gain.setValueAtTime(.18,t);c.gain.setTargetAtTime(0,t,.15)}
 function pad(t,nm,dur,v){const n=CH[nm];for(let i=1;i<5;i++)for(const d of[-7,7]){const o=O('sawtooth',mf(n[i]),t,t+dur+2);o.detune.value=d;
  const a=G(0,revIn,duck);o.connect(F('lowpass',850,.3,a));a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.011*v,t+dur*.5);a.gain.setTargetAtTime(0,t+dur,.5)}}
 function riser(t,dur){const f=F('bandpass',300,2.5),a=G(0,duck,revIn);src(NZ,t,t+dur,0,f).loop=true;f.connect(a);
  f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(3500,t+dur);a.gain.setValueAtTime(0,t);a.gain.linearRampToValueAtTime(.22,t+dur-.05);a.gain.linearRampToValueAtTime(0,t+dur)}
 function blip(t){const o=O('sine',520,t,t+.35),a=G(0,wob);o.connect(a);o.frequency.exponentialRampToValueAtTime(1300,t+.22);a.gain.setValueAtTime(.07,t);a.gain.setTargetAtTime(0,t+.15,.05)}
 // ---- arrangement
 function bar(b,t){
  const B=BEAT,nm=chordAt(b),n=CH[nm],sec=b<4?0:b<8?1:b<16?2:b<24?3:b<28?4:b<30?5:b<38?6:7,sw=.055;
  // keys
  if(sec==5||b==40)chord(t,nm,.9,B*(b==40?7:3.6));
  else{chord(t,nm,1,B*2.2);if(sec!=7)chord(t+B*2.5+sw,nm,.55,B*1.3)}
  if(sec==4||sec==5)pad(t,nm,BAR,1);
  if(b==28)riser(t,BAR*2);
  // bass
  if(sec>0&&b<40){if(sec==4||sec==5||sec==7)bass(t,n[0],B*3.6,.9);
   else{bass(t,n[0],B*1.4,1);bass(t+B*2.5+sw,n[0],B*.8,.8);bass(t+B*3.5+sw,n[0]+(b%2?7:12),B*.4,.6)}}
  // drums
  const full=sec==2||sec==3||sec==6;
  if(full||sec==1||sec==4||b==38){
   const kp=sec==4?[0]:sec==1?[0,2.5]:b%4==3?[0,2.5,3.25]:[0,1.75,2.5];
   for(const k of kp)kick(t+k*B+(k%1?sw:0),sec==4?.6:sec==1?.75:1);
   if(full||b==7||b==38){snare(t+B+.02,1);snare(t+3*B+.02,1);if(full&&b%2)snare(t+3.75*B+sw,.25)}
   for(let i=0;i<8;i++){if(sec==4&&i%2)continue;hat(t+i*B/2+(i%2?sw*1.6:0),(i%2?.55:1)*(sec==1?.7:1)*(.8+rnd()*.3),full&&i==7&&b%4==3)}
  }
  // kalimba
  if(b==4)[[0,77],[.5,81],[1,84]].forEach(([q,m])=>kal(t+q*B+.5*B,m,.8));
  if(b==15)blip(t+2.6);
  if(sec==3){const ph=NOOD[(b-16>>1)%2],o=(b-16)%2*4;ph.forEach(([q,m])=>{if(q>=o&&q<o+4)kal(t+(q-o)*B+(q%1?sw:0),m,.8)})}
  if(b>=29&&b<38)HB.forEach(([q,m,d])=>{if(Math.floor(q/4)==b-30)kal(t+(q-(b-30)*4)*B+(q%1?sw*.5:0),m,1,d*B*.9)});
  if(b==38)[[0,81],[1,77],[2,74],[3,72]].forEach(([q,m])=>kal(t+q*B,m,.55));
  if(b==40)[65,69,72,76,77,81].forEach((m,i)=>kal(t+i*B*.5,m,.6,3));
 }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BEAT,BARS,LEN}})();
