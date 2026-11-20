var SONG=(()=>{
const BPM=120,BAR=2,BARS=68,LEN=BARS*BAR+4,ST=BAR/16;
const BO={'0':0,'1':12,'2':7,'3':3,'4':-12,'.':null};
// themes: c = [root MIDI, third] per chord (4-bar cycle); L/L2 = lead motifs for the first and second half of each 8-bar phrase
// (semitones over root+24, -1 rest); K/K2 kick, H/H2 hat, S snare, B/B2 bass: 16-step patterns, alternated by bar
// w = arp pulse duty; bw = bass wave
const TH=[
{c:[[40,3],[36,4],[43,4],[38,4]],L:[[7,10,12,15,12,10,7,-1],[7,12,16,12,7,4,0,-1],[11,14,18,14,11,7,2,-1],[9,14,17,14,9,5,2,-1]],L2:[[11,14,16,19,16,14,11,-1],[9,12,14,17,14,12,9,-1],[12,15,19,15,12,10,7,-1],[7,10,14,17,14,10,7,-1]],K:'1000100010001000',K2:'1000100010101000',S:'0000100000001000',H:'0101010101010101',H2:'0101010111010101',B:'0.0.1.0.0.0.1.0.',B2:'0.0.1.0.0.0.0.1.',w:25,bw:'triangle'},
{c:[[45,3],[41,4],[36,4],[43,4]],L:[[12,10,7,3,7,10,12,-1],[15,12,10,7,10,12,15,-1],[12,9,7,4,7,9,12,-1],[14,11,7,2,7,11,14,-1]],L2:[[15,12,10,7,12,15,10,-1],[14,11,9,6,11,14,9,-1],[12,15,19,15,12,9,5,-1],[10,12,15,19,15,12,10,-1]],K:'1000100010001000',K2:'1000100010011000',S:'0000100000001000',H:'1111111111111111',H2:'1011111110111111',B:'0010010100100101',B2:'0010010100101001',w:12,bw:'triangle'},
{c:[[36,4],[43,4],[45,3],[41,4]],L:[[19,16,12,16,19,21,24,-1],[19,16,14,19,16,12,-1,-1],[21,19,16,19,21,24,19,-1],[17,14,12,17,21,17,14,-1]],L2:[[24,21,19,16,21,24,19,-1],[21,19,16,14,16,19,21,-1],[17,21,24,21,17,14,12,-1],[16,19,21,24,21,19,16,-1]],K:'1000100000100010',K2:'1000000010001000',S:'0000100000001000',H:'1010101010101010',H2:'1010101000101010',B:'0.0.0.2.0.0.0.1.',B2:'0.1.0.0.0.2.0.0.',w:12,bw:'triangle'},
{c:[[38,3],[34,4],[41,4],[36,4]],L:[[12,15,12,10,7,10,12,-1],[10,12,15,12,10,7,10,-1],[13,15,17,15,13,10,8,-1],[12,10,8,10,12,15,17,-1]],L2:[[13,15,17,20,17,15,13,-1],[10,13,15,12,10,8,5,-1],[15,17,20,17,15,12,10,-1],[8,10,12,15,12,10,8,-1]],K:'1010100010101000',K2:'1010100010100010',S:'0000100000001000',H:'0101010101010101',H2:'0101010101011101',B:'0000110000001100',B2:'0000110001001100',w:25,bw:'square'},
{c:[[40,3],[41,4],[40,3],[45,3]],L:[[0,3,7,12,7,3,0,-1],[1,4,8,13,8,4,1,-1],[0,3,7,15,12,7,3,-1],[5,8,12,17,12,8,5,-1]],L2:[[1,4,8,13,8,4,1,-1],[0,4,8,12,8,4,0,-1],[3,7,10,15,10,7,3,-1],[5,8,12,17,12,8,5,-1]],K:'1000100110001001',K2:'1001001110010011',S:'0000100000001000',H:'0101010101010101',H2:'0101010101010111',B:'0011002000112100',B2:'0011002100112000',w:50,bw:'square'},
{c:[[45,3],[41,4],[43,4],[40,3]],L:[[12,15,19,24,19,15,12,-1],[17,21,24,21,17,12,-1,-1],[10,14,17,14,10,5,-1,-1],[12,15,19,15,12,7,4,-1]],L2:[[17,21,24,28,24,21,17,-1],[14,17,21,24,21,17,14,-1],[12,15,19,24,19,15,12,-1],[10,14,17,21,17,14,10,-1]],K:'0000000000000000',K2:'0000000000000000',S:'0000000000000000',H:'0000000000000000',H2:'0000000000000000',B:'0.2.0.1.0.2.0.1.',B2:'0.1.0.2.0.1.0.2.',w:50,bw:'triangle'},
{c:[[43,4],[40,3],[38,3],[45,3]],L:[[19,22,24,27,24,22,19,-1],[15,19,22,19,15,12,-1,-1],[17,21,24,21,17,14,12,-1],[14,17,21,24,21,17,14,-1]],L2:[[24,27,29,31,29,27,24,-1],[22,24,27,22,19,22,24,-1],[21,24,28,24,21,17,14,-1],[19,22,26,31,26,22,19,-1]],K:'1010101010101010',K2:'1111010111110101',S:'0000100000001000',H:'0101010101010101',H2:'1111111111111111',B:'0.2.0.3.0.2.0.3.',B2:'0.3.0.2.0.3.0.1.',w:12,bw:'square'},
{c:[[38,3],[43,4],[36,4],[40,3]],L:[[14,17,21,17,14,12,9,-1],[12,14,17,21,17,14,12,-1],[9,12,14,17,14,12,9,-1],[10,14,17,22,17,14,10,-1]],L2:[[17,21,24,21,17,14,12,-1],[14,17,21,24,21,17,14,-1],[12,14,17,21,17,14,12,-1],[9,12,14,17,12,9,-1,-1]],K:'1000000010000000',K2:'0000000010000000',S:'0000000000000000',H:'0010001000100010',H2:'0010001000100000',B:'0.0.0.0.1.0.0.0.',B2:'0.0.0.0.0.0.2.0.',w:50,bw:'triangle'}];
// sections: [from bar, to bar, theme, drums 0/1/2, lead, arp, bass, pad]
const SEC=[[0,12,0,1,1,1,1,0],[12,22,1,1,1,1,1,0],[22,32,2,1,1,1,1,0],[32,35,3,1,1,1,1,0],[35,37,3,0,0,0,1,1],[37,40,3,2,1,1,1,0],[40,52,4,2,1,1,1,0],[52,54,6,2,1,1,1,0],[54,56,4,0,0,0,0,0],[56,58,5,0,1,1,0,0],[58,61,0,0,0,0,0,0],[61,68,7,0,1,1,1,1]];
const hz=m=>440*Math.pow(2,(m-69)/12);
function setup(A,base){
const SR=A.sampleRate;let bag=[];const BAGS=[];
const keep=n=>(bag.push(n),n);
const comp=A.createDynamicsCompressor();comp.connect(A.destination);
const master=A.createGain();master.gain.value=.5;master.connect(comp);
const verb=A.createConvolver(),IR=A.createBuffer(2,SR*1.6|0,SR);
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
verb.buffer=IR;verb.connect(master);
const wet=A.createGain();wet.gain.value=.3;wet.connect(verb);
const NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=Math.random()*2-1;
const PW=d=>{const re=new Float32Array(32),im=new Float32Array(32);for(let n=1;n<32;n++)re[n]=2*Math.sin(n*Math.PI*d)/(n*Math.PI);return A.createPeriodicWave(re,im)};
const WV={};WV[50]=PW(.5);WV[25]=PW(.25);WV[12]=PW(.125);
const env=(t,d,v,to)=>{const g=A.createGain();g.gain.setValueAtTime(1e-4,t);g.gain.linearRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(1e-4,t+d);g.connect(to);return keep(g)};
const tone=(w,f,t,d,v,to)=>{const o=keep(A.createOscillator());(typeof w=='string')?(o.type=w):o.setPeriodicWave(w);o.frequency.value=f;o.connect(env(t,d,v,to));o.start(t);o.stop(t+d+.02)};
const sw=(type,f0,f1,t,d,v,to)=>{const o=keep(A.createOscillator());o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);o.connect(env(t,d,v,to));o.start(t);o.stop(t+d+.02)};
const nz=(t,d,f,type,v,to)=>{const s=keep(A.createBufferSource()),q=keep(A.createBiquadFilter());s.buffer=NB;s.loop=true;q.type=type;q.frequency.value=f;s.connect(q);q.connect(env(t,d,v,to));s.start(t,Math.random());s.stop(t+d+.02);return q};
function bar(b,t){
 const x=SEC.find(x=>b>=x[0]&&b<x[1]);if(!x)return;
 const[,end,ti,dm,ld,ar,bs,pd]=x,T=TH[ti],c=T.c[b%4],r=c[0],th=c[1],up=(b>>3)&1?12:0,M=[T.L,T.L2,T.L.map(q=>[...q].reverse()),T.L2.map(q=>q.map(n=>n<0?n:n+2))][(b>>2)&3],KK=b&1?T.K2:T.K,HH=b&1?T.H2:T.H,BB=b&1?T.B2:T.B;
 if(b==54){const q=nz(t,BAR*2,200,'lowpass',.35,wet);q.frequency.setValueAtTime(200,t);q.frequency.exponentialRampToValueAtTime(9000,t+BAR*2);nz(t,2,3000,'highpass',.25,wet);sw('sine',150,38,t,.3,.9,master)}
 if(b==11||b==21||b==31||b==39){const q=nz(t,BAR,300,'highpass',.3,wet);q.frequency.setValueAtTime(300,t);q.frequency.exponentialRampToValueAtTime(6000,t+BAR)}
 if(b==12||b==22||b==32||b==40)for(let k=0;k<4;k++)tone(WV[50],hz(r+36+[0,4,7,12][k]),t+k*ST*2,ST*2,.1,master);
 if(b==67)for(const n of[52,56,59])tone('triangle',hz(n),t,BAR*1.5,.09,wet);
 for(let s=0;s<16;s++){const st=t+s*ST,ev=s%2==0;
  if(dm){
   if(KK[s]=='1')sw('sine',150,38,st,.3,.9,master);
   if(T.S[s]=='1'){nz(st,.2,1800,'bandpass',.5,master);nz(st,.12,1400,'bandpass',.3,wet);tone('triangle',190,st,.1,.4,master)}
   if(HH[s]=='1')nz(st,.04,8000,'highpass',.2,master);
   if(dm==2&&s%8==6)nz(st,.2,7000,'highpass',.1,wet);
   if(dm==2&&s>=12&&b%2==1)nz(st,.05,9000,'highpass',.15,master);
   if(dm==2&&(s==3||s==10))for(const n of[0,th,7])tone(WV[25],hz(r+24+n),st,ST*2,.04,master);
   if(b==end-1&&s>=12&&ev)sw('sine',220,110,st,.15,.4,master);
  }
  if(ar){const n=[0,th,7,12,7,th][s%6]+(b>=20?12:0);tone(WV[T.w],hz(r+24+n+up),st,ST*1.6,b<6?.04:.07,master)}
  if(bs&&BB[s]!='.')tone(T.bw,hz(r+BO[BB[s]]),st,ST*.9,T.bw=='square'?.2:.42,master);
  if(ld&&ev){const n=M[b%4][s>>1];if(n>=0){tone(WV[50],hz(r+24+n+up),st,ST*1.8,.12,master);if(dm==2)tone('triangle',hz(r+24+n-4+up),st,ST*1.8,.06,master)}}
  if(pd&&s==0)for(const n of[0,th,7])tone('triangle',hz(r+12+n),t,BAR*.95,.07,wet);
  if(dm==2&&s%8==0)tone('sine',hz(r-12),st,ST*7,.22,master);
  if(dm&&ti==1&&s%2==1)tone('square',hz(r+24),st,ST*.5,.02,wet);
  if(ti==2&&(s==6||s==14))for(const n of[0,th,7])tone('sine',hz(r+36+n),st,ST*6,.05,wet);
  if(dm&&s==12&&b%2==0)tone(WV[12],hz(r+36+(b%3)*7),st,ST*2,.03,wet);
  if(ti==4&&s%4==0)for(const n of[0,th,7])tone('sawtooth',hz(r+24+n),st,ST*3,.03,master);
  if(ti==4&&ev){const n=M[b%4][s>>1];if(n>=0)tone('sawtooth',hz(r+36+n),st,ST*1.8,.03,master)}
  if((ti==3||ti==4)&&s==8)tone('sine',hz(r),st,ST*8,.16,master);
  if(ti==6&&s==0)for(const n of[0,th,7])tone(WV[25],hz(r+24+n),t,BAR*2,.05,wet);
  if(ti==3&&ev)tone('sawtooth',hz(r+36+(s>>2)*th),st,ST*1.6,.02,wet);
  if(b>=58&&b<61&&s%4==0){const k=(b-58)*4+(s>>2);if(k<10)tone(WV[50],k==9?440:880,st,.12,.2,master)}
 }
}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
const fx=k=>{const t=A.currentTime+.005;
 if(k=='hit'){nz(t,.07,2500,'bandpass',.45,master);sw('square',420,120,t,.07,.25,master)}
 else if(k=='boss'){sw('sine',140,30,t,.5,1,master);nz(t,.3,600,'lowpass',.5,master)}
 else if(k=='hurt'){sw('sawtooth',260,70,t,.18,.35,master);nz(t,.1,900,'lowpass',.3,master)}
 else if(k=='perfect'){[0,4,7,12].forEach((n,i)=>tone(WV[50],hz(76+n),t+i*.045,.12,.2,master))}
 else if(k=='poof'){nz(t,.25,6000,'highpass',.25,wet)}
 else if(k=='smash'){nz(t,.3,1200,'bandpass',.6,master);sw('square',200,60,t,.2,.3,master)}
 else if(k=='super'){nz(t,1.6,400,'lowpass',.5,wet);sw('sawtooth',60,40,t,1,.8,master)}
};
bag=[];return{sched,fx,out:master}
}
function live(A,from=0){const base=A.currentTime+.05-from,S=setup(A,base);let b=Math.ceil(from/BAR-.001);
 const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)S.sched(b++)};tick();const iv=setInterval(tick,100);
 return{base,fx:S.fx,stop(){clearInterval(iv);S.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),S=setup(A,0);S.sched(0);
 for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{S.sched(b);A.resume()});
 return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
