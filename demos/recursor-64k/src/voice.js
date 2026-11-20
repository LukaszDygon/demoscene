// RECURSOR narration: a cold formant "machine" voice synthesized in WebAudio, quantized to the 16th grid.
// N: [bar, 16th offset, on-screen text, phonemes, pitch multiplier]. Display and phoneme strings have the same word count.
// Phonemes: vowels a e i o u @ A I O (':' lengthens), sonorants m n N l r w y, fricatives s S f T h, voiced z v D j,
// stops p t k (unvoiced) b d g (voiced), '.' pause, '-' cut-off gap.
var VOICE=(()=>{
const N=[
[1,0,'SUBJECT ACQUIRED.','s@bjekt @kwaird',1],
[4,0,'BEGIN DESCENT.','bigI:n dise:nt.',1],
[8,4,'DEPTH ONE.','de:pT wa:n',1],
[13,0,'EIGHT CELLS. YOU ARE IN ALL OF THEM.','eit se:lz. yu ar In O:l @v De:m',1],
[19,0,'ROTATE. ROTATE.','routeit. ro-routeit',1.06],
[24,2,'DEPTH TWO. THE CORRIDOR.','de:pT tu:. D@ korIdo:r',1],
[29,0,'DO NOT TURN AROUND.','du: na:t t@rn @raund',.94],
[34,0,'IT IS THE SAME CORRIDOR.','It Iz D@ seim korIdo:r',1],
[41,0,'THE ROOM IS LARGER THAN THE HOUSE.','D@ ru:m Iz la:rj@r DAn D@ hau:s',.9],
[45,0,'ENTER.','e:nt@r',.84],
[48,4,'DEPTH THREE. FOLD.','de:pT Tri:. fo:ld',1],
[56,0,'CUT. FOLD. CUT. FOLD.','k@t. fo:ld. k@t. fo:ld',1.12],
[64,0,'EVERY PIECE CONTAINS THE WHOLE.','evri pi:s k@nteinz D@ ho:l',1],
[72,4,'DEPTH FOUR.','de:pT fo:r',1],
[76,0,'THE EDGE IS INFINITELY FAR.','Di e:dj Iz Inf@n@tli fa:r',1],
[82,0,'KEEP FALLING. YOU WILL NOT ARRIVE.','ki:p fO:lIN. yu wIl na:t @rai:v',.94],
[89,0,'EVERY EXIT IS AN ENTRANCE.','evri egzIt Iz An e:ntr@ns',.84],
[93,0,'THERE IS NO BOTTOM.','De:r Iz no: ba:t@m',.8],
[96,2,'DEP- DEPTH ERROR.','de- de:pT er@:r',1.25],
[104,0,'COLLAPSE.','k@lA:ps',1],
[110,0,'ALL DEPTHS AT ONCE.','O:l de:pTs At wa:ns',1.12],
[116,0,'COLLAPSE. COLLAPSE. COLLAPSE.','k@lAps. k@lAps. k@lA:ps',1.33],
[120,4,'RETURN TO ZERO.','rit@:rn tu zi:ro:',.9],
[124,0,'GOODBYE.','gu:dbai::',.8]];
// phoneme: [kind, F1, F2, F3] (kind 0 vowel, 1 sonorant) or [kind, noise centre] (2 fricative, 3 voiced fricative, 4 stop, 5 voiced stop)
const P={a:[0,750,1150,2500],e:[0,550,1800,2500],i:[0,280,2300,3000],o:[0,500,850,2400],u:[0,320,800,2300],'@':[0,560,1350,2400],
A:[0,700,1700,2500],I:[0,400,1950,2600],O:[0,600,950,2400],m:[1,280,1000,2200],n:[1,280,1500,2500],N:[1,280,2000,2700],
l:[1,380,1100,2500],r:[1,450,1200,1600],w:[1,300,700,2200],y:[1,280,2200,3000],s:[2,6500],S:[2,2800],f:[2,7500],T:[2,5500],
h:[2,1500],z:[3,6500],v:[3,4000],D:[3,4500],j:[3,2800],p:[4,900],t:[4,4000],k:[4,2200],b:[5,900],d:[5,3500],g:[5,2000]},
DU=[1,.5,.5,.5,.5,.5];
// layout in 16th units: [[u, char, dur]], total
function lay(ph){const L=[];let u=0;for(const c of ph){if(c==':'){L[L.length-1][2]+=1;u+=1;continue}
 const d=c==' '?.5:c=='.'?1.5:c=='-'?.5:DU[P[c][0]];L.push([u,c,d]);u+=d}return[L,u]}
// word start times (16th units) paired with display words
function words(l){const [L]=lay(l[3]),W=l[2].split(' '),o=[];let w=0,f=1;
 for(const [u,c] of L){if(c==' '){f=1;continue}if(f){o.push([u,W[w++]]);f=0}}return o}
function build(A,out,duck,ST){
 const src=A.createOscillator();src.type='sawtooth';src.start();
 const NB=A.createBuffer(1,A.sampleRate*2,A.sampleRate),nd=NB.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 const ns=A.createBufferSource();ns.buffer=NB;ns.loop=true;ns.start();
 const G=(v,...to)=>{const g=A.createGain();g.gain.value=v;to.forEach(n=>g.connect(n));return g};
 const mix=G(3.2),vg=G(0),ag=G(0),fg=G(0,mix),fb=A.createBiquadFilter();
 src.connect(vg);ns.connect(ag);ns.connect(fb);fb.type='bandpass';fb.Q.value=2.5;fb.connect(fg);
 const FF=[6,11,13].map((q,i)=>{const f=A.createBiquadFilter();f.type='bandpass';f.Q.value=q;vg.connect(f);ag.connect(f);f.connect(G([1,.75,.4][i],mix));return f});
 // bit-crush (amplitude staircase) and a 47 Hz ring modulator for the machine timbre
 const cr=A.createWaveShaper(),cc=new Float32Array(2048);for(let i=0;i<2048;i++){const x=i/1023.5-1;cc[i]=Math.round(Math.tanh(x*1.5)*7)/7}cr.curve=cc;
 mix.connect(cr);cr.connect(G(.75,out));const rm=G(0,out),ro=A.createOscillator();ro.frequency.value=47;ro.connect(rm.gain);ro.start();cr.connect(rm);
 const tg=(g,v,T,k=.006)=>g.gain.setTargetAtTime(v,T,k);
 return(l,t)=>{const [L,U]=lay(l[3]),f0=123.5*(l[4]||1),E=t+U*ST;
  src.frequency.setValueAtTime(f0,t);src.frequency.linearRampToValueAtTime(f0*.84,E);
  duck.setTargetAtTime(.42,t-.04,.02);
  L.forEach(([u,c,d],j)=>{const T=t+u*ST,k=P[c];
   if(!k){tg(vg,0,T);tg(ag,0,T);tg(fg,0,T);return}
   const K=k[0];
   if(K<2){FF.forEach((f,i)=>f.frequency.setTargetAtTime(k[i+1],T,.012));tg(vg,K?.4:1,T);tg(ag,0,T);tg(fg,0,T)}
   else if(K<4){fb.frequency.setValueAtTime(k[1],T);
    if(c=='h'){const n=P[l[3][j+1]]||P.a;FF.forEach((f,i)=>f.frequency.setTargetAtTime(n[i+1]||1500,T,.005));tg(ag,.7,T);tg(fg,0,T);tg(vg,0,T)}
    else{tg(fg,c=='f'||c=='T'?.45:.8,T,.005);tg(ag,0,T);tg(vg,K==3?.3:0,T)}}
   else{tg(vg,K==5?.1:0,T,.003);tg(fg,0,T,.003);tg(ag,0,T,.003);const B=T+d*ST*.6;
    fb.frequency.setValueAtTime(k[1],B);fg.gain.setValueAtTime(K==5?.5:.9,B);tg(fg,0,B+.012,.012);
    if(K==4){ag.gain.setValueAtTime(.35,B+.01);tg(ag,0,B+.03,.02)}}});
  tg(vg,0,E,.01);tg(ag,0,E,.01);tg(fg,0,E,.01);duck.setTargetAtTime(1,E+.06,.15);return E}}
return{N,lay,words,build}})();
