// ＶＡＰＯＲ ＭＡＬＬ 夢のショッピングモール — a 64k browser intro
// Everything is procedural: meshes are built from boxes/cones/lathes at startup,
// fonts come from the OS (Hiragino / Yu / Noto), music is synthesized by music.js.
(()=>{
'use strict';
const D=document,C=D.getElementById('c'),S=D.getElementById('s');
const gl=C.getContext('webgl2',{antialias:false,alpha:false});
if(!gl){S.innerHTML='<u>WebGL2 required ・ WebGL2が必要です</u>';return}
const Q=new URLSearchParams(location.search),MUTE=Q.has('mute'),T0=+Q.get('t')||0;
const BAR=60/85*4,END=52*BAR;
const {PI,sin,cos,abs,min,max,floor,sqrt,atan2,pow}=Math;
const cl=(x,a,b)=>x<a?a:x>b?b:x,mx=(a,b,t)=>a+(b-a)*t,ss=(a,b,x)=>(x=cl((x-a)/(b-a),0,1),x*x*(3-2*x));
const hs=n=>{n=sin(n*127.1+311.7)*43758.5453;return n-floor(n)};
let seed=1;const rnd=()=>(seed=seed*16807%2147483647)/2147483647;
const col=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255],l3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const ad=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sb=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],sc=(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
 dt=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nm=a=>sc(a,1/(Math.hypot(...a)||1));

// ---------- mat4 (column major) ----------
const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function mul(a,b){const o=[];for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
const ch=(...m)=>m.reduce(mul),Tm=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1],Sm=(x,y=x,z=x)=>[x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1],
 Rx=a=>{const c=cos(a),s=sin(a);return[1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]},
 Ry=a=>{const c=cos(a),s=sin(a);return[c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]},
 Rz=a=>{const c=cos(a),s=sin(a);return[c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]};
const xf=(m,p)=>[0,1,2].map(i=>m[i]*p[0]+m[4+i]*p[1]+m[8+i]*p[2]+m[12+i]);
function persp(f,a,n,r){const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(r+n)/(n-r),-1,0,0,2*r*n/(n-r),0]}
function look(e,c,up){const z=nm(sb(e,c)),x=nm(cr(up,z)),y=cr(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dt(x,e),-dt(y,e),-dt(z,e),1]}
// matrix mapping unit y-segment [0..1] onto a->b with radius r
function sgm(a,b,r,r2=r){const y=sb(b,a),yn=nm(y),t=abs(yn[1])<.9?[0,1,0]:[1,0,0],x=nm(cr(yn,t)),z=cr(x,yn);
 return[x[0]*r,x[1]*r,x[2]*r,0,y[0],y[1],y[2],0,z[0]*r2,z[1]*r2,z[2]*r2,0,a[0],a[1],a[2],1]}

// ---------- mesh builder ----------
// vertex: pos3 col3 uv2. uv.x>=0 → atlas textured (glows); uv.x=-2 → emissive; uv.x=-1 → lit, uv.y=shine
const VB=[],ST=[];let M=I(),EM=0,SH=0;
const push=()=>ST.push(M),pop=()=>{M=ST.pop()},tf=(...m)=>{M=ch(M,...m)};
function vx(p,c,u){const q=xf(M,p);VB.push(q[0],q[1],q[2],c[0],c[1],c[2],...(u||[EM?-2:-1,SH]))}
function poly(P,c,U){const many=Array.isArray(c[0]);for(let i=1;i<P.length-1;i++)for(const k of[0,i,i+1])vx(P[k],many?c[k]:c,U&&U[k])}
const BP=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],
 BF=[[4,5,6,7],[1,0,3,2],[0,4,7,3],[5,1,2,6],[3,7,6,2],[0,1,5,4]];
function box(c,c2){for(const f of BF)poly(f.map(i=>BP[i]),c2?f.map(i=>BP[i][1]>0?c2:c):c)}
function B(x,y,z,w,h,d,c,c2){push();tf(Tm(x,y,z),Sm(w,h,d));box(c,c2);pop()}
function cyl(n,r0,r1,c0,c1=c0,cap){for(let i=0;i<n;i++){const a=i/n*2*PI,b=(i+1)/n*2*PI,
 A0=[cos(a)*r0,0,sin(a)*r0],B0=[cos(b)*r0,0,sin(b)*r0],A1=[cos(a)*r1,1,sin(a)*r1],B1=[cos(b)*r1,1,sin(b)*r1];
 poly([A0,B0,B1,A1],[c0,c0,c1,c1]);if(cap){poly([[0,0,0],B0,A0],c0);if(r1)poly([[0,1,0],A1,B1],c1)}}}
function Cy(x,y,z,n,r0,r1,h,c0,c1,cap){push();tf(Tm(x,y,z),Sm(1,h,1));cyl(n,r0,r1,c0,c1,cap);pop()}
function sph(nu,nv,c0,c1=c0,j=0){
 const P=(i,k)=>{const th=k/nv*PI,ph=i/nu*2*PI,r=1+j*(hs(k%nv?i%nu*7.3+k*13.1:k*5.7)-.5);return[sin(th)*cos(ph)*r,cos(th)*r,sin(th)*sin(ph)*r]},
  cc=k=>l3(c0,c1,1-k/nv);
 for(let i=0;i<nu;i++)for(let k=0;k<nv;k++)poly([P(i,k),P(i+1,k),P(i+1,k+1),P(i,k+1)],[cc(k),cc(k),cc(k+1),cc(k+1)])}
function lathe(n,pr,c0,c1=c0){for(let j=0;j<pr.length-1;j++){const[r0,y0]=pr[j],[r1,y1]=pr[j+1],
 ca=l3(c0,c1,j/(pr.length-1)),cb=l3(c0,c1,(j+1)/(pr.length-1));
 for(let i=0;i<n;i++){const a=i/n*2*PI,b=(i+1)/n*2*PI;
  poly([[cos(a)*r0,y0,sin(a)*r0],[cos(b)*r0,y0,sin(b)*r0],[cos(b)*r1,y1,sin(b)*r1],[cos(a)*r1,y1,sin(a)*r1]],[ca,ca,cb,cb])}}}
// textured sign quad (atlas cell k), facing +z rotated by ry; uw = fraction of cell width shown
function sign(x,y,z,w,h,k,ry=0,uw=1){const uc=k%2*.5+.25,v0=floor(k/2)/16,v1=v0+1/16,u0=uc-.25*uw,u1=uc+.25*uw;
 push();tf(Tm(x,y,z),Ry(ry));poly([[-w/2,-h/2,0],[w/2,-h/2,0],[w/2,h/2,0],[-w/2,h/2,0]],[1,1,1],[[u0,v1],[u1,v1],[u1,v0],[u0,v0]]);pop()}
const ME={};function mk(n,f){const s=VB.length/8;M=I();EM=SH=0;f();ME[n]=[s,VB.length/8-s]}

// ---------- palette ----------
const PINK=col(0xff71ce),CYAN=col(0x01cdfe),MINT=col(0x05ffa1),PURP=col(0xb967ff),YEL=col(0xfffb96),WHT=col(0xf8f0ff),
 DARK=col(0x241040),PEACH=col(0xffb3c7),TEAL=col(0x18c8c0),TEAL2=col(0x7ff7ea),SKIN=col(0xffc4a3),SILV=col(0xdfe6ff),GOLD=col(0xffd24a),
 FR1=col(0x1fd1a0),FR2=col(0x0fa8a8);

// ---------- fonts & sign atlas ----------
const JM='"Hiragino Mincho ProN","Yu Mincho",YuMincho,"Noto Serif JP","MS PMincho",serif',
 JG='"Hiragino Sans","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP",Meiryo,sans-serif',
 SCR='"Snell Roundhand","Brush Script MT","Segoe Script",cursive',
 DID='Didot,"Bodoni 72","Bodoni MT","Times New Roman",serif',VCR='"Courier New",Courier,monospace';
