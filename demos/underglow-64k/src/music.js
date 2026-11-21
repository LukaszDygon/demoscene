// UNDERGLOW soundtrack: slow Memphis-style phonk. 96 BPM, G minor, swung sixteenths.
// A syncopated kick with a snare and clap on 2 and 4, an 808 that follows the kick and slides between notes,
// sixteenth hats with rolls, a dark electric piano, and a low, saturated cowbell playing the hook.
// One scheduler builds the song on any context: SONG.live() plays it, SONG.render() renders it offline for the level check.
var SONG=(()=>{
const BPM=96,BAR=240/BPM,BARS=88,LEN=BARS*BAR+5,Q=BAR/16,SW=.2,F0=48.999,
// odd sixteenths arrive late: that is the bounce. st(i) is the time of step i within a bar.
st=i=>(i+(i&1)*SW)*Q,
// cowbell lines, one char per 16th: a=G3, m=G4, t=D5, "."=rest. Four bars each over G G Eb D.
// The hook lives between Eb4 and D5 and never leaves that range: three bars fall, the fourth turns back up to where it began.
RA=["t..t..r.p..p.m..","t..t..r.p..n.m..","p..p..n.m..m.i..","o..o..m.o..r.t.."],
RB=["t.....r.p.rp.m..","t.....r.p.pn.m..","p.....n.m.nm.i..","o.....m.o.rt...."],
RC=["t.......p....m..","t.......p....n..","p.......m....i..","o.......m.o....."],
// a third shape for the hook: the same notes as falling arpeggios
RD=["t..r..p.t..r.p..","t..r..p.n..m.n..","p..m..i.p..m.i..","o..m..o.r..o.m.."],
RI=["t.......p.......","m.......n.......","p.......i.......","o.......h......."],
// headlights go out one bar at a time, then the four underglows on the last four beats
RO=["t...............","r...............","p...............","m..............."],
K0="................",K1="x..x..x...x.....",K2="x..x..x...x..x..",K3="x.x...x..x.x....",KH="x.........x.....",KT="x......x..x.....",KS="x.....x...x.....",
S1="....x.......x...",S2="........x.......",SR="....r.......r...",
// 808 lines: a letter starts a note that many semitones above the bar's root, a capital slides to it without a new attack
B1="a..a..a...m.A...",B2="a..a..a...a..m.A",B3="a.a...a..h.a..H.",BH="a...............",BS="a..m.A..h.H.a.m.",
CM=[[0,3,7,10,14],[0,3,7,10,14],[-4,0,3,7,10],[-5,-1,5,10]],
PM=[[0,7,15],[0,7,15],[-4,3,12],[-5,2,11]];
// plan(b): everything that is pattern-driven in bar b. The picture reads the same plan for its envelopes.
// k kick, sn snare, r riff, bs 808, n 1=bells instead of cowbell, lo double the riff an octave down, h hats (1 eighths, 2 sixteenths
// with rolls), ba 808 level, pd pad, ep electric piano, rv/dl reverb and delay sends for the riff, roll snare roll, gl long 808 slides on
function plan(b){
 const s=b>>2,i=b&3,o={k:K0,sn:K0,r:"",bs:"",n:0,lo:0,cq:0,v:.5,root:[0,0,8,7][i],h:0,ba:1,pd:0,ep:0,rv:.14,dl:0,roll:0,gl:0,ch:CM[i],pc:PM[i]},
 g=(k,sn,h,bs,R)=>{o.k=k;o.sn=sn;o.h=h;o.bs=bs;o.r=R[i];o.gl=bs==BH};
 if(s==0){o.ep=1;o.rv=.35;if(b)o.r=RC[i],o.v=.4;if(b==1||b==2)o.bs=BH,o.ba=.7;o.roll=b==3?2:0}
 else if(s<3)g(b&1?K2:K1,S1,2,b&1?B2:B1,RA);
 else if(s<5){g(b&1?K2:K1,S1,2,b&1?B2:B1,s==3?RA:RB);o.ep=1}
 else if(s<7){g(b&1?K2:K1,S1,2,b&1?B2:B1,s==5?RA:RD);o.ep=o.lo=1;if(b==27)o.roll=1}
 else if(s==7){g(KH,S2,1,BH,RC);o.ep=1;o.rv=.3;o.dl=.45;o.ba=.8}
 else if(s==8)g(K3,S1,2,B3,RB),o.cq=1;
 else if(s==9){g(b&1?K2:K3,S1,2,b&1?B2:B3,RA);o.ep=o.lo=o.cq=1}
 else if(s==10){if(b&1)g(K2,S1,2,B2,RA),o.lo=1;else g(KS,S1,1,BS,RC),o.r="";o.roll=b==43?2:0}
 else if(s==11){g(KT,SR,1,BH,RC);o.rv=.45;o.dl=.5;o.ba=.8}
 else if(s==12){g(K1,S1,2,B1,b<50?RC:RA);o.rv=.3;o.dl=.3;o.roll=b==51?2:0}
 else if(s<17){g(b&1?K2:K1,S1,2,b&1?B2:B1,s==15?RB:s==14?RD:RA);o.ep=o.lo=o.pd=o.cq=1;o.n=s>14?2:0;if(b==59||b==67)o.roll=1}
 else if(s<19){g(KH,S2,1,BH,RC);o.n=o.pd=o.ep=o.cq=1;o.rv=.4;o.dl=.4;o.ba=.8}
 else if(s==19){o.r=RI[i];o.n=o.pd=o.ep=1;o.rv=.5;o.dl=.4;o.bs=BH;o.gl=1;o.ba=.5}
 else if(s==20){o.r=RO[i];o.n=o.pd=o.ep=1;o.rv=.5;o.dl=.5}
 else{o.pd=1;o.rv=.5;o.dl=.5;o.v=.32;o.r=b<86?RA[i]:b>86?"m...h...d...a...":""}
 return o}
// ---- one-shot samples, synthesized once per sample rate ----
const BUFS={};
function bufs(SR){
 if(BUFS[SR])return BUFS[SR];
 let sd=7,ph=0,px=0;
 const rn=()=>(sd=sd*16807%2147483647)/1073741824-1,E=Math.exp,S=Math.sin,P=6.2832,
 m=(d,f)=>{const n=d*SR|0,a=new Float32Array(n);ph=0;for(let i=0;i<n;i++)a[i]=f(i/SR);return a},
 // band-pass biquad run over an array (gain g)
 bp=(a,f,q,g=1)=>{const w=P*f/SR,al=S(w)/(2*q),b0=al/(1+al),a1=-2*Math.cos(w)/(1+al),a2=(1-al)/(1+al),o=new Float32Array(a.length);
  let x1=0,x2=0,y1=0,y2=0;for(let i=0;i<a.length;i++){const x=a[i],y=b0*x-b0*x2-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;o[i]=y*g}return o},
 B=(...c)=>{const b=new AudioBuffer({length:c[0].length,sampleRate:SR,numberOfChannels:c.length});c.forEach((a,i)=>b.copyToChannel(a,i));return b},
 sq=x=>S(x)>0?1:-1,
 hat=(d,k)=>m(d,t=>{const x=rn(),y=x-px;px=x;return(y*.5+(sq(P*5417*t)+sq(P*7311*t)+sq(P*8933*t))*.12)*E(-t*k)}),
 // the 808 cowbell, tuned to G4: two squares a flat fifth apart, a knock and a long ring, driven into saturation
 cb=m(1.3,t=>Math.tanh(1.6*(sq(P*392*t)+sq(P*580.2*t))*(E(-t*30)*.7+E(-t*4.2)*.45))),
 cf=bp(cb,690,1,1.2);
 return BUFS[SR]={
  c:B(cf.map((x,i)=>x+cb[i]*.12)),
  // a round, boomy kick with a clipped front
  k:B(m(.4,t=>{ph+=P*(47+190*E(-t*36))/SR;return Math.tanh(4*S(ph)*E(-t*8.5))+(t<.003?rn()*.4:0)})),
  cl:B(bp(m(.4,t=>rn()*(t<.033?E(-(t%.011)*260):E(-(t-.033)*20))),1250,1.4,2.5)),
  h:B(hat(.09,70)),oh:B(hat(.5,10)),
  sn:B(m(.3,t=>rn()*E(-t*17)*.65+S(P*188*t)*E(-t*24)*.55+S(P*331*t)*E(-t*30)*.3)),
  rm:B(m(.07,t=>S(P*1740*t)*E(-t*90)+S(P*470*t)*E(-t*60)*.6)),
  bl:B(m(1.8,t=>S(P*392*t+1.6*E(-t*5)*S(P*1176*t))*E(-t*2.8)*.8)),
  // electric piano at G3: a short tine over a soft body
  ep:B(m(2.8,t=>{const f=P*196*t;return(S(f+.9*E(-t*2.2)*S(f)+.3*E(-t*9)*S(f*14))*E(-t*1.4)+.2*S(2*f)*E(-t*3))*.5})),
  // an idling six, as a one-second loop
  en:B(m(1,t=>Math.tanh(2.4*(S(P*32*t)+.6*S(P*64*t+1)+.4*S(P*96*t+2)+.5*S(P*16*t))*(.6+.4*S(P*8*t)))*.5+rn()*.06*(S(P*32*t)>0?1:0))),
  // turbo flutter: noise chopped by a falling rate
  tf:B(bp(m(.5,t=>rn()*E(-t*6)*(S(P*(42-52*t)*t)>0?1:.1)),3400,1.5,2)),
  // crickets, as a loop of chirps
  ck:B(m(1.8,t=>S(P*4350*t)*(t%.9<.28&&t*37%1<.5?S(11.2*(t%.9)):0))),
  // worn vinyl: clicks over a little hiss
  vy:B(m(2,t=>{const x=rn();return(x>.9975||x<-.9975?x:0)+rn()*.012})),
  nz:B(m(2,rn)),
  ir:B(m(2.4,t=>rn()*E(-t*3)),m(2.4,t=>rn()*E(-t*3)))}}
// ---- the graph ----
function setup(A,base){
 const SR=A.sampleRate,U=bufs(SR),tb=b=>Math.max(0,base+b*BAR);   // (clamped so a late start can't schedule in the past)
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g},
 O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o},
 F=(type,f,q,to)=>{const b=keep(A.createBiquadFilter());b.type=type;b.frequency.value=f;b.Q.value=q;b.connect(to);return b},
 WS=(k,to)=>{const w=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++)c[i]=Math.tanh((i/512-1)*k);w.curve=c;w.connect(to);return w};
 // master: low-pass (the garage wall, the tunnel) -> soft clip -> compressor
 const comp=A.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.14;comp.connect(A.destination);
 const mf=F("lowpass",450,.5,WS(1.5,comp)),master=G(.3,mf),
 // two sidechains: melody and keys dip a little under each kick, the 808 dips almost to nothing and swells back
 duck=G(1,master),bduck=G(1,master),
 rev=A.createConvolver(),dly=A.createDelay(1),fb=G(.4,dly);
 rev.buffer=U.ir;rev.connect(G(.8,master));dly.delayTime.value=Q*3;dly.connect(fb);dly.connect(G(.7,duck));dly.connect(G(.3,rev));
 const cow=G(2.2,duck),rs=G(.14,rev),ds=G(0,dly);cow.connect(rs);cow.connect(ds);
 const drum=G(.8,master),
 bv=G(.6,bduck),bassIn=WS(6,F("lowpass",1500,.5,bv)),   // bv: 808 level, set per bar after the distortion
 pad=F("lowpass",1500,.6,G(1.8,duck,rs)),
 // the piano goes through a dull filter and a slow pitch wobble, like a sample off a worn tape
 vib=A.createDelay(.1),keys=F("lowpass",2100,.7,vib),
 fx=G(1,master,G(.25,rev)),
 // a choir of saws through two vowel formants
 choir=G(1,F("bandpass",700,5,G(1.4,duck,rs)),F("bandpass",1150,6,G(.9,duck,rs)));
 vib.delayTime.value=.012;vib.connect(G(1.6,duck,G(.3,rev)));O("sine",.7,0,1e9).connect(G(.001,vib.delayTime));
 /*STEMS*/
 // long automation, locked to bars
 const mq=mf.frequency;
 mq.setValueAtTime(450,0);mq.setValueAtTime(450,tb(3));mq.exponentialRampToValueAtTime(2500,tb(3.9));mq.setValueAtTime(19000,tb(4));
 mq.setValueAtTime(19000,tb(43.9));mq.setValueAtTime(1500,tb(44));mq.exponentialRampToValueAtTime(3500,tb(48));mq.exponentialRampToValueAtTime(19000,tb(51.9));
 mq.setValueAtTime(19000,tb(84));mq.exponentialRampToValueAtTime(900,tb(88));
 master.gain.setValueAtTime(.3,tb(86.5));master.gain.linearRampToValueAtTime(0,tb(89));
 // ---- voices ----
 const smp=(buf,t,rate,g,to)=>{const s=keep(A.createBufferSource());s.buffer=buf;s.playbackRate.value=rate;s.connect(G(g,to));s.start(t);return s},
 env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d)},
 // cowbell note: scooped up into pitch, the way the sample is played in phonk
 bell=(t,n,g)=>{const r=2**(n/12-1),q=smp(U.c,t,r,g,cow).playbackRate;q.setValueAtTime(r*.93,t);q.exponentialRampToValueAtTime(r,t+.04)},
 // a looped buffer with a level and a rate that move over its length: engine, crickets, crackle
 loop=(buf,t,d,g0,g1,r0=1,r1=r0,to=fx)=>{const s=keep(A.createBufferSource()),g=G(0,to),q=s.playbackRate;s.buffer=buf;s.loop=true;s.connect(g);s.start(t);s.stop(t+d);
  q.setValueAtTime(r0,t);q.exponentialRampToValueAtTime(r1,t+d);g.gain.setValueAtTime(g0,t);g.gain.linearRampToValueAtTime(g1,t+d)},
 // noise through a swept filter: risers, crashes, tyres, the crowd, the garage door
 nz=(t,d,f0,f1,q,g0,g1,type="bandpass",to=fx)=>{const s=keep(A.createBufferSource()),g=G(0,to),f=F(type,f0,q,g);s.buffer=U.nz;s.loop=true;s.connect(f);s.start(t);s.stop(t+d);
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(g0,t);g.gain.linearRampToValueAtTime(g1,t+d)},
 crash=(t,g=.3)=>nz(t,2.6,7000,5000,.4,g,0,"highpass"),
 // swept oscillator: the starter motor, a whoop from the crowd
 swp=(t,d,f0,f1,g,type="sawtooth",lp=900)=>{const o=O(type,f0,t,t+d),gn=G(0,F("lowpass",lp,1,fx));o.connect(gn);o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(gn,t,.02,d,g)},
 // tyres: a narrow band of noise that wavers
 tyre=(t,d,g)=>nz(t,d,1500,1900,14,g,0),
 // exhaust: a pop and a crackle
 pop=(t,g)=>{smp(U.k,t,2.3,g,fx);nz(t,.12,900,300,1.2,g*.7,0)};
 function bar(b,t){
  const p=plan(b),fr=2**(p.root/12),at=i=>t+st(i),ph=b&3;
  rs.gain.setValueAtTime(p.rv,t);ds.gain.setValueAtTime(p.dl,t);
  for(let i=0;i<16;i++){const T=at(i);
   if(p.k[i]=="x"){smp(U.k,T,1,1,drum);
    duck.gain.setValueAtTime(.55,T);duck.gain.linearRampToValueAtTime(1,T+.2);
    bduck.gain.setValueAtTime(.15,T);bduck.gain.linearRampToValueAtTime(1,T+.22)}
   const c=p.r.charCodeAt(i)-97;
   if(c>=0)p.n&1?smp(U.bl,T,2**(c/12-1),.3,cow):(bell(T,c,p.v),p.lo&&bell(T,c-12,.2),
    // a cowbell flam into the next phrase
    p.h==2&&ph==3&&i>9&&bell(T+Q/2,c,.2));
   // glassy bells shadow the hook an octave down, every other note, late in the hill climb
   if(c>=0&&p.n>1&&i%8<4)smp(U.bl,T,2**(c/12-2),.16,cow);
   if(p.h==1&&i%4==2)smp(U.h,T,1,.22,drum);
   if(p.h==2){smp(U.h,T,1,i%4?i&1?.07:.13:.2,drum);
    i==(b&1?14:6)&&smp(U.oh,T,1,.2,drum);
    // hat rolls: 32nds at the end of odd bars, a triplet run into each new phrase
    if(b&1&&ph<3&&i>13)smp(U.h,T+Q/2,1.1,.13,drum);
    if(ph==3&&i>11)for(let k=1;k<3;k++)smp(U.h,t+(i+k/3)*Q,1+(i-11)*.06+k*.02,.1+i*.006,drum)}
   if(p.sn[i]=="x")smp(U.sn,T,1,.55,drum),smp(U.cl,T,1,.6,drum),smp(U.cl,T,1,.18,rs);
   if(p.sn[i]=="r")smp(U.rm,T,1,.5,drum),smp(U.rm,T,1,.5,rs);
   // ghost snare into the downbeat
   if(p.h==2&&b&1&&i==15)smp(U.sn,T,1.15,.14,drum);
   if(p.roll==1&&i>7)smp(U.sn,T,1,.12+i*.02,drum);
   if(p.roll==2){smp(U.sn,T,1+i*.015,.1+i*.022,drum);if(i>7)smp(U.sn,T+Q/2,1+i*.015,.1+i*.022,drum)}}
  // 808: one oscillator per bar, re-struck or slid from step to step
  if(p.bs){
   const o=O("sine",F0*fr,t,t+BAR+.02),g=G(0,bassIn),q=o.frequency,gg=g.gain;let f=F0*fr,on=0;
   o.connect(g);bv.gain.setValueAtTime(.6*p.ba,t);
   for(let i=0;i<16;i++){const ch=p.bs[i],T=at(i);
    if(ch>"."){const n=F0*fr*2**((ch.toLowerCase().charCodeAt()-97)/12);
     if(ch<"a")q.setValueAtTime(f,T),q.exponentialRampToValueAtTime(n,T+.11);
     else{if(on)gg.linearRampToValueAtTime(.45,T-.004);
      q.setValueAtTime(n*2.2,T);q.exponentialRampToValueAtTime(n,T+.045);gg.setValueAtTime(.2,T);gg.linearRampToValueAtTime(1,T+.008);on=1}
     f=n}}
   // long notes slide into the next bar's root
   if(p.gl)q.setValueAtTime(f,at(13)),q.exponentialRampToValueAtTime(F0*2**(plan(b+1).root/12),t+BAR);
   gg.linearRampToValueAtTime(.4,t+BAR-.03);gg.linearRampToValueAtTime(0,t+BAR)}
  // electric piano: the chord on the one, and again, softer, pushed ahead of the three
  if(p.ep)[0,7].map(i=>p.ch.map((n,k)=>smp(U.ep,at(i)+k*.012,2**(n/12),i?.3:.5,keys)));
  if(p.pd)p.pc.map(n=>[-9,9].map(c=>{const o=O("sawtooth",98*2**(n/12),t,t+BAR+.4),g=G(0,pad);o.detune.value=c;o.connect(g);env(g,t,.3,BAR+.35,.1)}));
  if(p.cq)p.pc.slice(1).map(n=>[-7,7].map(c=>{const o=O("sawtooth",196*2**(n/12),t,t+BAR+.4),g=G(0,choir);o.detune.value=c;o.connect(g);env(g,t,.4,BAR+.35,.36)}));
  // toms out of every eighth bar, a reverse swell into every fourth, while the drums are full
  if((b&7)==7&&p.h==2)[10,12,13,14].map((i,k)=>smp(U.k,at(i),1.9-k*.25,.45,drum));
  if(ph==3&&p.h==2)nz(at(8),8*Q,5000,9000,.6,0,.16,"highpass");
  // beds: crackle under the quiet parts, the crowd at the lot, crickets on the hill
  if(b<4||b>43&&b<52||b>67)loop(U.vy,t,BAR+.05,.5,.5);
  if(b>27&&b<44)nz(t,BAR+.05,1000,1300,.7,b<32?.03+(b-28)*.01:.07,b<31?.04+(b-28)*.01:.07);
  if(b>67)loop(U.ck,t,BAR+.02,b<76?.02:.05,b<76?.02:.05);
  // ---- story hits ----
  // the garage: starter, the engine catches and settles to an idle, the door rolls up
  if(!b){for(let k=0;k<5;k++)swp(t+.05+k*.11,.1,70+k*5,110+k*6,.2);loop(U.en,t+.6,BAR-.6,.3,.14,2.6,1)}
  if(b>0&&b<4)loop(U.en,t,BAR,.14,.14);
  if(b==1||b==2)smp(U.k,t,.7,.8,drum),smp(U.rm,t,.5,.5,rs);
  if(b==3)nz(t,BAR,90,140,2,.5,.3),nz(t,BAR,400,9000,1.5,0,.3),loop(U.en,at(8),8*Q,.1,.25,1,2.2);
  if(b==4||b==12||b==20||b==32||b==36||b==52||b==60)crash(t);
  // a sine dives into every drop
  if(b==3||b==31||b==51)swp(at(8),8*Q,220,38,.3,"sine",500);
  // each car that joins is announced by its engine and a squeal round the corner
  if(b==11||b==15||b==19||b==23)loop(U.en,at(8),BAR,.0,.16,1.6,2.4),tyre(t+BAR,1.3,.1);
  // the train overhead: two notes of horn sliding flat, wheels on the joints
  if(b==13)[311,370].map(f=>swp(at(6),2.6,f,f*.93,.035,"sawtooth",1100)),nz(at(4),3.5,150,90,1,.0,.3,"lowpass");
  if(b==27)loop(U.en,t,BAR,.12,.05,2,1);
  // the lot: whoops from the crowd, doughnuts, the hop-off answered by backfire
  [[32,0],[33,8],[36,0],[38,4],[40,8],[42,8]].map(([x,i])=>{if(b==x)swp(at(i),.45,520,880,.05,"sine",3000),swp(at(i)+.08,.5,640,1050,.04,"sine",3000)});
  if(b>31&&b<40)tyre(t,BAR,b<36?.07:.05),tyre(at(8),1,.05);
  if(b==41||b==43)[4,7,10,12,13].map(i=>pop(at(i),.5)),loop(U.en,t,BAR,.2,.2,2.4,3.2);
  if(b==43)nz(t,BAR,300,9000,1.5,0,.35);
  // the tunnel: pops off the walls, then the build to the exit
  if(b>43&&b<52&&b&1)[10,13].map(i=>{pop(at(i),.35);smp(U.k,at(i),2.3,.3,rs)});
  if(b==44)smp(U.k,t,.6,1,drum);
  if(b==50)nz(t,2*BAR,300,9000,1.5,0,.4);
  // the hill: tyres at every apex, the turbo letting go at the end of each phrase
  if(b>52&&b<74&&!(b&1))tyre(t-.3,1.5,.09);
  if(b>51&&b<68&&ph==3)smp(U.tf,at(14),1,.3,fx);
  if(b>51&&b<68&&ph==1)smp(U.tf,at(15),1.3,.16,fx);
  // the overlook: engines die one by one
  if(b==76)loop(U.en,t,2*BAR,.12,.1,1.6,1);
  if(b==78)for(let k=0;k<4;k++)loop(U.en,t+k*Q*4,.9,.12,0,1,.35);
  // doors, then hot metal ticking as it cools
  if(b==79)[2,5,9,11].map(i=>smp(U.k,at(i),1.4,.2,rs));
  if(b>78&&b<86)[1,4,6,9,11,14].map(i=>smp(U.rm,at(i)+b%3*.06,3+(i+b)%4*.5,.04,fx));
  // fireworks over the city, a long second away
  [84,85,86,86.5].map(x=>{if(x>=b&&x<b+1){const T=t+(x-b)*BAR+1.1;nz(T,1.4,300,60,.7,.5,0,"lowpass",rs);nz(T+.25,.9,5000,3500,.5,.05,0,"highpass",rs)}});
  if(b==87)crash(at(12),.08)}
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
return{live,render,plan,bufs,st,BPM,BAR,BARS,LEN}})();
