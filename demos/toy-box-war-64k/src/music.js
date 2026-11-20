var SONG=(()=>{
const BPM=100,BAR=240/BPM,BARS=76,Q=BAR/4,LEN=BARS*BAR+4,mt=m=>440*2**((m-69)/12);
const CH=[[50,0],[45,0],[47,1],[43,0],[50,0],[43,0],[45,0],[50,0]];
const CB=[[47,1],[43,0],[50,0],[45,0],[47,1],[43,0],[45,0],[50,0]];
const CM=[[50,0],[47,1],[43,0],[45,0],[50,0],[47,1],[43,0],[45,0]];
const P1=[[62,2],[66,1],[69,3],[67,1],[66,1],[64,2],[62,2],[0,2],[62,2],[66,1],[69,3],[71,1],[69,1],[67,2],[66,2],[0,2],[62,4]];
const P2=[[69,2],[71,2],[74,4],[72,2],[71,2],[69,4],[66,2],[62,4],[0,4],[62,2],[66,2],[69,2]];
const P3=[[57,1],[62,1],[66,2],[69,2],[71,1],[69,1],[66,2],[62,2],[57,2],[0,2],[59,1],[62,1],[66,2],[71,2],[74,2],[71,2],[69,2],[66,2],[62,4],[0,4]];
const K1=[[57,2],[59,2],[62,4],[64,2],[62,2],[59,4],[57,2],[62,2],[66,2],[62,2],[59,4],[57,4]];
const K2=[[62,8],[66,4],[69,8],[66,4],[62,8]];
const K3=[[69,2],[71,2],[74,2],[71,2],[69,4],[67,2],[66,2],[64,4],[66,2],[69,2],[71,4],[74,8]];
const SH=[[62,1],[66,1],[69,2],[66,2],[64,2],[62,2],[0,2],[62,1],[64,1],[66,2],[62,2],[59,2],[0,2],[57,2],[59,2],[62,4]];
const WZ=[[69,1],[66,2],[62,1],[64,2],[66,2],[69,2],[71,2],[69,2],[66,2],[64,2],[62,4]];
const DG=[[50,4],[49,4],[47,4],[45,4],[50,8]];
const FF=[[62,2],[66,2],[69,4],[71,2],[69,2],[74,8]];
const PO=[17,18.5,19.5,21,22.5,24,25.6,29.5,31,33,35,36.5,38,47,49.5,51,55,57,61,63,67,69];
function setup(A,base){
const SR=A.sampleRate;let bag=[],BAGS=[],s=7;const rnd=()=>(s=s*16807%2147483647)/2147483647,keep=n=>(bag.push(n),n);
const G=(v,...to)=>{const g=A.createGain();g.gain.value=v;to.forEach(n=>g.connect(n));return g};
const comp=A.createDynamicsCompressor(),mo=G(.6,A.destination);comp.connect(mo);
const verb=A.createConvolver(),IR=A.createBuffer(2,SR*2|0,SR);
for(let c=0;c<2;c++){const d=IR.getChannelData(c);for(let i=0;i<d.length;i++)d[i]=(rnd()*2-1)*(1-i/d.length)**3}
verb.buffer=IR;verb.connect(comp);
const NB=A.createBuffer(1,SR,SR),nd=NB.getChannelData(0);for(let i=0;i<SR;i++)nd[i]=rnd()*2-1;
const PN=G(.6,comp,verb),GL=G(.5,comp,verb),DR=G(.9,comp),KZ=A.createBiquadFilter();
KZ.type='bandpass';KZ.frequency.value=1000;KZ.Q.value=1.6;KZ.connect(comp);
const env=(g,v,t,d)=>{g.gain.setValueAtTime(1e-4,t);g.gain.exponentialRampToValueAtTime(v,t+.005);g.gain.exponentialRampToValueAtTime(1e-4,t+d)};
const osc=(ty,f,t,d,v,to)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.type=ty;o.frequency.value=f;env(g,v,t,d);o.connect(g);g.connect(to);o.start(t);o.stop(t+d+.05)};
const sweep=(t,d,f0,f1,v,to)=>{const o=keep(A.createOscillator()),g=keep(A.createGain());o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);env(g,v,t,d);o.connect(g);g.connect(to);o.start(t);o.stop(t+d+.05)};
const nz=(t,d,v,ty,f,qq,to)=>{const src=keep(A.createBufferSource()),fl=keep(A.createBiquadFilter()),g=keep(A.createGain());src.buffer=NB;fl.type=ty;fl.frequency.value=f;fl.Q.value=qq;env(g,v,t,d);src.connect(fl);fl.connect(g);g.connect(to);src.start(t,rnd()*.9);src.stop(t+d+.05);return fl};
const pn=(m,t,d,v)=>{osc('sine',mt(m),t,d,v,PN);osc('sine',mt(m)*4.02,t,d*.3,v*.15,PN)};
const gl=(m,t,d,v)=>{osc('sine',mt(m),t,d,v,GL);osc('sine',mt(m)*5.4,t,d*.15,v*.25,GL)};
const mb=(m,t,v)=>{osc('triangle',mt(m),t,.5,v,DR);nz(t,.02,v*.4,'bandpass',mt(m)*4,2,DR)};
const kz=(m,t,d,v)=>osc('sawtooth',mt(m),t,d,v,KZ);
const bs=(m,t,d,v)=>osc('triangle',mt(m),t,d,v,DR);
const sn=(t,v)=>{nz(t,.14,v,'bandpass',1900,1.2,DR);osc('triangle',190,t,.09,v*.6,DR)};
const hat=(t,v)=>nz(t,.03,v,'highpass',7000,1,DR);
const kk=(t,f=130)=>{sweep(t,.16,f,f/3,.9,DR);osc('sine',f/3,t,.35,.5,DR)};
const pop=(t,v)=>{nz(t,.04,v,'highpass',1800,.7,DR);sweep(t,.12,700,140,v*.6,DR)};
const clk=t=>nz(t,.012,.5,'highpass',3500,.7,DR);
const wh=(t,d,v)=>sweep(t,d,1900,300,v,DR);
const ring=(t,v)=>{gl(86,t,1.6,v);gl(91,t+.04,1.4,v*.6)};
function bar(b,t){
const[r,mi]=b==73?CH[0]:b>=18&&b<22?CB[b%8]:b>=34&&b<38?CM[b%8]:b>=58&&b<66?CM[b%8]:CH[b%8],c3=mi?3:4,c7=b>=28&&b<34?10:11;
const sl=b>=28&&b<34,nr=b>=25&&b<28,dr=b>=4&&b<44&&!nr&&!sl,ch=b>=22&&b<25;
const mel=(L,b0,f)=>{const k=b-b0;if(k<0)return;const o=(k%8)*4;let x=0;for(const[m,d]of L){if(m&&x>=o&&x<o+4)f(m,t+(x-o)*Q,d*Q);x+=d}};
if(b<3)for(let k=0;k<8;k++)gl(r+12+[0,c3,7,12][k%4],t+k*Q/2,1.2,.1);
if(b==3)clk(t);
if(b==15)wh(t+.8*BAR,1.2*BAR,.22);
if(b==17)ring(t,.12);
if(b==25)clk(t+.4*BAR);
if(b==28)clk(t+.2*BAR);
if(nr)for(let k=0;k<8;k++)gl(r+12+[0,c3,7,12,c3+7,19][k%6],t+k*Q/2,.9,.04);
if(sl)sn(t,.35);
else if(dr){
 kk(t);kk(t+2*Q);sn(t+Q,.55);sn(t+3*Q,.55);
 if(b>=18&&b<22)for(let k=0;k<8;k++)sn(t+k*Q/2,.1);
 else if(ch)for(let k=0;k<16;k++)sn(t+k*Q/4,.06+.02*(k%4));
 for(let k=0;k<8;k++)hat(t+k*Q/2,.04);
 if(b%4==3)for(let k=0;k<4;k++)sn(t+3*Q+k*Q/4,.15+k*.06);
 if(b>=34&&b<42)for(let k=0;k<4;k++)kk(t+k*Q,70)}
if((b>=3&&b<44&&!(sl&&b%2))||b==73){const d=b==73?BAR*2.5:sl?BAR*2:BAR*.9,v=nr?.025:.05;
 for(const n of[r+12,r+12+c3,r+19,r+24,r+12+c7])pn(n,t,d,v);
 if(b>=34&&b<44)gl(r+24,t,d,.04)}
if((b>=10&&b<28||b>=34&&b<42)&&!sl&&!nr){const n=ch?16:8;for(let k=0;k<n;k++)bs(r-12+(k%2)*12,t+k*BAR/n,BAR/n*.9,.22)}
if(b>=4&&b<10)for(let k=0;k<4;k++)mb(r+12,t+(2*k+1)*Q/2,.12);
if(ch)for(let k=0;k<16;k++)mb(r+12+[0,c3,7,12][k%4],t+k*BAR/16,.07);
if(b>=4&&b<18)mel(P1,4,(m,x,d)=>pn(m,x,d,.2));
if(b>=18&&b<22)mel(P1,4,(m,x,d)=>gl(m+12,x,d,.1));
if(b>=10&&b<28&&!sl&&!nr)mel(K1,10,(m,x,d)=>kz(m,x,d,.12));
if(sl)mel(K2,28,(m,x,d)=>kz(m,x,d,.14));
if(b>=34&&b<38)mel(P3,34,(m,x,d)=>pn(m,x,d,.18));
if(b>=38&&b<44){mel(P2,38,(m,x,d)=>pn(m,x,d,.2));mel(K3,38,(m,x,d)=>kz(m,x,d,.1))}
if(b>=38&&b<42)for(let k=0;k<8;k++)gl([74,76,79,81][(k*3)%4],t+k*Q/2,.3,.04);
if(b==13){const f=nz(t,BAR*2,.4,'bandpass',200,2,DR);f.frequency.exponentialRampToValueAtTime(2600,t+BAR*2)}
if(b==28)for(let k=0;k<4;k++)pn([62,66,69,74][k],t+k*Q,.6,.06);
if(b==40)for(let k=0;k<12;k++)pop(t+k*BAR/12,.2+k*.02);
if(b>=45&&b<52){
 for(let k=0;k<4;k++){const n=k%2?r+12:r;if(k%2==0)bs(n-12,t+k*Q,Q*.8,.25);else pn(r+12+c3,t+k*Q,Q*.6,.09)}
 sn(t+Q,.4);sn(t+3*Q,.4);
 mel(SH,45,(m,x,d)=>kz(m,x,d,.12));
 if(b%2==0)gl(r+24,t,BAR,.05)}
if(b>=52&&b<58){
 for(let k=0;k<3;k++){if(k==0)bs(r-12,t+k*BAR/3,BAR/3*.9,.25);else pn(r+12+[0,c3,7][k],t+k*BAR/3,BAR/3*.8,.1)}
 mel(WZ,52,(m,x,d)=>gl(m,x,d,.1));
 mb(r+24,t+BAR/3,.06);mb(r+24,t+2*BAR/3,.06)}
if(b>=58&&b<65){
 if(b%2==0){kk(t,50);pn(r+12,t,BAR*2*.95,.06);pn(r+12+c3,t,BAR*2*.95,.05)}
 mel(DG,58,(m,x,d)=>kz(m,x,d,.12))}
if(b>=65&&b<69){
 for(let k=0;k<16;k++)sn(t+k*Q/4,.05+.03*k/16);
 kk(t);kk(t+2*Q);
 for(const n of[r+12,r+12+c3,r+19,r+24])pn(n,t,BAR*.9,.08);
 mel(FF,65,(m,x,d)=>gl(m+12,x,d,.12))}
if(b>=69&&b<72){
 mel(P2,69,(m,x,d)=>pn(m,x,d,.2));
 mel(K3,69,(m,x,d)=>kz(m,x,d,.1));
 for(let k=0;k<8;k++)hat(t+k*Q/2,.04);
 kk(t);kk(t+2*Q);sn(t+Q,.5);sn(t+3*Q,.5)}
if(b==70)ring(t,.15);
if(b==72)for(let k=0;k<2;k++)pn(r+12+k*c3,t,BAR*2,.06);
for(const p of PO)if(p>=b&&p<b+1){const x=t+(p-b)*BAR;pop(x,.8);for(let k=1;k<4;k++)pop(x+k*.07,.4/k)}
if(b==35)kk(t,60);
if(b==36)kk(t+.5*BAR,60);
if(b==73){ring(t,.2);gl(r+12,t,BAR*2.5,.2);pn(r+24,t+Q,BAR*2.5,.12)}
}
function sched(b){bag=[];if(b>2&&BAGS[b-3]){BAGS[b-3].forEach(n=>n.disconnect());BAGS[b-3]=0}BAGS[b]=bag;bar(b,base+b*BAR)}
bag=[];sched.out=comp;return sched}
function live(A,from=0){const base=A.currentTime+.15-from,sched=setup(A,base);let b=Math.ceil(from/BAR-.001);
const tick=()=>{while(b<BARS&&base+b*BAR<A.currentTime+1.2)sched(b++)};tick();const iv=setInterval(tick,100);
return{base,stop(){clearInterval(iv);sched.out.disconnect()}}}
function render(){const SR=44100,A=new OfflineAudioContext(2,SR*LEN|0,SR),sched=setup(A,0);sched(0);
for(let b=1;b<BARS;b++)A.suspend(((b*BAR-.5)*SR/128|0)*128/SR).then(()=>{sched(b);A.resume()});
return A.startRendering()}
return{live,render,BPM,BAR,BARS,LEN}})();