const SIGNS=['ＶＡＰＯＲ　ＰＬＡＺＡ','夢のモール','ブティック','セール　５０％ＯＦＦ','フードコート','ミュージック','ビデオ　ＶＨＳ','ネオン東京',
 'シティポップ','ＡＥＳＴＨＥＴＩＣ','コンビニ　２４','カセット','ゲームセンター','ラブ　♡','ようこそ','￥９８０',
 'ＳＡＬＥ','ポケット','レシート　￥０','ＤＲＥＡＭ　ＯＳ　９５','エスカレーター　↑','永遠','ショッピング','化粧品',
 '香水','スニーカー','ソーダ','スマイル　☺','夢','ＰＬＡＹ','いらっしゃいませ','ＥＮＤ'];
const AT=D.createElement('canvas');AT.width=AT.height=1024;
{const x=AT.getContext('2d'),PAL=[['#ff71ce','#2a0040'],['#01cdfe','#08002a'],['#fffb96','#3a0050'],['#b967ff','#05001a'],['#05ffa1','#1a0030']];
 x.textAlign='center';x.textBaseline='middle';
 SIGNS.forEach((s,k)=>{const x0=k%2*512,y0=floor(k/2)*64,paper=k==15||k==18;let[fg,bg]=PAL[k%5];
  if(paper){fg='#301040';bg='#f4f0ff'}
  const g=x.createLinearGradient(0,y0,0,y0+64);g.addColorStop(0,bg);g.addColorStop(1,paper?'#ffe4f4':'#000');x.fillStyle=g;x.fillRect(x0,y0,512,64);
  x.strokeStyle=fg;x.lineWidth=3;x.strokeRect(x0+5,y0+5,502,54);
  x.font=`bold 40px ${k%3?JG:JM}`;x.shadowColor=fg;x.shadowBlur=paper?0:16;x.fillStyle=fg;x.fillText(s,x0+256,y0+34,470);
  if(!paper){x.shadowBlur=0;x.globalAlpha=.55;x.fillStyle='#fff';x.fillText(s,x0+256,y0+34,470);x.globalAlpha=1}})}

// ---------- geometry ----------
function palm(x,z,h,sz=1){push();tf(Tm(x,0,z),Ry(rnd()*6),Sm(sz));let p=[0,0,0];
 for(let i=0;i<6;i++){const q=ad(p,[.09*i,h/6,.03*i]);push();tf(sgm(p,q,.5-i*.04));cyl(6,1,.85,col(0x8a5a8c),col(0xc28ab0));pop();p=q}
 for(let f=0;f<8;f++){const an=f/8*2*PI+rnd()*.3,d=[cos(an),0,sin(an)];let a=p;
  for(let s=1;s<=5;s++){const b=ad(p,[d[0]*s*1.3,.6-.12*s*s,d[2]*s*1.3]),w=.9*(1-s/6)+.1,pp=[-d[2]*w,0,d[0]*w];
   poly([a,ad(b,pp),b],FR1);poly([a,b,sb(b,pp)],FR2);a=b}}
 pop()}
function column(x,z,h,r,c2=PEACH){B(x,.4,z,r*2.6,.8,r*2.6,WHT);Cy(x,.8,z,8,r,r*.92,h-1.6,WHT,c2);B(x,h-.4,z,r*2.8,.8,r*2.8,WHT);EM=1;Cy(x,h*.27,z,8,r*1.06,r*1.06,.3,PINK);EM=0}

mk('mall',()=>{seed=3;
 // --- facade + plaza ---
 const FC=col(0xffc2e2),FC2=col(0xff8ad8);
 B(-42,15,41,56,30,2,FC,FC2);B(42,15,41,56,30,2,FC,FC2);B(0,24,41,28,12,2,FC,FC2);
 EM=1;B(0,18.2,42.1,28.6,.3,.3,CYAN);B(-14.15,9,42.1,.3,18,.3,CYAN);B(14.15,9,42.1,.3,18,.3,CYAN);B(0,30.2,41,140,.4,2.4,PINK);EM=0;
 sign(0,25,42.2,26,3.25,0);sign(-40,22,42.2,18,2.25,1);sign(40,22,42.2,18,2.25,14);
 for(let z=64;z<240;z+=32)for(const s of[-1,1])palm(s*28,z,12,1.4);
 for(const s of[-1,1])Cy(s*80,0,150,4,34,0,32,PURP,CYAN);
 // --- corridor ---
 for(const sd of[-1,1]){
  B(sd*22.75,12,-130,.5,24,340,col(0xe8d8ff),col(0xffd0ec));
  B(sd*18.25,9.7,-130,8.5,.6,340,col(0xe8d8ff),col(0xb99cf0));
  EM=1;B(sd*14,9.4,-130,.15,.15,340,CYAN);B(sd*14,11.2,-130,.12,.12,340,PINK);B(sd*22.35,21,-130,.2,.4,340,PINK);B(sd*22.35,22,-130,.2,.2,340,CYAN);EM=0;
  for(let z=38;z>-300;z-=3)B(sd*14,10.6,z,.1,1.2,.1,WHT);
  let k=sd>0?2:7;
  for(let z=28;z>-290;z-=24)for(const lv of[0,10]){const zc=z-12,wc=[PINK,CYAN,PURP,MINT,YEL][(k+lv)%5];
   EM=1;B(sd*22.4,lv+3.6,zc,.1,6.4,18,sc(wc,.45),l3(wc,WHT,.5));EM=0;
   B(sd*22.2,lv+.4,zc,.6,.8,20,DARK);B(sd*22.2,lv+7.1,zc,.6,.4,20,WHT);
   for(const o of[-10,10])B(sd*22.2,lv+4,zc+o,.6,8,1,WHT,PEACH);
   sign(sd*21.85,lv+8.2,zc,12,1.5,[2,3,4,5,6,7,8,9,10,11,12,13,20,22,23,24,25,26,27,21][k%20],-sd*PI/2);k+=3;
   for(let m=0;m<2;m++){const zz=zc+(rnd()-.5)*12;
    if(rnd()<.5){push();tf(Tm(sd*21,lv,zz));Cy(0,0,0,6,.5,.7,3.2,WHT,PEACH);B(0,3.4,0,1.5,.35,.55,WHT);push();tf(Tm(0,4.2,0),Sm(.4,.5,.4));sph(6,4,WHT);pop();pop()}
    else{B(sd*21,lv+.7,zz,1.6,1.4,1.6,DARK,PURP);push();tf(Tm(sd*21,lv+2.1,zz),Sm(.6));sph(6,4,wc,WHT);pop()}}}
 }
 for(let z=28;z>-300;z-=24)for(const sd of[-1,1])column(sd*14,z,24,1);
 for(let z=36;z>-300;z-=12)B(0,24.2,z,46,.8,1,DARK,PURP);
 B(-7,24.8,-130,.8,.6,340,DARK);B(7,24.8,-130,.8,.6,340,DARK);
 // --- bridges + escalators ---
 for(const bz of[-80,-200]){B(0,9.7,bz,28,.6,6,col(0xe8d8ff),col(0xb99cf0));
  EM=1;for(const o of[-3,3]){B(0,9.4,bz+o,28,.15,.15,CYAN);B(0,11.2,bz+o,28,.12,.12,PINK)}EM=0;
  const ex=bz==-80?-8:8;push();tf(sgm([ex,0,bz+40],[ex,10,bz+3],1));
  B(0,.5,0,3,1,.8,col(0x9a8ab8),SILV);for(let i=0;i<24;i++)B(0,i/24,.42,2.8,.012,.05,DARK);
  for(const s of[-1,1]){B(s*1.6,.5,.7,.2,1,1.4,PURP);EM=1;B(s*1.6,.5,1.45,.22,1,.15,CYAN);EM=0}pop();
  sign(ex,12.6,bz+3.2,6,.75,20)}
 // --- fountain ---
 Cy(0,0,-130,14,8,8,1.2,PINK,WHT,1);EM=1;Cy(0,.9,-130,14,7.4,7.4,.4,CYAN,col(0x9ff8ff),1);EM=0;
 push();tf(Tm(0,0,-130));lathe(10,[[1.6,0],[1.2,2],[3.5,3],[3.6,3.4],[.8,3.6],[.6,5.5],[2,6.2],[2.1,6.5],[.4,6.6],[.3,8]],WHT,PEACH);pop();
 for(const s of[-1,1])palm(s*12,-142,10);
 for(const[x,z]of[[9,10],[-9,-30],[9,-55],[-9,-100],[9,-170],[-9,-230],[9,-285]]){B(x,.6,z,3,1.2,3,PINK,WHT);palm(x,z,9)}
 // --- TV wall ---
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=-13+i*3.1,y=1.4+j*2.8;B(x,y,-262,3,2.7,2.6,col(0xd8cfe8),col(0xb8afd0));
  sign(x,y+.1,-260.68,2.3,1.9,[16,6,28,29,17,9,19,16,28][i*3+j],0,.3)}
 for(const s of[-1,1])B(s*18.25,18,-302,8.5,36,1,col(0xffc2e2),col(0xff8ad8));B(0,28,-302,28,16,1,col(0xffc2e2),col(0xff8ad8));
 EM=1;B(0,20.1,-301.4,28.6,.3,.3,CYAN);for(const s of[-1,1])B(s*14.15,10,-301.4,.3,20,.3,CYAN);EM=0;sign(0,26,-301.3,22,2.75,30);
 // --- the dream hall ---
 for(let i=0;i<12;i++){const a=i/12*2*PI;if(abs(a-PI/2)<.7)continue;column(cos(a)*85,-430+sin(a)*85,54,2.4)}
 const TR=col(0xff2a6d);
 Cy(-14,0,-330,8,1.6,1.4,34,TR,col(0xff6a9a));Cy(14,0,-330,8,1.6,1.4,34,TR,col(0xff6a9a));
 B(0,28,-330,34,1.2,1.2,TR);B(0,34.4,-330,40,1.6,2,DARK);B(0,33.4,-330,36,.8,1.6,TR);
 EM=1;B(0,35.3,-330,40.5,.25,2.1,PINK);B(0,28,-329.3,34,.15,.15,YEL);EM=0;
});
mk('mtn',()=>{for(let i=0;i<48;i++){const a=i/48*2*PI,b=(i+1)/48*2*PI,m=(a+b)/2,R=720,h=60+hs(i)*150;
 poly([[cos(a)*R,0,sin(a)*R-150],[cos(b)*R,0,sin(b)*R-150],[cos(m)*R*.97,h,sin(m)*R*.97-150]],[PURP,PURP,PINK])}});
