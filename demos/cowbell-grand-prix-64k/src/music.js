// COWBELL GRAND PRIX soundtrack: drift phonk, 144 BPM, F Phrygian that resolves to F major (bVI-bVII-I) for the finale.
// One scheduler builds the song on any context: SONG.live() plays it, SONG.render() renders it offline for the level check.
var SONG=(()=>{
const BPM=144,BAR=240/BPM,BARS=128,LEN=BARS*BAR+4,Q=BAR/16,F0=43.654,
// cowbell riffs, one char per 16th: a=F4, m=F5, y=F6, "."=rest. Four bars each, over the roots F F Db Gb.
RA=["m.mkm.pm.km.h.km","m.mkm.pm.nm.ihi.","p.pmp.up.mp.i.mp","n.nmn.rnm.k.ihkl"],
R2=["m.mkm.pm.ym.t.km","m.mkm.pm.nm.ywut","p.pmp.up.wp.u.mp","n.nmn.rnykm.ihkl"],
RB=["a.m.a.mka.m.h.km","a.m.a.mkd.p.d.pn","d.p.d.pmd.p.i.mp","b.n.b.nmb.n.f.kl"],
RC=["mmkmpmkm.mkmhkmk","mmkmpmkm.nmkihki","ppmpupmp.pmpimpm","nnmnrnmn.rnmkihl"],
R5=["mmkmpmkmymkmtkmk","mpkmpmkm.nmkihki","pumpupmpwpmpimpm","nnmnrnmnyrnmkihl"],
R6=["aa.ab.aam.ab.a.b","ah.ab.aah.ai.m.d","dd.df.ddp.df.d.f","bb.ba.bbn.bd.bal"],
RD=["a..a..b.a...d.b.","a..a..b.a..i..h.","d..d..f.d...i.f.","b..b..a.b..f.dba"],
R4=["a..a..b.a.m.d.b.","a..a..b.a..i.mh.","d..d..f.d.p.i.f.","b..b..a.b.nf.dba"],
RS=["aa.ab.aad.ab.a.b","aa.ab.aah.ai.h.d","dd.df.ddi.df.d.f","bb.ba.bbf.bd.b.a"],
RE=["i.mpu.pm.ipm.p.u","k.orw.ro.kro.r.w","m.qty.tq.mqt.y.t","y.ywt.tq.rtq.omo"],
R3=["ryvr.yvr.yv.ryv.","toxt.oxt.ox.tox.","qvyq.vyq.vy.qvy.","y.ywt.tq.rtq.omo"],
RI=["m...p...t...p...","u...p...m...p...","r...m...i...m...","o...l...h...l..."],
K1="x..x..x...x.x...",K2="x..x..x.x..x..x.",KD="x...x...x...x...",KH="x.........x.x...",K0="................",
CM=[[0,3,7],[-4,0,3],[5,8,12],[7,11,14]],CJ=[[-4,0,3],[-2,2,5],[0,4,7],[0,4,7]],C3=[[5,9,12],[7,11,14],[-3,0,4],[0,4,7]],
// item roulette: [first tick, landing] in bars
RO=[[20.25,22],[52.25,54],[67,68.5],[84.25,87]],
cut=(s,n)=>s.slice(0,n).padEnd(16,".");
// plan(b): everything that is pattern-driven in bar b. The picture reads the same plan for its kick and cowbell envelopes.
function plan(b){
 const s=b>>3,j=b&7,i=b&3,o={k:K0,r:"",n:0,root:[0,0,-4,1][i],cl:0,h:0,ld:0,pd:0,vx:0,rv:.12,dl:0,sub:0,roll:0,st:0,ch:CM[i]},
 g=(k,R,cl,h)=>{o.k=k;o.r=R[i];o.cl=cl;o.h=h};
 if(s==0){if(j<7)o.r=RA[i];o.rv=.3;o.sub=j<4&&!(j&1)}
 else if(s==1)g(b&1?K2:K1,RA,1,1),o.st=1;
 else if(s==2){g(b&1?K2:K1,R2,1,2);o.vx=o.st=1}
 else if(s==3){if(j<4){g(K2,RC,1,2);o.ld=o.st=1}else{g(KD,RB,1,3);o.vx=1}}
 else if(s==4){g(K1,j<4?RD:R4,1,1);o.rv=.35;o.dl=.45;o.vx=j&1;if(j==7){o.k=cut(K1,8);o.r=cut(o.r,8);o.cl=0;o.h=0}}
 else if(s==5){o.r=RI[i];o.n=1;o.pd=1;o.rv=.5;o.dl=.5;o.root=[0,-4,5,7][i];o.cl=j>1?2:0;o.sub=1}
 else if(s==6){g(KH,RA,2,j>3?1:0);o.rv=.3;o.dl=.3;o.roll=j==6?1:j==7?2:0;if(j==7){o.k="x...x...x.x.x.xx";o.cl=0}}
 else if(s==7){g(b&1?K1:K2,j<4?RC:R5,1,2);o.ld=o.st=1;o.vx=j>3}
 else if(s==8){g(b&1?K2:K1,j<4?RA:R2,1,2);o.vx=o.st=1;if(j==5){o.k=cut(K1,4);o.r=cut(o.r,6);o.cl=0;o.h=1}}
 else if(s==9){if(j)g(KH,RA,0,0),o.n=1,o.rv=.45,o.dl=.4,o.pd=1;else g(K1,RA,1,2);o.roll=j==6?1:j==7?2:0}
 else if(s==10){g(K2,j<4?RS:R6,1,2);o.ld=o.st=1;o.vx=j&1;o.roll=j==6?2:0;if(j==7)o.k=K0,o.r="",o.cl=o.h=o.ld=o.vx=o.st=0}
 else if(s<14){g(s==13&&j>3?KH:K2,s==12?R3:RE,s==13&&j>3?2:1,2);o.ld=1;o.pd=1;o.st=2;o.ch=(s==12?C3:CJ)[i];o.root=(s==12?[5,7,-3,0]:[-4,-2,0,0])[i];o.rv=.2}
 else{o.pd=s==14||j<4;o.ch=CJ[i];o.root=[-4,-2,0,0][i];o.n=1;o.rv=.5;o.dl=.4;if(s==14||j<2)o.r=RE[i];o.sub=s==14}
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
 add=(a,b)=>a.map((x,i)=>x+b[i]),
 B=(...c)=>{const b=new AudioBuffer({length:c[0].length,sampleRate:SR,numberOfChannels:c.length});c.forEach((a,i)=>b.copyToChannel(a,i));return b},
 sq=x=>S(x)>0?1:-1,
 hat=(d,k)=>m(d,t=>{const x=rn(),y=x-px;px=x;return(y*.5+(sq(P*5417*t)+sq(P*7311*t)+sq(P*8933*t))*.12)*E(-t*k)}),
 vox=(f1,f2)=>{const a=m(.4,t=>{ph+=174.61*(1+.35*E(-t*25))/SR;return(ph%1*2-1)*(t<.01?t*100:E(-(t-.01)*7))});
  return B(add(add(bp(a,f1,9,3),bp(a,f2,10,2)),bp(a,2700,8,.8)))},
 stab=q=>B(bp(m(.5,t=>{let s=0;for(const n of[0,q,7,12,19])for(const d of[.996,1.004])s+=(174.61*2**(n/12)*d*t%1)-.5;return s*E(-t*8)}),1400,.6,1.2).map(x=>Math.tanh(x*2.5))),
 cb=m(.7,t=>(sq(P*698.46*t)+sq(P*1033.7*t))*(E(-t*45)*.6+E(-t*8)*.4)),
 PN=[-12,0,7,12,13,15,18,19,24,25,30,31,36];
 return BUFS[SR]={
  c:B(add(bp(cb,900,.8,.8),cb.map(x=>x*.1))),
  k:B(m(.45,t=>{ph+=P*(42+190*E(-t*30))/SR;return Math.tanh(3.2*S(ph)*E(-t*6.5))+(t<.004?rn()*.4:0)})),
  cl:B(bp(m(.4,t=>rn()*(t<.033?E(-(t%.011)*260):E(-(t-.033)*22))),1300,1.4,2.5)),
  h:B(hat(.09,70)),oh:B(hat(.45,11)),
  sn:B(m(.25,t=>rn()*E(-t*20)*.7+S(P*185*t)*E(-t*28)*.6)),
  bl:B(m(1.6,t=>S(P*698.46*t+2.5*E(-t*5)*S(P*2451.6*t))*E(-t*3.2)*.8)),
  // rubber duck: a rising squeeze, then a lower release
  sq:B(bp(m(.46,t=>{const r=t>.24,u=r?(t-.24)/.21:t/.24;ph+=P*(r?1250-420*u:1000+900*Math.min(1,u*5)-350*u)/SR;
   return Math.tanh(4*S(ph))*Math.max(0,S(3.14*Math.min(1,u)))**.5*(r?.55:1)}),2200,1.5,1.6)),
  bo:B(m(1.1,t=>{ph+=P*(95+240*(1-E(-t*7))+60*E(-t*2)*S(P*13*t))/SR;return Math.tanh(2*S(ph)+.8*S(2*ph))*E(-t*3.3)})),
  // grand piano landing: a two-fisted cluster and a thump
  pn:B(m(2.4,t=>{let s=rn()*E(-t*50)*.5;for(let n=0;n<13;n++){const f=P*174.61*2**(PN[n]/12)*t;for(let h=1;h<5;h++)s+=S(f*h*(1+.0004*h*h)+n)*E(-t*(1+h*.9))/h/7}return s})),
  va:vox(750,1150),vo:vox(450,820),s1:stab(3),s2:stab(4),
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
 // master: low-pass (the radio / black-hole filter) -> soft clip -> compressor
 const comp=A.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=5;comp.attack.value=.004;comp.release.value=.12;comp.connect(A.destination);
 const mf=F("lowpass",600,.5,WS(1.6,comp)),master=G(.4,mf),
 duck=G(1,master),
 rev=A.createConvolver(),dly=A.createDelay(1),fb=G(.42,dly);
 rev.buffer=U.ir;rev.connect(G(.8,master));dly.delayTime.value=Q*3;dly.connect(fb);dly.connect(G(.7,duck));dly.connect(G(.3,rev));
 const cow=G(2.2,duck),rs=G(.12,rev),ds=G(0,dly);cow.connect(rs);cow.connect(ds);
 const dhp=F("highpass",20,.5,master),drum=G(.75,dhp),
 bassIn=WS(4,F("lowpass",1300,.5,G(.5,master))),
 pad=F("lowpass",2600,.6,G(1.8,duck,rs)),
 lead=F("lowpass",3200,1.5,G(1.8,duck,rs)),
 fx=G(1,master,rs);
 // long automation, locked to bars
 const mq=mf.frequency;mq.setValueAtTime(600,0);mq.setValueAtTime(600,tb(4));mq.exponentialRampToValueAtTime(3500,tb(7.9));mq.setValueAtTime(19000,tb(8));
 mq.setValueAtTime(19000,tb(39.5));mq.exponentialRampToValueAtTime(250,tb(40));mq.setValueAtTime(900,tb(40));mq.exponentialRampToValueAtTime(6000,tb(47.6));mq.setValueAtTime(19000,tb(48));
 const dq=dhp.frequency;dq.setValueAtTime(20,tb(73));dq.exponentialRampToValueAtTime(600,tb(73.5));dq.setValueAtTime(600,tb(78));dq.exponentialRampToValueAtTime(20,tb(80));
 master.gain.setValueAtTime(.4,tb(122));master.gain.linearRampToValueAtTime(0,tb(128.4));
 // ---- voices ----
 const smp=(buf,t,rate,g,to)=>{const s=keep(A.createBufferSource());s.buffer=buf;s.playbackRate.value=rate;s.connect(G(g,to));s.start(t);return s},
 env=(g,t,a,d,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+d*.6);g.gain.linearRampToValueAtTime(0,t+d)},
 // 808: sine with a pitch punch into the shared distortion; gl = slide up an octave over the second half
 bass=(t,fr,d,gl,v=1)=>{const o=O("sine",F0*fr,t,t+d+.06),g=G(0,bassIn),q=o.frequency;o.connect(g);
  q.setValueAtTime(F0*fr*2.5,t);q.exponentialRampToValueAtTime(F0*fr,t+.05);
  if(gl){q.setValueAtTime(F0*fr,t+d*.5);q.exponentialRampToValueAtTime(F0*fr*(gl>1?.5:2),t+d)}env(g,t,.006,d+.04,v)},
 // noise through a swept filter: risers, crashes, whooshes, thunder, tyres
 nz=(t,d,f0,f1,q,g0,g1,type="bandpass",to=fx)=>{const s=keep(A.createBufferSource()),g=G(0,to),f=F(type,f0,q,g);s.buffer=U.nz;s.loop=true;s.connect(f);s.start(t);s.stop(t+d);
  f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(g0,t);g.gain.linearRampToValueAtTime(g1,t+d)},
 crash=(t,g=.4)=>nz(t,2.2,7000,5000,.4,g,0,"highpass"),
 // saw: engine revs, the tape-stop dive, the magnet charge, the falling-piano whistle (as sine)
 swp=(t,d,f0,f1,g,type="sawtooth",lp=900)=>{const o=O(type,f0,t,t+d),gn=G(0,F("lowpass",lp,1,fx));o.connect(gn);o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(gn,t,.02,d,g)},
 beep=(t,f,d)=>{const o=O("square",f,t,t+d),g=G(0,F("lowpass",f*3,1,fx));o.connect(g);env(g,t,.005,d,.16)},
 gliss=(t,a,s,n=8,g=.18)=>{for(let k=0;k<n;k++)smp(U.bl,t+k*.03,2**(a+k*s),g,cow)},
 ding=t=>[12,16,19,24].map((n,k)=>smp(U.bl,t+k*.05,2**(n/12),.3,cow));
 function bar(b,t){
  const p=plan(b),fr=2**(p.root/12),at=i=>t+i*Q,s=b>>3,j=b&7;
  rs.gain.setValueAtTime(p.rv,t);ds.gain.setValueAtTime(p.dl,t);
  for(let i=0;i<16;i++){const T=at(i);
   if(p.k[i]=="x"){smp(U.k,T,1,1,drum);duck.gain.setValueAtTime(.4,T);duck.gain.linearRampToValueAtTime(1,T+.2);
    let n=1;while(i+n<16&&p.k[i+n]!="x")n++;bass(T,fr*(p.k==K2&&i==11?2:1),n*Q,(b&3)==3&&i+n>15?1+((b&7)>6):0,p.n?.5:1)}
   const c=p.r.charCodeAt(i)-97;
   if(c>=0){smp(p.n?U.bl:U.c,T,2**(c/12-1),p.n?.3:.5,cow);
    // cowbell roll into the next phrase, and a glassy fifth above in the back half of a section
    if(p.h==2&&(b&3)==3&&i>11)smp(U.c,T+Q/2,2**(c/12-1),.2+i*.012,cow);
    if(p.ld&&b&4&&!(i&1))smp(U.bl,T,2**((c+7)/12-1),.1,cow);
    if(p.ld){const f=174.61*2**(c/12),g=G(0,lead);O("sawtooth",f,T,T+Q).connect(g);O("square",f*1.006,T,T+Q).connect(g);env(g,T,.004,Q*.95,.11)}}
   if(p.h==1&&!(i&1))smp(U.h,T,1,i%4==2?.3:.16,drum);
   if(p.h==2){smp(U.h,T,1,[.3,.1,.2,.1][i&3],drum);if((b&3)==3&&i>11)smp(U.h,T+Q/2,1+(i-11)*.07,.2,drum);if(b&1&&i==14)smp(U.oh,T,1,.25,drum)}
   if(p.h==2&&b&1&&(b&3)<3&&i>13)for(let k=1;k<3;k++)smp(U.h,T+k*Q/3,1.2+k*.1,.16,drum);
   if(p.h==3)i%4==2?smp(U.oh,T,1,.3,drum):smp(U.h,T,1,i&3?.07:.2,drum);
   if(p.cl==1&&i%8==4||p.cl==2&&i==8)smp(U.cl,T,1,.75,drum),smp(U.cl,T,1,.2,rs);
   if(p.roll==1&&!(i&1))smp(U.sn,T,1,.25+i*.02,drum);
   if(p.roll==2){smp(U.sn,T,1+i*.02,.3+i*.025,drum);if(i>7)smp(U.sn,T+Q/2,1+i*.02,.3+i*.025,drum)}
   if(p.vx&&(b&1?i==6||i==9||i==14:i==11||i==14))smp(i&1?U.vo:U.va,T,2**([0,3,-2][i%3]/12),.3,cow)}
  if(p.sub)bass(t,fr,BAR,0,.28);
  // phonk stab on the one and the push; tom fill out of every eighth bar; sparkle over the finale
  if(p.st)[0,6].map(i=>smp(p.st>1?U.s2:U.s1,at(i),fr,.3,cow));
  if(p.st&&!(b&3))smp(U.bl,t,fr/4,.3,cow);   // a deep bell tolls on the first bar of each phrase
  if(p.st>1&&(b&3)==3)[12,16,19,24,28,31].map((n,k)=>smp(U.c,at(13)+k*Q/2,2**(n/12-1),.3,cow));
  if((b&7)==7&&p.cl==1)[10,12,13,14].map((i,k)=>smp(U.k,at(i),1.9-k*.25,.55,drum));
  if((b&3)==3&&p.cl==1)nz(at(8),8*Q,5000,9000,.6,0,.22,"highpass"),smp(U.sn,at(11),1.3,.3,drum);
  if(b>95&&b<112)for(let i=0;i<16;i++)smp(U.bl,at(i),2**((p.ch[i%3]+(i&4?12:0))/12),.06,cow);
  // beds: crackle on the grid, rain in the undercity and the storm, a rising whine under nitro and magnet
  if(b<8)nz(t,BAR+.05,3000,3000,.3,.035,.035);
  if(b>47&&b<56||b>79&&b<87)nz(t,BAR+.05,6000,6000,.4,.06,.06,"highpass");
  if(b>23&&b<28||b>55&&b<61)swp(t,BAR,300*1.12**(b%8),336*1.12**(b%8),.045,"sawtooth",2500);
  // ghost rim sixteenths in the second drop and the finale; a siren over the storm; the crowd at the line; swells in the black hole
  if(s==7||s>10&&s<13)for(let i=1;i<16;i+=2)smp(U.cl,at(i),3,.05+(i&2)*.02,drum);
  if(s==10&&j<6)swp(t,BAR,b&1?620:440,b&1?440:620,.05,"sawtooth",1800);
  if(b>103&&b<108)nz(t,BAR+.05,1100,1500,.7,.2,.2);
  if(s==5&&j&1)nz(t,BAR,500,3000,1,0,.12);
  if(p.pd)p.ch.map(n=>[-8,8].map(c=>{const o=O("sawtooth",174.61*2**(n/12),t,t+BAR+.3),g=G(0,pad);o.detune.value=c;o.connect(g);env(g,t,.25,BAR+.25,.1)}));
  // item roulette: the cowbell ticks through an arpeggio, the last one slows to a stop
  RO.map(([a,z],ri)=>{for(let k=0;k<32;k++){const x=b+k/32;if(x>=a&&x<z&&!(ri==3&&k%(x<85.5?1:x<86.25?2:x<86.75?4:8)))smp(U.c,t+k*Q/2,2**([12,16,19,24][k&3]/12),.11,cow)}
   if(z>=b&&z<b+1)ding(t+(z-b)*BAR)});
  // ---- story hits ----
  if(b<7)swp(at(8),.5,48,70+b*8,.12+b*.02);
  if(b>3&&b<7)beep(t,440,.3);
  if(b==7)swp(t,BAR,50,230,.3),nz(t,BAR,300,8000,1.5,0,.35);
  if(b==8)beep(t,880,.7),crash(t),nz(t,BAR,2600,3300,12,.3,0);
  if(b>23&&b<28)nz(t,BAR,500+(b-24)*300,900+(b-24)*300,1,.16,.16);
  if(b==16||b==24||b==32||b==56||b==64||b==88||b==96||b==112)crash(t);
  // a far-off squeak inside the black hole; fireworks popping over the coda
  if(b==45)smp(U.sq,t,2,.15,rs);
  // tyres: the hero spun by the glove, the gold car under the piano, the victory doughnuts
  if(b==66||b==70||b==106||b==107)nz(at(2),1.4,2600,3400,12,.2,0);
  if(b>104&&b<122)smp(U.k,at(3+b%5*2),2.6,.5,rs),smp(U.cl,at(4+b%5*2),2,.25,rs);
  if(b==28)crash(t,.3),gliss(t,0,.25);
  if(b==36)nz(t,BAR,2500,150,2,.3,0);
  if(b==38)nz(t,1.5*BAR,300,9000,1.5,0,.45);
  if(b==39)swp(at(8),.83,349,30,.35,"sawtooth",1500);
  if(b==40)smp(U.k,t,.5,1,drum),crash(t,.3);
  if(b==47)nz(t,BAR,8000,9500,.5,0,.4,"highpass");
  if(b==48)smp(U.k,t,.7,1,drum),crash(t),nz(t,1,900,2500,.8,.5,0);
  if(b==54)nz(t,2*BAR,300,9000,1.5,0,.45);
  if(b==55)swp(at(8),8*Q,87,1400,.2,"sawtooth",4000);
  if(b==62)nz(t,BAR,300,4000,1,0,.3);
  if(b==64)smp(U.bo,at(8),1.5,.3,fx);
  if(b==66)smp(U.bo,t,1,.8,fx),crash(t);
  if(b==69)swp(at(4),12*Q,2600,500,.14,"sine",8000);
  if(b==70)smp(U.pn,t,1,1,fx),crash(t,.3);
  if(b==72)gliss(at(8),2,-.2,10),nz(at(8),1,6000,400,3,.3,0);
  if(b==78)nz(t,2*BAR,300,9000,1.5,0,.45);
  if(b==80){crash(t);for(let k=0;k<12;k++)smp(U.bl,t+k*.017,3+k%5*.31,.14,cow)}
  if(b==80||b==84)nz(t,3,400,50,.7,1.1,0,"lowpass");
  if(b==86)nz(t,BAR,300,9000,1.5,0,.45);
  if(b==87)smp(U.sq,at(8),1.25,.45,fx);
  if(b==88||b==100||b==104)smp(U.k,t,.6,1,drum);
  if(b==96)nz(t,BAR,400,5000,1,0,.3);
  if(b>96&&b<100)smp(U.sq,t,1.45-(b-97)*.2,.6,fx);
  if(b==100)smp(U.sq,t,.6,1,fx),crash(t);
  if(b==104)crash(t),gliss(t,0,.167,13,.2),nz(at(8),2,2600,3400,12,.2,0);
  if(b==120)ding(t),bass(t,1,BAR*2,0,.5);
  if(b==124)smp(U.c,t,1,.6,cow),smp(U.sq,at(8),.75,.6,fx)}
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
