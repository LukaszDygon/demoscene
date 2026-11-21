// COWBELL GRAND PRIX soundtrack: drift phonk, 130 BPM, F minor.
// The recipe is deliberately narrow: a four-on-the-floor kick, claps on 2 and 4, open hats on the offbeats,
// one long distorted 808 per bar that pumps under the kick, and a bent, saturated 808 cowbell playing a simple hook.
// One scheduler builds the song on any context: SONG.live() plays it, SONG.render() renders it offline for the level check.
var SONG=(()=>{
const BPM=130,BAR=240/BPM,BARS=128,LEN=BARS*BAR+4,Q=BAR/16,F0=43.654,
// cowbell lines, one char per 16th: a=F4, m=F5, y=F6, "."=rest. Four bars each, over the roots F F Db Eb.
// RA is the hook, RB answers it with gaps, RC is the skeleton for the tunnel. The whole hook sits between Ab4 and Bb5:
// bar 3 restates bar 1 with a lower tail (Db, Ab) and bar 4 settles on Eb and falls to C, so nothing climbs.
RA=["m.mmp.m.k.m.h.k.","m.m.p.mmr.p.n.m.","m.mmp.m.i.m.d.i.","k.k.o.kkp.o.k.h."],
RB=["m..mp.m.k..kh.k.","m..mp.m.r.pn.m..","m..mp.m.i..id.i.","k..ko.k.h.kf.hkh"],
RC=["m.....p.m...k...","m.....p.n...m...","m.....p.m...i...","k.....o.k...h.k."],
RI=["m...p...t...p...","u...p...m...p...","r...m...i...m...","o...l...h...l..."],
K4="x...x...x...x...",KH="x.......x.......",K0="................",
CM=[[0,3,7],[-4,0,3],[5,8,12],[7,11,14]],
// item roulette: [first tick, landing] in bars
RO=[[20.25,22],[52.25,54],[67,68.5],[84.25,87]],
cut=(s,n)=>s.slice(0,n).padEnd(16,".");
// plan(b): everything that is pattern-driven in bar b. The picture reads the same plan for its kick and cowbell envelopes.
// k kick, r riff, v its level, n 1=bells instead of cowbell, oc transpose, hi add the octave above, cl claps (1: on 2 and 4, 2: on 3),
// h hats (1: offbeat eighths, 2: sixteenths with open offbeats), ba 808 level, pd pad, roll snare roll
function plan(b){
 const s=b>>3,j=b&7,i=b&3,o={k:K0,r:"",n:0,oc:0,hi:0,v:.5,root:[0,0,-4,-2][i],cl:0,h:0,ba:0,pd:0,rv:.14,dl:0,roll:0,ch:CM[i]},
 g=(k,R,cl,h,ba)=>{o.k=k;o.r=R[i];o.cl=cl;o.h=h;o.ba=ba};
 if(s==0){if(j<7)o.r=RA[i];o.rv=.3;o.ba=j<4&&!(j&1)?.4:0}
 else if(s==1)g(K4,RA,1,2,1);
 else if(s==2)g(K4,j<4?RB:RA,1,2,1);
 else if(s==3){g(K4,j<4?RA:RB,1,2,1);o.hi=1}
 else if(s==4){g(K4,RC,j>3,j>3?2:1,1);o.oc=-12;o.rv=.35;o.dl=.45;if(j==7){o.k=cut(K4,8);o.r=cut(o.r,8);o.cl=o.h=0;o.ba=.01}}
 else if(s==5){o.r=RI[i];o.n=1;o.pd=1;o.rv=.5;o.dl=.5;o.root=[0,-4,5,7][i];o.ba=.3}
 else if(s==6){g(j<4?KH:K4,RA,j>3?1:2,j>3?2:1,1);o.roll=j==6?1:j==7?2:0}
 else if(s==7){g(K4,RA,1,2,1);o.hi=1}
 else if(s==8){g(K4,j<4?RB:RA,1,2,1);o.hi=1;if(j==5){o.k=cut(K4,4);o.r=cut(o.r,6);o.cl=0;o.h=1}}
 else if(s==9){if(j)g(KH,RA,2,1,.5),o.n=1,o.rv=.45,o.dl=.4,o.pd=1;else g(K4,RA,1,2,1);o.roll=j==6?1:j==7?2:0}
 else if(s==10){g(K4,j<4?RA:RB,1,2,1);o.oc=-12;o.hi=j>3;o.roll=j==6?2:0;if(j==7)o.k=K0,o.r="",o.cl=o.h=o.ba=0}
 else if(s<14){g(K4,s==12?RB:RA,1,2,1);o.hi=1}
 else{o.pd=1;o.n=s>14;o.v=.3;o.rv=.4;o.dl=.4;if(s==14||j<4)o.r=RA[i];o.ba=s==14?.4:0}
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
 // the 808 cowbell: two squares a flat fifth apart, a sharp knock and a long ring, driven into saturation
 cb=m(1,t=>Math.tanh(1.6*(sq(P*698.46*t)+sq(P*1033.7*t))*(E(-t*38)*.7+E(-t*5.5)*.45))),
 cf=bp(cb,1150,1,1.2),
 PN=[-12,0,7,12,13,15,18,19,24,25,30,31,36];
 return BUFS[SR]={
  c:B(cf.map((x,i)=>x+cb[i]*.12)),
  // short, hard, clipped
  k:B(m(.32,t=>{ph+=P*(46+230*E(-t*40))/SR;return Math.tanh(5*S(ph)*E(-t*11))+(t<.003?rn()*.5:0)})),
  cl:B(bp(m(.4,t=>rn()*(t<.033?E(-(t%.011)*260):E(-(t-.033)*22))),1300,1.4,2.5)),
  h:B(hat(.09,70)),oh:B(hat(.45,11)),
  sn:B(m(.25,t=>rn()*E(-t*20)*.7+S(P*185*t)*E(-t*28)*.6)),
  bl:B(m(1.6,t=>S(P*698.46*t+1.6*E(-t*5)*S(P*2095.4*t))*E(-t*3.2)*.8)),
  // rubber duck: a rising squeeze, then a lower release
  sq:B(bp(m(.46,t=>{const r=t>.24,u=r?(t-.24)/.21:t/.24;ph+=P*(r?1250-420*u:1000+900*Math.min(1,u*5)-350*u)/SR;
   return Math.tanh(4*S(ph))*Math.max(0,S(3.14*Math.min(1,u)))**.5*(r?.55:1)}),2200,1.5,1.6)),
  bo:B(m(1.1,t=>{ph+=P*(95+240*(1-E(-t*7))+60*E(-t*2)*S(P*13*t))/SR;return Math.tanh(2*S(ph)+.8*S(2*ph))*E(-t*3.3)})),
  // grand piano landing: a two-fisted cluster and a thump
  pn:B(m(2.4,t=>{let s=rn()*E(-t*50)*.5;for(let n=0;n<13;n++){const f=P*174.61*2**(PN[n]/12)*t;for(let h=1;h<5;h++)s+=S(f*h*(1+.0004*h*h)+n)*E(-t*(1+h*.9))/h/7}return s})),
  nz:B(m(2,rn)),
  ir:B(m(2.2,t=>rn()*E(-t*3.2)),m(2.2,t=>rn()*E(-t*3.2)))}}
// ---- the graph ----
function setup(A,base){
 const SR=A.sampleRate,U=bufs(SR),tb=b=>Math.max(0,base+b*BAR);   // (clamped so a late start can't schedule in the past)
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g},
 O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o},
 F=(type,f,q,to)=>{const b=keep(A.createBiquadFilter());b.type=type;b.frequency.value=f;b.Q.value=q;b.connect(to);return b},
 WS=(k,to)=>{const w=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++)c[i]=Math.tanh((i/512-1)*k);w.curve=c;w.connect(to);return w};
 // master: low-pass (the radio / black-hole / build-up filter) -> soft clip -> compressor
 const comp=A.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.12;comp.connect(A.destination);
 const mf=F("lowpass",600,.5,WS(1.5,comp)),master=G(.3,mf),
 // two sidechains: the cowbell dips a little under each kick, the 808 dips almost to nothing and swells back
 duck=G(1,master),bduck=G(1,master),
 rev=A.createConvolver(),dly=A.createDelay(1),fb=G(.42,dly);
 rev.buffer=U.ir;rev.connect(G(.8,master));dly.delayTime.value=Q*3;dly.connect(fb);dly.connect(G(.7,duck));dly.connect(G(.3,rev));
 const cow=G(1.8,duck),rs=G(.14,rev),ds=G(0,dly);cow.connect(rs);cow.connect(ds);
 const dhp=F("highpass",20,.5,master),drum=G(.8,dhp),
 bv=G(.6,bduck),bassIn=WS(7,F("lowpass",1700,.5,bv)),   // bv: 808 level, set per bar after the distortion
 pad=F("lowpass",1800,.6,G(1.6,duck,rs)),
 fx=G(1,master,rs);
 // long automation, locked to bars
 const mq=mf.frequency,dq=dhp.frequency;
 mq.setValueAtTime(600,0);mq.setValueAtTime(600,tb(4));mq.exponentialRampToValueAtTime(3500,tb(7.9));mq.setValueAtTime(19000,tb(8));
 mq.setValueAtTime(19000,tb(39.5));mq.exponentialRampToValueAtTime(250,tb(40));mq.setValueAtTime(900,tb(40));mq.exponentialRampToValueAtTime(5000,tb(47.9));
 // the undercity is one long filter build back to the second drop
 mq.setValueAtTime(500,tb(48));mq.exponentialRampToValueAtTime(19000,tb(55.9));
 mq.setValueAtTime(19000,tb(120));mq.exponentialRampToValueAtTime(300,tb(128));
 dq.setValueAtTime(20,tb(73));dq.exponentialRampToValueAtTime(600,tb(73.5));dq.setValueAtTime(600,tb(78));dq.exponentialRampToValueAtTime(20,tb(80));
 master.gain.setValueAtTime(.3,tb(124));master.gain.linearRampToValueAtTime(0,tb(128.4));
 // ---- voices ----
 const smp=(buf,t,rate,g,to)=>{const s=keep(A.createBufferSource());s.buffer=buf;s.playbackRate.value=rate;s.connect(G(g,to));s.start(t);return s},
 env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+d*.8);g.gain.linearRampToValueAtTime(0,t+d)},
 // cowbell note: scooped up into pitch, the way the sample is played in phonk
 bell=(t,n,g)=>{const r=2**(n/12-1),q=smp(U.c,t,r,g,cow).playbackRate;q.setValueAtTime(r*.92,t);q.exponentialRampToValueAtTime(r,t+.035)},
 // 808: a sine with a pitch punch into heavy distortion; gl = ratio to slide to over the last fifth of the note
 bass=(t,fr,d,gl,v)=>{const o=O("sine",F0*fr,t,t+d+.06),g=G(0,bassIn),q=o.frequency;o.connect(g);
  q.setValueAtTime(F0*fr*2.5,t);q.exponentialRampToValueAtTime(F0*fr,t+.05);
  q.setValueAtTime(F0*fr,t+d*.8);q.exponentialRampToValueAtTime(F0*fr*gl,t+d);env(g,t,.006,d+.04,v)},
 // noise through a swept filter: risers, crashes, whooshes, thunder, tyres
 nz=(t,d,f0,f1,q,g0,g1,type="bandpass",to=fx)=>{const s=keep(A.createBufferSource()),g=G(0,to),f=F(type,f0,q,g);s.buffer=U.nz;s.loop=true;s.connect(f);s.start(t);s.stop(t+d);
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(g0,t);g.gain.linearRampToValueAtTime(g1,t+d)},
 crash=(t,g=.35)=>nz(t,2.2,7000,5000,.4,g,0,"highpass"),
 // swept oscillator: engine revs, the tape-stop dive, the magnet charge, the falling-piano whistle (as sine)
 swp=(t,d,f0,f1,g,type="sawtooth",lp=900)=>{const o=O(type,f0,t,t+d),gn=G(0,F("lowpass",lp,1,fx));o.connect(gn);o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(gn,t,.02,d,g)},
 beep=(t,f,d)=>{const o=O("square",f,t,t+d),g=G(0,F("lowpass",f*3,1,fx));o.connect(g);env(g,t,.005,d,.16)},
 gliss=(t,a,s,n=8,g=.18)=>{for(let k=0;k<n;k++)smp(U.bl,t+k*.03,2**(a+k*s),g,cow)},
 ding=t=>[12,15,19,24].map((n,k)=>smp(U.bl,t+k*.05,2**(n/12),.3,cow));
 function bar(b,t){
  const p=plan(b),fr=2**(p.root/12),at=i=>t+i*Q;
  rs.gain.setValueAtTime(p.rv,t);ds.gain.setValueAtTime(p.dl,t);
  for(let i=0;i<16;i++){const T=at(i);
   if(p.k[i]=="x"){smp(U.k,T,1,1,drum);
    duck.gain.setValueAtTime(.5,T);duck.gain.linearRampToValueAtTime(1,T+.18);
    bduck.gain.setValueAtTime(.12,T);bduck.gain.linearRampToValueAtTime(1,T+.24)}
   const c=p.r.charCodeAt(i)-97+p.oc;
   if(c>-13)p.n?smp(U.bl,T,2**(c/12-1),.3,cow):(bell(T,c,p.v),p.hi&&bell(T,c+12,.2),
    // cowbell roll into the next phrase
    p.h==2&&(b&3)==3&&i>11&&bell(T+Q/2,c,.2+i*.012));
   if(p.h==1&&i%4==2)smp(U.h,T,1,.25,drum);
   if(p.h==2){i%4==2?smp(U.oh,T,1,.3,drum):smp(U.h,T,1,i&1?.09:.2,drum);
    // hat rolls: 32nds at the end of a phrase, a triplet flick on odd bars
    if((b&3)==3&&i>11)smp(U.h,T+Q/2,1+(i-11)*.07,.2,drum);
    if(b&1&&(b&3)<3&&i>13)for(let k=1;k<3;k++)smp(U.h,T+k*Q/3,1.2+k*.1,.15,drum)}
   if(p.cl==1&&i%8==4||p.cl==2&&i==8)smp(U.cl,T,1,.8,drum),smp(U.sn,T,1,.3,drum),smp(U.cl,T,1,.2,rs);
   if(p.roll==1&&!(i&1))smp(U.sn,T,1,.25+i*.02,drum);
   if(p.roll==2){smp(U.sn,T,1+i*.02,.3+i*.025,drum);if(i>7)smp(U.sn,T+Q/2,1+i*.02,.3+i*.025,drum)}}
  // one 808 per bar, sliding into the next bar's root
  if(p.ba)bv.gain.setValueAtTime(.6*p.ba,t),bass(t,fr,BAR,2**(plan(b+1).root/12)/fr,1);
  if(p.pd)p.ch.map(n=>[-8,8].map(c=>{const o=O("sawtooth",87.31*2**(n/12),t,t+BAR+.3),g=G(0,pad);o.detune.value=c;o.connect(g);env(g,t,.25,BAR+.25,.12)}));
  // tom fill out of every eighth bar, a reverse swell into every fourth
  if((b&7)==7&&p.cl==1)[10,12,13,14].map((i,k)=>smp(U.k,at(i),1.9-k*.25,.5,drum));
  if((b&3)==3&&p.cl==1)nz(at(8),8*Q,5000,9000,.6,0,.2,"highpass");
  // beds: crackle on the grid and through the black hole, rain in the undercity and the storm, a rising whine under rocket and magnet
  if(b<8||b>39&&b<48)nz(t,BAR+.05,3000,3000,.3,.04,.04);
  if(b>47&&b<56||b>79&&b<87)nz(t,BAR+.05,6000,6000,.4,.06,.06,"highpass");
  if(b>23&&b<28||b>55&&b<61)swp(t,BAR,300*1.12**(b%8),336*1.12**(b%8),.045,"sawtooth",2500);
  // item roulette: the cowbell ticks up a minor arpeggio, the last one slows to a stop
  RO.map(([a,z],ri)=>{for(let k=0;k<32;k++){const x=b+k/32;if(x>=a&&x<z&&!(ri==3&&k%(x<85.5?1:x<86.25?2:x<86.75?4:8)))smp(U.c,t+k*Q/2,2**([12,15,19,24][k&3]/12),.11,cow)}
   if(z>=b&&z<b+1)ding(t+(z-b)*BAR)});
  // ---- story hits ----
  if(b<7)swp(at(8),.5,48,70+b*8,.12+b*.02);
  if(b>3&&b<7)beep(t,440,.3);
  if(b==7)swp(t,BAR,50,230,.3),nz(t,BAR,300,8000,1.5,0,.35);
  if(b==8)beep(t,880,.7),nz(t,BAR,2600,3300,12,.3,0);
  if(b==8||b==16||b==24||b==32||b==56||b==64||b==88||b==96||b==104||b==112)crash(t);
  if(b==28)gliss(t,0,.25);
  if(b==36)nz(t,BAR,2500,150,2,.3,0);
  if(b==38)nz(t,1.5*BAR,300,9000,1.5,0,.45);
  if(b==39)swp(at(8),8*Q,349,30,.35,"sawtooth",1500);
  if(b==40)smp(U.k,t,.5,1,drum),crash(t,.3);
  if(b==45)smp(U.sq,t,2,.15,rs);
  if(b==47)nz(t,BAR,8000,9500,.5,0,.4,"highpass");
  if(b==48)smp(U.k,t,.7,1,drum),nz(t,1,900,2500,.8,.5,0);
  if(b==54)nz(t,2*BAR,300,9000,1.5,0,.45);
  if(b==55)swp(at(8),8*Q,87,1400,.2,"sawtooth",4000);
  if(b==62)nz(t,BAR,300,4000,1,0,.3);
  if(b==64)smp(U.bo,at(8),1.5,.3,fx);
  if(b==66)smp(U.bo,t,1,.8,fx);
  // tyres: the hero spun by the glove, the gold car under the piano, the victory doughnuts
  if(b==66||b==70||b==106||b==107)nz(at(2),1.4,2600,3400,12,.2,0);
  if(b==69)swp(at(4),12*Q,2600,500,.14,"sine",8000);
  if(b==70)smp(U.pn,t,1,1,fx),crash(t,.3);
  if(b==72)gliss(at(8),2,-.2,10),nz(at(8),1,6000,400,3,.3,0);
  if(b==78)nz(t,2*BAR,300,9000,1.5,0,.45);
  if(b==80)for(let k=0;k<12;k++)smp(U.bl,t+k*.017,3+k%5*.31,.14,cow);
  if(b==80||b==84)nz(t,3,400,50,.7,1.1,0,"lowpass");
  if(b==86)nz(t,BAR,300,9000,1.5,0,.45);
  if(b==87)ding(t),smp(U.sq,at(8),1.25,.45,fx);
  if(b==88||b==100||b==104)smp(U.k,t,.6,1,drum);
  if(b>96&&b<100)smp(U.sq,t,1.45-(b-97)*.2,.6,fx);
  if(b==100)smp(U.sq,t,.6,1,fx),crash(t);
  // the crowd at the line, fireworks popping over the coda
  if(b>103&&b<108)nz(t,BAR+.05,1100,1500,.7,.2,.2);
  if(b>104&&b<122)smp(U.k,at(3+b%5*2),2.6,.5,rs),smp(U.cl,at(4+b%5*2),2,.25,rs);
  if(b==120)ding(t);
  if(b==124)bell(t,12,.6),smp(U.sq,at(8),.75,.6,fx)}
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
return{live,render,plan,bufs,BPM,BAR,BARS,LEN,RO}})();
