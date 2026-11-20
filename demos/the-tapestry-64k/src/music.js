// THE TAPESTRY: music. Drone strings, a hurdy-gurdy lead with its buzzing "dog" (chien), frame drum,
// a shawm in parallel fourths, church bells and the foley of the siege (trebuchet, collapse, dragon, burning cloth).
// The same scheduler runs live (bar by bar) and offline (SONG.render) for the checks.
var SONG=(()=>{
const BPM=100,BAR=240/BPM,BARS=48,LEN=BARS*BAR+7;
const mf=m=>440*2**((m-69)/12);
// one char = one eighth note; letter = semitones above D3 (base 36), '-' = hold, '.' = rest
const MEL={
 A:"o-mlj-hjl-jhf-e-fhjlm-ljh-fec---",   // the chronicle (D dorian)
 B:"cefhj-j-ljhjf-c-cefhjlmomljhj---",   // the ride (dance)
 C:"o--kj--hg-d-c---c-dgh-jkj-hgd-c-",   // the dragon (phrygian dominant)
 D:"j-ojl-jgh-jhg-e-c-egj-lom-l-o---"};  // the victory (D major / mixolydian)
// sections: 0 intro, 1 sea, 2 ride, 3 siege, 4 fire, 5 dragon, 6 victory, 7 end
const sec=b=>b<2?0:b<10?1:b<16?2:b<24?3:b<30?4:b<38?5:b<46?6:7;
// frame drum, 16ths: D doum (low), t tek (rim), k soft tek, m mid tom
const DR=["................","D.......t.....k.","D..tD..tD..tD.tt","D.tkD.t.D.tkt.tk","D.tkD.tkD.tkDttt","D..D..m.D.m.mmmm","D.t.D.ttD.t.D.tt","D..............."];
// chien buzz strokes, 8ths
const BZ=["........","........","..x...x.","..x.x.x.","x.x.x.xx",".x.x.x.x","..x.x.x.","........"];
// shared with the picture: trebuchet launches, flaming boulders, tower collapse, dragon
const LA=[16,17.5,19,20.5,22],FB=[24,25.5,27,28.5],FL=.9;
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(ty,f,t,e)=>{const o=keep(A.createOscillator());if(typeof ty=='string')o.type=ty;else o.setPeriodicWave(ty);o.frequency.setValueAtTime(f,t);o.start(t);o.stop(e);return o};
 const F=(ty,f,q,gn)=>{const n=keep(A.createBiquadFilter());n.type=ty;n.frequency.value=f;n.Q.value=q;if(gn)n.gain.value=gn;return n};
 const ch=(...n)=>{for(let i=0;i<n.length-1;i++)n[i].connect(n[i+1]);return n[n.length-1]};
 const sh=k=>{const w=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++)c[i]=Math.tanh((i/511.5-1)*k);w.curve=c;return w};
 const NB=A.createBuffer(1,SR*2,SR);{const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
 const N=(t,d)=>{const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;s.start(t,Math.random()*1.5);s.stop(t+d);return s};
 const env=(p,t,a,v,d,r)=>{p.setValueAtTime(0,t);p.linearRampToValueAtTime(v,t+a);p.setValueAtTime(v,t+Math.max(a,d));p.linearRampToValueAtTime(0,t+d+r)};
 const dec=(p,t,v,d)=>{p.setValueAtTime(v,t);p.exponentialRampToValueAtTime(.001,t+d)};
 // --- master, hall reverb ---
 const comp=A.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;comp.attack.value=.003;comp.release.value=.2;comp.connect(A.destination);
 const master=G(.42,comp),conv=A.createConvolver();
 {const L=SR*3.2|0,b=A.createBuffer(2,L,SR);for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,4)*(i<SR*.01?i/(SR*.01):1)}conv.buffer=b}
 const rev=G(.32);rev.connect(conv);conv.connect(master);
 // --- hurdy-gurdy body: wooden resonances, soft saturation ---
 const gIn=G(1),gOut=G(.55,master,rev);
 ch(gIn,F('highpass',160,.7),F('peaking',700,1.3,7),F('peaking',2300,2,5),F('lowpass',4200,.6),sh(1.6),gOut);
 const bIn=G(1);ch(bIn,F('bandpass',1500,.9),gIn);
 // --- shawm: a nasal double reed (rich even+odd partials through a narrow horn) ---
 const re=new Float32Array(16),im=new Float32Array(16);for(let k=1;k<16;k++)im[k]=(k<3?1:1.3/k)*(k%2?1:.85);
 const SW=A.createPeriodicWave(re,im),sIn=G(1);ch(sIn,F('bandpass',1150,.75),F('peaking',2700,2,6),sh(1.3),G(.3,master,rev));
 // --- drum bus ---
 const dB=G(1,master);dB.connect(G(.45,rev));
 // --- drone strings (long-lived): D3 + A3 through the gurdy body, D2 bass ---
 const dr=G(0,gIn),bs=G(0,master);
 for(const [m,k] of[[50,1],[50,1.002],[57,.7],[62,.35]])O('sawtooth',mf(m),base,base+LEN).connect(G(k*.5,dr));
 ch(O('sawtooth',mf(38),base,base+LEN),F('lowpass',260,.8),bs);
 const wl=G(.06,dr.gain);O('sine',.37,base,base+LEN).connect(wl);   // wheel pressure
 // --- instruments ---
 function gurdy(t,m,d,v){const f=mf(m),e=G(0,gIn),vg=G(f*.006);O('sine',5.3,t,t+d+.2).connect(vg);
  for(const k of[1,1.0035]){const o=O('sawtooth',f*k,t,t+d+.2);vg.connect(o.frequency);o.connect(e)}env(e.gain,t,.025,v,d,.08)}
 function buzz(t,v){const e=G(0,bIn),am=G(.5,e);O('square',33+Math.random()*7,t,t+.22).connect(G(.5,am.gain));O('sawtooth',mf(62),t,t+.22).connect(am);
  e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(v,t+.008);e.gain.exponentialRampToValueAtTime(.001,t+.18)}
 function shawm(t,m,d,v){const f=mf(m),e=G(0,sIn),o=O(SW,f,t,t+d+.2),vg=G(f*.007);o.frequency.setValueAtTime(f*.97,t);o.frequency.linearRampToValueAtTime(f,t+.05);
  O('sine',6.1,t,t+d+.2).connect(vg);vg.connect(o.frequency);o.connect(e);env(e.gain,t,.04,v,d,.07)}
 function drum(t,k,v){
  if(k=='D'||k=='m'){const lo=k=='D',o=O('sine',lo?150:260,t,t+.7),e=G(0,dB);o.frequency.exponentialRampToValueAtTime(lo?52:130,t+(lo?.17:.12));o.connect(e);dec(e.gain,t,v,lo?.6:.3);
   const ng=G(0,dB);ch(N(t,.12),F('lowpass',lo?650:1400,.7),ng);dec(ng.gain,t,v*.7,.1)}
  else{const e=G(0,dB);ch(N(t,.1),F('bandpass',k=='t'?2700:1900,1.4),e);dec(e.gain,t,v*(k=='t'?.9:.5),.07);
   const o=O('triangle',430,t,t+.1),og=G(0,dB);o.connect(og);dec(og.gain,t,v*.25,.06)}}
 // psaltery: plucked strings, bright attack closing to a soft ring
 function pluck(t,m,v){const f=mf(m),e=G(0,master,rev),lp=F('lowpass',f*6,1);lp.frequency.setValueAtTime(f*8,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+.5);ch(lp,e);
  for(const [ty,k] of[['triangle',1],['sawtooth',1.002]])O(ty,f*k,t,t+1.3).connect(G(ty=='triangle'?1:.35,lp));dec(e.gain,t,v,1.2)}
 // tambourine: jingles = high noise chopped by a fast square
 function tamb(t,v){const e=G(0,master,rev),am=G(.5,e);O('square',95,t,t+.2).connect(G(.5,am.gain));ch(N(t,.2),F('highpass',6500,.8),am);dec(e.gain,t,v,.16)}
 function bell(t,m,v){for(const [r,a,d] of[[1,1,3.2],[2.76,.45,1.7],[5.4,.25,.9],[8.93,.12,.45],[.5,.4,2.4]]){const o=O('sine',mf(m)*r,t,t+d+.1),e=G(0,master,rev);o.connect(e);dec(e.gain,t,v*a,d)}}
 // --- foley ---
 function whoosh(t,v){const bp=F('bandpass',250,2),e=G(0,master,rev);ch(N(t,1.2),bp,e);bp.frequency.setValueAtTime(250,t);bp.frequency.exponentialRampToValueAtTime(1700,t+.35);bp.frequency.exponentialRampToValueAtTime(380,t+1.1);env(e.gain,t,.22,v,.45,.6)}
 function boom(t,v){const o=O('sine',95,t,t+1.1),e=G(0,master,rev);o.frequency.exponentialRampToValueAtTime(30,t+.55);o.connect(e);dec(e.gain,t,v,1);
  const g=G(0,master,rev);ch(N(t,.9),F('lowpass',1100,.5),g);dec(g.gain,t,v*.9,.75)}
 function crackle(t,d,v){for(let i=0;i<d*12;i++){const s=t+Math.random()*d,g=G(v*(.3+Math.random()),master);ch(N(s,.012+Math.random()*.02),F('highpass',1800+Math.random()*3500,1),g)}}
 function roar(t,d,v){const e=G(0,master,rev),am=G(.6),lp=F('lowpass',300,5);ch(am,lp,sh(3),e);
  for(const [f,k] of[[52,1],[78,.6],[104,.3]]){const o=O('sawtooth',f,t,t+d+.2);o.frequency.setValueAtTime(f*.8,t);o.frequency.linearRampToValueAtTime(f*1.35,t+d*.3);o.frequency.linearRampToValueAtTime(f*.7,t+d);o.connect(G(k,am))}
  N(t,d+.2).connect(G(.6,am));O('sine',21,t,t+d+.2).connect(G(.45,am.gain));
  lp.frequency.setValueAtTime(260,t);lp.frequency.linearRampToValueAtTime(1500,t+d*.3);lp.frequency.linearRampToValueAtTime(320,t+d);env(e.gain,t,.12,v,d*.7,d*.3)}
 function blaze(t,d,v){const e=G(0,master,rev),bp=F('bandpass',420,.6);ch(N(t,d+.3),F('lowpass',1600,.5),bp,e);bp.frequency.setValueAtTime(300,t);bp.frequency.linearRampToValueAtTime(900,t+d*.5);env(e.gain,t,.3,v,d,.4);crackle(t,d,v*.6)}
 function tear(t,d,v){const bp=F('bandpass',450,1.6),e=G(0,master,rev);ch(N(t,d+.2),bp,e);bp.frequency.setValueAtTime(400,t);bp.frequency.exponentialRampToValueAtTime(4200,t+d);env(e.gain,t,d*.5,v,d*.85,.15);crackle(t,d,v*1.4)}
 // --- arrangement ---
 const ev=(L,b,f)=>L.forEach(x=>{if(Math.floor(x)==b)f(base+x*BAR)});
 function bar(b,t){const s=sec(b),E=BAR/8,S=BAR/16;
  const dl=[.3,.3,.42,.5,.56,.45,.55,.4][s];dr.gain.setTargetAtTime(b<1?.18:dl,t,b<1?1:.4);bs.gain.setTargetAtTime([.25,.3,.35,.4,.45,.5,.4,.3][s],t,.6);
  if(b==47){dr.gain.setTargetAtTime(0,t+BAR*.6,.9);bs.gain.setTargetAtTime(0,t+BAR*.4,.9)}
  // lead
  let M=0,i=0;const v=.13;
  if(s==1)M=MEL.A,i=(b-2)%4;else if(s==2)M=MEL.B,i=(b-10)%4;else if(s==3)M=MEL.B,i=(b-16)%4;else if(s==4)M=MEL.A,i=(b-24)%4;
  else if(s==5&&b>=32)M=MEL.C,i=(b-32)%4;else if(s==6)M=MEL.D,i=(b-38)%4;
  const sw=s==3||s==4||s==6||s==5&&b>=34;
  if(M)for(let j=0;j<8;j++){const c=M[i*8+j];if(c=='-'||c=='.')continue;let n=1;while(M[(i*8+j+n)%32]=='-')n++;
   const m=50+parseInt(c,36),tt=t+j*E+(j%2?E*.1:0),d=n*E-(j%2?E*.1:0);gurdy(tt,m,d+.02,v);if(sw)shawm(tt,m-5,d,s==6?.1:.085)}
  // psaltery arpeggios (D minor at sea, D major for the victory), tambourine in the dances
  const AR=s==1&&b>=4?[50,57,62,65,69,65,62,57]:s==6?[50,57,62,66,69,74,69,66]:s==2?[50,57,62,57,50,57,62,65]:0;
  if(AR)for(let j=0;j<8;j++)pluck(t+j*E+(j%2?E*.1:0),AR[j]+12,s==6?.07:.06);
  if(s==2||s==3||s==6)for(let j=0;j<8;j++)if(j%4==2||s==6&&j%2)tamb(t+j*E+(j%2?E*.1:0),j%4==2?.16:.08);
  if(s==6)for(let j=0;j<8;j++){const c=MEL.D[i*8+j];if(c!='-'&&c!='.'&&j%2==0)gurdy(t+j*E,50+parseInt(c,36)-3-(c=='g'||c=='l'?1:0),E*1.9,.05)}
  if(b==1){gurdy(t+4*E,69,2*E+.02,v*.8);gurdy(t+6*E,71,2*E,v*.8)}
  if(s==7&&b==46){gurdy(t,62,BAR*1.8,v);gurdy(t,74,BAR*1.8,v*.6);shawm(t,57,BAR*1.6,.08)}
  // drums and buzz
  let D=DR[s];if(s==1&&b<4)D="................";if(s==5&&b<32)D=b==30?"D...............":"D.......m.m.mmmm";if(s==6&&b==45)D="D.t.D.t.D.ttm.mm";
  if(s==7)D=b==46?DR[7]:"................";
  for(let j=0;j<16;j++){const k=D[j];if(k!='.')drum(t+j*S+(j%2?S*.1:0),k,(k=='D'?.85:k=='m'?.6:k=='t'?.5:.3)*(j%4?.85:1)*(s==1?.6:1))}
  for(let j=0;j<8;j++)if(BZ[s][j]=='x')buzz(t+j*E+(j%2?E*.1:0),.22);
  // bells: the king, the victory, the end
  if(b==0){bell(t,74,.16);bell(t+BAR/2,69,.12)}if(b==38||b==44){bell(t,74,.14);bell(t+BAR/4,78,.1)}if(b==46||b==47){bell(t,74,.16);bell(t+BAR/2,69,.13)}
  // foley
  ev(LA,b,x=>whoosh(x-.25,.5));ev(LA.map(x=>x+FL),b,x=>boom(x,.6));
  ev(FB,b,x=>whoosh(x,.4));ev(FB.map(x=>x+FL),b,x=>(boom(x,.5),crackle(x,1,.12)));
  if(s==4)crackle(t,BAR,.06);
  if(b==27){for(const [k,v2] of[[.15,.35],[.55,.7],[.95,.5],[1.35,.6]])boom(t+k*BAR,v2);crackle(t,BAR*1.6,.14)}
  if(b==30)roar(t+.1,2.2,.55);if(b==36)roar(t+BAR/2,1.9,.45);
  if(b==32){blaze(t,BAR*2.3,.35);tear(t+BAR*.3,BAR*1.6,.3)}if(b==34)crackle(t,BAR*2,.1)}
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,LA,FB,FL}})();