mk('floor',()=>poly([[-600,0,600],[600,0,600],[600,0,-900],[-600,0,-900]],WHT));
mk('jet',()=>{EM=1;cyl(6,.3,.05,CYAN,WHT)});

// --- consumer dream objects ---
mk('can',()=>{SH=1;push();tf(Tm(0,-.8,0));Cy(0,0,0,10,.46,.5,.15,SILV);Cy(0,.15,0,10,.5,.5,1.3,PINK,CYAN);Cy(0,.6,0,10,.51,.51,.3,YEL);Cy(0,1.45,0,10,.5,.4,.12,SILV,SILV,1);pop()});
mk('card',()=>{SH=1;B(0,0,0,3.4,.06,2.1,CYAN,PINK);B(0,.04,-.6,3.4,.02,.4,DARK);B(-.9,.04,.2,.5,.02,.4,GOLD)});
mk('cart',()=>{SH=1;push();tf(Tm(0,-1.3,0));
 for(const y of[.8,1.5,2.2]){B(0,y,-1.5,2,.06,.06,SILV);B(0,y,1.5,2,.06,.06,SILV);B(-1,y,0,.06,.06,3,SILV);B(1,y,0,.06,.06,3,SILV)}
 for(let x=-1;x<=1;x+=.5)for(const z of[-1.5,1.5])B(x,1.5,z,.05,1.4,.05,SILV);
 for(let z=-1.5;z<=1.5;z+=.5)for(const x of[-1,1])B(x,1.5,z,.05,1.4,.05,SILV);
 B(0,2.5,1.9,2.3,.14,.14,PINK);for(const x of[-1,1]){B(x,2.35,1.7,.06,.4,.5,SILV);
  for(const z of[-1.3,1.3]){B(x*.9,.45,z,.08,.8,.08,SILV);push();tf(Tm(x*.9,.15,z),Rz(PI/2),Tm(0,-.08,0),Sm(1,.16,1));cyl(6,.16,.16,DARK,DARK,1);pop()}}
 pop()});
mk('bag',()=>{B(0,0,0,1.6,2,.7,PINK,col(0xffb3e6));for(const x of[-.35,.35])B(x,1.25,0,.08,.5,.08,DARK);B(0,1.5,0,.78,.08,.08,DARK);sign(0,.1,.36,1.5,.19,13)});
mk('tv',()=>{B(0,0,0,3,2.4,2.4,col(0xe0d6ee),col(0xc0b4dc));sign(0,.1,1.21,2.3,1.8,16,0,.32);B(1.25,-.75,1.21,.22,.22,.08,DARK);
 for(const s of[-1,1]){push();tf(sgm([0,1.2,0],[s*.9,2.6,-.2],.05));cyl(4,1,1,DARK);pop()}});
mk('bust',()=>{const MB=col(0xf2e8f5),MB2=col(0xffd6ec);
 B(0,.35,0,2,.7,2,MB2,MB);Cy(0,.7,0,8,.75,.6,.5,MB);push();tf(Tm(0,1.7,0),Sm(1.6,.9,.9));sph(8,4,MB,MB2,.1);pop();
 Cy(0,2.3,0,6,.38,.34,.8,MB);push();tf(Tm(0,3.5,0),Sm(.75,.95,.85));sph(8,6,MB,MB,.12);pop();
 push();tf(Tm(0,3.45,.75),Rx(PI/2),Sm(.15,.35,.15));cyl(4,1,0,MB);pop();
 for(let i=0;i<10;i++){const a=i/10*2*PI;push();tf(Tm(cos(a)*.6,4.2+sin(i*2)*.1,sin(a)*.55),Sm(.25));sph(5,3,MB2,MB);pop()}});
mk('sneaker',()=>{B(0,.1,0,1.1,.2,2.8,WHT);B(0,.5,-.3,1,.6,1.9,PINK,col(0xff9de6));B(0,.35,.9,.95,.4,.9,PINK);B(0,.95,-.9,1,.5,.9,CYAN);
 B(0,.82,.1,.5,.05,.8,WHT);EM=1;for(const s of[-1,1])B(s*.52,.45,-.2,.02,.15,1.4,CYAN)});
