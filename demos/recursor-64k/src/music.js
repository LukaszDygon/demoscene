// RECURSOR soundtrack: 170 BPM drill'n'bass. Hyper-edited synthesized breaks (ratchets, stutters, pitch-swept
// snare rolls, gaps of silence), a squelching resonant acid line, reese, and a fragile FM music-box for the drops.
// SONG.ev(bar) is the single source of truth for drum hits; the visuals read it for their cuts.
var SONG=(()=>{
const BPM=170,BAR=240/BPM,BARS=128,LEN=BARS*BAR+6,ST=BAR/16,
// sections: boot, tesseract, corridor, drop, menger, hyperbolic, drop, collapse, end
SB=[0,8,24,40,48,72,88,96,120,128],
sec=b=>{let i=0;while(b>=SB[i+1])i++;return i},
RN=a=>()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},
TP=['k.k.s..gs.gks.gs','k..ks.g.kk.gs.sg','k.gks.gsk.gks.ss','k.......s.....g.','kkg.s.gkk.gksggs'],
EV=[];
// events [16th step, type (0 kick 1 snare 2 hat 4 crash 5 edit marker 6 break chop), velocity, pitch|rate, chop slice]; gap = [from,to) steps of silence
function ev(b){if(EV[b])return EV[b];
 const r=RN(b*977+13),s=sec(b),lb=b-SB[s],ln=SB[s+1]-SB[s],I=[0,.45,.6,0,.85,.6,0,1,0][s];
 let e=[],gap=null;const add=(st,ty,v,p=1,k=0)=>e.push([st,ty,v,p,k]),cut=(a,z)=>e=e.filter(x=>x[0]<a||x[0]>=z);
 if(I){
  const tp=TP[s==5?lb<8?3:4:s==7?r()*5|0:(lb>>1)%3+(s==4)];
  for(let i=0;i<16;i++){const c=tp[i];
   c=='k'&&add(i,0,1);c=='s'&&add(i,1,1);c=='g'&&add(i,1,.35);
   if(s==5){add(i,2,i%4==2?.9:.5);r()<.6&&add(i+.5,2,.25)}else if(i%2==0||r()<.5)add(i,2,i%4==2?.8:.4)}
  // ratchet: one hit retriggered 3-8 times inside two 16ths, pitch creeping up
  if(r()<I){const a=1+r()*13|0,n=[3,4,6,8][r()*4|0],ty=r()<.6?1:r()<.5?0:2;cut(a,a+2);for(let j=0;j<n;j++)add(a+j*2/n,ty,.5+.5*j/n,1+j*.07);add(a,5,1)}
  // stutter: the second half of the bar is a looped 1-2 step slice
  if(r()<I*.6){const a=(r()*3|0)*4,len=r()<.5?2:1,ch=e.filter(x=>x[0]>=a&&x[0]<a+len&&x[1]<5);cut(8,16);
   for(let k=8;k<16;k+=len)ch.forEach(x=>add(k+x[0]-a,x[1],x[2],x[3]*(1+(k-8)*.03)));add(8,5,1)}
  // break chops: a beat or two re-sliced from the sampled break, repeated, pitched, reversed
  if((s==2||s==4||s==5||s==7)&&r()<I*.55){const a=4*(1+r()*3|0),n=r()<.5?4:8,k0=r()*16|0,rr=[1,1,2,1.5,.5,-1,-2][r()*7|0];cut(a,a+4);
   for(let j=0;j<n;j++)add(a+j*4/n,6,1,j>n/2&&r()<.5?-rr:rr,r()<.6?k0:k0+j&15);add(a,5,1)}
  // pitch-swept snare roll into the next phrase
  if(lb%4==3&&r()<.4+I*.5||lb==ln-1){cut(12,16);const n=r()<.5?8:16,up=r()<.7;
   for(let j=0;j<n;j++)add(12+j*4/n,1,.3+.7*j/n,up?1+j/n*1.2:1.4-j/n*.6);add(12,5,1)}
  // sudden silence
  else if(r()<I*.3&&lb>0){const a=4+(r()*2|0)*4;gap=[a,a+(r()<.5?2:4)];cut(gap[0],gap[1]);add(a,5,1)}
  // the collapse's last four bars: a ratchet on every beat
  if(s==7&&lb>19)for(let k=0;k<16;k+=4){const n=[3,4,6][r()*3|0];for(let j=0;j<n;j++)add(k+2+j*2/n,j%2,.6+.4*j/n,1+j*.1+lb*.02)}
  // hard stops before the vertex and in the middle of the collapse
  if(b==63||b==103){gap=[8,16];cut(8,16);add(8,5,1)}
  lb||add(0,4,1);
 }else if(lb==ln-1&&s<8){for(let j=0;j<12;j++)add(j,1,.15+.6*j/12,.7+j/24);for(let j=0;j<8;j++)add(12+j/2,1,.85,1.3+j*.12)}
 if(b==126)add(0,4,1);
 e.sort((x,y)=>x[0]-y[0]);
 return EV[b]={e,gap,s,lb}}
// acid patterns (E phrygian + tritone): [semitone, accent, slide] per 16th
const SC=[0,0,0,12,1,3,7,6,10,13,-2,0],
pat=sd=>{const r=RN(sd),p=[];for(let i=0;i<16;i++)p.push(r()<.7?[SC[r()*12|0]+(r()<.15?12:0),r()<.3,r()<.25]:0);p[0]=[0,1,0];return p},
PB=[1,1,2,0,3,4,0,5,0].map(x=>x&&pat(x*7919+3)),PB2=[1,6,7,0,8,4,0,9,0].map(x=>x&&pat(x*104729+11)),
ML=[0,7,11,15,12,7,3,,0,7,11,14,13,,7,,-1,6,11,14,12,6,3,,0,3,7,11,12,15,19,,];
function setup(A,base){
 const SR=A.sampleRate;
 let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const O=(type,f,t,end)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.value=f;o.start(t);o.stop(end);return o};
 const F=(type,f,q)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;return x};
 const SH=k=>{const w=A.createWaveShaper(),c=new Float32Array(1024);for(let i=0;i<1024;i++)c[i]=Math.tanh(k*(i/511.5-1))/Math.tanh(k);w.curve=c;return w};
 const NB=A.createBuffer(1,SR*2,SR),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const N=(T,d)=>{const s=keep(A.createBufferSource());s.buffer=NB;s.start(T,Math.random()*.4);s.stop(T+d);return s};
 const env=(g,T,v,a,d)=>{g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+a);g.gain.setTargetAtTime(0,T+a,d)};
 // master: everything musical goes through M (ducked by the voice), then a hard compressor
 const comp=A.createDynamicsCompressor();comp.threshold.value=-12;comp.ratio.value=8;comp.attack.value=.002;comp.release.value=.1;
 const lim=SH(1.4);comp.connect(lim);lim.connect(G(.9,A.destination));
 const master=G(.62,comp),M=G(1,master);
 const kIn=G(1),ks=SH(6),dIn=G(1),ds=SH(2.5),cIn=G(1),cs=A.createWaveShaper(),cc=new Float32Array(256);for(let i=0;i<256;i++)cc[i]=Math.round((i/127.5-1)*5)/5;cs.curve=cc;cIn.connect(cs);cs.connect(G(.5,M));
 let KB=kIn,DB=dIn;const bIn=G(1),bs=SH(5),bl=F('lowpass',5000,.5),mIn=G(1,M);
 kIn.connect(ks);ks.connect(G(.55,M));dIn.connect(ds);ds.connect(G(.5,M));bIn.connect(bs);bs.connect(bl);bl.connect(G(.32,M));
 // beat delay for the music box and blips (3/16 feedback)
 const dl=A.createDelay(1);dl.delayTime.value=ST*3;const fbk=G(.38,dl),dlo=F('lowpass',3000,.5);mIn.connect(dl);dl.connect(dlo);dlo.connect(fbk);dlo.connect(G(.5,M));
 const V=window.VOICE&&VOICE.build(A,G(.7,master),M.gain,ST);
 // a one-bar break synthesized sample by sample (kick, snare, hats, small room), plus a reversed copy, for chopping
 const BL=Math.ceil(BAR*SR),BR=A.createBuffer(1,BL,SR),BV=A.createBuffer(1,BL,SR),bd=BR.getChannelData(0);
 for(let i=0;i<16;i++){const c='k.hks.hkh.k.s.gs'[i],o=Math.round(i*ST*SR);let z=0;
  for(let j=0;j<SR*.3&&o+j<BL;j++){const x=j/SR,w=Math.random()*2-1,hp=w-z;z=w;
   bd[o+j]+=c=='k'?Math.sin(6.283*(45*x+6.2*(1-Math.exp(-30*x))))*Math.exp(-x*13):c=='s'||c=='g'?(w*Math.exp(-x*20)*.75+Math.sin(1194*x)*Math.exp(-x*30)*.5)*(c=='g'?.35:1):0;
   bd[o+j]+=hp*Math.exp(-x*(c=='h'?40:110))*.18}}
 for(const d of[.023,.031,.041])for(let i=d*SR|0;i<BL;i++)bd[i]+=bd[i-(d*SR|0)]*.22;
 {let m=0;for(const x of bd)m=Math.max(m,Math.abs(x));const bv=BV.getChannelData(0);for(let i=0;i<BL;i++){bd[i]/=m;bv[BL-1-i]=bd[i]}}
 function chop(T,v,rt,k){const s=keep(A.createBufferSource()),g=G(0,DB),a=Math.abs(rt),d=ST*.98;s.buffer=rt<0?BV:BR;s.playbackRate.value=a;
  s.start(T,rt<0?BAR-(k+1)*ST:k*ST,d*a);s.connect(g);g.gain.setValueAtTime(.95*v,T);g.gain.setValueAtTime(.95*v,T+d-.005);g.gain.linearRampToValueAtTime(0,T+d)}
 // --- instruments ---
 function kick(T,v){const o=O('sine',50,T,T+.4),g=G(0,KB);o.frequency.setValueAtTime(230,T);o.frequency.exponentialRampToValueAtTime(43,T+.09);env(g,T,v,.002,.09);o.connect(g);N(T,.012).connect(G(.4*v,KB))}
 function snare(T,v,p){const n=N(T,.3),f=F('bandpass',1700*p,.9),g=G(0,DB);n.connect(f);f.connect(g);env(g,T,.9*v,.001,.055/Math.sqrt(p));
  const o=O('triangle',210*p,T,T+.12),og=G(0,DB);o.frequency.exponentialRampToValueAtTime(140*p,T+.05);o.connect(og);env(og,T,.7*v,.001,.03)}
 function hat(T,v){const n=N(T,.06),f=F('highpass',7500,.7),g=G(0,DB);n.connect(f);f.connect(g);env(g,T,.3*v,.001,.014)}
 function crash(T){const n=N(T,1.6),f=F('highpass',2800,.5),g=G(0,dIn);n.connect(f);f.connect(g);env(g,T,.4,.002,.35);kick(T,1.2)}
 function acid(T,f,d,acc,from,cut,q){const o=O('sawtooth',f,T,T+d+.04),fl=F('lowpass',cut,q),g=G(0,bIn);
  if(from){o.frequency.setValueAtTime(from,T);o.frequency.exponentialRampToValueAtTime(f,T+.05)}
  fl.frequency.setValueAtTime(cut*(acc?5:2.6),T);fl.frequency.setTargetAtTime(cut,T,acc?.07:.035);
  const v=acc?.5:.32;g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+.003);g.gain.setValueAtTime(v,T+d);g.gain.linearRampToValueAtTime(0,T+d+.025);o.connect(fl);fl.connect(g)}
 function reese(T,d,f){const g=G(0,bIn),fl=F('lowpass',380,3);fl.connect(g);[.992,1.008,.5].forEach(m=>O('sawtooth',f*m,T,T+d+.05).connect(fl));
  g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.22,T+.04);g.gain.setValueAtTime(.22,T+d-.04);g.gain.linearRampToValueAtTime(0,T+d)}
 function bell(T,f,v){const c=O('sine',f,T,T+2.4),m=O('sine',f*3.51,T,T+2.4),mg=G(0),g=G(0,mIn);m.connect(mg);mg.connect(c.frequency);
  mg.gain.setValueAtTime(f*2.4*v,T);mg.gain.setTargetAtTime(0,T,.2);c.connect(g);env(g,T,.14*v,.002,.45)}
 function pad(T,d,f,v){const g=G(0,M),fl=F('lowpass',900,.7);fl.connect(g);[1,1.006,1.498].forEach(m=>O('triangle',f*m,T,T+d).connect(fl));
  g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+d*.4);g.gain.linearRampToValueAtTime(0,T+d)}
 function riser(T,d,v){const n=N(T,d),f=F('bandpass',300,4),g=G(0,M);n.connect(f);f.connect(g);f.frequency.exponentialRampToValueAtTime(9000,T+d);
  g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+d-.01);g.gain.linearRampToValueAtTime(0,T+d)}
 // metallic stab: detuned square tritone cluster through a resonant bandpass
 function stab(T,f,v){const fl=F('bandpass',f*4,3),g=G(0,bIn);fl.connect(g);[1,1.414,1.782,2.01].forEach(m=>O('square',f*m,T,T+.2).connect(fl));env(g,T,v,.002,.05)}
 // acid lead: fast square arpeggio, each note a 32nd
 function lead(T,f,v){const o=O('square',f,T,T+.07),fl=F('lowpass',f*6,6),g=G(0,mIn);o.connect(fl);fl.connect(g);env(g,T,v,.002,.03)}
 // corridor clank: ring-modulated sine ping
 function clank(T,f){const o=O('sine',f,T,T+.5),m=O('sine',f*1.41,T,T+.5),g=G(0,mIn),rg=G(0,g);m.connect(rg.gain);o.connect(rg);env(g,T,.18,.001,.12)}
 // detuned supersaw chord swelling open (the collapse)
 function swell(T,d,f){const g=G(0,M),fl=F('lowpass',200,4);fl.connect(g);fl.frequency.exponentialRampToValueAtTime(3500,T+d);for(let j=0;j<5;j++)O('sawtooth',f*(1+(j-2)*.009),T,T+d).connect(fl);
  g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(.05,T+d*.8);g.gain.linearRampToValueAtTime(0,T+d)}
 // reversed snare: noise swelling into the hit
 function rev(T,d){const n=N(T,d),f=F('bandpass',1900,1.2),g=G(0,DB);n.connect(f);f.connect(g);g.gain.setValueAtTime(.001,T);g.gain.exponentialRampToValueAtTime(.5,T+d);g.gain.linearRampToValueAtTime(0,T+d+.01)}
 function blip(T,f,v){const o=O('square',f,T,T+.014);o.connect(G(v,mIn))}
 function sub(T,d,v){const o=O('sine',41.2,T,T+d),g=G(0,M);o.connect(g);g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(v,T+.4);g.gain.setValueAtTime(v,T+d-.4);g.gain.linearRampToValueAtTime(0,T+d)}
 // --- arrangement for bar b at context time t ---
 function bar(b,t){const E=ev(b),s=E.s,_=(KB=E.s==5?cIn:kIn,DB=E.s==5?cIn:dIn),lb=E.lb,g=E.gap,gp=x=>g&&x>=g[0]&&x<g[1],r=RN(b*31+7);
  E.e.forEach(([st,ty,v,p,k])=>{const T=t+st*ST;ty==6?chop(T,v,p,k):ty==0?kick(T,v):ty==1?snare(T,v,p*[1,1,.85,1,1.12,1,1,1.05,1][s]):ty==2?hat(T,v):ty==4&&crash(T)});
  // acid line
  const P=((lb>>2)&1&&s!=5?PB2:PB)[s];
  if(P&&b>1){const mu=s==4||s==7?.22:.07,L=s==5?12:16,
   cut=s?[0,500,700,0,900,650,0,1200][s]*(1+.55*Math.sin(b*.83)):120+b*95,q=[13,15,18,0,20,17,0,22][s];
   let from=0;
   for(let i=0;i<16;i++){const gi=s==5?(b*16+i)%12:i;let n=P[gi];if(r()<mu)n=r()<.4?0:[SC[r()*12|0],r()<.4,r()<.3];
    if(!n||gp(i)){from=0;continue}
    const f=82.4*2**((n[0]+(s==7&&lb%4==3?12:0)+(s==2&&lb%8>5?1:0))/12),sl=n[2]&&P[(gi+1)%L];
    acid(t+i*ST,f,sl?ST*1.02:ST*.5,n[1],from,cut,q);from=sl?f:0}}
  // reese under the corridor, the hyperbolic plane and the collapse
  if(s==2||s==5||s==7){const rt=41.2*2**([0,0,1,-2][lb>>2&3]/12);for(let i=0;i<16;i+=8)if(!gp(i)&&!gp(i+4))reese(t+i*ST,ST*8,rt*2)}
  // stabs on the edit markers, clanks in the corridor, the acid lead in the menger and the collapse
  if(s==1||s==2||s==7)E.e.forEach(([st,ty])=>ty==5&&!gp(st)&&stab(t+st*ST,82.4*2**([0,1,6,-2][b&3]/12),.22));
  if(s==2)for(let i=3;i<16;i+=8)gp(i)||clank(t+i*ST,[660,990,740,1245][(b+i)&3]);
  if(s==4&&lb<16&&lb%4>1||s==7&&lb%2){const ar=[0,3,7,12,13,7,6,10],ph=r()*8|0;for(let i=0;i<32;i++)gp(i/2)||r()<.25||lead(t+i*ST/2,329.6*2**(ar[(i*3+ph)%8]/12+(i>23?1:0)),.07)}
  // glitch blips
  for(let i=0,n=[6,2,3,1,3,2,1,5,0][s];i<n;i++){const st=r()*32|0;gp(st/2)||blip(t+st*ST/2,[880,1760,2637,3520,4186][r()*5|0],.05)}
  // the fragile music box: drops, the end, and recalled inside the menger and the collapse
  if(s==3||s==6)for(let i=0;i<8;i++){const n=ML[(s==6?31-(lb%4*8+i):lb%4*8+i)];n!=null&&bell(t+i*2*ST,659.3*2**((n-(lb>3&&i>3?12:0))/12)*(s==6?1.018:1),lb==7&&i>5?.4:.8)}
  if(s==4&&lb>15||s==7&&lb>15)for(let i=0;i<16;i++){const n=ML[(lb%2*16+i)%32];n!=null&&!gp(i)&&bell(t+i*ST,1318.5*2**(n/12),.35)}
  if(s==8&&b<126)bell(t,659.3*2**([0,7,11,15,12,7,3,0][lb]/12),.7);
  if(s==6)for(let i=3;i<8;i++){const n=ML[31-(lb%4*8+i-3)];n!=null&&bell(t+i*2*ST,329.6*2**(n/12)*1.018,.45)}
  if(s==7&&lb>7&&lb<16&&lb%2==0)[0,7,13,15].forEach(n=>swell(t,BAR*2,164.8*2**(n/12)));
  if((s==1||s==2||s==4||s==7)&&r()<.3&&!gp(11))rev(t+8*ST,4*ST);
  if(s==3||s==6)pad(t,BAR*1.05,164.8*(s==6&&lb%2?1.06:1),.07);
  if((s==0||s==3||s==6||s==8)&&b%2==0)sub(t,BAR*2+.3,s==8?.1:.13);
  // risers into each slam
  if((s==0||s==3||s==6)&&b==SB[s+1]-1)riser(t,BAR,.22);
  if(s==7&&lb>19)riser(t,BAR,.12+lb*.004);
  if(V)VOICE.N.forEach(l=>l[0]==b&&V(l,t+l[1]*ST))}
 function sched(b){bag=[];
  if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}
  BAGS[b]=bag;bar(b,base+b*BAR)}
 bag=[];sched.out=lim;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.max(0,Math.ceil(from/BAR-.001));
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,ev,sec,SB,BPM,BAR,BARS,LEN,ST}})();
