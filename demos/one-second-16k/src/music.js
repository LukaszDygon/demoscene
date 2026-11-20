var SONG=(()=>{
const BPM=80,BAR=240/BPM,BEAT=60/BPM,BARS=24,LEN=BARS*BAR+4,CH=[130.81,196,311.13],TK=[];
for(let x=.4,i=0;x<69;i++){TK.push(x);x+=.45*1.07**i}
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[];
 const keep=n=>(bag.push(n),n);
 const G=(v,out)=>{const g=keep(A.createGain());g.gain.value=v;g.connect(out);return g};
 const comp=A.createDynamicsCompressor();comp.connect(A.destination);
 const M=A.createGain();M.gain.value=.5;M.connect(comp);
 const NB=A.createBuffer(1,SR*2|0,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const pad=A.createGain();pad.connect(M);
 pad.gain.setValueAtTime(0,base);pad.gain.linearRampToValueAtTime(.5,base+2*BAR);
 pad.gain.setValueAtTime(.5,base+23*BAR+2.2);pad.gain.linearRampToValueAtTime(0,base+23*BAR+2.25);
 const lp=A.createBiquadFilter();lp.frequency.value=1200;lp.connect(pad);
 const CHO=[];
 CH.forEach(f=>[0,1,2].forEach(o=>{const os=A.createOscillator(),gi=A.createGain();os.type='sawtooth';os.frequency.value=f*2**o;gi.gain.value=.08;os.connect(gi);gi.connect(lp);os.start(base);os.stop(base+LEN);CHO.push([os,gi,f,o])}));
 const gw=y=>.09*Math.exp(-((y-1.5)**2)/1.5);
 function chord(b,t){CHO.forEach(([os,gi,f,o])=>{const y0=o+b/BARS,y1=o+(b+1)/BARS;
  os.frequency.setValueAtTime(f*2**y0,t);os.frequency.exponentialRampToValueAtTime(f*2**y1,t+BAR);
  gi.gain.setValueAtTime(gw(y0),t);gi.gain.linearRampToValueAtTime(gw(y1),t+BAR)})}
 function thump(t,f0,f1,len,a){const o=keep(A.createOscillator()),g=keep(A.createGain());o.connect(g);g.connect(M);
  o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+len);
  g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.001,t+len);o.start(t);o.stop(t+len)}
 function riser(t,d){const o=keep(A.createOscillator()),f=keep(A.createBiquadFilter()),g=keep(A.createGain());o.type='sawtooth';
  o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(1000,t+d);
  f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(4000,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+d);
  o.connect(f);f.connect(g);g.connect(M);o.start(t);o.stop(t+d)}
 function hit(t){thump(t,110,25,2.4,1);const s=keep(A.createBufferSource()),h=keep(A.createBiquadFilter());s.buffer=NB;h.type='highpass';h.frequency.value=800;
  s.connect(h);h.connect(G(.8,M));s.start(t);s.stop(t+2)}
 function bar(b,t){
  chord(b,t);
  if(b<23){for(let k=0;k<4;k++){thump(t+k*BEAT,70,40,.25,.9);thump(t+k*BEAT+.28,60,35,.2,.6)}
   TK.forEach(x=>{if(x>=b*BAR&&x<(b+1)*BAR)thump(t+x-b*BAR,2400,2000,.03,.25)})}
  else for(let k=0;k<5;k++)thump(t+k*BEAT/2,70,40,.25,.9);
  if(b===21)riser(t,2*BAR+2.2);
  if(b===23)hit(t+2.2);
 }
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const pump=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};pump();const iv=setInterval(pump,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