mk('disk',()=>{B(0,0,0,2.4,.1,2.4,col(0x5b3bff));SH=1;B(0,.06,-.75,1.2,.02,.9,SILV);SH=0;B(0,.06,.55,1.8,.02,1.1,WHT)});
mk('orb',()=>{SH=1;sph(8,6,CYAN,PINK)});
mk('bill',()=>B(0,0,0,2.4,.02,1.1,col(0x9dffc8),col(0xff9de0)));
mk('dolphin',()=>{const G1=col(0x7aa8ff),G2=col(0xffc3f0);push();tf(Rx(PI/2));
 lathe(7,[[0,-2.2],[.3,-1.8],[.6,-1],[.75,0],[.6,.9],[.3,1.6],[.18,2],[0,2.35]],G1,G2);pop();
 poly([[0,.6,-.1],[0,1.4,-.7],[0,.55,-.9]],G1);for(const s of[-1,1]){poly([[0,0,-2.1],[s*1.1,.15,-2.75],[0,0,-2.45]],G1);poly([[s*.5,-.3,.5],[s*1.2,-.6,-.2],[s*.5,-.3,-.1]],G2)}});
mk('coin',()=>{SH=1;Cy(0,-.06,0,10,1,1,.12,GOLD,col(0xffe9a0),1)});
mk('lint',()=>sph(5,4,col(0xc9b8d6),col(0xffd1ee),.6));
mk('receipt',()=>{B(0,0,-.01,4.1,.55,.01,WHT);sign(0,0,0,4,.5,18)});
mk('gum',()=>{B(0,0,0,1.6,.15,.6,PINK);SH=1;B(.5,0,0,.6,.17,.62,SILV)});
mk('star',()=>{EM=1;sph(4,2,YEL,WHT)});
// --- the dream character: ポケットさん ---
mk('body',()=>{const PANT=col(0x6b4bd8),SHIRT=col(0xff9ad8);
 for(const s of[-1,1]){B(s*.75,.25,.4,1.1,.5,2,WHT,PINK);B(s*.75,2.5,0,1.15,4.1,1.2,PANT,col(0x8e70ff))}
 B(0,4.62,0,3.3,.35,1.7,DARK);B(0,6.3,0,4,3.6,2,TEAL,TEAL2);B(0,7.95,0,4.8,.5,2.1,TEAL2);
 poly([[-.5,8.1,1.01],[.5,8.1,1.01],[0,6.5,1.01]],SHIRT);
 poly([[-.13,7.95,1.02],[.13,7.95,1.02],[.2,6.8,1.02],[0,6.55,1.02],[-.2,6.8,1.02]],col(0xd400ff));
 for(const s of[-1,1])poly([[s*.5,8.1,1.015],[s*1.05,8.1,1.015],[s*.6,7.55,1.015]],col(0x0f9f98));
 B(0,5.6,1.02,.18,.18,.06,PINK);B(0,5.1,1.02,.18,.18,.06,PINK);
 B(.37,6.85,1.45,.06,1.1,.9,TEAL);B(1.83,6.85,1.45,.06,1.1,.9,TEAL);B(1.1,6.27,1.45,1.52,.06,.9,TEAL);
 Cy(0,8.1,0,6,.45,.42,.7,SKIN)});
mk('head',()=>{
 push();tf(Sm(1.25,1.45,1.3));sph(10,8,SKIN,col(0xffd2b8),.04);pop();
 for(const s of[-1,1]){push();tf(Tm(s*1.22,0,0),Sm(.22,.42,.32));sph(6,4,SKIN);pop()}
 push();tf(Tm(0,-.05,1.2),Rx(PI/2),Sm(.2,.42,.2));cyl(5,1,0,SKIN,col(0xffb0a0));pop();
 SH=1;for(const s of[-1,1]){B(s*.5,.3,1.2,.78,.44,.12,CYAN,PINK);push();tf(sgm([s*.88,.42,1.15],[s*1.22,.42,0],.07),Tm(0,.5,0));box(DARK);pop()}
 B(0,.38,1.25,.3,.08,.08,DARK);SH=0;
 for(const s of[-1,1]){push();tf(Tm(s*.5,.7,1.12),Rz(-s*.2),Sm(.62,.11,.12));box(col(0x2a1530));pop()}
 // the smile — a wide grin wrapped onto the face ellipsoid
 const P=(x,y)=>[x,y,1.3*sqrt(max(.02,1-(x/1.25)**2-(y/1.45)**2))+.05],N=12,
  top=u=>-.58+.3*u*u,mid=u=>-.74+.46*u*u,bot=u=>-1.02+.74*u*u,lt=u=>top(u)+.08-.04*u*u,lb=u=>bot(u)-.09+.05*u*u,LIP=col(0xff5a8a);
 for(let i=0;i<N;i++){const u0=i/N*2-1,u1=(i+1)/N*2-1,x0=u0*.72,x1=u1*.72,
  q=(f,g,c)=>poly([P(x0,f(u0)),P(x1,f(u1)),P(x1,g(u1)),P(x0,g(u0))],c);
  SH=1;q(mid,top,WHT);SH=0;q(bot,mid,col(0x5a0636));q(top,lt,LIP);q(lb,bot,LIP)}
 for(const s of[-1,1]){push();tf(Tm(s*.85,-.35,1.0),Sm(.28,.16,.1));sph(6,3,col(0xff8fb8));pop()}});
mk('hair',()=>{SH=1;seed=5;const HC=col(0x1b0f3a),T1=col(0xfff3a0),T2=col(0x8ff8ff);
 push();tf(Tm(0,.2,-.12),Sm(1.32,1.42,1.38));sph(10,6,HC,col(0x3a2070));pop();
 for(let i=0;i<70;i++){const th=rnd()*1.35,ph=rnd()*2*PI,d=[sin(th)*cos(ph),cos(th),sin(th)*sin(ph)];
  if(d[2]>.5&&d[1]<.6)continue;
  const base=[d[0]*1.25,.2+d[1]*1.35,-.12+d[2]*1.3],fr=d[2]>.25,
   dir=nm(ad(d,fr?[0,1.6,.55]:[0,1.1,-1])),L=(fr?2.4:1.5)+rnd()*1.7*(1-th/1.6);
  push();tf(sgm(base,ad(base,sc(dir,L)),.34+rnd()*.14));cyl(5,1,0,HC,i%3?T1:T2);pop()}});
mk('door',()=>{EM=1;B(0,10,0,14,20,.4,col(0x9a5ad0),col(0x6ff7ea));B(0,6,.25,14,.3,.1,PINK);sign(0,12,.25,12,1.5,29)});
mk('limb',()=>B(0,.5,0,1,1,1,TEAL,TEAL2));
mk('hand',()=>sph(6,4,SKIN));
mk('pin',()=>{const c=[1,1,1],a=.41,b=1.79,y0=6.31,y1=7.4,z0=1.005,z1=1.9;
 poly([[a,y0,z0],[b,y0,z0],[b,y1,z0],[a,y1,z0]],c);poly([[a,y0,z0],[a,y0,z1],[a,y1,z1],[a,y1,z0]],c);
 poly([[b,y0,z0],[b,y0,z1],[b,y1,z1],[b,y1,z0]],c);poly([[a,y0,z0],[b,y0,z0],[b,y0,z1],[a,y0,z1]],c)});
mk('flap',()=>{B(0,.55,.03,1.46,1.1,.06,col(0x12b0a8),TEAL2);EM=1;B(0,1.07,.07,1.46,.05,.02,PINK)});

// ---------- GL setup ----------
const VBO=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,VBO);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(VB),gl.STATIC_DRAW);
const VAO=gl.createVertexArray();gl.bindVertexArray(VAO);
[[0,3,0],[1,3,12],[2,2,24]].forEach(([l,n,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,n,gl.FLOAT,false,32,o)});
function prog(vs,fs){const p=gl.createProgram();
 for(const[t,s]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const h=gl.createShader(t);gl.shaderSource(h,'#version 300 es\nprecision highp float;\n'+s);gl.compileShader(h);
  if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw gl.getShaderInfoLog(h);gl.attachShader(p,h)}
 gl.linkProgram(p);const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
 for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i).name;u[a]=gl.getUniformLocation(p,a)}return[p,u]}
