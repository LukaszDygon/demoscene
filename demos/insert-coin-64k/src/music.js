var SONG=(()=>{
const BPM=120,BAR=2,BARS=46,LEN=BARS*BAR+4,ST=BAR/16;
// [root MIDI note, third in semitones] for Em, C, G, D. Arp and bass follow the chord.
const CH=[[40,3],[36,4],[43,4],[38,4]];
// lead: 8 eighth notes per bar, semitones above root+24, -1 = rest
const LD=[[7,10,12,15,12,10,7,-1],[7,12,16,12,7,4,0,-1],[11,14,18,14,11,7,2,-1],[9,14,17,14,9,5,2,-1]];
const hz=m=>440*Math.pow(2,(m-69)/12);
function setup(A,base){
const SR=A.sampleRate;let bag=[];const BAGS=[];
const keep=n=>(bag.push(n),n);
const comp=A.createDynamicsCompressor();comp.connect(A.destination);
const master=A.createGain();master.gain.value=.5;master.connect(comp);
// reverb: generated decaying-noise impulse response, fed by a send bus
const verb=A.createConvolver(),IR=A.createBuffer(2,SR*1.6|0,SR);
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
verb.buffer=IR;verb.connect(master);
const wet=A.createGain();wet.gain.value=.3;wet.connect(verb);
// one second of white noise for hats, snares and FX
const NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=Math.random()*2-1;
// pulse waves at 50%, 25% and 12.5% duty, as periodic waves
const PW=d=>{const re=new Float32Array(32),im=new Float32Array(32);for(let n=1;n<32;n++)re[n]=2*Math.sin(n*Math.PI*d)/(n*Math.PI);return A.createPeriodicWave(re,im)};
const W50=PW(.5),W25=PW(.25),W12=PW(.125);
// envelope: fast attack, exponential decay to silence over d seconds
const env=(t,d,v,to)=>{const g=A.createGain();g.gain.setValueAtTime(1e-4,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(1e-4,t+d);g.connect(to);return keep(g)};
const tone=(w,f,t,d,v,to)=>{const o=keep(A.createOscillator());(typeof w=='string')?(o.type=w):o.setPeriodicWave(w);o.frequency.value=f;o.connect(env(t,d,v,to));o.start(t);o.stop(t+d+.02)};
const sw=(type,f0,f1,t,d,v,to)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);o.connect(env(t,d,v,to));o.start(t);o.stop(t+d+.02)};
const nz=(t,d,f,type,v,to)=>{const s=keep(A.createBufferSource()),q=keep(A.createBiquadFilter());s.buffer=NB;s.loop=true;q.type=type;q.frequency.value=f;s.connect(q);q.connect(env(t,d,v,to));s.start(t,Math.random());s.stop(t+d+.02);return q};
function bar(b,t){
 const[r,th]=CH[b%4],bd=b>=16&&b<20;
 const dr=b>=4&&b<36&&!bd,kk=b>=2&&b<36&&!bd,ar=b>=2&&!bd&&(b<36||b>=40)&&b<46;
 const ld=(b>=6&&b<16)||(b>=20&&b<36)||(b>=40&&b<46),bs=(b>=1&&b<36)||(b>=40&&b<46),pad=(bd||b>=40)&&b<46;
 if(b==36){const q=nz(t,BAR*2,200,'lowpass',.35,wet);q.frequency.setValueAtTime(200,t);q.frequency.exponentialRampToValueAtTime(9000,t+BAR*2);nz(t,2,3000,'highpass',.25,wet);sw('sine',150,38,t,.3,.9,master)}
 for(let s=0;s<16;s++){const st=t+s*ST,ev=s%2==0;
  if(kk&&(s%4==0||(b>=24&&s==10)))sw('sine',150,38,st,.3,.9,master);
  if(dr&&(s==4||s==12)){nz(st,.2,1800,'bandpass',.5,master);tone('triangle',190,st,.1,.4,master)}
  if(dr&&ev)nz(st,.04,8000,'highpass',.2,master);
  if(dr&&(s==6||s==14))nz(st,.2,7000,'highpass',.1,wet);
  if(ar){const n=[0,th,7,12,7,th][s%6]+(b>=20&&b<36?12:0);tone(b<6?W12:W25,hz(r+24+n),st,ST*1.6,b<6?.04:.07,master)}
  if(bs&&ev)tone('triangle',hz(r+[0,0,12,0,0,0,12,0][s>>1]),st,ST*1.8,bd?.22:.5,master);
  if(ld&&ev){const n=LD[b%4][s>>1];if(n>=0)tone(W50,hz(r+24+n),st,ST*1.8,.12,master)}
  if(pad&&s==0)for(const n of[0,th,7])tone('triangle',hz(r+12+n),t,BAR*.95,.07,wet);
  if(b==45&&s==0)for(const n of[52,56,59])tone('triangle',hz(n),t,BAR*1.5,.09,wet);
  if(b>=38&&b<41&&s%4==0){const k=(b-38)*4+(s>>2);if(k<10)tone(W50,k==9?440:880,st,.12,.2,master)}
 }
}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
// sound effects for the game, on the same bus
const fx=k=>{const t=A.currentTime+.005;
 if(k=='hit'){nz(t,.07,2500,'bandpass',.45,master);sw('square',420,120,t,.07,.25,master)}
 else if(k=='boss'){sw('sine',140,30,t,.5,1,master);nz(t,.3,600,'lowpass',.5,master)}
 else if(k=='hurt'){sw('sawtooth',260,70,t,.18,.35,master);nz(t,.1,900,'lowpass',.3,master)}
 else if(k=='perfect'){[0,4,7,12].forEach((n,i)=>tone(W50,hz(76+n),t+i*.045,.12,.2,master))}
 else if(k=='poof'){nz(t,.25,6000,'highpass',.25,wet)}
 else if(k=='super'){nz(t,1.6,400,'lowpass',.5,wet);sw('sawtooth',60,40,t,1,.8,master)}
};
bag=[];return{sched,fx,out:master}
}
// live: bars are scheduled about 1.2 s ahead of the audio clock, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,S=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)S.sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,fx:S.fx,stop(){clearInterval(iv);S.out.disconnect()}}}
// offline: same code, bars injected via suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),S=setup(A,0);S.sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{S.sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
