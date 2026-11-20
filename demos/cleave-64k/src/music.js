// CLEAVE soundtrack. Deep dub techno (120 BPM) that grows into peak-time techno (130 BPM).
// The arrangement divides with the cells: every cleavage division doubles something
// (stab polyphony 1-2-4-8, stab hits per bar, hat density 4-8-16-32, then percussion layers).
// Gastrulation is the breakdown (the tempo rises inside it), pattern formation is the drop.
// Same scheduler runs live (bar by bar, ~1.2 s lookahead) and offline (SONG.render()).
var SONG=(()=>{
const BARS=104,
bpm=b=>{const x=Math.min(Math.max((b-60)/12,0),1);return 120+10*x*x*(3-2*x)},
T=[0];for(let b=0;b<BARS;b++)T.push(T[b]+240/bpm(b));
const LEN=T[BARS]+9,
// division level: cells = 2^lev. Divisions land on bars 32,36,40,44,48,52
lev=b=>b<32?0:b<52?Math.min(6,1+(b-32>>2)):6,
// kick on beat k of bar b? (gaps: the pinch before the first division, the breakdown, the drop gaps)
kon=(b,k)=>b>=4&&b<60?!(b==31&&k>1):b>=68&&b<72?b<71||k<2:b>=72&&b<100&&!((b==87||b==95)&&k==3)&&!(b==99&&k>2),
RN=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},
mf=m=>440*2**((m-69)/12),
// Am9 and Fmaj9, ordered by importance so the first n voices are the n-voice chord
CH=[[57,64,60,67,71,45,74,76],[53,60,57,64,67,41,69,72]];
function setup(A,base){
 const SR=A.sampleRate,R=RN(7);let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g},
 O=(ty,f,t,e)=>{const o=keep(A.createOscillator());o.type=ty;o.frequency.value=f;o.start(t);o.stop(e);return o},
 F=(ty,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=ty;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x},
 P=(p,...to)=>{const x=keep(A.createStereoPanner());x.pan.value=p;to.forEach(n=>x.connect(n));return x},
 buf=(ch,len,fn)=>{const b=A.createBuffer(ch,len,SR);for(let c=0;c<ch;c++)fn(b.getChannelData(c),c);return b},
 NB=buf(1,SR*2,d=>{for(let i=0;i<d.length;i++)d[i]=R()*2-1}),
 N=(t,e)=>{const s=keep(A.createBufferSource());s.buffer=NB;s.loop=true;s.start(t,R()*1.5);s.stop(e);return s},
 shp=(k,n)=>{const s=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;c[i]=Math.tanh(k*x)/(n||Math.tanh(k))}s.curve=c;return s},
 // decaying-noise impulse responses, darker towards the tail
 IR=(sec,p)=>buf(2,SR*sec|0,d=>{let y=0;for(let i=0;i<d.length;i++){const u=i/d.length,a=.9-.85*u;y+=(R()*2-1-y)*a;d[i]=y*(1-u)**p}});
 // ---- long-lived master chain ----
 const comp=A.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=8;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.2;comp.connect(A.destination);
 const MX=G(.6,comp),LP=A.createBiquadFilter();LP.frequency.value=19e3;LP.Q.value=.8;LP.connect(MX);
 const DK=G(1,LP),KS=shp(1.6),KB=A.createGain();KB.connect(KS);KS.connect(G(.5,MX));
 // reverb
 const cv=A.createConvolver();cv.buffer=IR(3.4,3);const RV=F('highpass',220,.6,cv);cv.connect(G(.55,DK));
 // rumble: kick through a short dark room, low-passed (peak-time techno)
 const cr=A.createConvolver();cr.buffer=IR(1.6,2);const RM=G(1,cr);cr.connect(F('lowpass',140,.7,G(1.1,DK)));
 // tape delay: ping-pong dotted eighths, saturating, filtered, with wow on the delay time
 const DI=G(1),dL=A.createDelay(2),dR=A.createDelay(2),mg=A.createChannelMerger(2),FB=G(.55),ts=shp(1.4,1.4);
 DI.connect(dL);dL.connect(mg,0,0);dL.connect(dR);dR.connect(mg,0,1);mg.connect(G(.8,DK));
 dR.connect(F('highpass',280,.5,F('lowpass',2600,.4,ts)));ts.connect(FB);FB.connect(dL);
 const wow=A.createOscillator();wow.frequency.value=.37;wow.connect(G(.0022,dL.delayTime,dR.delayTime));wow.start(base);wow.stop(base+LEN);
 // vinyl crackle loop: sparse clicks and soft hiss
 const crk=A.createBufferSource(),CG=G(0,DK);crk.buffer=buf(2,SR*4,d=>{let h=0;for(let i=0;i<d.length;i++){h+=(R()-.5-h)*.08;d[i]=h*.05;if(R()<.00035){const a=(R()-.5)*(R()<.1?.6:.2);for(let j=0;j<12&&i+j<d.length;j++)d[i+j]+=a*(1-j/12)*(j&1?-1:1)}}});
 crk.loop=true;crk.connect(F('highpass',400,.5,CG));crk.start(base);crk.stop(base+LEN);
 // send helper: dry / reverb / delay
 const S=(n,d,r,e)=>{d&&n.connect(G(d,DK));r&&n.connect(G(r,RV));e&&n.connect(G(e,DI))},
 env=(p,t,v,a,d)=>{p.setValueAtTime(0,t);p.linearRampToValueAtTime(v,t+a);p.setTargetAtTime(0,t+a,d)},
 duck=(t,x)=>{DK.gain.setValueAtTime(1-x,t);DK.gain.setTargetAtTime(1,t+.004,.075)};
 // ---- instruments ----
 function kick(t,v,h,m){const o=O('sine',50,t,t+.8),g=G(0,KB);o.connect(g);
  o.frequency.setValueAtTime(110+h*140,t);o.frequency.exponentialRampToValueAtTime(54,t+.03+.025*(1-h));o.frequency.exponentialRampToValueAtTime(42,t+.4);
  g.gain.setValueAtTime(v*(1+h*.5),t);g.gain.setTargetAtTime(0,t+.09+h*.07,.09+.04*(1-h));
  if(m){g.disconnect();g.connect(F('lowpass',m,.7,KB))}
  else{const c=G(0,KB);N(t,t+.03).connect(F('bandpass',3200,.8,c));env(c.gain,t,v*(.2+.3*h),.001,.006)}
  h&&g.connect(G(.5*h,RM));duck(t,.45+.25*h)}
 function bass(t,m,l,v,c){const g=G(0),f=F('lowpass',c||260,2,g);O('sine',mf(m),t,t+l+.3).connect(f);O('triangle',mf(m+12),t,t+l+.3).connect(G(.35,f));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.006);g.gain.setValueAtTime(v,t+l);g.gain.setTargetAtTime(0,t+l,.04);S(g,1)}
 function drone(t,m,l,v){const g=G(0);O('sine',mf(m),t,t+l+2).connect(g);O('sine',mf(m+19),t,t+l+2).connect(G(.06,g));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+l*.4);g.gain.setTargetAtTime(0,t+l*.8,l*.2);S(g,1,.1)}
 // dub chord stab: n voices, each two detuned saws, spread in stereo; heavy delay send
 function stab(t,ns,v,c,dc,w,del){const g=G(0),f=F('lowpass',c,2.5,g);f.frequency.setValueAtTime(c,t);f.frequency.setTargetAtTime(160,t+.008,dc);
  ns.forEach((m,i)=>{const p=P(ns.length<2?0:(i&1?1:-1)*w*(.4+.6*(i>>1)/3),f);for(const d of[-1,1]){const o=O(i==5?'square':'sawtooth',mf(m)*2**(d*.09/12),t,t+1.4);o.connect(G(.5/Math.sqrt(ns.length),p))}});
  env(g.gain,t,v,.003,dc*1.6);S(g,.6,.32,del)}
 function pad(t,ns,l,v){const g=G(0),f=F('lowpass',260,1.4,g);f.frequency.setValueAtTime(260,t);f.frequency.linearRampToValueAtTime(1600,t+l*.55);f.frequency.linearRampToValueAtTime(420,t+l);
  ns.forEach((m,i)=>{const p=P((i&1?1:-1)*(.2+.1*i),f);for(const d of[-1,1])O('sawtooth',mf(m)*2**(d*.12/12),t,t+l+1).connect(G(.3/ns.length*2,p))});
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+l*.3);g.gain.setValueAtTime(v,t+l*.75);g.gain.linearRampToValueAtTime(0,t+l);S(g,.5,.7,.25)}
 function hat(t,v,o,p){const g=G(0),f=F('highpass',o?6800:8200,.9,P(p,g));N(t,t+(o?.7:.12)).connect(f);
  env(g.gain,t,v,.0015,o?.13:.022);S(g,1,o?.06:0)}
 function ride(t,v){const g=G(0),f=F('highpass',7e3,.7,g);[1,1.342,1.2312,1.6532,1.9523,2.1523].forEach(r=>O('square',r*410,t,t+.7).connect(G(.15,f)));env(g.gain,t,v,.001,.18);S(g,.7,.12)}
 function crash(t,v){const g=G(0),f=F('highpass',3500,.6,g);N(t,t+3).connect(f);env(g.gain,t,v,.002,.7);S(g,.7,.6)}
 function clap(t,v,r){const g=G(0),f=F('bandpass',1250,1.1,g);N(t,t+.6).connect(f);g.gain.setValueAtTime(0,t);
  for(let k=0;k<3;k++){g.gain.setValueAtTime(v,t+k*.011);g.gain.setTargetAtTime(v*.1,t+k*.011+.001,.004)}
  g.gain.setValueAtTime(v*.85,t+.034);g.gain.setTargetAtTime(0,t+.035,.075);S(g,.9,r)}
 function snare(t,v,p){const g=G(0),f=F('bandpass',1900*p,.7,g);N(t,t+.3).connect(f);const o=O('triangle',210*p,t,t+.2);o.frequency.exponentialRampToValueAtTime(140*p,t+.05);o.connect(G(.6,g));
  env(g.gain,t,v,.001,.045);S(g,.8,.25)}
 function rim(t,v,p){const g=G(0),f=F('bandpass',1600,3,P(p,g));O('triangle',1650,t,t+.08).connect(f);O('sine',830,t,t+.08).connect(G(.6,f));env(g.gain,t,v,.0007,.012);S(g,.35,.08,.85)}
 function tom(t,fr,v,p){const g=G(0),o=O('sine',fr*1.7,t,t+.4);o.frequency.exponentialRampToValueAtTime(fr,t+.035);o.connect(P(p,g));env(g.gain,t,v,.001,.07);S(g,.6,.15,.3)}
 function shk(t,v,p){const g=G(0);N(t,t+.15).connect(F('bandpass',6200,1.4,P(p,g)));env(g.gain,t,v,.012,.022);S(g,1)}
 function acid(t,m,v,c,a,l){const g=G(0),f=F('lowpass',c,11,g);O('sawtooth',mf(m),t,t+l+.15).connect(f);f.frequency.setValueAtTime(c*(a?3.5:2),t);f.frequency.setTargetAtTime(c*.6,t+.005,a?.09:.05);
  env(g.gain,t,v*(a?1.3:1),.003,l*.6);S(g,.42,.08,.28)}
 // the division sound: one tone splits into two that glide apart a fifth, hard left / right
 function split(t,v,m){for(const s of[-1,1]){const g=G(0),o=O('triangle',mf(m),t,t+1.6);o.frequency.setValueAtTime(mf(m),t+.02);o.frequency.exponentialRampToValueAtTime(mf(m+s*7),t+.32);o.connect(P(s*.95,g));env(g.gain,t,v,.004,.22);S(g,.5,.4,.55)}
  const g=G(0),o=O('sine',120,t,t+.6);o.frequency.exponentialRampToValueAtTime(34,t+.25);o.connect(g);env(g.gain,t,v*1.8,.002,.09);S(g,1)}
 // noise swell into a downbeat (sweeps a band-pass up)
 function riser(t,e,v,f0){const g=G(0),f=F('bandpass',f0,4,g);N(t,e+.05).connect(f);f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(9e3,e);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,e-.01);g.gain.linearRampToValueAtTime(0,e+.02);S(g,.6,.5,.15)}
 // the fold: a long downward sweep into deep space (gastrulation)
 function fold(t,v){const g=G(0),f=F('lowpass',3e3,6,g);O('sawtooth',mf(69),t,t+6).connect(f);O('sawtooth',mf(57.1),t,t+6).connect(f);
  f.frequency.setValueAtTime(3e3,t);f.frequency.exponentialRampToValueAtTime(90,t+5);env(g.gain,t,v,.01,1.6);S(g,.4,.8,.4)}
 // FM bell (sine carrier, 3.5x modulator with a decaying index)
 function bell(t,m,v,d,p){const f=mf(m),g=G(0),c=O('sine',f,t,t+d+.2),md=O('sine',f*3.5,t,t+d+.2),mg=G(f*3);md.connect(mg);mg.connect(c.frequency);
  mg.gain.setValueAtTime(f*3,t);mg.gain.exponentialRampToValueAtTime(f*.04,t+d);c.connect(P(p,g));env(g.gain,t,v,.002,d*.3);S(g,.5,.4,.45)}
 // metaphase: two taut high partials beating against each other, rising a semitone over the phrase
 function tense(t,l,v){for(const k of[0,1]){const g=G(0),o=O('sine',mf(93+k*.07),t,t+l+.5);o.frequency.linearRampToValueAtTime(mf(94+k*.07),t+l);o.connect(P(k?.6:-.6,g));
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+l*.8);g.gain.linearRampToValueAtTime(0,t+l+.02);S(g,.5,.3,.3)}}
 // anaphase onset: the fibre snaps; then each beat tugs the sisters apart
 function snap(t,v){const g=G(0),o=O('sawtooth',2400,t,t+.5),f=F('bandpass',3e3,6,g);o.frequency.exponentialRampToValueAtTime(180,t+.12);o.connect(f);env(g.gain,t,v,.001,.05);S(g,.5,.7,.5)}
 function tug(t,v,p){const g=G(0),o=O('sine',330,t,t+.4);o.frequency.exponentialRampToValueAtTime(140,t+.22);o.connect(P(p,g));env(g.gain,t,v,.004,.08);S(g,.6,.2,.5)}
 // cytokinesis: a resonant band closing like a drawstring
 function pinch(t,e,v){const g=G(0),f=F('bandpass',2500,9,g);N(t,e+.1).connect(f);f.frequency.setValueAtTime(2500,t);f.frequency.exponentialRampToValueAtTime(140,e);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,e-.05);g.gain.linearRampToValueAtTime(0,e);S(g,.6,.4,.2)}
 // the fold motif (breakdown) that returns in the form section
 // supersaw swell: detuned saw stacks through a slowly opening low-pass
 function sup(t,ns,l,v){const g=G(0),f=F('lowpass',300,1.5,g);f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(5e3,t+l*.6);f.frequency.exponentialRampToValueAtTime(900,t+l);
  ns.forEach((m,i)=>{for(let k=-2;k<3;k++)O('sawtooth',mf(m)*2**(k*.11/12),t,t+l+.4).connect(P(k*.3,G(.16,f)))});
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+l*.25);g.gain.setValueAtTime(v,t+l*.7);g.gain.linearRampToValueAtTime(0,t+l+.3);S(g,.45,.5,.2)}
 // formant choir: saws through three vowel resonances ("ah")
 function choir(t,ns,l,v){const g=G(0);[[700,1],[1220,.5],[2600,.25]].forEach(([f,a])=>{const x=F('bandpass',f,7,G(a,g));ns.forEach(m=>{for(const d of[-1,1])O('sawtooth',mf(m)*2**(d*.15/12),t,t+l+.5).connect(x)})});
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+l*.4);g.gain.linearRampToValueAtTime(0,t+l);S(g,.4,.8,.2)}
 // cytoplasm: tiny resonant noise blips, like granules in Brownian motion
 function gran(t,v){const g=G(0);N(t,t+.06).connect(F('bandpass',1500+R()*5e3,5,P(R()*2-1,g)));env(g.gain,t,v,.002,.012);S(g,.5,.3,.4)}
 const MOT=[[0,76],[6,74],[8,72],[14,71],[16,69],[22,72],[24,76],[28,74]],PEN=[69,72,74,76,79,81,84];
 /*DBG*/(self.MUTE||[]).forEach(n=>eval(n+'=()=>{}'));/*END*/
 // ---- arrangement ----
 function bar(b,t){
  const d=T[b+1]-t+base,s=d/16,r=RN(b*7919+3),L=lev(b),dr=b>=72&&b<96,bk=b>=60&&b<72,out=b>=96,
   st=i=>t+i*s+(i&1)*s*.17,ch=CH[b<32?0:dr?b>>1&1:b>>2&1],rt=ch[5]-12;
  // per-bar automation
  dL.delayTime.setTargetAtTime(3*s,t,.2);dR.delayTime.setTargetAtTime(3*s,t,.2);
  FB.gain.setTargetAtTime(b<8||bk||b>=99?.7:dr?.42:.56,t,.5);
  CG.gain.setTargetAtTime(b<16?.6:bk?.5:b>=96?.7:b<60?.25:0,t,.6);
  if(b==28)LP.frequency.setValueAtTime(19e3,t),LP.frequency.exponentialRampToValueAtTime(320,T[32]+base-s*2);
  if(b==32||b==72||b==100)LP.frequency.setValueAtTime(19e3,t);
  if(b==60)LP.frequency.setValueAtTime(19e3,t),LP.frequency.exponentialRampToValueAtTime(1100,t+d*4);
  if(b==68)LP.frequency.exponentialRampToValueAtTime(19e3,T[72]+base-s);
  if(b==96)LP.frequency.setValueAtTime(19e3,t),LP.frequency.exponentialRampToValueAtTime(260,T[100]+base-s);
  // kick
  for(let k=0;k<4;k++)kon(b,k)&&kick(t+k*4*s,b<8?.5:dr||out?1:b<32?.72:.8+L*.02,dr||out?1:0,b<8?190+b*40:b>=68&&b<72?300+(b-68)*500+k*120:0);
  // bass and sub
  if(b<8){b%2||drone(t,33,d*2,.08+b*.012)}
  else if(bk){b%4||drone(t,b<64?33:b<68?29:33,d*4,.16)}
  else if(b<100){const ro=dr||out||L>4,pat=ro?[1,2,3]:L>1?[2,3]:[2];
   for(let k=0;k<4;k++)if(kon(b,k))for(const j of pat){const i=k*4+j,m=rt+(ro&&i==14?12:ro&&i==7?7:0);
    bass(st(i),m,s*(ro?.55:1.4),ro?(j==2?.4:.28):.32,ro?200+400*(.5+.5*Math.sin(b*.7+i)):300)}}
  else if(b==100)drone(t,33,d*2,.14);
  // chord stabs: polyphony and hits per bar double with each division
  if(!bk&&b<100&&(b>3||b%2==0)){const nv=dr||out?8:[1,2,4,8,8,8,8][L],
   hits=dr||out?[3,6,11,14]:[[3],[3,10],[3,6,10,13],[3,6,10,13],[2,3,6,10,13],[2,3,6,10,13,15],[2,3,6,8,10,13,15]][L],
   c=dr?1500+1300*(.5+.5*Math.sin((b-72)*Math.PI/4)):b<8?500+b*90:1000+L*260;
   hits.forEach((i,j)=>stab(st(i),ch.slice(0,nv),(dr?.75:1)*(j?.8:1),c*(1+.3*r()),dr?.08:.15,Math.min(1,L/3),dr?.5:.9))}
  if(bk&&b<71||b==100)stab(st(3),b==100?[57]:ch.slice(0,4),.6,900,.15,.6,1);
  if(bk&&b%4==0)pad(t,ch,d*(b==68?3.75:4),.24);
  // hats: 4 → 8 → 16 → 32 per bar with the divisions; the drop runs them all
  if(b>=16&&b<60||dr||out&&b<98){const hl=dr||out?3:L;
   for(let i=0;i<16;i++){const o=i%4==2,sw=(i&1)*s*.17;
    if(o)hat(t+i*s,dr?.34:.28,1,.1);
    else if(hl>0&&i%2==0)hat(t+i*s,.2,0,-.15);
    else if(hl>1&&i&1)hat(t+i*s+sw,.11+.06*r(),0,.25);
    if(hl>2&&r()<.4)hat(t+(i+.5)*s+sw,.06,0,-.3)}}
  // clap (dub snare, big room) and rim echoes
  if(b>=16&&b<60||dr||out&&b<99)[4,12].forEach(i=>clap(t+i*s,dr||out?1:.8,dr?.25:.55));
  if(b>=8&&b<60||bk)[7,b&1?13:15].forEach((i,j)=>(j==0||r()<.7)&&rim(st(i),.5,j?.5:-.5));
  // more layers past 16 cells: shaker, toms, ride; then the acid line
  if(L>=4&&b<60||dr){for(let i=0;i<16;i++)shk(st(i),i&1?.08:.13,.4*Math.sin(i));
   [3,9,14].forEach(i=>r()<.6&&tom(st(i),[90,120,160][r()*3|0],.4,r()-.5))}
  if(L>=5&&b<60||b>=80&&dr)for(let i=0;i<16;i+=2)ride(st(i),i%4==2?.2:.12);
  if(b>=52&&b<60||dr){const q=[0,12,0,7,10,0,12,3,0,15,12,0,7,19,10,12],ac=0x9124,cc=b<60?400+40*(b-52):350+1100*(.5-.5*Math.cos((b-72)*Math.PI/8));
   for(let i=0;i<16;i++)if(i%4||b>=80)acid(st(i),rt+12+q[(i+(b>=88?3:0))%16],b<60?.15:.36,cc,ac>>i&1,s*.8)}
  // fills, risers, division events
  if(b==31||b==35||b==39||b==43||b==47||b==51||b==59||b==79||b==87)riser(t+d/2,t+d,.18,800);
  if(b>=24&&b<32)riser(t,t+d,.04+.01*(b-24),300+(b-24)*300);
  if([32,36,40,44,48,52,72,92].includes(b)){split(t,.24,72+L*2);crash(t,.3)}
  if(b==60){fold(t,.28);crash(t,.3)}
  if(b==80||b==88)crash(t,.32);
  if(b>=68&&b<72){riser(t,t+d*(b<71?1:.94),.05+.03*(b-68),400*(b-67));const n=b<70?4:b<71?8:24;for(let i=0;i<n;i++){const x=(b-68+i/n)/4;snare(t+i*d/(b<71?n:32),.08+.28*x,1+x*.5)}}
  if(b==79||b==87||b==95)for(let i=12;i<16;i++)snare(t+i*s,.15+.05*(i-12),1+(i-12)*.06);
  if(b==99)riser(t,t+d,.12,500);
  // tape stop into the first division: the echoes sag in pitch, then spring back
  if(b==31)for(const x of[dL,dR])x.delayTime.setValueAtTime(3*s,t+d*.5),x.delayTime.linearRampToValueAtTime(7.5*s,t+d);
  if(b>=64&&b<71&&b%2==0)choir(t,ch.slice(0,3).map(m=>m+12),d*2,.2);
  if(b<32)for(let i=0;i<16;i++)r()<.3&&gran(st(i)+s*r()*.5,.4);
  // the division sound reversed: two tones glide together into one
  if(b==100)for(const k of[-1,1]){const g=G(0),o=O('triangle',mf(69+k*7),t,t+3);o.frequency.exponentialRampToValueAtTime(mf(69),t+1.2);o.connect(P(k*.9,g));env(g.gain,t,.12,.4,.8);S(g,.4,.6,.6)}
  if(b==101||b==102)MOT.slice(b==101?0:2,b==101?2:4).forEach(([i,m])=>bell(st(i%16),m,.07,2,0));
  // dub throws: the tape delay swells into self-feeding echo for the last half of a phrase
  if([15,23,47,59,79,95].includes(b))FB.gain.setValueAtTime(.84,t+d*.5);
  // the eye opens: a supersaw swell under the form section
  if(b>=88&&b<96&&b%2==0)sup(t,CH[b>>1&1].slice(0,4).map(m=>m+12),d*2,b==92?.42:.3);
  // blastula shimmer and drop ghost snares
  if(b>=52&&b<60)[5,13].forEach(i=>bell(st(i),PEN[(b+i)%7]+12,.05,.5,i<8?-.6:.6));
  // the objective turret clicks round on every change of microscope
  if([8,20,24,32,52,64,72,92,100].includes(b))for(const k of[0,.06]){const g=G(0);N(t-.12+k,t+k).connect(F('highpass',2500,1,P(.3,g)));env(g.gain,t-.12+k,.22,.001,.006);S(g,.6,.25)}
  // sub drops: a long falling sine under the big downbeats
  if(b==32||b==52||b==72||b==92){const g=G(0),o=O('sine',62,t,t+3);o.frequency.exponentialRampToValueAtTime(29,t+2.5);o.connect(g);env(g.gain,t,.5,.01,.7);S(g,1)}
  // form section: hats shuffle into a busier open-hat figure, ride bell on the offbeats
  if(b>=88&&b<96){[3,7,11,15].forEach(i=>hat(st(i),.12,1,.3));[2,6,10,14].forEach(i=>bell(st(i),93,.025,.15,.4))}
  // the vinyl runs out after the end card
  if(b==103)CG.gain.setTargetAtTime(0,t+d,1.5);
  // phrase-end fills: tom runs down the stereo field before each 8-bar phrase
  if(b>=40&&b<60&&b%8==7||b==83||b==91)for(let i=8;i<16;i++)tom(st(i),[200,170,150,130,110,95,85,75][i-8],.3,(i-12)/5);
  // late cleavage: the stab gains an inverted voicing an octave up on the offbeats
  if(L>3&&b<52)[7,15].forEach(i=>stab(st(i),ch.slice(1,4).map(m=>m+12),.35,1600,.08,1,.7));
  if(dr)[7,10,15].forEach(i=>r()<.5&&snare(st(i),.06,1.1));
  // mitosis sound design: tension, snap, tugs, pinch
  if(b==16)tense(t,T[24]-T[16],.06);
  if(b==24)snap(t,.25);
  if(b>=24&&b<28)for(let k=0;k<4;k++)tug(t+k*4*s,.4,k&1?.5:-.5);
  if(b==28)pinch(t,T[32]+base-s*2,.06);
  // the fold motif: bells over the breakdown pads, then a lead over the form
  if(b>=62&&b<71||b>=88&&b<96)MOT.forEach(([i,m])=>{i-=b%2*16;i>=0&&i<16&&bell(st(i),m+(b>=88?12:0),b>=88?.1:.13,b>=88?.9:1.6,.3*Math.sin(m))});
  // pattern formation: bell pings that double every bar like the dividing Turing spots, 1 2 4 8 16
  if(dr&&b<88){const n=b<77?1<<b-72:10;for(let j=0;j<n;j++)bell(st(r()*16|0),PEN[r()*7|0]+(r()<.3?12:0),.08+.05/(1+j*.2),.35,r()*1.6-.8)}
 }
 function sched(b){bag=[];if(b>5&&BAGS[b-6]){BAGS[b-6].forEach(n=>n.disconnect());BAGS[b-6]=0}BAGS[b]=bag;bar(b,base+T[b])}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=0;while(b<BARS&&T[b]<from-.01)b++;
 const tick=()=>{while(b<BARS&&base+T[b]<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((T[b]-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,T,BARS,LEN,BAR:2,lev,kon,bpm}})();