const COMMON=`
uniform float uT,uSky;
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
vec3 sky(vec3 d){float y=abs(d.y);
 vec3 c=mix(vec3(1.,.48,.62),vec3(.6,.15,.72),smoothstep(0.,.28,y));
 c=mix(c,vec3(.1,.03,.3),smoothstep(.28,.85,y));
 return mix(c,mix(vec3(.13,.03,.27),vec3(.01,0.,.05),y),uSky);}`;
const FSV='void main(){gl_Position=vec4(vec2(gl_VertexID&1,gl_VertexID>>1)*4.-1.,0,1);}';
const [MP,MU]=prog(`
layout(location=0) in vec3 p;layout(location=1) in vec3 c;layout(location=2) in vec2 u;
uniform mat4 uVP,uM;uniform float uT,uW,uRf;
out vec3 wp,vc,op;out vec2 vu;
void main(){vec4 w=uM*vec4(p,1.);
 w.xyz+=uW*vec3(sin(w.y*.07+uT*.6+w.z*.02)*4.,sin(w.x*.05+w.z*.04+uT*.8)*2.,0.);
 if(uRf>0.)w.y=-w.y;
 wp=w.xyz;op=p;vc=c;vu=u;gl_Position=uVP*w;}`,COMMON+`
in vec3 wp,vc,op;in vec2 vu;
uniform vec3 uCam,uTint;uniform float uMat,uA,uEm,uRf,uDream,uFogD;uniform sampler2D uTex;
out vec4 o;
void main(){
 if(uRf>0.&&wp.y>.05)discard;
 vec3 n=normalize(cross(dFdx(wp),dFdy(wp))),vd=uCam-wp;float dist=length(vd);vd/=dist;
 if(dot(n,vd)<0.)n=-n;
 vec3 col=vc*uTint;float em=uEm,sh=0.;
 if(vu.x>=0.){col=texture(uTex,vu).rgb*uTint;em=1.;}else{if(vu.x<-1.5)em=1.;sh=vu.y;}
 if(uMat==1.){
  if(uSky>.5&&length(op.xz-vec2(0.,-100.))>390.)discard;
  vec2 g=floor(op.xz/4.);col=mix(vec3(1.,.6,.86),vec3(.93,.95,1.),mod(g.x+g.y,2.));
  vec2 gg=abs(fract(op.xz/8.)-.5);float ln=smoothstep(.45,.5,max(gg.x,gg.y));
  if(op.z>41.){col=mix(vec3(.06,0.,.14),vec3(1.,.2,.8),ln);em=ln;}
  col=mix(col,vec3(.3,.9,1.)*(.65+.35*sin(op.x*.3+uT*2.)*sin(op.z*.25-uT*1.5)),uDream*.7)*uTint;
 }
 if(uMat==3.){vec3 cc=floor(wp*1.5);float s=step(.97,h3(cc));col=vec3(.14,.02,.3)+s*vec3(1.,.8,1.)*(.6+.4*sin(uT*5.+h3(cc)*30.));em=1.;}
 if(uMat==4.){col+=step(.992,h3(floor(wp*2.)+floor(uT*4.)))*2.;}
 vec3 L1=normalize(vec3(-.4,.8,.45)),L2=normalize(vec3(.7,.25,-.6));
 vec3 lit=col*(vec3(.32,.22,.45)+max(dot(n,L1),0.)*vec3(1.,.78,.85)+max(dot(n,L2),0.)*vec3(.25,.85,1.)*.8);
 lit+=pow(max(dot(reflect(-L1,n),vd),0.),24.)*sh*vec3(1.,.9,1.)*1.6;
 lit=mix(lit,col,em);
 lit=mix(lit,sky(-vd),1.-exp(-dist*uFogD));
 if(uRf>0.)lit*=vec3(.75,.7,.92);
 o=vec4(lit,uA);}`);
const [KP,KU]=prog(FSV,COMMON+`
uniform vec3 uF,uR,uU;uniform vec2 uRes;uniform float uTn;out vec4 o;
void main(){vec2 q=gl_FragCoord.xy/uRes*2.-1.;
 vec3 d=normalize(uF+q.x*uTn*16./9.*uR+q.y*uTn*uU);float rf=1.;
 if(d.y<0.&&uSky<.5){d.y=-d.y;rf=.72;}
 vec3 c=sky(d),sd=normalize(vec3(0.,.42,-1.)),sr=normalize(cross(sd,vec3(0,1,0))),su=cross(sr,sd);
 vec2 s=vec2(dot(d,sr),dot(d,su))/.2;float r=length(s);
 if(dot(d,sd)>0.&&uSky<.5){
  float st=s.y<.25?step(fract(s.y*5.+uT*.2),.22+(.25-s.y)*.3):0.;
  vec3 sc=mix(vec3(1.,.15,.55),vec3(1.,.92,.35),clamp(s.y*.5+.5,0.,1.));
  c=mix(c,sc,smoothstep(1.,.97,r)*(1.-st));c+=vec3(1.,.3,.6)*exp(-r*1.3)*.35;}
 vec3 g=floor(d*180.);c+=step(mix(.997,.985,uSky),h3(g))*smoothstep(.15,.5,d.y+uSky)*(.5+.5*sin(uT*3.+h3(g)*20.));
 c+=uSky*vec3(.6,.1,.5)*pow(max(0.,sin(d.x*3.+d.y*2.)*sin(d.z*2.5-d.y)),3.)*.7;
 o=vec4(c*rf,1);}`);
const [PP,PU]=prog(FSV,`
uniform sampler2D uS,uX;uniform vec2 uR;uniform float uT,uG,uRw;uniform vec4 uFd;out vec4 o;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 q=gl_FragCoord.xy/uR,c=q-.5;float r2=dot(c,c);
 vec2 uv=.5+c*(.93+.14*r2);
 float ln=floor(q.y*240.),fr=floor(uT*30.);
 float sh=(h(vec2(ln,fr))-.5)*.0016+sin(q.y*40.+uT*2.)*.0006;
 sh+=exp(-pow((q.y-fract(uT*.07+.3))*60.,2.))*.012*(h(vec2(fr,ln))-.3);
 float gy=floor(q.y*18.);sh+=step(1.-uG*.6,h(vec2(gy,floor(uT*15.))))*(h(vec2(gy,fr))-.5)*.2*uG;
 sh+=uRw*(sin(q.y*8.+uT*40.)*.02+(q.y<.12?.05*h(vec2(ln,fr)):0.));
 uv.x+=sh;float ca=.0022+uG*.014+r2*.008;
 vec3 col=vec3(texture(uS,uv+vec2(ca,0)).r,texture(uS,uv).g,texture(uS,uv-vec2(ca,0)).b);
 vec3 bl=textureLod(uS,uv,2.5).rgb*.4+textureLod(uS,uv,4.).rgb*.4+textureLod(uS,uv,5.5).rgb*.3;
 col+=max(bl-.35,0.)*.9;
 vec2 tq=vec2(q.x+sh*.6,1.-q.y);float tc=.0025+uG*.008;
 vec4 tr=texture(uX,tq+vec2(tc,0)),tg=texture(uX,tq),tb=texture(uX,tq-vec2(tc,0));
 col=vec3(mix(col.r,tr.r,tr.a),mix(col.g,tg.g,tg.a),mix(col.b,tb.b,tb.a));
 col=mix(col,col*col*(3.-2.*col),.25)*vec3(1.04,.97,1.06);
 col*=.9+.1*sin(gl_FragCoord.y*2.1);
 vec3 m=vec3(.9);m[int(gl_FragCoord.x)%3]=1.12;col*=mix(vec3(1),m,.5);
 col+=(h(q*uR+fract(uT)*91.)-.5)*.07;
 col=mix(col,vec3(h(vec2(ln*.37,fr))),uRw*step(.9,h(vec2(floor(q.y*50.),floor(uT*25.))))*.6);
 col*=1.-r2*.85;
 o=vec4(mix(col,uFd.rgb,uFd.a),1);}`);
