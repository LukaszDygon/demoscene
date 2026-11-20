// Muzak soundtrack: lounge Rhodes, vibes, pad strings, walking bass, brushes, plus a brass sting on every headline.
var SONG=(()=>{
const BAR=240/116,DUR='12112121112121121112'; // bars each headline stays up
const S=[0];for(const c of DUR)S.push(S[S.length-1]+ +c);
const BARS=S[S.length-1]+2,LEN=BARS*BAR+4; // +2 bars of outro
const CH=[[65,69,72,76],[64,67,70,74],[69,73,76,79],[62,65,69,72],[67,70,74,77],[60,64,67,70],[65,69,72,76],[67,71,74,77]],BASS=[41,40,45,38,43,36,41,43];
const F=m=>440*2**((m-69)/12),rr=(a,b)=>{const v=Math.sin(a*127.1+b*311.7)*43758.5453;return v-Math.floor(v)};
const SW='sawtooth',HP='highpass',BP='bandpass';
function setup(A,base){
 const SR=A.sampleRate;let bag=[],BAGS=[];
 const K=n=>(bag.push(n),n),GN=()=>A.createGain(),OS=()=>A.createOscillator(),FL=()=>A.createBiquadFilter();
 const M=GN(),cp=A.createDynamicsCompressor();M.gain.value=.7;M.connect(cp);cp.connect(A.destination);
 const IR=A.createBuffer(1,SR*2.5|0,SR),id=IR.getChannelData(0);for(let i=0;i<id.length;i++)id[i]=(Math.random()*2-1)*(1-i/id.length)**3
 const RV=A.createConvolver();RV.buffer=IR;RV.connect(M);
 const NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=Math.random()*2-1;
 const bus=v=>{const g=GN(),s=GN();g.gain.value=v;s.gain.value=.35;g.connect(M);g.connect(s);s.connect(RV);return g};
 const B={rh:bus(.5),vb:bus(.5),pd:bus(.3),bs:bus(.6),dr:bus(.6),br:bus(.25)};
 function tone(ty,m,t,d,v,dst,fc,a,det){
  const o=K(OS()),g=K(GN());
  o.type=ty;o.frequency.value=F(m);o.detune.value=det|0;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setTargetAtTime(0,t+a,d/4);
  if(fc){const f=K(FL());f.frequency.value=fc;o.connect(f);f.connect(g)}else o.connect(g);
  g.connect(dst);o.start(t);o.stop(t+d+.3)}
 function nz(t,d,v,fc,ty,dst){
  const s=K(A.createBufferSource()),f=K(FL()),g=K(GN());
  s.buffer=NB;f.type=ty;f.frequency.value=fc;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-3,t+d);
  s.connect(f);f.connect(g);g.connect(dst);s.start(t);s.stop(t+d+.05)}
 function kick(t,v){const o=K(OS()),g=K(GN());
  o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(1e-3,t+.4);
  o.connect(g);g.connect(B.dr);o.start(t);o.stop(t+.45)}
 function brass(t,C){const f=K(FL()),g=K(GN());
  f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(2800,t+.06);f.frequency.exponentialRampToValueAtTime(350,t+.7);
  g.gain.setValueAtTime(1e-4,t);g.gain.linearRampToValueAtTime(.16,t+.025);g.gain.exponentialRampToValueAtTime(1e-4,t+.8);
  f.connect(g);g.connect(B.br);
  C.slice(0,3).forEach(m=>{const o=K(OS());o.type=SW;o.frequency.value=F(m-12);o.connect(f);o.start(t);o.stop(t+.85)})}
 function bar(b,t){
  const k=b%8,C=CH[k],E=BAR/8,o=i=>t+i*E;
  [-8,8].forEach(d=>C.forEach(m=>tone(SW,m-12,t,BAR*2,.007,B.pd,900,.5,d)));
  [0,5].forEach(i=>C.forEach(m=>tone('sine',m,o(i),1.8,.03,B.rh,0,.005)));
  if(b>=8)for(let i=0;i<8;i++)if(rr(b*8+i,1)<.5)tone('sine',C[rr(b*8+i,2)*4|0]+12,o(i),1.1,.035,B.vb,0,.004);
  if(b>=2){
   for(let i=0;i<8;i++)nz(o(i),.04,.05,7000,HP,B.dr);
   [0,4].forEach(i=>kick(o(i),.8));
   [2,6].forEach(i=>nz(o(i),.2,.12,2500,BP,B.dr));
   [0,2,4,6].forEach((i,j)=>tone(SW,BASS[k]+[0,7,12,7][j],o(i),E*1.8,.12,B.bs,380,.005));
   if(b>=16&&k>=6)for(let j=0;j<16;j++)nz(t+j*E/2,.05,.05,2500,BP,B.dr);
  }
  if(S.includes(b)){brass(t,C);kick(t,1);nz(t,.9,.2,6000,HP,B.dr)}
  if(b>=BARS-2)C.forEach(m=>tone('sine',m,t,BAR*2,.03,B.rh,0,.01));
 }
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=cp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BAR,BARS,LEN,S}})();
