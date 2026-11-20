// THE MEADOW COUNTS - soundtrack and narrator. 88 BPM, 74 bars (~3:26). Same scheduler runs live and offline.
var SONG=(()=>{
const BPM=88,BAR=240/BPM,BEAT=60/BPM,S16=BEAT/4,BARS=74,LEN=BARS*BAR+4;
const mf=m=>440*2**((m-69)/12);
const hb=(b,k)=>{const x=Math.sin(b*12.9898+k*78.233)*43758.5453;return x-Math.floor(x)};
// swung sixteenths (boom-bap lean)
const st=s=>s*S16+(s&1?S16*.22:0);
// chords: [bass, pad voicing]
const CH={d:[38,53,57,60,64],b:[34,50,53,57,62],g:[31,50,53,58,69],a:[33,49,52,57,64],s:[33,50,52,57,64],
 e:[39,51,55,58,62],m:[34,49,53,58,61],f:[41,53,57,60,64],c:[36,48,52,55,62]};
const PR='dddd'+'dbgsdbga'+'fcfcdbgsda'+'dbgsdbgags'+'bfgdbfgdecsa'+'demsdemadbea'+'dbgsdbga'+'dbgsdb'+'gsdd';
// drum mode per bar: 0 none, 1 sparse, 2 full, 3 half-time, 4 busy
const DM=b=>b<8||b>=70?0:(b>=32&&b<36)?1:(b>=36&&b<44)?3:(b>=44&&b<56)?4:2;
const KP=[[0,7,10],[0,3,7,10],[0,7,9,10],[0,6,10,13]];
function kicks(b){const m=DM(b);if(!m)return[];if(m==1)return[0];if(m==3)return[0,10];return b%4==3?[0,7,10,13]:KP[hb(b,1)*4|0]}
// kick envelope for the visuals
function kick(t){let e=0;const b=Math.floor(t/BAR);for(let k=b-1;k<=b;k++)if(k>=0)for(const s of kicks(k)){const d=t-k*BAR-st(s);if(d>=0)e=Math.max(e,Math.exp(-d*7))}return e}
// lead phrases, one bar = 16 sixteenths. digit/letter = note, '-' = hold, '.' = rest
const LN={0:57,1:60,2:62,3:64,4:65,5:67,6:69,7:70,8:72,9:74,a:76,b:77,c:63,d:61};
const PA=['6-----5-4---2---','....4-5-6---8-6-','5-----4-2---0---','3-----2-----....'],
 PB=['2.4.6.4.9...8.6.','4.6.8.6.9-----..','5.7.9.7.6...5.4.','3...2...3---d---'],
 PC=['9---------8-----','6---------------','7-------5-------','6---------......'],
 PD=['6---7---6-----..','c-----5-----7---','7-----4-----7---','3-----d-----0---'],
 PX=['6---------------','d-----3-----....'];
const LEAD=[],put=(b,p)=>p.forEach((s,i)=>LEAD[b+i]=s);
put(16,PA);put(20,PX);put(26,PB);put(36,PC);put(48,PD);put(52,[PA[0],PA[1],PD[1],PX[1]]);put(60,PB);put(64,PA);put(68,[PA[0],PA[1]]);
// ---------- narrator: hand-spelled phonetics, one phonetic word per subtitle word ----------
// vowels a(cat) e(bed) i(sit) o(hot) u(but) A(schwa) E(see) U(too) R(her) I(father) O(law); ' = stress
const NAR=[
[4.5,0,'This is a meadow.',"Dis iz A 'medoU."],
[6.6,0,'Everything here is counting.',"'evrETiN hEr iz 'kIUntiN."],
[9,0,'The grass counts the wind.',"DA 'gras 'kIUnts DA 'wind."],
[12.5,0,'Look closer at the flower.',"'luk 'kloUzR at DA 'flIUR."],
[14.6,0,'The seeds turn by the golden angle.',"DA 'sEdz 'tRn bIE DA 'goUldAn 'aNgAl."],
[16.8,0,'Thirty-four one way. Fifty-five the other.',"'TRtEfor 'wun 'weE. 'fiftEfIEv DA 'uDR."],
[19,0,'Every seed is a smaller flower.',"'evrE 'sEd iz A 'smOlR 'flIUR."],
[20.8,1,'And every flower is a seed.',"and 'evrE 'flIUR iz A 'sEd."],
[22.5,0,'The bees learned it first.',"DA 'bEz 'lRnd it 'fRst."],
[24.5,0,'Six sides. No gaps. No waste.',"'siks 'sIEdz. 'noU 'gaps. 'noU 'weEst."],
[26.8,0,'Then the stones learned it too.',"Den DA 'stoUnz 'lRnd it 'tU."],
[29,1,'How long did they practise?',"hIU 'loN did DeE 'praktis?"],
[30.6,0,'A very long time.',"A 'verE 'loN 'tIEm."],
[32.6,0,'Now look up.',"'nIU luk 'up."],
[34.5,0,'The horizon does not end. It folds.',"DA hA'rIEzAn duz 'not 'end. it 'foUldz."],
[37,0,'That is the same field, above you.',"Dat iz DA 'seEm 'fEld, A'buv yU."],
[39.6,0,'We walked there as children.',"wE 'wOkt Der az 'cildrAn."],
[41.6,1,'We are still walking there.',"wE Ir 'stil 'wOkiN Der."],
[44.6,0,'Follow the line of poles.',"'foloU DA 'lIEn Av 'poUlz."],
[46.8,0,'They do not get smaller.',"DeE dU 'not get 'smOlR."],
[49,0,'The further they go, the taller they grow.',"DA 'fRDR DeE 'goU, DA 'tOlR DeE 'groU."],
[51.8,0,'Do not count them.',"dU 'not 'kIUnt Dem."],
[53.6,1,'I counted them.',"IE 'kIUntid Dem."],
[56.6,0,'This film was made a long time ago.',"Dis 'film woz 'meEd A 'loN 'tIEm A'goU."],
[59,0,'It is still playing.',"it iz 'stil 'pleEiN."],
[60.6,1,'Is that us?',"iz 'Dat 'us?"],
[61.8,0,'You are watching it now.',"yU Ir 'wociN it 'nIU."],
[64.5,0,'The sun goes down at the usual time.',"DA 'sun goUz 'dIUn at DA 'yUZUAl 'tIEm."],
[67,0,'This is the end of the lesson.',"Dis iz DE 'end Av DA 'lesAn."],
[69.2,0,'Remember the number.',"rE'membR DA 'numbR."],
[71.2,1,'What was the number?',"'wot woz DA 'numbR?"]];
// formants [F1,F2,F3]
const VW={a:[700,1650,2500],e:[550,1800,2500],i:[420,1950,2600],o:[600,950,2450],u:[640,1200,2400],A:[520,1350,2450],
 E:[290,2250,3000],U:[330,950,2250],R:[480,1350,1650],I:[750,1200,2500],O:[580,850,2450]};
// consonants [F1,F2,F3, voice, noise, noise Hz, dur]
const CN={m:[280,1000,2300,.45,0,0,.07],n:[280,1600,2600,.45,0,0,.06],N:[280,2200,2700,.45,0,0,.07],l:[380,1100,2600,.65,0,0,.06],
 r:[420,1250,1600,.65,0,0,.06],w:[300,700,2200,.55,0,0,.06],y:[280,2200,3000,.55,0,0,.05],v:[300,1200,2400,.35,.15,4000,.06],
 z:[300,1600,2600,.3,.3,5500,.08],Z:[300,1800,2600,.3,.3,2800,.08],D:[300,1500,2500,.35,.12,5000,.05],s:[0,0,0,0,.5,5500,.1],
 S:[0,0,0,0,.45,2700,.1],f:[0,0,0,0,.22,6500,.09],T:[0,0,0,0,.22,6000,.08],h:[0,0,0,0,.2,1600,.06],
 b:[300,900,2300,.45,0,0,.04],d:[300,1700,2600,.45,.05,4000,.04],g:[300,2000,2600,.45,.05,2500,.04],
 p:[0,0,0,0,.3,1500,.05],t:[0,0,0,0,.35,4500,.05],k:[0,0,0,0,.35,2600,.06]};
// parse -> {t (song s), ch, text, d, ph:[[t,dur,F1,F2,F3,voice,noise,nHz,pitch]], words:[[start,end]]}
const LINES=NAR.map(([bar,ch,text,phon])=>{let t=0,stress=0;const ph=[],words=[],r=ch?1:1.15,ws=phon.split(' ');
 ws.forEach((w,wi)=>{const w0=t,last=wi==ws.length-1;
  for(const c0 of w){if(c0=="'"){stress=1;continue}
   if(',.?'.includes(c0)){ph.push([t,.1,0,0,0,0,0,0,0]);t+=c0==','?.2:.32;continue}
   for(const c of c0=='c'?'tS':c0=='j'?'dZ':c0){const v=VW[c];
    if(v){const d=.125*r*(stress?1.5:1)*(last?1.3:1);ph.push([t,d,...v,1,0,0,stress]);t+=d;stress=0}
    else{const k=CN[c];if('ptkbdg'.includes(c)){ph.push([t,.035*r,0,0,0,0,0,0,0]);t+=.035*r}
     ph.push([t,k[6]*r,k[0],k[1],k[2],k[3],k[4],k[5],0]);t+=k[6]*r}}}
  words.push([w0,t]);ph.push([t,.06*r,0,0,0,0,0,0,0]);t+=.06*r});
 const q=text.endsWith('?');
 // intonation: declining contour, stress bumps, question rises at the end, a little jitter
 ph.forEach((p,i)=>{const u=p[0]/t;p[8]=(1.08-.2*u)*(p[8]?1.13:1)*(q&&u>.75?1+(u-.75)*1.6:1)*(1+(hb(i,bar)-.5)*.04)});
 return{t:bar*BAR,ch,text,d:t,ph,words}});
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
 const T=b=>base+b*BAR,END=base+LEN;
 const env=(g,t,a,h,r,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+h);g.gain.linearRampToValueAtTime(0,t+r)};
 const nb=A.createBuffer(1,SR*2,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const N=(t,e,loop)=>{const s=keep(A.createBufferSource());s.buffer=nb;s.loop=!!loop;s.start(t,Math.random()*1.5);s.stop(e);return s};
 // ---- long-lived master chain: music bus -> tape delay (wow/flutter) -> saturation -> lo-fi filters -> comp ----
 const comp=A.createDynamicsCompressor();comp.threshold.value=-15;comp.ratio.value=4;comp.attack.value=.006;comp.release.value=.25;comp.connect(A.destination);
 const out=G(.56,comp);out.gain.setValueAtTime(.56,T(73.4));out.gain.linearRampToValueAtTime(0,END-.2);
 const lp=F('lowpass',7200,.5,out);lp.frequency.setValueAtTime(7200,T(55.8));lp.frequency.exponentialRampToValueAtTime(1900,T(56.4));lp.frequency.setValueAtTime(1900,T(63.6));lp.frequency.exponentialRampToValueAtTime(7200,T(64.1));
 const hp=F('highpass',38,.7,lp);
 const ws=A.createWaveShaper(),cu=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cu[i]=Math.tanh(x*2.2)/Math.tanh(2.2)}
 ws.curve=cu;ws.connect(hp);
 const tape=A.createDelay(4);tape.delayTime.value=.014;tape.connect(ws);
 const lfo=(f,d)=>{const o=A.createOscillator();o.frequency.value=f;const g=G(d,tape.delayTime);o.connect(g);o.start(base);o.stop(END);return g};
 const wow=lfo(.43,.0016);lfo(.17,.0011);lfo(6.1,.00009);
 wow.gain.setValueAtTime(.0016,T(32));wow.gain.linearRampToValueAtTime(.0045,T(36));wow.gain.linearRampToValueAtTime(.0018,T(44));
 // tape sags: the motor slows for a moment and recovers (bars 32, 44, 56, 64)
 const dt=tape.delayTime;dt.setValueAtTime(.014,base);
 for(const b of[31.6,43.6,55.6,63.6]){dt.setValueAtTime(.014,T(b));dt.linearRampToValueAtTime(.075,T(b)+1.3);dt.linearRampToValueAtTime(.014,T(b)+2.6)}
 // tape stop at the very end: delay grows quadratically -> pitch slides to zero
 {const t0=T(73.25),Ts=2.6,c=new Float32Array(64);for(let i=0;i<64;i++){const x=i/63*Ts;c[i]=.014+x*x/(2*Ts)}dt.setValueCurveAtTime(c,t0,Ts)}
 const mus=G(1,tape),vo=G(1);
 // reverb + echo
 const ir=A.createBuffer(2,SR*3|0,SR);for(let c=0;c<2;c++){const d=ir.getChannelData(c);let y=0;for(let i=0;i<d.length;i++){y=y*.55+(Math.random()*2-1)*.45;d[i]=y*Math.exp(-i/SR*1.7)}}
 const cv=A.createConvolver();cv.buffer=ir;cv.connect(G(.5,mus));const rv=G(1,cv);
 const ec=A.createDelay(2);ec.delayTime.value=BEAT*.75;const efb=G(.38,ec),elp=F('lowpass',1800,.5,efb,mus,rv);ec.connect(elp);const eIn=G(1,ec);
 // hiss and crackle
 {const h=N(base,END,1),g=G(.016,hp);h.connect(F('highpass',3500,.5,g));
  const cb=A.createBuffer(1,SR*3,SR),cd=cb.getChannelData(0);for(let i=0;i<cd.length;i++)cd[i]=Math.random()<.0004?(Math.random()-.5)*(Math.random()<.1?1.6:.5):0;
  const cs=A.createBufferSource();cs.buffer=cb;cs.loop=true;cs.start(base);cs.stop(END);cs.connect(F('bandpass',2400,.6,G(.35,hp)))}
 // projector clatter (leader and run-out)
 {const pg=G(0,hp),o=A.createOscillator();o.type='square';o.frequency.value=24;const og=G(.2,pg.gain);o.connect(og);o.start(base);o.stop(END);
  N(base,END,1).connect(F('bandpass',1500,1.4,pg));pg.gain.setValueAtTime(.2,base);pg.gain.setValueAtTime(.2,T(3.7));pg.gain.linearRampToValueAtTime(0,T(4.2));
  pg.gain.setValueAtTime(0,T(72.6));pg.gain.linearRampToValueAtTime(.2,T(73.3));og.gain.setValueAtTime(0,T(3.7));og.gain.linearRampToValueAtTime(0,T(4.2));
  og.gain.setValueAtTime(0,T(72.6));og.gain.linearRampToValueAtTime(.2,T(73.3))}
 // voice chain: band-limited, a touch of room, then the same tape
 {const vh=F('highpass',140,.7,G(2.6,tape),G(.14,rv));const vl=F('lowpass',3900,.6,vh);vo.connect(vl)}
 // ---- instruments ----
 function kk(t,v){const o=O('sine',150,t,t+.6),g=G(0,mus);o.connect(g);o.frequency.setValueAtTime(155,t);o.frequency.exponentialRampToValueAtTime(47,t+.11);
  g.gain.setValueAtTime(v*.7,t);g.gain.exponentialRampToValueAtTime(.001,t+.5);
  const c=N(t,t+.02),cg=G(v*.25,mus);c.connect(F('lowpass',2500,.5,cg))}
 function sn(t,v){const g=G(0,mus,rv),n=N(t,t+.3);n.connect(F('bandpass',1700,.7,g));g.gain.setValueAtTime(v*.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.24);
  const o=O('triangle',200,t,t+.15),og=G(0,mus);o.connect(og);o.frequency.exponentialRampToValueAtTime(150,t+.1);og.gain.setValueAtTime(v*.45,t);og.gain.exponentialRampToValueAtTime(.001,t+.12)}
 function hh(t,v,op){const g=G(0,mus),n=N(t,t+.4);n.connect(F('highpass',7000,.7,g));g.gain.setValueAtTime(v*.16,t);g.gain.exponentialRampToValueAtTime(.001,t+(op?.32:.045))}
 function rim(t,v){const o=O('square',820,t,t+.05),g=G(0,mus,eIn);o.connect(F('bandpass',1600,4,g));g.gain.setValueAtTime(v*.18,t);g.gain.exponentialRampToValueAtTime(.001,t+.04)}
 function shk(t,v){const g=G(0,mus),n=N(t,t+.1);n.connect(F('bandpass',6500,1.5,g));g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.12,t+.03);g.gain.exponentialRampToValueAtTime(.001,t+.08)}
 function bass(t,m,d,v){const f=mf(m),g=G(0,mus),l=F('lowpass',420,.8,g);const o=O('sine',f,t,t+d+.2),o2=O('triangle',f,t,t+d+.2);
  o.connect(l);const g2=G(.35,l);o2.connect(g2);o.detune.value=o2.detune.value=(hb(t,3)-.5)*14;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.2,t+.012);g.gain.setTargetAtTime(v*.11,t+.05,.25);g.gain.setTargetAtTime(0,t+d,.05)}
 function pad(t,ns,cut,v){const g=G(0,mus,rv),f=F('lowpass',cut,.6,g),e=t+BAR+1.6;
  ns.forEach((m,i)=>[-8,7].forEach(c=>{const o=O('sawtooth',mf(m),t,e);o.detune.setValueAtTime(c+(hb(t,i)-.5)*18,t);o.detune.linearRampToValueAtTime(c+(hb(t,i+9)-.5)*18,e);o.connect(f)}));
  const sb=O('triangle',mf(ns[0]-12),t,e);sb.connect(f);
  f.frequency.setValueAtTime(cut*.55,t);f.frequency.linearRampToValueAtTime(cut,t+BAR*.5);f.frequency.linearRampToValueAtTime(cut*.6,e);
  env(g,t,.8,BAR,e,v*.045)}
 function lead(t,m,d,v){const f=mf(m)*(1+(hb(t,5)-.5)*.012),g=G(0,mus,eIn,rv),l=F('lowpass',1700,1.5,g);
  [['square',5],['triangle',-6]].forEach(([ty,c])=>{const o=O(ty,f,t,t+d+.3);o.detune.value=c;o.frequency.setValueAtTime(f*.965,t);o.frequency.setTargetAtTime(f,t,.05);
   const vb=O('sine',4.7,t,t+d+.3),vg=G(0,o.frequency);vb.connect(vg);vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(f*.008,t+Math.min(d,.6));
   o.connect(ty=='square'?G(.35,l):l)});
  env(g,t,.03,d,d+.25,v*.11)}
 function bell(t,m,v){const f=mf(m),g=G(0,mus,eIn,rv),c=O('sine',f,t,t+2.2),md=O('sine',f*2,t,t+2.2),mg=G(f*1.4,c.frequency);md.connect(mg);c.connect(g);
  mg.gain.setValueAtTime(f*1.4,t);mg.gain.exponentialRampToValueAtTime(f*.02,t+.7);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.004);g.gain.exponentialRampToValueAtTime(.001,t+2)}
 // ghost choir: detuned saws through vowel formants that drift from 'ah' to 'oo'
 function choir(t,ns,v){const g=G(0,mus,rv,eIn),mx=G(1),e=t+BAR+1.4;
  [[750,330],[1200,900],[2500,2250]].forEach(([a,b],i)=>{const f=F('bandpass',a,8,G([1,.5,.25][i],g));f.frequency.setValueAtTime(a,t);f.frequency.linearRampToValueAtTime(b,e);mx.connect(f)});
  ns.forEach((m,i)=>[-11,10].forEach(c=>{const o=O('sawtooth',mf(m+12),t,e);o.detune.value=c+i*2;o.connect(mx)}));env(g,t,1.2,BAR,e,v*.17)}
 function beep(t){const o=O('sine',1000,t,t+.09),g=G(.12,mus);o.connect(g)}
 function speak(L){const t0=base+L.t,k=L.ch?1.17:1,f0=L.ch?208:98,e=t0+L.d+.3;
  const o=O('sawtooth',f0,t0-.05,e),src=G(0);o.connect(src);
  const n=N(t0-.05,e),ng=G(0),nf=F('bandpass',3000,2.2,vo);n.connect(ng);ng.connect(nf);
  const fs=[7,9,12].map((q,j)=>{const x=F('bandpass',500*(j+1),q,G([1,.6,.32][j],vo));src.connect(x);return x});
  for(const p of L.ph){const at=t0+p[0];
   fs.forEach((f,j)=>{if(p[2+j])f.frequency.setTargetAtTime(p[2+j]*k,at,.016)});
   src.gain.setTargetAtTime(p[5],at,.012);ng.gain.setTargetAtTime(p[6],at,.008);if(p[7])nf.frequency.setTargetAtTime(p[7],at,.01);
   if(p[8])o.frequency.setTargetAtTime(f0*p[8],at,.04)}
  src.gain.setTargetAtTime(0,t0+L.d,.03);ng.gain.setTargetAtTime(0,t0+L.d,.01);
  // duck the music under the voice
  mus.gain.setTargetAtTime(.62,t0-.1,.12);mus.gain.setTargetAtTime(1,t0+L.d+.1,.4)}
 // ---- arrangement ----
 function bar(b,t){const c=CH[PR[b]],ns=c.slice(1),dm=DM(b);
  const cut=b<4?500+b*120:b<12?1200:b<22?1500:b<32?1400:b<44?2300:b<56?1000+(b-44)*130:b<64?1300:b<70?1600:900;
  const pv=b<4?.5+b*.15:b>=70?1-(b-70)*.2:b>=32&&b<36?1.15:1;
  pad(t,ns,cut,pv);
  if(b==3)beep(t);
  // filmstrip chime at each new part
  if([12,22,32,44,56,64].includes(b)){bell(t,86,.07);bell(t+BEAT*.5,81,.06)}
  if((b>=33&&b<44)||b>=68)choir(t,ns,b>=68?.7:1);
  // bass
  if(b>=4&&b<72){const ks=kicks(b);if(dm<2||!ks.length){bass(t,c[0],BAR*(dm==3?.48:.95),.8);if(dm==3)bass(t+BAR/2,c[0],BAR*.45,.6)}
   else ks.forEach((s,i)=>{const e=i+1<ks.length?ks[i+1]:16;bass(t+st(s),c[0]+(s==10&&hb(b,4)>.55?12:0),(e-s)*S16*.9,i?.75:1)})}
  // drums
  for(const s of kicks(b))kk(t+st(s),s?.75:1);
  if(dm==2||dm==4){sn(t+st(4)+.012,1);sn(t+st(12)+.012,1);if(hb(b,6)>.55)sn(t+st(15),.22);if(hb(b,7)>.6)sn(t+st(7),.15)}
  if(dm==3)sn(t+st(8)+.015,1);
  if([21,31,43,55,63].includes(b))for(let s=12;s<16;s++)sn(t+st(s),.35+(s-12)*.2);
  if(dm)for(let s=0;s<16;s+=dm==4?1:2)hh(t+st(s),(dm==1?.4:1)*(s%4==2?1:s%2?.35:.6),s==14&&hb(b,8)>.6);
  if(b>=22&&b<32){rim(t+st(3),.8);rim(t+st(11),.6);if(hb(b,9)>.5)rim(t+st(14),.4)}
  if(dm==4)for(let s=0;s<16;s++)shk(t+st(s),s%2?.6:1);
  // music box
  const bo=(b>=4&&b<16)||(b>=22&&b<26)||(b>=30&&b<36)||b>=64,qt=(b>=32&&b<36)||b>=70,AR=[0,2,1,3,2,1,3,0];
  if(bo)for(let i=0;i<8;i++)if((!qt||i%2==0)&&hb(b,i+20)>.25)bell(t+st(i*2),ns[AR[i]]+12+(hb(b,i+40)>.85?12:0),.05);
  // lead
  const L=LEAD[b];if(L)for(let i=0;i<16;i++){const ch=L[i];if(ch in LN){let j=i+1;while(L[j]=='-')j++;lead(t+st(i),LN[ch],(j-i)*S16,b>=36&&b<40?.8:1)}}
  // narration lines starting in this bar
  LINES.forEach(L=>{if(Math.floor(L.t/BAR+1e-6)==b)speak(L)})}
 function sched(b){bag=[];
  if(b>3&&BAGS[b-4]){BAGS[b-4].forEach(n=>n.disconnect());BAGS[b-4]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.12-from,sched=setup(A,base);let b=Math.max(0,Math.ceil(from/BAR-.001));
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,kick,LINES,BPM,BAR,BEAT,BARS,LEN}})();