function mkTex(u,src,mip){const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+u);gl.bindTexture(gl.TEXTURE_2D,t);
 if(src)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,mip?gl.LINEAR_MIPMAP_LINEAR:gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 if(src&&mip)gl.generateMipmap(gl.TEXTURE_2D);return t}
mkTex(0,AT,1);
const X=D.createElement('canvas');X.width=1280;X.height=720;const x=X.getContext('2d');
const XT=mkTex(2,X,0);
let W,H,FB,FB2,RT,RBs=[];
function resize(){let w=innerWidth,h=innerHeight;if(w/h>16/9)w=h*16/9;else h=w*9/16;
 C.style.width=w+'px';C.style.height=h+'px';const dp=min(devicePixelRatio||1,2);C.width=w*dp|0;C.height=h*dp|0;
 W=min(C.width,1280);H=W*9/16|0;
 RBs.forEach(r=>gl.deleteRenderbuffer(r));if(FB){gl.deleteFramebuffer(FB);gl.deleteFramebuffer(FB2);gl.deleteTexture(RT)}
 FB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,FB);
 RBs=[[gl.RGBA8,gl.COLOR_ATTACHMENT0],[gl.DEPTH_COMPONENT24,gl.DEPTH_ATTACHMENT]].map(([f,a])=>{const r=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,r);
  gl.renderbufferStorageMultisample(gl.RENDERBUFFER,min(4,gl.getParameter(gl.MAX_SAMPLES)),f,W,H);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,a,gl.RENDERBUFFER,r);return r});
 RT=mkTex(1,0,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
 FB2=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,FB2);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,RT,0)}
addEventListener('resize',resize);resize();

// ---------- camera: an FPV drone through the mall ----------
const PA=[[0,30,230],[-10,18,170],[8,5,110],[0,6,60],[0,7,20],[-6,3,-15],[6,3,-45],[0,4.5,-78],[-9,7,-112],[-11,9,-130],[0,12,-142],
 [11,9,-131],[2,14,-118],[-10,15,-128],[-18,12.5,-160],[-18,13,-200],[-16,14,-228],[-5,7,-252],[6,3,-270],[0,8,-285],[0,9.5,-293]],
 PB=[[0,7,20],[10,14,-14],[18,12.5,-40],[18,12.5,-75],[17,13,-96],[4,20,-128],[-10,16,-160],[0,5,-195],[0,6,-230],[5,9,-250],[-5,12,-275],[0,15,-300]],
 PC=[[0,15,-300],[0,31,-330],[-30,50,-360],[-40,80,-395],[-14,104,-428],[20,100,-452],[38,85,-410],[14,82,-374],[4,79,-369],[10,64,-384],[8.8,60,-399],[8.8,56,-406],[8.8,52.6,-409]],
 PD=[[0,45,120],[15,25,85],[35,14,45],[38,10,0],[30,12,-45],[5,18,-75],[-30,20,-55],[-38,22,-5],[-32,26,40],[-10,34,80],[0,55,110]];
const HEAD=[0,80,-420],POCK=[8.8,52,-410];
// [bar0, bar1, path, s0, s1, look mode, ease]
const SEG=[[0,20,PA,0,20],[20,22,PA,20,4,0,1],[22,28,PB,0,8],[28,36,PB,8,11],[36,45.5,PC,0,12,1],[45.5,54,PD,0,10,2]];
function spl(P,s){s=cl(s,0,P.length-1.0001);const i=floor(s),f=s-i,p0=P[max(i-1,0)],p1=P[i],p2=P[i+1],p3=P[min(i+2,P.length-1)];
 return[0,1,2].map(k=>.5*(2*p1[k]+(-p0[k]+p2[k])*f+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*f*f+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*f*f*f))}
function camAt(t,dream){const b=t/BAR,g=SEG.find(g=>b<g[1])||SEG[5];
 let u=cl((b-g[0])/(g[1]-g[0]),0,1);if(g[6])u=ss(0,1,u);
 const P=g[2],s=mx(g[3],g[4],u),p=spl(P,s),f=nm(sb(spl(P,s+.04),spl(P,s-.04))),cv=sb(ad(spl(P,s+.35),spl(P,s-.35)),sc(p,2));
 let d=f,lk=0,w=0;
 if(g[5]==1){lk=l3(HEAD,POCK,ss(8.3,9.5,s));w=.7*ss(.3,2,s)*(1-.6*ss(9.5,11,s))+.25*(ss(6,7,s)-ss(8.3,9.3,s))}
 if(g[5]==2){lk=[0,2,-8];w=.85}
 if(lk)d=nm(ad(sc(f,1-w),sc(nm(sb(lk,p)),w)));
 const rt=nm(cr(d,[0,1,0])),u0=cr(rt,d);
 let roll=cl(dt(cv,rt)*.12,-.9,.9);
 if(P==PA)roll+=2*PI*ss(17.3,18.7,s);
 if(P==PB)roll-=2*PI*ss(4.2,5.4,s);
 roll+=sin(t*31)*.006+sin(t*17.3)*.005;
 const up=ad(sc(u0,cos(roll)),sc(rt,sin(roll)));
 return{p,d,up,r:nm(cr(d,up)),fov:1.25+.2*dream*(.5+.5*sin(t*.8))}}

// ---------- scene ----------
seed=11;
const TY=['can','card','cart','bag','tv','bust','sneaker','disk','orb','can','card','bag'];
const OBJ=[...Array(56)].map((_,i)=>({m:TY[i%12],p:[(rnd()-.5)*22,3+rnd()*17,36-rnd()*330],s:.8+rnd()*1.2,a:rnd()*6,b:rnd()*6,w:.3+rnd()*.7}));
const PK=[...Array(44)].map((_,i)=>({m:['coin','lint','receipt','gum','star','coin','bill','card'][i%8],r:30+rnd()*40,a:rnd()*6.3,y:-15+rnd()*50,w:(rnd()-.5)*.4,s:.8+rnd()*1.6,b:rnd()*6}));
let CAM,yawS=0;
function draw(n,m,o={}){const[f,c]=ME[n];gl.uniformMatrix4fv(MU.uM,false,m);gl.uniform3fv(MU.uTint,o.t||[1,1,1]);
 gl.uniform1f(MU.uMat,o.m||0);gl.uniform1f(MU.uEm,o.e||0);gl.uniform1f(MU.uA,o.a||1);gl.drawArrays(gl.TRIANGLES,f,c)}
