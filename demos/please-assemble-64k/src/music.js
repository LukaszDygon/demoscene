// PLEASE ASSEMBLE soundtrack + toy speech chip. 132 BPM on a constant eighth-note grid, shifting meters.
// One setup() builds the graph on any context: live (lookahead per bar) or offline (SONG.render()).
var SONG=(()=>{
const BPM=132,E=30/BPM,{floor,random,min,max,sin,exp,PI}=Math;
// sections: [bars, meters in eighths cycling]
const SEC=[[4,[7]],[12,[7]],[16,[7]],[12,[10]],[12,[8,6]],[12,[8]],[12,[7]],[2,[10]],[20,[7,7,7,10]],[12,[7]]];
const M=[],SI=[],BS=[],SB=[];let T=0;
SEC.forEach((s,i)=>{SB.push(M.length);for(let k=0;k<s[0];k++){const n=s[1][k%s[1].length];M.push(n);SI.push(i);BS.push(T);T+=n*E}});
BS.push(T);SB.push(M.length);
const BARS=M.length,LEN=T+5,BAR=T/BARS;
const rng=s=>()=>(s=(s*16807+11)%2147483647)/2147483647;

// ---------- narration: [bar, eighth, display text, phonemes (one word per display word), glitch] ----------
// phonemes: a=cat e=bed i=sit o=hot u=cup E=see U=too A=car O=more R=bird @=schwa; T=thin D=this S=she Z=measure N=sing
const LN=[
[1,0,"Hello! I am your assembly kit.","hel@U AE am yO @semblE kit",0],
[4,0,"Step one. Open the box.","step wun @Up@n D@ boks",0],
[8,0,"Count the pieces.","kAUnt D@ pEs@z",0],
[10,0,"There should be infinity.","De@ SUd bE infinitE",0],
[13,0,"Good counting!","gUd kAUntiN",0],
[16,0,"Step two. Build a staircase.","step tU bild @ ste@keEs",0],
[21,0,"Climb it. Keep climbing.","klAEm it kEp klAEmiN",0],
[25,0,"Please do not look behind the stairs.","plEz dU not lUk bEhAEnd D@ ste@z",0],
[29,0,"Thank you. You are back at the bottom.","Tank yU yU A bak at D@ bot@m",0],
[32,0,"Step three. Join the three corners.","step TrE dZOEn D@ TrE kOn@z",0],
[36,0,"Turn the room a quarter turn.","tRn D@ rUm @ kwOt@ tRn",0],
[38,4,"Some corners are farther away than they look.","sum kOn@z A fAD@ @weE Dan DeE lUk",0],
[41,2,"Ignore the shadow.","ignO D@ Sad@U",0],
[44,0,"Step four. Choose which way is down.","step fO tSUz witS weE iz dAUn",0],
[48,0,"Choose again.","tSUz @gen",0],
[50,0,"Down is now to the left.","dAUn iz nAU tU D@ left",0],
[52,0,"Down is now behind you.","dAUn iz nAU bEhAEnd yU",0],
[54,0,"Good. Stay there.","gUd steE De@",0],
[56,0,"Step five. Look at the cube.","step fAEv lUk at D@ kyUb",0],
[59,0,"Is it facing you? Is it facing away?","iz it feEsiN yU iz it feEsiN @weE",0],
[62,0,"Both answers are correct.","b@UT ans@z A k@rekt",0],
[64,4,"Neither answer is correct.","nAED@ ans@ iz k@rekt",.1],
[68,0,"Step six. Paint the inside of the ribbon pink.","step siks peEnt DE insAEd @v D@ rib@n piNk",0],
[73,0,"Now paint the outside pink.","nAU peEnt DE AUtsAEd piNk",.1],
[76,0,"There is no outside.","De@ iz n@U AUtsAEd",.2],
[80,0,"Step six and a ha- ha- half.","step siks and @ ha ha hAf",.5],
[82,0,"Step seven. Place step eight before step seven.","step sev@n pleEs step eEt bEfO step sev@n",.25],
[87,0,"Fold the room along the dotted line.","f@Uld D@ rUm @loN D@ dotid lAEn",.35],
[91,0,"Insert yourself into slot A.","insRt yOself intU slot eE",.45],
[94,0,"You have too many corners. This is normal.","yU hav tU meni kOn@z Dis iz nOm@l",.55],
[98,0,"Keep climbing. Up is also down.","kEp klAEmiN up iz Ols@U dAUn",.7],
[102,0,"Step eight. Put everything back in the box.","step eEt pUt evriTiN bak in D@ boks",0],
[106,0,"Including the stairs. Including you.","inklUdiN D@ ste@z inklUdiN yU",.15],
[110,0,"Assembly complete. Thank you for playing!","@semblE k@mplEt Tank yU fO pleEiN",0]];
// formant targets [F1,F2,F3,dur cs,amp]
const VW={a:[760,1720,2600,11],e:[580,1850,2550,9],i:[430,2000,2650,8],o:[640,960,2500,10],u:[660,1220,2550,8],E:[300,2300,3000,12],U:[340,920,2300,11],A:[730,1100,2550,13],O:[520,860,2500,12],R:[500,1350,1700,12],'@':[500,1500,2500,6],
 l:[380,1000,2600,6,.6],r:[420,1150,1500,6,.6],w:[300,700,2300,5,.6],y:[290,2200,2900,5,.6],m:[280,1100,2300,7,.35],n:[280,1500,2500,6,.35],N:[280,2000,2600,7,.35]};
// consonants [noise centre, dur cs, kind 0=fric 1=voiced fric 2=stop 3=voiced stop, noise amp]
const CN={s:[6200,9,0,.9],S:[2700,10,0,.9],f:[4800,8,0,.35],T:[5200,7,0,.3],h:[1700,5,0,.4],z:[5600,8,1,.5],v:[3800,6,1,.3],Z:[2600,8,1,.5],D:[4600,4,1,.25],
 p:[900,7,2,.8],t:[4000,7,2,.8],k:[2300,7,2,.8],b:[800,6,3,.5],d:[3200,6,3,.5],g:[2000,6,3,.5]};
const MEL=[0,4,7,4,2,5,9,7];
const LINES=LN.map(([b,e,txt,ph,g],li)=>{
 const t0=BS[b]+e*E,R=rng(li*977+5),dw=txt.split(' '),pw=ph.split(' '),P=[],W=[];let t=0;
 pw.forEach((w,wi)=>{W.push({w:dw[wi],t:t0+t});
  let p=220*2**(MEL[(wi+li)%8]/12);if(wi==pw.length-1)p*=/\?/.test(dw[wi])?1.25:.84;
  if(g&&R()<g)p*=2**((floor(R()*9)-4)/6);
  let s=[...w];if(g&&R()<g*.5&&s.length>2)s=[...s.slice(0,2),...s.slice(0,2),...s];
  for(const c of s){const d=(VW[c]||CN[c])[VW[c]?3:1]*.0105*(g?1-g*.25:1);P.push([c,t,d,p*(1+(R()-.5)*g*.3)]);t+=d}
  t+=/[.,!?]$/.test(dw[wi])?.16:.035});
 return{t:t0,end:t0+t,words:W,ph:P,g}});

function setup(A,base){
 const SR=A.sampleRate,SOLO=typeof window!='undefined'&&window.SOLO;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>n&&g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 const F=(type,f,q,...to)=>{const b=keep(A.createBiquadFilter());b.type=type;b.frequency.value=f;b.Q.value=q;to.forEach(n=>b.connect(n));return b};
 const PN=(p,to)=>{const s=keep(A.createStereoPanner());s.pan.value=p;s.connect(to);return s};
 const nb=A.createBuffer(1,SR*2,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=random()*2-1;
 const N=(t,d,to)=>{const s=keep(A.createBufferSource());s.buffer=nb;s.loop=true;s.connect(to);s.start(t,random()*1.5);s.stop(t+d);return s};
 const env=(g,t,a,v,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)};
 // master chain
 const comp=A.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.2;
 const out=A.createGain();out.gain.value=.6;comp.connect(out);out.connect(A.destination);
 const duck=A.createGain();duck.connect(comp);
 const mus=A.createGain();mus.gain.value=SOLO=='voice'?0:1;mus.connect(duck);
 const vbus=A.createGain();vbus.gain.value=SOLO=='music'?0:1;vbus.connect(comp);
 const cv=A.createConvolver(),ir=A.createBuffer(2,SR*2.2|0,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(random()*2-1)*exp(-i/SR*2.6)*.5}
 cv.buffer=ir;const rv=A.createGain();rv.gain.value=.35;rv.connect(cv);cv.connect(mus);
 const dl=A.createDelay(2);dl.delayTime.value=3*E;const fb=A.createGain();fb.gain.value=.33;const dlp=A.createBiquadFilter();dlp.frequency.value=3200;
 const dpan=A.createStereoPanner();dpan.pan.value=.55;dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(dpan);dpan.connect(mus);
 const dsend=A.createGain();dsend.gain.value=.28;dsend.connect(dl);
 const sec=A.createGain();sec.connect(mus);
 // crusher for the speech chip
 const cr=A.createWaveShaper(),cc=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;cc[i]=Math.round(x*14)/14}cr.curve=cc;
 const vlp=A.createBiquadFilter();vlp.frequency.value=5200;const vhp=A.createBiquadFilter();vhp.type='highpass';vhp.frequency.value=160;
 const vpre=A.createGain();vpre.gain.value=2.4;vpre.connect(cr);cr.connect(vhp);vhp.connect(vlp);const vo=A.createGain();vo.gain.value=.3;vlp.connect(vo);vo.connect(vbus);
 const vr=A.createGain();vr.gain.value=.12;vlp.connect(vr);vr.connect(cv);

 const SC=[0,2,4,5,7,9,11],sm=d=>SC[(d%7+7)%7]+12*floor(d/7),mf=m=>440*2**((m-69)/12);
 let WR=0,R=Math.random;
 const tune=m=>mf(m)*2**((WR*(R()-.3))/1200);
 // ---------- instruments ----------
 function bell(t,m,v,p=0){const f=tune(m),g=G(0,PN(p,sec),rv,dsend);env(g,t,.003,v,1.4);
  O('sine',f,t,t+1.6).connect(g);const g2=G(0,g);env(g2,t,.001,.5,.25);O('sine',f*4.07,t,t+.4).connect(g2);const g3=G(0,g);env(g3,t,.001,.35,.06);O('triangle',f*8.2,t,t+.1).connect(g3)}
 function glock(t,m,v,p=0){const f=tune(m),g=G(0,PN(p,sec),rv,dsend);env(g,t,.002,v,.9);
  O('sine',f,t,t+1.1).connect(g);const g2=G(0,g);env(g2,t,.001,.45,.18);O('sine',f*2.76,t,t+.3).connect(g2);const g3=G(0,g);env(g3,t,.001,.2,.05);O('sine',f*5.4,t,t+.1).connect(g3)}
 function toy(t,m,v,p=0){const f=tune(m),g=G(0,PN(p,sec),rv);env(g,t,.002,v,.55);
  const c=O('sine',f,t,t+.7),md=O('sine',f*3.5,t,t+.7),mg=G(f*2.2,c.frequency);md.connect(mg);mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+.25);c.connect(g);
  const k=G(0,g);env(k,t,.001,.4,.03);O('square',f*.5,t,t+.05).connect(k)}
 function plink(t,m,v,p=0){const f=tune(m),g=G(0,PN(p,sec),rv);env(g,t,.001,v,.3);
  O('sine',f,t,t+.4).connect(g);O('sine',f*1.011,t,t+.4).connect(g);const g2=G(.4,g);O('sine',f*2.31,t,t+.4).connect(g2);
  const r=G(0,g);env(r,t,.001,.5,.12);N(t,.15,F('bandpass',f*3,8,r))}
 function organ(t,ms,v,d){const g=G(0,PN(0,sec)),lp=F('lowpass',2400,1,g);env(g,t,.005,v,d);ms.forEach((m,i)=>O(i?'square':'triangle',tune(m),t,t+d+.1).connect(lp))}
 function bass(t,m,v,d){const f=mf(m),g=G(0,sec),lp=F('lowpass',f*6,6,g);env(g,t,.004,v,d);lp.frequency.setValueAtTime(f*9,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+d);
  O('triangle',f,t,t+d+.05).connect(lp);O('square',f,t,t+d+.05).connect(G(.35,lp));O('sine',f/2,t,t+d+.05).connect(G(.6,g))}
 function kick(t,v){const g=G(0,sec);env(g,t,.002,v,.22);const o=O('sine',150,t,t+.3);o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(48,t+.12);o.connect(g);
  const c=G(0,g);env(c,t,.001,.5,.01);N(t,.02,c)}
 function snr(t,v){const g=G(0,PN(-.1,sec),rv);env(g,t,.001,v,.1);N(t,.16,F('bandpass',2200,.8,g));const o=O('triangle',230,t,t+.1);o.frequency.exponentialRampToValueAtTime(150,t+.08);const g2=G(0,g);env(g2,t,.001,.7,.05);o.connect(g2)}
 function hat(t,v,p=0,f=8000){const g=G(0,PN(p,sec));env(g,t,.001,v,.028);N(t,.05,F('highpass',f,1,g))}
 function blk(t,m,v,p=0){const f=mf(m),g=G(0,PN(p,sec),rv);env(g,t,.001,v,.06);const o=O('sine',f,t,t+.1);o.frequency.exponentialRampToValueAtTime(f*.8,t+.06);o.connect(g);N(t,.03,F('bandpass',f*2,6,g))}
 function rat(t,n,v,f,dt=E/4){for(let i=0;i<n;i++)hat(t+i*dt,v*(.5+i/n*.6),(i%2?.4:-.4),f*(1+i*.12))}
 // ---------- speech chip ----------
 function speak(L,t0){
  const o=keep(A.createOscillator());o.type='sawtooth';o.frequency.value=L.ph[0][3];const vg=G(0),sum=G(1,vpre),ng=G(0,sum),nf=F('bandpass',3000,1.6,ng);
  o.connect(vg);const FB=[[5,1.3],[9,2.4],[12,1.8]].map(([q,a])=>{const b=F('bandpass',500,q,G(a,sum));vg.connect(b);return b});
  N(t0,L.end-L.t+.4,nf);const st=(p,v,t,k=.012)=>p.setTargetAtTime(v,t,k);
  for(const[c,tt,d,p]of L.ph){const t=t0+tt,v=VW[c],k=CN[c];st(o.frequency,p,t,.02);
   if(v){v.slice(0,3).forEach((f,i)=>st(FB[i].frequency,f*(1+L.g*.15),t,.015));st(vg.gain,v[4]||1,t);st(ng.gain,0,t,.008)}
   else{nf.frequency.setValueAtTime(k[0],t);const vv=k[2]&1?.3:0;st(vg.gain,vv,t,.008);
    if(k[2]<2)st(ng.gain,k[3],t,.01);else{st(ng.gain,0,t,.005);ng.gain.setValueAtTime(k[3],t+d*.6);st(ng.gain,0,t+d*.6+.012,.01)}}}
  const te=t0+L.end-L.t;st(vg.gain,0,te,.02);st(ng.gain,0,te,.02);o.start(t0);o.stop(te+.3);
  duck.gain.setTargetAtTime(.75,t0-.05,.04);duck.gain.setTargetAtTime(1,te+.1,.15)}

 function bar(b,t){
  const s=SI[b],k=b-SB[s],n=M[b],sx=n*2,R2=rng(b*7919+3);R=rng(b*131+7);WR=[0,0,4,8,12,16,26,60,22,10][s];
  const PR=[[0,5,3,4],[0,5,3,4],[0,5,3,4],[3,4,2,5],[0,3,1,4],[5,3,0,4],[0,2,3,4],[3,3],[0,5,3,4],[3,4,0,0]][s];
  const K=62+(s==8&&k>15?1:0),cd=PR[k%PR.length],root=K+sm(cd)-(sm(cd)>7?12:0),ph=k%4,E16=E/2;
  const ch=[0,2,4].map(i=>K+sm(cd+i));
  const at=i=>t+i*E16;
  // section level automation
  sec.gain.setTargetAtTime(s==9?max(.15,1-max(0,k-6)*.14):s==7?.9:1,t,.3);
  LINES.forEach(L=>{if(L.t>=BS[b]-1e-6&&L.t<BS[b+1]-1e-6)speak(L,base+L.t)});
  // melody strings: digit/letter = scale step above chord root, '.' = rest
  const MS={0:["0.4.7..","7.4.2..","4.2.1.."],1:["0247.4.","7.42.0.","4.2.1.."],2:["7.97.b9","9.74.42","b.9.7.."],3:["4.20.47.9.","9.7.4.21..","7...4...2."],
   4:["0.4.7.4.","9.7.4."],5:["7..4..2.",".9..7..4","b..9..7."],6:["4..2..0","7..6..4","9..7.42"],8:["7.97.b9","9.74.42","b.9.7..","b.9.7.4.2."],9:["0247.4.","7.42.0.","4.2.1.."]}[s];
  if(MS){let m=MS[s==8?(n==10?3:ph%3):s==4?(n==6?1:0):ph==3?2:ph%2];
   const ins=s==3?toy:s==2||s==4||s==8?glock:bell,oc=s==2||s==8?12:s==4?12:12,vv=s==0?.22:s==5?.2:.26;
   if(!(s==9&&k==11))for(let i=0;i<n;i++){const c=m[i%m.length];if(c=='.')continue;let st=parseInt(c,16);if(s>1&&s<9&&k*2>=SB[s+1]-SB[s]&&ph==1)st=(s%2?11:9)-st;
    let mm=K+oc+sm(cd+st)-(cd>3?12:0);if(R()<WR/200)mm+=1;if((s==5||s==8)&&R()<.14)for(let j=0;j<4;j++)ins(t+i*E+j*E/4,mm+j*(s==5?12:5),vv*(1-j*.18),(j%2-.5));else ins(t+i*E,mm,vv*(i?1:1.15),(i%3-1)*.35)}}
  // bell arpeggio sparkle (16ths)
  if(s==2&&k>3||s==5||s==8){const ar=[0,2,4,7,9,7,4,2];for(let i=0;i<sx;i++)if(R2()<(s==5?.45:.7))bell(at(i),K+24+sm(cd+ar[(i+k)%8])-(cd>3?12:0),.06,R2()*1.4-.7)}
  // music box under toy piano / room
  if(s==3||s==4){for(let i=0;i<n;i+=2)bell(t+i*E,74+sm(cd+[4,2,7,4,0][i/2%5])-(cd>3?12:0),.1,.4)}
  // clockwork ticks
  if(s<2||s==9&&k>8){for(let i=0;i<n;i++)blk(t+i*E,i%2?96:103,s==0?.05:.07,i%2?.5:-.5)}
  // break: music box winding down
  if(s==7){const sq=[11,9,7,4,2,0,-1,-3];let tt=t;for(let i=0;i<8;i++){const dd=E*(1+k*1.3+i*.25);WR=-(k*8+i)*14;if(tt<t+n*E-.05)bell(tt,74+sq[i]+(k?0:12),.24-i*.015,(i%2-.5)*.6);tt+=dd}
   for(let i=0;i<n;i++)blk(t+i*E*(1+k*.5),90-i,.05)}
  // cues: box opens, page-turn swooshes into each step, completion fanfare, tower counter-melody
  if(b==4)[0,4,7,12,16,19,24].forEach((m,i)=>glock(at(i),K+12+m,.16,(i-3)*.2));
  if(k==0&&[2,3,4,5,6,8,9].includes(s)){const g=G(0,PN(.3,sec),rv),f=F('bandpass',500,2,g);g.gain.setValueAtTime(0,t-.32);g.gain.linearRampToValueAtTime(.3,t-.05);g.gain.linearRampToValueAtTime(0,t+.05);
   f.frequency.setValueAtTime(500,t-.32);f.frequency.exponentialRampToValueAtTime(6000,t);N(t-.33,.45,f);glock(t,K+24+sm(cd+4),.2)}
  if(b==110)[0,2,4,7,9,11,14].forEach((d,i)=>toy(t+i*E*.5,K+12+sm(d),.2,(i-3)*.25));
  if(s==8&&k%4>1){for(let i=0;i<n;i+=2)toy(t+i*E+E,K+sm(cd+[4,2,5,4,7][i/2%5]),.13,-.4)}
  // final chord
  if(s==9&&k==11){[62,66,69,74,76,81].forEach((m,i)=>bell(t+i*.025,m,.18,(i-2.5)*.2));blk(t,84,.2)}
  // drums
  const drums=s==1&&k>=4||s>=2&&s<=6||s==8||s==9&&k<8;
  if(drums){
   const P={14:["x.....x.x.....","....x.......x."],20:["x.....x.........x...","............x.....x."],16:["x.....x...x.....","....x.......x..x"],12:["x.......x...","....x......."]}[sx];
   const busy=s==5||s==8?.35:s==2||s==3?.15:.05,soft=s==6||s==1;
   for(let i=0;i<sx;i++){
    if(P[0][i]=='x'&&!(soft&&i))kick(at(i),s==1?.5:.85);
    if(P[1][i]=='x')soft?blk(at(i),79,.22,-.2):snr(at(i),.5);
    if(i%2==0)hat(at(i),i%4?.1:.16,.25);else if(R2()<.35+busy)hat(at(i),.06,-.3,10000);
    if(!soft&&R2()<busy*.35)rat(at(i),3+floor(R2()*4),.1,5000+R2()*4000,E16/(2+floor(R2()*2)));
    if(s==5&&R2()<.12)snr(at(i)+E16/2,.18)}
   if(ph==3&&!soft&&s!=1)rat(at(sx-4),8,.16,3000,E16/2);
  }
  // prepared piano plinks
  if(s==3||s==5||s==8&&k>3){for(let i=0;i<sx;i++)if(R2()<(s==5?.28:.18))plink(at(i),root+12+sm([0,2,4,7][floor(R2()*4)]),.14,R2()-.5)}
  // organ stabs
  if(s==2&&k>7||s==4||s==8){const pp=sx==14?[3,7,11]:sx==20?[3,9,15]:sx==16?[3,7,11,14]:[3,9];pp.forEach(i=>organ(at(i),ch,.05,.12))}
  // bass
  if(s==1&&k>=8||s>=2&&s<=6||s==8||s==9&&k<9){const bm=root-24+(root-24<36?12:0),pat=sx==14?[0,3,6,8,11]:sx==20?[0,4,6,10,12,16]:sx==16?[0,3,6,10,13]:[0,4,8];
   pat.forEach((i,j)=>bass(at(i),bm+(j%2&&R2()<.5?12:j==3?7:0),s==6?.3:.42,j==pat.length-1?E*1.3:E*.8))}
 }
 function sched(b){bag=[];
  if(b>4&&BAGS[b-5]){BAGS[b-5].forEach(n=>n.disconnect());BAGS[b-5]=0}
  BAGS[b]=bag;bar(b,base+BS[b])}
 bag=[];sched.out=out;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=0;while(b<BARS&&BS[b+1]<=from)b++;
 const tick=()=>{while(b<BARS&&base+BS[b]<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((BS[b]-.6)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN,E,M,SI,BS,SB,LINES}})();
