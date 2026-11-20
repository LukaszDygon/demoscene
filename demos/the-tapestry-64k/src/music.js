// THE TAPESTRY: soundtrack. One builder plays live (instant start) and renders offline (SONG.render, for checks).
// 100 BPM, 4/4, 42 bars = 100.8 s. Phrase p covers bars 4p-2 .. 4p+1, so each phrase lands on its panel's window.
var SONG=(()=>{
const BPM=100,BAR=2.4,BARS=42,LEN=BARS*BAR+4,E=BAR/8;
const SC=[0,2,3,5,7,9,10],hz=d=>440*Math.pow(2,(62+12*(d/7|0)+SC[d%7]-69)/12);
// lead phrases: one char per eighth note, '-' rest, digits/letters are D-Dorian degrees
const PH={A:"0-2-4-5-4-5-7-5-4-2-1-0--1-0-2-4",B:"2-0-0-2-4-4-2-0-0-0-2-0--2-4-5-7",C:"5-5-7-5-4-4-2-4-5-7-9-7-5-4-2-0",
D:"0-0-4-0-2-2-0-2--5-4-2-0-2-0-0-0",E:"0---4---0---2---0---5---2---0---",F:"2-------5-------4-------2-------",
G:"4-2-1-0-1-0-2-1--1-0-2-4-2-1-0--",H:"0-------3-------1-------0-------",I:"0-2-4-5-7-7-5-4-5-4-2-4-5-7-9-7"};
const MAP="ABCDDEFGHI",DL=[0,2,2,3,3,1,1,1,0,3,0],VOL=[.5,.45,.5,.55,.55,.35,.45,.4,.25,.6,.5],CUT=[1800,1400,900,1600,2000,1000,1200,1000,700,2400,1500];
function setup(A,base){
 const SR=A.sampleRate;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 // long-lived graph (not in the bags, so never pruned)
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const master=G(.6,comp);
 const IR=A.createBuffer(2,SR*2.5|0,SR);
 for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
 const rv=A.createConvolver();rv.buffer=IR;rv.connect(comp);const send=G(.35,rv);
 const lf=A.createBiquadFilter();lf.type='lowpass';lf.Q.value=4;lf.frequency.value=900;lf.connect(master);lf.connect(send);
 const dl=A.createBiquadFilter();dl.type='lowpass';dl.frequency.value=420;const dr=G(0,master);dl.connect(dr);
 [73.42,110,146.83].forEach((f,i)=>O('sawtooth',f*(1+.002*i),base,base+LEN).connect(dl)); // drone strings
 lf.frequency.setValueAtTime(900,base);dr.gain.setValueAtTime(0,base);
 for(let b=0;b<BARS;b++){const p=Math.min(10,Math.floor((b+2)/4)),t=base+b*BAR;lf.frequency.linearRampToValueAtTime(CUT[p],t);dr.gain.linearRampToValueAtTime(VOL[p],t)}
 dr.gain.linearRampToValueAtTime(0,base+BARS*BAR);
 const NB=A.createBuffer(1,SR*.5|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 // per-bar instruments
 function note(t,f,d,v){const g=G(0,lf);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.03);g.gain.linearRampToValueAtTime(v*.7,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);
  O('sawtooth',f,t,t+d).connect(g);O('square',f*1.007,t,t+d).connect(g)}   // bowed buzz: saw plus detuned square
 function drum(t){const o=O('sine',160,t,t+.3);o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(48,t+.14);
  const g=G(0,master);g.gain.setValueAtTime(.9,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g)}
 function tick(t){const s=keep(A.createBufferSource());s.buffer=NB;const h=keep(A.createBiquadFilter());h.type='highpass';h.frequency.value=7000;
  const g=G(0,master);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);s.connect(h);h.connect(g);s.start(t,.1);s.stop(t+.05)}
 function rush(t,d){const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;const f=keep(A.createBiquadFilter());f.type='bandpass';f.Q.value=1.5;
  f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(2200,t+d);
  const g=G(0,master);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.45,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d);s.connect(f);f.connect(g);s.start(t);s.stop(t+d)}
 function bar(b,t){
  const p=Math.floor((b+2)/4),k=(b+2)%4;
  if(p<10){
   const ph=PH[MAP[p]],lv=DL[p];
   for(let e=0;e<8;e++){
    const ch=ph[k*8+e],te=t+e*E;
    if(ch!=='-')note(te,hz(parseInt(ch,36)),E*1.6,.12);
    if(lv>=1&&e%4===0)drum(te);
    if(lv>=2&&e%2===1)tick(te);
    if(lv>=3&&e%4===2)drum(te);
   }
   if(b===19)rush(t+BAR*.5,BAR*1.5);     // dragon's roar, the breath peaks around bar 20.4
  }else if(k===0||k===2)note(t,hz(0),BAR*2-.1,.12);   // outro: D held over the last bars
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
// live: each bar is scheduled ~1.2 s before it plays, so sound starts within a second of the click
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
// offline: same code, bars injected with suspend() so the graph stays small
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