// draws object n at p, shrinking politely when the drone passes through it
function obj(n,p,R,s,o){s*=ss(1.2,7,Math.hypot(...sb(p,CAM.p))/max(s,1));if(s>.01)draw(n,ch(Tm(...p),R,Sm(s)),o)}
const holo=t=>[.75+.25*sin(t*2),.75+.25*sin(t*2+2),.75+.25*sin(t*2+4)];
function chr(W,t,yaw,th){
 draw('body',W);
 const HM=ch(W,Tm(0,8.7,0),Ry(yaw),Rx(sin(t*PI*2*85/60)*.03+.08),Tm(0,1.25,0));
 draw('head',HM);draw('hair',HM,{m:4});draw('pin',W,{m:3});
 draw('flap',ch(W,Tm(1.1,6.3,1.9),Rx(th)));
 const L=(a,b,r)=>draw('limb',ch(W,sgm(a,b,r))),hd=[.55,6.3+1.15*cos(th),1.9+1.15*sin(th)+.22],el=[-1.6,5.8,2.05];
 L([-2.2,7.7,0],el,.55);L(el,hd,.48);draw('hand',ch(W,Tm(...hd),Sm(.42,.36,.42)));
 const wv=sin(t*4.5)*.55,e2=[3.3,9.2,.5],h2=ad(e2,[sin(wv)*1.5,cos(wv)*1.5,.2]);
 L([2.2,7.7,0],e2,.55);L(e2,h2,.48);draw('hand',ch(W,Tm(...h2),Sm(.42)));
 if(th>.15)for(let i=0;i<26;i++){const ph=(t*.35+i/26)%1,s=.14*(1-ph)*ss(.15,.5,th);
  draw('star',ch(W,Tm(.5+hs(i)*1.2,7.2+ph*4,1.1+hs(i+9)*.8+ph*1.6),Ry(t*3+i),Sm(s)))}}
function world(t,wt,E){
 if(E.pocket){
  const MW=ch(Sm(.1),Tm(0,0,100));
  draw('mall',MW);draw('floor',MW,{m:1,t:[.5,.42,.62]});chr(ch(MW,Tm(0,0,-420),Sm(8)),wt,0,1.1);
  for(const o of PK){const a=o.a+wt*o.w;obj(o.m,[cos(a)*o.r,o.y+sin(wt*.5+o.b)*2,sin(a)*o.r],ch(Ry(wt*.4+o.b),Rx(wt*.3+o.a)),o.s,{t:o.m=='card'?holo(wt+o.a):0})}
  return}
 draw('mall',I());draw('mtn',I(),{e:.25});
 for(let i=0;i<7;i++){const a=i/6*2*PI+wt*.2,c=i==6,h=c?7+E.beat*2:4+2*sin(wt*3+i)+E.beat*1.5;
  draw('jet',ch(Tm(c?0:cos(a)*5,c?7.8:1,-130+(c?0:sin(a)*5)),Sm(c?1.4:1,h,c?1.4:1)))}
 const dr=E.dream,dt0=max(t-79,0);
 for(const o of OBJ){let p=[o.p[0],o.p[1]+sin(wt*o.w+o.a)*.8,o.p[2]];
  if(dr>0){const an=dt0*.12*o.w*dr,x=p[0],y=p[1]-12;p=[x*cos(an)-y*sin(an),12+x*sin(an)+y*cos(an),p[2]]}
  obj(o.m,p,ch(Ry(wt*o.w+o.b),Rx(sin(wt*.5*o.w+o.a)*.6)),o.s*(1+dr*.9),{t:o.m=='card'?holo(wt+o.a):0})}
 if(dr>.01){
  for(let i=0;i<6;i++){const ph=(wt*.28+i*.17)%1;obj('dolphin',[(i-2.5)*6,-1+13*sin(ph*PI),-238-i*9-(ph-.5)*30],ch(Ry(PI),Rx(-cos(ph*PI)*.9)),1.6*dr)}
  for(let i=0;i<40;i++){const z=CAM.p[2]-8-hs(i+9)*45;obj('bill',[(hs(i)-.5)*26,22-(wt*2.2+hs(i+5)*22)%22,z],ch(Ry(wt*(1+hs(i))+i),Rx(sin(wt*3+i)*.8),Rz(sin(wt*2.3+i)*.6)),dr)}}
 for(let i=0;i<4;i++){const a=wt*.3+i*PI/2;obj(['can','card','bag','tv'][i],[cos(a)*36,84+sin(wt+i)*6,-420+sin(a)*36],ch(Ry(wt*.7+i),Rx(.4*sin(wt+i))),2.6,{t:i==1?holo(wt):0})}
 const dx=14*ss(96.5,100.5,t);for(const s of[-1,1])draw('door',Tm(s*(7+dx),0,-302));
 if(t<96)return;
 for(const s of[-1,1])draw('bust',ch(Tm(s*34,0,-346),Ry(-s*.6),Sm(5)));
 const lc=[CAM.p[0]/8,0,(CAM.p[2]+420)/8];yawS+=(cl(atan2(lc[0],max(lc[2],.5)),-.6,.6)-yawS)*.05;
 chr(ch(Tm(0,0,-420),Sm(8),Rz(sin(wt*.6)*.012)),wt,yawS,E.th)}

// ---------- captions (system fonts, drawn into a texture each frame) ----------
const F=(s,f)=>`${s}px ${f}`;
function T(s,X0,Y0,f,c,g,al='center'){x.font=f;x.textAlign=al;const a=x.globalAlpha;x.globalAlpha=a*.6;x.fillStyle='#1a0030';x.fillText(s,X0+3,Y0+3);x.globalAlpha=a;x.fillStyle=c;x.shadowColor=g||c;x.shadowBlur=g?22:0;x.fillText(s,X0,Y0);x.shadowBlur=0}
function V(s,X0,Y0,sz,f,c){[...s].forEach((k,i)=>T(k,X0,Y0+i*sz*1.1,F(sz,f),c,c))}
function chrome(s,X0,Y0,sz,f){x.font=F('bold '+sz,f);x.textAlign='center';const g=x.createLinearGradient(0,Y0-sz*.8,0,Y0+sz*.15);
 [[0,'#3ff'],[.45,'#fff'],[.5,'#f0f'],[.53,'#205'],[.78,'#f6c'],[1,'#fff']].forEach(a=>g.addColorStop(...a));
 x.fillStyle=g;x.shadowColor='#f0c';x.shadowBlur=30;x.fillText(s,X0,Y0);x.shadowBlur=0;x.lineWidth=2;x.strokeStyle='#fff';x.strokeText(s,X0,Y0)}
const B0=BAR,CAP=[
 [1.2,10.8,()=>{chrome('ＶＡＰＯＲ　ＭＡＬＬ',640,330,92,JG);T('夢のショッピングモール',640,412,F(46,JM),'#ffd6f5','#ff3cac');
  T('～ a sixty-four kilobyte daydream ～',640,468,F('italic 26',DID),'#bff')}],
 [13,19.5,()=>{T('ようこそ',100,560,F(100,JM),'#ffb8ec','#ff2fb0','left');T('welcome to the plaza',110,622,F(44,SCR),'#aff','#0cf','left')}],
 [23,31,()=>{V('ショッピングは永遠に',1170,120,46,JM,'#fff');T('shopping is forever',1120,650,F(40,SCR),'#ffb8ec','#f3a','right')}],
 [35,42.5,()=>{x.globalAlpha*=.6;T('消費',70,470,F(250,JM),'#ff4fd0','#f0f','left');x.globalAlpha/=.6;T('ＣＯＮＳＵＭＥ',90,560,F('bold 34',JG),'#fff','#0ff','left')}],
 [45,53,()=>{T('シティポップの午後',640,600,F('bold 54',JG),'#fffbb0','#f80');T('city pop afternoon',640,648,F('italic 28',DID),'#fff')}],
 [20*B0,22*B0,(l)=>{if(l*4%1<.6){T('◀◀',640,330,F(140,VCR),'#fff','#0ff');T('巻き戻し　ＲＥＷＩＮＤ',640,420,F(40,JM),'#fff','#f0f')}}],
 [22*B0+.2,22*B0+3.4,()=>{T('もう一度',640,390,F(70,JM),'#fff','#0ff')}],
 [67,75,()=>{T('デジャヴ',110,540,F(90,JM),'#bff','#0cf','left');T('déjà vu',150,610,F(60,SCR),'#ffb8ec','#f3a','left')}],
 [80,100,(l)=>{x.globalAlpha*=.22+.08*sin(l*8);T('夢',640,520,F(420,JM),'#fff','#f0f');x.globalAlpha=1}],
 [83,90,()=>{T('ｎｏｔｈｉｎｇ　ｉｓ　ｒｅａｌ',640,650,F('bold 44',JG),'#fff','#0ff')}],
 [91,99.5,()=>{V('目を閉じて',110,170,60,JM,'#ffd6f5');T('close your eyes',190,650,F(44,SCR),'#aff','#0cf','left')}],
 [103.5,110.5,()=>{chrome('ポケットさん',640,600,84,JM);T('ｍｒ．ｐｏｃｋｅｔ　—　he has been waiting for you',640,654,F('italic 24',DID),'#fff')}],
 [115.5,121.5,()=>{V('彼は微笑む',1170,140,62,JM,'#fff');T('he smiles',1120,650,F(46,SCR),'#ffb8ec','#f3a','right')}],
 [122,127,()=>{T('ポケットを開けて',640,620,F('bold 56',JG),'#bff','#0ff');T('step inside',640,664,F('italic 28',DID),'#fff')}],
 [130.5,137.5,()=>{T('ポケットの中の宇宙',640,340,F(66,JM),'#fff','#c6f');T('a universe inside a pocket',640,392,F('italic 30',DID),'#ffd6f5')}],
 [138.5,145.5,()=>{T('ｃｏｄｅ　・　ｍｕｓｉｃ　・　ｄｒｅａｍｓ',640,300,F(30,JG),'#bff','#0cf');T('Claude',640,390,F(80,SCR),'#fff','#f0f');T('２０２６　・　６４ｋ',640,450,F(26,JG),'#ffd6f5')}],
 [146.5,1e9,(l)=>{chrome('ＥＮＤ',640,340,110,JG);T('おやすみなさい',640,420,F(48,JM),'#ffd6f5','#ff3cac');T('good night, shopper',640,470,F('italic 26',DID),'#bff');
  if(l>9)T('click to replay ・ もう一度',640,640,F(22,VCR),'#fff')}]];
