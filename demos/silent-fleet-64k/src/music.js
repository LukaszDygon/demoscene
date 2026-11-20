var SONG=(()=>{
const BPM=72,BAR=240/BPM,BEAT=60/BPM,BARS=30,LEN=BARS*BAR+6;
const mf=m=>440*2**((m-69)/12);
const PROG=[[50,53,57,60],[46,50,53,57],[43,46,50,53],[45,48,52,55]];
const VOW=[[700,1220,2600],[320,800,2400],[300,2300,3000]];
const VSEQ=[[9,0],[13,1],[17,2],[21,0],[25,1],[27,2]];
const MEL=[74,77,72,69,70,74,69,65];
const LEAD=[62,65,69,74,72,69,65,62,67,70,74,70];
function setup(A,base){
 const SR=A.sampleRate;let bag=[];const BAGS=[],keep=n=>(bag.push(n),n);
 const T=b=>base+b*BAR;
 const G=(v,...to)=>{const g=keep(A.createGain());g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const F=(type,f,q,...to)=>{const x=keep(A.createBiquadFilter());x.type=type;x.frequency.value=f;x.Q.value=q;to.forEach(n=>x.connect(n));return x};
 const LO=(type,f,to)=>{const o=A.createOscillator();o.type=type;o.frequency.value=f;o.connect(to);o.start(base);o.stop(base+LEN);return o};
 const rampTo=(p,pts)=>pts.forEach(([b,v],i)=>i?p.linearRampToValueAtTime(v,T(b)):p.setValueAtTime(v,T(b)));
 const env=(g,t,a,h,r,v)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+h);g.gain.linearRampToValueAtTime(0,t+r)};
 const comp=A.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;comp.attack.value=.01;comp.release.value=.5;comp.connect(A.destination);
 const master=G(.36,comp);
 const ir=A.createBuffer(2,SR*3.5|0,SR);
 for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<d.length;i++){const x=i/SR;d[i]=(Math.random()*2-1)*Math.exp(-x*1.7)*(x<.01?x/.01:1)}}
 const rev=A.createConvolver();rev.buffer=ir;rev.connect(G(.6,master));
 const dl=A.createDelay(2);dl.delayTime.value=BEAT*1.5;const fbk=G(.38),dlp=F('lowpass',1800,.5,fbk,rev,master);dl.connect(dlp);fbk.connect(dl);
 const nb=A.createBuffer(1,SR*3|0,SR),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const cbuf=A.createBuffer(1,SR*3|0,SR),cd=cbuf.getChannelData(0);for(let i=0;i<cd.length;i++)cd[i]=Math.random()<.003?Math.random()*2-1:0;
 const dr=G(0,master,rev),dc=F('lowpass',180,2,dr),sg=G(.14,dc);
 LO('sine',mf(26),G(.5,dr));LO('sawtooth',mf(38),sg);LO('sawtooth',mf(38)*1.006,sg);LO('sawtooth',mf(45),G(.04,dc));
 rampTo(dr.gain,[[0,0],[1,.3],[9,.32],[22,.34],[27,.4],[29.5,0]]);
 rampTo(dc.frequency,[[0,160],[9,240],[22,300],[27,520],[29,260]]);
 for(let g=0;g<3;g++){
  const cb=G(0,master,rev),f1=F('bandpass',700,6,cb),f2=F('bandpass',1220,8,cb),f3=F('bandpass',2600,10,cb),cin=G(1,f1,f2,f3),sh=[12,0,-12][g],lv=[.4,.3,.2][g],sv=(g+1)%3;
  const vo=[];for(let j=0;j<4;j++)for(const d of[-8,0,8]){const o=LO('sawtooth',mf(PROG[0][j]+sh),cin);o.detune.value=d;vo.push(o)}
  vo.forEach((o,k)=>{const j=k/3|0;for(let b=0;b<BARS;b+=2)o.frequency.setValueAtTime(mf(PROG[(b>>1)&3][j]+sh),T(b))});
  [f1,f2,f3].forEach((f,k)=>rampTo(f.frequency,[[0,VOW[sv][k]],...VSEQ.map(([b,v])=>[b,VOW[(v+sv)%3][k]])]));
  rampTo(cb.gain,[[0,0],[8.5,0],[9.5,lv],[13,lv*1.2],[16,lv*.4],[17.5,lv*1.5],[23,lv*1.4],[25,lv*.8],[27,0]]);
 }
 const wv=G(0,master,rev),wf=[700,1220,2600].map((f,k)=>F('bandpass',f,9,wv)),wi=G(1,...wf),wsrc=A.createBufferSource();
 wsrc.buffer=nb;wsrc.loop=true;wsrc.connect(wi);wsrc.start(base);wsrc.stop(base+LEN);
 rampTo(wv.gain,[[0,0],[12.5,0],[13.5,.05],[17,.09],[24,.06],[27,0]]);
 wf.forEach((f,k)=>rampTo(f.frequency,[[0,VOW[2][k]],...VSEQ.map(([b,v])=>[b,VOW[(v+2)%3][k]])]));
 const rg=G(0,master),rf=F('lowpass',400,.8,rg),rn=A.createBufferSource();rn.buffer=nb;rn.loop=true;rn.connect(rf);rn.start(T(26.9));rn.stop(base+LEN);
 const cg=G(0,master),cf=F('highpass',1800,.7,cg),cn=A.createBufferSource();cn.buffer=cbuf;cn.loop=true;cn.connect(cf);cn.start(T(26.9));cn.stop(base+LEN);
 rampTo(rg.gain,[[26.9,0],[27,1.5],[28.5,1.6],[29.6,1.6],[29.9,0]]);
 rampTo(cg.gain,[[26.9,0],[27,.9],[29.6,.9],[29.9,0]]);
 rampTo(rf.frequency,[[26.9,300],[28,2400],[29.6,700]]);
 bag=[];
 function breath(b,t){if(b>=27)return;const s=keep(A.createBufferSource());s.buffer=nb;s.start(t,Math.random());s.stop(t+BAR);
  const g=G(0,master),bp=F('bandpass',1100,.7,g);s.connect(bp);env(g,t,1.3,1.8,BAR*.98,b>=13&&b<17?.22:.12)}
 function ping(t,v){const g=G(0,master,dl),o=keep(A.createOscillator());o.type='sine';o.frequency.value=1760;o.connect(g);o.start(t);o.stop(t+1);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+.9)}
 function bell(t,m){const g=G(0,master,rev,dl),o=keep(A.createOscillator()),o2=keep(A.createOscillator());o.type='sine';o2.type='triangle';o.frequency.value=mf(m);o2.frequency.value=mf(m)*2.76;
  o.connect(g);o2.connect(G(.25,g));o.start(t);o2.start(t);o.stop(t+3);o2.stop(t+3);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.2,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+3)}
 function lead(t,m){const g=G(0,master,rev),o=keep(A.createOscillator()),l=keep(A.createOscillator()),lg=G(14,o.detune),x=F('lowpass',1400,.8,g);
  o.type='sawtooth';o.frequency.value=mf(m);l.frequency.value=5.2;l.connect(lg);o.connect(x);o.start(t);l.start(t);o.stop(t+BEAT*1.9);l.stop(t+BEAT*1.9);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12,t+.12);g.gain.setValueAtTime(.12,t+BEAT*1.2);g.gain.linearRampToValueAtTime(0,t+BEAT*1.9)}
 function tick(t){const s=keep(A.createBufferSource());s.buffer=nb;s.start(t,Math.random());s.stop(t+.03);const g=G(0,master),bp=F('bandpass',4200,3,g);s.connect(bp);g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.001,t+.02)}
 function bass(b,t){const g=G(0,master),o=keep(A.createOscillator());o.type='sine';o.frequency.value=mf(PROG[(b>>1)&3][0]-24);o.connect(g);o.start(t);o.stop(t+BAR);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.3,t+.08);g.gain.exponentialRampToValueAtTime(.001,t+BAR*.95)}
function kick(t,v){const g=G(0,master),o=keep(A.createOscillator());o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(38,t+.15);o.connect(g);o.start(t);o.stop(t+.5);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+.45)}
 function bar(b,t){breath(b,t);
  if(b>=4&&b<27){ping(t,.16);if(b<19)ping(t+2*BEAT,.1)}
  if(b>=9&&b<27)bass(b,t);
  if(b>=13&&b<27){tick(t+BEAT);tick(t+3*BEAT)}
  if(b>=14&&b<24){bell(t,MEL[(2*(b-14))%8]);bell(t+2*BEAT,MEL[(2*(b-14)+1)%8])}
  if(b>=22&&b<27){kick(t,.5);kick(t+2*BEAT,.4)}
  if(b>=20&&b<24)bell(t+BEAT,MEL[(b*3)%8]-3);
  if(b>=17&&b<24)for(let k=0;k<3;k++)lead(t+k*BEAT*1.3333,LEAD[((b-17)*3+k)%12])}
 function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,T(b))}
 sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
