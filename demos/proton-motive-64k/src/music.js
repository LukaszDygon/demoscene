// PROTON MOTIVE soundtrack: hard warehouse techno, 134 BPM, F minor, 120 bars.
// The arrangement is the proton gradient: pressure builds from bar 40 to 72, breaks down at maximum pressure,
// and the drop at bar 80 is the moment the ATP synthase rotor engages: a ratchet click on every 16th is one
// c-ring step (30 degrees), a bell on every beat is one catalytic site releasing ATP (3 sites = 3 bell pitches,
// a 3-against-4 cycle). Every drum, the bass, the stabs, bells, risers, pads and both reverb impulses are
// synthesized sample by sample in prep(); the scheduler only plays buffers and automates long-lived buses.
// SONG.ev(bar) is the single source of truth for every hit; the visuals read it too.
var SONG=(()=>{
const BPM=134,BAR=240/BPM,ST=BAR/16,BARS=120,LEN=BARS*BAR+8,M=Math,PI=M.PI,TAU=2*PI,ex=M.exp,sn=M.sin,th=M.tanh,
rn=()=>M.random()*2-1,hs=x=>(x=sn(x*127.1+311.7)*43758.5453)-M.floor(x),
// sections: 0 intake, 1 glycolysis, 2 membrane, 3 cristae, 4 relay, 5 gradient, 6 breakdown, 7 turbine, 8 flood, 9 coda
SEC=[0,8,16,24,40,56,72,80,104,112,120,1e9],sec=b=>{let s=0;while(b>=SEC[s+1])s++;return s},
GR=s=>s>0&&s<6||s==7||s==8,eu=(k,i)=>i*k%16<k,hz=m=>440*2**((m-69)/12),
// electron hops through the respiratory chain, in 16ths: 7 FeS clusters of complex I, Q, complex III, cyt c, complex IV
HOPS=[0,1,2,3,4,5,6,8,10,12,14];
// events: [16th, type, velocity, param]. types: 0 kick 1 hat 2 open hat 3 clap 4 ride 5 metal 6 snare 7 ratchet
// 8 bell 9 zap 10 bass 11 stab 12 crash 13 reverse swell 14 tom 15 shaker 16 sub drop
function ev(b){const s=sec(b),E=[],P=(t,y,v=1,p=0)=>E.push([t,y,v,p]),end=b+1==SEC[s+1],g=GR(s),fill=g&&(end||b%8==7)&&b!=71;
 if(s==0&&b>3||g)for(let i=0;i<16;i+=4)if(!(fill&&end&&i==12)&&!(b==71&&i>4))P(i,0,s?1:.55);
 if(s==6&&b<76)P(0,0,.42),P(3,0,.22);
 if(b==116)P(0,0,1.15);
 if(g&&s)for(let i=0;i<16;i++){const off=i%4==2,r=hs(b*16+i);
  if(s==1){off&&P(i,1,.6)}
  else if(off)P(i,s>2?2:1,s>2?.55:.75);
  else if(i%4||s>2)P(i,1,(s>2?.22:.14)+.2*r+(i%2?0:.12))}
 if(g&&s>1)for(const i of[4,12])if(!(b==71&&i>4))P(i,3,1);
 if(s==4||s==5||s==7||s==8)for(let i=0;i<16;i+=2)P(i,4,i%4?.5:.32);
 if(s>2&&g){const k=s==3?5:s<6?7:5,r=(s==3?3:s<6?1:2)+(b>>2)%3*2;for(let i=0;i<16;i++)eu(k,(i+r)%16)&&i%4&&P(i,5,.35+.35*hs(b+i*.37),hs(i*3.1+s)*4|0)}
 if(s==0&&b%2)P(8,5,.45,-1);
 if(s==6&&b<79)P(8,5,.3,-1);
 if(b==79)P(12,5,1,-2);
 if(fill){const n=end?8:4;for(let i=16-n;i<16;i++)P(i,6,.35+.65*(i-16+n)/n,(i-16+n)/n)}
 if(b>=64&&b<72){const d=b<66?4:b<68?2:b<70?1:.5;for(let i=0;i<16;i+=d)P(i,6,.3+.65*((b-64)*16+i)/128,(b-64)/8+i/128)}
 if(s==7||s==8)for(let i=0;i<16;i++)P(i,7,i%4?.45:.85,i%4);
 if(s==7||s==8)for(let i=0;i<16;i+=4)P(i,8,.75,(b*4+i/4)%3);
 if(s==9&&b<119){P(0,8,.7-.07*(b-112),b*4%3);P(10,8,.3,(b*4+2)%3)}
 // the three catalytic-site pitches, heard alone before the rotor turns
 if(s==0&&b%2||s==6&&b<79)P(0,8,s?.55:.35,b%3);
 // phosphorylation: ATP spent twice in glycolysis
 if(b==9||b==11)P(0,9,.8,0),P(1,9,.5,3);
 if(b%16==15&&g&&s>2)for(let i=12;i<16;i++)P(i+.5,11,.25+.1*(i-12),1);
 if(s==4||s==5)HOPS.forEach((i,k)=>P(i,9,s==4?.6:.35,k));
 const bp=s==1?b>9?[2]:[]:s==2?[2,3]:g?[1,2,3]:[];
 for(let i=0;i<16;i+=4)if(!(b==71&&i>4))bp.forEach(j=>P(i+j,10,[.55,1,.75][j-1],s<3?0:s<5?1:s==5?b<64?2:3:3));
 // the flood gallops: an extra 32nd before beats two and four
 if(s==8)for(const i of[7.5,15.5])P(i,10,.6,3);
 if((s==7||s==8)&&b%2)P(15,3,.35);
 const sp=s==3?b%2?[6]:[3,10]:s==4||s==7?b%2?[6,14]:[3,10]:s==5?b%2?[6,14]:[3,7,10]:s==8?[3,6,10,14]:[];
 sp.forEach(i=>P(i,11,.6,b>=48&&!(s==5&&b<64)?1:0));
 [8,12,16,24,40,56,80,88,96,104,112,116].includes(b)&&P(0,12,b==80?1:.7);
 [7,11,15,23,39,55,79,103,111].includes(b)&&P(0,13,.8);
 if(s==5&&b>=60||s==7||s==8)for(const i of[7,15])P(i,14,.45,s==5?(b-60)/12:0);
 if(s==4||s==5||s==7||s==8)for(let i=0;i<16;i++)P(i,15,(i%2?.55:.3)*(.7+.3*hs(b*7+i)));
 [12,24,40,56,80,104].includes(b)&&P(0,16,b==80?1:.7);
 return E.sort((a,c)=>a[0]-c[0])}
// ---------------- sample synthesis (cached per sample rate) ----------------
const CA={};
function prep(SR){if(CA[SR])return CA[SR];
 const R={},
 // render ch channels of d seconds; f(c) returns a per-sample function (closures keep filter state); 10 ms fade-out
 mk=(d,f,ch=1,nf)=>{const n=SR*d|0,o=[];for(let c=0;c<ch;c++){const x=new Float32Array(n),g=f(c);for(let i=0;i<n;i++)x[i]=g(i/SR,i)*(nf?1:M.min(1,(n-i)/SR*100));o.push(x)}return o},
 // TPT state-variable filter: returns lowpass, sets .b (band) and .h (high)
 svf=()=>{let s1=0,s2=0;const F=(x,fc,q)=>{const g=M.tan(PI*M.min(fc,SR*.45)/SR),k=1/q,a1=1/(1+g*(g+k)),a2=g*a1,v3=x-s2,v1=a1*s1+a2*v3,v2=s2+a2*s1+g*a2*v3;s1=2*v1-s1;s2=2*v2-s2;F.b=v1;F.h=x-k*v1-v2;return v2};return F},
 blep=(p,d)=>p<d?(p/=d,p+p-p*p-1):p>1-d?(p=(p-1)/d,p*p+p+p+1):0,
 saw=()=>{let p=M.random();return f=>{const d=f/SR;p+=d;p-=p|0;return 2*p-1-blep(p,d)}},
 // 808-style metallic source: six detuned square waves
 met=t=>{let s=0;for(const f of[205.3,304.4,369.6,522.7,540,800])s+=sn(TAU*f*1.7*t)>0?1:-1;return s/6},
 ir=(d,k,c)=>mk(d,()=>{let y=0;return t=>(y+=(rn()-y)*c*ex(-t*.7),y*ex(-t*k)*M.min(1,t*250))},2);
 // kick: pitch-swept sine into tanh, a click on top
 R.K=mk(.75,()=>{let p=0;return t=>{p+=TAU*(43+100*ex(-t*22)+300*ex(-t*150))/SR;return th(2*sn(p)*ex(-t*3.6)*(1-ex(-t*900)))*.95+rn()*ex(-t*900)*.2}});
 // the turbine kick: harder click, more drive, a touch shorter
 R.J=mk(.6,()=>{let p=0;const f=svf();return t=>{p+=TAU*(45+120*ex(-t*26)+420*ex(-t*190))/SR;f(rn(),3200,.9);return th(2.8*sn(p)*ex(-t*4.4)*(1-ex(-t*900)))*.82+f.b*ex(-t*500)*.45}});
 R.H=mk(.25,()=>{const f=svf();return t=>(f(met(t)*.6+rn()*.5,7500,.9),f.h*ex(-t*48))});
 R.O=mk(.8,()=>{const f=svf();return t=>(f(met(t)*.6+rn()*.5,7000,.8),f.h*ex(-t*6.5)*.8)});
 R.R=mk(1.6,()=>{const f=svf();return t=>(f(met(t*1.31)*.8+rn()*.25,5200,1.3),f.b*(.45*ex(-t*2.4)+.6*ex(-t*28)))});
 R.C=mk(.5,()=>{const f=svf();return t=>(f(rn(),1250,1.3),f.b*2.4*(t<.033?ex(-(t%.011)*260):ex(-(t-.033)*15)))});
 R.S=mk(.4,()=>{const f=svf();let p=0;return t=>{p+=TAU*(182+60*ex(-t*40))/SR;f(rn(),2600,.7);return th(1.6*(sn(p)*ex(-t*28)*.7+f.b*ex(-t*15)*1.5))}});
 R.M=mk(1.1,()=>t=>th(2.5*sn(TAU*340*t+2.8*ex(-t*9)*sn(TAU*913*t))*sn(TAU*587*t+1.3)*ex(-t*7))*.7);
 R.T=mk(.12,()=>{const f=svf();return t=>(f(rn()*ex(-t*420),3100,7),f.b*2+sn(TAU*1720*t)*ex(-t*85)*.3)});
 R.Q=mk(.5,()=>{let p=0;return t=>{p+=TAU*(105+70*ex(-t*20))/SR;return th(1.5*(sn(p)+.3*sn(2.71*p))*ex(-t*9))*.8}});
 R.X=mk(3,()=>{const f=svf();return t=>(f(rn()+met(t*2.3)*.4,6000,.6),f.h*(ex(-t*1.4)*.8+ex(-t*14)*.5))},2);
 // ATP bell: FM, tuned to C5 (played up to F5 / Ab5 / C6)
 R.B=mk(2.2,()=>t=>(sn(TAU*523.25*t+2*ex(-t*5)*sn(TAU*1831*t))*ex(-t*2.4)+.35*sn(TAU*1052*t)*ex(-t*6)+.2*sn(TAU*2600*t)*ex(-t*14))*.5);
 // electron zap: falling FM chirp
 R.Z=mk(.35,()=>{let p=0;return t=>{p+=TAU*(170+2600*ex(-t*28))/SR;return sn(p+1.5*sn(p*1.51))*ex(-t*12)*(1-ex(-t*2e3))*.6}});
 R.W=mk(BAR,()=>{const f=svf();return t=>{const u=t/BAR;f(rn(),300*30**u,2.5);return f.b*u*u*u*1.5}},2);
 // 8-bar riser: noise band and two saws climbing 1.5 octaves (shorter risers start part-way in)
 R.U=mk(8*BAR,()=>{const f=svf(),a=saw(),b=saw();return t=>{const u=t/8/BAR,q=hz(53)*2**(u*1.5);f(rn()*.6+(a(q)+b(q*1.006))*.25,200*45**u,1.5+u*4);return f.b*u*u*1.2}},2);
 // one-note bass (F2 + F1 sub), four decay settings: the line tightens through the song
 R.L=[.09,.062,.044,.03].map(dc=>mk(.42,()=>{const f=svf(),a=saw(),b=saw();let p=0;return t=>{p+=TAU*hz(29)/SR;
  return(th(1.8*f((a(hz(41)*1.004)+b(hz(41)*.996))*.5,90+3200*ex(-t/dc),2.6+3*(dc<.05)))+.35*sn(p))*(1-ex(-t*600))*ex(-t*(3+.12/dc))}}));
 // distorted Fm9 stab, dark and bright
 R.A=[2200,6000].map(fc=>mk(.7,c=>{const f=svf(),o=[53,56,60,63,67].flatMap(m=>[-1,1].map(j=>[saw(),hz(m)*(1+j*.006*(1+c*.3))]));return t=>th(2.4*f(o.reduce((a,[s,q])=>a+s(q),0)/8,150+fc*ex(-t*16),3))*ex(-t*5)*.7},2));
 // pad: Fm add9, two detuned saws per note, slow filter drift; 4 bars plus a tail
 const PL=4*BAR+1.5;R.P=mk(PL,c=>{const f=svf(),o=[48,56,60,63,67].flatMap(m=>[-1,1].map(j=>[saw(),hz(m)*(1+j*.0045+c*.002)]));return t=>f(o.reduce((a,[s,q])=>a+s(q),0)/8,700+1500*(.5+.5*sn(t*.9+c*2)),1.2)*M.min(1,t/1.2,(PL-t)/1.5)},2);
 R.N=mk(2,()=>rn,1,1);
 // the cathedral choir: four voices of saws through "ah" formants, slow vibrato
 R.CH=mk(PL,c=>{const fs=[svf(),svf(),svf()],o=[53,60,65,68].map((m,j)=>[saw(),saw(),hz(m),j]);return t=>{const v=1+.006*sn(t*5.3+c*2)+.003*sn(t*3.1);
  const x=o.reduce((a,[s1,s2,f,j])=>a+s1(f*v*(1+.003*j))+s2(f*v*(1-.004*j-c*.002)),0)/8;fs[0](x,760,6);fs[1](x,1180,7);fs[2](x,2650,8);
  return(fs[0].b+fs[1].b*.6+fs[2].b*.3)*M.min(1,t/1.8,(PL-t)/1.5)*1.4}},2);
 // sub drop: a sine falling from 118 Hz to 28 Hz
 R.D=mk(2.5,()=>{let p=0;return t=>{p+=TAU*(28+90*ex(-t*2.2))/SR;return th(1.5*sn(p))*ex(-t*1.3)*M.min(1,t*200)}});
 R.SH=mk(.12,()=>{const f=svf();return t=>(f(rn(),7500,1.8),f.b*M.min(1,t*300)*ex(-t*45))});
 R.V=ir(2.6,2.6,.6);R.Y=ir(3.6,1.6,.07);
 return CA[SR]=R}
// ---------------- graph ----------------
function setup(A,base){const SR=A.sampleRate,R=prep(SR),BF=a=>{const B=A.createBuffer(a.length,a[0].length,SR);a.forEach((x,c)=>B.copyToChannel(x,c));return B},B={};
 for(const k in R)B[k]=R[k][0]instanceof Float32Array?BF(R[k]):R[k].map(BF);
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n),
 G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g},
 F=(ty,f,q,...to)=>{const n=A.createBiquadFilter();n.type=ty;n.frequency.value=f;n.Q.value=q;to.forEach(x=>n.connect(x));return n},
 SH=(k,...to)=>{const w=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++)c[i]=th(k*(i/511.5-1))/th(k);w.curve=c;w.oversample='2x';to.forEach(x=>w.connect(x));return w},
 O=(ty,f,...to)=>{const o=A.createOscillator();o.type=ty;o.frequency.value=f;o.start(base);o.stop(base+LEN);to.forEach(x=>o.connect(x));return o},
 comp=A.createDynamicsCompressor();
 comp.threshold.value=-10;comp.knee.value=8;comp.ratio.value=2.5;comp.attack.value=.004;comp.release.value=.15;
 comp.connect(G(.72,SH(1.3,G(.93,A.destination))));
 const RV=A.createConvolver();RV.buffer=B.V;RV.connect(G(.4,comp));
 // the rumble: kick into a long dark reverb, low-passed, saturated, then sidechained with everything low
 const duck=G(1,comp),rumG=G(0,duck),RUM=A.createConvolver();RUM.buffer=B.Y;RUM.connect(F('highpass',38,.7,F('lowpass',170,.9,SH(3,rumG))));
 // ping-pong delay: dotted eighth left, the repeat crosses to the right
 const DL=A.createDelay(2),D2=A.createDelay(2),mg=A.createChannelMerger(2);DL.delayTime.value=3*ST;D2.delayTime.value=3*ST;
 const fb=G(.42,DL),dt=F('lowpass',2800,.7,F('highpass',260,.7,fb,D2,G(.4,RV)));DL.connect(dt);DL.connect(mg,0,0);D2.connect(mg,0,1);mg.connect(G(.55,comp));
 const dHP=F('highpass',20,.7,comp),dLP=F('lowpass',2e4,.7,dHP),DR=G(1,dLP),
 bLP=F('lowpass',400,1.6,duck),BS=G(1,bLP),pLP=F('lowpass',800,.8,duck,G(.45,RV)),
 subG=G(0,duck),drG=G(0,comp),drLP=F('lowpass',150,1.2,drG),nzG=G(0,comp,RV),
 nz=A.createBufferSource();
 O('sine',hz(29),subG);O('sawtooth',hz(29)*1.003,drLP);O('sawtooth',hz(36)*.998,G(.4,drLP));
 const prG=G(0,comp,RV),prF=F('bandpass',300,7,prG);[hz(41),hz(41)*1.003,hz(48)].forEach(f=>O('sawtooth',f,prF));
 // the turbine lead's bus: drive, then into the sidechained bus and the delay
 const AS=G(1,SH(2.5,G(.3,duck),G(.22,DL))),AC=[0,12,0,0,3,0,12,7,0,0,10,0,3,12,0,5];
 nz.buffer=B.N;nz.loop=true;nz.connect(F('bandpass',420,.8,nzG));nz.start(base);nz.stop(base+LEN);
 const hit=(b,t,v,o,r=1,pn=0,sd=0,sr=0,off=0)=>{const s=keep(A.createBufferSource()),g=G(v,o);s.buffer=b;s.playbackRate.value=r;
  let x=s;if(pn){x=keep(A.createStereoPanner());x.pan.value=pn;s.connect(x)}x.connect(g);
  sd&&g.connect(G(sd,DL));sr&&g.connect(G(sr,RV));s.start(t,off);return g};
 // sounds longer than the pruning lag live outside the bags and disconnect themselves
 const lng=(f)=>{const sv=bag;bag=[];const s=f(),n=bag;bag=sv;s.onended=()=>n.forEach(x=>x.disconnect())},
 lh=(b,t,v,o,off)=>lng(()=>{const s=A.createBufferSource(),g=G(v,o);s.buffer=b;s.connect(g);bag.push(s);s.start(t,off);return s});
 // automation curves over fractional bars
 const L=(a,c,x)=>a+(c-a)*M.min(1,M.max(0,x)),
 bf=x=>x<16?350:x<24?L(350,900,(x-16)/8):x<40?L(900,1250,(x-24)/16):x<56?1350:x<72?1350+2900*((x-56)/16)**2:x<80?500:x<104?3300:x<112?4300:L(4300,300,(x-112)/8),
 dl=x=>x<8?180+900*(x/8)**2:x>=72&&x<80?260:2e4,
 dh=x=>x>=66&&x<=72?20+700*((x-66)/6)**2:20,
 rg=x=>(x<8?.3:x<16?.45:x<72?.7:x<80?.5:x<112?.85:.6)*.4,
 pl=x=>x<8?600:x<72?1e3:x<80?400+3600*((x-72)/8)**2:x<112?5e3:L(4e3,500,(x-112)/8),
 dg=x=>x<8?.05+.1*x/8:x<16?.1:x<24?.06:x<72?.03:x<80?.12:x<112?.03:.18*L(1,0,(x-112)/8),
 dlf=x=>x>=72&&x<80?150+600*((x-72)/8)**2:150,
 ng=x=>x<8?.07:x<56?.02:x<72?L(.02,.1,(x-56)/16):x<80?.12:x<112?.03:.07,
 pf=x=>x<56?300:x<80?300*2**((x-56)/8):300,pg=x=>x<56||x>=80?0:.025+.13*((x-56)/24)**2,
 sg=x=>{const s=sec(x|0);return GR(s)?.2:s==6?.14:s==9?.2*L(1,0,(x-112)/8):s==0?.1*x/8:0};
 function bar(b,t){const s=sec(b),T=i=>t+i*ST,e=t+BAR,
  au=(p,f)=>{p.setValueAtTime(f(b),t);p.linearRampToValueAtTime(f(b+1),e)};
  au(bLP.frequency,bf);au(dLP.frequency,dl);au(dHP.frequency,dh);au(rumG.gain,rg);au(pLP.frequency,pl);au(drG.gain,dg);au(drLP.frequency,dlf);au(nzG.gain,ng);au(subG.gain,sg);au(prF.frequency,pf);au(prG.gain,pg);
  if(b%4==0&&[0,6,8,9].includes(s))lh(B.P,t,[.2,,,,,,.32,,.3,.4][s],pLP,0);
  if(b%4==0&&[3,6,9].includes(s))lh(B.CH,t,[,,,.13,,,.32,,,.3][s],pLP,0);
  const rs={20:4,64:8,76:4,100:4}[b];rs&&lh(B.U,t,.42,comp,(8-rs)*BAR);
  // second half of the turbine and the flood: a resonant square line, one note, octave jumps, the filter opening bar by bar
  if(s==7&&b>=88||s==8)for(let i=0;i<16;i++){if(i%4==0&&i!=8)continue;const tt=T(i)+(i%2?ST*.06:0),o=keep(A.createOscillator()),f=keep(A.createBiquadFilter()),g=G(0,AS),ac=AC[i]>6,c0=350+(b-88)*45;
   o.type='square';o.frequency.value=hz(41+AC[i]);f.Q.value=11;f.frequency.setValueAtTime(c0*(ac?5:2.6),tt);f.frequency.setTargetAtTime(c0,tt,.035);
   g.gain.setValueAtTime(ac?.17:.1,tt);g.gain.setTargetAtTime(0,tt+ST*.55,.025);o.connect(f);f.connect(g);o.start(tt);o.stop(tt+ST*1.4)}
  for(const[i,y,v,p]of ev(b)){const tt=T(i)+(i%2==1&&y<3?ST*.09:0),pn=(hs(b*16+i+y)-.5)*.6;
   switch(y){
   case 0:{const g=hit(s==7||s==8?B.J:B.K,tt,v*.7,DR);g.connect(G(.9,RUM));duck.gain.setTargetAtTime(.15,tt,.004);duck.gain.setTargetAtTime(1,tt+.04,.09);break}
   case 1:hit(B.H,tt,v*1.5,DR,i%4==2?1:1.06,pn);break;
   case 2:hit(B.O,tt,v*1.2,DR,1,-pn,0,.05);break;
   case 3:hit(B.C,tt,v*.7,DR,1,0,0,.25);break;
   case 4:hit(B.R,tt,v*.6,DR,1,.3);break;
   case 5:hit(B.M,tt,v*.3,DR,p<0?p<-1?.35:.5:[1,1.19,1.5,.84][p],pn*1.5,.3,.2);break;
   case 6:hit(B.S,tt,v*.5,DR,1+p*.25,0,0,.15);break;
   case 7:hit(B.T,tt,v*.4,DR,1+p*.09,pn*.4);break;
   case 8:hit(B.B,tt,v*.28,comp,[1.335,1.587,2][p]/(s==9||s==6?2:s?1:4),[-.5,0,.5][p],.35,.3);break;
   case 9:hit(B.Z,tt,v*.35,comp,2**(-p/8),pn,.4,.1);break;
   case 10:hit(B.L[p],tt,v*.4,BS);break;
   case 11:hit(B.A[p],tt,v*.8,comp,i%1?1.5:1,0,.35,.2);break;
   case 12:hit(B.X,tt,v*.3,comp,1,0,0,.2);break;
   case 13:hit(B.W,tt,v*.35,comp,1,0,0,.3);break;
   case 14:hit(B.Q,tt,v*.5,DR,1+p*.6,pn,0,.15);break;
   case 15:hit(B.SH,tt+(i%2?ST*.12:0),v*.5,DR,1,-pn*1.4);break;
   case 16:hit(B.D,tt,v*.6,duck)}}}
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=M.max(0,M.ceil(from/BAR-.001));
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,prep,ev,sec,SEC,HOPS,BPM,BAR,ST,BARS,LEN}})();