function captions(t){x.clearRect(0,0,1280,720);
 for(const[a,b,f]of CAP)if(t>a&&t<b){const l=t-a,al=ss(0,.6,l)*(1-ss(b-a-.6,b-a,l));x.globalAlpha=al*(l<.35&&hs(floor(t*30))<.4?.3:1);f(l);x.globalAlpha=1}
 // VHS camcorder OSD
 if(t<151){const rw=t>20*BAR&&t<22*BAR;x.font=F('bold 28',VCR);x.textAlign='left';x.fillStyle='#000a';
  const s1=rw?'REW ◀◀':'PLAY ▶',tc=floor(t/60)+':'+String(floor(t%60)).padStart(2,'0')+':'+String(floor(t*30%30)).padStart(2,'0');
  for(const[o,c]of[[3,'#2008'],[0,'#fff']]){x.fillStyle=c;x.fillText(s1,48+o,64+o);x.fillText('SP '+tc,48+o,680+o);x.textAlign='right';
   x.fillText('NOV.19 1995',1232+o,64+o);x.fillText('AM 3:33',1232+o,680+o);x.textAlign='left'}}
 gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,XT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,X)}

// ---------- frame ----------
const KEYS=[4,12,20,22,28,34.15,36,45.5].map(b=>b*BAR);
function frame(t){
 const R1=20*BAR,R2=22*BAR,wt=t<R1?t:t<R2?R1-3*(t-R1):t-8*BAR;
 const E={dream:ss(78,82,t)*(1-ss(99,103,t)),pocket:t>=45.5*BAR,beat:pow(1-(t/(BAR/4))%1,4),th:1.1*ss(111,121,t)};
 const c=CAM=camAt(t,E.dream),VP=mul(persp(c.fov,16/9,.15,2500),look(c.p,ad(c.p,c.d),c.up));
 gl.bindFramebuffer(gl.FRAMEBUFFER,FB);gl.viewport(0,0,W,H);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
 const sk=E.pocket?1:0;
 gl.useProgram(KP);gl.uniform3fv(KU.uF,c.d);gl.uniform3fv(KU.uR,c.r);gl.uniform3fv(KU.uU,c.up);gl.uniform2f(KU.uRes,W,H);
 gl.uniform1f(KU.uTn,Math.tan(c.fov/2));gl.uniform1f(KU.uT,t);gl.uniform1f(KU.uSky,sk);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.clear(gl.DEPTH_BUFFER_BIT);
 gl.useProgram(MP);gl.uniformMatrix4fv(MU.uVP,false,VP);gl.uniform3fv(MU.uCam,c.p);gl.uniform1f(MU.uT,t);gl.uniform1f(MU.uSky,sk);
 gl.uniform1f(MU.uW,E.pocket?0:E.dream*.6);gl.uniform1f(MU.uDream,E.dream);gl.uniform1i(MU.uTex,0);
 gl.uniform1f(MU.uFogD,E.pocket?.004:mx(.0045,.0026,ss(99,104,t)));
 if(!E.pocket){gl.uniform1f(MU.uRf,1);world(t,wt,E);gl.uniform1f(MU.uRf,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);draw('floor',I(),{m:1,a:.66-.24*E.dream});gl.disable(gl.BLEND)}
 else gl.uniform1f(MU.uRf,0);
 world(t,wt,E);
 gl.bindFramebuffer(gl.READ_FRAMEBUFFER,FB);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,FB2);gl.blitFramebuffer(0,0,W,H,0,0,W,H,gl.COLOR_BUFFER_BIT,gl.NEAREST);
 gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,C.width,C.height);gl.disable(gl.DEPTH_TEST);
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,RT);gl.generateMipmap(gl.TEXTURE_2D);
 captions(t);
 let g=.04;for(const k of KEYS)g+=Math.exp(-(((t-k)*3)**2))*.9;const rw=t>20*BAR&&t<22*BAR;if(rw)g+=.5;g+=E.dream*.15;
 const fd=t<1.5?[0,0,0,1-ss(0,1.5,t)]:t<131?[.15,0,.3,ss(126.8,128.4,t)*(1-ss(128.6,130.5,t))]:[0,0,0,ss(151,155,t)];
 gl.useProgram(PP);gl.uniform1i(PU.uS,1);gl.uniform1i(PU.uX,2);gl.uniform2f(PU.uR,C.width,C.height);gl.uniform1f(PU.uT,t);
 gl.uniform1f(PU.uG,min(g,1));gl.uniform1f(PU.uRw,rw?1:0);gl.uniform4fv(PU.uFd,fd);gl.drawArrays(gl.TRIANGLES,0,3)}

// ---------- boot / sync ----------
let actx=null,buf=null,src=null,st=0,run=0;
const now=()=>actx?actx.currentTime-st:performance.now()/1000-st;
function play(){if(actx){if(src)src.stop();src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);
  actx.resume();src.start(0,T0);st=actx.currentTime-T0}else st=performance.now()/1000-T0;
 S.style.display='none';if(!run){run=1;requestAnimationFrame(loop)}}
function loop(){const t=now();frame(t);if(t>156&&S.style.display=='none'){S.innerHTML='<u>もう一度？ ・ click to replay</u>';S.style.display='flex';S.onclick=()=>{S.onclick=null;play()}}requestAnimationFrame(loop)}
async function start(){S.onclick=null;
 if(!MUTE){actx=new AudioContext();S.innerHTML='<i>精算中・・・</i><u>pre-rendering the dream</u>';
  await new Promise(r=>setTimeout(r,60));buf=await SONG.render(p=>S.lastChild.textContent='pre-rendering the dream '+'▮'.repeat(p*20)+'▯'.repeat(20-p*20|0))}
 play()}
if(MUTE)start();else S.onclick=start;
})();
